import ts from 'typescript';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { extractPublicComponentContracts } from '../tests/helpers/component-contracts.mjs';
// 使用已解压的官方 npm 包进行只读对照，不安装 Vuetify 或修改项目依赖。
const root = path.resolve(process.argv[2] ?? 'artifacts/upstream-table-audit/package/lib');
const output = process.argv[3] ?? 'artifacts/table-api-audit.json';
if (JSON.parse(readFileSync(path.join(root, '..', 'package.json'), 'utf8')).version !== '4.2.4') throw new Error('This audit is pinned to the official vuetify@4.2.4 package.');
const cache = new Map();
function moduleFile(filename) {
    if (!cache.has(filename)) cache.set(filename, ts.createSourceFile(filename, readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
    return cache.get(filename);
}
function resolve(filename, name, seen = new Set()) {
    const id = filename + '#' + name;
    if (seen.has(id)) return {};
    seen.add(id);
    const sf = moduleFile(filename);
    for (const statement of sf.statements) {
        if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) if (declaration.name.getText(sf) === name) return evaluate(declaration.initializer, filename, seen);
        if (ts.isImportDeclaration(statement) && statement.importClause?.namedBindings && ts.isNamedImports(statement.importClause.namedBindings)) {
            const imported = statement.importClause.namedBindings.elements.find(element => element.name.text === name);
            if (imported) return resolve(path.resolve(path.dirname(filename), statement.moduleSpecifier.text), imported.propertyName?.text ?? imported.name.text, seen);
        }
        if (ts.isExportDeclaration(statement) && statement.moduleSpecifier) {
            const target = path.resolve(path.dirname(filename), statement.moduleSpecifier.text);
            if (!existsSync(target)) continue;
            if (!statement.exportClause) { const result = resolve(target, name, new Set(seen)); if (Object.keys(result).length) return result; }
            else if (ts.isNamedExports(statement.exportClause)) {
                const exported = statement.exportClause.elements.find(element => element.name.text === name);
                if (exported) return resolve(target, exported.propertyName?.text ?? exported.name.text, seen);
            }
        }
    }
    return {};
}
function evaluate(node, filename, seen) {
    if (!node) return {};
    if (ts.isIdentifier(node)) return resolve(filename, node.text, seen);
    if (ts.isObjectLiteralExpression(node)) {
        let result = {};
        for (const member of node.properties) {
            if (ts.isSpreadAssignment(member)) result = { ...result, ...evaluate(member.expression, filename, new Set(seen)) };
            else if (member.name) result[member.name.getText(moduleFile(filename)).replace(/^['"]|['"]$/g, '')] = member.initializer?.getText(moduleFile(filename)) ?? '';
        }
        return result;
    }
    if (ts.isCallExpression(node)) {
        const name = node.expression.getText(moduleFile(filename));
        if (name === 'propsFactory') return evaluate(node.arguments[0], filename, seen);
        if (name === 'pick' || name === 'omit') {
            const result = evaluate(node.arguments[0], filename, seen);
            const keys = new Set(node.arguments[1]?.elements?.map(element => element.text) ?? []);
            return Object.fromEntries(Object.entries(result).filter(([key]) => name === 'pick' ? keys.has(key) : !keys.has(key)));
        }
        return resolve(filename, name, seen);
    }
    return {};
}
const upstream = [
    ['UTable', 'components/VTable/VTable.js', 'makeVTableProps'],
    ['UDataTable', 'components/VDataTable/VDataTable.js', 'makeVDataTableProps'],
    ['UDataTableServer', 'components/VDataTable/VDataTableServer.js', 'makeVDataTableServerProps'],
    ['UDataTableVirtual', 'components/VDataTable/VDataTableVirtual.js', 'makeVDataTableVirtualProps']
];

function typeSlots(filename, name, seen = new Set()) {
    const id = filename + '#' + name;
    if (seen.has(id)) return [];
    seen.add(id);
    const sf = moduleFile(filename);
    function read(node) {
        if (!node) return [];
        if (ts.isIntersectionTypeNode(node)) return node.types.flatMap(read);
        if (ts.isTypeLiteralNode(node)) return node.members.flatMap(member => {
            if (member.name) return [member.name.getText(sf).replace(/^['"]|['"]$/g, '')];
            const index = member.parameters?.[0]?.type;
            return index && ts.isTemplateLiteralTypeNode(index) ? [index.head.text + '*'] : [];
        });
        if (ts.isTypeReferenceNode(node)) return typeSlots(filename, node.typeName.getText(sf), new Set(seen));
        return [];
    }
    for (const statement of sf.statements) {
        if (ts.isTypeAliasDeclaration(statement) && statement.name.text === name) return read(statement.type);
        if (ts.isImportDeclaration(statement) && statement.importClause?.namedBindings && ts.isNamedImports(statement.importClause.namedBindings)) {
            const imported = statement.importClause.namedBindings.elements.find(element => element.name.text === name);
            const target = path.resolve(path.dirname(filename), statement.moduleSpecifier.text.replace(/\.js$/, '.d.ts'));
            if (imported && existsSync(target)) return typeSlots(target, imported.propertyName?.text ?? name, seen);
        }
    }
    return [];
}
function emittedEvents(filename) {
    const sf = moduleFile(filename);
    let names = [];
    function visit(node) {
        if (ts.isPropertyAssignment(node) && node.name.getText(sf) === 'emits' && ts.isObjectLiteralExpression(node.initializer)) names = node.initializer.properties.map(member => member.name.getText(sf).replace(/^['"]|['"]$/g, ''));
        ts.forEachChild(node, visit);
    }
    visit(sf);
    return names;
}
const contracts = extractPublicComponentContracts(process.cwd());
const report = { upstreamVersion: '4.2.4', checkedAt: '2026-10-08', source: 'https://registry.npmjs.org/vuetify/4.2.4', tables: upstream.map(([name, filename, factory]) => {
    const official = Object.keys(resolve(path.join(root, filename), factory)).sort();
    const local = contracts.find(contract => contract.name === name);
    const implemented = new Set([...local.props, ...local.models].map(prop => prop.name));
    const slots = local.slots.map(slot => slot.pattern ?? slot.name);
    const events = local.emits.map(event => event.name);
    const upstreamSlots = name === 'UTable' ? ['top', 'wrapper', 'default', 'bottom'] : [...new Set(typeSlots(path.join(root, filename.replace(/\.js$/, '.d.ts')), name === 'UDataTableVirtual' ? 'VDataTableVirtualSlots' : 'VDataTableSlots'))];
    // 行和分组事件由上游 Rows 从 attrs 转发，不在主组件 emits 对象中声明。
    const upstreamEvents = [...emittedEvents(path.join(root, filename)), ...(name === 'UTable' ? [] : ['click:row', 'dblclick:row', 'contextmenu:row', 'click:groupHeader', 'dblclick:groupHeader', 'contextmenu:groupHeader'])];
    const covered = slot => slots.includes(slot) || slots.some(pattern => pattern.endsWith('*') && slot.startsWith(pattern.slice(0, -1)));
    return { name, upstreamProps: official, localProps: [...implemented].sort(), missing: official.filter(key => !implemented.has(key) && key !== 'class' && key !== 'style'), inheritedAttributes: official.filter(key => key === 'class' || key === 'style'), extraProps: [...implemented].filter(key => !official.includes(key)).sort(), upstreamSlots, missingSlots: upstreamSlots.filter(slot => !covered(slot)), upstreamEvents, missingEvents: upstreamEvents.filter(event => !events.includes(event)), events, slots };
}) };
writeFileSync(output, JSON.stringify(report, null, 4) + '\n');
console.log(JSON.stringify(report.tables.map(({ name, upstreamProps, missing, missingSlots, missingEvents }) => ({ name, upstreamProps: upstreamProps.length, missing, missingSlots, missingEvents })), null, 4));
if (report.tables.some(table => table.missing.length || table.missingSlots.length || table.missingEvents.length)) process.exitCode = 1;

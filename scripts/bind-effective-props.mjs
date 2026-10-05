import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { parse, compileScript } from '@vue/compiler-sfc';
import { extractComponentContract } from '../tests/helpers/component-contracts.mjs';
const root = path.resolve('.');
for (const name of readdirSync('src/ui')) {
    if (!name.endsWith('.vue')) continue;
    const filename = path.join('src/ui', name);
    let source = readFileSync(filename, 'utf8');
    if (!source.includes('const props = useDefaults(')) continue;
    const { descriptor } = parse(source, { filename });
    if (!descriptor.template) continue;
    const bindings = compileScript(descriptor, { id: name, fs: { fileExists: existsSync, readFile: file => readFileSync(file, 'utf8') } }).bindings;
    const contract = extractComponentContract(root, name.replace('.vue', ''), filename);
    const keys = new Set(contract.props.map(prop => prop.name).filter(key => !bindings[key] || bindings[key] === 'props'));
    let template = descriptor.template.content;
    template = template.replace(/((?:[:@]|v-)[\w:.[\]-]*=")([^"]*)(")/g, (_, start, expression, end) => start + expression.replace(/^(.*?)\s+(in|of)\s+([\s\S]*)$/, (_, local, operator, list) => local + ' ' + operator + ' ' + rewrite(list, keys)) .replace(expression.includes(' in ') || expression.includes(' of ') ? /$^/ : /^[\s\S]*$/, value => rewrite(value, keys)) + end);
    template = template.replace(/\{\{([\s\S]*?)\}\}/g, (_, expression) => '{{' + rewrite(expression, keys) + '}}');
    if (template !== descriptor.template.content) { source = source.slice(0, descriptor.template.loc.start.offset) + template + source.slice(descriptor.template.loc.end.offset); writeFileSync(filename, source); }
}
function rewrite(expression, keys) {
    const prefix = 'const __value = (';
    const file = ts.createSourceFile('expression.ts', prefix + expression + ');', ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const local = new Set();
    const collect = node => { if (ts.isParameter(node) && ts.isIdentifier(node.name)) local.add(node.name.text); ts.forEachChild(node, collect); };
    collect(file);
    const edits = [];
    const visit = node => {
        if (ts.isIdentifier(node) && keys.has(node.text) && !local.has(node.text)) {
            const parent = node.parent;
            const isKey = (ts.isPropertyAccessExpression(parent) && parent.name === node) || (ts.isPropertyAssignment(parent) && parent.name === node) || ts.isTypeReferenceNode(parent);
            if (!isKey) { const start = node.getStart(file) - prefix.length; const end = node.end - prefix.length; if (start >= 0 && end <= expression.length) edits.push({ start, end, text: ts.isShorthandPropertyAssignment(parent) ? node.text + ': props.' + node.text : 'props.' + node.text }); }
        }
        ts.forEachChild(node, visit);
    };
    visit(file);
    for (const edit of edits.reverse()) expression = expression.slice(0, edit.start) + edit.text + expression.slice(edit.end);
    return expression;
}

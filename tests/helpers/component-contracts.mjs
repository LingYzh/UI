import ts from 'typescript';
import { parse as parseSfc } from '@vue/compiler-sfc';
import { parse as parseTemplate } from '@vue/compiler-dom';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Generated contracts must not depend on the checkout's Windows or Unix line endings.
const read = (filename) => readFileSync(filename, 'utf8').replace(/\r\n?/g, '\n');
const relative = (root, filename) => path.relative(root, filename).replaceAll('\\', '/');

function createTypeResolver(root) {
    const cache = new Map();
    const sourceFile = (filename) => {
        const absolute = path.resolve(filename);
        if (!cache.has(absolute)) cache.set(absolute, ts.createSourceFile(absolute, read(absolute), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
        return cache.get(absolute);
    };
    const resolveModule = (from, specifier) => {
        const base = path.resolve(path.dirname(from), specifier);
        for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}.d.ts`, path.join(base, 'index.ts')]) {
            if (existsSync(candidate)) return candidate;
        }
        return undefined;
    };
    const findImportedType = (sf, name) => {
        for (const statement of sf.statements) {
            if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
            const bindings = statement.importClause?.namedBindings;
            if (!bindings || !ts.isNamedImports(bindings)) continue;
            for (const entry of bindings.elements) {
                if ((entry.propertyName?.text || entry.name.text) === name) {
                    const filename = resolveModule(sf.fileName, statement.moduleSpecifier.text);
                    if (filename) return { sf: sourceFile(filename), name: entry.name.text };
                }
            }
        }
        return undefined;
    };
    const findDeclaration = (sf, name) => {
        const direct = sf.statements.find((statement) =>
            (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) && statement.name.text === name);
        if (direct) return { sf, declaration: direct };
        const imported = findImportedType(sf, name);
        if (!imported) return undefined;
        const declaration = imported.sf.statements.find((statement) =>
            (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) && statement.name.text === imported.name);
        return declaration ? { sf: imported.sf, declaration } : undefined;
    };
    const documentation = (node) => {
        const comments = node.jsDoc || [];
        return comments.map((doc) => typeof doc.comment === 'string' ? doc.comment : ts.displayPartsToString(doc.comment || []))
            .map((value) => value.trim()).filter(Boolean).join(' ');
    };
    const literalKeys = (node) => {
        if (!node) return [];
        if (ts.isUnionTypeNode(node)) return node.types.flatMap(literalKeys);
        if (ts.isLiteralTypeNode(node) && (ts.isStringLiteral(node.literal) || ts.isNumericLiteral(node.literal))) return [node.literal.text];
        return [];
    };
    function typeMembers(typeNode, sf, origins = []) {
        if (!typeNode) return [];
        if (ts.isParenthesizedTypeNode(typeNode)) return typeMembers(typeNode.type, sf, origins);
        if (ts.isIntersectionTypeNode(typeNode)) return typeNode.types.flatMap((part) => typeMembers(part, sf, origins));
        if (ts.isTypeLiteralNode(typeNode)) return typeNode.members.filter(ts.isPropertySignature).map((member) => ({
            name: member.name.getText(sf).replace(/^['"]|['"]$/g, ''),
            type: member.type?.getText(sf) || 'unknown',
            required: !member.questionToken,
            documentation: documentation(member),
            origin: relative(root, sf.fileName),
            declaration: member.getText(sf),
            originStack: origins,
        }));
        if (!ts.isTypeReferenceNode(typeNode)) return [];
        const name = typeNode.typeName.getText(sf);
        if (origins.includes(`${relative(root, sf.fileName)}#${name}`)) return [];
        if (['Pick', 'Omit', 'Partial', 'Required', 'Readonly'].includes(name)) {
            const members = typeMembers(typeNode.typeArguments?.[0], sf, origins);
            if (name === 'Readonly') return members;
            if (name === 'Partial' || name === 'Required') return members.map((member) => ({ ...member, required: name === 'Required' }));
            const keys = new Set(literalKeys(typeNode.typeArguments?.[1]));
            return members.filter((member) => name === 'Pick' ? keys.has(member.name) : !keys.has(member.name));
        }
        const found = findDeclaration(sf, name);
        if (!found) return [];
        const nextOrigins = [...origins, `${relative(root, found.sf.fileName)}#${name}`];
        if (ts.isTypeAliasDeclaration(found.declaration)) return typeMembers(found.declaration.type, found.sf, nextOrigins);
        const inherited = found.declaration.heritageClauses?.flatMap((clause) => clause.types.flatMap((base) => typeMembers(base, found.sf, nextOrigins))) || [];
        const own = found.declaration.members.filter(member => ts.isPropertySignature(member) || ts.isIndexSignatureDeclaration(member) && ts.isTemplateLiteralTypeNode(member.parameters[0]?.type)).map((member) => ({
            name: ts.isIndexSignatureDeclaration(member) ? member.parameters[0].type.getText(found.sf).replace(/^`|`$/g, '').replace(/\$\{[^}]+\}/g, '*') : member.name.getText(found.sf).replace(/^['"]|['"]$/g, ''),
            type: member.type?.getText(found.sf) || 'unknown',
            required: !member.questionToken,
            documentation: documentation(member),
            origin: relative(root, found.sf.fileName),
            declaration: member.getText(found.sf),
            originStack: nextOrigins,
        }));
        return [...inherited, ...own];
    }
    return { sourceFile, typeMembers };
}

function expressionName(node, sf) {
    if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
    return node.getText(sf);
}

function callExpressions(sf, name) {
    const result = [];
    const visit = (node) => {
        if (ts.isCallExpression(node) && node.expression.getText(sf).split('.').at(-1) === name) result.push(node);
        ts.forEachChild(node, visit);
    };
    visit(sf);
    return result;
}

function objectEntries(node, sf) {
    if (!node || !ts.isObjectLiteralExpression(node)) return [];
    return node.properties.filter((property) => ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)).map((property) => ({
        name: expressionName(property.name, sf),
        value: ts.isPropertyAssignment(property) ? property.initializer : property.name,
        source: property.getText(sf),
    }));
}

function defaultValue(prop, node, sf) {
    if (node) {
        const source = node.getText(sf);
        if (source === 'undefined') return { kind: 'explicit-undefined', source };
        const factory = ts.isArrowFunction(node) || ts.isFunctionExpression(node);
        return { kind: factory ? 'factory' : 'explicit', source };
    }
    if (prop.required) return { kind: 'required' };
    const unionParts = prop.type.split('|').map((part) => part.trim().replace(/^\(|\)$/g, ''));
    if (!prop.model && unionParts.some((part) => part === 'boolean' || part === 'Boolean')) return { kind: 'vue-boolean-false' };
    return { kind: 'undefined' };
}

function runtimeProps(node, sf, root) {
    if (!node || !ts.isObjectLiteralExpression(node)) return [];
    return node.properties.filter((property) => ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)).map((property) => {
        const name = expressionName(property.name, sf);
        if (ts.isShorthandPropertyAssignment(property)) return {
            name, type: name === 'Boolean' ? 'boolean' : 'unknown', required: false, origin: relative(root, sf.fileName), declaration: property.getText(sf),
            default: { kind: name === 'Boolean' ? 'vue-boolean-false' : 'undefined' },
        };
        const value = property.initializer;
        if (ts.isObjectLiteralExpression(value)) {
            const fields = new Map(objectEntries(value, sf).map((entry) => [entry.name, entry.value]));
            const descriptor = { name, type: fields.get('type')?.getText(sf) || 'unknown', required: fields.get('required')?.getText(sf) === 'true', origin: relative(root, sf.fileName), declaration: property.getText(sf) };
            return { ...descriptor, default: defaultValue(descriptor, fields.get('default'), sf) };
        }
        const type = value.getText(sf);
        const typeName = type === 'Boolean' ? 'boolean' : type === 'String' ? 'string' : type === 'Number' ? 'number' : type;
        const descriptor = { name, type: typeName, required: false, origin: relative(root, sf.fileName), declaration: property.getText(sf) };
        return { ...descriptor, default: defaultValue(descriptor, undefined, sf) };
    });
}

function propsFor(root, scriptFile, sf, formContextAware) {
    const call = callExpressions(sf, 'defineProps')[0];
    if (!call) return [];
    let defaults = new Map();
    const wrapper = ts.isCallExpression(call.parent) && call.parent.expression.getText(sf).split('.').at(-1) === 'withDefaults' ? call.parent : undefined;
    if (wrapper?.arguments[1]) defaults = new Map(objectEntries(wrapper.arguments[1], sf).map((entry) => [entry.name, entry.value]));
    let declarations;
    if (call.typeArguments?.length) declarations = createTypeResolver(root).typeMembers(call.typeArguments[0], sf);
    else return runtimeProps(call.arguments[0], sf, root);
    const groups = new Map();
    for (const declaration of declarations) {
        if (!groups.has(declaration.name)) groups.set(declaration.name, []);
        groups.get(declaration.name).push(declaration);
    }
    return [...groups.entries()].map(([name, entries]) => {
        const last = entries.at(-1);
        const apiProp = {
            name, type: last.type, required: last.required,
            default: defaultValue(last, defaults.get(name), sf),
            documentation: last.documentation || '',
            origin: last.origin,
            declaredFrom: entries.map((entry) => ({ origin: entry.origin, declaration: entry.declaration, originStack: entry.originStack })),
        };
        if (entries.length > 1) apiProp.duplicateDeclarations = entries.length;
        if (formContextAware) {
            const contextFallbacks = { dense: 'false', ghost: 'false', rounded: 'true', labelPosition: 'top', labelWidth: '180px', validateOn: 'input' };
            const effective = contextFallbacks[name];
            const unresolved = apiProp.default.kind === 'undefined' || apiProp.default.kind === 'explicit-undefined';
            const defersBoolean = ['dense', 'ghost', 'rounded'].includes(name) && apiProp.default.kind === 'explicit-undefined';
            if (effective !== undefined && unresolved && (!['dense', 'ghost', 'rounded'].includes(name) || defersBoolean)) {
                apiProp.inheritance = { from: 'UiForm', explicitValue: apiProp.default.kind === 'explicit-undefined' ? 'undefined' : undefined, standaloneFallback: effective };
            }
        }
        if (formContextAware && name === 'maxErrors' && apiProp.default.kind === 'undefined') apiProp.effectiveFallback = '1';
        if (formContextAware && name === 'rules' && apiProp.default.kind === 'undefined') apiProp.effectiveFallback = '[]';
        if (name === 'counter' && apiProp.default.kind === 'undefined') apiProp.effectiveFallback = 'false (counter hidden)';
        return apiProp;
    });
}

function payloadFromTuple(node, sf) {
    if (!node) return [];
    if (!ts.isTupleTypeNode(node)) return [{ name: 'payload', type: node.getText(sf), optional: false, rest: false }];
    return node.elements.map((element, index) => {
        const named = ts.isNamedTupleMember(element);
        const optional = ts.isOptionalTypeNode(element) || (named && !!element.questionToken);
        const rest = ts.isRestTypeNode(element) || (named && !!element.dotDotDotToken);
        const type = named ? element.type : ts.isRestTypeNode(element) ? element.type : ts.isOptionalTypeNode(element) ? element.type : element;
        return { name: named ? element.name.getText(sf) : `arg${index}`, type: type.getText(sf), optional, rest };
    });
}

function emitsFor(sf) {
    const emits = [];
    for (const call of callExpressions(sf, 'defineEmits')) {
        if (call.typeArguments?.length && ts.isTypeLiteralNode(call.typeArguments[0])) {
            for (const member of call.typeArguments[0].members) {
                if (ts.isPropertySignature(member) || ts.isMethodSignature(member)) emits.push({ name: expressionName(member.name, sf), parameters: payloadFromTuple(member.type, sf), origin: 'defineEmits' });
                else if (ts.isCallSignatureDeclaration(member)) {
                    const first = member.parameters[0];
                    const name = first?.type && ts.isLiteralTypeNode(first.type) && ts.isStringLiteral(first.type.literal) ? first.type.literal.text : undefined;
                    if (name) emits.push({ name, parameters: member.parameters.slice(1).map((parameter) => ({ name: parameter.name.getText(sf), type: parameter.type?.getText(sf) || 'unknown', optional: !!parameter.questionToken, rest: !!parameter.dotDotDotToken })), origin: 'defineEmits' });
                }
            }
        } else if (call.arguments[0] && ts.isArrayLiteralExpression(call.arguments[0])) {
            for (const event of call.arguments[0].elements) emits.push({ name: event.text || event.getText(sf), parameters: [], origin: 'defineEmits' });
        }
    }
    return emits;
}

function modelsFor(sf) {
    return callExpressions(sf, 'defineModel').map((call) => {
        const named = call.arguments[0] && ts.isStringLiteral(call.arguments[0]);
        const name = named ? call.arguments[0].text : 'modelValue';
        const options = named ? call.arguments[1] : call.arguments[0];
        const fields = new Map(objectEntries(options, sf).map((entry) => [entry.name, entry.value]));
        const type = call.typeArguments?.[0]?.getText(sf) || 'unknown';
        const required = fields.get('required')?.getText(sf) === 'true';
        return { name, propName: name, type, required, default: defaultValue({ model: true, required, type }, fields.get('default'), sf), origin: 'defineModel' };
    });
}

function exposeFor(sf) {
    const declarations = new Map();
    const visit = (node) => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) declarations.set(node.name.text, node.initializer);
        if (ts.isFunctionDeclaration(node) && node.name) declarations.set(node.name.text, node);
        ts.forEachChild(node, visit);
    };
    visit(sf);
    const exposed = [];
    for (const call of callExpressions(sf, 'defineExpose')) {
        const object = call.arguments[0];
        if (!object || !ts.isObjectLiteralExpression(object)) continue;
        for (const property of object.properties) {
            if (ts.isSpreadAssignment(property)) { exposed.push({ name: `...${property.expression.getText(sf)}`, kind: 'spread', expression: property.getText(sf) }); continue; }
            if (ts.isMethodDeclaration(property)) { exposed.push({ name: expressionName(property.name, sf), kind: 'method', expression: property.getText(sf) }); continue; }
            if (ts.isShorthandPropertyAssignment(property)) {
                const name = expressionName(property.name, sf); const init = declarations.get(name);
                const kind = init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init) || ts.isFunctionDeclaration(init)) ? 'method' : 'property';
                exposed.push({ name, kind, expression: property.name.getText(sf) });
                continue;
            }
            if (ts.isPropertyAssignment(property)) {
                const expr = property.initializer; const name = expressionName(property.name, sf);
                const kind = ts.isArrowFunction(expr) || ts.isFunctionExpression(expr) || /\.(focus|select|validate|reset|resetValidation|scrollTo|requestSubmit|close|update)$/.test(expr.getText(sf)) ? 'method' : 'property';
                exposed.push({ name, kind, expression: expr.getText(sf) });
            }
        }
    }
    return exposed;
}

function templateSlots(template) {
    if (!template) return [];
    const root = parseTemplate(template, { comments: false });
    const slots = [];
    const slotProp = (element) => element.props?.find((prop) => prop.type === 7 && prop.name === 'slot');
    function walk(node) {
        if (node.type === 1 && node.tag === 'slot') {
            let name = 'default'; let dynamicNameExpression; const payload = [];
            for (const prop of node.props || []) {
                if (prop.type === 6 && prop.name === 'name' && prop.value) name = prop.value.content;
                else if (prop.type === 7 && prop.name === 'bind') {
                    if (prop.arg?.isStatic && prop.arg.content === 'name') dynamicNameExpression = prop.exp?.content || '';
                    else if (prop.arg?.isStatic) payload.push({ name: prop.arg.content, expression: prop.exp?.content || '' });
                    else if (!prop.arg) payload.push({ name: '<spread>', expression: prop.exp?.content || '' });
                }
            }
            if (dynamicNameExpression) slots.push({ name: '<dynamic>', pattern: dynamicNameExpression.match(/^[`'\"]([^$]*)\$\{/)?.[1] ? `${dynamicNameExpression.match(/^[`'\"]([^$]*)\$\{/)[1]}*` : '*', dynamicNameExpression, payload, hasFallback: !!node.children?.length, kind: 'outlet' });
            else slots.push({ name, payload, hasFallback: !!node.children?.length, kind: 'outlet' });
        }
        if (node.type === 1 && node.tag === 'template') {
            const directive = slotProp(node);
            if (directive && !directive.arg?.isStatic && directive.arg?.content) {
                const forDirective = node.props?.find((prop) => prop.type === 7 && prop.name === 'for');
                slots.push({ name: '<forwarded-dynamic>', pattern: '*', dynamicNameExpression: directive.arg.content, payload: directive.exp?.content ? [{ name: '<scope>', expression: directive.exp.content }] : [], iterationExpression: forDirective?.exp?.content || '', kind: 'forwarded' });
            }
        }
        if (node.children) for (const child of node.children) walk(child);
    }
    walk(root);
    const forwarded = slots.find((slot) => slot.kind === 'forwarded');
    const merged = [];
    for (const slot of slots) {
        if (forwarded && slot.kind === 'outlet' && slot.name === '<dynamic>' && slot.dynamicNameExpression === forwarded.dynamicNameExpression) {
            forwarded.outletNameExpression = slot.dynamicNameExpression;
            continue;
        }
        const key = `${slot.kind}:${slot.name}:${slot.pattern || ''}`;
        const existing = merged.find((item) => item._key === key);
        if (!existing) {
            merged.push({ ...slot, _key: key });
            continue;
        }
        existing.hasFallback = existing.hasFallback || slot.hasFallback;
        for (const binding of slot.payload || []) {
            if (!existing.payload.some((item) => item.name === binding.name && item.expression === binding.expression)) existing.payload.push(binding);
        }
    }
    return merged.map(({ _key, ...slot }) => slot);
}

export function extractComponentContract(root, componentName, componentFile) {
    const filename = path.resolve(root, componentFile);
    const source = read(filename);
    const parsed = parseSfc(source, { filename });
    const setup = parsed.descriptor.scriptSetup?.content ?? parsed.descriptor.script?.content ?? '';
    const scriptKind = parsed.descriptor.scriptSetup?.lang === 'js' ? ts.ScriptKind.JS : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(filename, setup, ts.ScriptTarget.Latest, true, scriptKind);
    const formContextAware = /inject\(\s*formContextKey|useFormControl\(/.test(setup);
    const props = propsFor(root, filename, sf, formContextAware);
    const models = modelsFor(sf);
    const emits = emitsFor(sf);
    for (const model of models) emits.push({ name: `update:${model.name}`, parameters: [{ name: 'value', type: model.type, optional: false, rest: false }], origin: 'defineModel' });
    const uniqueEmits = [...new Map(emits.map((event) => [event.name, event])).values()];
    const slots = templateSlots(parsed.descriptor.template?.content);
    // defineSlots supplies precise public scopes for wrappers that forward through a private renderer.
    const resolver = createTypeResolver(root);
    for (const call of callExpressions(sf, 'defineSlots')) {
        for (const member of resolver.typeMembers(call.typeArguments?.[0], sf)) {
            const originFile = path.resolve(root, member.origin);
            const callbackSource = ts.createSourceFile(originFile, read(originFile) + `\ntype __SlotCallback = ${member.type};`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
            function callback(node) {
                if (ts.isFunctionTypeNode(node)) return node;
                if (ts.isParenthesizedTypeNode(node)) return callback(node.type);
                if (ts.isUnionTypeNode(node)) return node.types.map(callback).find(Boolean);
            }
            const signature = callback(callbackSource.statements.at(-1).type);
            const payload = signature?.parameters[0]?.type ? resolver.typeMembers(signature.parameters[0].type, callbackSource)
                .map(field => ({ name: field.name, expression: `scope.${field.name}` })) : [];
            const pattern = member.name.includes('*') ? member.name : undefined;
            const existing = slots.find(slot => pattern ? slot.pattern === pattern : slot.name === member.name);
            if (existing) existing.payload = payload;
            else slots.push({ name: pattern ? '<dynamic>' : member.name, pattern, payload, hasFallback: false, kind: 'declared' });
        }
    }
    return {
        name: componentName,
        file: relative(root, filename),
        props,
        models,
        emits: uniqueEmits,
        slots,
        slotForwarding: slotForwarding(root, filename, sf, parsed.descriptor.template?.content),
        expose: exposeFor(sf),
    };
}

function slotForwarding(root, filename, sf, template) {
    if (!template) return [];
    const imported = new Map();
    for (const statement of sf.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || !statement.moduleSpecifier.text.endsWith('.vue')) continue;
        const specifier = path.resolve(path.dirname(filename), statement.moduleSpecifier.text);
        const target = [specifier, `${specifier}.vue`, `${specifier}.ts`, path.join(specifier, 'index.vue')].find(existsSync);
        if (!target) continue;
        const clause = statement.importClause;
        if (clause?.name) imported.set(clause.name.text, relative(root, target));
        const bindings = clause?.namedBindings;
        if (bindings && ts.isNamedImports(bindings)) for (const binding of bindings.elements) imported.set(binding.name.text, relative(root, target));
    }
    if (!imported.size) return [];
    const ast = parseTemplate(template, { comments: false });
    const hasOutlet = (node) => node.type === 1 && node.tag === 'slot' || (node.children || []).some(hasOutlet);
    const slotProp = (node) => node.props?.find((prop) => prop.type === 7 && prop.name === 'slot');
    const found = [];
    const walk = (node, componentTag) => {
        if (node.type === 1 && imported.has(node.tag)) componentTag = node.tag;
        if (componentTag && node.type === 1 && node.tag === 'template' && hasOutlet(node)) {
            const directive = slotProp(node);
            if (directive) {
                const iteration = node.props?.find((prop) => prop.type === 7 && prop.name === 'for')?.exp?.content || '';
                const dynamic = !!directive.arg && !directive.arg.isStatic;
                const name = dynamic ? '*' : directive.arg?.content || 'default';
                const exclusions = [...iteration.matchAll(/(?:key|name)\s*!==?\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
                found.push({ component: componentTag, file: imported.get(componentTag), name, dynamic, exclusions, iterationExpression: iteration });
            }
        }
        for (const child of node.children || []) walk(child, componentTag);
    };
    walk(ast, undefined);
    const unique = new Map();
    for (const edge of found) unique.set(`${edge.file}:${edge.name}:${edge.dynamic}`, edge);
    return [...unique.values()];
}

function resolveForwardedSlots(contracts, root) {
    const byFile = new Map(contracts.map((contract) => [contract.file, contract]));
    const cache = new Map();
    const resolving = new Set();
    const identity = (slot) => slot.name === '<dynamic>' ? `dynamic:${slot.pattern}` : `named:${slot.name}`;
    const resolve = (contract) => {
        if (cache.has(contract.name)) return cache.get(contract.name);
        if (resolving.has(contract.name)) throw new Error(`Cyclic slot forwarding involving ${contract.name}`);
        resolving.add(contract.name);
        const slots = new Map();
        for (const slot of contract.slots.filter((entry) => entry.kind !== 'forwarded')) slots.set(identity(slot), structuredClone(slot));
        for (const edge of contract.slotForwarding || []) {
            // Public wrappers also forward through private renderers; keep their real slot contracts.
            let target = byFile.get(edge.file);
            if (!target && root && existsSync(path.resolve(root, edge.file))) {
                target = extractComponentContract(root, `private:${edge.file}`, edge.file);
                byFile.set(edge.file, target);
            }
            if (!target) continue;
            const childSlots = resolve(target);
            for (const childSlot of childSlots) {
                if (!edge.dynamic && childSlot.name !== edge.name && childSlot.pattern !== edge.name) continue;
                if (edge.dynamic && edge.exclusions.includes(childSlot.name)) continue;
                const key = identity(childSlot);
                const existing = slots.get(key);
                // A wrapper may map #prepend to its public #icon. Consuming a
                // child slot does not expose that child's name as a new API.
                if (!edge.dynamic && !existing) continue;
                if (!existing) {
                    slots.set(key, structuredClone(childSlot));
                    continue;
                }
                const localBindings = existing.payload || [];
                const inheritedBindings = childSlot.payload || [];
                const onlyForwardedPayload = localBindings.every((binding) => binding.name === '<scope>' || binding.name === '<spread>');
                const payload = onlyForwardedPayload ? inheritedBindings : [...inheritedBindings.filter(binding => binding.name !== '<scope>' && binding.name !== '<spread>'), ...localBindings.filter(binding => binding.name !== '<scope>' && binding.name !== '<spread>')];
                existing.payload = payload.filter((binding, index) => payload.findIndex((item) => item.name === binding.name) === index);
                existing.hasFallback = existing.hasFallback || childSlot.hasFallback;
            }
        }
        resolving.delete(contract.name);
        const result = [...slots.values()];
        cache.set(contract.name, result);
        return result;
    };
    for (const contract of contracts) contract.slots = resolve(contract);
    return contracts;
}

export function extractPublicComponentContracts(root, { includeLegacy = false } = {}) {
    const indexFile = path.resolve(root, 'src/ui/index.ts');
    const index = read(indexFile);
    const components = [...index.matchAll(/export\s*\{\s*default\s+as\s+(\w+)\s*\}\s*from\s*['"]([^'"]+\.vue)['"]/g)];
    const canonical = components.some(match => /^U(?!i[A-Z])/.test(match[1]));
    const selected = components.filter(match => !canonical || includeLegacy || /^U(?!i[A-Z])/.test(match[1]));
    const names = selected.map((match) => match[1]);
    if (new Set(names).size !== names.length) throw new Error('src/ui/index.ts contains duplicate public component names');
    return resolveForwardedSlots(selected.map((match) => extractComponentContract(root, match[1], path.relative(root, path.resolve(path.dirname(indexFile), match[2])))), root);
}

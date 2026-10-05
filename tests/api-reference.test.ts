import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { parse, compileTemplate } from '@vue/compiler-sfc';
import { parse as parseTemplate } from '@vue/compiler-dom';
import { componentApi } from '../src/ui/docs/apiReference.js';
import { pages } from '../src/ui/docs/content.js';
import { extractPublicComponentContracts } from './helpers/component-contracts.mjs';

const contracts = extractPublicComponentContracts(path.resolve('.'));
const sorted = (names: string[]) => [...names].sort();
const camel = (name: string) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const slotName = (slot: any) => slot.name === '<dynamic>' ? slot.pattern : slot.name;

test('every API table matches current exported props, defaults, models, events and exposed members', () => {
    assert.deepEqual(sorted(Object.keys(componentApi)), sorted(contracts.map(component => component.name)));
    for (const contract of contracts) {
        const api = componentApi[contract.name];
        const props = [...contract.props, ...contract.models];
        for (const [kind, rows] of Object.entries(api)) {
            const names = (rows as any[]).map(row => row.name);
            assert.equal(new Set(names).size, names.length, `${contract.name}.${kind} has duplicate entries`);
        }
        assert.deepEqual(sorted(api.props.map(prop => prop.name)), sorted(props.map(prop => prop.name)), `${contract.name} props`);
        for (const prop of props) {
            const row = api.props.find(row => row.name === prop.name);
            assert.equal(row.type, prop.type, `${contract.name}.${prop.name} type`);
            assert.deepEqual(row.declaredDefault, prop.default, `${contract.name}.${prop.name} default`);
            assert.equal(row.required, prop.required, `${contract.name}.${prop.name} required`);
            assert.ok(row.description.trim(), `${contract.name}.${prop.name} needs usage guidance`);
        }
        assert.deepEqual(sorted(api.events.map(event => event.name)), sorted(contract.emits.map(event => event.name)), `${contract.name} events`);
        for (const event of contract.emits) {
            const type = event.parameters.length ? event.parameters.map(parameter => `${parameter.rest ? '...' : ''}${parameter.name}${parameter.optional ? '?' : ''}: ${parameter.type}`).join(', ') : '—';
            assert.equal(api.events.find(row => row.name === event.name).type, type, `${contract.name}.${event.name} parameters`);
        }
        assert.deepEqual(sorted(api.methods.map(method => method.name)), sorted(contract.expose.map(member => member.name)), `${contract.name} exposed API`);
    }
});

test('slot API includes real payloads and forwarded table slots', () => {
    for (const contract of contracts) {
        let slots = contract.slots;
        if (contract.name === 'UiDataTableServer') {
            const tableSlots = contracts.find(component => component.name === 'UiTable').slots;
            slots = [...slots.filter(slot => !slot.name.startsWith('<')), ...tableSlots.filter(slot => !slots.some(current => current.name === slot.name))];
        }
        const rows = componentApi[contract.name].slots;
        assert.deepEqual(sorted(rows.map(row => row.name)), sorted(slots.map(slotName)), `${contract.name} slots`);
        for (const slot of slots) {
            const payload = slot.payload?.length ? '{ ' + slot.payload.map(item => camel(item.name)).join(', ') + ' }' : '—';
            assert.equal(rows.find(row => row.name === slotName(slot)).type, payload, `${contract.name}.${slotName(slot)} scope`);
        }
    }
});

test('Form has no implicit column API and Row/Col pages include the real form example', () => {
    const names = componentApi.UiForm.props.map(prop => prop.name);
    for (const obsolete of ['columns', 'layout', 'density']) assert.ok(!names.includes(obsolete));
    assert.deepEqual(componentApi.UiForm.slots.map(slot => slot.name), ['default']);
    assert.ok(!componentApi.UiFormSection.props.some(prop => prop.name === 'columns'));
    for (const api of Object.values(componentApi)) assert.ok(!api.props.some(prop => prop.name === 'span'));
    for (const id of ['form', 'row', 'col']) assert.ok(pages.find(page => page.id === id).examples.some(example => example.id === 'layout-form-grid'));
});

test('all published component source examples parse and compile without duplicate attributes', () => {
    for (const page of pages.filter(page => page.kind === 'component')) {
        for (const example of page.examples) {
            const { descriptor, errors } = parse(example.code, { filename: `${example.id}.vue` });
            assert.deepEqual(errors, [], `${page.name}.${example.id} SFC parse`);
            assert.ok(descriptor.template, `${page.name}.${example.id} needs a runnable template`);
            const result = compileTemplate({ source: descriptor.template.content, filename: `${example.id}.vue`, id: example.id });
            assert.deepEqual(result.errors, [], `${page.name}.${example.id} template compile`);
            function checkLayout(node: any) {
                for (const child of node.children ?? []) {
                    if (node.type === 1 && child.type === 1 && ['UiRow', 'UiFormActions'].includes(node.tag)) {
                        assert.notEqual(child.tag, node.tag, `${page.name}.${example.id}: nest rows through a column and avoid duplicate action bars`);
                    }
                    checkLayout(child);
                }
            }
            checkLayout(parseTemplate(descriptor.template.content));
        }
    }
});

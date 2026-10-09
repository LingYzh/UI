import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse, compileTemplate } from '@vue/compiler-sfc';
import { parse as parseTemplate } from '@vue/compiler-dom';
import { pages } from '../src/ui/docs/content.js';
import { extractPublicComponentContracts } from './helpers/component-contracts.mjs';

const contracts = extractPublicComponentContracts(path.resolve('.'));
const apiPath = path.resolve(process.env.UI_API_REFERENCE_PATH || 'src/ui/docs/apiReference.js');
const { componentApi } = await import(pathToFileURL(apiPath).href);
const sorted = (names: string[]) => [...names].sort();
const camel = (name: string) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const slotName = (slot: any) => slot.name === '<dynamic>' ? slot.pattern : slot.name;

test('renamed compatibility slots do not expose the consumed child slot names', () => {
    assert.deepEqual(sorted(componentApi.UMenuItem.slots.map(slot => slot.name)), ['default', 'icon', 'trailing']);
    assert.ok(componentApi.UToolbar.slots.some(slot => slot.name === 'title'));
    assert.ok(!componentApi.UToolbar.slots.some(slot => slot.name === 'text'), 'ToolbarTitle text is consumed by Toolbar title');
});

test('every API table matches current exported props, defaults, models, events and exposed members', () => {
    assert.ok(contracts.length > 0, 'the public component index should export components');
    assert.ok(contracts.every(component => /^U(?!i[A-Z])/.test(component.name)), 'only canonical U* exports belong in the API table');
    assert.equal(new Set(contracts.map(component => component.name)).size, contracts.length, 'canonical exports are unique');
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
            assert.notEqual(row.description.trim(), '配置属性', `${contract.name}.${prop.name} needs a concrete description`);
        }
        assert.deepEqual(sorted(api.events.map(event => event.name)), sorted(contract.emits.map(event => event.name)), `${contract.name} events`);
        for (const event of contract.emits) {
            const type = event.parameters.length ? event.parameters.map(parameter => `${parameter.rest ? '...' : ''}${parameter.name}${parameter.optional ? '?' : ''}: ${parameter.type}`).join(', ') : '—';
            assert.equal(api.events.find(row => row.name === event.name).type, type, `${contract.name}.${event.name} parameters`);
        }
        assert.deepEqual(sorted(api.methods.map(method => method.name)), sorted(contract.expose.map(member => member.name)), `${contract.name} exposed API`);
        for (const member of contract.expose) {
            const row = api.methods.find(method => method.name === member.name);
            assert.equal(row.kind, member.kind, `${contract.name}.${member.name} expose kind`);
            assert.equal(row.expression, member.expression, `${contract.name}.${member.name} expose expression`);
            assert.ok(row.description.trim(), `${contract.name}.${member.name} needs usage guidance`);
        }
    }
});

test('slot API recursively includes forwarded names and real payloads', () => {
    for (const contract of contracts) {
        const slots = contract.slots;
        const rows = componentApi[contract.name].slots;
        assert.deepEqual(sorted(rows.map(row => row.name)), sorted(slots.map(slotName)), `${contract.name} slots`);
        for (const slot of slots) {
            const payload = slot.payload?.length ? '{ ' + slot.payload.filter(item => !['<scope>', '<spread>'].includes(item.name)).map(item => camel(item.name)).join(', ') + ' }' : '—';
            assert.equal(rows.find(row => row.name === slotName(slot)).type, payload, `${contract.name}.${slotName(slot)} scope`);
        }
    }
    const combo = componentApi.UCombobox.slots;
    for (const name of ['item', 'selection', 'selection-summary']) assert.ok(combo.some(slot => slot.name === name), `Combobox ${name}`);
    for (const field of ['item', 'internalItem', 'index', 'props']) assert.ok(combo.find(slot => slot.name === 'item').type.includes(field), `Combobox item scope ${field}`);
    const server = componentApi.UDataTableServer.slots;
    for (const name of ['header.*', 'loading', 'error', 'group-header', 'item.*', 'expanded-row', 'no-data', 'footer']) {
        assert.ok(server.some(slot => slot.name === name), `UDataTableServer forwards ${name}`);
    }
    for (const field of ['item', 'group', 'toggle', 'toggleGroup', 'isGroupOpen', 'columns']) {
        assert.ok(server.find(slot => slot.name === 'group-header').type.includes(field), `group-header scope includes ${field}`);
    }
});

test('explicit undefined inherits shared control defaults while omitted Boolean members keep Vue casting', () => {
    const textField = contracts.find(component => component.name === 'UTextField');
    const hideDetails = textField?.props.find(prop => prop.name === 'hideDetails');
    assert.ok(hideDetails, 'UTextField declares hideDetails');
    assert.deepEqual(hideDetails.default, { kind: 'explicit-undefined', source: 'undefined' });

    const button = contracts.find(component => component.name === 'UButton');
    const icon = button?.props.find(prop => prop.name === 'icon');
    assert.ok(icon, 'UButton declares icon');
    assert.equal(icon.type, 'boolean | string');
    assert.deepEqual(icon.default, { kind: 'vue-boolean-false' });

    const select = contracts.find(component => component.name === 'USelect');
    const blurOnSelect = select?.props.find(prop => prop.name === 'blurOnSelect');
    assert.ok(blurOnSelect, 'USelect declares blurOnSelect');
    assert.deepEqual(blurOnSelect.default, { kind: 'explicit', source: 'true' }, 'the wrapper must preserve its child control default');
    assert.deepEqual(componentApi.USelect.props.find(prop => prop.name === 'blurOnSelect').declaredDefault, blurOnSelect.default);
});

test('Form has no implicit column API and Row/Col pages include the real form example', () => {
    const names = componentApi.UForm.props.map(prop => prop.name);
    for (const obsolete of ['columns', 'layout']) assert.ok(!names.includes(obsolete));
    assert.ok(names.includes('density'), 'UForm supports the shared density token');
    assert.deepEqual(componentApi.UForm.slots.map(slot => slot.name), ['default']);
    assert.ok(!componentApi.UFormSection.props.some(prop => prop.name === 'columns'));
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
                    if (node.type === 1 && child.type === 1 && ['UiRow', 'UiFormActions', 'URow', 'UFormActions'].includes(node.tag)) {
                        assert.notEqual(child.tag, node.tag, `${page.name}.${example.id}: nest rows through a column and avoid duplicate action bars`);
                    }
                    checkLayout(child);
                }
            }
            checkLayout(parseTemplate(descriptor.template.content));
        }
    }
});

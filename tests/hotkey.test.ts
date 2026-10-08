import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultHotkeyMap, formatHotkeys, type HotkeyMap } from '../src/ui/hotkey';

test('formats nested combo, alternate and sequence grammar with their own dividers', () => {
    const [tokens] = formatHotkeys('ctrl+k/meta+p-shift+enter', 'text', defaultHotkeyMap, false);

    assert.deepEqual(tokens.map((token) => token.kind === 'key' ? token.text : token.content), [
        'Ctrl', '+', 'K', '或', 'Ctrl', '+', 'P', '然后', 'Shift', '+', 'Enter'
    ]);
    assert.deepEqual(tokens.filter((token) => token.kind === 'divider').map((token) => token.separator), [
        'and', 'or', 'and', 'then', 'and'
    ]);
});

test('splits independent combinations and normalizes the official key aliases', () => {
    const combinations = formatHotkeys('control+up return', 'text', defaultHotkeyMap, false);

    assert.equal(combinations.length, 2);
    assert.deepEqual(combinations[0].filter((token) => token.kind === 'key').map((token) => token.key), [
        'ctrl', 'arrowup'
    ]);
    assert.equal(combinations[0][0].kind === 'key' ? combinations[0][0].text : '', 'Ctrl');
    assert.equal(combinations[1][0].kind === 'key' ? combinations[1][0].key : '', 'enter');
});

test('supports literal separator keys through their official aliases', () => {
    const [tokens] = formatHotkeys('plus+minus+slash+underscore', 'text', defaultHotkeyMap, false);
    const keys = tokens.filter((token) => token.kind === 'key');

    assert.deepEqual(keys.map((token) => token.key), ['+', '-', '/', '_']);
    assert.deepEqual(keys.map((token) => token.text), ['+', '-', '/', '_']);
});

test('falls back to readable text when an icon or symbol is unavailable', () => {
    const [iconTokens] = formatHotkeys('ctrl+unknown', 'icon', defaultHotkeyMap, false);
    const [symbolTokens] = formatHotkeys('escape', 'symbol', defaultHotkeyMap, false);

    assert.deepEqual(iconTokens.map((token) => token.kind === 'key' ? [token.mode, token.content, token.text] : token.content), [
        ['icon', 'mdi-apple-keyboard-control', 'Ctrl'],
        '+',
        ['text', 'UNKNOWN', 'UNKNOWN']
    ]);
    assert.deepEqual(symbolTokens[0], {
        kind: 'key',
        key: 'escape',
        mode: 'text',
        content: 'Escape',
        text: 'Escape'
    });
});

test('uses a Mac override as the selected config without merging the default config', () => {
    const map: HotkeyMap = {
        custom: {
            default: { text: 'Default', icon: 'mdi-default', symbol: 'D' },
            mac: { text: 'Mac' }
        }
    };
    const [macIcon] = formatHotkeys('custom', 'icon', map, true);
    const [macText] = formatHotkeys('custom', 'text', map, true);

    assert.deepEqual(macIcon[0], {
        kind: 'key',
        key: 'custom',
        mode: 'text',
        content: 'Mac',
        text: 'Mac'
    });
    assert.equal(macText[0].kind === 'key' ? macText[0].content : '', 'Mac');
});

test('uses a supplied custom map and preserves unknown keys in uppercase', () => {
    const map: HotkeyMap = {
        save: {
            default: { text: 'Save', symbol: 'S', icon: 'mdi-content-save' }
        }
    };
    const [tokens] = formatHotkeys('save+PageDown', 'symbol', map, false);

    assert.deepEqual(tokens.map((token) => token.kind === 'key' ? [token.key, token.mode, token.content, token.text] : token.content), [
        ['save', 'symbol', 'S', 'Save'],
        '+',
        ['pagedown', 'text', 'PAGEDOWN', 'PAGEDOWN']
    ]);
});

test('normalizes custom text tokens but leaves Vuetify locale tokens pending', () => {
    const map: HotkeyMap = {
        custom: {
            default: { text: '$ctrl' }
        },
        localized: {
            default: { text: '$vuetify.hotkey.ctrl' }
        }
    };
    const [custom] = formatHotkeys('custom', 'icon', map, false);
    const [localized] = formatHotkeys('localized', 'text', map, false);

    assert.deepEqual(custom[0], {
        kind: 'key',
        key: 'custom',
        mode: 'text',
        content: 'CTRL',
        text: 'CTRL'
    });
    assert.equal(localized[0].kind === 'key' ? localized[0].content : '', '$vuetify.hotkey.ctrl');
});

test('does not guess the nonstandard mod alias', () => {
    const [tokens] = formatHotkeys('mod+k', 'text', defaultHotkeyMap, false);

    assert.equal(tokens[0].kind === 'key' ? tokens[0].text : '', 'MOD');
});

test('returns no combinations for an empty value and an empty token list for invalid grammar', () => {
    assert.deepEqual(formatHotkeys(undefined, 'text', defaultHotkeyMap, false), []);
    assert.deepEqual(formatHotkeys('', 'text', defaultHotkeyMap, false), []);
    assert.deepEqual(formatHotkeys('ctrl+', 'text', defaultHotkeyMap, false), [[]]);
    assert.deepEqual(formatHotkeys('ctrl++k', 'text', defaultHotkeyMap, false), [[]]);
});

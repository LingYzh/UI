import test from 'node:test';
import assert from 'node:assert/strict';
import {
    defaultHotkeyMap,
    formatHotkeys,
    HotkeySequenceMatcher,
    parseHotkeySequences,
    type HotkeyKeyboardEvent,
    type HotkeyMap
} from '../src/ui/hotkey';

function keyEvent(key: string, modifiers: Partial<HotkeyKeyboardEvent> = {}, timeStamp = 0): HotkeyKeyboardEvent {
    return {
        key,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        timeStamp,
        ...modifiers
    };
}

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

test('normalizes custom text tokens and preserves Vuetify tokens without a translator', () => {
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

test('translates Vuetify text tokens and localized dividers without changing icon or symbol values', () => {
    const map: HotkeyMap = {
        ctrl: {
            default: { text: '$vuetify.hotkey.ctrl', symbol: '⌃', icon: 'control-icon' }
        },
        meta: {
            default: { text: '$vuetify.hotkey.meta', symbol: '⌘', icon: 'command-icon' }
        }
    };
    const translate = (key: string) => ({
        '$vuetify.hotkey.ctrl': 'Control key',
        '$vuetify.hotkey.meta': 'Command key',
        'hotkey.separator.or': 'or localized',
        'hotkey.separator.then': 'then localized'
    }[key] ?? key);
    const [textTokens] = formatHotkeys('ctrl/meta-ctrl', 'text', map, false, translate);
    const [symbolTokens] = formatHotkeys('ctrl', 'symbol', map, false, translate);
    const [iconTokens] = formatHotkeys('ctrl', 'icon', map, false, translate);

    assert.deepEqual(textTokens.map(token => token.kind === 'key' ? token.text : token.content), [
        'Control key', 'or localized', 'Command key', 'then localized', 'Control key'
    ]);
    assert.deepEqual(symbolTokens[0], {
        kind: 'key',
        key: 'ctrl',
        mode: 'symbol',
        content: '⌃',
        text: 'Control key'
    });
    assert.deepEqual(iconTokens[0], {
        kind: 'key',
        key: 'ctrl',
        mode: 'icon',
        content: 'control-icon',
        text: 'Control key'
    });
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

test('compiles the same sequence, alternate and independent-shortcut grammar used by display', () => {
    const sequences = parseHotkeySequences('ctrl+k/meta+p-shift+enter control+up');

    assert.equal(sequences.length, 3);
    assert.deepEqual(sequences.map(sequence => sequence.map(chord => [chord.key, chord.modifiers])), [
        [
            ['k', { ctrl: true, meta: false, alt: false, shift: false }],
            ['enter', { ctrl: false, meta: false, alt: false, shift: true }]
        ],
        [
            ['p', { ctrl: false, meta: true, alt: false, shift: false }],
            ['enter', { ctrl: false, meta: false, alt: false, shift: true }]
        ],
        [['arrowup', { ctrl: true, meta: false, alt: false, shift: false }]]
    ]);
    assert.deepEqual(parseHotkeySequences('a+b'), [], 'unmodified simultaneous keys cannot be represented by KeyboardEvent modifiers');
});

test('matches modifier chords and completes either parsed alternative sequence', () => {
    const matcher = new HotkeySequenceMatcher();
    matcher.setSequences(parseHotkeySequences('ctrl+k/meta+p-shift+enter'));

    assert.deepEqual(matcher.match(keyEvent('p', { metaKey: true }, 10)), { matched: true, triggered: false });
    assert.deepEqual(matcher.match(keyEvent('Enter', { shiftKey: true }, 20)), { matched: true, triggered: true });
    assert.deepEqual(matcher.match(keyEvent('k', { ctrlKey: true }, 30)), { matched: true, triggered: false });
    assert.deepEqual(matcher.match(keyEvent('Enter', { shiftKey: true }, 40)), { matched: true, triggered: true });
});

test('drops a mismatched sequence step and lets that key restart from a first chord', () => {
    const matcher = new HotkeySequenceMatcher();
    matcher.setSequences(parseHotkeySequences('ctrl+k-shift+enter'));

    assert.deepEqual(matcher.match(keyEvent('k', { ctrlKey: true }, 0)), { matched: true, triggered: false });
    assert.deepEqual(matcher.match(keyEvent('x', { ctrlKey: true }, 10)), { matched: false, triggered: false });
    assert.deepEqual(matcher.match(keyEvent('Enter', { shiftKey: true }, 20)), { matched: false, triggered: false });
    assert.deepEqual(matcher.match(keyEvent('k', { ctrlKey: true }, 30)), { matched: true, triggered: false });
    assert.deepEqual(matcher.match(keyEvent('k', { ctrlKey: true }, 40)), { matched: true, triggered: false });
    assert.deepEqual(matcher.match(keyEvent('Enter', { shiftKey: true }, 50)), { matched: true, triggered: true });
});

test('expires partial sequences at the configured timeout and resets explicitly', () => {
    const matcher = new HotkeySequenceMatcher();
    matcher.setSequences(parseHotkeySequences('ctrl+k-shift+enter'));

    matcher.match(keyEvent('k', { ctrlKey: true }, 0), { sequenceTimeout: 50 });
    assert.deepEqual(matcher.match(keyEvent('Enter', { shiftKey: true }, 51), { sequenceTimeout: 50 }), { matched: false, triggered: false });
    matcher.match(keyEvent('k', { ctrlKey: true }, 60), { sequenceTimeout: 50 });
    matcher.reset();
    assert.deepEqual(matcher.match(keyEvent('Enter', { shiftKey: true }, 70), { sequenceTimeout: 50 }), { matched: false, triggered: false });
});

test('exact defaults to the legacy modifier equality and can accept extra modifiers when disabled', () => {
    const matcher = new HotkeySequenceMatcher();
    matcher.setSequences(parseHotkeySequences('ctrl+shift+k'));

    assert.deepEqual(matcher.match(keyEvent('k', { ctrlKey: true, shiftKey: true, altKey: true }, 1)), { matched: false, triggered: false });
    assert.deepEqual(matcher.match(keyEvent('k', { ctrlKey: true, shiftKey: true, altKey: true }, 2), { exact: false }), { matched: true, triggered: true });
});

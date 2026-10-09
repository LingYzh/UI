import type { IconValue } from './icon-config';

export type HotkeyDisplayMode = 'icon' | 'symbol' | 'text';
export type HotkeyPlatform = 'auto' | 'mac' | 'pc';

export interface HotkeyKeyConfig {
    text: string;
    icon?: IconValue;
    symbol?: string;
}

export interface HotkeyPlatformKeyConfig {
    default: HotkeyKeyConfig;
    mac?: HotkeyKeyConfig;
}

export type HotkeyMap = Record<string, HotkeyPlatformKeyConfig>;

export type HotkeyDisplayKey =
    | {
        kind: 'key';
        key: string;
        mode: 'icon';
        content: IconValue;
        text: string;
    }
    | {
        kind: 'key';
        key: string;
        mode: 'symbol' | 'text';
        content: string;
        text: string;
    };

export type HotkeyDisplayDivider = {
    kind: 'divider';
    separator: 'and' | 'or' | 'then';
    content: string;
};

export type HotkeyDisplayToken = HotkeyDisplayKey | HotkeyDisplayDivider;

type HotkeyNode = string | {
    type: 'sequence' | 'alternate' | 'combo';
    parts: HotkeyNode[];
};

export interface HotkeyModifiers {
    ctrl: boolean;
    meta: boolean;
    alt: boolean;
    shift: boolean;
}

export interface HotkeyChord {
    /** The non-modifier key, or null when the chord itself is a modifier. */
    key: string | null;
    /** Modifier keys that may be pressed as the primary key for modifier-only chords. */
    modifierKeys: string[];
    modifiers: HotkeyModifiers;
}

export type HotkeySequence = HotkeyChord[];

export interface HotkeyKeyboardEvent {
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    timeStamp: number;
}

export interface HotkeySequenceMatchOptions {
    exact?: boolean;
    sequenceTimeout?: number;
    now?: number;
}

export interface HotkeySequenceMatchResult {
    matched: boolean;
    triggered: boolean;
}

const aliases = new Map<string, string>([
    ['control', 'ctrl'],
    ['command', 'cmd'],
    ['option', 'alt'],
    ['up', 'arrowup'],
    ['down', 'arrowdown'],
    ['left', 'arrowleft'],
    ['right', 'arrowright'],
    ['esc', 'escape'],
    ['spacebar', ' '],
    ['space', ' '],
    ['return', 'enter'],
    ['del', 'delete'],
    ['plus', '+'],
    ['slash', '/'],
    ['underscore', '_'],
    ['minus', '-'],
    ['hyphen', '-']
]);

export const defaultHotkeyMap: HotkeyMap = {
    ctrl: {
        default: { text: 'Ctrl', icon: '$ctrl' },
        mac: { text: 'Control', symbol: '⌃', icon: '$ctrl' }
    },
    meta: {
        default: { text: 'Ctrl', icon: '$ctrl' },
        mac: { text: 'Command', symbol: '⌘', icon: '$command' }
    },
    cmd: {
        default: { text: 'Ctrl', icon: '$ctrl' },
        mac: { text: 'Command', symbol: '⌘', icon: '$command' }
    },
    shift: {
        default: { text: 'Shift', symbol: '⇧', icon: '$shift' },
        mac: { text: 'Shift', symbol: '⇧', icon: '$shift' }
    },
    alt: {
        default: { text: 'Alt', icon: '$alt' },
        mac: { text: 'Option', symbol: '⌥', icon: '$alt' }
    },
    enter: {
        default: { text: 'Enter', symbol: '↵', icon: '$enter' }
    },
    arrowup: {
        default: { text: 'Up Arrow', symbol: '↑', icon: '$arrowup' }
    },
    arrowdown: {
        default: { text: 'Down Arrow', symbol: '↓', icon: '$arrowdown' }
    },
    arrowleft: {
        default: { text: 'Left Arrow', symbol: '←', icon: '$arrowleft' }
    },
    arrowright: {
        default: { text: 'Right Arrow', symbol: '→', icon: '$arrowright' }
    },
    backspace: {
        default: { text: 'Backspace', symbol: '⌫', icon: '$backspace' }
    },
    escape: {
        default: { text: 'Escape', icon: '$escape' }
    },
    ' ': {
        default: { text: 'Space', icon: '$space' },
        mac: { text: 'Space', symbol: '␣', icon: '$space' }
    },
    '-': {
        default: { text: '-' }
    },
    '+': {
        default: { text: '+' }
    }
};

class HotkeyParseError extends Error {}

function normalizeKey(key: string): string {
    const lowerKey = key.toLowerCase();
    return aliases.get(lowerKey) ?? lowerKey;
}

function isSeparator(value: string | undefined): boolean {
    return value !== undefined && ['-', '/', '+', '_'].includes(value);
}

function displayText(value: string, translate?: (key: string) => string): string {
    if (value.startsWith('$vuetify.')) return translate ? translate(value) : value;
    if (value.startsWith('$') && !value.startsWith('$vuetify.')) return value.slice(1).toUpperCase();
    return value;
}

function parseCombination(input: string): HotkeyNode {
    let position = 0;

    function peek(ahead = 0): string | undefined {
        return input[position + ahead];
    }

    function consume(): string {
        const value = peek();
        if (value === undefined) throw new HotkeyParseError('Unexpected end of input');
        position++;
        return value;
    }

    function parseKey(): string {
        const first = peek();
        if (first === undefined) throw new HotkeyParseError('Unexpected end of input');

        if (isSeparator(first)) {
            const next = peek(1);
            if (next !== undefined && !isSeparator(next)) {
                throw new HotkeyParseError('Unexpected separator at position ' + position);
            }
            return normalizeKey(consume());
        }

        let value = consume();
        while (peek() !== undefined && !isSeparator(peek()) && peek() !== ' ') {
            value += consume();
        }
        return normalizeKey(value);
    }

    function parseCombo(): HotkeyNode {
        const parts: HotkeyNode[] = [parseKey()];
        while (peek() === '+' || peek() === '_') {
            consume();
            parts.push(parseKey());
        }
        return parts.length === 1 ? parts[0] : { type: 'combo', parts };
    }

    function parseAlternate(): HotkeyNode {
        const parts: HotkeyNode[] = [parseCombo()];
        while (peek() === '/') {
            consume();
            parts.push(parseCombo());
        }
        return parts.length === 1 ? parts[0] : { type: 'alternate', parts };
    }

    function parseSequence(): HotkeyNode {
        const parts: HotkeyNode[] = [parseAlternate()];
        while (peek() === '-') {
            consume();
            parts.push(parseAlternate());
        }
        return parts.length === 1 ? parts[0] : { type: 'sequence', parts };
    }

    const result = parseSequence();
    if (position !== input.length) {
        throw new HotkeyParseError('Unexpected character at position ' + position);
    }
    return result;
}

const modifierNames = new Set(['ctrl', 'cmd', 'meta', 'alt', 'shift']);

function createChord(parts: string[]): HotkeyChord | undefined {
    const modifiers: HotkeyModifiers = { ctrl: false, meta: false, alt: false, shift: false };
    const modifierKeys: string[] = [];
    const keys: string[] = [];

    for (const part of parts) {
        const key = normalizeKey(part);
        if (modifierNames.has(key)) {
            const modifier = key === 'cmd' ? 'meta' : key;
            modifiers[modifier as keyof HotkeyModifiers] = true;
            if (!modifierKeys.includes(modifier)) modifierKeys.push(modifier);
        } else {
            keys.push(key);
        }
    }

    // KeyboardEvent exposes one primary key plus modifier flags. Arbitrary
    // simultaneous non-modifier keys cannot be matched through that protocol.
    if (keys.length > 1) return undefined;

    return {
        key: keys[0] ?? null,
        modifierKeys,
        modifiers
    };
}

function expandHotkeyNode(node: HotkeyNode): HotkeySequence[] {
    if (typeof node === 'string') {
        const chord = createChord([node]);
        return chord ? [[chord]] : [];
    }

    if (node.type === 'combo') {
        const parts = node.parts.filter((part): part is string => typeof part === 'string');
        if (parts.length !== node.parts.length) return [];
        const chord = createChord(parts);
        return chord ? [[chord]] : [];
    }

    if (node.type === 'alternate') return node.parts.flatMap(expandHotkeyNode);

    return node.parts.reduce<HotkeySequence[]>((sequences, part) => {
        const alternatives = expandHotkeyNode(part);
        return sequences.flatMap(sequence => alternatives.map(alternative => [...sequence, ...alternative]));
    }, [[]]);
}

/** Compile the display grammar into the sequences consumed by UHotkeyListener. */
export function parseHotkeySequences(keys: string | undefined): HotkeySequence[] {
    if (!keys) return [];

    return keys.split(/\b \b/).flatMap(combination => {
        try {
            return expandHotkeyNode(parseCombination(combination));
        } catch (error) {
            if (error instanceof HotkeyParseError) return [];
            throw error;
        }
    });
}

function normalizeEventKey(key: string): string {
    return normalizeKey(key === ' ' ? 'space' : key);
}

function matchesChord(event: HotkeyKeyboardEvent, chord: HotkeyChord, exact: boolean): boolean {
    const eventKey = normalizeEventKey(event.key);
    const keyMatches = chord.key === null
        ? chord.modifierKeys.includes(eventKey)
        : chord.key === eventKey;
    if (!keyMatches) return false;

    const actual: HotkeyModifiers = {
        ctrl: event.ctrlKey,
        meta: event.metaKey,
        alt: event.altKey,
        shift: event.shiftKey
    };

    return (Object.keys(chord.modifiers) as Array<keyof HotkeyModifiers>).every(modifier =>
        chord.modifiers[modifier] ? actual[modifier] : !exact || !actual[modifier]
    );
}

interface ActiveHotkeySequence {
    sequenceIndex: number;
    nextChordIndex: number;
    lastMatchedAt: number;
}

/** Stateful matcher shared by the component listener and protocol tests. */
export class HotkeySequenceMatcher {
    private sequences: HotkeySequence[] = [];
    private active: ActiveHotkeySequence[] = [];

    setSequences(sequences: HotkeySequence[]): void {
        this.sequences = sequences;
        this.reset();
    }

    reset(): void {
        this.active = [];
    }

    match(
        event: HotkeyKeyboardEvent,
        options: HotkeySequenceMatchOptions = {}
    ): HotkeySequenceMatchResult {
        const exact = options.exact ?? true;
        const timeout = options.sequenceTimeout ?? 1000;
        const now = options.now ?? event.timeStamp;
        const nextActive: ActiveHotkeySequence[] = [];
        let matched = false;
        let triggered = false;

        for (const active of this.active) {
            const sequence = this.sequences[active.sequenceIndex];
            if (!sequence || now - active.lastMatchedAt > timeout) continue;

            const chord = sequence[active.nextChordIndex];
            if (!chord || !matchesChord(event, chord, exact)) continue;

            matched = true;
            if (active.nextChordIndex === sequence.length - 1) {
                triggered = true;
            } else {
                nextActive.push({
                    ...active,
                    nextChordIndex: active.nextChordIndex + 1,
                    lastMatchedAt: now
                });
            }
        }

        // Every key can start a fresh branch, even while an earlier sequence
        // is in progress. This also lets a mismatching key restart the gesture.
        for (let sequenceIndex = 0; sequenceIndex < this.sequences.length; sequenceIndex++) {
            const sequence = this.sequences[sequenceIndex];
            const firstChord = sequence[0];
            if (!firstChord || !matchesChord(event, firstChord, exact)) continue;

            matched = true;
            if (sequence.length === 1) {
                triggered = true;
                continue;
            }

            nextActive.push({ sequenceIndex, nextChordIndex: 1, lastMatchedAt: now });
        }

        const unique = new Map<string, ActiveHotkeySequence>();
        for (const active of nextActive) {
            unique.set(`${active.sequenceIndex}:${active.nextChordIndex}`, active);
        }
        this.active = [...unique.values()];

        return { matched, triggered };
    }
}

function formatKey(
    key: string,
    mode: HotkeyDisplayMode,
    map: HotkeyMap,
    isMac: boolean,
    translate?: (key: string) => string
): HotkeyDisplayKey {
    const config = Object.hasOwn(map, key) ? map[key] : undefined;
    if (!config) {
        const text = key.toUpperCase();
        return { kind: 'key', key, mode: 'text', content: text, text };
    }

    const platformConfig = isMac && config.mac ? config.mac : config.default;
    const text = displayText(platformConfig.text, translate);
    if (mode === 'icon') {
        const icon = platformConfig.icon;
        return icon
            ? { kind: 'key', key, mode: 'icon', content: icon, text }
            : { kind: 'key', key, mode: 'text', content: text, text };
    }
    if (mode === 'symbol') {
        const symbol = platformConfig.symbol;
        return symbol
            ? { kind: 'key', key, mode: 'symbol', content: symbol, text }
            : { kind: 'key', key, mode: 'text', content: text, text };
    }
    return { kind: 'key', key, mode: 'text', content: text, text };
}

function divider(type: 'sequence' | 'alternate' | 'combo', translate?: (key: string) => string): HotkeyDisplayDivider {
    if (type === 'sequence') return { kind: 'divider', separator: 'then', content: translate ? translate('hotkey.separator.then') : '然后' };
    if (type === 'alternate') return { kind: 'divider', separator: 'or', content: translate ? translate('hotkey.separator.or') : '或' };
    return { kind: 'divider', separator: 'and', content: '+' };
}

function appendNode(
    node: HotkeyNode,
    result: HotkeyDisplayToken[],
    mode: HotkeyDisplayMode,
    map: HotkeyMap,
    isMac: boolean,
    translate?: (key: string) => string
): void {
    if (typeof node === 'string') {
        result.push(formatKey(node, mode, map, isMac, translate));
        return;
    }

    node.parts.forEach((part, index) => {
        if (index > 0) result.push(divider(node.type, translate));
        appendNode(part, result, mode, map, isMac, translate);
    });
}

export function formatHotkeys(
    keys: string | undefined,
    mode: HotkeyDisplayMode,
    map: HotkeyMap,
    isMac: boolean,
    translate?: (key: string) => string
): HotkeyDisplayToken[][] {
    if (!keys) return [];

    return keys.split(/\b \b/).map((combination) => {
        try {
            const node = parseCombination(combination);
            const result: HotkeyDisplayToken[] = [];
            appendNode(node, result, mode, map, isMac, translate);
            return result;
        } catch (error) {
            if (error instanceof HotkeyParseError) return [];
            throw error;
        }
    });
}

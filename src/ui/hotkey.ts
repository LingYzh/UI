export type HotkeyDisplayMode = 'icon' | 'symbol' | 'text';
export type HotkeyPlatform = 'auto' | 'mac' | 'pc';

export interface HotkeyKeyConfig {
    text: string;
    icon?: string;
    symbol?: string;
}

export interface HotkeyPlatformKeyConfig {
    default: HotkeyKeyConfig;
    mac?: HotkeyKeyConfig;
}

export type HotkeyMap = Record<string, HotkeyPlatformKeyConfig>;

export type HotkeyDisplayKey = {
    kind: 'key';
    key: string;
    mode: HotkeyDisplayMode;
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
        default: { text: 'Ctrl', icon: 'mdi-apple-keyboard-control' },
        mac: { text: 'Control', symbol: '⌃', icon: 'mdi-apple-keyboard-control' }
    },
    meta: {
        default: { text: 'Ctrl', icon: 'mdi-apple-keyboard-control' },
        mac: { text: 'Command', symbol: '⌘', icon: 'mdi-apple-keyboard-command' }
    },
    cmd: {
        default: { text: 'Ctrl', icon: 'mdi-apple-keyboard-control' },
        mac: { text: 'Command', symbol: '⌘', icon: 'mdi-apple-keyboard-command' }
    },
    shift: {
        default: { text: 'Shift', symbol: '⇧', icon: 'mdi-apple-keyboard-shift' },
        mac: { text: 'Shift', symbol: '⇧', icon: 'mdi-apple-keyboard-shift' }
    },
    alt: {
        default: { text: 'Alt', icon: 'mdi-apple-keyboard-option' },
        mac: { text: 'Option', symbol: '⌥', icon: 'mdi-apple-keyboard-option' }
    },
    enter: {
        default: { text: 'Enter', symbol: '↵', icon: 'mdi-keyboard-return' }
    },
    arrowup: {
        default: { text: 'Up Arrow', symbol: '↑', icon: 'mdi-arrow-up' }
    },
    arrowdown: {
        default: { text: 'Down Arrow', symbol: '↓', icon: 'mdi-arrow-down' }
    },
    arrowleft: {
        default: { text: 'Left Arrow', symbol: '←', icon: 'mdi-arrow-left' }
    },
    arrowright: {
        default: { text: 'Right Arrow', symbol: '→', icon: 'mdi-arrow-right' }
    },
    backspace: {
        default: { text: 'Backspace', symbol: '⌫', icon: 'mdi-backspace-outline' }
    },
    escape: {
        default: { text: 'Escape', icon: 'mdi-keyboard-esc' }
    },
    ' ': {
        default: { text: 'Space', icon: 'mdi-keyboard-space' },
        mac: { text: 'Space', symbol: '␣', icon: 'mdi-keyboard-space' }
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

function displayText(value: string): string {
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

function formatKey(key: string, mode: HotkeyDisplayMode, map: HotkeyMap, isMac: boolean): HotkeyDisplayKey {
    const config = Object.hasOwn(map, key) ? map[key] : undefined;
    if (!config) {
        const text = key.toUpperCase();
        return { kind: 'key', key, mode: 'text', content: text, text };
    }

    const platformConfig = isMac && config.mac ? config.mac : config.default;
    const text = displayText(platformConfig.text);
    const requestedContent = mode === 'text' ? text : platformConfig[mode];
    const resolvedMode = mode !== 'text' && !requestedContent ? 'text' : mode;
    const content = resolvedMode === 'text' ? text : platformConfig[resolvedMode] ?? text;
    return {
        kind: 'key',
        key,
        mode: resolvedMode,
        content,
        text
    };
}

function divider(type: 'sequence' | 'alternate' | 'combo'): HotkeyDisplayDivider {
    if (type === 'sequence') return { kind: 'divider', separator: 'then', content: '然后' };
    if (type === 'alternate') return { kind: 'divider', separator: 'or', content: '或' };
    return { kind: 'divider', separator: 'and', content: '+' };
}

function appendNode(node: HotkeyNode, result: HotkeyDisplayToken[], mode: HotkeyDisplayMode, map: HotkeyMap, isMac: boolean): void {
    if (typeof node === 'string') {
        result.push(formatKey(node, mode, map, isMac));
        return;
    }

    node.parts.forEach((part, index) => {
        if (index > 0) result.push(divider(node.type));
        appendNode(part, result, mode, map, isMac);
    });
}

export function formatHotkeys(keys: string | undefined, mode: HotkeyDisplayMode, map: HotkeyMap, isMac: boolean): HotkeyDisplayToken[][] {
    if (!keys) return [];

    return keys.split(/\b \b/).map((combination) => {
        try {
            const node = parseCombination(combination);
            const result: HotkeyDisplayToken[] = [];
            appendNode(node, result, mode, map, isMac);
            return result;
        } catch (error) {
            if (error instanceof HotkeyParseError) return [];
            throw error;
        }
    });
}

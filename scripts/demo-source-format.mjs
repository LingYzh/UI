import { format } from 'prettier';
import { parse as parseSfc } from '@vue/compiler-sfc';
import { parse as parseTemplate } from '@vue/compiler-dom';

function expandTemplate(source, level) {
    const tree = parseTemplate(source);
    function lines(raw, baseline, depth) {
        const prefix = ' '.repeat(depth * 4);
        const previous = ' '.repeat(baseline);
        return raw.split('\n').map((line, index) => prefix + (index && line.startsWith(previous) ? line.slice(baseline) : line)).join('\n');
    }
    function print(node, depth) {
        const raw = node.loc.source;
        const prefix = ' '.repeat(depth * 4);
        if (node.type !== 1) return lines(raw, node.loc.start.column - 1, depth);
        // Keep literal code/text whitespace and mixed inline prose intact.
        if (['pre', 'textarea', 'script', 'style'].includes(node.tag) || node.props.some(prop => prop.type === 7 && prop.name === 'pre' || prop.type === 6 && prop.name === 'v-pre')) return prefix + raw;
        const children = node.children.filter(child => child.type !== 2 || child.content.trim());
        if (!children.some(child => child.type === 1) || children.some(child => child.type !== 1 && child.type !== 3)) return lines(raw, node.loc.start.column - 1, depth);
        const lastProp = node.props.at(-1);
        const openingEnd = source.indexOf('>', lastProp?.loc.end.offset ?? node.loc.start.offset) + 1;
        const opening = source.slice(node.loc.start.offset, openingEnd);
        const closing = raw.slice(raw.lastIndexOf('</'));
        return [lines(opening, node.loc.start.column - 1, depth), ...children.map(child => print(child, depth + 1)), prefix + closing].join('\n');
    }
    return tree.children.filter(node => node.type !== 2 || node.content.trim()).map(node => print(node, level)).join('\n');
}

// Documentation formatting happens at authoring/generation time, never in the
// renderer. These options also apply to files used as the real demo source.
export async function formatDemoSource(source) {
    const parser = source.trimStart().startsWith('<') ? 'vue' : /^[.#@][\s\S]*?\{/.test(source.trimStart()) ? 'css' : 'babel-ts';
    const formatted = await format(source, {
        parser,
        tabWidth: 4,
        useTabs: false,
        printWidth: 100,
        singleQuote: true,
        trailingComma: 'es5',
        htmlWhitespaceSensitivity: 'ignore',
        vueIndentScriptAndStyle: false,
        endOfLine: 'lf',
    });
    if (parser !== 'vue') return formatted;
    const { descriptor } = parseSfc(formatted);
    if (descriptor.template) {
        const block = descriptor.template;
        return formatted.slice(0, block.loc.start.offset) + '\n' + expandTemplate(block.content, 1) + '\n' + formatted.slice(block.loc.end.offset);
    }
    if (descriptor.script || descriptor.scriptSetup || descriptor.styles.length) return formatted;
    return expandTemplate(formatted, 0) + '\n';
}

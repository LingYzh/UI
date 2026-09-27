import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import taskLists from 'markdown-it-task-lists';
import deflist from 'markdown-it-deflist';
import mark from 'markdown-it-mark';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';

export interface MarkdownBlock {
    key: string;
    kind: 'html' | 'table' | 'code' | 'mermaid' | 'math';
    html: string;
    code: string;
    language: string;
    complete: boolean;
}

export function safeMarkdownUrl(value: string, image = false): boolean {
    return (image ? /^https?:\/\//i : /^(?:https?:\/\/|mailto:)/i).test(value.trim()) && !/[\u0000-\u0020\u007f]/.test(value);
}

const markdown = new MarkdownIt({ html: true, linkify: true, breaks: false })
    .use(footnote).use(taskLists, { enabled: false }).use(deflist).use(mark).use(sub).use(sup);
markdown.validateLink = value => value.startsWith('#') || safeMarkdownUrl(value);

// Math is parsed as inert placeholders. Only our bounded, trust:false KaTeX renderer
// can create math markup, after model-authored HTML has passed the sanitizer.
markdown.inline.ruler.before('escape', 'math_inline', (state, silent) => {
    const opening = state.src.startsWith('\\(', state.pos) ? '\\(' : state.src[state.pos] === '$' && state.src[state.pos + 1] !== '$' ? '$' : '';
    if (!opening || (opening === '$' && /\s/.test(state.src[state.pos + 1] || ''))) return false;
    const closing = opening === '$' ? '$' : '\\)';
    let end = state.pos + opening.length;
    while ((end = state.src.indexOf(closing, end)) >= 0) {
        if (state.src[end - 1] !== '\\' && (opening !== '$' || !/\s/.test(state.src[end - 1]))) break;
        end += closing.length;
    }
    if (end < 0) return false;
    if (!silent) {
        const token = state.push('math_inline', 'span', 0);
        token.content = state.src.slice(state.pos + opening.length, end);
    }
    state.pos = end + closing.length;
    return true;
});
markdown.block.ruler.before('fence', 'math_block', (state, start, end, silent) => {
    const line = state.src.slice(state.bMarks[start] + state.tShift[start], state.eMarks[start]);
    const opening = line.startsWith('$$') ? '$$' : line.startsWith('\\[') ? '\\[' : '';
    if (!opening) return false;
    const closing = opening === '$$' ? '$$' : '\\]';
    let next = start;
    let content = line.slice(opening.length);
    if (!content.endsWith(closing)) {
        while (++next < end) {
            const nextLine = state.src.slice(state.bMarks[next] + state.tShift[next], state.eMarks[next]);
            content += '\n' + nextLine;
            if (nextLine.trimEnd().endsWith(closing)) break;
        }
        if (next >= end) return false;
    }
    if (silent) return true;
    const token = state.push('math_block', 'div', 0);
    token.content = content.trimEnd().slice(0, -closing.length).trim();
    token.map = [start, next + 1];
    state.line = next + 1;
    return true;
});
const mathHtml = (formula: string, display: boolean) => `<${display ? 'div' : 'span'} class="ui-math-source" data-ui-math="${markdown.utils.escapeHtml(formula)}" data-display="${display}">${markdown.utils.escapeHtml(formula)}</${display ? 'div' : 'span'}>`;
markdown.renderer.rules.math_inline = (tokens, index) => mathHtml(tokens[index].content, false);
markdown.renderer.rules.math_block = (tokens, index) => mathHtml(tokens[index].content, true);
const codeHtml = (code: string, language: string) => `<div class="ui-markdown-code-source" data-ui-code="${markdown.utils.escapeHtml(code)}" data-language="${markdown.utils.escapeHtml(language || 'text')}"></div>`;
markdown.renderer.rules.fence = (tokens, index) => codeHtml(tokens[index].content, tokens[index].info.trim().split(/\s+/)[0]);
markdown.renderer.rules.code_block = (tokens, index) => codeHtml(tokens[index].content, 'text');

export function parseMarkdown(source: string, streaming = false): MarkdownBlock[] {
    const env = {};
    const tokens = markdown.parse(source, env);
    const lines = source.split('\n');
    const blocks: MarkdownBlock[] = [];
    for (let index = 0; index < tokens.length;) {
        const token = tokens[index];
        let stop = index + 1;
        if (token.nesting === 1) {
            let depth = 1;
            while (stop < tokens.length && depth) depth += tokens[stop++].nesting;
        }
        // CommonMark parses HTML container boundaries as separate blocks when
        // blank lines enable Markdown inside details. Keep the semantic parent
        // together so sanitizing blocks never auto-closes it prematurely.
        if (token.type === 'html_block' && /<details(?:\s|>)/i.test(token.content)) {
            let depth = (token.content.match(/<details(?:\s|>)/gi)?.length || 0) - (token.content.match(/<\/details\s*>/gi)?.length || 0);
            while (stop < tokens.length && depth > 0) {
                const next = tokens[stop++];
                if (next.type === 'html_block') depth += (next.content.match(/<details(?:\s|>)/gi)?.length || 0) - (next.content.match(/<\/details\s*>/gi)?.length || 0);
            }
        }
        const kind = token.type === 'fence' || token.type === 'code_block' ? (token.info.trim() === 'mermaid' ? 'mermaid' : 'code') : token.type === 'table_open' ? 'table' : token.type === 'math_block' ? 'math' : 'html';
        let complete = true;
        if (streaming && token.type === 'fence' && token.map) {
            const last = lines[token.map[1] - 1]?.trim() || '';
            complete = new RegExp(`^${token.markup[0]}{${token.markup.length},}\\s*$`).test(last) && token.map[1] - 1 > token.map[0];
        }
        blocks.push({ key: `${blocks.length}-${token.type}`, kind, html: kind === 'code' || kind === 'mermaid' ? '' : markdown.renderer.render(tokens.slice(index, stop), markdown.options, env), code: token.content, language: token.info.trim().split(/\s+/)[0] || 'text', complete });
        index = stop;
    }
    return blocks;
}

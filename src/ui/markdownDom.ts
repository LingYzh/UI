import DOMPurify from 'dompurify';
import { safeMarkdownUrl } from './markdown';

const tags = ['p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 's', 'del', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'dl', 'dt', 'dd', 'details', 'summary', 'mark', 'sub', 'sup', 'span', 'div', 'section', 'input'];

export function sanitizedMarkdown(html: string, prefix: string): DocumentFragment {
    const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: tags,
        ALLOWED_ATTR: ['href', 'src', 'title', 'alt', 'id', 'class', 'start', 'colspan', 'rowspan', 'align', 'type', 'checked', 'disabled', 'open', 'data-ui-math', 'data-display', 'data-ui-code', 'data-language', 'aria-label'],
        ALLOW_DATA_ATTR: false,
        RETURN_DOM_FRAGMENT: true,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form'],
        FORBID_ATTR: ['style', 'name', 'srcset', 'target']
    });
    clean.querySelectorAll('[class]').forEach(element => {
        const permitted = Array.from(element.classList).filter(name => /^(?:footnote(?:s|-ref|-backref|-item|-sep)?|task-list-item(?:-checkbox)?|contains-task-list|ui-math-source|ui-markdown-code-source)$/.test(name));
        if (permitted.length) element.setAttribute('class', permitted.join(' '));
        else element.removeAttribute('class');
    });
    clean.querySelectorAll('[id]').forEach(element => { element.id = `${prefix}-${element.id}`; });
    clean.querySelectorAll('a').forEach(element => {
        const href = element.getAttribute('href') || '';
        if (href.startsWith('#')) element.setAttribute('href', `#${prefix}-${href.slice(1)}`);
        else if (!safeMarkdownUrl(href)) element.removeAttribute('href');
        else element.setAttribute('rel', 'noopener noreferrer');
    });
    clean.querySelectorAll('img').forEach(element => {
        if (!safeMarkdownUrl(element.getAttribute('src') || '', true)) element.removeAttribute('src');
        element.setAttribute('loading', 'lazy');
        element.setAttribute('referrerpolicy', 'no-referrer');
        element.setAttribute('decoding', 'async');
    });
    clean.querySelectorAll('input').forEach(element => {
        if (element.getAttribute('type') !== 'checkbox') element.remove();
        else element.setAttribute('disabled', '');
    });
    return clean;
}

// Keep existing text/element nodes when a streamed suffix changes. This also
// retains user selections, open details, code scroll positions and focus.
export function patchMarkdownDom(parent: Node, incoming: Node): void {
    const wanted = Array.from(incoming.childNodes);
    wanted.forEach((next, index) => {
        const previous = parent.childNodes[index];
        if (!previous) { parent.appendChild(next.cloneNode(true)); return; }
        if (previous.nodeType !== next.nodeType || (previous instanceof Element && next instanceof Element && previous.tagName !== next.tagName)) {
            parent.replaceChild(next.cloneNode(true), previous);
            return;
        }
        if (previous.nodeType === Node.TEXT_NODE) {
            const oldText = previous.nodeValue || '';
            const newText = next.nodeValue || '';
            if (newText.startsWith(oldText)) (previous as Text).appendData(newText.slice(oldText.length));
            else if (oldText !== newText) previous.nodeValue = newText;
            return;
        }
        if (previous instanceof Element && next instanceof Element) {
            if (previous.hasAttribute('data-math-rendered') && previous.getAttribute('data-ui-math') === next.getAttribute('data-ui-math')) return;
            if (previous.hasAttribute('data-code-rendered') && previous.getAttribute('data-ui-code') === next.getAttribute('data-ui-code') && previous.getAttribute('data-language') === next.getAttribute('data-language')) return;
            Array.from(previous.attributes).forEach(attribute => {
                if (!next.hasAttribute(attribute.name) && !(previous.tagName === 'DETAILS' && attribute.name === 'open') && !(attribute.name === 'data-code-rendered' && next.hasAttribute('data-ui-code'))) previous.removeAttribute(attribute.name);
            });
            Array.from(next.attributes).forEach(attribute => {
                if (previous.getAttribute(attribute.name) !== attribute.value) previous.setAttribute(attribute.name, attribute.value);
            });
            if (previous.hasAttribute('data-code-rendered') && next.hasAttribute('data-ui-code')) return;
            patchMarkdownDom(previous, next);
        }
    });
    while (parent.childNodes.length > wanted.length) parent.removeChild(parent.lastChild!);
}

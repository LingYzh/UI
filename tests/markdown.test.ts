import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, safeMarkdownUrl } from '../src/ui/markdown';
import { StreamingTextPacer, isGraphemeBoundary, safeStreamingLength } from '../src/ui/streamingTextPacer';

test('Markdown supports GFM and rich extensions with global references', () => {
    const source = '# Title\n\n**bold** ~~deleted~~ ==mark== H~2~O x^2^ [link][ref] $x^2$\n\n- [x] done\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\nTerm\n: definition\n\nFootnote[^a].\n\n[^a]: note\n\n[ref]: https://example.com';
    const blocks = parseMarkdown(source);
    const html = blocks.map(block => block.html).join('');
    for (const fragment of ['<h1>', '<strong>', '<s>', '<mark>', '<sub>', '<sup>', 'https://example.com', 'data-ui-math', 'checkbox', '<table>', '<dl>', 'footnote-ref']) assert.ok(html.includes(fragment), fragment);
});

test('streaming fence remains code and details keeps nested Markdown and code in its parent', () => {
    const incomplete = parseMarkdown('First paragraph.\n\n```ts\nconst value = 1', true);
    assert.equal(incomplete[1].kind, 'code');
    assert.equal(incomplete[1].complete, false);
    const complete = parseMarkdown('First paragraph.\n\n```ts\nconst value = 1\n```\n', true);
    assert.equal(complete[1].complete, true);
    assert.equal(incomplete[0].key, complete[0].key);
    const details = parseMarkdown('<details><summary>More</summary>\n\n**inner**\n\n```js\nconst a = 1;\n```\n\n</details>');
    assert.equal(details.length, 1);
    assert.match(details[0].html, /<details>[\s\S]*<strong>inner<\/strong>[\s\S]*data-ui-code=[\s\S]*<\/details>/);
});

test('URLs explicitly allow only safe navigation and remote images', () => {
    for (const url of ['https://example.com/a', 'http://example.com', 'mailto:user@example.com']) assert.ok(safeMarkdownUrl(url));
    for (const url of ['javascript:alert(1)', 'file:///D:/secret', '/relative', 'data:image/svg+xml,abc', 'https://example.com\n.evil']) assert.equal(safeMarkdownUrl(url), false);
    assert.equal(safeMarkdownUrl('mailto:user@example.com', true), false);
});

test('mobile pacing has 200 ms observation buffer, monotonic output and bounded finish', () => {
    const pacer = new StreamingTextPacer();
    const text = 'A'.repeat(100);
    assert.equal(pacer.next(text, 0, true), '');
    assert.equal(pacer.next(text, 199, true), '');
    assert.equal(pacer.next(text, 200, true), '');
    const partial = pacer.next(text, 250, true);
    assert.ok(partial.length > 0 && partial.length < text.length);
    let previous = pacer.next(text, 260, false);
    assert.ok(previous.length < text.length);
    for (let time = 292; time < 460; time += 32) {
        const next = pacer.next(text, time, false);
        assert.ok(next.startsWith(previous));
        previous = next;
    }
    assert.equal(pacer.next(text, 460, false), text);
    assert.equal(pacer.hasPending, false);
});

test('mobile pacing synchronizes replacement, huge bursts, reduced motion and idle resume', () => {
    const pacer = new StreamingTextPacer('history');
    assert.equal(pacer.next('history', 0, true), 'history');
    assert.equal(pacer.next('history appended', 32, true), 'history');
    assert.equal(pacer.next('replacement', 64, true), 'replacement');
    assert.equal(pacer.next('Z'.repeat(5000), 96, true), 'Z'.repeat(5000));
    assert.equal(pacer.next('Z'.repeat(5010), 1100, true), 'Z'.repeat(5010));
    assert.equal(pacer.next('Z'.repeat(5020), 1132, true, true), 'Z'.repeat(5020));
});

test('Unicode pacing preserves surrogate, combining, ZWJ and regional indicator boundaries', () => {
    const text = 'Text 😀 e\u0301 ❤️ 👍🏽 👨‍👩‍👧‍👦 🇨🇳 end.';
    const pacer = new StreamingTextPacer();
    pacer.next(text, 0, true);
    let shown = '';
    for (let time = 200; time < 2500; time += 32) {
        const next = pacer.next(text, time, true);
        assert.ok(next.startsWith(shown));
        assert.ok(isGraphemeBoundary(text, next.length));
        assert.ok(!/[\ud800-\udbff]$/.test(next));
        shown = next;
    }
    assert.equal(shown, text);
    assert.equal(safeStreamingLength('Prefix \ud83d'), 7);
    assert.equal(safeStreamingLength('Prefix 🇨'), 7);
    assert.equal(safeStreamingLength('Prefix 👨‍'), 7);
});

for (const tier of [40, 70, 120, 300]) test(`mobile throughput ${tier} simulated tokens/s bounds backlog and drains exactly`, () => {
    const pacer = new StreamingTextPacer();
    let source = '';
    let previous = '';
    let arrival = 0;
    let maxBacklog = 0;
    let exhaustions = 0;
    for (let now = 0; now <= 10000; now += 48) {
        while (arrival <= now && arrival < 10000) { source += 'Word'.repeat(tier / 10); arrival += 100; }
        const shown = pacer.next(source, now, true);
        assert.ok(shown.startsWith(previous));
        const pending = source.length - shown.length;
        maxBacklog = Math.max(maxBacklog, pending / (tier * 4 / 1000));
        if (now >= 500 && now < 9800 && !pending) exhaustions++;
        previous = shown;
    }
    assert.ok(maxBacklog <= 600, `${maxBacklog} ms`);
    assert.equal(exhaustions, 0);
    for (let now = 10032; now <= 10300; now += 32) previous = pacer.next(source, now, false);
    assert.equal(previous, source);
});

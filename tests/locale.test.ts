import test from 'node:test';
import assert from 'node:assert/strict';
import { getLocale, setLocale, uiText, uiMessages, type UiMessageKey } from '../src/ui/locale';
import { collapseDiffContext, lineDiff } from '../src/ui/line-diff';

// 每个用例结束前显式复位为 zh，避免测试间语言状态互相污染（current 是模块级单例 ref）。
test('zh 与 en 的键集合双向完全相同', () => {
    const zhKeys = Object.keys(uiMessages.zh);
    const enKeys = Object.keys(uiMessages.en);
    assert.deepEqual([...zhKeys].sort(), [...enKeys].sort());
});

test('每个语言的每个值都是非空字符串', () => {
    for (const locale of ['zh', 'en'] as const) {
        for (const [key, value] of Object.entries(uiMessages[locale])) {
            assert.equal(typeof value, 'string', `${locale}.${key} should be a string`);
            assert.ok(value.length > 0, `${locale}.${key} should not be empty`);
        }
    }
});

test('setLocale 切换后 uiText 返回对应语言', () => {
    setLocale('zh');
    assert.equal(uiText('common.close'), '关闭');
    setLocale('en');
    assert.equal(uiText('common.close'), 'Close');
    setLocale('zh');
    assert.equal(uiText('common.close'), '关闭');
});

test('参数替换，包括未提供的参数保留 {name} 原样', () => {
    setLocale('zh');
    assert.equal(uiText('pagination.page', { page: 3 }), '第 3 页');
    // diff.gap 的模板是 '省略 {count} 行未改动内容'；不传 params 时占位符原样保留。
    assert.equal(uiText('diff.gap' as UiMessageKey), '省略 {count} 行未改动内容');
    // 传入的 params 里没有模板需要的键时，未匹配的占位符同样原样保留。
    assert.equal(uiText('pagination.page', { other: 1 }), '第 {page} 页');
});

test('setLocale 传入非法值时回退为 zh', () => {
    setLocale('en');
    // @ts-expect-error 故意传入非法值验证运行期回退行为
    setLocale('fr');
    assert.equal(getLocale(), 'zh');
    setLocale('zh');
});

test('line-diff 的 gap 文本随语言变化', () => {
    const before = Array.from({ length: 20 }, (_, i) => `line ${i}\n`).join('');
    const after = before.replace('line 10\n', 'changed\n');
    const rows = lineDiff(before, after).rows;

    setLocale('zh');
    const zhGap = collapseDiffContext(rows).find(row => row.kind === 'gap');
    assert.ok(zhGap);
    assert.match(zhGap!.text, /^省略 \d+ 行未改动内容$/);

    setLocale('en');
    const enGap = collapseDiffContext(rows).find(row => row.kind === 'gap');
    assert.ok(enGap);
    assert.match(enGap!.text, /^\d+ unchanged lines hidden$/);

    setLocale('zh');
});

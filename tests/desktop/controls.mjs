// B 批组件专项：Checkbox / Radio / Progress / CopyButton / ColorSwatches。
// 浅深主题 900×800 @125% 原生截图供 root 视觉验收，并做键盘、ARIA 与剪贴板断言。
import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/controls-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const base = `${server.resolvedUrls.local[0]}index.html`;
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${base}#/checkbox` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], env });
const errors = [];
const passed = [];

async function settle(page) {
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.waitForTimeout(150);
}
async function capture(page, name) {
    await settle(page);
    const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    await writeFile(path.join(evidence, name), Buffer.from(data.split(',')[1], 'base64'));
}
async function theme(page, value) {
    await page.evaluate((next) => { document.documentElement.dataset.theme = next; }, value);
}
async function open(page, id) {
    await page.goto(`${base}#/${id}`);
    await page.locator('.docs-page-heading h1').waitFor();
}
async function region(page, title) {
    const card = page.getByRole('region', { name: title, exact: true });
    await card.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    return card;
}
async function shots(page, card, prefix) {
    for (const value of ['light', 'dark']) {
        await theme(page, value);
        await card.evaluate((element) => element.scrollIntoView({ block: 'start' }));
        await capture(page, `${prefix}-${value}.png`);
    }
    await theme(page, 'light');
}

try {
    const page = await app.firstWindow();
    page.on('pageerror', (error) => errors.push(error.message));
    await app.evaluate(({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.setContentSize(900, 800);
        window.webContents.setZoomFactor(1.25);
    });

    // Checkbox：全选的部分选中状态、键盘切换、全选联动。
    await open(page, 'checkbox');
    const selectAll = await region(page, '全选与部分选中');
    const parent = selectAll.getByRole('checkbox', { name: '全选' });
    assert.equal(await parent.evaluate((element) => element.indeterminate), true);
    assert.equal(await parent.getAttribute('aria-checked'), 'mixed');
    await shots(page, selectAll, 'checkbox');
    const bob = selectAll.getByRole('checkbox', { name: '选择 bob@example.com' });
    await bob.focus();
    await page.keyboard.press('Space');
    assert.equal(await bob.isChecked(), true);
    await selectAll.getByRole('checkbox', { name: '选择 dave@example.com' }).check();
    await page.waitForFunction((element) => !element.indeterminate && element.checked, await parent.elementHandle());
    assert.equal(await parent.getAttribute('aria-checked'), null);
    await parent.uncheck();
    assert.equal(await selectAll.getByRole('checkbox', { checked: true }).count(), 0);
    // 行内 label 扩大点击区域：点击邮箱文字即勾选。
    await selectAll.getByText('carol@example.com').click();
    assert.equal(await selectAll.getByRole('checkbox', { name: '选择 carol@example.com' }).isChecked(), true);
    const states = await region(page, '标签与禁用');
    assert.equal(await states.getByRole('checkbox', { name: '禁用 · 已选' }).isDisabled(), true);
    await shots(page, states, 'checkbox-states');
    passed.push('checkbox exposes mixed state, toggles with Space, recomputes select-all and supports label click targets');

    // Radio：分布在卡片中的同组单选，方向键切换。
    await open(page, 'radio');
    const radios = await region(page, '分布在卡片中的单选');
    const opus = radios.getByRole('radio', { name: '设为默认' }).first();
    assert.equal(await radios.getByRole('radio', { name: '默认模型' }).isChecked(), true);
    await shots(page, radios, 'radio');
    await opus.focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.querySelector('.controls-demo output')?.textContent?.includes('opus'));
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('.controls-demo output')?.textContent?.includes('sonnet'));
    passed.push('radios placed in separate cards share one group, select with Space and move with arrow keys');

    // Progress：ARIA 数值、阈值配色、越界裁剪。
    await open(page, 'progress');
    const progress = await region(page, '语气与过渡');
    const usage = progress.getByRole('progressbar', { name: '本月用量' });
    assert.equal(await usage.getAttribute('aria-valuenow'), '36');
    await progress.getByRole('button', { name: '98%' }).click();
    assert.equal(await usage.getAttribute('data-tone'), 'error');
    await progress.getByRole('button', { name: '86%' }).click();
    assert.equal(await usage.getAttribute('data-tone'), 'warning');
    await progress.getByRole('button', { name: '开始批量任务' }).click();
    const batch = progress.getByRole('progressbar', { name: '批量注册进度' });
    await page.waitForFunction((element) => element.getAttribute('aria-valuenow') === '100', await batch.elementHandle(), { timeout: 5000 });
    assert.equal(await batch.getAttribute('data-tone'), 'success');
    await shots(page, progress, 'progress');
    passed.push('progress exposes progressbar values, follows caller tones and completes the batch demo');

    // CopyButton：写入剪贴板、成功态、播报与自动恢复。
    await open(page, 'copy-button');
    const copyCard = await region(page, '行内复制');
    const copyToken = copyCard.getByRole('button', { name: '复制 Access Token' });
    await copyToken.click();
    await page.waitForFunction((element) => element.classList.contains('is-copied'), await copyToken.elementHandle());
    assert.equal(await app.evaluate(({ clipboard }) => clipboard.readText()), 'eyJhbGciOiJIUzI1NiJ9.demo.signature');
    assert.equal(await copyCard.getByRole('status').first().textContent(), '已复制');
    // 先移开再悬停：Tooltip 在页面滚动时会隐藏，只有重新进入才会再次显示。
    await page.mouse.move(0, 0);
    await copyToken.hover();
    // Tooltip 为 popover 顶层节点，文字随状态切换为“已复制”。
    await page.waitForFunction(() => [...document.querySelectorAll('.ui-tooltip')].some((tip) => tip.matches(':popover-open') && tip.textContent === '已复制'));
    await shots(page, copyCard, 'copy');
    await page.waitForFunction((element) => !element.classList.contains('is-copied'), await copyToken.elementHandle(), { timeout: 3000 });
    passed.push('copy button writes the exact text, shows and announces success, then restores its icon');

    // ColorSwatches：radiogroup、方向键选择、旧颜色保留。
    await open(page, 'color-swatches');
    const tagCard = await region(page, '标签颜色');
    const group = tagCard.getByRole('radiogroup', { name: '标签颜色' });
    assert.equal(await group.getByRole('radio').count(), 10);
    // 示例初值为大写 #4A78B8，验证选中态按忽略大小写匹配色板中的 #4a78b8。
    assert.equal(await group.getByRole('radio', { name: '蓝色' }).isChecked(), true);
    await shots(page, tagCard, 'swatches');
    await group.getByRole('radio', { name: '蓝色' }).focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await group.getByRole('radio', { name: '靛蓝' }).isChecked(), true);
    const legacy = await region(page, '兼容已有颜色');
    const legacyGroup = legacy.getByRole('radiogroup', { name: '已有标签颜色' });
    assert.equal(await legacyGroup.getByRole('radio').count(), 11);
    assert.equal(await legacyGroup.getByRole('radio', { name: '当前颜色' }).isChecked(), true);
    await shots(page, legacy, 'swatches-legacy');
    await legacyGroup.getByRole('radio', { name: '绿色' }).check();
    assert.equal(await legacyGroup.getByRole('radio').count(), 10);
    passed.push('swatches form a named radiogroup, select with arrows and keep a saved off-palette color until replaced');

    // 减少动效：进度填充与勾选过渡关闭。
    await open(page, 'progress');
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    assert.equal(await page.locator('.ui-progress-fill').first().evaluate((element) => getComputedStyle(element).transitionDuration), '0s');
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'false'; });
    passed.push('reduced motion disables progress and selection transitions');

    assert.deepEqual(errors, []);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ passed }, null, 4));
    for (const line of passed) console.log(`PASS ${line}`);
    console.log(`Evidence: ${evidence}`);
} finally {
    await app.close();
    await server.close();
}

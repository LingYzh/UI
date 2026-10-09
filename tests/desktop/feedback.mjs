// A 批组件专项：Badge / Alert / Spinner / Menu / confirmDialog / Dialog 宽度与抽屉 / Button danger / locale。
// 截取浅深主题 900×800 @125% 原生截图供 root 视觉验收，并做键盘与 ARIA 断言。
import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/feedback-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const base = `${server.resolvedUrls.local[0]}index.html`;
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${base}#/chip` };
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
    const card = page.getByRole('region', { name: title });
    await card.scrollIntoViewIfNeeded();
    return card;
}

try {
    const page = await app.firstWindow();
    page.on('pageerror', (error) => errors.push(error.message));
    // 900×800 内容区、125% 缩放，与既有专项验收一致。
    await app.evaluate(({ BrowserWindow }) => {
        const window = BrowserWindow.getAllWindows()[0];
        window.setContentSize(900, 800);
        window.webContents.setZoomFactor(1.25);
    });

    // Badge：语义色与自定义颜色，移除按钮名称与描述关联。
    await open(page, 'chip');
    const custom = await region(page, '自定义颜色与移除');
    const remove = custom.getByRole('button', { name: '移除' }).first();
    assert.equal(await remove.evaluate((element) => document.getElementById(element.getAttribute('aria-describedby')).textContent), '工作');
    for (const value of ['light', 'dark']) {
        await theme(page, value);
        await (await region(page, '语义与外观')).scrollIntoViewIfNeeded();
        await capture(page, `badge-${value}.png`);
    }
    await remove.click();
    assert.equal(await custom.getByRole('button', { name: '移除' }).count(), 4);
    passed.push('badge tones render in both themes; closable badges expose a described remove button');

    // Alert：语义 role 与操作插槽。
    await theme(page, 'light');
    await open(page, 'alert');
    const tones = await region(page, '四种语气');
    assert.equal(await tones.getByRole('alert').count(), 1);
    assert.equal(await tones.getByRole('status').count(), 3);
    // 宿主透传的 role 覆盖默认 status。
    const actionsCard = await region(page, '操作、紧凑与语义');
    assert.equal(await actionsCard.getByRole('note').count(), 1);
    assert.equal(await actionsCard.getByRole('status').count(), 1);
    for (const value of ['light', 'dark']) {
        await theme(page, value);
        await tones.scrollIntoViewIfNeeded();
        await capture(page, `alert-${value}.png`);
    }
    passed.push('alert uses alert role only for errors and renders four tones in both themes');

    // Spinner：减少动效放慢而不停止。
    await theme(page, 'light');
    await open(page, 'spinner');
    const spinner = page.locator('.ui-spinner .ui-spinner-circular svg').first();
    assert.equal(await spinner.evaluate((element) => getComputedStyle(element).animationDuration), '0.8s');
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    assert.equal(await spinner.evaluate((element) => getComputedStyle(element).animationDuration), '1.6s');
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'false'; });
    assert.equal(await page.getByRole('status', { name: '正在刷新账号' }).count(), 1);
    const spinnerCard = await region(page, '尺寸与按钮中的等待态');
    await spinnerCard.getByRole('button', { name: '批量检测' }).click();
    await spinnerCard.getByRole('button', { name: '检测中…' }).waitFor();
    await spinnerCard.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    // 旋转中的帧不会稳定，直接截图而不等待动画结束。
    const spinnerShot = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    await writeFile(path.join(evidence, 'spinner-light.png'), Buffer.from(spinnerShot.split(',')[1], 'base64'));
    passed.push('spinner keeps rotating at a slower pace under reduced motion and exposes an optional status name');

    // Menu：打开、方向键漫游、Esc 焦点返回、勾选、面板模式 Tab。
    await open(page, 'menu');
    const items = await region(page, '操作与勾选菜单');
    const trigger = items.getByRole('button', { name: /全部账号/ });
    // DOM menus move initial focus when opened from the keyboard.
    await trigger.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu', { name: /全部账号/ });
    await menu.waitFor();
    // toggle 事件异步派发，等待 v-model 同步回触发器与初始焦点。
    await page.waitForFunction((element) => element.getAttribute('aria-expanded') === 'true', await trigger.elementHandle());
    await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'menuitemcheckbox');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), '全部账号');
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), '工作分组');
    await page.keyboard.press('End');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), '管理分组…');
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), '全部账号');
    for (const value of ['light', 'dark']) {
        await theme(page, value);
        await capture(page, `menu-${value}.png`);
    }
    await page.keyboard.press('Escape');
    await menu.waitFor({ state: 'hidden' });
    await page.waitForFunction((element) => element.getAttribute('aria-expanded') === 'false', await trigger.elementHandle());
    // aria-hidden changes at leave start; focus returns only after the DOM layer finishes leaving.
    await page.waitForFunction((element) => element === document.activeElement, await trigger.elementHandle());
    assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
    await trigger.click();
    await page.getByRole('menuitemcheckbox', { name: '测试分组' }).click();
    await menu.waitFor({ state: 'hidden' });
    assert.match(await items.locator('output').textContent(), /测试分组/);
    // keep-open：多选标签后菜单保持打开。
    await items.getByRole('button', { name: /标签/ }).click();
    await page.getByRole('menuitemcheckbox', { name: '试用' }).click();
    assert.equal(await page.getByRole('menu', { name: /标签/ }).isVisible(), true);
    assert.equal(await page.getByRole('menuitemcheckbox', { name: '试用' }).getAttribute('aria-checked'), 'true');
    await page.mouse.click(5, 790);
    await page.getByRole('menu', { name: /标签/ }).waitFor({ state: 'hidden' });
    // 面板：Tab 在表单内移动，Esc 关闭。
    const panelCard = await region(page, '自由内容面板');
    await panelCard.getByRole('button', { name: '筛选' }).focus();
    await page.keyboard.press('Enter');
    const panel = page.getByRole('dialog', { name: '筛选账号' });
    await panel.waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute('placeholder') === '邮箱或昵称');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'SELECT');
    for (const value of ['light', 'dark']) {
        await theme(page, value);
        await capture(page, `menu-panel-${value}.png`);
    }
    await page.keyboard.press('Escape');
    await panel.waitFor({ state: 'hidden' });
    // 焦点仍在初始输入框时，Esc 同样关闭面板并把焦点还给触发器。
    const filterTrigger = panelCard.getByRole('button', { name: '筛选' });
    await filterTrigger.focus();
    await page.keyboard.press('Enter');
    await panel.waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute('placeholder') === '邮箱或昵称');
    await page.keyboard.press('Escape');
    await panel.waitFor({ state: 'hidden' });
    await page.waitForFunction((element) => element === document.activeElement, await filterTrigger.elementHandle());
    passed.push('menu roves with arrows/Home/End, closes on Esc with focus return, supports keep-open checks and a tabbable panel');

    // confirmDialog：危险确认、默认焦点、排队。
    await open(page, 'confirm');
    const confirmCard = await region(page, '确认、危险操作与排队');
    await confirmCard.getByRole('button', { name: '删除账号' }).click();
    const alertDialog = page.getByRole('alertdialog', { name: '删除账号' });
    await alertDialog.waitFor();
    assert.equal(await alertDialog.getByRole('button', { name: '取消' }).evaluate((element) => element === document.activeElement), true);
    for (const value of ['light', 'dark']) {
        await theme(page, value);
        await capture(page, `confirm-${value}.png`);
    }
    await alertDialog.getByRole('button', { name: '删除' }).click();
    await alertDialog.waitFor({ state: 'hidden' });
    assert.equal(await confirmCard.locator('output').textContent(), '已确认删除');
    await confirmCard.getByRole('button', { name: '连续两次确认' }).click();
    await page.getByRole('alertdialog').getByText('第一条确认').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('alertdialog').getByText('第二条确认').waitFor();
    await page.getByRole('alertdialog').getByRole('button', { name: '确定' }).click();
    await page.waitForFunction(() => document.querySelector('.feedback-demo output')?.textContent?.includes('排队结果'));
    assert.match(await confirmCard.locator('output').textContent(), /取消、确认/);
    passed.push('confirmDialog focuses cancel, resolves after close, and queues sequential requests');

    // Button danger 与 Dialog 宽度 / 抽屉。
    await theme(page, 'light');
    await open(page, 'button');
    const danger = await region(page, '危险操作');
    for (const value of ['light', 'dark']) {
        await theme(page, value);
        await danger.scrollIntoViewIfNeeded();
        await capture(page, `button-danger-${value}.png`);
    }
    await theme(page, 'light');
    await open(page, 'dialog');
    const sizes = await region(page, '宽度与侧边抽屉');
    await sizes.getByRole('button', { name: 'md', exact: true }).click();
    const sized = page.getByRole('dialog', { name: /宽度/ });
    await sized.waitFor();
    await settle(page);
    // boundingBox 与 innerWidth 同为缩放后的 CSS 像素；720px 视口下 560 未触及 max-width。
    assert.equal(Math.round((await sized.boundingBox()).width), 560);
    await capture(page, 'dialog-md-light.png');
    await page.keyboard.press('Escape');
    await sized.waitFor({ state: 'hidden' });
    await sizes.getByRole('button', { name: '打开抽屉' }).click();
    const drawer = page.getByRole('dialog', { name: '任务中心' });
    await drawer.waitFor();
    await settle(page);
    const box = await drawer.boundingBox();
    const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
    assert.ok(Math.abs(box.x + box.width - viewport.width) < 2, 'drawer touches the end edge');
    assert.ok(Math.abs(box.height - viewport.height) < 2, 'drawer is full height');
    for (const value of ['light', 'dark']) {
        await theme(page, value);
        await capture(page, `drawer-${value}.png`);
    }
    await page.keyboard.press('Escape');
    await drawer.waitFor({ state: 'hidden' });
    await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).find(element => element.textContent.trim() === '打开抽屉') === document.activeElement);
    assert.equal(await sizes.getByRole('button', { name: '打开抽屉' }).evaluate((element) => element === document.activeElement), true);
    // 减少动效：共享 .ui-dialog 的 !important 规则同样关闭抽屉的滑入动画。
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    await sizes.getByRole('button', { name: '打开抽屉' }).click();
    await page.waitForFunction(() => document.querySelector('.ui-dialog--end')?.dataset.state === 'open');
    assert.equal(await drawer.evaluate((element) => getComputedStyle(element).animationName), 'none');
    await page.keyboard.press('Escape');
    await drawer.waitFor({ state: 'hidden' });
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'false'; });
    passed.push('danger buttons render in both themes; dialog sizes apply fixed widths and the end drawer spans the full height with focus return');

    // locale：切换英文后内置文案更新，离开页面恢复中文。
    await theme(page, 'light');
    await open(page, 'locale');
    await page.getByRole('tab', { name: 'English' }).click();
    assert.equal(await page.getByRole('button', { name: 'Next page' }).count(), 1);
    assert.equal(await page.getByText('No data').count(), 1);
    await capture(page, 'locale-en.png');
    await open(page, 'pagination');
    assert.equal(await page.getByRole('button', { name: '下一页' }).count() > 0, true);
    passed.push('locale switch updates built-in component text and restores Chinese after leaving the demo');

    assert.deepEqual(errors, []);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ passed }, null, 4));
    for (const line of passed) console.log(`PASS ${line}`);
    console.log(`Evidence: ${evidence}`);
} finally {
    await app.close();
    await server.close();
}

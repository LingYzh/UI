import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.join(root, 'artifacts/full-alignment/handoff-demos-protocols');
const fixture = path.join(evidence, 'fixture');
const reportPath = path.join(evidence, 'report.json');
const sourceFiles = [
    'src/docs-base.css',
    'src/ui/styles.css',
    'src/ui/data-components.css',
    'src/ui/layout-components.css',
    'src/ui/docs/docs.css',
    'src/ui/UList.vue',
    'src/ui/UTreeview.vue',
    'src/ui/UStepper.vue',
    'src/ui/UStepperActions.vue',
    'src/ui/UStepperItem.vue',
    'src/ui/UStepperVertical.vue',
    'src/ui/UStepperVerticalActions.vue',
    'src/ui/UStepperVerticalItem.vue',
    'src/ui/UStepperWindow.vue',
    'src/ui/UStepperWindowItem.vue',
    'src/ui/stepper-selection.ts',
    'src/ui/stepper-state.ts',
    'src/ui/docs/LiveExample.vue',
    'src/ui/docs/ListNavigationDemo.vue',
    'src/ui/docs/TreeFilterDemo.vue',
    'src/ui/docs/StepperItemsDemo.vue',
    'src/ui/docs/component-examples/stepper-vertical-actions.vue',
    'src/ui/docs/component-examples/stepper-vertical-item.vue'
];

await mkdir(fixture, { recursive: true });
await writeFile(path.join(fixture, 'index.html'), '<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><div id="app"></div><script type="module" src="./main.ts"></script>');
await writeFile(path.join(fixture, 'main.ts'), `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import Fixture from './Fixture.vue';
import '/src/ui/styles.css';
import '/src/docs-base.css';
import '/src/ui/docs/docs.css';
createApp(Fixture).use(createUI()).mount('#app');`);
await writeFile(path.join(fixture, 'Fixture.vue'), `<script setup>
import { reactive } from 'vue';
import { UApp } from '/src/ui/index.ts';
import LiveExample from '/src/ui/docs/LiveExample.vue';

const state = reactive({ example: 'list-navigation-protocols', dark: false });
window.handoffDemoFixture = { state };
</script>

<template>
    <UApp :theme="state.dark ? 'dark' : 'light'" :full-height="false" style="font-family: var(--font)">
        <LiveExample :example="state.example" />
    </UApp>
</template>`);

async function hashSources() {
    return Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')
    ])));
}

const report = {
    checks: [],
    screenshots: [],
    pageErrors: [],
    consoleIssues: [],
    windowIssues: [],
    sourceSha256Before: await hashSources()
};
const vite = await createServer({
    root,
    appType: 'mpa',
    cacheDir: path.join(evidence, 'vite-cache'),
    logLevel: 'error',
    optimizeDeps: {
        noDiscovery: true,
        entries: [path.relative(root, path.join(fixture, 'main.ts'))],
        include: [
            'highlight.js/lib/core',
            'markdown-it',
            'markdown-it-footnote',
            'markdown-it-task-lists',
            'markdown-it-deflist',
            'markdown-it-mark',
            'markdown-it-sub',
            'markdown-it-sup'
        ]
    },
    resolve: { dedupe: ['vue'] },
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } }
});

let browser;
let page;
try {
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'warning' || message.type() === 'error') {
            report.consoleIssues.push(`${message.type()}: ${message.text()}`);
        }
    });
    await page.addInitScript(() => {
        window.handoffDemoIssues = [];
        window.addEventListener('error', event => window.handoffDemoIssues.push(event.message));
        window.addEventListener('unhandledrejection', event => window.handoffDemoIssues.push(String(event.reason)));
    });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/artifacts/full-alignment/handoff-demos-protocols/fixture/index.html`);
    await page.locator('.ui-app').waitFor();

    async function selectExample(example, dark = false) {
        await page.evaluate(({ example, dark }) => {
            window.handoffDemoFixture.state.example = example;
            window.handoffDemoFixture.state.dark = dark;
            document.documentElement.style.zoom = '100%';
        }, { example, dark });
        await page.waitForFunction(dark => document.querySelector('.ui-app')?.dataset.theme === (dark ? 'dark' : 'light'), dark);
    }

    async function capture(name, { example, width = 1000, height = 800, dark = false, zoom = 100, prepare } = {}) {
        await page.setViewportSize({ width, height });
        await selectExample(example, dark);
        await page.evaluate(value => { document.documentElement.style.zoom = `${value}%`; }, zoom);
        if (prepare) await prepare();
        await page.locator('.live-example').waitFor();
        await page.waitForTimeout(300);
        const layout = await page.evaluate(() => {
            const demo = document.querySelector('.live-example');
            const rect = demo?.getBoundingClientRect();
            return {
                viewport: { width: innerWidth, height: innerHeight },
                document: { clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth },
                body: { clientWidth: document.body.clientWidth, scrollWidth: document.body.scrollWidth },
                demo: rect ? { left: rect.left, right: rect.right, width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 } : null
            };
        });
        assert.ok(layout.demo?.visible, `${name}: LiveExample is not visible`);
        assert.ok(layout.document.scrollWidth <= layout.document.clientWidth, `${name}: document horizontal overflow ${JSON.stringify(layout.document)}`);
        assert.ok(layout.body.scrollWidth <= layout.body.clientWidth, `${name}: body horizontal overflow ${JSON.stringify(layout.body)}`);
        assert.ok(layout.demo.left >= -1 && layout.demo.right <= layout.viewport.width + 1, `${name}: LiveExample extends outside the viewport ${JSON.stringify(layout.demo)}`);

        const file = `${name}.png`;
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(evidence, file), fullPage: true });
        report.screenshots.push({ file: path.join('artifacts/full-alignment/handoff-demos-protocols', file), example, width, height, dark, zoom, layout });
        report.checks.push(`${name}: visible with no horizontal overflow`);
    }

    await selectExample('list-navigation-protocols');
    const list = page.locator('.list-navigation-demo .ui-list');
    await list.waitFor();
    assert.equal(await list.getAttribute('data-navigation-strategy'), 'track');
    assert.equal(await list.getAttribute('tabindex'), '0');
    await list.focus();
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('.list-navigation-demo .ui-list')), true, 'track strategy must keep DOM focus on the list root');
    await list.press('End');
    assert.equal(await page.evaluate(() => {
        const root = document.querySelector('.list-navigation-demo .ui-list');
        return root?.getAttribute('aria-activedescendant') === document.querySelector('.list-navigation-demo [data-list-index="1"]')?.id;
    }), true, 'End should land on the last enabled row and skip the disabled archive row');
    await list.press('ArrowDown');
    assert.equal(await page.evaluate(() => {
        const root = document.querySelector('.list-navigation-demo .ui-list');
        return root?.getAttribute('aria-activedescendant') === document.querySelector('.list-navigation-demo [data-list-index="0"]')?.id;
    }), true, 'ArrowDown from the last enabled row should wrap to the first enabled row');
    await list.press('ArrowDown');
    await list.press('End');
    await list.press('Space');
    const settings = page.locator('.list-navigation-demo [data-list-index="1"]');
    assert.equal(await settings.getAttribute('aria-selected'), 'true', 'Space should select the tracked row');
    await list.press('Enter');
    assert.equal(await settings.getAttribute('aria-selected'), 'false', 'Enter should toggle selection for the tracked row');
    await settings.click();
    assert.equal(await settings.evaluate(element => element.classList.contains('is-active')), true, 'first activation click should activate the row');
    await settings.click();
    assert.equal(await settings.evaluate(element => element.classList.contains('is-active')), false, 'activating the same row again should cancel activation');
    report.checks.push('List: root retains DOM focus; End/ArrowDown skip disabled rows; Space/Enter toggle selection; repeated activation cancels');
    await capture('list-wide-1000', { example: 'list-navigation-protocols' });
    await settings.click();
    await capture('list-dark-390', { example: 'list-navigation-protocols', width: 390, height: 844, dark: true });
    await capture('list-zoom-125', { example: 'list-navigation-protocols', width: 1000, height: 800, zoom: 125 });

    await selectExample('tree-filter-protocols');
    const treeSearch = page.locator('.tree-filter-demo input').first();
    await treeSearch.waitFor();
    await treeSearch.fill('cafe');
    const cafeTitle = page.locator('.tree-filter-demo .ui-treeview-title').filter({ hasText: /^Café 说明$/ });
    await page.waitForFunction(() => {
        const titles = [...document.querySelectorAll('.tree-filter-demo .ui-treeview-title')].map(element => element.textContent?.trim());
        return titles.includes('Café 说明') && !titles.includes('设计规范');
    });
    assert.equal(await cafeTitle.isVisible(), true, 'accent-insensitive search should match Café for the query cafe');
    assert.equal(await page.locator('.tree-filter-demo .ui-treeview-title').filter({ hasText: /^设计规范$/ }).count(), 0, 'search should hide unrelated tree rows');
    const cafeRow = cafeTitle.locator('xpath=ancestor::*[@role="treeitem"][1]');
    await cafeRow.getByRole('button', { name: '选中', exact: true }).click();
    const treeStatus = page.locator('.tree-filter-status');
    await page.waitForFunction(() => document.querySelector('.tree-filter-status')?.textContent?.includes('已选中'), null, { timeout: 5000 });
    const selectedPath = (await treeStatus.textContent())?.trim() ?? '';
    assert.equal(selectedPath, 'group / cafe：已选中', `selection should display the payload path, received: ${selectedPath}`);
    await treeSearch.fill('no-such-resource');
    await page.locator('.tree-filter-demo .ui-treeview-empty').waitFor();
    await page.waitForFunction(() => document.querySelectorAll('.tree-filter-demo .ui-treeview [role="treeitem"]').length === 0);
    assert.equal(await page.locator('.tree-filter-demo .ui-treeview [role="treeitem"]').count(), 0, 'a non-matching query should leave no tree items');
    await page.getByLabel('暂停筛选').check();
    await page.locator('.tree-filter-demo .ui-treeview-title').filter({ hasText: /^设计规范$/ }).waitFor();
    assert.equal(await page.locator('.tree-filter-demo .ui-treeview-empty').count(), 0, 'pausing filtering should restore tree data while preserving the query');
    report.checks.push('Tree: cafe matches Café; action selection reports its full path; unmatched search shows no-data; pause filtering restores items');
    await treeSearch.fill('cafe');
    await page.getByLabel('暂停筛选').uncheck();
    await page.locator('.tree-filter-demo .ui-treeview-title').filter({ hasText: /^Café 说明$/ }).waitFor();
    await capture('tree-wide-1000', { example: 'tree-filter-protocols' });
    await capture('tree-dark-390', { example: 'tree-filter-protocols', width: 390, height: 844, dark: true });
    await capture('tree-zoom-125', { example: 'tree-filter-protocols', width: 1000, height: 800, zoom: 125 });

    await selectExample('stepper-items-protocols');
    const steppers = page.locator('.stepper-items-demo > .u-stepper');
    await steppers.nth(1).waitFor();
    const horizontal = steppers.nth(0);
    const vertical = steppers.nth(1);
    assert.equal(await horizontal.getByText('填写基本信息后继续。', { exact: true }).isVisible(), true, 'generated horizontal window should show the active item slot');
    const horizontalNext = horizontal.locator('.u-stepper-actions button').nth(1);
    await horizontalNext.click();
    await horizontal.getByText('确认内容可消除规则错误。', { exact: true }).waitFor();
    await horizontal.getByText('填写基本信息后继续。', { exact: true }).waitFor({ state: 'hidden' });
    const horizontalSecondHeader = horizontal.locator('.u-stepper-item').nth(1);
    assert.equal(await horizontalSecondHeader.evaluate(element => element.classList.contains('is-error')), true, 'failed rules should mark the horizontal second-step header as an error');
    assert.equal(await horizontalSecondHeader.evaluate(element => element.classList.contains('is-complete')), false, 'failed rules should not mark the horizontal second step complete');

    const verticalFirstNext = vertical.locator('.u-stepper-vertical-item').nth(0).locator('.u-stepper-actions button').nth(1);
    await verticalFirstNext.click();
    const verticalSecond = vertical.locator('.u-stepper-vertical-item').nth(1);
    await verticalSecond.locator('.u-stepper-item[aria-current="step"]').waitFor();
    const verticalSecondHeader = verticalSecond.locator('.u-stepper-item');
    assert.equal(await verticalSecondHeader.evaluate(element => element.classList.contains('is-error')), true, 'failed rules should mark the vertical second-step header as an error');
    assert.equal(await verticalSecondHeader.evaluate(element => element.classList.contains('is-complete')), false, 'failed rules should not mark the vertical second step complete');
    const verticalSecondNext = verticalSecond.locator('.u-stepper-actions button').nth(1);
    assert.equal(await verticalSecondNext.isDisabled(), true, 'failed rules should disable continuing from the second vertical step');
    report.checks.push('Stepper items: generated window content follows selection; horizontal and vertical failed rules expose error; vertical actions block continue');
    await capture('stepper-items-wide-1000', { example: 'stepper-items-protocols' });
    await page.getByLabel('内容已确认').check();
    await page.waitForFunction(() => {
        const steppers = [...document.querySelectorAll('.stepper-items-demo > .u-stepper')];
        const horizontalHeader = steppers[0]?.querySelectorAll('.u-stepper-item')[1];
        const verticalHeader = steppers[1]?.querySelector('.u-stepper-vertical-item:nth-child(2) .u-stepper-item');
        return [horizontalHeader, verticalHeader].every(element => element && !element.classList.contains('is-error') && element.classList.contains('is-complete'));
    });
    assert.equal(await horizontalSecondHeader.evaluate(element => element.classList.contains('is-error')), false, 'passing rules should clear the horizontal error state');
    assert.equal(await horizontalSecondHeader.evaluate(element => element.classList.contains('is-complete')), true, 'passing rules should complete the horizontal second step');
    assert.equal(await verticalSecondHeader.evaluate(element => element.classList.contains('is-error')), false, 'passing rules should clear the vertical error state');
    assert.equal(await verticalSecondHeader.evaluate(element => element.classList.contains('is-complete')), true, 'passing rules should complete the vertical second step');
    assert.equal(await verticalSecondNext.isDisabled(), false, 'passing the rule should enable continuing');
    await verticalSecondNext.click();
    const verticalThird = vertical.locator('.u-stepper-vertical-item').nth(2);
    await verticalThird.getByText('最后一步内容。', { exact: true }).waitFor();
    await page.getByLabel('隐藏操作').check();
    assert.equal(await page.locator('.stepper-items-demo .u-stepper-actions').count(), 0, 'hide-actions should remove generated action bars from both steppers');
    report.checks.push('Stepper items: confirmation passes the rule; next reveals the final item; hide-actions removes both action bars');
    await page.getByLabel('隐藏操作').uncheck();
    await capture('stepper-items-dark-390', { example: 'stepper-items-protocols', width: 390, height: 844, dark: true });
    await capture('stepper-items-zoom-125', { example: 'stepper-items-protocols', width: 1000, height: 800, zoom: 125 });

    await selectExample('component-stepper-vertical-actions');
    const verticalActions = page.locator('[data-demo-component="UStepperVerticalActions"]');
    await verticalActions.waitFor();
    const finishButton = verticalActions.getByRole('button', { name: '完成', exact: true });
    assert.equal(await verticalActions.getByRole('button', { name: '返回', exact: true }).isDisabled(), true, 'the standalone actions demo should disable its previous action');
    await finishButton.click();
    await verticalActions.getByRole('status').getByText('已完成', { exact: true }).waitFor();
    report.checks.push('VerticalActions: finish action reaches the demo output 已完成');
    await capture('stepper-vertical-actions-wide-1000', { example: 'component-stepper-vertical-actions' });

    await selectExample('component-stepper-vertical-item');
    const verticalItemDemo = page.locator('[data-demo-component="UStepperVerticalItem"]');
    await verticalItemDemo.waitFor();
    const firstVerticalCopy = verticalItemDemo.getByText(/请确认资料后继续/);
    await firstVerticalCopy.waitFor();
    const secondVerticalCopy = verticalItemDemo.getByText(/点击下一步会发出完成事件/);
    assert.equal(await secondVerticalCopy.isVisible(), false, 'manual item content should remain collapsed before selecting its step');
    await verticalItemDemo.getByRole('button', { name: '完成', exact: true }).click();
    await secondVerticalCopy.waitFor({ state: 'visible' });
    report.checks.push('VerticalItem: manually selecting the second item expands its own content');
    await capture('stepper-vertical-item-wide-1000', { example: 'component-stepper-vertical-item' });

    report.windowIssues = await page.evaluate(() => [...window.handoffDemoIssues]);
    assert.deepEqual(report.pageErrors, [], 'browser page errors must be zero');
    assert.deepEqual(report.consoleIssues, [], 'browser console warnings and errors must be zero');
    assert.deepEqual(report.windowIssues, [], 'window errors and unhandled promise rejections must be zero');
    report.checks.push('Runtime: zero page errors, console warnings/errors, window errors, and unhandled rejections');

    report.sourceSha256After = await hashSources();
    assert.deepEqual(report.sourceSha256After, report.sourceSha256Before, 'source files changed during the protocol run; rerun after the source edits settle');
    report.checks.push('Source SHA-256: before and after snapshots match');
    console.log(`handoff demo protocols: ${report.checks.length} groups passed`);
    console.log(`evidence: ${evidence}`);
} catch (error) {
    report.failure = error.stack ?? String(error);
    if (page) {
        try {
            report.domAtFailure = await page.evaluate(() => ({
                example: window.handoffDemoFixture?.state.example,
                treeStatus: document.querySelector('.tree-filter-status')?.textContent?.trim(),
                treeTitles: [...document.querySelectorAll('.tree-filter-demo .ui-treeview-title')].map(element => element.textContent?.trim()),
                treeActions: [...document.querySelectorAll('.tree-filter-demo .ui-treeview-actions button')].map(element => ({ text: element.textContent?.trim(), disabled: element.disabled })),
                treeSelection: [...document.querySelectorAll('.tree-filter-demo input[type="checkbox"]')].map(element => ({ label: element.getAttribute('aria-label'), checked: element.checked }))
            }));
            await page.screenshot({ path: path.join(evidence, 'failure.png'), fullPage: true });
        } catch {
            report.domAtFailure = 'DOM snapshot unavailable after failure';
        }
    }
    throw error;
} finally {
    report.sourceSha256After ??= await hashSources();
    if (page && !report.windowIssues.length) {
        try {
            report.windowIssues = await page.evaluate(() => [...window.handoffDemoIssues]);
        } catch {
            report.windowIssues = [];
        }
    }
    await writeFile(reportPath, JSON.stringify(report, null, 4));
    await browser?.close();
    await vite.close();
}

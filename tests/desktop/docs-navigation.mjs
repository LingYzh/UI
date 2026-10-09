import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pages as docPages } from '../../src/ui/docs/content.js';
import { buildDocsNavigation } from '../../src/ui/docs/navigation.js';
const usagePages = buildDocsNavigation(docPages).flatMap(group => group.pages.flatMap(page => page.children || [page]));

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'docs-navigation-'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: `${server.resolvedUrls.local[0]}#/grid` };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
const page = await app.firstWindow();
const errors = [];
const reports = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
    if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
});
async function capture(name) {
    await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.waitForTimeout(250);
    const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
    await writeFile(path.join(evidence, `${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
try {
    await page.locator('.docs-navigation .ui-list-item-title').first().waitFor();
    await page.goto(`${server.resolvedUrls.local[0]}#/list-item`);
    const demo = page.locator('[data-demo-component="UListItem"]');
    await demo.waitFor();
    const names = demo.locator('.demo-append-list');
    assert.equal(await names.locator('.has-append-icon').count(), 2);
    assert.equal(await names.locator('.ui-list-item-append-text').count(), 2);
    assert.equal(await names.locator('.ui-list-item-append-text').first().getAttribute('title'), 'UBreadcrumbsDivider');
    assert.equal(await names.getByText('被插槽替换', { exact: true }).count(), 0);
    const titleFits = await names.getByText('路径分隔符', { exact: true }).evaluate(element => element.scrollWidth <= element.clientWidth);
    assert.equal(titleFits, true);
    await names.getByRole('button', { name: '操作', exact: true }).click();
    assert.ok((await demo.locator('output').textContent()).includes('独立操作：1 次'));
    await names.scrollIntoViewIfNeeded();
    await capture('shared-list-item-light');
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).check();
    await capture('shared-list-item-dark');
    await page.goto(`${server.resolvedUrls.local[0]}#/grid`);
    for (const [name, width, zoom, dark] of [
        ['light-wide', 1440, 1, false],
        ['dark-narrow', 900, 1, true],
        ['light-zoom125', 1280, 1.25, false],
        ['dark-mobile', 390, 1, true]
    ]) {
        await app.evaluate(({ BrowserWindow }, { width, zoom }) => {
            const window = BrowserWindow.getAllWindows()[0];
            window.setContentSize(width, 1000);
            window.webContents.setZoomFactor(zoom);
        }, { width, zoom });
        await page.getByRole('checkbox', { name: '深色主题', exact: true }).setChecked(dark);
        if (await page.locator('.docs-menu-button').isVisible()) {
            await page.getByRole('button', { name: '切换文档导航', exact: true }).click();
        }
        await page.locator('.docs-sidebar').waitFor({ state: 'visible' });
        // The sidebar now starts with folded categories. Open them explicitly
        // for this exhaustive typography check; interaction coverage has its
        // own source-based docs-navigation-groups protocol.
        for (const button of await page.locator('.docs-nav-group .ui-list-group-header').all()) {
            if (await button.getAttribute('aria-expanded') === 'false') await button.click();
        }
        await page.evaluate(async () => {
            await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
        });
        const report = await page.locator('.docs-nav-group a').evaluateAll(links => links.map(link => {
            const title = link.querySelector('.ui-list-item-title');
            const range = document.createRange();
            range.selectNodeContents(title);
            const arrow = link.querySelector('.icon');
            const name = link.querySelector('.ui-list-item-append-text');
            const rect = link.getBoundingClientRect();
            return {
                title: title.textContent.trim(),
                lines: range.getClientRects().length,
                titleOverflow: title.scrollWidth > title.clientWidth + 1,
                linkOverflow: link.scrollWidth > link.clientWidth + 1,
                arrowWidth: arrow?.getBoundingClientRect().width,
                arrowEndGap: arrow ? rect.right - arrow.getBoundingClientRect().right : undefined,
                nameTooltip: name?.title,
                nameText: name?.textContent.trim(),
                nameEllipsis: name ? getComputedStyle(name).textOverflow : undefined,
                nameOverflow: name ? name.scrollWidth > name.clientWidth + 1 : false
            };
        }));
        assert.equal(report.length, usagePages.length);
        for (const row of report) {
            assert.equal(row.lines, 1, `${name}: ${row.title} single line`);
            assert.equal(row.titleOverflow, false, `${name}: ${row.title} fully visible`);
            assert.equal(row.linkOverflow, false, `${name}: ${row.title} stays inside row`);
            if (row.arrowWidth !== undefined) {
                assert.ok(Math.abs(row.arrowWidth - 18) < 0.1, `${name}: arrow remains 18px`);
                assert.ok(Math.abs(row.arrowEndGap - 12) < 1, `${name}: arrow stays at trailing padding`);
            }
            if (row.nameText) {
                assert.equal(row.nameTooltip, row.nameText);
                assert.equal(row.nameEllipsis, 'ellipsis');
                // Long public names may ellipsize in indented rows; the full
                // appendText is still available through its title attribute.
            }
        }
        reports.push({ name, width, zoom, checkedRows: report.length, grid: report.find(row => row.title === '栅格与布局规范') });
        await page.locator('.docs-nav-group a[href="#/grid"]').evaluate(element => {
            const sidebar = element.closest('.docs-sidebar');
            sidebar.scrollTop += element.getBoundingClientRect().top - sidebar.getBoundingClientRect().top - 200;
        });
        await capture(`${name}-grid`);
        const link = page.locator('.docs-nav-group a[href="#/breadcrumbs"]');
        await link.click();
        await page.waitForFunction(() => location.hash === '#/breadcrumbs');
        if (await page.locator('.docs-menu-button').isVisible()) {
            await page.getByRole('button', { name: '切换文档导航', exact: true }).click();
        }
        await link.focus();
        await capture(`${name}-long-name`);
        if (await page.locator('.docs-menu-button').isVisible()) await page.keyboard.press('Escape');
        await page.evaluate(() => { location.hash = '#/grid'; });
        await page.waitForFunction(() => document.querySelector('.docs-nav-group a[href="#/grid"]').getAttribute('aria-current') === 'page');
    }
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setContentSize(1440, 1000));
    const grid = page.locator('.docs-nav-group a[href="#/grid"]');
    await grid.focus();
    await page.keyboard.press('Enter');
    assert.equal(await grid.getAttribute('aria-current'), 'page');
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-controls')), 'docs-group-selection-items');
    await page.keyboard.press('Home');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-controls')), 'docs-group-getting-started-items');
    await page.keyboard.press('End');
    assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-ui-list-item')), true);
    const search = page.getByRole('textbox', { name: '搜索文档', exact: true });
    await search.fill('路径分隔符');
    assert.equal(await page.locator('.docs-nav-group a').count(), 1);
    await search.press('Enter');
    await page.waitForFunction(() => location.hash === '#/breadcrumbs-divider/api');
    assert.deepEqual(errors, []);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ reports, errors, navigation: 'pointer, Enter, arrows, Home/End, search Enter and mobile close/open passed' }, null, 4));
    console.log(JSON.stringify({ evidence, reports, errors }, null, 4));
} finally {
    await app.close();
    await server.close();
}

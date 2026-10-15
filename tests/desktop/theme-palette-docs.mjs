import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.UI_DOCS_URL || 'http://127.0.0.1:5174/';
const evidence = process.env.UI_DOCS_EVIDENCE || 'artifacts/theme-palette-docs';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
const checks = [];
try {
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1100 },
        reducedMotion: 'reduce',
    });
    page.setDefaultTimeout(30000);
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    await page.goto(`${base}#/theme`);
    const palette = page.locator('[data-theme-palette-demo]');
    await palette.waitFor();
    const toggle = page.getByRole('checkbox', {
        name: '深色主题',
        exact: true,
    });
    for (const dark of [false, true]) {
        if ((await toggle.isChecked()) !== dark) await toggle.click();
        await page.waitForFunction(
            (dark) =>
                document.documentElement.dataset.theme ===
                (dark ? 'dark' : 'light'),
            dark,
        );
        await page.waitForTimeout(450);
        const shell = await page.evaluate(() => {
            function style(selector) {
                return getComputedStyle(document.querySelector(selector));
            }
            return {
                logo: style('.docs-logo').backgroundColor,
                logoInk: style('.docs-logo').color,
                headerIndicator: style('.docs-header-links a.active')
                    .borderBottomColor,
                navIndicator: style('.docs-navigation .ui-list-item.is-active')
                    .boxShadow,
                navBackground: style('.docs-navigation .ui-list-item.is-active')
                    .backgroundColor,
                modeBackground: style(
                    '.docs-navigation-mode [aria-pressed="true"]',
                ).backgroundColor,
                tabIndicator: style('.docs-example .ui-tabs-slider')
                    .backgroundColor,
                text: style('.docs-navigation .ui-list-item.is-active').color,
            };
        });
        assert.equal(shell.logo, 'rgb(217, 119, 87)');
        assert.equal(shell.logoInk, 'rgb(255, 255, 255)');
        assert.equal(shell.headerIndicator, shell.logo);
        assert.equal(shell.tabIndicator, shell.logo);
        assert.equal(shell.navIndicator, 'none');
        assert.equal(
            shell.navBackground,
            dark ? 'rgb(59, 47, 42)' : 'rgb(246, 236, 229)',
        );
        assert.equal(shell.modeBackground, shell.navBackground);
        assert.equal(
            shell.text,
            dark ? 'rgb(230, 160, 134)' : 'rgb(217, 119, 87)',
        );
        await page.screenshot({
            path: `${evidence}/shell-${dark ? 'dark' : 'light'}-1440.png`,
        });
        await palette
            .getByRole('button', { name: '主题色消息', exact: true })
            .click();
        const notice = page.locator('.u-notice');
        await notice.waitFor();
        assert.deepEqual(
            await notice.evaluate((element) => ({
                bg: getComputedStyle(element).backgroundColor,
                color: getComputedStyle(element).color,
            })),
            { bg: 'rgb(217, 119, 87)', color: 'rgb(255, 255, 255)' },
        );
        assert.equal(
            await notice
                .locator('button')
                .evaluate((element) => getComputedStyle(element).color),
            'rgb(255, 255, 255)',
        );
        await page.screenshot({
            path: `${evidence}/theme-notice-${dark ? 'dark' : 'light'}.png`,
        });
        await notice.getByRole('button', { name: '关闭', exact: true }).click();
        for (const width of [1440, 390]) {
            await page.setViewportSize({ width, height: 1100 });
            await page.waitForTimeout(250);
            await palette.screenshot({
                path: `${evidence}/theme-${dark ? 'dark' : 'light'}-${width}.png`,
            });
            if (width === 390) {
                assert.ok(
                    await page.evaluate(
                        () =>
                            document.documentElement.scrollWidth <= innerWidth,
                    ),
                );
                await page
                    .getByRole('button', { name: '切换文档导航', exact: true })
                    .click();
                await page.screenshot({
                    path: `${evidence}/shell-${dark ? 'dark' : 'light'}-390.png`,
                });
                await page.keyboard.press('Escape');
            }
        }
        await page.setViewportSize({ width: 1440, height: 1100 });
        checks.push({ route: 'theme', dark, shell });
        await page.evaluate(() => (location.hash = '/overview'));
        await page.locator('.docs-hero-demo').waitFor();
        const overview = await page.evaluate(() => {
            const selectors = [
                '.docs-brand strong span',
                '.docs-header-links a.active',
                '.docs-page-eyebrow',
                '.docs-navigation .ui-list-item.is-active',
                '.docs-quick-links a',
                '.docs-toc-note a',
            ];
            return Object.fromEntries(
                selectors.map((selector) => [
                    selector,
                    getComputedStyle(document.querySelector(selector)).color,
                ]),
            );
        });
        for (const [selector, color] of Object.entries(overview)) {
            assert.equal(
                color,
                dark ? 'rgb(230, 160, 134)' : 'rgb(217, 119, 87)',
                selector,
            );
        }
        await page.screenshot({
            path: `${evidence}/overview-${dark ? 'dark' : 'light'}-1440.png`,
        });
        checks.push({ route: 'overview', dark, colors: overview });
        await page.evaluate(() => (location.hash = '/theme'));
        await palette.waitFor();
    }
    for (const [route, selector] of [
        ['button', '[data-button-appearance]'],
        ['checkbox', '.live-example .ui-checkbox-control'],
        ['switch', '.live-example .ui-switch'],
        ['toolbar', '.live-example .ui-toolbar'],
        ['hotkey', '.live-example .u-hotkey-key'],
        ['avatar', '.live-example .ui-avatar'],
        ['picker', '.live-example .u-picker-container'],
        ['field', '.live-example .u-field-surface'],
    ]) {
        console.log('Checking demo', route);
        await page.evaluate((route) => (location.hash = `/${route}`), route);
        const live = page.locator(selector).first();
        await live.waitFor();
        assert.equal(await page.locator('vite-error-overlay').count(), 0);
        await live.evaluate((element) =>
            element.scrollIntoView({ block: 'center', behavior: 'instant' }),
        );
        await page.screenshot({ path: `${evidence}/${route}-dark.png` });
        checks.push({ route });
    }
    assert.deepEqual(errors, []);
    await writeFile(
        `${evidence}/report.json`,
        JSON.stringify({ base, checks, errors }, null, 4),
    );
    console.log(JSON.stringify({ evidence, checks, errors }));
} finally {
    await browser.close();
}

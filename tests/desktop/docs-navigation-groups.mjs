import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { pages } from '../../src/ui/docs/content.js';
import { buildDocsNavigation, docsNavigationGroups, getDocsUsageFamily } from '../../src/ui/docs/navigation.js';

const evidence = path.resolve('artifacts/full-alignment/docs-navigation-groups');
const sourcePaths = [
    'index.html',
    'src/main.js',
    'src/ui/UiPreview.vue',
    'src/ui/docs/content.js',
    'src/ui/docs/navigation.js',
    'src/ui/docs/familyGuidance.js',
    'src/ui/docs/ExampleCard.vue',
    'src/ui/docs/LiveExample.vue',
    'src/ui/docs/LayoutDemo.vue',
    'src/ui/docs/VariantExample.vue',
    'src/ui/docs/TabsDemo.vue',
    'src/ui/docs/OverlayPresentationDemo.vue',
    'src/ui/docs/geometryContent.js',
    'src/ui/docs/apiReference.js',
    'src/ui/USnackbar.vue',
    'src/ui/UiSnackbarHost.vue',
    'src/ui/UiProgress.vue',
    'src/ui/UiSpinner.vue',
    'src/ui/UiMenuItem.vue',
    'src/ui/UiMenu.vue',
    'src/ui/menu.ts',
    'src/ui/overlay-lifecycle.ts',
    'src/ui/UProgressLinear.vue',
    'src/ui/UProgressCircular.vue',
    'src/ui/styles.css',
    'src/ui/controls.css',
    'src/ui/feedback.css',
    'src/ui/alignment-components.css',
    'src/ui/data-components.css',
    'src/ui/docs/docs.css',
    'src/ui/UList.vue',
    'src/ui/UListGroup.vue',
    'src/ui/UListItem.vue',
    'src/ui/UiCollapse.vue',
    'src/ui/list-completion.ts'
];
const report = {
    test: 'docs-navigation-groups',
    startedAt: new Date().toISOString(),
    browser: 'Chrome channel via Playwright',
    expected: { pageCount: 173, componentCount: 158, groupCount: 16 },
    sourceHashesBefore: {},
    sourceHashesAfter: {},
    sourceChangedDuringRun: [],
    zoom125Simulation: null,
    screenshots: [],
    checks: [],
    runtime: { pageErrors: [], vueWarnings: [], consoleErrors: [] }
};

async function hashSources() {
    const hashes = {};
    for (const sourcePath of sourcePaths) {
        const contents = await readFile(path.resolve(sourcePath));
        hashes[sourcePath] = createHash('sha256').update(contents).digest('hex');
    }
    return hashes;
}

function check(name, passed, details = {}) {
    report.checks.push({ name, passed: Boolean(passed), details });
    assert.ok(passed, `${name}: ${JSON.stringify(details)}`);
}

function checkEqual(name, actual, expected) {
    let passed = true;
    try {
        assert.deepEqual(actual, expected);
    } catch {
        passed = false;
    }
    report.checks.push({ name, passed, details: { actual, expected } });
    assert.ok(passed, `${name}: ${JSON.stringify({ actual, expected })}`);
}

function group(categoryId) {
    return page.locator(`#docs-group-${categoryId}`);
}

function groupHeader(categoryId) {
    return group(categoryId).locator(':scope > button.ui-list-group-header');
}

async function expandedGroupIds() {
    return page.locator('.docs-navigation .docs-nav-group').evaluateAll(elements => elements
        .filter(element => element.querySelector('.ui-list-group-header')?.getAttribute('aria-expanded') === 'true')
        .map(element => element.id.replace(/^docs-group-/, '')));
}

async function waitForCurrentPage(pageId, targetPage = page) {
    await targetPage.waitForFunction(({ id, familyId }) => {
        return location.hash.replace(/^#\//, '').split('/')[0] === id
            && [...document.querySelectorAll('.docs-nav-group a[aria-current="page"]')].some(link =>
                [id, familyId].includes(link.getAttribute('href').replace(/^#\//, '').split('/')[0]));
    }, { id: pageId, familyId: getDocsUsageFamily(pageId).id });
}

async function navigationTargets() {
    return page.locator('.docs-navigation').evaluate(root => {
        function isVisible(node) {
            let current = node;
            while (current && current !== root) {
                const style = getComputedStyle(current);
                if (current.hasAttribute('inert') || current.getAttribute('aria-hidden') === 'true'
                    || current.hidden || style.display === 'none' || style.visibility === 'hidden') return false;
                current = current.parentElement;
            }
            return node.getClientRects().length > 0;
        }
        return [...root.querySelectorAll('[data-ui-list-navigation-item]')]
            .filter(node => node.closest('.ui-list') === root && isVisible(node))
            .map(node => node.tagName === 'A' ? `href:${node.getAttribute('href')}` : `id:${node.id}`);
    });
}

async function focusNavigationTarget(key) {
    await page.locator('.docs-navigation').evaluate((root, targetKey) => {
        const target = [...root.querySelectorAll('[data-ui-list-navigation-item]')].find(node => {
            const key = node.tagName === 'A' ? `href:${node.getAttribute('href')}` : `id:${node.id}`;
            return key === targetKey;
        });
        target?.focus();
    }, key);
}

async function activeNavigationTarget() {
    return page.evaluate(() => {
        const node = document.activeElement?.closest('[data-ui-list-navigation-item]');
        if (!node) return '';
        return node.tagName === 'A' ? `href:${node.getAttribute('href')}` : `id:${node.id}`;
    });
}

async function layoutMetrics(targetPage = page) {
    return targetPage.evaluate(() => {
        const sidebar = document.querySelector('.docs-sidebar');
        const visibleLinks = [...document.querySelectorAll('.docs-nav-group a[href]')]
            .filter(link => !link.closest('[inert]') && link.getClientRects().length > 0);
        const rowOverflow = visibleLinks.filter(link => {
            const sidebarRect = sidebar.getBoundingClientRect();
            const rowRect = link.getBoundingClientRect();
            return link.scrollWidth > link.clientWidth + 1
                || rowRect.left < sidebarRect.left - 1
                || rowRect.right > sidebarRect.right + 1;
        }).map(link => ({
            href: link.getAttribute('href'),
            text: link.querySelector('.ui-list-item-title')?.textContent?.trim(),
            scrollWidth: link.scrollWidth,
            clientWidth: link.clientWidth,
            left: link.getBoundingClientRect().left,
            right: link.getBoundingClientRect().right
        }));
        return {
            viewportWidth: window.innerWidth,
            devicePixelRatio: window.devicePixelRatio,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            sidebarWidth: sidebar?.clientWidth ?? 0,
            sidebarScrollWidth: sidebar?.scrollWidth ?? 0,
            expandedVisibleRows: visibleLinks.length,
            rowOverflow
        };
    });
}

await mkdir(evidence, { recursive: true });
report.sourceHashesBefore = await hashSources();
const vite = await createServer({
    appType: 'spa',
    cacheDir: path.join(evidence, 'vite-cache'),
    logLevel: 'error',
    optimizeDeps: {
        noDiscovery: true,
        include: [
            'highlight.js/lib/core',
            'highlight.js/lib/languages/xml',
            'highlight.js/lib/languages/javascript',
            'highlight.js/lib/languages/typescript',
            'highlight.js/lib/languages/css',
            'highlight.js/lib/languages/json',
            'markdown-it',
            'markdown-it-footnote',
            'markdown-it-task-lists',
            'markdown-it-deflist',
            'markdown-it-mark',
            'markdown-it-sub',
            'markdown-it-sup'
        ]
    },
    server: { host: '127.0.0.1', port: 0, hmr: false }
});
let browser;
let page;
try {
    await vite.listen();
    const address = vite.httpServer.address();
    assert.ok(address && typeof address === 'object');
    const baseUrl = `http://127.0.0.1:${address.port}/`;
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    page = await context.newPage();
    await page.route('**/favicon.ico', route => route.fulfill({ status: 204, body: '' }));
    page.on('pageerror', error => report.runtime.pageErrors.push(error.stack ?? error.message));
    page.on('console', message => {
        if (message.type() === 'error') report.runtime.consoleErrors.push(message.text());
        if (message.type() === 'warning' && message.text().includes('[Vue warn]')) {
            report.runtime.vueWarnings.push(message.text());
        }
    });

    await page.goto(`${baseUrl}#/grid`, { waitUntil: 'domcontentloaded' });
    await page.locator('.docs-navigation .docs-nav-group').first().waitFor({ state: 'attached' });
    await waitForCurrentPage('grid');
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).setChecked(false);
    await page.locator('.docs-sidebar').evaluate(element => { element.scrollTop = 0; });
    const defaultDesktopScreenshot = path.join(evidence, 'default-groups-light-wide.png');
    await page.screenshot({ path: defaultDesktopScreenshot, animations: 'disabled' });
    report.screenshots.push(defaultDesktopScreenshot);

    const domGroupIds = await page.locator('.docs-navigation .docs-nav-group').evaluateAll(elements =>
        elements.map(element => element.id.replace(/^docs-group-/, '')));
    checkEqual('renders all navigation categories in contract order', domGroupIds,
        docsNavigationGroups.map(group => group.id));
    const domPages = await page.locator('.docs-navigation .docs-nav-group a[href]').evaluateAll(links =>
        links.map(link => link.getAttribute('href').replace(/^#\//, '')));
    const usagePages = buildDocsNavigation(pages).flatMap(group => group.pages.flatMap(item => item.children || [item]));
    checkEqual('renders usage families and distinct table mode routes', domPages, usagePages.map(item => item.id));
    check('renders every page route once', new Set(domPages).size === domPages.length,
        { unique: new Set(domPages).size, rendered: domPages.length });
    check('renders 158 component pages in navigation', pages.filter(item => item.kind === 'component').length === 158,
        { componentPages: pages.filter(item => item.kind === 'component').length });

    const firstCategory = docsNavigationGroups[0];
    checkEqual('opens the start category by default', await groupHeader(firstCategory.id).getAttribute('aria-expanded'), 'true');
    checkEqual('opens the current page category by default', await groupHeader('grids').getAttribute('aria-expanded'), 'true');
    checkEqual('keeps unrelated categories collapsed initially', await groupHeader('containment').getAttribute('aria-expanded'), 'false');
    checkEqual('marks the current route with aria-current', await page.locator('.docs-nav-group a[href="#/grid"]').getAttribute('aria-current'), 'page');

    const containmentHeader = groupHeader('containment');
    await containmentHeader.click();
    checkEqual('pointer expands a category', await containmentHeader.getAttribute('aria-expanded'), 'true');
    checkEqual('multiple strategy preserves other open categories', await groupHeader('getting-started').getAttribute('aria-expanded'), 'true');
    await containmentHeader.click();
    checkEqual('pointer collapses a category', await containmentHeader.getAttribute('aria-expanded'), 'false');
    const hiddenCollapse = page.locator('#docs-group-containment-items');
    check('collapsed pages are inert and hidden from assistive technology',
        (await hiddenCollapse.getAttribute('inert')) !== null && (await hiddenCollapse.getAttribute('aria-hidden')) === 'true');
    const hiddenLink = group('containment').locator('a[href]').first();
    const hiddenHref = await hiddenLink.getAttribute('href');
    await hiddenLink.evaluate(element => element.focus());
    const focusAfterHiddenAttempt = await page.evaluate(() => document.activeElement?.getAttribute('href') ?? document.activeElement?.id ?? 'body');
    check('collapsed pages cannot receive focus', focusAfterHiddenAttempt !== hiddenHref,
        { attempted: hiddenHref, activeAfterAttempt: focusAfterHiddenAttempt });

    await containmentHeader.focus();
    await page.keyboard.press('Enter');
    checkEqual('Enter toggles a category open', await containmentHeader.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Space');
    checkEqual('Space toggles a category closed', await containmentHeader.getAttribute('aria-expanded'), 'false');

    const targets = await navigationTargets();
    check('keyboard navigation has visible targets', targets.length > 2, { targets: targets.length });
    await focusNavigationTarget(targets[0]);
    await page.keyboard.press('ArrowDown');
    checkEqual('ArrowDown moves to the next visible navigation item', await activeNavigationTarget(), targets[1]);
    await focusNavigationTarget(targets[0]);
    await page.keyboard.press('ArrowUp');
    checkEqual('ArrowUp wraps to the last visible navigation item', await activeNavigationTarget(), targets.at(-1));
    await focusNavigationTarget(targets.at(-1));
    await page.keyboard.press('Home');
    checkEqual('Home moves to the first visible navigation item', await activeNavigationTarget(), targets[0]);
    await focusNavigationTarget(targets[0]);
    await page.keyboard.press('End');
    checkEqual('End moves to the last visible navigation item', await activeNavigationTarget(), targets.at(-1));

    const manualHeader = groupHeader('providers');
    await manualHeader.click();
    checkEqual('a manually opened category is recorded', await manualHeader.getAttribute('aria-expanded'), 'true');
    const manualOpenState = await expandedGroupIds();
    const search = page.getByRole('textbox', { name: '搜索文档', exact: true });
    await search.fill('UTextField');
    const expectedSearchIds = buildDocsNavigation(pages, 'UTextField').flatMap(item => item.pages.map(doc => doc.id));
    await page.waitForFunction(() => document.querySelector('#docs-group-form-inputs-and-controls .ui-list-group-header')?.getAttribute('aria-expanded') === 'true');
    const filteredDomIds = await page.locator('.docs-nav-group a[href]').evaluateAll(links => links.map(link => link.getAttribute('href').replace(/^#\//, '').split('/')[0]));
    checkEqual('API-name search shows the matching filtered pages', filteredDomIds, expectedSearchIds);
    const expectedSearchGroupIds = docsNavigationGroups.filter(item =>
        expectedSearchIds.some(pageId => item.pageIds.includes(pageId))).map(item => item.id);
    checkEqual('search expands every category containing results', await expandedGroupIds(), expectedSearchGroupIds);
    await search.fill('no-such-docs-navigation-entry-9f3c');
    await page.locator('.docs-no-results[role="status"]').waitFor({ state: 'visible' });
    checkEqual('zero-result search removes all page links', await page.locator('.docs-nav-group a[href]').count(), 0);
    await search.fill('');
    await page.waitForFunction(() => document.querySelector('.docs-nav-group a[href="#/grid"]') !== null);
    checkEqual('clearing search restores manually opened categories', await expandedGroupIds(), manualOpenState);

    const searchEnterQuery = 'UListGroup';
    const firstSearchResult = buildDocsNavigation(pages, searchEnterQuery)[0]?.pages[0];
    assert.ok(firstSearchResult, `search fixture ${searchEnterQuery} has a result`);
    await search.fill(searchEnterQuery);
    await search.press('Enter');
    await waitForCurrentPage(firstSearchResult.id);
    await page.waitForFunction(() => document.querySelector('.docs-search input')?.value === '');
    checkEqual('Enter opens the exact child API and clears search', await page.evaluate(() => location.hash), firstSearchResult.href);
    checkEqual('child search displays its own API inside the family', await page.locator('[data-docs-api-component]').textContent(), firstSearchResult.name);
    check('search destination category expands automatically',
        await groupHeader(docsNavigationGroups.find(item => item.pageIds.includes(firstSearchResult.id)).id).getAttribute('aria-expanded') === 'true',
        { pageId: firstSearchResult.id });

    const navigationOrder = usagePages;
    const paginationPage = navigationOrder[40];
    const paginationIndex = navigationOrder.findIndex(item => item.id === paginationPage.id);
    await page.goto(`${baseUrl}#/${paginationPage.id}`, { waitUntil: 'domcontentloaded' });
    await waitForCurrentPage(paginationPage.id);
    const expectedPrevious = navigationOrder[paginationIndex - 1];
    const expectedNext = navigationOrder[paginationIndex + 1];
    const paginationHrefs = await page.locator('.docs-page-pagination a').evaluateAll(links => links.map(link => link.getAttribute('href')));
    checkEqual('previous and next links follow navigation category order', paginationHrefs,
        [`#/${expectedPrevious.id}`, `#/${expectedNext.id}`]);
    await page.locator('.docs-page-pagination .docs-pagination-next').click();
    await waitForCurrentPage(expectedNext.id);
    checkEqual('next-page link follows the navigation order', await page.evaluate(() => location.hash), `#/${expectedNext.id}`);

    await page.goto(`${baseUrl}#/grid`, { waitUntil: 'domcontentloaded' });
    await waitForCurrentPage('grid');
    await page.evaluate(() => { location.hash = '/container/api'; });
    await waitForCurrentPage('container');
    await page.goBack();
    await waitForCurrentPage('grid');
    checkEqual('browser Back restores the prior active page', await page.evaluate(() => location.hash), '#/grid');
    checkEqual('browser Back keeps the active category expanded', await groupHeader('grids').getAttribute('aria-expanded'), 'true');
    await page.goto(`${baseUrl}#/list-group`, { waitUntil: 'domcontentloaded' });
    await waitForCurrentPage('list-group');
    checkEqual('deep links expand the destination category', await groupHeader('containment').getAttribute('aria-expanded'), 'true');
    checkEqual('legacy bare child route retains exact component API', await page.locator('[data-docs-api-component]').textContent(), 'UListGroup');
    await page.waitForFunction(() => {
        const api = document.querySelector('#section-api')?.getBoundingClientRect();
        const scroll = document.querySelector('.docs-content-scroll')?.getBoundingClientRect();
        return api && scroll && api.top >= scroll.top && api.top < scroll.top + 80;
    });
    checkEqual('legacy bare child route lands on API and preserves its hash', await page.evaluate(() => location.hash), '#/list-group');
    await page.getByRole('combobox', { name: '选择组件 API', exact: true }).selectOption('list-subheader');
    await waitForCurrentPage('list-subheader');
    checkEqual('family API selector changes the exact child route', await page.evaluate(() => location.hash), '#/list-subheader/api');
    checkEqual('family API selector keeps a single List usage heading', await page.locator('.docs-page-heading h1 code').textContent(), 'UList');
    const familyApiScreenshot = path.join(evidence, 'list-family-api-light-wide.png');
    await page.screenshot({ path: familyApiScreenshot, animations: 'disabled' });
    report.screenshots.push(familyApiScreenshot);
    const duplicateArticleIds = await page.locator('.docs-article').evaluate(article => {
        const ids = [...article.querySelectorAll('[id]')].map(node => node.id);
        return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    checkEqual('family examples have unique DOM IDs', duplicateArticleIds, []);
    for (const section of ['examples', 'usage', 'api']) {
        await page.evaluate(hash => { location.hash = hash; }, `/list-item/${section}`);
        await waitForCurrentPage('list-item');
        const anchor = section === 'api' ? 'section-api' : `section-${section}-list-item`;
        check(`legacy child ${section} hash has a meaningful anchor`, await page.locator(`#${anchor}`).count() === 1);
    }
    await page.getByRole('button', { name: '组件 API', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('.docs-nav-group a[href]').length === 158);
    const apiHrefs = await page.locator('.docs-nav-group a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')));
    checkEqual('independent API directory retains every public component', apiHrefs, buildDocsNavigation(pages, '', 'api').flatMap(group => group.pages.map(item => item.href)));
    await page.evaluate(() => { location.hash = '/stepper-vertical-item/api'; });
    await waitForCurrentPage('stepper-vertical-item');
    checkEqual('API directory selects the vertical child independently', await page.locator('[data-docs-api-component]').textContent(), 'UStepperVerticalItem');
    const apiDirectoryScreenshot = path.join(evidence, 'independent-api-directory.png');
    await page.screenshot({ path: apiDirectoryScreenshot, animations: 'disabled' });
    report.screenshots.push(apiDirectoryScreenshot);
    await page.getByRole('button', { name: '使用指南', exact: true }).click();
    await page.waitForFunction(() => !!document.querySelector('#docs-family-data-table'));
    await page.evaluate(() => { location.hash = '/data-table-server'; });
    await waitForCurrentPage('data-table-server');
    checkEqual('table deep link opens its nested mode menu', await page.locator('#docs-family-data-table > button').getAttribute('aria-expanded'), 'true');

    for (const category of await page.locator('.docs-nav-group').all()) {
        const header = category.locator(':scope > button.ui-list-group-header');
        if (await header.getAttribute('aria-expanded') !== 'true') await header.click();
    }
    checkEqual('all categories can remain open together', (await expandedGroupIds()).length, docsNavigationGroups.length);

    const viewportCases = [
        { name: 'light-wide-1440', width: 1440, dark: false },
        { name: 'dark-narrow-900', width: 900, dark: true },
        { name: 'light-mobile-390', width: 390, dark: false }
    ];
    const darkSwitch = page.getByRole('checkbox', { name: '深色主题', exact: true });
    for (const scenario of viewportCases) {
        await page.setViewportSize({ width: scenario.width, height: 1000 });
        await darkSwitch.setChecked(scenario.dark);
        if (scenario.width < 760) {
            const menuButton = page.getByRole('button', { name: '切换文档导航', exact: true });
            if (await menuButton.getAttribute('aria-expanded') !== 'true') await menuButton.click();
            check('mobile sidebar opens at ' + scenario.width, await page.locator('.docs-sidebar').evaluate(element => element.classList.contains('is-open')),
                { width: scenario.width });
        }
        const metrics = await layoutMetrics();
        report.checks.push({
            name: `no horizontal overflow at ${scenario.name}`,
            passed: metrics.documentWidth <= metrics.viewportWidth + 1
                && metrics.devicePixelRatio === 1
                && metrics.bodyWidth <= metrics.viewportWidth + 1
                && metrics.sidebarScrollWidth <= metrics.sidebarWidth + 1
                && metrics.rowOverflow.length === 0,
            details: metrics
        });
        assert.ok(metrics.documentWidth <= metrics.viewportWidth + 1
            && metrics.devicePixelRatio === 1
            && metrics.bodyWidth <= metrics.viewportWidth + 1
            && metrics.sidebarScrollWidth <= metrics.sidebarWidth + 1
            && metrics.rowOverflow.length === 0,
        `horizontal overflow at ${scenario.name}: ${JSON.stringify(metrics)}`);
        const screenshot = path.join(evidence, `${scenario.name}.png`);
        await page.screenshot({ path: screenshot, animations: 'disabled' });
        report.screenshots.push(screenshot);
    }

    const zoomContext = await browser.newContext({ viewport: { width: 312, height: 800 }, deviceScaleFactor: 1.25 });
    try {
        const zoomPage = await zoomContext.newPage();
        await zoomPage.route('**/favicon.ico', route => route.fulfill({ status: 204, body: '' }));
        zoomPage.on('pageerror', error => report.runtime.pageErrors.push(error.stack ?? error.message));
        zoomPage.on('console', message => {
            if (message.type() === 'error') report.runtime.consoleErrors.push(message.text());
            if (message.type() === 'warning' && message.text().includes('[Vue warn]')) {
                report.runtime.vueWarnings.push(message.text());
            }
        });
        await zoomPage.goto(`${baseUrl}?fixture=zoom-125-simulation#/grid`, { waitUntil: 'domcontentloaded' });
        await waitForCurrentPage('grid', zoomPage);
        await zoomPage.getByRole('checkbox', { name: '深色主题', exact: true }).setChecked(true);
        await zoomPage.getByRole('button', { name: '切换文档导航', exact: true }).click();
        await zoomPage.locator('.docs-sidebar.is-open').waitFor({ state: 'visible' });
        check('125% browser-zoom simulation opens the mobile navigation drawer',
            await zoomPage.locator('.docs-sidebar').evaluate(element => element.classList.contains('is-open')),
            { cssViewportWidth: 312, deviceScaleFactor: 1.25 });
        for (const category of await zoomPage.locator('.docs-nav-group').all()) {
            const header = category.locator(':scope > button.ui-list-group-header');
            if (await header.getAttribute('aria-expanded') !== 'true') await header.click();
        }
        await zoomPage.locator('.docs-sidebar').evaluate(element => { element.scrollTop = 0; });
        const zoomMetrics = await layoutMetrics(zoomPage);
        const zoomViewport = await zoomPage.evaluate(() => ({ innerWidth: window.innerWidth, innerHeight: window.innerHeight, devicePixelRatio: window.devicePixelRatio }));
        const zoomScreenshot = path.join(evidence, 'dark-page-zoom-125-312.png');
        const screenshotBytes = await zoomPage.screenshot({ path: zoomScreenshot, scale: 'device', animations: 'disabled' });
        const screenshotPixels = { width: screenshotBytes.readUInt32BE(16), height: screenshotBytes.readUInt32BE(20) };
        report.zoom125Simulation = {
            method: 'Playwright browser-context deviceScaleFactor emulation; not native browser Ctrl+ zoom',
            cssViewport: { width: 312, height: 800 },
            deviceScaleFactor: 1.25,
            equivalentPhysicalViewport: { width: 390, height: 1000 },
            actualViewport: zoomViewport,
            screenshotPixels,
            layoutMetrics: zoomMetrics
        };
        const zoomPassed = zoomViewport.innerWidth === 312
            && zoomViewport.innerHeight === 800
            && zoomViewport.devicePixelRatio === 1.25
            && screenshotPixels.width === 390
            && screenshotPixels.height === 1000
            && zoomMetrics.devicePixelRatio === 1.25
            && zoomMetrics.documentWidth <= zoomMetrics.viewportWidth + 1
            && zoomMetrics.bodyWidth <= zoomMetrics.viewportWidth + 1
            && zoomMetrics.sidebarScrollWidth <= zoomMetrics.sidebarWidth + 1
            && zoomMetrics.rowOverflow.length === 0;
        check('125% browser-zoom simulation uses a 390x1000 physical viewport without horizontal overflow', zoomPassed, report.zoom125Simulation);
        report.screenshots.push(zoomScreenshot);
    } finally {
        await zoomContext.close();
    }

    const mobileMenuButton = page.getByRole('button', { name: '切换文档导航', exact: true });
    await page.keyboard.press('Escape');
    check('Escape closes the mobile sidebar and returns focus to its trigger',
        !(await page.locator('.docs-sidebar').evaluate(element => element.classList.contains('is-open')))
            && await mobileMenuButton.evaluate(element => element.contains(document.activeElement) || document.activeElement === element),
        { expanded: await mobileMenuButton.getAttribute('aria-expanded') });
    await mobileMenuButton.click();
    await page.locator('.docs-nav-overlay').click({ position: { x: 300, y: 200 } });
    check('clicking the mobile backdrop closes the sidebar',
        !(await page.locator('.docs-sidebar').evaluate(element => element.classList.contains('is-open'))));
    await mobileMenuButton.click();
    await page.locator('.docs-nav-group a[href="#/date-picker"]').click();
    await waitForCurrentPage('date-picker');
    check('choosing a mobile route closes the sidebar and expands its category',
        !(await page.locator('.docs-sidebar').evaluate(element => element.classList.contains('is-open')))
            && await groupHeader('pickers').getAttribute('aria-expanded') === 'true',
        { route: await page.evaluate(() => location.hash) });

    await page.setViewportSize({ width: 390, height: 1000 });
    await page.goto(`${baseUrl}?fixture=default-groups-mobile#/stepper-vertical`, { waitUntil: 'domcontentloaded' });
    await waitForCurrentPage('stepper-vertical');
    await page.getByRole('checkbox', { name: '深色主题', exact: true }).setChecked(true);
    const defaultMobileMenuButton = page.getByRole('button', { name: '切换文档导航', exact: true });
    await defaultMobileMenuButton.click();
    await page.locator('.docs-sidebar.is-open').waitFor({ state: 'visible' });
    await page.locator('.docs-sidebar').evaluate(element => { element.scrollTop = 0; });
    const defaultMobileScreenshot = path.join(evidence, 'default-groups-dark-mobile.png');
    await page.screenshot({ path: defaultMobileScreenshot, animations: 'disabled' });
    report.screenshots.push(defaultMobileScreenshot);

    checkEqual('no browser page errors', report.runtime.pageErrors, []);
    checkEqual('no Vue warnings', report.runtime.vueWarnings, []);
    checkEqual('no browser console errors', report.runtime.consoleErrors, []);
    report.success = true;
} catch (error) {
    report.failure = error.stack ?? error.message;
    process.exitCode = 1;
} finally {
    try {
        report.sourceHashesAfter = await hashSources();
        report.sourceChangedDuringRun = sourcePaths.filter(sourcePath =>
            report.sourceHashesBefore[sourcePath] !== report.sourceHashesAfter[sourcePath]);
        if (report.sourceChangedDuringRun.length) {
            report.success = false;
            report.failure ??= `Source changed during browser run: ${report.sourceChangedDuringRun.join(', ')}`;
            process.exitCode = 1;
        }
    } catch (error) {
        report.success = false;
        report.failure ??= `Could not record source hashes: ${error.stack ?? error.message}`;
        process.exitCode = 1;
    }
    await browser?.close().catch(() => {});
    await vite.close().catch(() => {});
    report.finishedAt = new Date().toISOString();
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
}

if (report.success) {
    console.log(JSON.stringify({ evidence, checks: report.checks.length, screenshots: report.screenshots, sourceChangedDuringRun: report.sourceChangedDuringRun }, null, 4));
} else {
    console.error(JSON.stringify({ evidence, failure: report.failure, failedChecks: report.checks.filter(item => !item.passed), runtime: report.runtime, sourceChangedDuringRun: report.sourceChangedDuringRun }, null, 4));
}

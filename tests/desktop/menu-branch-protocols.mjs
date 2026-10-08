import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/menu-branch-protocols');
await mkdir(evidence, { recursive: true });
const sourceFiles = ['UiMenu.vue', 'UOverlay.vue', 'UiDialog.vue', 'UiTooltip.vue', 'menu.ts', 'docs/MenuBranchDemo.vue'];
async function sourceHashes() {
    return Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
        file,
        createHash('sha256').update(await readFile(path.resolve('src/ui', file))).digest('hex')
    ])));
}

const beforeHashes = await sourceHashes();
const fixture = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body><div id="app"></div><script type="module">
    import { createApp, defineComponent, h, KeepAlive, reactive } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import MenuBranchDemo from '/src/ui/docs/MenuBranchDemo.vue';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const state = reactive({
        branchParent: false,
        branchChild: false,
        parentPersistent: false,
        parentUpdates: [],
        childUpdates: [],
        grandchild: false,
        grandchildUpdates: [],
        dialogParent: false,
        dialogOpen: false,
        dialogMenu: false,
        keepMounted: false,
        keepParent: true,
        keepChild: true,
        keepParentUpdates: [],
        keepChildUpdates: []
    });

    const KeepAliveContent = defineComponent({
        setup() {
            return () => h(UI.UMenu, {
                modelValue: state.keepParent,
                nativeDismiss: false,
                scrollStrategy: 'locked',
                contentProps: { id: 'keep-parent-surface' },
                'onUpdate:modelValue': value => { state.keepParentUpdates.push(value); }
            }, {
                activator: scope => h('button', { ...scope.props, id: 'keep-parent-trigger' }, 'KeepAlive parent'),
                default: () => h(UI.UMenu, {
                    modelValue: state.keepChild,
                    nativeDismiss: false,
                    scrollStrategy: 'locked',
                    contentProps: { id: 'keep-child-surface' },
                    'onUpdate:modelValue': value => { state.keepChildUpdates.push(value); }
                }, {
                    activator: scope => h('button', { ...scope.props, id: 'keep-child-trigger' }, 'KeepAlive child'),
                    default: () => h('div', { id: 'keep-child-surface' }, 'KeepAlive child surface')
                })
            });
        }
    });

    const Root = defineComponent({
        setup() {
            return () => h('main', { id: 'menu-branch-fixture' }, [
                h('button', { id: 'branch-outside', type: 'button' }, 'Outside'),
                h(UI.UMenu, {
                    modelValue: state.branchParent,
                    persistent: state.parentPersistent,
                    nativeDismiss: false,
                    closeOnContentClick: false,
                    contentProps: { id: 'branch-parent-surface' },
                    'onUpdate:modelValue': value => { state.parentUpdates.push(value); state.branchParent = value; }
                }, {
                    activator: scope => h('button', { ...scope.props, id: 'branch-parent-trigger' }, 'Branch parent'),
                    default: () => h('section', [
                        h('button', { id: 'branch-parent-area', type: 'button' }, 'Inside parent only'),
                        h(UI.UMenu, {
                            modelValue: state.branchChild,
                            nativeDismiss: false,
                            contentProps: { id: 'branch-child-surface' },
                            'onUpdate:modelValue': value => { state.childUpdates.push(value); state.branchChild = value; }
                        }, {
                            activator: scope => h('button', { ...scope.props, id: 'branch-child-trigger' }, 'Branch child'),
                            default: () => h('div', [
                                h(UI.UMenuItem, { id: 'branch-child-item' }, () => 'Select child item'),
                                h(UI.UMenu, {
                                    modelValue: state.grandchild,
                                    nativeDismiss: false,
                                    contentProps: { id: 'branch-grandchild-surface' },
                                    'onUpdate:modelValue': value => { state.grandchildUpdates.push(value); state.grandchild = value; }
                                }, {
                                    activator: scope => h('button', { ...scope.props, id: 'branch-grandchild-trigger' }, 'Branch grandchild'),
                                    default: () => h('div', { id: 'branch-grandchild-content' }, 'Grandchild content')
                                })
                            ])
                        }),
                        h('button', { id: 'dialog-open', type: 'button', onClick: () => { state.dialogOpen = true; } }, 'Open dialog')
                    ])
                }),
                h(UI.UMenu, {
                    modelValue: state.dialogParent,
                    nativeDismiss: false,
                    closeOnContentClick: false,
                    contentProps: { id: 'dialog-parent-menu' },
                    'onUpdate:modelValue': value => { state.dialogParent = value; }
                }, {
                    activator: scope => h('button', { ...scope.props, id: 'dialog-parent-trigger' }, 'Dialog boundary parent'),
                    default: () => [
                        h('button', { id: 'dialog-boundary-open', type: 'button', onClick: () => { state.dialogOpen = true; } }, 'Open boundary dialog'),
                        h(UI.UDialog, { modelValue: state.dialogOpen, 'onUpdate:modelValue': value => { state.dialogOpen = value; } }, {
                            default: () => h(UI.UMenu, {
                                modelValue: state.dialogMenu,
                                nativeDismiss: false,
                                'onUpdate:modelValue': value => { state.dialogMenu = value; }
                            }, {
                                activator: scope => h('button', { ...scope.props, id: 'dialog-boundary-child-trigger' }, 'Dialog child menu'),
                                default: () => h(UI.UMenuItem, { id: 'dialog-boundary-item' }, () => 'Select within dialog')
                            })
                        })
                    ]
                }),
                h(KeepAlive, null, {
                    default: () => state.keepMounted
                        ? h(KeepAliveContent, { key: 'keep-alive-menu-branch' })
                        : h('div', { id: 'keep-alive-placeholder' }, 'Inactive')
                }),
                h('section', { id: 'real-menu-branch-demo' }, [h(MenuBranchDemo)])
            ]);
        }
    });

    window.menuBranchProtocol = { state };
    document.body.style.overflow = 'clip';
    createApp(Root).mount('#app');
</script></body></html>`;
const demoFixture = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body><div id="demo"></div><script type="module">
    import { createApp } from 'vue';
    import MenuBranchDemo from '/src/ui/docs/MenuBranchDemo.vue';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';
    createApp(MenuBranchDemo).mount('#demo');
</script></body></html>`;

const server = await createServer({
    configFile: path.resolve('vite.config.js'),
    appType: 'custom',
    cacheDir: path.join(evidence, 'vite-cache'),
    server: { host: '127.0.0.1', port: 0, watch: null },
    logLevel: 'error',
    optimizeDeps: {
        noDiscovery: true,
        include: [
            'highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript',
            'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json',
            'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark',
            'markdown-it-sub', 'markdown-it-sup'
        ]
    }
});
server.middlewares.use('/__menu_branch__', async (_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(await server.transformIndexHtml('/__menu_branch__', fixture));
});
server.middlewares.use('/__menu_branch_demo__', async (_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(await server.transformIndexHtml('/__menu_branch_demo__', demoFixture));
});

let browser;
const checks = [];
const warnings = [];
const errors = [];
try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    function captureBrowserErrors(browserPage) {
        browserPage.on('pageerror', error => errors.push(error.message));
        browserPage.on('console', message => {
            if (message.type() === 'warning' && /\[Vue warn\]/.test(message.text())) warnings.push(message.text());
            if (message.type() === 'error') errors.push(message.text());
        });
    }
    captureBrowserErrors(page);
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__menu_branch__`);
    await page.waitForFunction(() => Boolean(window.menuBranchProtocol));
    await page.locator('#branch-parent-trigger').click();
    await page.locator('#branch-child-trigger').click();
    await page.locator('#branch-child-surface:popover-open').waitFor();
    await page.locator('#branch-outside').click();
    await page.waitForFunction(() => !document.querySelector('#branch-parent-surface')?.matches(':popover-open'));
    assert.equal(await page.locator('#branch-child-surface:popover-open').count(), 0, 'outside click closes the child surface');
    assert.deepEqual(await page.evaluate(() => window.menuBranchProtocol.state.childUpdates), [true, false], 'child emits one open and one close update');
    assert.deepEqual(await page.evaluate(() => window.menuBranchProtocol.state.parentUpdates), [true, false], 'outside cascade emits one parent close update');
    checks.push('external outside click closes the nested branch once');

    await page.locator('#branch-parent-trigger').click();
    await page.locator('#branch-child-trigger').click();
    await page.locator('#branch-grandchild-trigger').click();
    await page.locator('#branch-grandchild-surface:popover-open').waitFor();
    await page.locator('#branch-outside').click();
    await page.waitForFunction(() => !document.querySelector('#branch-parent-surface')?.matches(':popover-open'));
    assert.deepEqual(await page.evaluate(() => window.menuBranchProtocol.state.grandchildUpdates), [true, false], 'grandchild outside dismissal closes the complete three-level chain');
    assert.deepEqual(await page.evaluate(() => window.menuBranchProtocol.state.childUpdates), [true, false, true, false], 'middle menu remains registered until its descendant closes');
    assert.deepEqual(await page.evaluate(() => window.menuBranchProtocol.state.parentUpdates), [true, false, true, false], 'three-level cascade reaches the outer menu');
    checks.push('three-level external click cascade survives lazy descendant unmount');

    await page.locator('#branch-parent-trigger').click();
    await page.locator('#branch-child-trigger').click();
    await page.locator('#branch-parent-area').click();
    await page.waitForFunction(() => !document.querySelector('#branch-child-surface')?.matches(':popover-open'));
    assert.equal(await page.locator('#branch-parent-surface:popover-open').count(), 1, 'clicking inside the parent closes only its child');
    checks.push('click inside a parent stops ancestor closure');

    await page.locator('#branch-child-trigger').click();
    await page.evaluate(() => { window.menuBranchProtocol.state.parentPersistent = true; });
    await page.locator('#branch-outside').click();
    await page.waitForFunction(() => !document.querySelector('#branch-child-surface')?.matches(':popover-open'));
    await page.waitForTimeout(70);
    assert.equal(await page.locator('#branch-parent-surface:popover-open').count(), 1, 'persistent parent remains open after child outside dismissal');
    checks.push('persistent ancestor blocks outside cascade');

    await page.evaluate(() => { window.menuBranchProtocol.state.parentPersistent = false; window.menuBranchProtocol.state.branchParent = false; });
    await page.waitForFunction(() => !document.querySelector('#branch-parent-surface')?.matches(':popover-open'));
    await page.locator('#dialog-parent-trigger').click();
    await page.locator('#dialog-boundary-open').click();
    await page.locator('dialog.ui-dialog[open]').waitFor();
    await page.locator('#dialog-boundary-child-trigger').click();
    await page.locator('#dialog-boundary-item').click();
    await page.waitForFunction(() => !document.querySelector('#dialog-boundary-child-trigger')?.getAttribute('aria-expanded') || document.querySelector('#dialog-boundary-child-trigger')?.getAttribute('aria-expanded') === 'false');
    assert.equal(await page.locator('#dialog-parent-menu:popover-open').count(), 1, 'menu inside Dialog closes without reaching the outer Menu context');
    checks.push('Dialog null boundary isolates nested menu item closure');

    await page.evaluate(() => { window.menuBranchProtocol.state.dialogOpen = false; window.menuBranchProtocol.state.dialogParent = false; });
    await page.waitForFunction(() => !document.querySelector('#dialog-parent-menu')?.matches(':popover-open'));
    await page.locator('#branch-parent-trigger').click();
    await page.locator('#branch-child-trigger').click();
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.activeElement?.id === 'branch-child-item');
    await page.evaluate(() => { window.menuBranchProtocol.state.branchParent = false; });
    await page.waitForFunction(() => !document.querySelector('#branch-parent-surface')?.matches(':popover-open'));
    await page.waitForFunction(() => document.querySelector('#branch-parent-surface')?.getAttribute('data-state') === 'closed');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'branch-parent-trigger', 'parent closure restores focus to its outer trigger only');
    checks.push('keyboard close restores focus to the outermost trigger');

    await page.evaluate(() => { window.menuBranchProtocol.state.keepMounted = true; });
    await page.locator('#keep-parent-surface:popover-open').waitFor();
    await page.locator('#keep-child-surface:popover-open').waitFor();
    await page.waitForFunction(() => document.body.style.overflow !== 'clip');
    await page.evaluate(() => { window.menuBranchProtocol.state.keepMounted = false; });
    await page.waitForFunction(() => !document.querySelector('#keep-child-surface')?.matches(':popover-open'));
    await page.waitForFunction(() => document.body.style.overflow === 'clip');
    assert.deepEqual(await page.evaluate(() => window.menuBranchProtocol.state.keepParentUpdates), [false], 'KeepAlive deactivation emits one controlled parent close');
    assert.deepEqual(await page.evaluate(() => window.menuBranchProtocol.state.keepChildUpdates), [false], 'KeepAlive deactivation emits one controlled child close');
    await page.evaluate(() => { window.menuBranchProtocol.state.keepMounted = true; });
    await page.waitForTimeout(80);
    assert.equal(await page.locator('#keep-parent-trigger').count(), 1, 'cached menu branch reactivates');
    assert.equal(await page.locator(':popover-open').count(), 0, 'stale controlled true values do not reopen on reactivation');
    await page.evaluate(() => { window.menuBranchProtocol.state.keepParent = false; window.menuBranchProtocol.state.keepChild = false; });
    await page.waitForTimeout(30);
    await page.evaluate(() => { window.menuBranchProtocol.state.keepParent = true; window.menuBranchProtocol.state.keepChild = true; });
    await page.locator('#keep-child-surface:popover-open').waitFor();
    await page.evaluate(() => { window.menuBranchProtocol.state.keepParent = false; window.menuBranchProtocol.state.keepChild = false; });
    await page.waitForFunction(() => !document.querySelector('#keep-parent-trigger')?.closest('.ui-menu')?.querySelector(':popover-open'));
    await page.waitForFunction(() => document.body.style.overflow === 'clip');
    checks.push('KeepAlive deactivation releases popovers and locks, and requires fresh controlled values to reopen');

    const capturePage = await browser.newPage({ viewport: { width: 1200, height: 860 } });
    captureBrowserErrors(capturePage);
    await capturePage.goto(`http://127.0.0.1:${server.httpServer.address().port}/__menu_branch_demo__`);
    await capturePage.locator('[data-menu-branch-demo]').waitFor();
    await capturePage.getByRole('button', { name: '打开父菜单' }).click();
    await capturePage.getByRole('menu', { name: '打开父菜单' }).waitFor();
    await capturePage.getByRole('button', { name: '打开子菜单' }).click();
    await capturePage.getByRole('menu', { name: '打开子菜单' }).waitFor();

    const screenshotReports = [];
    async function waitForSettledSurfaces(targetPage) {
        await targetPage.evaluate(() => { window.__menuVisualStableFrames = 0; });
        await targetPage.waitForFunction(() => {
            const surfaces = [...document.querySelectorAll(':popover-open, dialog[open]')];
            const ready = surfaces.length >= 2 && surfaces.every(surface =>
                surface.getAttribute('data-state') === 'open' &&
                Number.parseFloat(getComputedStyle(surface).opacity) >= 0.99 &&
                surface.getAnimations({ subtree: true }).every(animation => animation.playState === 'finished')
            );
            window.__menuVisualStableFrames = ready ? (window.__menuVisualStableFrames ?? 0) + 1 : 0;
            return window.__menuVisualStableFrames >= 3;
        });
    }
    async function settleAndCapture(file, theme, zoom) {
        await capturePage.waitForFunction(() => {
            const surfaces = [...document.querySelectorAll(':popover-open, dialog[open]')];
            return surfaces.length >= 2 && surfaces.every(surface => surface.getAttribute('data-state') === 'open');
        });
        await waitForSettledSurfaces(capturePage);
        const surfaces = await capturePage.evaluate(() => [...document.querySelectorAll(':popover-open, dialog[open]')].map(surface => ({
            id: surface.id || surface.tagName.toLowerCase(),
            tag: surface.tagName.toLowerCase(),
            state: surface.getAttribute('data-state'),
            opacity: getComputedStyle(surface).opacity,
            backdropOpacity: surface instanceof HTMLDialogElement ? getComputedStyle(surface, '::backdrop').opacity : null,
            backdropColor: surface instanceof HTMLDialogElement ? getComputedStyle(surface, '::backdrop').backgroundColor : null,
            animationStates: surface.getAnimations({ subtree: true }).map(animation => ({ state: animation.playState, currentTime: animation.currentTime, endTime: animation.effect?.getComputedTiming().endTime }))
        })));
        assert.ok(surfaces.length >= 2, 'screenshot has open parent and child native surfaces');
        assert.ok(surfaces.every(surface => surface.state === 'open' && Number(surface.opacity) >= 0.99), 'all captured native surfaces are fully visible');
        assert.ok(surfaces.every(surface => surface.animationStates.every(animation => animation.state === 'finished')), `all captured native surface animations have finished: ${JSON.stringify(surfaces)}`);
        const outputPath = path.join(evidence, file);
        await capturePage.screenshot({ path: outputPath, fullPage: false });
        screenshotReports.push({ file, viewport: capturePage.viewportSize(), theme, cssZoom: zoom, surfaces });
    }

    await settleAndCapture('menu-branch-light-wide.png', 'light', '100%');
    checks.push('isolated real MenuBranchDemo light wide capture waits for open state, finished animations, and opacity 1');

    await capturePage.setViewportSize({ width: 390, height: 844 });
    await capturePage.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    await settleAndCapture('menu-branch-dark-390.png', 'dark', '100%');
    checks.push('isolated real MenuBranchDemo dark 390px capture waits for fully open surfaces');

    await capturePage.evaluate(() => {
        document.documentElement.dataset.theme = 'light';
        document.body.style.zoom = '125%';
    });
    await settleAndCapture('menu-branch-light-390-zoom125.png', 'light', '125%');
    checks.push('isolated real MenuBranchDemo CSS zoom 125% capture waits for fully open surfaces');

    await capturePage.getByRole('button', { name: '打开独立对话框' }).click();
    await capturePage.locator('dialog.ui-dialog[open]').waitFor();
    await capturePage.waitForFunction(() => [...document.querySelectorAll(':popover-open, dialog[open]')]
        .every(surface => surface.getAttribute('data-state') === 'open'));
    await waitForSettledSurfaces(capturePage);
    await capturePage.waitForFunction(() => [...document.querySelectorAll(':popover-open, dialog[open]')]
        .every(surface => Number.parseFloat(getComputedStyle(surface).opacity) >= 0.99));
    const dialogSurfaces = await capturePage.evaluate(() => [...document.querySelectorAll(':popover-open, dialog[open]')].map(surface => ({
        id: surface.id || surface.tagName.toLowerCase(),
        tag: surface.tagName.toLowerCase(),
        state: surface.getAttribute('data-state'),
        opacity: getComputedStyle(surface).opacity,
        backdropOpacity: surface instanceof HTMLDialogElement ? getComputedStyle(surface, '::backdrop').opacity : null,
        backdropColor: surface instanceof HTMLDialogElement ? getComputedStyle(surface, '::backdrop').backgroundColor : null,
        animationStates: surface.getAnimations({ subtree: true }).map(animation => ({ state: animation.playState, currentTime: animation.currentTime, endTime: animation.effect?.getComputedTiming().endTime }))
    })));
    assert.ok(dialogSurfaces.some(surface => surface.tag === 'dialog' && surface.state === 'open' && Number(surface.opacity) >= 0.99), 'Dialog capture includes a fully visible open dialog');
    assert.ok(dialogSurfaces.every(surface => surface.animationStates.every(animation => animation.state === 'finished')), 'Dialog capture waits for all surface animations');
    await capturePage.screenshot({ path: path.join(evidence, 'menu-branch-dialog-open.png'), fullPage: false });
    screenshotReports.push({ file: 'menu-branch-dialog-open.png', viewport: capturePage.viewportSize(), theme: 'light', cssZoom: '125%', surfaces: dialogSurfaces });
    checks.push('isolated real MenuBranchDemo Dialog capture waits for open state, finished animations, and opacity 1');

    const afterHashes = await sourceHashes();
    assert.deepEqual(warnings, [], 'no Vue warnings');
    assert.deepEqual(errors, [], 'no browser errors');
    const report = { checks, beforeHashes, afterHashes, screenshots: screenshotReports, evidence, warnings, errors };
    await writeFile(path.join(evidence, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
} finally {
    await browser?.close();
    await server.close();
}

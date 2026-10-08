import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/overlay-protocols');
await mkdir(evidence, { recursive: true });
const files = ['UOverlay.vue', 'UiMenu.vue', 'UiDialog.vue', 'menu.ts', 'overlay-lifecycle.ts'];
const sourceHashes = Object.fromEntries(await Promise.all(files.map(async file => [
    file,
    createHash('sha256').update(await readFile(path.resolve('src/ui', file))).digest('hex')
])));

const fixture = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body><div id="app"></div><script type="module">
    import { createApp, defineComponent, h, isRef, reactive, ref } from 'vue';
    import * as UI from '/src/ui/index.ts';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const state = reactive({
        overlayOpen: false, overlayDisabled: false, overlayUpdates: [], overlayOutside: 0, overlayKeys: 0, overlayEnters: 0, overlayLeaves: 0,
        externalSelector: '#external-one', externalMounted: true, externalClicks: 0, externalMenuSelector: '#external-menu', externalMenuMounted: true, externalMenuClicks: 0,
        focusOpen: false, focusUpdates: [], focusLeaves: 0,
        menuDisabled: false, menuClicks: 0, menuUpdates: [], arrowOpen: false, hoverOpen: false,
        dialogOpen: false, dialogDisabled: false, dialogUpdates: [], dialogLeaves: 0, dialogEnters: 0, innerDialogOpen: false,
        freeDialog: false, freeDialogFullscreen: false, captureOverlay: false, contentSlotRef: false, dialogContentSlotRef: false
    });
    const overlayRef = ref();
    const eagerOverlayRef = ref();
    const dialogRef = ref();
    let overlaySlotIsRef = false;
    let menuSlotIsRef = false;
    let dialogSlotIsRef = false;
    const ui = UI.createUI();

    const Root = defineComponent({
        setup() {
            return () => h('main', { id: 'protocols' }, [
                h('button', { id: 'external-one', class: 'external-original', 'aria-haspopup': 'baseline', 'aria-expanded': 'baseline' }, 'External one'),
                h('button', { id: 'external-two', class: 'external-two-original', 'aria-haspopup': 'second-baseline', 'aria-expanded': 'second-baseline' }, 'External two'),
                h('button', { id: 'external-menu', class: 'external-menu-original', 'aria-haspopup': 'menu-baseline' }, 'External menu'),
                h('button', { id: 'external-menu-two', class: 'external-menu-two-original', 'aria-haspopup': 'menu-two-baseline' }, 'External menu two'),
                h('button', { id: 'dismiss', type: 'button' }, 'Dismiss menus'),
                h(UI.UOverlay, {
                    key: 'overlay-main',
                    ref: overlayRef,
                    modelValue: state.overlayOpen,
                    disabled: state.overlayDisabled,
                    persistent: true,
                    openDelay: 40,
                    closeDelay: 35,
                    contentProps: { 'data-protocol-content': 'overlay', 'aria-label': 'Overlay protocol content' },
                    'onUpdate:modelValue': value => { state.overlayUpdates.push(value); state.overlayOpen = value; },
                    'onClick:outside': () => state.overlayOutside++,
                    onKeydown: () => state.overlayKeys++,
                    onAfterEnter: () => state.overlayEnters++,
                    onAfterLeave: () => state.overlayLeaves++
                }, {
                    activator: scope => {
                        overlaySlotIsRef = isRef(scope.isActive);
                        return h('button', { ...scope.props, id: 'overlay-trigger', type: 'button' }, 'Open overlay');
                    },
                    default: scope => { state.contentSlotRef = isRef(scope.isActive); return h('div', { id: 'overlay-content' }, [h('button', { id: 'overlay-action' }, 'Overlay action')]); }
                }),
                state.externalMounted ? h(UI.UOverlay, {
                    key: 'overlay-external',
                    activator: state.externalSelector,
                    activatorProps: { class: 'bound-activator', 'data-bound': 'yes', onClick: () => state.externalClicks++ },
                    contentProps: { 'data-external-content': 'yes' }
                }, { default: scope => h('div', { id: 'external-overlay-content' }, [
                    h('span', 'External overlay'),
                    h('button', { id: 'external-overlay-close', type: 'button', onClick: scope.close }, 'Close external overlay')
                ]) }) : null,
                state.externalMenuMounted ? h(UI.UMenu, {
                    key: 'menu-external',
                    activator: state.externalMenuSelector,
                    activatorProps: { class: 'external-menu-bound', 'data-menu-bound': 'yes', onClick: () => state.externalMenuClicks++ },
                    contentProps: { 'data-external-menu-content': 'yes' }
                }, { default: () => h('div', { id: 'external-menu-content' }, 'External menu content') }) : null,
                h(UI.UOverlay, { key: 'overlay-eager', ref: eagerOverlayRef, eager: true, openOnClick: false }, {
                    activator: scope => h('button', { ...scope.props, id: 'eager-overlay-trigger', type: 'button' }, 'Eager overlay'),
                    default: () => h('div', { id: 'eager-overlay-content' }, 'Eager overlay content')
                }),
                h(UI.UOverlay, {
                    key: 'overlay-focus',
                    openOnClick: false,
                    openOnFocus: true,
                    openDelay: 30,
                    closeDelay: 20,
                    'onUpdate:modelValue': value => { state.focusUpdates.push(value); state.focusOpen = value; },
                    onAfterLeave: () => state.focusLeaves++
                }, {
                    activator: scope => h('button', { ...scope.props, id: 'focus-trigger', type: 'button' }, 'Focus opens overlay'),
                    default: () => h('button', { id: 'focus-content', type: 'button' }, 'Focus content')
                }),
                h(UI.UMenu, {
                    key: 'menu-keep',
                    disabled: state.menuDisabled,
                    closeOnContentClick: false,
                    contentProps: { 'data-protocol-menu': 'keep-open' },
                    'onUpdate:open': value => state.menuUpdates.push(value)
                }, {
                    activator: scope => {
                        menuSlotIsRef = isRef(scope.isActive);
                        return h('button', { ...scope.props, id: 'keep-menu-trigger', type: 'button' }, 'Keep menu');
                    },
                    default: () => h(UI.UMenuItem, { id: 'keep-menu-item', onClick: () => state.menuClicks++ }, () => 'Keep open item')
                }),
                h(UI.UMenu, { key: 'menu-arrow', label: 'Arrow menu', open: state.arrowOpen, 'onUpdate:open': value => { state.arrowOpen = value; } }, {
                    activator: scope => h('button', { ...scope.props, id: 'arrow-trigger', type: 'button' }, 'Arrow menu'),
                    default: () => [
                        h(UI.UMenuItem, { id: 'disabled-menu-item', disabled: true }, () => 'Disabled item'),
                        h(UI.UMenuItem, { id: 'enabled-menu-item' }, () => 'Enabled item')
                    ]
                }),
                h(UI.UMenu, { key: 'menu-outer', label: 'Outer menu' }, {
                    activator: scope => h('button', { ...scope.props, id: 'outer-menu-trigger', type: 'button' }, 'Outer menu'),
                    default: () => h('div', [
                        h(UI.UMenu, { key: 'menu-child-first', label: 'First child menu' }, {
                            activator: scope => h('button', { ...scope.props, id: 'first-child-trigger', type: 'button' }, 'First child'),
                            default: () => h(UI.UMenuItem, { id: 'first-child-item' }, () => 'First child item')
                        }),
                        h(UI.UMenu, { key: 'menu-child-second', label: 'Second child menu' }, {
                            activator: scope => h('button', { ...scope.props, id: 'second-child-trigger', type: 'button' }, 'Second child'),
                            default: () => h(UI.UMenuItem, { id: 'second-child-item' }, () => 'Second child item')
                        })
                    ])
                }),
                h(UI.UMenu, { key: 'menu-hover', label: 'Hover menu', openOnHover: true }, {
                    activator: scope => h('button', { ...scope.props, id: 'hover-menu-trigger', type: 'button' }, 'Hover menu'),
                    default: () => h('div', { id: 'hover-menu-content' }, 'Hover content')
                }),
                h(UI.ULocaleProvider, {
                    key: 'dialog-locale',
                    locale: 'en',
                    messages: { en: { 'dialog.contentLabel': 'Scoped dialog label' } }
                }, {
                    default: () => h(UI.UDialog, {
                        key: 'dialog-main',
                        ref: dialogRef,
                        modelValue: state.dialogOpen,
                        disabled: state.dialogDisabled,
                        scrollable: true,
                        fullscreen: true,
                        contentProps: { 'data-dialog-props': 'merged', class: 'dialog-props-class' },
                        onAfterEnter: () => state.dialogEnters++,
                        onAfterLeave: () => state.dialogLeaves++,
                        'onUpdate:modelValue': value => { state.dialogUpdates.push(value); state.dialogOpen = value; }
                    }, {
                        activator: scope => {
                            dialogSlotIsRef = isRef(scope.isActive);
                            return h('button', { ...scope.props, id: 'dialog-trigger', type: 'button' }, 'Open dialog');
                        },
                        default: () => h('div', { id: 'dialog-content' }, [
                            h('button', { id: 'dialog-close', type: 'button', onClick: () => dialogRef.value.close() }, 'Close dialog'),
                            h(UI.UDialog, {
                                key: 'dialog-inner',
                                modelValue: state.innerDialogOpen,
                                'onUpdate:modelValue': value => { state.innerDialogOpen = value; }
                            }, {
                                activator: scope => h('button', { ...scope.props, id: 'inner-dialog-trigger', type: 'button' }, 'Open inner dialog'),
                                default: () => h('button', { id: 'inner-dialog-action' }, 'Inner dialog action')
                            })
                        ])
                    })
                }),
                h(UI.UOverlay, { key: 'capture-overlay', modelValue: state.captureOverlay, retainFocus: true, captureFocus: true, 'onUpdate:modelValue': value => state.captureOverlay = value }, {
                    default: () => h('button', { id: 'capture-action' }, 'Captured focus')
                }),
                h(UI.UDialog, { key: 'free-dialog', modelValue: state.freeDialog, retainFocus: false, persistent: true,
                    fullscreen: state.freeDialogFullscreen, size: 'xl', width: 320, height: 180, contentProps: { 'data-free-dialog': 'yes' },
                    'onUpdate:modelValue': value => state.freeDialog = value }, {
                    default: scope => { state.dialogContentSlotRef = isRef(scope.isActive); return h('button', { id: 'free-dialog-close', onClick: scope.close }, 'Free dialog'); }
                }),
                h(UI.UMenu, { key: 'menu-eager', eager: true, label: 'Eager menu' }, {
                    activator: scope => h('button', { ...scope.props, id: 'eager-menu-trigger', type: 'button' }, 'Eager menu'),
                    default: () => h('div', { id: 'eager-menu-content' }, 'Eager menu content')
                }),
                h(UI.UDialog, { key: 'dialog-eager', eager: true }, {
                    activator: scope => h('button', { ...scope.props, id: 'eager-dialog-trigger', type: 'button' }, 'Eager dialog'),
                    default: () => h('div', { id: 'eager-dialog-content' }, 'Eager dialog content')
                })
            ]);
        }
    });

    createApp(Root).use(ui).mount('#app');
    window.overlayProtocol = {
        state,
        slots: () => ({ overlay: overlaySlotIsRef, menu: menuSlotIsRef, dialog: dialogSlotIsRef }),
        closeOverlay: () => overlayRef.value.close(),
        openEagerOverlay: () => eagerOverlayRef.value.open(),
        closeEagerOverlay: () => eagerOverlayRef.value.close(),
        dialog: dialogRef
    };
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
server.middlewares.use('/__overlay__', async (_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(await server.transformIndexHtml('/__overlay__', fixture));
});

let browser;
const checks = [];
const warnings = [];
const errors = [];
try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'warning') warnings.push(message.text());
        if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__overlay__`);
    await page.waitForFunction(() => Boolean(window.overlayProtocol));
    assert.deepEqual(await page.evaluate(() => window.overlayProtocol.slots()), { overlay: true, menu: true, dialog: true }, 'all three public activator slots expose an isActive Ref');
    assert.equal(await page.locator('#overlay-content').count(), 0, 'Overlay content is lazy before activation');
    assert.equal(await page.locator('#dialog-content').count(), 0, 'Dialog content is lazy before activation');
    assert.equal(await page.locator('#eager-overlay-content').count(), 1, 'eager Overlay content stays mounted while closed');
    assert.equal(await page.locator('#eager-menu-content').count(), 1, 'eager Menu content stays mounted while closed');
    assert.equal(await page.locator('#eager-dialog-content').count(), 1, 'eager Dialog content stays mounted while closed');
    checks.push('public UOverlay/UMenu/UDialog activator slots expose refs and lazy content');

    await page.evaluate(() => { document.body.style.overflow = 'clip'; });
    await page.locator('#overlay-trigger').click();
    const overlay = page.locator('dialog.ui-overlay[data-protocol-content="overlay"]');
    await overlay.waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelector('#overlay-content'));
    await page.waitForFunction(() => window.overlayProtocol.state.overlayEnters === 1);
    assert.equal(await overlay.getAttribute('data-protocol-content'), 'overlay');
    assert.equal(await overlay.getAttribute('aria-label'), 'Overlay protocol content');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'clip', 'standalone Overlay defaults to scrollStrategy=none');
    assert.deepEqual(await page.evaluate(() => window.overlayProtocol.state.overlayUpdates), [true], 'controlled v-model emits update:modelValue');
    assert.equal(await page.evaluate(() => document.querySelector('dialog.ui-overlay[open]').matches(':modal')), false, 'Overlay is nonmodal by default');
    await page.locator('#dismiss').focus();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'dismiss', 'default Overlay permits focus outside');
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.contentSlotRef), true, 'default content exposes isActive Ref');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(30);
    assert.equal(await overlay.isVisible(), true, 'persistent Overlay remains open on Escape');
    await overlay.evaluate(element => element.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 })));
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.overlayOutside), 1, 'click:outside carries a real mouse event');
    assert.equal(await overlay.isVisible(), true, 'persistent Overlay remains open after outside click');
    await page.evaluate(() => { window.overlayProtocol.state.overlayOpen = false; });
    await page.waitForFunction(() => !document.querySelector('dialog.ui-overlay')?.open);
    await page.waitForFunction(() => !document.querySelector('#overlay-content'));
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.overlayLeaves), 1);
    await page.locator('#overlay-trigger').click();
    await overlay.waitFor({ state: 'visible' });
    await page.evaluate(() => { window.overlayProtocol.state.overlayDisabled = true; });
    await page.waitForFunction(() => !document.querySelector('dialog.ui-overlay')?.open);
    const updateValues = await page.evaluate(() => window.overlayProtocol.state.overlayUpdates);
    assert.equal(updateValues.at(-1), false, 'disabling an active Overlay emits a close update');
    await page.locator('#overlay-trigger').click();
    await page.waitForTimeout(50);
    assert.equal(await page.locator('dialog.ui-overlay[open]').count(), 0, 'disabled activator does not reopen Overlay');
    await page.evaluate(() => { window.overlayProtocol.state.overlayDisabled = false; });
    await page.locator('#overlay-trigger').click();
    await page.locator('dialog.ui-overlay[open]').waitFor();
    await page.evaluate(() => { window.overlayProtocol.state.overlayOpen = false; });
    await page.waitForFunction(() => !document.querySelector('dialog.ui-overlay')?.open);
    checks.push('Overlay v-model, lazy leave cleanup, outside payload, Escape persistence, disabled transition and none scroll lock');

    const externalOne = page.locator('#external-one');
    assert.equal(await externalOne.getAttribute('aria-haspopup'), 'dialog');
    assert.equal(await externalOne.getAttribute('data-bound'), 'yes');
    assert.match(await externalOne.getAttribute('class'), /external-original.*bound-activator/);
    await externalOne.click();
    await page.locator('#external-overlay-content').waitFor();
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.externalClicks), 1, 'activatorProps event merges with internal click behavior');
    await page.locator('#external-overlay-close').click();
    await page.waitForFunction(() => !document.querySelector('#external-overlay-content')?.closest('dialog')?.open);
    await page.waitForFunction(() => !document.querySelector('#external-overlay-content'));
    await page.evaluate(() => { window.overlayProtocol.state.externalSelector = '#external-two'; });
    await page.waitForFunction(() => document.querySelector('#external-one').getAttribute('aria-haspopup') === 'baseline' && document.querySelector('#external-two').getAttribute('aria-haspopup') === 'dialog');
    await externalOne.click();
    await page.waitForTimeout(50);
    assert.equal(await page.locator('#external-overlay-content').count(), 0, 'replaced activator no longer controls the Overlay');
    await page.locator('#external-two').click();
    await page.locator('#external-overlay-content').waitFor();
    await page.evaluate(() => { window.overlayProtocol.state.externalMounted = false; });
    await page.waitForFunction(() => document.querySelector('#external-two').getAttribute('aria-haspopup') === 'second-baseline');
    assert.match(await page.locator('#external-two').getAttribute('class'), /external-two-original/);
    assert.doesNotMatch(await page.locator('#external-two').getAttribute('class'), /bound-activator/);
    checks.push('external selector replacement, merged listeners/attrs and unmount restoration');

    const externalMenu = page.locator('#external-menu');
    assert.equal(await externalMenu.count(), 1, JSON.stringify(await page.evaluate(() => ({ menu: document.querySelector('#external-menu')?.outerHTML, root: document.querySelector('#protocols')?.innerHTML.slice(0, 1200) }))));
    assert.equal(await externalMenu.getAttribute('aria-haspopup'), 'menu');
    assert.equal(await externalMenu.getAttribute('data-menu-bound'), 'yes');
    await externalMenu.click();
    await page.locator('#external-menu-content').waitFor();
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.externalMenuClicks), 1);
    await page.locator('#dismiss').click();
    await page.waitForFunction(() => !document.querySelector('#external-menu-content')?.closest('.ui-menu-surface')?.matches(':popover-open'));
    await page.evaluate(() => { window.overlayProtocol.state.externalMenuSelector = '#external-menu-two'; });
    await page.waitForFunction(() => document.querySelector('#external-menu')?.getAttribute('aria-haspopup') === 'menu-baseline' && document.querySelector('#external-menu-two')?.getAttribute('aria-haspopup') === 'menu');
    assert.match(await externalMenu.getAttribute('class'), /external-menu-original/);
    assert.doesNotMatch(await externalMenu.getAttribute('class'), /external-menu-bound/);
    await externalMenu.click();
    await page.waitForTimeout(50);
    assert.equal(await page.locator('#external-menu-content').count(), 0, 'replaced Menu activator no longer controls the menu');
    await page.locator('#external-menu-two').click();
    await page.locator('#external-menu-content').waitFor();
    await page.locator('#dismiss').click();
    await page.waitForFunction(() => !document.querySelector('#external-menu-content')?.closest('.ui-menu-surface')?.matches(':popover-open'));
    await page.evaluate(() => { window.overlayProtocol.state.externalMenuMounted = false; });
    await page.waitForFunction(() => document.querySelector('#external-menu-two').getAttribute('aria-haspopup') === 'menu-two-baseline');
    assert.match(await page.locator('#external-menu-two').getAttribute('class'), /external-menu-two-original/);
    assert.doesNotMatch(await page.locator('#external-menu-two').getAttribute('class'), /external-menu-bound/);
    checks.push('external Menu selector binding, merged activator props and unmount restoration');

    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })));
    await page.locator('#focus-trigger').evaluate(element => element.focus());
    await page.waitForTimeout(45);
    assert.equal(await page.locator('#focus-content').count(), 1, 'openOnFocus follows keyboard focus and delay');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelectorAll('dialog.ui-overlay[open]').length === 0);
    await page.waitForFunction(() => !document.querySelector('#focus-content'));
    await page.waitForTimeout(50);
    assert.equal(await page.locator('dialog.ui-overlay[open]').count(), 0, 'restored keyboard focus does not reopen the focus-triggered Overlay: ' + JSON.stringify(await page.evaluate(() => ({ updates: window.overlayProtocol.state.focusUpdates, active: document.activeElement?.outerHTML, overlays: Array.from(document.querySelectorAll('dialog.ui-overlay')).map(element => ({ open: element.open, state: element.getAttribute('data-state'), html: element.outerHTML.slice(0, 250) })) }))));
    checks.push('Overlay keyboard focus open/close delay and focus transition cleanup');

    await page.evaluate(() => { document.body.style.overflow = 'scroll'; });
    await page.locator('#dialog-trigger').click();
    const dialog = page.locator('dialog.ui-dialog[data-dialog-props="merged"]');
    await dialog.waitFor({ state: 'visible' });
    await page.locator('#dialog-content').waitFor();
    await page.waitForFunction(() => window.overlayProtocol.state.dialogEnters === 1);
    assert.equal(await dialog.getAttribute('data-fullscreen'), 'true', 'fullscreen behavior marker reaches the native dialog shell');
    assert.equal(await dialog.getAttribute('data-dialog-props'), 'merged', 'contentProps are forwarded to the native dialog');
    assert.match(await dialog.getAttribute('class'), /dialog-props-class/);
    assert.equal(await dialog.locator('[aria-label="Scoped dialog label"]').count(), 1, 'Dialog reads the nearest ULocaleProvider');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Dialog defaults to scrollStrategy=block');
    await page.locator('#inner-dialog-trigger').click();
    await page.waitForFunction(() => document.querySelectorAll('dialog.ui-dialog[open]').length === 2);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelectorAll('dialog.ui-dialog[open]').length === 1);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'closing a nested Dialog keeps the parent scroll lock');
    assert.equal(await dialog.isVisible(), true, 'Escape closes only the topmost nested native Dialog');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog.ui-dialog')?.open);
    await page.waitForFunction(() => !document.querySelector('#dialog-content'));
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'scroll', 'dialog close releases its own body lock');
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.dialogUpdates.at(-1)), false);
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.dialogLeaves), 1);
    await page.locator('#dialog-trigger').click();
    await page.locator('dialog.ui-dialog[open]').waitFor();
    await page.evaluate(() => { window.overlayProtocol.state.dialogDisabled = true; });
    await page.waitForFunction(() => !document.querySelector('dialog.ui-dialog')?.open);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'scroll');
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.dialogLeaves), 2, 'disabling an active Dialog completes its leave lifecycle');
    await page.locator('#dialog-trigger').click();
    await page.waitForTimeout(40);
    assert.equal(await page.locator('dialog.ui-dialog[open]').count(), 0, 'disabled Dialog activator cannot reopen it');
    await page.evaluate(() => { window.overlayProtocol.state.dialogDisabled = false; });
    await page.locator('#dialog-trigger').click();
    await page.locator('dialog.ui-dialog[open]').waitFor();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog.ui-dialog')?.open);
    await page.waitForFunction(() => !document.querySelector('#dialog-content'));
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.dialogLeaves), 3);
    checks.push('Dialog local locale, standard lifecycle/model events, native Escape, lazy leave and block lock cleanup');

    await page.locator('#keep-menu-trigger').click();
    await page.waitForFunction(() => document.querySelector('#keep-menu-trigger')?.getAttribute('aria-expanded') === 'true');
    assert.equal(await page.locator('#keep-menu-item').count(), 1, 'menu lazy content mounts on open');
    await page.locator('#keep-menu-item').click();
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.menuClicks), 1);
    assert.equal(await page.locator('#keep-menu-trigger').getAttribute('aria-expanded'), 'true', 'MenuItem automatic close respects closeOnContentClick=false');
    assert.equal(await page.locator('.ui-menu-surface[data-protocol-menu="keep-open"]').getAttribute('data-scroll-strategy'), 'reposition', 'Menu default scroll strategy remains reposition');
    await page.evaluate(() => { window.overlayProtocol.state.menuDisabled = true; });
    await page.waitForFunction(() => document.querySelector('#keep-menu-trigger')?.getAttribute('aria-expanded') === 'false');
    await page.waitForFunction(() => !document.querySelector('#keep-menu-item'));
    await page.locator('#keep-menu-trigger').click();
    await page.waitForTimeout(40);
    assert.equal(await page.locator('#keep-menu-trigger').getAttribute('aria-expanded'), 'false', 'disabled Menu closes and refuses activator open');
    await page.evaluate(() => { window.overlayProtocol.state.menuDisabled = false; });
    await page.locator('#keep-menu-trigger').click();
    await page.locator('#keep-menu-item').waitFor();
    await page.locator('#dismiss').click();
    await page.waitForFunction(() => document.querySelector('#keep-menu-trigger')?.getAttribute('aria-expanded') === 'false');
    await page.waitForFunction(() => !document.querySelector('#keep-menu-item'));
    assert.equal((await page.evaluate(() => window.overlayProtocol.state.menuUpdates)).at(-1), false);
    checks.push('Menu disabled trigger, closeOnContentClick=false, external dismissal and lazy cleanup');

    await page.locator('#arrow-trigger').focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.activeElement?.id === 'enabled-menu-item');
    assert.equal(await page.locator('#disabled-menu-item').isDisabled(), true, 'openOnArrow skips disabled items');
    await page.keyboard.press('Tab');
    await page.waitForFunction(() => !document.querySelector('#enabled-menu-item')?.closest('.ui-menu-surface')?.matches(':popover-open'));
    await page.locator('#arrow-trigger').click();
    await page.locator('#enabled-menu-item').click();
    await page.waitForFunction(() => !document.querySelector('#enabled-menu-item')?.closest('.ui-menu-surface')?.matches(':popover-open'));
    checks.push('openOnArrow and keyboard navigation skip disabled menu items');

    await page.locator('#outer-menu-trigger').click();
    await page.locator('#first-child-trigger').click();
    await page.waitForFunction(() => document.querySelector('#first-child-item')?.closest('.ui-menu-surface')?.matches(':popover-open'));
    await page.locator('#second-child-trigger').click();
    await page.waitForFunction(() => document.querySelector('#second-child-item')?.closest('.ui-menu-surface')?.matches(':popover-open'));
    assert.equal(await page.locator('#first-child-item').count(), 0, 'opening a sibling closes and lazily unmounts the first nested menu');
    await page.locator('#outer-menu-trigger').click();
    await page.waitForFunction(() => document.querySelectorAll('.ui-menu-surface:popover-open').length === 0, null, { timeout: 3000 });
    checks.push('nested Menu siblings are mutually exclusive and parent close tears down open descendants');

    await page.locator('#hover-menu-trigger').hover();
    await page.waitForTimeout(180);
    assert.equal(await page.locator('#hover-menu-content').count(), 0, 'default Menu openDelay is 300ms');
    await page.waitForTimeout(180);
    await page.locator('#hover-menu-content').waitFor();
    await page.locator('#hover-menu-content').hover();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#hover-menu-content').count(), 1, 'default Menu closeDelay is 250ms');
    await page.waitForFunction(() => !document.querySelector('#hover-menu-content')?.closest('.ui-menu-surface')?.matches(':popover-open'));
    await page.waitForFunction(() => !document.querySelector('#hover-menu-content'));
    checks.push('Menu default 300/250ms hover delays and content hover transfer');

    await page.evaluate(() => window.overlayProtocol.openEagerOverlay());
    await page.locator('dialog.ui-overlay[open]').waitFor();
    await page.evaluate(() => window.overlayProtocol.closeEagerOverlay());
    await page.waitForFunction(() => !document.querySelector('dialog.ui-overlay[open]'));
    assert.equal(await page.locator('#eager-overlay-content').count(), 1);
    await page.locator('#eager-menu-trigger').click();
    await page.locator('#eager-menu-content').waitFor();
    await page.locator('#dismiss').click();
    await page.waitForFunction(() => !document.querySelector('#eager-menu-content')?.closest('.ui-menu-surface')?.matches(':popover-open'));
    assert.equal(await page.locator('#eager-menu-content').count(), 1);
    await page.locator('#eager-dialog-trigger').click();
    await page.locator('dialog.ui-dialog[open]').waitFor();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog.ui-dialog[open]'));
    assert.equal(await page.locator('#eager-dialog-content').count(), 1);
    checks.push('eager=true keeps Overlay/Menu/Dialog slot content mounted after close');

    await page.evaluate(() => { window.overlayProtocol.state.captureOverlay = true; });
    await page.locator('#capture-action').waitFor();
    await page.waitForFunction(() => document.activeElement.id === 'capture-action');
    await page.locator('#dismiss').evaluate(element => element.focus());
    assert.equal(await page.evaluate(() => document.activeElement.id), 'capture-action', 'explicit retainFocus keeps native focus containment');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#capture-action'));
    await page.evaluate(() => { window.overlayProtocol.state.freeDialog = true; });
    const freeDialog = page.locator('dialog[data-free-dialog]');
    await page.waitForFunction(() => document.querySelector('dialog[data-free-dialog]').dataset.state === 'open');
    assert.equal(await page.evaluate(() => window.overlayProtocol.state.dialogContentSlotRef), true);
    assert.equal(await freeDialog.evaluate(element => element.matches(':modal')), false);
    let bounds = await freeDialog.boundingBox();
    assert.equal(Math.round(bounds.width), 320, 'explicit width overrides size');
    assert.equal(Math.round(bounds.height), 180, 'explicit height is consumed');
    await page.locator('#dismiss').focus();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'dismiss', 'retainFocus=false permits focus outside Dialog');
    await page.evaluate(() => { window.overlayProtocol.state.freeDialogFullscreen = true; });
    await page.waitForFunction(() => document.querySelector('dialog[data-free-dialog]').offsetWidth === innerWidth);
    bounds = await freeDialog.boundingBox();
    assert.deepEqual([Math.round(bounds.x), Math.round(bounds.y), Math.round(bounds.width), Math.round(bounds.height)], [0, 0, 1100, 900], 'fullscreen overrides size and dimensions');
    await page.evaluate(() => { window.overlayProtocol.state.freeDialog = false; });
    await page.waitForFunction(() => !document.querySelector('#free-dialog-close'));
    assert.equal(await page.evaluate(() => document.activeElement.id), 'dismiss', 'closing nonmodal content preserves external focus');
    checks.push('standard nonmodal Overlay, explicit focus capture, Dialog dimensions/fullscreen and content Ref slots');

    for (const [name, theme, width] of [['light-390', 'light', 390], ['dark-390', 'dark', 390]]) {
        await page.evaluate(themeName => { document.documentElement.dataset.theme = themeName; }, theme);
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => { document.body.style.zoom = '125%'; });
        await page.locator('#outer-menu-trigger').click();
        await page.locator('#first-child-trigger').click();
        await page.screenshot({ path: path.join(evidence, `${name}-125.png`), fullPage: true });
        await page.locator('#outer-menu-trigger').click();
        await page.waitForFunction(() => document.querySelectorAll('.ui-menu-surface:popover-open').length === 0);
        await page.evaluate(() => { document.body.style.zoom = ''; });
    }
    assert.deepEqual(errors, [], `browser errors: ${errors.join('\n')}`);
    assert.deepEqual(warnings, [], `Vue/runtime warnings: ${warnings.join('\n')}`);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ checks, warnings, errors, sourceHashes, screenshots: ['light-390-125.png', 'dark-390-125.png'], visualAcceptance: false }, null, 4));
    process.stdout.write(JSON.stringify({ checks: checks.length, warnings: warnings.length, errors: errors.length, evidence }));
} finally {
    await browser?.close();
    await server.close();
}

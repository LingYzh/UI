import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium, type Browser } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';

const fixture = String.raw`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><link rel="icon" href="data:,"><title>Speed dial behavior fixture</title></head>
<body>
    <div id="app"></div>
    <script type="module">
        import { createApp, defineComponent, h, nextTick, reactive } from 'vue';
        import USpeedDial from '/src/ui/USpeedDial.vue';
        import UFab from '/src/ui/UFab.vue';
        import { appLayoutKey, createAppLayout } from '/src/ui/layout-completion.ts';

        const state = reactive({
            open: false,
            direction: 'top',
            disabled: false,
            fabModel: false,
            fabActive: true
        });
        const layout = createAppLayout();
        window.speedDialFixture = {
            setOpen(value) { state.open = value; },
            setDirection(value) { state.direction = value; },
            async setDisabled(value) { state.disabled = value; await nextTick(); },
            async setFab(modelValue, active) {
                state.fabModel = modelValue;
                state.fabActive = active;
                await nextTick();
                return layout.offsets.value.bottom;
            },
            isOpen() { return state.open; },
            bottomOffset() { return layout.offsets.value.bottom; }
        };

        const Host = defineComponent({
            setup() {
                return () => h('main', [
                    h(USpeedDial, {
                        id: 'dial',
                        modelValue: state.open,
                        direction: state.direction,
                        disabled: state.disabled,
                        'onUpdate:modelValue': value => state.open = value
                    }, {
                        default: () => [
                            h('button', { id: 'action-first', type: 'button' }, 'First'),
                            h('button', { id: 'action-disabled', type: 'button', disabled: true }, 'Disabled'),
                            h('button', { id: 'action-last', type: 'button' }, 'Last')
                        ]
                    }),
                    h('button', { id: 'outside', type: 'button' }, 'Outside'),
                    h('div', { id: 'fab-probe' }, [
                        h(UFab, {
                            modelValue: state.fabModel,
                            'onUpdate:modelValue': value => state.fabModel = value,
                            active: state.fabActive,
                            app: true,
                            layout: true,
                            location: 'bottom end',
                            order: 20
                        })
                    ])
                ]);
            }
        });

        const app = createApp(Host);
        app.provide(appLayoutKey, layout);
        app.mount('#app');
    </script>
</body>
</html>`;

test('SpeedDial keyboard, dismissal, direction, slot structure and UFab visibility', async () => {
    let server: ViteDevServer | undefined;
    let browser: Browser | undefined;
    const pageErrors: string[] = [];

    try {
        server = await createServer({
            root: process.cwd(),
            cacheDir: 'node_modules/.vite-speed-dial-test',
            optimizeDeps: { noDiscovery: true, include: [] },
            server: { host: '127.0.0.1', port: 0, hmr: false },
            plugins: [{
                name: 'speed-dial-behavior-fixture',
                configureServer(viteServer) {
                    viteServer.middlewares.use(async (request, response, next) => {
                        if (request.url?.split('?')[0] !== '/__speed-dial-behavior') {
                            next();
                            return;
                        }
                        try {
                            response.setHeader('Content-Type', 'text/html; charset=utf-8');
                            response.end(await viteServer.transformIndexHtml('/__speed-dial-behavior', fixture));
                        } catch (error) {
                            next(error);
                        }
                    });
                }
            }]
        });
        await server.listen();
        browser = await chromium.launch({ channel: 'chrome', headless: true });
        const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
        page.on('pageerror', (error) => pageErrors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') pageErrors.push(message.text());
        });
        const baseUrl = server.resolvedUrls?.local[0];
        assert.ok(baseUrl, 'Vite should expose a local fixture URL');
        await page.goto(`${baseUrl}__speed-dial-behavior`, { waitUntil: 'domcontentloaded' });

        const dial = page.locator('#dial');
        const trigger = dial.locator('.u-fab');
        const actions = dial.locator('.u-speed-dial-actions');
        await trigger.waitFor({ state: 'visible' });
        assert.equal(await dial.getAttribute('data-direction'), 'top');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        assert.equal(await trigger.getAttribute('aria-label'), '快捷操作');
        assert.equal(await trigger.locator('.icon').count(), 1, 'the default UFab trigger should render its plus icon');
        assert.equal(await actions.count(), 0, 'closed actions should not be mounted into the tab order');

        await trigger.click();
        await actions.waitFor({ state: 'visible' });
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
        assert.deepEqual(
            await actions.evaluate((element) => Array.from(element.children, (child) => child.id)),
            ['action-first', 'action-disabled', 'action-last'],
            'slot VNodes remain direct children for nth-child step animations'
        );

        await trigger.click();
        await actions.waitFor({ state: 'detached' });
        await trigger.focus();
        await page.keyboard.press('Enter');
        await actions.waitFor({ state: 'visible' });
        await page.waitForFunction(() => document.activeElement?.id === 'action-first');
        await page.keyboard.press('ArrowUp');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'action-last', 'directional navigation skips disabled actions');
        await page.keyboard.press('ArrowUp');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'action-first', 'directional navigation wraps across enabled actions');
        await page.keyboard.press('End');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'action-last');
        await page.keyboard.press('Home');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'action-first');
        await page.keyboard.press('Escape');
        await actions.waitFor({ state: 'detached' });
        assert.equal(await trigger.evaluate((element) => element === document.activeElement), true, 'Escape returns focus to the trigger');

        await page.evaluate(() => (window as any).speedDialFixture.setDirection('left'));
        assert.equal(await dial.getAttribute('data-direction'), 'left');
        await trigger.focus();
        await page.keyboard.press('ArrowLeft');
        await actions.waitFor({ state: 'visible' });
        await page.waitForFunction(() => document.activeElement?.id === 'action-first');
        await page.keyboard.press('ArrowLeft');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'action-last', 'horizontal direction uses horizontal arrows');
        await page.keyboard.press('Escape');
        await actions.waitFor({ state: 'detached' });

        await trigger.click();
        await actions.waitFor({ state: 'visible' });
        await page.locator('#outside').click();
        await actions.waitFor({ state: 'detached' });
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'outside', 'outside pointer dismissal preserves the outside click focus');

        await trigger.click();
        await actions.waitFor({ state: 'visible' });
        await trigger.click();
        await actions.waitFor({ state: 'detached' });
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'outside', 'closed actions are not a Tab stop');

        await page.evaluate(() => (window as any).speedDialFixture.setOpen(true));
        await actions.waitFor({ state: 'visible' });
        await page.evaluate(async () => (window as any).speedDialFixture.setDisabled(true));
        await actions.waitFor({ state: 'detached' });
        assert.equal(await page.evaluate(() => (window as any).speedDialFixture.isOpen()), false, 'becoming disabled closes an open SpeedDial');
        assert.equal(await trigger.isDisabled(), true);

        const fab = page.locator('#fab-probe .u-fab-container');
        const waitForFabVisibility = (expected: boolean) => page.waitForFunction((isExpectedVisible) => {
            const element = document.querySelector('#fab-probe .u-fab-container');
            const visible = element !== null && getComputedStyle(element).display !== 'none';
            return visible === isExpectedVisible;
        }, expected);
        assert.equal(await fab.evaluate((element) => getComputedStyle(element).display), 'none', 'modelValue=false hides UFab');
        assert.equal(await page.evaluate(() => (window as any).speedDialFixture.bottomOffset()), 0, 'a hidden UFab contributes no layout offset');
        const visibleOffset = await page.evaluate(() => (window as any).speedDialFixture.setFab(true, true));
        assert.ok(visibleOffset > 0, 'a visible app UFab registers its layout size');
        await waitForFabVisibility(true);
        const inactiveOffset = await page.evaluate(() => (window as any).speedDialFixture.setFab(true, false));
        assert.equal(inactiveOffset, 0, 'active=false also removes the UFab layout offset');
        await waitForFabVisibility(false);
        const activeOffset = await page.evaluate(() => (window as any).speedDialFixture.setFab(true, true));
        assert.ok(activeOffset > 0);
        await waitForFabVisibility(true);
        const modelHiddenOffset = await page.evaluate(() => (window as any).speedDialFixture.setFab(false, true));
        assert.equal(modelHiddenOffset, 0, 'modelValue=false removes the UFab layout offset');
        await waitForFabVisibility(false);
        assert.deepEqual(pageErrors, [], 'real SFC fixture should not emit browser errors');
    } finally {
        await browser?.close();
        await server?.close();
    }
});

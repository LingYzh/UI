import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'ui-pull-refresh-state-'));
const fixture = [
    '<!doctype html><html><head><meta charset="utf-8"><style>html, body { margin: 0; min-height: 1800px; } #outer-scroll { height: 240px; overflow-y: auto; } #pull-root { height: 120px; overflow-y: auto; } #refresh-content { height: 500px; }</style></head><body><div id="app"></div><script type="module">',
    "import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue';",
    "import { usePullRefreshState } from '/src/ui/pull-refresh-state.ts';",
    'const props = reactive({ disabled: false, threshold: undefined, pullDownThreshold: undefined, resistance: undefined, synchronousDone: false });',
    'const calls = ref([]);',
    'let state;',
    'const app = createApp(defineComponent({',
    '    setup() {',
    '        state = usePullRefreshState(() => props, context => {',
    '            const call = { context, refreshingAtEmit: state.refreshing.value };',
    '            calls.value.push(call);',
    '            if (props.synchronousDone) context.done();',
    '        });',
    '        return () => h("div", { id: "outer-scroll" }, [',
    '            h("div", { style: { height: "120px" } }),',
    '            h("div", {',
    '                id: "pull-root", ref: state.root,',
    '                onMousedown: event => state.begin(event),',
    '                onMousemove: event => state.move(event),',
    '                onMouseup: event => state.end(event),',
    '                onMouseleave: event => state.end(event),',
    '                onTouchstart: event => state.begin(event),',
    '                onTouchmove: event => state.move(event),',
    '                onTouchend: event => state.end(event),',
    '                onTouchcancel: () => state.cancel()',
    '            }, [h("div", { id: "refresh-content" })]),',
    '            h("div", { style: { height: "120px" } })',
    '        ]);',
    '    }',
    '}));',
    'app.mount("#app");',
    'function touch(identifier, clientX, clientY) { return { identifier, clientX, clientY }; }',
    'function touchEvent(type, touches, changedTouches = touches) {',
    '    const event = new Event(type, { bubbles: true, cancelable: true });',
    '    Object.defineProperties(event, { touches: { value: touches }, changedTouches: { value: changedTouches } });',
    '    return event;',
    '}',
    'function read() {',
    '    return {',
    '        distance: state.distance.value, refreshing: state.refreshing.value, canRefresh: state.canRefresh.value,',
    '        goingUp: state.goingUp.value, threshold: state.threshold.value,',
    '        rootScrollTop: state.root.value?.scrollTop ?? null,',
    '        parentScrollTop: document.querySelector("#outer-scroll")?.scrollTop ?? null,',
    '        documentScrollTop: document.scrollingElement?.scrollTop ?? 0',
    '    };',
    '}',
    'window.pullRefreshFixture = {',
    '    state, props, calls, read,',
    '    async setProps(values) { Object.assign(props, values); await nextTick(); return read(); },',
    '    mouse(type, clientX, clientY, button = 0) {',
    '        const event = new MouseEvent(type, { bubbles: true, cancelable: true, button, clientX, clientY });',
    '        state.root.value.dispatchEvent(event);',
    '    },',
    '    touch(type, touches, changedTouches = touches) { state.root.value.dispatchEvent(touchEvent(type, touches, changedTouches)); },',
    '    complete(index) { calls.value[index].context.done(); },',
    '    unmount() { app.unmount(); }',
    '};',
    '</script></body></html>'
].join('\n');

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(temporaryDirectory, 'vite-cache'),
    server: { host: '127.0.0.1', port: 0, hmr: false },
    plugins: [{
        name: 'pull-refresh-state-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                let pathname;
                try {
                    pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
                } catch {
                    next();
                    return;
                }
                if (pathname !== '/pull-refresh-state') {
                    next();
                    return;
                }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/pull-refresh-state', fixture));
            });
        }
    }]
});

let app;
const errors = [];
try {
    await server.listen();
    const previewUrl = server.resolvedUrls.local[0] + 'pull-refresh-state';
    const environment = { ...process.env, UAH_DATA_DIR: path.join(temporaryDirectory, 'profile'), UAH_UI_PREVIEW_URL: previewUrl };
    delete environment.ELECTRON_RUN_AS_NODE;
    delete environment.UAH_DEV_URL;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env: environment });
    const page = await app.firstWindow();
    page.setDefaultTimeout(5000);
    page.setDefaultNavigationTimeout(5000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    await page.waitForFunction(() => Boolean(window.pullRefreshFixture));

    const initial = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(initial.threshold, 72, 'default threshold is 72');
    assert.equal(initial.distance, 0);

    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 0, 2));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 160));
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).distance, 0, 'non-left mouse button cannot start a gesture');

    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 0));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 100));
    let state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 50, 'default resistance halves the downward movement');
    assert.equal(state.canRefresh, false);
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 144));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 72);
    assert.equal(state.canRefresh, true, 'canRefresh turns on at the threshold');
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 300));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 108, 'distance is capped at 1.5 times the threshold');
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 180));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 90);
    assert.equal(state.goingUp, true, 'goingUp follows a decrease in pull distance');
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 220));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 108);
    assert.equal(state.goingUp, false);
    await page.evaluate(() => window.pullRefreshFixture.mouse('mouseleave', 0, 220));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.refreshing, true, 'mouse leave finishes a threshold-reaching gesture');
    assert.equal(state.distance, 108, 'distance remains available while refresh is active');
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value[0].refreshingAtEmit), true, 'refreshing is set before load is emitted');

    await page.evaluate(() => window.pullRefreshFixture.setProps({ disabled: true }));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.refreshing, true, 'disabling does not discard an in-flight request');
    assert.equal(state.distance, 0, 'disabling cancels only the active gesture distance');
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 0));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 300));
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 1, 'disabled blocks new refresh gestures');
    await page.evaluate(() => window.pullRefreshFixture.complete(0));
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).refreshing, false, 'in-flight done still settles after disabled changes');
    await page.evaluate(() => window.pullRefreshFixture.complete(0));
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 1, 'done callback is idempotent');

    await page.evaluate(() => window.pullRefreshFixture.setProps({ disabled: false, threshold: 30, pullDownThreshold: 60, resistance: undefined }));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.threshold, 60, 'pullDownThreshold overrides legacy threshold');
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 0));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 100));
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).distance, 50);
    await page.evaluate(() => window.pullRefreshFixture.mouse('mouseup', 0, 100));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 0, 'ending below the resolved threshold resets the pull distance');
    assert.equal(state.refreshing, false);
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 1, 'sub-threshold release does not emit load');

    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 0));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 80, 10));
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).distance, 0, 'horizontal-first movement cancels the gesture');
    await page.evaluate(() => window.pullRefreshFixture.mouse('mouseup', 80, 10));
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 1);
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 100));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 90));
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).distance, 0, 'upward-first movement cancels the gesture');
    await page.evaluate(() => window.pullRefreshFixture.mouse('mouseup', 0, 90));

    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 0));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 120));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 60);
    await page.evaluate(() => window.pullRefreshFixture.setProps({ disabled: true }));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 0, 'disabling mid-gesture cancels the pending pull');
    assert.equal(state.refreshing, false);
    await page.evaluate(() => window.pullRefreshFixture.mouse('mouseup', 0, 120));
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 1, 'cancelled disabled gesture does not emit load');
    await page.evaluate(() => window.pullRefreshFixture.setProps({ disabled: false }));

    await page.evaluate(() => window.pullRefreshFixture.setProps({ threshold: 30, pullDownThreshold: 60, resistance: undefined, synchronousDone: true }));
    await page.evaluate(() => window.pullRefreshFixture.touch('touchstart', [
        { identifier: 1, clientX: 0, clientY: 0 },
        { identifier: 2, clientX: 1, clientY: 0 }
    ]));
    await page.evaluate(() => window.pullRefreshFixture.touch('touchmove', [{ identifier: 1, clientX: 0, clientY: 200 }]));
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).distance, 0, 'multi-touch cannot start a refresh gesture');

    await page.evaluate(() => window.pullRefreshFixture.touch('touchstart', [{ identifier: 7, clientX: 10, clientY: 10 }]));
    await page.evaluate(() => window.pullRefreshFixture.touch('touchmove', [{ identifier: 7, clientX: 10, clientY: 100 }]));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 45);
    assert.equal(state.threshold, 60);
    await page.evaluate(() => window.pullRefreshFixture.touch('touchmove', [{ identifier: 7, clientX: 10, clientY: 150 }]));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 70);
    assert.equal(state.canRefresh, true);
    await page.evaluate(() => window.pullRefreshFixture.touch('touchmove', [{ identifier: 7, clientX: 10, clientY: 120 }]));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 55);
    assert.equal(state.goingUp, true);
    await page.evaluate(() => window.pullRefreshFixture.touch('touchmove', [{ identifier: 7, clientX: 10, clientY: 150 }]));
    await page.evaluate(() => window.pullRefreshFixture.touch('touchend', [], [{ identifier: 7, clientX: 10, clientY: 150 }]));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 2);
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value[1].refreshingAtEmit), true);
    assert.equal(state.refreshing, false, 'synchronous done settles after refreshing was set');
    assert.equal(state.distance, 0);

    await page.evaluate(() => window.pullRefreshFixture.setProps({ pullDownThreshold: undefined, threshold: 40, resistance: 1, synchronousDone: true }));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.threshold, 40, 'legacy threshold is used when pullDownThreshold is absent');
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 0));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 50));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 50, 'explicit resistance is applied to pointer delta');
    await page.evaluate(() => window.pullRefreshFixture.mouse('mouseup', 0, 50));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.refreshing, false, 'synchronous completion leaves no stuck refreshing state');
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 3);

    await page.evaluate(() => window.pullRefreshFixture.setProps({ threshold: 30, resistance: 0.5, synchronousDone: false }));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 0));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 100));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mouseup', 0, 100));
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).refreshing, true);
    const resetStaleIndex = await page.evaluate(() => window.pullRefreshFixture.calls.value.length - 1);
    await page.evaluate(() => window.pullRefreshFixture.state.reset());
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.refreshing, false);
    assert.equal(state.distance, 0);
    await page.evaluate(index => window.pullRefreshFixture.complete(index), resetStaleIndex);
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).refreshing, false, 'reset invalidates an earlier done callback');

    await page.evaluate(() => window.pullRefreshFixture.touch('touchstart', [{ identifier: 9, clientX: 0, clientY: 0 }]));
    await page.evaluate(() => window.pullRefreshFixture.touch('touchmove', [{ identifier: 9, clientX: 0, clientY: 120 }]));
    await page.evaluate(() => window.pullRefreshFixture.touch('touchcancel', [], []));
    state = await page.evaluate(() => window.pullRefreshFixture.read());
    assert.equal(state.distance, 0, 'touchcancel cancels an active touch gesture');
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 4);

    await page.evaluate(() => {
        const parent = document.querySelector('#outer-scroll');
        const root = document.querySelector('#pull-root');
        document.scrollingElement.scrollTop = 50;
        parent.scrollTop = 30;
        root.scrollTop = 0;
        window.pullRefreshFixture.mouse('mousedown', 0, 0);
        window.pullRefreshFixture.mouse('mousemove', 0, 120);
        window.pullRefreshFixture.mouse('mouseup', 0, 120);
    });
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 5, 'a scrollable component root at its top can refresh despite outer scroll positions');
    await page.evaluate(() => window.pullRefreshFixture.complete(4));
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).refreshing, false);
    await page.evaluate(() => {
        const root = document.querySelector('#pull-root');
        root.scrollTop = 20;
        window.pullRefreshFixture.mouse('mousedown', 0, 0);
        window.pullRefreshFixture.mouse('mousemove', 0, 120);
        window.pullRefreshFixture.mouse('mouseup', 0, 120);
        root.scrollTop = 0;
    });
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 5, 'a component root with its own scroll offset blocks pull refresh');

    await page.evaluate(() => {
        document.querySelector('#pull-root').style.overflowY = 'visible';
        document.querySelector('#refresh-content').style.height = '100px';
        document.querySelector('#outer-scroll').scrollTop = 30;
    });
    await page.evaluate(() => {
        window.pullRefreshFixture.mouse('mousedown', 0, 0);
        window.pullRefreshFixture.mouse('mousemove', 0, 120);
        window.pullRefreshFixture.mouse('mouseup', 0, 120);
    });
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 5, 'the nearest scrollable ancestor blocks when the component root is not scrollable');
    await page.evaluate(() => { document.querySelector('#outer-scroll').scrollTop = 0; });
    await page.evaluate(() => {
        window.pullRefreshFixture.mouse('mousedown', 0, 0);
        window.pullRefreshFixture.mouse('mousemove', 0, 120);
        window.pullRefreshFixture.mouse('mouseup', 0, 120);
    });
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 6, 'a scrolled document does not block when the nearest local scroll parent is at its top');
    await page.evaluate(() => window.pullRefreshFixture.complete(5));

    await page.evaluate(() => {
        document.querySelector('#outer-scroll').style.overflowY = 'visible';
        document.scrollingElement.scrollTop = 50;
    });
    await page.evaluate(() => {
        window.pullRefreshFixture.mouse('mousedown', 0, 0);
        window.pullRefreshFixture.mouse('mousemove', 0, 120);
        window.pullRefreshFixture.mouse('mouseup', 0, 120);
    });
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 6, 'document scroll blocks when no local scrollable ancestor exists');
    await page.evaluate(() => { document.scrollingElement.scrollTop = 0; });
    await page.evaluate(() => {
        window.pullRefreshFixture.mouse('mousedown', 0, 0);
        window.pullRefreshFixture.mouse('mousemove', 0, 120);
        window.pullRefreshFixture.mouse('mouseup', 0, 120);
    });
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.calls.value.length), 7, 'document top permits refresh when no local scrollable ancestor exists');
    await page.evaluate(() => window.pullRefreshFixture.complete(6));

    await page.evaluate(() => window.pullRefreshFixture.mouse('mousedown', 0, 0));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mousemove', 0, 120));
    await page.evaluate(() => window.pullRefreshFixture.mouse('mouseup', 0, 120));
    const unmountStaleIndex = await page.evaluate(() => window.pullRefreshFixture.calls.value.length - 1);
    assert.equal((await page.evaluate(() => window.pullRefreshFixture.read())).refreshing, true);
    await page.evaluate(() => window.pullRefreshFixture.unmount());
    await page.evaluate(index => window.pullRefreshFixture.complete(index), unmountStaleIndex);
    assert.equal(await page.evaluate(() => window.pullRefreshFixture.state.refreshing.value), false, 'unmount invalidates late done callbacks');
    assert.deepEqual(errors, [], 'fixture has no runtime errors or Vue warnings');
    console.log(JSON.stringify({
        checks: [
            'mouse button and leave handling', 'touch single-pointer lifecycle', 'threshold and resistance',
            'distance cap and direction', 'sync and idempotent done', 'disabled gesture/request behavior',
            'reset/unmount stale callbacks', 'root/ancestor/document scroll boundaries'
        ],
        loadCount: await page.evaluate(() => window.pullRefreshFixture.calls.value.length),
        errors
    }, null, 4));
} finally {
    if (app) {
        const closed = await Promise.race([
            app.close().then(() => true),
            new Promise(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        if (!closed) app.process().kill();
    }
    await server.close();
    await rm(temporaryDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
}

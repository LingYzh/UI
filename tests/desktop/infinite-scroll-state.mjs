import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'ui-infinite-scroll-'));
const fixture = [
    '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module">',
    "import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue';",
    "import { useInfiniteScrollState } from '/src/ui/infinite-scroll-state.ts';",
    'class FakeIntersectionObserver {',
    '    static instances = [];',
    '    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = new Set(); this.connected = true; FakeIntersectionObserver.instances.push(this); }',
    '    observe(target) { this.targets.add(target); }',
    '    disconnect() { this.connected = false; this.targets.clear(); }',
    '    deliver(target, isIntersecting) { if (this.connected && this.targets.has(target)) this.callback([{ target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }], this); }',
    '}',
    'globalThis.IntersectionObserver = FakeIntersectionObserver;',
    'function mountFixture(initialProps = {}) {',
    "    const props = reactive(Object.assign({ direction: 'end', side: 'end', mode: 'intersect', disabled: false, rootMargin: '200px', margin: undefined }, initialProps));",
    '    const events = ref([]);',
    '    const contentSize = ref(800);',
    '    let state;',
    '    let app;',
    '    app = createApp(defineComponent({',
    '        setup() {',
    '            state = useInfiniteScrollState(() => props, (context) => events.value.push(context));',
    '            return () => {',
    "                const horizontal = props.direction === 'horizontal';",
    "                return h('div', { id: 'scroll-root', ref: state.root, style: { width: '200px', height: '100px', overflow: 'auto' } }, [",
    "                    h('div', { id: 'start-sentinel', 'data-edge': 'start', ref: state.startSentinel, style: { width: '1px', height: '1px' } }),",
    "                    h('div', { id: 'content', style: horizontal ? { width: contentSize.value + 'px', height: '60px' } : { width: '100px', height: contentSize.value + 'px' } }),",
    "                    h('div', { id: 'end-sentinel', 'data-edge': 'end', ref: state.endSentinel, style: { width: '1px', height: '1px' } })",
    '                ]);',
    '            };',
    '        }',
    '    }));',
    "    app.mount('#app');",
    '    const api = {',
    '        props, events, contentSize, state,',
    '        async setProps(values) { Object.assign(props, values); await nextTick(); },',
    '        async load(edge) { state.load(edge); await nextTick(); },',
    '        async retry(edge) { state.retry(edge); await nextTick(); },',
    '        reset(edge) { state.reset(edge); },',
    '        trigger(edge, isIntersecting) {',
    "            const target = edge === 'start' ? state.startSentinel.value : state.endSentinel.value;",
    '            for (const observer of FakeIntersectionObserver.instances) observer.deliver(target, isIntersecting);',
    '        },',
    '        activeObservers() {',
    '            return FakeIntersectionObserver.instances.filter((observer) => observer.connected).map((observer) => ({',
    "                root: observer.options.root ? observer.options.root.id : null,",
    '                rootMargin: observer.options.rootMargin,',
    "                edges: Array.from(observer.targets).map((target) => target.dataset.edge)",
    '            }));',
    '        },',
    '        eventCount(edge) { return events.value.filter((event) => event.side === edge).length; },',
    '        getEvent(edge) { return events.value.filter((event) => event.side === edge).at(-1); },',
    '        async complete(edge, status, sizeDelta = 0) {',
    '            const event = api.getEvent(edge);',
    "            if (!event) throw new Error('No load event for ' + edge);",
    '            contentSize.value += sizeDelta;',
    '            if (sizeDelta !== 0) await nextTick();',
    '            if (status === undefined) event.done();',
    '            else event.done(status);',
    '            await nextTick();',
    '            await nextTick();',
    '        },',
    '        callDone(edge, status) {',
    '            const event = api.getEvent(edge);',
    "            if (!event) throw new Error('No load event for ' + edge);",
    '            event.done(status);',
    '        },',
    '        metrics() {',
    '            const element = state.root.value;',
    '            return { scrollTop: element.scrollTop, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, scrollLeft: element.scrollLeft, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };',
    '        },',
    '        statuses() { return { start: state.startStatus.value, end: state.endStatus.value, busy: state.busy.value, done: state.done.value, error: state.error.value, side: state.side.value, axis: state.axis.value }; },',
    '        unmount() { app.unmount(); }',
    '    };',
    '    window.infiniteScrollFixture = api;',
    '    return api;',
    '}',
    'window.mountInfiniteScrollFixture = mountFixture;',
    "mountFixture({ direction: 'both', mode: 'intersect', margin: 0 });",
    '</script></body></html>'
].join('\n');

const server = await createServer({
    cacheDir: path.join(temporaryDirectory, 'vite-cache'),
    server: { host: '127.0.0.1', port: 0 },
    plugins: [{
        name: 'infinite-scroll-state-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__infinite-scroll-state.html') {
                    next();
                    return;
                }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__infinite-scroll-state.html', fixture));
            });
        }
    }]
});

let app;
try {
    await server.listen();
    const previewUrl = server.resolvedUrls.local[0] + '__infinite-scroll-state.html';
    const environment = {
        ...process.env,
        UAH_DATA_DIR: path.join(temporaryDirectory, 'profile'),
        UAH_UI_PREVIEW_URL: previewUrl
    };
    delete environment.ELECTRON_RUN_AS_NODE;
    delete environment.UAH_DEV_URL;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env: environment });
    const page = await app.firstWindow();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    await page.waitForFunction(() => Boolean(window.infiniteScrollFixture));

    let initial = await page.evaluate(() => window.infiniteScrollFixture.metrics());
    assert.ok(Math.abs(initial.scrollTop - (initial.scrollHeight - initial.clientHeight) / 2) <= 1, 'both-side mount centers the vertical scroll root');
    let observers = await page.evaluate(() => window.infiniteScrollFixture.activeObservers());
    assert.equal(observers.length, 2, 'both-side mode observes each edge independently');
    assert.deepEqual(observers.map((observer) => observer.edges[0]).sort(), ['end', 'start']);
    assert.ok(observers.every((observer) => observer.root === 'scroll-root'), 'observer root uses the supplied root element');
    assert.ok(observers.every((observer) => observer.rootMargin === '0px'), 'numeric margin zero overrides rootMargin');

    await page.evaluate(() => window.infiniteScrollFixture.setProps({ margin: '0' }));
    observers = await page.evaluate(() => window.infiniteScrollFixture.activeObservers());
    assert.ok(observers.every((observer) => observer.rootMargin === '0px'), 'numeric-string zero receives the px unit required by IntersectionObserver');

    await page.evaluate(() => window.infiniteScrollFixture.setProps({ margin: undefined }));
    observers = await page.evaluate(() => window.infiniteScrollFixture.activeObservers());
    assert.ok(observers.every((observer) => observer.rootMargin === '200px'), 'rootMargin default is retained when margin is omitted');

    await page.evaluate(() => window.infiniteScrollFixture.trigger('start', true));
    await page.waitForFunction(() => window.infiniteScrollFixture.eventCount('start') === 1);
    initial = await page.evaluate(() => window.infiniteScrollFixture.metrics());
    await page.evaluate(() => window.infiniteScrollFixture.trigger('start', true));
    await page.waitForTimeout(30);
    assert.equal(await page.evaluate(() => window.infiniteScrollFixture.eventCount('start')), 1, 'intersecting duplicate callbacks do not start a second in-flight load');
    await page.evaluate(() => window.infiniteScrollFixture.complete('start', 'ok', 120));
    await page.evaluate(() => window.infiniteScrollFixture.trigger('start', false));
    const prepended = await page.evaluate(() => window.infiniteScrollFixture.metrics());
    assert.equal(prepended.scrollTop, initial.scrollTop + 120, 'vertical start loads preserve scroll position after content grows');
    await page.evaluate(() => window.infiniteScrollFixture.callDone('start', 'error'));
    assert.equal((await page.evaluate(() => window.infiniteScrollFixture.statuses())).start, 'ok', 'a duplicate done callback is ignored');

    await page.evaluate(() => window.infiniteScrollFixture.trigger('end', true));
    await page.waitForFunction(() => window.infiniteScrollFixture.eventCount('end') === 1);
    await page.evaluate(() => window.infiniteScrollFixture.complete('end'));
    await page.waitForFunction(() => window.infiniteScrollFixture.eventCount('end') === 2);
    await page.evaluate(() => window.infiniteScrollFixture.trigger('end', false));
    await page.evaluate(() => window.infiniteScrollFixture.complete('end', 'empty'));
    let statuses = await page.evaluate(() => window.infiniteScrollFixture.statuses());
    assert.equal(statuses.end, 'empty');
    assert.equal(statuses.done, false, 'both-side aggregate done waits for every enabled edge');
    await page.evaluate(async () => {
        await window.infiniteScrollFixture.load('start');
        await window.infiniteScrollFixture.complete('start', 'empty');
    });
    statuses = await page.evaluate(() => window.infiniteScrollFixture.statuses());
    assert.equal(statuses.done, true, 'both-side aggregate done is true when both edges are empty');
    await page.evaluate(() => window.infiniteScrollFixture.reset());
    statuses = await page.evaluate(() => window.infiniteScrollFixture.statuses());
    assert.equal(statuses.start, 'ok', 'reset without an edge resets the start edge in both mode');
    assert.equal(statuses.end, 'ok', 'reset without an edge resets the end edge in both mode');

    await page.evaluate(async () => {
        await window.infiniteScrollFixture.load('end');
        await window.infiniteScrollFixture.complete('end', 'error');
    });
    assert.equal((await page.evaluate(() => window.infiniteScrollFixture.statuses())).error, true, 'aggregate error reflects an enabled edge');
    await page.evaluate(() => window.infiniteScrollFixture.reset('start'));
    statuses = await page.evaluate(() => window.infiniteScrollFixture.statuses());
    assert.equal(statuses.end, 'error', 'an explicit reset only targets the requested edge');
    assert.equal(statuses.start, 'ok');
    await page.evaluate(() => window.infiniteScrollFixture.reset());

    await page.evaluate(() => window.infiniteScrollFixture.unmount());
    await page.evaluate(() => window.mountInfiniteScrollFixture({ direction: 'vertical', side: 'start', mode: 'manual' }));
    let metrics = await page.evaluate(() => window.infiniteScrollFixture.metrics());
    assert.equal((await page.evaluate(() => window.infiniteScrollFixture.activeObservers())).length, 0, 'manual mode does not create observers');
    assert.ok(Math.abs(metrics.scrollTop - (metrics.scrollHeight - metrics.clientHeight)) <= 1, 'start-side mount initializes at the content end');
    await page.evaluate(async () => {
        const fixture = window.infiniteScrollFixture;
        await fixture.load();
        fixture.reset();
        fixture.callDone('start', 'error');
    });
    statuses = await page.evaluate(() => window.infiniteScrollFixture.statuses());
    assert.equal(statuses.start, 'ok', 'reset invalidates an earlier load callback');
    await page.evaluate(() => window.infiniteScrollFixture.load());
    assert.equal(await page.evaluate(() => window.infiniteScrollFixture.eventCount('start')), 2);
    await page.evaluate(() => window.infiniteScrollFixture.complete('start', 'error'));
    statuses = await page.evaluate(() => window.infiniteScrollFixture.statuses());
    assert.equal(statuses.error, true, 'edge error status is exposed');
    await page.evaluate(() => window.infiniteScrollFixture.retry());
    assert.equal(await page.evaluate(() => window.infiniteScrollFixture.eventCount('start')), 3, 'no-argument retry uses the resolved start edge');
    await page.evaluate(() => window.infiniteScrollFixture.complete('start', 'empty'));
    statuses = await page.evaluate(() => window.infiniteScrollFixture.statuses());
    assert.equal(statuses.done, true);

    await page.evaluate(() => window.infiniteScrollFixture.unmount());
    await page.evaluate(() => window.mountInfiniteScrollFixture({ direction: 'horizontal', side: 'start', mode: 'manual' }));
    metrics = await page.evaluate(() => window.infiniteScrollFixture.metrics());
    assert.equal((await page.evaluate(() => window.infiniteScrollFixture.statuses())).axis, 'horizontal');
    assert.ok(Math.abs(metrics.scrollLeft - (metrics.scrollWidth - metrics.clientWidth)) <= 1, 'horizontal start-side mount initializes at the content end');
    await page.evaluate(() => window.infiniteScrollFixture.load());
    const horizontalBefore = await page.evaluate(() => window.infiniteScrollFixture.metrics());
    await page.evaluate(() => window.infiniteScrollFixture.complete('start', 'ok', 120));
    const horizontalAfter = await page.evaluate(() => window.infiniteScrollFixture.metrics());
    assert.equal(horizontalAfter.scrollLeft, horizontalBefore.scrollLeft + 120, 'horizontal start loads preserve scroll position using width metrics');

    await page.evaluate(() => window.infiniteScrollFixture.unmount());
    await page.evaluate(() => window.mountInfiniteScrollFixture({ direction: 'end', mode: 'intersect' }));
    observers = await page.evaluate(() => window.infiniteScrollFixture.activeObservers());
    assert.equal(observers.length, 1);
    assert.deepEqual(observers[0].edges, ['end']);
    await page.evaluate(() => window.infiniteScrollFixture.setProps({ disabled: true }));
    assert.equal((await page.evaluate(() => window.infiniteScrollFixture.activeObservers())).length, 0, 'disabled detaches active observers');
    await page.evaluate(async () => {
        const fixture = window.infiniteScrollFixture;
        fixture.trigger('end', true);
        await fixture.load();
    });
    assert.equal(await page.evaluate(() => window.infiniteScrollFixture.eventCount('end')), 0, 'disabled blocks intersect and explicit loads');
    await page.evaluate(() => window.infiniteScrollFixture.setProps({ disabled: false }));
    assert.equal((await page.evaluate(() => window.infiniteScrollFixture.activeObservers())).length, 1, 'reenabling restores observation');
    await page.evaluate(() => window.infiniteScrollFixture.trigger('end', true));
    await page.waitForFunction(() => window.infiniteScrollFixture.eventCount('end') === 1);
    await page.evaluate(() => window.infiniteScrollFixture.unmount());
    assert.equal((await page.evaluate(() => window.infiniteScrollFixture.activeObservers())).length, 0, 'unmount disconnects observers');
    await page.evaluate(() => window.infiniteScrollFixture.callDone('end', 'error'));
    assert.equal((await page.evaluate(() => window.infiniteScrollFixture.statuses())).end, 'loading', 'unmount invalidates late done callbacks');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({
        passed: [
            'initial both-center and start-end positioning',
            'independent edge observers and root/margin configuration',
            'duplicate in-flight suppression and done idempotence',
            'three-frame intersect retry and aggregate edge statuses',
            'reset defaults, explicit reset and stale generation invalidation',
            'manual mode, disabled blocking and observer cleanup',
            'vertical and horizontal prepend scroll preservation'
        ],
        errors
    }, null, 4));
} finally {
    if (app) await app.close();
    await server.close();
    await rm(temporaryDirectory, { recursive: true, force: true });
}

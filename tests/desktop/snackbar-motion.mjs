// Source-only browser regression: no build and no backend.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../../', import.meta.url));
const evidence = fileURLToPath(new URL('../../artifacts/snackbar-motion/', import.meta.url));
await mkdir(evidence, { recursive: true });
const entry = '/__snackbar-motion-entry.js';
const fixture = {
    name: 'snackbar-motion-fixture',
    configureServer(server) {
        server.middlewares.use('/__snackbar-motion', (_request, response) => {
            response.setHeader('Content-Type', 'text/html');
            response.end(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"></head><body><div id="app"></div><script type="module" src="${entry}"></script></body></html>`);
        });
    },
    resolveId(id) { if (id === entry) return id; },
    load(id) {
        if (id !== entry) return;
        return `
            import { createApp, h, ref, reactive, nextTick } from 'vue';
            import USnackbar from '/src/ui/USnackbar.vue';
            import USnackbarQueue from '/src/ui/USnackbarQueue.vue';
            import SnackbarHost from '/src/ui/UiSnackbarHost.vue';
            import { snackbar } from '/src/ui/snackbar.ts';
            import { createUiTheme } from '/src/ui/theme.ts';
            import '/src/ui/styles.css';
            const state = reactive({ modelValue: false, text: '组件提示', timeout: 4000, timer: true, reverseTimer: false, location: 'top center', closable: true, persistent: true });
            const queue = ref([]);
            const queueOptions = reactive({ totalVisible: 1, displayStrategy: 'hold' });
            let queueInstance;
            let resolveQueuedPromise;
            const theme = createUiTheme({ defaultTheme: 'light' });
            let notice;
            const app = createApp({ setup() { return () => [
                h('main', { style: 'padding: 100px 24px' }, [h('h1', 'Snackbar 位置与计时条'), h('p', '真实组件，帧同步计时，进入与退出均沿停靠方向。')]),
                h(USnackbar, { ...state, ref: value => notice = value, 'onUpdate:modelValue': value => state.modelValue = value }),
                h(USnackbarQueue, { ...queueOptions, ref: value => queueInstance = value, modelValue: queue.value, location: state.location, 'onUpdate:modelValue': value => queue.value = value }),
                h(SnackbarHost)
            ]; } });
            app.use(theme);
            app.mount('#app');
            window.harness = {
                async show(options = {}) { state.modelValue = false; Object.assign(state, { timeout: 4000, timer: true, reverseTimer: false, location: 'top center' }, options); await nextTick(); state.modelValue = true; },
                close() { state.modelValue = false; },
                pause(reason) { notice.pause(reason); },
                resume(reason) { notice.resume(reason); },
                queue(location) { state.location = location; queue.value = [{ text: '队列提示', timeout: 700 }]; },
                enqueue(items, strategy = 'hold') { queueOptions.displayStrategy = strategy; queue.value = items.map(text => ({ text, timeout: -1, closable: true })); },
                clearQueue() { queueInstance.clear(); },
                pendingQueue() { return queue.value.length; },
                queuePromise() { queue.value = [{ text: '保存中', closable: true, promise: new Promise(resolve => resolveQueuedPromise = resolve), success: () => ({ text: '保存成功' }) }]; },
                resolveQueue() { resolveQueuedPromise(); },
                service(position) { return snackbar.show('服务提示', { position, duration: 0 }); },
                dismiss(id) { snackbar.dismiss(id); },
                theme(name) { return theme.change(name, false); },
                unmount() { app.unmount(); }
            };
        `;
    }
};
const server = await createServer({ configFile: false, root, plugins: [vue(), fixture], resolve: { dedupe: ['vue'] }, optimizeDeps: { entries: [], noDiscovery: true, include: ['vue'] }, server: { host: '127.0.0.1', port: 0, watch: null, hmr: false }, logLevel: 'error' });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
try {
    await server.listen();
    const page = await browser.newPage({ viewport: { width: 1100, height: 720 }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
    page.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
    await page.goto(`${server.resolvedUrls.local[0]}__snackbar-motion`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.harness, null, { timeout: 15000 });
    async function frames(action, options, selector = '.u-notice-placement') {
        return page.evaluate(async ({ action, options, selector }) => {
            const frames = [];
            const started = performance.now();
            window.harness[action](options);
            await new Promise(resolve => {
                function tick() {
                    const element = document.querySelector(selector);
                    if (element) {
                        const style = getComputedStyle(element);
                        const matrix = new DOMMatrix(style.transform === 'none' ? undefined : style.transform);
                        frames.push({ x: matrix.m41, y: matrix.m42, opacity: Number(style.opacity), className: element.className });
                    }
                    if (performance.now() - started >= 260) resolve(); else requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            });
            return frames;
        }, { action, options, selector });
    }
    function assertDirection(samples, x, y, description) {
        const moving = samples.filter(frame => frame.opacity < .99);
        assert.ok(moving.length, `${description}: fade`);
        assert.ok(moving.some(frame => (x ? Math.sign(frame.x) === x : Math.abs(frame.x) < .01) && (y ? Math.sign(frame.y) === y : Math.abs(frame.y) < .01)), `${description}: ${x},${y}`);
    }
    for (const [position, x, y] of [
        ['top left', 0, -1], ['top center', 0, -1], ['top right', 0, -1],
        ['bottom left', 0, 1], ['bottom center', 0, 1], ['bottom right', 0, 1],
        ['center left', -1, 0], ['center center', 0, 0], ['center right', 1, 0]
    ]) {
        const enter = await frames('show', { location: position });
        assertDirection(enter, x, y, `${position} enter`);
        await page.screenshot({ path: `${evidence}/${position.replaceAll(' ', '-')}.png` });
        const leave = await frames('close');
        assertDirection(leave, x, y, `${position} leave`);
        results.push({ position, enter, leave });
    }
    for (const dir of ['ltr', 'rtl']) {
        await page.evaluate(dir => document.documentElement.dir = dir, dir);
        for (const logical of ['start', 'end']) {
            const x = (logical === 'start' ? -1 : 1) * (dir === 'rtl' ? -1 : 1);
            assertDirection(await frames('show', { location: `center ${logical}` }), x, 0, `${dir} ${logical}`);
            await frames('close');
        }
    }
    await page.evaluate(() => document.documentElement.dir = 'ltr');
    for (const position of ['top-right', 'bottom-left']) {
        assertDirection(await frames('queue', position), 0, position.startsWith('top') ? -1 : 1, `queue ${position}`);
        await page.getByText('队列提示', { exact: true }).waitFor({ state: 'detached' });
        const enter = await frames('service', position, '.ui-snackbar-service-message');
        assertDirection(enter, 0, position.startsWith('top') ? -1 : 1, `service ${position}`);
        await page.evaluate(() => { for (const button of document.querySelectorAll('.ui-snackbar-service-message button')) button.click(); });
        await page.getByText('服务提示', { exact: true }).waitFor({ state: 'detached' });
    }
    await page.evaluate(() => window.harness.enqueue(['等待一', '等待二']));
    await page.getByText('等待一', { exact: true }).waitFor();
    assert.equal(await page.getByText('等待二', { exact: true }).count(), 0);
    assert.equal(await page.evaluate(() => window.harness.pendingQueue()), 1);
    await page.locator('.u-notice-stack').getByRole('button', { name: '关闭', exact: true }).click();
    await page.getByText('等待二', { exact: true }).waitFor();
    await page.evaluate(() => window.harness.clearQueue());
    await page.getByText('等待二', { exact: true }).waitFor({ state: 'detached' });
    await page.evaluate(() => window.harness.enqueue(['被替换一', '被替换二', '保留最后项'], 'overflow'));
    await page.getByText('保留最后项', { exact: true }).waitFor();
    assert.equal(await page.locator('.u-notice-stack .u-notice').count(), 1);
    await page.evaluate(() => window.harness.clearQueue());
    await page.getByText('保留最后项', { exact: true }).waitFor({ state: 'detached' });
    await page.evaluate(() => window.harness.queuePromise());
    await page.getByText('保存中', { exact: true }).waitFor();
    await page.evaluate(() => window.harness.resolveQueue());
    await page.getByText('保存成功', { exact: true }).waitFor();
    await page.evaluate(() => window.harness.clearQueue());
    await page.getByText('保存成功', { exact: true }).waitFor({ state: 'detached' });
    await page.evaluate(() => { window.harness.enqueue(['挂载前清理']); window.harness.clearQueue(); });
    await frames('close');
    assert.equal(await page.locator('.u-notice-stack .u-notice').count(), 0);
    async function timerFrames() {
        return page.evaluate(async () => {
            const samples = [];
            const start = performance.now();
            await new Promise(resolve => {
                function tick() {
                    const bar = document.querySelector('.u-notice-timer > span');
                    samples.push({ value: new DOMMatrix(getComputedStyle(bar).transform).m11, layoutWidth: bar.offsetWidth });
                    if (performance.now() - start >= 650) resolve(); else requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            });
            return samples;
        });
    }
    for (const reverseTimer of [false, true]) {
        await frames('show', { reverseTimer });
        const samples = await timerFrames();
        const changes = samples.slice(1).filter((sample, index) => Math.abs(sample.value - samples[index].value) > .00001).length;
        assert.ok(changes / (samples.length - 1) > .7, `frame-synchronized timer: ${changes}/${samples.length}`);
        assert.equal(new Set(samples.map(sample => sample.layoutWidth)).size, 1, 'timer avoids width reflow');
        assert.ok(reverseTimer ? samples.at(-1).value > samples[0].value : samples.at(-1).value < samples[0].value);
        await page.locator('.u-notice').hover();
        const paused = await timerFrames();
        assert.ok(Math.abs(paused.at(-1).value - paused[0].value) < .001, 'pointer pauses timer');
        await page.evaluate(() => window.harness.pause('focus'));
        await page.mouse.move(1, 1);
        const stillPaused = await timerFrames();
        assert.ok(Math.abs(stillPaused.at(-1).value - stillPaused[0].value) < .001, 'focus keeps timer paused after pointer leaves');
        await page.evaluate(() => window.harness.resume('focus'));
        const resumed = await timerFrames();
        assert.ok(Math.abs(resumed.at(-1).value - resumed[0].value) > .01, 'timer resumes');
        results.push({ reverseTimer, samples, paused, stillPaused, resumed });
        await frames('close');
    }
    await frames('show', { timeout: 600 });
    await page.getByText('组件提示', { exact: true }).waitFor({ state: 'detached' });
    await frames('show');
    await page.locator('.u-notice').hover();
    await frames('close');
    await page.mouse.move(1, 1);
    await frames('show');
    const reopened = await timerFrames();
    assert.ok(reopened[0].value > .8 && reopened.at(-1).value < reopened[0].value, 'reopen resets progress and clears stale pause state');
    await frames('close');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.harness.theme('dark'));
    await frames('show', { location: 'top right' });
    await page.screenshot({ path: `${evidence}/dark-390.png` });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await frames('close');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reduced = await frames('show');
    assert.ok(reduced.every(frame => frame.opacity === 0 || (frame.opacity === 1 && frame.x === 0 && frame.y === 0)));
    await page.evaluate(() => window.harness.unmount());
    assert.deepEqual(errors, []);
    await writeFile(`${evidence}/frames.json`, JSON.stringify(results, null, 4));
    console.log(`Snackbar motion/timer: ${results.length} groups passed; light/dark, 390px, RTL and reduced motion passed.`);
} finally {
    await browser.close();
    await server.close();
}

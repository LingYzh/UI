// Source-only check: compare actual table frames against UProgressLinear, without a full build.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const evidence = 'artifacts/table-loading';
await mkdir(evidence, { recursive: true });
const fixture = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div>
<script type="module">
import { createApp, h, reactive } from 'vue';
import { createUI, UDataTable, UDataTableServer, UDataTableVirtual, UProgressLinear } from '/src/ui/index.ts';
import Demo from '/src/ui/docs/table-examples/loading.vue';
import '/src/docs-base.css';
import '/src/ui/styles.css';
const state = reactive({ kind:'server', side:'start', loading:true, color:'primary', custom:false, density:'default', demo:false });
const rtl = reactive({ zh:false });
const ui = createUI({ locale:{ locale:'zh', rtl } });
const tables = { client:UDataTable, server:UDataTableServer, virtual:UDataTableVirtual };
const headers = [{key:'name',title:'项目',width:160,fixed:'start'},{key:'status',title:'状态'}];
const items = [{id:1,name:'保留的记录',status:'等待响应'},{id:2,name:'另一条记录',status:'查询中'}];
createApp({ setup() { return () => h('main', {style:'max-width:940px;margin:24px auto;padding:12px;display:grid;gap:16px'}, state.demo ? [h(Demo)] : [
    h('h2','表格与线性进度动画对照'),
    h(UProgressLinear,{id:'reference',indeterminate:true,label:'参考进度',style:{color:state.color==='primary'?'var(--primary-surface)':state.color}}),
    h('div',{id:'table-host'},[h(tables[state.kind],{key:state.kind,headers,items,itemValue:'id',itemsLength:items.length,loading:state.loading?{color:state.color,side:state.side}:false,loadingText:'正在查询',height:220,mobile:false,fixedHeader:true,density:state.density},state.custom?{loader:scope=>h('span',{'data-custom-loader':true,'data-active':String(scope.isActive),'data-color':scope.color},'自定义加载')}:undefined)])
]); } }).use(ui).mount('#app');
window.loadingFixture = { state, rtl, ui };
</script></body></html>`;
const server = await createServer({
    cacheDir: 'node_modules/.vite-table-loading',
    optimizeDeps: { noDiscovery: true, include: ['vue', '@vuetify/v0', 'highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript', 'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json', 'markdown-it-task-lists'] },
    server: { host: '127.0.0.1', port: 0 },
    plugins: [{
        name: 'table-loading-fixture',
        configureServer(server) {
            server.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__table-loading.html') return next();
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await server.transformIndexHtml('/__table-loading.html', fixture));
            });
        },
    }],
});
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, reducedMotion: 'no-preference' });
const errors = [];
const checks = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.text().includes('[Vue warn]')) errors.push(message.text()); });
page.setDefaultTimeout(60000);

async function configure(changes) {
    await page.evaluate((changes) => Object.assign(window.loadingFixture.state, changes), changes);
    await page.locator('#table-host .u-data-table-progress').first().waitFor();
}

async function compareFrames(name) {
    const bars = page.locator('#table-host .u-data-table-progress');
    assert.ok(await bars.count());
    assert.equal(await bars.first().getAttribute('aria-label'), '正在查询');
    assert.equal(await bars.first().getAttribute('aria-valuenow'), null);
    for (const time of [0, 400, 1000, 1500, 2100, 2300, 3100, 4300]) {
        const samples = await page.evaluate(async (time) => {
            const bars = [...document.querySelectorAll('#reference, #table-host .u-data-table-progress')];
            for (const bar of bars) {
                if (bar.getAnimations().length) throw Error('Progress container must not animate independently');
                for (const value of bar.querySelectorAll('.u-progress-value')) {
                    const animations = value.getAnimations();
                    if (animations.length !== 1) throw Error('Expected one animation per linear segment');
                    animations[0].pause();
                    animations[0].currentTime = time;
                }
            }
            await new Promise(requestAnimationFrame);
            return bars.map((bar) => {
                const rect = bar.getBoundingClientRect();
                return {
                    height: rect.height,
                    segments: [...bar.querySelectorAll('.u-progress-value')].map((value) => {
                        const bounds = value.getBoundingClientRect();
                        const animation = value.getAnimations()[0];
                        return { left:(bounds.left-rect.left)/rect.width, right:(bounds.right-rect.left)/rect.width, name:animation.animationName, duration:animation.effect.getTiming().duration, color:getComputedStyle(value).backgroundColor };
                    }),
                };
            });
        }, time);
        for (const table of samples.slice(1)) {
            assert.equal(table.height, 3, name + ': table keeps its 3px height');
            assert.equal(table.segments.length, 2);
            for (let index = 0; index < 2; index++) {
                const expected = samples[0].segments[index];
                const actual = table.segments[index];
                assert.equal(actual.name, expected.name);
                assert.equal(actual.duration, expected.duration);
                assert.equal(actual.color, expected.color);
                assert.ok(Math.abs(actual.left-expected.left) < .003, `${name}/${time}: left edge`);
                assert.ok(Math.abs(actual.right-expected.right) < .003, `${name}/${time}: right edge`);
            }
        }
    }
    checks.push(name);
}

async function captureFrame(filename) {
    await page.waitForTimeout(350);
    await page.evaluate(async () => {
        for (const segment of document.querySelectorAll('.u-progress-linear .u-progress-value')) {
            for (const animation of segment.getAnimations()) {
                animation.pause();
                animation.currentTime = 1900;
            }
        }
        await new Promise(requestAnimationFrame);
    });
    await page.screenshot({ path:`${evidence}/${filename}` });
}

try {
    await server.listen();
    await page.goto(server.resolvedUrls.local[0] + '__table-loading.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#reference').waitFor();
    for (const kind of ['client', 'server', 'virtual']) {
        for (const side of ['start', 'end', 'both']) {
            await configure({ kind, side });
            assert.equal(await page.locator('#table-host thead .u-data-table-progress').count(), side === 'end' ? 0 : 1);
            assert.equal(await page.locator('#table-host tbody .u-data-table-progress').count(), side === 'start' ? 0 : 1);
            await compareFrames(`${kind}/${side}`);
        }
    }
    await configure({ kind:'server', side:'both', color:'#246a91' });
    await compareFrames('custom color');
    for (const density of ['default', 'comfortable', 'compact']) {
        await configure({ density });
        await compareFrames('density/' + density);
    }
    await page.evaluate(() => { window.loadingFixture.rtl.zh = true; document.documentElement.dir = 'rtl'; });
    await compareFrames('RTL');
    await page.evaluate(() => { window.loadingFixture.rtl.zh = false; document.documentElement.dir = 'ltr'; window.loadingFixture.ui.theme.change('dark'); });
    await page.setViewportSize({ width:390, height:844 });
    await compareFrames('dark/390px');
    await captureFrame('dark-390.png');
    for (const source of ['system', 'application']) {
        if (source === 'system') await page.emulateMedia({ reducedMotion:'reduce' });
        else await page.evaluate(() => document.documentElement.dataset.reducedMotion = 'true');
        const states = await page.locator('#reference, #table-host .u-data-table-progress').evaluateAll((bars) => bars.map((bar) => ({
            long:getComputedStyle(bar.querySelector('.is-long')).animationName,
            short:getComputedStyle(bar.querySelector('.is-short')).display,
            width:bar.querySelector('.is-long').getBoundingClientRect().width/bar.getBoundingClientRect().width,
        })));
        for (const state of states) { assert.equal(state.long, 'none'); assert.equal(state.short, 'none'); assert.ok(Math.abs(state.width-.4)<.003); }
        if (source === 'system') await page.emulateMedia({ reducedMotion:'no-preference' });
        else await page.evaluate(() => delete document.documentElement.dataset.reducedMotion);
        checks.push('reduced motion/' + source);
    }
    await page.evaluate(() => { window.loadingFixture.state.custom = true; });
    await page.locator('[data-custom-loader]').first().waitFor();
    assert.equal(await page.locator('#table-host .u-data-table-progress').count(), 0);
    assert.equal(await page.locator('[data-custom-loader]').first().getAttribute('data-active'), 'true');
    assert.equal(await page.locator('[data-custom-loader]').first().getAttribute('data-color'), '#246a91');
    await page.evaluate(() => { window.loadingFixture.state.loading = false; });
    await page.locator('[data-custom-loader]').first().waitFor({ state:'detached' });
    checks.push('custom loader and completion');
    await page.evaluate(() => { window.loadingFixture.ui.theme.change('light'); window.loadingFixture.state.demo = true; });
    await page.setViewportSize({ width:1200, height:800 });
    await page.getByRole('progressbar', { name:'线性进度参考', exact:true }).waitFor();
    await captureFrame('real-demo.png');
    assert.deepEqual(errors, []);
    await writeFile(`${evidence}/report.json`, JSON.stringify({ checks, errors }, null, 4) + '\n');
    console.log(`${checks.length} table-loading checks passed; sampled frames match UProgressLinear.`);
} finally {
    await browser.close();
    await server.close();
}

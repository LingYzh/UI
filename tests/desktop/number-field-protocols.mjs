import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/number-field-protocols');
await mkdir(evidence, { recursive: true });
const files = [
    'src/ui/UNumberInput.vue', 'src/ui/specialized-inputs.ts', 'src/ui/form.ts', 'src/ui/defaults.ts',
    'src/ui/locale-context.ts', 'src/ui/locale.ts', 'src/ui/UiControlFrame.vue', 'src/ui/UiField.vue',
    'src/ui/UiButton.vue', 'src/ui/ripple.ts', 'src/ui/forms-components.css', 'src/ui/styles.css',
    'src/ui/docs/component-examples/number-input.vue'
];
const hashes = async () => Object.fromEntries(await Promise.all(files.map(async file => [file, createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')])));
const before = await hashes();
const fixture = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Number field protocol fixture</title><link rel="icon" href="data:,"><style>html,body,#app{height:auto!important;overflow:visible!important}body{margin:0;padding:20px;background:var(--surface);color:var(--text)}main{display:grid;gap:18px;max-width:1000px;margin:auto}section{display:grid;gap:16px;min-width:0;padding:14px;border:1px solid var(--border);border-radius:12px}.variant-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}</style></head><body><div id="app"></div><script type="module">
import {createApp,defineComponent,h,reactive,ref,nextTick} from 'vue';import * as UI from '/src/ui/index.ts';import NumberInputDemo from '/src/ui/docs/component-examples/number-input.vue';import '/src/docs-base.css';import '/src/ui/styles.css';
const state=reactive({base:12345,single:10,hold:0,focusCounter:7,persistentCounter:8,customCounter:12,end:3,stacked:4,hidden:5,hideInput:6,readonlyClear:9,disabledClear:11,details:13,loading:true,events:[]});
const refs=Object.fromEntries(Object.keys(state).filter(key=>key!=='events').map(key=>[key,ref()]));
function bind(key,extra={}){return{id:key,name:key,ref:refs[key],modelValue:state[key],'onUpdate:modelValue':value=>state[key]=value,'onUpdate:focused':value=>state.events.push(['focused',key,value]),'onClick:clear':event=>state.events.push(['clear',key,event.type]),...extra};}
const Root=defineComponent({setup(){return()=>h('main',[
h('section',{id:'base-section'},[h(UI.UNumberInput,bind('base',{label:'Base amount',hint:'Base hint',messages:['Base message'],prefix:'$',suffix:'kg',maxlength:'5',counter:'12',persistentCounter:true,clearable:true,persistentClear:true,loading:state.loading,ripple:false}),{
prepend:()=>h('span',{id:'prepend-slot'},'prepend'),
'prepend-inner':()=>h('span',{id:'prepend-inner-slot'},'inner before'),
'append-inner':()=>h('span',{id:'append-inner-slot'},'inner after'),
append:()=>h('span',{id:'append-slot'},'append'),
default:scope=>h('span',{id:'default-slot','data-control-id':scope.id},'body slot'),
label:scope=>h('span',{id:'label-slot','data-label':scope.label},'Label slot'),
message:scope=>h('span',{class:'message-slot','data-message':scope.message},'Message slot: '+scope.message),
clear:scope=>h('button',{id:'clear-slot',type:'button',...scope.props},'Clear'),
loader:scope=>h('span',{id:'loader-slot',role:'status','data-active':String(scope.isActive)},'Loading slot'),
counter:scope=>h('output',{id:'base-counter-slot','data-value':String(scope.value),'data-max':String(scope.max)},scope.counter)
})]),
h('section',{id:'counter-section'},[
h(UI.UNumberInput,bind('focusCounter',{label:'Focus counter',counter:true})),
h(UI.UNumberInput,bind('persistentCounter',{label:'Persistent counter',counter:true,persistentCounter:true})),
h(UI.UNumberInput,bind('customCounter',{label:'Custom counter',counter:20,counterValue:value=>value.length*10}),{counter:scope=>h('output',{id:'custom-counter','data-value':String(scope.value),'data-max':String(scope.max)},'custom '+scope.counter)})
]),
h('section',{id:'step-section'},[
h(UI.UNumberInput,bind('single',{label:'Single slot step',min:0,max:100,ripple:false}),{
decrement:({props})=>h(UI.UButton,{...props,id:'slot-decrement',variant:'text',ripple:false},{default:()=>'-'}),
increment:({props})=>h(UI.UButton,{...props,id:'slot-increment',variant:'text',ripple:false},{default:()=> '+'})
}),
h(UI.UNumberInput,bind('hold',{label:'Hold step',min:0,max:100,ripple:false}))
]),
h('section',{id:'layout-section'},[h('div',{class:'variant-grid'},[
h(UI.UNumberInput,bind('end',{label:'End controls',controlVariant:'end',ripple:false})),
h(UI.UNumberInput,bind('stacked',{label:'Stacked controls',controlVariant:'stacked',ripple:false})),
h(UI.UNumberInput,bind('hidden',{label:'Hidden buttons',controlVariant:'hidden',ripple:false})),
h(UI.UNumberInput,bind('hideInput',{label:'Hidden input',hideInput:true,ripple:false}))
])]),
h('section',{id:'guards-section'},[
h(UI.UNumberInput,bind('readonlyClear',{label:'Readonly clear',readonly:true,clearable:true,persistentClear:true,ripple:false})),
h(UI.UNumberInput,bind('disabledClear',{label:'Disabled clear',disabled:true,clearable:true,persistentClear:true,ripple:false}))
]),
h('section',{id:'details-section'},[h(UI.UNumberInput,bind('details',{label:'Details field',dense:true,hint:'Details hint',ripple:false}),{details:()=>h('span',{id:'explicit-details'},'Explicit details')})]),
h('section',{id:'number-demo'},[h(NumberInputDemo)])
])}});
const ui=UI.createUI();createApp(Root).use(ui).mount('#app');window.numberProtocol={state,theme:value=>ui.theme.change(value,false),set:(key,value)=>state[key]=value,flush:async()=>{await nextTick();await nextTick();await new Promise(resolve=>setTimeout(resolve,0));},snapshot:()=>({...state,events:state.events.map(event=>[...event])})};
</script></body></html>`;
const vite = await createServer({
    root,
    appType: 'custom',
    cacheDir: path.join(evidence, 'vite-cache'),
    resolve: { dedupe: ['vue'] },
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true, include: ['highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript', 'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json', 'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'] },
    plugins: [{ name: 'number-field-protocol-fixture', configureServer(server) { server.middlewares.use('/__number_field__', async (_request, response) => { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(await server.transformIndexHtml('/__number_field__', fixture)); }); } }]
});
let browser;
const checks = [];
try {
    await vite.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    const errors = [], warnings = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'warning' && /Vue warn/i.test(message.text())) warnings.push(message.text()); });
    await page.goto('http://127.0.0.1:' + vite.httpServer.address().port + '/__number_field__');
    await page.waitForFunction(() => !!window.numberProtocol);

    const base = page.locator('#base-section');
    const baseInput = base.locator('input[role="spinbutton"]');
    assert.equal(await baseInput.inputValue(), '12345');
    assert.equal(await baseInput.getAttribute('maxlength'), '5');
    assert.equal(await base.locator('#base-counter-slot').textContent(), '5 / 5');
    assert.equal(await base.locator('#base-counter-slot').getAttribute('data-max'), '5');
    assert.equal(await base.locator('output.u-input-counter').evaluate(node => node.classList.contains('is-over-limit')), false);
    assert.equal(await base.locator('#label-slot').textContent(), 'Label slot');
    assert.equal(await base.locator('.message-slot').textContent(), 'Message slot: Base message');
    assert.equal(await base.locator('#default-slot').getAttribute('data-control-id'), await baseInput.getAttribute('id'));
    for (const selector of ['#prepend-slot', '#prepend-inner-slot', '#append-inner-slot', '#append-slot']) assert.equal(await base.locator(selector).count(), 1, `${selector} is forwarded`);
    assert.equal(await base.locator('#loader-slot').getAttribute('data-active'), 'true');
    assert.equal(await base.locator('#clear-slot').count(), 1);
    const baseCounterId = await base.locator('output.u-input-counter').getAttribute('id');
    assert.ok((await baseInput.getAttribute('aria-describedby')).split(/\s+/).includes(baseCounterId));
    await page.evaluate(() => window.numberProtocol.set('base', 123456));
    await page.evaluate(() => window.numberProtocol.flush());
    assert.equal(await base.locator('#base-counter-slot').textContent(), '6 / 5');
    assert.ok(await base.locator('output.u-input-counter').evaluate(node => node.classList.contains('is-over-limit')));
    checks.push('label/message/default/inner slots, adornments, loader and maxlength-preferred counter/ARIA contract');

    const focusCounter = page.locator('#counter-section input[role="spinbutton"]').nth(0);
    const focusOutput = page.locator('#counter-section output.u-input-counter').nth(0);
    assert.equal(await focusOutput.evaluate(node => getComputedStyle(node).display), 'none');
    await focusCounter.focus();
    await page.waitForTimeout(0);
    assert.notEqual(await focusOutput.evaluate(node => getComputedStyle(node).display), 'none');
    await focusCounter.evaluate(node => node.blur());
    await page.waitForTimeout(0);
    assert.equal(await focusOutput.evaluate(node => getComputedStyle(node).display), 'none');
    const persistentOutput = page.locator('#counter-section output.u-input-counter').nth(1);
    assert.notEqual(await persistentOutput.evaluate(node => getComputedStyle(node).display), 'none');
    assert.equal(await page.locator('#custom-counter').getAttribute('data-value'), '20');
    assert.equal(await page.locator('#custom-counter').getAttribute('data-max'), '20');
    await page.evaluate(() => window.numberProtocol.set('customCounter', 7));
    await page.evaluate(() => window.numberProtocol.flush());
    assert.equal(await page.locator('#custom-counter').getAttribute('data-value'), '10');
    checks.push('counter focus visibility, persistentCounter and custom counterValue function');

    assert.ok((await page.locator('#base-section input[role="spinbutton"]').getAttribute('aria-describedby')).split(/\s+/).includes(await base.locator('output.u-input-counter').getAttribute('id')));
    assert.equal(await page.locator('#base-section .ui-input-adornment').count(), 4);
    assert.equal(await page.locator('#details-section #explicit-details').textContent(), 'Explicit details');
    const eventsBeforeClear = await page.evaluate(() => window.numberProtocol.state.events.filter(event => event[0] === 'clear' && event[1] === 'base').length);
    await page.locator('#clear-slot').click();
    await page.evaluate(() => window.numberProtocol.flush());
    assert.equal(await page.evaluate(() => window.numberProtocol.state.base), null);
    assert.equal(await baseInput.evaluate(node => document.activeElement === node), true);
    assert.equal(await page.evaluate(() => window.numberProtocol.state.events.filter(event => event[0] === 'clear' && event[1] === 'base').length), eventsBeforeClear + 1);
    assert.equal(await base.locator('#clear-slot').count(), 1, 'persistentClear keeps the clear slot mounted after emptying');
    assert.equal(await page.locator('#guards-section #readonlyClear-clear').count(), 0);
    assert.equal(await page.locator('#guards-section .u-input-clear').count(), 0);
    assert.equal(await page.evaluate(() => window.numberProtocol.state.readonlyClear), 9);
    assert.equal(await page.evaluate(() => window.numberProtocol.state.disabledClear), 11);
    await page.evaluate(() => window.numberProtocol.set('loading', false));
    await page.evaluate(() => window.numberProtocol.flush());
    assert.equal(await base.locator('#loader-slot').count(), 0);
    checks.push('clear emits once, sets null, restores input focus; disabled/readonly guard and loader slot removal');

    const end = page.locator('#layout-section .ui-number-input').nth(0);
    const endBody = await end.locator('.ui-number-input-body').boundingBox();
    const endDecrement = await end.locator('.ui-control-step').nth(0).boundingBox();
    const endIncrement = await end.locator('.ui-control-step').nth(1).boundingBox();
    assert.ok(endBody.x < endDecrement.x && endDecrement.x < endIncrement.x, 'end variant positions body before both controls');
    const stacked = page.locator('#layout-section .ui-number-input').nth(1);
    const stackedDecrement = await stacked.locator('.ui-control-step').nth(0).boundingBox();
    const stackedIncrement = await stacked.locator('.ui-control-step').nth(1).boundingBox();
    assert.ok(stackedIncrement.y < stackedDecrement.y, 'stacked variant places increment above decrement');
    assert.equal(await page.locator('#layout-section .ui-number-input.is-control-hidden .ui-control-step').count(), 0);
    assert.equal(await page.locator('#layout-section .ui-number-input.is-input-hidden input').count(), 0);
    assert.equal(await page.locator('#layout-section .ui-number-input.is-input-hidden .ui-control-step').count(), 2);
    checks.push('end/stacked/hidden/hideInput layout modes verified through actual element bounds');

    const slotIncrement = page.locator('#slot-increment');
    assert.equal(await slotIncrement.getAttribute('type'), 'button');
    assert.ok((await slotIncrement.getAttribute('class')).includes('ui-control-step'));
    assert.equal(await slotIncrement.getAttribute('aria-label'), '增加数值');
    await slotIncrement.click();
    assert.equal(await page.evaluate(() => window.numberProtocol.state.single), 11, 'one pointer click performs one step');
    const holdButton = page.locator('#step-section .ui-number-input').nth(1).locator('.ui-control-step').last();
    const beforeHold = await page.evaluate(() => window.numberProtocol.state.hold);
    await holdButton.dispatchEvent('pointerdown', { button: 0, isPrimary: true, pointerId: 81, pointerType: 'mouse', clientX: 5, clientY: 5 });
    await page.waitForTimeout(625);
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, isPrimary: true, pointerId: 81, pointerType: 'mouse' })));
    await page.evaluate(() => window.numberProtocol.flush());
    const afterHold = await page.evaluate(() => window.numberProtocol.state.hold);
    assert.ok(afterHold - beforeHold >= 3, `500ms hold repeats: expected >=3, got ${afterHold - beforeHold}`);
    checks.push('custom increment/decrement slot props reach UiButton; single click and 500ms hold repeat semantics');

    const readonlyInput = page.locator('#guards-section input[role="spinbutton"]').nth(0);
    await readonlyInput.focus();
    await readonlyInput.press('ArrowUp');
    assert.equal(await page.evaluate(() => window.numberProtocol.state.readonlyClear), 9);
    assert.equal(await page.locator('#guards-section .u-input-clear').count(), 0);
    assert.equal(await page.locator('#base-section #base-counter-slot').getAttribute('data-max'), '5');
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);

    const demo = page.locator('#number-demo');
    await demo.locator('input.ui-switch').nth(0).check();
    await demo.locator('input.ui-switch').nth(1).check();
    const demoPrice = demo.locator('.ui-number-input').nth(3);
    assert.equal(await demoPrice.locator('.u-input-loading').count(), 1);
    assert.notEqual(await demo.locator('output.u-input-counter').last().evaluate(node => getComputedStyle(node).display), 'none');
    const numberInputStyles = await page.locator('.ui-number-input-body > input').evaluateAll(nodes => nodes.map(node => {
        const style = getComputedStyle(node);
        return { borderWidth: style.borderWidth, backgroundColor: style.backgroundColor, minWidth: style.minWidth };
    }));
    assert.ok(numberInputStyles.length > 0, 'number inputs exist for native-shell style checks');
    assert.ok(await page.locator('#details-section .ui-number-input.is-dense').count(), 'style checks include an explicitly dense NumberInput');
    for (const [index, style] of numberInputStyles.entries()) {
        assert.equal(style.borderWidth, '0px', `number input ${index} has no native border`);
        assert.equal(style.backgroundColor, 'rgba(0, 0, 0, 0)', `number input ${index} has a transparent background`);
        assert.equal(style.minWidth, '0px', `number input ${index} can shrink inside its control`);
    }
    checks.push(`all ${numberInputStyles.length} number inputs compute to border 0, transparent background and min-width 0`);

    const assertDemoFits = async (label, viewportWidth) => {
        const metrics = await demo.evaluate(element => {
            const rect = element.getBoundingClientRect();
            return {
                left: rect.left,
                right: rect.right,
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
                documentWidth: document.documentElement.scrollWidth,
                inputs: Array.from(element.querySelectorAll('.ui-number-input-body > input')).map(input => {
                    const inputRect = input.getBoundingClientRect();
                    const bodyRect = input.parentElement.getBoundingClientRect();
                    return { left: inputRect.left, right: inputRect.right, bodyLeft: bodyRect.left, bodyRight: bodyRect.right };
                })
            };
        });
        assert.ok(metrics.left >= -1 && metrics.right <= viewportWidth + 1, `${label} demo stays inside the viewport: ${JSON.stringify(metrics)}`);
        assert.ok(metrics.documentWidth <= viewportWidth + 1, `${label} page has no horizontal overflow: ${JSON.stringify(metrics)}`);
        assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${label} NumberInput demo has no internal horizontal overflow: ${JSON.stringify(metrics)}`);
        assert.ok(metrics.inputs.every(input => input.left >= input.bodyLeft - 1 && input.right <= input.bodyRight + 1), `${label} number inputs fit their bodies: ${JSON.stringify(metrics.inputs)}`);
        return metrics;
    };

    const demoScreenshots = [];
    const captureDemo = async name => {
        const screenshot = `${name}.png`;
        await demo.screenshot({ path: path.join(evidence, screenshot) });
        demoScreenshots.push(screenshot);
    };
    await page.evaluate(() => window.numberProtocol.theme('light'));
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.evaluate(() => { document.documentElement.style.zoom = '1'; });
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(evidence, 'number-input-light-1200.png'), fullPage: true });
    await captureDemo('number-demo-light-wide');
    await page.evaluate(() => window.numberProtocol.theme('dark'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    const narrowMetrics = await assertDemoFits('dark 390px', 390);
    await page.screenshot({ path: path.join(evidence, 'number-input-dark-390.png'), fullPage: true });
    await captureDemo('number-demo-dark-390');
    await page.evaluate(() => { window.numberProtocol.theme('light'); document.documentElement.style.zoom = '1.25'; });
    await page.waitForTimeout(250);
    const zoomMetrics = await assertDemoFits('CSS zoom 125%', 390);
    await page.screenshot({ path: path.join(evidence, 'number-input-light-390-zoom-125.png'), fullPage: true });
    await captureDemo('number-demo-light-390-csszoom125');
    checks.push(`real NumberInput demo fits narrow and CSS zoom layouts: ${JSON.stringify({ narrowMetrics, zoomMetrics })}`);
    assert.deepEqual(await hashes(), before);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ checks, sourceHashes: before, errors, warnings, screenshots: ['number-input-light-1200.png', 'number-input-dark-390.png', 'number-input-light-390-zoom-125.png', ...demoScreenshots], visualAcceptance: false }, null, 4));
    process.stdout.write(JSON.stringify({ checks: checks.length, evidence }));
} finally {
    await browser?.close();
    await vite.close();
}

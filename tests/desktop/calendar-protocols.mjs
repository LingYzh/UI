import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/calendar-protocols');
await mkdir(evidence, { recursive: true });
const files = [
    'src/ui/UCalendar.vue', 'src/ui/UDatePicker.vue', 'src/ui/calendar.ts', 'src/ui/date-model.ts',
    'src/ui/locale-context.ts', 'src/ui/locale.ts', 'src/ui/ripple.ts', 'src/ui/UiButton.vue',
    'src/ui/data-components.css', 'src/ui/forms-components.css', 'src/ui/styles.css',
    'src/ui/docs/component-examples/calendar.vue', 'src/ui/docs/component-examples/date-picker.vue'
];
const hashes = async () => Object.fromEntries(await Promise.all(files.map(async file => [file, createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')])));
const before = await hashes();
const fixture = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Calendar protocol fixture</title><link rel="icon" href="data:,"><style>html,body,#app{height:auto!important;overflow:visible!important}body{margin:0;padding:20px;background:var(--surface);color:var(--text)}main{display:grid;gap:20px;max-width:1100px;margin:auto}section{min-width:0;padding:12px;border:1px solid var(--border);border-radius:12px}.week-result{display:block}</style></head><body><div id="app"></div><script type="module">
import {createApp,defineComponent,h,nextTick,reactive,ref} from 'vue';import * as UI from '/src/ui/index.ts';import CalendarDemo from '/src/ui/docs/component-examples/calendar.vue';import DatePickerDemo from '/src/ui/docs/component-examples/date-picker.vue';import '/src/docs-base.css';import '/src/ui/styles.css';
const state=reactive({date:'2026-10-06',type:'week',hide:false,events:[],providerLocale:'en-US',firstDayOfWeek:undefined,firstDayOfYear:undefined,showWeek:true,selectedDate:null,controlledView:'months'});const cal=ref();
const oldEvents=[{id:1,title:'Across weeks',start:'2026-10-06',end:'2026-10-13',allDay:true},{id:2,title:'First',start:'2026-10-06 09:00',end:'2026-10-06 10:30',timed:true,category:'Design'},{id:3,title:'Second',start:'2026-10-06 09:30',end:'2026-10-06 11:00',timed:true,category:'Dev'}];
const overlapEvents=[{id:'a',title:'First row',start:'2026-10-06',end:'2026-10-10',allDay:true},{id:'b',title:'Second row',start:'2026-10-06',end:'2026-10-09',allDay:true}];
const rippleEvents=[{id:'r1',title:'Regular first',start:'2026-10-06 09:00',end:'2026-10-06 10:00',timed:true},{id:'r2',title:'Regular second',start:'2026-10-06 10:00',end:'2026-10-06 11:00',timed:true},{id:'r3',title:'All day',start:'2026-10-06',end:'2026-10-07',allDay:true}];
const Root=defineComponent({setup(){const weekCalendar=()=>h(UI.UCalendar,{modelValue:'2023-01-01',locale:undefined,firstDayOfWeek:state.firstDayOfWeek,firstDayOfYear:state.firstDayOfYear,showWeek:state.showWeek,hideHeader:true},{week:({week,days})=>h('output',{class:'week-result','data-week':week,'data-start':days[0]?.date,'data-dates':days.map(day=>day.date).join(',')},String(week))});const weekPicker=()=>h(UI.UDatePicker,{modelValue:new Date(2023,0,1),locale:undefined,firstDayOfWeek:state.firstDayOfWeek,firstDayOfYear:state.firstDayOfYear,showWeek:state.showWeek,hideHeader:false});return()=>h('main',[
h('section',{id:'month'},[h(UI.UCalendar,{modelValue:'2026-10-06',events:oldEvents,eventMore:false,'onClick:event':s=>state.events.push(['event',s.event.id])})]),
h('section',{id:'timed'},[h(UI.UCalendar,{ref:cal,modelValue:state.date,'onUpdate:modelValue':v=>state.date=v,type:state.type,hideWeekdays:state.hide,now:'2026-10-06 09:15',firstTime:'08:00',intervalCount:5,events:oldEvents,categories:['Design','Dev'],'onClick:interval':s=>state.events.push(['interval',s.time]),'onClick:time':s=>state.events.push(['time',s.time]),'onClick:dayCategory':s=>state.events.push(['dayCategory',s.category.categoryName]),'onClick:timeCategory':s=>state.events.push(['timeCategory',s.category.categoryName]),onChange:s=>state.events.push(['change',s.start.date])})]),
h('section',{id:'locale-week'},[h(UI.ULocaleProvider,{locale:state.providerLocale},{default:()=>[weekCalendar(),weekPicker()]})]),
h('section',{id:'geometry-default'},[h(UI.UCalendar,{modelValue:'2026-10-06',events:overlapEvents,showWeek:true,eventMore:false})]),
h('section',{id:'geometry-one'},[h(UI.UCalendar,{modelValue:'2026-10-06',events:overlapEvents,showWeek:true,eventMarginBottom:1,eventMore:false})]),
h('section',{id:'ripple-default-month'},[h(UI.UCalendar,{modelValue:'2026-10-06',events:rippleEvents,eventMore:true,eventLimit:1})]),
h('section',{id:'ripple-default-timed'},[h(UI.UCalendar,{modelValue:'2026-10-06',type:'day',now:'2026-10-06 09:15',firstTime:'08:00',intervalCount:5,events:rippleEvents})]),
h('section',{id:'ripple-explicit-false'},[h(UI.UCalendar,{modelValue:'2026-10-06',events:rippleEvents,eventRipple:false})]),
h('section',{id:'ripple-boolean'},[h(UI.UCalendar,{modelValue:'2026-10-06',events:rippleEvents,eventRipple:true})]),
h('section',{id:'ripple-options-month'},[h(UI.UCalendar,{modelValue:'2026-10-06',events:rippleEvents,eventMore:true,eventLimit:1,eventRipple:{center:true,class:'calendar-protocol-wave'}})]),
h('section',{id:'ripple-options-timed'},[h(UI.UCalendar,{modelValue:'2026-10-06',type:'day',now:'2026-10-06 09:15',firstTime:'08:00',intervalCount:5,events:rippleEvents,eventRipple:{center:true,class:'calendar-protocol-wave'}})]),
h('section',{id:'picker-year'},[h(UI.UDatePicker,{modelValue:new Date(2023,0,1),locale:'en-US',noMonthPicker:true,showWeek:true})]),
h('section',{id:'picker-month'},[h(UI.UDatePicker,{modelValue:new Date(2023,0,1),locale:'en-US',noMonthPicker:false,showWeek:true})]),
h('section',{id:'picker-controlled'},[h(UI.UDatePicker,{modelValue:new Date(2023,0,1),locale:'en-US',viewMode:state.controlledView,'onUpdate:viewMode':value=>state.controlledView=value})]),
h('section',{id:'calendar-demo'},[h(CalendarDemo)]),h('section',{id:'date-picker-demo'},[h(DatePickerDemo)])])}});
const ui=UI.createUI();createApp(Root).use(ui).mount('#app');window.calendarProtocol={state,theme:v=>ui.theme.change(v,false),timeToY:v=>cal.value.timeToY(v),scroll:v=>cal.value.scrollToTime(v),move:n=>cal.value.move(n),flush:async()=>{await nextTick();await nextTick();await new Promise(resolve=>setTimeout(resolve,0));}};
</script></body></html>`;
const vite = await createServer({
    root,
    appType: 'custom',
    cacheDir: path.join(evidence, 'vite-cache'),
    resolve: { dedupe: ['vue'] },
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } },
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true, include: ['highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript', 'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json', 'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'] },
    plugins: [{ name: 'calendar-protocol-fixture', configureServer(server) { server.middlewares.use('/__calendar__', async (_request, response) => { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(await server.transformIndexHtml('/__calendar__', fixture)); }); } }]
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
    await page.goto('http://127.0.0.1:' + vite.httpServer.address().port + '/__calendar__');
    await page.waitForFunction(() => !!window.calendarProtocol);
    assert.equal(await page.locator('#month .is-all-day').count(), 2);
    const span = await page.locator('#month .is-all-day').first().boundingBox();
    const cell = await page.locator('#month .u-calendar-cell').first().boundingBox();
    assert.ok(span.width > cell.width * 4);
    assert.equal(await page.locator('#month .is-continuing-end').count(), 1);
    await page.locator('#month .is-all-day').first().click();
    assert.ok(await page.evaluate(() => window.calendarProtocol.state.events.some(value => value[0] === 'event' && value[1] === 1)));
    assert.equal(await page.locator('#timed .is-timed').count(), 2);
    const timedBounds = await page.locator('#timed .is-timed').evaluateAll(nodes => nodes.map(node => ({ left: node.style.left, width: node.style.width, top: node.style.top })));
    assert.notEqual(timedBounds[0].left, timedBounds[1].left);
    assert.notEqual(timedBounds[0].top, timedBounds[1].top);
    assert.equal(await page.evaluate(() => window.calendarProtocol.timeToY('09:00')), 48);
    assert.equal(await page.evaluate(() => window.calendarProtocol.scroll('10:00')), true);
    await page.evaluate(() => window.calendarProtocol.state.type = 'category');
    await page.locator('#timed .u-calendar-category').first().click();
    assert.equal(await page.locator('#timed .is-timed').count(), 2);
    await page.locator('#timed .u-calendar-time-day').first().locator('.u-calendar-interval').first().click({ position: { x: 10, y: 10 } });
    assert.ok(await page.evaluate(() => ['interval', 'time', 'timeCategory', 'dayCategory'].every(kind => window.calendarProtocol.state.events.some(value => value[0] === kind))));
    await page.evaluate(() => { window.calendarProtocol.state.hide = true; window.calendarProtocol.state.type = '4day'; });
    assert.equal(await page.locator('#timed .u-calendar-time-day').count(), 4);
    await page.evaluate(() => window.calendarProtocol.move(1));
    assert.equal(await page.evaluate(() => window.calendarProtocol.state.date), '2026-10-10');
    checks.push('legacy all-day/timed/category/navigation protocol remains intact');

    const localeCases = [['en-US', '1', '2023-01-01'], ['en-GB', '52', '2022-12-26'], ['zh-CN', '1', '2022-12-26']];
    for (const [locale, expected, expectedStart] of localeCases) {
        await page.evaluate(value => { window.calendarProtocol.state.providerLocale = value; window.calendarProtocol.state.firstDayOfWeek = undefined; window.calendarProtocol.state.firstDayOfYear = undefined; }, locale);
        await page.evaluate(() => window.calendarProtocol.flush());
        const calendarWeek = await page.locator('#locale-week .week-result').first().getAttribute('data-week');
        const pickerWeek = await page.locator('#locale-week .u-date-week-number').first().textContent();
        assert.equal(calendarWeek, expected, `${locale} Calendar first week`);
        assert.equal(pickerWeek.trim(), expected, `${locale} DatePicker first week`);
        assert.equal(await page.locator('#locale-week .week-result').first().getAttribute('data-start'), expectedStart, `${locale} Calendar first weekday`);
        const calendarWeekdays = await page.locator('#locale-week .u-calendar-month > .u-calendar-grid:first-child .u-calendar-weekday').evaluateAll(nodes => nodes.map(node => node.textContent.trim()).filter(text => text !== '#'));
        const pickerWeekdays = await page.locator('#locale-week .u-date-picker-grid > .u-date-weekday:not(.u-date-week-number)').evaluateAll(nodes => nodes.map(node => node.textContent.trim()).filter(text => text !== '#'));
        assert.deepEqual(calendarWeekdays, pickerWeekdays, `${locale} Calendar and DatePicker weekday order`);
    }
    await page.evaluate(() => { window.calendarProtocol.state.providerLocale = 'en-US'; window.calendarProtocol.state.firstDayOfWeek = 1; window.calendarProtocol.state.firstDayOfYear = 4; });
    await page.evaluate(() => window.calendarProtocol.flush());
    assert.equal(await page.locator('#locale-week .week-result').first().getAttribute('data-week'), '52');
    assert.equal(await page.locator('#locale-week .u-date-week-number').first().textContent(), '52');
    await page.evaluate(() => { window.calendarProtocol.state.firstDayOfWeek = '1'; window.calendarProtocol.state.firstDayOfYear = '0'; });
    await page.evaluate(() => window.calendarProtocol.flush());
    assert.equal(await page.locator('#locale-week .week-result').first().getAttribute('data-week'), '1');
    assert.equal(await page.locator('#locale-week .u-date-week-number').first().textContent(), '1');
    assert.equal((await page.locator('#locale-week .week-result').first().getAttribute('data-dates')).split(',').length, 7);
    await page.evaluate(() => window.calendarProtocol.state.firstDayOfYear = 0);
    await page.evaluate(() => window.calendarProtocol.flush());
    assert.equal(await page.locator('#locale-week .week-result').first().getAttribute('data-week'), '1');
    assert.equal(await page.locator('#locale-week .u-date-week-number').first().textContent(), '1');
    await page.evaluate(() => { window.calendarProtocol.state.firstDayOfWeek = undefined; window.calendarProtocol.state.firstDayOfYear = undefined; window.calendarProtocol.state.showWeek = false; });
    await page.evaluate(() => window.calendarProtocol.flush());
    assert.equal(await page.locator('#locale-week .u-calendar-week-number').count(), 0);
    assert.equal(await page.locator('#locale-week .u-date-week-number').count(), 0);
    assert.ok(!(await page.locator('#locale-week .u-calendar-week').first().evaluate(node => getComputedStyle(node).gridTemplateColumns.startsWith('28px '))));
    assert.ok(!(await page.locator('#locale-week .u-date-picker-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.startsWith('28px '))));
    await page.evaluate(() => window.calendarProtocol.state.showWeek = true);
    await page.evaluate(() => window.calendarProtocol.flush());
    assert.equal(await page.locator('#locale-week .u-calendar-week-number').first().evaluate(node => node.getBoundingClientRect().width), 28);
    assert.equal(await page.locator('#locale-week .u-date-week-number').first().evaluate(node => node.getBoundingClientRect().width), 28);
    checks.push('provider locale reactivity, locale and numeric/string week overrides, matching slots and 28px gutters');

    for (const id of ['geometry-default', 'geometry-one']) {
        const boxes = await page.locator(`#${id} .is-all-day`).evaluateAll(nodes => nodes.map(node => { const rect = node.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom, height: rect.height, left: rect.left }; }));
        const week = await page.locator(`#${id} .u-calendar-week-number`).first().boundingBox();
        assert.equal(boxes.length, 2);
        assert.equal(boxes[0].height, 20, `${id} first all-day event height`);
        assert.equal(boxes[1].height, 20, `${id} second all-day event height`);
        assert.ok(boxes.every(box => box.left >= week.x + week.width), `${id} spans must start after the week gutter`);
        const gap = Math.round(boxes[1].top - boxes[0].bottom);
        assert.equal(gap, id === 'geometry-default' ? 3 : 1, `${id} actual adjacent bounds gap`);
    }
    checks.push('all-day events retain exact 20px bounds, 3px/1px actual row gaps and week-gutter clearance');

    async function pointerDown(selector) {
        await page.locator(selector).first().evaluate(node => {
            const rect = node.getBoundingClientRect();
            node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, isPrimary: true, pointerId: 71, pointerType: 'mouse', clientX: rect.left + 3, clientY: rect.top + 3 }));
        });
    }
    const defaultRippleTargets = ['#ripple-default-month .is-all-day', '#ripple-default-month .u-calendar-event:not(.is-all-day)', '#ripple-default-month .u-calendar-more', '#ripple-default-timed .is-timed'];
    for (const selector of defaultRippleTargets) {
        assert.ok(await page.locator(selector).count(), `${selector} exists for default ripple check`);
        await pointerDown(selector);
        assert.equal(await page.locator(selector).first().locator('.ui-ripple-wave').count(), 0, `${selector} defaults to no ripple`);
    }
    await pointerDown('#ripple-explicit-false .is-all-day');
    assert.equal(await page.locator('#ripple-explicit-false .is-all-day .ui-ripple-wave').count(), 0, 'eventRipple=false suppresses an all-day wave');
    await pointerDown('#ripple-boolean .u-calendar-event:not(.is-all-day)');
    assert.equal(await page.locator('#ripple-boolean .u-calendar-event:not(.is-all-day) .ui-ripple-wave').count(), 1, 'eventRipple=true enables a normal event wave');
    const enabledRippleTargets = ['#ripple-options-month .is-all-day', '#ripple-options-month .u-calendar-event:not(.is-all-day)', '#ripple-options-month .u-calendar-more', '#ripple-options-timed .is-timed'];
    for (const selector of enabledRippleTargets) {
        await pointerDown(selector);
        assert.equal(await page.locator(selector).first().locator('.ui-ripple-wave').count(), 1, `${selector} receives an option ripple`);
        assert.ok(await page.locator(selector).first().locator('.calendar-protocol-wave').count());
    }
    await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    await page.waitForTimeout(30);
    assert.equal(await page.locator('#ripple-options-month .ui-ripple-wave').count(), 0);
    await pointerDown('#ripple-options-month .is-all-day');
    assert.equal(await page.locator('#ripple-options-month .is-all-day .ui-ripple-wave').count(), 0);
    await page.evaluate(() => delete document.documentElement.dataset.reducedMotion);
    checks.push('ripple stays off by default; boolean/object options cover all event surfaces and reduced motion suppresses waves');

    const yearPicker = page.locator('#picker-year');
    await yearPicker.locator('.u-date-picker-header button').nth(1).click();
    assert.ok(await yearPicker.locator('.u-date-picker-options.is-years').count());
    await yearPicker.getByRole('button', { name: '2024', exact: true }).click();
    assert.equal(await yearPicker.locator('.u-date-picker-options.is-years').count(), 0);
    assert.equal(await yearPicker.locator('.u-date-picker-grid').count(), 1);
    const monthPicker = page.locator('#picker-month');
    await monthPicker.locator('.u-date-picker-header button').nth(1).click();
    assert.equal(await monthPicker.locator('.u-date-picker-options:not(.is-years) button').count(), 12);
    await monthPicker.locator('.u-date-picker-options:not(.is-years) button').first().click();
    assert.equal(await monthPicker.locator('.u-date-picker-grid').count(), 1);
    assert.equal(await page.locator('#picker-controlled .u-date-picker-options:not(.is-years) button').count(), 12);
    checks.push('noMonthPicker enters year and returns to month; default months path and explicit viewMode remain available');

    async function chooseAutocomplete(section, index, text) {
        const input = page.locator(`#${section} input[role="combobox"]`).nth(index);
        await input.click();
        await page.getByRole('option', { name: text, exact: true }).last().click();
        await page.waitForTimeout(80);
    }
    await chooseAutocomplete('calendar-demo', 0, 'en-GB');
    await page.locator('#calendar-demo input.ui-switch').nth(0).check();
    await page.locator('#calendar-demo input.ui-switch').nth(1).check();
    await page.locator('#calendar-demo input.ui-switch').nth(2).check();
    await chooseAutocomplete('date-picker-demo', 0, 'en-GB');
    await page.locator('#date-picker-demo input.ui-switch').nth(0).check();
    await page.locator('#date-picker-demo input.ui-switch').nth(1).check();
    await page.locator('#date-picker-demo select.ui-select').selectOption('4');
    assert.ok(await page.locator('#calendar-demo .u-calendar-week-number').count() > 0);
    await pointerDown('#calendar-demo .is-all-day');
    assert.equal(await page.locator('#calendar-demo .is-all-day .ui-ripple-wave').count(), 1);
    assert.equal(await page.locator('#date-picker-demo select.ui-select').inputValue(), '4');
    await page.locator('#date-picker-demo .u-date-picker-header button').nth(1).click();
    assert.ok(await page.locator('#date-picker-demo .u-date-picker-options.is-years').count() > 0);

    // Leave the live DatePicker demo in its calendar-grid mode for the real-demo captures.
    await page.locator('#date-picker-demo input.ui-switch').nth(1).uncheck();
    const demoYearOption = page.locator('#date-picker-demo .u-date-picker-options.is-years button').filter({ hasText: /^2026$/ });
    if (await demoYearOption.count()) await demoYearOption.click();
    const demoMonthOptions = page.locator('#date-picker-demo .u-date-picker-options:not(.is-years) button');
    if (await demoMonthOptions.count()) await demoMonthOptions.nth(9).click();
    assert.ok(await page.locator('#date-picker-demo .u-date-picker-grid').count(), 'real DatePicker demo returns to its calendar grid before screenshots');

    const visualScreenshots = [];
    const assertDemoWithinViewport = async (selector, width, label) => {
        const demo = page.locator(selector);
        const metrics = await demo.evaluate(element => {
            const rect = element.getBoundingClientRect();
            return {
                left: rect.left,
                right: rect.right,
                width: rect.width,
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
                documentWidth: document.documentElement.scrollWidth
            };
        });
        assert.ok(metrics.left >= -1 && metrics.right <= width + 1, `${label} stays within the viewport: ${JSON.stringify(metrics)}`);
        assert.ok(metrics.documentWidth <= width + 1, `${label} page has no horizontal overflow: ${JSON.stringify(metrics)}`);
        assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${label} demo has no internal horizontal overflow: ${JSON.stringify(metrics)}`);

        if (selector === '#calendar-demo') {
            const week = demo.locator('.u-calendar-week-number').first();
            const event = demo.locator('.u-calendar-month .is-all-day').first();
            assert.ok(await week.count(), `${label} retains a visible Calendar week-number gutter`);
            const weekBounds = await week.boundingBox();
            assert.ok(weekBounds && weekBounds.width > 0 && weekBounds.height > 0, `${label} week number is visible: ${JSON.stringify(weekBounds)}`);
            assert.ok((await week.innerText()).trim(), `${label} week number has readable text`);
            assert.ok(await event.count(), `${label} retains the all-day event`);
            const eventBounds = await event.boundingBox();
            assert.ok(eventBounds && eventBounds.width > 0 && eventBounds.height > 0, `${label} event is visible: ${JSON.stringify(eventBounds)}`);
            assert.ok((await event.innerText()).trim(), `${label} event text remains visible`);
        } else {
            const week = demo.locator('.u-date-week-number').first();
            const markers = demo.locator('.u-date-events i');
            const weekCount = await week.count();
            const pickerState = await demo.evaluate(element => ({
                pickerCount: element.querySelectorAll('.u-date-picker').length,
                gridCount: element.querySelectorAll('.u-date-picker-grid').length,
                options: Array.from(element.querySelectorAll('.u-date-picker-options')).map(node => node.className),
                weekCount: element.querySelectorAll('.u-date-week-number').length,
                text: element.innerText.slice(-300)
            }));
            assert.ok(weekCount, `${label} retains the DatePicker week-number gutter: ${JSON.stringify(pickerState)}`);
            const weekBounds = await week.boundingBox();
            assert.ok(weekBounds && weekBounds.width > 0 && weekBounds.height > 0, `${label} DatePicker week number is visible: ${JSON.stringify(weekBounds)}`);
            assert.ok((await week.innerText()).trim(), `${label} DatePicker week number has readable text`);
            assert.ok(await markers.count(), `${label} retains event markers`);
            assert.ok((await demo.locator('output').innerText()).trim(), `${label} DatePicker summary text remains visible`);
        }
        return metrics;
    };

    const captureDemoPair = async (suffix, theme, width, height, zoom) => {
        await page.setViewportSize({ width, height });
        await page.evaluate(({ nextTheme, nextZoom }) => {
            window.calendarProtocol.theme(nextTheme);
            document.documentElement.style.zoom = nextZoom ? '1.25' : '1';
            window.scrollTo(0, 0);
        }, { nextTheme: theme, nextZoom: zoom });
        await page.waitForTimeout(300);
        const viewportWidth = width;
        const calendarMetrics = await assertDemoWithinViewport('#calendar-demo', viewportWidth, `Calendar ${suffix}`);
        const datePickerMetrics = await assertDemoWithinViewport('#date-picker-demo', viewportWidth, `DatePicker ${suffix}`);
        for (const [selector, baseName] of [['#calendar-demo', 'calendar-demo'], ['#date-picker-demo', 'date-picker-demo']]) {
            const screenshot = `${baseName}-${suffix}.png`;
            await page.locator(selector).screenshot({ path: path.join(evidence, screenshot) });
            visualScreenshots.push(screenshot);
        }
        return { calendarMetrics, datePickerMetrics };
    };

    await page.evaluate(() => window.calendarProtocol.theme('light'));
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.evaluate(() => { document.documentElement.style.zoom = '1'; });
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(evidence, 'calendar-date-picker-light-1200.png'), fullPage: true });
    const wideMetrics = await captureDemoPair('light-wide', 'light', 1200, 900, false);
    await page.evaluate(() => window.calendarProtocol.theme('dark'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(evidence, 'calendar-date-picker-dark-390.png'), fullPage: true });
    const narrowMetrics = await captureDemoPair('dark-390', 'dark', 390, 844, false);
    await page.evaluate(() => { window.calendarProtocol.theme('light'); document.documentElement.style.zoom = '1.25'; });
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(evidence, 'calendar-date-picker-light-390-zoom-125.png'), fullPage: true });
    const zoomMetrics = await captureDemoPair('light-390-csszoom125', 'light', 390, 844, true);
    checks.push(`operated real CalendarDemo and DatePickerDemo settings; retained whole-fixture diagnostics and captured both demos at light wide, dark narrow and CSS zoom: ${JSON.stringify({ wideMetrics, narrowMetrics, zoomMetrics })}`);

    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);
    assert.deepEqual(await hashes(), before);
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ checks, sourceHashes: before, errors, warnings, screenshots: ['calendar-date-picker-light-1200.png', 'calendar-date-picker-dark-390.png', 'calendar-date-picker-light-390-zoom-125.png', ...visualScreenshots], visualAcceptance: false }, null, 4));
    process.stdout.write(JSON.stringify({ checks: checks.length, evidence }));
} finally {
    await browser?.close();
    await vite.close();
}

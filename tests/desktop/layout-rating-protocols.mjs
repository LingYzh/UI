import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';
const evidence=path.resolve('artifacts/component-audit-root/layout-rating-protocols');
await mkdir(evidence,{recursive:true});
const files=['UAppBar.vue','UAppBarTitle.vue','UChipGroup.vue','UChip.vue','USlideGroup.vue','URating.vue','UiContainer.vue','UMain.vue','UiRow.vue','UiThemeProvider.vue','dimensions.ts','form.ts','layout-components.css','forms-components.css'];
const hashes=async()=>Object.fromEntries(await Promise.all(files.map(async file=>[file,createHash('sha256').update(await readFile('src/ui/'+file)).digest('hex')])));
const before=await hashes();
const fixture=`<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>html,body,#app{height:auto!important;overflow:visible!important}body{padding:20px;margin:0;background:var(--surface);color:var(--text)}main.test{display:grid;gap:20px;max-width:920px;margin:auto}section{padding:16px;min-width:0;border:1px solid var(--border);border-radius:12px}#bars .ui-app{min-height:220px;transform:translateZ(0);position:relative}#bars .ui-main{min-height:220px}#bar-scroll{height:100px;overflow:auto}#scroll-chips,#wrap-chips{max-width:280px}</style></head><body><div id="app"></div><script type="module">
import {createApp,defineComponent,h,reactive,ref} from 'vue';import * as UI from '/src/ui/index.ts';import '/src/docs-base.css';import '/src/ui/styles.css';
const state=reactive({bar:true,chip:'item-1',rating:2.5,actions:0});const chip=ref();
const nodes=()=>Array.from({length:16},(_,index)=>h(UI.UChip,{value:'item-'+(index+1),disabled:index===7},()=> 'Chip '+(index+1)));
const Root=defineComponent({setup(){return()=>h('main',{class:'test'},[
h('section',{id:'bars'},[h(UI.UApp,{},()=>[h(UI.UAppBar,{modelValue:state.bar,'onUpdate:modelValue':v=>state.bar=v,height:48,title:'App title',scrollBehavior:'hide elevate fade-image',scrollTarget:'#bar-scroll',scrollThreshold:20},{actions:()=>h(UI.UButton,{onClick:()=>state.actions++},()=> 'Bar action'),extension:()=>h(UI.UAppBarTitle,{text:'Extension text',tag:'h2'})}),h(UI.UMain,{},()=>h('div',{id:'bar-scroll'},[h('div',{style:'height:1000px'},'Scrollable content')]))])]),
h('section',{id:'scroll-chips'},[h(UI.UChipGroup,{ref:chip,modelValue:state.chip,'onUpdate:modelValue':v=>state.chip=v,scrollable:true,showArrows:true,centerActive:true},nodes)]),
h('section',{id:'wrap-chips'},[h(UI.UChipGroup,{},nodes)]),
h('section',{id:'rating'},[h(UI.URating,{modelValue:state.rating,'onUpdate:modelValue':v=>state.rating=v,halfIncrements:true,hover:true,label:'Quality'})]),
h('section',{id:'basic-layout'},[h(UI.UThemeProvider,{tag:'article',as:'aside'},()=>h(UI.UContainer,{tag:'section',width:'280',height:180,maxWidth:'100%',fluid:true},()=>[
h(UI.UMain,{tag:'div',scrollable:true,height:'120',minHeight:0},()=>h('p',{style:'height:400px'},'Main inner scrolling')),
h(UI.URow,{align:'start',alignMd:'end',justify:'center',justifyMd:'space-between',alignContent:'stretch',alignContentMd:'end',dense:true},()=>[h(UI.UCol,{},()=> 'A'),h(UI.UCol,{},()=> 'B')])
]))])])}});
const ui=UI.createUI();createApp(Root).use(ui).mount('#app');window.layoutRating={state,scrollTo:value=>chip.value.scrollTo(value),overflow:()=>chip.value.isOverflowing,theme:value=>ui.theme.change(value,false)};
</script></body></html>`;
const vite=await createServer({appType:'custom',cacheDir:path.join(evidence,'cache'),server:{host:'127.0.0.1',port:0},logLevel:'error',optimizeDeps:{noDiscovery:true,include:['highlight.js/lib/core','highlight.js/lib/languages/xml','highlight.js/lib/languages/javascript','highlight.js/lib/languages/typescript','highlight.js/lib/languages/css','highlight.js/lib/languages/json','markdown-it','markdown-it-footnote','markdown-it-task-lists','markdown-it-deflist','markdown-it-mark','markdown-it-sub','markdown-it-sup']}});
vite.middlewares.use('/__layout_rating__',async(_req,res)=>{res.setHeader('Content-Type','text/html');res.end(await vite.transformIndexHtml('/__layout_rating__',fixture));});
let browser;const checks=[];
try{
    await vite.listen();browser=await chromium.launch({headless:true});
    const page=await browser.newPage({viewport:{width:1100,height:900}});
    const errors=[],warnings=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='warning')warnings.push(message.text())});
    await page.goto('http://127.0.0.1:'+vite.httpServer.address().port+'/__layout_rating__');await page.waitForFunction(()=>!!window.layoutRating);
    await page.waitForFunction(()=>parseFloat(document.querySelector('#bars .ui-main').style.getPropertyValue('--ui-app-top'))>90);
    assert.equal(await page.locator('#bars .ui-main').evaluate(node=>parseFloat(node.style.getPropertyValue('--ui-app-top'))),await page.locator('#bars .ui-app-bar').evaluate(node=>node.offsetHeight));
    assert.equal(await page.locator('#bars h2.ui-app-bar-title').textContent(),'Extension text');
    await page.getByRole('button',{name:'Bar action',exact:true}).click();assert.equal(await page.evaluate(()=>window.layoutRating.state.actions),1);
    await page.locator('#bar-scroll').evaluate(node=>node.scrollTop=100);await page.waitForFunction(()=>window.layoutRating.state.bar===false);
    assert.equal(await page.locator('#bars .ui-main').evaluate(node=>node.style.getPropertyValue('--ui-app-top')),'0px');
    await page.locator('#bar-scroll').evaluate(node=>node.scrollTop=10);await page.waitForFunction(()=>window.layoutRating.state.bar===true);
    checks.push('AppBar toolbar slots/title tags, measured extension layout and scroll-hide model');
    await page.waitForFunction(()=>window.layoutRating.overflow());
    await page.evaluate(()=>window.layoutRating.scrollTo({index:15}));
    await page.waitForFunction(()=>document.querySelector('#scroll-chips .u-slide-group-viewport').scrollLeft>0);
    await page.locator('#scroll-chips').getByRole('button',{name:'Chip 16',exact:true}).click();assert.equal(await page.evaluate(()=>window.layoutRating.state.chip),'item-16');
    assert.equal(await page.locator('#wrap-chips .u-slide-group').count(),0);
    assert.equal(await page.locator('#scroll-chips').getByRole('button',{name:'Chip 8',exact:true}).isDisabled(),true);
    checks.push('ChipGroup retains default wrapping and explicit measured scrolling/public refs/disabled selection');
    assert.equal(await page.locator('#rating .ui-rating-filled').nth(2).evaluate(node=>node.style.width),'50%');
    const fourth=page.locator('#rating .ui-rating-star').nth(3);const bounds=await fourth.boundingBox();
    await page.mouse.move(bounds.x+bounds.width*.25,bounds.y+bounds.height*.5);
    assert.equal(await fourth.locator('.ui-rating-filled').evaluate(node=>node.style.width),'50%');
    assert.equal(await page.evaluate(()=>window.layoutRating.state.rating),2.5);
    await page.mouse.click(bounds.x+bounds.width*.25,bounds.y+bounds.height*.5);
    assert.equal(await page.evaluate(()=>window.layoutRating.state.rating),3.5);
    checks.push('Rating fractional fill and pointer hover preview commit half values');
    const basic=page.locator('#basic-layout');
    assert.equal(await basic.locator('article.ui-theme-provider').count(),1,'standard tag overrides legacy as');
    assert.equal(await basic.locator('section.ui-container').evaluate(node=>Math.round(node.getBoundingClientRect().width)),280,'numeric string dimensions use pixels');
    assert.equal(await basic.locator('div.ui-main').evaluate(node=>node.offsetHeight),120,'Main consumes tag and height');
    await basic.locator('.ui-main-scroller').evaluate(node=>node.scrollTop=90);
    assert.equal(await basic.locator('.ui-main-scroller').evaluate(node=>node.scrollTop),90,'Main scrollable keeps an independent viewport');
    assert.deepEqual(await basic.locator('.ui-row').evaluate(node=>{const s=getComputedStyle(node);return[s.alignItems,s.justifyContent,s.alignContent,s.gap]}),['flex-end','space-between','flex-end','8px']);
    checks.push('Container/Main dimensions and independent scrolling, ThemeProvider tag, responsive Row alignment/dense');
    await page.locator('#bar-scroll').evaluate(node=>node.scrollTop=0);
    assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);
    await page.screenshot({path:path.join(evidence,'light-wide.png'),fullPage:true});
    await page.evaluate(()=>window.layoutRating.theme('dark'));await page.waitForTimeout(250);await page.setViewportSize({width:390,height:900});
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('#basic-layout .ui-row')).alignItems==='flex-start');
    assert.deepEqual(await basic.locator('.ui-row').evaluate(node=>{const s=getComputedStyle(node);return[s.alignItems,s.justifyContent,s.alignContent]}),['flex-start','center','stretch']);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=390));await page.screenshot({path:path.join(evidence,'dark-narrow.png'),fullPage:true});
    assert.deepEqual(await hashes(),before);await writeFile(path.join(evidence,'report.json'),JSON.stringify({checks,sourceHashes:before,errors,warnings,visualAcceptance:false},null,4));process.stdout.write(JSON.stringify({checks:checks.length,evidence}));
}finally{await browser?.close();await vite.close();}

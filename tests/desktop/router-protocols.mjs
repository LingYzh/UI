import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const evidence = path.resolve('artifacts/component-audit-root/router-protocols');
await mkdir(evidence,{recursive:true});
const fixture = [
'<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body><div id="app"></div><script type="module">',
"import {createApp,defineComponent,h,ref} from 'vue';",
"import {createRouter,createMemoryHistory} from '/artifacts/full-alignment/vue-router/package/dist/vue-router.esm-browser.prod.js';",
"import * as UI from '/src/ui/index.ts';import '/src/ui/styles.css';",
"const router=createRouter({history:createMemoryHistory(),routes:[{path:'/',name:'home',component:{render:()=>null}},{path:'/item/:id',name:'item',component:{render:()=>null}}]});await router.push('/');",
"const tab=ref('home');",
"const Root=defineComponent({setup(){return()=>h('main',[h(UI.UButton,{id:'route-button',to:{name:'item',params:{id:1},query:{b:'2',a:'1'}}},()=> 'Button'),h(UI.UButton,{id:'disabled-button',disabled:true,to:{name:'home'}},()=> 'Disabled'),h(UI.UButton,{id:'external-button',href:'#external'},()=> 'External'),h(UI.UList,{nav:true},{default:()=>h(UI.UListItem,{id:'route-list',title:'List',to:{name:'item',params:{id:2}},replace:true})}),h(UI.UBreadcrumbs,{},()=>h(UI.UBreadcrumbsItem,{id:'route-crumb',title:'Crumb',to:{name:'home'}})),h(UI.UTabs,{modelValue:tab.value,'onUpdate:modelValue':value=>tab.value=value},{default:()=>[h(UI.UTab,{id:'home-tab',value:'home',to:{name:'home'}},()=> 'Home'),h(UI.UTab,{id:'item-tab',value:'item',to:{name:'item',params:{id:3}}},()=> 'Item')]}),h(UI.UChip,{id:'route-chip',to:{name:'item',params:{id:4}}},()=> 'Chip')])}});",
"createApp(Root).use(router).use(UI.createUI()).mount('#app');",
"window.routeProtocol={router,tab,read:()=>({route:router.currentRoute.value.fullPath,tab:tab.value}),home:()=>router.push('/')};",
'</script></body></html>'
].join('\n');
const vite=await createServer({appType:'custom',cacheDir:path.join(evidence,'vite-cache'),server:{host:'127.0.0.1',port:0},logLevel:'error',optimizeDeps:{noDiscovery:true,include:['highlight.js/lib/core','highlight.js/lib/languages/xml','highlight.js/lib/languages/javascript','highlight.js/lib/languages/typescript','highlight.js/lib/languages/css','highlight.js/lib/languages/json','markdown-it','markdown-it-footnote','markdown-it-task-lists','markdown-it-deflist','markdown-it-mark','markdown-it-sub','markdown-it-sup']}});
vite.middlewares.use('/__router__',async (_request,response)=>{response.setHeader('Content-Type','text/html');response.end(await vite.transformIndexHtml('/__router__',fixture));});
let browser;
try{
    await vite.listen();browser=await chromium.launch({headless:true});const page=await browser.newPage();
    const errors=[];const warnings=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='warning'&&message.text().includes('[Vue warn]'))warnings.push(message.text());});
    await page.goto('http://127.0.0.1:'+vite.httpServer.address().port+'/__router__');await page.waitForFunction(()=>!!window.routeProtocol);
    assert.equal(await page.locator('#route-button').getAttribute('href'),'/item/1?b=2&a=1');
    await page.locator('#route-button').click();assert.equal((await page.evaluate(()=>window.routeProtocol.read())).route,'/item/1?b=2&a=1');
    await page.locator('#disabled-button').evaluate(node=>node.click());assert.equal((await page.evaluate(()=>window.routeProtocol.read())).route,'/item/1?b=2&a=1');
    await page.locator('#route-list').click();assert.equal((await page.evaluate(()=>window.routeProtocol.read())).route,'/item/2');
    await page.locator('#route-crumb a').click();assert.equal((await page.evaluate(()=>window.routeProtocol.read())).route,'/');
    await page.locator('.ui-tab[href="/item/3"]').click();await page.waitForFunction(()=>window.routeProtocol.read().route==='/item/3');assert.equal((await page.evaluate(()=>window.routeProtocol.read())).tab,'item');
    await page.locator('#route-chip a').click();assert.equal((await page.evaluate(()=>window.routeProtocol.read())).route,'/item/4');
    await page.evaluate(()=>window.routeProtocol.home());await page.waitForFunction(()=>window.routeProtocol.read().tab==='home');
    await page.locator('.ui-tab[href="/"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'/item/3');
    assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);
    await writeFile(path.join(evidence,'report.json'),JSON.stringify({generatedAt:new Date().toISOString(),routerVersion:'4.6.3',checks:['named object navigation through button/list/breadcrumb/tab/chip','disabled route guard','replace route','active route selects tab','mixed anchor keyboard tabs'],errors,warnings},null,4));
    process.stdout.write('router protocols: 5 checks passed\n');
}finally{await browser?.close();await vite.close();}

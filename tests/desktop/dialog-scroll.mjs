import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
await mkdir('artifacts',{recursive:true});
const evidence=await mkdtemp(path.resolve('artifacts/dialog-scroll-'));
const server=await preview({build:{outDir:path.resolve('dist/docs')},preview:{host:'127.0.0.1',port:0,strictPort:false}});
const env={...process.env,UAH_DATA_DIR:path.join(evidence,'profile'),UAH_UI_PREVIEW_URL:server.resolvedUrls.local[0]+'index.html#/dialog'};
delete env.ELECTRON_RUN_AS_NODE; delete env.UAH_DEV_URL;
const app=await electron.launch({args:['tests/desktop/ui-host.cjs'],cwd:process.cwd(),env});
try {
 const page=await app.firstWindow();
 await page.getByRole('button',{name:'打开长表单弹窗',exact:true}).click();
 const dialog=page.locator('dialog[open]');
 await page.getByRole('button',{name:'显示顶部错误',exact:true}).click();
 await dialog.locator('[role=alert]').waitFor();
 for (const [name,theme,zoom] of [['light','light',1],['dark','dark',1],['zoom','light',1.25]]) {
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  await app.evaluate(({BrowserWindow},zoom)=>{const w=BrowserWindow.getAllWindows()[0];w.setSize(900,800);w.webContents.setZoomFactor(zoom);},zoom);
  await page.waitForTimeout(350);
  const metrics=await dialog.evaluate(d=>{
   const v=d.querySelector('.ui-dialog-scroll > .ui-scroll-viewport'); v.scrollTop=v.scrollHeight;
   const r=d.getBoundingClientRect(), e=d.querySelector('[role=alert]').getBoundingClientRect(), f=d.querySelector('.ui-dialog-footer').getBoundingClientRect();
   return {top:r.top,bottom:r.bottom,errorTop:e.top,errorBottom:e.bottom,footerBottom:f.bottom,scroll:v.scrollTop,outer:d.scrollTop,overflow:getComputedStyle(d).overflow};
  });
  assert(metrics.scroll>0); assert.equal(metrics.outer,0); assert.equal(metrics.overflow,'hidden'); assert(metrics.errorTop>=metrics.top && metrics.errorBottom<metrics.footerBottom); assert(metrics.footerBottom<=metrics.bottom);
  await page.waitForTimeout(200);
  const data=await app.evaluate(async ({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
  await writeFile(path.join(evidence,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
 }
 await page.keyboard.press('Escape'); await dialog.waitFor({state:'hidden'});
 assert(await page.getByRole('button',{name:'打开长表单弹窗',exact:true}).evaluate(e=>document.activeElement===e));
 console.log('PASS: fixed error/header/footer, inner scrolling, clipping, light/dark/125%, Esc focus. '+evidence);
} finally {await app.close();await server.close();}

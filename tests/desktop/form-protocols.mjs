import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/form-protocols');
await mkdir(evidence, { recursive: true });
const sources = ['form.ts', 'validation.ts', 'UiForm.vue', 'UiControlFrame.vue', 'UiField.vue', 'UiInput.vue', 'UiTextarea.vue', 'UInput.vue', 'UValidation.vue'];
async function hashes() {
    return Object.fromEntries(await Promise.all(sources.map(async file => [file, createHash('sha256').update(await readFile('src/ui/' + file)).digest('hex')])));
}
const before = await hashes();
const fixture = [
'<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>',
'html,body,#app{height:auto!important;overflow:visible!important}body{margin:0;padding:20px;background:var(--surface);color:var(--text)}main{display:grid;gap:20px;max-width:900px;margin:auto}section{min-width:0;display:grid;gap:12px;padding:16px;border:1px solid var(--border);border-radius:12px}output{overflow-wrap:anywhere}',
'</style></head><body><div id="app"></div><script type="module">',
"import {createApp,defineComponent,h,reactive,ref} from 'vue';",
"import * as UI from '/src/ui/index.ts';",
"import ValidationDemo from '/src/ui/docs/component-examples/validation.vue';",
"import '/src/docs-base.css';import '/src/ui/styles.css';",
"const state=reactive({value:'initial',alternate:'',focused:false,errors:['remote'],maxErrors:'2',formValue:'',formEvents:[],readonly:false,disabled:false,asyncRule:false,rulePending:false,result:null});",
'const refs={validation:ref(),text:ref(),textarea:ref(),form:ref()};let scope;',
"const required=value=>!!value||'required';",
'let releaseRule;const deferredRule=()=>state.asyncRule?new Promise(resolve=>{state.rulePending=true;releaseRule=resolve}):true;',
"const Root=defineComponent({setup(){return()=>h('main',[",
"h('section',[h(UI.UDefaultsProvider,{defaults:{UTextField:{label:'Scoped text',hint:'Scoped hint',persistentHint:true,prefix:'@'},UTextarea:{label:'Scoped textarea',hint:'Textarea hint',persistentHint:true}}},{default:()=>[",
"h(UI.UTextField,{id:'scoped-text',ref:refs.text,modelValue:state.value,'onUpdate:modelValue':v=>state.value=v,focused:state.focused,'onUpdate:focused':v=>state.focused=v,messages:['first message','second message'],clearable:true,counter:20}),",
"h(UI.UTextarea,{id:'scoped-textarea',ref:refs.textarea,modelValue:state.value,'onUpdate:modelValue':v=>state.value=v,counter:true,rows:2})]})]),",
"h('section',[h(UI.UValidation,{ref:refs.validation,modelValue:state.value,'onUpdate:modelValue':v=>state.value=v,validationValue:state.alternate,name:'alternate',rules:[required],errorMessages:state.errors,maxErrors:state.maxErrors,validateOn:'submit lazy'},{default:s=>{scope=s;return h('output',{id:'validation-state'},JSON.stringify({errors:s.errorMessages,dirty:s.isDirty,pristine:s.isPristine,validating:s.isValidating,valid:s.isValid}))}})]),",
"h('section',[h(UI.UForm,{ref:refs.form,readonly:state.readonly,disabled:state.disabled,onSubmit:event=>{state.formEvents.push({immediate:true,thenable:typeof event.then==='function'});event.then(result=>state.formEvents.push({result}))}},{default:()=>[",
"h(UI.UTextField,{id:'form-input',name:'identity',modelValue:state.formValue,'onUpdate:modelValue':v=>state.formValue=v,rules:[required,deferredRule],validateOn:'submit lazy'}),h(UI.UButton,{id:'form-submit',type:'submit'},()=> 'Submit')",
"]})]),h('section',[h(ValidationDemo)])])}});",
"const ui=UI.createUI();createApp(Root).use(ui).mount('#app');",
"window.formProtocol={state,setTheme:name=>ui.theme.change(name,false),read:()=>({scope:{errors:scope.errorMessages,dirty:scope.isDirty,pristine:scope.isPristine,validating:scope.isValidating,valid:scope.isValid},value:state.value,focused:state.focused,formEvents:state.formEvents}),validate:silent=>refs.validation.value.validate(silent),reset:()=>refs.validation.value.reset(),resetValidation:()=>refs.validation.value.resetValidation(),resetTextarea:()=>refs.textarea.value.reset()};",
'window.formProtocol.validateForm=()=>refs.form.value.validate().then(result=>{state.result=result});window.formProtocol.releaseRule=message=>releaseRule(message);',
'</script></body></html>'
].join('\n');
const vite = await createServer({ appType: 'custom', cacheDir: path.join(evidence, 'vite-cache'), server: { host: '127.0.0.1', port: 0 }, logLevel: 'error', optimizeDeps: { noDiscovery: true, include: ['highlight.js/lib/core', 'highlight.js/lib/languages/xml', 'highlight.js/lib/languages/javascript', 'highlight.js/lib/languages/typescript', 'highlight.js/lib/languages/css', 'highlight.js/lib/languages/json', 'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup'] } });
vite.middlewares.use('/__form_protocol__', async (_req, res) => { res.setHeader('Content-Type', 'text/html'); res.end(await vite.transformIndexHtml('/__form_protocol__', fixture)); });
let browser;
const checks = [];
try {
    await vite.listen();
    browser = await chromium.launch({ headless: true, ...(process.env.UI_QA_BROWSER ? { channel: process.env.UI_QA_BROWSER } : {}) });
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:' + vite.httpServer.address().port + '/__form_protocol__');
    try { await page.waitForFunction(() => !!window.formProtocol, null, { timeout: 15000 }); }
    catch (error) { process.stderr.write(JSON.stringify({ errors, html: (await page.content()).slice(0, 500) })); throw error; }
    assert.equal(await page.locator('label[for="scoped-text"]').textContent(), 'Scoped text');
    assert.equal(await page.locator('label[for="scoped-textarea"]').textContent(), 'Scoped textarea');
    await page.getByText('Scoped hint', { exact: true }).waitFor();
    await page.getByText('Textarea hint', { exact: true }).waitFor();
    await page.getByText('first message', { exact: true }).waitFor();
    checks.push('actual text and textarea consume scoped label/hint/prefix and messages');
    await page.locator('#scoped-text').focus();
    assert.equal((await page.evaluate(() => window.formProtocol.read())).focused, true);
    await page.locator('#scoped-textarea').focus();
    assert.equal((await page.evaluate(() => window.formProtocol.read())).focused, false);
    checks.push('controlled focused channel follows native focus and blur');
    assert.deepEqual(await page.evaluate(() => window.formProtocol.validate()), ['remote', 'required']);
    assert.equal((await page.evaluate(() => window.formProtocol.read())).scope.pristine, false);
    await page.evaluate(() => { window.formProtocol.state.alternate='valid alternate';window.formProtocol.state.errors=[]; });
    assert.deepEqual(await page.evaluate(() => window.formProtocol.validate(true)), []);
    assert.equal((await page.evaluate(() => window.formProtocol.read())).scope.pristine, true);
    await page.evaluate(() => { window.formProtocol.state.alternate='';window.formProtocol.state.maxErrors='0'; });
    assert.deepEqual(await page.evaluate(() => window.formProtocol.validate()), []);
    checks.push('alternate validation value, string/zero maxErrors, silent validation and array return');
    await page.evaluate(() => window.formProtocol.reset());
    assert.equal((await page.evaluate(() => window.formProtocol.read())).value, null);
    await page.evaluate(() => { window.formProtocol.state.value='textarea content'; });
    await page.evaluate(() => window.formProtocol.resetTextarea());
    assert.equal(await page.locator('#scoped-textarea').inputValue(), '');
    checks.push('async reset clears model to null and textarea safely renders empty');
    // 直接触发原生表单协议，避免按钮焦点行为影响此专项。
    await page.evaluate(() => { document.querySelector('#form-input').closest('form').requestSubmit(); });
    try { await page.waitForFunction(() => window.formProtocol.state.formEvents.length >= 2, null, { timeout: 5000 }); }
    catch (error) { console.error(await page.evaluate(() => ({ state: window.formProtocol.state, form: document.querySelector('#form-input').closest('form').outerHTML.slice(0, 2200) }))); throw error; }
    const events = await page.evaluate(() => window.formProtocol.read().formEvents);
    assert.deepEqual(events[0], { immediate: true, thenable: true });
    assert.equal(events[1].result.valid, false);
    assert.equal(events[1].result.errors[0].id, 'identity');
    checks.push('default form submit immediately exposes awaitable invalid result with control name');
    await page.evaluate(() => { window.formProtocol.state.readonly = true; });
    assert.equal(await page.locator('#form-input').evaluate(input => input.readOnly), true);
    await page.evaluate(() => { window.formProtocol.state.readonly = false; });
    await page.getByText('required', { exact: true }).first().waitFor();
    checks.push('readonly freezes input and preserves errors when editing is restored');
    await page.evaluate(() => { window.formProtocol.state.formValue = 'ready'; window.formProtocol.state.asyncRule = true; });
    await page.evaluate(() => { void window.formProtocol.validateForm(); });
    await page.waitForFunction(() => window.formProtocol.state.rulePending);
    await page.evaluate(() => { window.formProtocol.state.readonly = true; });
    await page.evaluate(() => { window.formProtocol.state.readonly = false; });
    await page.evaluate(() => { window.formProtocol.releaseRule('Must be unique'); });
    await page.waitForFunction(() => window.formProtocol.state.result !== null);
    const pendingResult = await page.evaluate(() => window.formProtocol.state.result);
    assert.equal(pendingResult.valid, false);
    assert.equal(Boolean(pendingResult.cancelled), false);
    assert.deepEqual(pendingResult.errors[0].errorMessages, ['Must be unique']);
    await page.getByText('Must be unique', { exact: true }).waitFor();
    checks.push('readonly toggles do not cancel pending asynchronous form rules');
    await page.evaluate(() => { window.formProtocol.state.disabled = true; });
    assert.equal(await page.locator('#form-input').isDisabled(), true);
    await page.getByText('Must be unique', { exact: true }).waitFor({ state: 'hidden' });
    checks.push('disabled still excludes controls and clears their validation errors');
    assert.deepEqual(errors, []);
    await page.screenshot({ path: path.join(evidence, 'light-wide.png'), fullPage: true });
    await page.evaluate(() => window.formProtocol.setTheme('dark'));
    await page.waitForTimeout(250);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.screenshot({ path: path.join(evidence, 'dark-narrow.png'), fullPage: true });
    const after = await hashes();
    assert.deepEqual(after, before, 'sources remained unchanged during verification');
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), checks, sourceHashes: after, screenshots: ['light-wide.png', 'dark-narrow.png'], visualAcceptance: false }, null, 4));
    process.stdout.write(JSON.stringify({ checks: checks.length, evidence }));
} finally { await browser?.close(); await vite.close(); }

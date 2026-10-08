import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.resolve(root, 'artifacts/full-alignment/file-slots-protocols');
await mkdir(evidence, { recursive: true });
const files = [
    'src/ui/UFileInput.vue', 'src/ui/UFileUpload.vue', 'src/ui/file-display.ts', 'src/ui/file-drop.ts',
    'src/ui/specialized-inputs.ts', 'src/ui/form.ts', 'src/ui/defaults.ts', 'src/ui/locale-context.ts',
    'src/ui/locale.ts', 'src/ui/UiControlFrame.vue', 'src/ui/UiField.vue', 'src/ui/UChip.vue',
    'src/ui/UiButton.vue', 'src/ui/ripple.ts', 'src/ui/index.ts', 'src/ui/forms-components.css',
    'src/ui/styles.css', 'src/ui/ULocaleProvider.vue', 'src/ui/docs/component-examples/file-input.vue', 'src/ui/docs/component-examples/file-upload.vue'
];
const hashes = async () => Object.fromEntries(await Promise.all(files.map(async file => [file, createHash('sha256').update(await readFile(path.join(root, file))).digest('hex')])));
const before = await hashes();
const fixture = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>File slots protocol</title><link rel="icon" href="data:,"><style>html,body,#app{height:auto!important;overflow:visible!important}body{margin:0;padding:20px;background:var(--surface);color:var(--text)}main{display:grid;gap:18px;max-width:1040px;margin:auto}section{display:grid;gap:14px;min-width:0;padding:14px;border:1px solid var(--border);border-radius:12px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}</style></head><body><div id="app"></div><script type="module">
import {createApp,defineComponent,h,reactive,ref,nextTick,cloneVNode} from 'vue';import * as UI from '/src/ui/index.ts';import FileInputDemo from '/src/ui/docs/component-examples/file-input.vue';import FileUploadDemo from '/src/ui/docs/component-examples/file-upload.vue';import '/src/docs-base.css';import '/src/ui/styles.css';
const state=reactive({selection:null,selectionLoading:false,chips:[],defaultName:null,hiddenInput:null,singleInput:null,directoryInput:null,detailsInput:null,locale:'en',localeCount:null,dictionaryCount:null,indexedCount:null,indexedSize:null,placeholderInput:null,persistentPlaceholderInput:null,upload:null,uploadLoading:false,replacement:null,filteredUpload:null,directoryUpload:null,insetUpload:null,noSizeUpload:null,singleUpload:null,multipleUpload:null,readonlyInput:null,disabledInput:null,readonlyUpload:null,disabledUpload:null,hiddenBrowse:null,raceUpload:null,raceUploadDisabled:false});
const refs=Object.fromEntries(Object.keys(state).map(key=>[key,ref()]));
const events=reactive({inputClear:[],inputChange:[],uploadBrowse:[],uploadRemove:[],singleRemove:[],filteredRejected:[],filteredChange:[],raceChange:[]});
const scopedMessages={en:{'files.count':'Scoped {count} file'},zh:{'files.count':'范围内 {count} 个文件'}};
function kebab(value){return value.replace(/[A-Z]/g,match=>'-'+match.toLowerCase());}
function bind(key,extra={}){return{id:kebab(key),name:key,ref:refs[key],modelValue:state[key],'onUpdate:modelValue':value=>state[key]=value,...extra};}
function names(value){return value==null?null:(Array.isArray(value)?value:[value]).map(file=>file.name);}
const Root=defineComponent({setup(){return()=>h('main',[
h('form',{id:'selection-section',onSubmit:event=>event.preventDefault()},[
h(UI.UFileInput,bind('selection',{multiple:true,accept:'.png,.txt',filterByType:'.png,.txt',showSize:1024,truncateLength:22,chips:false,counter:true,clearable:true,loading:state.selectionLoading,persistentPlaceholder:true,placeholder:'Drop or choose',label:'Scoped files',hint:'Native picker hint',messages:['Native validation message'],'aria-label':'Scoped file picker','data-native-marker':'selection-native','onClick:clear':()=>events.inputClear.push('selection'),onRejected:files=>events.filteredRejected.push(names(files)),onChange:files=>events.filteredChange.push(names(files))}),{
label:scope=>h('span',{id:'selection-label','data-label':scope.label},'File label slot'),
message:scope=>h('span',{class:'file-message','data-message':scope.message},'Message: '+scope.message),
selection:scope=>h('div',{id:'selection-scope','data-count':String(scope.files.length),'data-total':String(scope.totalBytes),'data-readable':scope.totalBytesReadable,'data-file':String(scope.files[0] instanceof File)},scope.fileNames.map((name,index)=>h('span',{class:'scope-file-name',title:scope.files[index].name,'data-full-name':scope.files[index].name},name))),
counter:scope=>h('span',{id:'selection-counter-slot','data-value':String(scope.value),'data-total':String(scope.totalBytes),'data-readable':scope.totalBytesReadable},'Counter '+scope.value+' / '+scope.totalBytesReadable),
clear:scope=>h(UI.UButton,{...scope.props,id:'input-clear-slot',variant:'text',ripple:false},{default:()=> 'Clear files'}),
'prepend-inner':scope=>h('span',{id:'input-prepend-inner','data-has-ref':String(scope.controlRef.value instanceof HTMLInputElement)},'Before'),
'append-inner':scope=>h('span',{id:'input-append-inner','data-has-ref':String(scope.controlRef.value instanceof HTMLInputElement)},'After'),
prepend:scope=>h('span',{id:'input-prepend','data-disabled':String(scope.isDisabled.value)},'Prepend'),
append:scope=>h('span',{id:'input-append','data-readonly':String(scope.isReadonly.value)},'Append')
}),
h(UI.UFileInput,bind('chips',{multiple:true,chips:true,truncateLength:22,label:'Chip files',ripple:false})),
h(UI.UFileInput,bind('defaultName',{label:'Full name default',ripple:false})),
h(UI.UFileInput,bind('hiddenInput',{label:'Keyboard browse',hideInput:true,clearable:true,ripple:false})),
h(UI.UFileInput,bind('singleInput',{label:'Single clear',clearable:true,ripple:false})),
h(UI.UFileInput,bind('readonlyInput',{label:'Readonly picker',readonly:true,hideInput:true,clearable:true,ripple:false})),
h(UI.UFileInput,bind('disabledInput',{label:'Disabled picker',disabled:true,hideInput:true,clearable:true,ripple:false})),
h(UI.UFileInput,{...bind('directoryInput',{multiple:true,accept:'image/*',filterByType:'image/*'}),id:'directory-input','webkitdirectory':true}),
]),
h('section',{id:'upload-section'},[
h(UI.UFileUpload,bind('upload',{multiple:true,accept:'.png,.txt',filterByType:'.png,.txt',name:'custom-upload',label:'Custom dropzone',subtitle:'scope and browse contract',loading:state.uploadLoading,'onClick:browse':event=>events.uploadBrowse.push(event?.type??'keyboard'),onChange:files=>events.filteredChange.push(names(files))}),{
default:scope=>h('div',{id:'custom-drop-zone',tabindex:'0','data-count':String(scope.files.length),'data-names':names(scope.files).join(','),'data-dragging':String(scope.isDragging),'data-has-files':String(scope.hasFiles),'data-ref':String(scope.controlRef.value instanceof HTMLInputElement)},[
h('strong',{id:'custom-drop-state'},scope.hasFiles?'Files ready':'Empty dropzone'),
h(UI.UButton,{...scope.props,id:'custom-browse-button',variant:'tonal',ripple:false},{default:()=> 'Browse files'})
])
}),
 h(UI.UFileUpload,bind('replacement',{multiple:true,accept:'.txt',filterByType:'.txt',name:'replacement-name',label:'Replacement input',title:'Replacement input target','data-extra':'passed-through','onClick:browse':event=>events.uploadBrowse.push(event?.type??'keyboard')}),{
 browse:scope=>h(UI.UButton,{...scope.props,id:'replacement-browse',variant:'tonal',ripple:false},{default:()=> 'Browse replacement'}),
 input:({inputNode})=>cloneVNode(inputNode,{id:'replacement-native','data-vnode-replaced':'true'})
}),
h(UI.UFileUpload,bind('filteredUpload',{multiple:true,accept:'.txt',filterByType:'.png',name:'filtered-list',label:'Filtered list',onRejected:files=>events.filteredRejected.push(names(files)),onChange:files=>events.filteredChange.push(names(files))}),{
item:scope=>h('div',{class:'filtered-item-slot','data-name':scope.file.name,'data-index':String(scope.index)},[h('span',scope.file.name),h(UI.UButton,{...scope.props,id:'filtered-remove-'+scope.index,variant:'text',ripple:false},{default:()=> 'Remove'})])
}),
h(UI.UFileUpload,bind('insetUpload',{multiple:true,label:'Inset files',insetFileList:true,ripple:false})),
h(UI.UFileUpload,bind('noSizeUpload',{multiple:true,label:'No size/no clear',showSize:false,clearable:false,ripple:false})),
h(UI.UFileUpload,bind('singleUpload',{label:'Single item slot',clearable:true,ripple:false,'onClick:remove':index=>events.singleRemove.push(index)}),{
single:scope=>h('div',{class:'single-item-slot','data-name':scope.file.name},[h('span',scope.file.name),h(UI.UButton,{...scope.props,id:'single-remove-button',variant:'text',ripple:false},{default:()=> 'Remove single'})])
}),
h(UI.UFileUpload,bind('multipleUpload',{multiple:true,label:'Multiple item slot',clearable:true,ripple:false,'onClick:remove':index=>events.uploadRemove.push(index)}),{
item:scope=>h('div',{class:'multiple-item-slot','data-name':scope.file.name,'data-index':String(scope.index)},[h('span',scope.file.name),h(UI.UButton,{...scope.props,id:'multiple-remove-'+scope.index,variant:'text',ripple:false},{default:()=> 'Remove multiple'})])
}),
h(UI.UFileUpload,bind('readonlyUpload',{readonly:true,hideBrowse:true,label:'Readonly zone'})),
h(UI.UFileUpload,bind('disabledUpload',{disabled:true,hideBrowse:true,label:'Disabled zone'})),
h(UI.UFileUpload,bind('hiddenBrowse',{hideBrowse:true,label:'Click and keyboard zone',ripple:false})),
h(UI.UFileUpload,bind('raceUpload',{multiple:true,label:'Drop race',disabled:state.raceUploadDisabled,onChange:files=>events.raceChange.push(names(files))})),
h(UI.UFileUpload,{...bind('directoryUpload',{multiple:true,accept:'image/*',filterByType:'image/*'}),id:'directory-upload','webkitdirectory':true})
]),
h('section',{id:'details-section'},[h(UI.UFileInput,bind('detailsInput',{label:'Details scope',hint:'Detail hint',messages:['Detail message']}),{details:scope=>h('span',{id:'file-details-slot','data-has-ref':String(scope.controlRef.value instanceof HTMLInputElement)},'Details slot')} )]),
h('section',{id:'counter-locale-section'},[
 h(UI.ULocaleProvider,{locale:state.locale},{default:()=>h(UI.UFileInput,bind('localeCount',{label:'Localized default counter',counter:true,showSize:false}))}),
 h(UI.ULocaleProvider,{locale:state.locale,messages:scopedMessages},{default:()=>h(UI.UFileInput,bind('dictionaryCount',{label:'Scoped dictionary counter',counter:true,counterString:'$vuetify.files.count',showSize:false}))}),
 h(UI.UFileInput,bind('indexedCount',{multiple:true,label:'Indexed count template',counter:true,counterString:'Picked {0}: {count}',showSize:false})),
 h(UI.UFileInput,bind('indexedSize',{label:'Indexed size template',counter:true,counterSizeString:'Sizes {0} / {1} / {size}',showSize:1024})),
 h(UI.UFileInput,bind('placeholderInput',{label:'Focus placeholder',placeholder:'Focus to reveal'})),
 h(UI.UFileInput,bind('persistentPlaceholderInput',{label:'Persistent placeholder',placeholder:'Always visible',persistentPlaceholder:true}))
]),
h('section',{id:'file-input-demo'},[h(FileInputDemo)]),h('section',{id:'file-upload-demo'},[h(FileUploadDemo)])
])}});
const ui=UI.createUI();createApp(Root).use(ui).mount('#app');window.fileSlotsProtocol={registry:{UFileInput:Boolean(UI.UFileInput),UFileUpload:Boolean(UI.UFileUpload)},state,refs,events,theme:value=>ui.theme.change(value,false),flush:async()=>{await nextTick();await nextTick();await new Promise(resolve=>setTimeout(resolve,0));},setLoading:async(key,value)=>{state[key]=value;await nextTick();await nextTick();},snapshot:()=>({models:Object.fromEntries(Object.entries(state).map(([key,value])=>[key,names(value)])),events:Object.fromEntries(Object.entries(events).map(([key,value])=>[key,[...value]])),refs:Object.fromEntries(Object.entries(refs).map(([key,value])=>[key,{element:value.value?.element instanceof HTMLInputElement,input:value.value?.input instanceof HTMLInputElement,controlRef:value.value?.element?.id??value.value?.input?.id??null}]))}),async dropThenDisable(){const file=new File(['slow'],'stale.png',{type:'image/png'});const times={startedAt:null,disabledAt:null,completedAt:null};const entry={isFile:true,name:file.name,file(success){times.startedAt=performance.now();setTimeout(()=>{times.completedAt=performance.now();success(file);},160);}};const transfer={items:[{kind:'file',webkitGetAsEntry:()=>entry}],files:[]};const pending=refs.raceUpload.value.drop({preventDefault(){},dataTransfer:transfer});await new Promise(resolve=>setTimeout(resolve,20));times.modelBeforeDisable=names(state.raceUpload);state.raceUploadDisabled=true;await nextTick();times.disabledAt=performance.now();times.disabled={input:refs.raceUpload.value.input.disabled,control:refs.raceUpload.value.control.disabled.value,prop:refs.raceUpload.value.$props.disabled};await pending;await nextTick();times.modelAfterComplete=names(state.raceUpload);return times;}};
</script></body></html>`;
const vite=await createServer({
    root,
    appType:'custom',
    cacheDir:path.join(evidence,'vite-cache'),
    resolve:{dedupe:['vue']},
    server:{host:'127.0.0.1',port:0,hmr:false,watch:{ignored:['**/artifacts/**']}},
    logLevel:'error',
    optimizeDeps:{noDiscovery:true,include:['highlight.js/lib/core','highlight.js/lib/languages/xml','highlight.js/lib/languages/javascript','highlight.js/lib/languages/typescript','highlight.js/lib/languages/css','highlight.js/lib/languages/json','markdown-it','markdown-it-footnote','markdown-it-task-lists','markdown-it-deflist','markdown-it-mark','markdown-it-sub','markdown-it-sup']},
    plugins:[{name:'file-slots-protocol-fixture',configureServer(server){server.middlewares.use('/__file_slots__',async(_request,response)=>{response.setHeader('Content-Type','text/html; charset=utf-8');response.end(await server.transformIndexHtml('/__file_slots__',fixture));});}}]
});
let browser;
const checks=[];
const failures=[];
async function check(name, callback){try{await callback();checks.push(name);}catch(error){failures.push({name,message:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined});}}
const file=(name,size,type)=>({name,mimeType:type,buffer:Buffer.alloc(size,0x61)});
try{
    await vite.listen();
    browser=await chromium.launch({headless:true});
    const page=await browser.newPage({viewport:{width:1200,height:900}});
    page.setDefaultTimeout(7000);
    const errors=[],warnings=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());if(message.type()==='warning')warnings.push(message.text());});
    await page.goto('http://127.0.0.1:'+vite.httpServer.address().port+'/__file_slots__');
    await page.waitForFunction(()=>!!window.fileSlotsProtocol);
    assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.registry),{UFileInput:true,UFileUpload:true});
    const flush=()=>page.evaluate(()=>window.fileSlotsProtocol.flush());
    const setFiles=async(selector,files)=>{await page.locator(selector).first().setInputFiles(files);await flush();};
    const chooser=async(action,multiple)=>{
        const waiting=page.waitForEvent('filechooser',{timeout:2500}).then(opened=>({opened}),error=>({error}));
        await action();
        const result=await waiting;
        if(result.error) throw result.error;
        const opened=result.opened;
        assert.equal(opened.isMultiple(),multiple);
        await opened.setFiles([]);
        await flush();
    };
    const noChooser=async(action)=>{
        let opened=false;
        const waiting=page.waitForEvent('filechooser',{timeout:400}).then(value=>{opened=true;return value;},()=>undefined);
        await action();
        const picker=await waiting;
        assert.equal(opened,false,'disabled or readonly controls must not open a native picker');
        if(picker) await picker.setFiles([]);
    };

    await check('FileInput multiple selection scope, sizes, explicit truncation, label/details, refs, native attrs and accessible counter',async()=>{
        await setFiles('#selection',[file('reporting-record-with-long-title.png',2048,'image/png'),file('notes.txt',1024,'text/plain')]);
        const data=await page.evaluate(()=>{
            const input=document.querySelector('#selection');
            const scope=document.querySelector('#selection-scope');
            const counter=document.querySelector('#selection-counter-slot');
            return {
                model:window.fileSlotsProtocol.snapshot().models.selection,
                scope:{count:scope?.dataset.count,total:scope?.dataset.total,readable:scope?.dataset.readable,names:[...scope.querySelectorAll('.scope-file-name')].map(node=>({text:node.textContent,title:node.title}))},
                counter:{value:counter?.dataset.value,total:counter?.dataset.total,readable:counter?.dataset.readable},
                native:{name:input?.name,id:input?.id,accept:input?.accept,aria:input?.getAttribute('aria-label'),marker:input?.dataset.nativeMarker,describedby:input?.getAttribute('aria-describedby'),files:[...(input?.files??[])].map(item=>item.name),formFile:new FormData(document.querySelector('#selection-section')).get('selection')?.name??null},
                slots:{label:document.querySelector('#selection-label')?.textContent,message:document.querySelector('.file-message')?.textContent,innerRefs:[document.querySelector('#input-prepend-inner')?.dataset.hasRef,document.querySelector('#input-append-inner')?.dataset.hasRef],outer:[document.querySelector('#input-prepend')?.dataset.disabled,document.querySelector('#input-append')?.dataset.readonly]},
                counterOutput:{hidden:document.querySelector('#selection-section output.u-input-counter')?.hidden,id:document.querySelector('#selection-section output.u-input-counter')?.id}
            };
        });
        assert.deepEqual(data.model,['reporting-record-with-long-title.png','notes.txt']);
        assert.equal(data.scope.count,'2');assert.equal(data.scope.total,'3072');assert.equal(data.scope.readable,'3.0 KiB');
        assert.equal(data.scope.names[0].title,'reporting-record-with-long-title.png');
        const truncatedName=data.scope.names[0].text.split(' (')[0];
        assert.ok(truncatedName.length<=22&&truncatedName.includes('…'));
        assert.match(data.scope.names[0].text,/2\.0 KiB/);assert.match(data.scope.names[1].text,/1\.0 KiB/);
        assert.deepEqual(data.counter,{value:'2',total:'3072',readable:'3.0 KiB'});
        assert.deepEqual(data.native,{name:'selection',id:'selection',accept:'.png,.txt',aria:'Scoped file picker',marker:'selection-native',describedby:data.native.describedby,files:['reporting-record-with-long-title.png','notes.txt'],formFile:'reporting-record-with-long-title.png'});
        assert.ok(data.native.describedby?.includes(data.counterOutput.id),'counter id must be referenced by the native input');
        assert.equal(data.slots.label,'File label slot');assert.match(data.slots.message??'',/Message:/);assert.deepEqual(data.slots.innerRefs,['true','true']);assert.deepEqual(data.slots.outer,['false','false']);
        assert.equal(data.counterOutput.hidden,false);
    });
    await check('FileInput custom clear emits once, clears to [], restores focus and permits selecting the same file again',async()=>{
        await page.locator('#input-clear-slot').click();await flush();
        let snapshot=await page.evaluate(()=>window.fileSlotsProtocol.snapshot());
        assert.deepEqual(snapshot.models.selection,[]);assert.deepEqual(snapshot.events.inputClear,['selection']);
        assert.deepEqual(await page.locator('#selection').evaluate(input=>[input.files.length,document.activeElement===input]),[0,true]);
        await setFiles('#selection',[file('reporting-record-with-long-title.png',2048,'image/png')]);
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.selection),['reporting-record-with-long-title.png']);
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().events.inputClear),['selection']);
    });
    await check('FileInput chips and default full filename behavior',async()=>{
        await setFiles('#chips',[file('reporting-record-with-long-title.png',2048,'image/png')]);
        const chip=await page.locator('#chips').evaluate(input=>{const node=input.closest('.ui-file-input').querySelector('.ui-chip');return node?{text:node.textContent,title:node.getAttribute('title')}:null;});
        assert.ok(chip,'chips=true must render a real chip');
        assert.equal(chip.title,'reporting-record-with-long-title.png');assert.ok(chip.text.length<=22&&chip.text.includes('…'));
        await setFiles('#default-name',[file('reporting-record-with-long-title.png',2048,'image/png')]);
        const defaultText=await page.locator('#default-name').evaluate(input=>{const node=input.closest('.ui-file-input').querySelector('.ui-file-input-summary span');return node?{text:node.textContent,title:node.title}:null;});
        assert.deepEqual(defaultText,{text:'reporting-record-with-long-title.png',title:'reporting-record-with-long-title.png'});
    });
    await check('FileInput clear/reset model shapes and focused/ref bridge',async()=>{
        await setFiles('#single-input',[file('one.txt',1,'text/plain')]);
        await page.locator('#single-input').evaluate(input=>input.closest('.ui-file-input')?.querySelector('.ui-control-clear')?.click());await flush();
        assert.equal((await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.singleInput)),null);
        await page.evaluate(()=>window.fileSlotsProtocol.refs.detailsInput.value.focus());await flush();
        assert.equal(await page.locator('#details-input').evaluate(input=>document.activeElement===input),true);
        assert.equal(await page.locator('#file-details-slot').getAttribute('data-has-ref'),'true');
        assert.ok(await page.locator('#details-input').getAttribute('aria-describedby'));
        await page.evaluate(()=>window.fileSlotsProtocol.refs.selection.value.reset());await flush();
        assert.equal(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.selection),null);
        assert.equal(await page.locator('#selection').evaluate(input=>input.files.length),0);
    });
    await check('FileInput locale-aware fallback count updates in a scoped en-to-zh provider',async()=>{
        await setFiles('#locale-count',[file('locale.txt',1,'text/plain')]);
        await setFiles('#dictionary-count',[file('scoped.txt',1,'text/plain')]);
        const counterFor=name=>page.locator('.u-input-counter[for="'+name+'"]');
        assert.equal((await counterFor('localeCount').textContent())?.trim(),'1 files');
        assert.equal((await counterFor('dictionaryCount').textContent())?.trim(),'Scoped 1 file');
        await page.evaluate(()=>{window.fileSlotsProtocol.state.locale='zh';});await flush();
        assert.equal((await counterFor('localeCount').textContent())?.trim(),'1 个文件','built-in files.count follows the scoped provider locale');
        assert.equal((await counterFor('dictionaryCount').textContent())?.trim(),'范围内 1 个文件','the $vuetify.files.count key resolves the scoped dictionary override after locale changes');
    });
    await check('FileInput literal counter templates replace indexed count and custom size parameters',async()=>{
        await setFiles('#indexed-count',[file('first.txt',1,'text/plain'),file('second.txt',1,'text/plain')]);
        await setFiles('#indexed-size',[file('large.txt',2048,'text/plain')]);
        assert.equal((await page.locator('.u-input-counter[for="indexedCount"]').textContent())?.trim(),'Picked 2: 2','literal counterString supports {0} as well as {count}');
        assert.equal((await page.locator('.u-input-counter[for="indexedSize"]').textContent())?.trim(),'Sizes 1 / 2.0 KiB / 2.0 KiB','counterSizeString receives indexed count/size and the named size value');
    });
    await check('FileInput empty, focused and persistent placeholders follow focus policy',async()=>{
        const optional=page.locator('#placeholder-input');
        const persistent=page.locator('#persistent-placeholder-input');
        assert.equal(await optional.locator('xpath=ancestor::div[contains(concat(" ",normalize-space(@class)," ")," ui-file-input ")]').locator('.ui-file-input-placeholder').count(),0,'a labeled empty field hides a nonpersistent placeholder while unfocused');
        assert.equal(await persistent.locator('xpath=ancestor::div[contains(concat(" ",normalize-space(@class)," ")," ui-file-input ")]').locator('.ui-file-input-placeholder').textContent(),'Always visible');
        await optional.focus();await flush();
        assert.equal(await optional.evaluate(input=>input.closest('.ui-file-input').querySelector('.ui-file-input-placeholder')?.textContent),'Focus to reveal');
        await optional.evaluate(input=>input.blur());await flush();
        assert.equal(await optional.evaluate(input=>input.closest('.ui-file-input').querySelector('.ui-file-input-placeholder')),null,'the nonpersistent placeholder hides again on blur');
        assert.equal(await persistent.evaluate(input=>input.closest('.ui-file-input').querySelector('.ui-file-input-placeholder')?.textContent),'Always visible','persistentPlaceholder remains visible while empty and unfocused');
    });
    await check('FileInput hideInput opens a real multiple-aware chooser; readonly and disabled cannot browse or receive files',async()=>{
        assert.equal(await page.locator('#hidden-input').getAttribute('tabindex'),'-1');
        const browse=page.locator('#hidden-input').locator('xpath=..').locator('.ui-upload-browse');
        await chooser(()=>browse.click(),false);
        await browse.focus();await chooser(()=>browse.press('Enter'),false);
        await noChooser(()=>page.locator('#readonly-input').evaluate(input=>input.parentElement.querySelector('.ui-upload-browse').click()));
        await noChooser(()=>page.locator('#disabled-input').evaluate(input=>input.parentElement.querySelector('.ui-upload-browse').click()));
        await page.evaluate(()=>{
            const readonlyFile=new File(['x'],'readonly.txt',{type:'text/plain'});
            const disabledFile=new File(['x'],'disabled.txt',{type:'text/plain'});
            window.fileSlotsProtocol.refs.readonlyInput.value.receive([readonlyFile]);
            window.fileSlotsProtocol.refs.disabledInput.value.receive([disabledFile]);
        });await flush();
        assert.equal((await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.readonlyInput)),null);
        assert.equal((await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.disabledInput)),null);
    });
    await check('FileInput and FileUpload loaders mount and are removed when loading becomes false',async()=>{
        await page.evaluate(()=>window.fileSlotsProtocol.setLoading('selectionLoading',true));await flush();
        await page.evaluate(()=>window.fileSlotsProtocol.setLoading('uploadLoading',true));await flush();
        assert.equal(await page.locator('#selection').evaluate(input=>!!input.closest('.ui-file-input').querySelector('.u-input-loading')),true);
        assert.equal(await page.locator('input[name="custom-upload"]').evaluate(input=>!!input.closest('.ui-file-upload').querySelector('.u-input-loading')),true);
        await page.evaluate(()=>window.fileSlotsProtocol.setLoading('selectionLoading',false));await flush();
        await page.evaluate(()=>window.fileSlotsProtocol.setLoading('uploadLoading',false));await flush();
        assert.equal(await page.locator('#selection').evaluate(input=>!!input.closest('.ui-file-input').querySelector('.u-input-loading')),false);
        assert.equal(await page.locator('input[name="custom-upload"]').evaluate(input=>!!input.closest('.ui-file-upload').querySelector('.u-input-loading')),false);
    });
    await check('FileInput file-only dragover and webkitdirectory accept suppression',async()=>{
        const text=await page.locator('#selection').evaluate(node=>{const transfer=new DataTransfer();transfer.items.add('plain','text/plain');const event=new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:transfer});node.dispatchEvent(event);return event.defaultPrevented;});
        const fileDrop=await page.locator('#selection').evaluate(node=>{const transfer=new DataTransfer();transfer.items.add(new File(['x'],'drag.txt',{type:'text/plain'}));const event=new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:transfer});node.dispatchEvent(event);return event.defaultPrevented;});
        assert.equal(text,false);assert.equal(fileDrop,true);
        assert.equal(await page.locator('#directory-input').getAttribute('accept'),null);
    });
    await check('FileUpload default slot keeps hidden native input, forwards attrs/refs and opens real picker once',async()=>{
        const info=await page.evaluate(()=>{const input=document.querySelector('input[name="custom-upload"]');return {input:!!input,hidden:input?.tabIndex,name:input?.name,accept:input?.accept,id:input?.id,label:input?.getAttribute('aria-label'),scope:document.querySelector('#custom-drop-zone')?.dataset,ref:window.fileSlotsProtocol.refs.upload.value.input===input};});
        assert.equal(info.input,true);assert.equal(info.hidden,-1);assert.equal(info.name,'custom-upload');assert.equal(info.accept,'.png,.txt');assert.equal(info.label,'Custom dropzone');assert.equal(info.scope.hasFiles,'false');assert.equal(info.ref,true);
        const before=await page.evaluate(()=>window.fileSlotsProtocol.snapshot().events.uploadBrowse.length);
        await chooser(()=>page.locator('#custom-browse-button').click(),true);
        assert.equal(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().events.uploadBrowse.length),before+1);
        assert.equal(await page.locator('#custom-drop-zone').getAttribute('data-ref'),'true');
        assert.equal(await page.locator('#custom-browse-button').getAttribute('type'),'button');
        assert.equal(await page.locator('#custom-browse-button').getAttribute('disabled'),null);
        await setFiles('input[name="custom-upload"]',[file('upload.png',3,'image/png')]);
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.upload),['upload.png']);
        await page.evaluate(()=>window.fileSlotsProtocol.refs.upload.value.clear());await flush();
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.upload),[]);
        assert.equal(await page.locator('input[name="custom-upload"]').evaluate(input=>input.files.length),0);
        await setFiles('input[name="custom-upload"]',[file('upload.png',3,'image/png')]);
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.upload),['upload.png']);
    });
    await check('FileUpload file-only dragover updates drag state; non-file dragover is ignored',async()=>{
        const text=await page.locator('#custom-drop-zone').evaluate(node=>{const transfer=new DataTransfer();transfer.items.add('plain','text/plain');const event=new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:transfer});node.closest('.ui-file-upload').dispatchEvent(event);return {prevented:event.defaultPrevented,dragging:node.dataset.dragging};});
        const fileDrop=await page.locator('#custom-drop-zone').evaluate(async node=>{const transfer=new DataTransfer();transfer.items.add(new File(['x'],'drag.txt',{type:'text/plain'}));const event=new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:transfer});node.closest('.ui-file-upload').dispatchEvent(event);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return {prevented:event.defaultPrevented,dragging:node.dataset.dragging};});
        assert.deepEqual(text,{prevented:false,dragging:'false'});assert.deepEqual(fileDrop,{prevented:true,dragging:'true'});
        await page.locator('#custom-drop-zone').evaluate(node=>node.closest('.ui-file-upload').dispatchEvent(new DragEvent('dragleave',{bubbles:true,relatedTarget:document.body})));await flush();
        assert.equal(await page.locator('#custom-drop-zone').getAttribute('data-dragging'),'false');
    });
    await check('FileUpload input VNode replacement preserves native ref and picker behavior',async()=>{
        const info=await page.evaluate(()=>{const input=document.querySelector('#replacement-native');return {id:input?.id,name:input?.name,accept:input?.accept,extra:input?.dataset.vnodeReplaced,ref:window.fileSlotsProtocol.refs.replacement.value.input===input,tabIndex:input?.tabIndex};});
        assert.deepEqual(info,{id:'replacement-native',name:'replacement-name',accept:'.txt',extra:'true',ref:true,tabIndex:-1});
        const before=await page.evaluate(()=>window.fileSlotsProtocol.snapshot().events.uploadBrowse.length);
        await chooser(()=>page.locator('#replacement-browse').click(),true);
        assert.equal(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().events.uploadBrowse.length),before+1);
        await setFiles('#replacement-native',[file('replace.txt',2,'text/plain')]);
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.replacement),['replace.txt']);
    });
    await check('FileUpload filtered selection synchronizes native FileList and emits one remove from item props',async()=>{
        await setFiles('#filtered-list',[file('keep.png',2,'image/png'),file('reject.txt',2,'text/plain')]);
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.filteredUpload),['keep.png']);
        assert.deepEqual(await page.locator('#filtered-list').evaluate(input=>Array.from(input.files??[],file=>file.name)),['keep.png']);
        assert.ok((await page.evaluate(()=>window.fileSlotsProtocol.snapshot().events.filteredRejected)).some(names=>names.includes('reject.txt')));
        assert.equal(await page.locator('#filtered-remove-0').getAttribute('disabled'),null);
        await page.locator('#filtered-remove-0').click();await flush();
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.filteredUpload),[]);
        assert.ok(await page.locator('#filtered-list').evaluate(input=>input.files?.length===0));
    });
    await check('FileUpload defaults show size/clearable; explicit false removes both; inset list precedes browse target',async()=>{
        await setFiles('#insetUpload',[file('inset.txt',2048,'text/plain')]);
        await setFiles('#noSizeUpload',[file('hidden.txt',2048,'text/plain')]);
        const defaults=await page.locator('#insetUpload').evaluate(input=>{const node=input.closest('.ui-file-upload');return {small:node.querySelector('.ui-upload-files small')?.textContent,clear:!!node.querySelector('.ui-upload-files .ui-control-clear'),fileRect:node.querySelector('.ui-upload-files').getBoundingClientRect().top,targetRect:node.querySelector('.ui-upload-target').getBoundingClientRect().top};});
        const explicitFalse=await page.locator('#noSizeUpload').evaluate(input=>{const node=input.closest('.ui-file-upload');return {small:!!node.querySelector('.ui-upload-files small'),clear:!!node.querySelector('.ui-upload-files .ui-control-clear')};});
        assert.equal(defaults.small,'2.0 kB');assert.equal(defaults.clear,true);assert.ok(defaults.fileRect<defaults.targetRect,'inset file list must precede the browse target');assert.deepEqual(explicitFalse,{small:false,clear:false});
        assert.equal(await page.locator('#directoryUpload').getAttribute('accept'),null);
    });
    await check('FileUpload item/single slot remove props update models and emit exactly once',async()=>{
        await setFiles('#multipleUpload',[file('first.txt',1,'text/plain'),file('second.txt',1,'text/plain')]);
        await page.locator('#multiple-remove-0').click();await flush();
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.multipleUpload),['second.txt']);
        await page.locator('#multiple-remove-0').click();await flush();
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.multipleUpload),[]);
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().events.uploadRemove),[0,0]);
        await setFiles('#singleUpload',[file('solo.txt',1,'text/plain')]);
        assert.equal(await page.locator('#single-remove-button').getAttribute('disabled'),null);
        await page.locator('#single-remove-button').click();await flush();
        assert.equal(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.singleUpload),null);
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().events.singleRemove),[0]);
    });
    await check('FileUpload hideBrowse target click, Enter and Space open native picker; readonly/disabled do not',async()=>{
        const target=page.locator('#hiddenBrowse').locator('xpath=ancestor::div[contains(concat(" ",normalize-space(@class)," ")," ui-upload-target ")]');
        await chooser(()=>target.click(),false);
        await target.focus();await chooser(()=>target.press('Enter'),false);
        await target.focus();await chooser(()=>target.press('Space'),false);
        assert.equal(await target.getAttribute('role'),'button');
        await noChooser(()=>page.locator('#readonlyUpload').locator('xpath=ancestor::div[contains(concat(" ",normalize-space(@class)," ")," ui-upload-target ")]').evaluate(target=>target.click()));
        await noChooser(()=>page.locator('#disabledUpload').locator('xpath=ancestor::div[contains(concat(" ",normalize-space(@class)," ")," ui-upload-target ")]').evaluate(target=>target.click()));
        await page.evaluate(()=>{
            window.fileSlotsProtocol.refs.readonlyUpload.value.receive([new File(['x'],'readonly-upload.txt',{type:'text/plain'})]);
            window.fileSlotsProtocol.refs.disabledUpload.value.receive([new File(['x'],'disabled-upload.txt',{type:'text/plain'})]);
        });await flush();
        assert.equal(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.readonlyUpload),null);
        assert.equal(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.disabledUpload),null);
    });
    await check('FileUpload stale async drop is discarded after disabling the control',async()=>{
        const race=await page.evaluate(()=>window.fileSlotsProtocol.dropThenDisable());await flush();
        assert.ok(race.startedAt!==null,'mock entry read must actually start');
        assert.ok(race.startedAt<race.disabledAt&&race.disabledAt<race.completedAt,'entry callback must complete only after disabled becomes true');
        assert.equal(race.modelBeforeDisable,null);
        assert.deepEqual(race.disabled,{input:true,control:true,prop:true});
        assert.equal(race.modelAfterComplete,null);
        assert.equal(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().models.raceUpload),null);
        assert.deepEqual(await page.evaluate(()=>window.fileSlotsProtocol.snapshot().events.raceChange),[]);
    });
    await check('real demos render selected-file, custom summary, browse and remove states in responsive captures',async()=>{
        const demoInput=page.locator('#file-input-demo [data-demo-component="UFileInput"] input[type=file]');
        await setFiles('#file-input-demo [data-demo-component="UFileInput"] input[type=file]',[file('selected-demo.md',128,'text/markdown'),file('second-demo.txt',256,'text/plain')]);
        await page.getByText('自定义文件摘要',{exact:true}).click();await flush();
        assert.ok(await page.locator('#file-input-demo').getByText('selected-demo.md').count());
        await setFiles('#file-upload-demo [data-demo-component="UFileUpload"] .ui-file-upload input[type=file]',[file('selected-upload.md',256,'text/markdown')]);
        assert.ok(await page.locator('#file-upload-demo').getByText('selected-upload.md').count());
        assert.ok(await page.locator('#file-upload-demo').getByRole('button',{name:'浏览附件'}).count());
        assert.ok(await page.locator('#file-upload-demo').getByRole('button',{name:'移除单文件'}).count());
        await chooser(()=>page.locator('#file-upload-demo').getByRole('button',{name:'浏览附件'}).click(),true);
        const inputDemo=page.locator('#file-input-demo');const uploadDemo=page.locator('#file-upload-demo');
        for(const [width,theme,zoom,suffix] of [[1200,'light',1,'wide-light'],[390,'dark',1,'narrow-dark'],[390,'light',1.25,'narrow-light-zoom-125']]){
            await page.setViewportSize({width,height:1040});
            await page.evaluate(({theme,zoom})=>{document.documentElement.style.zoom=String(zoom);return window.fileSlotsProtocol.theme(theme);},{theme,zoom});await page.waitForTimeout(80);await flush();
            await inputDemo.screenshot({path:path.join(evidence,`file-input-${suffix}.png`),animations:'disabled'});
            await uploadDemo.screenshot({path:path.join(evidence,`file-upload-${suffix}.png`),animations:'disabled'});
        }
        await page.evaluate(()=>document.documentElement.style.zoom='1');
    });
    await check('no Vue warnings or browser errors',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);});
    await check('product, shared styles, demos and public exports remain unchanged',async()=>assert.deepEqual(await hashes(),before));
    await writeFile(path.join(evidence,'report.json'),JSON.stringify({checks,failures,sourceHashes:before,warnings,errors,screenshots:['file-input-wide-light.png','file-upload-wide-light.png','file-input-narrow-dark.png','file-upload-narrow-dark.png','file-input-narrow-light-zoom-125.png','file-upload-narrow-light-zoom-125.png'],visualAcceptance:false},null,4));
    assert.deepEqual(failures,[],'one or more file consumer protocol checks failed; see report.json');
    process.stdout.write(JSON.stringify({checks:checks.length,evidence}));
}finally{await browser?.close();await vite.close();}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";

const evidence = path.resolve(
    "artifacts/component-audit-root/confirm-edit-protocols",
);
await mkdir(evidence, { recursive: true });
const sources = ["src/ui/UConfirmEdit.vue", "src/ui/confirm-edit.ts", "src/ui/docs/component-examples/confirm-edit.vue"];
async function sourceHashes() {
    return Object.fromEntries(await Promise.all(sources.map(async file => [file, createHash("sha256").update(await readFile(file)).digest("hex")])));
}
const fixture = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body,#app{height:auto!important;overflow:visible!important;min-height:0!important}
body{margin:0;padding:20px}main{display:grid;gap:24px;max-width:960px;margin:auto}
section{padding:16px;border:1px solid var(--border);border-radius:12px;min-width:0}
</style></head><body><div id="app"></div><script type="module">
import {createApp,h,isRef,reactive,ref} from 'vue';
import * as UI from '/src/ui/index.ts';
import RealDemo from '/src/ui/docs/component-examples/confirm-edit.vue';
import '/src/docs-base.css';import '/src/ui/styles.css';
const state=reactive({value:{name:'Original',nested:{count:1}},disabled:undefined,readonly:false,hide:false,saves:[],cancels:0,valid:true,pending:false});
const exposed=ref();let scope;let finish;
const validate=()=>state.pending?new Promise(resolve=>finish=resolve):state.valid;
const app=createApp({render:()=>h('main',[
h('section',{id:'real-demo'},[h(RealDemo)]),
h('section',{id:'contract'},[h(UI.UConfirmEdit,{ref:exposed,modelValue:state.value,'onUpdate:modelValue':v=>state.value=v,disabled:state.disabled,readonly:state.readonly,hideActions:state.hide,validate,okText:'Commit',cancelText:'Restore',onSave:v=>state.saves.push(v),onCancel:()=>state.cancels++},{default:s=>{scope=s;return h('output',{id:'draft'},s.model.value.name+':'+s.model.value.nested.count)}})]),
h('section',{id:'custom-actions'},[h(UI.UConfirmEdit,{modelValue:'Custom',disabled:false},{default:s=>h(s.actions,{class:'custom-action'})})])
])});app.use(UI.createUI());app.mount('#app');
window.confirmProtocol={state,edit:(name,count)=>{scope.model.value.name=name;scope.model.value.nested.count=count},save:()=>exposed.value.save(),cancel:()=>exposed.value.cancel(),begin:()=>exposed.value.begin(),finish:v=>finish(v),read:()=>({value:JSON.parse(JSON.stringify(state.value)),draft:JSON.parse(JSON.stringify(scope.model.value)),refModel:isRef(scope.model),pristine:exposed.value.isPristine,saving:scope.saving,saves:state.saves.length,cancels:state.cancels}),setTheme:t=>{document.documentElement.dataset.theme=t;document.documentElement.dataset.uiTheme=t}};
</script></body></html>`;
const server = await createServer({
    configFile: false,
    root: process.cwd(),
    logLevel: "error",
    cacheDir: path.join(evidence, "vite-cache"),
    plugins: [
        (await import("@vitejs/plugin-vue")).default(),
        {
            name: "confirm-edit-fixture",
            configureServer(vite) {
                vite.middlewares.use((request, response, next) => {
                    if (request.url?.split("?")[0] !== "/confirm-edit-fixture")
                        return next();
                    response.setHeader("Content-Type", "text/html");
                    vite.transformIndexHtml("/confirm-edit-fixture", fixture)
                        .then((html) => response.end(html))
                        .catch(next);
                });
            },
        },
    ],
    resolve: { dedupe: ["vue"] },
    optimizeDeps: {
        entries: [],
        noDiscovery: true,
        include: [
            "vue",
            "highlight.js/lib/core",
            "highlight.js/lib/languages/xml",
            "highlight.js/lib/languages/javascript",
            "highlight.js/lib/languages/typescript",
            "highlight.js/lib/languages/css",
            "highlight.js/lib/languages/json",
            "markdown-it",
            "markdown-it-footnote",
            "markdown-it-task-lists",
            "markdown-it-deflist",
            "markdown-it-mark",
            "markdown-it-sub",
            "markdown-it-sup",
        ],
    },
    server: {
        host: "127.0.0.1",
        port: 0,
        watch: { ignored: ["**/artifacts/**", "**/node_modules/**"] },
    },
});
let browser;
const report = {
    sourceSha256: await sourceHashes(),
    runtime: "Chromium source renderer",
    checks: [],
    screenshots: [],
};
try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
        viewport: { width: 1280, height: 1000 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
        if (message.type() === "error" || message.text().includes("[Vue warn]"))
            errors.push(message.text());
    });
    await page.goto(server.resolvedUrls.local[0] + "confirm-edit-fixture");
    await page.waitForFunction(() => Boolean(window.confirmProtocol));
    const read = () => page.evaluate(() => window.confirmProtocol.read());
    const set = (values) =>
        page.evaluate(
            (v) => Object.assign(window.confirmProtocol.state, v),
            values,
        );
    const edit = (name, count) =>
        page.evaluate(
            ([n, c]) => window.confirmProtocol.edit(n, c),
            [name, count],
        );
    assert.equal(await page.locator("#real-demo input").count(), 3);
    assert.equal((await read()).pristine, true);
    assert.equal((await read()).refModel, true);
    assert.equal(await page.locator("#contract button:disabled").count(), 2);
    report.checks.push("always visible; pristine disables actions by default");
    await edit("Draft", 2);
    assert.deepEqual((await read()).value, {
        name: "Original",
        nested: { count: 1 },
    });
    assert.equal((await read()).pristine, false);
    await page
        .locator("#contract button")
        .filter({ hasText: "Restore" })
        .click();
    assert.deepEqual((await read()).draft, {
        name: "Original",
        nested: { count: 1 },
    });
    report.checks.push("deep object isolation and cancel resets draft");
    await edit("Committed", 3);
    await page
        .locator("#contract button")
        .filter({ hasText: "Commit" })
        .click();
    assert.equal((await read()).saves, 1);
    assert.equal((await read()).value.nested.count, 3);
    await edit("After save", 4);
    assert.equal((await read()).value.name, "Committed");
    report.checks.push(
        "save commits snapshot; later draft edits remain isolated",
    );
    await set({ value: { name: "Replacement", nested: { count: 5 } } });
    assert.equal((await read()).draft.name, "Replacement");
    await page.evaluate(
        () => (window.confirmProtocol.state.value.nested.count = 6),
    );
    assert.equal((await read()).draft.nested.count, 6);
    report.checks.push(
        "external replacement and nested model updates refresh draft",
    );
    await set({ disabled: ["save"] });
    await edit("Blocked", 7);
    assert.equal(
        await page
            .locator("#contract button")
            .filter({ hasText: "Commit" })
            .isDisabled(),
        true,
    );
    assert.equal(
        await page
            .locator("#contract button")
            .filter({ hasText: "Restore" })
            .isDisabled(),
        false,
    );
    await page.evaluate(() => window.confirmProtocol.save());
    assert.equal((await read()).saves, 1);
    await set({ disabled: false });
    await page.evaluate(() => window.confirmProtocol.cancel());
    assert.equal(
        await page
            .locator("#contract button")
            .filter({ hasText: "Commit" })
            .isDisabled(),
        false,
    );
    report.checks.push(
        "per-action disabling; explicit false overrides pristine",
    );
    await set({ readonly: true });
    assert.equal(await page.locator("#contract button:disabled").count(), 2);
    await set({ readonly: false, valid: false });
    await edit("Invalid", 8);
    await page.evaluate(() => window.confirmProtocol.save());
    assert.equal((await read()).value.name, "Replacement");
    assert.equal((await read()).saving, false);
    report.checks.push("readonly and failed validation guard commit");
    await set({ valid: true, pending: true });
    await page.evaluate(() => {
        window.confirmProtocol.save();
    });
    assert.equal((await read()).saving, true);
    await set({ value: { name: "Newer model", nested: { count: 9 } } });
    await page.evaluate(() => window.confirmProtocol.finish(true));
    await page.waitForFunction(() => !window.confirmProtocol.read().saving);
    assert.equal((await read()).value.name, "Newer model");
    assert.equal((await read()).saves, 1);
    report.checks.push("pending validation cannot overwrite newer model");
    await set({ hide: true });
    assert.equal(await page.locator("#contract button").count(), 0);
    assert.equal(
        await page.locator("#custom-actions .custom-action").count(),
        2,
    );
    assert.equal(
        await page.locator("#custom-actions .u-confirm-actions").count(),
        0,
    );
    report.checks.push(
        "hideActions and provided actions suppress duplicate defaults",
    );
    for (const [theme, width, zoom] of [
        ["light", 1280, 1],
        ["dark", 390, 1],
        ["dark", 900, 1.25],
    ]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(
            ([t, z]) => {
                window.confirmProtocol.setTheme(t);
                document.body.style.zoom = String(z);
            },
            [theme, zoom],
        );
        const overflow = await page.evaluate(
            () =>
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth,
        );
        assert.equal(overflow, false);
        const file = `confirm-demo-${theme}-${width}-${zoom}.png`;
        await page
            .locator("#real-demo")
            .screenshot({
                path: path.join(evidence, file),
                animations: "disabled",
            });
        report.screenshots.push(file);
    }
    assert.deepEqual(errors, []);
    report.checks.push(
        "real demo light/dark/narrow/125%; no overflow or Vue/page errors",
    );
    console.log(JSON.stringify(report, null, 4));
} catch (error) {
    report.failure = String(error);
    throw error;
} finally {
    report.sourceSha256After = await sourceHashes();
    report.sourceChangedDuringRun = JSON.stringify(report.sourceSha256) !== JSON.stringify(report.sourceSha256After);
    await writeFile(
        path.join(evidence, "report.json"),
        JSON.stringify(report, null, 4),
    );
    if (browser) await browser.close();
    await server.close();
}

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/hotkey-listener-protocols');
await mkdir(path.join(evidence, 'profile'), { recursive: true });

const fixture = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module">
    import { createApp, h, nextTick, reactive, ref } from 'vue';
    import UHotkeyListener from '/src/ui/UHotkeyListener.vue';

    const state = reactive({ sequence: 0, timeout: 0, strict: 0, loose: 0, modifiers: 0, editable: 0, allowInput: 0, preventDefault: 0, disabled: 0, dynamic: 0, cleanup: 0 });
    const disabled = ref(true);
    const dynamicKeys = ref('ctrl+y');
    const cleanupMounted = ref(true);

    window.hotkeyListenerProtocol = {
        state,
        registry: Boolean(UHotkeyListener),
        setDisabled(value) { disabled.value = value; },
        setDynamicKeys(value) { dynamicKeys.value = value; },
        setCleanupMounted(value) { cleanupMounted.value = value; },
        async flush() { await nextTick(); await nextTick(); }
    };

    createApp({
        render() {
            return h('main', [
                h(UHotkeyListener, {
                    keys: 'ctrl+k/meta+p-shift+enter',
                    onTrigger: () => state.sequence++
                }, { default: scope => h('span', { id: 'legacy-slot' }, 'legacy:' + scope.keys) }),
                h(UHotkeyListener, { keys: 'ctrl+t-shift+enter', sequenceTimeout: 70, onTrigger: () => state.timeout++ }),
                h(UHotkeyListener, { keys: 'ctrl+e', onTrigger: () => state.strict++ }),
                h(UHotkeyListener, { keys: 'ctrl+e', exact: false, onTrigger: () => state.loose++ }),
                h(UHotkeyListener, { keys: 'ctrl+shift+m', onTrigger: () => state.modifiers++ }),
                h(UHotkeyListener, { keys: 'ctrl+i', editable: true, onTrigger: () => state.editable++ }),
                h(UHotkeyListener, { keys: 'ctrl+a', allowInput: true, onTrigger: () => state.allowInput++ }),
                h(UHotkeyListener, { keys: 'ctrl+o', preventDefault: false, onTrigger: () => state.preventDefault++ }),
                h(UHotkeyListener, { keys: 'ctrl+d', disabled: disabled.value, onTrigger: () => state.disabled++ }),
                h(UHotkeyListener, { keys: dynamicKeys.value, onTrigger: () => state.dynamic++ }),
                cleanupMounted.value ? h(UHotkeyListener, { keys: 'ctrl+j', onTrigger: () => state.cleanup++ }) : null,
                h('input', { id: 'blocked-input', 'aria-label': 'Blocked input' }),
                h('input', { id: 'editable-input', 'aria-label': 'Editable input' }),
                h('div', { id: 'blocked-content', contenteditable: 'true', tabindex: 0 })
            ]);
        }
    }).mount('#app');
</script></body></html>`;

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: {
        noDiscovery: true,
        include: [
            'highlight.js/lib/core',
            'highlight.js/lib/languages/xml',
            'highlight.js/lib/languages/javascript',
            'highlight.js/lib/languages/typescript',
            'highlight.js/lib/languages/css',
            'highlight.js/lib/languages/json',
            'markdown-it',
            'markdown-it-footnote',
            'markdown-it-task-lists',
            'markdown-it-deflist',
            'markdown-it-mark',
            'markdown-it-sub',
            'markdown-it-sup'
        ]
    },
    resolve: { dedupe: ['vue'] },
    server: {
        host: '127.0.0.1',
        port: 0,
        hmr: false,
        watch: { ignored: ['**/artifacts/**'] }
    },
    plugins: [{
        name: 'hotkey-listener-protocol-fixture',
        configureServer(viteServer) {
            viteServer.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__hotkey-listener-protocols') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await viteServer.transformIndexHtml('/__hotkey-listener-protocols', fixture));
            });
        }
    }]
});

const sourceFiles = ['src/ui/hotkey.ts', 'src/ui/UHotkeyListener.vue', 'src/ui/index.ts'];
const sourceSha256 = Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    file,
    createHash('sha256').update(await readFile(file)).digest('hex')
])));

await server.listen();
const publicEntry = await readFile('src/ui/index.ts', 'utf8');
assert.match(publicEntry, /export \{ default as UHotkeyListener \} from '\.\/UHotkeyListener\.vue';/);
const env = {
    ...process.env,
    UAH_DATA_DIR: path.join(evidence, 'profile'),
    UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + '__hotkey-listener-protocols'
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let app;
let page;
const errors = [];
const report = {
    method: 'Vite source fixture + real UHotkeyListener.vue + public index export assertion + Electron KeyboardEvent dispatch',
    evidence,
    sourceSha256,
    checks: {},
    errors
};

async function flush() {
    await page.evaluate(() => window.hotkeyListenerProtocol.flush());
}

async function dispatchKey(key, modifiers = {}, selector) {
    const result = await page.evaluate(({ key: eventKey, modifiers: eventModifiers, targetSelector }) => {
        const activeElement = document.activeElement;
        if (!targetSelector) activeElement?.blur?.();
        const target = targetSelector ? document.querySelector(targetSelector) : document.body;
        const event = new KeyboardEvent('keydown', {
            key: eventKey,
            bubbles: true,
            cancelable: true,
            ...eventModifiers
        });
        target.dispatchEvent(event);
        return { defaultPrevented: event.defaultPrevented, timeStamp: event.timeStamp };
    }, { key, modifiers, targetSelector: selector ?? null });
    await flush();
    return result;
}

async function state() {
    return page.evaluate(() => ({ ...window.hotkeyListenerProtocol.state }));
}

try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(5000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
    });
    await page.waitForFunction(() => Boolean(window.hotkeyListenerProtocol));
    assert.equal(await page.evaluate(() => window.hotkeyListenerProtocol.registry), true, 'the public entry exports UHotkeyListener');
    assert.equal(await page.locator('#legacy-slot').textContent(), 'legacy:ctrl+k/meta+p-shift+enter', 'the existing keys slot remains available');

    const firstChord = await dispatchKey('k', { ctrlKey: true });
    assert.equal(firstChord.defaultPrevented, true, 'a recognized sequence prefix is prevented by default');
    assert.equal((await state()).sequence, 0);
    await dispatchKey('Enter', { shiftKey: true });
    assert.equal((await state()).sequence, 1, 'a sequence completes after its first chord');
    await dispatchKey('p', { metaKey: true });
    await dispatchKey('Enter', { shiftKey: true });
    assert.equal((await state()).sequence, 2, 'an alternate first chord reaches the same sequence suffix');
    await dispatchKey('k', { ctrlKey: true });
    await dispatchKey('k', { ctrlKey: true });
    await dispatchKey('Enter', { shiftKey: true });
    assert.equal((await state()).sequence, 3, 'repeating a first chord restarts the sequence');
    await dispatchKey('k', { ctrlKey: true });
    await dispatchKey('x', { ctrlKey: true });
    await dispatchKey('Enter', { shiftKey: true });
    assert.equal((await state()).sequence, 3, 'a mismatch clears the partial sequence');
    report.checks.sequenceAlternativesRestart = await state();

    await dispatchKey('t', { ctrlKey: true });
    await page.waitForTimeout(100);
    await dispatchKey('Enter', { shiftKey: true });
    assert.equal((await state()).timeout, 0, 'an expired sequence cannot complete');
    await dispatchKey('t', { ctrlKey: true });
    await dispatchKey('Enter', { shiftKey: true });
    assert.equal((await state()).timeout, 1, 'a fresh sequence completes before its timeout');
    report.checks.sequenceTimeout = (await state()).timeout;

    await dispatchKey('e', { ctrlKey: true, altKey: true });
    assert.equal((await state()).strict, 0, 'exact defaults to the old strict modifier matching');
    assert.equal((await state()).loose, 1, 'exact=false accepts an additional modifier');
    await dispatchKey('m', { ctrlKey: true });
    assert.equal((await state()).modifiers, 0, 'all requested modifier keys are required');
    await dispatchKey('m', { ctrlKey: true, shiftKey: true });
    assert.equal((await state()).modifiers, 1, 'a chord matches when all combined modifiers are held');
    report.checks.exact = { strict: (await state()).strict, loose: (await state()).loose, modifiers: (await state()).modifiers };

    const blockedInput = await dispatchKey('g', { ctrlKey: true }, '#blocked-input');
    assert.equal((await state()).sequence, 3, 'editable controls are ignored by default');
    assert.equal(blockedInput.defaultPrevented, false);
    const editableInput = await dispatchKey('i', { ctrlKey: true }, '#editable-input');
    assert.equal((await state()).editable, 1, 'editable=true enables matching in input elements');
    assert.equal(editableInput.defaultPrevented, true);
    await dispatchKey('a', { ctrlKey: true }, '#editable-input');
    assert.equal((await state()).allowInput, 1, 'allowInput remains a working compatibility alias');
    await dispatchKey('g', { ctrlKey: true }, '#blocked-content');
    assert.equal((await state()).sequence, 3, 'contenteditable elements are ignored by default');
    report.checks.editable = { editable: (await state()).editable, allowInput: (await state()).allowInput };

    const unprevented = await dispatchKey('o', { ctrlKey: true });
    assert.equal((await state()).preventDefault, 1);
    assert.equal(unprevented.defaultPrevented, false, 'preventDefault=false preserves browser default behavior');
    await dispatchKey('d', { ctrlKey: true });
    assert.equal((await state()).disabled, 0, 'disabled listener ignores a matching chord');
    await page.evaluate(() => window.hotkeyListenerProtocol.setDisabled(false));
    await flush();
    await dispatchKey('d', { ctrlKey: true });
    assert.equal((await state()).disabled, 1, 'enabling the listener makes the same chord active');

    await dispatchKey('y', { ctrlKey: true });
    assert.equal((await state()).dynamic, 1);
    await page.evaluate(() => window.hotkeyListenerProtocol.setDynamicKeys('ctrl+b'));
    await flush();
    await dispatchKey('y', { ctrlKey: true });
    assert.equal((await state()).dynamic, 1, 'changing keys removes the old compiled shortcut');
    await dispatchKey('b', { ctrlKey: true });
    assert.equal((await state()).dynamic, 2, 'changing keys installs the new compiled shortcut');

    await dispatchKey('j', { ctrlKey: true });
    assert.equal((await state()).cleanup, 1);
    await page.evaluate(() => window.hotkeyListenerProtocol.setCleanupMounted(false));
    await flush();
    const afterUnmount = await dispatchKey('j', { ctrlKey: true });
    assert.equal((await state()).cleanup, 1, 'unmount removes the global listener');
    assert.equal(afterUnmount.defaultPrevented, false, 'an unmounted listener no longer prevents the event');
    report.checks.reactivityAndCleanup = await state();

    assert.deepEqual(errors, [], 'listener fixture should not produce browser errors or Vue warnings');
    console.log(JSON.stringify(report, null, 4));
} catch (error) {
    report.failure = error instanceof Error ? error.stack : String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    if (app) {
        const closed = await Promise.race([
            app.close().then(() => true),
            new Promise(resolve => setTimeout(() => resolve(false), 5000))
        ]);
        if (!closed) app.process().kill();
    }
    await server.close();
}

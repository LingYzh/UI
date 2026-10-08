import { _electron as electron } from 'playwright';
import { createServer } from 'vite';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';

const components = {
    UCopyButton: ['src/ui/UiCopyButton.vue', 'src/ui/clipboard.ts'],
    UMessageActions: ['src/ui/UiMessageActions.vue'],
    UConfirmHost: ['src/ui/UiConfirmHost.vue', 'src/ui/confirm.ts'],
    UUsageMeter: ['src/ui/UiUsageMeter.vue'],
    UActivity: ['src/ui/UiActivity.vue'],
    UFileChanges: ['src/ui/UiFileChanges.vue'],
    UCodeBlock: ['src/ui/UiCodeBlock.vue', 'src/ui/clipboard.ts'],
    UCode: ['src/ui/UCode.vue'],
    UDiff: ['src/ui/UiDiff.vue', 'src/ui/line-diff.ts', 'src/ui/clipboard.ts'],
    UMarkdown: ['src/ui/UiMarkdown.vue', 'src/ui/markdown.ts', 'src/ui/UiMarkdownHtml.vue'],
    UScrollArea: ['src/ui/UiScrollArea.vue'],
    USpinner: ['src/ui/UiSpinner.vue'],
    UProgress: ['src/ui/UiProgress.vue'],
    USnackbarHost: ['src/ui/UiSnackbarHost.vue', 'src/ui/snackbar.ts'],
    UTransition: ['src/ui/UTransition.vue']
};

const coverage = {
    UCopyButton: ['public entry: function text is evaluated on activation; async copied/error events; disabled behavior; success timer is cleared on conditional unmount', 'existing: tests/desktop/copy-icons.mjs covers pointer/keyboard success announcement, icon reset, tooltip focus, reduced motion'],
    UMessageActions: ['public entry: enabled action keyboard activation emits its id; disabled action cannot activate', 'existing: tests/desktop/conversation.mjs covers action labels, disabled action, and keyboard activation'],
    UConfirmHost: ['public entry: confirmDialog is consumed by the host; Escape resolves false; queued requests resolve in order after close; host unmount resolves pending work false', 'existing: tests/desktop/feedback.mjs confirmDialog block covers cancel focus, confirmation, and sequential queue'],
    UUsageMeter: ['public entry: compact trigger emits inspect; disabled compact trigger is inert', 'existing: tests/desktop/usage-meter.mjs covers click/keyboard, zero/unknown/invalid/disabled/overflow/composition/update states'],
    UActivity: ['public entry: default/actions slots render and keyboard changes the open model', 'existing: tests/desktop/conversation.mjs and tests/desktop/activity.mjs cover disclosure keyboard and legacy activity rendering'],
    UFileChanges: ['public entry: keyboard selection emits item id and view-all emits separately', 'existing: tests/desktop/conversation.mjs covers path/title/stats, select, and view-all'],
    UCodeBlock: ['public entry: code containing markup remains text and the copy action writes the exact source', 'existing: tests/desktop/code-source.mjs covers exact source copy and source-view rendering; tests/desktop/markdown.mjs covers nested code and streaming updates'],
    UCode: ['public entry: tag prop selects native element and default slot text is preserved', 'existing: tests/desktop/readability-alignment.mjs covers native inline code semantics'],
    UDiff: ['public entry: inspect button emits inspect', 'existing: tests/desktop/conversation.mjs and tests/desktop/diff.mjs cover inspect, diff rows, wrapping, context, copy, and keyboard'],
    UMarkdown: ['public entry: safe link click emits link-click; unsafe links and hostile HTML are removed; rendered event carries source', 'existing: tests/desktop/markdown.mjs covers sanitization, streaming, stable DOM/selection, reduced motion, footnotes, and diagram fallback'],
    UScrollArea: ['public entry: exposed focus/scrollTo methods, keyboard End scrolling, and scroll event payload', 'existing: tests/desktop/parallax.mjs uses nested UImg/UParallax content inside UScrollArea'],
    USpinner: ['public entry: label supplies status semantics and unlabeled instance is hidden from accessibility tree', 'existing: tests/desktop/feedback.mjs covers labeled spinner status and reduced-motion behavior'],
    UProgress: ['public entry: progressbar label and finite max clamp are exposed in ARIA values', 'existing: tests/desktop/controls.mjs covers tones, values, completion, and reduced motion'],
    USnackbarHost: ['public entry: public snackbar service renders error role, focus pauses its timer, focus exit resumes it, and host unmount clears queue content', 'existing: tests/desktop/readability-alignment.mjs covers timed pointer/focus pause, resume, dismissal, and queue behavior'],
    UTransition: ['public entry: toggling the default-slot child removes it through the transition wrapper', 'existing: tests/desktop/disclosure-motion.mjs covers transition reversals, inert leaving content, cleanup, disabled/reduced motion, and live preference changes']
};

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts/custom-contracts-'));
const relative = path.relative(process.cwd(), evidence).replaceAll('\\', '/');
const fixture = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Custom public component contracts</title><style>body{margin:0}main{display:grid;gap:24px;padding:24px;max-width:1000px}section{min-width:0}#scroll-area .ui-scroll-viewport{scroll-behavior:auto!important}</style></head><body><div id="app"></div><script type="module">
import { createApp, h, reactive, ref } from 'vue';
import * as UI from '/src/ui/index.ts';
import '/src/ui/tokens.css';
import '/src/ui/styles.css';
import '/src/ui/markdown.css';

const state = reactive({
    copySuccessMounted: true,
    clipboardReject: false,
    copyText: 'initial clipboard value',
    activityOpen: false,
    confirmHostMounted: true,
    snackbarHostMounted: true,
    transitionVisible: true,
    markdownSource: '<p class="ui-dialog" onclick="window.customContracts.pwned=true">Safe HTML</p>\\n\\n<img src="data:image/svg+xml,evil" onerror="window.customContracts.pwned=true">\\n\\n<script>window.customContracts.pwned=true<\\/script>\\n\\n[Safe link](https://example.com)\\n\\n[Unsafe link](javascript:alert(1))'
});
const records = reactive({ clipboardWrites: [], copySuccess: [], copyErrors: [], copyTimerIds: [], clearedCopyTimerIds: [], messageActions: [], confirmResults: [], usageInspects: 0, activityUpdates: [], fileSelections: [], fileViewAll: 0, diffInspects: 0, markdownLinks: [], markdownRendered: [], scrollEvents: [] });
const scrollAreaRef = ref(null);
const originalSetTimeout = window.setTimeout.bind(window);
const originalClearTimeout = window.clearTimeout.bind(window);
window.setTimeout = (callback, delay, ...args) => {
    const id = originalSetTimeout(callback, delay, ...args);
    if (delay === 1600) records.copyTimerIds.push(id);
    return id;
};
window.clearTimeout = id => {
    if (records.copyTimerIds.includes(id)) records.clearedCopyTimerIds.push(id);
    return originalClearTimeout(id);
};
UI.setClipboardWriter(async text => {
    records.clipboardWrites.push(text);
    await new Promise(resolve => originalSetTimeout(resolve, 0));
    if (state.clipboardReject) throw new Error('clipboard blocked');
});
window.customContracts = {
    state,
    records,
    scrollAreaRef,
    confirmDialog: UI.confirmDialog,
    snackbar: UI.snackbar,
    setClipboardWriter: UI.setClipboardWriter,
    pwned: undefined,
    app: null
};

const app = createApp({
    render() {
        return h('main', [
            h('section', { id: 'copy-controls' }, [
                state.copySuccessMounted ? h(UI.UCopyButton, {
                    id: 'copy-success', text: () => state.copyText, label: 'Copy latest value', copiedLabel: 'Copied latest value',
                    onCopied: value => records.copySuccess.push(value),
                    onError: error => records.copyErrors.push(String(error?.message || error))
                }) : null,
                h(UI.UCopyButton, { id: 'copy-failure', text: 'failure payload', label: 'Copy failure payload', onCopied: value => records.copySuccess.push(value), onError: error => records.copyErrors.push(String(error?.message || error)) }),
                h(UI.UCopyButton, { id: 'copy-disabled', text: 'must not write', label: 'Disabled copy', disabled: true, onCopied: value => records.copySuccess.push(value) })
            ]),
            h(UI.UMessageActions, { id: 'message-actions', label: 'Message actions', actions: [{ id: 'retry', icon: 'refresh', label: 'Retry response' }, { id: 'delete', icon: 'delete', label: 'Delete response', disabled: true }], onAction: id => records.messageActions.push(id) }),
            h(UI.UUsageMeter, { id: 'usage-enabled', compact: true, used: 40, capacity: 100, label: 'Context usage', onInspect: () => records.usageInspects++ }),
            h(UI.UUsageMeter, { id: 'usage-disabled', compact: true, used: 40, capacity: 100, label: 'Disabled context usage', disabled: true, onInspect: () => records.usageInspects++ }),
            h(UI.UActivity, { id: 'activity', title: 'Activity details', status: 'Complete', open: state.activityOpen, 'onUpdate:open': value => { state.activityOpen = value; records.activityUpdates.push(value); }, scrollable: false }, {
                default: () => h('span', { id: 'activity-body' }, 'Activity body'),
                actions: () => h('button', { id: 'activity-action', type: 'button' }, 'Activity action')
            }),
            h(UI.UFileChanges, { id: 'file-changes', title: 'Changed files', items: [{ id: 'file-1', path: 'src/example.ts', status: 'M', added: 3, removed: 1 }], onSelect: id => records.fileSelections.push(id), onViewAll: () => records.fileViewAll++ }),
            h(UI.UCodeBlock, { id: 'code-block', code: '<img src=x onerror="window.customContracts.pwned=true">\\nconst value = 1;', language: 'html' }),
            h(UI.UCode, { id: 'inline-code', tag: 'pre' }, { default: () => 'native code slot' }),
            h(UI.UDiff, { id: 'diff', before: 'before\\n', after: 'after\\n', path: 'src/example.ts', inspectable: true, onInspect: () => records.diffInspects++ }),
            h(UI.UMarkdown, { id: 'markdown', source: state.markdownSource, onLinkClick: href => records.markdownLinks.push(href), onRendered: source => records.markdownRendered.push(source) }),
            h(UI.UScrollArea, { id: 'scroll-area', ref: scrollAreaRef, label: 'Keyboard scroll fixture', height: '100px', onScroll: position => records.scrollEvents.push(position) }, {
                default: () => h('div', { style: { height: '500px' } }, 'Scrollable content')
            }),
            h('div', { id: 'spinner-labeled' }, h(UI.USpinner, { label: 'Loading fixture', size: 20 })),
            h('div', { id: 'spinner-decorative' }, h(UI.USpinner, { size: 12 })),
            h(UI.UProgress, { id: 'progress', label: 'Fixture progress', value: 140, max: 100 }),
            h(UI.UTransition, { id: 'transition', variant: 'fade' }, { default: () => state.transitionVisible ? h('div', { id: 'transition-child', key: 'transition-child' }, 'Transition child') : null }),
            state.confirmHostMounted ? h(UI.UConfirmHost) : null,
            state.snackbarHostMounted ? h(UI.USnackbarHost) : null,
            h('button', { id: 'after-snackbar', type: 'button' }, 'After snackbar')
        ]);
    }
});
app.use(UI.createUI({ locale: { locale: 'en' } }));
app.mount('#app');
window.customContracts.app = app;
</script></body></html>`;
await writeFile(path.join(evidence, 'fixture.html'), fixture, 'utf8');

const viteWarnings = [];
const server = await createServer({
    server: { host: '127.0.0.1', port: 0, watch: null },
    customLogger: {
        info() {},
        warn(message) { viteWarnings.push(message); },
        warnOnce(message) { viteWarnings.push(message); },
        error(message) { throw new Error(message); },
        clearScreen() {},
        hasErrorLogged() { return false; },
        hasWarned: false
    }
});
await server.listen();
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: server.resolvedUrls.local[0] + relative + '/fixture.html' };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;
const appProcess = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], env });
const page = await appProcess.firstWindow();
page.setDefaultTimeout(12000);
const pageErrors = [];
const vueDiagnostics = [];
page.on('pageerror', error => pageErrors.push(error.message));
page.on('console', message => {
    if ((message.type() === 'warning' || message.type() === 'error') && /\[Vue warn\]|Vue warn/i.test(message.text())) vueDiagnostics.push({ type: message.type(), text: message.text() });
});

try {
    await page.waitForFunction(() => window.customContracts);
    console.log('STEP fixture mounted');

    const progress = page.getByRole('progressbar', { name: 'Fixture progress', exact: true });
    assert.equal(await progress.getAttribute('aria-valuenow'), '100');
    assert.equal(await progress.getAttribute('aria-valuemax'), '100');
    assert.equal(await page.getByRole('status', { name: 'Loading fixture', exact: true }).count(), 1);
    assert.equal(await page.locator('#spinner-decorative .ui-spinner').getAttribute('aria-hidden'), 'true');

    const successCopy = page.getByRole('button', { name: 'Copy latest value', exact: true });
    await page.evaluate(() => { window.customContracts.state.copyText = 'changed at activation'; });
    await successCopy.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.customContracts.records.copySuccess.length === 1);
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.copySuccess), ['changed at activation']);
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.clipboardWrites), ['changed at activation']);
    assert.equal(await successCopy.locator('xpath=..').getByRole('status').textContent(), 'Copied latest value');
    const copyTimerId = await page.evaluate(() => window.customContracts.records.copyTimerIds.at(-1));
    assert.notEqual(copyTimerId, undefined, 'successful copy schedules its reset timer');
    await page.evaluate(() => { window.customContracts.state.copySuccessMounted = false; });
    await successCopy.waitFor({ state: 'detached' });
    assert.ok((await page.evaluate(() => window.customContracts.records.clearedCopyTimerIds)).includes(copyTimerId), 'conditional unmount clears the success reset timer');

    await page.evaluate(() => { window.customContracts.state.clipboardReject = true; });
    await page.getByRole('button', { name: 'Copy failure payload', exact: true }).click();
    await page.waitForFunction(() => window.customContracts.records.copyErrors.length === 1);
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.copyErrors), ['clipboard blocked']);
    const disabledCopy = page.getByRole('button', { name: 'Disabled copy', exact: true });
    assert.equal(await disabledCopy.isDisabled(), true);
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.clipboardWrites), ['changed at activation', 'failure payload']);
    await page.evaluate(() => { window.customContracts.state.clipboardReject = false; });
    console.log('STEP clipboard contracts passed');

    const retry = page.getByRole('button', { name: 'Retry response', exact: true });
    await retry.focus();
    await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.messageActions), ['retry']);
    const deleteAction = page.getByRole('button', { name: 'Delete response', exact: true });
    assert.equal(await deleteAction.isDisabled(), true);
    const usageEnabled = page.locator('#usage-enabled.ui-usage-trigger');
    assert.equal(await usageEnabled.count(), 1);
    await usageEnabled.click();
    assert.equal(await page.evaluate(() => window.customContracts.records.usageInspects), 1);
    assert.equal(await page.locator('#usage-disabled.ui-usage-trigger').isDisabled(), true);
    assert.equal(await page.evaluate(() => window.customContracts.records.usageInspects), 1);

    const activity = page.locator('#activity .ui-activity-heading');
    assert.equal(await activity.getAttribute('aria-expanded'), 'false');
    await activity.focus();
    await page.keyboard.press('Space');
    assert.equal(await activity.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#activity-body').textContent(), 'Activity body');
    assert.equal(await page.locator('#activity-action').textContent(), 'Activity action');
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.activityUpdates), [true]);

    const file = page.getByRole('button', { name: /src\/example\.ts/ });
    await file.focus();
    await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.fileSelections), ['file-1']);
    const viewAll = page.locator('#file-changes .ui-file-changes-view-all');
    await viewAll.focus();
    await page.keyboard.press('Space');
    assert.equal(await page.evaluate(() => window.customContracts.records.fileViewAll), 1);
    console.log('STEP message/activity/file contracts passed');

    const code = page.locator('#code-block code');
    const expectedCode = '<img src=x onerror="window.customContracts.pwned=true">\nconst value = 1;';
    assert.equal((await code.textContent()).replace(/\r\n/g, '\n'), expectedCode);
    assert.equal(await page.locator('#code-block img').count(), 0, 'code markup is rendered as text, never as an image element');
    const codeCopy = page.locator('#code-block .ui-code-toolbar button').nth(1);
    await codeCopy.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.customContracts.records.clipboardWrites.length === 3);
    assert.equal((await page.evaluate(() => window.customContracts.records.clipboardWrites))[2], expectedCode);
    assert.equal(await page.locator('#inline-code').evaluate(element => element.tagName), 'PRE');
    assert.equal(await page.locator('#inline-code').textContent(), 'native code slot');

    await page.locator('#diff .ui-diff-inspect').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => window.customContracts.records.diffInspects), 1);

    const safeLink = page.getByRole('link', { name: 'Safe link', exact: true });
    await safeLink.focus();
    await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.markdownLinks), ['https://example.com']);
    assert.equal(await page.locator('#markdown [onclick], #markdown [onerror], #markdown script, #markdown img[src], #markdown .ui-dialog').count(), 0);
    assert.equal(await page.locator('#markdown a[href^="javascript:"]').count(), 0);
    assert.equal(await page.evaluate(() => window.customContracts.pwned), undefined);
    assert.ok((await page.evaluate(() => window.customContracts.records.markdownRendered)).some(source => source.includes('[Unsafe link]')));
    console.log('STEP code/diff/markdown contracts passed');

    const scrollViewport = page.getByRole('region', { name: 'Keyboard scroll fixture', exact: true });
    await scrollViewport.focus();
    await page.keyboard.press('End');
    await page.waitForFunction(() => {
        const viewport = document.querySelector('#scroll-area .ui-scroll-viewport');
        return viewport && viewport.scrollTop === viewport.scrollHeight - viewport.clientHeight;
    });
    await page.waitForFunction(() => window.customContracts.records.scrollEvents.length > 0);
    const keyboardScroll = await page.evaluate(() => window.customContracts.records.scrollEvents.at(-1));
    assert.ok(Number.isFinite(keyboardScroll.scrollTop) && Number.isFinite(keyboardScroll.scrollLeft));
    assert.ok(keyboardScroll.scrollTop > 0);
    const scrollEventCount = await page.evaluate(() => window.customContracts.records.scrollEvents.length);
    await page.evaluate(() => window.customContracts.scrollAreaRef.value.scrollTo({ top: 50, behavior: 'auto' }));
    await page.waitForFunction(() => Math.abs(document.querySelector('#scroll-area .ui-scroll-viewport')?.scrollTop - 50) < 2);
    await page.waitForFunction(previous => {
        const events = window.customContracts.records.scrollEvents;
        return events.length > previous && Math.abs(events.at(-1).scrollTop - 50) < 2;
    }, scrollEventCount);
    await page.evaluate(() => window.customContracts.scrollAreaRef.value.focus());
    assert.equal(await scrollViewport.evaluate(element => element === document.activeElement), true);
    console.log('STEP scroll contracts passed');

    await page.evaluate(() => {
        window.customContracts.confirmDialog({ title: 'Escape confirmation', message: 'Escape should cancel this request', confirmText: 'Accept', cancelText: 'Decline' }).then(value => window.customContracts.records.confirmResults.push({ id: 'escape', value }));
    });
    console.log('STEP escape confirmation requested');
    let dialog = page.getByRole('alertdialog', { name: 'Escape confirmation', exact: true });
    await dialog.waitFor();
    console.log('STEP escape confirmation opened');
    await page.keyboard.press('Escape');
    console.log('STEP escape key sent');
    await dialog.waitFor({ state: 'hidden' });
    console.log('STEP escape confirmation closed');
    await page.waitForFunction(() => window.customContracts.records.confirmResults.some(result => result.id === 'escape'));
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.confirmResults[0]), { id: 'escape', value: false });

    await page.evaluate(() => {
        window.customContracts.confirmDialog({ title: 'Pending host cleanup', message: 'Unmount should resolve false' }).then(value => window.customContracts.records.confirmResults.push({ id: 'unmount', value }));
    });
    await page.getByRole('alertdialog', { name: 'Pending host cleanup', exact: true }).waitFor();
    console.log('STEP pending confirmation opened');
    await page.evaluate(() => { window.customContracts.state.confirmHostMounted = false; });
    await page.waitForFunction(() => window.customContracts.records.confirmResults.some(result => result.id === 'unmount'));
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.confirmResults.at(-1)), { id: 'unmount', value: false });
    await page.evaluate(() => { window.customContracts.state.confirmHostMounted = true; });
    await page.waitForTimeout(50);

    await page.evaluate(() => {
        window.customContracts.confirmDialog({ title: 'Queue first', message: 'First queued request', confirmText: 'Accept' }).then(value => window.customContracts.records.confirmResults.push({ id: 'first', value }));
        window.customContracts.confirmDialog({ title: 'Queue second', message: 'Second queued request', confirmText: 'Accept' }).then(value => window.customContracts.records.confirmResults.push({ id: 'second', value }));
    });
    console.log('STEP queued confirmations requested');
    dialog = page.getByRole('alertdialog', { name: 'Queue first', exact: true });
    await dialog.waitFor();
    console.log('STEP first queued confirmation opened');
    await dialog.getByRole('button', { name: 'Accept', exact: true }).click();
    await page.getByRole('alertdialog', { name: 'Queue second', exact: true }).waitFor();
    console.log('STEP second queued confirmation opened');
    await page.getByRole('alertdialog', { name: 'Queue second', exact: true }).getByRole('button', { name: 'Accept', exact: true }).click();
    await page.waitForFunction(() => window.customContracts.records.confirmResults.length === 4);
    console.log('STEP queued confirmations resolved');
    assert.deepEqual(await page.evaluate(() => window.customContracts.records.confirmResults.slice(2)), [{ id: 'first', value: true }, { id: 'second', value: true }]);
    console.log('STEP confirm host contracts passed');

    await page.evaluate(() => window.customContracts.snackbar.show('Focus-paused alert', { duration: 240, tone: 'error' }));
    const notice = page.getByRole('alert').filter({ hasText: 'Focus-paused alert' });
    await notice.waitFor();
    const closeNotice = notice.getByRole('button');
    await closeNotice.focus();
    await page.waitForTimeout(400);
    assert.equal(await notice.isVisible(), true, 'keyboard focus pauses the service timer');
    await page.keyboard.press('Tab');
    await notice.waitFor({ state: 'detached', timeout: 3000 });
    await page.evaluate(() => window.customContracts.snackbar.show('Persistent host cleanup', { duration: 0 }));
    await page.getByRole('status').filter({ hasText: 'Persistent host cleanup' }).waitFor();
    await page.evaluate(() => { window.customContracts.state.snackbarHostMounted = false; });
    await page.waitForFunction(() => !document.querySelector('.ui-snackbar-stack .ui-snackbar'));
    await page.evaluate(() => { window.customContracts.state.snackbarHostMounted = true; });
    await page.waitForTimeout(100);
    assert.equal(await page.getByText('Persistent host cleanup', { exact: true }).count(), 0, 'host unmount clears persistent notices before remount');
    console.log('STEP snackbar host contracts passed');

    await page.evaluate(() => { window.customContracts.state.transitionVisible = false; });
    await page.waitForFunction(() => !document.querySelector('#transition-child'), null, { timeout: 4000 });
    console.log('STEP transition contracts passed');

    const sourceHashes = {};
    for (const files of Object.values(components)) {
        for (const file of files) {
            if (sourceHashes[file]) continue;
            const bytes = await readFile(path.resolve(file));
            sourceHashes[file] = createHash('sha256').update(bytes).digest('hex');
        }
    }
    assert.deepEqual(pageErrors, [], `browser page errors: ${pageErrors.join('\n')}`);
    assert.deepEqual(vueDiagnostics, [], `Vue diagnostics: ${JSON.stringify(vueDiagnostics)}`);
    assert.equal(viteWarnings.filter(message => /Vue warn|failed to resolve component/i.test(message)).length, 0, viteWarnings.join('\n'));
    await page.evaluate(() => window.customContracts.setClipboardWriter(null));

    const report = {
        passed: true,
        test: 'tests/desktop/custom-contracts.mjs',
        publicEntry: 'src/ui/index.ts',
        evidenceDirectory: relative,
        browserErrors: pageErrors,
        vueDiagnostics,
        viteWarnings: viteWarnings.filter(message => /Vue warn|failed to resolve component/i.test(message)),
        coverage: Object.fromEntries(Object.entries(coverage).map(([name, assertions]) => [name, { assertions, sourceFiles: components[name].map(file => ({ path: file, sha256: sourceHashes[file] })) }])),
        assertions: [
            'copy event payload and clipboard writer are asynchronous and activation-time; failure emits error; disabled blocks write; unmount clears reset timer',
            'message action and activity/file events follow native keyboard activation; disabled actions remain inert',
            'confirmDialog escape/queue/unmount outcomes settle after host close lifecycle',
            'snackbar service host pauses on focus, resumes on focus exit, and clears persistent queue on unmount',
            'markdown public entry strips hostile HTML/URLs and emits safe link-click/rendered events',
            'scroll area exposes focus/scrollTo and emits scroll offsets; keyboard End scrolls the viewport',
            'code block preserves source text for copy without parsing embedded markup; Code tag/slot semantics',
            'activity/diff/usage/spinner/progress/transition public behavior and accessibility state'
        ]
    };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    console.log('PASS custom public component contracts: ' + evidence);
} finally {
    await appProcess.close();
    await server.close();
}

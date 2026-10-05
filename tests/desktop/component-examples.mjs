import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pages } from '../../src/ui/docs/content.js';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'component-examples-'));
const manifest = JSON.parse(await readFile('src/ui/docs/componentExampleManifest.json', 'utf8'));
const pageErrors = [];
const vueWarnings = [];
const otherConsoleErrors = [];
const visitedRoutes = [];
const visitedManifest = new Set();
const screenshots = [];
let currentRoute = 'startup';

const server = await preview({
    build: { outDir: path.resolve('dist/docs') },
    preview: { host: '127.0.0.1', port: 0, strictPort: false }
});

let app;
try {
    const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile') };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.UAH_DEV_URL;
    env.UAH_UI_PREVIEW_URL = `${server.resolvedUrls.local[0]}index.html`;
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    const page = await app.firstWindow();
    page.on('pageerror', (error) => pageErrors.push(`${currentRoute}: ${error.message}`));
    page.on('console', (message) => {
        const text = message.text();
        if (/\[Vue warn\]|Vue warn|Failed to resolve component|Failed to resolve directive|Property .* (?:was accessed|is not defined)|is not defined on instance/i.test(text)) {
            vueWarnings.push(`${currentRoute}: ${text}`);
        }
        if (message.type() === 'error') otherConsoleErrors.push(`${currentRoute}: ${text}`);
    });

    async function openDoc(doc) {
        currentRoute = doc.id;
        await page.goto(`${server.resolvedUrls.local[0]}index.html#/${doc.id}`);
        await page.getByRole('heading', { name: new RegExp(doc.title), level: 1 }).waitFor({ timeout: 10000 });
        visitedRoutes.push(doc.id);
    }

    for (const doc of pages) {
        await openDoc(doc);
        if (doc.kind !== 'component') continue;
        assert.ok(doc.examples?.length, `${doc.id}: component pages must have examples`);
        assert.equal(await page.locator('.docs-example').count(), doc.examples.length, `${doc.id}: every example card should render`);
        for (const example of doc.examples) {
            await page.locator(`.docs-example[aria-labelledby="${example.id}-heading"]`).waitFor({ state: 'attached', timeout: 10000 });
        }
        const entry = manifest.find((item) => item.name === doc.name);
        if (entry) {
            assert.ok(doc.examples.some((example) => example.id === entry.example), `${doc.id}: manifest example ${entry.example} must be linked from the page`);
            const card = page.locator(`.docs-example[aria-labelledby="${entry.example}-heading"]`);
            const marker = card.locator(`[data-demo-component="${entry.name}"]`);
            await marker.first().waitFor({ state: 'attached', timeout: 10000 });
            assert.ok(await marker.count() > 0, `${doc.id}: real example must render its ${entry.name} marker`);
            visitedManifest.add(entry.name);
        }
    }
    assert.deepEqual([...visitedManifest].sort(), manifest.map((entry) => entry.name).sort(), 'all manifest examples must be visited exactly through their component pages');

    const isolatedInputs = new Set([
        'UNumberInput', 'UColorInput', 'USlider', 'URangeSlider', 'UOtpInput',
        'URating', 'UFileInput', 'UFileUpload', 'UColorPicker'
    ]);
    for (const name of isolatedInputs) {
        const doc = pages.find((candidate) => candidate.kind === 'component' && candidate.name === name);
        assert.ok(doc, `${name} must have its own documentation route`);
        await openDoc(doc);
        const markers = await page.locator('[data-demo-component]').evaluateAll((elements) => elements.map((element) => element.getAttribute('data-demo-component')));
        const siblings = markers.filter((marker) => isolatedInputs.has(marker) && marker !== name);
        assert.deepEqual(siblings, [], `${doc.id}: dedicated ${name} page should not mount sibling input demos`);
    }

    async function setTheme(dark) {
        const toggle = page.getByRole('checkbox', { name: '深色主题', exact: true });
        if (dark) await toggle.check();
        else await toggle.uncheck();
        await page.waitForTimeout(220);
    }

    async function setWindow(width, height) {
        await app.evaluate(({ BrowserWindow }, { width, height }) => {
            const window = BrowserWindow.getAllWindows()[0];
            window.webContents.setZoomFactor(1);
            window.setSize(width, height);
        }, { width, height });
        await page.waitForTimeout(150);
    }

    async function capture(name) {
        await page.evaluate(async () => {
            await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        await page.waitForTimeout(150);
        const data = await app.evaluate(async ({ BrowserWindow }) => (await BrowserWindow.getAllWindows()[0].capturePage()).toDataURL());
        await writeFile(path.join(evidence, name), Buffer.from(data.split(',')[1], 'base64'));
        screenshots.push(name);
    }

    const screenshotExamples = ['UNumberInput', 'UOtpInput', 'USlider'];
    for (const name of screenshotExamples) {
        const entry = manifest.find((item) => item.name === name);
        const doc = pages.find((candidate) => candidate.kind === 'component' && candidate.name === name);
        await openDoc(doc);
        for (const theme of ['light', 'dark']) {
            await setTheme(theme === 'dark');
            await setWindow(1280, 1100);
            await capture(`${entry.example}-${theme}-1280x1100.png`);
            await setWindow(390, 844);
            await capture(`${entry.example}-${theme}-390x844.png`);
        }
    }

    assert.deepEqual(pageErrors, [], `documentation routes should not throw: ${pageErrors.join('\n')}`);
    assert.deepEqual(vueWarnings, [], `documentation routes should not emit Vue missing/undefined warnings: ${vueWarnings.join('\n')}`);
    const report = {
        status: 'passed',
        routes: pages.length,
        visitedRoutes,
        manifestExamples: manifest.length,
        visitedManifestExamples: [...visitedManifest].sort(),
        isolatedInputs: [...isolatedInputs],
        screenshots,
        pageErrors,
        vueWarnings,
        otherConsoleErrors
    };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ routes: pages.length, visitedRoutes: visitedRoutes.length, manifestExamples: manifest.length, visitedManifestExamples: visitedManifest.size, isolatedInputs: isolatedInputs.size, screenshots: screenshots.length, evidence, otherConsoleErrors }, null, 2));
} catch (error) {
    const report = {
        status: 'failed',
        failure: error instanceof Error ? error.stack : String(error),
        routes: pages.length,
        visitedRoutes,
        manifestExamples: manifest.length,
        visitedManifestExamples: [...visitedManifest].sort(),
        isolatedInputs: ['UNumberInput', 'UColorInput', 'USlider', 'URangeSlider', 'UOtpInput', 'URating', 'UFileInput', 'UFileUpload', 'UColorPicker'],
        screenshots,
        pageErrors,
        vueWarnings,
        otherConsoleErrors
    };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2));
    throw error;
} finally {
    if (app) await app.close();
    await new Promise((resolve) => server.httpServer.close(resolve));
}

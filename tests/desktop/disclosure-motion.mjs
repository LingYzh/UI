import { _electron as electron } from 'playwright';
import { preview } from 'vite';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import { pages } from '../../src/ui/docs/content.js';

await mkdir('artifacts', { recursive: true });
const evidence = await mkdtemp(path.resolve('artifacts', 'disclosure-motion-'));
const manifest = JSON.parse(await readFile('src/ui/docs/componentExampleManifest.json', 'utf8'));
const server = await preview({ build: { outDir: path.resolve('dist/docs') }, preview: { host: '127.0.0.1', port: 0, strictPort: false } });
const baseUrl = `${server.resolvedUrls.local[0]}index.html`;
const env = { ...process.env, UAH_DATA_DIR: path.join(evidence, 'profile'), UAH_UI_PREVIEW_URL: baseUrl };
delete env.ELECTRON_RUN_AS_NODE;
delete env.UAH_DEV_URL;

let app;
let page;
let currentRoute = 'startup';
const passed = [];
const pageErrors = [];
const vueWarnings = [];
const screenshots = [];

try {
    app = await electron.launch({ args: ['tests/desktop/ui-host.cjs'], cwd: process.cwd(), env });
    page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(10000);
    page.on('pageerror', error => pageErrors.push(`${currentRoute}: ${error.message}`));
    page.on('console', message => {
        const text = message.text();
        if (/\[Vue warn\]|Vue warn|Failed to resolve component|Failed to resolve directive|Property .* (?:was accessed|is not defined)|is not defined on instance/i.test(text)) {
            vueWarnings.push(`${currentRoute}: ${text}`);
        }
    });
    await page.locator('.docs-shell').waitFor();
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    async function setWindow(width, height) {
        await app.evaluate(({ BrowserWindow }, size) => {
            const window = BrowserWindow.getAllWindows()[0];
            window.webContents.setZoomFactor(1);
            window.setContentSize(size.width, size.height);
        }, { width, height });
        await page.waitForFunction(size => Math.abs(innerWidth - size.width) <= 1 && Math.abs(innerHeight - size.height) <= 1, { width, height }, { timeout: 10000 });
    }

    async function setTheme(theme) {
        const toggle = page.getByRole('checkbox', { name: '深色主题', exact: true });
        const checked = await toggle.isChecked();
        if ((theme === 'dark') !== checked) {
            if (theme === 'dark') await toggle.check();
            else await toggle.uncheck();
        }
        await page.waitForFunction(expected => document.documentElement.dataset.theme === expected, theme, { timeout: 10000 });
        await page.waitForFunction(() => ![...document.head.querySelectorAll('style')].some(style => style.textContent.includes('@keyframes ui-theme-reveal')), null, { timeout: 10000 });
        await page.waitForTimeout(180);
    }

    async function openExample(name, exampleId) {
        const doc = pages.find(candidate => candidate.kind === 'component' && candidate.name === name);
        assert.ok(doc, `component page exists for ${name}`);
        const entry = manifest.find(candidate => candidate.name === name);
        const chosenExample = exampleId ?? entry?.example ?? doc.examples?.find(example => example.id.startsWith('component-'))?.id ?? doc.examples?.[0]?.id;
        assert.ok(chosenExample, `${name} has a live example`);
        currentRoute = doc.id;
        await page.goto(`${baseUrl}#/${doc.id}`);
        await page.locator('.docs-page-heading h1').waitFor({ state: 'visible' });
        const card = page.locator(`.docs-example[aria-labelledby="${chosenExample}-heading"]`);
        await card.waitFor({ state: 'attached' });
        const live = card.locator('.live-example');
        await live.waitFor({ state: 'visible' });
        return live;
    }

    async function setManualReduced(value) {
        const live = await openExample('UTransition');
        const toggle = live.getByRole('checkbox', { name: '减少动态效果', exact: true });
        if (value) await toggle.check();
        else await toggle.uncheck();
        await page.waitForFunction(expected => document.documentElement.dataset.reducedMotion === String(expected), value, { timeout: 10000 });
    }

    async function frame() {
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }

    async function activeMotion(locator) {
        await frame();
        return locator.evaluate(element => element.getAnimations({ subtree: true })
            .filter(animation => animation.playState === 'running' && animation.effect)
            .map(animation => ({
                duration: animation.effect.getTiming().duration,
                easing: animation.effect.getTiming().easing,
                transitionProperty: animation.transitionProperty ?? '',
                animationName: animation.animationName ?? '',
                keyframes: animation.effect.getKeyframes()
            })));
    }

    async function assertMotion(locator, label, duration) {
        const motions = await activeMotion(locator);
        assert.ok(motions.length, `${label}: a real browser animation is running`);
        if (duration !== undefined) {
            assert.ok(motions.some(motion => typeof motion.duration === 'number' && Math.abs(motion.duration - duration) <= 2),
                `${label}: expected ${duration}ms motion, got ${JSON.stringify(motions.map(motion => motion.duration))}`);
        }
        return motions;
    }

    async function waitMotionEnd(locator, label) {
        const handle = await locator.elementHandle();
        assert.ok(handle, `${label}: animation target remains mounted while motion settles`);
        await page.waitForFunction(element => !element.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'), handle, { timeout: 10000 });
    }

    async function assertNoMotion(locator, label) {
        await frame();
        const motions = await activeMotion(locator);
        assert.deepEqual(motions, [], `${label}: reduced or disabled motion is immediate`);
    }

    async function assertOverlappingPanels(container, selector, label) {
        const metrics = await container.evaluate((element, childSelector) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
            const heights = [...element.querySelectorAll(childSelector)]
                .map(child => child.getBoundingClientRect().height)
                .filter(height => height > 1);
            return { height: rect.height, contentHeight: rect.height - padding, padding, heights };
        }, selector);
        assert.ok(metrics.heights.length >= 2, `${label}: both transitioning panels are mounted in the same frame, got ${JSON.stringify(metrics)}`);
        const sum = metrics.heights.reduce((total, height) => total + height, 0);
        const tallest = Math.max(...metrics.heights);
        assert.ok(metrics.contentHeight < sum - 8, `${label}: content area does not stack both panel heights: ${JSON.stringify(metrics)}`);
        assert.ok(metrics.contentHeight <= tallest + 2, `${label}: content area follows the tallest overlapping panel: ${JSON.stringify(metrics)}`);
    }

    async function armDialogAnimationPause(dialog) {
        await dialog.evaluate(element => {
            delete element.__disclosureMotion;
            const onStart = event => {
                if (event.target !== element || event.pseudoElement) return;
                const animation = element.getAnimations().find(candidate => candidate.animationName === event.animationName);
                if (!animation) return;
                const duration = Number(animation.effect?.getTiming().duration);
                if (!Number.isFinite(duration) || duration <= 0) return;
                animation.pause();
                animation.currentTime = duration / 2;
                element.__disclosureMotion = { animation, duration, name: event.animationName };
                element.removeEventListener('animationstart', onStart);
            };
            element.addEventListener('animationstart', onStart);
        });
    }

    async function waitForPausedDialogAnimation(dialog, state, label, expectedDuration) {
        const handle = await dialog.elementHandle();
        assert.ok(handle, `${label}: dialog is mounted`);
        await page.waitForFunction(({ element, expectedState }) => element.dataset.state === expectedState && element.__disclosureMotion?.animation.playState === 'paused', { element: handle, expectedState: state }, { timeout: 10000 });
        const motion = await dialog.evaluate(element => ({
            name: element.__disclosureMotion.name,
            duration: element.__disclosureMotion.duration,
            currentTime: element.__disclosureMotion.animation.currentTime,
            playState: element.__disclosureMotion.animation.playState
        }));
        if (expectedDuration !== undefined) assert.ok(Math.abs(motion.duration - expectedDuration) <= 2, `${label}: expected ${expectedDuration}ms animation, got ${JSON.stringify(motion)}`);
        assert.equal(motion.playState, 'paused');
        assert.ok(motion.currentTime > 0 && motion.currentTime < motion.duration, `${label}: captured a true intermediate frame ${JSON.stringify(motion)}`);
        return motion;
    }

    async function resumeDialogAnimation(dialog) {
        await dialog.evaluate(element => element.__disclosureMotion.animation.play());
    }

    async function pauseRunningTransitions(target, label) {
        const motions = await target.evaluate(element => {
            const running = element.getAnimations({ subtree: true })
                .filter(animation => animation.playState === 'running' && animation.transitionProperty);
            for (const animation of running) {
                const duration = Number(animation.effect?.getTiming().duration);
                animation.pause();
                if (Number.isFinite(duration) && duration > 0) animation.currentTime = duration / 2;
            }
            element.__disclosureTransitions = running;
            return running.map(animation => ({ property: animation.transitionProperty, duration: animation.effect?.getTiming().duration, playState: animation.playState }));
        });
        assert.ok(motions.length, `${label}: CSS transitions are paused at an intermediate frame`);
        assert.ok(motions.every(motion => motion.playState === 'paused'), `${label}: captured motion is paused: ${JSON.stringify(motions)}`);
        return motions;
    }

    async function resumeRunningTransitions(target) {
        await target.evaluate(element => {
            for (const animation of element.__disclosureTransitions ?? []) animation.play();
            delete element.__disclosureTransitions;
        });
    }

    async function capture(name, width, height) {
        await page.evaluate(async () => {
            const active = document.getAnimations().filter(animation => animation.playState === 'running' && Number.isFinite(animation.effect?.getTiming().duration));
            await Promise.race([Promise.allSettled(active.map(animation => animation.finished)), new Promise(resolve => setTimeout(resolve, 600))]);
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const theme = name.includes('-dark-') ? 'dark' : 'light';
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme, `${name}: screenshot theme matches its name`);
        const captured = await app.evaluate(async ({ BrowserWindow }) => {
            const window = BrowserWindow.getAllWindows()[0];
            const image = await window.webContents.capturePage();
            return { png: image.toPNG().toString('base64'), size: window.getContentSize() };
        });
        const png = Buffer.from(captured.png, 'base64');
        assert.deepEqual(captured.size, [width, height], `${name}: Electron content size`);
        assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [width, height], `${name}: native capture dimensions`);
        await writeFile(path.join(evidence, `${name}.png`), png);
        screenshots.push(name);
    }

    async function captureDisclosure(name, live) {
        await live.scrollIntoViewIfNeeded();
        for (const [theme, width, height] of [['light', 1440, 900], ['dark', 1440, 900], ['light', 390, 844], ['dark', 390, 844]]) {
            await setWindow(width, height);
            await setTheme(theme);
            await capture(`${name}-${theme}-${width}x${height}`, width, height);
        }
        await setWindow(1440, 900);
        await setTheme('light');
    }

    async function listGroupMotion() {
        const live = await openExample('UListGroup');
        const trigger = live.locator('.ui-list-group-header').filter({ hasText: '配置' }).first();
        const group = trigger.locator('xpath=ancestor::div[contains(concat(" ",normalize-space(@class)," ")," ui-list-group ")][1]');
        const collapse = group.locator(':scope > .ui-collapse');
        // aria-hidden removes collapsed descendants from the accessibility tree, but the slot stays mounted.
        const field = group.locator('input').first();
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        assert.equal(await collapse.evaluate(element => element.inert), true, 'collapsed list-group content is inert immediately');
        assert.equal(await trigger.locator('svg path').getAttribute('d'), mdiChevronDown, 'default group uses the MDI chevron-down path');

        await trigger.focus();
        await page.keyboard.press('Space');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true', 'Space opens the group and keeps native button interaction');
        const opening = await assertMotion(collapse, 'list-group opening');
        const properties = opening.map(motion => motion.transitionProperty);
        assert.ok(properties.includes('grid-template-rows'), `list-group animates its height: ${JSON.stringify(properties)}`);
        assert.ok(properties.includes('opacity'), `list-group animates opacity: ${JSON.stringify(properties)}`);
        const icon = trigger.locator('.ui-disclosure-icon');
        assert.ok(await icon.evaluate(element => getComputedStyle(element).transform !== 'none'), 'expanded group arrow rotates');
        await waitMotionEnd(collapse, 'list-group opening');
        assert.equal(await collapse.evaluate(element => element.inert), false);

        await field.fill('保留的分组草稿');
        await trigger.click();
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        assert.equal(await collapse.evaluate(element => element.inert), true, 'closing group becomes inert before its visual exit finishes');
        await assertMotion(collapse, 'list-group closing');
        await waitMotionEnd(collapse, 'list-group closing');
        assert.equal(await field.count(), 1, 'collapse preserves the mounted field');
        assert.equal(await field.inputValue(), '保留的分组草稿');
        await trigger.focus();
        await page.keyboard.press('Enter');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
        await waitMotionEnd(collapse, 'list-group reopen');
        assert.equal(await field.inputValue(), '保留的分组草稿');

        const nested = live.locator('.ui-list-group-header').filter({ hasText: '高级配置' });
        await nested.focus();
        await page.keyboard.press('Space');
        assert.equal(await nested.getAttribute('aria-expanded'), 'true', 'nested group responds to keyboard activation');
        const nestedGroup = nested.locator('xpath=ancestor::div[contains(concat(" ",normalize-space(@class)," ")," ui-list-group ")][1]');
        await waitMotionEnd(nestedGroup.locator(':scope > .ui-collapse'), 'nested list-group open');

        const custom = live.getByRole('button', { name: '自定义分组触发器', exact: true });
        assert.equal(await custom.locator('svg path').getAttribute('d'), mdiChevronDown, 'custom activator can render the same MDI arrow');
        await custom.focus();
        await page.keyboard.press('Enter');
        assert.equal(await custom.getAttribute('aria-expanded'), 'true', 'custom activator receives the group disclosure props');
        const customGroup = custom.locator('xpath=ancestor::div[contains(concat(" ",normalize-space(@class)," ")," ui-list-group ")][1]');
        await waitMotionEnd(customGroup.locator(':scope > .ui-collapse'), 'custom list-group open');
        const disabled = live.locator('.ui-list-group-header').filter({ hasText: '禁用分组' });
        assert.equal(await disabled.isDisabled(), true, 'disabled group cannot activate');

        await live.getByRole('button', { name: '展开全部', exact: true }).click();
        await waitMotionEnd(live.locator('[data-demo-component="UListGroup"]'), 'expand all groups');
        await captureDisclosure('list-group-expanded', live);
        passed.push('ListGroup uses MDI disclosure icons, animates height/opacity/arrow, becomes inert on close, preserves field state, and supports nested/custom keyboard activators');
    }

    async function transitionMotion() {
        const live = await openExample('UTransition');
        const toggle = live.getByRole('button', { name: '切换展开', exact: true });
        const add = live.getByRole('button', { name: '增加内容', exact: true });
        const disabled = live.getByRole('checkbox', { name: '禁用过渡', exact: true });
        const reduced = live.getByRole('checkbox', { name: '减少动态效果', exact: true });
        const panel = live.locator('.completion-panel');
        // Read the retained native input even while the leaving panel is aria-hidden.
        const input = panel.locator('input').first();
        assert.equal(await panel.isVisible(), true);
        const original = await panel.evaluate(element => ({ height: element.getBoundingClientRect().height, overflow: element.style.overflow, minHeight: element.style.minHeight }));
        assert.equal(original.overflow, 'visible');
        assert.equal(original.minHeight, '72px');
        await input.fill('扩展草稿');

        await toggle.click();
        const closing = await assertMotion(panel, 'UTransition expand close', 240);
        const expand = closing.find(motion => Math.abs(Number(motion.duration) - 240) <= 2);
        assert.match(expand.easing, /cubic-bezier/i, 'expand motion uses the shared ease token');
        for (const key of ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']) {
            assert.ok(expand.keyframes.some(frame => Object.hasOwn(frame, key)), `expand keyframes include ${key}`);
        }
        assert.equal(await panel.evaluate(element => element.inert), true, 'leaving expand content is immediately inert');
        assert.equal(await panel.evaluate(element => element.style.minHeight), '0px', 'animation neutralizes min-height while measuring');
        await waitMotionEnd(panel, 'UTransition expand close');
        assert.equal(await panel.isVisible(), false);
        assert.deepEqual(await panel.evaluate(element => ({ height: element.style.height, overflow: element.style.overflow, minHeight: element.style.minHeight })), { height: '', overflow: 'visible', minHeight: '72px' }, 'expand cleanup restores inline sizing after close');
        assert.equal(await input.inputValue(), '扩展草稿', 'v-show retains input state');

        await toggle.click();
        await assertMotion(panel, 'UTransition expand reopen', 240);
        await waitMotionEnd(panel, 'UTransition expand reopen');
        assert.equal(await panel.evaluate(element => element.inert), false);

        const beforeResize = await panel.evaluate(element => element.getBoundingClientRect().height);
        await toggle.click();
        await assertMotion(panel, 'UTransition rapid close');
        await page.waitForTimeout(55);
        await add.click();
        await toggle.click();
        const reversed = await assertMotion(panel, 'UTransition rapid reverse', 240);
        assert.ok(reversed.length, 'reversal starts from its current animated geometry');
        await waitMotionEnd(panel, 'UTransition rapid reverse');
        const afterResize = await panel.evaluate(element => ({ height: element.getBoundingClientRect().height, scrollHeight: element.scrollHeight, styleHeight: element.style.height, overflow: element.style.overflow, minHeight: element.style.minHeight }));
        assert.ok(afterResize.height > beforeResize + 12, `new content increases final size: ${beforeResize} -> ${afterResize.height}`);
        assert.equal(afterResize.styleHeight, '', 'completed animation leaves no inline height');
        assert.equal(afterResize.overflow, 'visible');
        assert.equal(afterResize.minHeight, '72px');
        assert.equal(await input.inputValue(), '扩展草稿');

        await disabled.check();
        await toggle.click();
        await assertNoMotion(panel, 'disabled UTransition');
        assert.equal(await panel.isVisible(), false, 'disabled transition updates display without waiting');
        assert.deepEqual(await panel.evaluate(element => ({ height: element.style.height, overflow: element.style.overflow, minHeight: element.style.minHeight })), { height: '', overflow: 'visible', minHeight: '72px' });
        await toggle.click();
        assert.equal(await panel.isVisible(), true);
        await disabled.uncheck();

        if (await reduced.isChecked()) await reduced.uncheck();
        await reduced.check();
        await page.waitForFunction(() => document.documentElement.dataset.reducedMotion === 'true', null, { timeout: 10000 });
        await toggle.click();
        await assertNoMotion(panel, 'manual reduced motion');
        assert.equal(await panel.isVisible(), false);
        await toggle.click();
        await assertNoMotion(panel, 'manual reduced motion reopen');
        assert.equal(await panel.isVisible(), true);
        await reduced.uncheck();
        await page.waitForFunction(() => document.documentElement.dataset.reducedMotion === 'false', null, { timeout: 10000 });

        await toggle.click();
        await assertMotion(panel, 'motion before live system reduction', 240);
        await page.waitForTimeout(45);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(element => !element.getAnimations().some(animation => animation.playState === 'running'), await panel.elementHandle(), { timeout: 10000 });
        assert.equal(await panel.isVisible(), false, 'switching to system reduced motion completes the in-flight leave');
        assert.deepEqual(await panel.evaluate(element => ({ height: element.style.height, overflow: element.style.overflow, minHeight: element.style.minHeight })), { height: '', overflow: 'visible', minHeight: '72px' });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await toggle.click();
        await assertMotion(panel, 'full motion restored', 240);
        await waitMotionEnd(panel, 'full motion restored');
        passed.push('UTransition expand measures padded/bordered/min-height content, reverses smoothly, tracks content growth, cleans styles, and honors disabled/manual/system reduced motion including live cancellation');
    }

    async function treeviewMotion() {
        const live = await openExample('UTreeview');
        const tree = live.getByRole('tree');
        // Keep a DOM locator for branches while TransitionGroup marks leaving rows aria-hidden/inert.
        const row = title => tree.locator('.ui-treeview-item').filter({ hasText: title }).first();
        const root = row('组件库');
        const rootToggle = root.locator('.ui-treeview-toggle');
        const form = row('表单控件');
        assert.equal(await root.getAttribute('aria-expanded'), 'true');
        assert.equal(await rootToggle.locator('svg path').getAttribute('d'), mdiChevronRight, 'tree disclosure uses the MDI chevron-right path');

        await rootToggle.click();
        assert.equal(await root.getAttribute('aria-expanded'), 'false');
        assert.deepEqual(await form.evaluate(element => ({ inert: Boolean(element.closest('[inert]')), ariaHidden: element.closest('[aria-hidden="true"]') !== null })), { inert: true, ariaHidden: true }, 'leaving tree descendants are removed from interaction and accessibility immediately');
        await assertMotion(tree, 'Treeview branch collapse', 240);
        await waitMotionEnd(tree, 'Treeview branch collapse');
        assert.equal(await row('表单控件').count(), 0, 'collapsed descendants leave after their height animation');

        await rootToggle.click();
        await assertMotion(tree, 'Treeview branch expand', 240);
        await waitMotionEnd(tree, 'Treeview branch expand');
        assert.equal(await form.count(), 1);
        assert.equal(await form.getAttribute('aria-hidden'), null, 're-entered rows are accessible');

        await form.focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await form.getAttribute('aria-expanded'), 'true', 'ArrowRight expands a closed tree branch');
        await assertMotion(tree, 'Treeview nested branch expand', 240);
        await waitMotionEnd(tree, 'Treeview nested branch expand');
        const inputRow = row('输入与选择');
        assert.equal(await inputRow.count(), 1);
        await form.focus();
        await page.keyboard.press('ArrowDown');
        assert.equal(await inputRow.evaluate(element => element === document.activeElement), true, 'ArrowDown follows flat visible tree order');
        await page.keyboard.press('Space');
        assert.equal(await inputRow.getAttribute('aria-selected'), 'true', 'Space updates tree selection');
        assert.equal(await inputRow.locator('input[type=checkbox]').isChecked(), true);
        await inputRow.focus();
        await page.keyboard.press('ArrowUp');
        assert.equal(await form.evaluate(element => element === document.activeElement), true, 'ArrowUp returns to the previous visible tree item');
        await form.focus();
        await page.keyboard.press('ArrowLeft');
        assert.equal(await form.getAttribute('aria-expanded'), 'false', 'ArrowLeft collapses an open branch');
        await waitMotionEnd(tree, 'Treeview keyboard collapse');
        await page.keyboard.press('ArrowLeft');
        assert.equal(await root.evaluate(element => element === document.activeElement), true, 'ArrowLeft from a closed branch focuses its parent');

        await form.focus();
        await page.keyboard.press('ArrowRight');
        await waitMotionEnd(tree, 'Treeview keyboard reopen');
        await root.focus();
        await page.keyboard.press('ArrowLeft');
        await assertMotion(tree, 'Treeview root keyboard collapse', 240);
        await waitMotionEnd(tree, 'Treeview root keyboard collapse');
        await root.focus();
        await page.keyboard.press('ArrowRight');
        await waitMotionEnd(tree, 'Treeview root keyboard reopen');
        await form.focus();
        await page.keyboard.press('ArrowRight');
        await waitMotionEnd(tree, 'Treeview deep branch reopen');

        await setWindow(1440, 900);
        await setTheme('light');
        await capture('treeview-expanded-light-1440x900', 1440, 900);
        await setTheme('dark');
        await capture('treeview-expanded-dark-1440x900', 1440, 900);
        await setWindow(390, 844);
        await setTheme('light');
        await capture('treeview-expanded-light-390x844', 390, 844);
        await setTheme('dark');
        await capture('treeview-expanded-dark-390x844', 390, 844);
        await setWindow(1440, 900);
        await setTheme('light');
        passed.push('Treeview renders MDI chevrons, animates flat branch entry/exit with inert leaving rows, and preserves keyboard navigation and selection');
    }

    async function overlayMotion(name, openerName, closeName, expectedOpenDuration) {
        const screenshotSize = name === 'UBottomSheet' ? [390, 844] : [1440, 900];
        const screenshotTheme = name === 'UBottomSheet' ? 'dark' : 'light';
        await setWindow(...screenshotSize);
        await setTheme(screenshotTheme);
        const live = await openExample(name);
        const opener = live.getByRole('button', { name: openerName, exact: true });
        const dialog = live.locator('dialog.ui-overlay');
        const previousOverflow = await page.evaluate(() => document.body.style.overflow);
        await opener.focus();
        await armDialogAnimationPause(dialog);
        await page.keyboard.press('Enter');
        const opening = await waitForPausedDialogAnimation(dialog, 'opening', `${name} opening`, expectedOpenDuration);
        assert.ok(opening.name.includes('dialog') || opening.name.includes('sheet'), `${name} uses its native dialog/sheet keyframes`);
        assert.equal(await dialog.evaluate(element => element.open), true);
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', `${name} locks scroll while opening`);
        assert.equal(await dialog.evaluate(element => element instanceof HTMLDialogElement), true, `${name} uses a native dialog`);
        assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true, `${name} focuses content when opening`);
        await capture(`${name === 'UOverlay' ? 'overlay' : 'bottom-sheet'}-opening-${screenshotTheme}-${screenshotSize[0]}x${screenshotSize[1]}`, ...screenshotSize);
        await resumeDialogAnimation(dialog);
        await page.waitForFunction(element => element.dataset.state === 'open', await dialog.elementHandle(), { timeout: 10000 });

        const rapid = live.getByRole('button', { name: '快速重开', exact: true });
        if (await rapid.count()) {
            await rapid.focus();
            await page.keyboard.press('Enter');
            await page.waitForFunction(element => element.open && (element.dataset.state === 'opening' || element.dataset.state === 'open'), await dialog.elementHandle(), { timeout: 10000 });
            assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', `${name} retains scroll lock across a rapid close/reopen`);
            assert.equal(await dialog.evaluate(element => element.inert), false, `${name} becomes interactive again after rapid reopen`);
            assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true, `${name} keeps focus inside the open dialog after rapid reopen`);
            await page.waitForFunction(element => element.dataset.state === 'open', await dialog.elementHandle(), { timeout: 10000 });
        } else {
            // BottomSheet has no dedicated rapid-reopen button; verify its ordinary reopen after a completed close.
            const firstClose = live.getByRole('button', { name: closeName, exact: true });
            await firstClose.focus();
            await page.keyboard.press('Enter');
            await page.waitForFunction(element => element.dataset.state === 'closing', await dialog.elementHandle(), { timeout: 10000 });
            assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', `${name} retains scroll lock during exit`);
            await waitMotionEnd(dialog, `${name} first close`);
            await page.waitForFunction(element => element.dataset.state === 'closed' && !element.open, await dialog.elementHandle(), { timeout: 10000 });
            assert.equal(await page.evaluate(() => document.body.style.overflow), previousOverflow, `${name} unlocks after exit`);
            assert.equal(await opener.evaluate(element => element === document.activeElement), true, `${name} restores keyboard focus after close`);
            await opener.focus();
            await page.keyboard.press('Enter');
            await page.waitForFunction(element => element.open && (element.dataset.state === 'opening' || element.dataset.state === 'open'), await dialog.elementHandle(), { timeout: 10000 });
            assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', `${name} locks scrolling again when reopened`);
            await page.waitForFunction(element => element.dataset.state === 'open', await dialog.elementHandle(), { timeout: 10000 });
        }

        const close = live.getByRole('button', { name: closeName, exact: true });
        await close.focus();
        await armDialogAnimationPause(dialog);
        await page.keyboard.press('Enter');
        await waitForPausedDialogAnimation(dialog, 'closing', `${name} closing`);
        assert.deepEqual(await dialog.evaluate(element => ({ open: element.open, inert: element.inert, ariaHidden: element.getAttribute('aria-hidden') })), { open: true, inert: true, ariaHidden: 'true' }, `${name} remains a modal but becomes inert while exiting`);
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', `${name} holds scroll lock until the exit animation completes`);
        await resumeDialogAnimation(dialog);
        await page.waitForFunction(element => element.dataset.state === 'closed' && !element.open, await dialog.elementHandle(), { timeout: 10000 });
        assert.equal(await page.evaluate(() => document.body.style.overflow), previousOverflow, `${name} releases scroll lock only after closing`);
        assert.equal(await opener.evaluate(element => element === document.activeElement), true, `${name} returns keyboard focus to its opener`);
        return live;
    }

    async function core() {
        await setWindow(1440, 900);
        await setTheme('light');
        await listGroupMotion();
        await transitionMotion();
        await treeviewMotion();
        await overlayMotion('UOverlay', '打开浮层', '关闭', 180);
        await overlayMotion('UBottomSheet', '打开底部面板', '完成', 240);
        passed.push('Overlay and BottomSheet retain native modal semantics, scroll locking, exit inertness, rapid reopen and keyboard focus restoration');
        await setWindow(1440, 900);
        await setTheme('light');
    }

    const fromTooltip = process.env.DISCLOSURE_FROM_TOOLTIP === '1';
    if (!fromTooltip) await core();
    if (process.env.DISCLOSURE_CORE_ONLY !== '1') {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        if (!fromTooltip) {
        await setManualReduced(false);

        const windowExample = await openExample('UWindow');
        const windowRoot = windowExample.locator('.u-window');
        await windowExample.getByRole('button', { name: '切换面板', exact: true }).click();
        await assertMotion(windowRoot, 'Window content switch');
        await pauseRunningTransitions(windowRoot, 'Window content switch');
        await assertOverlappingPanels(windowRoot, ':scope > .u-window-item', 'Window content switch');
        await capture('window-overlap-light-1440x900', 1440, 900);
        await resumeRunningTransitions(windowRoot);
        await waitMotionEnd(windowRoot, 'Window content switch');

        const carouselExample = await openExample('UCarousel');
        const carouselRoot = carouselExample.locator('.u-carousel');
        const carouselContent = carouselRoot.locator('.u-carousel-content');
        await carouselRoot.getByRole('button', { name: '下一项', exact: true }).click();
        await assertMotion(carouselContent, 'Carousel content switch');
        await pauseRunningTransitions(carouselContent, 'Carousel content switch');
        await assertOverlappingPanels(carouselContent, '.u-window-item', 'Carousel content switch');
        await resumeRunningTransitions(carouselContent);
        await waitMotionEnd(carouselContent, 'Carousel content switch');
        passed.push('Window and Carousel keep outgoing and incoming panels overlapped in one grid cell during slide transitions');

        const confirmEdit = await openExample('UConfirmEdit');
        const confirmRoot = confirmEdit.locator('.u-confirm-edit');
        await confirmEdit.getByRole('button', { name: '编辑', exact: true }).click();
        const editField = confirmEdit.getByRole('textbox', { name: '编辑名称', exact: true });
        await assertMotion(confirmRoot, 'ConfirmEdit enter', 240);
        await editField.fill('未保存草稿');
        await waitMotionEnd(confirmRoot, 'ConfirmEdit enter');
        await confirmEdit.getByRole('button', { name: '取消', exact: true }).click();
        await assertMotion(confirmRoot, 'ConfirmEdit cancel', 240);
        await waitMotionEnd(confirmRoot, 'ConfirmEdit cancel');
        assert.equal(await confirmEdit.getByText('已确认：工作区名称', { exact: true }).count(), 1, 'cancel leaves the confirmed value unchanged');
        passed.push('ConfirmEdit expands its editor on demand and collapses cleanly on cancel');

        await setWindow(390, 360);
        const installLazyTransitionCapture = () => {
            if (window.__lazyTransitionCaptureInstalled) return;
            window.__lazyTransitionCaptureInstalled = true;
            window.__lazyTransitionEvents = [];
            document.addEventListener('transitionrun', event => {
                if (!(event.target instanceof Element)) return;
                const root = event.target.closest('.u-lazy');
                if (!root) return;
                window.__lazyTransitionEvents.push({
                    property: event.propertyName,
                    classes: [...event.target.classList],
                    text: event.target.textContent?.trim() ?? '',
                    hasImage: Boolean(root.querySelector('img[alt="延迟显示的山丘图形"]')),
                    duration: getComputedStyle(event.target).transitionDuration
                });
            }, true);
        };
        await page.addInitScript(installLazyTransitionCapture);
        await page.evaluate(installLazyTransitionCapture);
        const lazy = await openExample('ULazy');
        const lazyRoot = lazy.locator('.u-lazy');
        const lazyPlaceholder = lazy.getByText('等待进入视口…', { exact: true });
        const lazyImage = lazy.locator('img[alt="延迟显示的山丘图形"]');
        await lazyPlaceholder.waitFor({ state: 'visible' });
        assert.equal(await lazyImage.count(), 0, 'lazy image content stays unmounted outside the viewport');
        assert.equal(await lazyRoot.evaluate(element => element.querySelector('img[alt="延迟显示的山丘图形"]')?.getAttribute('src') ?? null), null);
        const contentScroller = page.locator('.docs-content-scroll');
        const targetScrollTop = await contentScroller.evaluate(element => {
            const root = document.querySelector('.u-lazy');
            const rootRect = root.getBoundingClientRect();
            const scrollRect = element.getBoundingClientRect();
            const delta = rootRect.top - scrollRect.top - (element.clientHeight - rootRect.height) / 2;
            return Math.max(0, Math.min(element.scrollHeight - element.clientHeight, element.scrollTop + delta));
        });
        await contentScroller.evaluate((element, top) => element.scrollTo({ top, behavior: 'instant' }), targetScrollTop);
        await lazyImage.waitFor({ state: 'visible' });
        await page.waitForFunction(element => element.getAttribute('src') !== null, await lazyImage.elementHandle(), { timeout: 10000 });
        // The image can be mounted one animation frame before transitionrun.
        await page.waitForFunction(() => (window.__lazyTransitionEvents ?? []).some(event => event.property === 'opacity' && event.classes.includes('u-fade-enter-active') && event.hasImage), null, { timeout: 10000 });
        const lazyDebug = await lazyRoot.evaluate(element => ({
            captureInstalled: Boolean(window.__lazyTransitionCaptureInstalled),
            transitions: window.__lazyTransitionEvents ?? [],
            markup: element.outerHTML,
            children: [...element.children].map(child => ({ className: child.className, text: child.textContent?.trim(), transitionDuration: getComputedStyle(child).transitionDuration })),
            reducedMotion: document.documentElement.dataset.reducedMotion
        }));
        const lazyTransitions = lazyDebug.transitions;
        const placeholderLeave = lazyTransitions.findIndex(event => event.property === 'opacity' && event.classes.includes('u-fade-leave-active') && event.text.includes('等待进入视口…'));
        const contentEnter = lazyTransitions.findIndex(event => event.property === 'opacity' && event.classes.includes('u-fade-enter-active') && event.hasImage);
        assert.ok(placeholderLeave >= 0, `Lazy records the placeholder fade-out: ${JSON.stringify(lazyDebug)}`);
        assert.ok(contentEnter > placeholderLeave, `Lazy's out-in mode starts content after the placeholder leaves: ${JSON.stringify(lazyDebug)}`);
        assert.ok(parseFloat(lazyTransitions[placeholderLeave].duration) > 0 && parseFloat(lazyTransitions[contentEnter].duration) > 0, `Lazy uses real opacity transitions: ${JSON.stringify(lazyTransitions)}`);
        assert.match(await lazyImage.getAttribute('src'), /^data:image\/svg\+xml,/, 'UImg assigns the actual image source only after entering the viewport');
        assert.equal(await lazyPlaceholder.count(), 0, 'placeholder is replaced by real lazy content');
        await setWindow(1440, 900);
        passed.push('Lazy replaces its placeholder with real content through an out-in fade');

        await setWindow(390, 120);
        const imgDemo = await openExample('UImg');
        const deferredImage = imgDemo.locator('img[alt="柔和的山丘图形"]');
        await deferredImage.waitFor({ state: 'attached' });
        const initialImage = await deferredImage.evaluate(element => ({ source: element.getAttribute('src'), top: element.getBoundingClientRect().top, viewportHeight: innerHeight }));
        assert.equal(initialImage.source, null, `UImg keeps src unset while outside its lazy threshold: ${JSON.stringify(initialImage)}`);
        const imgScroller = page.locator('.docs-content-scroll');
        const imgTargetScrollTop = await imgScroller.evaluate(element => {
            const image = document.querySelector('img[alt="柔和的山丘图形"]');
            const imageRect = image.getBoundingClientRect();
            const scrollRect = element.getBoundingClientRect();
            const delta = imageRect.top - scrollRect.top - (element.clientHeight - imageRect.height) / 2;
            return Math.max(0, Math.min(element.scrollHeight - element.clientHeight, element.scrollTop + delta));
        });
        await imgScroller.evaluate((element, top) => element.scrollTo({ top, behavior: 'instant' }), imgTargetScrollTop);
        await page.waitForFunction(element => element.getAttribute('src') !== null, await deferredImage.elementHandle(), { timeout: 10000 });
        assert.match(await deferredImage.getAttribute('src'), /^data:image\/svg\+xml,/);
        await deferredImage.evaluate(element => element.decode());
        assert.ok(await deferredImage.evaluate(element => element.naturalWidth > 0), 'deferred image loads after the content scroller brings it into range');
        await setWindow(1440, 900);
        passed.push('UImg keeps the source off-DOM until its own intersection observer sees the image enter range');

        const expansion = await openExample('UExpansionPanels');
        const panelTitle = expansion.getByRole('button', { name: '更多说明', exact: true });
        await panelTitle.focus();
        await page.keyboard.press('Enter');
        const expansionRoot = expansion.locator('.u-expansion-panels');
        await assertMotion(expansionRoot, 'ExpansionPanel text enter/leave', 240);
        await waitMotionEnd(expansionRoot, 'ExpansionPanel text enter/leave');
        assert.equal(await expansion.locator('.u-expansion-text').filter({ hasText: '面板间由组统一管理展开状态。' }).count(), 1);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await panelTitle.focus();
        await page.keyboard.press('Enter');
        await assertNoMotion(expansionRoot, 'ExpansionPanel system reduced motion');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        passed.push('ExpansionPanels reuse the shared measured expand transition and system reduced-motion bypass');

        const banner = await openExample('UBanner');
        const bannerSurface = banner.locator('.ui-banner');
        await banner.getByRole('button', { name: '知道了', exact: true }).click();
        await assertMotion(bannerSurface, 'Banner collapse', 240);
        await waitMotionEnd(bannerSurface, 'Banner collapse');
        assert.equal(await banner.locator('.ui-banner').count(), 0);
        await banner.getByRole('button', { name: '重新显示提示', exact: true }).click();
        await assertMotion(banner.locator('.ui-banner'), 'Banner reopen', 240);
        await waitMotionEnd(banner.locator('.ui-banner'), 'Banner reopen');
        passed.push('Banner exits and re-enters through the shared height transition');

        const autocomplete = await openExample('UAutocomplete');
        const combo = autocomplete.getByRole('combobox', { name: '搜索工作区', exact: true });
        await combo.focus();
        const listbox = autocomplete.getByRole('listbox');
        await listbox.waitFor({ state: 'visible' });
        await assertMotion(listbox, 'Autocomplete menu open');
        await combo.fill('完整');
        assert.equal(await listbox.getByRole('option').count(), 1, 'filtering updates options while the same menu stays open');
        await combo.press('Escape');
        await assertMotion(listbox, 'Autocomplete menu close');
        await listbox.waitFor({ state: 'detached' });
        await setManualReduced(true);
        const reducedAutocomplete = await openExample('UAutocomplete');
        const reducedCombo = reducedAutocomplete.getByRole('combobox', { name: '搜索工作区', exact: true });
        await reducedCombo.focus();
        const reducedListbox = reducedAutocomplete.getByRole('listbox');
        await reducedListbox.waitFor({ state: 'visible' });
        await assertNoMotion(reducedListbox, 'Autocomplete manual reduced motion');
        await reducedCombo.press('Escape');
        await setManualReduced(false);
        passed.push('Autocomplete popup animates only on open/close, filters in place, and honors manual reduced motion');

        const date = await openExample('UDateInput');
        const dateInput = date.getByRole('textbox', { name: '开始日期', exact: true });
        await date.getByRole('button', { name: '打开日历', exact: true }).click();
        const picker = date.locator('.u-date-picker');
        await picker.waitFor({ state: 'visible' });
        await assertMotion(picker, 'DateInput picker open');
        await dateInput.focus();
        await page.keyboard.press('Escape');
        await assertMotion(picker, 'DateInput picker close');
        await picker.waitFor({ state: 'detached' });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await date.getByRole('button', { name: '打开日历', exact: true }).click();
        const reducedPicker = date.locator('.u-date-picker');
        await reducedPicker.waitFor({ state: 'visible' });
        await assertNoMotion(reducedPicker, 'DateInput system reduced motion');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        passed.push('DateInput calendar popup slides in/out and opens immediately for system reduced motion');
        }

        const tooltip = await openExample('UTooltip', 'tooltip-capability');
        const trigger = tooltip.locator('.ui-tooltip-trigger').first();
        await trigger.hover();
        const bubble = tooltip.locator('.ui-tooltip').filter({ hasText: '图片输入' });
        await bubble.waitFor({ state: 'visible' });
        assert.equal(await bubble.evaluate(element => element.matches(':popover-open')), true, 'tooltip uses the native popover top layer');
        assert.equal(await bubble.getAttribute('role'), 'tooltip');
        assert.equal((await bubble.textContent()).trim(), '图片输入');
        await assertMotion(bubble, 'Tooltip popover open');
        await trigger.focus();
        assert.equal(await trigger.evaluate(element => element === document.activeElement), true, 'Escape is sent from the keyboard-focused tooltip trigger');
        await page.keyboard.press('Escape');
        await assertMotion(bubble, 'Tooltip popover close');
        await page.waitForFunction(element => !element.matches(':popover-open'), await bubble.elementHandle(), { timeout: 10000 });
        await trigger.evaluate(element => element.blur());
        await page.mouse.move(0, 0);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await trigger.hover();
        await bubble.waitFor({ state: 'visible' });
        await assertNoMotion(bubble, 'Tooltip system reduced motion');
        await page.mouse.move(0, 0);
        await page.waitForFunction(element => !element.matches(':popover-open'), await bubble.elementHandle(), { timeout: 10000 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        passed.push('Tooltip popover fades in/out, remains in the top layer during motion, and honors system reduced motion');

        const drawer = await openExample('UNavigationDrawer');
        const temporary = drawer.getByRole('checkbox', { name: '临时抽屉', exact: true });
        const drawerSurface = drawer.locator('.ui-navigation-drawer');
        await temporary.check();
        const scrim = drawer.locator('.ui-navigation-scrim');
        await scrim.waitFor({ state: 'visible' });
        const toggleDrawer = drawer.getByRole('button', { name: '切换抽屉', exact: true });
        await toggleDrawer.click();
        await assertMotion(scrim, 'NavigationDrawer scrim exit');
        await assertMotion(drawerSurface, 'NavigationDrawer panel exit');
        assert.equal(await drawerSurface.getAttribute('aria-hidden'), 'true');
        assert.equal(await drawerSurface.evaluate(element => element.inert), true);
        await waitMotionEnd(scrim, 'NavigationDrawer scrim exit');
        await waitMotionEnd(drawerSurface, 'NavigationDrawer panel exit');
        assert.equal(await scrim.count(), 0);
        await toggleDrawer.click();
        await scrim.waitFor({ state: 'visible' });
        await assertMotion(scrim, 'NavigationDrawer scrim enter');
        await assertMotion(drawerSurface, 'NavigationDrawer panel enter');
        await waitMotionEnd(scrim, 'NavigationDrawer scrim enter');
        await waitMotionEnd(drawerSurface, 'NavigationDrawer panel enter');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await toggleDrawer.click();
        await assertNoMotion(drawer.locator('[data-demo-component="UNavigationDrawer"]'), 'NavigationDrawer system reduced motion');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await setWindow(390, 844);
        await setTheme('light');
        await capture('navigation-drawer-scrim-light-390x844', 390, 844);
        await setWindow(1440, 900);
        passed.push('NavigationDrawer panel and temporary scrim animate together and stop under system reduced motion');

        const badge = await openExample('UBadge');
        const badgeRoot = badge.locator('.ui-attached-badge').first();
        const badgeContent = badgeRoot.locator('.ui-attached-badge-content');
        await badge.getByRole('button', { name: '切换徽标', exact: true }).click();
        await assertMotion(badgeRoot, 'Badge hide');
        await waitMotionEnd(badgeRoot, 'Badge hide');
        assert.equal(await badgeContent.count(), 0);
        await badge.getByRole('button', { name: '切换徽标', exact: true }).click();
        await assertMotion(badgeRoot, 'Badge show');
        await waitMotionEnd(badgeRoot, 'Badge show');
        assert.equal(await badgeContent.count(), 1);
        await setManualReduced(true);
        const reducedBadge = await openExample('UBadge');
        const reducedBadgeRoot = reducedBadge.locator('.ui-attached-badge').first();
        await reducedBadge.getByRole('button', { name: '切换徽标', exact: true }).click();
        await assertNoMotion(reducedBadgeRoot, 'Badge manual reduced motion');
        await setManualReduced(false);
        passed.push('Badge appearance and disappearance fade without delaying its model state and honor manual reduced motion');

        const stepper = await openExample('UStepper');
        const stepperRoot = stepper.locator('.u-stepper');
        await stepper.getByRole('button', { name: '完成', exact: true }).click();
        const stepperContent = stepper.locator('.u-stepper-window-item');
        await assertMotion(stepperRoot, 'Stepper content switch');
        const stepperWindow = stepper.locator('.u-stepper-window');
        await pauseRunningTransitions(stepperWindow, 'Stepper content switch');
        await assertOverlappingPanels(stepperWindow, '.u-stepper-window-item', 'Stepper content switch');
        await resumeRunningTransitions(stepperWindow);
        await waitMotionEnd(stepperRoot, 'Stepper content switch');
        await stepperContent.filter({ hasText: '资料已准备好。' }).waitFor({ state: 'visible' });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await stepper.getByRole('button', { name: '填写资料', exact: true }).click();
        await assertNoMotion(stepperWindow, 'Stepper system reduced motion');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        passed.push('Stepper window content fades between steps and skips animation for reduced motion');

        const table = await openExample('UDataTable');
        const tableRoot = table.locator('.u-data-table');
        const detailButton = table.getByRole('button', { name: '展开 工作区 1', exact: true });
        await detailButton.click();
        const details = tableRoot.locator('.u-data-table-details').first();
        await details.waitFor({ state: 'visible' });
        await assertMotion(details, 'DataTable details expand', 240);
        await waitMotionEnd(details, 'DataTable details expand');
        assert.match(await details.textContent(), /详情内容随高度平滑展开/);
        await setWindow(1440, 900);
        await setTheme('light');
        await capture('datatable-details-expanded-light-1440x900', 1440, 900);
        const collapseDetails = table.getByRole('button', { name: '收起 工作区 1', exact: true });
        await collapseDetails.click();
        assert.equal(await tableRoot.locator('.u-data-table-details-row').first().getAttribute('aria-hidden'), 'true');
        assert.equal(await details.evaluate(element => element.inert), true, 'table detail becomes inert during exit');
        await assertMotion(details, 'DataTable details collapse', 240);
        await waitMotionEnd(details, 'DataTable details collapse');
        assert.equal(await details.count(), 0);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await table.getByRole('button', { name: '展开 工作区 1', exact: true }).click();
        const reducedDetails = tableRoot.locator('.u-data-table-details').first();
        await reducedDetails.waitFor({ state: 'visible' });
        await assertNoMotion(reducedDetails, 'DataTable system reduced motion');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        passed.push('DataTable details rows animate height, are inert while leaving, and honor system reduced motion without exercising sort/page/virtual row movement');
    }

    assert.deepEqual(pageErrors, [], `live examples should not throw: ${pageErrors.join('\n')}`);
    assert.deepEqual(vueWarnings, [], `live examples should not warn about missing or undefined bindings: ${vueWarnings.join('\n')}`);
} catch (error) {
    process.exitCode = 1;
    passed.push(`FAIL: ${error instanceof Error ? error.stack : String(error)}`);
} finally {
    if (app) await app.close();
    await new Promise(resolve => server.httpServer.close(resolve));
    const report = { status: process.exitCode ? 'failed' : 'passed', coreOnly: process.env.DISCLOSURE_CORE_ONLY === '1', passed, pageErrors, vueWarnings, screenshots };
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
    console.log(JSON.stringify({ evidence, status: report.status, passed: passed.filter(value => !value.startsWith('FAIL:')), failures: passed.filter(value => value.startsWith('FAIL:')), pageErrors, vueWarnings, screenshots }, null, 4));
}

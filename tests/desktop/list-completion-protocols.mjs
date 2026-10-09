import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = process.cwd();
const evidence = path.join(root, 'artifacts/full-alignment/list-completion-protocols');
const fixture = path.join(evidence, 'fixture');
await mkdir(fixture, { recursive: true });
await writeFile(path.join(fixture, 'index.html'), '<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><div id="app"></div><script type="module" src="./main.ts"></script>');
await writeFile(path.join(fixture, 'main.ts'), `import { createApp } from 'vue';
import { createUI } from '/src/ui/index.ts';
import Fixture from './Fixture.vue';
import '/src/ui/styles.css';
createApp(Fixture).use(createUI()).mount('#app');`);
await writeFile(path.join(fixture, 'Fixture.vue'), `<script setup>
import { ref } from 'vue';
import { UList, UListItem, UListGroup } from '/src/ui/index.ts';

const values = {
    alpha: { id: 'alpha' },
    group: { id: 'group' },
    hidden: { id: 'hidden' },
    disabled: { id: 'disabled' },
    beta: { id: 'beta' },
    manualBefore: { id: 'manual-before' },
    manualGroup: { id: 'manual-group' },
    manualChild: { id: 'manual-child' },
    manualAfter: { id: 'manual-after' },
    manualDisabled: { id: 'manual-disabled' }
};
const trackItems = [
    { title: 'Alpha', value: values.alpha, subtitle: 'Alpha subtitle', children: undefined },
    { title: 'Group', value: values.group, children: [{ title: 'Hidden child', value: values.hidden }] },
    { title: 'Disabled', value: values.disabled, props: { disabled: true } },
    { title: 'Beta', value: values.beta }
];
const trackSelected = ref([{ id: 'alpha' }]);
const trackActivated = ref([]);
const trackOpened = ref([]);
const trackNavigationIndex = ref(-1);
const trackSearch = ref('');
const trackRef = ref();
const nestedClicks = ref(0);
const eventLog = { select: [], activate: [], open: [] };

const manualRef = ref();
const manualNavigationIndex = ref(-1);
const manualSelected = ref([]);
const manualEvents = { select: [] };

const focusItems = [
    { title: 'Focus one', value: 'focus-one' },
    { title: 'Focus two', value: 'focus-two' },
    { title: 'Focus disabled', value: 'focus-disabled', props: { disabled: true } }
];
const focusNavigationIndex = ref(-1);

const legacyItems = [{ title: 'Legacy item', value: 'legacy' }];
const fullItems = [{ title: 'Full Alpha', value: 'full-alpha' }, { title: 'Full Beta', value: 'full-beta' }];
const fullSelected = ref([]);
const fullNavigationIndex = ref(-1);

const activeItems = [{ title: 'Active one', value: 'active-one' }, { title: 'Active two', value: 'active-two' }];
const explicitActivated = ref([]);
const legacyActivated = ref([]);
const independentActivated = ref([]);

const customComparatorItems = [{ title: 'Code item', value: { code: 'C-1', label: 'registered' } }];
const customComparatorSelected = ref({ code: 'C-1', label: 'model clone' });
function compareByCode(left, right) {
    return !!left && !!right && typeof left === 'object' && typeof right === 'object' && left.code === right.code;
}

const readonlyItems = [{ title: 'Read only', value: 'read-only' }, { title: 'Read only group', value: 'read-only-group', children: [{ title: 'Child', value: 'read-only-child' }] }];
const readonlyRef = ref();
const readonlyOpens = ref([]);
const disabledNavigationIndex = ref(0);
const disabledItems = [{ title: 'Disabled list item', value: 'disabled-list-item' }, { title: 'Disabled list group', value: 'disabled-list-group', children: [{ title: 'Disabled child', value: 'disabled-child' }] }];

window.listProtocol = {
    values,
    trackRef,
    trackSelected,
    trackActivated,
    trackOpened,
    trackNavigationIndex,
    trackSearch,
    manualRef,
    manualNavigationIndex,
    manualSelected,
    manualEvents,
    focusNavigationIndex,
    fullSelected,
    fullNavigationIndex,
    explicitActivated,
    legacyActivated,
    independentActivated,
    customComparatorSelected,
    readonlyRef,
    readonlyOpens,
    nestedClicks,
    eventLog
};
</script>

<template>
    <main>
        <UList
            id="track-list"
            ref="trackRef"
            v-model="trackSelected"
            v-model:activated="trackActivated"
            v-model:opened="trackOpened"
            v-model:navigation-index="trackNavigationIndex"
            :items="trackItems"
            :multiple="true"
            :selectable="true"
            :activatable="true"
            navigation-strategy="track"
            :filterable="true"
            :search="trackSearch"
            @click:select="eventLog.select.push($event)"
            @click:activate="eventLog.activate.push($event)"
            @click:open="eventLog.open.push($event)"
        >
            <template #title="{ item, isSelected, isActive, select }">
                <span class="track-title" :data-title-value="item.value.id" :data-is-selected="isSelected" :data-is-active="isActive">{{ item.title }}</span>
                <button v-if="item.value.id === 'alpha'" data-testid="nested-control" @click="nestedClicks++">Nested</button>
                <button v-if="item.value.id === 'alpha'" data-testid="slot-select" @click="select(true, $event)">Select through slot</button>
            </template>
            <template #subtitle="{ item, isSelected }">
                <span :data-subtitle-value="item.value.id" :data-subtitle-selected="isSelected">{{ item.subtitle }}</span>
            </template>
            <template #prepend="{ item, isActive }">
                <span :data-prepend-value="item.value.id" :data-prepend-active="isActive">P</span>
            </template>
            <template #append="{ item, isSelected }">
                <span :data-append-value="item.value.id" :data-append-selected="isSelected">A</span>
            </template>
        </UList>

        <UList
            id="manual-list"
            ref="manualRef"
            v-model="manualSelected"
            v-model:navigation-index="manualNavigationIndex"
            :selectable="true"
            navigation-strategy="track"
            @click:select="manualEvents.select.push($event)"
        >
            <UListItem :value="values.manualBefore" title="Manual before" />
            <UListGroup :value="values.manualGroup" title="Manual group">
                <template #activator="{ props, isOpen }">
                    <button v-bind="props" data-testid="manual-group-trigger">Manual group {{ isOpen ? 'open' : 'closed' }}</button>
                </template>
                <UListItem :value="values.manualChild" title="Manual child" />
            </UListGroup>
            <UListItem :value="values.manualAfter" title="Manual after" />
            <UListItem :value="values.manualDisabled" title="Manual disabled" disabled />
        </UList>

        <UList id="focus-list" :items="focusItems" v-model:navigation-index="focusNavigationIndex" />

        <UList id="legacy-list" :items="legacyItems">
            <template #title="{ item }"><strong data-testid="custom-title">{{ item.title }} custom title</strong></template>
        </UList>

        <UList
            id="full-list"
            :items="fullItems"
            v-model="fullSelected"
            v-model:navigation-index="fullNavigationIndex"
            :selectable="true"
            :activatable="true"
            navigation-strategy="track"
        >
            <template #item="{ item, internalItem, index, props }">
                <UListItem v-bind="props" :data-testid="'full-' + item.value">
                    <template #title="{ isSelected, activate }">
                        <span :data-testid="'full-title-' + item.value" :data-index="index" :data-internal-index="internalItem.index" :data-is-selected="isSelected">{{ item.title }}</span>
                        <button :data-testid="'full-activate-' + item.value" @click="activate(true, $event)">Activate</button>
                    </template>
                </UListItem>
            </template>
        </UList>

        <UList id="explicit-active-list" :items="activeItems" :activatable="true" :multiple="true" active-strategy="single-independent" v-model:activated="explicitActivated" />
        <UList id="legacy-active-list" :items="activeItems" :activatable="true" :multiple="true" v-model:activated="legacyActivated" />
        <UList id="independent-active-list" :items="activeItems" :activatable="true" active-strategy="independent" v-model:activated="independentActivated" />

        <UList id="custom-comparator-list" :items="customComparatorItems" :model-value="customComparatorSelected" :value-comparator="compareByCode" />

        <UList id="readonly-list" ref="readonlyRef" :items="readonlyItems" :selectable="true" readonly @click:open="readonlyOpens.push($event)" />
        <UList id="disabled-list" :items="disabledItems" v-model:navigation-index="disabledNavigationIndex" :selectable="true" :disabled="true" navigation-strategy="track" />
    </main>
</template>`);

const report = { checks: [], pageErrors: [], windowErrors: [], unhandledRejections: [], warnings: [], screenshots: [] };
const vite = await createServer({
    root,
    appType: 'mpa',
    cacheDir: path.join(evidence, 'vite-cache'),
    logLevel: 'error',
    optimizeDeps: {
        noDiscovery: true,
        entries: [path.relative(root, path.join(fixture, 'main.ts'))],
        include: ['highlight.js/lib/core', 'markdown-it', 'markdown-it-footnote', 'markdown-it-task-lists', 'markdown-it-deflist', 'markdown-it-mark', 'markdown-it-sub', 'markdown-it-sup']
    },
    resolve: { dedupe: ['vue'] },
    server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/artifacts/**'] } }
});
let browser;
try {
    await vite.listen();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    page.on('pageerror', (error) => report.pageErrors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning' || message.text().includes('[Vue warn]')) report.warnings.push(message.text());
    });
    await page.addInitScript(() => {
        window.__listWindowErrors = [];
        window.__listUnhandledRejections = [];
        window.addEventListener('error', (event) => window.__listWindowErrors.push(event.message));
        window.addEventListener('unhandledrejection', (event) => window.__listUnhandledRejections.push(String(event.reason)));
    });
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/artifacts/full-alignment/list-completion-protocols/fixture/index.html`);
    await page.waitForFunction(() => document.querySelector('#track-list .ui-list-item') && document.querySelector('#manual-list [data-testid="manual-group-trigger"]'));

    const track = page.locator('#track-list');
    const initialRows = await track.locator('[data-ui-list-navigation-item]').evaluateAll((nodes) => nodes.filter((node) => !node.closest('[inert], [aria-hidden="true"]') && node.getAttribute('aria-disabled') !== 'true').map((node) => node.id));
    assert.equal(initialRows.length, 3, 'track navigation omits the collapsed child and disabled item');
    assert.equal(await track.getAttribute('tabindex'), '0');
    assert.ok(await track.getAttribute('id'));
    assert.ok(await track.locator('.ui-list-item').first().getAttribute('id'));
    assert.notEqual(await track.locator('.ui-list-item').first().getAttribute('id'), await track.locator('.ui-list-item').last().getAttribute('id'));
    assert.equal(await track.locator('.ui-list-item').first().getAttribute('tabindex'), '-1');
    assert.equal(await track.locator('.ui-list-item[aria-disabled="true"]').getAttribute('tabindex'), '-1');
    assert.equal(await track.locator('.track-title[data-title-value="alpha"]').getAttribute('data-is-selected'), 'true', 'default comparator matches a cloned object model value');
    assert.equal(await page.locator('#custom-comparator-list .ui-list-item').getAttribute('aria-selected'), 'true', 'custom comparator matches the model object');
    report.checks.push('object values use default and custom comparators while preserving primitive types');

    await track.focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await track.getAttribute('aria-activedescendant'), initialRows[0]);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'track-list', 'tracked movement keeps DOM focus on the root');
    assert.equal(await page.evaluate(() => window.listProtocol.trackNavigationIndex.value), 0);
    await page.keyboard.press('ArrowDown');
    assert.equal(await track.getAttribute('aria-activedescendant'), initialRows[1]);
    await page.keyboard.press('ArrowDown');
    assert.equal(await track.getAttribute('aria-activedescendant'), initialRows[2], 'movement skips hidden and disabled rows');
    await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(() => window.listProtocol.trackSelected.value.map((value) => value.id)), ['alpha', 'beta']);
    assert.deepEqual(await page.evaluate(() => window.listProtocol.trackActivated.value.map((value) => value.id)), ['beta']);
    const selectedPayload = await page.evaluate(() => {
        const payload = window.listProtocol.eventLog.select.at(-1);
        return { id: payload.id.id, value: payload.value, type: typeof payload.id, eventType: payload.event?.type, path: payload.path.map((value) => value.id) };
    });
    assert.deepEqual(selectedPayload, { id: 'beta', value: true, type: 'object', eventType: 'click', path: ['beta'] });
    report.checks.push('track Arrow/Home/End and Enter/Space update navigationIndex and activate real rows without moving focus');

    await page.evaluate(() => { window.listProtocol.trackNavigationIndex.value = 1; });
    await page.waitForFunction(() => document.querySelector('#track-list')?.getAttribute('aria-activedescendant') === [...document.querySelectorAll('#track-list [data-ui-list-navigation-item]')].filter((node) => node.getAttribute('aria-disabled') !== 'true' && !node.closest('[inert], [aria-hidden="true"]'))[1]?.id);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'track-list', 'external navigationIndex updates active descendant without focusing a row');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('#track-list [data-ui-list-group-activator]')?.getAttribute('aria-expanded') === 'true');
    assert.equal(await page.evaluate(() => window.listProtocol.eventLog.open.at(-1)?.event?.type), 'click');
    await page.keyboard.press('End');
    const rowsAfterOpen = await track.locator('[data-ui-list-navigation-item]').evaluateAll((nodes) => nodes.filter((node) => !node.closest('[inert], [aria-hidden="true"]') && node.getAttribute('aria-disabled') !== 'true').map((node) => node.id));
    assert.equal(await track.getAttribute('aria-activedescendant'), rowsAfterOpen.at(-1));
    await page.keyboard.press('Home');
    assert.equal(await track.getAttribute('aria-activedescendant'), rowsAfterOpen[0]);
    await page.evaluate(() => window.listProtocol.trackRef.value.open(window.listProtocol.values.group, undefined, new Event('expose-open-toggle')));
    await page.waitForFunction(() => document.querySelector('#track-list [data-ui-list-group-activator]')?.getAttribute('aria-expanded') === 'false');
    assert.equal(await page.locator('#track-list [data-ui-list-group-activator]').getAttribute('aria-expanded'), 'false');
    assert.deepEqual(await page.evaluate(() => {
        const payload = window.listProtocol.eventLog.open.at(-1);
        return { id: payload.id.id, value: payload.value, path: payload.path.map((value) => value.id), eventType: payload.event?.type };
    }), { id: 'group', value: false, path: ['group'], eventType: 'expose-open-toggle' });
    await page.evaluate(() => window.listProtocol.trackRef.value.open(window.listProtocol.values.group, true, new Event('expose-open')));
    await page.waitForFunction(() => document.querySelector('#track-list [data-ui-list-group-activator]')?.getAttribute('aria-expanded') === 'true');
    assert.deepEqual(await page.evaluate(() => {
        const payload = window.listProtocol.eventLog.open.at(-1);
        return { id: payload.id.id, value: payload.value, path: payload.path.map((value) => value.id), eventType: payload.event?.type };
    }), { id: 'group', value: true, path: ['group'], eventType: 'expose-open' });
    await page.evaluate(() => window.listProtocol.trackRef.value.select(window.listProtocol.values.beta, undefined, new Event('expose-select-toggle')));
    assert.equal(await page.evaluate(() => window.listProtocol.eventLog.select.at(-1)?.value), false);
    await page.evaluate(() => window.listProtocol.trackRef.value.select(window.listProtocol.values.beta, true, new Event('expose-select')));
    const exposedSelect = await page.evaluate(() => {
        const payload = window.listProtocol.eventLog.select.at(-1);
        return { id: payload.id.id, value: payload.value, path: payload.path.map((value) => value.id), eventType: payload.event?.type, sameRegisteredObject: payload.id === window.listProtocol.values.beta };
    });
    assert.deepEqual(exposedSelect, { id: 'beta', value: true, path: ['beta'], eventType: 'expose-select', sameRegisteredObject: true });
    report.checks.push('exposed open/select preserve toggle defaults and emit id/value/path/event with registered raw values');

    const registration = await page.evaluate(() => {
        const list = window.listProtocol.trackRef.value;
        const item = list.getItem({ id: 'beta' });
        const group = list.getGroup({ id: 'group' });
        return {
            count: list.getRegistrations().length,
            itemKind: item?.kind,
            itemValueType: typeof item?.value,
            itemElementId: item?.element?.id,
            groupKind: group?.kind,
            groupContainer: group?.container?.className,
            contextRoot: list.registrationContext.root?.id
        };
    });
    assert.ok(registration.count >= 5);
    assert.equal(registration.itemKind, 'item');
    assert.equal(registration.itemValueType, 'object');
    assert.equal(registration.groupKind, 'group');
    assert.equal(registration.groupContainer, 'ui-list-group');
    assert.equal(registration.contextRoot, 'track-list');
    report.checks.push('public registration snapshots expose item/group DOM refs and canonical raw values');

    await track.focus();
    await page.evaluate(() => window.listProtocol.trackRef.value.focusAt(0));
    assert.equal(await page.evaluate(() => document.activeElement.id), 'track-list');
    assert.equal(await track.locator('[data-ui-list-tracked="true"]').count(), 1);
    const firstTracked = await track.getAttribute('aria-activedescendant');
    await page.evaluate(() => window.listProtocol.trackRef.value.focus('next'));
    assert.equal(await page.evaluate(() => document.activeElement.id), 'track-list');
    assert.notEqual(await track.getAttribute('aria-activedescendant'), firstTracked);
    report.checks.push('exposed focusAt/focus preserve root DOM focus and update the tracked row marker');

    const manual = page.locator('#manual-list');
    const manualRows = await manual.locator('[data-ui-list-navigation-item]').evaluateAll((nodes) => nodes.filter((node) => !node.closest('[inert], [aria-hidden="true"]') && node.getAttribute('aria-disabled') !== 'true').map((node) => node.id));
    assert.equal(manualRows.length, 3, 'manual item and group activator registrations form navigable rows');
    await manual.focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    assert.equal(await manual.getAttribute('aria-activedescendant'), manualRows[1]);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('#manual-list [data-testid="manual-group-trigger"]')?.getAttribute('aria-expanded') === 'true');
    assert.match(await page.locator('[data-testid="manual-group-trigger"]').textContent(), /open/);
    await page.evaluate(() => window.listProtocol.manualRef.value.select(window.listProtocol.values.manualChild, true, new Event('manual-child-select')));
    const manualPayload = await page.evaluate(() => {
        const payload = window.listProtocol.manualEvents.select.at(-1);
        return {
            id: payload.id.id,
            value: payload.value,
            path: payload.path.map((value) => value.id),
            eventType: payload.event?.type,
            sameRegisteredObject: payload.id === window.listProtocol.values.manualChild
        };
    });
    assert.deepEqual(manualPayload, {
        id: 'manual-child',
        value: true,
        path: ['manual-group', 'manual-child'],
        eventType: 'manual-child-select',
        sameRegisteredObject: true
    });
    await page.keyboard.press('End');
    assert.equal(await manual.getAttribute('aria-activedescendant'), await manual.locator('[data-ui-list-navigation-item]').evaluateAll((nodes) => nodes.filter((node) => !node.closest('[inert], [aria-hidden="true"]') && node.getAttribute('aria-disabled') !== 'true').at(-1).id));
    report.checks.push('hand-written items and Group activators navigate correctly and emit nested registration paths');

    await page.locator('[data-testid="nested-control"]').focus();
    const beforeNested = await page.evaluate(() => window.listProtocol.trackSelected.value.map((value) => value.id));
    await page.keyboard.press('ArrowDown');
    await page.locator('[data-testid="nested-control"]').click();
    assert.equal(await page.evaluate(() => document.activeElement.dataset.testid), 'nested-control');
    assert.equal(await page.evaluate(() => window.listProtocol.nestedClicks.value), 1);
    assert.deepEqual(await page.evaluate(() => window.listProtocol.trackSelected.value.map((value) => value.id)), beforeNested, 'nested interactive controls do not select their parent row');
    report.checks.push('nested interactive controls retain their keyboard and click behavior');
    await page.evaluate(() => { window.listProtocol.trackSearch.value = 'Beta'; });
    await page.waitForFunction(() => document.querySelector('#track-list')?.getAttribute('aria-activedescendant') === document.querySelector('#track-list [data-ui-list-navigation-item]')?.id);
    assert.equal(await track.locator('[data-ui-list-navigation-item]').count(), 1, 'filtered rows leave only visible navigation targets');
    report.checks.push('aria-activedescendant follows visible rows when filtering changes the rendered set');

    const focus = page.locator('#focus-list');
    assert.equal(await focus.getAttribute('tabindex'), null, 'default focus strategy leaves root outside the tab order');
    const focusRows = focus.locator('.ui-list-item');
    assert.equal(await focusRows.first().getAttribute('tabindex'), '0');
    await focusRows.first().focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.id), await focusRows.nth(1).getAttribute('id'));
    assert.equal(await page.evaluate(() => window.listProtocol.focusNavigationIndex.value), 1);
    await page.evaluate(() => { window.listProtocol.focusNavigationIndex.value = 0; });
    await page.waitForFunction(() => document.activeElement?.textContent?.includes('Focus one'));
    report.checks.push('default focus strategy keeps DOM focus navigation and navigationIndex synchronization');

    assert.match(await page.locator('[data-testid="custom-title"]').textContent(), /Legacy item custom title/);
    await page.locator('#full-list').focus();
    const full = page.locator('#full-list');
    const fullRow = page.locator('[data-testid="full-full-alpha"]');
    assert.equal(await fullRow.getAttribute('role'), 'option');
    assert.equal(await fullRow.getAttribute('tabindex'), '-1');
    assert.ok(await fullRow.getAttribute('id'));
    assert.equal(await page.locator('[data-testid="full-title-full-alpha"]').getAttribute('data-index'), '0');
    assert.equal(await page.locator('[data-testid="full-title-full-alpha"]').getAttribute('data-internal-index'), '0');
    await page.keyboard.press('ArrowDown');
    assert.equal(await full.getAttribute('aria-activedescendant'), await fullRow.getAttribute('id'));
    await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(() => window.listProtocol.fullSelected.value), ['full-alpha']);
    await page.locator('[data-testid="full-activate-full-alpha"]').click();
    assert.equal(await page.locator('[data-testid="full-full-alpha"]').getAttribute('aria-current'), null);
    report.checks.push('#item is a full row slot by default, #title replaces title content, and row props carry keyboard/selection/aria behavior');

    await page.locator('#explicit-active-list .ui-list-item').first().click();
    await page.locator('#explicit-active-list .ui-list-item').nth(1).click();
    assert.deepEqual(await page.evaluate(() => window.listProtocol.explicitActivated.value), ['active-two']);
    await page.locator('#legacy-active-list .ui-list-item').first().click();
    await page.locator('#legacy-active-list .ui-list-item').nth(1).click();
    assert.deepEqual(await page.evaluate(() => window.listProtocol.legacyActivated.value), ['active-two']);
    await page.locator('#independent-active-list .ui-list-item').first().click();
    await page.locator('#independent-active-list .ui-list-item').nth(1).click();
    assert.deepEqual(await page.evaluate(() => window.listProtocol.independentActivated.value), ['active-one', 'active-two']);
    report.checks.push('single-independent is the default active strategy; explicit independent allows multiple active rows');

    const readonly = page.locator('#readonly-list');
    await readonly.locator('.ui-list-item').first().click();
    await page.evaluate(() => window.listProtocol.readonlyRef.value.open('read-only-group', true, new Event('readonly-open')));
    assert.equal(await readonly.locator('.ui-list-item').first().getAttribute('aria-selected'), 'false');
    assert.equal(await readonly.locator('[data-ui-list-group-activator]').getAttribute('aria-expanded'), 'false');
    assert.deepEqual(await page.evaluate(() => window.listProtocol.readonlyOpens.value), []);
    assert.equal(await readonly.getAttribute('aria-readonly'), 'true');

    const disabled = page.locator('#disabled-list');
    assert.equal(await disabled.getAttribute('aria-disabled'), 'true');
    assert.equal(await disabled.getAttribute('tabindex'), '-1');
    assert.equal(await disabled.getAttribute('aria-activedescendant'), null);
    assert.equal(await disabled.locator('.ui-list-item').first().getAttribute('aria-disabled'), 'true');
    assert.equal(await disabled.locator('[data-ui-list-group-activator]').getAttribute('disabled'), '');
    await disabled.locator('.ui-list-item').first().evaluate((node) => node.click());
    assert.equal(await disabled.locator('.ui-list-item').first().getAttribute('aria-selected'), 'false');
    report.checks.push('root readonly blocks selection/open and root disabled propagates to row and group activation');

    assert.deepEqual(report.pageErrors, []);
    report.windowErrors = await page.evaluate(() => window.__listWindowErrors);
    report.unhandledRejections = await page.evaluate(() => window.__listUnhandledRejections);
    assert.deepEqual(report.windowErrors, []);
    assert.deepEqual(report.unhandledRejections, []);
    assert.deepEqual(report.warnings, []);
    console.log(`list completion protocols: ${report.checks.length} groups passed`);
} catch (error) {
    report.failure = error.stack ?? String(error);
    throw error;
} finally {
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4));
    await browser?.close();
    await vite.close();
}

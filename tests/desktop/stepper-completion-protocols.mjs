import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const evidence = path.resolve('artifacts/component-audit-root/stepper-completion');
await mkdir(evidence, { recursive: true });

const fixture = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>
    .stepper-transition-enter-active, .stepper-transition-leave-active { transition: opacity 500ms ease; }
    .stepper-transition-enter-from, .stepper-transition-leave-to { opacity: 0; }
</style></head><body><div id="app"></div><script type="module">
    import { createApp, h, reactive, ref } from 'vue';
    import UStepper from '/src/ui/UStepper.vue';
    import UStepperActions from '/src/ui/UStepperActions.vue';
    import UStepperItem from '/src/ui/UStepperItem.vue';
    import UStepperVertical from '/src/ui/UStepperVertical.vue';
    import UStepperVerticalActions from '/src/ui/UStepperVerticalActions.vue';
    import UStepperVerticalItem from '/src/ui/UStepperVerticalItem.vue';
    import UStepperWindow from '/src/ui/UStepperWindow.vue';
    import UStepperWindowItem from '/src/ui/UStepperWindowItem.vue';
    import { setLocale } from '/src/ui/locale.ts';
    import '/src/docs-base.css';
    import '/src/ui/styles.css';

    const state = reactive({
        manualValue: null,
        manualScopeKeys: [],
        manualActionEvents: [],
        generatedValue: null,
        generatedSlotModel: null,
        generatedEvents: [],
        generatedHeaderScopes: {},
        boundaryValue: 'boundary-first',
        selectedEvents: [],
        rulePass: false,
        verticalValue: null,
        verticalItemEvents: [],
        verticalItemActionEvents: [],
        verticalItemCanEdit: null,
        multipleValue: ['two', 'one'],
        linearValue: null,
        verticalMultipleValue: ['v2', 'v1'],
        finishEvents: [],
        verticalRulePass: false,
        actionEvents: [],
        slotClickCount: 0,
        windowRef: null
    });
    const manualWindow = ref();
    window.stepperFixture = { state, setLocale, getWindow: () => manualWindow.value };
    const manualSteps = [
        { value: 'first', title: 'First step' },
        { value: 'second', title: 'Second step' },
        { value: 'locked', title: 'Locked step' }
    ];
    const generatedSteps = [
        { id: 'alpha', title: 'Alpha generated', summary: 'Alpha intro', icon: 'A', body: 'Alpha body' },
        { id: 'beta', title: 'Beta generated', summary: 'Beta intro', body: 'Beta body' },
        { title: 'Third generated', summary: 'Third intro', body: 'Third body', disabled: true }
    ];

    const app = createApp({
        render() {
            const manual = h(UStepper, {
                id: 'manual-stepper',
                modelValue: state.manualValue,
                'onUpdate:modelValue': value => state.manualValue = value,
                mandatory: true,
                linear: true
            }, {
                default: scope => {
                    state.manualScopeKeys = Object.keys(scope).sort();
                    return [
                        ...manualSteps.map((item, index) => h(UStepperItem, {
                            key: item.value,
                            value: item.value,
                            title: item.title,
                            subtitle: index === 0 ? 'Details' : undefined,
                            editable: index !== 2,
                            rules: [() => state.rulePass],
                            complete: index === 1 ? true : undefined,
                            error: index === 1 ? false : undefined,
                            'onGroup:selected': event => state.selectedEvents.push({ step: item.value, ...event })
                        }, {
                            default: itemScope => {
                                if (index === 0) window.stepperFixture.firstItemScope = itemScope;
                                if (index === 1) window.stepperFixture.secondItemScope = itemScope;
                                if (index === 2) window.stepperFixture.lockedItemScope = itemScope;
                                return h('span', { 'data-item-scope': item.value }, item.title);
                            }
                        })),
                        h(UStepperWindow, { ref: manualWindow }, {
                            default: () => manualSteps.map(item => h(UStepperWindowItem, {
                                key: item.value,
                                value: item.value,
                                id: 'window-content-' + item.value,
                                'data-window-content': item.value,
                                transition: 'stepper-transition',
                                reverseTransition: 'fade-transition',
                                'onGroup:selected': event => state.selectedEvents.push({ window: item.value, ...event })
                            }, () => h('div', { 'data-window-panel': item.value }, item.title)))
                        }),
                        h(UStepperActions, {
                            id: 'legacy-actions',
                            'onClick:prev': () => state.manualActionEvents.push('prev'),
                            'onClick:next': () => state.manualActionEvents.push('next')
                        }, {
                            default: ({ prev, next }) => [
                                h('button', { id: 'legacy-prev', onClick: prev }, 'Go back'),
                                h('button', { id: 'legacy-next', onClick: next }, 'Go forward')
                            ]
                        }),
                        h('output', { id: 'legacy-slot-model' }, String(scope.modelValue ?? 'empty'))
                    ];
                }
            });

            const actionDefault = h(UStepperActions, {
                id: 'action-default',
                prevText: 'Back',
                nextText: '$vuetify.tabs.next',
                disabled: 'prev',
                'onClick:prev': () => state.actionEvents.push('default-prev'),
                'onClick:next': event => state.actionEvents.push({ name: 'default-next', mouseEvent: event instanceof MouseEvent })
            });
            const actionSlots = h(UStepperActions, {
                id: 'action-slots',
                disabled: 'next',
                'onClick:prev': () => state.actionEvents.push('slot-prev'),
                'onClick:next': () => state.actionEvents.push('slot-next')
            }, {
                prev: ({ props }) => h('button', { ...props, id: 'slot-prev' }, 'Previous slot'),
                next: ({ props }) => h('button', { ...props, id: 'slot-next' }, 'Next slot')
            });
            const verticalActions = h(UStepperVerticalActions, {
                id: 'vertical-actions-forwarding',
                disabled: 'prev',
                'onClick:prev': () => state.actionEvents.push('vertical-prev'),
                'onClick:next': event => state.actionEvents.push({ name: 'vertical-next', mouseEvent: event instanceof MouseEvent })
            }, {
                prev: ({ props }) => h('button', { ...props, id: 'vertical-action-prev' }, 'Vertical previous'),
                next: ({ props }) => h('button', { ...props, id: 'vertical-action-next' }, 'Vertical next')
            });

            const vertical = h(UStepperVertical, {
                id: 'vertical-stepper',
                modelValue: state.verticalValue,
                'onUpdate:modelValue': value => state.verticalValue = value,
                mandatory: true,
                editable: true,
                prevText: 'Root back',
                nextText: 'Root continue',
                color: 'warning',
                items: [
                    { id: 'one', title: 'Vertical one', subtitle: 'first', icon: 'one-icon', content: 'one body', props: { rules: [() => state.verticalRulePass], prevText: 'Item back', nextText: 'Item continue', color: 'success' } },
                    { id: 'two', title: 'Disabled step', content: 'two body', props: { disabled: true } },
                    { id: 'three', title: 'Vertical three', content: 'three body' }
                ],
                itemTitle: 'title',
                itemValue: 'id',
                itemProps: 'props'
            }, {
                'header-item.one': scope => h('strong', { id: 'dynamic-vertical-header' }, scope.title + ':' + scope.value),
                'item.three': scope => h('span', { id: 'dynamic-vertical-item' }, scope.raw.content + ':' + scope.value),
                item: scope => h('span', { 'data-generic-item': scope.value }, scope.raw.content),
                default: () => h(UStepperVerticalItem, {
                    value: 'manual-vertical',
                    title: 'Manual vertical',
                    editable: false,
                    'onGroup:selected': event => state.verticalItemEvents.push(event),
                    'onClick:prev': event => state.verticalItemActionEvents.push({ name: 'prev', mouseEvent: event instanceof MouseEvent }),
                    'onClick:next': event => state.verticalItemActionEvents.push({ name: 'next', mouseEvent: event instanceof MouseEvent })
                }, {
                    header: scope => {
                        state.verticalItemCanEdit = scope.canEdit;
                        return h('span', { id: 'manual-vertical-header' }, 'Manual vertical header');
                    },
                    default: () => h('span', 'Manual vertical body')
                })
            });

            const generated = h(UStepper, {
                id: 'generated-stepper',
                modelValue: state.generatedValue,
                'onUpdate:modelValue': value => state.generatedValue = value,
                items: generatedSteps,
                itemTitle: item => item.title,
                itemValue: 'id',
                itemProps: item => ({ subtitle: item.summary, icon: item.icon, disabled: item.disabled, editable: item.id !== 'beta' }),
                editable: true,
                prevText: '$vuetify.stepper.prev',
                nextText: '$vuetify.stepper.next',
                color: 'success',
                'onClick:next': event => state.generatedEvents.push({ name: 'next', mouseEvent: event instanceof MouseEvent })
            }, {
                'header-item.beta': scope => h('strong', { id: 'generated-dynamic-header' }, scope.title + ':' + scope.value + ':' + scope.raw.body),
                header: scope => {
                    state.generatedHeaderScopes[scope.value] = {
                        title: scope.title,
                        value: scope.value,
                        rawBody: scope.raw.body,
                        propSubtitle: scope.props.subtitle
                    };
                    return h('span', { 'data-generated-shared-header': scope.value }, scope.title + ':' + scope.value);
                },
                item: scope => h('span', { 'data-generated-body': scope.value }, scope.raw.body),
                default: scope => {
                    state.generatedSlotModel = scope.modelValue;
                    return [
                        h('output', { id: 'generated-legacy-slot' }, String(scope.modelValue ?? 'empty')),
                        h(UStepperItem, { value: 'manual-extra', title: 'Manual extra' }, () => h('span', 'Manual slot item'))
                    ];
                }
                });

            const titleStepper = h(UStepper, {
                id: 'title-slot-stepper',
                items: [{ value: 'title-only', title: 'Title slot step', subtitle: 'Title slot details', icon: 'Z' }],
                itemProps: true,
                hideActions: true
            }, {
                title: scope => h('span', { id: 'title-slot-content' }, 'Custom:' + scope.title),
                actions: () => h('button', { id: 'title-custom-actions' }, 'Custom actions')
            });

            const boundary = h(UStepper, {
                id: 'generated-boundary-stepper',
                modelValue: state.boundaryValue,
                'onUpdate:modelValue': value => state.boundaryValue = value,
                editable: true,
                prevText: 'Go back',
                nextText: 'Continue',
                items: [
                    { value: 'boundary-first', title: 'Boundary first' },
                    { value: 'boundary-last', title: 'Boundary last' }
                ],
                itemProps: true
            });
            const singleBoundary = h(UStepper, {
                id: 'generated-single-boundary-stepper',
                editable: true,
                items: [{ value: 'only', title: 'Only step' }],
                itemProps: true
            });
            const disabledRoot = h(UStepper, {
                id: 'generated-disabled-root-stepper',
                disabled: true,
                editable: true,
                items: [
                    { value: 'disabled-first', title: 'Disabled first' },
                    { value: 'disabled-last', title: 'Disabled last' }
                ],
                itemProps: true
            });

            const multiple = h(UStepper, {
                id: 'multiple-stepper',
                modelValue: state.multipleValue,
                'onUpdate:modelValue': value => state.multipleValue = value,
                mandatory: true,
                multiple: true,
                max: 2,
                items: [
                    { value: 'one', title: 'Multi one', body: 'One body' },
                    { value: 'two', title: 'Multi two', body: 'Two body' },
                    { value: 'three', title: 'Multi three', body: 'Three body' }
                ],
                itemProps: () => ({ editable: true })
            }, {
                item: scope => h('span', { 'data-multiple-body': scope.value }, scope.raw.body)
            });

            const linear = h(UStepper, {
                id: 'linear-stepper',
                modelValue: state.linearValue,
                'onUpdate:modelValue': value => state.linearValue = value,
                mandatory: true,
                linear: true,
                items: [
                    { value: 'linear-one', title: 'Linear one' },
                    { value: 'linear-two', title: 'Linear two' },
                    { value: 'linear-three', title: 'Linear three' }
                ],
                itemProps: () => ({ editable: true })
            });

            const verticalMultiple = h(UStepperVertical, {
                id: 'vertical-multiple-stepper',
                modelValue: state.verticalMultipleValue,
                'onUpdate:modelValue': value => state.verticalMultipleValue = value,
                mandatory: true,
                multiple: true,
                max: 2,
                items: [
                    { value: 'v1', title: 'Vertical multi one' },
                    { value: 'v2', title: 'Vertical multi two' },
                    { value: 'v3', title: 'Vertical multi three' }
                ],
                itemProps: () => ({ editable: true }),
                'onClick:finish': () => state.finishEvents.push('finish')
            });

            return h('main', [manual, actionDefault, actionSlots, verticalActions, vertical, generated, titleStepper, boundary, singleBoundary, disabledRoot, multiple, linear, verticalMultiple]);
        }
    });
    app.mount('#app');
</script></body></html>`;

const server = await createServer({
    root: process.cwd(),
    cacheDir: path.join(evidence, 'vite-cache'),
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { host: '127.0.0.1', port: 0 },
    plugins: [{
        name: 'stepper-completion-fixture',
        configureServer(server) {
            server.middlewares.use(async (request, response, next) => {
                if (request.url !== '/__stepper-completion') { next(); return; }
                response.setHeader('Content-Type', 'text/html; charset=utf-8');
                response.end(await server.transformIndexHtml('/__stepper-completion', fixture));
            });
        }
    }]
});

await server.listen();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
    if (message.type() === 'error' || message.text().includes('[Vue warn]')) errors.push(message.text());
});

async function settle() {
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

const report = { method: 'Vite source fixture in Chrome; no build', legacy: {}, generated: {}, boundary: {}, multiple: {}, linear: {}, verticalMultiple: {}, actions: {}, item: {}, windowItem: {}, vertical: {}, verticalItem: {}, errors };
try {
    await page.goto(`${server.resolvedUrls.local[0]}__stepper-completion`, { waitUntil: 'domcontentloaded' });
    await page.locator('#manual-stepper .u-stepper-item').first().waitFor();
    await page.locator('#vertical-stepper .u-stepper-vertical-item').first().waitFor();
    await page.locator('#generated-stepper .u-stepper-item').first().waitFor();
    await page.locator('#title-slot-stepper .u-stepper-item').first().waitFor();
    await page.locator('#generated-boundary-stepper .u-stepper-item').first().waitFor();
    await page.locator('#generated-single-boundary-stepper .u-stepper-item').first().waitFor();
    await page.locator('#generated-disabled-root-stepper .u-stepper-item').first().waitFor();
    await page.locator('#multiple-stepper .u-stepper-item').first().waitFor();
    await page.locator('#linear-stepper .u-stepper-item').first().waitFor();
    await page.locator('#vertical-multiple-stepper .u-stepper-vertical-item').first().waitFor();

    report.legacy.initialValue = await page.evaluate(() => window.stepperFixture.state.manualValue);
    report.legacy.defaultScope = await page.evaluate(() => window.stepperFixture.state.manualScopeKeys);
    report.legacy.modelText = await page.locator('#legacy-slot-model').textContent();
    assert.equal(report.legacy.initialValue, 'first');
    assert.deepEqual(report.legacy.defaultScope, ['go', 'modelValue', 'next', 'prev']);
    assert.equal(report.legacy.modelText, 'first');

    report.generated.initialValue = await page.evaluate(() => window.stepperFixture.state.generatedValue);
    report.generated.slotModel = await page.evaluate(() => window.stepperFixture.state.generatedSlotModel);
    report.generated.headerCount = await page.locator('#generated-stepper > .u-stepper-item').count();
    report.generated.thirdHeaderDisabled = await page.locator('#generated-stepper > .u-stepper-item').nth(2).isDisabled();
    report.generated.initialActions = await page.locator('#generated-stepper .u-stepper-actions button').allTextContents();
    report.generated.initialActionDisabled = {
        prev: await page.locator('#generated-stepper .u-stepper-actions button').nth(0).isDisabled(),
        next: await page.locator('#generated-stepper .u-stepper-actions button').nth(1).isDisabled()
    };
    report.generated.initialActionColor = await page.locator('#generated-stepper .u-stepper-actions button').nth(1).getAttribute('style');
    report.generated.headerDisabled = [
        await page.locator('#generated-stepper > .u-stepper-item').nth(0).isDisabled(),
        await page.locator('#generated-stepper > .u-stepper-item').nth(1).isDisabled()
    ];
    report.generated.title = await page.locator('#title-slot-content').textContent();
    report.generated.subtitle = await page.locator('#title-slot-stepper .u-stepper-subtitle').first().textContent();
    report.generated.icon = await page.locator('#title-slot-stepper .u-stepper-icon').first().textContent();
    report.generated.headerScopes = await page.evaluate(() => Object.values(window.stepperFixture.state.generatedHeaderScopes));
    report.generated.titleSlotActions = await page.locator('#title-slot-stepper .u-stepper-actions').count();
    report.generated.titleCustomActions = await page.locator('#title-custom-actions').count();
    report.generated.strictDefaultEditable = await page.locator('#title-slot-stepper > .u-stepper-item').first().isDisabled();
    assert.equal(report.generated.initialValue, 'alpha');
    assert.equal(report.generated.slotModel, 'alpha');
    assert.equal(report.generated.headerCount, 4);
    assert.equal(report.generated.thirdHeaderDisabled, true);
    assert.deepEqual(report.generated.initialActions, ['上一步', '下一步']);
    assert.deepEqual(report.generated.initialActionDisabled, { prev: true, next: false });
    assert.match(report.generated.initialActionColor, /--ui-button-color:\s*var\(--ui-theme-success/);
    assert.deepEqual(report.generated.headerDisabled, [false, true]);
    assert.equal(report.generated.title, 'Custom:Title slot step');
    assert.equal(report.generated.subtitle, 'Title slot details');
    assert.equal(report.generated.icon, 'Z');
    assert.deepEqual(report.generated.headerScopes.map(scope => String(scope.value)).sort(), ['3', 'alpha']);
    assert.equal(report.generated.headerScopes.some(scope => scope.value === 'beta'), false);
    assert.equal(report.generated.headerScopes.find(scope => scope.value === 'alpha').propSubtitle, 'Alpha intro');
    assert.equal(report.generated.titleSlotActions, 0);
    assert.equal(report.generated.titleCustomActions, 0);
    assert.equal(report.generated.strictDefaultEditable, true);

    report.boundary.firstDisabled = {
        prev: await page.locator('#generated-boundary-stepper .u-stepper-actions button').nth(0).isDisabled(),
        next: await page.locator('#generated-boundary-stepper .u-stepper-actions button').nth(1).isDisabled()
    };
    report.boundary.actionLabels = await page.locator('#generated-boundary-stepper .u-stepper-actions button').allTextContents();
    assert.deepEqual(report.boundary.firstDisabled, { prev: true, next: false });
    assert.deepEqual(report.boundary.actionLabels, ['Go back', 'Continue']);
    await page.evaluate(() => window.stepperFixture.state.boundaryValue = 'boundary-last');
    await settle();
    report.boundary.lastDisabled = {
        prev: await page.locator('#generated-boundary-stepper .u-stepper-actions button').nth(0).isDisabled(),
        next: await page.locator('#generated-boundary-stepper .u-stepper-actions button').nth(1).isDisabled()
    };
    assert.deepEqual(report.boundary.lastDisabled, { prev: false, next: true });
    report.boundary.singleDisabled = await page.locator('#generated-single-boundary-stepper .u-stepper-actions button').evaluateAll(buttons => buttons.map(button => button.disabled));
    assert.deepEqual(report.boundary.singleDisabled, [true, true]);
    report.boundary.rootDisabled = await page.locator('#generated-disabled-root-stepper .u-stepper-actions button').evaluateAll(buttons => buttons.map(button => button.disabled));
    assert.deepEqual(report.boundary.rootDisabled, [true, true]);

    report.multiple.initialValue = await page.evaluate(() => window.stepperFixture.state.multipleValue);
    report.multiple.initialVisibleWindow = await page.locator('#multiple-stepper .u-stepper-window-item:visible').getAttribute('data-stepper-value');
    assert.deepEqual(report.multiple.initialValue, ['two', 'one']);
    assert.equal(report.multiple.initialVisibleWindow, 'one');
    await page.locator('#multiple-stepper .u-stepper-item').nth(2).click();
    await settle();
    report.multiple.afterMaxClick = await page.evaluate(() => window.stepperFixture.state.multipleValue);
    assert.deepEqual(report.multiple.afterMaxClick, ['two', 'one']);
    await page.locator('#multiple-stepper .u-stepper-actions button').nth(1).click();
    await settle();
    report.multiple.afterNext = await page.evaluate(() => window.stepperFixture.state.multipleValue);
    assert.deepEqual(report.multiple.afterNext, ['two']);
    await page.locator('#multiple-stepper .u-stepper-actions button').nth(0).click();
    await settle();
    report.multiple.afterPrev = await page.evaluate(() => window.stepperFixture.state.multipleValue);
    assert.deepEqual(report.multiple.afterPrev, ['one']);
    await page.locator('#multiple-stepper .u-stepper-item').nth(1).click();
    await settle();
    report.multiple.afterManualAdd = await page.evaluate(() => window.stepperFixture.state.multipleValue);
    assert.deepEqual(report.multiple.afterManualAdd, ['one', 'two']);
    await page.locator('#multiple-stepper .u-stepper-item').nth(0).click();
    await settle();
    report.multiple.afterManualRemove = await page.evaluate(() => window.stepperFixture.state.multipleValue);
    assert.deepEqual(report.multiple.afterManualRemove, ['two']);
    await page.locator('#multiple-stepper .u-stepper-item').nth(1).click();
    await settle();
    report.multiple.mandatoryLastSelection = await page.evaluate(() => window.stepperFixture.state.multipleValue);
    assert.deepEqual(report.multiple.mandatoryLastSelection, ['two']);

    report.linear.initialValue = await page.evaluate(() => window.stepperFixture.state.linearValue);
    await page.locator('#linear-stepper .u-stepper-item').nth(2).click();
    await settle();
    report.linear.afterDistantClick = await page.evaluate(() => window.stepperFixture.state.linearValue);
    assert.equal(report.linear.initialValue, 'linear-one');
    assert.equal(report.linear.afterDistantClick, 'linear-one');
    await page.locator('#linear-stepper .u-stepper-item').nth(1).click();
    await settle();
    report.linear.afterNextClick = await page.evaluate(() => window.stepperFixture.state.linearValue);
    assert.equal(report.linear.afterNextClick, 'linear-two');
    await page.locator('#linear-stepper .u-stepper-item').nth(2).click();
    await settle();
    report.linear.afterAdjacentClick = await page.evaluate(() => window.stepperFixture.state.linearValue);
    assert.equal(report.linear.afterAdjacentClick, 'linear-three');

    report.verticalMultiple.initialValue = await page.evaluate(() => window.stepperFixture.state.verticalMultipleValue);
    await page.locator('#vertical-multiple-stepper .u-stepper-vertical-item').nth(2).locator('.u-stepper-item').click();
    await settle();
    report.verticalMultiple.afterMaxClick = await page.evaluate(() => window.stepperFixture.state.verticalMultipleValue);
    assert.deepEqual(report.verticalMultiple.initialValue, ['v2', 'v1']);
    assert.deepEqual(report.verticalMultiple.afterMaxClick, ['v2', 'v1']);
    await page.locator('#vertical-multiple-stepper .u-stepper-vertical-item').nth(0).locator('.u-stepper-actions button').nth(1).click();
    await settle();
    report.verticalMultiple.afterNext = await page.evaluate(() => window.stepperFixture.state.verticalMultipleValue);
    assert.deepEqual(report.verticalMultiple.afterNext, ['v2']);
    await page.locator('#vertical-multiple-stepper .u-stepper-vertical-item').nth(1).locator('.u-stepper-actions button').nth(1).click();
    await settle();
    report.verticalMultiple.afterLastStepNext = await page.evaluate(() => window.stepperFixture.state.verticalMultipleValue);
    report.verticalMultiple.finishEvents = await page.evaluate(() => window.stepperFixture.state.finishEvents);
    assert.deepEqual(report.verticalMultiple.afterLastStepNext, ['v3']);
    assert.deepEqual(report.verticalMultiple.finishEvents, []);
    await page.locator('#vertical-multiple-stepper .u-stepper-vertical-item').nth(2).locator('.u-stepper-actions button').nth(1).click();
    await settle();
    report.verticalMultiple.afterFinish = await page.evaluate(() => window.stepperFixture.state.verticalMultipleValue);
    report.verticalMultiple.finishEvents = await page.evaluate(() => window.stepperFixture.state.finishEvents);
    assert.deepEqual(report.verticalMultiple.afterFinish, ['v3']);
    assert.deepEqual(report.verticalMultiple.finishEvents, ['finish']);
    assert.equal(await page.locator('#generated-legacy-slot').textContent(), 'alpha');
    await page.locator('#generated-stepper .u-stepper-actions button').nth(1).click();
    await settle();
    report.generated.valueAfterAction = await page.evaluate(() => window.stepperFixture.state.generatedValue);
    report.generated.actionEvents = await page.evaluate(() => window.stepperFixture.state.generatedEvents);
    report.generated.dynamicHeader = await page.locator('#generated-dynamic-header').textContent();
    report.generated.dynamicBody = await page.locator('[data-generated-body="beta"]').textContent();
    assert.equal(report.generated.valueAfterAction, 'beta');
    assert.deepEqual(report.generated.actionEvents, [{ name: 'next', mouseEvent: true }]);
    assert.equal(report.generated.dynamicHeader, 'Beta generated:beta:Beta body');
    assert.equal(report.generated.dynamicBody, 'Beta body');
    assert.equal(await page.locator('#generated-legacy-slot').textContent(), 'beta');

    report.item.firstState = await page.evaluate(() => {
        const scope = window.stepperFixture.firstItemScope;
        return { active: scope.active, canEdit: scope.canEdit, hasError: scope.hasError, hasCompleted: scope.hasCompleted, title: scope.title, subtitle: scope.subtitle, step: scope.step, value: scope.value };
    });
    report.item.explicitState = await page.evaluate(() => {
        const scope = window.stepperFixture.secondItemScope;
        return { hasError: scope.hasError, hasCompleted: scope.hasCompleted, complete: scope.complete, step: scope.step, value: scope.value };
    });
    assert.equal(report.item.firstState.active, true);
    assert.equal(report.item.firstState.canEdit, true);
    assert.equal(report.item.firstState.hasError, true);
    assert.equal(report.item.firstState.hasCompleted, false);
    assert.equal(report.item.firstState.subtitle, 'Details');
    assert.equal(report.item.firstState.step, 1);
    assert.equal(report.item.firstState.value, 'first');
    assert.equal(report.item.explicitState.hasError, false);
    assert.equal(report.item.explicitState.hasCompleted, true);
    assert.equal(report.item.explicitState.complete, true);
    report.item.strictEditable = await page.evaluate(() => ({
        canEdit: window.stepperFixture.lockedItemScope.canEdit,
        disabled: document.querySelectorAll('#manual-stepper .u-stepper-item')[2].disabled
    }));
    assert.deepEqual(report.item.strictEditable, { canEdit: false, disabled: true });

    await page.evaluate(() => window.stepperFixture.state.rulePass = true);
    await settle();
    report.item.validRules = await page.locator('#manual-stepper .u-stepper-item').first().getAttribute('class');
    assert.match(report.item.validRules, /is-complete/);
    assert.doesNotMatch(report.item.validRules, /is-error/);

    await page.locator('#manual-stepper .u-stepper-item').nth(1).click();
    await settle();
    report.legacy.valueAfterHeaderClick = await page.evaluate(() => window.stepperFixture.state.manualValue);
    report.windowItem.customTransitionClass = await page.locator('#window-content-second').evaluate(element => element.parentElement.className);
    assert.equal(report.legacy.valueAfterHeaderClick, 'second');
    assert.match(report.windowItem.customTransitionClass, /stepper-transition-enter-active/);
    report.item.groupSelectedEvents = await page.evaluate(() => window.stepperFixture.state.selectedEvents);
    assert.ok(report.item.groupSelectedEvents.some(event => event.step === 'second' && event.value === true));
    assert.ok(report.item.groupSelectedEvents.some(event => event.window === 'second' && event.value === true));

    await page.evaluate(() => window.stepperFixture.getWindow()?.prev());
    await settle();
    report.windowItem.reverseTransitionClass = await page.locator('#window-content-first').evaluate(element => element.parentElement.className);
    assert.match(report.windowItem.reverseTransitionClass, /u-fade-enter-active/);

    await page.locator('#legacy-prev').click();
    await settle();
    report.legacy.valueAfterPrev = await page.evaluate(() => window.stepperFixture.state.manualValue);
    report.legacy.actionEvents = await page.evaluate(() => window.stepperFixture.state.manualActionEvents);
    assert.equal(report.legacy.valueAfterPrev, 'first');
    assert.deepEqual(report.legacy.actionEvents, ['prev']);

    report.windowItem.attrsLocation = await page.locator('#window-content-first').evaluate(element => element.classList.contains('u-stepper-window-item'));
    assert.equal(report.windowItem.attrsLocation, true);
    report.windowItem.transitionBehavior = 'transition/reverseTransition supplied to the wrapped UWindowItem; group:selected bubbled through the wrapper';

    report.actions.defaultButtons = await page.locator('#action-default button').allTextContents();
    report.actions.defaultDisabled = {
        prev: await page.locator('#action-default button').nth(0).isDisabled(),
        next: await page.locator('#action-default button').nth(1).isDisabled()
    };
    await page.evaluate(() => window.stepperFixture.setLocale('en'));
    await settle();
    report.actions.localizedToken = await page.locator('#action-default button').nth(1).textContent();
    report.actions.localizedDefaults = await page.locator('#generated-stepper .u-stepper-actions button').allTextContents();
    assert.deepEqual(report.actions.defaultButtons, ['Back', '向后滚动标签页']);
    assert.deepEqual(report.actions.defaultDisabled, { prev: true, next: false });
    assert.equal(report.actions.localizedToken, 'Scroll tabs forward');
    assert.deepEqual(report.actions.localizedDefaults, ['Previous', 'Next']);
    await page.locator('#action-default button').nth(1).click();
    await page.locator('#slot-prev').click();
    assert.deepEqual(await page.evaluate(() => window.stepperFixture.state.actionEvents), [
        { name: 'default-next', mouseEvent: true },
        'slot-prev'
    ]);
    assert.equal(await page.locator('#slot-next').isDisabled(), true);
    report.actions.slotDisabled = { prev: await page.locator('#slot-prev').isDisabled(), next: await page.locator('#slot-next').isDisabled() };
    assert.deepEqual(report.actions.slotDisabled, { prev: false, next: true });
    report.actions.verticalDisabled = {
        prev: await page.locator('#vertical-action-prev').isDisabled(),
        next: await page.locator('#vertical-action-next').isDisabled()
    };
    assert.deepEqual(report.actions.verticalDisabled, { prev: true, next: false });
    await page.locator('#vertical-action-next').click();
    report.actions.verticalEvents = await page.evaluate(() => window.stepperFixture.state.actionEvents.slice(-1));
    assert.deepEqual(report.actions.verticalEvents, [{ name: 'vertical-next', mouseEvent: true }]);

    report.vertical.initialValue = await page.evaluate(() => window.stepperFixture.state.verticalValue);
    report.vertical.header = await page.locator('#dynamic-vertical-header').textContent();
    report.vertical.genericBody = await page.locator('[data-generic-item="one"]').textContent();
    report.vertical.itemActionLabels = await page.locator('#vertical-stepper .u-stepper-vertical-item').nth(0).locator('.u-stepper-actions button').allTextContents();
    report.vertical.itemActionColor = await page.locator('#vertical-stepper .u-stepper-vertical-item').nth(0).locator('.u-stepper-actions button').nth(1).getAttribute('style');
    report.vertical.rootActionLabels = await page.locator('#vertical-stepper .u-stepper-vertical-item').nth(2).locator('.u-stepper-actions button').allTextContents();
    report.vertical.rootActionColor = await page.locator('#vertical-stepper .u-stepper-vertical-item').nth(2).locator('.u-stepper-actions button').nth(1).getAttribute('style');
    report.vertical.editableHeaders = [
        await page.locator('#vertical-stepper .u-stepper-vertical-item').nth(0).locator('.u-stepper-item').isDisabled(),
        await page.locator('#vertical-stepper .u-stepper-vertical-item').nth(2).locator('.u-stepper-item').isDisabled()
    ];
    assert.equal(report.vertical.initialValue, 'one');
    assert.equal(report.vertical.header, 'Vertical one:one');
    assert.equal(report.vertical.genericBody, 'one body');
    assert.deepEqual(report.vertical.itemActionLabels, ['Item back', 'Item continue']);
    assert.match(report.vertical.itemActionColor, /--ui-button-color:\s*var\(--ui-theme-success/);
    assert.deepEqual(report.vertical.rootActionLabels, ['Root back', 'Root continue']);
    assert.match(report.vertical.rootActionColor, /--ui-button-color:\s*var\(--ui-theme-warning/);
    assert.deepEqual(report.vertical.editableHeaders, [false, false]);
    assert.equal(await page.locator('#dynamic-vertical-item').textContent(), 'three body:three');
    report.vertical.closedCollapse = await page.locator('#vertical-stepper .u-stepper-vertical-item').nth(2).locator('.ui-collapse').getAttribute('aria-hidden');
    assert.equal(report.vertical.closedCollapse, 'true');

    report.vertical.nextDisabledBeforeRule = await page.locator('#vertical-stepper .u-stepper-vertical-item').first().locator('.u-stepper-actions button').nth(1).isDisabled();
    assert.equal(report.vertical.nextDisabledBeforeRule, true);
    await page.evaluate(() => window.stepperFixture.state.verticalRulePass = true);
    await settle();
    report.vertical.nextDisabledAfterRule = await page.locator('#vertical-stepper .u-stepper-vertical-item').first().locator('.u-stepper-actions button').nth(1).isDisabled();
    assert.equal(report.vertical.nextDisabledAfterRule, false);
    await page.locator('#vertical-stepper .u-stepper-vertical-item').first().locator('.u-stepper-actions button').nth(1).click();
    await settle();
    report.vertical.valueAfterNext = await page.evaluate(() => window.stepperFixture.state.verticalValue);
    report.vertical.skippedDisabled = report.vertical.valueAfterNext === 'three';
    assert.equal(report.vertical.skippedDisabled, true);
    assert.equal(await page.locator('#dynamic-vertical-item').textContent(), 'three body:three');
    report.vertical.collapseOpen = await page.locator('#vertical-stepper .u-stepper-vertical-item').nth(2).locator('.ui-collapse').getAttribute('aria-hidden');
    assert.equal(report.vertical.collapseOpen, 'false');
    report.verticalItem.initialCanEdit = await page.evaluate(() => window.stepperFixture.state.verticalItemCanEdit);
    report.verticalItem.initialDisabled = await page.locator('#manual-vertical-header').locator('xpath=ancestor::button').isDisabled();
    assert.deepEqual({ canEdit: report.verticalItem.initialCanEdit, disabled: report.verticalItem.initialDisabled }, { canEdit: false, disabled: true });
    await page.evaluate(() => window.stepperFixture.state.verticalValue = 'manual-vertical');
    await settle();
    report.verticalItem.valueAfterModelUpdate = await page.evaluate(() => window.stepperFixture.state.verticalValue);
    report.verticalItem.selectedEvents = await page.evaluate(() => window.stepperFixture.state.verticalItemEvents);
    assert.equal(report.verticalItem.valueAfterModelUpdate, 'manual-vertical');
    assert.deepEqual(report.verticalItem.selectedEvents, [{ value: true }]);
    await page.locator('#vertical-stepper .u-stepper-vertical-item').nth(3).locator('.u-stepper-actions button').nth(0).click();
    await settle();
    report.verticalItem.actionEvents = await page.evaluate(() => window.stepperFixture.state.verticalItemActionEvents);
    report.verticalItem.selectedEvents = await page.evaluate(() => window.stepperFixture.state.verticalItemEvents);
    report.verticalItem.valueAfterPrev = await page.evaluate(() => window.stepperFixture.state.verticalValue);
    assert.deepEqual(report.verticalItem.selectedEvents, [{ value: true }, { value: false }]);
    assert.deepEqual(report.verticalItem.actionEvents, [{ name: 'prev', mouseEvent: true }]);
    assert.equal(report.verticalItem.valueAfterPrev, 'three');

    assert.deepEqual(errors, []);
    report.evidence = evidence;
    await writeFile(path.join(evidence, 'report.json'), JSON.stringify(report, null, 4), 'utf8');
    console.log(JSON.stringify(report, null, 4));
} finally {
    await browser.close();
    await server.close();
}

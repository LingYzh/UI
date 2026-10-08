import { readFile, writeFile } from 'node:fs/promises';

// Only human-reviewed repairs belong here. Matching a newly declared prop is
// not evidence that its upstream contract has been implemented.
const repairs = {
    URadio: { state: 'partially-verified', features: ['RadioGroup coordination', 'trueValue and comparator', 'group name, disabled and readonly', 'Form validation and reset'], evidence: ['tests/desktop/radio-group-alignment.mjs', 'tests/tsconfig.radio.json'] },
    USelectionControl: { state: 'partially-verified', features: ['standalone name', 'radio trueValue-only and comparator', 'group selection and guards'], evidence: ['tests/desktop/radio-group-alignment.mjs'] },
    UForm: { state: 'partially-verified', features: ['inline rules arrays without recursive rendering', 'fresh inline callbacks without cancelled validation', 'in-place rule changes including equal-body closures'], evidence: ['tests/desktop/radio-group-alignment.mjs'] },
    UWindow: { state: 'partially-verified', features: ['reactive disabled', 'mandatory initial first registration', 'disabled exposed next, keyboard and touch'], evidence: ['tests/group-reactivity.test.ts', 'tests/desktop/group-reactivity.mjs'] },
    UCarousel: { state: 'partially-verified', features: ['reactive disabled in shared group and navigation'], evidence: ['tests/desktop/group-reactivity.mjs'] },
    UStepper: { state: 'partially-verified', features: ['reactive mandatory and disabled', 'controlled initial selection'], evidence: ['tests/desktop/group-reactivity.mjs'] },
    UExpansionPanels: { state: 'partially-verified', features: ['reactive shared-group flags', 'mandatory and unmount fallback'], evidence: ['tests/desktop/group-reactivity.mjs'] },
    UCounter: { state: 'partially-verified', features: ['explicit raw-value display with legacy codepoint default', 'max string', 'disabled over-limit color', 'standard default slot scope'], evidence: ['tests/desktop/component-repair-protocols.mjs'] },
    UField: { state: 'partially-verified', features: ['approved old UFormField and UiField preservation', 'new input surface and seven variants', 'focused model, slots and clear/affix events'], evidence: ['tests/desktop/component-repair-protocols.mjs'] },
    UPicker: { state: 'partially-verified', features: ['approved old UOptionPicker preservation', 'new title/header/body/actions container', 'legacy items model extension and dimensions'], evidence: ['tests/desktop/component-repair-protocols.mjs'] },
    UHotkey: { state: 'partially-verified', features: ['approved old UHotkeyListener preservation', 'platform, displayMode and keyMap', 'combination, alternative and sequence display', 'preserved opt-out trigger listener'], evidence: ['tests/hotkey.test.ts', 'tests/desktop/component-repair-protocols.mjs'] },
    UImg: { state: 'partially-verified', features: ['image sources, responsive dimensions and native attributes', 'explicit URL event protocol with legacy Event default', 'lazySrc, options, eager, slots and exposed state', 'stale native callbacks and equivalent inline src objects do not reload'], evidence: ['tests/desktop/media-scroll-protocols.mjs', 'tests/tsconfig.media-scroll.json'] },
    UInfiniteScroll: { state: 'partially-verified', features: ['approved old/new direction plus side', 'independent edge state, callbacks and reset generations', 'manual/intersect and prepend scroll preservation', 'real horizontal and two-edge demos'], evidence: ['tests/desktop/infinite-scroll-state.mjs', 'tests/desktop/media-scroll-protocols.mjs'] },
    UTooltip: { state: 'partially-verified', features: ['explicit activator/content protocol with legacy default', 'interactive content, external activator and positioning', 'scroll strategies, dimensions and lifecycle', 'click visibility survives pointer blur and leave when hover mode is off'], evidence: ['tests/desktop/tooltip-protocols.mjs', 'tests/desktop/lazy-responsive-protocols.mjs'] },
    UResponsive: { state: 'partially-verified', features: ['six dimensions with numeric strings', 'contentClass, additional slot and inline geometry', 'legacy ratio and width/height derivation', 'real 640px limit and narrow layout without horizontal overflow'], evidence: ['tests/desktop/lazy-responsive-protocols.mjs'] },
    ULazy: { state: 'partially-verified', features: ['controlled visibility, observer options, once and disabled', 'stale observer callback rejection and cleanup', 'continuous observer retention prevents duplicate notification', 'atomic reenable plus controlled visibility reset'], evidence: ['tests/desktop/lazy-responsive-protocols.mjs'] },
    UMessages: { state: 'partially-verified', features: ['active model-independent visibility with preserved visible default', 'per-message slot and legacy whole-list override', 'color and configurable transition'], evidence: ['tests/desktop/text-messages-protocols.mjs'] },
    ULabel: { state: 'partially-verified', features: ['text before preserved default content and required marker', 'native label association, disabled and attributes'], evidence: ['tests/desktop/text-messages-protocols.mjs'] },
    UParallax: { state: 'partially-verified', features: ['explicit standard scale with preserved speed/background', 'direct image sources, URL events and image slots', 'nested scrolling, dimensions and reduced motion'], evidence: ['tests/desktop/media-containers-protocols.mjs', 'tests/tsconfig.media-containers.json'] },
    UPullToRefresh: { state: 'partially-verified', features: ['gesture state with nearest actual scroll boundary', 'load and legacy refresh sharing idempotent completion', 'pullDownThreshold and pullDownPanel with legacy indicator', 'real mouse/touch and async documentation demo'], evidence: ['tests/desktop/pull-refresh-state.mjs', 'tests/desktop/media-containers-protocols.mjs'] },
    ULocaleProvider: { state: 'partially-verified', features: ['ancestor custom messages, fallback and RTL inheritance', 'nested string dictionaries with flat and namespace priority', 'fallbackLocale alias with legacy fallback priority', 'real public provider demo and reactive language changes'], evidence: ['tests/locale-context.test.ts', 'tests/desktop/locale-provider-protocols.mjs'] },
    UDataIterator: { state: 'partially-verified', features: ['independent state helper integrated with real public component', 'legacy raw and explicit wrapped item protocols', 'filter/sort/group/pagination/selection/expansion', 'public Chromium fixture and real demo; Electron host creation remains unverified'], evidence: ['tests/data-iterator-state.test.ts', 'tests/desktop/data-iterator-protocols.mjs'] },
    UItemGroup: { state: 'partially-verified', features: ['user-approved standard selected ID slot and preserved value toggle', 'reactive item registration, navigation and force mandatory', 'keyed rendered order synchronized through actual slot renderer', 'form validation/reset and button/chip registry integration'], evidence: ['tests/item-group-state.test.ts', 'tests/desktop/item-group-protocols.mjs'] },
    UItem: { state: 'partially-verified', features: ['selectedClass and group:selected payload', 'registered index fallback, standard item slot and explicit renderless tag', 'legacy button wrapper retained'], evidence: ['tests/item-group-state.test.ts', 'tests/desktop/item-group-protocols.mjs'] },
    UChip: { state: 'partially-verified', features: ['item group registration and omitted-value index', 'selectedClass and group:selected with preserved selected override', 'live selection constraints through public chip group'], evidence: ['tests/desktop/item-group-protocols.mjs'] },
    UChipGroup: { state: 'partially-verified', features: ['inherited registered chip values, index fallback and rendered order', 'max, disabled, selected classes and public v-model arrays'], evidence: ['tests/desktop/item-group-protocols.mjs'] },
    UBtnToggle: { state: 'partially-verified', features: ['registered button values and index fallback', 'max, disabled, selected classes and public v-model arrays'], evidence: ['tests/desktop/item-group-protocols.mjs'] },
    UButton: { state: 'partially-verified', features: ['button-toggle registry tracks current value/disabled/loading', 'group and item selectedClass with preserved styling'], evidence: ['tests/desktop/item-group-protocols.mjs'] }
};
const directory = new URL('../docs/component-audit-2026-10-08/', import.meta.url);
const batches = await Promise.all([1, 2, 3].map(async batch => JSON.parse(await readFile(new URL(`results-${batch}.json`, directory), 'utf8'))));
const components = batches.flatMap(batch => batch.components).map(component => ({
    name: component.name,
    upstreamName: component.upstreamName,
    originalClassification: component.classification,
    repair: repairs[component.name] ?? { state: 'pending', features: [], evidence: [] },
    // Keep the original gap lists intact until each contract is individually
    // accepted; a partly repaired component can still have many remaining gaps.
    originalGaps: { props: component.confirmedMissingProps, events: component.confirmedMissingEvents, slots: component.confirmedMissingSlots },
    reviewNotes: component.contractNotes
}));
if (components.length !== 153 || new Set(components.map(component => component.name)).size !== 153) throw new Error('Repair ledger requires the complete 153-component historical audit.');
const counts = {};
for (const { repair } of components) counts[repair.state] = (counts[repair.state] ?? 0) + 1;
const ledger = {
    baseline: 'Vuetify 4.2.4',
    status: 'in-progress',
    scope: 'All original 153 canonical components; added preserved names are listed separately.',
    verificationBoundary: 'Targeted behavior tests and source browser evidence only. Partial verification is never full component alignment.',
    counts,
    preservedNames: [{ name: 'UFormField', previousName: 'UField', compatibilityAlias: 'UiField' }, { name: 'UOptionPicker', previousName: 'UPicker' }, { name: 'UHotkeyListener', previousName: 'UHotkey' }],
    components
};
await writeFile(new URL('REPAIR-LEDGER.json', directory), JSON.stringify(ledger, null, 4) + '\n', 'utf8');
console.log(JSON.stringify({ audited: components.length, counts }));

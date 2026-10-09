# UTreeview registration contract

## Registration and selection

- `itemsRegistration` defaults to `render`. Render registration derives selection and activation relationships from the logical visible tree rows, excluding divider and subheader rows. A visible branch keeps a `children` entry when its descendants are collapsed or filtered out, so it does not become a leaf.
- `itemsRegistration="props"` uses the complete nested items index, including descendants that are not rendered.
- The complete `allNodes` index remains the source for item lookup, filtering, loading, raw IDs, comparator resolution, and return-object conversion. Changes to opened state or search do not emit model updates or clear values that temporarily have no rendered row.
- In render mode, explicit selection or activation of an item that is not registered is a no-op. Props mode accepts those operations for any item in the complete tree.
- `activeStrategy` defaults to `single-independent`; row clicks and exposed/slot `activate` toggle the active item. `independent`, `leaf`, and `single-leaf` use the shared `createSelectStrategy` implementation. Selection and activation retain separate models, canonical item IDs, `valueComparator`, `returnObject`, disabled, readonly, and mandatory behavior.

## Empty state and language

- An empty logical visible tree displays the nearest `$vuetify.noDataText` translation. If that token is absent, it falls back to the localized `common.empty` message.
- `hideNoData` suppresses the empty state. The `no-data` slot receives the current `search` value and replaces the localized text.

## Focused validation

- Isolated component typecheck: `node scripts/typecheck.cjs --noEmit -p tests/tsconfig.tree-registration.json`.
- Chrome component protocol: `node tests/desktop/tree-registration-protocols.mjs`. The fixture imports `UTreeview.vue` directly to remain independent of unrelated public-entry changes during the overlay work. Its report records source hashes, assertions, browser errors, unhandled rejections, console messages, and Vue warnings under `artifacts/component-audit-root/tree-registration-protocols/report.json`.

## 2026-10-09 evidence

- Isolated typecheck passed. `npx tsx --test tests/treeview-state.test.ts` passed 7/7.
- Direct-component Chrome protocol passed 16 checks: collapsed render/props registration, hidden operations, expansion/collapse/filter retention, openAll plus loader, activation strategies and toggles, selection strategies and mandatory/disabled/readonly behavior, returnObject/comparator mapping, and localized empty/search states with hide/slot behavior.
- The browser report records zero window errors, unhandled rejections, page errors, console errors, and Vue warnings. No full build was run; the fixture intentionally bypassed the temporarily changing public entry during concurrent Overlay work.

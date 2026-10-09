# UTreeview completion contract

## Filtering

- `items` defaults to an empty array. `filterKeys` continues to accept a selector function or a list of selectors.
- Treeview filtering follows `src/ui/selection-filter.ts` mode accounting and the shared `findMatchRanges` helper. With the default `intersection` mode and no custom key filters, default fields keep the existing any-field match behavior.
- `customFilter(value, trimmedQuery, rawItem)` keeps its existing callback signature. `customKeyFilter` uses the same raw item argument. Boolean values, numeric match positions, and non-empty match-range arrays are accepted; `false`, `-1`, nullish values, and empty arrays do not match.
- `ignoreAccents` accepts `true`, `false`, `'query'`, and `'target'`. `noFilter` bypasses matching and does not automatically expand branches.
- A matching item keeps its ancestor path; a matching branch keeps its descendants.

## Rows, models, and events

- `openAll` initializes and follows branch IDs only while `opened` is uncontrolled. An explicit `opened=[]` remains authoritative. Opened values use the existing `returnObject` mapping, and newly discovered open-all branches use the existing load-children path.
- `itemType` recognizes `item`, `divider`, and `subheader`; presentation rows do not act as treeitems or branches.
- The `item` slot replaces default row contents. `title` retains its existing `item`, `title`, `internalItem`, selection, disabled, loading, error, `open`, and `select` fields. `prepend`, `append`, `toggle`, `loader`, `actions`, `divider`, and `subheader` slots receive the original item and item state; row actions can use `open`, `select`, and `toggleOpen` callbacks.
- `click:open` and `click:select` emit `{ id, value, path, event? }`. `path` is the root-to-item chain of IDs. Row and toggle clicks preserve the original event; slot or exposed-method operations omit `event` when no DOM event initiated the action.

## Focused validation

- State tests: `npx tsx --test tests/treeview-state.test.ts`.
- Isolated typecheck: `node scripts/typecheck.cjs --noEmit -p tests/tsconfig.treeview-completion.json`.
- Public component browser protocol: `node tests/desktop/treeview-completion-protocols.mjs` starts Vite and installed Chrome with `channel: 'chrome'`; it does not run a full library build. It also exercises initial `openAll` with `loadChildren`, including the synchronous setup watch path.

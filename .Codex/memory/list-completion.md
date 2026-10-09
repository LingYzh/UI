# UList completion

## Protocol

- `UList` uses the shared `selection.ts` value comparator by default. Registered object values remain objects; external model values are canonicalized against registered values before selection and activation strategies run.
- The default active strategy is `single-independent`; `independent`, `leaf`, and `single-leaf` are available through `active-strategy`. The selection strategy remains controlled by `select-strategy` and `multiple`.
- `navigation-strategy="track"` keeps the root as the tab stop, gives rows stable IDs and `tabindex="-1"`, and updates `aria-activedescendant` from the visible enabled row index. The default focus strategy keeps DOM focus on individual rows.
- `#item` replaces a generated item's full row. Its scope provides the raw `item`, `internalItem`, `index`, state/actions, and a complete `props` object to bind to `UListItem`. Use `#title`, `#subtitle`, `#prepend`, or `#append` for content-only customization.
- Hand-written `UListItem` and `UListGroup` registrations are available in the root registration snapshot, including their associated DOM refs. Event payloads include the canonical `id`, boolean `value`, ancestor `path`, and originating `event` when available.
- Existing `UList` examples in `src/ui/docs/component-examples/list.vue`, `list-item.vue`, and `list-group.vue` do not use the root `#item` slot, so this protocol change has no List demo migration. Other `#item` hits belong to Tabs, Stepper, or table components.

## Focused verification

- `npx tsx --test tests/list-completion.test.ts`
- `npx vue-tsc --noEmit -p tests/tsconfig.list-completion.json`
- `node tests/desktop/list-completion-protocols.mjs` (Vite virtual fixture; launches the installed Chrome channel and checks runtime errors, unhandled rejections, console errors/warnings, and Vue warnings)

The desktop fixture covers tracked and focused navigation, hidden/disabled rows, hand-written group activators, nested controls, object comparators, active strategies, full-row and title slots, exposed methods/registration refs, and root readonly/disabled behavior.

Root completion: exposed focusAt/focus also keep DOM focus on the root in track mode; data-ui-list-tracked and focus-visible styling identify the tracked row. The Chrome protocol now passes 12 groups, including these exposed methods. ListNavigationDemo renders real object values/full-row slots; the shared handoff demo runner passes 19 groups and Root reviewed the light/dark/390px/125% captures.

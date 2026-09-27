# Described select verification

2026-09-27. Shared library implementation verified; final visual acceptance belongs to root before UAH integration.

API: `UiSelect` accepts optional `items: SelectItem[]` and `menuTitle`. `SelectItem` has string `value` and `label`, optional `description`, `hint`, and `disabled`. Existing slot/optgroup mode remains available when items is omitted. Hints only display supplied text; no shortcuts or permission policy are implemented by the component.

The base-select picker uses UiScrollArea, a muted title, two-line option copy, and right-side selected checkmark. Native selectedcontent supplies the short closed label. Browsers without base-select render short-label native options.

Validation passed:

- `npm run typecheck` and `npm run build`.
- `node tests/desktop/described-select.mjs`: real Electron mouse click on description, pointer blur, keyboard focus retention, ArrowDown/Enter selection, End skipping disabled final item, Escape dismissal, closed short label, and native fallback structure/selection with base-select feature detection disabled.
- `node tests/desktop/select-groups.mjs`: existing grouped picker scroll and native keyboard regression.
- `node tests/desktop/ui.mjs`: 20 checks including all 27 documentation routes, numeric select values, keyboard interaction, responsive and zoom behavior, and existing shared component states.

Evidence: `artifacts/described-select-IL4BXH` contains light-menu.png, dark-menu.png, light-900x800-125.png and dark-900x800-125.png. Full regression evidence: `artifacts/ui-BULiKd`; grouped selector: `artifacts/select-groups-TbeIYj`.

Worker visual review: title, description contrast, right checkmark alignment and menu fitting were inspected in light theme and dark theme at 900x800/125%. Root must review these screenshots against the supplied reference. The native fallback retains native platform styling and omits descriptions. No new dependencies or UAH files were changed.

Root acceptance (2026-09-27): inspected light-menu.png and dark-900x800-125.png. Two-line labels, muted descriptions, right-aligned check, focus outline and menu bounds meet reference layout. Approved for UAH integration.

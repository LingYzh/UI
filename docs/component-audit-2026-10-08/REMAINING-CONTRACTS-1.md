# Remaining contract review: audit batch 1

Source assessment snapshot: 2026-10-08T17:45:23.623Z. Covers all 617 baseline candidates across 45 rows (348 props, 55 events, 214 slots). The corrections below preserve that reviewed snapshot and explicitly mark later source changes stale until re-reviewed.

This is a source-only review. Each candidate is classified in the JSON with the local SFC/consumer anchor and an official Vuetify 4.2.4 source anchor when available. Reviewed and current hashes are recorded per SFC and relevant helper/child. API/demo synchronization and visual acceptance are not claimed. A changed hash makes that row stale until its actual consumer path is reread.

## Behavior gaps recorded in the reviewed snapshot

- **USelect / UAutocomplete / UCombobox** — The 2026-10-08 snapshot recorded `UAutocomplete.vue:126,417-429` keeping the popup in an internal fixed container, with menu/list positioning candidates absent. `USelect` has since changed; the family route claim needs current consumer-path review before it is treated as a current gap.
- **UDateInput** — The 2026-10-08 snapshot recorded `UDateInput.vue:69` binding `menuProps` to a plain div. This file changed after review, so the placement/attach/scroll/dismiss claim is stale pending re-review.
- **UCalendar / UDateInput / UDatePicker / USelect** — these files changed after the 2026-10-08 review. Their candidate classifications and findings below are stale until their current consumer paths are reread; the JSON preserves each reviewed hash and records the currently observed hash separately.
- **USwitch** — the 2026-10-08 reviewed hash predates the current implementation. Current source declares the `indeterminate` prop/model/update path and renders `label`, `details`, `message`, `loader`, `thumb`, `track-true`, and `track-false`; upstream `input` is internal to VSwitch, not a user customization slot. Current source hash and reviewed hash are both retained in JSON. Runtime/browser acceptance remains pending.
- **UFileInput / UFileUpload** — file model, accept/multiple/size validation and drop/change paths exist; `filterByType` and the listed standard selection/browse/item/loader slot/text customizations are absent from their current public path.
- **UNumberInput** — locale parsing/formatting and pointer hold-repeat are implemented; counter/persistentCounter/clearable/loading/prefix/suffix and standard field slots are not consumed by the current control.

## Corrected historical findings

- `URadio` and `URadioGroup` share the selection model through `selectionGroupKey`; the old independent-model claim is corrected.
- `UTextarea` now applies pixel `maxHeight` and emits `update:rows`.
- `UCounter` keeps the user-approved `active=true` and Unicode code-point length defaults; `displayMode="value"` displays the original string. Its default slot exposes `counter`, `max`, and `value`.
- The reviewed date-protocol finding was ISO-compatible input with `Date` output; the affected Select/DateInput/Calendar/DatePicker rows are marked stale where their source changed after that review.
- Calendar category/time/event helpers and `click:*` events are connected; old prefix-only parsing/Sunday-default notes are superseded.
- UItem, UItemGroup, UMessages, UCounter, UValidation and UPicker have changed since the historical audit; see current hashes and semantic dispositions.

## Suggested batches

- **select-menu-route** (USelect, UAutocomplete, UCombobox): shared menu positioning and dismissal while retaining current model/filter behavior.
- **date-menu-calendar** (UDateInput, UDatePicker, UCalendar, UTimePicker): date menu route and remaining calendar field/slot contracts.
- **form-slot-edges** (UTextField, UTextarea, UInput, UField, UValidation): form scope and field wrapper parity.
- **file-controls** (UFileInput, UFileUpload): missing filtering and file customization contracts.
- **numeric-controls** (UNumberInput, USlider, URangeSlider, URating): remaining field/control slots while preserving approved defaults.

`REMAINING-CONTRACTS-1.json` contains the exact candidate-by-candidate dispositions, source hashes, semantic rechecks, upstream references and the verification boundary.

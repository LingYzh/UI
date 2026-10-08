# Remaining contract review - batch 3

Snapshot 2026-10-08T17:11:43.714Z UTC; local date 2026-10-09 Asia/Hong_Kong.
Coverage: 53 components; 650 props, 33 events, 35 slots; 108 semantic findings.
Dispositions: intentionally-different 58; still-missing 368; implemented 274; different-contract 3; implemented-via-child-forwarding 12; partially-implemented 3; declared-but-not-emitted 0.
Confirmed-missing candidates in results-3: 592 props, 33 events, 35 slots.
Sources modified since baseline: UButton, UDialog, UTable, UIcon, UChip, UAlert, UMenu, UAvatar, UBadge, UBanner, UDivider, UEmptyState, UFab, UHotkey, UHover, UProgressLinear, USkeletonLoader, USnackbar, USnackbarQueue, USparkline, UTimeline, UTimelineItem.
No hash changed after review snapshot.

## Current findings

- UButton route/group events and prepend/append slots work. UChip modelValue controls visibility rather than selection, and its default slot lacks selection scope. UFab modelValue/update:modelValue match official VFab: modelValue gates app-layout registration, active controls visibility, and button clicks do not write the model.
- Tooltip, Dialog and Menu consume most activator, positioning, dimensions, lifecycle and back-navigation paths. Remaining overlay props are enumerated per candidate in JSON, including Tooltip stickToTarget/viewportMargin/opacity/scrim, Dialog focus/presentation props, and Menu retention/attach/transition props.
- DataIterator has working models, slot operations and event paths; showSelect, showExpand and pageBy have no consumer. Local page-size-10/raw-item defaults are preserved behind standardProtocol.
- Several content slots/events from the old audit are implemented in current SFCs: Chip, Alert, Avatar, Badge, Banner, Divider, EmptyState; UProgressLinear clickable/reverse and UResponsive additional are consumed.
- Remaining media/scroll contract differences and visual/size props are enumerated in JSON.

## Limits

- Handoff/RESUME preserves UImg native Event load/error defaults, UTooltip trigger-default slot, and DataIterator raw-item/page-size-10 behind standardProtocol. No defaults were changed by this audit.
- Existing test paths were not executed. API/demo sync was not re-audited. No source, demo, API, test or earlier audit file was modified.

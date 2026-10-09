# Tooltip back protocol

`UTooltip.closeOnBack` stays undefined by default, so the existing false behavior remains. When explicitly enabled, `UiTooltip` registers its bubble with the shared overlay stack and delegates Vue Router back handling to `useOverlayBack`; a persistent tooltip stays open while the Router guard cancels back navigation. The direct `popstate` fallback is installed only when `$router` does not expose both `beforeEach` and `afterEach`; Router must see the event first so a guard can cancel navigation.

Closing, replacing the bubble, changing `attach`/`contained`, KeepAlive deactivation, and unmount remove the previous stack entry, hide an open popover, release this tooltip's scroll token, and clear timers. KeepAlive deactivation retains the model value; activation presents its current value again. ResizeObserver callbacks queue one cancellable animation frame for positioning, and positioning writes `left`/`top` only when either value changes.

## Verification

- `node scripts/typecheck.cjs --noEmit -p tests/tsconfig.tooltip-back.json` passed.
- `node tests/desktop/tooltip-back-protocols.mjs` passed 7 protocol groups in installed Chrome; 0 browser errors and 0 Vue warnings.
- Report: `artifacts/component-audit-root/tooltip-back-protocols/report.json`.
- Fixed Vue Router fixture: `artifacts/full-alignment/vue-router/package/dist/vue-router.esm-browser.prod.js`, SHA-256 `11472cc319a0eea5df6b9e38b5e1440b03e7ab6b381fb11bd9fade7810128be9`.
- Source SHA-256: `src/ui/UiTooltip.vue` `d3b9190f3e23c15c1b9f0fecfb7e079d2f1fb53988da584097fbda81b2797107`; `src/ui/overlay-back.ts` `5033e3184ca2e75a214619c6b192ba71d7db6764c6fa9a3ebc94f940ec02cc19`; `src/ui/overlay-lifecycle.ts` `e242712eacb840339fff247dd692f4f5e1eefd834b858b6f6a1d8f5824014668`.

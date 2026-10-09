# Overlay container DOM protocols

## Scope

- UOverlay, UDialog and UMenu share .ui-overlay-layer DOM presentation. The dedicated public-component fixture covers body, selector, HTMLElement and inline attach targets; preserves element identity while the target changes; and checks explicit layer z-index.
- contained and absolute keep each public surface under its local positioned host with an absolute layer. Overlay and Dialog scrims are checked against the host bounds.
- Real Chrome checks cover non-modal/non-popover presentation, scrim color/opacity/removal, focus retention, Menu Tab boundaries, nested layer order and focus restoration, z-index precedence for Escape/outside/Router back, connected positioning after scroll at 125% CSS zoom, KeepAlive cleanup, and Menu transition reversal/unmount cleanup.

## Validation record

- Runner: node tests/desktop/overlay-container-protocols.mjs.
- Isolated source check: node scripts/typecheck.cjs --noEmit -p tests/tsconfig.overlay-container.json.
- Syntax check: node --check tests/desktop/overlay-container-protocols.mjs.
- Final run: all 10 protocol groups passed in real Chrome with Vue Router 4.6.3; sourceStable=true across all 15 hashed overlay source files.
- The report records no page/window errors, unhandled rejections, console errors/warnings, or Vue warnings. Full evidence is saved by the runner in artifacts/component-audit-root/overlay-container-protocols/report.json.
- The connected-position fixture verifies a measured 210px nested scroll, then centers the actual target at 125% CSS zoom with enough viewport space to avoid placement flipping before checking the scaled offset.
- KeepAlive marker nodes are checked for DOM attachment because their wrappers have no normal-flow content; activation/deactivation is verified through the real Overlay/Dialog surfaces and scroll-lock behavior.

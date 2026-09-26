# Checkpoint validation — 2026-09-26

The library, tokens, component documentation, icons and isolated tests now belong to D:/UI. No source imports refer back to D:/UAH. Consumers use @lingyzh/ui; Vue is a deduplicated peer dependency.

- Typecheck and documentation/library builds passed; unit tests 2/2.
- Standalone UI tests 20/20: artifacts/ui-uX7okq/report.json. All 25 documentation routes, keyboard/ARIA, motion, form states, tables, pagination and responsive layouts were exercised.
- UAH integration UI tests 25/25: D:/UAH/artifacts/ui-mVri9k/report.json. UAH main/runtime unit tests 16/16.
- Root visually reviewed triangle sorting indicators and ghost hover in light/dark themes. Hover uses a 7% foreground overlay and active uses 12%; transparent borders and keyboard focus outline remain distinct. Tests cover surface, soft and page backgrounds.
- Build outputs, node_modules and screenshot artifacts are ignored. This checkpoint is source-only; npm run build regenerates the outputs.

Standalone development: npm run dev (5174). UAH retains its /ui.html compatibility entry importing the same package. See README.md for sibling checkout and installation order.

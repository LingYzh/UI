# UAH UI

Independent Vue 3 component library and documentation. Source repository: git@github.com:LingYzh/UI.git.

## Develop and verify

Requires Node.js 24+. Run `npm ci`, `npm run dev` (port 5174), `npm run typecheck`, `npm test`, `npm run test:ui`.

`npm run build` creates standalone documentation in `dist/docs` and an ES library bundle in `dist/lib`. `npm run preview` serves the documentation on port 4174. UI tests use an isolated Electron window and require no UAH installation. Evidence is written to ignored `artifacts/`.

## Consume

This private source package is consumed by Vue/Vite projects. Check out UI next to UAH (`D:/UI`, `D:/UAH`) and use `"@lingyzh/ui": "file:../UI"`. Run npm ci in UI first and then UAH. Vite consumers must deduplicate Vue (`resolve.dedupe: ['vue']`) to share the host Vue instance. For CI, clone both repositories at their recorded checkpoint revisions into sibling directories.

```js
import { UiButton, UiTable, UiDataTableServer, UiPagination } from '@lingyzh/ui';
import '@lingyzh/ui/styles.css';
```

Package exports point to Vue/TypeScript source; a consumer needs a Vue-aware bundler. The build output is not a published npm release. Vue is a peer dependency; headless behavior uses @vuetify/v0. There is no Electron runtime dependency in the components. Electron is used only as the test host.

Design tokens, components, icons and their demos are owned here. UAH keeps its application layout, business state and prototype. Update this library and visually verify the docs before changing consuming screens. See [component contracts](src/ui/README.md).

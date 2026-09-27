# UAH UI

New sessions: read [HANDOFF.md](HANDOFF.md) and [AGENTS.md](AGENTS.md) before implementation.

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

长表单弹窗：UiDialog 的 `scrollable` 模式使用 UiScrollArea，`header` / `footer` 插槽固定，`error` 为固定顶部错误，`content-label` 命名滚动区域。默认模式保持兼容。真实演示见 `/#/dialog`。

UiSelect 支持 placeholder（只显示在收起状态，不出现在可选列表），option/optgroup 插槽；在 base-select 环境中通过 UiScrollArea 滚动。UiScrollArea 的 focusable=false 可在组合控件中移除额外 Tab 入口。示例见 /#/select 的分组与占位提示。

UiTooltip：text 为提示文字，默认插槽放非交互图标。组件提供 Tab 焦点、aria-describedby；悬停/聚焦显示，Esc/离开/滚动隐藏，使用 Chromium 原生 Popover 顶层避免容器裁剪。

UiTextarea：v-model 字符串，rows 默认 5，支持 disabled/invalid、原生 maxlength/placeholder/aria 属性。ref 提供 focus。用于长指令输入；需配置 label 或 aria-label。
`UiSelect` also accepts `items: SelectItem[]` and `menuTitle`. Each item has `value`, `label`, optional `description`, `hint`, and `disabled`. Descriptions appear only in the base-select picker; the closed trigger and native fallback show the short label. Hints are display-only; applications own shortcut bindings and permission policy. Existing option/optgroup slots remain unchanged when items is omitted.

桌面宿主可在挂载应用前调用 `setClipboardWriter(async text => host.writeClipboard(text))`，提供受隔离桥接的只写剪贴板能力；`writeClipboard(text)`、UiCodeBlock 与 UiDiff 共用该适配。未配置时使用浏览器 `navigator.clipboard.writeText`，不改变网页权限。

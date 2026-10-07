# UAH UI

New sessions: read [HANDOFF.md](HANDOFF.md) and [AGENTS.md](AGENTS.md) before implementation.

Independent Vue 3 component library and documentation. Source repository: https://github.com/LingYzh/UI.

## Develop and verify

Requires Node.js 24+. Run `npm ci`, `npm run dev` (port 5174), `npm run typecheck`, `npm test`, `npm run test:ui`.

`npm run build` creates standalone documentation in `dist/docs` and an ES library bundle in `dist/lib`. `npm run preview` serves the documentation on port 4174. UI tests use an isolated Electron window and require no UAH installation. Evidence is written to ignored `artifacts/`.

## Consume

Install the public package with `npm install @lingyzh/ui`. Vue `^3.5.0` is a peer dependency. The package exports Vue SFC and TypeScript source, so consumers need a Vue-aware bundler such as Vite.

```js
import { UButton, UTable, UDataTableServer, UPagination } from '@lingyzh/ui';
import '@lingyzh/ui/styles.css';
```

UAH installs a fixed published npm version of `@lingyzh/ui` and deduplicates Vue (`resolve.dedupe: ['vue']`). Verify shared changes in this repository's demos, publish an accepted version, then upgrade the consumer dependency.

The npm package includes the library source and documentation components, not the generated `dist` output. Headless behavior uses `@vuetify/v0`. There is no Electron runtime dependency in the components; Electron is used only as the test host.

Design tokens, components, icons and their demos are owned here. UAH keeps its application layout, business state and prototype. Update this library and visually verify the docs before changing consuming screens. See [component contracts](src/ui/README.md).

Public templates use `<u-xxx>`; existing `Ui*` imports remain available for compatibility. Default body/control and code text is 15px, with smaller auxiliary text retaining its hierarchy. Current demos include inline Code, SlideGroup/Item, direct-button BtnToggle, controlled Snackbar and SnackbarQueue. See the [latest readability and alignment record](docs/READABILITY-ALIGNMENT-2026-10-08.md) for implemented behavior and validation boundaries.

## Themes

The default light/dark themes retain the existing UAH palette. Register themes once per app; `system` follows the OS appearance. See the interactive `/#/theme` and `/#/theme-provider` docs for the complete options and methods.

```js
import { createApp } from 'vue';
import { createUiTheme } from '@lingyzh/ui';
const theme = createUiTheme({
    defaultTheme: 'system',
    themes: { ocean: { colors: { primary: '#246a91' } } }
});
createApp(App).use(theme).mount('#app');
```

Use `useUiTheme()` in setup, then `theme.change('dark')`, `theme.toggle()` or `theme.cycle()`. `mode.value` retains the requested mode; `name.value` resolves `system` to `light` or `dark`. Edit `theme.themes.value` to update colors reactively. `primary` is the readable accent color; `primary-surface` is the filled accent and defaults to a custom `primary` when omitted. Theme colors expose `--ui-theme-{color}` and `--{color}`, with `text-primary`, `bg-primary`, and `border-primary` utilities. Explicit `on-{color}` overrides the automatically chosen black/white text.

Wrap a region with `<UiThemeProvider theme="dark" with-background>…</UiThemeProvider>` or set `theme` on `UiCard` / `UiDialog`. Nested components and teleported notifications inherit that region's theme. The provider adds no spacing. Theme transitions are enabled by default; system or application reduced motion disables them and ends an active transition. Set `transition: false` to opt out explicitly. Markdown details animations and smooth centered footnote navigation also respect reduced motion. Scroll boundaries may constrain anchor centering.

长表单弹窗：UiDialog 的 `scrollable` 模式使用 UiScrollArea，`header` / `footer` 插槽固定，`error` 为固定顶部错误，`content-label` 命名滚动区域。默认模式保持兼容。真实演示见 `/#/dialog`。

UiSelect 支持 placeholder（只显示在收起状态，不出现在可选列表），option/optgroup 插槽；在 base-select 环境中通过 UiScrollArea 滚动。UiScrollArea 的 focusable=false 可在组合控件中移除额外 Tab 入口。示例见 /#/select 的分组与占位提示。

UiTooltip：text 为提示文字，默认插槽放非交互图标。组件提供 Tab 焦点、aria-describedby；悬停/聚焦显示，Esc/离开/滚动隐藏，使用 Chromium 原生 Popover 顶层避免容器裁剪。

UiTextarea：v-model 字符串，rows 默认 5，支持 disabled/invalid、原生 maxlength/placeholder/aria 属性。ref 提供 focus。用于长指令输入；需配置 label 或 aria-label。
`UiSelect` also accepts `items: SelectItem[]` and `menuTitle`. Each item has `value`, `label`, optional `description`, `hint`, and `disabled`. Descriptions appear only in the base-select picker; the closed trigger and native fallback show the short label. Hints are display-only; applications own shortcut bindings and permission policy. Existing option/optgroup slots remain unchanged when items is omitted.

桌面宿主可在挂载应用前调用 `setClipboardWriter(async text => host.writeClipboard(text))`，提供受隔离桥接的只写剪贴板能力；`writeClipboard(text)`、UiCodeBlock 与 UiDiff 共用该适配。未配置时使用浏览器 `navigator.clipboard.writeText`，不改变网页权限。

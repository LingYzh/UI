# 默认主题配色校准

2026-10-15 对照 Anthropic 与 Claude 官网实际 CSS 变量，保留现有布局、密度、字体与业务状态色，只校准品牌强调色及对应选中背景。

## 官方参照

- [Anthropic 官网](https://www.anthropic.com/)：`--swatch--accent: #c6613f`，背景 `#faf9f5`，次级背景 `#f0eee6`。
- [Claude 官网](https://claude.com/)：`--color-clay / --theme-accent-clay-primary: #d97757`，`--theme-accent-clay-interactive / --color-clay-hover: #c6613f`，暖白和次级底色与上方一致。
- 这两个站点的品牌色有明确的主色和交互色之分。库采用 Claude 主陶土色作为填充基准，不把较深的交互色或文字色当作所有控件的实心背景。

随仓库保存的关键采样见 [theme-palette-reference.json](./theme-palette-reference.json)。完整本地采样在 `.Codex/evidence/anthropic-palette/official.json`、`claude.json` 与对应截图。这是当日官网采样，不是官网承诺永久不变的公开 API。

## 库内角色

| 角色                     | 浅色    | 深色    | 用途                                 |
| ------------------------ | ------- | ------- | ------------------------------------ |
| background               | #faf9f5 | #262624 | 保留现有暖白与炭灰背景               |
| sidebar                  | #f0eee6 | #20201e | 保留现有导航底色                     |
| primary-surface / accent | #d97757 | #d97757 | 品牌实心背景、开关、选中块           |
| primary / accent-text    | #d97757 | #e6a086 | 浅色强调文字同品牌色，深色文字提亮   |
| accent-soft              | #f6ece5 | #3b2f2a | 从陶土色衍生的低强度背景             |
| on-primary-surface       | #ffffff | #ffffff | 默认陶土色实心背景使用白字           |

深色适配是本库的界面适配，不声称来自官网的完整深色主题。默认陶土色实心背景采用白字，加载图标跟随前景色。用户进一步指出文字、链接和导航仍偏暗，因此浅色主题的 `primary / accent-text` 也统一为陶土色，不再为满足固定对比度而自动加深为旧棕色。深色主题保留提亮文字。陶土色与白色组合约 3.12:1，与暖白约 2.96:1；不宣称浅色品牌文字满足普通小字号文字的 4.5:1 标准。深色主题的强调文字仍通过普通背景和低强度背景的 4.5:1 检查。

`tokens.css` 与 `theme-defaults.ts` 必须同步维护。`UButton color="primary"` 的 flat/elevated 变体使用 `primary-surface`，文字/描边/tonal 继续使用 `primary`。其他语义颜色与显式 CSS 颜色保持原含义。按钮局部重置表面变量，防止父级工具栏等容器的颜色泄漏。

同一规则已用于工具栏、Snackbar、面板、选择器标题、头像、徽标、实心标签、快捷键、字段背景、时间轴圆点、图片占位和 Tooltip。实心表面与对应 `on-*` 成对使用；勾选图形、开关图标和加载图标不能写死为白色。语义颜色和原始 CSS 色值均由内部解析器处理，不能将 `#hex`、`rgb()` 或 `var()` 拼进主题变量名。文字按钮未显式设置颜色时继承容器前景，显式设置其他颜色的子按钮保持自己的颜色。

`.bg-primary` 使用填充色及其前景色，`.text-primary`、`.text-accent` 使用主题文字色；这些规则在主题服务和静态 CSS 两种模式保持一致。页签指示线、文档品牌图标和页头/目录指示线使用填充色；链接、选中文字和焦点边框使用文字色，导航模式与选中项使用 `accent-soft`。导航选中项不附加左侧色条。文档外壳随全局明暗和自定义主题变化，不另写一套旧棕色。

文档 `#/theme` 新增真实配色组合示例，源码与示例共用 `ThemePaletteDemo.vue`；`scripts/sync-theme-demos.mjs` 同步完整可复制代码，并接入现有文档生成入口。Admin 同站 `ui-docs.html` 和库独立文档直接复用同一份内容。

自定义主题仍可只设置 `primary`，此时自动同步 `primary-surface`；显式设置后者时独立生效。仅默认陶土色采用白字约定，其他背景继续自动计算黑／白前景，显式 `on-primary-surface` 始终优先。不能把品牌白字固定继承给其他自定义浅色背景。

## 专项复跑

使用 Node 24，库依赖通过 npm 安装；日常不触发全量构建。

```powershell
node node_modules/tsx/dist/cli.mjs --test tests/theme-palette.test.ts tests/theme.test.ts tests/theme-transition.test.ts tests/button-directives.test.mjs tests/selection.test.ts tests/hotkey.test.ts tests/layout.test.ts tests/docs-navigation.test.js
node scripts/typecheck.cjs --noEmit -p tests/tsconfig.theme-palette.json
$env:RAYON_NUM_THREADS = '2'
node tests/desktop/theme-palette.mjs
# 使用已启动的真实文档服务；本次通过 Admin 的本地源码入口复跑。
$env:UI_DOCS_URL = 'http://127.0.0.1:5173/ui-docs.html'
node tests/desktop/theme-palette-docs.mjs
```

本次相关57项单测与专项类型检查通过。浏览器专项使用真实源码组件，覆盖明暗、海蓝自定义主题、390px、开关、选择器、CSS 独立使用、原始色值与父级变量隔离。证据在 `artifacts/theme-palette`；Root 检查实际截图。初期完整文档冷扫描曾因本机内存提交不足退出；限制 Admin 开发服务的依赖扫描入口后，真实文档应用已完成主题/概览双模式及按钮、勾选、开关、工具栏、快捷键、头像、选择器、字段共12项检查，另查桌面/390px导航和 Snackbar，零页面异常或组件警告。同站入口证据在 `artifacts/theme-palette-docs`，独立5174文档同一专项也通过，证据在 `artifacts/theme-palette-docs-standalone`；报告包含实际入口。概览专项逐一检查用户截图中的品牌副标题、顶栏、英文眉题、导航项、快捷链接和右侧目录链接，不能仅验证色板按钮。

Admin 专项 `scripts/qa/theme-roles.mjs` 检查六个代表页面的明暗配色、两种页签风格、390px用户弹窗、设置默认色、陶土预设/海蓝/浅黄自定义色与真实 Element 兼容控件；相关16项单测通过。Admin 不再次加深所选主色，选回默认陶土色时沿用库内明暗文字。旧页签对主题文字和选中背景的覆盖已移除，旧别名仅引用主题变量。`report.json` 是最终结果，`failure.json` 保留早期检查定位及页签覆盖失败，后者已修复并复跑。

本批尚未提交、推送或发版。NC_Admin 普通开发使用相邻源码时可见；npm 0.6.1、后端开发模式和生产构建仍使用已发布配色，需后续发布并升级才能同步。

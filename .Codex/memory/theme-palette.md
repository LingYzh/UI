# 2026-10-15 Anthropic 品牌色校准

## 0.6.2 发布准备

- 用户已授权发版并升级Admin推送两个分支。版本0.6.2；完整类型、385/385、双构建、Electron21组/178路由、按钮722断言与571文件pack白名单通过。日志.Codex/release-062-*。Node ESM导入扩展名、旧按钮只选测试和DPI取整已修复，不能因Vite构建或tsx通过而省略原生Node文档导入验证。
- 发布走现有v标签Actions/OIDC，正式发布后必须核对官方版本/latest、tarball完整性与真实源码。Admin本次只提交主题及依赖相关文件，上批同站文档/规范继续保留未提交，不能用工作区构建代表其已进入远端。

## 同日再次反馈后的最终规则（优先于下方阶段记录）

- 用户指出浅色demo链接/品牌副标题/眉题/导航等仍使用旧深棕色，并要求移除额外左色条。根因是上一轮刻意保留了#a34f36文字令牌；现light primary/accent-text也统一#d97757，dark继续#e6a086。不能以“可读文字色”名义在消费端重新加深品牌色。默认陶土primary和primary-surface的前景均白色，显式on-*与自定义色自动前景保持。
- 移除docs导航选中inset色条，仅保留原选中背景；说明、色板、真实图片示例与生成源码、旧主题/Markdown专项的预期同步。未添加新的导航装饰。
- Admin移除customUiColors的自动加深算法，默认陶土预设沿用库内明暗文字，其他自定义色保持用户选值。旧layout current-color别名改为引用主题变量，旧页签卡片/Chrome暗色覆盖与侧栏蓝色hover回退同步。浏览器查出真实页签覆盖失败后已修复并复跑。
- 最终57项单测与专项类型检查通过；源码fixture通过。真实同站及独立5174文档各12项通过，概览逐一断言用户箭头指向的六类强调文字；导航色条确认为none，明暗/390px和消息同步，无页面异常/警告，Root查看实际截图。证据artifacts/theme-palette-docs及theme-palette-docs-standalone。Admin16项与六页双主题、卡片/Chrome页签、默认/陶土预设/自定义色/恢复、390px弹窗通过。
- 浅色品牌文字随用户要求统一陶土色；文档记录白底约3.12:1、暖白约2.96:1，不再声称浅色文字4.5:1。深色文字对比度检查保留。无全量构建、提交、推送、发版；npm仍0.6.1。

## 同日后续：组件与文档整站角色收敛（最新）

- 用户要求继续修正全部主题色，特别包括 demo 整体。内部 `themeColor/themeOnColor` 统一处理语义名、CSS原始值与成对前景；填充用 primary-surface，文字/焦点用 primary，子组件局部重置颜色变量，避免父容器污染。工具栏、Snackbar、面板、picker标题、field背景、头像/徽标/标签、快捷键、Tooltip、时间轴、图片占位与勾选/开关图标同步；默认陶土白字、自定义自动前景和显式覆盖保持。
- 静态/动态工具类区分 bg-primary 与 text-primary；页签指示条使用accent，彩色工具栏内页签仍继承可读前景。真实文档logo改陶土底白图标，页头/目录/导航指示线同主色，模式按钮和选中导航同accent-soft；链接与焦点继续可读文字色，没有将全部文字变成低对比陶土色。
- 增加 `ThemePaletteDemo.vue` 与完整源码条目，`sync-theme-demos.mjs` 接入现有生成器；按钮文案明确默认品牌白字与自定义前景的区别。Admin同站文档复用源码，无第二套demo。
- 最终57项相关单测、组件专项类型检查通过。真实源码fixture（含Tooltip）明暗/海蓝/CSS-only/390px通过；真实文档主题双模式和八类组件共10项通过，含桌面/390px导航与消息前景断言，Root查看截图，零页面异常/组件警告。证据 `artifacts/theme-palette{,-docs}`。早期整站扫描资源故障已通过限制消费端依赖扫描入口后恢复，不再属于未验收项；未执行全量构建。
- Admin修复主题设置保存填充色、自定义色可读文字派生和Element兼容角色；六路由双主题、390px用户弹窗、默认/海蓝/浅黄及恢复默认通过，16项单测通过。其证据 `.Codex/evidence/theme-roles/report.json` 为最终成功，早期failure.json为检查选择器错误。
- 未提交/推送/发布，npm仍0.6.1，backend/生产入口待后续发布升级。开发服务限定index.html扫描只是本地验收启动器，不改公共Vite配置或独立文档入口。

## 首轮记录

- 用户反馈配色偏暗偏深，Root 读取 Anthropic 与 Claude 官网实际 CSS：前者 accent #c6613f；后者 clay primary #d97757、interactive #c6613f。背景 #faf9f5 与次级背景 #f0eee6 原本一致，继续保留。完整角色与来源见 `docs/theme-palette.md`。
- 原实心按钮错误使用 primary 文字色，没有使用主题已有 primary-surface。现在 default light/dark 的 accent / primary-surface 均为 #d97757；文字色保持明暗可读的 #a34f36 / #e6a086，accent-soft 改为 #f6ece5 / #3b2f2a。静态 tokens 与 runtime defaults 同步。
- 初稿自动对比度将主色实心按钮改成黑字，用户反馈不符预期。现默认陶土色 #d97757 明暗均恢复白字，加载图标随前景色；其他自定义背景继续自动黑/白，显式 on-primary-surface 优先。品牌白字约3.12:1，不宣称4.5:1；描边/文字按钮的原可读色与4.5:1检查保持。
- UiButton 内重置 surface 变量，避免父容器工具栏等共享 buttonColorStyles 时污染子按钮；修复 CSS-only primary fallback 和深色 on-primary，使不装主题服务时与 runtime 对齐。
- 相关22项单测、主题/按钮专项类型检查、源码浏览器专项通过。实际明暗与390px截图已由Root查看；海蓝主题、CSS-only、选择器、开关和父变量隔离通过，零页面错误/组件警告。证据 `artifacts/theme-palette`；复跑 `node tests/desktop/theme-palette.mjs`，Node24并按需设 RAYON_NUM_THREADS=2。
- 首次整站文档 Vite 依赖扫描因本机内存提交不足退出；保留失败事实，改用只导入相关真实组件的 fixture，不运行全量构建。旧 button-variants 的品牌角色断言已同步，但旧全库/已构建产物脚本本轮未执行。
- 当前尚未提交、推送或发布，npm仍0.6.1；NC_Admin普通dev本地alias可用新源码，backend/生产npm入口要等发布升级。不得覆盖管理端上一批未提交的同站文档和开发规范。

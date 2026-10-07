# Checkpoint validation — 2026-09-26

## 2026-10-08：Toolbar 整合与 Vuetify4 字号

- root直接实现标题/操作内置、密度/扩展/折叠/主题/动画，更新三个真实Toolbar示例；全局字号采用Vuetify4的15级rem体系和响应式工具类，新增Typography真实控件示例与15行工具类参考。字号新要求替代此前小字号增量；字体家族与现有设计tokens保留。
- 最终typecheck/build/diff-check通过，日志artifacts/toolbar-typography-{typecheck,build,diff-check}-final.log；87/87单测、API/源码同步通过。153 canonical、1386 props/models、213 slots、281 exposed，168页；240源码重复格式化updated0。
- Toolbar最终8/8：artifacts/toolbar-oQoLUT/report.json；Typography最终4/4：artifacts/typography-e7zwLh/report.json；复制字体改动后6/6：artifacts/copy-icons-NbGjaD/report.json。root验收其中8+5+4张原生截图，确认浅深宽窄、实际控件、标题/操作、动画与125%缩放。早期Typography底部截图落到页脚，已修测试定位并由最终截图替代。
- 完整UI21组/168页：ui-7faSb6；Forms14组：forms-p6VOoc；ButtonLoading3组：button-loading-x3Dokh。root另复核卡片表单、表格、浅深代码与200%截图。完整UI/按钮回归早于最后折叠角与文档收尾；Toolbar/Typography最终专项覆盖收尾。无页面或产品控制台错误，Electron开发CSP提示单列。
- UI未提交/推送/发布，UAH未变；源码依据、具体范围与验收边界见docs/TOOLBAR-TYPOGRAPHY-2026-10-08.md。

## 2026-10-08：复制按钮图标

- root修复UiCopyButton图标尺寸选择器与按钮内容包裹层不匹配，使用固定15px MDI复制/勾选图标；动画和减少动效规则匹配专用类。原文复制、绿色成功态、status播报和1.6秒恢复不变，现有真实demo与API继续适用。
- typecheck与build通过，日志artifacts/copy-icons-{typecheck,build}.log。现有控件回归6/6，证据artifacts/controls-JxQNSI/report.json，日志artifacts/copy-icons-controls.log。root亲自验收其中copy-light.png、copy-dark.png，图标均可见。
- git diff --check通过；未提交/推送/发布，未修改UAH。详细范围见docs/COPY-ICON-2026-10-08.md。

## 2026-10-08：代码块自然高度与源码排版

- root移除CodeBlock.maxHeight默认580px与pre冗余上限，显式限制保留；新增真实48行自然高度/240px对照、源码/API/README。全部示例源码采用四空格及Vue层级分行，真实SFC、显示和复制共用同一来源。Prettier3.9.9仅devDependency，格式化通过npm run docs:sync与split/generate持续保持；239源码片段整理，重复执行updated0。
- typecheck、87/87单测、文档/库build通过，日志artifacts/code-source-{typecheck,unit,build}.log；153 canonical契约、1366 props/models不变，maxHeight默认未定义且文案明确无默认上限。API与源码同步/重复日志见code-source-{api-sync,sync,sync-repeat}.log。
- 最终build后专项3/3通过artifacts/code-source-OuwW1g/report.json，验证默认computed maxHeight=none/48行无纵向溢出，显式240px限制/滚至末行，真实横滚与换行按钮，以及App源码Tab与example.code/剪贴板逐空白一致。pageErrors、console error/Vue warning为空；Electron测试宿主CSP提示独立记录。
- 完整UI21/21、167路由通过artifacts/ui-MR4M3W/report.json，errors为空；独立示例回归artifacts/component-examples-71TbPD覆盖167路由、106 manifest、9隔离输入。两项执行于最后等效CSS冗余清理/API文案之前；收尾后build和代码专项已重跑。
- root验收OuwW1g三张最终原生PNG（浅色1440×900自然高度/App源码、深色390×844显式高度/末行），以及71TbPD的12张NumberInput/OTP/Slider浅深宽窄图像。代码随内容增高、内部显式滚动与顶栏、缩进/高亮/复制反馈、示例排布通过。脚本语法与git diff --check通过。
- UI a8220aa/package0.3.2未提交/推送/发布，UAH97c43a9干净且固定npm0.3.2不变。详细记录docs/CODE-SOURCE-2026-10-08.md。

## 2026-10-08：字号可读性与稳定组件补齐

- root完成所有产品代码、样式、独立真实demo与视觉验收；辅助代理承担只读审计和测试。14px→15px，13px及以下+2px，代码token/主题/示例默认15px；字号层级和原UAH浅深主题保留。新增UCode、USlideGroup/Item、USnackbar/Queue，修正直接UButton/value与BtnToggle组合、aria-label/aria-pressed透传、文档路由冲突及受控Queue消费循环。范围见docs/READABILITY-ALIGNMENT-2026-10-08.md。
- 最终typecheck、87/87单测、文档/库build通过；153个canonical契约、1366 props/models、126 events、205 slots、278 exposed members，与167文档页面/106独立示例同步。日志artifacts/readability-{typecheck,unit,build,api-sync}.log。
- 新组件交互13/13通过artifacts/readability-alignment-GQEmNn/report.json：真实Arrow/Enter/Space、多选/mandatory/max、禁用/只读、索引值0、当前项居中边界、垂直滚动、消息颜色/位置/暂停/重开、FIFO/2或3条不同消息并发/overflow/clear/promise。pageErrors、console error与Vue warning均为0。测试宿主标准Electron CSP提示单独记录。
- 完整UI21/21与167路由通过artifacts/ui-cSmvXL/report.json，errors为空；Forms14/14通过artifacts/forms-x7kekT，按钮加载态3组通过artifacts/button-loading-XGjsob（浅深各8组颜色/变体、5组尺寸/loader边界）。全局服务旧测试路由改为snackbar-service，服务断言没有删除。
- root逐张验收artifacts/readability-visual-1C2586的36张原生PNG，覆盖9页×浅深×1440×900/390×844。标签/说明、按钮、表格、Markdown、代码、组选择与消息字号及窄屏排布通过；rootScroll/headerTop为0，无页面横溢出，代码token为15px，pageErrors/consoleErrors为空。最终Queue循环修正后，另验收GQEmNn的5张垂直禁用/右上outlined消息/3条不同消息/error结果/窄屏状态PNG，间距与文字可读。
- 最新4.2.4机器入口清单docs/VUETIFY-ALIGNMENT-AUDIT-2026-10-08.json记录102稳定家族、8指令和10 Labs；基础实现/职责映射不推定逐属性、全SSR/RTL或实验家族兼容。历史4.2.3审计明确标为旧基线。脚本语法、git diff --check通过。
- UI main a8220aa、package0.3.2，改动未提交/推送/发布；UAH97c43a9、工作区干净，消费端固定npm0.3.2不变。

## 2026-10-01 Ripple 动态 class 修复（0.2.2 已发布）

- 工作树 `D:/UI-ripple-fix`，分支 `codex/fix-ripple-update`，基于 `origin/main` 的 `059f785`；原 `D:/UI` main 的旧四个本地提交已撤回并另存备份。用户已确认发布本修复，正式发布状态以 Actions 与官方 npm 核验记录为准。
- KAM 的真实 Electron 复现：折叠按钮含 `ui-ripple-target`，展开后 Vue class patch 删除该类，按钮变为 `position: static`，指令监听仍创建 layer，但 `layer.offsetParent` 变成页面。修复在指令 `updated` 后恢复定位类；不改控件样式、overflow 或事件语义。
- 真实文档 demo 增加“紧凑按钮”切换，同时更新两个 UiButton 和原生按钮的动态 class；公开 API 不变。
- 类型检查、23 项单测、文档/库构建通过；完整 UI 回归 20/20（44 个文档路由），证据 `artifacts/ui-BkToo2`。
- A 批专项 7/7（`artifacts/feedback-u9epXb`）、B 批专项 6/6（`artifacts/controls-U8APxO`）通过，确认共享按钮修改不影响菜单、确认、关闭、复制与表单控制。
- `node tests/desktop/ripple.mjs` 66 项断言通过：两轮动态 class 切换、三种按钮的实际鼠标 held 定位与边界、Enter/Space、释放、禁用、关闭涟漪、减少动效与卸载清理；无 Renderer 错误。证据 `artifacts/ripple-1vHAQY/report.json`。
- root 亲自检查同目录 `ripple-light-held.png` 与 `ripple-dark-held.png`：切换密度后，涟漪保持在按钮内并被既有圆角裁切，浅深主题沿用既有陶土橙，页面左上角没有涟漪。发布前候选源码用于隔离兼容验证；发布后正式依赖使用官方 registry。
- package.json/lockfile 已同步为 0.2.2；打包白名单核对 154 个文件，仅 src/、README、LICENSE 与 package.json。发布提交 `cd9d3ce` 与 `v0.2.2` 已推送，Actions [36757427137](https://github.com/LingYzh/UI/actions/runs/36757427137) 检查和 Publish 均成功；官方 registry 已返回 0.2.2，latest 为 0.2.2。
- KAM 候选源码兼容验证 dev 53 / prod 52 检查通过（`kam-vue-shell-8BwyOv`），包含展开前后三个底部按钮的 ripple 宿主定位和主题最终组件颜色；新增逻辑使用 KAM TypeScript 5.9 检查通过。正式 npm 0.2.2 与 KAM 新 Logo 的最终回归 dev 65 / prod 64 检查通过，无 Renderer 错误，开发冷启动无预热、无候选别名；证据 `C:/Users/AnnaC/AppData/Local/Temp/kam-vue-shell-tgLyHi/`。KAM Vue 类型检查、React/Vue 完整构建通过，root 已复核浅深截图。
- 官方 tarball 为 `https://registry.npmjs.org/@lingyzh/ui/-/ui-0.2.2.tgz`；integrity 为 `sha512-m0j1u26pgS0e+PSnl8aTvzTp6GQ9FuJmgoVgSMaQcGnsLuV7yCNfzTd5iMlpQXZgcyEDgi5OliExeoMXotgP7A==`，KAM 正式 lockfile 与之匹配。

The library, tokens, component documentation, icons and isolated tests now belong to D:/UI. No source imports refer back to D:/UAH. Consumers use @lingyzh/ui; Vue is a deduplicated peer dependency.

- Typecheck and documentation/library builds passed; unit tests 2/2.
- Standalone UI tests 20/20: artifacts/ui-uX7okq/report.json. All 25 documentation routes, keyboard/ARIA, motion, form states, tables, pagination and responsive layouts were exercised.
- UAH integration UI tests 25/25: D:/UAH/artifacts/ui-mVri9k/report.json. UAH main/runtime unit tests 16/16.
- Root visually reviewed triangle sorting indicators and ghost hover in light/dark themes. Hover uses a 7% foreground overlay and active uses 12%; transparent borders and keyboard focus outline remain distinct. Tests cover surface, soft and page backgrounds.
- Build outputs, node_modules and screenshot artifacts are ignored. This checkpoint is source-only; npm run build regenerates the outputs.

Standalone development: npm run dev (5174). UAH retains its /ui.html compatibility entry importing the same package. See README.md for sibling checkout and installation order.

## 2026-09-26 弹窗滚动盘点
复用 UiDialog、UiScrollArea、UiField、UiButton。缺口：长表单缺少统一的内部滚动、固定标题/操作及错误区。先在 UiDialog 新增可选 scrollable/error 与 header/footer 插槽，保持默认布局兼容；真实 demo 位于 dialog-scrollable。待视觉验收后迁移 UAH。

验收完成：root 检查 artifacts/dialog-scroll-CEBFBX 的 dark.png 与 zoom.png（900×800、125%）。圆角完整，滚动条处于正文内，底部滚动时标题、错误、按钮始终可见；浅深主题和 Esc 焦点恢复自动验证通过。命令 node tests/desktop/dialog-scroll.mjs；允许迁移 UAH。

## 选择器分组与滚动盘点
复用 UiSelect 原生 base-select、optgroup 与 UiScrollArea；缺口是 picker 未复用滚动区域。先在 UI 增加隐藏占位提示、滚动容器和分组 demo，验收后迁移 UAH。

2026-09-26：分组选择器真实 demo 验收通过，证据 artifacts/select-groups-rPk1U4（浅色、深色、分组标题）。确认占位隐藏、单一原生分组标题、共享滚动条、鼠标选择及键盘跨组到末项。typecheck/build 通过。旧浏览器不支持 base-select 时保留原生 slot 回退。

选择器补充回归：artifacts/select-groups-tkjdxz 确认共享滚动条实际拖动可改变 scrollTop。完整 UI 回归 20 项通过（artifacts/ui-IpuLTP），包括数字值、指针提交失焦、键盘保留焦点、浅深主题及 200% 窄窗口。旧弹窗测试改用目标 dialog 元素，避免新增 demo 后误取首个 dialog。

2026-09-27 组件盘点：provider 卡片与能力图标复用 UiCard compact/default slot、UiSwitch、UiIcon、布局工具类；无新增 API/样式缺口。先增加 card-provider 真实示例检查布局，再在 UAH 组装。

card-provider 浅/深主题 root 视觉验收通过，开关交互通过：artifacts/provider-card-bZ0Gsl。现有组件满足 UAH 卡片及图标组合需求。

Tooltip 缺口：原 title 无统一样式；新增 UiTooltip text + default slot，Popover 顶层显示，悬停/聚焦打开，离开/失焦/Esc/滚动关闭。先在独立 tooltip 文档验收后接入 UAH。

Tooltip 验收通过：artifacts/tooltip-7kZwXA 浅深主题 root 已检查；鼠标悬停、离开、键盘聚焦、Esc 自动化通过，build/typecheck 通过。

Agent 设置组件盘点：UiDialog/UiCard/UiField/UiInput/UiSelect/UiSwitch/UiScrollArea 可复用；长指令缺 UiTextarea，本轮先补公开组件/真实 demo/独立文档及视觉验收。

UiTextarea 验收：artifacts/textarea-XPwJBi 浅深色聚焦、禁用、错误和多行编辑 root 检查通过。可供 Agent 指令表单复用。

## 2026-09-27 执行活动与 select 警告
Root 实现并验收 UiActivity，复用 UiCollapse/UiScrollArea，提供可访问标题、状态、折叠与固定动作槽。真实文档 activity 页与键盘/浅深 900×800 125% 测试通过；root 直接检查 artifacts/activity-C8SJqB/light.png 和 dark.png 后批准 UAH 集成。select 使用浏览器特性门控的 VNode rich options，保留经典文本回退；Vite dev 编译未报告嵌套/hydration 警告，鼠标键盘回归 artifacts/described-select-VedWhK 通过。类型检查、文档与库构建通过。

最终增量：修正 UiActivity 状态 token 后，root 再次检查 artifacts/activity-IMWvTe/light.png 与 dark.png。完整 UI 20/20（含 28 文档路由），证据 artifacts/ui-ymI7EC。子代理两级侧栏组件盘点复用 Tabs/Card/ScrollArea/Activity/Dialog/Textarea 与已有布局工具类，无新增组件或共享样式缺口。

## 2026-09-27 对话富文本组件盘点

复用 UiActivity/UiCodeBlock/UiScrollArea/UiButton；缺少完整 Markdown 与快照 diff。先新增 UiDiff（line-diff.ts + diff.css +真实 DiffDemo +文档路由），含增删行号/统计、上下文、未执行标记、换行和完整快照复制。root 检查 artifacts/diff-eQrqp3/light.png 与 dark.png 后接受 UAH 集成。单元2项、真实组件键盘/换行检查通过。UiActivity 新增 scrollable=false，避免内部已有代码/diff滚动时双层滚动；该分支在 DiffDemo 一并验收。Markdown 正在独立实现，另验收后集成。

Markdown 接入前 root 验收：已直接检查 artifacts/markdown-ONIrtQ/light.png、dark.png 及 BrowserWindow 原生截图 artifacts/markdown-nBwaws/dark.png（修正 Playwright 在 Electron zoom 下截图裁切）。段落、表格、代码、公式、嵌套折叠、浅深主题接受；工具栏边界和窄屏150%页面宽度几何检查通过。单元14/14，真实组件键盘、安全链接、选择稳定性、自适应流式与结束追平通过；批准 UAH 使用 UiMarkdown。真实文档路由补充验收继续记录。

真实文档补充 root 复核：artifacts/markdown-1YriyD/docs-narrow.png 在480px/125%下表格与代码工具栏可用、长代码仅内部滚动；浅深主题与标准 Markdown 层级验收通过。Markdown 渲染隔离测试与文档路由测试全部通过，流式按移动端仅延迟呈现，不阻塞数据消费或保存。

最终回归：typecheck、单元14/14、文档/库生产构建通过；完整文档UI20/20（含30路由及200%缩放），证据 artifacts/ui-EmvQHz。最终 Markdown 专项 artifacts/markdown-w6mOPH 覆盖OS与应用减少动态效果、稳定选择、链接/HTML安全、公式/图表、窄屏工具栏。KaTeX/Mermaid按需加载，npm audit无漏洞。嵌套列表/引用/details内Mermaid围栏保留为可复制代码，顶层围栏绘制图表。

原型对齐接入前验收：root直接对照UAH原型tool/codebox/round-changes/message-actions源码和截图，检查artifacts/conversation-07zftp/wide-light.png与dark.png：轻量工具图标/末尾箭头、无竖线、紧凑内联diff、文件列表右置统计、五图标操作栏接受。键盘、折叠、inspect/select/view-all、tooltip、禁用态及900px125%/1440px100%已通过focused测试。批准UAH接入UiActivity inline、UiDiff compact、UiFileChanges和UiMessageActions。

UAH集成时追加非视觉剪贴板适配：setClipboardWriter/writeClipboard，UiCodeBlock和UiDiff共享；浏览器默认不变，桌面宿主只写IPC。真实桌面复制回复及完整操作流程通过D:/UAH/artifacts/turn-actions-HySEzC，类型检查通过。原型视觉验收与完整UI记录见CONVERSATION_VALIDATION.md。

## 2026-09-28 动态选择器标签

UAH 计划状态验收发现：同 value 的 label 从草稿更新为待审批时，Chromium 的 selectedcontent 保留旧副本。UiSelect 在 Vue 更新后同步选中 option 的显示子树，保留 select、值和焦点，不新增业务专用属性或样式。先在真实 Select 文档新增 select-dynamic 示例并完成 described-select 测试（含鼠标、键盘、浅深主题、125% 缩放和经典浏览器回退）。证据 artifacts/described-select-HRdW5u；root 已直接检查 dynamic-label.png，标签更新且组件外观不变，允许 UAH 使用。文档与库生产构建通过。

## 2026-09-30 KAM 组件盘点

KAM（Kiro Account Manager）渲染层从 React 迁到 Vue 之前，先按 UI-first 规则盘点它需要的组件。

- **可直接复用**：UiButton、UiInput、UiTextarea、UiSelect、UiSwitch、UiField、UiTabs/UiTabPanel、UiDialog、UiCollapse、UiCard、UiScrollArea、UiTooltip、UiCodeBlock、UiTable、UiDataTableServer、UiPagination、snackbar、布局工具类。
- **现有组件的通用能力缺口**：
    - locale：库内文案写死为中文，KAM 需要中英双语。
    - UiButton：缺少危险操作层级。
    - UiDialog：缺少宽度档位和侧边抽屉。
    - UiInput：缺少数字模型。
    - utilities：缺少字号、截断、定位、网格、等宽字体和语义文字色。
- **需要新增的组件**：
    - A 批（0.2.0）：UiBadge、UiAlert、UiSpinner、UiMenu/UiMenuItem、confirmDialog/UiConfirmHost。
    - B 批（0.2.1）：UiCheckbox、UiRadio、UiProgress、UiCopyButton、UiColorSwatches。
- **留在 KAM 的业务组件**：标题栏窗口控制、侧栏、统计卡片、账号卡片与列表行、注册步骤展示。
- **兼容性底线**：运行环境最低 Chromium 140（KAM 用 Electron 38），默认值保持 UAH 现有行为不变。

## 2026-09-30 A 批组件验收（0.2.0）

- **locale**：由子代理接入 13 个组件与 line-diff，新增 `table.perPageOption` 键。`tests/locale.test.ts` 双向校验键集合并验证切换；zh 默认文案与原文逐字一致，完整 UI 回归 20/20（`artifacts/ui-mn0XVL`，39 个文档路由）。
- **新增组件**：UiBadge、UiAlert、UiSpinner、UiMenu/UiMenuItem、confirmDialog/UiConfirmHost 的样式与 demo 由 root 编写。
- **现有组件扩展**：UiButton `danger`、UiDialog `size`/`placement="end"`、UiInput 数字模式、utilities 扩展。
- **专项测试** `node tests/desktop/feedback.mjs`（900×800、125%）覆盖：
    - Badge 移除按钮通过 aria-describedby 关联标签文字。
    - Alert 仅 error 使用 alert 角色。
    - Spinner 在减少动效时从 0.8s 放慢到 1.6s。
    - Menu：方向键、Home/End 循环，Esc 关闭并把焦点还给触发器，keep-open 多选，panel 模式 Tab 顺序正常。
    - confirmDialog：默认焦点在取消，关闭后才 resolve，可排队。
    - Dialog：md 宽 560px，抽屉贴右侧且整高，关闭后焦点返回。
    - locale 切换后分页、表格、代码块文案更新，离开页面后恢复中文。
- **root 视觉验收**（`artifacts/feedback-2IMaGV`、`feedback-YQwJn0`、`feedback-r7AemX`，浅色与深色）：
    - Badge 五种语义色在两套主题下对比清晰；自定义颜色混合后可读，长标签截断正常。
    - Alert 四种语气的弱底与状态标记和 snackbar 一致。
    - 菜单面板贴锚点显示在顶层，不被卡片裁切；Dialog md 与右侧抽屉的圆角、阴影、遮罩正常。
    - 验收中修正了三处：面板内字段改为纵向排列；菜单项焦点改为选中底色加细环，替代 2px 描边；danger 按钮加淡红边框，与普通次要按钮区分。
- **TS 5.9 兼容**：用 KAM 的 TypeScript 5.9.3 与 vue-tsc 3.3.11 检查 `src/ui` 源码，零错误。
- **单元测试**：23/23（新增 confirm 队列、结算、卸载取消）。允许 KAM 使用本批组件。

## 2026-09-30 B 批组件验收（0.2.1）

- **新增组件**：UiCheckbox、UiRadio、UiProgress、UiCopyButton、UiColorSwatches，样式（`controls.css`）与 demo 由 root 编写；新增 `copy.label`、`swatch.*` locale 键。
- **专项测试** `node tests/desktop/controls.mjs`（900×800、125%）覆盖：
    - Checkbox：全选的部分选中同时暴露 `indeterminate` 与 `aria-checked="mixed"`，Space 切换，全选联动，行内 label 扩大点击区域。
    - Radio：分布在不同卡片中的单选共享一组，Space 选中、方向键切换。
    - Progress：progressbar 数值、阈值配色、批量任务完成态。
    - CopyButton：剪贴板写入原文，成功态与 status 播报，Tooltip 切换为“已复制”，1.6 秒后恢复。
    - ColorSwatches：命名 radiogroup，方向键选择；色板外的已保存颜色显示为“当前颜色”，选择其他颜色后消失。
    - 减少动效时进度与勾选过渡关闭。
- **root 视觉验收**（`artifacts/controls-2q1nXf`、`controls-sHWDMS`，浅色与深色）：
    - 勾选、部分选中、单选圆点在两套主题下对比清晰，禁用态淡化一致。
    - 进度条四种语气与 Alert/Badge 色系一致，轨道在深色下仍可辨。
    - 色板选中环使用表面色间隔，任何色块上都可读。
    - 验收中修正了三处：复制成功的勾加粗并加绿色弱底；自定义色块前加分隔线并调整虚线圈间距；复制按钮颜色规则提高特异度，避免被后置的 ghost 按钮规则覆盖。
- **回归**：完整 UI 回归与 A 批 `feedback.mjs` 全部通过（`artifacts/ui-ZLzwOj`、`feedback-EOT8AZ`）。
- **TS 5.9 兼容**：用 KAM 的 TypeScript 5.9.3 与 vue-tsc 3.3.11 检查 `src/ui` 源码，零错误。
- **单元测试**：23/23（locale 键集合校验覆盖新增键）。允许 KAM 使用本批组件。

## 2026-10-05：0.2.3 发布完成

用户已明确授权发布并升级 UAH。发布提交 6f405a84e6dd1e3c36e9b04853488eff571214b8，标签 v0.2.3；GitHub Actions 37226243401 的 Publish 步骤成功，官方 npm 的 latest 为 0.2.3。tarball：https://registry.npmjs.org/@lingyzh/ui/-/ui-0.2.3.tgz；integrity：sha512-P+sBNm4KjRNkBcoIImV2+PQRT9mYxqqYqkzAWGNZNVfBqea6owCklrupb7W6ap8jx9s5alWi78rcH7/z74PgRQ==。

UAH 已从官方 registry 固定安装 0.2.3，并更新 lockfile。发布前 typecheck、23/23 单测、build、pack 白名单及 usage-meter 桌面专项通过；root 检查 artifacts/usage-meter-WPh1Qi 的浅色 1440 与深色 900/125% 截图。剩余量使用独立冷灰 token，不再与消息分类共享绿色。

## 2026-10-05：布局、全组件文档、输入宽度与操作焦点（本地源码）

- root 对照 Vuetify 官方 grids、textarea、icons 与 VInput/VSelectionControl 样式，沿用 UAH tokens，新增 7 个布局／表单组件和 SVG MDI 能力。计划与边界见 docs/LAYOUT-PLAN-2026-10-05.md。
- 43 个 index.ts 公开组件全部拥有独立文档路由、可见导航组、真实 demo 和 API／源码；单测自动核对导出与组件页一一对应，防止漏页与导航不可见。全部 56 文档路由渲染回归通过。
- typecheck、29/29 单测、文档／库 build、npm pack 白名单核查通过（168 个发布文件；包含新布局、尺寸与焦点模块，排除测试／artifacts／工作区文档）。
- 全 UI 回归 20 项通过：artifacts/ui-Ky0Ebh。反馈专项 7 项通过：artifacts/feedback-VefaiS。选择类专项 6 项通过：artifacts/controls-C44VMF；覆盖原生 Space／方向键、菜单 Esc 恢复、确认队列、复制反馈及减少动效。
- root 已通过 in-app browser 亲自检查浅色 1440 表单、深色 1440 Textarea/Input 状态对比、900px 与 390px 表单、实际 md Dialog、指针开关与输入编辑。控件边框／字号／圆角统一，宽表单控件下沿对齐，长字段跨列，窄屏自动单列，390px document.scrollWidth=390，无横向溢出；弹窗有真实 header 与可访问名称。
- 本轮发现并修复：重复 v-bind 的 Vue 编译错误、旧组件导航组未注册、示例弹窗误用 title 插槽、selectedcontent 的 Vue 组件解析警告。Vite dev 对 Electron artifacts 缓存监听导致 Windows EBUSY，现排除 **/artifacts/**；5174 服务已恢复。
- 操作焦点按指针／键盘区分：完成点击后仅 blur 原动作控件，已移入弹窗或文本输入的焦点保留；键盘继续保留焦点及可见焦点标记。Menu/Dialog 关闭时按方式处理触发器，文本 returnFocus 不因指针关闭被清除。
- 无 UAH 源码或依赖改动，未发布；消费端继续使用官方 npm 固定 0.2.3。发布新版本后再升级 UAH。

- 布局／宽度／焦点专项 `node tests/desktop/layout.mjs`：11 项全部通过，证据 artifacts/layout-DfKnam，共 42 张浅深 1440×900／900×900／375×812 和 125% 截图。覆盖 43 组件导航、240/320/480 容器与 inline/maxWidth、指针与键盘焦点、菜单关闭／keep-open、Dialog 指针／键盘／文本 returnFocus、原生表单验证与提交、栅格断点／分数／偏移／顺序／密度、MDI 语义、Textarea 增高／缩小／最高行数及宽度变化。
- root 亲自复核最终截图：浅色双列表单的标签与控件对齐、深色单行／多行同样式、900px 栅格单列与分数行、375px 表单／图标／操作区及 125% 横排表单。对齐、主题对比、圆角与间距符合约定；无阻断性未解决项。测试修正了 required 星号的标签定位、宽度测试文本样本已封顶、默认浅色 data-theme 未初始化等测试前提，没有通过放宽产品行为掩盖失败。


## 2026-10-05：简化表单、内置标签与统一验证（本地源码）

- Input/Select/Textarea/Switch/Checkbox/Radio/ColorSwatches 内置 label/hint/labelPosition=top|left/labelWidth/rules/errorMessages/validateOn。标准用法直接 Form → 控件；Field 用于自定义项目。说明与错误放在控件下方，不再预留缺少说明的标签空行。FormSection/FormActions 是可选布局工具。
- Form 提供同步／异步验证、三态 v-model、错误列表、validate/reset/resetValidation、有效 submit／invalid、状态与外观继承。子控件不能解除 Form 禁用／只读。异步旧值、重置和正在提交期间的值修改都不能覆盖最新状态或误提交。
- 根代理实际浏览器复核：240px 选择器短 picker=240px，长内容 picker≈556.7px；420px 窄屏 picker≤396px，无页面横向溢出。丰富选项与原生选项闭合后均单行省略。Input 保持 text-overflow=clip、scrollLeft=330、42/42 字符完整可选。
- Tooltip 指针点击后的 focus 不参与显示，保留真实 hover，移出关闭；Tab 聚焦保留，Esc 关闭。scrollable Dialog 错误绝对定位，单／三行错误时正文 viewport 均保持493px；padding 随错误高度由16px调整为73px／114px，第一项未被遮住。
- root 横排视觉验收修复选择类 label 的8px基线偏差与 Switch 默认 margin；紧凑选择控件及提示与控件列对齐。浅深、390/420px、125% 完整窗口均已复核。NativeImage 截图核查物理窗口尺寸，修正旧 Playwright 缩放截图被裁剪的问题。
- typecheck/build通过；npm test 38/38通过；完整UI 20项通过（artifacts/ui-Zl4v7R）；表单专项13项通过（artifacts/forms-K8yOpZ）；布局／宽度／焦点专项11项通过（artifacts/layout-PhX36A）。此前选择类6项与反馈7项也通过（artifacts/controls-mXCvqZ、artifacts/feedback-kmvM3m）。
- root 直接复核最终 forms 的浅深、窄屏、900×900@125% 与左标签浅深截图；复核最终 layout 的窄深横排转竖排、多行输入125%以及实时选择器、Tooltip、浮动Dialog。验收结论：满足本轮接口、交互和视觉要求，允许后续发布和消费迁移。
- npm pack --dry-run：172个文件，包括所有新组件、类型及真实demo，不包含tests/artifacts/dist。43个公开组件均有页面和真实示例，56个文档路由无横向溢出。
- 当前仍为本地修改，未提交／发布；版本仍0.2.3，UAH工作区干净且依赖保持固定npm版本。新版本发布后再升级UAH，不复制组件源码或使用业务CSS绕过规范。

## 2026-10-05：Form 与 Row/Col 分工、级联选择及完整 API 核对

- Form 仅负责验证、提交、重置和共享状态／外观；移除 layout/columns/density/actions，FormSection 移除 columns，标准控件和 Field 移除 span。使用 Form → Row → Col → 控件；Row 管间距、Col 管列宽及断点。所有真实 demo 和示例源码已迁移，Row/Col/Form 页面均有可操作的实际表单案例。
- 新增 UiCascader、CascaderItem/CascaderValue、独立 demo 和文档。值模型为路径数组，支持树形选项、禁用分支／叶子、父级选择、完整／末级标签、清空、数字 0、统一宽度、label/hint/rules，以及 Form 验证与状态继承。原生 Popover 自身横向滚动，列自身纵向滚动；窄屏不撑开页面。
- UiMenu/UiCascader 同步记录弹层打开期间的外部 pointerdown；键盘打开后改用鼠标点击外部关闭也会释放触发器焦点，保留外部输入的新焦点。键盘选择／Escape 返回触发器，Tab 关闭并向下一项移动。
- 全部 44 个公开组件拥有独立文档、真实 demo、源码和 API，文档共 57 页。API 集中于 src/ui/docs/apiReference.js，源码 AST 核对 props 名称／类型／required／声明默认值、模型事件、emits 参数、slots 参数和 expose；所有缺漏／陈旧／不匹配／重复声明计数为 0，详见 docs/API-AUDIT-2026-10-05.json。服务方法与原生透传属性另列说明。
- 清理标准控件示例中的旧 Field 包装、旧 API 追加覆盖及 11 处多余 Row／FormActions 嵌套。单测编译全部组件示例，检查重复属性与布局结构；另核对所有示例的 Ui* 标签均有对应导入。
- typecheck、build、44/44 单测通过。全 UI 20 项通过（artifacts/ui-dhrVFX，57 路由无横向溢出）；表单专项 14 项通过（artifacts/forms-ioeQeZ，含 Row/Col 实例和三档间距）；最终布局专项 11 项通过（artifacts/layout-Z9pi97）；最终级联专项 14 项通过（artifacts/cascader-wo09Ic）。
- root 亲自复核 Row 宽屏深色、Col 390px 浅色、最新布局窄屏深色，以及级联三列浅深 1440×900、390×844 浅色与 900×900@125% 深色完整窗口截图。输入高度、标签／下方说明、弹层边框与主题一致；窄屏仅弹层内部滚动，缩放不产生页面横向溢出。NativeImage PNG 与窗口 contentSize 均有尺寸断言。验收通过，无阻断项。
- npm pack --dry-run 白名单检查通过，包含级联组件、类型、CSS、demo 和 API 参考，不含 tests/artifacts/dist。所有修改仍在 UI 本地，未发布；UAH 工作区干净，继续固定消费已发布 0.2.3。

## 2026-10-05：Tabs 组合方式、选择行为及滚动布局

- root 对照 Vuetify 官方 VTabs/VTab/VTabsWindow/VWindowItem 源码与 usage.vue，增加 UiTab、UiTabsWindow、UiTabsWindowItem。声明式标签不再必须传 items/idPrefix；兄弟 Tabs/Window 共用一个 v-model，#window 内可继承模型与 ID，#item 可为数组项直接提供内容。旧 id/label、orientation、UiTabPanel 用法继续兼容。
- 默认 mandatory=force 选择首个可用项；支持 string/number、数字 0、隐式索引、禁用、动态删除与空列表恢复。mandatory=false 可取消选择，空状态允许 null/undefined，v0 可将无选中项标准化为 undefined。默认方向键／Home／End 仅移动焦点，Enter／Space 确认；automatic 显式启用，RTL 方向与禁用跳过已验证。指针释放焦点，键盘可见焦点保留。
- WindowItem 首次访问挂载并保留内容，eager 预先挂载。补充 direction/alignTabs/grow/fixedTabs/stacked/hideSlider/centerActive/showArrows；箭头只滚动，选中和键盘焦点可进入视口，垂直滚动由列表承载。
- 新增 5 个真实 Tabs 示例及 3 个独立组件页；现为 47 个公开组件、60 个文档页。API 参考、示例源码、README 与键盘指南同步；全量源码 API 审计仍为 0 差异、0 重复声明。
- typecheck/build、48/48 单测、20 项全 UI 回归（artifacts/ui-El84a3）、11 项布局／焦点回归（artifacts/layout-kKB6ie）、5 组 Tabs 专项（artifacts/tabs-tZ7icE）全部通过。60 路由无页面横向溢出，旧标签页内容及滑动指示条几何／动画回归通过。
- root 已亲自复核声明式浅深与390px、横向滚动浅色、垂直滚动深色，以及最终390px浅色和900×900@125%深色图像。主题、选中条、提示间距、箭头和内部滚动符合组件规范；NativeImage PNG 与窗口尺寸、截图文件名主题与实际 data-theme 均由测试断言。修复滚动 demo 两组不同 items 共用模型互相回退的问题；旧测试定位同步新 shell 层级，原几何断言保留。无阻断项。
- npm pack --dry-run 为182个发布文件，无 tests/artifacts/dist 泄漏。所有改动仍为 UI 本地源码，尚未提交或发布；UAH 无改动且保持固定 npm 0.2.3。

## 2026-10-05：0.3.0 发布前核对

用户授权发布本轮完整组件更新。package.json与lockfile均为0.3.0；正式标签v0.3.0沿用GitHub Actions的npm Trusted Publishing。再次运行typecheck、48/48单测、文档与库build、npm pack --dry-run；182个发布文件，无tests/artifacts/dist/工作区文档泄漏。对应日志为artifacts/release-0.3.0-unit.log、release-0.3.0-build.log与release-0.3.0-pack.json。此前最终交互与视觉证据见以上Tabs、Form/Row/Col与级联记录；版本变更未修改组件行为。

## 2026-10-05：发布后消费端兼容与 0.3.1 修复

0.3.0 已通过 GitHub Actions 37287893853 正式发布，官方 registry 版本及 latest 核对成功。UAH 实际安装后 typecheck、build、1043 个单测通过（2 个跳过），完整 UI 文档、外观和扩展专项通过；端点专项发现嵌套弹窗中批量初始化选择器会造成 Vue 更新循环，属于阻断兼容问题。

修复限定于 UiSelect 的相同 selectedcontent 不再重复替换，以及 UiScrollArea 的相同几何不再赋新响应式对象，不改变公开 API／样式。新增真实组件桌面回归 select-initialization.mjs：原始 0.3.0 卡住，修复后浅深主题、八个模型初始化、选择和弹窗重开均通过，无 pageerror；证据 artifacts/select-initialization-eZNDNF。root 亲自复核完整窗口浅深截图；发布前完整回归及最终消费端结果另追加。

0.3.1 最终发布前：typecheck、48/48 单测、build、20/20 全 UI 回归通过，60 路由无溢出，动态选项文字及滚动条调整断言保留。日志 artifacts/release-0.3.1-{typecheck,npm-test,build,ui}.log；全 UI 证据 artifacts/ui-4XLID7。嵌套选择器最终证据 artifacts/select-initialization-Shg8O8，root 复核浅深完整窗口截图。最终在修复源码恢复后重新 pack，182 个文件，无 tests/artifacts/dist/docs 泄漏；JSON 为 artifacts/release-0.3.1-pack.json。负例运行复现原始版本在点击打开能力弹窗后停止响应，cleanup 经主进程检查独立 profile 与 fixture URL 后退出该测试实例，未关闭用户 dev 服务。

### 0.3.2：插槽选项的动态文本

0.3.1 Actions 37292273421 与官方 registry 已确认发布成功。补充实际 slot 文字回归发现原 option 已更新、selectedcontent 仍显示旧文字；此前完整 UI 仅覆盖 items／模型等更新，没有覆盖该 slot 文本情况。0.3.2 在 UiSelect 内观察独立选项容器的文本与子节点变更，并复用内容相同时不写入的同步逻辑，卸载清理观察器。

select-initialization 专项增加更新已选中 option 文字、断言 selectedcontent 更新且模型保持 true，浅深主题均通过；证据 artifacts/select-initialization-KIxN9D。测试退出时在关闭 Electron 完成后清理 watchdog，覆盖失败清理路径；不改动用户服务。最终完整验证与发布结果另追加。

0.3.2 发布前 typecheck、48/48 单测、build、20/20 全 UI 回归通过，仍覆盖60路由和滚动条内容调整；证据 artifacts/ui-EQH98h，日志 artifacts/release-0.3.2-{typecheck,test,build,ui}.log。root 已复核专项最新浅色完整窗口图像，选中文字实时更新、模型值保持不变，布局与主题保持组件规范。公开 props/emits/slots/expose 无变动，API审计不需要新增项目。

最终 npm pack --dry-run 为182个文件，无 tests/artifacts/dist/docs 泄漏，JSON 为 artifacts/release-0.3.2-pack.json。

0.3.2 正式发布：提交9961a7858a0757f588c70935ccd7f237cf1cfab4／标签v0.3.2／Actions37293347476，Publish成功；官方registry latest与版本元数据核对成功，tarball HTTP 200，UAH npm安装成功且lockfile integrity与官方相同。UAH typecheck、build、build:ui通过，最终实际弹窗与消费端完整UI结果随后记录。

### UAH 最终兼容验收

UAH已完成0.3.2固定npm升级，本地提交97c43a907520c5d747abdd00b985d3ec4dde9d32，工作区干净。最终typecheck、应用／文档构建通过；完整UI25/25（60路由）、Agent15/15、端点11/11通过，无pageerror；证据D:/UAH/artifacts/ui-q949vX、agents-sQ9goh、endpoints-98M7dG。root复核实际能力弹窗深色窄屏和endpoint-error-fixed.png，表单滚动时错误固定悬浮顶部，padding保护首项，外层没有滚动。

消费端仅更新固定依赖、TypeScript7的SFC文件访问适配、测试夹具和记录；保留Vue dedupe、Electron隔离及原业务／运行时代码。旧桌面夹具同步V2动态上下文、条件提示词模块、启动草稿后显式选择历史会话，以及Tabs手动激活和悬浮错误，原模型／历史／权限／持久化／委派断言保留。此前单测1043通过／2跳过、外观7和扩展32通过，相关产品代码未变。本轮未发布UAH桌面应用安装包；UI正式最新npm版本为0.3.2，无阻断项。

## 2026-10-05：主题、Markdown 与 Ripple 本地验收

- root 先盘点 tokens、Card/Dialog、Markdown、Snackbar、Button/Tabs 和指令，再对照 Vuetify 官方 theme/ripple 文档与 Ripple 源码。主题及 Markdown 计划、Ripple 缺陷原因和行为边界见 docs/THEME-MARKDOWN-PLAN-2026-10-05.md。全部产品实现、样式、真实 demo 和视觉验收由 root 完成，辅助代理仅承担专项测试。
- 新增主题服务和局部 Provider，保留原浅深 palette。覆盖响应式自定义颜色、on-color、辅助类、system变化、切换动画／减少动效、局部Card和Dialog、并行Mermaid独立配色；测试同一配置创建多个实例不共享可变定义。fallback 使用 detached effect scope，独立 UiPreview 离开 setup 后仍有效，卸载恢复根变量／主题属性并清理生成样式与监听。
- Markdown code/mark 使用 primary；details 正反向高度动画可快速反转且支持键盘，脚注与返回平滑居中并转移焦点；手动／系统减少动态效果立即完成。滚动边界可能限制居中，文档明确说明，真实 demo 使用 ScrollArea 和足够的上下空间验证精确居中。
- Ripple 原 blur 清空与 vPointerBlur 冲突，start 清空也破坏连续点击。现在每个波纹独立完成250ms扩散／100ms显现、最少250ms显示、300ms淡出。触摸延迟80ms，快速tap提交，延迟内滑动取消；键盘居中并忽略重复，嵌套最内层响应，.stop不产生自身波纹且click正常冒泡。点击后 loading 或动态关闭不截断既有波纹；减少动效、页面隐藏、卸载立即清理。仅静态宿主临时定位，退场后恢复，避免覆盖绝对／固定定位。
- typecheck、58/58单测及文档／库build通过；日志 artifacts/ripple-{typecheck,unit,build}.log。API测试逐项对照48组件的props／类型／默认值／模型事件／插槽／expose，并编译全部组件源码示例。
- 最终全UI20/20通过（62路由无页面横向溢出）：artifacts/ui-G5YeQ8。Ripple几何／旧组件与快速松手回归78项通过：artifacts/ripple-GVjh5S；激活专项43项通过：artifacts/ripple-activation-v0fBHd。主题／Markdown12组通过：artifacts/theme-markdown-RA2pzB；独立预览3组通过：artifacts/theme-preview-BuAUCk。全部报告无pageerror。
- root亲自复核最终浅深快速松手截图、局部浅深Card、390px窄屏、900px/125%和独立Mermaid配色；默认主题、圆角裁剪、可读文字、焦点和布局正常。快速松手90ms时真实页面仍有可见波纹，NativeImage截图PNG尺寸与1440×900窗口尺寸一致，失焦不影响反馈；点击后禁用的等待按钮和选中Tab也保留波纹。验收通过，无阻断项。
- npm pack --dry-run 为190个文件，主题服务／Provider／Markdown动效／真实demo均包含，无tests/artifacts/dist/工作区docs泄漏；报告 artifacts/theme-ripple-pack.json。UI仍为未提交的本地修改，版本0.3.2，尚未发包。UAH工作区再次核对干净，HEAD97c43a9，未升级或修改消费端。

### 主题过渡默认开启与减少动效联动

- 复用现有主题服务、顶栏UiSwitch和文档reducedMotion偏好；缺陷是服务默认transition=false且ThemeDemo额外传入false。改为默认true，顶栏通过setTransitionOrigin指定开关中心，ThemeDemo直接使用change/toggle/cycle默认策略，减少动效开关与其他demo同步。公开API默认值及README已更新，无新增组件或依赖。
- 系统prefers-reduced-motion或根data-reduced-motion=true任一启用，都立即切换并终止活动过渡；关闭减少动效后后续切换自动恢复。即使调用方明确传true，也不能覆盖减少动效。未支持ViewTransition时直接切换；宿主可显式false关闭。
- typecheck、58单测、文档／库build通过，日志artifacts/theme-transition-{typecheck,unit,build}.log。真实Electron专项7组通过：artifacts/theme-transitions-GRZOBH，覆盖顶栏默认400ms动画／起点、共享手动偏好、系统偏好、恢复、change/toggle/cycle默认策略、显式false、播放中手动及系统减少动效、键盘焦点、无API回退与卸载清理，无pageerror。
- root复核theme-topbar-transition-midpoint.png及最终深色图像。NativeImage截图为1440×900，暂停180ms后等待两次requestAnimationFrame再捕获，额外采样左／右像素，断言旧浅色和新深色确实同时存在，避免把未绘制的首帧当作动画证据。圆形揭示从右上开关中心扩散，无布局跳动，指针失焦与键盘焦点均保留原规范。
- 原有主题／Markdown12组通过artifacts/theme-markdown-nm39sL；独立UiPreview3组通过artifacts/theme-preview-nOQb7p；完整UI20/20（62路由）通过artifacts/ui-ooSTop。原Ripple专项等待真实主题过渡完成后继续测试，78项通过artifacts/ripple-v1Z5kb；未降低既有波纹断言。UAH再次核对干净，HEAD97c43a9；所有更新仍仅在UI本地，未发布。

### Tabs 激活背景被 hover 覆盖

- root盘点UiTabs/UiTab、共享styles.css与ExampleCard，复用现有真实demo。普通hover规则优先级高于aria-selected，文档专用选中覆盖又掩盖了缺陷。三处共享hover选择器限定为未激活且非禁用，保留激活背景／文字及ghost透明状态；docs.css两处重复激活规则移除，文档与消费端一致，无API变更。
- 新增既有tabs.mjs交互检查，对真实控件hover前后的计算背景／文字做比较，确认:pointer位置实际匹配:hover、hover不改选择。旧构建失败：激活背景rgb(243,231,222)变为rgb(244,243,237)，负例日志artifacts/tabs-hover-before.log；修复后通过。新增hover检查结束后reload隔离模型，原有首次默认选择、键盘、面板持久化和滚动断言全部保留。
- typecheck、58单测、文档／库build通过，日志artifacts/tabs-hover-{typecheck,unit,build}.log。Tabs六组通过artifacts/tabs-TW7NhX：覆盖浅深、横纵、默认／dense／ghost／square、激活与未激活hover、禁用项、示例／源码真实切换及原五组行为。全UI20/20通过artifacts/ui-wNNSzC，62路由无横向溢出、无pageerror。
- root复核tabs-selected-hover-1440x900-light.png与dark.png，选中详情在真实hover时保持主色背景／文字和指示条，示例标签风格一致，完整PNG与窗口尺寸有断言。UAH仍干净；本轮为UI本地源码更新，未提交或发布。

## 2026-10-06：u- 组件补充、独立示例与按钮/表格修复

- root依据审计盘点公共组件、真实 demo 和 API，扩展至 148 个 canonical U* 导出、162 个文档页面。模板统一使用 `<u-xxx>`，createUI 支持全局注册，旧 Ui* 导出保留兼容。新增视觉模板、共享样式和所有视觉 demo 由 root 直接实现；辅助代理仅负责模型逻辑、测试和非视觉核对。当前 API 对照源码生成：1267 props/models、118 events、190 slots、262 exposed members，所有示例源码都经过 SFC 编译检查。
- 拆除四个 family demo 在多个组件页重复挂载的方式，生成 101 个独立 SFC 与 manifest。每页只挂载当前组件及必要容器/子组件，源码来自同一真实 SFC。保留 Chip 原有专属样例并追加独立 ChipGroup 接入样例。新增严格盘点限制缺页、重复 id、源码不一致和专门输入示例串页。
- Button 使用单一居中 loader，保留原内容的布局尺寸，并在切换前记录宽高，防止动态 loading 文案撑宽；loading 不套用 disabled 的统一配色，保留原 variant/自定义 color/ghost-danger。真实 ButtonLoadingDemo 包含 12 种外观和 5 个尺寸/插槽案例。桌面专项 3 组通过 `artifacts/button-loading-QC8Ixq`，验证浅深颜色/边框/透明度、宽高、单 loader、自定义 loader 替代、busy/disabled 和恢复。root亲自复核浅深完整窗口图像，视觉通过。
- 包装层回归修复：Select 的省略 blurOnSelect 恢复默认 true，鼠标选中释放焦点、键盘选中保留焦点，并转发 ref 方法；组控件转发自身 props；Chip 保留旧颜色/变体/关闭契约并支持组选择；ListGroup 自定义 activator 不再嵌套按钮。完整 UI 保留原焦点、排序、分页、失败重试、过期请求和滚动条行为断言。
- 服务端表格更换 UDataTable 内核后，旧去边框样式只命中 UiTable，导致内外各一层边框/圆角。共享样式现在去掉服务端直接子表格的边框、圆角和表面，统一由外框绘制；ghost 表头透明，square 内部不残留圆角。独立 UDataTable 仍保留 1px/8px 外框。排序图标保持统一双三角 SVG、aria-sort 和本地化排序名称。4 个服务端变体计算样式回归通过；root复核 `artifacts/ui-zoj9Oy/25-server-variants-light.png`、`26-server-variants-dark.png`、`27-server-variants-390-dark.png`、`28-server-variants-390-light.png`，边框、表面、页脚换行通过。
- typecheck、82/82 单测、文档/库 build、git diff --check 通过。最新完整 UI **21/21** 通过，162 路由无页面横向溢出，含 200% 缩放、键盘和减少动效；证据 `artifacts/ui-zoj9Oy`，无 pageerror。测试只迁移 canonical 名称和真实内核 selector，保留原行为断言，并新增边框回归。
- 独立文档桌面专项 `artifacts/component-examples-PuXGlT`：162/162 路由、101/101 示例 marker、9 种专门输入隔离通过，pageerror/Vue warnings/console errors 均为 0。root亲自复核数字输入/验证码/滑块的 12 张浅深、宽屏/390px 截图，label/hint、间距、独立内容和窄屏布局通过；PNG 为窗口内容区，实际尺寸1264×1035或374×779。此项不冒充所有新增组件的完整状态或上游 API 对等验收。
- 文档同步纠正旧断点为600/840/1145/1545/2138，移除 Server“无选择/分组/多排序”的旧说明；表格 label 明确为可访问名称而非内置表单标签，sortBy 说明反映 multi-sort。原审计保留历史基线，新增实现进展和未对齐边界，Labs、SSR/完整RTL及逐属性对等未宣称完成。
- UI package 仍为0.3.2，本次全部是本地未提交、未发布修改；UAH再次确认工作区干净，固定消费npm0.3.2，未复制源码或升级依赖。

### 提交推送检查点

用户于2026-10-06授权提交推送，暂不发布。提交前核对既有中文提交格式、UI/main与origin/main、UAH干净状态及发布workflow仅由v*标签触发；源码与上述验收版本一致。本次只推送分支提交，不创建/推送标签，package和lockfile版本仍为0.3.2，npm及UAH消费版本不变。以上“本地未提交”保留为验收时的历史记录，最终提交与远端状态见Git。

## 2026-10-07：Markdown 脚注跳转的滚动范围

- root 盘点并复用 UMarkdown、UScrollArea 与文档正文滚动容器，无新增组件、依赖或公开 API。原 scrollIntoView 会滚动全部祖先，包括 overflow:hidden 的页面根；原回归只检查屏幕居中，未约束祖先位置。现在仅对目标最近的纵向 auto/scroll/overlay 容器 scrollTo，以该容器内容视口居中，没有局部容器才使用文档滚动根。保留前往/返回、平滑滚动、边界钳制、preventScroll 焦点移交与减少动效立即定位。
- 旧构建对照 `artifacts/footnote-repro-AMdwnp/report.json`：root/window 从0变33，顶栏 top 从0变−33，外层正文从1345变1501。修复后的内层阅读示例 `artifacts/footnote-repro-7GtMQw`：仅内层从220变860，root/window、外层正文、侧栏及顶栏位置全部不变。普通正文示例 `artifacts/footnote-repro-6ZrOEs` 前往/返回仅正文从833变1013再回833，其余位置不变。root 亲自查看旧缺陷和两组修复后完整窗口截图，顶栏保持完整可见。
- typecheck、82/82 单测、文档/库 build 通过。README、真实 MarkdownDemo、页面说明与设计记录已同步滚动范围；辅助代理仅修改桌面回归，root 负责实现、demo及视觉验收。
- 最终真实 Electron 专项17组通过，无 pageerror，证据 `artifacts/theme-markdown-1tL79b/report.json`。覆盖普通正文/内部阅读区 × 浅深 × 1440px/390px 的16次前往/返回、Enter、手动/系统减少动效及外链 link-click；保留既有主题、Mermaid、details 动画与键盘断言。滚动中心按所属视口计算，比较 html/body/document/window、侧栏与顶栏完整矩形，内层跳转同时断言外层正文不变。root 亲自复核8张最终脚注截图，顶栏完整、目标居中、浅深可读、窄屏布局通过。
- 测试诊断 `artifacts/theme-markdown-e0CjSm/click-trial-diagnostic.json` 证明 Playwright locator.click 的准备阶段也会自动滚动祖先；最终脚注用显式显露链接后真实 mouse.click 坐标，Enter用真实键盘，操作前要求顶栏位于0，操作后比较所有外层位置。没有重置根节点掩盖事件引起的滚动；details旧断言执行完后重新打开路由隔离测试准备状态。
- git diff --check 通过。本轮脚注修复仍为本地未提交、未发布修改；此前累计更新的 main 检查点为a8220aa，UI包仍0.3.2，UAH工作区干净且依赖未改。

## 2026-10-07：MDI 图标与展开/退出过渡

- root 先盘点公开组件、实现/API与真实 demo，复用 Icon/MDI、Collapse、Transition、减少动效与原生弹层生命周期，没有新增公共组件或依赖。产品图标、样式、动画、视觉示例和源码文档由 root 实现；辅助代理只编写独立 disclosure-motion.mjs 回归。
- 指示图标统一为 MDI chevron 路径，展开状态旋转；原生 Select 用同一路径的主题色 SVG 背景。表格排序保留已验收的双三角 SVG，并给 Virtual 同步可访问排序状态。真实文字含义的数学/差异符号不属于占位图标。
- ListGroup 保留已挂载子树、输入值和自定义/嵌套/禁用激活器；Treeview 离场节点即时 inert / aria-hidden，不混入可见键盘导航。共享 expand 对 padding、border、min-height 与中途反转做完整尺寸过渡，结束恢复原 inline 值和自动高度；disabled、手动/系统减少动效终止当前动画并进入最终状态。
- 补充 Autocomplete/DateInput 面板、Tooltip、Drawer 遮罩、Badge、StepperWindowItem、DataTable 详情、ConfirmEdit/Lazy 过渡；Overlay/BottomSheet 离场阶段保留滚动锁和 top layer，退出后恢复焦点。Window/Carousel/StepperWindow 内容使用同一 grid 单元，Lazy 使用 out-in，避免进入/离开内容同时撑高容器。排序、分页、虚拟行和表格分组的数据行集合仍直接更新，不添加大批行移动动画。
- 最终 typecheck、82/82 单测、库/文档 build 通过；日志 artifacts/icons-motion-{typecheck,unit,build}.log。完整 UI21/21（162 文档路由，200%缩放、800px窗口、键盘与减少动效）通过，无 pageerror，证据 artifacts/ui-VIKMWB。较早 artifacts/ui-8ef0Qo 也通过；最终验收以 VIKMWB 的切换布局修正为准。
- root 已亲自复核 artifacts/disclosure-motion-WykAGk 的 ListGroup 四张浅深/1440×900/390×844 图像，MDI 箭头、嵌套缩进、label/hint、禁用/自定义入口和窄屏布局通过。专项最终结果继续记录如下。
- 延迟加载专项发现 ULazy/UImg 的 immediate watch 将尚未挂载的 ref 当作不支持观察器的降级路径，visible 在真实进入视口前就变为 true。root 已拆开判断，等待 DOM 挂载后 observe，保留不支持观察器/显式关闭延迟的降级；Img 真实 demo 加入 lazy，公开 API 不变。
- 动效核心4组通过 artifacts/disclosure-motion-4EgoMo；root 复核该批最终 ListGroup 深窄和 Treeview 浅宽图像，同时复核 YYbpGn 的 Treeview 另外浅深/宽窄图像。Wt2r9p 的 Overlay 浅宽、BottomSheet 深窄、Window 重叠中帧3张 Native 截图由 root 直接检查，表面/遮罩、焦点轮廓、移动位置和单一内容高度通过。原生动画仅暂停当前时间做中帧取样，随后继续播放并验证完成；没有直接设置业务状态掩盖退出生命周期。
- root 独立快速重开诊断 artifacts/overlay-focus-OSkJsV：native dialog 与 data-state 均 open、inert=false、焦点仍在弹层内的快速重开按钮，无需额外产品焦点补丁。
- 最终动效专项 **17/17** 通过，报告 artifacts/disclosure-motion-azJW1B/report.json，pageerror / Vue warnings 均为0，node --check 通过。覆盖上述全部核心与补充组件、原生 popover 离场、步骤/窗口/轮播中帧的单一 grid 内容高度，以及 Lazy/Img 视口外不加载、真实文档滚动后加载与图片 decode。只在测试中暂停/继续浏览器动画取样；隐藏/离场节点使用 DOM locator，键盘事件发送到实际触发器，避免把测试准备问题当产品缺陷。
- Lazy/Img 修复及真实示例更新后的最终 typecheck、82/82单测、库/文档build、完整 UI **21/21** 均通过，最终完整 UI 证据为 artifacts/ui-HbR60v（162 路由、无 pageerror）；前述 VIKMWB 是该初始化修复前的通过记录。root 亲自复核 azJW1B 的 Overlay 中帧和 DataTable 详情最终图像，并复核8J9M8K表格详情/抽屉关闭窄屏状态：详情间距、单一外框、分隔线、MDI展开指示和剩余内容占位正常。结合此前8张ListGroup/Treeview状态与3张中帧图像，视觉验收通过。
- git diff --check 通过；UI工作区仍为本地未提交/未发布修改，0.3.2版本和main检查点a8220aa不变，UAH工作区干净、消费版本不变。

## 2026-10-07：列表与离散操作默认涟漪

- root 复用现有 vRipple/RippleOptions，亲自补齐产品实现、选择控件几何、动作表面裁切及真实 demo；辅助代理仅编写 tests/desktop/click-ripple.mjs。范围与原生控件/静态内容边界见 docs/RIPPLE-COVERAGE-2026-10-07.md。ListItem、Ripple 和 Card 示例/API/可复制源码同步，包装层转发配置。148 个 canonical API 当前含1306 props/models、118 events、190 slots、262 exposed members，源码与示例编译单测通过。
- 指令和列表/树复用内部 action-events.ts 排除独立子控件；嵌套 ripple=false 按钮不启动父层涟漪或改变父选择。选择控件反馈保持原生 input/label/ref，直接点击和 Space 只有一次反馈，标签快速点击允许独立波纹；Enter 保留原生语义。禁用/只读不产生反馈，播放中减少动效即时清理。
- root 视觉复核发现并修正三个样式问题：网格拉伸选择控件包裹层，390px 顶栏通用 span 规则隐藏 Switch，以及 Carousel/Label 通用 span 规则误设新反馈层。现使用 max-content / justify-self:start 和语义 class；Switch36×20、Checkbox/Radio16×16 与 input 一致，Carousel装饰点7×7、按钮内反馈24px圆形。
- typecheck、82/82 单测、文档/库 build 通过，日志 artifacts/ripple-coverage-{typecheck,unit,build}.log。既有 Ripple78项通过 artifacts/ripple-tOsq5P，activation43项通过 artifacts/ripple-activation-wpkvrK。
- 新专项 **154项断言全部通过**，证据 artifacts/click-ripple-LlPrpE/report.json，pageErrors / Vue warnings 均为0。覆盖 ListItem/ListGroup/MenuItem、选择控件 direct/label/rapid-label/Space、Treeview 行/箭头/checkbox、静态与动作 Card、选择器/级联、日期、数值/Rating、展开/步骤、表格排序/详情、轮播和消息动作，以及系统/手动减少动效。没有产品失败；ListGroup 激活器定位与表格按钮切换可访问名后的定位均在测试中按真实语义修正。
- 最新完整 UI **21/21** 通过 artifacts/ui-K4haar，162路由无横向溢出/pageerror，原200%缩放、800px窗口、键盘、焦点及数据表格断言保留。已有动效专项 **17/17** 通过 artifacts/disclosure-motion-qIqany，无 pageerror / Vue warnings；Lazy 断言等待真实 transitionrun 再采样，消除首帧竞态，没有更改产品生命周期或减弱顺序检查。
- root 亲自复核 artifacts/ripple-visual-19s5C6 的 **16张最终原生图像**（ListItem/Ripple控件/Carousel/Card × 浅深 × 1440×900/390×844），布局、文字/图标、独立操作、控件几何、禁用状态、裁切/主题色和窄屏顶栏可见性通过；report.json 记录波纹层/装饰点/控件几何以及 rootScroll=0/headerTop=0。仅暂停/恢复真实浏览器动画取样；未改变产品状态模拟反馈。
- node --check 两个新增桌面脚本、git diff --check 通过。当前本轮和之前脚注/MDI/过渡修改均为 UI 本地未提交、未发布内容，main检查点a8220aa、package0.3.2不变；UAH工作区干净，HEAD97c43a9，固定npm0.3.2未升级。

## 2026-10-07：按钮样式、颜色与完整表面反馈

- root 实现六种独立 variant 和 color，默认 outlined；同步内部调用、真实 demo、可复制源码、生成器与 API。danger/on-danger 默认跟随 error/on-error，并保留独立覆盖。对照 Vuetify4.2.4，继续使用本库主题；默认变体按用户要求保留。详细范围见 docs/BUTTON-COLORS-2026-10-07.md。
- 彩色 elevated 统一增强三层阴影；色块变体 elevated/flat/tonal 的透明1px边框移除，padding补回尺寸，反馈层覆盖整个按钮。图标固定尺寸、紧凑尺寸和加载态保持。outlined 的实际描边保留。
- typecheck、**84/84单测**、库/文档 build 通过，日志 artifacts/button-colors-{typecheck,unit,build}.log。新增两项主题回归检验默认 danger 别名和独立颜色覆盖，所有真实示例/API源码编译通过。
- 最终按钮专项 **722项**通过，artifacts/button-variants-35mtmy/report.json；覆盖四色三种色块的边框/外框、真实按住波纹四边、快速松手退场、颜色/前景/阴影、主题、禁用/加载与窄屏。状态过渡稳定后严格比较背景颜色；pageErrors/Vue warnings为空。
- loading专项 **3组**通过，artifacts/button-loading-cMMoHK/report.json，覆盖默认示例及浅深下八种变体/颜色、五种尺寸/loader。完整UI **21/21、162路由**通过，artifacts/ui-pI2hLP/report.json，无pageerror，保留缩放、键盘、分页和表格检查。表单专项 **14/14**通过，artifacts/forms-RrbEQh；仅按新的选择控件包装层定位原生 input，保留几何断言。
- root 亲自复核 artifacts/button-colors-visual-Wc9vk1 的 **16张原生图像**（矩阵、CSS颜色、loading × 浅深 × 1440×900/390×844），以及边框修复后 artifacts/button-filled-ripple-UAumHf 的 **12张真实按住中帧图像**（三种色块 × 浅深 × 宽窄）。无未染色外沿，四边层与host一致；阴影、尺寸、配色、单loader与响应布局通过，rootScroll/headerTop为0。原生动画仅暂停采样后恢复退出，不通过业务状态伪造反馈。
- 修改脚本 node --check、git diff --check 通过。UI 当前仍未提交、未发布，main a8220aa、package0.3.2；UAH干净，HEAD97c43a9、固定消费npm0.3.2不变。

## 2026-10-07：输入模式与键盘焦点轮廓

- root 先盘点共享焦点样式、组件 API 和真实示例。旧构建 artifacts/focus-modality-YiCqT0 复现 Slider/RangeSlider/ColorPicker 鼠标仍有1px外框；键盘后鼠标拖动原生 focus-visible 还会保持 true。内部模式追踪以 ownerDocument 共享捕获事件、引用计数及卸载清理；保留滑块焦点与原生拖动，文本编辑语义不变。root 完成全部产品样式、视觉示例说明与验收，辅助代理仅做测试。
- 规则覆盖单/双滑块、三个颜色通道、颜色/文件/上传输入、复合选择表面及已注册的按钮/列表/选择控件，补齐保留焦点的树、卡片、级联、原生Select、阅读区和标签面板。六个独立组件文档与 README 同步。选择状态描边、拖放高亮、文本/OTP编辑和滚动条行为保留，公开 API 不变。
- typecheck、87/87单测、文档/库 build 通过，日志 artifacts/focus-{typecheck,unit,build}.log。三个新生命周期测试验证共享监听、晚挂载继承、文档隔离、重复释放、最后卸载和原生事件未被取消。逐字键入测试发现 ColorInput 提前展开三位hex；root修正编辑草稿/失焦规范化。视觉验收发现小色块被通用 hover/focus 样式撑宽，root修正专用选择器，空闲/鼠标/键盘均26×26。
- 最终桌面专项 artifacts/focus-modality-9raHif/report.json 通过：28项操作观察、issues/pageErrors为0，六个range真实拖动和Tab/方向键、同节点键盘→鼠标→键盘、direct/label/Space、按钮/列表、文本/多行/OTP、颜色/文件/上传均通过。系统选择器检查采用按下后移出释放，未打开或验收OS对话框。真实Tab和逐字键入不以DOM事件或一次fill替代；原生颜色input/change事件仅用于模型同步检查。
- root 亲自复核36张最终原生PNG：artifacts/focus-visual-OcN4Yc 的滑块/双滑块/颜色编辑器24张（鼠标/键盘、浅深、1440×900/390×844），以及9raHif浅色桌面1264×1015、artifacts/focus-modality-Cpwuz6深色390×844的颜色/文件/上传各6张。鼠标轮廓消失、键盘清晰、范围手柄光晕、26px色块、窄屏布局和主题通过；初始24张同时记录rootScroll/headerTop=0、无横向溢出。Cpwuz6的28项操作观察也无失败。Firefox手柄规则已实现，但未做Firefox运行时检查。
- 最终完整 UI21/21、162路由通过 artifacts/ui-AmJ3ov/report.json，errors为空，保留缩放、键盘和数据回归。表单14/14通过 artifacts/forms-NTzx0x；涟漪 activation43项通过 artifacts/ripple-activation-EH0Zqj/report.json，无pageerror。最后的颜色按钮局部几何修正后重跑焦点与完整UI；表单/涟漪报告来自该修正前。脚本语法与git diff --check通过。
- UI未提交、未发布，main a8220aa、package0.3.2；UAH工作区干净、HEAD97c43a9、固定npm0.3.2不变。完整范围与边界见 docs/FOCUS-MODALITY-2026-10-07.md。

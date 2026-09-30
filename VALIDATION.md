# Checkpoint validation — 2026-09-26

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

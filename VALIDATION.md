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

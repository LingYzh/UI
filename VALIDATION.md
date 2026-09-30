# Checkpoint validation — 2026-09-26

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

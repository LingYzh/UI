# 原型对话组件验证

日期：2026-09-27。实现和证据仅位于 UI 仓库；由 root 进行最终视觉验收和 UAH 接入。

## 原型依据

参考 `D:/UAH/design/UAH_PC_Prototype_v1/src/app.js` 的 `toolDetails`、`changesHTML`、`actionsHTML`，以及 `styles.css` 的工具、codebox、diff、round-changes 和 message-actions 规则。保留现有主题 tokens。

- `UiActivity variant="inline"`：12px 标题、15px 前置图标、12px 末尾箭头、5px 标题垂直间距；无正文竖线和额外缩进。支持等宽 `filename` 和增删统计，连续工具可以嵌套组合。
- `UiDiff compact`：34px 浅底头部、非粗体路径、11px/1.9 差异、33/33/20px 行号与符号列，无竖栅格或大工具栏；红绿整行与文本。`inspectable` 发出 `inspect`。省略预览仍可复制完整快照。
- `UiFileChanges`：21px 顶部间距、12px 分隔线内距、11px 标题和统计、14px 文件图标、12px 等宽文件名；null 明确显示统计不可用。完整路径保留原生 title 和可访问名称。
- `UiMessageActions`：实际几何 28×28px ghost 图标按钮、2px 间距、10px 轮次标签。Tooltip 没有额外 Tab 停靠；业务由宿主处理。
- `lineDiff` 通过根入口和 `@lingyzh/ui/diff` 公开，统计和预览可以复用同一算法。

## 验证

`npm run typecheck`、14 项单元测试、生产文档/库构建通过。完整文档 Electron 回归 20/20，涵盖全部 32 个页面和 200% 缩放，证据：`artifacts/ui-Z8ELoc`。

Focused Electron 验证：`node tests/desktop/conversation.mjs`，证据：`artifacts/conversation-KM3a2M/results.json`。包含连续工具/内层调用键盘展开、零缩进与竖线、真实 Diff 行数、inspect/select/view-all/action 事件、Tooltip Escape/Tab、禁用操作、未知/空改动、超大内容完整复制、默认 Activity 外观保留、无页面横向溢出。

原生截图：`artifacts/conversation-KM3a2M/light.png`、`dark.png`（900px、125%），`wide-light.png`、`wide-dark.png`（1440px、100%）。使用 `BrowserWindow.capturePage()`，避免 Electron 缩放下 Playwright 截图裁剪。

所有默认组件 API 保持兼容；仅新增原型样式变体和声明式回调。未添加业务操作，也未修改 UAH。

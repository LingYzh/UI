# UiUsageMeter 验证记录

2026-09-28。新增组件基于 UAH 原型 `context-ring`、`context-bar` 与 `context-legend`，保留米白/陶土主题和八类暖灰、绿、棕分类色。UI 库先行，UAH 尚未由本任务修改。最终视觉验收由 root 完成，以下为实施自检证据。

## 复用与 API

现有按钮、容器、弹窗不能直接表达未知容量和分类构成，新增 `UiUsageMeter`。公开导出组件与 `UsageSegment` 类型。属性为 `used`、`capacity`、`estimated`、`label`、`compact`、`disabled`、`segments`、`compositionLabel`、`compositionEstimated`；紧凑模式触发 `inspect`。分类来源与总用量来源独立，分类条按有效分类之和绘制，不暗示与服务输入量相等。

缺失、负数、NaN、无限值不当作零用量；容量为零不计算百分比。紧凑未知容量保留已知数量（如 `1.2K · 容量未知`）。超过容量显示真实百分比，环绘制限制为完整一圈。未知分类显示“未统计”，合计标注“部分未统计”。无业务、窗口或运行时依赖。

## 自动验证

- `npm run typecheck`：通过。
- `npm run build`：文档和库构建通过。
- `node tests/desktop/usage-meter.mjs`：通过。隔离 Vite/Electron 自行关闭，不操作已有服务。
- 真实组件点击、Enter/Space 共触发三次；禁用原生按钮不可用。
- 零用量、容量未知、用量未知、NaN、120% 超限绘制、独立分类合计、动态数据更新均通过。
- 减少动态效果时环 transition 为 0s；浅深主题在 1440、900 及 900/125% 下 demo 无横向溢出。
- 无页面错误和不合法 HTML/hydration 警告。

## 视觉证据

证据目录：`D:/UI/artifacts/usage-meter-qKhMlm`。

- `light-1440-1.png`、`dark-1440-1.png`
- `light-900-1.png`、`dark-900-1.png`
- `light-900-1.25.png`、`dark-900-1.25.png`

实施者直接查看浅色 1440 和深色 900/125% 截图：字体密度、圆环、分类条和两列 legend 延续原型；标题与来源独立可读；估算、未知、超限与禁用均可辨认。125% 下文档本身可纵向滚动，组件没有横向裁切。窄于 520px 时 legend 单列。root 最终验收状态：2026-09-28 已逐一检查上述六张截图，结合键盘与动态状态回归通过验收，允许 UAH 消费此组件。

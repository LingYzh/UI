# 嵌套滚动正文修复验证

2026-09-28。UAH 最近请求弹窗在展开 CodeBlock 后出现大块空白。先在 UI 库真实 demo 复现，再修共享滚动组件；未增加 UAH 业务 CSS 或修改 UAH 弹窗。

## 根因与修复

`UiScrollArea` 的根外壳使用 `overflow: hidden`，它仍是浏览器可编程滚动容器。打开弹窗、聚焦展开按钮并展开大内容后，浏览器将外壳也滚动：实测外壳 `scrollTop=328`，外壳顶部 109，而内部 viewport 顶部为 -219，内部 viewport 自己 `scrollTop=0`。整个正文 viewport 被上移且外壳向下留下空白；缩放到 125% 时错位更明显。

Collapse 高度 628px、CodeBlock 内 viewport 高度 580px 正常。因此将共享滚动外壳改为 `overflow: clip`，外壳负责圆角裁切，内部 viewport 继续承担滚轮、键盘、拖动和文本滚动；没有新增 API。修后外壳 `scrollTop=0`，内部 viewport 与外壳顶部对齐。

## 真实组件与验证

`src/ui/docs/UsageMeterDemo.vue` 新增“打开嵌套内容弹窗”：scrollable UiDialog 中显示用量、可展开的 UiCollapse 与 100 行 UiCodeBlock、尾部说明和固定关闭按钮。文档同时说明滚动外壳约定。

- `npm run typecheck`：通过。
- `npm run build`：通过。
- `node tests/desktop/dialog-nested-content.mjs`：通过。除尺寸外，断言源码最后一行的 DOM Range 矩形确实处于可见 viewport 内、尾部说明可见、footer 可见、外壳不滚动、viewport 与外壳对齐。
- `node tests/desktop/dialog-scroll.mjs`：通过；保留固定标题/错误/footer、正文滚动、Esc 焦点恢复。
- `node tests/desktop/ui.mjs`：既有全组件回归 20 项通过，包含 33 文档 route、键盘/滚轮、滚动条拖动与 track seek、动态尺寸及 200% 缩放；证据 `D:/UI/artifacts/ui-PHOT1i`。

证据目录 `D:/UI/artifacts/dialog-nested-Avpq9P`：浅深主题 1440/100% 与 900/125%，各有 `expanded`、`scrolled` native capture，共八张。实施者已查看浅色 1440 展开、深色 900/125% 展开与末尾：正文完整占据滚动区；深色末尾第 86–100 行、尾部说明和关闭按钮均可见，不再出现大片空白。

root 已亲自查看 Avpq9P 全部八张截图，完成视觉验收：长代码正文连续可见，尾部说明与关闭按钮可到达，无此前留白；浅深主题与 900/125% 均通过。本次仅修共享滚动外壳 `overflow: clip`，无 API 变更。UAH 现在可重新构建使用此共享修复，并继续整体验证；不需要页面局部修复。

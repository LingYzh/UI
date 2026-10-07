# 主题与 Markdown 交互优化

本轮仅修改独立 UI 仓库；复用已有 tokens、UiCard、UiDialog、UiSnackbarHost、UiMarkdown、UiScrollArea 和文档示例容器。现有主题只支持根节点 data-theme，缺少注册、system 模式、响应式切换和局部继承；新增 createUiTheme / useUiTheme / UiThemeProvider，不引入 Material 外观或新依赖。

- 保留当前 light/dark 色值、字体与间距。primary 对应可读的 accent-text，primary-surface 对应原填充 accent；自定义 primary 默认同步填充色，也可独立覆盖。
- 支持主题定义继承、响应式修改、自动 on-color、颜色辅助类、可选颜色变体与切换过渡。变体采用每档 10% 白色/黑色混合，不声称复刻 Vuetify 的颜色算法。
- UiThemeProvider、Card/Dialog theme 属性提供局部主题；Teleport 通知继承所属主题。默认使用方式无需改动。
- Markdown 行内代码和 mark 使用 primary；details 保留原生语义与键盘操作，补充可中断的展开/收起动画；脚注双向跳转平滑居中，受滚动边界约束。系统和手动减少动态效果均立即切换。
- 新能力必须有真实组件 demo、源码示例、API 与验证记录。完成构建、自动化交互及根代理视觉验收后再交付。本轮不发布或升级 UAH。

参考：https://vuetifyjs.com/zh-Hans/features/theme

## 默认切换过渡增量

复用现有主题服务、UiPreview 顶栏、ThemeDemo 和 reducedMotion 文档偏好，无需新组件。缺口是服务默认 transition=false、ThemeDemo 另传默认 false；顶栏使用同一服务因而没有过渡。改为默认 true，demo 用共享减少动效开关控制，顶栏以主题开关为揭示起点。系统／手动减少动效在切换前抑制动画，播放中启用也立即结束；恢复完整动效后自动恢复，无额外偏好。显式 transition=false 保留供宿主按需配置。

## 同轮补充：Ripple 行为对齐

用户追加快速点击反馈缺陷。复用 vRipple、UiButton、UiTab/UiTabs、vPointerBlur 和文档页，不新建业务实现。原实现的 blur 清空与点击后主动失焦冲突；每次 start 清空也抹掉了前一波纹。对照官方源码、样式变量与传播说明后重写独立波纹生命周期：250ms 扩散 / 100ms 显现、最短显示 250ms、300ms 退场；触摸延迟 80ms，短 tap 提交、滑动取消；新波纹不删除旧波纹。

补齐 center / circle / stop 修饰符和 class / keys 配置，保留 center / color 旧配置与 UAH .14 默认强度。Pointer Events 避免触摸后兼容鼠标事件重复；普通指针失焦不清理波纹，键盘失焦结束保持；禁用或动态关闭停止新反馈，已有波纹完整退场，包括点击后进入 loading 的情况。减少动态效果、卸载和隐藏页面立即清理。只为静态宿主临时设置定位，波纹全部退出后恢复原值，不覆盖绝对或固定定位，也不改宿主 overflow。

root 负责全部 ripple 实现、样式与真实 demo；辅助代理仅编写专项交互测试。需检查快速松手仍在渲染的波纹、浅深配色、裁剪、布局、动态 class、连续点击、键盘、触摸、嵌套和清理。

参考：https://vuetifyjs.com/zh-Hans/directives/ripple/；官方 Ripple 实现和 VRipple 样式的行为基准，沿用 UAH 视觉 tokens。

## 2026-10-07：脚注跳转限制滚动范围

复用 UMarkdown、UScrollArea、文档正文滚动容器和既有 MarkdownDemo，不增加组件或公开属性。缺陷是 scrollIntoView 会滚动全部祖先，包括 overflow:hidden 的页面根，使常驻顶栏也被带动；原测试只检查屏幕中心，未限制外层滚动。

脚注和返回只对目标最近的 overflow-y:auto/scroll/overlay 祖先调用 scrollTo，以容器内容视口（含边框偏移）居中；没有局部容器才回退文档滚动根。保留平滑滚动、减少动效立即定位、边界钳制和 preventScroll 焦点移交。根节点、外层正文、侧栏及顶栏在局部跳转前后必须保持位置不变；无内部阅读容器的正文示例只改变正文滚动位置。root负责实现、demo和最终视觉验收，辅助代理只补交互回归及截图。

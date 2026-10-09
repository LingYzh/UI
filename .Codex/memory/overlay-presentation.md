# 2026-10-09 弹层 DOM 外观与过渡

用户裁定 Overlay/Menu/Dialog 全部使用普通 DOM 层，统一 attach/contained/absolute/zIndex；Tooltip 保留原生 popover。共享 UiOverlayHost 默认 Teleport 到 body，attach 为选择器/HTMLElement 指定目标、true 原位渲染；contained/absolute 未指定 attach 时原位，absolute layer 覆盖定位宿主的 client box。遮罩为独立实际 DOM 节点，scrim 支持 false/颜色，opacity 支持 0–1；未传仍为原 #2626243d。Dialog scrim 默认 true，避免 Boolean 省略时 false 丢失遮罩。

四类弹出物共享 UiMaybeTransition 和 overlay-transition 完成桥，支持 false/string/对象、JS done hooks 及自定义 transition component；默认仍用原 CSS 动效。关闭完成才清理 presentation/stack/lock/lazy content，反向及卸载取消待完成 Promise。Tooltip 保留 popover 至 leave 完成。

DOM 栈按显式 layer zIndex、同级注册顺序判断 top；默认嵌套层递增。保留原非模态 Overlay 默认，Dialog retainFocus 默认 true，允许最高子 Menu 接收焦点。Escape 的已消费检查、外部 click 的 WeakSet claim 防止一次原生事件关闭下一层；scrim 在 click 时关闭，仍校验 pointerdown/up 都发生在 scrim，避免 pointerup 先关层后 click 再关下一层。

动态 Teleport disabled 时不解析新的 to；inline 状态显式令 to=undefined，重新启用才解析最新目标，避免 attach HTMLElement→true→body 回到旧容器。Menu 组合字段 target 内点击属于 opener，避免 DateInput 的 focus 开启被同一次 click 关闭。UAutocomplete 在 after-enter 再滚动至选中虚拟行，确保 DOM host 真正呈现后 viewport 可用。Dialog after-enter 在焦点仍为根或外部时聚焦首项，空内容保留根 fallback。

验证：overlay-presentation-protocols Chrome 6组，四类过渡 hooks/default外观/真实demo通过；shared selection-menu 16组、color-input-menu 10组及 Tooltip back 7组通过。容器与最高层/focus/KeepAlive/快速反向完整证据由 overlay-container-protocols 记录。最终专项汇总见 VALIDATION 最新节。Root复核宽屏、390px暗色控件与打开Dialog截图。未运行完整构建/Electron全库门禁，无提交/推送/发布。
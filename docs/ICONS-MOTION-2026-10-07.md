# 图标与过渡盘点

复用现有 UIcon/MDI 路径、UCollapse、UTransition、useReducedMotion、原生 Dialog/Popover 及独立组件 demo。root 负责全部产品实现、共享样式和视觉示例；辅助代理仅做代码盘点和交互回归。保留之前未提交的脚注修复。

已发现文字占位箭头：ListGroup、Treeview、ExpansionPanelTitle、Autocomplete、Calendar、DatePicker、Carousel、DataTable 分组。同步检查展开图标及日期输入的日历入口，不替换表达真实文本含义的数学符号/差异标记。

动效缺口：ListGroup 直接 v-show、Treeview 直接删除可见节点、Autocomplete/DateInput 菜单直接 v-if、Overlay/BottomSheet 直接 showModal/close、NavigationDrawer 遮罩直接 v-if、Badge/StepperWindowItem/ConfirmEdit/Lazy 直接切换内容，Tooltip 没有淡入淡出。已有 Banner/ExpansionPanelText/Window/Carousel/SpeedDial 使用 UTransition，Collapse/Activity、Dialog、Menu/Cascader 有既有动效。UTransition 的 expand hooks 未检查 disabled、会覆盖调用方高度/overflow，带 padding/min-height 的元素收起还会残留空间，需要同步修正。Window/Carousel/StepperWindow 的进出内容需要位于同一 grid 单元，避免过渡期间上下堆叠；Lazy 用 out-in 切换占位与实际内容。

视觉规格：展开内容使用既有布局时长和缓动，箭头随状态旋转；阅读容器不滚动、不跳焦点。高度过渡完成后恢复自动布局，快速反转从当前尺寸继续。离场内容立即 inert；关闭弹窗的动画期间保持 top layer/滚动锁，真正关闭后再恢复焦点。手动/系统减少动效立即呈现最终状态并结束播放中的动效。不强制给排序、分页、虚拟数据更新添加布局动画。

参考：Vuetify v4.2.3 VListGroup 使用展开过渡与展开/收起图标，ExpandTransition 保存并恢复原 inline styles。
https://github.com/vuetifyjs/vuetify/blob/v4.2.3/packages/vuetify/src/components/VList/VListGroup.tsx
https://github.com/vuetifyjs/vuetify/blob/v4.2.3/packages/vuetify/src/components/transitions/expand-transition.ts

验收：逐个真实组件页验证 MDI SVG、展开/收起中间帧、快速反转、禁用和减少动效、键盘可访问性；root 复核浅深/390px/缩放截图。公开 API 未变更的组件仍由既有源码/API审计核对。

专项发现并修复：Lazy 和 Img 的 immediate watch 在 DOM ref 尚未赋值时直接设置 visible=true，导致真正的进入视口判断被跳过。现在等待 ref 挂载后再观察，只有不支持 IntersectionObserver 或显式禁用延迟时立即显示；Lazy 的占位离场与内容入场可以实际播放。

最终验收：typecheck、82/82单测、库/文档build、21/21完整UI（162路由）与17/17动效专项通过，无pageerror或Vue警告；证据分别为 artifacts/ui-HbR60v 与 artifacts/disclosure-motion-azJW1B。root直接复核明暗主题、1440px/390px的ListGroup/Treeview状态、Overlay/BottomSheet/Window中帧、表格详情与抽屉关闭布局，记录见VALIDATION.md。没有强制给排序、分页、虚拟行或表格分组的整批数据行更新增加动画；表格展开详情和分组箭头具备过渡。公共API/依赖不变，本地未提交、未发布。

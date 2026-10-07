# 默认涟漪覆盖

复用已有 vRipple、RippleOptions 和默认按钮/Tabs生命周期，不引入依赖。root负责所有产品代码、样式、真实示例及视觉验收；辅助代理仅盘点和独立交互回归。保留之前的脚注/MDI/内容过渡修改。

缺口：ListItem/ListGroup/MenuItem、Picker/Autocomplete/Cascader选项、Treeview行和展开入口、Item/Chip选择、展开面板/Activity/Stepper、表格排序/分组/详情、日期/轮播/颜色/评级/数值调整、清除/关闭/文件查看等原生按钮没有绑定已有指令。MessageActions额外强制关闭默认按钮涟漪。复用UButton的分页、日历工具栏、Fab和确认/重试按钮已有涟漪，不重复包裹。

设计：离散动作表面默认开启ripple，相关公开组件支持 false 或现有 RippleOptions；自定义ListGroup激活器props转发ripple。禁用/只读不能产生动作涟漪。嵌套独立控件只在实际触发的最内层产生，父列表/卡片不抢输入、拖动或子按钮事件。普通编辑输入、文本链接、遮罩/弹层事件委托、拖放区域不整面加涟漪；原生select/file选择按钮保留平台反馈。

选择控件使用包裹实际input的局部inline-flex表面，限定圆形居中的反馈范围，保持原生input/ref/label关联和现有几何。标签转发给input的可信点击也应有一次局部涟漪；不将span放进input。色板复用已有label表面。静态Card不启用，显式点击/Card as=button或链接才启用。

保证：沿用快速松手后完整250ms最短显现+300ms淡出、键盘保持/释放、触摸延迟与滑动取消；不为了涟漪延迟菜单选择/面板关闭。系统/手动减少动效停用并清理，无新焦点常驻。真实ListItem/demo说明、公共API与README同步。

验收：根代理复核浅深/390px中帧与几何；专项验证列表点击/键盘/禁用/显式false/嵌套按钮，选择控件标签/native输入一次涟漪，主要缺口组件实际反馈和减少动效；保留原ripple生命周期回归及全UI/API检查。

## 完成范围与实现约束

- ListItem、ListGroup 和 MenuItem 默认启用；补齐 Treeview 行/展开/选择、Autocomplete/Select/Combobox/Cascader/Picker 选项、Chip/Item、ExpansionPanelTitle、StepperItem、日期/轮播/颜色/评级/数值动作、表格排序/分组/详情/选择，以及清除/关闭/文件操作、消息动作等遗漏。Pagination 和 DataTableServer 等包装层转发 ripple，不叠加第二层指令。
- Checkbox、Radio、Switch、SelectionControl 与色板保留原生 input 和 label 行为。选择控件反馈局限于原控件尺寸，快速标签点击各自产生反馈；直接点击和 Space 不产生重复涟漪，Enter 不替代原生选择控件的 Space 语义。
- 新增内部 action-events.ts，独立子按钮、链接、输入控件和 label 拥有自己的事件；即使子按钮明确关闭 ripple，父 ListItem/Treeview 也不产生反馈或改变选择。禁用树节点的箭头同时禁止展开。
- 静态 Card 不启用反馈；点击处理器、链接属性或 as="button" 的动作 Card 默认启用。普通输入编辑面、原生 select/file 浏览按钮、文本链接和遮罩委托保留各自交互方式。
- 选择控件包裹层限定 max-content 尺寸和网格起点，避免表单布局拉伸或居中原输入。顶栏主题开关的窄屏隐藏规则改为只命中说明文本；Carousel 点和 Label 必填星号采用明确 class，避免 ripple 注入的 span 被通用选择器误设尺寸/颜色。

真实 ListItem 示例加入默认、关闭、自定义选项、禁用、独立按钮及嵌套选择控件；Ripple 页增加 native 控件/标签/禁用/只读例子，Card 页增加动作/静态对照。生成来源、可复制 SFC、API 和 README 同步。API 对照 148 个 canonical 组件，现为 1306 条 props/models、118 events、190 slots、262 exposed members；源码与示例编译检查保持有效。

参考固定的 [Vuetify 4.2.3 ListItem 源码](https://github.com/vuetifyjs/vuetify/blob/v4.2.3/packages/vuetify/src/components/VList/VListItem.tsx) 与 [SelectionControl 源码](https://github.com/vuetifyjs/vuetify/blob/v4.2.3/packages/vuetify/src/components/VSelectionControl/VSelectionControl.tsx)，沿用本库 tokens、Pointer Events 和减少动效策略。

## 最终验收

- typecheck、文档/库 build、82/82 单测通过；日志 artifacts/ripple-coverage-{typecheck,build,unit}.log。既有 ripple 生命周期 78 项通过 artifacts/ripple-tOsq5P，激活行为 43 项通过 artifacts/ripple-activation-wpkvrK。
- 新增 tests/desktop/click-ripple.mjs：真实 Electron **154 项断言全部通过**，证据 artifacts/click-ripple-LlPrpE/report.json；pageErrors 和 Vue warnings 为 0。验证快速松手/重叠、键盘、动态 false/对象配置、禁用/只读、嵌套按钮和标签隔离、native 几何、主要动作表面以及播放中手动/系统减少动效清理。
- 完整 UI **21/21** 通过，162 文档路由、200% 缩放、800px 窗口及原键盘/焦点/表格回归无 pageerror，证据 artifacts/ui-K4haar。已有展开/退出专项 **17/17** 通过，pageerror / Vue warnings 为 0，证据 artifacts/disclosure-motion-qIqany。Lazy 测试等到真实 transitionrun 后读取记录，避免 DOM 挂载与首动画帧间的采样竞态；产品 Lazy 生命周期未在本轮改动。
- root 亲自查看 artifacts/ripple-visual-19s5C6 的 **16 张原生截图**：ListItem、Ripple 控件、Carousel 和 Card × 浅深主题 × 1440×900 / 390×844。控件与包裹层几何一致：Switch 36×20、Checkbox/Radio 16×16；轮播装饰点仍为7×7，反馈裁切于24px按钮。列表文字/子操作、禁用状态、卡片边框、主题色与窄屏顶栏可见性通过。报告同时记录阅读容器 rootScroll=0、headerTop=0。中帧取样只暂停浏览器动画，随后继续播放；不修改产品状态模拟反馈。
- node --check 两个新增桌面测试及 git diff --check 通过。UI main 检查点仍为 a8220aa，包版本0.3.2，本轮及此前脚注/MDI/过渡修改均为本地未提交、未发布内容。UAH 工作区干净，HEAD97c43a9，固定 npm0.3.2 未升级。

# 按钮样式变体与颜色分离

复用 UiButton/UButton、现有主题 tokens、默认配置、ripple 与 loading 生命周期；不新增组件或依赖。当前缺口是 primary/secondary/danger 混入 variant，六种标准 variant 被折叠成旧 class，部分 color 无法控制 tonal 背景、边框或正确的前景。

公开 variant 仅 elevated/flat/tonal/outlined/text/plain；按用户要求默认 outlined，保留本库无阴影描边外观。color 独立支持主题颜色、danger（error 的默认别名）和 CSS 颜色。elevated/flat 使用颜色填充及对应 on-color；其余使用颜色作为文字/图标，outlined 为同色边框（省略颜色沿用中性边框）、tonal 为同色柔和底层，text 为透明交互表面，plain 为透明弱化文字且无 hover 底层。保留 UAH 字体、尺寸、圆角和浅深主题；ghost 布尔保留兼容并映射 text，文档优先使用标准 variant。

用户指出彩色 elevated 的阴影不明显，统一增强为独立于文字/填充色的黑色三层阴影；所有颜色共用相同 elevation，hover 使用较高层级，flat 和默认 outlined 无阴影。

库内按钮和所有真实示例/源码迁移颜色语义，相关确认/分页包装调用同步，API 去掉旧 variant 值。root 直接负责全部产品实现、样式、视觉 demo 与视觉验收；辅助代理仅维护非视觉回归。

验收包含六种 variant × 多色、主题与 CSS 颜色、hover/focus/disabled/loading、浅深和宽窄屏、真实交互/ripple与原表单/分页回归。保留此前未提交的脚注/MDI/过渡/ripple 工作，UAH 固定依赖不动，本轮不发布。

## 对照与实现

官方 registry 本轮查询 latest 为 **Vuetify 4.2.4**。已核对 [colors 文档](https://vuetifyjs.com/zh-Hans/styles/colors/)、[variant 组合器](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/composables/variant.tsx)、[color 组合器](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/composables/color.ts) 和 [variant 样式](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/styles/tools/_variant.sass)。变体值、颜色职责、实心/文字颜色分配、tonal 底层及 plain 行为对齐该版本；本库默认 outlined 按用户明确偏好保留，与上游默认 elevated 的差异为有意设计。继续使用 UAH 调色板，不引入 Material 主题。

- UiButton 使用独立 ui-button--variant-* class，移除旧 primary/danger/ghost 样式规则和 has-color 的错误边框/前景覆盖。hover/active 使用 currentColor 的伪元素状态层，plain 不显示该层；状态层减少动效时立即更新。
- button-colors.ts 将主题名与 CSS 颜色分开解析，避免把 hex/rgb/hsl 直接插入 CSS 变量名称。主题 `on-*` 与显式 CSS 颜色前景独立，支持不透明颜色的亮度对比；半透明/复杂变量保留正文前景，主题 CSS 变量使用对应 on-color。
- theme 增加 danger/error 默认别名与对应 on-color，同步颜色工具类；显式自定义 danger/on-danger 仍优先，error 更新时默认 danger 一起更新。
- ConfirmHost、Pagination、Calendar、StepperActions、消息动作、代码/复制/重试等内部按钮迁移；所有真实 SFC、可复制源码及生成来源同步。新增 ButtonAppearanceDemo，六变体 × primary/danger/secondary/默认色，另含主题/CSS 色和统一禁用/加载交互。ButtonLoadingDemo 保留原尺寸、单 loader 和插槽检查，颜色与变体分开。
- API 直接对照源码生成：148 个 canonical 组件，1306 props/models、118 events、190 slots、262 exposed members。按钮 variant 联合类型与默认值、color/danger 语义和 ghost 兼容描述已更新；旧值只在 README 迁移说明中出现。

## 验证与视觉记录

- typecheck、**84/84 单测**、文档/库 build 通过，日志 artifacts/button-colors-{typecheck,unit,build}.log。新增两项主题回归证明 danger/on-danger 跟随实时 error/on-error，以及显式独立危险色/前景不被 error 修改覆盖。
- root 亲自复核 **16 张**最终原生窗口 PNG：artifacts/button-colors-visual-Wc9vk1（矩阵顶/底、CSS颜色、loading × 浅深 × 1440×900/390×844）。六变体的表面、彩色/中性边框、阴影、前景对比度、宽窄布局与加载图标通过。四种颜色 elevated 的实际 box-shadow 同值且非 none；flat 均为 none。截图 PNG 与窗口尺寸一致，rootScroll/headerTop 为0，无水平溢出和 pageerror。
- 首轮图像发现文档基底 button:disabled 的 opacity .62 又作用于 loading。已恢复 loading 专用覆盖为1，plain 保持自身弱化 .62；最终 Wc9vk1 四张 loading 图像确认原配色与尺寸保持，不以浅淡禁用外观替代加载态。较早 tYfveC 图像属于此修正前的记录，不作为最终 loading 验收。
- 用户追加长按时色块外沿没有被 ripple 染色的问题。elevated/flat/tonal 原先透明1px边框也占据真实 border box，而反馈层 inset:0 只覆盖 padding box。现在色块变体 border-width=0，普通/紧凑 padding 各增加1px补回总尺寸，icon 仍用原固定尺寸和零 padding。outlined 保留实际描边；无需扩大反馈层到按钮外部或修改通用 ripple 引擎。
- ButtonLoadingDemo 的完整源码由 generate-completion-docs.mjs 同步，新增外观示例也通过同一生成器导出，避免再生成丢失文档引用。原按钮等待/图标/指定宽度/loader 插槽回归保留。
- 边框修复后，root 亲自复核 **12 张真实按住中帧原生 PNG**：artifacts/button-filled-ripple-UAumHf（elevated/flat/tonal × 浅深 × 1440×900/390×844）。涟漪覆盖整块表面，没有未染色外沿；四边反馈层与按钮边界一致，原尺寸、圆角和阴影正常，根滚动/顶栏位置为0。暂停真实动画采样后恢复并验证退出，没有修改业务状态模拟波纹。
- 最终按钮专项 **722 项断言通过**：artifacts/button-variants-35mtmy/report.json。包括三种色块变体 × 四色的零边框与外框尺寸、真实 held ripple 四边覆盖、快速松手完整退场、六变体颜色/前景/阴影、主题切换、禁用/加载及窄屏。pageErrors/Vue warnings 均为空。状态切换后等待160ms颜色过渡稳定再比较，保留严格颜色一致断言。
- 最终 loading **3 组通过**：artifacts/button-loading-cMMoHK/report.json，覆盖默认示例及浅深主题下八种 variant/color、五种尺寸/loader边界。完整 UI **21/21**、**162 路由**通过：artifacts/ui-pI2hLP/report.json，保留缩放、键盘、分页、表格与默认尺寸回归，无 pageerror。表单专项 **14/14** 已通过：artifacts/forms-RrbEQh；本次色块边框修复不改变其布局，未重复运行。
- git diff --check 与修改脚本语法检查通过。当前为 UI 本地未提交、未发布修改，main 检查点 a8220aa、package0.3.2 不变；UAH 工作区干净、HEAD97c43a9，继续固定消费 npm0.3.2。

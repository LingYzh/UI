# Vuetify 4.2.3 组件与使用方式对齐审计

审计日期：2026-10-06。目标是对齐组件职责、组合方式和可复用能力，继续使用 UAH 的视觉 tokens、浅深主题和既定焦点策略。

## 本地实现进展（审计之后）

以下原始清单记录的是实现前的 48 组件 / 62 页面基线，不能当作当前缺口列表。当前工作区已扩展至 148 个 canonical U* 组件、162 个文档页面；公开用法为 `<u-xxx>`，保留旧 Ui* 导出兼容。新增组件的 101 个独立示例位于 `src/ui/docs/component-examples`，每页展示对应组件及必要的容器、子组件，源码直接来自实际示例文件。

已接入 createUI/defaults/display/locale/icons/rules、响应式工具类和公共指令；补充选择器、组控件、专门输入、应用布局、Overlay、列表/树/虚拟化、客户端/服务端数据表格、日期/步骤/窗口/轮播等基本能力。Form 保持状态与验证职责，Row/Col 管理布局。当前 API 参考逐项对照公开源码生成，不使用审计前的 API 快照。

验证包括 82 项模型/源码/API/示例编译检查、完整 UI 20 组和 162 路由访问、101 独立示例归属检查；视觉验收及证据见根目录 `VALIDATION.md` 的本次增量。基础可运行、API 对照和逐页 smoke 不代表全量 Vuetify 属性、SSR、RTL 或所有新组件的完整交互已完成对等验收。Labs 10 个家族仍为独立实验范围；Code、公共 SlideGroup 与受控 Snackbar/Queue 等原审计差异也需继续跟进，不标成完全兼容。所有更新尚未发布，消费端继续使用 npm 0.3.2。

## 范围与结论

- 上游基准：官方 npm registry 的 `latest = 4.2.3`，并固定读取 `v4.2.3` 标签源码。不能以搜索缓存中的 4.2.2、`next` 或旧版文档示例作为当前标准。[发布记录](https://github.com/vuetifyjs/vuetify/releases/tag/v4.2.3)
- 本地基准：`D:/UI` 当前工作区，48 个公开 Vue 组件、62 个文档页面。主题、Markdown、Ripple 和 Tabs 的最近更新仍在工作区，尚未发布；package.json 的 0.3.2 不代表工作区内容已经进入 npm 包。UAH HEAD 为 `97c43a9`，继续消费固定 npm 0.3.2。
- 已有表单验证、内置 label/hint、标签方向、Row/Col 表单布局、级联选择、Tabs/Window 组合、主题服务和 Ripple 等基础能力。主要不足是统一配置与控件契约、响应式布局版本差异、选择组与搜索选择器、专门输入控件、应用布局和数据展示能力。
- 本次完成盘点和优先级整理，没有把清单中的缺口自动实现或发布。静态核对不代替新能力的交互和视觉验收。

完整上游家族清单与本地对应关系见文末；机器可读快照见 [JSON 清单](VUETIFY-ALIGNMENT-AUDIT-2026-10-06.json)。上游导出项是组件家族，一个家族可能包含多个子组件；它与本地 48 个单组件不是同一个计数单位，不计算“48 / 102”覆盖率。[上游稳定组件入口](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/components/index.ts)

## 优先处理的现有差异

### 1. 栅格仍使用旧断点，缺少统一 display 服务

| 下限（px） | xs | sm | md | lg | xl | xxl |
| --- | --- | --- | --- | --- | --- | --- |
| 本地 Grid | 0 | 600 | 960 | 1280 | 1920 | 2560 |
| Vuetify 4.2.3 | 0 | 600 | 840 | 1145 | 1545 | 2138 |

本地依据：[layout.css](../src/ui/layout.css:178)、[utilities.css](../src/ui/utilities.css:363)。新版阈值在 [Sass 设置](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/styles/settings/_variables.scss) 和 [display 服务](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/composables/display.ts) 中一致。例如视口为 900px 时，上游已进入 md，本地 md 列配置还未生效。

本地 Col 已支持 sm/md/lg/xl/xxl 列宽、offset/order，不能算完全缺失响应式布局。但工具类目前只覆盖 sm/md/lg 的少量 display/flex-direction，缺少完整响应式 alignment、spacing、xl/xxl 组合；没有公开 useDisplay、mobileBreakpoint 和可统一配置的阈值。Container 也是固定 1200px 上限，而非随断点变化的容器宽度。

Row 已有 density/size/noGutters/base align/justify，但缺少 gap 的统一接口，size 只接收 number。**新版 Row 已弃用 align*/justify*/alignContent* 属性，推荐相应响应式工具类**；不应把补齐旧版属性当作新版对齐的主要方案。优先补新版 gap、工具类和一致的阈值服务，旧属性可保留兼容。[VRow 4.2.3](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/components/VGrid/VRow.ts)

### 2. Form 统一外观继承与属性落实不完整

[form.ts](../src/ui/form.ts:63) 使用 `props.dense ?? form.dense` 等逻辑继承。Input/Textarea/Select/Cascader 显式将 dense/ghost/rounded 默认设为 undefined；Checkbox/Radio/Switch/ColorSwatches 未这样处理。Vue SFC 编译结果中，后四者生成普通 Boolean props，未传值时为 false，会挡住该继承分支。

进一步核对四者模板，发现它们没有消费 `control.dense/ghost/rounded` 来绑定样式状态；UiControlFrame 也只负责 label/hint 等框架。因此不仅有默认值问题，还存在公共类型声明了外观属性、渲染却未落实的问题。哪些变体适用于开关/复选/单选，需要统一规格后显式实现或收窄文档，不能仅把 Boolean 默认值改掉就宣称全部修好。

已用项目的 Vue compiler 编译五类代表组件确认默认值差异，并直接核对模板消费情况；这是有源码和编译证据的缺口，尚未在本轮做浏览器专项复现。修复应覆盖“省略继承、显式 true、显式 false”三个状态，并在真实 Form demo 展示。disabled/readonly 当前采取表单与控件的 OR 合并，不能和上述外观属性问题混为一谈。

### 3. 同名组件的职责与上游不完全对应

| 本地组件 | 实际职责 | 对齐时需要补充的部分 |
| --- | --- | --- |
| UiInput | 单行输入，接近 VTextField | 上游 VInput 是验证/详情/布局基座，不是文本输入本身；避免因名字误判基座已公开 |
| UiField | 自定义表单项的 label/description/error 与 controlAttrs 容器 | VField 的输入表面、变体、清除、前后缀区域与状态槽契约没有完整对应 |
| UiBadge | 行内文字标签，可关闭，接近 VChip | 尚无真正附着在触发器上的数量/圆点 Badge；Chip 与 ChipGroup 的选择模型也未完整具备 |
| UiTable | headers/items 驱动的展示表格 | 不具备 VTable 的简单 HTML 表格插槽使用方式，也不是完整客户端 DataTable |
| UiColorSwatches | 预设色板选择 | 不等于可选任意颜色的 ColorPicker/ColorInput |
| UiScrollArea | 滚动条及内容容器 | 不等于 VirtualScroll；没有可视区虚拟渲染 |
| UiTabsWindow | 与 Tabs 共用模型的面板 | 不能当作通用 Window 的触摸切换/过渡/轮播能力 |

已有调用不应直接改名破坏兼容。建议以补公共能力、增加语义清楚的组件/别名及迁移示例来处理。UiField 仍保留用户要求的自定义表单项用途；不要求所有内置控件重新套一层 Field。[上游 VField 契约](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/components/VField/VField.tsx)

## 表单与选择控件

| 领域 | 当前支持 | 未跟进的主要能力 |
| --- | --- | --- |
| 通用控件配置 | label/hint 位于控件框架，top/left 标签；rules/errorMessages/disabled/readonly；dense/ghost/rounded | 全局/局部 DefaultsProvider；统一 density/variant/color/size 等契约；clearable、prefix/suffix、persistentHint/hideDetails、loading、通用详情/清除槽在多个控件上不齐 |
| TextField | string/number/null，type=number 的数字模型，原生属性、leading/trailing 槽、宽度 API | 统一 clear/counter/prefix/suffix/详情 API；专门 NumberInput 的步进、精度及交互不能以原生 type=number 代替 |
| Textarea | autoGrow/maxRows/noResize/counter，控件样式与表单框架 | 通用输入表面配置、详情槽与其他输入控件统一；maxlength 仍由原生属性限制，counter 本身不负责限制 |
| Select | 单值模型、扁平 items、描述/提示/禁用项、原生 option/optgroup 槽、宽度约束 | multiple 数组模型、clearable、chips、search、returnObject、itemTitle/itemValue/itemProps、比较器、hideSelected、虚拟列表；items.value 类型只有 string，而 model 支持 number，契约需要统一 |
| Autocomplete / Combobox | 没有独立组件 | 输入搜索、受控 search、过滤/异步结果、创建自由值、键盘选择及其表单验证；菜单中手动放 Input 不等于已有正式控件 |
| Checkbox / Switch | boolean；Checkbox 有 indeterminate | trueValue/falseValue、数组/自定义 value、统一 selection control/group；Switch 的 loading/inset 等行为 |
| Radio / RadioGroup | 单值 Radio，共用 name/v-model 手工成组 | RadioGroup 容器、组级验证/label/hint/disabled、方向和密度继承；数组选择组与 ItemGroup/BtnToggle/ChipGroup |
| Form | 自动注册控件、三态有效性、异步 rules、fastFail、validate/reset/resetValidation、错误列表、聚焦首错 | invalid-input、lazy/eager 组合验证时机；规则别名及常用规则服务；上游 SubmitEventPromise 与本地 submit(event, result) 的差异；统一状态 slot 的完整契约 |
| 专门输入类型 | Input 可透传部分原生 type；色板及级联已存在 | NumberInput、FileInput/FileUpload、Slider/RangeSlider、DateInput/DatePicker/TimePicker、OtpInput、ColorInput/ColorPicker、Rating；不能以原生日期/文件输入认定已具备完整专门控件 |
| Cascader | 已公开，有规则、标签/说明、清除和路径控制 | 独立扩展，不是 Vuetify 稳定版的缺失对应项；Treeview 另行盘点，不能以级联菜单代替 |

本地证据：[公共导出](../src/ui/index.ts)、[表单共用类型](../src/ui/form.ts)、[验证](../src/ui/validation.ts)、[Select](../src/ui/UiSelect.vue)、[Checkbox](../src/ui/UiCheckbox.vue)、[Radio](../src/ui/UiRadio.vue)、[Form](../src/ui/UiForm.vue)、[真实表单示例](../src/ui/docs/FormDemo.vue)。

上游依据：[Select](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/components/VSelect/VSelect.tsx)、[items 解析](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/composables/list-items.ts)、[验证时机与规则类型](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/composables/validation.ts)、[Form 提交契约](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/components/VForm/VForm.tsx)。

新版还有可选 rules plugin，提供 required/email/length 等别名与自定义规则构造器。本地仍只接受规则函数；现有同步/异步验证基础应复用，不重新写一套验证引擎。[规则服务](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/composables/rules/rules.ts)、[可选插件入口](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/composables/rules/plugin.ts)

还需明确 Form 的行为兼容边界：本地注册控件的 reset 恢复初始模型值，上游验证基座 reset 将模型清为 null；本地 resetValidation 清空内部错误并恢复未知状态，上游会根据 lazy/eager 策略重新验证。上游提交事件可等待验证结果，并会在验证前发出事件；本地只在验证通过后发出 submit(event, result)，无效时发 invalid。这些会影响同一份调用代码的结果，必须加实际示例与兼容方案，不能仅让方法名一致就算对齐。[本地状态与重置](../src/ui/form.ts:103)、[上游验证生命周期](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/composables/validation.ts)、[上游提交事件](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/components/VForm/VForm.tsx)

## 其他公共能力

| 领域 | 当前支持 | 差异或缺口 |
| --- | --- | --- |
| 应用框架 | Container/Row/Col/Spacer，Dialog end 可作局部抽屉 | 无 App/Layout/Main/AppBar/NavigationDrawer/Toolbar/Footer/SystemBar 的布局注册、占位与协调机制；Dialog 抽屉不等于导航抽屉 |
| 数据表格 | UiTable 的行列展示/排序事件；Server 的分页模型、update:options、loading/error/retry | 完整客户端 DataTable、search/filter、multiSort、选择/全选、展开、分组、虚拟表格、DataIterator。现有排序实现只读/写第一列，sortBy 数组类型不代表支持多列 |
| 列表与树 | MenuItem 只服务菜单，Cascader 服务路径选择 | List/ListItem/ListGroup、Treeview、VirtualScroll、InfiniteScroll；菜单项不能直接视为通用列表项 |
| Overlay 与 activator | 原生 Dialog/Popover、Menu activatorProps、Tooltip wrapper，已有键盘与焦点处理 | 公共 Overlay、统一 activator props/受控模型、location/scroll strategy、persistent、hover/focus/click 触发配置和延迟。Menu/Dialog 使用 v-model:open，上游主要使用默认 v-model；Tooltip 没有受控显示模型 |
| Tabs 与 Window | 共享值模型、mandatory、箭头/方向/grow/fixed/stacked/slider、Window lazy/eager | 仍需维护 Tabs 的统一基础配置；通用 Window 的触摸/方向过渡、SlideGroup/ItemGroup 公共组合尚缺。此前选中 hover 修复已完成，不重复记作未修复 |
| 反馈与展示 | Alert/Card/Badge/Progress/Spinner，snackbar 和 confirmDialog 服务 | Avatar、真正的 Badge、Divider、Sheet、EmptyState、SkeletonLoader；完整 Circular/Linear 进度状态；ExpansionPanels 的组模型、Stepper、Breadcrumbs、BottomSheet、BottomNavigation、Timeline |
| 主题 | 默认浅深、自定义/system、provider、颜色/变量/variations、默认过渡和减少动效 | 并非每个组件都暴露 theme/color 等统一配置；颜色解析/变体算法与上游有差异。直接设置 global.name 或系统主题变化走直接状态更新，不能把 change/toggle 的动画保证推广到所有写入路径 |
| 图标 | @mdi/js SVG、registerIcons、常用内置名称和自定义 path | 全局 icon sets/aliases/defaultSet、多套图标及局部配置契约；不必内置所有 MDI 文件，按需注册仍是有效使用方式 |
| Locale / RTL | 全局 zh/en 翻译，一些组件使用逻辑方向，Tabs 有方向处理 | LocaleProvider、自定义翻译/fallback、全库 RTL、数字/日期适配器；局部能反向排列不代表完整 RTL |
| 配置与组合式服务 | createUiTheme/useUiTheme、locale、icon 注册、确认/通知服务 | createUI 的聚合配置、DefaultsProvider、别名/蓝图式预设、useDisplay/useLocale/useDate/useGoTo；对外配置应按真实需求分阶段加，保留按需导入 |
| 动效与指令 | 公共 vRipple；多个组件内部有观察器/外部点击/滚动 | 公共 ClickOutside/Intersect/Mutate/Resize/Scroll/Touch/Tooltip 指令；统一 Transition 组件/组合接口。内部实现不等于外部可复用导出 |
| 性能与平台 | 有独立文档构建、源码 npm 导出、原生 popover/base-select 回退 | 公共虚拟化/懒加载组件缺失；SSR/hydration/display 服务没有对等验收。不能仅因某模块有 typeof document 判断就宣称整个库已完成 SSR 支持 |
| 样式体系 | 4px spacing、flex/display/text/border 等工具类，主题颜色工具类 | 响应式覆盖不足、公共 elevation/rounded/typography 配置未统一；保留 UAH 字号与视觉，不自动移植 Material 字体/阴影/浮动标签 |

本地证据：[DataTableServer](../src/ui/UiDataTableServer.vue)、[Table](../src/ui/UiTable.vue)、[Menu](../src/ui/UiMenu.vue)、[Dialog](../src/ui/UiDialog.vue)、[Tooltip](../src/ui/UiTooltip.vue)、[Theme](../src/ui/theme.ts)、[Locale](../src/ui/locale.ts)、[图标](../src/ui/icons.ts)、[工具类](../src/ui/utilities.css)。

全局服务基准见 [4.2.3 framework](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/framework.ts)。服务和组件的“职责类似”不等于代码或公共 API 可以直接互换。

## 补齐顺序与验收条件

| 批次 | 范围 | 验收重点 |
| --- | --- | --- |
| P0：现有基础一致性 | 修复 Form 外观继承；统一控件配置/状态；统一 v4 断点和响应式工具类，补 Row gap/useDisplay；梳理同名职责及兼容路径 | 省略与显式覆盖、断点边界/窄屏/缩放、真实表单 Row/Col、旧用法兼容；root 浅深主题视觉验收 |
| P1：表单常用能力 | RadioGroup/选择组、Chip/ChipGroup、Select multiple/clear/item 映射；Autocomplete/Combobox；验证时机和规则服务 | 对象/数字/数组模型、禁用/只读/错误、键盘导航、异步结果、长内容/菜单宽度、无说明间距 |
| P1：页面基本积木 | List/Treeview/VirtualScroll、Overlay/统一 activator，Divider/Sheet/Avatar/Badge/EmptyState/SkeletonLoader；按真实页面需求补 App/Layout/Drawer | 嵌套 overlay、Tab/Escape/焦点恢复、局部主题、列表选择与无数据/loading；不在 UAH 另造公共能力 |
| P1：数据与专门输入 | 客户端 DataTable、Server 多列排序/选择/展开/分组；NumberInput、FileInput；日期/时间/滑块按使用场景推进 | 客户端/服务端状态职责明确，取消过期请求、分页稳定，数值/文件/日期边界与验证 |
| P2：扩展组件与体验 | Stepper/ExpansionPanels/Breadcrumbs/BottomNavigation、其他输入类型、Carousel/通用 Window/Img/响应式媒体、Lazy/InfiniteScroll、Locale/RTL/date/goto、其余指令 | 同一套公共配置；减少动效、键盘、响应式与文档状态覆盖 |
| 按需：重型展示与 Labs | Calendar/Sparkline 等图表、Parallax/SpeedDial/PullToRefresh；Labs 组件单独评估 | 有消费场景再实现，明确实验性质，不和稳定组件共用完成状态 |

每个新组件/能力都先在 UI 完成公开 API、真实组件 demo、完整源码示例和文档；复用现有基础，按规则完成视觉及交互验收后再发布、升级 UAH。上表是工作顺序，不是已经实现的承诺。

## 本次验证

- 对照公开入口、Vue 源码与导出的类型，核对所有组件的文档页映射；下方本地清单逐项保留文件、路由和 API 字段快照。
- `npm test`：58/58 通过；包含公开 API 与源码契约对照、文档示例编译等现有检查。日志：`artifacts/vuetify-audit/local-tests.log`。
- SFC 编译确认省略 Boolean props 的默认值差异，证据记录在 JSON 的 `formInheritanceEvidence`。这是编译核对，未宣称完成浏览器视觉复现。
- 原有 API 文档与当前实现没有因本次清单变更而添加未实现属性。API 同步检查通过不代表与 Vuetify 的 API 已完整一致。
- 本次只增加审计资料和交接记录，没有产品代码/依赖变更，因此没有重新执行无关桌面回归；最近产品修改的验收证据仍以 [VALIDATION.md](../VALIDATION.md) 为准。

<!-- INVENTORY: generated below from fixed upstream exports and current public component contracts. -->

## 稳定组件家族：逐项清单（102 项）

状态含义：**基础已覆盖**为核心职责/常用组合已有，仍可有 API 差异；**部分覆盖**为有公共近似实现；**内部能力**为只能在其他组件或内部代码中使用；**缺失**为无公共对等组件。具体属性以上文和本地 API 为准。

[固定版本稳定入口](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/components/index.ts)。该表按家族计数，不漏掉基础类，也不将家族下的子组件另算覆盖率。

| 上游家族 | 状态 | 本地对应/关联 | 优先级 | 主要差异 |
| --- | --- | --- | --- | --- |
| VApp | 缺失 | — | P1 | 缺协调布局或浮层的公共基础及对等组件。 |
| VAppBar | 缺失 | — | P1 | 缺协调布局或浮层的公共基础及对等组件。 |
| VAlert | 部分覆盖 | [UiAlert](../src/ui/UiAlert.vue) | P2 | 已有反馈提示；统一图标、边框、密度与关闭模型等契约仍需逐项扩展。 |
| VAutocomplete | 缺失 | — | P1 | 缺独立组件与组级模型/状态/验证契约。 |
| VAvatar | 缺失 | — | P1 | 缺独立公共组件；现有 UiBadge 为行内标签，不等于附着 Badge。 |
| VBadge | 缺失 | — | P1 | 缺独立公共组件；现有 UiBadge 为行内标签，不等于附着 Badge。 |
| VBanner | 缺失 | — | P2 | 缺独立公共组件及其分组/导航契约。 |
| VBottomNavigation | 缺失 | — | P2 | 缺独立公共组件及其分组/导航契约。 |
| VBottomSheet | 缺失 | — | P2 | 缺独立公共组件及其分组/导航契约。 |
| VBreadcrumbs | 缺失 | — | P2 | 缺独立公共组件及其分组/导航契约。 |
| VBtn | 部分覆盖 | [UiButton](../src/ui/UiButton.vue) | P0 | 自有 variant/size/dense；缺统一颜色/密度契约及 href/to 按钮链接。 |
| VBtnGroup | 缺失 | — | P1 | 缺独立组件与组级模型/状态/验证契约。 |
| VBtnToggle | 缺失 | — | P1 | 缺独立组件与组级模型/状态/验证契约。 |
| VCalendar | 缺失 | — | 按需 | 缺独立公共组件；根据实际消费场景推进。 |
| VCard | 部分覆盖 | [UiCard](../src/ui/UiCard.vue) | P2 | 已有表面变体和内容槽；独立标题/正文/操作子组件、导航与通用配置不齐。 |
| VCarousel | 缺失 | — | P2 | 缺独立公共组件；内部逻辑不能当作公共复用契约。 |
| VCheckbox | 部分覆盖 | [UiCheckbox](../src/ui/UiCheckbox.vue) | P1 | boolean + indeterminate；无数组模型/自定义选中值映射。 |
| VChip | 部分覆盖 | [UiBadge](../src/ui/UiBadge.vue) | P1 | 行内可关闭标签职责接近 Chip；无正式 Chip/选择模型/ChipGroup。 |
| VChipGroup | 缺失 | — | P1 | 缺独立组件与组级模型/状态/验证契约。 |
| VCode | 部分覆盖 | [UiCodeBlock](../src/ui/UiCodeBlock.vue) | P2 | 已有代码块；不是同契约的通用行内代码组件。 |
| VColorInput | 缺失 | — | P2 | 缺独立公共组件；ConfirmHost/色板不等于确认编辑/完整颜色选择。 |
| VColorPicker | 缺失 | — | P2 | 缺独立公共组件；ConfirmHost/色板不等于确认编辑/完整颜色选择。 |
| VCombobox | 缺失 | — | P1 | 缺独立组件与组级模型/状态/验证契约。 |
| VConfirmEdit | 缺失 | — | P2 | 缺独立公共组件；ConfirmHost/色板不等于确认编辑/完整颜色选择。 |
| VCounter | 内部能力 | [UiTextarea](../src/ui/UiTextarea.vue) | P1 | Textarea 内置计数器；无独立 Counter 导出，未覆盖全部输入类型。 |
| VDataIterator | 缺失 | — | P1 | 缺公共列表/树/虚拟化/数据迭代器。 |
| VDataTable | 部分覆盖 | [UiTable](../src/ui/UiTable.vue)、[UiDataTableServer](../src/ui/UiDataTableServer.vue) | P1 | 包含 Server 家族基础；客户端过滤分页、多列排序、选择/展开/分组/虚拟表格缺失。 |
| VDateInput | 缺失 | — | P1 | 缺专门输入控件；原生 Input type 透传不等于组件能力。 |
| VDatePicker | 缺失 | — | P1 | 缺专门输入控件；原生 Input type 透传不等于组件能力。 |
| VDefaultsProvider | 缺失 | — | P0 | 缺全局/局部按组件名称设置默认 props 的公共容器。 |
| VDialog | 部分覆盖 | [UiDialog](../src/ui/UiDialog.vue) | P1 | 原生 Dialog；v-model:open，无完整 persistent/fullscreen/activator/策略契约。 |
| VDivider | 缺失 | — | P1 | 缺独立公共组件；现有 UiBadge 为行内标签，不等于附着 Badge。 |
| VEmptyState | 缺失 | — | P1 | 缺独立公共组件；现有 UiBadge 为行内标签，不等于附着 Badge。 |
| VExpansionPanel | 部分覆盖 | [UiCollapse](../src/ui/UiCollapse.vue)、[UiActivity](../src/ui/UiActivity.vue) | P2 | 已有局部折叠；无完整 Panels 组模型、互斥/多开和子组件体系。 |
| VFab | 缺失 | — | 按需 | 缺独立公共组件；根据实际消费场景推进。 |
| VField | 部分覆盖 | [UiField](../src/ui/UiField.vue) | P0 | 自定义表单项容器；VField 的输入表面、变体与状态槽未完整提供。 |
| VFileInput | 缺失 | — | P1 | 缺专门输入控件；原生 Input type 透传不等于组件能力。 |
| VFileUpload | 缺失 | — | P2 | 缺独立公共组件；ConfirmHost/色板不等于确认编辑/完整颜色选择。 |
| VFooter | 缺失 | — | P2 | 缺独立公共组件及其分组/导航契约。 |
| VForm | 基础已覆盖 | [UiForm](../src/ui/UiForm.vue)、[UiFormSection](../src/ui/UiFormSection.vue)、[UiFormActions](../src/ui/UiFormActions.vue) | P0 | 验证、注册/状态、reset 已有；不负责列布局。外观继承及验证时机/reset/提交契约仍有差异。 |
| VGrid | 部分覆盖 | [UiContainer](../src/ui/UiContainer.vue)、[UiRow](../src/ui/UiRow.vue)、[UiCol](../src/ui/UiCol.vue)、[UiSpacer](../src/ui/UiSpacer.vue) | P0 | 有响应式 12 列与 density；旧断点、固定 Container 上限、gap/工具类/useDisplay 未齐。 |
| VHotkey | 缺失 | — | P2 | 缺独立公共组件；内部逻辑不能当作公共复用契约。 |
| VHover | 缺失 | — | P2 | 缺独立公共组件；内部逻辑不能当作公共复用契约。 |
| VIcon | 基础已覆盖 | [UiIcon](../src/components/Icon.vue) | P2 | MDI SVG + 自定义注册；缺 icon sets/aliases/defaultSet 的统一配置。 |
| VIconBtn | 部分覆盖 | [UiButton](../src/ui/UiButton.vue) | P2 | UiButton icon 模式覆盖基础操作；没有独立图标按钮完整契约。 |
| VImg | 缺失 | — | P2 | 缺独立公共组件；内部逻辑不能当作公共复用契约。 |
| VInfiniteScroll | 缺失 | — | P2 | 缺独立公共组件；内部逻辑不能当作公共复用契约。 |
| VInput | 内部能力 | [UiInput](../src/ui/UiInput.vue) | P0 | UiInput 实为 TextField；UiControlFrame/useFormControl 仅内部承担部分基座职责。 |
| VItemGroup | 缺失 | — | P1 | 缺独立组件与组级模型/状态/验证契约。 |
| VKbd | 缺失 | — | P2 | 缺独立公共组件；内部逻辑不能当作公共复用契约。 |
| VLabel | 内部能力 | — | P2 | 控件框架内置 label；没有公共 Label 组件导出。 |
| VLayout | 缺失 | — | P1 | 缺协调布局或浮层的公共基础及对等组件。 |
| VLazy | 缺失 | — | P2 | 缺独立公共组件；内部逻辑不能当作公共复用契约。 |
| VList | 缺失 | — | P1 | 缺公共列表/树/虚拟化/数据迭代器。 |
| VLocaleProvider | 缺失 | — | P2 | 只有全局 zh/en；缺局部 locale/fallback/RTL 配置。 |
| VMain | 缺失 | — | P1 | 缺协调布局或浮层的公共基础及对等组件。 |
| VMenu | 部分覆盖 | [UiMenu](../src/ui/UiMenu.vue)、[UiMenuItem](../src/ui/UiMenuItem.vue) | P1 | 原生 Popover + activatorProps；受控模型/触发方式/位置滚动策略与上游不齐。 |
| VMessages | 内部能力 | — | P1 | 控件框架内置 hint/error；无公共 Messages 及统一详情槽体系。 |
| VNavigationDrawer | 缺失 | — | P1 | 缺协调布局或浮层的公共基础及对等组件。 |
| VNoSsr | 缺失 | — | P2 | 缺独立公共组件；内部逻辑不能当作公共复用契约。 |
| VNumberInput | 缺失 | — | P1 | 缺专门输入控件；原生 Input type 透传不等于组件能力。 |
| VOtpInput | 缺失 | — | P2 | 缺独立公共组件；ConfirmHost/色板不等于确认编辑/完整颜色选择。 |
| VOverlay | 缺失 | — | P1 | 缺协调布局或浮层的公共基础及对等组件。 |
| VPagination | 基础已覆盖 | [UiPagination](../src/ui/UiPagination.vue) | P2 | 基础分页模型及禁用/紧凑；统一颜色、密度、图标及按钮配置仍有差异。 |
| VParallax | 缺失 | — | 按需 | 缺独立公共组件；根据实际消费场景推进。 |
| VPicker | 缺失 | — | P2 | 缺独立公共组件；ConfirmHost/色板不等于确认编辑/完整颜色选择。 |
| VProgressCircular | 部分覆盖 | [UiSpinner](../src/ui/UiSpinner.vue) | P2 | 仅不定进度旋转器；无可控数值的圆形进度。 |
| VProgressLinear | 部分覆盖 | [UiProgress](../src/ui/UiProgress.vue) | P2 | 基础 determinate 数值进度；indeterminate/buffer/stream 等模式未齐。 |
| VPullToRefresh | 缺失 | — | 按需 | 缺独立公共组件；根据实际消费场景推进。 |
| VRadio | 部分覆盖 | [UiRadio](../src/ui/UiRadio.vue) | P1 | string/number 单值，通过 name 手工组装；统一 group API 缺失。 |
| VRadioGroup | 缺失 | — | P1 | 缺独立组件与组级模型/状态/验证契约。 |
| VRangeSlider | 缺失 | — | P2 | 缺独立公共组件；ConfirmHost/色板不等于确认编辑/完整颜色选择。 |
| VRating | 缺失 | — | P2 | 缺独立公共组件；ConfirmHost/色板不等于确认编辑/完整颜色选择。 |
| VResponsive | 缺失 | — | P2 | 缺独立公共组件；内部逻辑不能当作公共复用契约。 |
| VSelect | 部分覆盖 | [UiSelect](../src/ui/UiSelect.vue) | P1 | 单值/扁平 items/native option；multiple、对象映射、chips/搜索、虚拟列表未齐。 |
| VSelectionControl | 内部能力 | [UiCheckbox](../src/ui/UiCheckbox.vue)、[UiRadio](../src/ui/UiRadio.vue)、[UiSwitch](../src/ui/UiSwitch.vue) | P1 | 三个实际控件存在；没有公共 SelectionControl 基座与完整值模型。 |
| VSelectionControlGroup | 缺失 | — | P1 | 缺独立组件与组级模型/状态/验证契约。 |
| VSheet | 缺失 | — | P1 | 缺独立公共组件；现有 UiBadge 为行内标签，不等于附着 Badge。 |
| VSkeletonLoader | 缺失 | — | P1 | 缺独立公共组件；现有 UiBadge 为行内标签，不等于附着 Badge。 |
| VSlideGroup | 内部能力 | [UiTabs](../src/ui/UiTabs.vue) | P2 | Tabs 内部有滚动条带；没有公共 SlideGroup 可独立组合。 |
| VSlider | 缺失 | — | P2 | 缺独立公共组件；ConfirmHost/色板不等于确认编辑/完整颜色选择。 |
| VSnackbar | 部分覆盖 | [UiSnackbarHost](../src/ui/UiSnackbarHost.vue) | P2 | 通过 snackbar 服务调用；非独立 v-model Snackbar 完整契约。 |
| VSnackbarQueue | 部分覆盖 | [UiSnackbarHost](../src/ui/UiSnackbarHost.vue) | P2 | 服务管理通知队列；没有对等 Queue 组件/受控模型。 |
| VSparkline | 缺失 | — | 按需 | 缺独立公共组件；根据实际消费场景推进。 |
| VSpeedDial | 缺失 | — | 按需 | 缺独立公共组件；根据实际消费场景推进。 |
| VStepper | 缺失 | — | P2 | 缺独立公共组件及其分组/导航契约。 |
| VStepperVertical | 缺失 | — | P2 | 缺独立公共组件及其分组/导航契约。 |
| VSwitch | 部分覆盖 | [UiSwitch](../src/ui/UiSwitch.vue) | P1 | boolean 开关，指针自动释放焦点；值映射/inset/loading 等未齐。 |
| VSystemBar | 缺失 | — | P2 | 缺独立公共组件及其分组/导航契约。 |
| VTabs | 基础已覆盖 | [UiTabs](../src/ui/UiTabs.vue)、[UiTab](../src/ui/UiTab.vue) | P2 | 共享模型、mandatory、方向/箭头/布局/slider 已有；继续统一控件基础配置。 |
| VTable | 部分覆盖 | [UiTable](../src/ui/UiTable.vue) | P1 | 目前 headers/items 驱动，不具备简单 HTML table 默认槽模式。 |
| VTextarea | 基础已覆盖 | [UiTextarea](../src/ui/UiTextarea.vue) | P1 | autoGrow/maxRows/counter/表单框架已有；通用 clear/详情/表面 API 不齐。 |
| VTextField | 部分覆盖 | [UiInput](../src/ui/UiInput.vue) | P1 | 字符串/数值、原生属性、leading/trailing；通用 clear/counter/prefix/suffix 未齐。 |
| VThemeProvider | 基础已覆盖 | [UiThemeProvider](../src/ui/UiThemeProvider.vue) | P2 | 局部主题与 service 已有；全组件可配置主题和算法仍有差异。 |
| VTimeline | 缺失 | — | P2 | 缺独立公共组件及其分组/导航契约。 |
| VTimePicker | 缺失 | — | P1 | 缺专门输入控件；原生 Input type 透传不等于组件能力。 |
| VToolbar | 缺失 | — | P1 | 缺协调布局或浮层的公共基础及对等组件。 |
| VTooltip | 部分覆盖 | [UiTooltip](../src/ui/UiTooltip.vue) | P1 | text/focusable、自适应上下位置；无显示模型/位置/延迟/统一 activator。 |
| VTreeview | 缺失 | — | P1 | 缺公共列表/树/虚拟化/数据迭代器。 |
| VValidation | 内部能力 | [UiForm](../src/ui/UiForm.vue) | P1 | useFormControl/validation 内部实现；无公共 Validation 包装组件。 |
| VVirtualScroll | 缺失 | — | P1 | 缺公共列表/树/虚拟化/数据迭代器。 |
| VWindow | 部分覆盖 | [UiTabsWindow](../src/ui/UiTabsWindow.vue)、[UiTabsWindowItem](../src/ui/UiTabsWindowItem.vue)、[UiTabPanel](../src/ui/UiTabPanel.vue) | P2 | Tabs 面板共享值、lazy/eager；不含通用触摸/滑动与方向过渡。 |

## Labs：单独清单（10 项）

[固定版本 Labs 入口](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/labs/components.ts)。这些是实验入口中的家族，不与稳定组件混算。此前版本中属于 Labs 的组件若已进入稳定入口，本表按 4.2.3 的实际导出归类。

| Labs 家族 | 状态 | 优先级 | 说明 |
| --- | --- | --- | --- |
| VAvatarGroup | 缺独立对等组件 | 按需/实验 | 与稳定家族分开记录。 |
| VCommandPalette | 缺独立对等组件 | 按需/实验 | 与稳定家族分开记录。 |
| VDateRangePicker | 缺独立对等组件 | 按需/实验 | 与稳定家族分开记录。 |
| VMonthPicker | 缺独立对等组件 | 按需/实验 | 与稳定家族分开记录。 |
| VHeatmap | 缺独立对等组件 | 按需/实验 | 与稳定家族分开记录。 |
| VHighlight | 缺独立对等组件 | 按需/实验 | 代码语法高亮不等于该通用文字高亮组件。 |
| VMaskInput | 缺独立对等组件 | 按需/实验 | 与稳定家族分开记录。 |
| VPie | 缺独立对等组件 | 按需/实验 | 与稳定家族分开记录。 |
| VProgress | 缺独立对等组件 | 按需/实验 | UiProgress 为线性进度，不等于 Labs Progress 公共契约。 |
| VVideo | 缺独立对等组件 | 按需/实验 | 与稳定家族分开记录。 |

## 指令：逐项清单（8 项）

[固定版本指令入口](https://raw.githubusercontent.com/vuetifyjs/vuetify/v4.2.3/packages/vuetify/src/directives/index.ts)。UiTooltip 组件与 Tooltip 指令分别记录。

| 上游指令 | 状态 | 本地导出 | 说明 |
| --- | --- | --- | --- |
| ClickOutside | 缺公共指令 | — | 组件内部可能有同类逻辑，不计作公共导出。 |
| Intersect | 缺公共指令 | — | 组件内部可能有同类逻辑，不计作公共导出。 |
| Mutate | 缺公共指令 | — | 组件内部可能有同类逻辑，不计作公共导出。 |
| Resize | 缺公共指令 | — | 组件内部可能有同类逻辑，不计作公共导出。 |
| Ripple | 基础已覆盖 | vRipple | 生命周期与配置已对照更新，保持 UAH 视觉。 |
| Scroll | 缺公共指令 | — | 组件内部可能有同类逻辑，不计作公共导出。 |
| Touch | 缺公共指令 | — | 组件内部可能有同类逻辑，不计作公共导出。 |
| Tooltip | 缺公共指令 | — | 组件内部可能有同类逻辑，不计作公共导出。 |

## 本地公开组件与文档索引（48 项）

全部组件都有真实文档页及 API 记录；名称不一致的关系只是职责盘点，不是组件可直接互换保证。级联选择、Markdown、diff、消息操作、用量等本地扩展继续保留。

| 本地组件/源码 | 文档路由 | 上游关联 |
| --- | --- | --- |
| [UiButton](../src/ui/UiButton.vue) | /#/button | VBtn、VIconBtn |
| [UiInput](../src/ui/UiInput.vue) | /#/input | VInput、VTextField |
| [UiTextarea](../src/ui/UiTextarea.vue) | /#/textarea | VCounter、VTextarea |
| [UiSelect](../src/ui/UiSelect.vue) | /#/select | VSelect |
| [UiSwitch](../src/ui/UiSwitch.vue) | /#/switch | VSelectionControl、VSwitch |
| [UiTooltip](../src/ui/UiTooltip.vue) | /#/tooltip | VTooltip |
| [UiField](../src/ui/UiField.vue) | /#/field | VField |
| [UiContainer](../src/ui/UiContainer.vue) | /#/container | VGrid |
| [UiRow](../src/ui/UiRow.vue) | /#/row | VGrid |
| [UiCol](../src/ui/UiCol.vue) | /#/col | VGrid |
| [UiSpacer](../src/ui/UiSpacer.vue) | /#/spacer | VGrid |
| [UiForm](../src/ui/UiForm.vue) | /#/form | VForm、VValidation |
| [UiFormSection](../src/ui/UiFormSection.vue) | /#/form-section | VForm |
| [UiFormActions](../src/ui/UiFormActions.vue) | /#/form-actions | VForm |
| [UiTabs](../src/ui/UiTabs.vue) | /#/tabs | VSlideGroup、VTabs |
| [UiTab](../src/ui/UiTab.vue) | /#/tab | VTabs |
| [UiTabsWindow](../src/ui/UiTabsWindow.vue) | /#/tabs-window | VWindow |
| [UiTabsWindowItem](../src/ui/UiTabsWindowItem.vue) | /#/tabs-window-item | VWindow |
| [UiTabPanel](../src/ui/UiTabPanel.vue) | /#/tab-panel | VWindow |
| [UiDialog](../src/ui/UiDialog.vue) | /#/dialog | VDialog |
| [UiCollapse](../src/ui/UiCollapse.vue) | /#/collapse | VExpansionPanel |
| [UiSnackbarHost](../src/ui/UiSnackbarHost.vue) | /#/snackbar-host | VSnackbar、VSnackbarQueue |
| [UiCard](../src/ui/UiCard.vue) | /#/card | VCard |
| [UiScrollArea](../src/ui/UiScrollArea.vue) | /#/scroll-area | 本地扩展，不强行对应上游 |
| [UiCodeBlock](../src/ui/UiCodeBlock.vue) | /#/code-block | VCode |
| [UiTable](../src/ui/UiTable.vue) | /#/table | VDataTable、VTable |
| [UiDataTableServer](../src/ui/UiDataTableServer.vue) | /#/data-table-server | VDataTable |
| [UiPagination](../src/ui/UiPagination.vue) | /#/pagination | VPagination |
| [UiIcon](../src/components/Icon.vue) | /#/icons | VIcon |
| [UiActivity](../src/ui/UiActivity.vue) | /#/activity | VExpansionPanel |
| [UiDiff](../src/ui/UiDiff.vue) | /#/diff | 本地扩展，不强行对应上游 |
| [UiMarkdown](../src/ui/UiMarkdown.vue) | /#/markdown | 本地扩展，不强行对应上游 |
| [UiFileChanges](../src/ui/UiFileChanges.vue) | /#/file-changes | 本地扩展，不强行对应上游 |
| [UiMessageActions](../src/ui/UiMessageActions.vue) | /#/message-actions | 本地扩展，不强行对应上游 |
| [UiUsageMeter](../src/ui/UiUsageMeter.vue) | /#/usage-meter | 本地扩展，不强行对应上游 |
| [UiBadge](../src/ui/UiBadge.vue) | /#/badge | VChip |
| [UiAlert](../src/ui/UiAlert.vue) | /#/alert | VAlert |
| [UiSpinner](../src/ui/UiSpinner.vue) | /#/spinner | VProgressCircular |
| [UiMenu](../src/ui/UiMenu.vue) | /#/menu | VMenu |
| [UiMenuItem](../src/ui/UiMenuItem.vue) | /#/menu-item | VMenu |
| [UiConfirmHost](../src/ui/UiConfirmHost.vue) | /#/confirm-host | 本地扩展，不强行对应上游 |
| [UiCheckbox](../src/ui/UiCheckbox.vue) | /#/checkbox | VCheckbox、VSelectionControl |
| [UiRadio](../src/ui/UiRadio.vue) | /#/radio | VRadio、VSelectionControl |
| [UiProgress](../src/ui/UiProgress.vue) | /#/progress | VProgressLinear |
| [UiCopyButton](../src/ui/UiCopyButton.vue) | /#/copy-button | 本地扩展，不强行对应上游 |
| [UiColorSwatches](../src/ui/UiColorSwatches.vue) | /#/color-swatches | 本地扩展，不强行对应上游 |
| [UiCascader](../src/ui/UiCascader.vue) | /#/cascader | 本地扩展，不强行对应上游 |
| [UiThemeProvider](../src/ui/UiThemeProvider.vue) | /#/theme-provider | VThemeProvider |

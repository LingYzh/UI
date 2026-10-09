# 组件合并候选（待用户决定）

> 本文件为第一次候选清单。随后用户要求以 Vuetify 为标准复评；当前建议见 [Vuetify 合并复评](./VUETIFY-CONSOLIDATION-2026-10-09.md)。水平/垂直 Stepper、Chip/ChipGroup、Snackbar/Queue 等的导航边界应以复评结论为准。本文件保留用于追溯，未据此执行合并。

## 本次范围

用户要求先列出应该合并的项目，最后由用户决定如何合并。本次仅重排 demo 导航并增加分组折叠；173 个页面、158 个公开组件、现有页面 hash 与组件导出全部保留。下表均未执行合并。

导航分类参考 [Vuetify 官方导航配置](https://github.com/vuetifyjs/vuetify/blob/master/packages/docs/src/data/nav.json)，检查日期为 2026-10-09。库内特有组件和服务保留独立分类，额外的子组件归入其主组件类别。

数量核对：公开入口还保留48个 Ui* 兼容别名，与 U* 指向相同源码；它们未生成重复页面，不应把206个导出名称当作206个独立组件。当前真正的文档组件数为158。库中没有独立 UCardTitle/UCardSubtitle，Card 已通过属性/插槽表达相关内容，不列虚构的子组件合并项。

## 优先考虑统一底层实现

| 优先级 | 候选 | 依据与推荐方向 | 合并前必须保留的差异 |
| --- | --- | --- | --- |
| 高 | UProgress / UiProgress → UProgressLinear | UiProgress.vue 与 UProgressLinear.vue 均提供线性进度、值裁剪、max 与 progressbar ARIA。推荐旧 UProgress/UiProgress 作为薄适配入口，由 UProgressLinear 承担实际绘制；Linear 额外支持缓冲、流动、不确定和 RTL。 | 单向 value → modelValue 映射，tone/dense 旧外观，默认尺寸与现有 CSS；不能直接重命名两个兼容导出。 |
| 低 | USpinner / UiSpinner 与 UProgressCircular 的圆环绘制 | 都绘制 SVG 圆环，但 Spinner 是旋转固定弧线，Circular 使用随进度变化的描边，并非重复实现。可评估视觉复用，暂不优先合并公共组件。 | Spinner 默认 16px；有 label 时 role=status，无 label 时装饰隐藏。Circular 为 progressbar。ARIA、默认线宽、弧线、动画和布局需要分别保留。 |
| 中 | USnackbarHost 的消息表面 → USnackbar | UiSnackbarHost.vue 独立实现消息外观、关闭按钮、明暗主题和暂停事件；USnackbar 已提供同类消息表面。USnackbarQueue 已复用 USnackbar，Host 可评估采用相同表面。 | Host 绑定全局服务状态，允许六位置同时展示，卸载会清空服务；Queue 是受控待消费数组。Host 的 error 为 alert、其他为 status；USnackbar 为 status/aria-live=polite。服务默认6000ms，单条默认5000ms。计时与 pause/resume 必须选定唯一所有者，不能将两套队列简单合成一个 model。 |

这些项目适合先统一绘制或适配实现，是否进一步弃用旧导出，需要单独决定兼容策略并检查消费方。

## 优先考虑合并为同一文档入口

下列组件属于一个组合功能，推荐后续以主组件页面展示子组件示例与各自 API。组件导出及独立协议仍有用途，不建议仅因为页面可以合并，就删除子组件。

| 组件家族 | 可收纳的现有页面 / 组件 | 理由 |
| --- | --- | --- |
| 应用布局 | UApp、ULayout、UMain；组合指南关联 UFooter、USystemBar、UNavigationDrawer | 同一应用几何与主内容布局链；后三项也消费布局上下文，适合组合指南互链，但它们彼此没有父子嵌套依赖，可继续保留独立入口。 |
| 栅格 | 栅格规范、UContainer、URow、UCol、USpacer | 同一栅格搭配方式，可将规范与部件 API 放到一个入口。 |
| 列表 | UList、UListItem、UListGroup、UListSubheader、UListItemTitle、UListItemSubtitle | 同一列表注册、层级、选择与内容结构。 |
| 折叠面板 | UExpansionPanels、UExpansionPanel、UExpansionPanelTitle、UExpansionPanelText | 面板组、单面板及标题/内容是配套 API。 |
| 标签页 | UTabs、UTab、UTabsWindow、UTabsWindowItem、UTabPanel | 同一标签导航与内容组合；UTabPanel 是旧显式 model/idPrefix 协议，应单列兼容说明。 |
| 步骤家族 | UStepper、UStepperItem、UStepperActions、UStepperWindow、UStepperWindowItem、UStepperVertical、UStepperVerticalItem、UStepperVerticalActions | Vertical 包含 Stepper，VerticalItem 基于 StepperItem，使用相同上下文。推荐一个家族入口下分别列水平/垂直示例和API；垂直 finish 事件仍需专门说明。 |
| 工具栏 | UToolbar、UToolbarTitle、UToolbarItems | 标题与操作区是工具栏结构。 |
| 应用栏 | UAppBar、UAppBarTitle | 标题依附应用栏；不与普通 Toolbar 的布局角色混淆。 |
| 面包屑 | UBreadcrumbs、UBreadcrumbsItem、UBreadcrumbsDivider | 路径、路径项与分隔符配套。 |
| 菜单 | UMenu、UMenuItem | 容器与其菜单项配套；MenuItem 的 menuitem/checked/keepOpen 协议仍应独立列出。 |
| 表单布局 | UForm、UFormSection、UFormActions、UFormField | 表单验证与布局组合；FormField 的说明/错误布局应有独立 API 段。 |
| 自定义输入基础 | UInput、UField、ULabel、UMessages、UCounter、UValidation | 适合一个输入基础指南，分别解释验证、表面、标签与消息职责。不能把六种职责合成一个巨型组件。 |
| 复选 / 单选 | UCheckbox + UCheckboxGroup；URadio + URadioGroup | 同一控件的单项与分组用法，适合各自统一入口。 |
| 选择基础 | USelectionControl、USelectionControlGroup | 共享选择上下文；业务控件仍提供自己的表单协议。 |
| 项目选择 | UItemGroup、UItem | 注册、选中与插槽配套。 |
| 标签选择 | UChipGroup、UChip | 组与可选标签配套，适合组合说明；单独展示标签仍有用途。 |
| 按钮组 | UBtnGroup、UBtnToggle、UButton | 可用一组示例区分按钮布局、切换选择和普通动作；布局组与选择组的模型职责仍需独立说明。 |
| 滑动选择 | USlideGroup、USlideGroupItem | 同一滑动选择组。 |
| 窗口 | UWindow、UWindowItem | 容器与内容项配套。 |
| 轮播 | UCarousel、UCarouselItem | 轮播与内容项配套。 |
| 时间线 | UTimeline、UTimelineItem | 时间线容器与节点配套。 |
| 数据表格 | UDataTable、UDataTableServer、UDataTableVirtual | 适合一个表格入口下的三种模式；已经共享 DataTableCore，不需要再合并为一个模式大组件。UTable 是基础表格，应保留其定位。 |
| 消息 | USnackbar、USnackbarQueue、USnackbarHost、snackbar 服务 | 受控单条、受控队列、全局宿主与命令式服务适合一个指南说明选择方式。 |
| 确认服务 | UConfirmHost、confirmDialog 服务 | 服务与必需宿主是同一接入流程；UConfirmEdit 是编辑确认协议，不归入此家族。 |
| 快捷键 | UHotkey、UHotkeyListener | 展示组件已复用监听器；合并文档即可说明“展示 + 可选监听”和“纯监听”。 |

## 不建议直接合成同一个公共组件

| 看起来相似的项目 | 核对结果 |
| --- | --- |
| UFormField / UField / UInput | 分别负责表单行布局、输入外观与输入/验证基础，不是同名重复实现。 |
| UOptionPicker / UPicker | 前者是旧选项选择控件，后者是选择面板框架；items 模型与面板插槽用途不同。 |
| UColorSwatches / UColorPicker | Swatches 是带 label 的原生 radio 色板，并保留列表外当前颜色；Picker 支持多种颜色模型、画布、通道与按压色块。可以统一文档，但不能直接替换。 |
| USelect / UAutocomplete / UCombobox | 分别是选择、搜索选择和可创建值，文本输入与模型更新协议不同。 |
| UDateInput / UDatePicker / UCalendar | 分别是输入组合、日期选择面板、日历展示，职责不同。 |
| UOverlay / UMenu / UDialog / UTooltip | 已共享部分浮层生命周期。各自的焦点、ARIA、键盘、触发和关闭协议不同，适合共享内部能力并保留公共入口。 |
| UList / UTreeview | 列表和树的注册/加载/过滤/选择策略不同；归类为不同文档条目合理。 |
| UButton / UChip / UFab / UCopyButton | 普通动作、可选标签、浮动动作与复制反馈有不同定位；不能仅以“都可点击”作为合并依据。 |

## 用户决策入口

可以分别选择：只合并文档入口；统一底层实现但保留兼容导出；弃用旧入口并安排版本迁移。建议先决定前三个实现候选，以及 List / Tabs / Stepper / 表格 / 消息的文档合并范围，再做下一批改动。

# 以 Vuetify 为标准的组件合并复评

检查日期：2026-10-09。用户随后批准“就按照这个方案来”，当前已完成落地，见 [执行记录](CONSOLIDATION-IMPLEMENTATION-2026-10-09.md)。下文保留原始方案依据；公共导出及兼容协议继续保留。

## 采用的标准

以本项目对齐夹具已经固定的 **Vuetify 4.2.4** 为基准，同时核对该版本官方文档导航、API 表与源码导出。避免将 master 的未来变化混入本批判断。

Vuetify 通常采用“一个功能使用文档 + 多个独立子组件 API”的结构。是否组合渲染、是否共用上下文，都不能单独作为删除公共组件的依据。[固定版本导航](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/docs/src/data/nav.json)、[Tabs 独立导出](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VTabs/index.ts)、[栅格文档与 API 表](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/docs/src/pages/en/components/grids.md)。

因此本次建议分三种动作：

- **收纳使用文档**：配套组件进入主功能的使用页，保留组件导出与可直接定位的 API。
- **收敛实现**：旧接口成为兼容适配器，复用标准组件；旧接口暂不删除。
- **保留独立边界**：Vuetify 的独立主组件继续独立；本库特有能力明确标成扩展。

本项目已有用户裁定的默认行为继续保留，包括布局 legacy/显式 ordered、List/Tree 激活策略、Tree 注册与空态、DOM 浮层、Menu Tab、Stepper 模型/finish 等。本次结构复评不重新覆盖这些裁定。

## 一、推荐收敛实现的项目

以下是基于上游结构与本库差异的原始工程方案，现已按执行记录落实。优先级表达执行顺序。

| 优先级 | 当前项目 | 推荐目标与合并方式 | 必须保留 / 先解决 |
| --- | --- | --- | --- |
| P0 | UProgress / UiProgress | 正式线性进度使用 UProgressLinear。旧 Progress 改成适配器，将 value 映射到 modelValue，复用线性绘制。 | tone/dense、默认尺寸、CSS 与两个旧导出；旧 API 是单向值，不额外改变为必须使用 v-model。 |
| P0 | USpinner / UiSpinner | 加载圆环复用 UProgressCircular 的 indeterminate 模式；Spinner 保留为小尺寸兼容入口，库内新 loader 优先直接组合 Circular。 | Spinner 默认16px、弧线/线宽、旋转动画；外层保留带 label 的 status 或无 label 的装饰隐藏，内部 Circular 可设 aria-hidden=true，避免其 progressbar 与外层重复播报。 |
| P1 | UMenuItem / UiMenuItem | 标准 Menu 示例改用 UList/UListItem；旧 MenuItem 评估改为 UListItem 的薄适配器，保留菜单特有属性，不再独立维护整套行布局。 | menuitem/menuitemcheckbox、checked、keepOpen、danger、icon/trailing 槽和 disabled；Menu 与 List 的方向键/Tab 必须确定单一处理者，不能双重拦截。 |
| P1 | USnackbarHost / UiSnackbarHost | 作为全局 snackbar 服务适配层保留，消息表面复用 USnackbar。队列编排仍属于 Host/service 或 Queue，而非塞进单条组件。 | error 的 alert、普通 status、六位置、6000ms服务默认与5000ms单条默认、卸载清空、暂停和唯一计时所有者；USnackbar 目前不能仅靠透传 role 改掉硬编码 ARIA。 |
| P2 | UTabPanel / UiTabPanel | 正式 Tabs 内容统一推荐 UTabsWindow + UTabsWindowItem；旧 TabPanel 标为兼容协议。迁移调用方后，再评估让旧入口适配标准内容层。 | 旧组件依赖显式 modelValue/idPrefix，WindowItem 依赖注册上下文并支持任意值/禁用/懒加载/过渡；不能直接 alias 到 WindowItem。 |

依据：Vuetify 的 [Button loader 源码](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VBtn/VBtn.tsx)使用不确定 Circular；[Menu 官方示例](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/docs/src/examples/v-menu/usage.vue)使用 List/ListItem；[SnackbarQueue 源码](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VSnackbarQueue/VSnackbarQueue.tsx)组合 Snackbar，而非把两者变为一个公共组件；[Tabs 导出](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VTabs/index.ts)包含 Window/WindowItem，没有 TabPanel。

### Progress 的特别说明

Vuetify 4.2.4 **稳定组件**保留 ProgressLinear 与 ProgressCircular 两个入口；另有 Labs 的 [VProgress](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/labs/VProgress/VProgress.tsx)，通过 type 组合两者，并增加 label/valueFormat 等内容。

本库旧 UProgress 是简单线性条，不是该 Labs 组件的等价实现。建议先适配 Linear，并明确旧名称的兼容定位。只有用户另行选择对齐 Labs，才规划新的复合 Progress 协议；不能用实验性复合组件作为删掉 Linear/Circular 的依据。

## 二、应该收纳到同一使用文档的配套组件

保留独立导出；下表只减少主导航中的配套页平铺，不将子组件 API 拼成一份 props。

| 推荐主入口 | 收纳现有组件 / 页面 | 推荐文档组织 |
| --- | --- | --- |
| 应用 | UApp、UMain；ULayout 的上下文与嵌套用法 | App/Main 按上游应用文档组合说明；Layout 提供专门章节并保留直接 API。 |
| 栅格 | 栅格规范、UContainer、URow、UCol、USpacer | 一个使用页，分别列四个组件的 API。 |
| 列表 | UList、UListItem、UListGroup、UListSubheader、UListItemTitle、UListItemSubtitle | 列表使用页 + item/group/文本子组件 API；所有六个导出保留。 |
| 折叠面板 | UExpansionPanels、UExpansionPanel、UExpansionPanelTitle、UExpansionPanelText | 一个使用页，组/面板/标题/内容 API 分段。 |
| 标签页 | UTabs、UTab、UTabsWindow、UTabsWindowItem | 一个使用页，标签与内容配对说明；旧 UTabPanel 放兼容章节。 |
| 水平步骤 | UStepper、UStepperItem、UStepperActions、UStepperWindow、UStepperWindowItem | 一个水平步骤使用页；现有子组件各有 API 段，不因上游还存在 Header 就临时新增本库组件。 |
| 垂直步骤 | UStepperVertical、UStepperVerticalItem、UStepperVerticalActions | 一个独立垂直步骤使用页，与水平步骤互链，列明 finish 与内容折叠。 |
| 工具栏 | UToolbar、UToolbarTitle、UToolbarItems | 一个使用页与三个 API 段。 |
| 应用栏 | UAppBar、UAppBarTitle | 一个使用页；仍与 Toolbar 分开。 |
| 面包屑 | UBreadcrumbs、UBreadcrumbsItem、UBreadcrumbsDivider | 一个使用页与三个 API 段。 |
| 项目选择 | UItemGroup、UItem | 一个使用页，明确 group 的模型和 item 插槽状态。 |
| 滑动选择 | USlideGroup、USlideGroupItem | 一个使用页与两个 API 段。 |
| 窗口 | UWindow、UWindowItem | 一个使用页与两个 API 段。 |
| 轮播 | UCarousel、UCarouselItem | 一个使用页与两个 API 段；不并入普通 Window 页面。 |
| 时间线 | UTimeline、UTimelineItem | 一个使用页与两个 API 段。 |
| 按钮组 | UBtnToggle、UBtnGroup | 一个按钮组使用页，分别说明选择状态和无状态布局；UButton 主使用页继续独立。 |
| 数据表格 | UDataTable、UDataTableServer、UDataTableVirtual | 一个表格导航家族，下设客户端、服务端、虚拟表格使用页；公共 API 保留三个入口。UTable 继续独立。 |

上游依据：[应用 API 表](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/docs/src/pages/en/components/application.md)、[List 导出](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VList/index.ts)、[Tabs](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/docs/src/pages/en/components/tabs.md)、[按钮组 API 表](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/docs/src/pages/en/components/button-groups.md)、[表格导出](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VDataTable/index.ts)。

## 三、应明确保留的独立主组件

| 组合 | 以 Vuetify 为标准的结论 |
| --- | --- |
| 水平 Stepper / 垂直 Stepper | 保留两个使用入口和公共组件。上一版建议统一为一个家族主使用页过宽；Vuetify 特别说明两者显示与功能差异，并拆为独立组件。 |
| Button / BtnGroup / BtnToggle | Button 保留独立主入口。Group/Toggle 可共用按钮组使用页，但仍分别导出；无状态布局与受控选择不能混为一个默认模型。 |
| Chip / ChipGroup | 保留两个主使用页和两个公共组件；组合示例互链。上一版把它们收成一个入口不符合上游导航边界。 |
| Snackbar / SnackbarQueue | 保留两个主使用页和两个公共组件。全局 Host/service 放扩展接入章节，不作为理由合掉 Queue。 |
| App / AppBar / Toolbar / Footer / SystemBar / NavigationDrawer | App/Main 可共用应用页；后五种主组件继续独立。共享布局上下文只说明可以组合使用。 |
| Input / Field / Validation / Label / Messages / Counter | 保留公共边界。自定义输入指南可以集中讲组合关系，并将辅助组件 API 收入高级目录；不能全部并进 UInput。 |
| Overlay / Menu / Dialog / Tooltip | 保留公共入口，复用内部定位/生命周期/焦点能力。不同触发、焦点、ARIA 和关闭协议不合并为一个 mode 大组件。 |
| Select / Autocomplete / Combobox；DateInput / DatePicker / Calendar；FileInput / FileUpload；Slider / RangeSlider | 上游分别提供入口，本库也分别保留。 |
| ProgressLinear / ProgressCircular | 保留稳定公共入口；当前 UProgress 是旧兼容候选，不能反向吞并二者。 |
| Radio / RadioGroup / SelectionControl / SelectionControlGroup | 保留公共组件；Radio/Group 共用单选使用指南，底层选择基础可进入高级 API。 |
| List / Treeview；Table / DataTable | 保留职责边界和独立主入口。 |
| DefaultsProvider / LocaleProvider / ThemeProvider | 保留独立 Provider；可用一个概览说明各自作用域。 |

[Stepper 官方拆分说明](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/docs/src/pages/en/components/steppers.md)、[固定版本导航](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/docs/src/data/nav.json)、[TextField 的 Input/Field/Counter 组合源码](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VTextField/VTextField.tsx)。

## 四、没有一对一标准入口的本库扩展

“上游没有同名组件”不等于本库应删除它。推荐标明用途与边界，避免伪装成上游标准组件。

| 项目 | 推荐处理 |
| --- | --- |
| UCheckboxGroup | 上游提供 SelectionControlGroup，没有独立同名 CheckboxGroup。当前实现已是 multiple 的薄封装；收入 Checkbox 文档扩展段，保留便利导出，无需再做物理合并。 |
| UColorSwatches | 收入 ColorPicker 文档的“独立色板扩展”段。上游色板属于 ColorPicker 内部组件；本库原生 radio、label、当前颜色追加和表单验证协议应保留。可评估私有色块复用，不直接 alias 到 ColorPicker。 |
| UFormField / UFormSection / UFormActions | 收入表单布局扩展指南；Fieldset/行布局/操作区仍有价值。UFormField 不能改名替代标准 UField。 |
| UHotkeyListener | 作为监听扩展单独说明；UHotkey 展示页关联监听 API。上游 VHotkey 负责展示，监听属于另一套 hotkey 功能。本库已共用监听器，无需再次合并，也不在本次偷偷修改 listen 默认值。 |
| UOptionPicker / UCascader | 保留选项选择扩展，不并入 UPicker。Picker 是面板框架，OptionPicker 是旧选项模型。 |
| UConfirmHost / confirmDialog | 共用全局确认服务接入指南，保持宿主和函数两种 API；不并入 UConfirmEdit。 |
| UCollapse / UScrollArea / UTransition / UCopyButton | 保留便利扩展。CopyButton 已复用 Button/Tooltip，不能为了减少名称删掉复制反馈。 |
| Markdown / CodeBlock / Diff / 会话内容组件 | 保留 UAH 内容扩展，按实际用途组织，不能根据 Vuetify 不提供它们就强行并入 Card/List。 |
| 48个 Ui* 兼容别名 | 已与 U* 指向相同源码，不是48份重复实现；可收起兼容文档，删除别名需另行版本迁移决定。 |

依据：[ColorPicker 公共导出](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VColorPicker/index.ts)、[Hotkey 展示源码](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VHotkey/VHotkey.tsx)，以及本库各适配/组合源码。

## 五、建议落地顺序与验收

1. **先整理文档入口。** 建立“使用页家族”与“API组件”的显式映射，使用页仅出现主入口；子 API 可从同页 API 选择器和独立 API 目录进入。数据表格保留模式子页，水平/垂直步骤和 Snackbar/Queue 分开。
2. **保存路由兼容。** 例如旧 `#/list-item` 可定位到 List 使用页中的 UListItem API；旧子页中的 example/usage/API hash 也要有明确映射。搜索必须继续匹配子组件名称，不能收起导航后让子组件不可检索。
3. **先做 P0 实现复用。** ProgressLinear/Circular 为标准绘制入口，旧 Progress/Spinner 保留适配导出；不能把尺寸、动画、ARIA 或 tone 当作可忽略的旧行为。
4. **再做 P1。** MenuItem 统一行布局前先解决键盘处理归属；SnackbarHost 先统一消息表面和 ARIA，再处理队列桥接，保持唯一计时所有者。
5. **最后处理 Tabs 旧协议与弃用。** 先盘点调用方与迁移，再决定旧 TabPanel 和其他兼容导出的去留。删除导出、改默认行为或变更大版本均另行裁定。

验证应覆盖：每个公开组件仍有 API；旧 hash 与搜索能定位子 API；列表/菜单嵌套方向键、Tab、checked、keepOpen；Progress 值/尺寸/ARIA/动画；Snackbar 六位置、暂停、超时与卸载；Tabs 对象值、注册次序、禁用、懒加载与ARIA配对。日常先做专项，提交推送前再运行完整门禁。

当前已完成上述使用家族/API导航、四处实现复用与Tabs示例迁移并通过专项验收。TabPanel保留独立兼容协议，未删除导出、修改版本或引入Labs协议；未提交/推送/发布，未运行完整构建。后续完整门禁和版本迁移边界见执行记录。

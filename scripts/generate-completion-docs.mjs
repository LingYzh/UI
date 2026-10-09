import { typography } from '../src/ui/typography.js';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { formatDemoSource } from './demo-source-format.mjs';
const geometrySource = await formatDemoSource(await readFile(new URL('../src/ui/docs/DialogGeometryDemo.vue', import.meta.url), 'utf8'));
const layoutSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/LayoutBasicsDemo.vue', import.meta.url), 'utf8'));
const layoutOrderSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/LayoutOrderDemo.vue', import.meta.url), 'utf8'));
const overlayPresentationSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/OverlayPresentationDemo.vue', import.meta.url), 'utf8'));
const treeFilterSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/TreeFilterDemo.vue', import.meta.url), 'utf8'));
const stepperItemsSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/StepperItemsDemo.vue', import.meta.url), 'utf8'));
const listNavigationSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/ListNavigationDemo.vue', import.meta.url), 'utf8'));
const textareaSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/TextareaProtocolDemo.vue', import.meta.url), 'utf8'));
const switchSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/SwitchProtocolsDemo.vue', import.meta.url), 'utf8'));
const selectionMenuSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/SelectionMenuDemo.vue', import.meta.url), 'utf8'));
const tabsSelectionSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/TabsSelectionDemo.vue', import.meta.url), 'utf8'));
const menuBranchSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/MenuBranchDemo.vue', import.meta.url), 'utf8'));
await writeFile(new URL('../src/ui/docs/geometryContent.js', import.meta.url), 'export const dialogGeometryExample = ' + JSON.stringify({ id: 'dialog-geometry', title: '尺寸与全屏', description: '显式宽高、全屏覆盖和正文独立滚动，关闭动作来自真实作用域。', fullSource: true, code: geometrySource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n\nexport const layoutBasicsExample = ' + JSON.stringify({ id: 'basic-layout-contracts', title: '标签、尺寸和独立滚动', description: 'Container/Main 的尺寸与 tag、ThemeProvider 的语义标签、Row 的响应式对齐使用真实组件。', fullSource: true, code: layoutSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
await appendFile(new URL('../src/ui/docs/geometryContent.js', import.meta.url), '\nexport const textareaProtocolExample = ' + JSON.stringify({ id: 'textarea-protocols', title: '清空、计数与验证', description: '自动增高、空值清除、加载状态和自定义计数使用真实 Textarea。', fullSource: true, code: textareaSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
await appendFile(new URL('../src/ui/docs/geometryContent.js', import.meta.url), '\nexport const switchProtocolExample = ' + JSON.stringify({ id: 'switch-protocols', title: '滑块、轨道与校验', description: '自定义滑块、轨道文字和加载状态保留原生键盘及分组模型行为。', fullSource: true, code: switchSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
await appendFile(new URL('../src/ui/docs/geometryContent.js', import.meta.url), '\nexport const selectionMenuExample = ' + JSON.stringify({ id: 'selection-menu-protocols', title: '菜单位置、滚动与草稿', description: '选择与日期输入复用共享 Menu；可配置定位、滚动策略和内容保留。', fullSource: true, code: selectionMenuSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
await appendFile(new URL('../src/ui/docs/geometryContent.js', import.meta.url), '\nexport const tabsSelectionExample = ' + JSON.stringify({ id: 'tabs-selection-protocols', title: '对象值、空值与多选', description: '标签与内容使用稳定注册 ID；对象副本、null 标签和最多两项多选使用真实组件。', fullSource: true, code: tabsSelectionSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
await appendFile(new URL('../src/ui/docs/geometryContent.js', import.meta.url), '\nexport const menuBranchExample = ' + JSON.stringify({ id: 'menu-branch-protocols', title: '嵌套菜单与缓存实例', description: '菜单分支的外部关闭、KeepAlive 停用和独立对话框边界使用真实组件。', fullSource: true, code: menuBranchSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
await appendFile(new URL('../src/ui/docs/geometryContent.js', import.meta.url), '\nexport const layoutOrderExample = ' + JSON.stringify({ id: 'layout-order-protocols', title: '显式空间分配与重叠', description: '默认保留原布局；layoutMode="ordered" 按 order 分配空间，overlaps 调整命名栏的交界。', fullSource: true, code: layoutOrderSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
await appendFile(new URL('../src/ui/docs/geometryContent.js', import.meta.url), '\nexport const overlayPresentationExample = ' + JSON.stringify({ id: 'overlay-presentation-protocols', title: '遮罩与过渡', description: 'Dialog、Overlay、Menu、Tooltip 显式过渡使用真实进入与离开生命周期；遮罩颜色和透明度可配置。', fullSource: true, code: overlayPresentationSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
for (const [name, id, title, description, source] of [
    ['treeFilterExample', 'tree-filter-protocols', '筛选与行内操作', '重音筛选、暂停筛选、节点类型和操作插槽使用真实树组件。', treeFilterSource],
    ['stepperItemsExample', 'stepper-items-protocols', '自动步骤与规则', 'items 自动生成步骤和内容；垂直步骤逐项展开，规则限制继续操作。', stepperItemsSource],
    ['listNavigationExample', 'list-navigation-protocols', '键盘定位与整行插槽', '对象值、根节点键盘导航和整行 item 插槽使用真实列表。', listNavigationSource]
]) {
    await appendFile(new URL('../src/ui/docs/geometryContent.js', import.meta.url), `\nexport const ${name} = ` + JSON.stringify({ id, title, description, fullSource: true, code: source.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
}
const families = [
    ['内容组件', 'alignment-code', '', '行内代码', ['UCode']],
    ['导航组件', 'alignment-slide', '', '通用滑动选择', ['USlideGroup', 'USlideGroupItem']],
    ['反馈组件', 'alignment-notice', '', '受控消息与队列', ['USnackbar', 'USnackbarQueue']],
    ['表单组件', 'completion-selection', 'FormCompletionDemo', '搜索、创建与对象选择', ['UAutocomplete', 'UCombobox']],
    ['表单组件', 'completion-inputs', 'FormCompletionDemo', '专门输入与统一表单状态', ['UNumberInput', 'UFileInput', 'UFileUpload', 'USlider', 'URangeSlider', 'UOtpInput', 'UColorInput', 'UColorPicker', 'URating']],
    ['表单组件', 'completion-groups', 'FormCompletionDemo', '组管理选择模型', ['USelectionControlGroup', 'USelectionControl', 'URadioGroup', 'UCheckboxGroup', 'UItemGroup', 'UItem', 'UChip', 'UChipGroup', 'UBtnGroup', 'UBtnToggle', 'ULabel', 'UMessages', 'UCounter']],
    ['表单组件', 'completion-custom-input', 'FormCompletionDemo', '自定义输入与默认配置', ['UField', 'UInput', 'UValidation', 'UDefaultsProvider', 'ULocaleProvider']],
    ['布局组件', 'completion-app', 'LayoutCompletionDemo', '顶部、侧栏、底部与自动内容占位', ['UApp', 'ULayout', 'UMain', 'UAppBar', 'UAppBarTitle', 'UToolbar', 'UToolbarTitle', 'UToolbarItems', 'UFooter', 'USystemBar', 'UNavigationDrawer']],
    ['导航组件', 'completion-lists', 'LayoutCompletionDemo', '列表、树与虚拟滚动', ['UList', 'UListItem', 'UListGroup', 'UListSubheader', 'UListItemTitle', 'UListItemSubtitle', 'UTreeview', 'UVirtualScroll']],
    ['反馈组件', 'completion-surfaces', 'LayoutCompletionDemo', '表面、头像、徽标与占位', ['UAvatar', 'UBadge', 'UDivider', 'USheet', 'UEmptyState', 'USkeletonLoader', 'UBanner', 'UTransition']],
    ['导航组件', 'completion-navigation', 'LayoutCompletionDemo', '路径、底部导航与浮层', ['UBreadcrumbs', 'UBreadcrumbsItem', 'UBreadcrumbsDivider', 'UBottomNavigation', 'UBottomSheet', 'UOverlay']],
    ['内容组件', 'completion-data', 'DataCompletionDemo', '搜索、选择、展开与分组', ['UDataTable']],
    ['内容组件', 'completion-virtual-data', 'DataCompletionDemo', '10,000 行虚拟表格', ['UDataTableVirtual']],
    ['内容组件', 'completion-iterator', 'DataCompletionDemo', '用插槽组织分页后的数据', ['UDataIterator']],
    ['表单组件', 'completion-dates', 'DataCompletionDemo', '日期、时间与确认编辑', ['UDateInput', 'UDatePicker', 'UTimePicker', 'UCalendar', 'UPicker', 'UConfirmEdit']],
    ['反馈组件', 'completion-progress', 'DataCompletionDemo', '确定与不确定的进度', ['UProgressCircular', 'UProgressLinear']],
    ['容器组件', 'completion-panels', 'ExperienceCompletionDemo', '折叠组与展开过渡', ['UExpansionPanels', 'UExpansionPanel', 'UExpansionPanelTitle', 'UExpansionPanelText']],
    ['导航组件', 'completion-stepper', 'ExperienceCompletionDemo', '步骤与当前内容共享模型', ['UStepper', 'UStepperVertical', 'UStepperVerticalItem', 'UStepperVerticalActions', 'UStepperItem', 'UStepperWindow', 'UStepperWindowItem', 'UStepperActions']],
    ['容器组件', 'completion-window', 'ExperienceCompletionDemo', '窗口、懒挂载与轮播', ['UWindow', 'UWindowItem', 'UCarousel', 'UCarouselItem']],
    ['内容组件', 'completion-media', 'ExperienceCompletionDemo', '图片、比例、懒显示与快捷键', ['UImg', 'UResponsive', 'UHover', 'UHotkey', 'UKbd', 'ULazy', 'UNoSsr', 'UParallax']],
    ['内容组件', 'completion-loading', 'ExperienceCompletionDemo', '滚动加载与下拉刷新', ['UInfiniteScroll', 'UPullToRefresh']],
    ['内容组件', 'completion-timeline', 'ExperienceCompletionDemo', '趋势、时间线与快捷操作', ['USparkline', 'UTimeline', 'UTimelineItem', 'USpeedDial', 'UFab']],
];
const titles = {
    UAutocomplete: '自动完成', UCombobox: '可创建选择器', UNumberInput: '数值输入', UFileInput: '文件输入', UFileUpload: '文件上传', USlider: '滑块', URangeSlider: '范围滑块', UOtpInput: '验证码输入', UColorInput: '颜色输入', UColorPicker: '颜色编辑器', URating: '评分',
    USelectionControlGroup: '选择控件组', USelectionControl: '选择控件', URadioGroup: '单选组', UCheckboxGroup: '多选组', UItemGroup: '选择项组', UItem: '选择项', UChip: '标签', UChipGroup: '标签组', UBtnGroup: '按钮组', UBtnToggle: '按钮切换组', ULabel: '标签文字', UMessages: '控件消息', UCounter: '计数', UInput: '自定义输入基座', UValidation: '验证基座', UControlFrame: '控件框架', UDefaultsProvider: '默认配置容器',
    UApp: '应用容器', ULayout: '布局上下文', UMain: '主要内容', UAppBar: '应用顶栏', UAppBarTitle: '应用顶栏标题', UToolbar: '工具栏', UToolbarTitle: '工具栏标题', UToolbarItems: '工具栏操作', UFooter: '页脚', USystemBar: '系统状态栏', UNavigationDrawer: '导航抽屉',
    UList: '列表', UListItem: '列表项', UListGroup: '列表分组', UListSubheader: '列表小标题', UListItemTitle: '列表项标题', UListItemSubtitle: '列表项说明', UTreeview: '树形视图', UVirtualScroll: '虚拟滚动', UAvatar: '头像', UBadge: '附着徽标', UDivider: '分隔线', USheet: '表面容器', UEmptyState: '空状态', USkeletonLoader: '骨架占位', UBanner: '横幅提示', UTransition: '过渡',
    UBreadcrumbs: '面包屑', UBreadcrumbsItem: '路径项', UBreadcrumbsDivider: '路径分隔符', UBottomNavigation: '底部导航', UBottomSheet: '底部面板', UOverlay: '浮层', UDataTable: '客户端数据表格', UDataTableVirtual: '虚拟数据表格', UDataIterator: '数据迭代器', UDateInput: '日期输入', UDatePicker: '日期选择面板', UTimePicker: '时间选择', UCalendar: '日历', UPicker: '选择面板', UConfirmEdit: '确认编辑', UProgressCircular: '圆形进度', UProgressLinear: '线性进度',
    UExpansionPanels: '折叠面板组', UExpansionPanel: '折叠面板', UExpansionPanelTitle: '折叠标题', UExpansionPanelText: '折叠内容', UStepper: '步骤容器', UStepperVertical: '垂直步骤', UStepperItem: '步骤项', UStepperWindow: '步骤内容容器', UStepperWindowItem: '步骤内容', UStepperActions: '步骤操作', UWindow: '内容窗口', UWindowItem: '窗口项', UCarousel: '轮播', UCarouselItem: '轮播项',
    UImg: '图片', UResponsive: '比例容器', UHover: '悬停状态', UHotkey: '快捷键', UKbd: '键盘标记', ULazy: '延迟显示', UNoSsr: '客户端内容', UParallax: '视差', UInfiniteScroll: '滚动加载', UPullToRefresh: '下拉刷新', USparkline: '趋势线', UTimeline: '时间线', UTimelineItem: '时间线项', USpeedDial: '快捷操作展开', UFab: '浮动按钮',
};
const pages = [];
const tooltipSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/component-examples/tooltip.vue', import.meta.url), 'utf8'));
await writeFile(new URL('../src/ui/docs/tooltipProtocolContent.js', import.meta.url), 'export const tooltipProtocolExample = ' + JSON.stringify({ id: 'tooltip-protocols', title: '旧触发器与标准内容插槽', description: '显式standardProtocol使用activator/default；可交互提示、禁用、位置与滚动策略都使用真实组件。旧default触发器协议继续保留。', fullSource: true, code: tooltipSource.replaceAll("from '../../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
families.find(family => family[4].includes('UPicker'))[4].push('UOptionPicker');
families.find(family => family[4].includes('UHotkey'))[4].push('UHotkeyListener');
titles.UField = '字段表面';
titles.UOptionPicker = '选项选择器（旧 Picker）';
titles.UHotkeyListener = '快捷键监听（旧 Hotkey）';
titles.ULocaleProvider = '局部语言容器';
titles.UCode = '行内代码';
titles.USlideGroup = '滑动选择组';
titles.USlideGroupItem = '滑动选择项';
titles.USnackbar = '受控消息';
titles.USnackbarQueue = '消息队列';
titles.UStepperVerticalItem = '垂直步骤项';
titles.UStepperVerticalActions = '垂直步骤操作';
const focusNotes = {
    UList: 'navigationStrategy="track" 时根节点为唯一键盘入口，aria-activedescendant 指向可见可用行；默认 focus 保留逐行焦点。对象值由 valueComparator 比较，activeStrategy 默认 single-independent，multiple 只控制选择。item 插槽直接替换整行，绑定作用域 props；title 插槽只替换标题。',
    UListGroup: 'activator 提供 props 和 isOpen；根 disabled/readonly 影响展开与操作。公开 open/select 可以传明确布尔值与原始事件，路径使用业务值。',
    UTreeview: 'items 可省略；默认按渲染节点注册（itemsRegistration="render"），"props" 使用完整树。activeStrategy 默认 single-independent，重复激活可取消；默认显示最近语言的无数据文案，hideNoData 可关闭。筛选支持模式、按键回调、重音和 noFilter，模型在收起或筛选时保持。',
    UStepper: 'items 自动生成 header/window/actions，手动 default 插槽继续保留。editable 默认严格关闭，显式开启可点击标题；操作文案跟随最近语言。multiple 支持 max，多选窗口按步骤注册顺序显示首项，next/prev 只保留跳转目标。',
    UStepperVertical: 'items 自动生成垂直 Item/Actions，逐项展开，规则不通过时阻止继续；最后一步继续会实际发出 click:finish。手动步骤组合保留。',
    UStepperVerticalItem: '标题与正文分别替换；状态作用域包含 canEdit/hasError/hasCompleted/active，规则控制继续操作，group:selected 和操作事件透传。',
    UStepperVerticalActions: 'prev/next 作用域提供可绑定的 props，文案支持最近语言和显式文字；disabled 可分别控制前后按钮，最后一步由 Item 上下文转成真实完成事件。',
    UField: 'UField现为输入装饰表面：七种variant、内侧图标、clear/loader/label插槽、focused模型和标准default scope。输入值由使用者管理。旧布局组件更名UFormField，UiField仍指向旧实现；description/error/layout/controlAttrs保留为扩展。',
    UPicker: 'UPicker现为标题/header/body/actions容器，支持横向布局、分隔线和尺寸。原items/model选项列表能力保留，独立旧实现更名UOptionPicker。',
    UOptionPicker: '原UPicker选项列表实现更名保留；本轮没有安排弃用日期。新UPicker承载Vuetify容器职责，并可选择开启items扩展。',
    UHotkey: '按platform和displayMode展示组合键，支持keyMap、前后文字与组合/或/顺序分隔；$vuetify文案token、分隔词、title与无障碍名称跟随最近ULocaleProvider。listen仅保留本库原trigger监听，不据展示语法声称序列监听。旧监听组件更名UHotkeyListener，未安排弃用日期。',
    UHotkeyListener: '原UHotkey监听实现更名保留；keys/preventDefault/allowInput/disabled和trigger事件仍使用原协议。',
    URadioGroup: '可直接组合URadio，组统一管理模型、name、对象比较、禁用和只读；子Radio仍可独立使用v-model。',
    UWindow: 'disabled动态变化后，公开next/prev、键盘和触摸均读取最新禁用状态；初始空模型的强制组选择首项。',
    UCounter: 'active默认true，字符串value默认按Unicode码点统计长度，保留本库行为。displayMode="value"直接显示原值；max支持数字和字符串。default插槽提供{counter,max,value}，disabled仅关闭超限着色。',
    UImg: 'load/error默认仍给原生Event；standardProtocol=true改给浏览器实际currentSrc URL。支持src对象、srcset/sources、lazySrc、aspectRatio与尺寸、cover/position/gradient；lazy由观察器控制src，进入区域后立即请求，避免原生lazy和隐藏图片互等。',
    UInfiniteScroll: 'direction同时接受旧start/end/both与新vertical/horizontal，side配置新轴值的加载边缘；默认纵向end。两侧状态与完成回调独立，mode支持manual/intersect，reset使旧回调失效，前端追加记录保持滚动位置；status插槽提供side和操作props。',
    UDataIterator: '默认每页10，items插槽仍给原始项并保持原渲染方式；standardProtocol=true使用包装项、标准容器和分页/选择/展开/分组作用域。itemsLength仅跳过本地切片，过滤和排序仍执行；提供options与currentItems事件。',
    UParallax: '默认仍使用speed=0.3，支持-1至1（负数反向、0静止）；显式scale改用标准比例与背景缩放。src对象、srcset、lazySrc、图片事件和placeholder/error/sources插槽通过内置UImg实现，load/error给URL。background插槽优先保留自建背景；disabled和减少动效均停止位移。',
    ULazy: '受控modelValue、options观察参数、tag、六种尺寸和transition；保留rootMargin=100px、once=true、disabled立即显示，以及placeholder与visible作用域。模型重置false可重新观察，once=false支持进出视口卸载。',
    UResponsive: '比例支持数字或宽/高字符串，并保留宽高推导；补齐min/max尺寸、contentClass、inline与additional层。数字及数字字符串尺寸均按px，CSS长度原样使用。',
    UMessages: '保留active=true和旧default整体替换；新增active控制、color、transition与每条message插槽。',
    UItemGroup: 'selected插槽统一为标准内部ID数组，isSelected/select接收该ID，next/prev跳过禁用项；selectedValues提供公开值。旧按值判断使用isValueSelected，toggle按值切换继续保留。mandatory=true只阻止取消最后一项，force还初始选择首个可用项。保留表单校验、按钮组与标签组扩展。',
    UItem: '默认保留本库按钮，tag=false可只输出标准作用域插槽；提供isSelected/selectedClass/value/disabled/select/toggle和扩展id，旧selected布尔仍保留。value省略按当前组索引，group:selected携带{value:boolean}。',
    ULocaleProvider: '子语言容器继承祖先自定义文案、fallback和RTL；支持旧fallback及新fallbackLocale（旧属性显式值优先）。messages可使用原扁平键或嵌套字符串字典，扁平同名键优先，支持$vuetify命名空间路径。分页内置名称与快捷键文案已实际消费最近作用域，语言切换不改变全局其它控件。',
    UConfirmEdit: '编辑内容始终可见；model为深克隆草稿Ref，保存前不修改原模型，取消重置草稿。isPristine表示草稿未变；未设disabled时禁用未变更操作，disabled可按save/cancel分别指定。hideActions或消费actions渲染函数可自定义操作区。readonly、异步validate及begin重置草稿作为本库扩展保留，begin不再控制展开。',
    UHover: 'modelValue初始null，鼠标和本库焦点扩展按openDelay/closeDelay同步模型。disabled时保留公开模型并继续记录内部指针状态，恢复后同步最新内部状态；延迟接受数字和数字字符串，卸载清理待执行回调。',
    UDefaultsProvider: '按祖先配置链深合并，显式控件属性优先。reset=true回溯一个父配置层，reset数字/字符串指定回溯层数；root=true回溯根配置，root字符串叠加命名根配置。scoped独立配置优先于reset/root，disabled直接透传父配置。本轮按用户选择统一标准规则，不再以reset清空继承。',
    UChipGroup: '默认插槽透传选择项组的八项作用域，selected为内部ID，selectedValues为公开值；公共ref同步暴露selected/selectedValues/isSelected/select/next/prev，并保留原表单方法。真实示例同时使用作用域和ref导航。',
    UBtnToggle: '默认插槽透传选择项组的八项作用域，selected为内部ID，selectedValues为公开值；公共ref同步暴露selected/selectedValues/isSelected/select/next/prev，并保留原表单方法。值模型、多选、mandatory、max、禁用和只读继续遵循组契约。',
    UPullToRefresh: '补标准load事件、pullDownThreshold与pullDownPanel(canRefresh/goingUp/refreshing)，旧refresh/threshold=72/indicator仍保留。鼠标与单指触摸均可操作，默认阻尼0.5，resistance可显式设1。reset失效旧done，只检查最近实际滚动视口是否到顶。',
    UListItem: 'appendIcon沿用Vuetify列表项的右侧图标入口；appendText是本库额外的辅助文本能力，空间不足时优先省略并保留完整title提示。append插槽优先替换两者。nav列表内href保持原生链接和aria-current，方向键/Home/End移动焦点，Enter/Space激活。',
    UToolbar: '标题和操作区内置：title属性或title插槽配置标题，actions插槽直接放按钮（也支持append），无需额外标题/操作组件。extension显示扩展内容；四种密度采用64/56/48/128px。保留本库字体、间距、圆角和按钮尺寸，不注册应用布局占位。',
    UToolbarTitle: '此组件保留用于兼容自定义组合；常用标题直接使用UToolbar的title属性或title插槽。text属性、text插槽与默认插槽均支持，长文本省略，不挤掉操作。',
    UToolbarItems: '此组件保留用于兼容自定义组合；常用操作直接放入UToolbar的actions插槽。color/variant统一下发给按钮，显式属性优先；按钮使用本库圆角、尺寸和间距。',
    USlider: '默认 step=0 允许连续小数；显式正 step 才限制步长。鼠标拖动不显示焦点外框，Tab 和方向键保留键盘提示。',
    URangeSlider: '默认空值 [0,0]、step=0 连续小数；清空时按 [min,min] 展示。手柄不可互相越过，Tab 分别进入两个手柄。',
    UOtpInput: '默认允许字母和数字，未设置模型为 undefined；numeric 显式限制数字。聚焦外框平滑淡入淡出，减少动效设置关闭过渡。',
    USkeletonLoader: '有默认内容插槽时默认显示内容，loading=true 才显示骨架；无默认内容插槽时始终显示骨架。',
    UColorPicker: '保留默认黑色、HSV 滑块与 hex 输入。显式 hideCanvas=false 开启饱和度/明度二维面板，mode 切换 hex/hexa/rgb/rgba/hsl/hsla；对象模型保留颜色通道类型与透明度。',
    UNumberInput: '保留默认小数精度与左右分置按钮；controlVariant=end 显式末端排列，stacked/hidden/inset 支持不同控制配置。只有显式 locale 才本地化显示，模型仍为数字，空模型为 null。',
    UMain: '继承应用栏布局偏移，tag 与六项尺寸实际消费；scrollable 开启独立正文滚动，不改变外层布局。',
    UOverlay: '默认普通DOM浮层，支持attach/contained/absolute及zIndex；默认非模态，captureFocus/retainFocus=false，scrollStrategy=none。retainFocus=true显式限制焦点；scrim支持布尔/颜色，opacity控制遮罩透明度。内容懒挂载，关闭动画完成后卸载，eager=true保留；default/activator的isActive为Ref。',
    UFileInput: '鼠标选择文件不显示键盘焦点框；Tab 进入时显示焦点提示。',
    UFileUpload: '上传区域仅在键盘焦点或拖放文件时高亮；鼠标点击选择文件不保持焦点高亮。',
    UColorInput: '颜色按钮和文本编辑共享模型；非文本操作仅在键盘焦点时提示，文本编辑保留活动状态。'
};
for (const [group, example, demo, title, names] of families) {
    for (const name of names) {
        const slug = kebab(name).slice(2);
        const file = new URL('../src/ui/docs/component-examples/' + slug + '.vue', import.meta.url);
        const original = await readFile(file, 'utf8');
        const source = await formatDemoSource(original);
        if (original !== source) await writeFile(file, source);
        const code = source.replaceAll("from '../../index'", "from '@lingyzh/ui'");
        pages.push({ id: name === 'UInput' ? 'input-base' : slug, title: titles[name], name, kind: 'component', group, description: `${titles[name]}的独立用法与交互。`, examples: [{ id: 'component-' + slug, title: `${titles[name]}的基本用法`, description: focusNotes[name] ?? '只演示当前组件及其所需的容器或子组件，源码与此示例一致。', fullSource: true, code }], notes: ['公开属性、模型、事件和插槽以本页 API 为准。', '组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。', ...(focusNotes[name] ? [focusNotes[name]] : [])] });
    }
}
await writeFile(new URL('../src/ui/docs/completionContent.js', import.meta.url), '// Generated from root-authored real demos.\nexport const completionPages = ' + JSON.stringify(pages, null, 4) + ';\n');
// Keep the dedicated-demo registry aligned when public components are added or renamed.
const componentManifest = pages.map(page => ({
    name: page.name,
    example: page.examples[0].id,
    file: page.examples[0].id.slice('component-'.length) + '.vue'
}));
await writeFile(new URL('../src/ui/docs/componentExampleManifest.json', import.meta.url), JSON.stringify(componentManifest, null, 4) + '\n');
const buttonSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/ButtonLoadingDemo.vue', import.meta.url), 'utf8'));
const buttonAppearanceSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/ButtonAppearanceDemo.vue', import.meta.url), 'utf8'));
await writeFile(new URL('../src/ui/docs/buttonContent.js', import.meta.url), 'export const buttonAppearanceExample = ' + JSON.stringify({ id: 'button-variant-color', title: '样式变体与颜色独立配置', description: '六种 variant 与主题颜色独立组合；也可输入 CSS 颜色。切换禁用和加载，比较表面、边框、前景与尺寸。', fullSource: true, code: buttonAppearanceSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n\nexport const buttonLoadingExample = ' + JSON.stringify({ id: 'button-loading-size', title: '加载时保留尺寸和样式', description: '六种 variant、独立颜色、紧凑、图标、指定宽度与自定义 loader。加载前后保持大小、底色、边框和文字颜色，阻止重复操作。', fullSource: true, code: buttonSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
function kebab(name) { return 'u-' + name.slice(1).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(); }
const heightSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/CodeBlockHeightDemo.vue', import.meta.url), 'utf8'));
const typographySource = await formatDemoSource(await readFile(new URL('../src/ui/docs/TypographyDemo.vue', import.meta.url), 'utf8'));
await writeFile(new URL('../src/ui/docs/typographyContent.js', import.meta.url), 'export const typographyPage = ' + JSON.stringify({ id: 'typography', title: '字体排版', name: 'Typography', kind: 'guide', group: '设计基础', description: '采用 Vuetify 4.2.4 的15级字号体系：正文16/14/12px，标题22/16/14px。保留现有中文字体、技术字体与主题。', apiKind: 'utilities', props: typography.map(role => ({ name: 'text-' + role.name, type: 'CSS class', fallback: role.size + 'px', description: '行高' + role.lineHeight + 'px，字重' + role.weight + '；以16px根字号计算。' })), examples: [{ id: 'typography-scale', title: '字号层级与真实控件', description: '按真实工具类展示全部字号；响应式字号随视口变化，输入与按钮使用对应字号。以16px根字号计算，浏览器缩放会等比例调整。', fullSource: true, code: typographySource.replaceAll("from '../index'", "from '@lingyzh/ui'") }], notes: ['text-display-*、text-headline-*、text-title-*、text-body-*、text-label-*与Vuetify4命名一致，large/medium/small各三级。', 'text-sm-* / text-md-* / text-lg-* / text-xl-* / text-xxl-*支持响应式字号。旧text-body-1/2、text-caption、text-subtitle与text-title映射到新层级。', '默认按钮14px，x-small/small/default/large/x-large为10/12/14/16/18px；输入16px，表单辅助12px，表格14px，工具栏标题20px、prominent24px。', '字号使用rem单位，随浏览器缩放等比例变化；字体家族、配色与控件圆角由现有设计tokens控制。'] }, null, 4) + ';\n');
await writeFile(new URL('../src/ui/docs/codeBlockContent.js', import.meta.url), 'export const codeBlockHeightExample = ' + JSON.stringify({ id: 'code-height', title: '自然高度与显式高度上限', description: '默认完整展开代码；只在传入 max-height 时限制高度，保留横向滚动与自动换行。', fullSource: true, code: heightSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');

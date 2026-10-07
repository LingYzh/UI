import { typography } from '../src/ui/typography.js';
import { readFile, writeFile } from 'node:fs/promises';
import { formatDemoSource } from './demo-source-format.mjs';
const families = [
    ['内容组件', 'alignment-code', '', '行内代码', ['UCode']],
    ['导航组件', 'alignment-slide', '', '通用滑动选择', ['USlideGroup', 'USlideGroupItem']],
    ['反馈组件', 'alignment-notice', '', '受控消息与队列', ['USnackbar', 'USnackbarQueue']],
    ['表单组件', 'completion-selection', 'FormCompletionDemo', '搜索、创建与对象选择', ['UAutocomplete', 'UCombobox']],
    ['表单组件', 'completion-inputs', 'FormCompletionDemo', '专门输入与统一表单状态', ['UNumberInput', 'UFileInput', 'UFileUpload', 'USlider', 'URangeSlider', 'UOtpInput', 'UColorInput', 'UColorPicker', 'URating']],
    ['表单组件', 'completion-groups', 'FormCompletionDemo', '组管理选择模型', ['USelectionControlGroup', 'USelectionControl', 'URadioGroup', 'UCheckboxGroup', 'UItemGroup', 'UItem', 'UChip', 'UChipGroup', 'UBtnGroup', 'UBtnToggle', 'ULabel', 'UMessages', 'UCounter']],
    ['表单组件', 'completion-custom-input', 'FormCompletionDemo', '自定义输入与默认配置', ['UInput', 'UValidation', 'UDefaultsProvider', 'ULocaleProvider']],
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
    ['导航组件', 'completion-stepper', 'ExperienceCompletionDemo', '步骤与当前内容共享模型', ['UStepper', 'UStepperVertical', 'UStepperItem', 'UStepperWindow', 'UStepperWindowItem', 'UStepperActions']],
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
titles.ULocaleProvider = '局部语言容器';
titles.UCode = '行内代码';
titles.USlideGroup = '滑动选择组';
titles.USlideGroupItem = '滑动选择项';
titles.USnackbar = '受控消息';
titles.USnackbarQueue = '消息队列';
const focusNotes = {
    UToolbar: '标题和操作区内置：title属性或title插槽配置标题，actions插槽直接放按钮（也支持append），无需额外标题/操作组件。extension显示扩展内容；四种密度采用64/56/48/128px。保留本库字体、间距、圆角和按钮尺寸，不注册应用布局占位。',
    UToolbarTitle: '此组件保留用于兼容自定义组合；常用标题直接使用UToolbar的title属性或title插槽。text属性、text插槽与默认插槽均支持，长文本省略，不挤掉操作。',
    UToolbarItems: '此组件保留用于兼容自定义组合；常用操作直接放入UToolbar的actions插槽。color/variant统一下发给按钮，显式属性优先；按钮使用本库圆角、尺寸和间距。',
    USlider: '鼠标点击或拖动不显示焦点外框；Tab 进入后显示焦点提示，方向键调整数值。',
    URangeSlider: '鼠标拖动不显示焦点外框；Tab 分别进入两个手柄时显示焦点提示，方向键调整范围。',
    UColorPicker: '颜色通道滑块仅在键盘操作时显示焦点外框；十六进制文本输入保留编辑提示。',
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
const buttonSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/ButtonLoadingDemo.vue', import.meta.url), 'utf8'));
const buttonAppearanceSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/ButtonAppearanceDemo.vue', import.meta.url), 'utf8'));
await writeFile(new URL('../src/ui/docs/buttonContent.js', import.meta.url), 'export const buttonAppearanceExample = ' + JSON.stringify({ id: 'button-variant-color', title: '样式变体与颜色独立配置', description: '六种 variant 与主题颜色独立组合；也可输入 CSS 颜色。切换禁用和加载，比较表面、边框、前景与尺寸。', fullSource: true, code: buttonAppearanceSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n\nexport const buttonLoadingExample = ' + JSON.stringify({ id: 'button-loading-size', title: '加载时保留尺寸和样式', description: '六种 variant、独立颜色、紧凑、图标、指定宽度与自定义 loader。加载前后保持大小、底色、边框和文字颜色，阻止重复操作。', fullSource: true, code: buttonSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');
function kebab(name) { return 'u-' + name.slice(1).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(); }
const heightSource = await formatDemoSource(await readFile(new URL('../src/ui/docs/CodeBlockHeightDemo.vue', import.meta.url), 'utf8'));
const typographySource = await formatDemoSource(await readFile(new URL('../src/ui/docs/TypographyDemo.vue', import.meta.url), 'utf8'));
await writeFile(new URL('../src/ui/docs/typographyContent.js', import.meta.url), 'export const typographyPage = ' + JSON.stringify({ id: 'typography', title: '字体排版', name: 'Typography', kind: 'guide', group: '设计基础', description: '采用 Vuetify 4.2.4 的15级字号体系：正文16/14/12px，标题22/16/14px。保留现有中文字体、技术字体与主题。', apiKind: 'utilities', props: typography.map(role => ({ name: 'text-' + role.name, type: 'CSS class', fallback: role.size + 'px', description: '行高' + role.lineHeight + 'px，字重' + role.weight + '；以16px根字号计算。' })), examples: [{ id: 'typography-scale', title: '字号层级与真实控件', description: '按真实工具类展示全部字号；响应式字号随视口变化，输入与按钮使用对应字号。以16px根字号计算，浏览器缩放会等比例调整。', fullSource: true, code: typographySource.replaceAll("from '../index'", "from '@lingyzh/ui'") }], notes: ['text-display-*、text-headline-*、text-title-*、text-body-*、text-label-*与Vuetify4命名一致，large/medium/small各三级。', 'text-sm-* / text-md-* / text-lg-* / text-xl-* / text-xxl-*支持响应式字号。旧text-body-1/2、text-caption、text-subtitle与text-title映射到新层级。', '默认按钮14px，x-small/small/default/large/x-large为10/12/14/16/18px；输入16px，表单辅助12px，表格14px，工具栏标题20px、prominent24px。', '字号使用rem单位，随浏览器缩放等比例变化；字体家族、配色与控件圆角由现有设计tokens控制。'] }, null, 4) + ';\n');
await writeFile(new URL('../src/ui/docs/codeBlockContent.js', import.meta.url), 'export const codeBlockHeightExample = ' + JSON.stringify({ id: 'code-height', title: '自然高度与显式高度上限', description: '默认完整展开代码；只在传入 max-height 时限制高度，保留横向滚动与自动换行。', fullSource: true, code: heightSource.replaceAll("from '../index'", "from '@lingyzh/ui'") }, null, 4) + ';\n');

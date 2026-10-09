import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { extractPublicComponentContracts } from '../tests/helpers/component-contracts.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, '..');
const sourceOutput = path.join(root, 'src/ui/docs/apiReference.js');
const output = readOutputArgument(process.argv.slice(2)) || sourceOutput;
const canonical = extractPublicComponentContracts(root);
const allExports = extractPublicComponentContracts(root, { includeLegacy: true });
const existingApi = await loadExistingApi(sourceOutput);
const priorByFile = makePriorByFile(allExports, existingApi);

const commonProps = {
    rowProps: '静态对象或函数为数据行提供属性，函数接收 { item, internalItem, index }。',
    cellProps: '静态对象或函数为单元格提供属性，函数接收 { item, internalItem, index, column, value }。',
    headerProps: '为默认表头单元格提供属性，与每列 headerProps 合并。',
    sortIcon: '覆盖排序图标；未设置时使用已有双向排序箭头。',
    sortAscIcon: '覆盖升序图标的本库名称。',
    sortDescIcon: '覆盖降序图标的本库名称。',
    groupExpandIcon: '分组关闭时的展开图标。',
    groupCollapseIcon: '分组打开时的收起图标。',
    collapseIcon: '数据行展开时的收起图标。',
    expandIcon: '数据行关闭时的展开图标。',
    selectAllLabel: '全选控件的可访问名称；省略时使用本库语言包。',
    noDataText: '空数据提示文字；省略时使用本库语言包。',
    loadingText: '加载状态文字及进度条的可访问名称。',
    itemsPerPageText: '每页数量控件的可见标签。',
    firstPageLabel: '跳到首页按钮的可访问名称。',
    lastPageLabel: '跳到末页按钮的可访问名称。',
    prevPageLabel: '上一页按钮的可访问名称。',
    nextPageLabel: '下一页按钮的可访问名称。',
    firstIcon: '首页按钮的图标名称。',
    lastIcon: '末页按钮的图标名称。',
    prevIcon: '上一页按钮的图标名称。',
    nextIcon: '下一页按钮的图标名称。',
    prevLabel: '上一页按钮的可访问名称。',
    nextLabel: '下一页按钮的可访问名称。',
    ripple: '动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发。',
    label: '控件或区域的可访问名称；有可见标题时仍会关联对应控件。',
    labelWidth: '设置标签左对齐时标签列的宽度；数字按像素处理。',
    hint: '显示在控件下方的补充说明，并通过 aria-describedby 关联。',
    description: '为条目或控件提供补充说明；具体展示位置由组件决定。',
    title: '显示的标题文本；使用 title 插槽时可由插槽内容替代。',
    text: '组件的主要文字内容；存在默认插槽时可改用插槽。',
    modelValue: '组件的双向绑定值；类型和初始值见本行契约。',
    value: '当前条目或控件代表的值；选择类组件用它与绑定模型比较。',
    items: '供组件渲染或选择的数据项列表；条目字段按组件类型解析。',
    itemTitle: '从数据项读取显示文本的字段名或取值函数。',
    itemValue: '从数据项读取模型值或稳定键的字段名或取值函数。',
    itemProps: '从数据项提取 disabled、标题等条目属性的映射规则。',
    disabled: '禁用用户交互；由表单禁用时，子控件不能单独恢复启用。',
    readonly: '保留控件可读与聚焦状态，同时阻止用户修改模型。',
    loading: '表示异步或延迟操作正在进行，并按组件约定限制重复操作。',
    error: '显示当前错误状态或错误内容；具体呈现由组件决定。',
    dense: '使用组件提供的紧凑间距与尺寸。',
    density: '选择组件内部间距级别；可用值见联合类型。',
    ghost: '使用透明或弱化表面，同时保留组件的焦点与错误反馈。',
    rounded: '启用或关闭组件的圆角表面。',
    width: '设置组件或内容区域宽度；数字按像素处理。',
    minWidth: '设置组件最小宽度，避免内容区域继续收窄。',
    maxWidth: '设置组件最大宽度，限制内容区域展开。',
    height: '设置组件或滚动区域高度；单位由类型与实现决定。',
    minHeight: '设置组件最小高度。',
    maxHeight: '设置组件最大高度。',
    inline: '按内容宽度排列，不占满父容器可用宽度。',
    invalid: '显式显示无效状态；与规则、原生 validity 和外部错误合并。',
    rules: '按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败。',
    errorMessages: '向控件追加外部错误；禁用时错误不会参与 Form 汇总。',
    maxErrors: '限制本次验证最多保留的错误数量。',
    validateOn: '设置控件触发验证的时机；类型列给出允许值。',
    fastFail: '首次无效控件出现后停止本轮 Form 验证。',
    persistentHint: '即使控件没有焦点，也持续显示 hint 说明。',
    hideDetails: '控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示。',
    prefix: '在输入区域前显示固定前缀文本。',
    suffix: '在输入区域后显示固定后缀文本。',
    valueComparator: '自定义两个候选值是否相等的比较函数。',
    trueValue: '指定选择控件进入选中状态时写入模型的值。',
    falseValue: '指定选择控件退出选中状态时写入模型的值。',
    multiple: '允许选择多个条目；模型通常为数组，具体类型见本行契约。',
    returnObject: '让选择模型返回完整条目对象，而不是条目 value。',
    chips: '以可移除标签展示已选值。',
    clearable: '显示清除当前选择或输入值的操作。',
    hideSelected: '从候选列表中隐藏已经选中的条目。',
    search: '控制或读取候选项过滤使用的搜索文本。',
    filter: '自定义候选条目的匹配判断；返回 true 的条目保留。',
    customFilter: '以 value、query、item 和 key 自定义表格过滤。',
    max: '限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定。',
    min: '设置数值、尺寸或日期范围的下界。',
    step: '设置数值控件每次递增或递减的单位。',
    precision: '设置数值计算或格式化时保留的小数位精度。',
    required: '要求表单提交前提供有效值，并暴露原生或 ARIA 必填状态。',
    eager: '在首次显示前挂载内容；不启用时按组件生命周期延迟挂载。',
    mandatory: '要求选择模型保持至少一个有效值；可用模式见类型。',
    active: '控制当前条目或面板是否处于激活状态。',
    appendIcon: '在右侧显示图标；append插槽存在时由插槽替换。',
    appendText: '本库扩展的右侧辅助文本；优先省略并保留完整title提示，append插槽存在时由插槽替换。',
    selected: '控制条目是否作为已选择项呈现。',
    selectable: '允许条目参与选择模型。',
    activatable: '允许条目成为当前活动项，但不要求它改变选择模型。',
    open: '控制面板或浮层当前是否打开。',
    model: '控制组件绑定的当前值；类型列给出可接受值。',
    location: '设置浮层或控件在锚点周围的放置位置。',
    placement: '设置浮层相对触发器的首选放置位置。',
    persistent: '阻止点击外部或按 Escape 自动关闭浮层。',
    scrollStrategy: '设置浮层打开时对页面滚动的处理方式。',
    scrim: '在浮层后显示遮罩，并按组件规则处理遮罩交互。',
    activator: '指定浮层触发器；若使用 activator 插槽，可自行绑定其 props。',
    offset: '设置浮层与触发锚点之间的间距。',
    transition: '选择内容进入或离开时使用的过渡效果。',
    itemsLength: '服务端数据集的总条数，用于计算页数和范围文本。',
    page: '分页模型的当前页码。',
    itemsPerPage: '分页模型每页显示的条目数。',
    itemsPerPageOptions: '供用户选择的每页条数选项。',
    absolute: '脱离普通布局流定位组件；位置由组件和父级布局决定。',
    fixed: '将组件或表头固定在滚动容器或视口位置。',
    locale: '选择日期、数字或文本格式化使用的语言区域。',
    openOnClick: '用户点击触发器时打开面板。',
    openOnHover: '指针移入触发器时打开面板。',
    openOnFocus: '触发器获得键盘焦点时打开面板。',
    openDelay: '延迟指定毫秒后打开面板。',
    closeDelay: '延迟指定毫秒后关闭面板。',
    firstDayOfWeek: '设置日历一周的起始日；0 表示星期日。未指定时按最近语言地区推断。',
    touch: '启用触摸手势切换或交互。',
    keyboard: '启用键盘快捷键或方向键交互。',
    itemHeight: '设置虚拟列表中每一项的估算或固定高度。',
    overscan: '在可视区域前后额外渲染的条目数量，减少快速滚动时的空白。',
    mode: '选择组件的工作模式；具体可用值见类型列。',
    allowedDates: '限制日历中允许选择的日期。',
    accept: '设置文件输入允许的 MIME 类型或扩展名。',
    maxSize: '限制单个文件可接受的最大字节数。',
    keys: '指定触发键盘快捷操作的按键集合。',
    rootMargin: '调整交叉观察器根区域的边界，用于提前或延后懒加载。',
    subtitle: '显示标题下方的第二行说明。',
    length: '设置分页、列表或输入格的项目总数；具体含义见组件行为。',
    indeterminate: '显示复选控件的部分选中状态，不直接更改绑定模型。',
    linear: '只允许按顺序完成前置步骤后进入后续步骤。',
    to: '设置导航目标；可传入路由路径或命名路由对象。',
    fullscreen: '让对话框占满可用视口。',
    closable: '显示关闭操作，并允许用户移除当前内容。',
    combobox: '允许提交搜索文本中不在候选项列表里的新值。',
    content: '设置徽标中显示的计数或短文本。',
    dot: '将徽标内容替换为不带文字的状态圆点。',
    offsetX: '沿水平方向微调徽标位置，单位为像素。',
    offsetY: '沿垂直方向微调徽标位置，单位为像素。',
    sticky: '滚动页面时将提示条固定在容器边缘。',
    divider: '设置面包屑层级之间显示的分隔文本。',
    ariaLabel: '为没有可见文字的导航或控件提供无障碍名称。',
    interval: '设置轮播自动切换的间隔毫秒数。',
    cycle: '允许轮播到末项或首项后循环。',
    allowEmpty: '允许用户清空当前输入值。',
    showInputs: '显示可直接编辑颜色通道或色值的输入控件。',
    validate: '在保存前执行同步或异步验证；返回 false 表示拒绝保存。',
    defaults: '为后代组件提供按组件名和属性名匹配的默认值。',
    reset: '恢复默认值后重置后代组件的默认配置。',
    vertical: '按纵向排列内容或分隔线。',
    inset: '在组件两端留出缩进，不延伸到容器全宽。',
    thickness: '设置分隔线的厚度；数字按像素处理。',
    showSize: '显示已选文件的大小文本。',
    preventDefault: '触发时阻止对应原生浏览器默认行为。',
    allowInput: '允许用户直接键入日期或时间值。',
    src: '设置图片、媒体或内容资源地址。',
    lazy: '内容接近可视区域时再创建或加载。',
    for: '将标签或消息关联到指定控件的 DOM id。',
    once: '首次满足条件后停止后续观察或重复触发。',
    nav: '将容器呈现为站点导航而不是可选择列表。',
    fallback: '目标资源不可用时显示的备用值或内容。',
    messages: '提供当前语言环境的消息字典。',
    rtl: '为指定语言设置从右向左的书写方向。',
    rail: '将导航抽屉收窄为仅显示图标的轨道模式。',
    railWidth: '设置导航抽屉轨道模式的宽度。',
    temporary: '在窄屏模式下使用可关闭的临时抽屉。',
    mobileBreakpoint: '低于该像素宽度时启用移动端抽屉行为。',
    numeric: '限制输入内容为数字字符。',
    speed: '设置视差跟随滚动的速度系数，限制在-1至1；负数反向，0保持静止。',
    bufferValue: '设置进度条缓冲区的当前数值。',
    stream: '显示进度条尾部的动态流动效果。',
    threshold: '设置手势或观察行为触发所需的距离阈值。',
    aspectRatio: '设置媒体容器的宽高比。',
    elevation: '设置表面阴影层级；0 表示不显示阴影。',
    border: '显示组件边框。',
    lines: '设置骨架文本状态显示的行数。',
    showTicks: '在滑块轨道上显示步进标记。',
    thumbLabel: '拖动滑块时显示当前值标签。',
    closeOnClick: '执行菜单项后关闭操作面板。',
    complete: '将步骤标记为已完成状态。',
    editable: '允许用户直接编辑当前步骤或条目。',
    minuteStep: '设置时间控件分钟字段的步进值。',
    reverse: '反转内容或数据的显示顺序。',
    appear: '在组件首次渲染时也执行进入过渡。',
    itemChildren: '指定树形数据中存放子节点的字段名。',
    itemKey: '指定虚拟列表条目的稳定键字段或取值函数。',
    continuous: '切换到首项或末项后继续循环播放。',
    sortBy: '排序模型；每项包含排序字段与升降序。',
    groupBy: '分组模型；每项指定用于分组的字段。',
    showSelect: '在数据行前显示选择控件并启用选择模型。',
    showExpand: '为数据行显示展开操作及扩展内容区域。',
    multiSort: '允许排序模型同时包含多个排序字段。',
    server: '由调用方提供已处理的数据，并通过 options 事件接收查询状态。',
    hideDefaultFooter: '隐藏组件内置分页栏，便于调用方提供自定义页脚。',
    fixedHeader: '滚动内容时固定表头。',
    headers: '定义表格列的键、标题、排序和显示方式。',
    noGutters: '移除行列之间默认的间距。',
    cols: '设置列在各响应式断点下占用的网格宽度。',
    offset: '设置网格列相对起始边缘的偏移。',
    order: '设置组件在布局流中的顺序。',
    align: '设置交叉轴上的对齐方式；可用值见联合类型。',
    justify: '设置主轴上的分布方式；可用值见联合类型。',
    gap: '设置网格行列之间的间隔。',
    orientation: '设置标签页、分组或控件的排列方向；可用值见联合类型。',
    direction: '设置组件的主方向；可用值见联合类型。',
    activation: '设置标签页由方向键自动激活还是经 Enter/Space 手动激活。',
    loop: '方向键移动到末项或首项时是否循环到另一端。',
    showArrows: '在可滚动标签列表上显示前后移动按钮。',
    hideSlider: '隐藏当前标签下方的活动指示条。',
    grow: '让标签在可用宽度内扩展并分配空间。',
    fixedTabs: '使用等宽标签布局，不按文本长度分配宽度。',
    stacked: '将标签图标与文字上下排列。',
    centerActive: '滚动标签列表时将当前标签移到可视区域中央。',
    alignTabs: '设置标签组在列表内的对齐位置；可用值见联合类型。',
    showSlider: '显示所选标签的活动指示条。',
    eagerValidation: '在控件挂载或首次展示时执行验证。',
    autoGrow: '根据文本内容与可用宽度自动增减文本框高度。',
    maxRows: '限制 autoGrow 文本框可增长的最大行数。',
    noResize: '隐藏浏览器原生拖动手柄；autoGrow 也会禁用手动缩放。',
    rows: '设置文本框初始可见行数。',
    counter: '显示当前字符数；数字值也用作计数上限提示。',
    color: '设置组件使用的颜色或主题色值。',
    theme: '选择当前组件使用的主题名称。',
    variant: '选择组件的语义样式变体；可用值见联合类型。',
    size: '设置组件尺寸；数字或字符串的含义由类型列说明。',
    icon: '图标值：SVG 路径、含透明度的多路径数组、Vue 组件或 $alias；兼容已有本地名称。',
    image: '指定图片资源地址。',
    alt: '提供图片或图标的替代文本。',
    href: '设置启用时导航到的链接地址。',
    target: '设置链接打开目标。',
    as: '选择组件根节点的 HTML 标签或自定义元素。',
    tag: '选择组件根节点的 HTML 标签。',
    name: '设置原生控件名称或条目标识。',
    id: '设置根元素或原生控件的 DOM id。',
    autofocus: '组件挂载后自动将焦点移到第一个可编辑控件。',
    focusable: '允许滚动区域通过键盘获得焦点。',
    hide: '隐藏组件提供的默认界面。',
    retry: '在错误状态下请求调用方重新执行操作。',
    emptyText: '没有可显示数据时呈现的空状态文字。',
    noDataText: '过滤后没有候选项时呈现的说明文字。',
    placeholder: '未输入或未选择时显示的提示文本。',
};

const commonEvents = {
    click: '用户激活组件时触发；参数携带原生点击事件。',
    close: '组件请求关闭时触发；调用方可据此更新可见状态。',
    open: '组件请求打开时触发；调用方可据此更新可见状态。',
    save: '用户确认保存时触发，并携带待提交的数据。',
    cancel: '用户取消当前操作时触发。',
    change: '用户完成值变更时触发，并携带新值。',
    input: '输入内容变化时触发，并携带当前值。',
    focus: '组件内部控件获得焦点时触发。',
    blur: '组件内部控件失去焦点时触发。',
    retry: '用户请求重试当前失败操作时触发。',
    refresh: '用户完成下拉刷新手势时触发；回调参数提供完成方法。',
    intersect: '观察目标进入交叉区域时触发，并携带 IntersectionObserverEntry。',
    rejected: '选择的文件不符合限制时触发，并携带拒绝原因。',
    finish: '用户完成所有输入格时触发，并携带最终文本值。',
    invalid: '表单提交验证失败时触发，并携带控件错误列表。',
    submit: '表单验证通过后触发，并携带原生提交事件和验证结果。',
    'click:outside': '用户点击浮层外部时触发。',
    'update:options': '分页、排序、分组或搜索参数变化时触发，并携带最新查询选项。',
};

const commonSlots = {
    default: '放置组件主要内容；无作用域参数时由调用方直接提供节点。',
    activator: '自定义打开浮层的触发器；作用域提供需绑定到触发器的属性。',
    item: '自定义单个候选项或数据项的内容。',
    selection: '自定义当前已选值的显示内容。',
    'header.*': '按列键自定义表格表头。',
    'item.*': '按列键自定义表格单元格内容。',
    'group-header': '自定义数据分组标题及其展开、折叠操作。',
    'expanded-row': '自定义展开行内容。',
    'no-data': '自定义没有匹配或可显示条目时的空状态。',
    loading: '自定义数据加载期间显示的内容。',
    error: '自定义错误状态内容；作用域包含错误信息。',
    footer: '替换组件内置分页栏。',
    title: '替换组件默认标题内容。',
    subtitle: '提供标题下方的辅助说明。',
    actions: '放置与主要内容关联的操作。',
    icon: '替换组件默认图标。',
    media: '放置图标、图片或其他媒体内容。',
    prepend: '在主要内容前追加图标或节点。',
    append: '在主要内容后追加图标或节点。',
    text: '替换组件的文本内容。',
    close: '自定义关闭操作的触发器。',
    empty: '自定义空状态内容。',
    placeholder: '自定义尚无内容时显示的占位区域。',
};

const commonMethods = {
    element: '访问组件关联的根元素或原生控件引用。',
    focus: '将焦点移到组件的可编辑控件或首个可交互元素。',
    select: '选中原生文本输入框中的全部内容。',
    validate: '立即执行当前控件或表单的同步、异步与原生验证。',
    reset: '将模型恢复为挂载时记录的初始值，并清除验证状态。',
    resetValidation: '取消进行中的验证并清除当前错误，不改动模型值。',
    errors: '读取当前控件或表单的验证错误。',
    close: '关闭组件当前打开的面板或浮层。',
    open: '打开组件面板或浮层。',
    next: '移动到下一项。',
    prev: '移动到上一项。',
    goToday: '将日历定位到今天。',
    scrollToIndex: '将虚拟滚动区域定位到指定条目索引。',
    cancel: '取消当前进行中的操作。',
    move: '按组件支持的方向或步长移动当前状态。',
    update: '按当前参数重新计算或提交组件状态。',
};

function readOutputArgument(args) {
    const index = args.findIndex((arg) => arg === '--output' || arg.startsWith('--output='));
    if (index < 0) return undefined;
    const value = args[index] === '--output' ? args[index + 1] : args[index].slice('--output='.length);
    if (!value) throw new Error('Usage: node scripts/sync-api-reference.mjs [--output <file>]');
    return path.resolve(root, value);
}

async function loadExistingApi(filename) {
    if (!existsSync(filename)) return {};
    try {
        const url = `${pathToFileURL(filename).href}?sync=${Date.now()}`;
        return (await import(url)).componentApi || {};
    } catch (error) {
        throw new Error(`Could not load existing API descriptions at ${filename}: ${error.message}`);
    }
}

function makePriorByFile(contracts, api) {
    const contractByName = new Map(contracts.map((contract) => [contract.name, contract]));
    const result = new Map();
    for (const [name, rows] of Object.entries(api)) {
        const contract = contractByName.get(name);
        if (!contract) continue;
        const list = result.get(contract.file) || [];
        list.push({ name, rows });
        result.set(contract.file, list);
    }
    return result;
}

function priorRecordFor(contract) {
    const list = priorByFile.get(contract.file) || [];
    return list.find((entry) => entry.name === contract.name)?.rows || list[0]?.rows || {};
}

function byName(rows = []) {
    return new Map(rows.map((row) => [row.name, row]));
}

function normalizeText(value) {
    return String(value || '').replace(/\bUi([A-Z]\w*)\b/g, (_, suffix) => suffix === 'Input' ? 'UTextField' : suffix === 'Badge' ? 'UChip' : `U${suffix}`).replace(/\s+/g, ' ').trim().replace(/[。；;,:，]+$/, '');
}

function reusableDescription(row) {
    const description = normalizeText(row?.description);
    if (!description || /^(配置属性|组件内容|内容插槽|默认插槽|属性配置)$/i.test(description)) return '';
    return description;
}

function literalConstraint(type) {
    const parts = type.split('|').map((part) => part.trim());
    const literals = parts.filter((part) => /^(?:'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|true|false|null|undefined)$/.test(part));
    if (literals.length === parts.length && literals.length > 1) return `可选值为 ${literals.join('、')}`;
    if (parts.includes('null')) return '也可传入 null 清空或表示当前无值';
    if (parts.includes('undefined')) return '允许省略或传入 undefined';
    return '';
}

function humanize(name) {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[._-]+/g, ' ').trim();
}

function propDescription(contract, prop, previous) {
    if (prop.name === 'icon' || /Icon$/.test(prop.name)) return commonProps.icon + (contract.name === 'UButton' && prop.name === 'icon' ? ' Boolean true 只启用图标按钮外观，默认插槽优先。' : '');
    if (['UIcon', 'UiIcon'].includes(contract.name) && prop.name === 'name') return '兼容旧版图标名称，与 icon 使用相同解析；icon 显式值优先。';
    if (['UIcon', 'UiIcon'].includes(contract.name) && prop.name === 'path') return '兼容显式 SVG 路径，优先于 icon/name，并使用 SVG 渲染器。';
    if (['UApp', 'ULayout'].includes(contract.name) && prop.name === 'layoutMode') return 'legacy默认保留现有布局几何；ordered按order逐项分配四边空间并消费overlaps。';
    if (contract.name === 'UTreeview' && prop.name === 'itemsRegistration') return '默认render仅注册当前渲染节点供选择和激活策略使用；props显式注册完整items树，含关闭分支。';
    if (['UList', 'UTreeview'].includes(contract.name) && prop.name === 'activeStrategy') return '默认single-independent仅激活一项，重复激活可取消；显式策略可启用多项或叶节点约束。';
    if (['UOverlay', 'UDialog', 'UMenu'].includes(contract.name) && prop.name === 'attach') return '普通DOM浮层默认挂载body；字符串选择器或HTMLElement指定容器，true原位渲染。可动态移动同一实例。';
    if (['UOverlay', 'UDialog', 'UMenu'].includes(contract.name) && ['contained', 'absolute'].includes(prop.name)) return '启用容器内absolute定位；未指定attach时原位渲染，容器需提供定位上下文。';
    if (['UOverlay', 'UDialog', 'UMenu'].includes(contract.name) && prop.name === 'zIndex') return '指定DOM层级；键盘、外部关闭及后退按实际最高zIndex处理，默认嵌套层递增。';
    if (contract.name === 'UMenu' && prop.name === 'nativeDismiss') return '兼容旧调用的属性；普通DOM呈现统一由库管理外部点击和Escape。';
    if (contract.name === 'UTabs' && prop.name === 'modelValue') return '支持对象、数组、字符串、数字和 null 标签值；null 是有效值，空列表或取消选择时可为 undefined。multiple 时模型为选中值数组，max 限制选中数量，valueComparator 控制比较。';
    if (contract.name === 'UTabsWindowItem' && prop.name === 'eager') return '省略时继承 UTabsWindow 的 eager；true 提前挂载并保留内容。默认首次激活时挂载，离场动画结束后卸载。';
    if (contract.name === 'UFileInput' && ['counterString', 'counterSizeString'].includes(prop.name)) return '计数文案或最近语言作用域中的字典键；支持 {0}/{1}（文件数/可读大小）及 {count}/{size} 命名模板。';
    if (contract.name === 'UApp' && prop.name === 'fullHeight') return '默认 true，最小高度为 100dvh；false 将默认最小高度设为 0。';
    if (contract.name === 'ULayout' && prop.name === 'fullHeight') return '显式 true 时最小高度为 100dvh；尺寸属性可覆盖默认高度约束。';
    if (contract.name === 'UConfirmEdit') {
        const descriptions = { disabled: '未提供时按isPristine禁用操作；boolean统一控制，数组只禁用save/cancel中的指定操作。', hideActions: '隐藏默认操作按钮，使用默认插槽的save/cancel或actions自定义操作区。', cancelText: '取消按钮文本；显式$vuetify命名空间token按最近语言作用域解析。', okText: '确认按钮文本；显式$vuetify命名空间token按最近语言作用域解析。' };
        if (descriptions[prop.name]) return descriptions[prop.name];
    }
    if (contract.name === 'UDefaultsProvider') {
        const descriptions = { reset: '按祖先链回溯：true等效数字1，数字或字符串指定父层数；不再清空继承。', root: 'true回溯根配置；字符串同时叠加该名称的默认配置字典。', scoped: '只提供本层配置，不合并父配置；优先于reset和root。', disabled: '直接透传父配置，忽略本层defaults、scoped、reset和root。' };
        if (descriptions[prop.name]) return descriptions[prop.name];
    }
    if (prop.name === 'standardProtocol' && contract.name === 'UImg') return '默认false：load/error给原生DOM Event；true改给浏览器选定的currentSrc URL字符串。';
    if (prop.name === 'standardProtocol' && contract.name === 'UTooltip') return '默认false：default是触发器，text或content提供提示内容；true使用activator触发器插槽与default内容插槽，default的isActive是可写Ref。';
    if (prop.name === 'standardProtocol' && contract.name === 'UDataIterator') return '默认false：items为原始项、默认无容器；true提供标准包装项、容器和上游事件协议。原每页10保留，可显式配置5。';
    if (contract.name === 'UCounter' && prop.name === 'displayMode') return '默认length：字符串按Unicode码点计数；value直接显示字符串。数字value始终直接显示。';
    if (contract.name === 'UHotkey' && prop.name === 'displayMode') return 'icon/symbol/text选择按键图标、平台符号或文字展示，与platform/keyMap配合；不改变trigger监听。';
    if (contract.name === 'UHotkey' && prop.name === 'listen') return '本库扩展，默认true保留原快捷键trigger监听；纯展示设false。监听沿用UHotkeyListener的单个组合键语法。';
    if (contract.name === 'UInfiniteScroll' && prop.name === 'direction') return 'vertical/horizontal指定轴向；旧start/end/both仍指定加载边缘，且优先于side。默认vertical + side=end。';
    if (contract.name === 'UInfiniteScroll' && prop.name === 'side') return '新方向vertical/horizontal下加载start/end/both；两侧loading/error/empty独立，旧direction边缘值优先。';
    if (contract.name === 'UInfiniteScroll' && prop.name === 'margin') return '数字和数字字符串按px、带单位字符串原样配置观察边界；显式值优先于旧rootMargin，0也生效。';
    if (['UItemGroup', 'UChipGroup', 'UBtnGroup', 'UBtnToggle'].includes(contract.name) && prop.name === 'mandatory') return 'true阻止取消最后一项；force还会初始选择第一个可用项。禁用和只读时不会强制写回模型。';
    if (contract.name === 'UItem' && prop.name === 'tag') return '默认button保留本库包装；false仅渲染作用域插槽，用isSelected/selectedClass/disabled/select/toggle自建交互。';
    if (contract.name === 'ULocaleProvider' && prop.name === 'fallbackLocale') return '文案缺失时使用的语言；显式旧fallback优先，省略时继承祖先fallback。';
    if (contract.name === 'UDataIterator' && prop.name === 'itemsLength') return '显式提供总数（0也有效）后跳过本地分页切片，继续过滤、排序和分组；总页数使用此数值。';
    if (['UField', 'UPicker', 'UHotkey', 'UImg'].includes(contract.name) && prop.name === 'rounded') return '省略时保持本组件圆角；false/0去圆角，数字按px，字符串支持CSS长度及sm/md/lg/xl/pill/circle/shaped、t/b/s/e边角配置。';
    if (contract.name === 'UToolbar' && prop.name === 'density') return 'default/comfortable/compact/prominent：默认内容高度64/56/48/128px；扩展区48/44/40/96px。显式height与extensionHeight参与相同密度计算。';
    if (contract.name === 'UToolbar' && prop.name === 'height') return '内容区基础高度，默认64px；数字或数字字符串。密度会从此基础高度计算最终尺寸。';
    if (contract.name === 'UToolbar' && prop.name === 'extensionHeight') return '扩展区基础高度，默认48px；密度会调整最终高度，不包含内容区。';
    if (contract.name === 'UToolbar' && prop.name === 'extended') return '默认null：存在extension插槽时显示扩展区；显式true/false控制显示，并提供展开收起过渡。关闭时内容不可聚焦。';
    if (contract.name === 'UToolbar' && prop.name === 'collapse') return '将工具栏限制到112px并隐藏标题；collapsePosition指定折叠侧。';
    if (contract.name === 'UToolbar' && prop.name === 'collapsePosition') return 'start/end指定折叠侧，使用逻辑方向并圆化对应底角；默认start。';
    if (contract.name === 'UToolbar' && prop.name === 'floating') return '宽度随内容收缩，适合独立浮动操作条；未启用时占满容器宽度。';
    if (contract.name === 'UToolbar' && prop.name === 'location') return '定位边缘，如top start或bottom end；通常与absolute配合使用。';
    if (contract.name === 'UToolbar' && prop.name === 'color') return '主题名称（如primary）或CSS颜色；填充背景并使用对应on-color，未单独设置颜色的按钮继承前景色。';
    if (contract.name === 'UToolbarItems' && prop.name === 'variant') return '为操作按钮提供默认样式，默认text；按钮显式variant优先。';
    if (contract.name === 'UToolbarItems' && prop.name === 'color') return '为操作按钮提供默认颜色；按钮显式color优先，未设置时继承工具栏前景色。';
    if (contract.name === 'UCodeBlock' && prop.name === 'maxHeight') return '默认不限制最大高度，代码随内容自然增高；显式传入CSS高度后在指定高度内纵向滚动。';
    if (contract.name === 'UButton' && prop.name === 'value') return '在 u-btn-toggle 中的选择值；省略时使用按钮在组中的索引。普通按钮不参与组选择。';
    if (contract.name === 'USlideGroup' && prop.name === 'mandatory') return 'true 阻止取消最后一项；force 还会在挂载时选择第一个可用项。';
    if (contract.name === 'USlideGroup' && prop.name === 'scrollDistance') return '箭头滚动距离，支持px数值或百分比；默认100%为一个视口。';
    if (contract.name === 'USlideGroup' && prop.name === 'showArrows') return 'always始终显示；never隐藏；true仅溢出时显示；desktop桌面始终显示；mobile在移动设备或溢出时显示；省略/false为桌面溢出时显示。';
    if (['USnackbar','USnackbarQueue'].includes(contract.name) && prop.name === 'timeout') return '显示超时（毫秒），默认5000；负数持续显示，0立即结束。悬停、内部键盘焦点和文档隐藏暂停倒计时。';
    if (contract.name === 'USnackbarQueue' && prop.name === 'modelValue') return 'v-model待显示消息数组；消息被取出显示时从数组移除。支持字符串、属性对象和promise及success/error回调。';
    if (contract.name === 'USnackbarQueue' && prop.name === 'displayStrategy') return 'hold按顺序等待空位；overflow在容量满时淘汰最早活跃消息以显示新项。';
    if (contract.name === 'USnackbarQueue' && prop.name === 'totalVisible') return '同时活跃的消息上限，最小为1；关闭动画结束后移除表面。';
    if (['USnackbar','USnackbarQueue'].includes(contract.name) && prop.name === 'contained') return '显示在最近定位容器内；默认Teleport到body。attach可指定挂载目标或false原位渲染。';
    if (['USnackbar','USnackbarQueue'].includes(contract.name) && prop.name === 'location') return '消息位置，如bottom center、top left；start/end映射逻辑侧。';
    if (contract.name === 'UButton' && prop.name === 'variant') return '只选择样式变体：elevated、flat、tonal、outlined（本库默认）、text、plain；颜色独立由 color 配置。默认沿用无阴影描边外观，显式 elevated 才使用阴影。';
    if (contract.name === 'UButton' && prop.name === 'color') return '独立颜色：主题名称（primary、secondary、success、error、danger、warning、info 或自定义色）及 CSS 颜色。danger 默认跟随 error。elevated/flat 填充底色并使用对应 on-color，其余作用于文字/图标及 outlined 边框、tonal 底层。';
    if (contract.name === 'UButton' && prop.name === 'ghost') return '兼容透明外观属性；为 true 时映射到 text 变体，颜色仍由 color 控制。新用法优先使用 variant="text"。';
    if (contract.name === 'UButton' && prop.name === 'loading') return '等待时禁用并暴露 aria-busy；保留原 variant 和进入加载前的宽高，只显示一个居中的加载指示，可通过 loader 插槽定制。';
    if (['UTable', 'UDataTable', 'UDataTableServer', 'UDataTableVirtual'].includes(contract.name) && prop.name === 'label') return '表格的可访问名称，用于 table 的 aria-label；不生成额外的可见表单标签。';
    if (['UDataTable', 'UDataTableServer'].includes(contract.name) && prop.name === 'sortBy') return 'v-model:sort-by：排序模型；每列按升序、降序、取消循环，multi-sort 允许同时指定多列。';
    if (prop.name === 'hint') return commonProps.hint;
    const oldDescription = reusableDescription(previous);
    if (oldDescription) return oldDescription;
    if (normalizeText(prop.documentation)) {
        const description = normalizeText(prop.documentation);
        const constraint = literalConstraint(prop.type);
        return constraint && !description.includes(constraint) ? `${description} ${constraint}。` : description;
    }
    const common = commonProps[prop.name];
    if (common) {
        const constraint = literalConstraint(prop.type);
        return constraint ? `${common} ${constraint}。` : common;
    }
    const constraint = literalConstraint(prop.type);
    const readableName = humanize(prop.name);
    if (prop.type === 'boolean') return `控制是否启用 ${readableName} 行为。`;
    if (/\[\]$/.test(prop.type) || prop.type.startsWith('readonly ')) return `提供 ${readableName} 所需的数据集合；类型为 ${prop.type}${constraint ? `，${constraint}` : ''}。`;
    if (constraint) return `设置 ${readableName}；${constraint}。`;
    return `设置 ${readableName}，供 ${contract.name} ${prop.model ? '同步模型状态' : '执行对应行为'}；公开类型为 ${prop.type}。`;
}

function fallbackFor(prop) {
    if (prop.inheritance) {
        const parent = prop.inheritance.from === 'UiForm' ? 'UForm' : prop.inheritance.from;
        return `undefined（继承 ${parent}；独立为 ${prop.inheritance.standaloneFallback}）`;
    }
    switch (prop.default.kind) {
        case 'required': return '无默认值（必填）';
        case 'vue-boolean-false': return 'false（Vue Boolean 默认值）';
        case 'explicit': return prop.default.source;
        case 'factory': return `每次实例化执行 ${prop.default.source}`;
        case 'explicit-undefined': return 'undefined';
        default: return '—';
    }
}

function modelProp(model) {
    return { ...model, model: true };
}

function eventType(event) {
    return event.parameters.length
        ? event.parameters.map((parameter) => `${parameter.rest ? '...' : ''}${parameter.name}${parameter.optional ? '?' : ''}: ${parameter.type}`).join(', ')
        : '—';
}

function eventDescription(event, previous, contract) {
    if (['UItem', 'UChip'].includes(contract.name) && event.name === 'group:selected') return '该项选中状态变化时触发，携带{value:boolean}；不会把初始化渲染当成一次选择事件。';
    if (contract.name === 'UPullToRefresh' && ['load', 'refresh'].includes(event.name)) return '达到下拉阈值并松开时触发，携带幂等done()；load与保留的refresh共享同一次请求，reset后旧回调无效。';
    if (contract.name === 'UImg' && ['load', 'error'].includes(event.name)) return '默认携带原生DOM Event；standardProtocol=true携带浏览器选定的currentSrc URL字符串。已被替换的图片源事件会被忽略。';
    if (['UImg', 'UParallax'].includes(contract.name) && event.name === 'loadstart') return '图片请求开始时触发，携带当前图片URL。';
    if (contract.name === 'UParallax' && ['load', 'error'].includes(event.name)) return '内置src图片加载成功或失败时触发，携带图片URL；background插槽内自建图片由调用方自行监听。';
    if (contract.name === 'UDataIterator' && event.name === 'update:currentItems') return '默认携带当前原始项；standardProtocol=true携带分页包装行（含分组行），itemsLength手动分页模式不发此标准事件。';
    if (contract.name === 'UInfiniteScroll' && event.name === 'load') return '请求指定side（start/end）的数据，携带done(status)；两侧独立结算，reset后的旧回调被忽略。';
    const oldDescription = reusableDescription(previous);
    if (oldDescription) return oldDescription;
    const common = commonEvents[event.name];
    if (common) return common;
    if (event.name.startsWith('update:')) return `双向属性 ${event.name.slice('update:'.length)} 更新时触发；参数为最新值。`;
    return `当 ${humanize(event.name)} 发生时触发${event.parameters.length ? `，并携带 ${event.parameters.map(parameter => parameter.name).join('、')} 参数` : ''}。`;
}

function scopeText(slot) {
    const names = (slot.payload || []).filter((entry) => !['<scope>', '<spread>'].includes(entry.name)).map((entry) => entry.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()));
    return names.length ? `作用域提供 { ${[...new Set(names)].join(', ')} }。` : '';
}

function slotDescription(slot, previous, contract) {
    if (['UItemGroup', 'UChipGroup', 'UBtnToggle'].includes(contract?.name) && slot.name === 'default') return 'selected为内部ID数组，isSelected/select按ID操作，selectedValues为公开值；next/prev跳禁用项。保留isValueSelected/toggle按公开值操作。';
    if (contract?.name === 'UConfirmEdit' && slot.name === 'default') return 'model为深克隆草稿Ref；save/cancel提交或重置，isPristine为未修改状态。actions提供按钮渲染函数，消费后不重复渲染默认操作区。open恒为true，begin兼容重置草稿，saving表示本库异步校验。';
    if (contract?.name === 'UItem' && slot.name === 'default') return '提供标准isSelected/selectedClass/value/disabled/select/toggle，以及兼容selected和扩展id；tag=false只渲染本插槽。';
    if (contract?.name === 'UTooltip') {
        const descriptions = { default: '旧默认：触发器；standardProtocol=true时为提示内容，提供可写Ref isActive。', activator: '标准触发器：v-bind props绑定ARIA、指针、键盘和元素ref；isActive为布尔值，targetRef可绑定独立定位目标。', content: '旧协议的自定义提示内容，优先于text；标准协议使用default。' };
        if (descriptions[slot.name]) return descriptions[slot.name];
    }
    if (contract?.name === 'UDataIterator' && ['default', 'header', 'footer'].includes(slot.name)) return '提供分页、排序、选择、展开和分组操作；items默认原始项，standardProtocol=true为包装项。internalItems始终为包装项，groupedItems为当前页分组行。';
    if (contract?.name === 'UInfiniteScroll' && ['loading', 'empty', 'error', 'load-more'].includes(slot.name)) return '按加载边缘分别渲染，提供side、含onClick/color/disabled的props；error额外retry，load-more额外load兼容入口。';
    if (['UDataTable', 'UDataTableServer', 'UDataTableVirtual'].includes(contract?.name)) {
        const descriptions = {
            top: '表格上方内容；提供完整表格作用域。',
            default: '替换整个 table 内部内容，提供模型、叶列、表头矩阵、原始 items 与 internalItems。',
            headers: '替换默认 thead 内部的表头行；headers 为矩阵，columns 为叶列。',
            'header.*': '自定义列标题；提供 column/header、toggleSort、isSorted、getSortIcon 及选择控制 props。',
            'item.*': '自定义单元格；提供 item（原始项）、internalItem、column、value、index、选择/展开方法；保留列和控制 props。',
            item: '替换完整数据行，返回 tr；v-bind props 保留行属性与事件，虚拟模式还提供 itemRef。',
            'expanded-row': '自定义展开行，标准用法返回 tr/td；提供 item/internalItem/index/columns。旧正文插槽继续自动包裹。',
            'group-header': '自定义完整分组行，提供 item/group、index、columns、isGroupOpen、toggleGroup 与兼容 toggle。',
            'group-header.data-table-group': '自定义分组标题单元格内容，提供 item、count 和包含 icon/onClick 的 props。',
            'group-header.data-table-select': '自定义分组选择控件，props 提供 modelValue/indeterminate/disabled/onUpdate:modelValue。',
            'group-summary': '自定义分组结束后的汇总行；返回 tr/td，extractRows 递归提取分组内 InternalDataItem。',
            'mobile.header': '替换移动表头，提供排序、选择模型与完整表格作用域。',
            caption: '放置原生 caption；与 table 语义关联。',
            colgroup: '放置原生 colgroup 控制列宽。',
            thead: '在自动表头后追加独立 thead；hide-default-header 可关闭自动部分。',
            tbody: '追加独立 tbody；hide-default-body 可关闭自动部分。',
            tfoot: '放置原生 tfoot；fixed-footer 保留在滚动区域底部。',
            body: '替换默认 tbody 内部内容；提供完整作用域。',
            'body.prepend': '在默认数据行前插入 tr/td，提供完整作用域。',
            'body.append': '在默认数据行后插入 tr/td，提供完整作用域。',
            bottom: '替换整个默认页脚；提供页码、数量、计数与 setPage/setItemsPerPage/nextPage/prevPage。',
            footer: '兼容的分页栏替换入口，优先使用标准 bottom。',
            'footer.prepend': '在默认页脚数量控件前追加内容，提供完整作用域。',
            loader: '替换表头加载进度条；loading 状态提供完整表格作用域。'
        };
        const name = slot.pattern ?? slot.name;
        if (descriptions[name]) return descriptions[name];
    }
    if (contract?.name === 'UListItem' && slot.name === 'append') return '自定义右侧内容，优先替换appendText和appendIcon；独立交互控件不触发父行选择或涟漪。';
    if (contract?.name === 'UToolbar') {
        const descriptions = { title: '自定义内置标题，优先于title属性；长文本自动省略。', prepend: '内容区前置操作，如菜单按钮。', actions: '直接放入操作按钮，自动进入内置右侧操作区；默认text，无需额外ToolbarItems。', append: '兼容的后置操作插槽；存在actions时优先使用actions。', extension: '内容区下方的扩展行；默认存在插槽时显示，可由extended控制。', image: '自定义背景图片层，作用域image提供image属性。', default: '内容区中标题与操作之间的自定义内容。' };
        if (descriptions[slot.name]) return descriptions[slot.name];
    }
    const oldDescription = reusableDescription(previous);
    if (oldDescription) return oldDescription;
    const name = slot.name === '<dynamic>' ? slot.pattern : slot.name;
    let base = commonSlots[name];
    if (!base && name.startsWith('header.')) base = commonSlots['header.*'];
    if (!base && name.startsWith('item.')) base = commonSlots['item.*'];
    if (!base) base = `${name === 'default' ? '提供组件主要内容' : `自定义 ${humanize(name)} 区域`}。`;
    const scope = scopeText(slot);
    return scope && !base.includes(scope) ? `${base} ${scope}` : base;
}

function methodType(member, previous) {
    if (previous?.type?.trim()) return previous.type;
    return member.kind === 'method' ? 'function' : 'exposed property';
}

function methodDescription(contract, member, previous) {
    if (['UItemGroup', 'UChipGroup', 'UBtnToggle'].includes(contract.name)) {
        const descriptions = { selected: '读取当前选中项的内部ID数组，随子组实时更新。', selectedValues: '读取当前选中项的公开值数组，随子组实时更新。', isSelected: '按内部ID判断当前条目是否选中。', select: '按内部ID设置选中状态，第二参数可指定选中或取消。', next: '选择后一可用项，遵守组禁用、只读和选择约束。', prev: '选择前一可用项，遵守组禁用、只读和选择约束。' };
        if (descriptions[member.name]) return descriptions[member.name];
    }
    if (contract.name === 'UItem' && member.name === 'select') return '设置当前条目的选中状态；省略参数时选中，false取消。';
    if (contract.name === 'UConfirmEdit') {
        const descriptions = { begin: '兼容方法：将始终可见的草稿重置为最新模型，不控制展开。', save: '校验并提交深克隆草稿，发出save事件；更新后的父模型使旧校验结果失效。', cancel: '将草稿深克隆重置到当前模型，发出cancel事件。', isPristine: '读取草稿是否与当前模型深度相等。' };
        if (descriptions[member.name]) return descriptions[member.name];
    }
    const oldDescription = reusableDescription(previous);
    if (oldDescription) return oldDescription;
    return commonMethods[member.name] || `${member.kind === 'method' ? '调用' : '读取'} ${member.name}，访问 ${member.expression} 对应的 ${contract.name} 成员。`;
}

function buildComponentApi(contract) {
    const prior = priorRecordFor(contract);
    const oldProps = byName(prior.props);
    const oldEvents = byName(prior.events);
    const oldSlots = byName(prior.slots);
    const oldMethods = byName(prior.methods);
    const props = [...contract.props, ...contract.models.map(modelProp)].map((prop) => ({
        name: prop.name,
        type: prop.type,
        fallback: fallbackFor(prop),
        description: propDescription(contract, prop, oldProps.get(prop.name)),
        declaredDefault: prop.default,
        required: prop.required,
    }));
    const events = contract.emits.map((event) => ({
        name: event.name,
        type: eventType(event),
        fallback: '—',
        description: eventDescription(event, oldEvents.get(event.name), contract),
    }));
    const slots = contract.slots.map((slot) => ({
        name: slot.name === '<dynamic>' ? slot.pattern : slot.name,
        type: slot.payload?.length ? `{ ${slot.payload.filter((entry) => !['<scope>', '<spread>'].includes(entry.name)).map((entry) => entry.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())).join(', ')} }` : '—',
        fallback: slot.hasFallback ? '有默认内容' : '—',
        description: slotDescription(slot, oldSlots.get(slot.name === '<dynamic>' ? slot.pattern : slot.name), contract),
    }));
    const methods = contract.expose.map((member) => {
        const previous = oldMethods.get(member.name);
        return {
            name: member.name,
            type: methodType(member, previous),
            kind: member.kind,
            expression: member.expression,
            description: methodDescription(contract, member, previous),
        };
    });
    return { props, events, slots, methods, attributes: prior.attributes || [] };
}

function sorted(values) { return [...values].sort((left, right) => left.localeCompare(right)); }

function validateGenerated(api) {
    const names = Object.keys(api);
    if (new Set(names).size !== names.length) throw new Error('Duplicate component names in generated API table');
    const expected = new Map(canonical.map((contract) => [contract.name, contract]));
    if (names.length !== expected.size || names.some((name) => !expected.has(name))) throw new Error('Generated component set does not match canonical exports');
    for (const [name, contract] of expected) {
        const rows = api[name];
        for (const [kind, entries] of Object.entries(rows)) {
            const memberNames = entries.map((entry) => entry.name);
            if (new Set(memberNames).size !== memberNames.length) throw new Error(`${name}.${kind} contains duplicate rows`);
        }
        const actualProps = rows.props.map((entry) => entry.name);
        const expectedProps = [...contract.props, ...contract.models].map((entry) => entry.name);
        if (JSON.stringify(sorted(actualProps)) !== JSON.stringify(sorted(expectedProps))) throw new Error(`${name} generated props do not match source contracts`);
        if (JSON.stringify(sorted(rows.events.map((entry) => entry.name))) !== JSON.stringify(sorted(contract.emits.map((entry) => entry.name)))) throw new Error(`${name} generated events do not match source contracts`);
        if (JSON.stringify(sorted(rows.slots.map((entry) => entry.name))) !== JSON.stringify(sorted(contract.slots.map((slot) => slot.name === '<dynamic>' ? slot.pattern : slot.name)))) throw new Error(`${name} generated slots do not match source contracts`);
        if (JSON.stringify(sorted(rows.methods.map((entry) => entry.name))) !== JSON.stringify(sorted(contract.expose.map((entry) => entry.name)))) throw new Error(`${name} generated exposes do not match source contracts`);
        for (const row of [...rows.props, ...rows.events, ...rows.slots, ...rows.methods]) {
            if (!row.description?.trim() || row.description.trim() === '配置属性') throw new Error(`${name}.${row.name} is missing a concrete description`);
        }
    }
    const json = JSON.stringify(api, null, 4);
    if (!json || JSON.stringify(JSON.parse(json), null, 4) !== json) throw new Error('Generated API did not round-trip as complete JSON');
    return json;
}

const componentApi = Object.fromEntries(canonical.map((contract) => [contract.name, buildComponentApi(contract)]));
const json = validateGenerated(componentApi);
mkdirSync(path.dirname(output), { recursive: true });
const isJson = path.extname(output).toLowerCase() === '.json';
const contents = isJson ? `${json}\n` : `// Canonical public component contracts generated from current Vue source.\nexport const componentApi = ${json};\n`;
writeFileSync(output, contents, 'utf8');
console.log(`Wrote ${canonical.length} canonical component contracts to ${path.relative(root, output).replaceAll('\\', '/')}`);
console.log(`Validated ${canonical.reduce((sum, contract) => sum + contract.props.length + contract.models.length, 0)} props/models, ${canonical.reduce((sum, contract) => sum + contract.emits.length, 0)} events, ${canonical.reduce((sum, contract) => sum + contract.slots.length, 0)} slots, and ${canonical.reduce((sum, contract) => sum + contract.expose.length, 0)} exposed members.`);

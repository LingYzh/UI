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
    firstDayOfWeek: '设置日历一周的起始日；0 表示星期日。',
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
    speed: '设置视差或动画跟随滚动的速度系数。',
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
    icon: '指定使用的图标名称。',
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

function eventDescription(event, previous) {
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

function slotDescription(slot, previous) {
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
        description: eventDescription(event, oldEvents.get(event.name)),
    }));
    const slots = contract.slots.map((slot) => ({
        name: slot.name === '<dynamic>' ? slot.pattern : slot.name,
        type: slot.payload?.length ? `{ ${slot.payload.filter((entry) => !['<scope>', '<spread>'].includes(entry.name)).map((entry) => entry.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())).join(', ')} }` : '—',
        fallback: slot.hasFallback ? '有默认内容' : '—',
        description: slotDescription(slot, oldSlots.get(slot.name === '<dynamic>' ? slot.pattern : slot.name)),
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

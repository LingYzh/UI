import { readonly, ref } from 'vue';

/** 组件库内置文案语言。默认 zh，保持 UAH 现有中文界面不变。 */
export type UiLocale = 'zh' | 'en';

type Params = Record<string, string | number>;

// zh 是键集合的基准：en 必须提供完全相同的键（由 UiMessages 类型约束，tests/locale.test.ts 双向校验）。
const zh = {
    'tabs.previous': '向前滚动标签页',
    'tabs.next': '向后滚动标签页',
    'cascader.placeholder': '请选择',
    'cascader.clear': '清除选择',
    'cascader.required': '请选择完整路径。',
    'cascader.invalid': '所选路径已失效，请重新选择。',
    'cascader.level': '第 {level} 级选项',
    'cascader.branch': '含下级选项',

    'form.invalid': '请检查此项内容。',
    'form.validationFailed': '验证暂时失败，请重试。',
    'common.close': '关闭',
    'common.cancel': '取消',
    'common.confirm': '确定',
    'common.retry': '重试',
    'common.loading': '正在加载…',
    'common.empty': '暂无数据',
    'common.options': '可选项',
    'common.autoWrap': '自动换行',
    'common.copied': '已复制',
    'dialog.contentLabel': '弹窗内容',
    'confirm.title': '请确认',
    'snackbar.close': '关闭通知',
    'badge.remove': '移除',
    'copy.label': '复制',
    'swatch.label': '颜色',
    'swatch.current': '当前颜色',
    'swatch.red': '红色',
    'swatch.orange': '橙色',
    'swatch.yellow': '黄色',
    'swatch.green': '绿色',
    'swatch.teal': '青色',
    'swatch.blue': '蓝色',
    'swatch.indigo': '靛蓝',
    'swatch.purple': '紫色',
    'swatch.pink': '粉色',
    'swatch.gray': '灰色',
    'pagination.label': '分页',
    'pagination.previous': '上一页',
    'pagination.next': '下一页',
    'pagination.page': '第 {page} 页',
    'table.scrollArea': '{label}滚动区域',
    'table.sort': '{title}排序',
    'table.pagination': '{label}分页',
    'table.perPage': '每页',
    'table.range': '{start}–{end} / {total} 条',
    'table.rangeEmpty': '0 条',
    'table.perPageOption': '{count} 条',
    'code.content': '源码内容',
    'code.unwrap': '取消换行',
    'code.copy': '复制源码',
    'code.copySuccess': '源码已复制。',
    'code.copyBlocked': '浏览器未允许剪贴板访问，请选中源码手动复制。',
    'diff.defaultPath': '文件变更',
    'diff.proposed': '待执行的修改',
    'diff.created': '已新建',
    'diff.deleted': '已删除',
    'diff.history': '历史修改',
    'diff.pendingShort': '待执行',
    'diff.snapshot': '保存的快照',
    'diff.inspect': '在右栏查看',
    'diff.counts': '变更行数',
    'diff.changesOnly': '仅显示变更',
    'diff.showContext': '显示上下文',
    'diff.wrapOff': '关闭换行',
    'diff.copyBefore': '复制原内容',
    'diff.copyAfter': '复制新内容',
    'diff.copySuccess': '内容已复制。',
    'diff.copyFailed': '复制失败，请手动选择内容。',
    'diff.omitted': '此变更过大或计算复杂，未生成逐行预览。可复制完整快照查看。',
    'diff.unchanged': '内容没有变化。',
    'diff.linesLabel': '{path} 逐行差异',
    'diff.tableLabel': '旧行号、新行号与变更内容',
    'diff.noNewline': '⏎ 文件末尾无换行',
    'diff.truncated': '仅展示前 {count} 行差异预览。统计包含完整变更，可复制完整快照查看。',
    'diff.gap': '省略 {count} 行未改动内容',
    'files.count': '{count} 个文件',
    'files.viewAll': '查看全部',
    'files.statsUnavailable': '统计不可用',
    'files.stats': '增加 {added} 行，删除 {removed} 行',
    'files.empty': '本轮无文件改动',
    'markdown.table': 'Markdown 表格',
    'markdown.math': '数学公式',
    'markdown.diagram': 'Mermaid 图表',
    'usage.label': '用量',
    'usage.composition': '分类构成',
    'usage.unknown': '未统计',
    'usage.capacityUnknown': '容量未知',
    'usage.estimated': '本地估算',
    'usage.estimatedShort': '估算',
    'usage.known': '已知用量',
    'usage.knownCategories': '已知分类',
    'usage.approx': '约 ',
    'usage.inspect': '查看详情',
    'usage.accessible': '{label}：{status}{estimated}，{inspect}',
    'usage.estimatedSuffix': '，本地估算',
    'usage.over': '已超过容量',
    'usage.total': '合计 {total}',
    'usage.partial': '（部分未统计）',
    'usage.note': '分类按已知分类合计绘制，与上方用量独立展示。'
} as const;

export type UiMessageKey = keyof typeof zh;
type UiMessages = Record<UiMessageKey, string>;

const en: UiMessages = {
    'tabs.previous': 'Scroll tabs backward',
    'tabs.next': 'Scroll tabs forward',
    'cascader.placeholder': 'Select an option',
    'cascader.clear': 'Clear selection',
    'cascader.required': 'Select a complete path.',
    'cascader.invalid': 'This path is no longer available. Select again.',
    'cascader.level': 'Level {level} options',
    'cascader.branch': 'has child options',

    'form.invalid': 'Please check this field.',
    'form.validationFailed': 'Validation failed. Please try again.',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.confirm': 'OK',
    'common.retry': 'Retry',
    'common.loading': 'Loading…',
    'common.empty': 'No data',
    'common.options': 'Options',
    'common.autoWrap': 'Wrap lines',
    'common.copied': 'Copied',
    'dialog.contentLabel': 'Dialog content',
    'confirm.title': 'Please confirm',
    'snackbar.close': 'Dismiss notification',
    'badge.remove': 'Remove',
    'copy.label': 'Copy',
    'swatch.label': 'Color',
    'swatch.current': 'Current color',
    'swatch.red': 'Red',
    'swatch.orange': 'Orange',
    'swatch.yellow': 'Yellow',
    'swatch.green': 'Green',
    'swatch.teal': 'Teal',
    'swatch.blue': 'Blue',
    'swatch.indigo': 'Indigo',
    'swatch.purple': 'Purple',
    'swatch.pink': 'Pink',
    'swatch.gray': 'Gray',
    'pagination.label': 'Pagination',
    'pagination.previous': 'Previous page',
    'pagination.next': 'Next page',
    'pagination.page': 'Page {page}',
    'table.scrollArea': '{label} scroll area',
    'table.sort': 'Sort by {title}',
    'table.pagination': '{label} pagination',
    'table.perPage': 'Per page',
    'table.range': '{start}–{end} of {total}',
    'table.rangeEmpty': '0 items',
    'table.perPageOption': '{count}',
    'code.content': 'Source code',
    'code.unwrap': 'No wrap',
    'code.copy': 'Copy code',
    'code.copySuccess': 'Code copied.',
    'code.copyBlocked': 'Clipboard access was blocked. Select the code and copy it manually.',
    'diff.defaultPath': 'File change',
    'diff.proposed': 'Pending change',
    'diff.created': 'Created',
    'diff.deleted': 'Deleted',
    'diff.history': 'Past change',
    'diff.pendingShort': 'pending',
    'diff.snapshot': 'saved snapshot',
    'diff.inspect': 'Open in side panel',
    'diff.counts': 'Changed lines',
    'diff.changesOnly': 'Changes only',
    'diff.showContext': 'Show context',
    'diff.wrapOff': 'No wrap',
    'diff.copyBefore': 'Copy original',
    'diff.copyAfter': 'Copy new',
    'diff.copySuccess': 'Content copied.',
    'diff.copyFailed': 'Copy failed. Select the content manually.',
    'diff.omitted': 'This change is too large or complex to preview line by line. Copy the full snapshot to review it.',
    'diff.unchanged': 'No changes.',
    'diff.linesLabel': '{path} line diff',
    'diff.tableLabel': 'Old line, new line and change',
    'diff.noNewline': '⏎ No newline at end of file',
    'diff.truncated': 'Showing the first {count} diff lines. Totals include the full change; copy the snapshot to see everything.',
    'diff.gap': '{count} unchanged lines hidden',
    'files.count': '{count} files',
    'files.viewAll': 'View all',
    'files.statsUnavailable': 'Stats unavailable',
    'files.stats': '{added} lines added, {removed} lines removed',
    'files.empty': 'No file changes in this turn',
    'markdown.table': 'Markdown table',
    'markdown.math': 'Math formula',
    'markdown.diagram': 'Mermaid diagram',
    'usage.label': 'Usage',
    'usage.composition': 'Breakdown',
    'usage.unknown': 'Not tracked',
    'usage.capacityUnknown': 'Capacity unknown',
    'usage.estimated': 'Local estimate',
    'usage.estimatedShort': 'est.',
    'usage.known': 'Reported usage',
    'usage.knownCategories': 'Known categories',
    'usage.approx': '~',
    'usage.inspect': 'view details',
    'usage.accessible': '{label}: {status}{estimated}, {inspect}',
    'usage.estimatedSuffix': ', local estimate',
    'usage.over': 'Over capacity',
    'usage.total': 'Total {total}',
    'usage.partial': ' (partially tracked)',
    'usage.note': 'Categories are drawn from their own known total, independent of the usage above.'
};

export const uiMessages: Record<UiLocale, UiMessages> = { zh, en };

const current = ref<UiLocale>('zh');
/** 当前语言（只读 ref），组件在渲染中读取即可随切换自动更新。 */
export const uiLocale = readonly(current);

/** 切换全部组件的内置文案；未知值回退为 zh。 */
export function setLocale(locale: UiLocale) {
    current.value = locale === 'en' ? 'en' : 'zh';
}

export function getLocale(): UiLocale {
    return current.value;
}

/** 数字格式随语言切换，供用量等组件复用。 */
export function uiNumberLocale(): string {
    return current.value === 'en' ? 'en-US' : 'zh-CN';
}

/**
 * 取当前语言文案并替换 {name} 占位符。
 * 在模板或 computed 中调用时会追踪 uiLocale，因此语言切换后自动重渲染。
 */
export function uiText(key: UiMessageKey, params?: Params): string {
    const template = uiMessages[current.value][key];
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

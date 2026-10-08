import type { CSSProperties } from 'vue';
import type { RippleOptions } from './ripple';
import type { DataHeader, DataItem, DataGroup, DataOptions, ItemProperty, FilterFunction, InternalDataItem, DataGroupNode, DataRow, NormalizedHeader } from './data-pipeline';
import type { TableSort } from './table';

export interface TableSurfaceProps {
    label?: string;
    height?: number | string;
    fixedHeader?: boolean;
    /** 固定 tfoot，在滚动时保留汇总行。 */
    fixedFooter?: boolean;
    /** 水平、垂直、全部网格线；false 不显示网格线。 */
    gridlines?: boolean | 'horizontal' | 'vertical' | 'all';
    /** 启用行悬停反馈。 */
    hover?: boolean;
    /** 按奇数或偶数行显示交替底色。 */
    striped?: 'odd' | 'even';
    density?: 'default' | 'comfortable' | 'compact' | null;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
    tag?: string;
    theme?: string;
    ripple?: RippleOptions;
}

export interface SelectionStrategy {
    showSelectAll: boolean;
    allSelected: (context: { allItems: InternalDataItem[]; currentPage: InternalDataItem[] }) => InternalDataItem[];
    select: (context: { items: InternalDataItem[]; value: boolean; selected: Set<unknown> }) => Set<unknown>;
    selectAll: (context: { allItems: InternalDataItem[]; currentPage: InternalDataItem[]; value: boolean; selected: Set<unknown> }) => Set<unknown>;
}
export type RowContext = { item: DataItem; internalItem: InternalDataItem; index: number };
export type GroupContext = { item: DataGroupNode; index: number; columns: DataHeader[] };
export type CellContext = RowContext & { value: unknown; column: DataHeader };
export type TableAttributes = Record<string, unknown> & { style?: CSSProperties | string };

export type DataTableProps = TableSurfaceProps & {
    headers?: readonly DataHeader[];
    items?: readonly DataItem[];
    itemTitle?: ItemProperty;
    itemValue?: ItemProperty;
    /** 字段路径、路径数组或函数，返回 false 的行不可选择。 */
    itemSelectable?: ItemProperty;
    rowProps?: TableAttributes | ((context: RowContext) => TableAttributes);
    cellProps?: TableAttributes | ((context: CellContext) => TableAttributes);
    headerProps?: TableAttributes;
    search?: string;
    customFilter?: FilterFunction;
    /** 为指定列设置过滤函数，与 header.filter 合并。 */
    customKeyFilter?: Record<string, FilterFunction>;
    /** 限制参与搜索的列 key；支持字符串或数组。 */
    filterKeys?: string | readonly string[];
    /** intersection 要求自定义列均匹配；union 允许默认列或自定义列组匹配；every 要求所有列匹配。 */
    filterMode?: 'some' | 'every' | 'union' | 'intersection';
    /** true 忽略两侧重音；target/query 只折叠原文/查询，并保留完全相同的匹配。 */
    ignoreAccents?: boolean | string;
    /** 保留所有输入项，跳过本地过滤。 */
    noFilter?: boolean;
    showSelect?: boolean;
    selectStrategy?: 'single' | 'page' | 'all' | SelectionStrategy;
    valueComparator?: (a: unknown, b: unknown) => boolean;
    returnObject?: boolean;
    showExpand?: boolean;
    /** 点击数据行切换展开；控件点击不触发行操作。 */
    expandOnClick?: boolean;
    /** single 同时只展开一行，multiple 可展开多行。 */
    expandStrategy?: 'single' | 'multiple';
    /** false 关闭展开动画；对象可指定本库的过渡组件和属性。 */
    expandTransition?: false | { component?: unknown; [key: string]: unknown };
    multiSort?: boolean | { key?: 'ctrl'; mode?: 'append' | 'prepend'; modifier?: 'alt' | 'shift' };
    /** 保留至少一个已点击的排序条件。 */
    mustSort?: boolean;
    /** 禁用本地排序与表头排序操作。 */
    disableSort?: boolean;
    /** 首次点击列时的排序方向。 */
    initialSortOrder?: 'asc' | 'desc';
    /** 按列 key 自定义比较函数；返回 null 跳过该列，继续比较后续排序列。 */
    customKeySort?: Record<string, (a: unknown, b: unknown) => number | null>;
    /** 首次出现的分组自动展开；仍允许用户收起。 */
    openAll?: boolean;
    /** 自定义稳定分组 ID，父分组根节点的 parentKey 为 null。 */
    groupKey?: (context: { key: string; value: unknown; parentKey: string | null }) => string;
    loading?: boolean | string | { color?: string; side?: 'start' | 'end' | 'both' };
    loadingText?: string;
    noDataText?: string;
    /** 隐藏空数据提示行。 */
    hideNoData?: boolean;
    error?: string;
    disabled?: boolean;
    hideDefaultFooter?: boolean;
    /** 隐藏自动表头，仍可通过 thead 插槽补充。 */
    hideDefaultHeader?: boolean;
    /** 隐藏自动 tbody，仍可通过 tbody 插槽补充。 */
    hideDefaultBody?: boolean;
    /** 表格最小宽度，横向滚动时保留列宽。 */
    width?: number | string;
    /** fixedHeader 的兼容别名。 */
    sticky?: boolean;
    mobile?: boolean | null;
    mobileBreakpoint?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    color?: string;
    sortIcon?: string;
    sortAscIcon?: string;
    sortDescIcon?: string;
    expandIcon?: string;
    collapseIcon?: string;
    groupExpandIcon?: string;
    groupCollapseIcon?: string;
    selectAllLabel?: string;
    /** 选择行控件的无障碍名称，{0} 替换为行标题。 */
    selectRowLabel?: string;
    /** 外部提供单元格搜索匹配区间；默认使用内置过滤结果。 */
    getMatches?: (item: InternalDataItem) => Record<string, unknown> | undefined;
}
export interface TablePaginationProps {
    /** auto 有分组时按根分组分页；item 按数据项；group 按根分组；any 按可见行。 */
    pageBy?: 'auto' | 'item' | 'group' | 'any';
    itemsPerPageOptions?: readonly (number | { value: number; title: string })[];
    itemsPerPageText?: string;
    /** {0}、{1}、{2} 分别为起始、结束、总数。 */
    pageText?: string;
    /** 在页脚显示当前页码与总页数。 */
    showCurrentPage?: boolean;
    /** 在页脚显示首尾页操作。 */
    showFirstLastPage?: boolean;
    firstIcon?: string;
    lastIcon?: string;
    prevIcon?: string;
    nextIcon?: string;
    firstPageLabel?: string;
    lastPageLabel?: string;
    prevPageLabel?: string;
    nextPageLabel?: string;
}
export interface TableVirtualProps {
    itemHeight?: number | string;
    /** 虚拟行缓存使用的稳定键，可独立于选择模型的 itemValue。 */
    itemKey?: ItemProperty;
    overscan?: number;
}
export interface TableModels {
    page: number | string;
    itemsPerPage: number | string;
    sortBy: TableSort[];
    groupBy: DataGroup[];
    modelValue: unknown[];
    expanded: unknown[];
    opened: string[];
}
export type DataTableEventMap = {
    'update:options': [options: DataOptions];
    'update:currentItems': [items: DataRow[]];
    'click:row': [event: MouseEvent, context: RowContext];
    'dblclick:row': [event: MouseEvent, context: RowContext];
    'contextmenu:row': [event: MouseEvent, context: RowContext];
    'click:groupHeader': [event: MouseEvent, context: GroupContext];
    'dblclick:groupHeader': [event: MouseEvent, context: GroupContext];
    'contextmenu:groupHeader': [event: MouseEvent, context: GroupContext];
    retry: [];
};
export type TableGroup = DataGroupNode;

/** 标准插槽中的 item 保留原始数据，internalItem 承载选择值、映射列与稳定索引。 */
export interface TableSlotScope {
    page: number;
    itemsPerPage: number;
    itemsLength: number;
    pageCount: number;
    sortBy: TableSort[];
    groupBy: DataGroup[];
    allSelected: boolean;
    someSelected: boolean;
    items: DataItem[];
    internalItems: InternalDataItem[];
    groupedItems: DataRow[];
    columns: NormalizedHeader[];
    headers: NormalizedHeader[][];
    toggleSort: (column: string | { key?: string }, event?: MouseEvent, mandatory?: boolean) => void;
    isSorted: (column: { key?: string }) => boolean;
    getSortIcon: (column: { key?: string }) => string;
    setPage: (page: number) => void;
    setItemsPerPage: (size: number) => void;
    prevPage: () => void;
    nextPage: () => void;
    isSelected: (items: InternalDataItem | readonly InternalDataItem[]) => boolean;
    isSomeSelected: (items: InternalDataItem | readonly InternalDataItem[]) => boolean;
    select: (items: readonly InternalDataItem[], value: boolean) => void;
    selectAll: (value: boolean) => void;
    toggleSelect: (item: InternalDataItem, index?: number, event?: MouseEvent) => void;
    isExpanded: (item: InternalDataItem) => boolean;
    expand: (item: InternalDataItem, value: boolean) => void;
    toggleExpand: (item: InternalDataItem) => void;
    isGroupOpen: (item: DataGroupNode) => boolean;
    toggleGroup: (item: DataGroupNode) => void;
    extractRows: (items: readonly DataRow[]) => InternalDataItem[];
}
export type TableHeaderSlot = TableSlotScope & { header: NormalizedHeader; column: NormalizedHeader; props: Record<string, unknown> };
export type TableItemSlot = TableSlotScope & RowContext & { value: unknown; props: Record<string, unknown>; itemRef: (element: HTMLElement | null) => void; getMatches: (item: InternalDataItem) => Record<string, unknown> | undefined };
export type TableCellSlot = TableItemSlot & { column: NormalizedHeader };
export type TableGroupSlot = TableSlotScope & { item: Exclude<DataRow, InternalDataItem>; group: Exclude<DataRow, InternalDataItem>; index: number; count: number; props: Record<string, unknown>; toggle: () => void };
export interface DataTableSlots {
    default?: (scope: TableSlotScope) => unknown;
    top?: (scope: TableSlotScope) => unknown;
    bottom?: (scope: TableSlotScope) => unknown;
    wrapper?: (scope: TableSlotScope) => unknown;
    caption?: (scope: TableSlotScope) => unknown;
    colgroup?: (scope: TableSlotScope) => unknown;
    headers?: (scope: TableSlotScope) => unknown;
    'mobile.header'?: (scope: TableSlotScope) => unknown;
    loader?: (scope: TableSlotScope & { color?: string; isActive: boolean }) => unknown;
    thead?: (scope: TableSlotScope) => unknown;
    tbody?: (scope: TableSlotScope) => unknown;
    tfoot?: (scope: TableSlotScope) => unknown;
    body?: (scope: TableSlotScope) => unknown;
    'body.prepend'?: (scope: TableSlotScope) => unknown;
    'body.append'?: (scope: TableSlotScope) => unknown;
    loading?: (scope: TableSlotScope) => unknown;
    'no-data'?: (scope: TableSlotScope) => unknown;
    error?: (scope: { error: string }) => unknown;
    item?: (scope: TableItemSlot) => unknown;
    'expanded-row'?: (scope: TableItemSlot) => unknown;
    expanded?: (scope: TableItemSlot) => unknown;
    'group-header'?: (scope: TableGroupSlot) => unknown;
    'group-summary'?: (scope: TableGroupSlot) => unknown;
    'group-header.data-table-group'?: (scope: TableGroupSlot) => unknown;
    'group-header.data-table-select'?: (scope: TableGroupSlot) => unknown;
    'data-table-group'?: (scope: TableGroupSlot) => unknown;
    'data-table-select'?: (scope: TableGroupSlot) => unknown;
    footer?: (scope: TableSlotScope) => unknown;
    'footer.prepend'?: (scope: TableSlotScope) => unknown;
    [name: `header.${string}`]: ((scope: TableHeaderSlot) => unknown) | undefined;
    [name: `item.${string}`]: ((scope: TableCellSlot) => unknown) | undefined;
}

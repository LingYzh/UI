const row = (name, type, fallback, description) => ({ name, type, fallback, description });
const sample = (id, title, description, code) => ({ id, title, description, code, fullSource: true });
const source = (imports, state, template) => `<script setup>\nimport { ref } from 'vue';\nimport { ${imports} } from '@lingyzh/ui';\n${state}\n<\/script>\n\n<template>\n${template.split('\n').map((line) => `    ${line}`).join('\n')}\n</template>`;
const data = `const headers = [{ key: 'name', title: '项目' }, { key: 'files', title: '文件数', align: 'end' }];
const items = [{ id: 1, name: 'UAH', files: 24 }, { id: 2, name: '文档站', files: 12 }];`;
const appearance = [row('dense / ghost / rounded', 'boolean', 'false / false / true', '紧凑密度、透明表面与圆角控制。')];
const base = [row('headers', 'TableHeader[]', '必填', 'key/title，以及可选 align、width、sortable。'), row('items', 'Record<string, unknown>[]', '必填', '行数据；不会隐式排序或切片。'), row('label', 'string', '必填', '表格的可访问名称。'), row('item-value', 'string', 'id', '唯一行键字段；正式数据应提供稳定的唯一键。'), row('height / fixed-header', 'CSS length / boolean', 'undefined / false', '限制视口高度并固定表头。'), row('loading', 'boolean', 'false', '加载提示与 aria-busy，避免把旧页显示成新页。'), ...appearance];
const slots = [row('item.[key]', '{ item, value, index }', '单元格文本', '按列定制内容。'), row('header.[key]', '{ header }', '列标题', '定制表头内容，保留排序按钮语义。'), row('loading / no-data', '—', '默认提示', '定制加载与空数据状态。')];
const serverCode = source('UiDataTableServer', `const headers = [{ key: 'name', title: '项目', sortable: true }];
const items = ref([]);
const total = ref(0);
const loading = ref(true);
const error = ref('');
const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref([]);
let controller;
let lastOptions;
async function load(options = lastOptions) {
    lastOptions = options;
    controller?.abort();
    const current = new AbortController();
    controller = current;
    loading.value = true;
    error.value = '';
    try {
        // 替换为项目 API 模块；服务端返回当前页 items 和总数 total。
        const query = new URLSearchParams({ page: String(options.page), limit: String(options.itemsPerPage), sort: JSON.stringify(options.sortBy) });
        const response = await fetch('/api/projects?' + query, { signal: current.signal });
        if (!response.ok) throw new Error('请求失败');
        const result = await response.json();
        if (current !== controller || current.signal.aborted) return;
        items.value = result.items;
        total.value = result.total;
    } catch (cause) {
        if (current === controller && !current.signal.aborted) error.value = '加载失败，请重试。';
    } finally {
        if (current === controller && !current.signal.aborted) loading.value = false;
    }
}
onBeforeUnmount(() => controller?.abort());`, '<UiDataTableServer v-model:page="page" v-model:items-per-page="itemsPerPage" v-model:sort-by="sortBy" :headers="headers" :items="items" :items-length="total" :loading="loading" :error="error" label="项目" @update:options="load" @retry="load()" />').replace("import { ref }", "import { ref, onBeforeUnmount }");
function variantCode(tag, state, attrs, body = '') {
    return source(tag, state, ['', 'dense', 'ghost', ':rounded="false"'].map((variant) => `<${tag} ${attrs} ${variant}>${body}</${tag}>`).join('\n'));
}
export const tablePages = [
    { id: 'table', title: '表格', name: 'UiTable', group: '内容组件', kind: 'component', description: '原生表格语义、共享滚动区域与可定制单元格。文档各页的 API 表格也使用此组件。', examples: [
        sample('table-basic', '列与单元格', '通过 headers 和 items 渲染；具名单元格插槽用于状态、代码或操作。', source('UiTable', data, '<UiTable :headers="headers" :items="items" label="项目概览"><template #item.name="{ value }"><strong>{{ value }}</strong></template></UiTable>')),
        sample('table-fixed', '固定表头', '内容在限制高度内滚动，列标题保持可见。', source('UiTable', data, '<UiTable :headers="headers" :items="items" label="项目" height="220px" fixed-header dense />')),
        sample('table-variants', '表格样式变体', '默认、dense、ghost 与直角的真实组件对照。', variantCode('UiTable', data, ':headers="headers" :items="items" label="项目"'))
    ], props: [...base, row('sort-by', 'TableSort[]', '[]', '受控排序指示；基础表格只发事件，不修改数据。'), row('empty-text', 'string', '暂无数据', '空数据文案。')], events: [row('sort', 'key: string', '—', '点击可排序表头。')], slots, notes: ['使用稳定 item-value，避免排序后行状态错位。', '基础表格不包含分页；远程分页与排序使用 UiDataTableServer。', '宽表在内部横向滚动，保留父级纵向滚动。'] },
    { id: 'data-table-server', title: '服务端表格', name: 'UiDataTableServer', group: '内容组件', kind: 'component', description: '调用方负责数据请求，表格负责排序参数、加载状态及可组合的分页页脚。', examples: [
        sample('table-server', '远程分页与排序', '本地模拟服务端请求，可查询、排序、翻页及模拟失败重试。源码提供真实 API 接入方式。', serverCode),
        sample('server-variants', '服务端表格样式变体', '页脚、每页选择器与分页器跟随表格的密度和表面。', variantCode('UiDataTableServer', data, ':headers="headers" :items="items" :items-length="items.length" label="项目"'))
    ], props: [...base, row('items-length', 'number', '必填', '服务端总记录数，不是当前页长度。'), row('v-model:page', 'number', '1', '当前页，从 1 开始；总数收缩时校正越界页。'), row('v-model:items-per-page', 'number', '10', '每页条数。'), row('v-model:sort-by', 'TableSort[]', '[]', '单列排序：升序 → 降序 → 无排序。'), row('items-per-page-options', 'number[]', '[10,25,50]', '仅接受正整数；保留当前选项。'), row('error', 'string', 'undefined', '失败时展示错误与重试操作。')], events: [row('update:options', '{ page, itemsPerPage, sortBy }', '—', '初始化及参数变化时发出；修改每页条数或点击排序会回第一页。'), row('update:page / update:itemsPerPage / update:sortBy', '对应模型值', '—', '双向模型更新。'), row('retry', '—', '—', '请求调用方重试。')], slots: [...slots, row('error', '{ error }', '错误与重试按钮', '定制失败状态。')], notes: ['组件不请求网络，不对当前页数据二次分页或排序。', 'loading 期间锁定排序与分页，查询入口仍由调用方管理。', '调用方负责请求取消或序号校验，防止过期响应覆盖新结果；组件卸载时清理请求。', '支持单列排序，不提供行选择、分组或虚拟滚动；不宣称兼容 Vuetify 全量 API。'] },
    { id: 'pagination', title: '分页器', name: 'UiPagination', group: '导航组件', kind: 'component', description: '可独立使用的页码导航，具备首尾页、省略号、边界禁用和当前页语义。', examples: [
        sample('pagination-basic', '页码与边界', '跳到中段查看省略号；总页数收缩时自动校正当前页。支持原生 Tab 与 Enter/Space 操作。', source('UiPagination', 'const page = ref(1);', '<UiPagination v-model="page" :length="24" :total-visible="5" label="项目分页" />')),
        sample('pagination-variants', '分页器样式变体', '默认、dense、ghost 和直角；选中页始终保留明确强调。', variantCode('UiPagination', '', ':length="6"'))
    ], props: [row('v-model', 'number', '1', '当前页，越界会更新为有效页。'), row('length', 'number', '必填', '总页数；空集合按一个不可后翻的页展示。'), row('total-visible', 'number', '5', '连续页码窗口，范围 3–9；首尾页与省略号另计。'), row('disabled', 'boolean', 'false', '禁用所有翻页操作。'), row('label', 'string', '分页', '导航区域可访问名称。'), ...appearance], events: [row('update:modelValue', 'number', '—', '用户翻页或校正越界页。')], slots: [], notes: ['空数据的调用方应同时传 disabled，服务端表格已自动处理。', '窄容器允许控件换行，不产生页面水平溢出。'] }
];

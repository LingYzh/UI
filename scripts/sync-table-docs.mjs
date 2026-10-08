import { readFile, writeFile } from 'node:fs/promises';
import { completionPages } from '../src/ui/docs/completionContent.js';
import { formatDemoSource } from './demo-source-format.mjs';

const definitions = [
    ['UTable', 'layout', '原生结构、密度与固定汇总', '原生 caption/thead/tbody/tfoot，top/bottom 插槽，网格线、交替行和固定表头/页尾。'],
    ['UDataTable', 'columns', '嵌套表头与左右固定列', '列 value 支持路径及函数；固定列、密度、header/item 插槽和行/单元格属性使用真实组件。'],
    ['UDataTable', 'filter-sort', '过滤与排序策略', '搜索高亮、重音、过滤模式、自定义键过滤/排序、初始方向、must-sort、修饰键多列排序。'],
    ['UDataTable', 'selection-expand', '选择策略与受控展开', '单选、当前页、全部数据、不可选项、对象模型、Shift 范围选择与单/多行展开。'],
    ['UDataTable', 'grouping', '嵌套分组、分页与汇总', 'opened/open-all/group-key、三种分页方式、分组选择、标准分组单元格插槽与汇总行。'],
    ['UDataTable', 'slots', '自定义结构与页脚', 'caption/colgroup/body.prepend/item/body/body.append/tfoot/bottom 的真实输出及完整作用域。'],
    ['UDataTableServer', 'server', '完整远程交互与全部分页', '本地模拟服务端查询、排序、分页、全部数据、选择、展开、错误重试与陈旧响应隔离。'],
    ['UDataTableVirtual', 'virtual', '一万行选择、分组与可变高度展开', '实际行高测量、搜索/排序复位、固定列、选择、分组、展开与公开 scrollToIndex。']
];
const examples = {};
for (const [component, file, title, description] of definitions) {
    const url = new URL(`../src/ui/docs/table-examples/${file}.vue`, import.meta.url);
    const original = await readFile(url, 'utf8');
    const source = await formatDemoSource(original);
    if (source !== original) await writeFile(url, source);
    (examples[component] ??= []).push({ id: `table-align-${file}`, title, description, fullSource: true, code: source.replaceAll("from '../../index'", "from '@lingyzh/ui'") });
}
const notes = [
    '稳定表格接口对照 Vuetify 4.2.4；保留 UAH 外观、dense/ghost/rounded/ripple 与原有业务回调。完整盘点见 docs/TABLE-ALIGNMENT-2026-10-08.md。',
    'DataTable 的 headers 可省略自动推导；children 构成嵌套表头，value 可为路径/路径数组/函数。固定列使用数字像素宽度，多个固定列需要明确宽度。',
    '数据表默认按 lg（1145px）自动切换移动布局；mobile=false 保持传统列，mobile=true 强制移动布局，mobile-breakpoint 可覆盖。虚拟表格 height 保留本库外框高度语义。',
    '标准 item/header 插槽同时提供 column/internalItem 与原有 item/header；data-table-group/data-table-select 可返回 td，group-header/expanded-row 可返回完整 tr，旧正文插槽继续兼容。',
    '服务端表格只显示传入数据，不执行本地过滤/排序/二次分页；select-strategy=all 只覆盖已提供的当前页数据，不代表选择整个远程库。',
    '每页数量控件为13px，自适应选项宽度；items-per-page=-1 表示全部，可用数字或 { value, title } 配置选项。',
    'Material 默认主题、Vuetify 内部组件实例和 $vuetify 注入对象不属于本库实现；主题、图标、动画和滚动区域复用本库能力。'
];
await writeFile(new URL('../src/ui/docs/tableAlignmentContent.js', import.meta.url), '// Generated from real table SFC demos.\nexport const tableAlignmentExamples = ' + JSON.stringify(examples, null, 4) + ';\nexport const tableAlignmentNotes = ' + JSON.stringify(notes, null, 4) + ';\n');
for (const name of ['UDataTable', 'UDataTableVirtual']) {
    const slug = name === 'UDataTable' ? 'data-table' : 'data-table-virtual';
    const url = new URL(`../src/ui/docs/component-examples/${slug}.vue`, import.meta.url);
    const source = await formatDemoSource(await readFile(url, 'utf8'));
    await writeFile(url, source);
    const page = completionPages.find(page => page.name === name);
    page.examples[0].code = source.replaceAll("from '../../index'", "from '@lingyzh/ui'");
}
await writeFile(new URL('../src/ui/docs/completionContent.js', import.meta.url), '// Generated from root-authored real demos.\nexport const completionPages = ' + JSON.stringify(completionPages, null, 4) + ';\n');
console.log(`Synced ${definitions.length} table examples and two basic sources.`);

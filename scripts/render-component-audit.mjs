import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const directory = path.resolve('docs/component-audit-2026-10-08');
const inventory = JSON.parse(readFileSync(path.join(directory, 'inventory.json'), 'utf8'));
const validation = JSON.parse(readFileSync(path.join(directory, 'validation.json'), 'utf8'));
if (!validation.complete || validation.reviewed !== inventory.inventory.length) throw new Error('Only render a complete, validated audit.');
const results = [1, 2, 3].flatMap(batch => JSON.parse(readFileSync(path.join(directory, `results-${batch}.json`), 'utf8')).components);
const labels = { gap: '确定存在缺口', partial: '存在差异 / 部分覆盖', 'no-confirmed-gap': '未确认行为缺口', custom: '本库扩展', 'mapping-review': '同名职责不同' };
const methods = { static: '源码对照', 'targeted-runtime': '本轮专项运行', 'existing-evidence-only': '已有专项证据' };
const escape = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const reference = value => {
    const match = /^(.+):(\d+)(?:-\d+)?$/.exec(value);
    if (!match) return value;
    const relative = path.relative(directory, path.resolve(match[1])).replaceAll('\\', '/');
    return `[${value}](${relative}#L${match[2]})`;
};
const lines = [
    '# 全库逐组件深度对齐审计 — 2026-10-08', '',
    `检查全部${validation.total}个canonical U*组件；Ui*兼容别名共用实现，不重复计数。基准为官方Vuetify ${validation.baseline}发布包的类型声明与运行源码；保留本库外观。130项初步上游映射、23项本库扩展或无直接映射，最终映射结论见各行。`, '',
    '此轮为用户要求的逐项检查，未批量修改产品行为、依赖、组件样式或用例。结果区分名称缺口、类型/default/event/slot约定、具体语义与真实用例；源码存在实现路径不等于浏览器实测，未确认缺口不代表完全兼容。', '',
    '外观/本库约定差异也逐项列出，包含尚未实现的上游样式入口；这类属性不计入行为缺口，但不能当作已支持，也不表示用户已批准永久省略。模型、路由、布局尺寸、事件和插槽的契约差异仍须单独查看。Root复核与优先级见[ROOT-REVIEW.md](ROOT-REVIEW.md)。', '',
    `验收层次：${validation.verification.static}项源码对照、${validation.verification['existing-evidence-only']}项采用已有专项证据、${validation.verification['targeted-runtime']}项本轮专项运行。逐项原始结果见results-1/2/3.json，覆盖与行引用检查及当前源码SHA256见validation.json。`, '',
    `结论分布：${Object.entries(validation.classifications).filter(([, count]) => count > 0).map(([status, count]) => `${labels[status]}${count}项`).join('；')}。属性候选共${validation.propertyReview.reviewedCandidates}项，按组件计数，不代表唯一属性或严重程度；全部已分区记录。`, '',
    '## 逐项概览', '',
    '| 组件 | 分组 | 本轮结论 | 缺失属性 / 事件 / 插槽 | 用例待补场景数 | 验证层次 |',
    '| --- | --- | --- | --- | ---: | --- |'
];
for (const item of inventory.inventory) {
    const row = results.find(row => row.name === item.name);
    lines.push(`| [${row.name}](#${row.name.toLowerCase()}) | ${escape(item.group)} | ${labels[row.classification]} | ${row.confirmedMissingProps.length} / ${row.confirmedMissingEvents.length} / ${row.confirmedMissingSlots.length} | ${row.demo.missing.length} | ${methods[row.verification]} |`);
}
lines.push('', '## 逐组件证据', '');
for (const item of inventory.inventory) {
    const row = results.find(row => row.name === item.name);
    lines.push(`### ${row.name}`, '', `${labels[row.classification]}；${methods[row.verification]}。${row.summary}`, '');
    if (row.upstreamName && item.upstream) lines.push(`上游：[${row.upstreamName} ${validation.baseline}](${item.upstream.url})。`, '');
    for (const [label, field] of [['缺失属性', 'confirmedMissingProps'], ['缺失事件', 'confirmedMissingEvents'], ['缺失插槽', 'confirmedMissingSlots']]) if (row[field].length) lines.push(`${label}：${row[field].map(value => '`' + value + '`').join('、')}。`, '');
    for (const note of row.contractNotes) lines.push(`- 契约：${note}`);
    if (row.propertyReview) {
        const review = row.propertyReview;
        lines.push(`- 属性候选逐项判定：${review.reviewedCandidates.length}项；确认缺失${review.missing.length}、实现/转发${review.supportedViaForwarding.length}、保留约定${review.intentionallyDifferent.length}、待验证${review.unverified.length}。`);
        if (review.supportedViaForwarding.length) lines.push(`- 已有实现/转发属性：${review.supportedViaForwarding.map(value => '`' + value + '`').join('、')}。`);
        if (review.intentionallyDifferent.length) lines.push(`- 外观/本库约定差异属性：${review.intentionallyDifferent.map(value => '`' + value + '`').join('、')}。`);
        if (review.unverified.length) lines.push(`- 待验证属性：${review.unverified.map(value => '`' + value + '`').join('、')}。`);
        review.notes.forEach(note => lines.push(`- 属性依据：${note}`));
    }
    for (const check of row.semantics) lines.push(`- ${check.feature}（${check.result}）：${check.detail} 证据：${[...check.localEvidence, ...check.upstreamEvidence].map(reference).join('、')}。`);
    if (row.demo.covered.length) lines.push(`- 真实用例已覆盖：${row.demo.covered.join('；')}。`);
    if (row.demo.files.length) lines.push(`- 用例源码：${row.demo.files.map(filename => `[${filename}](${path.relative(directory, path.resolve(filename)).replaceAll('\\', '/')})`).join('、')}。`);
    if (row.demo.missing.length) lines.push(`- 真实用例待补：${row.demo.missing.join('；')}。`);
    if (row.runtimeEvidence.length) lines.push(`- 专项证据：${row.runtimeEvidence.join('、')}。`);
    if (row.limitations.length) lines.push(`- 限制：${row.limitations.join('；')}。`);
    lines.push('');
}
writeFileSync(path.join(directory, 'REPORT.md'), lines.join('\n') + '\n');
console.log(`Rendered ${results.length} component reviews.`);

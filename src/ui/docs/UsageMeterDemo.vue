<script setup>
import { ref } from 'vue';
import UUsageMeter from '../UiUsageMeter.vue';
import UButton from '../UiButton.vue';
import UDialog from '../UiDialog.vue';
import UCollapse from '../UiCollapse.vue';
import UCodeBlock from '../UiCodeBlock.vue';

const updated = ref(false);
const inspections = ref(0);
const dialogOpen = ref(false);
const sectionOpen = ref(false);
const longContent = Array.from({ length: 100 }, (_, index) => `环境内容第 ${index + 1} 行 · ${'上下文与 Git 状态 '.repeat(9)}`).join('\n');
const segments = [
    { id: 'system', label: '系统指令', value: 2100 },
    { id: 'tools', label: '工具定义', value: 4000 },
    { id: 'environment', label: '环境', value: 1700 },
    { id: 'user', label: '用户消息', value: 2500 },
    { id: 'assistant', label: '助手正文', value: 5700 },
    { id: 'results', label: '工具结果', value: 6100 },
    { id: 'attachments', label: '附件', value: 2100 },
    { id: 'summary', label: '压缩摘要', value: null },
    { id: 'remaining', label: '剩余可用上下文', value: 175800, tone: 'remaining' }
];
</script>

<template>
    <div class="usage-demo">
        <div class="usage-demo-triggers">
            <u-usage-meter compact :used="updated ? 40000 : 24800" :capacity="200000" estimated label="上下文" @inspect="inspections++" />
            <u-usage-meter compact :used="1200" label="容量未上报" @inspect="inspections++" />
            <u-usage-meter compact label="未知用量" @inspect="inspections++" />
            <u-usage-meter compact :used="120" :capacity="100" label="超出容量" @inspect="inspections++" />
            <u-usage-meter compact :used="0" :capacity="100" label="零用量" @inspect="inspections++" />
            <u-usage-meter compact :used="NaN" :capacity="100" label="无效用量" @inspect="inspections++" />
            <u-usage-meter compact disabled :used="20" :capacity="100" label="禁用" />
        </div>
        <div class="usage-demo-panel"><u-usage-meter label="上下文" :used="updated ? 40000 : 24800" :capacity="200000" :segments="segments" /></div>
        <div class="usage-demo-actions"><u-button size="sm" variant="ghost" @click="updated = !updated">更新用量</u-button><span role="status">已查看 {{ inspections }} 次</span></div>
        <u-button @click="dialogOpen = true">打开嵌套内容弹窗</u-button>
        <u-dialog v-model:open="dialogOpen" scrollable content-label="嵌套内容示例">
            <template #header><h2>可展开的请求内容</h2></template>
            <u-usage-meter label="上下文" :used="24800" :capacity="200000" :segments="segments" />
            <p>长正文位于折叠区内，弹窗保持标题和关闭按钮可见。</p>
            <u-button :aria-expanded="sectionOpen" @click="sectionOpen = !sectionOpen">展开环境内容</u-button>
            <u-collapse :open="sectionOpen"><u-code-block :code="longContent" language="text" /></u-collapse>
            <p data-nested-after>展开内容之后的说明仍可滚动查看。</p>
            <template #footer><u-button @click="dialogOpen = false">关闭嵌套内容</u-button></template>
        </u-dialog>
    </div>
</template>

<style scoped>
.usage-demo { display: grid; gap: 20px; }
.usage-demo-triggers { display: flex; gap: 8px; flex-wrap: wrap; }
.usage-demo-panel { padding: 20px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; max-width: 600px; }
.usage-demo-actions { display: flex; align-items: center; gap: 12px; font-size: 11px; color: var(--muted); }
</style>

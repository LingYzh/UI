<script setup lang="ts">
import { computed, ref } from 'vue';
import UiButton from './UiButton.vue';
import UiScrollArea from './UiScrollArea.vue';
import { collapseDiffContext, lineDiff } from './line-diff';
import { writeClipboard } from './clipboard';
import Icon from '../components/Icon.vue';

const props = withDefaults(defineProps<{ before: string | null; after: string | null; path?: string; proposed?: boolean; compact?: boolean; inspectable?: boolean }>(), { path: '文件变更', proposed: false, compact: false, inspectable: false });
const emit = defineEmits<{ inspect: [] }>();
const expanded = ref(false);
const wrap = ref(false);
const feedback = ref('');
const diff = computed(() => lineDiff(props.before, props.after));
const rows = computed(() => expanded.value ? diff.value.rows : collapseDiffContext(diff.value.rows));
const visibleRows = computed(() => rows.value.slice(0, 600));
const status = computed(() => props.proposed ? '待执行的修改' : props.before === null ? '已新建' : props.after === null ? '已删除' : '历史修改');
async function copy(value: string) {
    try { await writeClipboard(value); feedback.value = '内容已复制。'; }
    catch { feedback.value = '复制失败，请手动选择内容。'; }
}
</script>

<template>
    <section class="ui-diff" :class="{ 'is-compact': compact }" :aria-label="`${path} ${status}`">
        <header class="ui-diff-header">
            <div class="ui-diff-identity"><strong :title="path">{{ path }}</strong><span>{{ compact ? `· ${proposed ? '待执行' : '保存的快照'}` : status }}</span></div>
            <button v-if="inspectable" class="ui-diff-inspect" type="button" @click="emit('inspect')">在右栏查看 <Icon name="external" :size="14" /></button>
            <div v-if="!compact && !diff.omitted" class="ui-diff-counts" aria-label="变更行数"><span class="ui-diff-added">+{{ diff.added }}</span><span class="ui-diff-removed">−{{ diff.removed }}</span></div>
        </header>
        <div v-if="!compact" class="ui-diff-toolbar">
            <UiButton size="sm" variant="ghost" :aria-pressed="expanded" :disabled="diff.omitted" @click="expanded = !expanded">{{ expanded ? '仅显示变更' : '显示上下文' }}</UiButton>
            <UiButton size="sm" variant="ghost" :aria-pressed="wrap" @click="wrap = !wrap">{{ wrap ? '关闭换行' : '自动换行' }}</UiButton>
            <UiButton v-if="before !== null" size="sm" variant="ghost" @click="copy(before)">复制原内容</UiButton>
            <UiButton v-if="after !== null" size="sm" variant="ghost" @click="copy(after)">复制新内容</UiButton>
        </div>
        <template v-if="diff.omitted"><p class="ui-diff-notice">此变更过大或计算复杂，未生成逐行预览。可复制完整快照查看。</p><div v-if="compact" class="ui-diff-fallback-actions"><UiButton v-if="before !== null" size="sm" variant="ghost" @click="copy(before)">复制原内容</UiButton><UiButton v-if="after !== null" size="sm" variant="ghost" @click="copy(after)">复制新内容</UiButton></div></template>
        <p v-else-if="!diff.added && !diff.removed" class="ui-diff-notice">内容没有变化。</p>
        <UiScrollArea v-else :label="`${path} 逐行差异`" axis="both" max-height="440px" :rounded="false">
            <div class="ui-diff-lines" :class="{ 'is-wrapped': wrap }" role="table" aria-label="旧行号、新行号与变更内容">
                <div v-for="(row, index) in visibleRows" :key="index" class="ui-diff-row" :data-kind="row.kind" role="row">
                    <template v-if="row.kind !== 'gap'"><span class="ui-diff-number" role="cell">{{ row.oldLine }}</span><span class="ui-diff-number" role="cell">{{ row.newLine }}</span><span class="ui-diff-sign" role="cell">{{ row.kind === 'added' ? '+' : row.kind === 'removed' ? '−' : ' ' }}</span><code role="cell">{{ row.text }}<span v-if="row.noNewline" class="ui-diff-no-newline"> ⏎ 文件末尾无换行</span></code></template>
                    <span v-else class="ui-diff-gap" role="cell">{{ row.text }}</span>
                </div>
            </div>
        </UiScrollArea>
        <p v-if="rows.length > visibleRows.length" class="ui-diff-notice">仅展示前 {{ visibleRows.length }} 行差异预览。统计包含完整变更，可复制完整快照查看。</p>
        <span class="ui-visually-hidden" role="status">{{ feedback }}</span>
    </section>
</template>

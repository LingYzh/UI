<script setup lang="ts">
import { computed, ref } from 'vue';
import UiButton from './UiButton.vue';
import UiScrollArea from './UiScrollArea.vue';
import { collapseDiffContext, lineDiff } from './line-diff';
import { writeClipboard } from './clipboard';
import Icon from '../components/Icon.vue';
import { uiText } from './locale';

const props = withDefaults(defineProps<{ before: string | null; after: string | null; path?: string; proposed?: boolean; compact?: boolean; inspectable?: boolean }>(), { path: undefined, proposed: false, compact: false, inspectable: false });
const emit = defineEmits<{ inspect: [] }>();
const expanded = ref(false);
const wrap = ref(false);
const feedback = ref('');
const diff = computed(() => lineDiff(props.before, props.after));
const rows = computed(() => expanded.value ? diff.value.rows : collapseDiffContext(diff.value.rows));
const visibleRows = computed(() => rows.value.slice(0, 600));
const displayPath = computed(() => props.path ?? uiText('diff.defaultPath'));
const status = computed(() => props.proposed ? uiText('diff.proposed') : props.before === null ? uiText('diff.created') : props.after === null ? uiText('diff.deleted') : uiText('diff.history'));
async function copy(value: string) {
    try { await writeClipboard(value); feedback.value = uiText('diff.copySuccess'); }
    catch { feedback.value = uiText('diff.copyFailed'); }
}
</script>

<template>
    <section class="ui-diff" :class="{ 'is-compact': compact }" :aria-label="`${displayPath} ${status}`">
        <header class="ui-diff-header">
            <div class="ui-diff-identity"><strong :title="displayPath">{{ displayPath }}</strong><span>{{ compact ? `· ${proposed ? uiText('diff.pendingShort') : uiText('diff.snapshot')}` : status }}</span></div>
            <button v-if="inspectable" class="ui-diff-inspect" type="button" @click="emit('inspect')">{{ uiText('diff.inspect') }} <Icon name="external" :size="14" /></button>
            <div v-if="!compact && !diff.omitted" class="ui-diff-counts" :aria-label="uiText('diff.counts')"><span class="ui-diff-added">+{{ diff.added }}</span><span class="ui-diff-removed">−{{ diff.removed }}</span></div>
        </header>
        <div v-if="!compact" class="ui-diff-toolbar">
            <UiButton size="sm" variant="ghost" :aria-pressed="expanded" :disabled="diff.omitted" @click="expanded = !expanded">{{ expanded ? uiText('diff.changesOnly') : uiText('diff.showContext') }}</UiButton>
            <UiButton size="sm" variant="ghost" :aria-pressed="wrap" @click="wrap = !wrap">{{ wrap ? uiText('diff.wrapOff') : uiText('common.autoWrap') }}</UiButton>
            <UiButton v-if="before !== null" size="sm" variant="ghost" @click="copy(before)">{{ uiText('diff.copyBefore') }}</UiButton>
            <UiButton v-if="after !== null" size="sm" variant="ghost" @click="copy(after)">{{ uiText('diff.copyAfter') }}</UiButton>
        </div>
        <template v-if="diff.omitted"><p class="ui-diff-notice">{{ uiText('diff.omitted') }}</p><div v-if="compact" class="ui-diff-fallback-actions"><UiButton v-if="before !== null" size="sm" variant="ghost" @click="copy(before)">{{ uiText('diff.copyBefore') }}</UiButton><UiButton v-if="after !== null" size="sm" variant="ghost" @click="copy(after)">{{ uiText('diff.copyAfter') }}</UiButton></div></template>
        <p v-else-if="!diff.added && !diff.removed" class="ui-diff-notice">{{ uiText('diff.unchanged') }}</p>
        <UiScrollArea v-else :label="uiText('diff.linesLabel', { path: displayPath })" axis="both" max-height="440px" :rounded="false">
            <div class="ui-diff-lines" :class="{ 'is-wrapped': wrap }" role="table" :aria-label="uiText('diff.tableLabel')">
                <div v-for="(row, index) in visibleRows" :key="index" class="ui-diff-row" :data-kind="row.kind" role="row">
                    <template v-if="row.kind !== 'gap'"><span class="ui-diff-number" role="cell">{{ row.oldLine }}</span><span class="ui-diff-number" role="cell">{{ row.newLine }}</span><span class="ui-diff-sign" role="cell">{{ row.kind === 'added' ? '+' : row.kind === 'removed' ? '−' : ' ' }}</span><code role="cell">{{ row.text }}<span v-if="row.noNewline" class="ui-diff-no-newline"> {{ uiText('diff.noNewline') }}</span></code></template>
                    <span v-else class="ui-diff-gap" role="cell">{{ row.text }}</span>
                </div>
            </div>
        </UiScrollArea>
        <p v-if="rows.length > visibleRows.length" class="ui-diff-notice">{{ uiText('diff.truncated', { count: visibleRows.length }) }}</p>
        <span class="ui-visually-hidden" role="status">{{ feedback }}</span>
    </section>
</template>

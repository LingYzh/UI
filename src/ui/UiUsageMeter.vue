<script setup lang="ts">
import { computed } from 'vue';
import { uiText, uiNumberLocale } from './locale';

export interface UsageSegment { id: string; label: string; value: number | null; tone?: 'remaining' }
const props = withDefaults(defineProps<{
    used?: number | null;
    capacity?: number | null;
    estimated?: boolean;
    label?: string;
    compact?: boolean;
    disabled?: boolean;
    segments?: UsageSegment[];
    compositionLabel?: string;
    compositionEstimated?: boolean;
}>(), { label: undefined, compositionLabel: undefined, compositionEstimated: true });
const emit = defineEmits<{ inspect: [] }>();
const valid = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const used = computed(() => valid(props.used) ? props.used : null);
const capacity = computed(() => valid(props.capacity) && props.capacity > 0 ? props.capacity : null);
const ratio = computed(() => used.value !== null && capacity.value !== null ? used.value / capacity.value : null);
const percentage = computed(() => ratio.value === null ? null : Math.round(ratio.value * 1000) / 10);
const displayLabel = computed(() => props.label ?? uiText('usage.label'));
const displayCompositionLabel = computed(() => props.compositionLabel ?? uiText('usage.composition'));
const status = computed(() => used.value === null ? uiText('usage.unknown') : capacity.value === null ? uiText('usage.capacityUnknown') : `${percentage.value}%`);
const accessible = computed(() => uiText('usage.accessible', { label: displayLabel.value, status: status.value, estimated: props.estimated ? uiText('usage.estimatedSuffix') : '', inspect: uiText('usage.inspect') }));
const number = (value: number | null) => value === null ? uiText('usage.unknown') : value.toLocaleString(uiNumberLocale(), { maximumFractionDigits: 1 });
const compactStatus = computed(() => used.value !== null && capacity.value === null ? `${props.estimated ? uiText('usage.approx') : ''}${used.value >= 1000 ? `${Math.round(used.value / 100) / 10}K` : number(used.value)} · ${uiText('usage.capacityUnknown')}` : status.value);
const segments = computed(() => (props.segments || []).map((item, index) => ({ ...item, value: valid(item.value) ? item.value : null, color: item.tone === 'remaining' ? 'var(--usage-remaining)' : `var(--usage-category-${index % 8 + 1})` })));
const total = computed(() => segments.value.reduce((sum, item) => sum + (item.value || 0), 0));
const incomplete = computed(() => segments.value.some(item => item.value === null));
</script>

<template>
    <button v-if="compact" type="button" class="ui-usage-trigger" :disabled="disabled" :aria-label="accessible" :title="accessible" @click="emit('inspect')">
        <svg class="ui-usage-ring" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="ui-usage-track" cx="12" cy="12" r="9" />
            <circle v-if="ratio !== null" class="ui-usage-progress" cx="12" cy="12" r="9" pathLength="100" :stroke-dasharray="`${Math.min(100, ratio * 100)} 100`" />
            <path v-else class="ui-usage-unknown" d="M12 7v6m0 3v1" />
        </svg>
        <span>{{ compactStatus }}</span><span v-if="estimated" class="ui-usage-source">{{ uiText('usage.estimatedShort') }}</span>
    </button>
    <section v-else class="ui-usage-meter" :aria-label="displayLabel">
        <header class="ui-usage-heading"><div><span class="ui-usage-label">{{ displayLabel }}</span><strong>{{ number(used) }}<span v-if="capacity !== null"> / {{ number(capacity) }}</span><span v-else> · {{ uiText('usage.capacityUnknown') }}</span></strong></div><span class="ui-usage-source">{{ estimated ? uiText('usage.estimated') : uiText('usage.known') }}</span></header>
        <p class="ui-usage-summary">{{ status }}<template v-if="ratio !== null && ratio > 1"> · {{ uiText('usage.over') }}</template></p>
        <template v-if="segments.length">
            <div class="ui-usage-composition"><strong>{{ displayCompositionLabel }}</strong><span>{{ compositionEstimated ? uiText('usage.estimated') : uiText('usage.knownCategories') }} · {{ uiText('usage.total', { total: number(total) }) }}<template v-if="incomplete">{{ uiText('usage.partial') }}</template></span></div>
            <p class="ui-usage-note">{{ uiText('usage.note') }}</p>
            <div class="ui-usage-bar" aria-hidden="true"><i v-for="item in segments" :key="item.id" :style="{ width: `${total > 0 ? (item.value || 0) / total * 100 : 0}%`, background: item.color }" /></div>
            <ul class="ui-usage-legend"><li v-for="item in segments" :key="item.id"><i :style="{ background: item.color }" aria-hidden="true" /><span>{{ item.label }}</span><strong>{{ number(item.value) }}</strong></li></ul>
        </template>
    </section>
</template>

<style scoped>
.ui-usage-trigger { display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 4px 7px; border: 0; border-radius: 8px; background: transparent; color: var(--muted); font: inherit; font-size: 11px; font-variant-numeric: tabular-nums; cursor: pointer; transition: background var(--motion-fast), color var(--motion-fast); }
.ui-usage-trigger:hover { background: var(--hover); color: var(--text); }
.ui-usage-trigger:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; }
.ui-usage-trigger:disabled { opacity: .5; cursor: default; }
.ui-usage-ring { width: 19px; height: 19px; overflow: visible; flex: 0 0 auto; }
.ui-usage-ring circle { fill: none; stroke-width: 3.2; }
.ui-usage-track { stroke: var(--border); }
.ui-usage-progress { stroke: var(--accent-text); stroke-linecap: round; transform: rotate(-90deg); transform-origin: center; transition: stroke-dasharray 320ms var(--ease); }
.ui-usage-unknown { fill: none; stroke: var(--muted); stroke-width: 1.5; stroke-linecap: round; }
.ui-usage-meter { min-width: 0; font-size: 12px; font-variant-numeric: tabular-nums; color: var(--text); }
.ui-usage-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.ui-usage-heading > div { display: grid; gap: 6px; }
.ui-usage-label, .ui-usage-note, .ui-usage-summary { color: var(--muted); }
.ui-usage-heading strong { font-size: 18px; font-weight: 550; overflow-wrap: anywhere; }
.ui-usage-heading strong span { color: var(--muted); font-size: 13px; font-weight: 400; }
.ui-usage-source { color: var(--muted); font-size: 10px; white-space: nowrap; }
.ui-usage-heading > .ui-usage-source { background: var(--soft); padding: 4px 7px; border-radius: 5px; }
.ui-usage-summary { margin: 8px 0 18px; font-size: 11px; }
.ui-usage-composition { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px 12px; border-top: 1px solid var(--line); padding-top: 14px; }
.ui-usage-composition strong { font-size: 12px; font-weight: 550; }
.ui-usage-composition span, .ui-usage-note { font-size: 11px; color: var(--muted); }
.ui-usage-note { margin: 7px 0 0; line-height: 1.6; }
.ui-usage-bar { height: 9px; display: flex; background: var(--soft); overflow: hidden; border-radius: 4px; margin: 14px 0; }
.ui-usage-bar i { height: 100%; transition: width var(--motion-normal); }
.ui-usage-legend { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 20px; list-style: none; margin: 0; padding: 0; font-size: 11px; }
.ui-usage-legend li { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.ui-usage-legend i { width: 7px; height: 7px; border-radius: 2px; flex: 0 0 auto; }
.ui-usage-legend span { overflow-wrap: anywhere; }
.ui-usage-legend strong { margin-left: auto; font-weight: 500; white-space: nowrap; }
@media (max-width: 520px) { .ui-usage-legend { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: reduce) { .ui-usage-progress, .ui-usage-trigger, .ui-usage-bar i { transition: none; } }
</style>

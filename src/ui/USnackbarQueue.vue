<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import USnackbar from './USnackbar.vue';
import UiButton from './UiButton.vue';
import { useDefaults } from './defaults';
import { useUiTheme } from './theme';
import { snackbarLocation, type SnackbarProps, type SnackbarMessage, type SnackbarDismissReason } from './snackbar-props';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<SnackbarProps & { totalVisible?: number | string; displayStrategy?: 'hold' | 'overflow'; gap?: number | string; collapsed?: boolean }>(), { totalVisible: 1, displayStrategy: 'hold', gap: 8, location: 'bottom center', closeText: '关闭', rounded: true });
const props = useDefaults(rawProps, 'USnackbarQueue');
const model = defineModel<SnackbarMessage[]>({ default: () => [] });
const emit = defineEmits<{ dismiss: [item: SnackbarMessage, reason: SnackbarDismissReason] }>();
const attrs = useAttrs();
const theme = useUiTheme();
interface Entry { id: number; source: SnackbarMessage; props: SnackbarProps; active: boolean }
const entries = ref<Entry[]>([]);
const hovered = ref(false);
const surfaces = new Map<number, InstanceType<typeof USnackbar>>();
let nextId = 0;
let disposed = false;
let pumping = false;
const limit = computed(() => Math.max(1, Math.floor(Number(props.totalVisible) || 1)));
const spacing = computed(() => typeof props.gap === 'number' || /^\d+(\.\d+)?$/.test(props.gap) ? `${props.gap}px` : props.gap);
const location = computed(() => snackbarLocation(props.location));
function track(id: number, instance: unknown) {
    if (!instance) { surfaces.delete(id); return; }
    const notice = instance as InstanceType<typeof USnackbar>;
    surfaces.set(id, notice);
    if (props.collapsed && hovered.value) notice.pause('queue');
}
watch(() => props.collapsed && hovered.value, paused => { for (const surface of surfaces.values()) paused ? surface.pause('queue') : surface.resume('queue'); });
function dismiss(entry: Entry, reason: SnackbarDismissReason) {
    if (!entry.active) return;
    entry.active = false;
    if (typeof entry.source !== 'string') entry.source.onDismiss?.(reason);
    emit('dismiss', entry.source, reason);
}
function afterLeave(entry: Entry) { entries.value = entries.value.filter(item => item.id !== entry.id); pump(); }
function pump() {
    if (disposed || pumping) return;
    pumping = true;
    const created = new Set<number>();
    // A controlled defineModel updates through its parent, so its getter cannot
    // serve as a synchronous cursor while consuming several entries.
    const pending = [...model.value];
    let consumed = false;
    try {
        while (pending.length) {
            const active = entries.value.filter(item => item.active);
            if (active.length >= limit.value) {
                if (props.displayStrategy === 'hold') break;
                dismiss(active[0], 'overflow');
            }
            const source = pending.shift()!;
            consumed = true;
            const options = typeof source === 'string' ? { text: source } : source;
            const { onDismiss, promise, success, error, ...notice } = options as Exclude<SnackbarMessage, string>;
            const entry: Entry = { id: ++nextId, source, props: { ...(promise ? { loading: true, timeout: -1 } : {}), ...notice }, active: true };
            entries.value.push(entry);
            created.add(entry.id);
            if (promise) {
                const settle = (result: unknown, resolve?: (value: unknown) => SnackbarProps) => {
                    if (disposed) return;
                    const current = entries.value.find(item => item.id === entry.id);
                    if (!current?.active) return;
                    current.props = { ...notice, loading: false, timeout: 5000, ...resolve?.(result) };
                };
                void promise.then(value => settle(value, success), value => settle(value, error));
            }
        }
    } finally {
        if (consumed) model.value = pending;
        // A same-tick overflow never mounted a surface and has no leave callback.
        entries.value = entries.value.filter(entry => entry.active || !created.has(entry.id));
        pumping = false;
    }
}
function clear() { model.value = []; for (const entry of entries.value) dismiss(entry, 'cleared'); }
watch(() => [model.value, limit.value, props.displayStrategy], () => {
    const active = entries.value.filter(item => item.active);
    for (const item of active.slice(0, Math.max(0, active.length - limit.value))) dismiss(item, 'overflow');
    void nextTick(pump);
}, { deep: true, immediate: true });
onBeforeUnmount(() => { disposed = true; });
defineExpose({ clear });
</script>

<template>
    <Teleport :to="props.attach || 'body'" :disabled="props.contained || props.attach === false">
        <div class="u-notice-stack" :class="{ 'is-contained': props.contained, 'is-collapsed': props.collapsed && !hovered }" :data-position="location" :style="[theme.styles.value, { gap: spacing }]" :data-ui-theme="theme.name.value" :data-theme="theme.current.value.dark ? 'dark' : 'light'" @pointerenter="hovered = true" @pointerleave="hovered = false">
            <template v-for="entry in entries" :key="entry.id"><slot name="item" :item="entry.source" :props="{ ...props, ...attrs, ...entry.props, modelValue: entry.active, contained: true, attach: false, queueIndex: entries.indexOf(entry), ref: (instance: unknown) => track(entry.id, instance), 'onUpdate:modelValue': () => dismiss(entry, 'auto'), onAfterLeave: () => afterLeave(entry) }">
            <USnackbar :ref="instance => track(entry.id, instance)" v-bind="{ ...props, ...attrs, ...entry.props }" :model-value="entry.active" :contained="true" :attach="false" :queue-index="entries.indexOf(entry)" @update:model-value="dismiss(entry, 'auto')" @after-leave="afterLeave(entry)">
                <template v-if="$slots.header" #header><slot name="header" :item="entry.source" /></template>
                <template v-if="$slots.text" #text><slot name="text" :item="entry.source" /></template>
                <template v-if="(entry.props.closable ?? props.closable) || $slots.actions" #actions><slot name="actions" :item="entry.source" :props="{ onClick: () => dismiss(entry, 'dismissed') }"><UiButton variant="text" size="sm" @click="dismiss(entry, 'dismissed')">{{ entry.props.closeText ?? props.closeText }}</UiButton></slot></template>
            </USnackbar></slot></template>
        </div>
    </Teleport>
</template>

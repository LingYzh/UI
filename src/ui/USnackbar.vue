<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch, type HTMLAttributes } from 'vue';
import UiButton from './UiButton.vue';
import UiSpinner from './UiSpinner.vue';
import { buttonColorStyles } from './button-colors';
import { useDefaults } from './defaults';
import { useUiTheme } from './theme';
import { snackbarLocation, type SnackbarProps } from './snackbar-props';
import { vClickOutside } from './directives';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<SnackbarProps>(), { timeout: 5000, location: 'bottom center', variant: 'elevated', closeText: '关闭', rounded: true, persistent: false });
const props = useDefaults(rawProps, 'USnackbar');
const model = defineModel<boolean>({ default: false });
const emit = defineEmits<{ 'after-leave': []; 'after-enter': []; timeout: []; 'click:outside': [event: Event] }>();
const attrs = useAttrs() as HTMLAttributes;
const theme = useUiTheme();
const surface = ref<HTMLElement>();
const remaining = ref(0);
const ratio = ref(1);
const pauses = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;
let progress: ReturnType<typeof setInterval> | undefined;
let started = 0;
let owner: Document | undefined;
const duration = computed(() => { const value = Number(props.timeout); return Number.isFinite(value) ? value : 5000; });
const location = computed(() => snackbarLocation(props.location));
const colors = computed(() => buttonColorStyles(props.color));
function stop() { clearTimeout(timer); clearInterval(progress); timer = undefined; progress = undefined; }
function close() { model.value = false; }
function outside(event: Event) { emit('click:outside', event); if (!props.persistent && !event.defaultPrevented) close(); }
function escape(event: KeyboardEvent) { if (props.persistent || event.defaultPrevented) return; event.stopPropagation(); close(); }
function updateProgress() { ratio.value = duration.value > 0 ? Math.max(0, (remaining.value - (Date.now() - started)) / duration.value) : 1; }
function schedule() {
    stop();
    if (typeof document === 'undefined' || !model.value || duration.value < 0 || pauses.size) return;
    started = Date.now();
    timer = setTimeout(() => { emit('timeout'); close(); }, Math.max(0, remaining.value));
    if (props.timer) progress = setInterval(updateProgress, 40);
}
function pause(reason: string) {
    if (pauses.has(reason)) return;
    if (!pauses.size && timer) { updateProgress(); remaining.value = Math.max(0, remaining.value - (Date.now() - started)); stop(); }
    pauses.add(reason);
}
function resume(reason: string) { if (pauses.delete(reason) && !pauses.size) schedule(); }
function visibility() { if (owner?.hidden) pause('document'); else resume('document'); }
function focusout(event: FocusEvent) { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) resume('focus'); }
watch(() => [model.value, duration.value], () => {
    stop(); remaining.value = Math.max(0, duration.value); ratio.value = 1;
    if (!model.value) { pauses.clear(); if (owner?.hidden) pauses.add('document'); }
    if (model.value) schedule();
}, { immediate: true });
onMounted(() => { owner = surface.value?.ownerDocument ?? document; owner.addEventListener('visibilitychange', visibility); visibility(); if (!pauses.size) schedule(); });
onBeforeUnmount(() => { stop(); owner?.removeEventListener('visibilitychange', visibility); });
defineExpose({ close, pause, resume, surface });
</script>

<template>
    <slot name="activator" :is-active="model" :props="{ onClick: () => model = !model, 'aria-expanded': model }" />
    <Teleport :to="props.attach || 'body'" :disabled="props.contained || props.attach === false">
        <Transition name="ui-snackbar" @after-leave="emit('after-leave')" @after-enter="emit('after-enter')">
            <div v-if="model" class="u-notice-placement" :class="{ 'is-contained': props.contained }" :data-position="location" :style="[theme.styles.value, { '--u-queue-index': props.queueIndex }]" :data-ui-theme="theme.name.value" :data-theme="theme.current.value.dark ? 'dark' : 'light'">
                <div ref="surface" v-click-outside="outside" v-bind="attrs" class="u-notice" :class="[{ 'is-vertical': props.vertical, 'is-square': props.rounded === false }, attrs.class]" :style="[colors, attrs.style as any]" :data-variant="props.variant" :role="attrs.role ?? 'status'" :aria-live="attrs['aria-live'] ?? (attrs.role === 'alert' ? 'assertive' : 'polite')" aria-atomic="true" @pointerenter="pause('pointer')" @pointerleave="resume('pointer')" @focusin="pause('focus')" @focusout="focusout" @keydown.esc="escape">
                    <UiSpinner v-if="props.loading" :size="18" label="正在处理" />
                    <slot name="prepend" />
                    <div class="u-notice-content">
                        <slot name="header" />
                        <slot name="title"><strong v-if="props.title" class="u-notice-title">{{ props.title }}</strong></slot>
                        <slot name="text"><div v-if="props.text" class="u-notice-text">{{ props.text }}</div></slot>
                        <slot />
                    </div>
                    <div v-if="$slots.actions || props.closable" class="u-notice-actions"><slot name="actions" :is-active="model" :close="close"><UiButton variant="text" :color="typeof props.closable === 'string' ? props.closable : undefined" size="sm" @click="close">{{ props.closeText }}</UiButton></slot></div>
                    <div v-if="props.timer && duration >= 0" class="u-notice-timer" :class="{ 'is-top': props.timer === 'top' }" aria-hidden="true"><span :style="{ width: `${100 * (props.reverseTimer ? 1 - ratio : ratio)}%`, background: props.timerColor ? `var(--ui-theme-${props.timerColor}, ${props.timerColor})` : undefined }" /></div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

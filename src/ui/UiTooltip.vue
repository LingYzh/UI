<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, useId, watch } from 'vue';
import { vPointerBlur } from './pointer-focus';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ text: string; focusable?: boolean; modelValue?: boolean; location?: 'top' | 'bottom' | 'left' | 'right'; openOnHover?: boolean; openOnFocus?: boolean; openOnClick?: boolean; openDelay?: number; closeDelay?: number; persistent?: boolean }>(), {
    modelValue: undefined, focusable: true, location: 'top', openOnHover: true, openOnFocus: true, openOnClick: false, openDelay: 0, closeDelay: 0, persistent: false
});
const props = useDefaults(rawProps, 'UTooltip');
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const id = useId();
const trigger = ref<HTMLElement>();
const bubble = ref<HTMLElement>();
let hovered = false;
let focused = false;
let pointerFocus = false;
let disposed = false;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
const localVisible = ref(false);
const visible = computed(() => props.modelValue ?? localVisible.value);
function setVisible(value: boolean) { localVisible.value = value; emit('update:modelValue', value); }
function scheduleShow() {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    showTimer = setTimeout(() => setVisible(true), Math.max(0, props.openDelay));
}
function scheduleHide() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (!hovered && !focused && !props.persistent) setVisible(false); }, Math.max(0, props.closeDelay));
}
async function show() {
    await nextTick();
    if (disposed || !visible.value || !trigger.value || !bubble.value) return;
    const tooltip = bubble.value;
    if (!tooltip.matches(':popover-open')) tooltip.showPopover();
    const rect = trigger.value.getBoundingClientRect();
    const bounds = tooltip.getBoundingClientRect();
    const left = props.location === 'left' ? rect.left - bounds.width - 8 : props.location === 'right' ? rect.right + 8 : rect.left + (rect.width - bounds.width) / 2;
    const top = props.location === 'bottom' ? rect.bottom + 8 : props.location === 'left' || props.location === 'right' ? rect.top + (rect.height - bounds.height) / 2 : rect.top >= bounds.height + 8 ? rect.top - bounds.height - 8 : rect.bottom + 8;
    tooltip.style.left = `${Math.max(8, Math.min(window.innerWidth - bounds.width - 8, left))}px`;
    tooltip.style.top = `${Math.max(8, Math.min(window.innerHeight - bounds.height - 8, top))}px`;
}
function hide() { setVisible(false); if (bubble.value?.matches(':popover-open')) bubble.value.hidePopover(); }
function enter() { hovered = true; if (props.openOnHover) scheduleShow(); }
function focus() { focused = !pointerFocus && props.openOnFocus; if (focused) scheduleShow(); }
function pointerDown() { pointerFocus = true; focused = false; if (props.openOnClick) setVisible(!visible.value); else if (!hovered) hide(); }
function keyboard() { pointerFocus = false; }
function leave() { hovered = false; if (!focused) scheduleHide(); }
function blur() { focused = false; if (!hovered) scheduleHide(); }
watch(visible, (value) => { if (value) show(); else if (bubble.value?.matches(':popover-open')) bubble.value.hidePopover(); });
onMounted(() => { window.addEventListener('scroll', hide, true); window.addEventListener('resize', hide); window.addEventListener('keydown', keyboard, true); if (visible.value) show(); });
onBeforeUnmount(() => { disposed = true; clearTimeout(showTimer); clearTimeout(hideTimer); if (bubble.value?.matches(':popover-open')) bubble.value.hidePopover(); window.removeEventListener('scroll', hide, true); window.removeEventListener('resize', hide); window.removeEventListener('keydown', keyboard, true); });
</script>

<template>
    <span ref="trigger" v-pointer-blur class="ui-tooltip-trigger" :tabindex="props.focusable ? 0 : undefined" :aria-describedby="id" @pointerdown.capture="pointerDown" @mouseenter="enter" @mouseleave="leave" @focusin="focus" @focusout="blur" @keydown.esc="hide">
        <slot />
        <span :id="id" ref="bubble" class="ui-tooltip" role="tooltip" popover="manual">{{ props.text }}</span>
    </span>
</template>

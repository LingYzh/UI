<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, useId } from 'vue';
import { vPointerBlur } from './pointer-focus';
withDefaults(defineProps<{ text: string; focusable?: boolean }>(), { focusable: true });
const id = useId();
const trigger = ref<HTMLElement>();
const bubble = ref<HTMLElement>();
let hovered = false;
let focused = false;
let pointerFocus = false;
let disposed = false;
async function show() {
    await nextTick();
    if (disposed || (!hovered && !focused) || !trigger.value || !bubble.value) return;
    const tooltip = bubble.value;
    if (!tooltip.matches(':popover-open')) tooltip.showPopover();
    const rect = trigger.value.getBoundingClientRect();
    const bounds = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.max(8, Math.min(window.innerWidth - bounds.width - 8, rect.left + (rect.width - bounds.width) / 2))}px`;
    tooltip.style.top = `${Math.max(8, rect.top >= bounds.height + 8 ? rect.top - bounds.height - 8 : rect.bottom + 8)}px`;
}
function hide() { if (bubble.value?.matches(':popover-open')) bubble.value.hidePopover(); }
function enter() { hovered = true; show(); }
function focus() { focused = !pointerFocus; if (focused) show(); }
function pointerDown() { pointerFocus = true; focused = false; if (!hovered) hide(); }
function keyboard() { pointerFocus = false; }
function leave() { hovered = false; if (!focused) hide(); }
function blur() { focused = false; if (!hovered) hide(); }
onMounted(() => { window.addEventListener('scroll', hide, true); window.addEventListener('resize', hide); window.addEventListener('keydown', keyboard, true); });
onBeforeUnmount(() => { disposed = true; hide(); window.removeEventListener('scroll', hide, true); window.removeEventListener('resize', hide); window.removeEventListener('keydown', keyboard, true); });
</script>

<template>
    <span ref="trigger" v-pointer-blur class="ui-tooltip-trigger" :tabindex="focusable ? 0 : undefined" :aria-describedby="id" @pointerdown.capture="pointerDown" @mouseenter="enter" @mouseleave="leave" @focusin="focus" @focusout="blur" @keydown.esc="hide">
        <slot />
        <span :id="id" ref="bubble" class="ui-tooltip" role="tooltip" popover="manual">{{ text }}</span>
    </span>
</template>

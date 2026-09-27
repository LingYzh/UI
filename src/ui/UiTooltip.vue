<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, useId } from 'vue';
withDefaults(defineProps<{ text: string; focusable?: boolean }>(), { focusable: true });
const id = useId();
const trigger = ref<HTMLElement>();
const bubble = ref<HTMLElement>();
let hovered = false;
let focused = false;
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
function focus() { focused = true; show(); }
function leave() { hovered = false; if (!focused) hide(); }
function blur() { focused = false; if (!hovered) hide(); }
onMounted(() => { window.addEventListener('scroll', hide, true); window.addEventListener('resize', hide); });
onBeforeUnmount(() => { disposed = true; hide(); window.removeEventListener('scroll', hide, true); window.removeEventListener('resize', hide); });
</script>

<template>
    <span ref="trigger" class="ui-tooltip-trigger" :tabindex="focusable ? 0 : undefined" :aria-describedby="id" @mouseenter="enter" @mouseleave="leave" @focusin="focus" @focusout="blur" @keydown.esc="hide">
        <slot />
        <span :id="id" ref="bubble" class="ui-tooltip" role="tooltip" popover="manual">{{ text }}</span>
    </span>
</template>

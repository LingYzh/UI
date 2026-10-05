<script setup lang="ts">
import { useDefaults } from './defaults';
import UKbd from './UKbd.vue';
import { onMounted, onBeforeUnmount } from 'vue';
const rawProps = withDefaults(defineProps<{ keys: string; disabled?: boolean; preventDefault?: boolean; allowInput?: boolean }>(), { preventDefault: true });
const props = useDefaults(rawProps, 'UHotkey');
const emit = defineEmits<{ trigger: [event: KeyboardEvent] }>();
function matches(event: KeyboardEvent): boolean {
    const parts = props.keys.toLowerCase().split('+').map((part) => part.trim());
    const key = parts.at(-1);
    const normalized = event.key.toLowerCase() === ' ' ? 'space' : event.key.toLowerCase();
    return key === normalized && event.ctrlKey === (parts.includes('ctrl') || parts.includes('control')) && event.metaKey === (parts.includes('meta') || parts.includes('cmd')) && event.altKey === parts.includes('alt') && event.shiftKey === parts.includes('shift');
}
function onKeydown(event: KeyboardEvent): void {
    if (props.disabled || !matches(event) || (!props.allowInput && event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)))) return;
    if (props.preventDefault) event.preventDefault();
    emit('trigger', event);
}
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>
<template>
    <slot :keys="props.keys"><UKbd :keys="props.keys" /></slot>
</template>

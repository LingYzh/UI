<script setup lang="ts">
import { useDefaults } from './defaults';
import { ref, onBeforeUnmount } from 'vue';
const rawProps = withDefaults(defineProps<{ openDelay?: number; closeDelay?: number; disabled?: boolean }>(), { openDelay: 0, closeDelay: 0 });
const props = useDefaults(rawProps, 'UHover');
const hover = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
function schedule(value: boolean): void {
    if (timer) clearTimeout(timer);
    if (props.disabled) { hover.value = false; return; }
    timer = setTimeout(() => { hover.value = value; }, Math.max(0, value ? props.openDelay : props.closeDelay));
}
onBeforeUnmount(() => { if (timer) clearTimeout(timer); });
</script>
<template>
    <slot :is-hovering="hover" :props="{ onMouseenter: () => schedule(true), onMouseleave: () => schedule(false), onFocusin: () => schedule(true), onFocusout: () => schedule(false) }" :on-enter="() => schedule(true)" :on-leave="() => schedule(false)" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useLayoutItem } from './layout-completion';
import { useDisplay } from './display';
import { useDefaults } from './defaults';
const rawProps = withDefaults(defineProps<{ modelValue?: boolean; location?: 'left' | 'right'; width?: number; rail?: boolean; railWidth?: number; temporary?: boolean; mobileBreakpoint?: number; absolute?: boolean; order?: number }>(), {
    modelValue: undefined, location: 'left', width: 256, rail: false, railWidth: 56, temporary: false, absolute: false, order: 0
});
const props = useDefaults(rawProps, 'UNavigationDrawer');
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const internal = ref(props.modelValue ?? true);
const mobile = ref(false);
const display = useDisplay();
let media: MediaQueryList | undefined;
let mediaHandler: (() => void) | undefined;
const shown = computed(() => props.modelValue ?? internal.value);
const overlay = computed(() => props.temporary || (props.mobileBreakpoint === undefined ? display.mobile.value : mobile.value));
const size = computed(() => props.rail ? props.railWidth : props.width);
const { layout, offset } = useLayoutItem(computed(() => props.location), size, computed(() => shown.value && !overlay.value && !props.absolute), computed(() => props.order));
const topOffset = computed(() => overlay.value || props.absolute ? 0 : layout?.offsets.value.top ?? 0);
const bottomOffset = computed(() => overlay.value || props.absolute ? 0 : layout?.offsets.value.bottom ?? 0);
function close() {
    internal.value = false;
    emit('update:modelValue', false);
}
function syncMedia() {
    if (media && mediaHandler) media.removeEventListener('change', mediaHandler);
    media = undefined;
    mediaHandler = undefined;
    if (props.mobileBreakpoint === undefined) return;
    media = window.matchMedia(`(max-width: ${props.mobileBreakpoint - 1}px)`);
    mediaHandler = () => { mobile.value = Boolean(media?.matches); };
    media.addEventListener('change', mediaHandler);
    mediaHandler();
}
watch(() => props.mobileBreakpoint, () => { if (typeof window !== 'undefined') syncMedia(); });
watch(overlay, (next, previous) => {
    if (next && !previous && props.modelValue === undefined) internal.value = false;
});
onMounted(() => {
    syncMedia();
    if (props.modelValue === undefined && overlay.value) internal.value = false;
});
onBeforeUnmount(() => { if (media && mediaHandler) media.removeEventListener('change', mediaHandler); });
</script>

<template>
    <div v-if="shown && overlay" class="ui-navigation-scrim" @click="close" /><nav class="ui-navigation-drawer" :class="{ 'is-open': shown, 'is-temporary': overlay, 'is-rail': props.rail, 'is-absolute': props.absolute }" :data-location="props.location" :style="{ width: size + 'px', [props.location]: offset + 'px', top: topOffset + 'px', bottom: bottomOffset + 'px' }" :aria-hidden="!shown" :inert="!shown" @keydown.esc="overlay && close()"><slot :close="close" /></nav>
</template>

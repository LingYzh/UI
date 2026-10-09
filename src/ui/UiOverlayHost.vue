<script setup lang="ts">
import { computed, ref } from 'vue';
import { provideUiTheme } from './theme';
import { overlayAppearanceStyles, type OverlayAppearanceProps } from './overlay-appearance';
import type { OverlayContainerProps } from './overlay-container';

const props = defineProps<OverlayContainerProps & OverlayAppearanceProps & { active: boolean; scrim?: boolean | string; floating?: boolean }>();
const emit = defineEmits<{ 'click:outside': [event: MouseEvent] }>();
const layer = ref<HTMLElement>();
const theme = provideUiTheme(() => undefined);
const inline = computed(() => props.attach === true || (props.contained || props.absolute) && !props.attach);
// A disabled Teleport does not resolve a changed target. Reset `to` while inline so
// re-enabling it resolves the current container instead of reusing a stale target.
const target = computed(() => inline.value ? undefined : typeof props.attach === 'string' || typeof props.attach === 'object' ? props.attach : 'body');
const styles = computed(() => ({
    ...theme.styles.value,
    ...overlayAppearanceStyles(props),
    position: props.contained || props.absolute ? 'absolute' as const : 'fixed' as const,
    zIndex: props.zIndex ?? 'var(--ui-overlay-stack-z, 2000)'
}));
let pressedOutside = false;
function pointerDown(event: PointerEvent) {
    pressedOutside = event.target === event.currentTarget;
}
function pointerUp(event: PointerEvent) {
    pressedOutside = pressedOutside && event.target === event.currentTarget;
}
function clickOutside(event: MouseEvent) {
    // Closing on click keeps the layer present during document capture handlers.
    if (pressedOutside && event.target === event.currentTarget) emit('click:outside', event);
    pressedOutside = false;
}
defineExpose({ layer });
</script>

<template>
    <Teleport :to="target" :disabled="inline">
        <div ref="layer" class="ui-overlay-layer" :class="{ 'is-floating': props.floating }" :style="styles"
            :data-ui-theme="theme.name.value" :data-theme="theme.current.value.dark ? 'dark' : 'light'"
            v-show="props.active"
        >
            <div class="ui-overlay-scrim"
                v-if="props.scrim !== false && !props.floating"
                @pointerdown="pointerDown" @pointerup="pointerUp" @click="clickOutside"
            />
            <slot />
        </div>
    </Teleport>
</template>

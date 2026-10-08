<script setup lang="ts">
import { computed, mergeProps, ref, useAttrs } from 'vue';
import type { Ref } from 'vue';
import UOverlay from './UOverlay.vue';
import { dimensionLength } from './dimensions';
import type { OverlayProps } from './overlay-props';
import { useDefaults } from './defaults';

interface BottomSheetProps extends Omit<OverlayProps, 'location'> {
    inset?: boolean;
}
interface OverlayPublic {
    contentEl?: HTMLDialogElement;
    activatorEl?: HTMLElement;
    isActive?: boolean;
    open?: () => void;
    close?: () => void;
    updateLocation?: () => void;
}
type OverlaySlot = { isActive: Ref<boolean>; close: () => void };
type ActivatorSlot = {
    isActive: Ref<boolean>;
    open: boolean;
    props: Record<string, unknown>;
    activatorProps: Record<string, unknown>;
};

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rawProps = withDefaults(defineProps<BottomSheetProps>(), {
    modelValue: undefined,
    persistent: false,
    disabled: false,
    eager: false,
    activator: undefined,
    activatorProps: () => ({}),
    contentProps: () => ({}),
    contentClass: undefined,
    fullscreen: false,
    openOnClick: true,
    openOnHover: false,
    openOnFocus: false,
    openDelay: 0,
    closeDelay: 0,
    scrollStrategy: 'block',
    scrim: true,
    closeOnBack: true,
    captureFocus: true,
    retainFocus: true,
    inset: false
});
const props = useDefaults(rawProps, 'UBottomSheet');
const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'click:outside': [event: MouseEvent];
    keydown: [event: KeyboardEvent];
    afterEnter: [];
    afterLeave: [];
}>();
const overlay = ref<InstanceType<typeof UOverlay>>();
const forwardedProps = computed(() => {
    const { inset: _inset, ...rest } = props;
    return { ...rest, location: 'bottom' as const };
});
const sheetStyle = computed(() => ({
    height: dimensionLength(props.height),
    maxHeight: dimensionLength(props.maxHeight)
}));
const contentEl = computed(() => overlay.value?.contentEl);
const activatorEl = computed(() => overlay.value?.activatorEl);
const isActive = computed(() => overlay.value?.isActive ?? false);
function open(): void { overlay.value?.open?.(); }
function close(): void { overlay.value?.close?.(); }
function updateLocation(): void { overlay.value?.updateLocation?.(); }

defineExpose({ contentEl, activatorEl, isActive, open, close, updateLocation });
defineSlots<{
    default?: (scope: OverlaySlot) => any;
    activator?: (scope: ActivatorSlot) => any;
}>();
</script>

<template>
    <UOverlay
        ref="overlay"
        v-bind="mergeProps(forwardedProps, attrs)"
        @update:model-value="emit('update:modelValue', $event)"
        @click:outside="emit('click:outside', $event)"
        @keydown="emit('keydown', $event)"
        @after-enter="emit('afterEnter')"
        @after-leave="emit('afterLeave')"
    >
        <template v-if="$slots.activator" #activator="scope">
            <slot name="activator" v-bind="scope" />
        </template>
        <template #default="scope">
            <div class="ui-bottom-sheet" :class="{ 'is-inset': props.inset }" :style="sheetStyle">
                <slot v-bind="scope" />
            </div>
        </template>
    </UOverlay>
</template>

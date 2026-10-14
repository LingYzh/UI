<script setup lang="ts">
import { computed, mergeProps, ref, useAttrs, type Ref } from 'vue';
import UiDialog from './UiDialog.vue';
import { useDefaults } from './defaults';
import type { UiTransition } from './UiMaybeTransition.vue';
import { cancelPointerBlur } from './pointer-focus';

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const rawProps = withDefaults(defineProps<{
    open?: boolean;
    modelValue?: boolean;
    width?: number | string;
    maxWidth?: number | string;
    persistent?: boolean;
    scrollable?: boolean;
    contentLabel?: string;
    restoreFocus?: boolean;
    transition?: UiTransition;
}>(), {
    open: undefined,
    modelValue: undefined,
    width: 560,
    maxWidth: '100vw',
    persistent: false,
    scrollable: true,
    restoreFocus: true,
    transition: undefined,
});
const props = useDefaults(rawProps, 'UDrawer');
const forwardedProps = computed(() => {
    const { restoreFocus: _restoreFocus, ...rest } = props;
    return rest;
});
const emit = defineEmits<{
    'update:open': [value: boolean];
    'update:modelValue': [value: boolean];
    'present-change': [value: boolean];
    opened: [];
    closed: [];
    'click:outside': [event: MouseEvent];
    keydown: [event: KeyboardEvent];
    afterEnter: [];
    afterLeave: [];
}>();
const dialog = ref<InstanceType<typeof UiDialog>>();
const element = computed(() => dialog.value?.element);
const contentEl = computed(() => dialog.value?.contentEl);
const isActive = computed(() => dialog.value?.isActive ?? false);
let returnFocus: HTMLElement | undefined;
function handlePresent(value: boolean): void {
    if (value && typeof document !== 'undefined') {
        const candidate = dialog.value?.activatorEl ?? document.activeElement;
        returnFocus = candidate instanceof HTMLElement && candidate !== document.body ? candidate : undefined;
    }
    emit('present-change', value);
}
function handleClosed(): void {
    // A detail drawer returns to its trigger after pointer and keyboard dismissal alike.
    if (props.restoreFocus && attrs.retainFocus !== false && attrs['retain-focus'] !== false && returnFocus?.isConnected) {
        cancelPointerBlur(returnFocus);
        returnFocus.focus({ preventScroll: true });
    }
    returnFocus = undefined;
    emit('closed');
}
function open(): void { dialog.value?.open(); }
function close(): void { dialog.value?.close(); }
defineExpose({ element, contentEl, isActive, open, close });
type ContentSlot = { isActive: Ref<boolean>; close: () => void };
defineSlots<{
    default?: (scope: ContentSlot) => any;
    header?: (scope: ContentSlot) => any;
    footer?: (scope: ContentSlot) => any;
    activator?: (scope: { isActive: Ref<boolean>; open: boolean; props: Record<string, unknown>; activatorProps: Record<string, unknown> }) => any;
}>();
</script>

<template>
    <!-- Dialog already owns focus, scroll locks and dismissal; drawer adds only edge geometry. -->
    <UiDialog ref="dialog" class="ui-drawer" v-bind="mergeProps(forwardedProps, attrs)" placement="end"
        @update:open="emit('update:open', $event)"
        @update:model-value="emit('update:modelValue', $event)"
        @present-change="handlePresent"
        @opened="emit('opened')" @closed="handleClosed"
        @click:outside="emit('click:outside', $event)" @keydown="emit('keydown', $event)"
        @after-enter="emit('afterEnter')" @after-leave="emit('afterLeave')">
        <template v-if="$slots.activator" #activator="scope">
            <slot name="activator" v-bind="scope" />
        </template>
        <template v-if="$slots.header" #header="scope">
            <slot name="header" v-bind="scope" />
        </template>
        <template #default="scope">
            <slot v-bind="scope" />
        </template>
        <template v-if="$slots.footer" #footer="scope">
            <slot name="footer" v-bind="scope" />
        </template>
    </UiDialog>
</template>

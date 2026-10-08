<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, ref, watch } from 'vue';
import { useDefaults } from './defaults';

const rawProps = withDefaults(defineProps<{
    modelValue?: boolean | null;
    openDelay?: number | string;
    closeDelay?: number | string;
    disabled?: boolean;
}>(), {
    modelValue: null,
    openDelay: 0,
    closeDelay: 0,
    disabled: false
});
const props = useDefaults(rawProps, 'UHover');
const emit = defineEmits<{
    'update:modelValue': [value: boolean | null];
}>();

const instance = getCurrentInstance();
const localModel = ref<boolean | null>(props.modelValue);
const controlled = computed(() => {
    void props.modelValue;
    const incoming = instance?.vnode.props ?? {};
    const hasValue = Object.hasOwn(incoming, 'modelValue') || Object.hasOwn(incoming, 'model-value');
    const hasListener = Object.hasOwn(incoming, 'onUpdate:modelValue')
        || Object.hasOwn(incoming, 'onUpdate:model-value');
    return hasValue && hasListener;
});

watch([() => props.modelValue, controlled], ([value, isControlled]) => {
    if (!isControlled) localModel.value = value;
});

const isHovering = computed<boolean | null>({
    get() {
        return controlled.value ? props.modelValue : localModel.value;
    },
    set(value) {
        const current = controlled.value ? props.modelValue : localModel.value;
        if (current === value) return;
        if (!controlled.value) localModel.value = value;
        emit('update:modelValue', value);
    }
});

const pointerHover = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

function cancelDelay(): void {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
}

function schedule(value: boolean): void {
    cancelDelay();
    const delay = Number((value ? props.openDelay : props.closeDelay) ?? 0);
    timer = setTimeout(() => {
        timer = undefined;
        pointerHover.value = value;
        if (!props.disabled) isHovering.value = value;
    }, Math.max(0, delay));
}

function onEnter(): void {
    schedule(true);
}

function onLeave(): void {
    schedule(false);
}

watch(() => props.disabled, (disabled, wasDisabled) => {
    if (wasDisabled && !disabled) isHovering.value = pointerHover.value;
});

onBeforeUnmount(cancelDelay);

const hoverProps = {
    onMouseenter: onEnter,
    onMouseleave: onLeave,
    onFocusin: onEnter,
    onFocusout: onLeave
};
</script>

<template>
    <slot
        :is-hovering="isHovering"
        :props="hoverProps"
        :on-enter="onEnter"
        :on-leave="onLeave"
    />
</template>

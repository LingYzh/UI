<script setup lang="ts">
import { useDefaults } from './defaults';
import UKbd from './UKbd.vue';
import { HotkeySequenceMatcher, parseHotkeySequences } from './hotkey';
import { getCurrentInstance, onMounted, onBeforeUnmount, watch } from 'vue';

const rawProps = withDefaults(defineProps<{
    keys: string;
    disabled?: boolean;
    preventDefault?: boolean;
    allowInput?: boolean;
    editable?: boolean;
    exact?: boolean;
    sequenceTimeout?: number;
}>(), {
    preventDefault: true,
    exact: true,
    sequenceTimeout: 1000
});
const props = useDefaults(rawProps, 'UHotkeyListener');
const emit = defineEmits<{ trigger: [event: KeyboardEvent] }>();
const instance = getCurrentInstance();

const matcher = new HotkeySequenceMatcher();
watch(() => props.keys, keys => matcher.setSequences(parseHotkeySequences(keys)), { immediate: true });
watch(() => props.disabled, disabled => {
    if (disabled) matcher.reset();
});

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return target.isContentEditable
        || target.contentEditable === 'true'
        || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

function allowsEditableTarget(): boolean {
    const incoming = instance?.vnode.props ?? {};
    const hasEditable = Object.hasOwn(incoming, 'editable') && incoming.editable !== undefined;
    if (hasEditable) return props.editable;

    const hasAllowInput = (
        Object.hasOwn(incoming, 'allowInput') && incoming.allowInput !== undefined
    ) || (
        Object.hasOwn(incoming, 'allow-input') && incoming['allow-input'] !== undefined
    );
    if (hasAllowInput) return props.allowInput;

    return props.editable || props.allowInput;
}

function onKeydown(event: KeyboardEvent): void {
    if (props.disabled) return;

    if (!allowsEditableTarget() && (isEditableTarget(event.target) || isEditableTarget(document.activeElement))) {
        matcher.reset();
        return;
    }

    const result = matcher.match(event, {
        exact: props.exact,
        sequenceTimeout: props.sequenceTimeout,
        now: event.timeStamp
    });
    if (!result.matched) return;

    if (props.preventDefault) event.preventDefault();
    if (result.triggered) emit('trigger', event);
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown);
    matcher.reset();
});
</script>
<template>
    <slot :keys="props.keys"><UKbd :keys="props.keys" /></slot>
</template>

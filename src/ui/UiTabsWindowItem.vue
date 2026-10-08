<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, onUpdated, ref, useId } from 'vue';
import { vFocusModality } from './focus-modality';
import { useDefaults } from './defaults';
import UWindowItem from './UWindowItem.vue';
import { windowContextKey } from './window-state';
import { tabsKey, tabsWindowKey } from './tabs';

const rawProps = withDefaults(defineProps<{
    value?: unknown;
    eager?: boolean;
    disabled?: boolean;
    transition?: boolean | string;
    reverseTransition?: boolean | string;
}>(), { eager: undefined, disabled: undefined, transition: undefined, reverseTransition: undefined });
const props = useDefaults(rawProps, 'UTabsWindowItem');
const injectedContext = inject(tabsWindowKey);
if (!injectedContext) throw new Error('UiTabsWindowItem must be used inside UiTabsWindow.');
const context = injectedContext;
const tabs = inject(tabsKey, undefined);
const windowContext = inject(windowContextKey, undefined);
const ticketId = useId();
const marker = ref<HTMLElement>();
const panelElement = ref<HTMLElement>();
const entry = context.register(
    ticketId,
    marker,
    () => props.value,
    () => props.disabled ?? tabs?.entries.find(tab => tabs.compare(tab.value.value, entry.value.value))?.disabled.value ?? false
);
const value = entry.value;
const disabled = entry.disabled;
const selected = computed(() => windowContext?.isSelected(entry.internalValue) ?? false);
const element = computed(() => panelElement.value);
const slotScope = computed(() => ({ selected, isSelected: selected, disabled, value, element }));
const emit = defineEmits<{ 'group:selected': [value: { value: boolean }] }>();
const internalValue = entry.internalValue;

function reorder(): void {
    context.reorder();
}

onMounted(reorder);
onUpdated(reorder);
onBeforeUnmount(() => context.unregister(entry));
defineExpose({ element, selected, isSelected: selected, disabled, value });
</script>

<template>
    <span ref="marker" hidden aria-hidden="true" :data-ui-panel="ticketId" />
    <div
        ref="panelElement"
        v-focus-modality
        :id="`${context.prefix.value}-panel-${context.token(value)}`"
        class="ui-tab-panel ui-tabs-window-item"
        :class="{ 'is-active': selected }"
        role="tabpanel"
        :aria-labelledby="`${context.prefix.value}-tab-${context.token(value)}`"
        :aria-hidden="!selected"
        :aria-disabled="disabled || undefined"
        :inert="!selected"
        :tabindex="selected ? 0 : -1"
    >
        <UWindowItem
            :value="internalValue"
            :disabled="disabled"
            :eager="props.eager"
            :transition="props.transition"
            :reverse-transition="props.reverseTransition"
            @group:selected="emit('group:selected', $event)"
        >
            <slot v-bind="slotScope" />
        </UWindowItem>
    </div>
</template>

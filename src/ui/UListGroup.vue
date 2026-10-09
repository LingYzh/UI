<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, useId, watch } from 'vue';
import Icon from '../components/Icon.vue';
import UiCollapse from './UiCollapse.vue';
import { listParentKey, useList, type ListValue } from './list-completion';
import { useDefaults } from './defaults';
import { vPointerBlur } from './pointer-focus';
import { isNestedControlEvent } from './action-events';
const rawProps = withDefaults(defineProps<{ id?: string; value: ListValue; title?: string; disabled?: boolean; readonly?: boolean; modelValue?: boolean } & { ripple?: RippleOptions }>(), { ripple: true, id: undefined, modelValue: undefined, disabled: false, readonly: false });
const props = useDefaults(rawProps, 'UListGroup');
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const list = useList();
const parent = inject(listParentKey, ref(undefined));
provide(listParentKey, computed(() => props.value));
const disabled = computed(() => props.disabled || list?.disabled?.());
const readonly = computed(() => props.readonly || list?.readonly?.());
const element = ref<HTMLElement>();
const activator = ref<HTMLElement>();
let release: (() => void) | undefined;
watch([() => props.value, parent, disabled], () => {
    release?.();
    release = list?.register?.({
        value: props.value,
        parent: parent.value,
        kind: 'group',
        disabled: () => !!disabled.value,
        getElement: () => activator.value,
        getContainer: () => element.value
    });
}, { immediate: true });
onBeforeUnmount(() => release?.());
const local = ref(false);
onMounted(() => list?.refreshRegistrations?.());
const generatedId = useId();
const groupId = computed(() => props.id ?? `ui-list-group-${generatedId}`);
const expanded = computed(() => props.modelValue ?? (list ? list.isOpen(props.value) : local.value));
const active = computed(() => !!list?.isActive(props.value));
const selected = computed(() => !!list?.isSelected(props.value));

function toggle(event?: MouseEvent, on?: boolean) {
    const host = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
    if (host && isNestedControlEvent(event!, host)) return;
    if (disabled.value || readonly.value) return;
    const next = on ?? !expanded.value;
    if (list) list.toggleOpen(props.value, next, event);
    else local.value = next;
    emit('update:modelValue', next);
}

function select(on?: boolean, event?: Event): void {
    if (!readonly.value) list?.select(props.value, on, event);
}

function activate(on?: boolean, event?: Event): void {
    if (!readonly.value) list?.activate(props.value, on, event);
}

function onKeydown(event: KeyboardEvent): void {
    const host = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
    if (!host || isNestedControlEvent(event, host) || list?.navigationStrategy() === 'track') return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        list?.focus(event.key === 'ArrowDown' ? 1 : -1, host);
    } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        list?.focus(event.key === 'Home' ? 'first' : 'last');
    } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        host.click();
    }
}

function onFocus(event: FocusEvent): void {
    if (event.currentTarget instanceof HTMLElement) list?.setNavigationIndexFor(event.currentTarget);
}

const activatorProps = computed(() => ({
    id: `${groupId.value}-activator`,
    type: 'button' as const,
    class: 'ui-list-group-header',
    role: list?.nav() ? undefined : 'option',
    'data-ui-list-navigation-item': '',
    'data-ui-list-group-activator': '',
    'data-ui-list-tracked': list?.trackedId?.() === `${groupId.value}-activator` || undefined,
    'aria-controls': `${groupId.value}-items`,
    'aria-expanded': expanded.value,
    'aria-selected': !list?.nav() ? selected.value : undefined,
    'aria-disabled': disabled.value || undefined,
    'aria-readonly': readonly.value || undefined,
    disabled: disabled.value,
    tabindex: disabled.value ? -1 : list?.navigationStrategy() === 'track' ? -1 : 0,
    onClick: (event: MouseEvent) => toggle(event),
    onKeydown,
    onFocus
}));
</script>

<template>
    <div ref="element" :id="groupId" class="ui-list-group" role="group">
        <slot
            name="activator"
            :props="{ ...activatorProps, ripple: props.ripple }"
            :is-open="expanded"
            :is-active="active"
            :is-selected="selected"
            :is-disabled="disabled"
            :is-readonly="readonly"
            :toggle="toggle"
            :select="select"
            :activate="activate"
        >
            <button
                v-bind="activatorProps"
                ref="activator"
                v-ripple="props.ripple"
                v-pointer-blur
            >
                {{ props.title }}
                <Icon name="$expand" :size="18" class="ui-disclosure-icon is-down" :class="{ 'is-open': expanded }" />
            </button>
        </slot>
        <UiCollapse :id="`${groupId}-items`" :open="expanded" role="group" :aria-labelledby="`${groupId}-activator`"><div class="ui-list-group-items"><slot /></div></UiCollapse>
    </div>
</template>

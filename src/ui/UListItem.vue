<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { isNestedControlEvent } from './action-events';
import { vPointerBlur } from './pointer-focus';
import { computed, inject, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { listParentKey, useList, type ListValue } from './list-completion';
import { menuContextKey } from './menu';
import { useDefaults } from './defaults';
import Icon from '../components/Icon.vue';
import type { IconValue } from './icon-config';
import { useUiLink, type RouterProps } from './router';
const rawProps = withDefaults(defineProps<RouterProps & { id?: string; value?: ListValue; title?: string; subtitle?: string; appendIcon?: IconValue; appendText?: string; disabled?: boolean; readonly?: boolean; selectable?: boolean; activatable?: boolean; active?: boolean; tabindex?: number; role?: string } & { ripple?: RippleOptions }>(), { ripple: true,
    id: undefined, active: undefined, disabled: false, readonly: false, selectable: true, activatable: true, tabindex: undefined, role: undefined
});
const props = useDefaults(rawProps, 'UListItem');
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const list = useList();
const menu = inject(menuContextKey, null);
const parent = inject(listParentKey, ref(undefined));
const disabled = computed(() => props.disabled || list?.disabled?.());
const readonly = computed(() => props.readonly || list?.readonly?.());
let release: (() => void) | undefined;
const element = ref<HTMLElement>();
const generatedId = useId();
const itemId = computed(() => props.id ?? `ui-list-item-${generatedId}`);
watch([() => props.value, parent, disabled], () => {
    release?.();
    if (props.value !== undefined) {
        release = list?.register?.({
            value: props.value,
            parent: parent.value,
            kind: 'item',
            disabled: () => !!disabled.value,
            getElement: () => element.value,
            getContainer: () => element.value
        });
    }
}, { immediate: true });
onBeforeUnmount(() => release?.());
onMounted(() => list?.refreshRegistrations?.());
const link = useUiLink(props);
const selected = computed(() => props.value !== undefined && !!list?.isSelected(props.value));
const active = computed(() => props.active ?? (link.isActive.value || (props.value !== undefined && !!list?.isActive(props.value))));
const opened = computed(() => props.value !== undefined && !!list?.isOpen(props.value));
const itemRole = computed(() => props.role ?? (list?.nav() ? undefined : 'option'));
const tabIndex = computed(() => disabled.value ? -1 : list?.navigationStrategy() === 'track' ? -1 : props.tabindex ?? 0);
const managedByListSlot = computed(() => element.value?.hasAttribute('data-ui-list-managed') ?? false);
const slotState = computed(() => ({
    value: props.value,
    isActive: active.value,
    isSelected: selected.value,
    isOpen: opened.value,
    isDisabled: disabled.value,
    isReadonly: readonly.value,
    select,
    activate
}));

function select(on?: boolean, event?: Event): void {
    if (props.value !== undefined && !readonly.value) list?.select(props.value, on, event);
}

function activate(on?: boolean, event?: Event): void {
    if (props.value !== undefined && !readonly.value) list?.activate(props.value, on, event);
}

function choose(event: MouseEvent) {
    if (isNestedControlEvent(event, element.value)) return;
    if (disabled.value) { event.preventDefault(); return; }
    if (!managedByListSlot.value && props.value !== undefined && !readonly.value) {
        if (props.selectable) list?.select(props.value, undefined, event);
        if (props.activatable) list?.activate(props.value, undefined, event);
    }
    emit('click', event);
    link.navigate(event);
}
function keydown(event: KeyboardEvent) {
    if (isNestedControlEvent(event, element.value)) return;
    if (managedByListSlot.value) return;
    const menuOwnsNavigation = menu?.ownsNavigation() && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End');
    if (menuOwnsNavigation) return;
    if (list && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        list.focus(event.key === 'ArrowDown' ? 1 : -1, element.value);
    } else if (list && (event.key === 'Home' || event.key === 'End')) {
        event.preventDefault();
        list.focus(event.key === 'Home' ? 'first' : 'last');
    } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.value?.click();
    }
}
</script>

<template>
    <component :is="link.isLink.value ? 'a' : 'div'" :id="itemId" ref="element" class="ui-list-item"
        :class="{ 'is-selected': selected, 'is-active': active, 'has-append-text': !$slots.append && !!props.appendText, 'has-append-icon': !$slots.append && !!props.appendIcon }"
        :href="disabled ? undefined : link.href.value" data-ui-list-item data-ui-list-navigation-item :data-list-index="$attrs['data-list-index']" :role="itemRole"
        :data-ui-list-tracked="list?.trackedId?.() === itemId || undefined"
        :aria-selected="itemRole === 'option' ? selected : undefined" :aria-current="!itemRole && active ? 'page' : undefined"
        :aria-disabled="disabled" :aria-readonly="readonly || undefined" :tabindex="tabIndex"
        v-ripple="props.ripple" v-pointer-blur
        @click="choose" @keydown="keydown"
    >
        <span class="ui-list-item-prepend"
            v-if="$slots.prepend"
        >
            <slot name="prepend" v-bind="slotState" />
        </span>
        <span class="ui-list-item-content">
            <span class="ui-list-item-title">
                <slot name="title" v-bind="slotState">
                    {{ props.title }}
                    <slot v-if="!props.title" v-bind="slotState" />
                </slot>
            </span>
            <span class="ui-list-item-subtitle"
                v-if="props.subtitle || $slots.subtitle"
            >
                <slot name="subtitle" v-bind="slotState">{{ props.subtitle }}</slot>
            </span>
        </span>
        <span class="ui-list-item-append"
            v-if="$slots.append || props.appendText || props.appendIcon"
        >
            <slot name="append" v-bind="slotState">
                <span class="ui-list-item-append-text" :title="props.appendText"
                    v-if="props.appendText"
                >
                    {{ props.appendText }}
                </span>
                <Icon :icon="props.appendIcon"
                    v-if="props.appendIcon"
                />
            </slot>
        </span>
    </component>
</template>

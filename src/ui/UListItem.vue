<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { isNestedControlEvent } from './action-events';
import { vPointerBlur } from './pointer-focus';
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';
import { listParentKey, useList, type ListValue } from './list-completion';
import { useDefaults } from './defaults';
import Icon from '../components/Icon.vue';
import { useUiLink, type RouterProps } from './router';
const rawProps = withDefaults(defineProps<RouterProps & { value?: ListValue; title?: string; subtitle?: string; appendIcon?: string; appendText?: string; disabled?: boolean; selectable?: boolean; activatable?: boolean; active?: boolean } & { ripple?: RippleOptions }>(), { ripple: true,
    active: undefined, disabled: false, selectable: true, activatable: true
});
const props = useDefaults(rawProps, 'UListItem');
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const list = useList();
const parent = inject(listParentKey, ref(undefined));
const disabled = computed(() => props.disabled || list?.disabled?.());
let release: (() => void) | undefined;
watch([() => props.value, parent], () => { release?.(); if (props.value !== undefined) release = list?.register?.(props.value, parent.value, false, () => !!disabled.value); }, { immediate: true });
onBeforeUnmount(() => release?.());
const element = ref<HTMLElement>();
const link = useUiLink(props);
const selected = computed(() => props.value !== undefined && list?.selected().includes(props.value));
const active = computed(() => props.active ?? (link.isActive.value || (props.value !== undefined && list?.activated().includes(props.value))));
const itemRole = computed(() => list?.nav() ? undefined : 'option');
function choose(event: MouseEvent) {
    if (isNestedControlEvent(event, element.value)) return;
    if (disabled.value) { event.preventDefault(); return; }
    if (props.value !== undefined) {
        if (props.selectable && !list?.readonly?.()) list?.select(props.value);
        if (props.activatable && !list?.readonly?.()) list?.activate(props.value);
    }
    emit('click', event);
    link.navigate(event);
}
function keydown(event: KeyboardEvent) {
    if (isNestedControlEvent(event, element.value)) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); list?.focus(event.key === 'ArrowDown' ? 1 : -1, element.value); }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); list?.focus(event.key === 'Home' ? 'first' : 'last'); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); element.value?.click(); }
}
</script>

<template>
    <component :is="link.isLink.value ? 'a' : 'div'" ref="element" class="ui-list-item"
        :class="{ 'is-selected': selected, 'is-active': active, 'has-append-text': !$slots.append && !!props.appendText, 'has-append-icon': !$slots.append && !!props.appendIcon }"
        :href="disabled ? undefined : link.href.value" data-ui-list-item :role="itemRole"
        :aria-selected="itemRole === 'option' ? selected : undefined" :aria-current="!itemRole && active ? 'page' : undefined"
        :aria-disabled="disabled" :tabindex="disabled ? -1 : 0"
        v-ripple="props.ripple" v-pointer-blur
        @click="choose" @keydown="keydown"
    >
        <span class="ui-list-item-prepend"
            v-if="$slots.prepend"
        >
            <slot name="prepend" />
        </span>
        <span class="ui-list-item-content">
            <span class="ui-list-item-title">
                <slot name="title">
                    {{ props.title }}
                    <slot v-if="!props.title" />
                </slot>
            </span>
            <span class="ui-list-item-subtitle"
                v-if="props.subtitle || $slots.subtitle"
            >
                <slot name="subtitle">{{ props.subtitle }}</slot>
            </span>
        </span>
        <span class="ui-list-item-append"
            v-if="$slots.append || props.appendText || props.appendIcon"
        >
            <slot name="append">
                <span class="ui-list-item-append-text" :title="props.appendText"
                    v-if="props.appendText"
                >
                    {{ props.appendText }}
                </span>
                <Icon :name="props.appendIcon"
                    v-if="props.appendIcon"
                />
            </slot>
        </span>
    </component>
</template>

<script setup lang="ts">
import { Tabs } from '@vuetify/v0';
import { computed, inject, mergeProps, onBeforeUnmount, ref, useAttrs, useId, watch } from 'vue';
import UiIcon from '../components/Icon.vue';
import { tabsKey } from './tabs';
import { vPointerBlur } from './pointer-focus';
import { vRipple, type RippleOptions } from './ripple';
import { useUiLink, type RouterProps } from './router';
import { useDefaults } from './defaults';

const rawProps = withDefaults(defineProps<RouterProps & { value?: unknown; text?: string; icon?: string; ripple?: RippleOptions }>(), { ripple: undefined });
const props = useDefaults(rawProps, 'UTab');
const link = useUiLink(props);
defineOptions({ inheritAttrs: false });
const provided = inject(tabsKey);
if (!provided) throw new Error('UiTab must be used inside UiTabs.');
const context = provided;
const element = ref<HTMLButtonElement | HTMLAnchorElement>();
const userAttrs = useAttrs();
let pointerSelected: boolean | undefined;
let keyboardLinkClick = false;
const ticketId = useId();
const disabled = computed(() => context.disabled.value || !!props.disabled);
const registration = context.selection.register({
    id: ticketId,
    value: () => props.value,
    disabled: () => disabled.value
});
const value = computed(() => context.selection.effectiveValue(ticketId));
const isSelected = computed(() => context.selection.isSelected(ticketId));
const selectedClass = computed(() => context.selectedClass.value);
const tabId = computed(() => `${context.prefix.value}-tab-${context.token(value.value)}`);
const panelId = computed(() => `${context.prefix.value}-panel-${context.token(value.value)}`);
context.entries.push({ id: ticketId, element, value, disabled });
const emit = defineEmits<{ 'group:selected': [value: { value: boolean }] }>();
watch(isSelected, (selected, previous) => {
    if (selected !== previous) emit('group:selected', { value: selected });
});
watch(link.isActive, active => { if (active && !disabled.value) context.selection.select(ticketId, true); }, { immediate: true });
onBeforeUnmount(() => {
    const index = context.entries.findIndex(entry => entry.id === ticketId);
    if (index >= 0) context.entries.splice(index, 1);
    if (context.focusedId.value === ticketId) context.focusedId.value = undefined;
    registration.release();
});
function invoke(handler: unknown, event: Event) {
    if (Array.isArray(handler)) handler.forEach(handler => invoke(handler, event));
    else if (typeof handler === 'function') handler(event);
}
function select(selected = true) { context.selection.select(ticketId, selected); }
function toggle() { context.selection.toggle(ticketId); }
const slotScope = { isSelected, selected: isSelected, selectedClass, value, select, toggle };
function rovingId(): string | undefined {
    const enabled = context.entries.filter(entry => !entry.disabled.value);
    const focused = enabled.find(entry => entry.id === context.focusedId.value);
    if (focused) return focused.id;
    return enabled.find(entry => context.selection.isSelected(entry.id))?.id ?? enabled[0]?.id;
}
function nativeAttrs(attrs: Record<string, unknown>) {
    const { onClick: headlessClick, onKeydown: headlessKeydown, onFocus: headlessFocus, ...rest } = attrs;
    const { onClick: userClick, onKeydown: userKeydown, onFocus: userFocus, ...userRest } = userAttrs;
    void headlessClick;
    void headlessKeydown;
    return mergeProps(rest, userRest, {
        role: 'tab',
        id: tabId.value,
        'aria-controls': panelId.value,
        'aria-selected': isSelected.value,
        'aria-disabled': disabled.value || undefined,
        tabindex: rovingId() === ticketId ? 0 : -1,
        disabled: link.isLink.value ? undefined : disabled.value,
        onPointerdown: () => { pointerSelected = isSelected.value; },
        onFocus: (event: FocusEvent) => {
            invoke(userFocus, event);
            if (!event.defaultPrevented) {
                context.focusedId.value = ticketId;
                invoke(headlessFocus, event);
            }
        },
        onClick: (event: MouseEvent) => {
            invoke(userClick, event);
            const wasSelected = pointerSelected;
            pointerSelected = undefined;
            if (event.defaultPrevented) return;
            if (disabled.value) {
                if (link.isLink.value) event.preventDefault();
                return;
            }
            if (!keyboardLinkClick) select(wasSelected === undefined ? !isSelected.value : !wasSelected);
            link.navigate(event);
        },
        onKeydown: (event: KeyboardEvent) => {
            invoke(userKeydown, event);
            if (event.defaultPrevented || disabled.value) return;
            const host = element.value?.closest<HTMLElement>('[role="tablist"]');
            const buttons = Array.from(host?.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('.ui-tab:not(:disabled):not([aria-disabled="true"])') ?? []);
            const index = buttons.indexOf(element.value!);
            const vertical = host?.getAttribute('aria-orientation') === 'vertical';
            const rtl = host && getComputedStyle(host).direction === 'rtl';
            const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
            const backward = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
            const target = event.key === 'Home' ? buttons[0] : event.key === 'End' ? buttons.at(-1)
                : event.key === forward && index >= 0 ? buttons[(index + 1) % buttons.length]
                    : event.key === backward && index >= 0 ? buttons[(index + buttons.length - 1) % buttons.length] : undefined;
            if (target) { event.preventDefault(); target.focus({ preventScroll: true }); }
            else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                select(!isSelected.value);
                if (link.isLink.value) {
                    keyboardLinkClick = true;
                    element.value?.click();
                    keyboardLinkClick = false;
                }
            } else invoke(headlessKeydown, event);
        }
    });
}
defineExpose({ element, value, isSelected, selected: isSelected, selectedClass, select, toggle, focus: () => element.value?.focus() });
</script>

<template>
    <Tabs.Item :key="ticketId" v-slot="{ attrs }" :id="ticketId" :value="ticketId" :disabled="disabled" :el="element" renderless>
        <component :is="link.isLink.value ? 'a' : 'button'" v-pointer-blur ref="element" v-ripple="props.ripple ?? context.ripple.value" v-bind="nativeAttrs(attrs)" :href="link.href.value" :aria-current="link.isActive.value ? 'page' : undefined" :data-ui-tab="ticketId" :type="link.isLink.value ? undefined : 'button'" class="ui-tab" :class="isSelected ? selectedClass : undefined">
            <UiIcon v-if="props.icon" :name="props.icon" :size="15" /><span class="ui-tab-label"><slot v-bind="slotScope">{{ props.text }}</slot></span>
        </component>
    </Tabs.Item>
</template>

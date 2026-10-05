<script setup lang="ts">
import { Tabs } from '@vuetify/v0';
import { computed, inject, mergeProps, onBeforeUnmount, ref, useAttrs, useId } from 'vue';
import UiIcon from '../components/Icon.vue';
import { tabsKey, type TabValue } from './tabs';
import { vPointerBlur } from './pointer-focus';
import { vRipple, type RippleOptions } from './ripple';

const props = withDefaults(defineProps<{ value?: TabValue; text?: string; disabled?: boolean; icon?: string; ripple?: RippleOptions }>(), { ripple: undefined });
defineOptions({ inheritAttrs: false });
const provided = inject(tabsKey);
if (!provided) throw new Error('UiTab must be used inside UiTabs.');
const context = provided;
const element = ref<HTMLButtonElement>();
const userAttrs = useAttrs();
let pointerSelected: boolean | undefined;
const ticketId = useId();
const value = computed(() => props.value ?? context.entries.findIndex(entry => entry.id === ticketId));
const disabled = computed(() => context.disabled.value || !!props.disabled);
const tabId = computed(() => `${context.prefix.value}-tab-${context.token(value.value)}`);
const panelId = computed(() => `${context.prefix.value}-panel-${context.token(value.value)}`);
context.entries.push({ id: ticketId, element, value, disabled });
onBeforeUnmount(() => { const index = context.entries.findIndex(entry => entry.id === ticketId); if (index >= 0) context.entries.splice(index, 1); });
function invoke(handler: unknown, event: Event) {
    if (Array.isArray(handler)) handler.forEach(handler => invoke(handler, event));
    else if (typeof handler === 'function') handler(event);
}
function canClear() { return context.mandatory.value === false && context.model.value === value.value; }
function nativeAttrs(attrs: Record<string, unknown>) {
    const { onClick, onKeydown, ...rest } = attrs;
    const { onClick: userClick, onKeydown: userKeydown, ...userRest } = userAttrs;
    return mergeProps(rest, userRest, {
        onPointerdown: () => { pointerSelected = context.model.value === value.value; },
        onClick: (event: MouseEvent) => {
            invoke(userClick, event);
            const clear = context.mandatory.value === false && (event.detail > 0 ? pointerSelected ?? canClear() : canClear());
            pointerSelected = undefined;
            if (disabled.value || event.defaultPrevented) return;
            if (clear) context.model.value = null;
            else invoke(onClick, event);
        },
        onKeydown: (event: KeyboardEvent) => {
            invoke(userKeydown, event);
            if (event.defaultPrevented || disabled.value) return;
            const host = element.value?.closest<HTMLElement>('[role="tablist"]');
            const buttons = Array.from(host?.querySelectorAll<HTMLButtonElement>('.ui-tab:not(:disabled)') ?? []);
            const index = buttons.indexOf(element.value!);
            const vertical = host?.getAttribute('aria-orientation') === 'vertical';
            const rtl = host && getComputedStyle(host).direction === 'rtl';
            const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
            const backward = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
            const target = event.key === 'Home' ? buttons[0] : event.key === 'End' ? buttons.at(-1)
                : event.key === forward ? buttons[(index + 1) % buttons.length]
                    : event.key === backward ? buttons[(index + buttons.length - 1) % buttons.length] : undefined;
            if (target) { event.preventDefault(); target.focus({ preventScroll: true }); }
            else if (context.activation.value === 'manual' && (event.key === 'Enter' || event.key === ' ') && canClear()) {
                event.preventDefault(); context.model.value = null;
            } else invoke(onKeydown, event);
        }
    });
}
defineExpose({ element, focus: () => element.value?.focus() });
</script>

<template>
    <Tabs.Item :key="`${typeof value}:${value}`" v-slot="{ attrs }" :id="ticketId" :value="value" :disabled="disabled" :el="element" renderless>
        <button v-pointer-blur ref="element" v-ripple="ripple ?? context.ripple.value" v-bind="nativeAttrs(attrs)" :id="tabId" :aria-controls="panelId" :data-ui-tab="ticketId" type="button" class="ui-tab">
            <UiIcon v-if="icon" :name="icon" :size="15" /><span class="ui-tab-label"><slot>{{ text }}</slot></span>
        </button>
    </Tabs.Item>
</template>

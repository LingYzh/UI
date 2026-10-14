<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useDefaults } from './defaults';
import UTransition from './UTransition.vue';
import UFab from './UFab.vue';

const rawProps = withDefaults(defineProps<{
    disabled?: boolean;
    closeOnClick?: boolean;
    direction?: 'top' | 'bottom' | 'left' | 'right';
}>(), { closeOnClick: true, direction: 'top' });
const props = useDefaults(rawProps, 'USpeedDial');
const model = defineModel<boolean>({ default: false });
const root = ref<HTMLElement>();
const actions = ref<HTMLElement>();
const trigger = ref<HTMLElement>();
const focusableSelector = 'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';

function isHTMLElement(value: unknown): value is HTMLElement {
    return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
}

function setTrigger(value: unknown): void {
    let candidate: unknown = isHTMLElement(value) ? value : undefined;
    if (!candidate && value && typeof value === 'object') {
        const instance = value as { $el?: unknown; element?: unknown };
        candidate = instance.element ?? instance.$el;
        if (!isHTMLElement(candidate) && candidate && typeof candidate === 'object' && 'value' in candidate) {
            candidate = (candidate as { value?: unknown }).value;
        }
    }
    if (!isHTMLElement(candidate)) return;
    trigger.value = candidate.matches(focusableSelector)
        ? candidate
        : candidate.querySelector<HTMLElement>(focusableSelector) ?? candidate;
}

function rememberTrigger(event?: Event): void {
    if (isHTMLElement(event?.currentTarget)) {
        setTrigger(event.currentTarget);
    } else if (!trigger.value) {
        setTrigger(root.value?.querySelector('.u-fab') ?? null);
    }
}

function getAvailableActions(): HTMLElement[] {
    return Array.from(actions.value?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])
        .filter((element) => element.tabIndex >= 0
            && !element.matches(':disabled, [aria-disabled="true"]')
            && !element.closest('[inert], [aria-disabled="true"]'));
}

function focusAction(reverse = false): void {
    const available = getAvailableActions();
    (reverse ? available.at(-1) : available[0])?.focus();
}

function open(): void {
    if (!props.disabled) model.value = true;
}

function close(restoreFocus = false): void {
    model.value = false;
    if (restoreFocus) void nextTick(() => trigger.value?.focus());
}

function toggle(event?: MouseEvent): void {
    if (props.disabled) return;
    rememberTrigger(event);
    if (model.value) {
        close();
        return;
    }
    model.value = true;
    if (event?.detail === 0) void nextTick(() => focusAction());
}

function getArrowKeys(): { next: string; previous: string } {
    switch (props.direction) {
        case 'bottom': return { next: 'ArrowDown', previous: 'ArrowUp' };
        case 'left': return { next: 'ArrowLeft', previous: 'ArrowRight' };
        case 'right': return { next: 'ArrowRight', previous: 'ArrowLeft' };
        default: return { next: 'ArrowUp', previous: 'ArrowDown' };
    }
}

function onActivatorKeydown(event: KeyboardEvent): void {
    if (props.disabled || model.value) return;
    const { next, previous } = getArrowKeys();
    if (event.key !== next && event.key !== previous) return;
    event.preventDefault();
    event.stopPropagation();
    rememberTrigger(event);
    model.value = true;
    void nextTick(() => focusAction(event.key === previous));
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && model.value
        && (root.value?.contains(event.target as Node) || root.value?.contains(document.activeElement))) {
        event.preventDefault();
        close(true);
        return;
    }
    if (!model.value || !root.value?.contains(event.target as Node)) return;
    const available = getAvailableActions();
    if (!available.length) return;
    if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        (event.key === 'End' ? available.at(-1) : available[0])?.focus();
        return;
    }
    const { next, previous } = getArrowKeys();
    if (event.key !== next && event.key !== previous) return;
    event.preventDefault();
    const currentIndex = available.indexOf(document.activeElement as HTMLElement);
    const step = event.key === previous ? -1 : 1;
    const nextIndex = currentIndex < 0
        ? (step < 0 ? available.length - 1 : 0)
        : (currentIndex + step + available.length) % available.length;
    available[nextIndex]?.focus();
}

function onPointerDown(event: PointerEvent): void {
    if (model.value && root.value && !root.value.contains(event.target as Node)) close();
}

function onAction(): void {
    if (props.closeOnClick) close();
}

watch(() => props.disabled, (disabled) => {
    if (disabled && model.value) close();
});

onMounted(() => {
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('keydown', onKeydown);
});
defineExpose({ open, close, toggle });
</script>

<template>
    <div ref="root" class="u-speed-dial" :data-direction="props.direction">
        <slot
            name="activator"
            :props="{ ref: setTrigger, onClick: toggle, onKeydown: onActivatorKeydown, 'aria-expanded': model, 'aria-haspopup': 'menu', disabled: props.disabled }"
            :open="model"
            :toggle="toggle"
        >
            <UFab
                :ref="setTrigger"
                :model-value="true"
                :disabled="props.disabled"
                label="快捷操作"
                :aria-expanded="model"
                aria-haspopup="menu"
                @click="toggle"
                @keydown="onActivatorKeydown"
            />
        </slot>
        <UTransition variant="scale">
            <div
                v-if="model"
                ref="actions"
                class="u-speed-dial-actions"
                :aria-hidden="!model ? 'true' : undefined"
                :inert="!model"
                @click="onAction"
            ><slot :close="close" /></div>
        </UTransition>
    </div>
</template>

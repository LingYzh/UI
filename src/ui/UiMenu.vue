<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, useId, watch } from 'vue';
import { menuContextKey, type MenuPlacement } from './menu';
import { useDefaults } from './defaults';

const rawProps = withDefaults(defineProps<{
    placement?: MenuPlacement;
    location?: MenuPlacement;
    modelValue?: boolean;
    open?: boolean;
    openOnClick?: boolean;
    openOnHover?: boolean;
    openOnFocus?: boolean;
    openDelay?: number;
    closeDelay?: number;
    persistent?: boolean;
    /** 自由内容面板（role=dialog，Tab 自然导航）；默认为菜单（role=menu，方向键导航）。 */
    panel?: boolean;
    /** 显式可访问名称；不传时由触发器文字命名。 */
    label?: string;
}>(), { placement: 'bottom-start', modelValue: undefined, open: undefined, panel: false, openOnClick: true, openOnHover: false, openOnFocus: false, openDelay: 0, closeDelay: 0, persistent: false });
const props = useDefaults(rawProps, 'UMenu');
const emit = defineEmits<{ 'update:open': [value: boolean]; 'update:modelValue': [value: boolean] }>();
const localOpen = ref(false);
const open = computed({ get: () => props.modelValue ?? props.open ?? localOpen.value, set: (value: boolean) => { localOpen.value = value; emit('update:open', value); emit('update:modelValue', value); } });
const menuPlacement = computed(() => props.location ?? props.placement);

// CSS 标识符只允许字母、数字、- 和 _；useId 的结果需要转义后才能用作 anchor 名称。
const uid = useId().replace(/[^\w-]/g, '-');
const surfaceId = `ui-menu-${uid}`;
const activatorId = `ui-menu-trigger-${uid}`;
const anchorName = `--ui-menu-${uid}`;
const surface = ref<HTMLElement>();
let keyboardInteraction = false;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let deliberateClose = false;
const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// 触发器使用原生 popovertarget：浏览器负责切换、点击外部关闭与 Esc，且点击触发器本身不会先被轻关闭再重开。
const activatorProps = computed(() => ({
    id: activatorId,
    popovertarget: props.openOnClick ? surfaceId : undefined,
    'aria-haspopup': props.panel ? 'dialog' : 'menu',
    'aria-expanded': open.value,
    'aria-controls': surfaceId,
    style: `anchor-name: ${anchorName}`,
    onPointerdown: () => { keyboardInteraction = false; },
    onKeydown: () => { keyboardInteraction = true; },
    onMouseenter: () => { if (props.openOnHover) scheduleShow(); },
    onMouseleave: () => { if (props.openOnHover) scheduleHide(); },
    onFocus: () => { if (props.openOnFocus && keyboardInteraction) scheduleShow(); },
    onBlur: () => { if (props.openOnFocus) scheduleHide(); }
}));

function scheduleShow() {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    showTimer = setTimeout(() => { open.value = true; }, Math.max(0, props.openDelay));
}
function scheduleHide() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (!surface.value?.contains(document.activeElement)) open.value = false; }, Math.max(0, props.closeDelay));
}
function cancelHide() { clearTimeout(hideTimer); }

function pointerInteraction() { keyboardInteraction = false; }
function keyboardUsed() { keyboardInteraction = true; }

function activator() {
    return document.getElementById(activatorId);
}
function items() {
    return Array.from(surface.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled), [role="menuitemcheckbox"]:not(:disabled)') ?? []);
}
function isShown() {
    return Boolean(surface.value?.matches(':popover-open'));
}
function show() {
    if (!surface.value || isShown()) return;
    // source 让浏览器把触发器视为 invoker，与 popovertarget 打开的行为一致。
    (surface.value.showPopover as (options?: { source?: HTMLElement }) => void)({ source: activator() ?? undefined });
}
/** 同步关闭：Tab 离开时需要在默认焦点移动前隐藏。 */
function close() {
    deliberateClose = true;
    if (isShown()) surface.value!.hidePopover();
    else { open.value = false; deliberateClose = false; }
}
function focusInitial() {
    const element = surface.value;
    if (!element || !isShown()) return;
    const target = props.panel ? element.querySelector<HTMLElement>(FOCUSABLE) ?? element : items()[0] ?? element;
    target.focus({ preventScroll: true });
}
function restoreFocus() {
    const active = document.activeElement;
    const trigger = activator();
    if (keyboardInteraction) {
        if (!active || active === document.body || surface.value?.contains(active)) trigger?.focus({ preventScroll: true });
    } else if (active === trigger) trigger?.blur();
}
function toggled(event: Event) {
    const shown = (event as ToggleEvent).newState === 'open';
    if (!shown && props.persistent && !deliberateClose && open.value) { nextTick(show); return; }
    deliberateClose = false;
    if (open.value !== shown) open.value = shown;
    if (shown) nextTick(focusInitial);
    else restoreFocus();
}
function keydown(event: KeyboardEvent) {
    keyboardInteraction = true;
    if (props.panel) return;
    if (event.key === 'Tab') {
        close();
        return;
    }
    const list = items();
    if (!list.length) return;
    const index = list.indexOf(document.activeElement as HTMLElement);
    const targets: Record<string, number> = {
        ArrowDown: (index + 1) % list.length,
        ArrowUp: index <= 0 ? list.length - 1 : index - 1,
        Home: 0,
        End: list.length - 1
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    list[targets[event.key]].focus();
}

watch(open, (value) => (value ? show() : close()), { flush: 'post' });
onMounted(() => {
    document.addEventListener('pointerdown', pointerInteraction, true);
    document.addEventListener('keydown', keyboardUsed, true);
    if (open.value) show();
});
onBeforeUnmount(() => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    document.removeEventListener('pointerdown', pointerInteraction, true);
    document.removeEventListener('keydown', keyboardUsed, true);
});
provide(menuContextKey, { close });
defineExpose({ close });
</script>

<template>
    <div class="ui-menu">
        <slot name="activator" :props="activatorProps" :activator-props="activatorProps" :open="open" />
        <div
            :id="surfaceId"
            ref="surface"
            popover="auto"
            class="ui-menu-surface"
            :class="{ 'is-panel': props.panel }"
            :data-placement="menuPlacement"
            :role="props.panel ? 'dialog' : 'menu'"
            :aria-label="props.label"
            :aria-labelledby="props.label ? undefined : activatorId"
            tabindex="-1"
            :style="`position-anchor: ${anchorName}`"
            @toggle="toggled"
            @pointerdown.capture="keyboardInteraction = false"
            @keydown="keydown"
            @mouseenter="cancelHide"
            @mouseleave="props.openOnHover && scheduleHide()"
        >
            <slot :close="close" />
        </div>
    </div>
</template>

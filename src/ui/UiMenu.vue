<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, useId, watch } from 'vue';
import { menuContextKey, type MenuPlacement } from './menu';

const props = withDefaults(defineProps<{
    placement?: MenuPlacement;
    /** 自由内容面板（role=dialog，Tab 自然导航）；默认为菜单（role=menu，方向键导航）。 */
    panel?: boolean;
    /** 显式可访问名称；不传时由触发器文字命名。 */
    label?: string;
}>(), { placement: 'bottom-start', panel: false });
const open = defineModel<boolean>('open', { default: false });

// CSS 标识符只允许字母、数字、- 和 _；useId 的结果需要转义后才能用作 anchor 名称。
const uid = useId().replace(/[^\w-]/g, '-');
const surfaceId = `ui-menu-${uid}`;
const activatorId = `ui-menu-trigger-${uid}`;
const anchorName = `--ui-menu-${uid}`;
const surface = ref<HTMLElement>();
const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// 触发器使用原生 popovertarget：浏览器负责切换、点击外部关闭与 Esc，且点击触发器本身不会先被轻关闭再重开。
const activatorProps = computed(() => ({
    id: activatorId,
    popovertarget: surfaceId,
    'aria-haspopup': props.panel ? 'dialog' : 'menu',
    'aria-expanded': open.value,
    'aria-controls': surfaceId,
    style: `anchor-name: ${anchorName}`
}));

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
    if (isShown()) surface.value!.hidePopover();
}
function focusInitial() {
    const element = surface.value;
    if (!element || !isShown()) return;
    const target = props.panel ? element.querySelector<HTMLElement>(FOCUSABLE) ?? element : items()[0] ?? element;
    target.focus({ preventScroll: true });
}
function restoreFocus() {
    const active = document.activeElement;
    if (!active || active === document.body || surface.value?.contains(active)) activator()?.focus({ preventScroll: true });
}
function toggled(event: Event) {
    const shown = (event as ToggleEvent).newState === 'open';
    if (open.value !== shown) open.value = shown;
    if (shown) nextTick(focusInitial);
    else restoreFocus();
}
function keydown(event: KeyboardEvent) {
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
    if (open.value) show();
});
provide(menuContextKey, { close });
defineExpose({ close });
</script>

<template>
    <div class="ui-menu">
        <slot name="activator" :props="activatorProps" :open="open" />
        <div
            :id="surfaceId"
            ref="surface"
            popover="auto"
            class="ui-menu-surface"
            :class="{ 'is-panel': panel }"
            :data-placement="placement"
            :role="panel ? 'dialog' : 'menu'"
            :aria-label="label"
            :aria-labelledby="label ? undefined : activatorId"
            tabindex="-1"
            :style="`position-anchor: ${anchorName}`"
            @toggle="toggled"
            @keydown="keydown"
        >
            <slot :close="close" />
        </div>
    </div>
</template>

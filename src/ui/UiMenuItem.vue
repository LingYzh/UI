<script setup lang="ts">
import { inject } from 'vue';
import { menuContextKey } from './menu';
import UListItem from './UListItem.vue';
import type { RippleOptions } from './ripple';

const props = withDefaults(defineProps<{
    /** 传入布尔值时成为 menuitemcheckbox 并显示勾选状态。 */
    checked?: boolean;
    disabled?: boolean;
    danger?: boolean;
    /** 选择后保持菜单打开，适用于多选勾选。 */
    keepOpen?: boolean;
    ripple?: RippleOptions;
}>(), { ripple: true, checked: undefined, disabled: false, danger: false, keepOpen: false });
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const menu = inject(menuContextKey, null);

function select(event: MouseEvent): void {
    if (props.disabled) {
        event.preventDefault();
        return;
    }
    emit('click', event);
    if (!props.keepOpen) menu?.close();
}
</script>

<template>
    <UListItem
        class="ui-menu-item"
        :class="{ 'is-danger': danger }"
        :role="checked === undefined ? 'menuitem' : 'menuitemcheckbox'"
        :aria-checked="checked"
        :data-ui-menu-keep-open="keepOpen || undefined"
        :disabled="disabled"
        :ripple="props.ripple"
        :selectable="false"
        :activatable="false"
        :tabindex="-1"
        @click="select"
    >
        <template #prepend v-if="$slots.icon">
            <span class="ui-menu-item-icon">
                <slot name="icon" />
            </span>
        </template>
        <template #title>
            <span class="ui-menu-item-label">
                <slot />
            </span>
        </template>
        <template #append v-if="$slots.trailing || checked !== undefined">
            <span v-if="$slots.trailing" class="ui-menu-item-trailing">
                <slot name="trailing" />
            </span>
            <svg
                v-if="checked !== undefined"
                class="ui-menu-item-check"
                :class="{ 'is-visible': checked }"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
        </template>
    </UListItem>
</template>

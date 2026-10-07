<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { vPointerBlur } from './pointer-focus';
import { inject } from 'vue';
import { menuContextKey } from './menu';

const props = withDefaults(defineProps<{
    /** 传入布尔值时成为 menuitemcheckbox 并显示勾选状态。 */
    checked?: boolean;
    disabled?: boolean;
    danger?: boolean;
    /** 选择后保持菜单打开，适用于多选勾选。 */
    keepOpen?: boolean;
} & { ripple?: RippleOptions }>(), { ripple: true, checked: undefined, disabled: false, danger: false, keepOpen: false });
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const menu = inject(menuContextKey, null);

function select(event: MouseEvent) {
    emit('click', event);
    if (!props.keepOpen) menu?.close();
}
</script>

<template>
    <!-- 菜单项不进入 Tab 顺序，由 UiMenu 统一处理方向键漫游焦点。 -->
    <button v-ripple="props.ripple" v-pointer-blur
        type="button"
        class="ui-menu-item"
        :class="{ 'is-danger': danger }"
        :role="checked === undefined ? 'menuitem' : 'menuitemcheckbox'"
        :aria-checked="checked"
        :disabled="disabled"
        tabindex="-1"
        @click="select"
    >
        <span v-if="$slots.icon" class="ui-menu-item-icon"><slot name="icon" /></span>
        <span class="ui-menu-item-label"><slot /></span>
        <span v-if="$slots.trailing" class="ui-menu-item-trailing"><slot name="trailing" /></span>
        <svg v-if="checked !== undefined" class="ui-menu-item-check" :class="{ 'is-visible': checked }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
    </button>
</template>

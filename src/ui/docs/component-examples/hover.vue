<script setup>
import { ref } from 'vue';
import { UButton, UHover, USwitch } from '../../index';
const disabled = ref(false);
const hovering = ref(null);
</script>

<template>
    <div class="component-demo" data-demo-component="UHover">
        <u-switch v-model="disabled" label="禁用状态同步（仍记录区域内的指针状态）" />
        <u-hover v-model="hovering" :disabled="disabled" v-slot="{ isHovering, props: hoverProps }">
            <div
                v-bind="hoverProps"
                class="completion-panel"
                :style="{ background: isHovering ? 'var(--accent-soft)' : 'var(--surface)' }"
            >
                {{ isHovering ? '指针或键盘位于此区域' : '移入或聚焦查看状态' }}
                <u-button size="sm" class="mt-3">可聚焦的操作</u-button>
            </div>
        </u-hover>
        <output>
            公开悬停状态：{{
                hovering === null ? '尚未进入' : hovering ? '已进入' : '已离开'
            }}；禁用时保留，恢复时同步。
        </output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    justify-items: stretch;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
.component-demo > .ui-button {
    justify-self: start;
}
.completion-panel {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
}
</style>

<script setup>
import { ref } from 'vue';
import {
    UExpansionPanel,
    UExpansionPanelText,
    UExpansionPanelTitle,
    UExpansionPanels,
} from '../../index';
const panel = ref('overview');
const selectedEvents = ref([]);
</script>

<template>
    <div class="component-demo" data-demo-component="UExpansionPanels">
        <u-expansion-panels v-model="panel" focusable>
            <u-expansion-panel value="overview">
                <u-expansion-panel-title>组件说明</u-expansion-panel-title>
                <u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text>
            </u-expansion-panel>
            <u-expansion-panel value="details" @group:selected="selectedEvents.push($event.value)">
                <u-expansion-panel-title>更多说明</u-expansion-panel-title>
                <u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text>
            </u-expansion-panel>
        </u-expansion-panels>
        <u-expansion-panels mandatory="force">
            <u-expansion-panel
                title="自动索引 0"
                text="未传 value 时按位置输出；force 自动选择首个可用面板。"
            />
            <u-expansion-panel title="自动索引 1" text="默认离场后卸载，eager 可保留内容。" />
        </u-expansion-panels>
        <output>
            当前：{{ panel ?? '无' }}；第二项状态变化：{{ selectedEvents.join(' → ') || '暂无' }}
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
</style>

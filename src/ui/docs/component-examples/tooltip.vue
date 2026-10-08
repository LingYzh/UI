<script setup>
import { ref } from 'vue';
import { UTooltip, UButton, USwitch, USelect } from '../../index';
const visible = ref(false);
const disabled = ref(false);
const interactive = ref(true);
const location = ref('top');
</script>

<template>
    <div class="component-demo" data-demo-component="UTooltip">
        <u-select v-model="location" :items="['top', 'bottom start', 'start', 'end']" label="提示位置" />
        <u-switch v-model="disabled" label="禁用标准提示" />
        <u-switch v-model="interactive" label="提示内容可交互" />
        <div class="tooltip-examples">
            <u-tooltip text="默认插槽仍为触发器；保留旧用法。"><u-button>原有文本提示</u-button></u-tooltip>
            <u-tooltip v-model="visible" :location="location" :disabled="disabled" :interactive="interactive" :close-delay="180" scroll-strategy="reposition" standard-protocol>
                <template #activator="{ props: activatorProps }"><u-button v-bind="activatorProps">标准插槽提示</u-button></template>
                <template #default="{ isActive }">
                    <div class="tooltip-content">
                        <span>可用 activator 和内容插槽配置提示。</span>
                        <u-button v-if="interactive" size="small"
                            @click="isActive.value = false">关闭提示</u-button>
                    </div>
                </template>
            </u-tooltip>
        </div>
        <output>标准提示：{{ visible ? '显示' : '关闭' }}。支持键盘聚焦、Esc、延迟、交互内容与滚动定位。</output>
    </div>
</template>

<style scoped>
.component-demo { display: grid; gap: 16px; min-width: 0; }
.tooltip-examples { display: flex; flex-wrap: wrap; gap: 16px; padding-block: 32px; }
.tooltip-content { display: grid; gap: 8px; }
.component-demo > output { color: var(--muted); font-size: 14px; }
</style>

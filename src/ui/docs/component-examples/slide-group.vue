<script setup>
import { ref } from 'vue';
import { UButton, USlideGroup, USlideGroupItem, USwitch } from '../../index';
const selected = ref('project-1');
const multiple = ref(false);
const vertical = ref(false);
const disabled = ref(false);
const center = ref(true);
function changeMultiple(value) {
    selected.value = value ? [selected.value].filter(Boolean) : selected.value[0];
}
</script>

<template>
    <div class="component-demo" data-demo-component="USlideGroup">
        <div class="demo-row">
            <u-switch
                v-model="multiple"
                label="多选（最多3项）"
                @update:model-value="changeMultiple"
            />
            <u-switch v-model="vertical" label="垂直" />
            <u-switch v-model="center" label="居中当前项" />
            <u-switch v-model="disabled" label="禁用组" />
        </div>
        <u-slide-group
            v-model="selected"
            :multiple="multiple"
            mandatory
            :max="3"
            :disabled="disabled"
            :center-active="center"
            :direction="vertical ? 'vertical' : 'horizontal'"
            show-arrows="always"
            scroll-snap="center"
            aria-label="项目选择"
        >
            <u-slide-group-item
                v-for="item in 12"
                :key="item"
                v-slot="{ isSelected, toggle }"
                :value="`project-${item}`"
                :disabled="item === 5"
            >
                <u-button
                    :variant="isSelected ? 'tonal' : 'outlined'"
                    :color="isSelected ? 'primary' : undefined"
                    :aria-pressed="isSelected"
                    :disabled="disabled || item === 5"
                    @click="toggle"
                >
                    项目 {{ item }}{{ item === 5 ? ' · 禁用' : '' }}
                </u-button>
            </u-slide-group-item>
        </u-slide-group>
        <output>当前值：{{ JSON.stringify(selected) }}</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    font-size: 14px;
    color: var(--muted);
    overflow-wrap: anywhere;
}
.demo-row {
    margin: 0;
}
</style>

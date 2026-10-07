<script setup>
import { ref } from 'vue';
import { UButton, USlideGroup, USlideGroupItem } from '../../index';
const selected = ref();
const selections = ref(0);
</script>

<template>
    <div class="component-demo" data-demo-component="USlideGroupItem">
        <u-slide-group v-model="selected" show-arrows="always" aria-label="无包装选择项">
            <u-slide-group-item
                v-for="item in ['概览', '文件', '设置']"
                :key="item"
                v-slot="{ isSelected, selectedClass, toggle }"
                :value="item"
                selected-class="demo-selected"
                @group:selected="selections++"
            >
                <u-button
                    :class="selectedClass"
                    :variant="isSelected ? 'tonal' : 'text'"
                    color="primary"
                    :aria-pressed="isSelected"
                    @click="toggle"
                >
                    {{ item }}
                </u-button>
            </u-slide-group-item>
        </u-slide-group>
        <p>Item 通过插槽提供选择状态和操作；直接使用你自己的按钮、卡片或其他可操作内容。</p>
        <output>当前：{{ selected || '未选择' }}；状态变化：{{ selections }}</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.component-demo p {
    margin: 0;
    color: var(--muted);
    line-height: 1.7;
}
.component-demo > output {
    font-size: 14px;
    color: var(--muted);
}
</style>

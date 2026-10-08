<script setup>
import { ref } from 'vue';
import { UPicker, UOptionPicker, UButton, USwitch } from '../../index';
const value = ref('开发');
const landscape = ref(false);
const hideHeader = ref(false);
const saved = ref('');
const items = ['设计', '开发', '文档'];
function save() {
    saved.value = value.value;
}
</script>

<template>
    <div class="component-demo" data-demo-component="UPicker">
        <u-switch v-model="landscape" label="横向布局" />
        <u-switch v-model="hideHeader" label="隐藏标题区域" />
        <u-picker title="工作类别" :landscape="landscape" :hide-header="hideHeader" divided border>
            <template #header>
                <strong>{{ value }}</strong>
            </template>
            <u-option-picker v-model="value" :items="items" />
            <template #actions>
                <u-button @click="save">确认</u-button>
            </template>
        </u-picker>
        <output>已确认：{{ saved || '尚未确认' }}</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
</style>

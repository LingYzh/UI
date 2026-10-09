<script setup>
import { ref } from 'vue';
import { mdiAccountOutline } from '@mdi/js';
import { UField, USelect, USwitch } from '../../index';
const value = ref('');
const focused = ref(false);
const disabled = ref(false);
const variant = ref('outlined');
const variants = [
    'outlined',
    'filled',
    'underlined',
    'plain',
    'solo',
    'solo-inverted',
    'solo-filled',
];
function clear() {
    value.value = '';
}
</script>

<template>
    <div class="component-demo" data-demo-component="UField">
        <u-select v-model="variant" :items="variants" label="字段变体" />
        <u-switch v-model="disabled" label="禁用字段" />
        <u-field
            v-model:focused="focused"
            :variant="variant"
            :dirty="!!value"
            :disabled="disabled"
            label="自定义原生输入"
            description="字段提供装饰、标签、焦点和 ARIA；输入值由页面管理。"
            clearable
            :prepend-inner-icon="mdiAccountOutline"
            @click:clear="clear"
        >
            <template #default="{ props: inputProps }">
                <input v-model="value" v-bind="inputProps" :disabled="disabled" />
            </template>
        </u-field>
        <output>当前值：{{ value || '空' }}；焦点：{{ focused ? '有' : '无' }}</output>
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

<script setup>
import { ref } from 'vue';
import { UButton, UNumberInput, USwitch } from '../../index';
const number = ref(5);
const price = ref(1234.5);
const loading = ref(false);
const persistentCounter = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="UNumberInput">
        <u-number-input
            v-model="number"
            label="执行并发数"
            :min="1"
            :max="10"
            :step="1"
            hint="按钮与方向键均遵守 1–10 边界。"
        />
        <u-number-input
            :model-value="1234.5"
            locale="de-DE"
            control-variant="end"
            grouping
            label="末端按钮与本地化小数"
        />
        <u-number-input :model-value="5" control-variant="stacked" inset label="上下排列按钮" />
        <u-switch v-model="loading" label="显示加载状态" />
        <u-switch v-model="persistentCounter" label="始终显示计数" />
        <u-number-input
            v-model="price"
            label="金额与自定义按钮"
            prefix="¥"
            suffix="元"
            clearable
            :loading="loading"
            counter="12"
            :persistent-counter="persistentCounter"
            :step="0.5"
            :min="0"
            control-variant="end"
            data-number-custom-demo
        >
            <template #increment="{ props }">
                <u-button v-bind="props" variant="text">+</u-button>
            </template>
            <template #decrement="{ props }">
                <u-button v-bind="props" variant="text">−</u-button>
            </template>
            <template #counter="{ counter }">输入 {{ counter }} 个字符</template>
        </u-number-input>
        <output>金额模型：{{ price === null ? 'null' : price }}</output>
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

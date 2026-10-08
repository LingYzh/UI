<script setup>
import { ref } from 'vue';
import { URadioGroup, URadio, USwitch } from '../../index';
const radio = ref('a');
const disabled = ref(false);
const readonly = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="URadioGroup">
        <u-switch v-model="disabled" label="禁用整组" />
        <u-switch v-model="readonly" label="整组只读" />
        <u-radio-group
            v-model="radio"
            :disabled="disabled"
            :readonly="readonly"
            label="单选组"
            hint="URadio读取组的模型、名称、禁用和只读状态。"
        >
            <u-radio value="a">默认</u-radio>
            <u-radio value="b">自定义</u-radio>
        </u-radio-group>
        <output>当前选择：{{ radio }}</output>
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

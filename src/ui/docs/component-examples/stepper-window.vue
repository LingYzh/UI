<script setup>
import { ref } from 'vue';
import {
    UStepper,
    UStepperActions,
    UStepperItem,
    UStepperWindow,
    UStepperWindowItem,
} from '../../index';
const step = ref(1);
</script>

<template>
    <div class="component-demo" data-demo-component="UStepperWindow">
        <u-stepper v-model="step">
            <u-stepper-item :value="1" title="填写资料" :complete="step > 1" editable />
            <u-stepper-item :value="2" title="完成" editable />
            <u-stepper-window>
                <u-stepper-window-item :value="1">填写当前步骤所需的资料。</u-stepper-window-item>
                <u-stepper-window-item :value="2">资料已准备好。</u-stepper-window-item>
            </u-stepper-window>
            <u-stepper-actions />
        </u-stepper>
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

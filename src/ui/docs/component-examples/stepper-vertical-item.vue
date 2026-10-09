<script setup>
import { ref } from 'vue';
import { UStepperVertical, UStepperVerticalItem } from '../../index';

const step = ref(1);
</script>

<template>
    <div class="component-demo" data-demo-component="UStepperVerticalItem">
        <UStepperVertical v-model="step">
            <UStepperVerticalItem :value="1" title="准备" subtitle="当前步骤展开正文" editable>
                请确认资料后继续。
            </UStepperVerticalItem>
            <UStepperVerticalItem :value="2" title="完成" editable>
                点击下一步会发出完成事件。
            </UStepperVerticalItem>
        </UStepperVertical>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
</style>

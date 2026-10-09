<script setup>
import { ref } from 'vue';
import { UStepperVertical, UStepperVerticalItem, UStepperVerticalActions } from '../../index';

const step = ref(1);
const status = ref('尚未完成');
function finished() {
    status.value = '已完成';
}
</script>

<template>
    <div class="component-demo" data-demo-component="UStepperVerticalActions">
        <UStepperVertical v-model="step" @click:finish="finished">
            <UStepperVerticalItem :value="1" title="当前步骤" editable>
                <template #actions>
                    <UStepperVerticalActions prev-text="返回" next-text="完成" disabled="prev" />
                </template>
            </UStepperVerticalItem>
        </UStepperVertical>
        <output aria-live="polite">{{ status }}</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
output {
    color: var(--muted);
    font-size: var(--ui-font-body-small);
}
</style>

<script setup>
import { ref } from 'vue';
import { UCheckbox, UCheckboxGroup, USelectionControl } from '../../index';
const checks = ref(['a']);
const bounded = ref(['a', 'b']);
</script>

<template>
    <div class="component-demo" data-demo-component="UCheckboxGroup">
        <u-checkbox-group v-model="checks" label="多选组">
            <u-selection-control value="a" label="测试" />
            <u-selection-control value="b" label="文档" />
        </u-checkbox-group>
        <UCheckboxGroup
            v-model="bounded"
            label="带边框，至少两项、最多三项"
            :min="2"
            :max="3"
            inline
        >
            <UCheckbox value="a" label="第一项" bordered />
            <UCheckbox value="b" label="第二项" bordered />
            <UCheckbox value="c" label="第三项" bordered />
            <UCheckbox value="d" label="第四项" bordered />
        </UCheckboxGroup>
        <output>{{ bounded }}</output>
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

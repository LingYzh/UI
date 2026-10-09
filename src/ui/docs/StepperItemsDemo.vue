<script setup>
import { computed, ref } from 'vue';
import { UStepper, UStepperVertical, USwitch } from '../index';

const horizontal = ref(1);
const vertical = ref(1);
const verified = ref(false);
const hideActions = ref(false);
const items = computed(() => [
    { value: 1, title: '填写信息', props: { subtitle: '检查资料', editable: true } },
    { value: 2, title: '确认内容', props: { subtitle: '通过后可继续', editable: true, rules: [() => verified.value || '请确认内容'] } },
    { value: 3, title: '完成', props: { editable: true } }
]);
</script>

<template>
    <section class="stepper-items-demo">
        <div class="stepper-items-settings">
            <USwitch v-model="verified" label="内容已确认" />
            <USwitch v-model="hideActions" label="隐藏操作" />
        </div>
        <UStepper v-model="horizontal" :items="items" :hide-actions="hideActions" mandatory="force">
            <template #item="{ value }">
                <p class="stepper-items-copy">{{ value === 1 ? '填写基本信息后继续。' : value === 2 ? '确认内容可消除规则错误。' : '全部步骤已完成。' }}</p>
            </template>
        </UStepper>
        <UStepperVertical v-model="vertical" :items="items" :hide-actions="hideActions" mandatory="force">
            <template #item="{ value }">
                <p class="stepper-items-copy">{{ value === 1 ? '第一步内容会逐项展开。' : value === 2 ? '规则通过后可前往下一步。' : '最后一步内容。' }}</p>
            </template>
        </UStepperVertical>
    </section>
</template>

<style scoped>
.stepper-items-demo { display: grid; gap: 24px; width: 100%; }
.stepper-items-settings { display: flex; flex-wrap: wrap; gap: 16px; }
.stepper-items-copy { margin: 0; color: var(--muted); line-height: 1.6; }
</style>

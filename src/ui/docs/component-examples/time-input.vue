<script setup>
import { ref } from 'vue';
import { UTimeInput } from '../../index';
const single = ref('14:30');
const range = ref(['09:00:00', '17:30:00']);
const limited = ref(null);
const editable = ref('14:30');
</script>

<template>
    <div class="component-demo" data-demo-component="UTimeInput">
        <UTimeInput v-model="single" label="时间" clearable />
        <UTimeInput v-model="range" label="时间范围" mode="range" use-seconds clearable />
        <UTimeInput
            v-model="limited"
            label="工作时段"
            :allowed-ranges="[
                ['09:15:20', '10:30:10'],
                ['13:00:00', '17:30:00'],
            ]"
            use-seconds
            clearable
        />
        <UTimeInput v-model="editable" label="允许手动填写" format="12h" editable />
        <UTimeInput model-value="09:00" label="只读" readonly />
        <UTimeInput model-value="09:00" label="禁用" disabled />
        <output>模型：{{ single }} / {{ range }} / {{ limited }} / {{ editable }}</output>
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
    overflow-wrap: anywhere;
}
</style>

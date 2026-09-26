<script setup>
import { ref } from 'vue';
import { UiTabs, UiTabPanel, UiCard } from '../index';
import LiveExample from './LiveExample.vue';
import CodeBlock from './CodeBlock.vue';
const props = defineProps({ example: { type: Object, required: true } });
const selected = ref('preview');
const tabs = [{ id: 'preview', label: '交互示例' }, { id: 'source', label: '源码' }];
const prefix = `example-card-${props.example.id}`;
</script>

<template>
    <UiCard flush class="docs-example" :aria-labelledby="`${example.id}-heading`">
        <template #header><div class="docs-example-heading"><h3 :id="`${example.id}-heading`">{{ example.title }}</h3><p>{{ example.description }}</p></div></template>
        <UiTabs v-model="selected" :items="tabs" :id-prefix="prefix" variant="underline" :aria-label="`${example.title}展示方式`" class="docs-example-tabs" />
        <UiTabPanel :model-value="selected" value="preview" :id-prefix="prefix"><LiveExample :example="example.id" /></UiTabPanel>
        <UiTabPanel :model-value="selected" value="source" :id-prefix="prefix"><CodeBlock :code="example.code" /></UiTabPanel>
    </UiCard>
</template>

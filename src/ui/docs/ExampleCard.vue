<script setup>
import { ref } from 'vue';
import { UTabs, UTabsWindow, UTabsWindowItem, UCard } from '../index';
import LiveExample from './LiveExample.vue';
import CodeBlock from './CodeBlock.vue';
const props = defineProps({ example: { type: Object, required: true } });
const selected = ref('preview');
const tabs = [{ id: 'preview', label: '交互示例' }, { id: 'source', label: '源码' }];
const prefix = `example-card-${props.example.id}`;
</script>

<template>
    <u-card flush class="docs-example" :aria-labelledby="`${example.id}-heading`">
        <template #header><div class="docs-example-heading"><h3 :id="`${example.id}-heading`">{{ example.title }}</h3><p>{{ example.description }}</p></div></template>
        <u-tabs v-model="selected" :items="tabs" :id-prefix="prefix" variant="underline" :aria-label="`${example.title}展示方式`" class="docs-example-tabs" />
        <u-tabs-window
            v-model="selected"
            :id-prefix="prefix"
            :keyboard="false"
        >
            <u-tabs-window-item value="preview" eager :transition="false">
                <LiveExample :example="example.id" />
            </u-tabs-window-item>
            <u-tabs-window-item value="source" eager :transition="false">
                <CodeBlock :code="example.code" />
            </u-tabs-window-item>
        </u-tabs-window>
    </u-card>
</template>

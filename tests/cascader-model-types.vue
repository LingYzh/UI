<script setup lang="ts">
import { ref } from 'vue';
import UiCascader from '../src/ui/UiCascader.vue';
import type { CascaderItem, CascaderValue } from '../src/ui/cascader';

const items: readonly CascaderItem[] = [{ value: 'root', label: 'Root', children: [{ value: 'leaf', label: 'Leaf' }] }];
const defaultSingleModel = ref<CascaderValue[] | null>([]);
const explicitSingleModel = ref<CascaderValue[] | null>([]);
const multipleModel = ref<CascaderValue[][] | null>([]);
const literalMultipleModel = ref<CascaderValue[][] | null>([]);
const dynamicModel = ref<CascaderValue[] | CascaderValue[][] | null>([]);
const multipleMode = ref(false);
</script>

<template>
    <UiCascader v-model="defaultSingleModel" :items="items" />
    <UiCascader v-model="explicitSingleModel" :items="items" :multiple="false" />
    <UiCascader v-model="multipleModel" :items="items" multiple />
    <UiCascader v-model="literalMultipleModel" :items="items" :multiple="true" />
    <UiCascader v-model="multipleModel" :items="items" multiple filterable checkStrictly chips collapseTags :maxCollapseTags="2" />
    <UiCascader v-model="dynamicModel" :items="items" :multiple="multipleMode" />
    <!-- @vue-expect-error single mode keeps the legacy one-path model -->
    <UiCascader v-model="multipleModel" :items="items" />
    <!-- @vue-expect-error multiple mode requires complete path arrays -->
    <UiCascader v-model="explicitSingleModel" :items="items" multiple />
</template>

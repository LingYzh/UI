<script setup>
import { UiTable } from '../index';
const headers = [{ key: 'name', title: '名称' }, { key: 'type', title: '类型 / 参数' }, { key: 'fallback', title: '默认值' }, { key: 'description', title: '说明' }];
defineProps({ title: { type: String, required: true }, rows: { type: Array, default: () => [] }, empty: { type: String, default: '无公开 API。' } });
</script>

<template>
    <div class="docs-api-block">
        <h3>{{ title }}</h3>
        <UiTable v-if="rows.length" class="docs-api-table" :headers="headers" :items="rows" item-value="name" :label="`${title} API 表格`" dense><template #item.name="{ value }"><code>{{ value }}</code></template><template #item.type="{ value }"><code>{{ value }}</code></template></UiTable>
        <p v-else class="docs-api-empty">{{ empty }}</p>
    </div>
</template>

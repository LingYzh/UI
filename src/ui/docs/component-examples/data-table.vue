<script setup>
import { ref } from 'vue';
import { UDataTable } from '../../index';
const headers = [{ key: 'title', title: '工作区', sortable: true }, { key: 'category', title: '分类', sortable: true }, { key: 'count', title: '任务数', sortable: true, align: 'end' }];
const items = Array.from({ length: 60 }, (_, index) => ({ id: index, title: `工作区 ${index + 1}`, category: index % 2 ? '设计' : '开发', count: index * 7 % 31 }));
const search = ref('');
const selected = ref([]);
const expanded = ref([]);
const groups = ref([]);
const title = ref('工作区名称');
</script>

<template>
    <div class="component-demo" data-demo-component="UDataTable">
        <u-data-table v-model="selected" v-model:expanded="expanded" v-model:group-by="groups" :headers="headers" :items="items" :search="search" show-select show-expand multi-sort label="工作区列表"><template #expanded-row="{ item }">{{ item.title }} · {{ item.category }} · 可在插槽放入详情。</template></u-data-table>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>

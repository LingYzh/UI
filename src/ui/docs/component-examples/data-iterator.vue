<script setup>
import { ref } from 'vue';
import { UButton, UCard, UDataIterator } from '../../index';
const items = Array.from({ length: 60 }, (_, index) => ({
    id: index,
    title: `工作区 ${index + 1}`,
    category: index % 2 ? '设计' : '开发',
    count: (index * 7) % 31,
}));
const page = ref(1);
const title = ref('工作区名称');
</script>

<template>
    <div class="component-demo" data-demo-component="UDataIterator">
        <u-data-iterator v-model:page="page" :items="items" :items-per-page="4">
            <template #default="{ items: current, pageCount, nextPage, prevPage }">
                <div class="completion-grid">
                    <u-card
                        v-for="item in current"
                        :key="item.id"
                        :title="item.title"
                        :subtitle="item.category"
                    >
                        {{ item.count }} 个任务
                    </u-card>
                </div>
                <div class="completion-toolbar mt-4">
                    <u-button :disabled="page === 1" @click="prevPage">上一页</u-button>
                    <output>{{ page }} / {{ pageCount }}</output>
                    <u-button :disabled="page === pageCount" @click="nextPage">下一页</u-button>
                </div>
            </template>
        </u-data-iterator>
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

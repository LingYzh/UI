<script setup>
import { ref } from 'vue';
import {
    UButton,
    UCard,
    UDataIterator,
    UTextField,
    USwitch,
    UCheckbox,
    UCollapse,
} from '../../index';
const items = Array.from({ length: 60 }, (_, index) => ({
    id: index,
    title: `工作区 ${index + 1}`,
    category: index % 2 ? '设计' : '开发',
    count: (index * 7) % 31,
    selectable: index % 7 !== 0,
}));
const page = ref(1);
const selected = ref([]);
const expanded = ref([]);
const standardPage = ref(1);
const group = ref(false);
const disabled = ref(false);
const search = ref('');
const options = ref();
const currentCount = ref(0);
</script>

<template>
    <div class="component-demo" data-demo-component="UDataIterator">
        <u-data-iterator
            v-model:page="page"
            :items="items"
            :items-per-page="4"
            :standard-protocol="false"
        >
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
        <u-text-field v-model="search" label="标准迭代器搜索" />
        <u-switch v-model="group" label="按类别分组" />
        <u-switch v-model="disabled" label="禁用选择与分页" />
        <u-data-iterator
            v-model="selected"
            v-model:page="standardPage"
            v-model:expanded="expanded"
            :items="items"
            :search="search"
            :items-per-page="4"
            :group-by="group ? [{ key: 'category', order: 'asc' }] : []"
            :disabled="disabled"
            item-selectable="selectable"
            open-all
            standard-protocol
            @update:options="options = $event"
            @update:current-items="currentCount = $event.length"
        >
            <template #header="{ selectAll, toggleSort, itemsCount }">
                <div class="iterator-actions">
                    <u-button :disabled="disabled" @click="selectAll(true)">选择本页</u-button>
                    <u-button :disabled="disabled" @click="toggleSort('count')">
                        按任务数排序
                    </u-button>
                    <span>筛选后 {{ itemsCount }} 条</span>
                </div>
            </template>
            <template
                #default="{
                    groupedItems,
                    isGroupOpen,
                    toggleGroup,
                    isSelected,
                    toggleSelect,
                    isExpanded,
                    toggleExpand,
                }"
            >
                <div class="iterator-rows">
                    <template
                        v-for="item in groupedItems"
                        :key="item.type === 'group' ? item.id : item.key"
                    >
                        <u-button
                            v-if="item.type === 'group'"
                            variant="text"
                            :disabled="disabled"
                            :aria-expanded="isGroupOpen(item)"
                            @click="toggleGroup(item)"
                        >
                            {{ isGroupOpen(item) ? '收起' : '展开' }} {{ item.value }} 分组
                        </u-button>
                        <u-card v-else :title="item.raw.title" :subtitle="item.raw.category">
                            <div class="iterator-actions">
                                <u-checkbox
                                    :model-value="isSelected(item)"
                                    :disabled="disabled || !item.selectable"
                                    @update:model-value="toggleSelect(item)"
                                >
                                    选择此项
                                </u-checkbox>
                                <u-button
                                    variant="text"
                                    :disabled="disabled"
                                    :aria-expanded="isExpanded(item)"
                                    @click="toggleExpand(item)"
                                >
                                    详情
                                </u-button>
                            </div>
                            <u-collapse :open="isExpanded(item)">
                                <p>
                                    {{ item.raw.count }} 个任务；标准包装项包含 raw、value 和
                                    selectable。
                                </p>
                            </u-collapse>
                        </u-card>
                    </template>
                </div>
            </template>
            <template #no-data>未找到匹配的工作区。</template>
            <template #footer="{ page: currentPage, pageCount, prevPage, nextPage }">
                <div class="iterator-actions">
                    <u-button :disabled="disabled || currentPage === 1" @click="prevPage">
                        上一页
                    </u-button>
                    <output>{{ currentPage }} / {{ pageCount }}</output>
                    <u-button :disabled="disabled || currentPage === pageCount" @click="nextPage">
                        下一页
                    </u-button>
                </div>
            </template>
        </u-data-iterator>
        <output>
            已选 {{ selected.length }} 项；当前事件 {{ currentCount }} 行；查询页码
            {{ options?.page || 1 }}。上方第一个迭代器保留原始项用法。
        </output>
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
.iterator-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding-block: 12px;
}
.iterator-rows {
    display: grid;
    gap: 12px;
}
</style>

<script setup>
import { ref } from 'vue';
import { UDataTable, UButton, USwitch } from '../../index';
const replaceBody = ref(false);
const hideHeader = ref(false);
const items = [
    { id: 1, title: '工作区 Alpha', count: 12 },
    { id: 2, title: '工作区 Beta', count: 24 },
];
const headers = [
    { key: 'title', title: '工作区' },
    { key: 'count', title: '任务数' },
];
</script>

<template>
    <div class="table-demo" data-table-demo="slots">
        <div class="table-demo-controls">
            <u-switch v-model="replaceBody" label="用 body 替换默认行" />
            <u-switch v-model="hideHeader" label="隐藏默认表头" />
        </div>
        <u-data-table
            :headers="headers"
            :items="items"
            :hide-default-header="hideHeader"
            :mobile="false"
            label="结构插槽"
        >
            <template #caption>
                <caption>caption 描述表格数据</caption>
            </template>
            <template #colgroup>
                <colgroup>
                    <col style="width: 65%" />
                    <col />
                </colgroup>
            </template>
            <template #body.prepend="{ columns }">
                <tr class="table-demo-summary">
                    <td :colspan="columns.length">body.prepend：默认数据行前的说明</td>
                </tr>
            </template>
            <template #item="{ item, props }">
                <tr v-bind="props">
                    <td>
                        <strong>{{ item.title }}</strong>
                    </td>
                    <td>{{ item.count }}</td>
                </tr>
            </template>
            <template v-if="replaceBody" #body="{ items, columns }">
                <tr>
                    <td :colspan="columns.length">
                        body 替换：当前 {{ items.length }} 条数据，自定义布局。
                    </td>
                </tr>
            </template>
            <template #body.append="{ columns }">
                <tr class="table-demo-summary">
                    <td :colspan="columns.length">body.append：默认行之后</td>
                </tr>
            </template>
            <template #tfoot="{ columns }">
                <tfoot>
                    <tr>
                        <td :colspan="columns.length">tfoot：原生表格尾部</td>
                    </tr>
                </tfoot>
            </template>
            <template #bottom="{ page, pageCount, setPage }">
                <div class="table-demo-controls">
                    <span>bottom 替换默认页脚：{{ page }} / {{ pageCount }}</span>
                    <u-button dense @click="setPage(1)">回到首页</u-button>
                </div>
            </template>
        </u-data-table>
    </div>
</template>

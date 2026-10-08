<script setup>
import { ref } from 'vue';
import { UTable, USelect, USwitch } from '../../index';
const density = ref('default');
const gridlines = ref('horizontal');
const fixed = ref(true);
const items = Array.from({ length: 24 }, (_, index) => ({
    id: index,
    title: `工作区 ${index + 1}`,
    count: index + 3,
}));
</script>

<template>
    <div class="table-demo" data-table-demo="layout">
        <div class="table-demo-controls">
            <u-select v-model="density" aria-label="表格密度" dense>
                <option value="default">默认密度</option>
                <option value="comfortable">舒适</option>
                <option value="compact">紧凑</option>
            </u-select>
            <u-select v-model="gridlines" aria-label="网格线" dense>
                <option value="horizontal">水平线</option>
                <option value="vertical">垂直线</option>
                <option value="all">全部网格线</option>
            </u-select>
            <u-switch v-model="fixed" label="固定表头与汇总" />
        </div>
        <u-table
            :density="density"
            :gridlines="gridlines"
            :fixed-header="fixed"
            :fixed-footer="fixed"
            :height="260"
            striped="even"
            hover
            label="原生结构表格"
        >
            <template #top>
                <p class="table-demo-note">
                    top 在滚动区域上方；caption、thead、tbody、tfoot 使用原生表格语义。
                </p>
            </template>
            <caption>工作区统计</caption>
            <thead>
                <tr>
                    <th scope="col">工作区</th>
                    <th scope="col">文件数</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in items" :key="item.id">
                    <td>{{ item.title }}</td>
                    <td>{{ item.count }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th scope="row">合计</th>
                    <td>{{ items.reduce((sum, item) => sum + item.count, 0) }}</td>
                </tr>
            </tfoot>
            <template #bottom>
                <p class="table-demo-note">bottom 保留在容器下方，不随数据行滚动。</p>
            </template>
        </u-table>
    </div>
</template>

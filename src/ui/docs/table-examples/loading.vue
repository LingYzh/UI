<script setup>
import { ref } from 'vue';
import {
    UDataTable,
    UDataTableServer,
    UDataTableVirtual,
    UProgressLinear,
    USelect,
    USwitch,
} from '../../index';

const loading = ref(true);
const kind = ref('server');
const side = ref('start');
const tables = { client: UDataTable, server: UDataTableServer, virtual: UDataTableVirtual };
const headers = [
    { key: 'name', title: '项目', fixed: 'start', width: 160 },
    { key: 'status', title: '状态' },
];
const items = [
    { id: 1, name: '组件库', status: '等待响应' },
    { id: 2, name: '管理端', status: '保留当前记录' },
];
</script>

<template>
    <div class="table-loading-demo">
        <div class="table-loading-controls">
            <u-switch label="正在加载" v-model="loading" />
            <u-select
                label="表格类型"
                :items="[
                    { title: '服务端表格', value: 'server' },
                    { title: '普通数据表格', value: 'client' },
                    { title: '虚拟表格', value: 'virtual' },
                ]"
                v-model="kind"
            />
            <u-select
                label="加载位置"
                :items="[
                    { title: '顶部', value: 'start' },
                    { title: '底部', value: 'end' },
                    { title: '顶部和底部', value: 'both' },
                ]"
                v-model="side"
            />
        </div>
        <div>
            <p>线性进度参考</p>
            <u-progress-linear label="线性进度参考" indeterminate v-if="loading" />
        </div>
        <component
            :is="tables[kind]"
            :headers="headers"
            :items="items"
            :loading="loading ? { color: 'primary', side } : false"
            :height="220"
            :mobile="false"
            item-value="id"
            label="加载动画对照表格"
            fixed-header
            v-bind="kind === 'server' ? { itemsLength: items.length } : {}"
        />
    </div>
</template>

<style scoped>
.table-loading-demo {
    display: grid;
    gap: 16px;
}
.table-loading-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 16px;
}
.table-loading-controls > .ui-select {
    flex: 1 1 180px;
}
.table-loading-demo p {
    margin: 0 0 8px;
}
</style>

<script setup>
import { ref } from 'vue';
import { UButton, UFab, USpeedDial } from '../../index';
const dial = ref(false);
const action = ref('尚未执行');
</script>

<template>
    <div class="component-demo" data-demo-component="USpeedDial">
        <u-speed-dial v-model="dial">
            <template #activator="{ props: activatorProps }">
                <u-fab v-bind="activatorProps" label="打开快捷操作" />
            </template>
            <u-button size="sm" @click="action = '已新建项目'">新建项目</u-button>
            <u-button size="sm" @click="action = '已导出配置'">导出配置</u-button>
        </u-speed-dial>
        <output role="status">{{ action }}</output>
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

<script setup>
import { ref } from 'vue';
import { UButton, UFab, USpeedDial, USelect } from '../../index';
const direction = ref('top');
const dial = ref(false);
const action = ref('尚未执行');
</script>

<template>
    <div class="component-demo" data-demo-component="USpeedDial">
        <u-select
            v-model="direction"
            :items="['top', 'bottom', 'left', 'right']"
            label="展开方向"
        />
        <div class="dial-stage">
            <u-speed-dial v-model="dial" :direction="direction">
                <template #activator="{ props: activatorProps }">
                    <u-fab v-bind="activatorProps" label="打开快捷操作" />
                </template>
                <u-button size="sm" @click="action = '已新建项目'">新建</u-button>
                <u-button size="sm" @click="action = '已导出配置'">导出</u-button>
            </u-speed-dial>
        </div>
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
.dial-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
.component-demo > .ui-button {
    justify-self: start;
}
</style>

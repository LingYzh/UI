<script setup>
import { ref } from 'vue';
import { UButton, UBtnToggle, UToolbar, UToolbarItems } from '../../index';
const action = ref(0);
const variant = ref('text');
</script>

<template>
    <div class="component-demo" data-demo-component="UToolbarItems">
        <u-btn-toggle v-model="variant" mandatory aria-label="操作区样式">
            <u-button
                v-for="value in ['text', 'tonal', 'outlined']"
                :key="value"
                :value="value"
                size="sm"
            >
                {{ value }}
            </u-button>
        </u-btn-toggle>
        <u-toolbar title="文件操作" border>
            <u-toolbar-items :variant="variant" color="primary">
                <u-button @click="action++">保存</u-button>
                <u-button @click="action++">导出</u-button>
                <u-button color="danger" variant="text" @click="action++">删除</u-button>
            </u-toolbar-items>
        </u-toolbar>
        <u-toolbar color="primary" title="继承工具栏前景色">
            <template #append>
                <u-toolbar-items>
                    <u-button @click="action++">刷新</u-button>
                </u-toolbar-items>
            </template>
        </u-toolbar>
        <output>已刷新 {{ action }} 次</output>
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

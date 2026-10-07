<script setup>
import { ref } from 'vue';
import { UButton, UBtnToggle, USwitch, UTabs, UToolbar } from '../../index';
const action = ref(0);
const density = ref('default');
const extended = ref(true);
const collapse = ref(false);
const tab = ref('overview');
</script>

<template>
    <div class="component-demo" data-demo-component="UToolbar">
        <u-btn-toggle v-model="density" mandatory aria-label="工具栏密度">
            <u-button
                v-for="value in ['default', 'comfortable', 'compact', 'prominent']"
                :key="value"
                :value="value"
                size="sm"
            >
                {{ value }}
            </u-button>
        </u-btn-toggle>
        <div class="d-flex flex-wrap ga-4">
            <u-switch v-model="extended" label="显示扩展区" />
            <u-switch v-model="collapse" label="折叠工具栏" />
        </div>
        <u-toolbar
            data-toolbar="interactive"
            :density="density"
            :extended="extended"
            :collapse="collapse"
            color="primary"
            title="工作区：一个会随容器宽度自动截断的长标题"
        >
            <template #prepend>
                <u-button icon="mdi-view-grid-outline" aria-label="工作区菜单" @click="action++" />
            </template>
            <template #actions>
                <u-button @click="action++">刷新</u-button>
                <u-button icon="mdi-cog-outline" aria-label="设置" @click="action++" />
            </template>
            <template #extension>
                <u-tabs
                    v-model="tab"
                    :items="[
                        { value: 'overview', text: '概览' },
                        { value: 'activity', text: '活动' },
                    ]"
                />
            </template>
        </u-toolbar>
        <output>操作 {{ action }} 次；当前 {{ tab }}</output>
        <u-toolbar
            data-toolbar="custom-height"
            height="80"
            extension-height="32"
            rounded
            border
            title="显式高度 80 / 32"
        >
            <template #title>
                <span>标题插槽优先于 title 属性</span>
            </template>
            <template #actions>
                <u-button variant="outlined" @click="action++">独立样式</u-button>
            </template>
            <template #extension>
                <span class="px-4 text-body-2">有 extension 插槽时默认显示扩展区。</span>
            </template>
        </u-toolbar>
        <u-toolbar data-toolbar="floating" floating rounded :elevation="3">
            <u-button @click="action++">浮动工具栏</u-button>
            <u-button icon="mdi-plus" aria-label="新增" @click="action++" />
        </u-toolbar>
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
.component-demo > .ui-toolbar.is-floating {
    justify-self: start;
}
.component-demo :deep(.u-item-group.u-btn-group) {
    flex-wrap: wrap;
}
</style>

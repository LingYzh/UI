<script setup>
import { defineComponent, h, provide, ref } from 'vue';
import { mdiAccount, mdiClose, mdiDatabaseOutline, mdiMagnify } from '@mdi/js';
import { createIcons, UButton, UCard, UIcon, UTextField } from '../index';
import { iconKey } from '../icon-config';

const query = ref('按需导入的 SVG 路径');
const layers = [mdiAccount, [mdiDatabaseOutline, 0.25]];
const AccountComponent = defineComponent({
    setup() {
        return () => h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [h('path', { d: mdiAccount })]);
    }
});
// The example uses a local icon scope; each application's configuration remains independent.
provide(iconKey, createIcons({ aliases: { accountDemo: mdiAccount, localDemo: 'copy', layeredDemo: layers } }));
</script>

<template>
    <div class="d-flex flex-column ga-4" data-icon-protocol-demo>
        <div class="d-flex flex-wrap align-center ga-4">
            <span class="d-flex align-center ga-2"><UIcon :icon="mdiAccount" label="直接传入 MDI 路径" :size="24" />路径</span>
            <span class="d-flex align-center ga-2"><UIcon icon="$accountDemo" label="语义别名" :size="24" />$alias</span>
            <span class="d-flex align-center ga-2"><UIcon :icon="layers" label="含透明度的多路径" :size="24" />多路径</span>
            <span class="d-flex align-center ga-2"><UIcon :icon="AccountComponent" label="Vue 图标组件" :size="24" />组件</span>
            <span class="d-flex align-center ga-2"><UIcon icon="$localDemo" label="别名指向本地 SVG" :size="24" />兼容本地 SVG</span>
        </div>
        <div class="d-flex flex-wrap align-center ga-3">
            <UButton :icon="mdiAccount" aria-label="账户图标按钮" />
            <UButton :prepend-icon="mdiDatabaseOutline" :append-icon="mdiAccount">
                前置与后置图标
            </UButton>
            <UButton icon aria-label="插槽图标按钮">
                <UIcon :icon="mdiMagnify" />
            </UButton>
        </div>
        <UTextField v-model="query" :clear-icon="mdiClose" clearable label="可清除输入框" />
        <UCard title="同一个 IconValue" subtitle="卡片、按钮和输入框共享图标协议" :prepend-icon="mdiDatabaseOutline" :append-icon="layers">
            业务图标具名导入后直接传给 icon 类属性，无需逐个注册。图标集合与 $alias 通过 createUI 的 icons 配置。
        </UCard>
    </div>
</template>

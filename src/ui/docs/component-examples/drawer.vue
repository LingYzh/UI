<script setup>
import { ref } from 'vue';
import { UButton, UDrawer, USwitch, UTextField } from '../../index';
const open = ref(false);
const persistent = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="UDrawer">
        <USwitch v-model="persistent" label="阻止 Esc 和遮罩关闭" />
        <UDrawer v-model:open="open" :persistent="persistent" content-label="详情抽屉用例">
            <template #activator="{ props }">
                <UButton v-bind="props">打开详情抽屉</UButton>
            </template>
            <template #header>
                <h2>用户详情</h2>
            </template>
            <UTextField label="筛选详情" placeholder="可检查键盘焦点" />
            <p v-for="index in 24" :key="index">第 {{ index }} 条详情：标题与关闭按钮保持可见，内容在面板内部滚动。</p>
            <template #footer>
                <UButton @click="open = false">关闭详情抽屉</UButton>
            </template>
        </UDrawer>
    </div>
</template>

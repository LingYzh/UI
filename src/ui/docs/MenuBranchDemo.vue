<script setup>
import { ref } from 'vue';
import { UButton, UDialog, UMenu, UMenuItem, USwitch } from '../index';

const mounted = ref(true);
const parent = ref(false);
const child = ref(false);
const dialog = ref(false);
const dialogMenu = ref(false);
</script>

<template>
    <div class="menu-branch-demo" data-menu-branch-demo>
        <u-switch v-model="mounted" label="保留菜单实例在当前页面" />
        <KeepAlive>
            <u-menu v-if="mounted" v-model="parent" :native-dismiss="false" :close-on-content-click="false">
                <template #activator="{ props }"><u-button v-bind="props">打开父菜单</u-button></template>
                <u-menu v-model="child" :native-dismiss="false">
                    <template #activator="{ props }"><u-button v-bind="props" variant="text">打开子菜单</u-button></template>
                    <u-menu-item>关闭子菜单</u-menu-item>
                </u-menu>
                <u-button variant="text" @click="dialog = true">打开独立对话框</u-button>
                <u-dialog v-model="dialog" :width="340" scrollable>
                    <template #header>独立菜单边界</template>
                    <u-menu v-model="dialogMenu">
                        <template #activator="{ props }"><u-button v-bind="props">对话框内菜单</u-button></template>
                        <u-menu-item>选择后保留外层父菜单</u-menu-item>
                    </u-menu>
                    <template #footer><u-button @click="dialog = false">关闭对话框</u-button></template>
                </u-dialog>
            </u-menu>
        </KeepAlive>
        <p>点菜单外部关闭整条菜单分支；停用缓存实例也关闭弹出物。对话框内菜单独立处理自己的选择。</p>
        <output>父菜单：{{ parent }}；子菜单：{{ child }}；对话框：{{ dialog }}</output>
    </div>
</template>

<style scoped>
.menu-branch-demo { display: grid; gap: 16px; min-width: 0; }
.menu-branch-demo p { margin: 0; }
.menu-branch-demo output { color: var(--muted); font-size: var(--ui-font-body-medium); overflow-wrap: anywhere; }
</style>

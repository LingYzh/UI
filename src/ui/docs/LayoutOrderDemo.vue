<script setup>
import { ref } from 'vue';
import { UAppBar, UAppBarTitle, UButton, UFooter, ULayout, UMain, UNavigationDrawer, USwitch } from '../index';

const ordered = ref(false);
const drawerFirst = ref(true);
const overlap = ref(false);
const drawer = ref(true);
</script>

<template>
    <div class="layout-order-demo">
        <div class="layout-order-controls">
            <USwitch v-model="ordered" label="按 order 分配空间" />
            <USwitch v-model="drawerFirst" label="侧栏优先" />
            <USwitch v-model="overlap" label="顶栏与侧栏重叠" :disabled="!ordered" />
            <UButton size="sm"
                @click="drawer = !drawer">
                {{ drawer ? '关闭侧栏' : '打开侧栏' }}
            </UButton>
        </div>
        <ULayout class="layout-order-surface" :height="280" :min-height="0" :layout-mode="ordered ? 'ordered' : 'legacy'" :overlaps="overlap ? ['header:sidebar'] : []">
            <UNavigationDrawer name="sidebar" :width="120" :order="drawerFirst ? 0 : 20" :mobile-breakpoint="0"
                v-model="drawer">
                <div class="pa-3">工作区<br>概览<br>设置</div>
            </UNavigationDrawer>
            <UAppBar name="header" :height="48" :order="10">
                <UAppBarTitle>应用顶栏</UAppBarTitle>
            </UAppBar>
            <UMain :min-height="0" :height="280">
                <div class="pa-3">
                    <p>主内容</p>
                    <p class="text-muted">{{ ordered ? '前面的栏先占用空间，后面的栏避让。' : '默认布局保留原有空间分配。' }}</p>
                </div>
            </UMain>
            <UFooter name="footer" :height="32" :order="30" app>底部状态</UFooter>
        </ULayout>
    </div>
</template>

<style scoped>
.layout-order-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.layout-order-controls {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}
.layout-order-surface {
    transform: translateZ(0);
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 8px;
}
</style>

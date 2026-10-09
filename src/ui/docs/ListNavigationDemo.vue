<script setup>
import { computed, ref } from 'vue';
import { UList, UListItem, USwitch } from '../index';

const track = ref(true);
const selected = ref([]);
const activated = ref([]);
const navigationIndex = ref(-1);
const items = [
    { value: { id: 'overview' }, title: '项目概览', props: { subtitle: '最近的运行记录' } },
    { value: { id: 'settings' }, title: '项目设置', props: { subtitle: '配置与权限' } },
    { value: { id: 'archive' }, title: '归档记录', props: { disabled: true } }
];
const currentTitle = computed(() => navigationIndex.value >= 0 ? items[navigationIndex.value]?.title ?? '尚未定位' : '尚未定位');
</script>

<template>
    <section class="list-navigation-demo">
        <USwitch v-model="track" label="焦点停留在列表根节点" />
        <p class="list-navigation-help">Tab 进入列表，方向键定位，Enter 或空格选择。点击已激活行可取消激活。</p>
        <UList v-model="selected" v-model:activated="activated" v-model:navigation-index="navigationIndex" :items="items" :navigation-strategy="track ? 'track' : 'focus'" selectable activatable multiple>
            <template #item="{ item, props, isSelected }">
                <UListItem v-bind="props">
                    <template #title>{{ item.title }}</template>
                    <template #append>{{ isSelected ? '已选' : '' }}</template>
                </UListItem>
            </template>
        </UList>
        <p class="list-navigation-help" aria-live="polite">键盘位置：{{ currentTitle }}；已选 {{ selected.length }} 项</p>
    </section>
</template>

<style scoped>
.list-navigation-demo { display: grid; gap: 12px; width: min(100%, 520px); }
.list-navigation-help { margin: 0; color: var(--muted); font-size: var(--ui-font-body-small); line-height: 1.6; }
</style>

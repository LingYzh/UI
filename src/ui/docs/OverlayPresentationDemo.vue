<script setup>
import { computed, ref } from 'vue';
import { UButton, UDialog, UOverlay, UMenu, UList, UListItem, UTooltip, USelect, USwitch } from '../index';

const transitionName = ref('scale-transition');
const transition = computed(() => transitionName.value === 'none' ? false : transitionName.value);
const colored = ref(false);
const dialog = ref(false);
const overlay = ref(false);
const lifecycle = ref('尚未打开');
const transitions = [
    { label: '缩放', value: 'scale-transition' },
    { label: '淡入淡出', value: 'fade-transition' },
    { label: '垂直滑动', value: 'slide-y-transition' },
    { label: '关闭过渡', value: 'none' }
];
function entered() { lifecycle.value = '进入完成'; }
function left() { lifecycle.value = '离开完成'; }
</script>

<template>
    <section class="presentation-demo">
        <div class="presentation-demo-settings">
            <USelect v-model="transitionName" :items="transitions" label="过渡" />
            <USwitch v-model="colored" label="使用主题色遮罩" />
        </div>
        <div class="presentation-demo-actions">
            <UButton @click="dialog = true">打开对话框</UButton>
            <UButton variant="outlined"
                @click="overlay = true"
            >
                打开浮层
            </UButton>
            <UMenu :transition="transition">
                <template #activator="{ props }">
                    <UButton variant="text" v-bind="props">操作菜单</UButton>
                </template>
                <UList :selectable="false" nav>
                    <UListItem role="menuitem" :tabindex="-1" title="复制链接" />
                    <UListItem role="menuitem" :tabindex="-1" title="保存草稿" />
                </UList>
            </UMenu>
            <UTooltip :transition="transition" standard-protocol text="过渡跟随上方选择">
                <template #activator="{ props }">
                    <UButton variant="text" v-bind="props">悬停查看提示</UButton>
                </template>
            </UTooltip>
        </div>
        <p class="presentation-demo-status" aria-live="polite">{{ lifecycle }}</p>
        <UDialog v-model="dialog" :transition="transition" :scrim="colored ? 'var(--accent)' : true" :opacity="colored ? 0.25 : undefined" :width="420"
            @after-enter="entered" @after-leave="left"
        >
            <h3>继续编辑</h3>
            <p>关闭后可查看离开完成状态。</p>
            <UButton @click="dialog = false">关闭</UButton>
        </UDialog>
        <UOverlay v-model="overlay" :transition="transition" :scrim="colored ? 'var(--accent)' : true" :opacity="colored ? 0.25 : undefined" :width="420" retain-focus>
            <h3>当前浮层</h3>
            <p>遮罩颜色和过渡使用相同配置。</p>
            <UButton @click="overlay = false">关闭</UButton>
        </UOverlay>
    </section>
</template>

<style scoped>
.presentation-demo { display: grid; gap: 16px; width: 100%; }
.presentation-demo-settings { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.presentation-demo-settings > :first-child { width: min(100%, 220px); }
.presentation-demo-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.presentation-demo-status { margin: 0; color: var(--muted); font-size: var(--ui-font-body-small); }
</style>

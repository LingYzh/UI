<script setup>
import { computed, ref } from 'vue';
import {
    UAvatar,
    UButton,
    UCheckbox,
    UChip,
    UHotkey,
    USnackbar,
    USwitch,
    UToolbar,
    useUiTheme,
} from '../index';

const theme = useUiTheme();
const selected = ref(true);
const enabled = ref(true);
const notice = ref(false);
const swatches = computed(() =>
    [
        'background',
        'primary-surface',
        'on-primary-surface',
        'primary',
        'accent-soft',
    ].map((name) => ({ name, value: theme.current.value.colors[name] })),
);
</script>

<template>
    <div class="theme-palette-demo" data-theme-palette-demo>
        <p>使用文档顶部的主题开关或全局主题选择器，比较填充、文字和前景色。</p>
        <div class="theme-palette-swatches">
            <div v-for="swatch in swatches" :key="swatch.name">
                <span :style="{ background: swatch.value }" />
                <code>{{ swatch.name }}</code>
                <small>{{ swatch.value }}</small>
            </div>
        </div>
        <UToolbar color="primary" title="主题色工具栏" :height="52">
            <UButton>继承工具栏前景</UButton>
        </UToolbar>
        <div class="theme-palette-controls">
            <UButton variant="flat" color="primary"
                @click="notice = true"
            >
                主题色消息
            </UButton>
            <UButton variant="flat" color="primary" loading>处理中</UButton>
            <UButton variant="outlined" color="primary">描边操作</UButton>
            <UButton variant="text" color="primary">文字操作</UButton>
        </div>
        <div class="theme-palette-controls">
            <UAvatar color="primary" text="UI" :size="32" />
            <UChip color="primary" variant="flat">实心标签</UChip>
            <UChip color="primary">低强度标签</UChip>
            <UHotkey
                keys="ctrl+k"
                color="primary"
                variant="flat"
                :listen="false"
            />
        </div>
        <div class="theme-palette-controls">
            <UCheckbox color="primary" label="主色勾选" v-model="selected" />
            <USwitch color="primary" label="主色开关" v-model="enabled" />
        </div>
        <p>实心色块优先白字，浅蓝和浅灰也保留白字，仅接近白色的填充改用黑字；显式前景色继续优先。</p>
        <div class="theme-palette-controls" v-for="color in ['#d97757', '#ff9800', '#4caf50', '#9dc5e6', '#d0d0d0', '#e0e0e0', '#ffeeba']" :key="color">
            <UButton variant="flat" :color="color">{{ color }}</UButton>
            <UChip variant="flat" :color="color">实心标签</UChip>
            <UAvatar :color="color" text="UI" :size="32"/>
        </div>
        <USnackbar
            color="primary"
            text="填充与前景色跟随当前主题，关闭按钮继承文字颜色。"
            closable
            timer
            v-model="notice"
        />
    </div>
</template>

<style scoped>
.theme-palette-demo {
    display: grid;
    gap: 20px;
    min-width: 0;
}
.theme-palette-demo > p {
    margin: 0;
    color: var(--muted);
}
.theme-palette-swatches {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 12px;
}
.theme-palette-swatches > div {
    display: grid;
    gap: 6px;
    min-width: 0;
}
.theme-palette-swatches span {
    height: 44px;
    border: 1px solid var(--border);
    border-radius: 8px;
}
.theme-palette-swatches code,
.theme-palette-swatches small {
    overflow-wrap: anywhere;
    font-size: 12px;
}
.theme-palette-controls {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}
</style>

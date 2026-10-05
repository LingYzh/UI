<script setup>
import { ref } from 'vue';
import { UButton, UIcon } from '../index';

const loading = ref(false);
const variants = ['secondary', 'primary', 'ghost', 'danger', 'elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'];
</script>

<template>
    <div class="button-loading-demo">
        <div class="demo-row">
            <u-button :disabled="loading" @click="loading = true">开始全部加载</u-button>
            <u-button :disabled="!loading" @click="loading = false">结束全部加载</u-button>
        </div>
        <div class="button-loading-cases">
            <div v-for="variant in variants" :key="variant"><span>{{ variant }}</span><u-button :data-loading-variant="variant" :variant="variant" :loading="loading">{{ loading ? '正在处理操作…' : '执行操作' }}</u-button></div>
            <div><span>主题颜色</span><u-button data-loading-variant="custom-color" color="success" variant="primary" :loading="loading">{{ loading ? '正在处理操作…' : '执行操作' }}</u-button></div>
            <div><span>透明危险操作</span><u-button data-loading-variant="ghost-danger" variant="danger" ghost :loading="loading">{{ loading ? '正在移除…' : '移除' }}</u-button></div>
        </div>
        <div class="button-loading-cases">
            <div><span>内容宽度</span><u-button data-loading-case="plain" :loading="loading">{{ loading ? '正在保存修改后的完整配置…' : '保存' }}</u-button></div>
            <div><span>紧凑按钮</span><u-button data-loading-case="compact" size="sm" :loading="loading"><u-icon name="check" :size="16" />{{ loading ? '正在保存…' : '确认' }}</u-button></div>
            <div><span>图标按钮</span><u-button data-loading-case="icon" icon="mdi-plus" aria-label="添加" :loading="loading" /></div>
            <div><span>指定宽度</span><u-button data-loading-case="explicit" style="width: 160px" :loading="loading">{{ loading ? '正在处理更长的等待文案…' : '提交配置' }}</u-button></div>
            <div><span>自定义加载图标</span><u-button data-loading-case="custom-loader" :loading="loading">导出<template #loader><u-icon name="clock" :size="16" /></template></u-button></div>
        </div>
        <p role="status">{{ loading ? '加载中：按钮保持原有大小，只显示加载图标。' : '就绪：按钮按内容或指定宽度显示。' }}</p>
    </div>
</template>

<style scoped>
.button-loading-demo { display: grid; gap: 16px; }
.button-loading-cases { display: flex; flex-wrap: wrap; align-items: start; gap: 20px; }
.button-loading-cases > div { display: grid; justify-items: start; gap: 8px; }
.button-loading-cases > div > span { font-size: 12px; color: var(--muted); }
.button-loading-demo > p { margin: 0; color: var(--muted); font-size: 12px; }
</style>

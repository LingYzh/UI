<script setup>
import { ref } from 'vue';
import { UButton, USelect, UTextField, USwitch } from '../index';

const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'];
const colors = ['primary', 'danger', 'secondary', undefined];
const variant = ref('flat');
const color = ref('primary');
const disabled = ref(false);
const loading = ref(false);
const clicks = ref(0);
const customColors = [
    'success',
    'error',
    'warning',
    'info',
    '#f4d78b',
    '#213547',
    'rgb(90, 65, 135)',
    'hsl(175 55% 28%)',
    'teal',
    'var(--ui-theme-primary)',
];
</script>

<template>
    <div class="button-appearance-demo" data-button-appearance>
        <div class="button-appearance-controls">
            <u-select v-model="variant" label="样式变体" :items="variants" />
            <u-text-field
                v-model="color"
                label="按钮颜色"
                hint="主题名称、danger 或 CSS 颜色；留空使用默认表面。"
            />
        </div>
        <div class="demo-row">
            <u-switch v-model="disabled" label="禁用按钮" />
            <u-switch v-model="loading" label="加载按钮" />
        </div>
        <div class="button-appearance-preview">
            <u-button
                data-button-preview
                :variant="variant"
                :color="color"
                :disabled="disabled"
                :loading="loading"
                @click="clicks++"
            >
                执行操作
            </u-button>
            <code>variant="{{ variant }}" · color="{{ color || '默认' }}"</code>
        </div>
        <div class="button-appearance-matrix">
            <div v-for="style in variants" :key="style" class="button-appearance-row">
                <span>{{ style }}</span>
                <u-button
                    v-for="tone in colors"
                    :key="tone || 'default'"
                    :data-button-variant="style"
                    :data-button-color="tone || 'default'"
                    :variant="style"
                    :color="tone"
                    :disabled="disabled"
                    :loading="loading"
                    @click="clicks++"
                >
                    {{ tone || '默认颜色' }}
                </u-button>
            </div>
        </div>
        <p class="button-appearance-caption">
            颜色独立作用于每一种变体。danger 默认与 error
            使用同一主题色；浅色实心按钮自动使用深色文字。
        </p>
        <div class="button-appearance-colors">
            <div v-for="tone in customColors" :key="tone">
                <span>{{ tone }}</span>
                <u-button
                    variant="flat"
                    :color="tone"
                    :data-css-color="tone"
                    :disabled="disabled"
                    :loading="loading"
                    @click="clicks++"
                >
                    执行操作
                </u-button>
            </div>
        </div>
        <output role="status">已执行 {{ clicks }} 次</output>
    </div>
</template>

<style scoped>
.button-appearance-demo {
    display: grid;
    gap: 20px;
}
.button-appearance-controls {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    align-items: start;
}
.button-appearance-preview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
.button-appearance-preview code {
    color: var(--accent-text);
    font-size: 14px;
    overflow-wrap: anywhere;
}
.button-appearance-matrix {
    display: grid;
    gap: 12px;
}
.button-appearance-row {
    display: grid;
    grid-template-columns: 72px repeat(4, minmax(0, 1fr));
    align-items: center;
    gap: 10px;
}
.button-appearance-row > span,
.button-appearance-colors span {
    color: var(--muted);
    font-size: 14px;
}
.button-appearance-caption {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.6;
}
.button-appearance-colors {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
}
.button-appearance-colors > div {
    display: grid;
    justify-items: start;
    gap: 8px;
    min-width: 0;
}
.button-appearance-colors span {
    overflow-wrap: anywhere;
}
@media (max-width: 600px) {
    .button-appearance-controls {
        grid-template-columns: 1fr;
    }
    .button-appearance-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .button-appearance-row > span {
        grid-column: 1 / -1;
    }
    .button-appearance-colors {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>

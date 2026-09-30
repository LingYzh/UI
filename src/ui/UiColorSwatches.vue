<script setup lang="ts">
import { computed, useId } from 'vue';
import { uiText, type UiMessageKey } from './locale';

export interface ColorSwatch {
    value: string;
    label: string;
}

const props = withDefaults(defineProps<{
    /** 可选颜色；不传时使用与 tokens 协调的 10 色默认色板。 */
    colors?: ColorSwatch[];
    /** 色板组的可访问名称。 */
    label?: string;
    disabled?: boolean;
}>(), { disabled: false });
const model = defineModel<string | null>({ default: null });
const name = `ui-swatch-${useId()}`;

// 默认色板取自 KAM 标签常用色相，饱和度下调以贴合暖色 tokens。
const defaults: { value: string; key: UiMessageKey }[] = [
    { value: '#c2553f', key: 'swatch.red' },
    { value: '#d07a3a', key: 'swatch.orange' },
    { value: '#c49a2e', key: 'swatch.yellow' },
    { value: '#5f8f5a', key: 'swatch.green' },
    { value: '#3f8f8a', key: 'swatch.teal' },
    { value: '#4a78b8', key: 'swatch.blue' },
    { value: '#6f62b8', key: 'swatch.indigo' },
    { value: '#9a5aa8', key: 'swatch.purple' },
    { value: '#c25a86', key: 'swatch.pink' },
    { value: '#7a756b', key: 'swatch.gray' }
];
const items = computed<ColorSwatch[]>(() => props.colors ?? defaults.map((item) => ({ value: item.value, label: uiText(item.key) })));
// 比较时忽略大小写，已保存的旧颜色不在色板中时追加“当前颜色”，保证可见且可重新选中。
const normalized = (value: string | null | undefined) => (value ?? '').trim().toLowerCase();
const custom = computed(() => (model.value && !items.value.some((item) => normalized(item.value) === normalized(model.value)) ? model.value : null));
const choices = computed(() => (custom.value ? [...items.value, { value: custom.value, label: uiText('swatch.current') }] : items.value));
</script>

<template>
    <div class="ui-swatches" role="radiogroup" :aria-label="label ?? uiText('swatch.label')" :aria-disabled="disabled || undefined">
        <!-- 选中态按归一化值判断，不用 v-model：原生 radio 按严格相等匹配，大小写不同的已保存值会导致整组无选中。 -->
        <label v-for="item in choices" :key="item.value" class="ui-swatch" :class="{ 'is-custom': item.value === custom }" :style="{ '--swatch-color': item.value }" :title="item.label">
            <input type="radio" class="ui-swatch-control" :name="name" :value="item.value" :checked="normalized(item.value) === normalized(model)" :aria-label="item.label" :disabled="disabled" @change="model = item.value" />
        </label>
    </div>
</template>

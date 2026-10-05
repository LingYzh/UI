<script setup lang="ts">
import { vPointerBlur } from './pointer-focus';
import { computed, ref, useAttrs, useId } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import { useFormControl, mergeControlAttrs, type FormControlProps } from './form';
import { uiText, type UiMessageKey } from './locale';

export interface ColorSwatch {
    value: string;
    label: string;
}

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<FormControlProps & {
    /** 可选颜色；不传时使用与 tokens 协调的 10 色默认色板。 */
    colors?: ColorSwatch[];
}>(), { disabled: false });
const model = defineModel<string | null>({ default: null });
const element = ref<HTMLDivElement>();
const attrs = useAttrs();
const control = useFormControl(props, model, element, attrs);
defineExpose({ element, focus: () => element.value?.querySelector<HTMLInputElement>('input:checked, input:not(:disabled)')?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
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
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" class="ui-swatches" role="radiogroup" :aria-label="label ?? uiText('swatch.label')" :aria-disabled="control.disabled.value || undefined" :aria-readonly="control.readonly.value || undefined" :aria-invalid="control.state.value === false || undefined" @click.capture="control.guard" @keydown.capture="control.guardKeys" @focusout="control.blur">
            <!-- 选中态按归一化值判断，不用 v-model：原生 radio 按严格相等匹配，大小写不同的已保存值会导致整组无选中。 -->
            <label v-for="item in choices" :key="item.value" class="ui-swatch" :class="{ 'is-custom': item.value === custom }" :style="{ '--swatch-color': item.value }" :title="item.label">
                <input v-pointer-blur type="radio" class="ui-swatch-control" :name="name" :value="item.value" :checked="normalized(item.value) === normalized(model)" :aria-label="item.label" :disabled="control.disabled.value" @change="control.editable.value = item.value" />
            </label>
        </div>
    </UiControlFrame>
</template>

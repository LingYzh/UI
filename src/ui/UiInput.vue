<script setup lang="ts">
import { computed, ref, useAttrs, type CSSProperties } from 'vue';
defineOptions({ inheritAttrs: false });
withDefaults(defineProps<{ disabled?: boolean; invalid?: boolean; dense?: boolean; ghost?: boolean; rounded?: boolean }>(), { disabled: false, invalid: false, rounded: true });
const attrs = useAttrs();
function inputAttrs() { const { class: _class, style: _style, ...rest } = attrs; return rest; }
// 字符串模型保持原行为；type="number" 时模型为 number，清空为 null。
const model = defineModel<string | number | null>({ default: '' });
const numeric = computed(() => attrs.type === 'number');
const text = computed({
    get: () => (model.value === null || model.value === undefined ? '' : String(model.value)),
    set: (value: string) => {
        if (!numeric.value) {
            model.value = value;
            return;
        }
        // 输入中间态（如 "-"、"1e"）浏览器返回空串，此时不写回 null，避免打断输入。
        if (value === '') {
            if (element.value?.validity.badInput) return;
            model.value = null;
            return;
        }
        const number = Number(value);
        if (Number.isFinite(number)) model.value = number;
    }
});
const element = ref<HTMLInputElement>();
defineExpose({ element, focus: () => element.value?.focus(), select: () => element.value?.select() });
</script>

<template>
    <div class="ui-input" :class="[$attrs.class, { 'is-disabled': disabled, 'is-invalid': invalid, 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded }]" :style="$attrs.style as CSSProperties">
        <span v-if="$slots.leading" class="ui-input-adornment"><slot name="leading" /></span>
        <input ref="element" v-model="text" v-bind="inputAttrs()" :disabled="disabled" :aria-invalid="invalid || $attrs['aria-invalid'] === true || $attrs['aria-invalid'] === 'true' || undefined" />
        <span v-if="$slots.trailing" class="ui-input-adornment"><slot name="trailing" /></span>
    </div>
</template>

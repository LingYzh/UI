<script setup lang="ts" generic="T extends string | number">
import { ref } from 'vue';
defineOptions({ inheritAttrs: false });
withDefaults(defineProps<{
    /** 本单选项代表的值；与 v-model 相等时选中。 */
    value: T;
    disabled?: boolean;
}>(), { disabled: false });
// 同一组单选共享 name 与 v-model；分组布局由页面负责，便于把单选放进各自的卡片。
const model = defineModel<T | null>({ default: null });
const element = ref<HTMLInputElement>();
defineExpose({ element, focus: () => element.value?.focus() });
</script>

<template>
    <label v-if="$slots.default" class="ui-radio" :class="[$attrs.class, { 'is-disabled': disabled }]" :style="$attrs.style as any">
        <input ref="element" v-model="model" v-bind="{ ...$attrs, class: undefined, style: undefined }" type="radio" class="ui-radio-control" :value="value" :disabled="disabled" />
        <span class="ui-radio-label"><slot /></span>
    </label>
    <input v-else ref="element" v-model="model" v-bind="$attrs" type="radio" class="ui-radio-control" :value="value" :disabled="disabled" />
</template>

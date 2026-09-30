<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
    /** 部分选中；与 checked 相互独立，用户点击后由原生控件清除，调用方按选择结果重新计算。 */
    indeterminate?: boolean;
    disabled?: boolean;
}>(), { indeterminate: false, disabled: false });
const model = defineModel<boolean>({ default: false });
const element = ref<HTMLInputElement>();
// indeterminate 只能通过 DOM 属性设置，没有对应的 HTML 特性。
function sync() {
    if (element.value) element.value.indeterminate = props.indeterminate;
}
watch(() => props.indeterminate, sync);
onMounted(sync);
defineExpose({ element, focus: () => element.value?.focus() });
</script>

<template>
    <!-- 有标签时整个 label 可点击；无标签时须通过 aria-label 等提供名称。 -->
    <label v-if="$slots.default" class="ui-checkbox" :class="[$attrs.class, { 'is-disabled': disabled }]" :style="$attrs.style as any">
        <input ref="element" v-model="model" v-bind="{ ...$attrs, class: undefined, style: undefined }" type="checkbox" class="ui-checkbox-control" :disabled="disabled" :aria-checked="indeterminate ? 'mixed' : undefined" />
        <span class="ui-checkbox-label"><slot /></span>
    </label>
    <input v-else ref="element" v-model="model" v-bind="$attrs" type="checkbox" class="ui-checkbox-control" :disabled="disabled" :aria-checked="indeterminate ? 'mixed' : undefined" />
</template>

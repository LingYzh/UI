<script setup lang="ts">
import { ref, useAttrs, type CSSProperties } from 'vue';
defineOptions({ inheritAttrs: false });
withDefaults(defineProps<{ disabled?: boolean; invalid?: boolean; dense?: boolean; ghost?: boolean; rounded?: boolean }>(), { disabled: false, invalid: false, rounded: true });
const attrs = useAttrs();
function inputAttrs() { const { class: _class, style: _style, ...rest } = attrs; return rest; }
const model = defineModel<string>({ default: '' });
const element = ref<HTMLInputElement>();
defineExpose({ element, focus: () => element.value?.focus(), select: () => element.value?.select() });
</script>

<template>
    <div class="ui-input" :class="[$attrs.class, { 'is-disabled': disabled, 'is-invalid': invalid, 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded }]" :style="$attrs.style as CSSProperties">
        <span v-if="$slots.leading" class="ui-input-adornment"><slot name="leading" /></span>
        <input ref="element" v-model="model" v-bind="inputAttrs()" :disabled="disabled" :aria-invalid="invalid || $attrs['aria-invalid'] === true || $attrs['aria-invalid'] === 'true' || undefined" />
        <span v-if="$slots.trailing" class="ui-input-adornment"><slot name="trailing" /></span>
    </div>
</template>

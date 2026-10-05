<script setup lang="ts">
import UiField from './UiField.vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import type { FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = defineProps<ControlSizing & Pick<FormControlProps, 'label' | 'hint' | 'labelPosition' | 'labelWidth'> & { for?: string; error?: string; required?: boolean; framed?: boolean }>();
</script>

<template>
    <UiField v-if="label || hint || framed" v-slot="{ controlAttrs }" :label="label ?? ''" :description="hint"
        :for="props.for" :error="error" :required="required"
        :layout="label && labelPosition === 'left' ? 'horizontal' : 'vertical'"
        :style="[controlSizeStyles(props), { '--ui-form-label-width': labelWidth }]" :class="{ 'is-inline': inline }">
        <slot :control-attrs="controlAttrs" />
    </UiField>
    <slot v-else :control-attrs="{}" />
</template>

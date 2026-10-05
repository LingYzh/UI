<script setup lang="ts">
import UiField from './UiField.vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import { computed, inject } from 'vue';
import { formContextKey, type FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ControlSizing & Pick<FormControlProps, 'label' | 'hint' | 'labelPosition' | 'labelWidth' | 'hideDetails' | 'persistentHint' | 'loading' | 'prefix' | 'suffix'> & { for?: string; error?: string; required?: boolean; framed?: boolean }>(), { hideDetails: undefined, persistentHint: true });
const form = inject(formContextKey, undefined);
const hideDetails = computed(() => props.hideDetails ?? form?.hideDetails?.value ?? 'auto');
const emptyAttrs: Record<string, any> = {};
</script>

<template>
    <UiField v-if="label || hint || framed" v-slot="{ controlAttrs }" :label="label ?? ''" :description="hint"
        :for="props.for" :error="error" :required="required" :hide-details="hideDetails === true"
        :layout="label && labelPosition === 'left' ? 'horizontal' : 'vertical'"
        :style="[controlSizeStyles(props), { '--ui-form-label-width': labelWidth }]" :class="{ 'is-inline': inline }">
        <slot :control-attrs="controlAttrs" />
    </UiField>
    <slot v-else :control-attrs="emptyAttrs" />
</template>

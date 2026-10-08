<script setup lang="ts">
import UiField from './UiField.vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import { computed, inject } from 'vue';
import { formContextKey, type FormControlProps } from './form';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ControlSizing & Pick<FormControlProps, 'label' | 'hint' | 'messages' | 'focused' | 'labelPosition' | 'labelWidth' | 'hideDetails' | 'persistentHint' | 'loading' | 'prefix' | 'suffix'> & { for?: string; error?: string; required?: boolean; framed?: boolean }>(), { hideDetails: undefined, persistentHint: true });
const form = inject(formContextKey, undefined);
const hideDetails = computed(() => props.hideDetails ?? form?.hideDetails?.value ?? 'auto');
const emptyAttrs: Record<string, any> = {};
</script>

<template>
    <UiField v-if="label || hint || messages || framed || $slots.label || $slots.details" :label="label ?? ''" :description="persistentHint || focused ? hint : undefined" :messages="error ? undefined : messages"
        :for="props.for" :error="error" :required="required" :hide-details="hideDetails"
        :layout="label && labelPosition === 'left' ? 'horizontal' : 'vertical'"
        :style="[controlSizeStyles(props), { '--ui-form-label-width': labelWidth }]" :class="{ 'is-inline': inline }">
        <template #default="{ controlAttrs }"><slot :control-attrs="controlAttrs" /></template>
        <template v-if="$slots.label" #label="scope"><slot name="label" v-bind="scope" /></template>
        <template v-if="$slots.details" #details><slot name="details" /></template>
        <template v-if="$slots.message" #message="scope"><slot name="message" v-bind="scope" /></template>
    </UiField>
    <slot v-else :control-attrs="emptyAttrs" />
</template>

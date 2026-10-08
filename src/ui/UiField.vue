<script setup lang="ts">
import { computed, inject, useId } from 'vue';
import { formLayoutKey } from './layout';
import { provide } from 'vue';
import { createControlRegistry, fieldContextKey } from './form';
import type { FieldLayout } from './layout';
const props = defineProps<{ label?: string; for?: string; description?: string; messages?: string | readonly string[]; error?: string; layout?: FieldLayout; required?: boolean; hideDetails?: boolean | 'auto' }>();
const id = useId();
const formLayout = inject(formLayoutKey, undefined);
const layout = computed(() => props.layout ?? formLayout?.value);
const controls = createControlRegistry();
provide(fieldContextKey, { error: computed(() => props.error), register: control => controls.add(control), unregister: control => controls.delete(control) });
const errorText = computed(() => props.error || [...new Set([...controls].filter(control => control.state.value === false).flatMap(control => control.errors.value))].join('\n'));
const messages = computed(() => typeof props.messages === 'string' ? [props.messages] : props.messages ?? []);
const controlAttrs = computed(() => ({
    id: props.for,
    'aria-describedby': props.hideDetails === true ? undefined : [props.description && `${id}-description`, messages.value.length && `${id}-messages`, errorText.value && `${id}-error`].filter(Boolean).join(' ') || undefined,
    'aria-invalid': errorText.value ? true : undefined,
    required: props.required || undefined
}));
</script>

<template>
    <div class="ui-field" :data-layout="layout" :class="{ 'is-layout-field': !!layout }">
        <div v-if="label || $slots.label" class="ui-field-label">
            <label v-if="props.for" :for="props.for"><slot name="label" :label="label">{{ label }}</slot><span v-if="required" class="ui-field-required" aria-hidden="true"> *</span></label>
            <span v-else><slot name="label" :label="label">{{ label }}</slot><span v-if="required" class="ui-field-required" aria-hidden="true"> *</span></span>
        </div>
        <slot :control-attrs="controlAttrs" />
        <div v-if="hideDetails !== true && (description || errorText || messages.length || $slots.details || hideDetails === false)" class="ui-field-details">
            <slot name="details">
            <p v-if="description" :id="`${id}-description`">{{ description }}</p>
            <div v-if="messages.length" :id="`${id}-messages`"><p v-for="(message, index) in messages" :key="index"><slot name="message" :message="message">{{ message }}</slot></p></div>
            <p v-if="errorText" :id="`${id}-error`" class="ui-field-error" role="alert">{{ errorText }}</p>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, useId } from 'vue';
import { formLayoutKey } from './layout';
import { provide } from 'vue';
import { createControlRegistry, fieldContextKey } from './form';
import type { FieldLayout } from './layout';
const props = defineProps<{ label: string; for?: string; description?: string; error?: string; layout?: FieldLayout; required?: boolean }>();
const id = useId();
const formLayout = inject(formLayoutKey, undefined);
const layout = computed(() => props.layout ?? formLayout?.value);
const controls = createControlRegistry();
provide(fieldContextKey, { error: computed(() => props.error), register: control => controls.add(control), unregister: control => controls.delete(control) });
const errorText = computed(() => props.error || [...new Set([...controls].flatMap(control => control.errors.value))].join('\n'));
const controlAttrs = computed(() => ({
    id: props.for,
    'aria-describedby': [props.description && `${id}-description`, errorText.value && `${id}-error`].filter(Boolean).join(' ') || undefined,
    'aria-invalid': errorText.value ? true : undefined,
    required: props.required || undefined
}));
</script>

<template>
    <div class="ui-field" :data-layout="layout" :class="{ 'is-layout-field': !!layout }">
        <div v-if="label" class="ui-field-label">
            <label v-if="props.for" :for="props.for">{{ label }}<span v-if="required" class="ui-field-required" aria-hidden="true"> *</span></label>
            <span v-else>{{ label }}<span v-if="required" class="ui-field-required" aria-hidden="true"> *</span></span>
        </div>
        <slot :control-attrs="controlAttrs" />
        <div v-if="description || errorText" class="ui-field-details">
            <p v-if="description" :id="`${id}-description`">{{ description }}</p>
            <p v-if="errorText" :id="`${id}-error`" class="ui-field-error" role="alert">{{ errorText }}</p>
        </div>
    </div>
</template>

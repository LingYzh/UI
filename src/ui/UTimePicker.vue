<script setup lang="ts">
import { useDefaults } from './defaults';
import UiControlFrame from './UiControlFrame.vue';
import { computed, ref, useAttrs, watch } from 'vue';
import { parseTime } from './date-model';
import { mergeControlAttrs, useFormControl, type FormControlProps } from './form';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { format?: '24h' | '12h'; min?: string; max?: string; minuteStep?: number }>(), { label: '时间', format: '24h', minuteStep: 1, dense: undefined, ghost: undefined, rounded: undefined });
const props = useDefaults(rawProps, 'UTimePicker');
const attrs = useAttrs();
function inputAttrs(): Record<string, unknown> { const { class: _class, style: _style, ...rest } = attrs; return rest; }
const model = defineModel<string>({ default: '00:00' });
const element = ref<HTMLInputElement>();
const parsed = computed(() => parseTime(model.value, props.format));
const parts = computed(() => [parsed.value?.hour ?? (props.format === '12h' ? 12 : 0), parsed.value?.minute ?? 0]);
const hours = computed(() => props.format === '12h' ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, i) => i));
const minutes = computed(() => Array.from({ length: Math.ceil(60 / Math.max(1, Math.min(60, props.minuteStep))) }, (_, i) => i * Math.max(1, Math.min(60, props.minuteStep))));
const valid = computed(() => !!parsed.value && (!props.min || (parseTime(props.min, props.format)?.minutes ?? -1) <= parsed.value.minutes) && (!props.max || (parseTime(props.max, props.format)?.minutes ?? 1440) >= parsed.value.minutes));
const validationProps = new Proxy(props, { get(target, key, receiver) {
    if (key === 'rules') return [() => valid.value || '时间无效或超出范围。', ...(props.rules ?? [])];
    return Reflect.get(target, key, receiver);
} });
const control = useFormControl(validationProps, model, element, attrs);
const text = computed({ get: () => model.value, set: (value: string) => { control.editable.value = value; } });
function mergedInputAttrs(controlAttrs: Record<string, unknown> = {}): Record<string, unknown> { return mergeControlAttrs(inputAttrs(), controlAttrs, control.id()); }
watch([element, valid, control.disabled], () => { element.value?.setCustomValidity(control.disabled.value || valid.value ? '' : '时间无效或超出范围。'); }, { immediate: true, flush: 'post' });
function update(hour: number, minute: number, period = ''): void {
    if (control.disabled.value || control.readonly.value) return;
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}${props.format === '12h' ? ` ${period || 'AM'}` : ''}`;
    const next = parseTime(value, props.format);
    if (next && (!props.min || (parseTime(props.min, props.format)?.minutes ?? -1) <= next.minutes) && (!props.max || (parseTime(props.max, props.format)?.minutes ?? 1440) >= next.minutes)) control.editable.value = value;
}
defineExpose({ element, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="u-time-picker"><div class="ui-input" :class="control.classes.value" :style="control.styles.value"><input ref="element" v-model="text" v-bind="mergedInputAttrs(controlAttrs)" type="text" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="!valid || undefined" :placeholder="props.format === '12h' ? 'hh:mm AM' : 'HH:mm'" @blur="control.blur" /></div>
            <div class="u-time-picker-controls"><select class="ui-select" :value="parts[0]" :disabled="control.disabled.value || control.readonly.value" aria-label="小时" @change="update(Number(($event.target as HTMLSelectElement).value), parts[1], model.slice(-2))"><option v-for="hour in hours" :key="hour" :value="hour">{{ String(hour).padStart(2, '0') }}</option></select><span>:</span><select class="ui-select" :value="parts[1]" :disabled="control.disabled.value || control.readonly.value" aria-label="分钟" @change="update(parts[0], Number(($event.target as HTMLSelectElement).value), model.slice(-2))"><option v-for="minute in minutes" :key="minute" :value="minute">{{ String(minute).padStart(2, '0') }}</option></select><select v-if="props.format === '12h'" class="ui-select" :value="model.slice(-2)" :disabled="control.disabled.value || control.readonly.value" aria-label="上午或下午" @change="update(parts[0], parts[1], ($event.target as HTMLSelectElement).value)"><option>AM</option><option>PM</option></select></div>
        </div>
    </UiControlFrame>
</template>

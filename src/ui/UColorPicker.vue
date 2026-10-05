<script setup lang="ts">
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, ref, useAttrs } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { hexToHsv, hsvToHex, type HsvColor } from './specialized-inputs';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & { swatches?: readonly string[]; showInputs?: boolean }>(), { dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined });
const props = useDefaults(rawProps, 'UColorPicker');
const model = defineModel<string>({ default: '#000000' });
const attrs = useAttrs();
const element = ref<HTMLDivElement>();
const control = useFormControl(props, model, element, attrs);
const hsv = computed(() => hexToHsv(model.value) ?? { h: 0, s: 0, v: 0 });
function update(next: HsvColor) { if (!control.disabled.value && !control.readonly.value) control.editable.value = hsvToHex(next); }
function updateChannel(channel: keyof HsvColor, value: number) { update({ ...hsv.value, [channel]: value }); }
function updateHex(value: string) {
    const parsed = hexToHsv(value);
    if (parsed) update(parsed);
}
defineExpose({ element, hsv, control, update, updateChannel, updateHex, focus: () => element.value?.querySelector<HTMLElement>('input,button')?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" class="ui-color-picker" :class="control.classes.value" :style="control.styles.value" :aria-describedby="controlAttrs['aria-describedby']">
            <div class="ui-color-preview" :style="{ backgroundColor: model }"><span>{{ model }}</span></div>
            <label v-for="channel in ['h', 's', 'v'] as const" :key="channel" class="ui-color-channel"><span>{{ { h: '色相', s: '饱和度', v: '明度' }[channel] }}</span><input type="range" min="0" :max="channel === 'h' ? 360 : 100" :value="channel === 'h' ? hsv[channel] : hsv[channel] * 100" :disabled="control.disabled.value || control.readonly.value" @input="updateChannel(channel, Number(($event.target as HTMLInputElement).value) / (channel === 'h' ? 1 : 100))" @blur="control.blur" /></label>
            <input v-if="props.showInputs !== false" :id="control.id()" class="ui-color-hex" :value="model" aria-label="十六进制颜色" :disabled="control.disabled.value" :readonly="control.readonly.value" @change="updateHex(($event.target as HTMLInputElement).value)" @blur="control.blur" />
            <div v-if="props.swatches?.length" class="ui-color-picker-swatches"><button v-for="swatch in props.swatches" :key="swatch" v-pointer-blur type="button" :style="{ backgroundColor: swatch }" :aria-label="swatch" :aria-pressed="model.toLowerCase() === swatch.toLowerCase()" :disabled="control.disabled.value || control.readonly.value" @click="updateHex(swatch)" /></div>
        </div>
    </UiControlFrame>
</template>

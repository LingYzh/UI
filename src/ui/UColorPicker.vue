<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import { vRipple, type RippleOptions } from './ripple';
import UiControlFrame from './UiControlFrame.vue';
import { mergeControlAttrs } from './form';
import { vPointerBlur } from './pointer-focus';
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import { useFormControl, type FormControlProps } from './form';
import { useDefaults } from './defaults';
import { hsvToHsl, hsvToRgb, parseColorModel, serializeColorModel, type ColorModelInput, type HSVA } from './color-model';
import { useLocale } from './locale-context';
import { dimensionLength as dimension, dimensionStyles, type DimensionProps } from './dimensions';

type Mode = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla';
type Swatch = string | ColorModelInput;

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<FormControlProps & DimensionProps & {
    swatches?: readonly (Swatch | readonly Swatch[])[];
    showInputs?: boolean;
    showSwatches?: boolean;
    hideInputs?: boolean;
    hideSliders?: boolean;
    hideInputLabels?: boolean;
    hideCanvas?: boolean;
    hideEyeDropper?: boolean;
    canvasHeight?: string | number;
    dotSize?: string | number;
    swatchesMaxHeight?: string | number;
    modes?: readonly Mode[];
    ripple?: RippleOptions;
}>(), {
    ripple: true, dense: undefined, ghost: undefined, rounded: undefined, hideDetails: undefined, persistentHint: undefined,
    hideCanvas: true, hideEyeDropper: false, canvasHeight: 150, dotSize: 10, swatchesMaxHeight: 150,
    showInputs: true, showSwatches: undefined, modes: () => ['rgb', 'rgba', 'hsl', 'hsla', 'hex', 'hexa']
});
const props = useDefaults(rawProps, 'UColorPicker');
defineEmits<{ 'update:focused': [value: boolean] }>();
const model = defineModel<ColorModelInput>({ default: '#000000' });
const mode = defineModel<Mode>('mode', { default: 'hex' });
const attrs = useAttrs();
const element = ref<HTMLDivElement>();
const canvas = ref<HTMLElement>();
const control = useFormControl(props, model, element, attrs);
const locale = useLocale();
const hsv = ref<HSVA>(parseColorModel(model.value) ?? { h: 0, s: 0, v: 0, a: 1 });
const color = computed(() => String(serializeColorModel(hsv.value, '#000000') ?? ''));
const hexInput = computed(() => String(serializeColorModel({ ...hsv.value, a: mode.value === 'hexa' ? hsv.value.a : 1 }, mode.value === 'hexa' ? '#000000FF' : '#000000') ?? ''));
const blocked = computed(() => control.disabled.value || control.readonly.value);
const channels = computed(() => mode.value.startsWith('rgb') ? ['r', 'g', 'b'] : ['h', 's', 'l']);
const channelValues = computed<Record<string, number>>(() => ({ ...(mode.value.startsWith('rgb') ? hsvToRgb(hsv.value) : hsvToHsl(hsv.value)) }));
const swatches = computed(() => (props.swatches ?? []).flatMap(swatch => Array.isArray(swatch) ? [...swatch] : [swatch]));
const showSwatches = computed(() => props.showSwatches ?? swatches.value.length > 0);
const eyeDropperAvailable = typeof window !== 'undefined' && 'EyeDropper' in window;
const picking = ref(false);
let eyeDropperAbort: AbortController | undefined;
let pointerId: number | undefined;
watch(model, value => {
    const parsed = parseColorModel(value);
    if (!parsed) { hsv.value = { h: 0, s: 0, v: 0, a: 1 }; return; }
    if (JSON.stringify(serializeColorModel(hsv.value, value)) !== JSON.stringify(value)) hsv.value = parsed;
});
watch(() => props.modes, modes => {
    if (modes.length && !modes.includes(mode.value)) mode.value = modes[0];
}, { immediate: true });
function update(next: Pick<HSVA, 'h' | 's' | 'v'> & { a?: number }) {
    if (blocked.value) return;
    const parsed = parseColorModel({ ...next, a: next.a ?? hsv.value.a });
    if (!parsed) return;
    hsv.value = parsed;
    control.editable.value = serializeColorModel(parsed, model.value);
}
function updateChannel(channel: keyof HSVA, value: number) { update({ ...hsv.value, [channel]: value }); }
function updateHex(value: string) {
    const parsed = parseColorModel(value);
    if (parsed) update(parsed);
}
function updateNumeric(channel: string, value: string) {
    if (!value.trim() || !Number.isFinite(Number(value))) return;
    if (channel === 'a') { updateChannel('a', Number(value)); return; }
    const parsed = parseColorModel({ ...channelValues.value, [channel]: Number(value) });
    if (parsed) update(parsed);
}
function moveCanvas(event: PointerEvent) {
    if (blocked.value || pointerId !== event.pointerId || !canvas.value) return;
    const bounds = canvas.value.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    update({ ...hsv.value, s: (event.clientX - bounds.left) / bounds.width, v: 1 - (event.clientY - bounds.top) / bounds.height });
}
function startCanvas(event: PointerEvent) {
    if (blocked.value || event.button !== 0) return;
    pointerId = event.pointerId;
    canvas.value?.setPointerCapture(event.pointerId);
    canvas.value?.focus({ preventScroll: true });
    moveCanvas(event);
}
function endCanvas(event: PointerEvent) {
    if (pointerId !== event.pointerId) return;
    if (canvas.value?.hasPointerCapture(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId);
    pointerId = undefined;
}
function canvasKeydown(event: KeyboardEvent) {
    if (blocked.value || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? .1 : .01;
    const delta = step;
    update({ ...hsv.value,
        s: event.key === 'Home' ? 0 : event.key === 'End' ? 1 : hsv.value.s + (event.key === 'ArrowRight' ? delta : event.key === 'ArrowLeft' ? -delta : 0),
        v: hsv.value.v + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0)
    });
}
async function pickColor() {
    if (blocked.value || picking.value || !eyeDropperAvailable) return;
    const Constructor = (window as unknown as { EyeDropper: new () => { open(options: { signal: AbortSignal }): Promise<{ sRGBHex: string }> } }).EyeDropper;
    picking.value = true;
    const controller = new AbortController();
    eyeDropperAbort = controller;
    try {
        const result = await new Constructor().open({ signal: controller.signal });
        if (!controller.signal.aborted && !blocked.value) updateHex(result.sRGBHex);
    } catch { /* Cancelled native selection leaves the model unchanged. */ }
    finally { if (eyeDropperAbort === controller) { eyeDropperAbort = undefined; picking.value = false; } }
}
watch(blocked, value => {
    if (value) {
        eyeDropperAbort?.abort();
        if (pointerId !== undefined && canvas.value?.hasPointerCapture(pointerId)) canvas.value.releasePointerCapture(pointerId);
        pointerId = undefined;
    }
});
onBeforeUnmount(() => { eyeDropperAbort?.abort(); pointerId = undefined; });
defineExpose({ element, canvas, hsv, mode, control, update, updateChannel, updateHex, pickColor, focus: () => element.value?.querySelector<HTMLElement>('input,button,[tabindex]')?.focus(), validate: control.validate, reset: control.reset, resetValidation: control.resetValidation });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :max-width="props.maxWidth ?? '100%'" :framed="true" :for="`${control.id()}-input`" :error="control.displayErrors.value.join('\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div ref="element" v-bind="mergeControlAttrs(attrs, {}, `${control.id()}-picker`)" class="ui-color-picker" :class="control.classes.value" :style="[control.styles.value, dimensionStyles(props)]" :aria-describedby="controlAttrs['aria-describedby']">
            <slot name="prepend" :color="hsv" :update-color="update" />
            <div v-if="!props.hideCanvas" ref="canvas" v-focus-modality class="ui-color-canvas" role="slider" :tabindex="blocked ? -1 : 0"
                :aria-label="locale.t('color.canvas')" :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="Math.round(hsv.s * 100)"
                :aria-valuetext="locale.t('color.canvasValue', { saturation: Math.round(hsv.s * 100), value: Math.round(hsv.v * 100) })" :aria-disabled="blocked || undefined"
                :style="{ height: dimension(props.canvasHeight), backgroundColor: `hsl(${hsv.h} 100% 50%)` }"
                @pointerdown="startCanvas" @pointermove="moveCanvas" @pointerup="endCanvas" @pointercancel="endCanvas" @lostpointercapture="endCanvas"
                @keydown="canvasKeydown" @focus="control.focus" @blur="control.blur">
                <span class="ui-color-canvas-dot" :style="{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, width: dimension(props.dotSize), height: dimension(props.dotSize), backgroundColor: color }" />
            </div>
            <div class="ui-color-preview" :style="{ backgroundColor: color }"><span>{{ color }}</span></div>
            <template v-if="!props.hideSliders">
                <label v-for="channel in ['h', 's', 'v', ...(mode.endsWith('a') ? ['a'] : [])] as (keyof HSVA)[]" :key="channel" class="ui-color-channel"><span>{{ locale.t(`color.${channel}`) }}</span><input v-focus-modality type="range" min="0" :max="channel === 'h' ? 360 : 100" step="any" :value="channel === 'h' ? hsv[channel] : hsv[channel] * 100" :disabled="blocked" @input="updateChannel(channel, Number(($event.target as HTMLInputElement).value) / (channel === 'h' ? 1 : 100))" @focus="control.focus" @blur="control.blur" /></label>
            </template>
            <div v-if="props.showInputs !== false && !props.hideInputs" class="ui-color-inputs">
                <input v-if="mode.startsWith('hex')" :id="`${control.id()}-input`" class="ui-color-hex" :value="hexInput" :aria-label="locale.t('color.hex')" :disabled="control.disabled.value" :readonly="control.readonly.value" @change="updateHex(($event.target as HTMLInputElement).value)" @focus="control.focus" @blur="control.blur" />
                <template v-else>
                    <label v-for="channel in [...channels, ...(mode.endsWith('a') ? ['a'] : [])]" :key="channel" class="ui-color-number">
                        <span v-if="!props.hideInputLabels">{{ channel.toUpperCase() }}</span>
                        <input :id="channel === channels[0] ? `${control.id()}-input` : undefined" type="number" min="0" :max="channel === 'h' ? 360 : ['r', 'g', 'b'].includes(channel) ? 255 : 1" :step="['r', 'g', 'b', 'h'].includes(channel) ? 1 : .01"
                            :value="channel === 'a' ? hsv.a : Number(channelValues[channel]).toFixed(['r', 'g', 'b', 'h'].includes(channel) ? 0 : 2)"
                            :aria-label="locale.t(`color.${channel}`)" :disabled="control.disabled.value" :readonly="control.readonly.value" @change="updateNumeric(channel, ($event.target as HTMLInputElement).value)" @focus="control.focus" @blur="control.blur" />
                    </label>
                </template>
                <select v-if="props.modes.length > 1" v-model="mode" :disabled="blocked" :aria-label="locale.t('color.mode')" @focus="control.focus" @blur="control.blur"><option v-for="item in props.modes" :key="item" :value="item">{{ item.toUpperCase() }}</option></select>
            </div>
            <button v-if="eyeDropperAvailable && !props.hideEyeDropper" type="button" class="ui-color-dropper" :disabled="blocked || picking" @click="pickColor">{{ locale.t('color.dropper') }}</button>
            <div v-if="showSwatches" class="ui-color-picker-swatches" :style="{ maxHeight: dimension(props.swatchesMaxHeight) }"><button v-ripple="props.ripple" v-for="(swatch, index) in swatches" :key="index" v-pointer-blur type="button" :style="{ backgroundColor: String(serializeColorModel(parseColorModel(swatch), '#000000') ?? '') }" :aria-label="String(serializeColorModel(parseColorModel(swatch), '#000000') ?? '')" :aria-pressed="color === serializeColorModel(parseColorModel(swatch), '#000000')" :disabled="blocked" @click="() => { const value = parseColorModel(swatch); if (value) update(value); }" @focus="control.focus" @blur="control.blur" /></div>
            <slot name="default" :color="hsv" :update-color="update" />
            <slot name="append" :color="hsv" :update-color="update" />
        </div>
    </UiControlFrame>
</template>

// Visual templates authored by root. Behavior is kept in the component scripts.
import { readFileSync, writeFileSync } from 'node:fs';

const frame = body => `<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="true" :for="control.id()" :error="control.errors.value.join('\\n')" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
${body}
    </UiControlFrame>
</template>`;
const templates = {
    UNumberInput: frame(`        <div class="ui-input ui-number-input" :class="control.classes.value" :style="control.styles.value">
            <button v-pointer-blur type="button" class="ui-control-step" aria-label="减少数值" :disabled="!canDecrease" @click="change(-1)">−</button>
            <input ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :value="text" type="text" inputmode="decimal" role="spinbutton" :aria-valuenow="model ?? undefined" :aria-valuemin="props.min" :aria-valuemax="props.max" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="invalidInput || control.state.value === false || undefined" @input="updateText(($event.target as HTMLInputElement).value)" @blur="commit" @keydown="keydown" />
            <button v-pointer-blur type="button" class="ui-control-step" aria-label="增加数值" :disabled="!canIncrease" @click="change(1)">+</button>
        </div>`),
    UFileInput: frame(`        <div class="ui-file-control" :class="control.classes.value" :style="control.styles.value">
            <input ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" type="file" :accept="props.accept" :multiple="props.multiple" :disabled="control.disabled.value" @click="control.guard" @change="change" @blur="control.blur" />
            <div v-if="files.length" class="ui-file-summary"><span v-for="(file, index) in files" :key="index" :title="file.name">{{ file.name }}<small v-if="props.showSize"> · {{ (file.size / 1024).toFixed(1) }} KB</small></span><button v-pointer-blur type="button" class="ui-control-clear" aria-label="清除文件" :disabled="control.disabled.value || control.readonly.value" @click="clear">×</button></div>
        </div>`),
    UFileUpload: frame(`        <div ref="element" class="ui-file-upload" :class="[control.classes.value, { 'is-dragging': dragging }]" :style="control.styles.value" :aria-describedby="controlAttrs['aria-describedby']" @dragover.prevent="dragging = !control.disabled.value && !control.readonly.value" @dragleave="dragging = false" @drop="drop">
            <div class="ui-upload-target"><span class="ui-upload-symbol" aria-hidden="true">↑</span><strong>拖放文件到这里</strong><span class="ui-upload-hint">或选择本地文件</span><input :id="control.id()" ref="input" class="ui-upload-file-input" type="file" :accept="props.accept" :multiple="props.multiple" :disabled="control.disabled.value" :aria-label="props.label || '上传文件'" @click="control.guard" @change="change" @blur="control.blur" /></div>
            <ul v-if="files.length" class="ui-upload-files"><li v-for="(file, index) in files" :key="index"><span :title="file.name">{{ file.name }}</span><small>{{ (file.size / 1024).toFixed(1) }} KB</small><button v-pointer-blur type="button" class="ui-control-clear" :aria-label="'移除 ' + file.name" :disabled="control.disabled.value || control.readonly.value" @click="remove(index)">×</button></li></ul>
        </div>`),
    USlider: frame(`        <div class="ui-slider-control" :class="control.classes.value" :style="control.styles.value">
            <input ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" type="range" :value="value" :min="props.min" :max="props.max" :step="props.step" :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :style="{ '--ui-slider-progress': percent + '%' }" @pointerdown="control.guard" @keydown="control.guardKeys" @input="input" @blur="control.blur" />
            <output v-if="props.thumbLabel">{{ value }}</output><div v-if="props.showTicks" class="ui-slider-ticks"><span>{{ props.min }}</span><span>{{ props.max }}</span></div>
        </div>`),
    URangeSlider: frame(`        <div ref="element" class="ui-range-control" :class="control.classes.value" :style="control.styles.value" :aria-describedby="controlAttrs['aria-describedby']">
            <div class="ui-range-track" :style="{ '--ui-range-start': percentages[0] + '%', '--ui-range-end': percentages[1] + '%' }" />
            <input :id="control.id()" ref="startInput" type="range" :value="range[0]" :min="props.min" :max="props.max" :step="props.step" :disabled="control.disabled.value" :aria-label="(props.label || '范围') + '：下限'" :aria-readonly="control.readonly.value || undefined" @pointerdown="control.guard" @keydown="control.guardKeys" @input="input(0, $event)" @blur="control.blur" />
            <input ref="endInput" type="range" :value="range[1]" :min="props.min" :max="props.max" :step="props.step" :disabled="control.disabled.value" :aria-label="(props.label || '范围') + '：上限'" :aria-readonly="control.readonly.value || undefined" @pointerdown="control.guard" @keydown="control.guardKeys" @input="input(1, $event)" @blur="control.blur" />
            <div class="ui-slider-ticks"><output>{{ range[0] }}</output><output>{{ range[1] }}</output></div>
        </div>`),
    UOtpInput: frame(`        <div ref="element" class="ui-otp-control" :class="control.classes.value" :style="control.styles.value" :aria-describedby="controlAttrs['aria-describedby']">
            <input v-for="(cell, index) in cells" :id="index === 0 ? control.id() : undefined" :key="index" :ref="(node) => setInput(node, index)" :value="cell" :inputmode="props.numeric ? 'numeric' : 'text'" :autocomplete="index === 0 ? 'one-time-code' : 'off'" :autofocus="props.autofocus && index === 0" :aria-label="(props.label || '验证码') + '第 ' + (index + 1) + ' 位'" :disabled="control.disabled.value" :readonly="control.readonly.value" maxlength="1" @input="update(index, ($event.target as HTMLInputElement).value)" @keydown="keydown(index, $event)" @paste="paste(index, $event)" @blur="control.blur" />
        </div>`),
    UColorInput: frame(`        <div class="ui-input ui-color-input" :class="control.classes.value" :style="control.styles.value">
            <input ref="nativeInput" class="ui-color-native" type="color" :value="model || '#000000'" :disabled="control.disabled.value || control.readonly.value" aria-label="打开颜色选择器" @input="update(($event.target as HTMLInputElement).value)" />
            <input ref="element" v-bind="mergeControlAttrs(attrs, controlAttrs, control.id())" :value="text" placeholder="#RRGGBB" :disabled="control.disabled.value" :readonly="control.readonly.value" :aria-invalid="!valid || control.state.value === false || undefined" @input="update(($event.target as HTMLInputElement).value)" @blur="commit" />
        </div>`),
    UColorPicker: frame(`        <div ref="element" class="ui-color-picker" :class="control.classes.value" :style="control.styles.value" :aria-describedby="controlAttrs['aria-describedby']">
            <div class="ui-color-preview" :style="{ backgroundColor: model }"><span>{{ model }}</span></div>
            <label v-for="channel in ['h', 's', 'v'] as const" :key="channel" class="ui-color-channel"><span>{{ { h: '色相', s: '饱和度', v: '明度' }[channel] }}</span><input type="range" min="0" :max="channel === 'h' ? 360 : 100" :value="channel === 'h' ? hsv[channel] : hsv[channel] * 100" :disabled="control.disabled.value || control.readonly.value" @input="updateChannel(channel, Number(($event.target as HTMLInputElement).value) / (channel === 'h' ? 1 : 100))" @blur="control.blur" /></label>
            <input v-if="props.showInputs !== false" :id="control.id()" class="ui-color-hex" :value="model" aria-label="十六进制颜色" :disabled="control.disabled.value" :readonly="control.readonly.value" @change="updateHex(($event.target as HTMLInputElement).value)" @blur="control.blur" />
            <div v-if="props.swatches?.length" class="ui-color-picker-swatches"><button v-for="swatch in props.swatches" :key="swatch" v-pointer-blur type="button" :style="{ backgroundColor: swatch }" :aria-label="swatch" :aria-pressed="model.toLowerCase() === swatch.toLowerCase()" :disabled="control.disabled.value || control.readonly.value" @click="updateHex(swatch)" /></div>
        </div>`),
    URating: frame(`        <div ref="element" class="ui-rating" :class="control.classes.value" :style="control.styles.value" role="slider" :aria-label="props.label || '评分'" :aria-valuemin="0" :aria-valuemax="props.length" :aria-valuenow="value" :aria-readonly="control.readonly.value || undefined" :aria-disabled="control.disabled.value || undefined" :aria-describedby="controlAttrs['aria-describedby']" @keydown="keydown">
            <button v-for="item in items" :key="item" v-pointer-blur type="button" :class="{ 'is-selected': item <= value }" :aria-label="item + ' 星'" :disabled="control.disabled.value" :tabindex="item === Math.max(1, Math.ceil(value)) ? 0 : -1" @click="update(item)" @blur="control.blur"><span aria-hidden="true">★</span></button><output>{{ value }} / {{ props.length }}</output>
        </div>`)
};
for (const [name, template] of Object.entries(templates)) {
    const file = `src/ui/${name}.vue`;
    let source = readFileSync(file, 'utf8');
    if (!source.includes("import UiControlFrame from './UiControlFrame.vue'")) source = source.replace(/(<script[^>]*>)/, "$1\nimport UiControlFrame from './UiControlFrame.vue';\nimport { mergeControlAttrs } from './form';\nimport { vPointerBlur } from './pointer-focus';");
    if (name === 'UOtpInput' && !source.includes('function setInput')) source = source.replace('</script>', "function setInput(node: unknown, index: number) { if (node instanceof HTMLInputElement) inputs.value[index] = node; }\n</script>");
    source = source.replace(/<template>[\s\S]*?<\/template>/, template);
    writeFileSync(file, source);
}
for (const name of ['UiCheckbox', 'UiSwitch']) {
    const file = `src/ui/${name}.vue`;
    let source = readFileSync(file, 'utf8').replaceAll('v-model="control.editable.value"', ':checked="checked" @change="change"');
    source = source.replaceAll('class="ui-checkbox-control"', 'class="ui-checkbox-control" :class="control.classes.value" :style="control.styles.value"').replaceAll('class="ui-switch"', 'class="ui-switch" :class="control.classes.value" :style="control.styles.value"');
    writeFileSync(file, source);
}
for (const name of ['UiRadio', 'UiColorSwatches']) {
    const file = `src/ui/${name}.vue`;
    let source = readFileSync(file, 'utf8');
    source = source.replace('class="ui-radio-control"', 'class="ui-radio-control" :class="control.classes.value" :style="control.styles.value"').replace('class="ui-swatches"', 'class="ui-swatches" :class="control.classes.value" :style="control.styles.value"');
    writeFileSync(file, source);
}
console.log('Root authored nine input templates and connected selection-control appearance/value state.');

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRefs, useAttrs, useId, watch, type CSSProperties } from 'vue';
import UiControlFrame from './UiControlFrame.vue';
import UiIcon from '../components/Icon.vue';
import { controlSizeStyles, type ControlSizing } from './control-sizing';
import { mergeControlAttrs, useFormControl, type FormControlProps } from './form';
import { isCascaderPathValid, resolveCascaderPath, type CascaderItem, type CascaderValue } from './cascader';
import { uiText } from './locale';
import { vPointerBlur } from './pointer-focus';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ControlSizing & FormControlProps & {
    items: readonly CascaderItem[];
    placeholder?: string;
    clearable?: boolean;
    changeOnSelect?: boolean;
    showAllLevels?: boolean;
    separator?: string;
    invalid?: boolean;
}>(), { showAllLevels: true, separator: ' / ', dense: undefined, ghost: undefined, rounded: undefined });
const model = defineModel<CascaderValue[]>({ default: () => [] });
const attrs = useAttrs();
const element = ref<HTMLButtonElement>();
const surface = ref<HTMLElement>();
const open = ref(false);
const draft = ref<CascaderValue[]>([]);
const uid = useId().replace(/[^\w-]/g, '-');
const popupId = `ui-cascader-${uid}`;
const anchor = `--ui-cascader-${uid}`;
let keyboardInteraction = false;
let blurFrame = 0;
const required = computed(() => attrs.required !== undefined && attrs.required !== false);
const rules = computed(() => {
    // Include items as a dependency so dynamic removals invalidate previous validation.
    const items = props.items;
    const changeOnSelect = props.changeOnSelect;
    return [
        (value: CascaderValue[]) => !required.value || value.length > 0 || uiText('cascader.required'),
        (value: CascaderValue[]) => isCascaderPathValid(items, value, changeOnSelect) || uiText('cascader.invalid'),
        ...props.rules ?? []
    ];
});
const control = useFormControl(reactive({ ...toRefs(props), rules }), model, element, attrs);
const selected = computed(() => resolveCascaderPath(props.items, model.value));
const display = computed(() => selected.value.length === model.value.length
    ? (props.showAllLevels ? selected.value : selected.value.slice(-1)).map(item => item.label).join(props.separator) : '');
const columns = computed(() => {
    const levels: (readonly CascaderItem[])[] = [props.items];
    for (const item of resolveCascaderPath(props.items, draft.value)) {
        if (!item.children?.length) break;
        levels.push(item.children);
    }
    return levels;
});
const invalid = computed(() => props.invalid || control.state.value === false || attrs['aria-invalid'] === true || attrs['aria-invalid'] === 'true');
function triggerAttrs() {
    const { class: _class, style: _style, required: _required, ...rest } = attrs;
    return rest;
}
function pointerInteraction() { if (open.value) keyboardInteraction = false; }
function close() { if (surface.value?.matches(':popover-open')) surface.value.hidePopover(); }
function focusColumn(level: number, value?: CascaderValue) {
    const items = Array.from(surface.value?.querySelectorAll<HTMLButtonElement>(`[data-level="${level}"] [role="option"]:not(:disabled)`) ?? []);
    const index = columns.value[level]?.findIndex(item => item.value === value) ?? -1;
    const candidate = index >= 0 ? surface.value?.querySelector<HTMLButtonElement>(`[data-level="${level}"] [data-index="${index}"]`) : undefined;
    const target = candidate && !candidate.disabled ? candidate : items[0] ?? surface.value;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function toggled(event: Event) {
    open.value = (event as ToggleEvent).newState === 'open';
    if (open.value) {
        draft.value = selected.value.map(item => item.value);
        nextTick(() => focusColumn(0, draft.value[0]));
    } else if (keyboardInteraction && (!document.activeElement || document.activeElement === document.body || surface.value?.contains(document.activeElement))) {
        element.value?.focus({ preventScroll: true });
    } else if (!keyboardInteraction) {
        cancelAnimationFrame(blurFrame);
        blurFrame = requestAnimationFrame(() => { if (document.activeElement === element.value) element.value?.blur(); });
    }
}
async function choose(item: CascaderItem, level: number, keyboard = false) {
    if (control.disabled.value || control.readonly.value || item.disabled) return;
    keyboardInteraction = keyboard;
    draft.value = [...draft.value.slice(0, level), item.value];
    if (!item.children?.length || props.changeOnSelect) {
        model.value = [...draft.value];
        close();
    } else {
        await nextTick();
        if (keyboard) focusColumn(level + 1);
        else surface.value?.querySelector<HTMLElement>(`[data-level="${level + 1}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
}
function keydown(event: KeyboardEvent, level: number, item: CascaderItem) {
    keyboardInteraction = true;
    const buttons = Array.from(surface.value?.querySelectorAll<HTMLButtonElement>(`[data-level="${level}"] [role="option"]:not(:disabled)`) ?? []);
    const index = buttons.indexOf(event.currentTarget as HTMLButtonElement);
    const targets: Record<string, number> = { ArrowDown: (index + 1) % buttons.length, ArrowUp: index <= 0 ? buttons.length - 1 : index - 1, Home: 0, End: buttons.length - 1 };
    if (event.key in targets) { event.preventDefault(); buttons[targets[event.key]]?.focus(); }
    else if (event.key === 'ArrowRight' && item.children?.length) {
        event.preventDefault();
        // Right always navigates; changeOnSelect only affects explicit selection.
        draft.value = [...draft.value.slice(0, level), item.value];
        nextTick(() => focusColumn(level + 1));
    } else if (event.key === 'ArrowLeft' && level > 0) {
        event.preventDefault(); focusColumn(level - 1, draft.value[level - 1]);
    }
}
function triggerKey(event: KeyboardEvent) {
    keyboardInteraction = true;
    control.guardKeys(event);
    if (event.defaultPrevented || control.disabled.value || control.readonly.value) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open.value) (surface.value?.showPopover as ((options: { source?: HTMLElement }) => void) | undefined)?.({ source: element.value });
        else focusColumn(0, draft.value[0]);
    }
}
function clear(event: MouseEvent) {
    if (control.disabled.value || control.readonly.value) return;
    keyboardInteraction = event.detail === 0;
    model.value = [];
    draft.value = [];
    close();
    if (keyboardInteraction) element.value?.focus();
}
function fieldBlur(event: FocusEvent) {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) control.blur();
}
function popupKey(event: KeyboardEvent) {
    keyboardInteraction = true;
    if (event.key === 'Tab') { close(); element.value?.focus(); }
}
watch([control.disabled, control.readonly], () => { if (control.disabled.value || control.readonly.value) close(); });
watch(model, () => { if (open.value) draft.value = selected.value.map(item => item.value); });
watch(() => props.items, () => { close(); draft.value = []; control.resetValidation(); }, { deep: true });
onMounted(() => document.addEventListener('pointerdown', pointerInteraction, true));
onBeforeUnmount(() => { document.removeEventListener('pointerdown', pointerInteraction, true); cancelAnimationFrame(blurFrame); close(); });
defineExpose({ element, focus: () => element.value?.focus(), close, validate: control.validate, reset: control.reset, resetValidation: control.resetValidation, errors: control.errors });
</script>

<template>
    <UiControlFrame v-slot="{ controlAttrs }" v-bind="props" :framed="control.framed.value" :for="control.id()" :error="control.errors.value.join('\n')" :required="required" :label-position="control.labelPosition.value" :label-width="control.labelWidth.value">
        <div class="ui-cascader" :class="[$attrs.class, { 'is-dense': control.dense.value, 'is-ghost': control.ghost.value, 'is-square': !control.rounded.value, 'is-inline': inline }]" :style="[control.framed.value ? undefined : controlSizeStyles(props), $attrs.style as CSSProperties]" @focusout="fieldBlur">
            <button ref="element" v-bind="mergeControlAttrs(triggerAttrs(), controlAttrs, control.id())" type="button" class="ui-cascader-trigger" role="combobox"
                :disabled="control.disabled.value" :aria-readonly="control.readonly.value || undefined" :aria-required="required || undefined" :aria-invalid="invalid || undefined"
                aria-haspopup="dialog" :aria-expanded="open" :aria-controls="popupId" :popovertarget="popupId" :style="{ anchorName: anchor }"
                @pointerdown="keyboardInteraction = false" @keydown="triggerKey" @click="control.guard">
                <span class="ui-cascader-value" :class="{ 'is-placeholder': !display }" :title="display || undefined">{{ display || placeholder || uiText('cascader.placeholder') }}</span>
                <UiIcon name="mdi-chevron-down" :size="14" />
            </button>
            <button v-if="clearable && model.length && !control.readonly.value" v-pointer-blur type="button" class="ui-cascader-clear" :disabled="control.disabled.value" :aria-label="uiText('cascader.clear')" @click="clear"><UiIcon name="mdi-close" :size="14" /></button>
            <div :id="popupId" ref="surface" popover="auto" class="ui-menu-surface ui-cascader-panel" data-placement="bottom-start" role="dialog" :aria-label="`${label || uiText('cascader.placeholder')} ${uiText('common.options')}`" tabindex="-1" :style="{ positionAnchor: anchor }"
                @toggle="toggled" @pointerdown.capture="keyboardInteraction = false" @keydown="popupKey">
                <div class="ui-cascader-columns">
                    <div v-for="(items, level) in columns" :key="level" class="ui-cascader-column" role="listbox" :aria-label="uiText('cascader.level', { level: level + 1 })" :data-level="level">
                        <button v-for="(item, index) in items" :key="item.value" type="button" role="option" class="ui-cascader-option" :data-index="index" :disabled="item.disabled" :aria-selected="draft[level] === item.value" :aria-label="item.children?.length ? `${item.label} ${uiText('cascader.branch')}` : item.label"
                            @click="choose(item, level, $event.detail === 0)" @keydown="keydown($event, level, item)">
                            <span :title="item.label">{{ item.label }}</span><UiIcon v-if="item.children?.length" name="mdi-chevron-right" :size="14" /><UiIcon v-else-if="draft[level] === item.value" name="mdi-check" :size="14" />
                        </button>
                        <p v-if="!items.length" class="ui-cascader-empty" role="status">{{ uiText('common.empty') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </UiControlFrame>
</template>

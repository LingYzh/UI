<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, useAttrs, watch } from 'vue';
import UItemGroup from './UItemGroup.vue';
import { buttonToggleScopeKey } from './button-group';
import { bottomNavigationKey } from './bottom-navigation';
import { useAppLayout, useLayoutItem } from './layout-completion';
import { dimensionLength } from './dimensions';
import { defaultValueComparator } from './selection';
import { useDefaults } from './defaults';

type Density = 'default' | 'comfortable' | 'compact';
type Mode = 'horizontal' | 'shift';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
    multiple?: boolean;
    mandatory?: boolean | 'force';
    max?: number;
    valueComparator?: (a: unknown, b: unknown) => boolean;
    disabled?: boolean;
    readonly?: boolean;
    selectedClass?: string;
    height?: number | string;
    density?: Density;
    grow?: boolean;
    mode?: Mode;
    tag?: string;
    order?: string | number;
    name?: string;
    fixed?: boolean;
    absolute?: boolean;
    label?: string;
}>(), {
    multiple: false,
    mandatory: false,
    disabled: false,
    readonly: false,
    height: 56,
    density: 'default',
    grow: false,
    mode: 'horizontal',
    tag: 'nav',
    order: 5,
    fixed: false,
    absolute: false
});
const props = useDefaults(rawProps, 'UBottomNavigation');
const active = defineModel<boolean>('active', { default: true });
const model = defineModel<unknown>();
const attrs = useAttrs();
const group = ref<InstanceType<typeof UItemGroup>>();
const element = ref<HTMLElement>();
const measuredHeight = ref(0);
let observer: ResizeObserver | undefined;

provide(buttonToggleScopeKey, true);

function densityReduction(): number {
    return props.density === 'comfortable' ? 8 : props.density === 'compact' ? 16 : 0;
}

function pixelValue(value: string | number | undefined): number | undefined {
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : undefined;
    if (typeof value !== 'string') return undefined;
    const match = value.trim().match(/^(\d+(?:\.\d+)?)(?:px)?$/i);
    return match ? Number(match[1]) : undefined;
}

const minHeight = computed(() => {
    const height = dimensionLength(props.height);
    if (!height) return undefined;
    const reduction = densityReduction();
    if (!reduction) return height;
    const pixels = pixelValue(props.height);
    return pixels === undefined ? `calc(${height} - ${reduction}px)` : `${Math.max(0, pixels - reduction)}px`;
});
const layoutHeight = computed(() => {
    if (measuredHeight.value > 0) return measuredHeight.value;
    const pixels = pixelValue(props.height);
    return pixels === undefined ? 0 : Math.max(0, pixels - densityReduction());
});
const appLayout = useAppLayout();
const layoutActive = computed(() => active.value && props.fixed && (!props.absolute || !!appLayout?.ordered.value));
const { offset, styles: layoutStyles } = useLayoutItem(computed(() => 'bottom'), layoutHeight, layoutActive, computed(() => Number(props.order) || 0), computed(() => props.name));

function select(value: unknown): void {
    if (props.disabled || props.readonly) return;
    if (props.multiple) {
        const compare = props.valueComparator ?? defaultValueComparator;
        const current = Array.isArray(model.value) ? model.value : [];
        if (current.some(entry => compare(entry, value))) return;
        if (props.max !== undefined && current.length >= props.max) return;
        model.value = [...current, value];
        return;
    }
    model.value = value;
}

const selectedIds = computed(() => group.value?.selected ?? []);
const selectedValues = computed(() => group.value?.selectedValues ?? []);
const selectedValue = computed(() => Array.isArray(model.value) ? model.value[0] as string | number | undefined : model.value as string | number | undefined);
provide(bottomNavigationKey, { value: () => selectedValue.value, select: value => select(value) });

function observeElement(next: HTMLElement | undefined, previous?: HTMLElement): void {
    if (previous) observer?.unobserve(previous);
    if (!next) {
        measuredHeight.value = 0;
        return;
    }
    observer?.observe(next);
}

watch(element, observeElement, { flush: 'post' });
onMounted(() => {
    if (typeof ResizeObserver === 'undefined') return;
    observer = new ResizeObserver(entries => {
        const entry = entries.find(current => current.target === element.value);
        if (entry) measuredHeight.value = element.value?.offsetHeight ?? entry.contentRect.height;
    });
    if (element.value) observer.observe(element.value);
});
onBeforeUnmount(() => observer?.disconnect());

defineExpose({
    get element() { return element.value; },
    get selected() { return model.value; },
    get isActive() { return active.value; },
    get selectedIds() { return selectedIds.value; },
    get selectedValues() { return selectedValues.value; },
    isSelected: (id: string) => group.value?.isSelected(id) ?? false,
    select,
    next: () => group.value?.next(),
    prev: () => group.value?.prev()
});

defineSlots<{
    default?: (scope: {
        selected: unknown;
        select: (value: unknown) => void;
        selectedIds: string[];
        selectedValues: unknown[];
        isSelected: (id: string) => boolean;
        next: () => void;
        prev: () => void;
        isValueSelected: (value: unknown) => boolean;
        toggle: (value: unknown) => void;
    }) => any;
}>();
</script>

<template>
    <component
        :is="props.tag"
        ref="element"
        v-show="active"
        v-bind="attrs"
        class="ui-bottom-navigation"
        :class="[
            {
                'is-active': active,
                'is-fixed': props.fixed && !props.absolute,
                'is-absolute': props.absolute,
                'is-grow': props.grow,
                'is-horizontal': props.mode === 'horizontal',
                'is-shift': props.mode === 'shift',
                'is-comfortable': props.density === 'comfortable',
                'is-compact': props.density === 'compact'
            }
        ]"
        :style="[{ minHeight, bottom: `${offset}px`, ...(props.fixed || props.absolute ? layoutStyles : {}) }, attrs.style as any]"
        role="navigation"
        :aria-label="props.label ?? attrs['aria-label'] as string ?? '底部导航'"
    >
        <UItemGroup
            ref="group"
            v-model="model"
            tag="div"
            class="ui-bottom-navigation-content"
            :multiple="props.multiple"
            :mandatory="props.mandatory"
            :max="props.max"
            :value-comparator="props.valueComparator"
            :disabled="props.disabled"
            :readonly="props.readonly"
            :selected-class="props.selectedClass"
            :label="props.label"
        >
            <template #default="scope">
                <slot
                    :selected="model"
                    :select="select"
                    :selected-ids="scope.selected"
                    :selected-values="scope.selectedValues"
                    :is-selected="scope.isSelected"
                    :next="scope.next"
                    :prev="scope.prev"
                    :is-value-selected="scope.isValueSelected"
                    :toggle="scope.toggle"
                />
            </template>
        </UItemGroup>
    </component>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, onMounted, onUpdated, provide, ref, shallowRef, useId, watch, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import type { GroupContext, GroupValue } from './group-state';
import UWindow from './UWindow.vue';
import { useDefaults } from './defaults';
import { defaultValueComparator } from './selection';
import { tabsKey, tabsWindowKey, tabToken } from './tabs';
import { createTabsWindowRegistry } from './tabs-window-context';

interface TabsWindowPublicGroup {
    values: unknown[];
    selected: ComputedRef<unknown>;
    mandatory: boolean;
    multiple: boolean;
    disabled: boolean;
    register: (value: unknown, disabled?: MaybeRefOrGetter<boolean | undefined>) => () => void;
    isSelected: (value: unknown) => boolean;
    select: (value: unknown) => void;
    next: () => void;
    prev: () => void;
}

const rawProps = withDefaults(defineProps<{
    idPrefix?: string;
    modelValue?: unknown;
    disabled?: boolean;
    tag?: string;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    height?: string | number;
    eager?: boolean;
    keyboard?: boolean;
    continuous?: boolean;
    label?: string;
    showArrows?: boolean | 'hover';
}>(), {
    tag: 'div',
    direction: 'horizontal',
    eager: false,
    keyboard: true,
    continuous: false,
    reverse: false,
    disabled: undefined,
    showArrows: undefined
});
const props = useDefaults(rawProps, 'UTabsWindow');
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>();
const instance = getCurrentInstance();
const hasExplicitModel = computed(() => {
    // Read the reactive prop as well as vnode props so an explicitly bound model can be added or removed after setup.
    void props.modelValue;
    return Object.hasOwn(instance?.vnode.props ?? {}, 'modelValue')
        || Object.hasOwn(instance?.vnode.props ?? {}, 'model-value');
});
const tabs = inject(tabsKey, undefined);
const uid = `ui-tabs-window-${useId()}`;
const windowComponent = ref<{ $el: HTMLElement; next: () => void; prev: () => void }>();
const element = computed(() => windowComponent.value?.$el);
const adjacentPrefix = ref<string>();
const adjacentLegacy = ref(false);
const registry = createTabsWindowRegistry();
const internalGroup = shallowRef<GroupContext>();
const prefix = computed(() => props.idPrefix ?? tabs?.prefix.value ?? adjacentPrefix.value ?? uid);
function compare(left: unknown, right: unknown): boolean {
    return tabs?.compare(left, right) ?? defaultValueComparator(left, right);
}

function fallbackModel(): unknown {
    if (!tabs) return undefined;
    const selectedTab = tabs.entries.find(entry => tabs.selection.isSelected(entry.id));
    return selectedTab?.value.value;
}

const localModel = shallowRef<unknown>();
const hasLocalModel = ref(false);
const model = computed<unknown>({
    get() {
        if (hasExplicitModel.value) return props.modelValue;
        return hasLocalModel.value ? localModel.value : fallbackModel();
    },
    set(value) {
        emit('update:modelValue', value);
        if (!hasExplicitModel.value) {
            localModel.value = value;
            hasLocalModel.value = true;
        }
    }
});
watch([hasExplicitModel, () => tabs?.model.value, () => tabs?.selection.selectedIds.value], () => {
    if (!hasExplicitModel.value) hasLocalModel.value = false;
}, { deep: true });

const effectiveDisabled = computed(() => !!(props.disabled ?? false) || !!tabs?.disabled.value);
const groupModel = computed<GroupValue | null>({
    get() {
        const entry = registry.entries.find(candidate => compare(candidate.value.value, model.value));
        return entry?.internalValue ?? null;
    },
    set(value) {
        const entry = value == null ? undefined : registry.entries.find(candidate => candidate.internalValue === value);
        model.value = entry ? entry.value.value : undefined;
    }
});

function token(value: unknown): string {
    if (tabs) return tabs.token(value);
    if (adjacentLegacy.value && (typeof value === 'string' || typeof value === 'number')) return String(value);
    if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
        const entry = registry.entries.find(candidate => compare(candidate.value.value, value));
        if (entry) return `r-${encodeURIComponent(entry.id)}`;
    }
    return tabToken(value);
}

provide(tabsWindowKey, {
    prefix,
    model,
    compare,
    token,
    entries: registry.entries,
    register: registry.register,
    unregister: registry.unregister,
    reorder: registry.reorder
});

function syncGroupOrder(group?: GroupContext): void {
    if (!group) return;
    const registered = new Set<GroupValue>(registry.entries.map(entry => entry.internalValue));
    const ordered: GroupValue[] = registry.entries.map(entry => entry.internalValue).filter(value => group.values.includes(value));
    ordered.push(...group.values.filter(value => !registered.has(value)));
    if (ordered.length === group.values.length && ordered.every((value, index) => group.values[index] === value)) return;
    group.values.splice(0, group.values.length, ...ordered);
}

const groupViews = new WeakMap<object, TabsWindowPublicGroup>();
function publicGroup(group: GroupContext): TabsWindowPublicGroup {
    let view = groupViews.get(group as object);
    if (view) return view;
    const entryFor = (value: unknown) => registry.entries.find(entry => compare(entry.value.value, value));
    view = {
        get values() {
            return group.values.flatMap(value => {
                const entry = registry.entries.find(candidate => candidate.internalValue === value);
                return entry ? [entry.value.value] : [];
            });
        },
        selected: model,
        get mandatory() { return group.mandatory; },
        get multiple() { return group.multiple; },
        get disabled() { return effectiveDisabled.value; },
        register(value: unknown, disabled) {
            const entry = entryFor(value);
            return entry ? group.register(entry.internalValue, disabled) : () => undefined;
        },
        isSelected(value: unknown) {
            const entry = entryFor(value);
            return entry ? group.isSelected(entry.internalValue) : false;
        },
        select(value: unknown) {
            const entry = entryFor(value);
            if (entry) group.select(entry.internalValue);
        },
        next: () => next(),
        prev: () => prev()
    };
    groupViews.set(group as object, view);
    return view;
}

function slotScope(scope: { modelValue: GroupValue | GroupValue[] | null | undefined; next: () => void; prev: () => void; group: GroupContext }) {
    internalGroup.value = scope.group;
    return {
        ...scope,
        modelValue: model.value,
        next: () => next(),
        prev: () => prev(),
        group: publicGroup(scope.group)
    };
}

onMounted(() => {
    if (!tabs) {
        const host = element.value;
        if (props.idPrefix) {
            const list = Array.from(document.querySelectorAll('[data-ui-tabs-prefix]')).find(candidate => candidate.getAttribute('data-ui-tabs-prefix') === props.idPrefix);
            adjacentLegacy.value = list?.getAttribute('data-ui-tabs-legacy') === 'true';
        } else {
            let previous = host?.previousElementSibling;
            while (previous) {
                const list = previous.matches('[data-ui-tabs-prefix]') ? previous : previous.querySelector('[data-ui-tabs-prefix]');
                if (list) {
                    adjacentPrefix.value = list.getAttribute('data-ui-tabs-prefix') ?? undefined;
                    adjacentLegacy.value = list.getAttribute('data-ui-tabs-legacy') === 'true';
                    break;
                }
                previous = previous.previousElementSibling;
            }
        }
    }
    registry.reorder();
    syncGroupOrder(internalGroup.value);
});

onUpdated(() => {
    registry.reorder();
    syncGroupOrder(internalGroup.value);
});

function next(): void { windowComponent.value?.next(); }
function prev(): void { windowComponent.value?.prev(); }
defineExpose({ element, next, prev });
</script>

<template>
    <UWindow
        ref="windowComponent"
        class="ui-tabs-window"
        :model-value="groupModel"
        :disabled="effectiveDisabled"
        :mandatory="false"
        :touch="false"
        :show-arrows="props.showArrows ?? false"
        :tag="props.tag"
        :direction="props.direction"
        :reverse="props.reverse"
        :height="props.height"
        :eager="props.eager"
        :keyboard="props.keyboard"
        :continuous="props.continuous"
        :label="props.label"
        @update:model-value="groupModel = $event"
    >
        <template #default="scope">
            <slot v-bind="slotScope(scope)" />
        </template>
        <template #additional="scope"><slot name="additional" v-bind="slotScope(scope)" /></template>
        <template #prev="scope"><slot name="prev" v-bind="scope" /></template>
        <template #next="scope"><slot name="next" v-bind="scope" /></template>
    </UWindow>
</template>

<script setup lang="ts">
import { vFocusModality } from './focus-modality';
import { vRipple, type RippleOptions } from './ripple';
import { isNestedControlEvent } from './action-events';
import { computed, ref, TransitionGroup } from 'vue';
import Icon from '../components/Icon.vue';
import { useReducedMotion } from './motion';
import { useExpandMotion } from './expand-motion';
import { vPointerBlur } from './pointer-focus';
import { getItemField, toggleTreeValues, treeSelectionState, type ListValue } from './list-completion';
import { useDefaults } from './defaults';
type Item = Record<string, unknown>;
type Node = { item: Item; value: ListValue; title: string; depth: number; parent: ListValue | null; children: Node[]; disabled: boolean };
const rawProps = withDefaults(defineProps<{
    items: Item[];
    modelValue?: ListValue[];
    opened?: ListValue[];
    activated?: ListValue | null;
    itemTitle?: string | ((item: unknown) => unknown);
    itemValue?: string | ((item: unknown) => unknown);
    itemChildren?: string;
    selectable?: boolean;
    multiple?: boolean;
    mandatory?: boolean;
    openOnClick?: boolean;
} & { ripple?: RippleOptions }>(), { ripple: true, activated: undefined, itemTitle: 'title', itemValue: 'value', itemChildren: 'children', selectable: true, multiple: true, mandatory: false, openOnClick: false });
const props = useDefaults(rawProps, 'UTreeview');
const emit = defineEmits<{ 'update:modelValue': [value: ListValue[]]; 'update:opened': [value: ListValue[]]; 'update:activated': [value: ListValue | null] }>();
const localSelected = ref<ListValue[]>([]);
const localOpened = ref<ListValue[]>([]);
const selected = computed(() => props.modelValue ?? localSelected.value);
const opened = computed(() => props.opened ?? localOpened.value);
const active = ref<ListValue | null>(null);
const root = ref<HTMLElement>();
const reduced = useReducedMotion();
const motion = useExpandMotion(() => reduced.value);
function enterBranch(element: Element, done: () => void) { element.removeAttribute('inert'); element.removeAttribute('aria-hidden'); motion.enter(element, done); }
function leaveBranch(element: Element, done: () => void) { element.setAttribute('inert', ''); element.setAttribute('aria-hidden', 'true'); motion.leave(element, done); }
function build(items: Item[], depth = 0, parent: ListValue | null = null, parentDisabled = false): Node[] {
    return items.map((item, index) => {
        const value = getItemField(item, props.itemValue!, `${parent ?? 'root'}:${index}`) as ListValue;
        const rawChildren = getItemField(item, props.itemChildren, []);
        const disabled = parentDisabled || Boolean(item.disabled);
        return { item, value, title: String(getItemField(item, props.itemTitle!, value) ?? ''), depth, parent,
            children: Array.isArray(rawChildren) ? build(rawChildren as Item[], depth + 1, value, disabled) : [], disabled };
    });
}
const nodes = computed(() => build(props.items));
const all = computed(() => {
    const result: Node[] = [];
    const visit = (items: Node[]) => items.forEach((node) => { result.push(node); visit(node.children); });
    visit(nodes.value);
    return result;
});
const visible = computed(() => {
    const result: Node[] = [];
    const visit = (items: Node[]) => items.forEach((node) => { result.push(node); if (opened.value.includes(node.value)) visit(node.children); });
    visit(nodes.value);
    return result;
});
function descendants(node: Node): ListValue[] {
    return [node.value, ...node.children.flatMap(descendants)].filter((value) => !all.value.find((entry) => entry.value === value)?.disabled);
}
function state(node: Node): 'checked' | 'mixed' | 'unchecked' {
    return treeSelectionState(descendants(node), selected.value);
}
function choose(node: Node) {
    if (node.disabled || !props.selectable) return;
    const values = props.multiple ? descendants(node) : [node.value];
    const next = toggleTreeValues(selected.value, values, props.multiple, props.mandatory);
    if (next === selected.value) return;
    localSelected.value = next;
    emit('update:modelValue', next);
}
function toggle(node: Node) {
    if (node.disabled) return;
    const next = opened.value.includes(node.value) ? opened.value.filter((value) => value !== node.value) : [...opened.value, node.value];
    localOpened.value = next;
    emit('update:opened', next);
}
function activate(node: Node, event?: MouseEvent) {
    if (node.disabled || event && isNestedControlEvent(event, event.currentTarget as HTMLElement)) return;
    active.value = node.value;
    emit('update:activated', node.value);
    if (props.openOnClick && node.children.length) toggle(node);
}
function keydown(event: KeyboardEvent, node: Node, index: number) {
    if (isNestedControlEvent(event, event.currentTarget as HTMLElement)) return;
    const elements = [...(root.value?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [])].filter((element) => !element.closest('[inert]'));
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? visible.value.length - 1 : Math.max(0, Math.min(visible.value.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
        elements?.[next]?.focus();
    } else if (event.key === 'ArrowRight' && node.children.length) { event.preventDefault(); if (!opened.value.includes(node.value)) toggle(node); else elements?.[index + 1]?.focus(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); if (opened.value.includes(node.value)) toggle(node); else elements?.[visible.value.findIndex((entry) => entry.value === node.parent)]?.focus(); }
    else if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); choose(node); activate(node); }
}
function setCheckboxIndeterminate(element: unknown, node: Node) {
    if (element instanceof HTMLInputElement) element.indeterminate = state(node) === 'mixed';
}
</script>

<template>
    <div ref="root" class="ui-treeview" role="tree" :aria-multiselectable="props.multiple">
        <TransitionGroup :css="false" @enter="enterBranch" @leave="leaveBranch" @enter-cancelled="motion.cancel" @leave-cancelled="motion.cancel">
            <div v-for="(node, index) in visible" :key="`${typeof node.value}:${String(node.value)}`" class="ui-treeview-branch">
                <div v-focus-modality v-ripple="props.ripple" class="ui-treeview-item" :class="{ 'is-active': (props.activated ?? active) === node.value }" role="treeitem" :aria-level="node.depth + 1" :aria-expanded="node.children.length ? opened.includes(node.value) : undefined" :aria-selected="state(node) === 'checked'" :aria-disabled="node.disabled" :style="{ paddingInlineStart: `${node.depth * 20 + 8}px` }" tabindex="0" @click="activate(node, $event)" @keydown="keydown($event, node, index)">
                    <button v-ripple="props.ripple" v-if="node.children.length" v-pointer-blur type="button" class="ui-treeview-toggle" :disabled="node.disabled" :aria-label="opened.includes(node.value) ? 'Collapse' : 'Expand'" :aria-expanded="opened.includes(node.value)" @click.stop="toggle(node)"><Icon name="mdi-chevron-right" :size="18" class="ui-disclosure-icon" :class="{ 'is-open': opened.includes(node.value) }" /></button><span v-else class="ui-treeview-spacer" />
                    <span v-if="props.selectable" class="ui-selection-ripple is-checkbox" v-ripple.center.circle="props.ripple"><input type="checkbox" :checked="state(node) === 'checked'" :disabled="node.disabled" :aria-label="node.title" :ref="(element) => setCheckboxIndeterminate(element, node)" @click.stop @change="choose(node)" /></span>
                    <span class="ui-treeview-title"><slot name="title" :item="node.item" :title="node.title">{{ node.title }}</slot></span>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

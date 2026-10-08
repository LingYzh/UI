<script setup lang="ts">
import { Comment, Fragment, Text, h, provide, useSlots, type VNode } from 'vue';
import UBreadcrumbsItem from './UBreadcrumbsItem.vue';
import UBreadcrumbsDivider from './UBreadcrumbsDivider.vue';
import { useDefaults } from './defaults';
import { breadcrumbsDisabledKey, breadcrumbsKey } from './breadcrumbs-completion';

const rawProps = withDefaults(defineProps<{
    divider?: string | number;
    ariaLabel?: string;
    items?: readonly (string | Record<string, unknown>)[];
    disabled?: boolean;
    tag?: string;
}>(), { divider: '/', ariaLabel: 'Breadcrumbs', disabled: false, tag: 'nav' });
const props = useDefaults(rawProps, 'UBreadcrumbs');
const slots = useSlots();

provide(breadcrumbsKey, () => String(props.divider ?? '/'));
provide(breadcrumbsDisabledKey, () => Boolean(props.disabled));

function flatten(nodes: VNode[]): VNode[] {
    return nodes.flatMap(node => node.type === Fragment
        ? flatten((node.children ?? []) as VNode[])
        : node.type === Comment || node.type === Text && !String(node.children).trim() ? [] : [node]);
}

function renderItems() {
    const rawItems = props.items;
    const nodes = rawItems ? rawItems.map((raw, index) => {
        const item = typeof raw === 'string' ? { title: raw } : raw;
        const disabled = typeof item.disabled === 'boolean'
            ? item.disabled
            : index === rawItems.length - 1 ? true : undefined;
        return h(UBreadcrumbsItem, { ...item, disabled, key: index },
            slots.item ? () => slots.item!({ item, index, props: item })
                : slots.title ? () => slots.title!({ item, index }) : undefined);
    }) : flatten(slots.default?.() ?? []);
    if (nodes.some(node => node.type === UBreadcrumbsDivider)) return nodes;
    return nodes.flatMap((node, index) => index < nodes.length - 1
        ? [node, h(UBreadcrumbsDivider, { key: `divider-${index}`, divider: props.divider }, slots.divider
            ? { default: () => slots.divider!({ item: rawItems?.[index], index }) }
            : undefined)]
        : [node]);
}
</script>

<template>
    <component :is="props.tag" class="ui-breadcrumbs" :aria-label="props.ariaLabel">
        <ol>
            <li v-if="$slots.prepend" class="ui-breadcrumbs-prepend"><slot name="prepend" /></li>
            <component :is="renderItems" />
        </ol>
    </component>
</template>

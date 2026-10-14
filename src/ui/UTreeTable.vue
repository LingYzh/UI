<script setup lang="ts">
import { computed, useSlots } from 'vue';
import UDataTable from './UDataTable.vue';
import UiButton from './UiButton.vue';
import { useDefaults } from './defaults';
import { useLocale } from './locale-context';
import { treeTableRows } from './tree-table';
import type { DataHeader, DataItem, ItemProperty } from './data-pipeline';
import type { TableSurfaceProps } from './data-table-types';

defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<TableSurfaceProps & {
    items?: readonly DataItem[];
    headers?: readonly DataHeader[];
    itemValue?: ItemProperty;
    itemChildren?: ItemProperty;
    treeKey: string;
    loading?: boolean;
    disabled?: boolean;
    mobile?: boolean;
}>(), { items: () => [], headers: () => [], itemValue: 'id', itemChildren: 'children', mobile: undefined, dense: undefined, hover: undefined, rounded: undefined });
const props = useDefaults(rawProps, 'UTreeTable');
const opened = defineModel<unknown[]>('opened', { default: () => [] });
const slots = useSlots();
const locale = useLocale();
const tree = computed(() => treeTableRows(props.items, opened.value, props.itemValue, props.itemChildren));
const items = computed(() => tree.value.rows.map(row => row.item));
const metadata = computed(() => new Map(tree.value.rows.map(row => [row.item, row])));
const forwardedSlots = computed(() => Object.keys(slots).filter(name => name !== `item.${props.treeKey}`));

function toggle(key: unknown): void {
    if (props.disabled) return;
    opened.value = opened.value.includes(key) ? opened.value.filter(value => value !== key) : [...opened.value, key];
}
function expandAll(): void { opened.value = [...tree.value.branches]; }
function collapseAll(): void { opened.value = []; }
defineExpose({ expandAll, collapseAll });
</script>

<template>
    <UDataTable v-bind="{ ...$attrs, ...props }" class="u-tree-table" :items="items" :items-per-page="-1" :page="1"
        hide-default-footer disable-sort no-filter>
        <template v-for="name in forwardedSlots" #[name]="scope">
            <slot :name="name" v-bind="scope" />
        </template>
        <template #[`item.${props.treeKey}`]="scope">
            <div class="u-tree-table-title" :style="{ paddingInlineStart: `${(metadata.get(scope.item)?.depth ?? 0) * 20}px` }">
                <UiButton v-if="metadata.get(scope.item)?.branch" class="u-tree-table-toggle" variant="text" size="x-small"
                    :icon="opened.includes(metadata.get(scope.item)?.key) ? '$expand' : '$next'"
                    :aria-label="locale.t(opened.includes(metadata.get(scope.item)?.key) ? 'table.collapseRow' : 'table.expandRow', { title: String(scope.value ?? '') })"
                    :aria-expanded="opened.includes(metadata.get(scope.item)?.key)" :disabled="props.disabled"
                    @click.stop="toggle(metadata.get(scope.item)?.key)" />
                <span v-else class="u-tree-table-spacer" aria-hidden="true" />
                <span class="u-tree-table-value">
                    <slot :name="`item.${props.treeKey}`" v-bind="scope" :depth="metadata.get(scope.item)?.depth ?? 0">
                        {{ scope.value }}
                    </slot>
                </span>
            </div>
        </template>
    </UDataTable>
</template>

<style scoped>
.u-tree-table-title { display: flex; align-items: center; gap: 4px; min-width: 0; text-align: start; }
.u-tree-table-toggle, .u-tree-table-spacer { flex: 0 0 24px; width: 24px; height: 24px; }
.u-tree-table-value { min-width: 0; overflow-wrap: anywhere; }
</style>

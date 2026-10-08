<script setup lang="ts">
import { computed } from 'vue';
import { vRipple } from './ripple';
import { vPointerBlur } from './pointer-focus';
import { useDefaults } from './defaults';
import { provideUiTheme } from './theme';
import UiScrollArea from './UiScrollArea.vue';
import {
    getItemProperty,
    itemKey,
    normalizeHeaders,
    toUnit,
    type DataHeader,
    type DataItem,
    type ItemProperty,
} from './data-pipeline';
import type { TableSurfaceProps } from './data-table-types';
import type { TableSort } from './table';
import { useLocale } from './locale-context';
const uiText = useLocale().t;
const rawProps = withDefaults(
    defineProps<
        TableSurfaceProps & {
            headers?: readonly DataHeader[];
            items?: readonly DataItem[];
            itemValue?: ItemProperty;
            loading?: boolean;
            emptyText?: string;
            sortBy?: readonly TableSort[];
            disabled?: boolean;
        }
    >(),
    {
        ripple: true,
        items: () => [],
        itemValue: 'id',
        sortBy: () => [],
        rounded: true,
        hover: true,
        gridlines: 'horizontal',
        label: 'Table',
        tag: 'div',
    }
);
const props = useDefaults(rawProps, 'UTable');
const emit = defineEmits<{ sort: [key: string] }>();
const theme = provideUiTheme(() => props.theme);
function staticHeaders(headers: readonly DataHeader[]): DataHeader[] {
    return headers.map((header) => ({
        ...header,
        sortable: header.sortable ?? false,
        children: header.children ? staticHeaders(header.children) : undefined,
    }));
}
const layout = computed(() => normalizeHeaders(staticHeaders(props.headers ?? []), props.items));
const compact = computed(() => props.density === 'compact' || props.dense);
function sortOrder(key: string) {
    return props.sortBy.find((sort) => sort.key === key)?.order;
}
</script>

<template>
    <component
        :is="props.tag"
        class="ui-table"
        :class="{
            'is-dense': compact,
            'is-comfortable': props.density === 'comfortable',
            'is-ghost': props.ghost,
            'is-square': !props.rounded,
            'is-fixed-header': props.fixedHeader,
            'is-fixed-footer': props.fixedFooter,
            'is-hover': props.hover,
        }"
        :data-gridlines="
            props.gridlines === true ? 'all' : props.gridlines === false ? 'none' : props.gridlines
        "
        :data-striped="props.striped"
        :style="[theme.styles.value, { '--ui-table-header-height': compact ? '40px' : '52px' }]"
        :data-ui-theme="theme.name.value"
        :data-theme="theme.current.value.dark ? 'dark' : 'light'"
        :aria-busy="props.loading || undefined"
    >
        <slot name="top" />
        <slot v-if="!$slots.default && $slots.wrapper" name="wrapper" />
            <UiScrollArea
                v-else
                :label="uiText('table.scrollArea', { label: props.label })"
                axis="both"
                :height="toUnit(props.height)"
                :dense="compact"
                :rounded="props.rounded"
            >
                <table :aria-label="props.label">
                    <slot name="caption" />
                    <slot v-if="$slots.default" />
                    <template v-else>
                        <thead>
                            <tr v-for="(row, depth) in layout.headers" :key="depth">
                                <th
                                    v-for="header in row"
                                    :key="header.key"
                                    :scope="header.colspan > 1 ? 'colgroup' : 'col'"
                                    :rowspan="header.rowspan"
                                    :colspan="header.colspan"
                                    :style="{
                                        textAlign: header.align,
                                        width: toUnit(header.width),
                                        top: props.fixedHeader
                                            ? `calc(var(--ui-table-header-height) * ${depth})`
                                            : undefined,
                                    }"
                                    :aria-sort="
                                        header.sortable
                                            ? sortOrder(header.key) === 'asc'
                                                ? 'ascending'
                                                : sortOrder(header.key) === 'desc'
                                                  ? 'descending'
                                                  : 'none'
                                            : undefined
                                    "
                                >
                                    <button
                                        v-if="header.sortable"
                                        type="button"
                                        class="ui-table-sort"
                                        :disabled="props.loading || props.disabled"
                                        :aria-label="uiText('table.sort', { title: header.title })"
                                        v-ripple="props.ripple"
                                        v-pointer-blur
                                        @click="emit('sort', header.key)"
                                    >
                                        <slot :name="`header.${header.key}`" :header="header">
                                            {{ header.title }}
                                        </slot>
                                        <svg
                                            class="ui-table-sort-icon"
                                            viewBox="0 0 12 16"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M6 2 10 6H2Z"
                                                :class="{
                                                    'is-active': sortOrder(header.key) === 'asc',
                                                }"
                                            />
                                            <path
                                                d="M2 10H10L6 14Z"
                                                :class="{
                                                    'is-active': sortOrder(header.key) === 'desc',
                                                }"
                                            />
                                        </svg>
                                    </button>
                                    <slot v-else :name="`header.${header.key}`" :header="header">
                                        {{ header.title }}
                                    </slot>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="props.loading">
                                <td
                                    :colspan="Math.max(1, layout.columns.length)"
                                    class="ui-table-state"
                                >
                                    <slot name="loading">
                                        <span role="status">{{ uiText('common.loading') }}</span>
                                    </slot>
                                </td>
                            </tr>
                            <template v-else>
                                <tr
                                    v-for="(item, index) in props.items"
                                    :key="itemKey(item, props.itemValue)"
                                >
                                    <td
                                        v-for="header in layout.columns"
                                        :key="header.key"
                                        :style="{ textAlign: header.align }"
                                    >
                                        <slot
                                            :name="`item.${header.key}`"
                                            :item="item"
                                            :value="getItemProperty(item, header.value)"
                                            :index="index"
                                        >
                                            {{ getItemProperty(item, header.value) ?? '—' }}
                                        </slot>
                                    </td>
                                </tr>
                                <tr v-if="!props.items.length">
                                    <td
                                        :colspan="Math.max(1, layout.columns.length)"
                                        class="ui-table-state"
                                    >
                                        <slot name="no-data">
                                            <span role="status">
                                                {{ props.emptyText ?? uiText('common.empty') }}
                                            </span>
                                        </slot>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </template>
                </table>
            </UiScrollArea>
        <slot name="bottom" />
    </component>
</template>

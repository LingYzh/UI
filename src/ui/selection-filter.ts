import { findMatchRanges } from '@vuetify/v0/utilities';
import type { SelectionFilterFunction, SelectionFilterMode } from './autocomplete-props';
import type { SelectionItem } from './selection';

export interface SelectionFilterOptions {
    customFilter?: SelectionFilterFunction;
    customKeyFilter?: Readonly<Record<string, SelectionFilterFunction>>;
    filterKeys?: string | readonly string[];
    filterMode?: SelectionFilterMode;
    ignoreAccents?: boolean | 'query' | 'target';
    noFilter?: boolean;
    standardFilterEnabled?: boolean;
}

export type LegacySelectionFilter = (item: SelectionItem, query: string) => boolean;

function getPath(value: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => current != null && typeof current === 'object'
        ? (current as Record<string, unknown>)[key]
        : undefined, value);
}

function itemValue(item: SelectionItem, key: string): unknown {
    if (key === 'title') return item.title;
    if (key === 'value') return item.value;
    const raw = getPath(item.raw, key);
    if (raw !== undefined) return raw;
    const internal = getPath(item, key);
    if (internal !== undefined) return internal;
    return getPath(item.props, key.startsWith('props.') ? key.slice('props.'.length) : key);
}

function defaultMatch(value: unknown, query: string, ignoreAccents?: SelectionFilterOptions['ignoreAccents']): SelectionFilterMatchResult {
    if (value == null) return -1;
    if (!query.length) return 0;
    const ranges = findMatchRanges(String(value), query, {
        ignoreCase: true,
        ignoreAccents: ignoreAccents ?? false,
        matchAll: true
    });
    return ranges.length ? ranges : -1;
}

type SelectionFilterMatchResult = boolean | number | readonly [number, number] | ReadonlyArray<readonly [number, number]>;

function matched(result: SelectionFilterMatchResult | null | undefined): boolean {
    if (result == null || result === false || result === -1) return false;
    if (typeof result === 'number') return result !== -1;
    if (typeof result === 'boolean') return result;
    return result.length > 0;
}

/** Applies Vuetify's selection filter modes while retaining the library's legacy item/query callback. */
export function matchesSelectionItem(
    item: SelectionItem,
    query: string,
    options: SelectionFilterOptions = {},
    legacyFilter?: LegacySelectionFilter
): boolean {
    if (options.noFilter) return true;

    const hasCustomKeyFilters = Object.keys(options.customKeyFilter ?? {}).length > 0;
    const hasStandardFilters = options.standardFilterEnabled
        ?? Boolean(options.customFilter || hasCustomKeyFilters || options.filterKeys || options.filterMode || options.ignoreAccents !== undefined);

    if (legacyFilter && !legacyFilter(item, query)) return false;
    if (legacyFilter && !hasStandardFilters) return true;
    if (!query && !hasCustomKeyFilters) return true;

    const keys = options.filterKeys === undefined
        ? ['title']
        : typeof options.filterKeys === 'string' ? [options.filterKeys] : [...options.filterKeys];
    let defaultMatches = 0;
    let customMatches = 0;
    const customFilters = options.customKeyFilter ?? {};
    const customFilterCount = Object.keys(customFilters).length;

    for (const key of keys) {
        const customKeyFilter = Object.hasOwn(customFilters, key) ? customFilters[key] : undefined;
        const result = customKeyFilter
            ? customKeyFilter(itemValue(item, key), query, item)
            : options.customFilter
                ? options.customFilter(itemValue(item, key), query, item)
                : defaultMatch(itemValue(item, key), query, options.ignoreAccents);

        if (!matched(result)) {
            if (options.filterMode === 'every') return false;
            continue;
        }

        if (customKeyFilter) customMatches++;
        else defaultMatches++;
    }

    if (!defaultMatches && !customMatches) return false;
    const mode = options.filterMode ?? 'intersection';
    if (mode === 'union' && customMatches !== customFilterCount && !defaultMatches) return false;
    if (mode === 'intersection' && (customMatches !== customFilterCount
        || (!defaultMatches && customFilterCount > 0 && keys.length !== customFilterCount))) return false;
    return true;
}

export function filterSelectionItems(
    items: readonly SelectionItem[],
    query: string,
    options: SelectionFilterOptions = {},
    legacyFilter?: LegacySelectionFilter
): SelectionItem[] {
    return items.filter(item => matchesSelectionItem(item, query, options, legacyFilter));
}

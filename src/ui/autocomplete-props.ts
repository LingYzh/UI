import type { ControlSizing } from './control-sizing';
import type { FormControlProps } from './form';
import type { ItemProperty, SelectionItem, ValueComparator } from './selection';
import type { RippleOptions } from './ripple';

export type SelectionFilterMatch = boolean | number | readonly [number, number] | ReadonlyArray<readonly [number, number]>;
export type SelectionFilterMode = 'some' | 'every' | 'union' | 'intersection';
export type SelectionFilterFunction = (value: unknown, query: string, item: SelectionItem) => SelectionFilterMatch;

/** Shared selection API for UAutocomplete and UCombobox. */
export interface AutocompleteProps extends ControlSizing, FormControlProps {
    ripple?: RippleOptions;
    items?: readonly unknown[];
    itemTitle?: ItemProperty;
    itemValue?: ItemProperty;
    itemProps?: ItemProperty | boolean;
    returnObject?: boolean;
    valueComparator?: ValueComparator;
    multiple?: boolean;
    chips?: boolean;
    clearable?: boolean;
    closableChips?: boolean;
    hideSelected?: boolean;
    hideNoData?: boolean;
    noDataText?: string;
    placeholder?: string;
    filter?: (item: SelectionItem, query: string) => boolean;
    customFilter?: SelectionFilterFunction;
    customKeyFilter?: Readonly<Record<string, SelectionFilterFunction>>;
    filterKeys?: string | readonly string[];
    filterMode?: SelectionFilterMode;
    ignoreAccents?: boolean | 'query' | 'target';
    noFilter?: boolean;
    autoSelectFirst?: boolean | 'exact';
    clearOnSelect?: boolean;
    blurOnSelect?: boolean;
    delimiters?: readonly string[];
    trimValues?: boolean;
    /** Internal mode used by UiSelect; keeps the input readonly without making the control readonly. */
    selectOnly?: boolean;
    menuTitle?: string;
    menuProps?: Record<string, unknown>;
    listProps?: Record<string, unknown>;
    eager?: boolean;
    noAutoScroll?: boolean;
    /** Internal mode switch; UCombobox always enables this. */
    combobox?: boolean;
    max?: number;
}

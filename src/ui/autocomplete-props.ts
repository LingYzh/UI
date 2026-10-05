import type { ControlSizing } from './control-sizing';
import type { FormControlProps } from './form';
import type { ItemProperty, SelectionItem, ValueComparator } from './selection';

/** Shared selection API for UAutocomplete and UCombobox. */
export interface AutocompleteProps extends ControlSizing, FormControlProps {
    items?: readonly unknown[];
    itemTitle?: ItemProperty;
    itemValue?: ItemProperty;
    itemProps?: ItemProperty | boolean;
    returnObject?: boolean;
    valueComparator?: ValueComparator;
    multiple?: boolean;
    chips?: boolean;
    clearable?: boolean;
    hideSelected?: boolean;
    noDataText?: string;
    placeholder?: string;
    filter?: (item: SelectionItem, query: string) => boolean;
    /** Internal mode switch; UCombobox always enables this. */
    combobox?: boolean;
    max?: number;
}

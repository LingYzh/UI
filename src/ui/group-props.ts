import type { FormControlProps } from './form';
import type { ValueComparator } from './selection';

export interface SelectionControlGroupProps extends FormControlProps {
    multiple?: boolean;
    mandatory?: boolean;
    max?: number;
    direction?: 'row' | 'column';
    valueComparator?: ValueComparator;
    name?: string;
}

export interface ItemGroupProps extends FormControlProps {
    multiple?: boolean;
    mandatory?: boolean | 'force';
    max?: number;
    direction?: 'row' | 'column';
    valueComparator?: ValueComparator;
    selectedClass?: string;
    tag?: string;
    theme?: string;
}

export type RadioGroupProps = Omit<SelectionControlGroupProps, 'multiple' | 'max'>;
export type CheckboxGroupProps = Omit<SelectionControlGroupProps, 'multiple'>;

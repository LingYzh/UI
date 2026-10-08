import type { ComputedRef, InjectionKey } from 'vue';
import type { SelectionGroupContext } from './selection-context';
export const buttonToggleScopeKey: InjectionKey<boolean> = Symbol('u-button-toggle-scope');
export const buttonGroupKey: InjectionKey<SelectionGroupContext & { register: (id: string, value?: () => unknown, disabled?: () => boolean) => { index: ComputedRef<number>; release: () => void } }> = Symbol('u-button-group');

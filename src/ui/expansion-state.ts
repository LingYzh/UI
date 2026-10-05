import type { InjectionKey } from 'vue';
import type { GroupValue } from './group-state';

export interface ExpansionPanelContext { value: GroupValue; open: () => boolean; toggle: () => void; disabled: () => boolean; titleId: string; textId: string }
export const expansionPanelKey: InjectionKey<ExpansionPanelContext> = Symbol('u-expansion-panel');

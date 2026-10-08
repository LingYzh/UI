import type { InjectionKey } from 'vue';
import type { createItemGroupState } from './item-group-state';

// Item IDs belong to this registry; the older selection context still supports
// value-based radio, chip and button extensions without changing their API.
export const itemGroupKey: InjectionKey<ReturnType<typeof createItemGroupState> & { selectedClass: () => string | undefined }> = Symbol('u-item-group-items');
export const itemGroupItemIdKey: InjectionKey<string> = Symbol('u-item-group-item-id');

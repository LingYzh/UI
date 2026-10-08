import { computed, nextTick, shallowReactive, type ComputedRef, type InjectionKey } from 'vue';
import type { GroupValue } from './group-state';
import type { WindowContext } from './window-state';

interface Entry {
    id: string;
    value: () => GroupValue;
    window: WindowContext;
    element: () => HTMLElement | undefined;
}

export interface StepperWindowRegistration {
    index: ComputedRef<number>;
    release: () => void;
}

export interface StepperWindowContext {
    register: (id: string, value: () => GroupValue, window: WindowContext, element: () => HTMLElement | undefined) => StepperWindowRegistration;
    reorder: () => void;
}

export const stepperWindowContextKey: InjectionKey<StepperWindowContext> = Symbol('u-stepper-window');

export function stepperWindowItemId(key: string | number | symbol | null | undefined, uid: number): string {
    if (typeof key === 'string') return `key:string:${key}`;
    if (typeof key === 'number') return `key:number:${key}`;
    return `instance:${uid}`;
}

export function createStepperWindowContext(): StepperWindowContext {
    const entries = shallowReactive<Entry[]>([]);

    function syncWindowValues(): void {
        const window = entries[0]?.window;
        if (!window) return;
        const next: GroupValue[] = [];
        for (const entry of entries) {
            const value = entry.value();
            if (!next.includes(value)) next.push(value);
        }
        const tracked = new Set(next);
        for (const value of window.values) {
            if (!tracked.has(value) && !next.includes(value)) next.push(value);
        }
        if (next.length === window.values.length && next.every((value, index) => value === window.values[index])) return;
        window.values.splice(0, window.values.length, ...next);
    }

    function register(id: string, value: () => GroupValue, window: WindowContext, element: () => HTMLElement | undefined): StepperWindowRegistration {
        const entry = { id, value, window, element };
        entries.push(entry);
        void nextTick(syncWindowValues);
        let released = false;
        return {
            index: computed(() => entries.indexOf(entry)),
            release() {
                if (released) return;
                released = true;
                const index = entries.indexOf(entry);
                if (index < 0) return;
                entries.splice(index, 1);
                void nextTick(syncWindowValues);
            }
        };
    }

    function reorder(): void {
        const window = entries[0]?.window;
        const selected = window?.selected.value;
        const selectedValues = Array.isArray(selected) ? selected : selected == null ? [] : [selected];
        const originalOrder = new Map(entries.map((entry, index) => [entry, index]));
        const ordered = entries.slice().sort((left, right) => {
            const leftElement = left.element();
            const rightElement = right.element();
            if (!leftElement?.isConnected || !rightElement?.isConnected) return originalOrder.get(left)! - originalOrder.get(right)!;
            const position = leftElement.compareDocumentPosition(rightElement);
            if (position & 4) return -1;
            if (position & 2) return 1;
            return originalOrder.get(left)! - originalOrder.get(right)!;
        });
        if (ordered.length === entries.length && ordered.every((entry, index) => entry === entries[index])) return;
        entries.splice(0, entries.length, ...ordered);
        void nextTick(() => {
            syncWindowValues();
            void nextTick(() => {
                if (!window || !selectedValues.length || window.selected.value != null) return;
                const orderedValues = entries.map(entry => entry.value());
                if (selectedValues.every(value => orderedValues.includes(value))) {
                    window.selected.value = Array.isArray(selected) ? selected : selectedValues[0];
                }
            });
        });
    }

    return { register, reorder };
}

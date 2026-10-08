import { computed, shallowReactive, type Ref } from 'vue';
import type { UiTabsWindowEntry } from './tabs';

export interface TabsWindowRegistry {
    entries: UiTabsWindowEntry[];
    register: (
        id: string,
        marker: Ref<HTMLElement | undefined>,
        value: () => unknown,
        disabled: () => boolean
    ) => UiTabsWindowEntry;
    unregister: (entry: UiTabsWindowEntry) => void;
    reorder: () => void;
}

export function createTabsWindowRegistry(): TabsWindowRegistry {
    const entries = shallowReactive<UiTabsWindowEntry[]>([]);

    function register(
        id: string,
        marker: Ref<HTMLElement | undefined>,
        value: () => unknown,
        disabled: () => boolean
    ): UiTabsWindowEntry {
        let entry!: UiTabsWindowEntry;
        entry = {
            id,
            internalValue: `ui-tabs-window-item:${id}`,
            marker,
            index: computed(() => entries.indexOf(entry)),
            value: computed(() => {
                const current = value();
                return current === undefined ? entry.index.value : current;
            }),
            disabled: computed(disabled)
        };
        entries.push(entry);
        return entry;
    }

    function unregister(entry: UiTabsWindowEntry): void {
        const index = entries.indexOf(entry);
        if (index >= 0) entries.splice(index, 1);
    }

    function reorder(): void {
        const originalOrder = new Map(entries.map((entry, index) => [entry, index]));
        const ordered = entries.slice().sort((left, right) => {
            const leftElement = left.marker.value;
            const rightElement = right.marker.value;
            if (!leftElement?.isConnected || !rightElement?.isConnected) {
                return originalOrder.get(left)! - originalOrder.get(right)!;
            }
            const position = leftElement.compareDocumentPosition(rightElement);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return originalOrder.get(left)! - originalOrder.get(right)!;
        });
        if (ordered.some((entry, index) => entries[index] !== entry)) {
            entries.splice(0, entries.length, ...ordered);
        }
    }

    return { entries, register, unregister, reorder };
}

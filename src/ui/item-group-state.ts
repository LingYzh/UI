import { computed, shallowReactive } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { defaultValueComparator } from './selection';
import type { ValueComparator } from './selection';

export type ItemGroupMandatory = boolean | 'force';

export interface ItemGroupStateProps {
    multiple?: boolean;
    mandatory?: ItemGroupMandatory;
    max?: number;
    disabled?: boolean;
    readonly?: boolean;
    valueComparator?: ValueComparator;
}

export interface ItemGroupStateEntry {
    id: string;
    value: () => unknown;
    disabled: () => boolean;
}

export interface ItemGroupRegistration {
    index: ComputedRef<number>;
    release: () => void;
}

export interface ItemGroupState {
    selectedIds: ComputedRef<string[]>;
    selectedValues: ComputedRef<unknown[]>;
    register: (entry: ItemGroupStateEntry) => ItemGroupRegistration;
    effectiveValue: (id: string) => unknown;
    isSelected: (id: string) => boolean;
    select: (id: string, value?: boolean) => void;
    toggle: (id: string) => void;
    next: () => void;
    prev: () => void;
    ensureMandatory: () => void;
    reorder: (ids: readonly string[]) => void;
}

export function createItemGroupState(model: Ref<unknown>, getProps: () => ItemGroupStateProps): ItemGroupState {
    const entries = shallowReactive<ItemGroupStateEntry[]>([]);

    function currentProps(): ItemGroupStateProps {
        return getProps() ?? {};
    }

    function comparatorFor(props: ItemGroupStateProps): ValueComparator {
        return props.valueComparator ?? defaultValueComparator;
    }

    function entryForId(id: string): ItemGroupStateEntry | undefined {
        return entries.find((entry) => entry.id === id);
    }

    function effectiveEntryValue(entry: ItemGroupStateEntry): unknown {
        const index = entries.indexOf(entry);
        if (index < 0) return undefined;
        const value = entry.value();
        return value === undefined ? index : value;
    }

    function findEntryForValue(value: unknown, compare: ValueComparator): ItemGroupStateEntry | undefined {
        return entries.find((entry) => compare(effectiveEntryValue(entry), value));
    }

    function modelValues(props: ItemGroupStateProps): unknown[] {
        if (model.value === undefined) return [];
        return props.multiple ? Array.isArray(model.value) ? model.value : [] : [model.value];
    }

    const selectedIds = computed(() => {
        const props = currentProps();
        const compare = comparatorFor(props);
        const ids: string[] = [];

        for (const value of modelValues(props)) {
            const entry = findEntryForValue(value, compare);
            if (entry && !ids.includes(entry.id)) ids.push(entry.id);
        }

        return ids;
    });

    const selectedValues = computed(() => {
        return selectedIds.value.flatMap((id) => {
            const entry = entryForId(id);
            return entry ? [effectiveEntryValue(entry)] : [];
        });
    });

    function effectiveValue(id: string): unknown {
        const entry = entryForId(id);
        return entry ? effectiveEntryValue(entry) : undefined;
    }

    function isSelected(id: string): boolean {
        return selectedIds.value.includes(id);
    }

    function canInteract(entry: ItemGroupStateEntry, props: ItemGroupStateProps): boolean {
        return !props.disabled && !props.readonly && !entry.disabled();
    }

    function isMandatory(props: ItemGroupStateProps): boolean {
        return props.mandatory === true || props.mandatory === 'force';
    }

    function select(id: string, value?: boolean): void {
        const entry = entryForId(id);
        const props = currentProps();
        if (!entry || !canInteract(entry, props)) return;

        const nextValue = effectiveEntryValue(entry);
        const compare = comparatorFor(props);

        if (props.multiple) {
            const current = Array.isArray(model.value) ? model.value : [];
            const hasValue = current.some((currentValue) => compare(currentValue, nextValue));
            const shouldRemove = value === false || (value === undefined && isSelected(id));

            if (shouldRemove) {
                if (!hasValue) return;
                const next = current.filter((currentValue) => !compare(currentValue, nextValue));
                if (isMandatory(props) && next.length === 0) return;
                model.value = next;
                return;
            }

            if (hasValue) return;
            if (props.max !== undefined && current.length >= props.max) return;
            model.value = [...current, nextValue];
            return;
        }

        const currentlySelected = isSelected(id);
        const shouldRemove = value === false || (value === undefined && currentlySelected);
        if (shouldRemove) {
            if (!currentlySelected || isMandatory(props)) return;
            model.value = undefined;
            return;
        }

        if (currentlySelected) return;
        model.value = nextValue;
    }

    function move(direction: 1 | -1): void {
        const props = currentProps();
        if (props.disabled || props.readonly) return;

        const available = entries.filter((entry) => !entry.disabled());
        if (available.length === 0) return;

        const currentId = selectedIds.value[0];
        const currentIndex = currentId === undefined ? -1 : entries.findIndex((entry) => entry.id === currentId);
        let target: ItemGroupStateEntry | undefined;

        if (currentIndex < 0) {
            target = available[0];
        } else {
            for (let offset = 1; offset <= entries.length; offset += 1) {
                const index = (currentIndex + direction * offset + entries.length) % entries.length;
                if (!entries[index].disabled()) {
                    target = entries[index];
                    break;
                }
            }
        }

        if (!target) return;
        if (props.multiple && props.max !== undefined && props.max < 1) return;

        const nextValue = effectiveEntryValue(target);
        model.value = props.multiple ? [nextValue] : nextValue;
    }

    function next(): void {
        move(1);
    }

    function prev(): void {
        move(-1);
    }

    function toggle(id: string): void {
        select(id);
    }

    function ensureMandatory(): void {
        const props = currentProps();
        if (props.disabled || props.readonly || props.mandatory !== 'force' || selectedIds.value.length > 0) return;

        const entry = entries.find((currentEntry) => !currentEntry.disabled());
        if (!entry) return;

        const value = effectiveEntryValue(entry);
        if (props.multiple) {
            const current = Array.isArray(model.value) ? model.value : [];
            if (props.max !== undefined && current.length >= props.max) return;
            model.value = [...current, value];
            return;
        }

        model.value = value;
    }

    function register(entry: ItemGroupStateEntry): ItemGroupRegistration {
        const registeredEntry = { ...entry };
        entries.push(registeredEntry);

        let released = false;
        const index = computed(() => entries.indexOf(registeredEntry));

        function release(): void {
            if (released) return;
            released = true;

            const currentIndex = entries.indexOf(registeredEntry);
            if (currentIndex < 0) return;
            entries.splice(currentIndex, 1);
            ensureMandatory();
        }

        return { index, release };
    }

    function reorder(ids: readonly string[]): void {
        const ordered: ItemGroupStateEntry[] = [];

        for (const id of ids) {
            const entry = entryForId(id);
            if (entry && !ordered.includes(entry)) ordered.push(entry);
        }

        for (const entry of entries) {
            if (!ordered.includes(entry)) ordered.push(entry);
        }

        if (ordered.length === entries.length && ordered.every((entry, index) => entry === entries[index])) return;
        entries.splice(0, entries.length, ...ordered);
    }

    return {
        selectedIds,
        selectedValues,
        register,
        effectiveValue,
        isSelected,
        select,
        toggle,
        next,
        prev,
        ensureMandatory,
        reorder
    };
}

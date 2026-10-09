import { computed, getCurrentInstance, inject, onActivated, onBeforeUnmount, onDeactivated, onMounted, onUpdated, provide, reactive, ref, useId, watch, type ComputedRef, type CSSProperties, type InjectionKey, type Ref, type VNode } from 'vue';

export type LayoutEdge = 'top' | 'right' | 'bottom' | 'left';
export type LayoutRect = Record<LayoutEdge, number>;
export type LayoutItemInput = { id?: string; edge: LayoutEdge; size: number; active: boolean; order: number };
export type LayoutItemGeometry = LayoutRect & { id: string; position: LayoutEdge; size: number };
export type AppLayoutOptions = { overlaps?: readonly string[]; layoutMode?: 'legacy' | 'ordered' };

type RegisteredItem = { id: string; edge: LayoutEdge; size: number; active: boolean; order: number };
type LayoutRecord = { key: symbol; item: RegisteredItem; rect: LayoutRect };
type OverlapAdjustment = { edge: LayoutEdge; amount: number };

const edges = new Set<LayoutEdge>(['top', 'right', 'bottom', 'left']);
const zeroRect = (): LayoutRect => ({ top: 0, right: 0, bottom: 0, left: 0 });
const normalizedSize = (size: number) => Number.isFinite(size) && size >= 0 ? size : 0;

export type AppLayout = ReturnType<typeof createAppLayout>;
export const appLayoutKey: InjectionKey<AppLayout> = Symbol('ui-app-layout');
const layoutItemKey: InjectionKey<symbol> = Symbol('ui-layout-item');

export function createAppLayout(getOptions?: () => AppLayoutOptions, nested = false) {
    const ordered = computed(() => getOptions?.()?.layoutMode === 'ordered');
    const registeredItems = reactive(new Map<symbol, RegisteredItem>());
    const registrationOrder = ref<symbol[]>([]);
    const fallbackIds = new Map<symbol, string>();
    let generatedId = 0;

    function getFallbackId(key: symbol) {
        let id = fallbackIds.get(key);
        if (id) return id;
        id = `layout-item-${++generatedId}`;
        fallbackIds.set(key, id);
        return id;
    }

    const orderedEntries = computed(() => {
        const orderIndex = new Map(registrationOrder.value.map((key, index) => [key, index]));
        return [...registeredItems.entries()].sort(([leftKey, left], [rightKey, right]) => {
            const byOrder = left.order - right.order;
            return byOrder || (orderIndex.get(leftKey) ?? 0) - (orderIndex.get(rightKey) ?? 0);
        });
    });

    const records = computed<LayoutRecord[]>(() => {
        const rect = zeroRect();
        return orderedEntries.value.map(([key, item]) => {
            const record = { key, item, rect: { ...rect } };
            if (item.active) rect[item.edge] += item.size;
            return record;
        });
    });

    const offsets = computed(() => {
        const result = zeroRect();
        for (const [, item] of orderedEntries.value) {
            if (item.active) result[item.edge] += item.size;
        }
        return result;
    });
    const mainRect = offsets;

    const items = computed<LayoutItemGeometry[]>(() => records.value.map(({ item, rect }) => ({
        id: item.id,
        position: item.edge,
        size: item.size,
        ...rect,
    })));

    const overlapAdjustments = computed(() => {
        const adjustments = new Map<symbol, OverlapAdjustment>();
        const byId = new Map<string, LayoutRecord>();
        for (const record of records.value) byId.set(record.item.id, record);

        for (const pair of getOptions?.()?.overlaps ?? []) {
            if (typeof pair !== 'string') continue;
            const names = pair.split(':');
            if (names.length !== 2 || !names[0] || !names[1]) continue;

            const first = byId.get(names[0]);
            const second = byId.get(names[1]);
            if (!first || !second || first.key === second.key) continue;

            // A later pair replaces the prior adjustment for the same layout item,
            // matching Vuetify's Map.set behavior for computed overlaps.
            adjustments.set(second.key, { edge: first.item.edge, amount: first.item.size });
            adjustments.set(first.key, { edge: second.item.edge, amount: -second.item.size });
        }
        return adjustments;
    });

    function register(key: symbol, item: LayoutItemInput) {
        if (!edges.has(item.edge)) {
            unregister(key);
            return;
        }

        const isNew = !registeredItems.has(key);
        const id = item.id === undefined ? getFallbackId(key) : item.id;
        registeredItems.set(key, {
            id,
            edge: item.edge,
            size: normalizedSize(item.size),
            active: item.active === true,
            order: Number.isFinite(item.order) ? item.order : 0,
        });
        if (isNew) registrationOrder.value = [...registrationOrder.value, key];
    }

    function unregister(key: symbol) {
        registeredItems.delete(key);
        fallbackIds.delete(key);
        registrationOrder.value = registrationOrder.value.filter((entryKey) => entryKey !== key);
    }

    function reorder(keys: symbol[]) {
        const seen = new Set<symbol>();
        const next: symbol[] = [];
        for (const key of keys) {
            if (registeredItems.has(key) && !seen.has(key)) {
                seen.add(key);
                next.push(key);
            }
        }
        for (const key of registrationOrder.value) {
            if (registeredItems.has(key) && !seen.has(key)) next.push(key);
        }
        if (next.length !== registrationOrder.value.length || next.some((key, index) => key !== registrationOrder.value[index])) registrationOrder.value = next;
    }

    function before(key: symbol) {
        const target = registeredItems.get(key);
        if (!target) return 0;
        let offset = 0;
        for (const [entryKey, item] of orderedEntries.value) {
            if (entryKey === key) break;
            if (item.edge === target.edge && item.active) offset += item.size;
        }
        return offset;
    }

    function getLayoutItem(name: string) {
        for (let index = items.value.length - 1; index >= 0; index--) {
            if (items.value[index].id === name) return items.value[index];
        }
        return undefined;
    }

    function itemRect(key: symbol | string): LayoutItemGeometry | undefined {
        let record: LayoutRecord | undefined;
        if (typeof key === 'symbol') {
            record = records.value.find((entry) => entry.key === key);
        } else {
            for (let index = records.value.length - 1; index >= 0; index--) {
                if (records.value[index].item.id === key) {
                    record = records.value[index];
                    break;
                }
            }
        }
        if (!record) return undefined;

        const rect = { ...record.rect };
        const adjustment = overlapAdjustments.value.get(record.key);
        if (adjustment) rect[adjustment.edge] += adjustment.amount;
        return {
            id: record.item.id,
            position: record.item.edge,
            size: record.item.size,
            ...rect,
        };
    }

    return { offsets, mainRect, items, ordered, nested, register, unregister, before, reorder, getLayoutItem, itemRect };
}

export function provideAppLayout(getOptions?: () => AppLayoutOptions) {
    const parent = useAppLayout();
    const layout = createAppLayout(getOptions, !!parent);
    provide(appLayoutKey, layout);
    const instance = getCurrentInstance();
    function syncOrder(): void {
        const keys: symbol[] = [];
        function visit(node: VNode): void {
            const provided = (node.component as unknown as { provides?: Record<symbol, unknown> })?.provides;
            // Nested layouts own their descendants' registrations.
            if (provided && Object.hasOwn(provided, appLayoutKey) && provided[appLayoutKey] !== layout) return;
            if (provided && Object.hasOwn(provided, layoutItemKey)) keys.push(provided[layoutItemKey] as symbol);
            if (node.component?.subTree) visit(node.component.subTree);
            if (Array.isArray(node.children)) for (const child of node.children) if (child && typeof child === 'object') visit(child as VNode);
        }
        if (instance?.subTree) visit(instance.subTree);
        layout.reorder(keys);
    }
    onMounted(syncOrder);
    onUpdated(syncOrder);
    return layout;
}

export function useAppLayout() { return inject(appLayoutKey, null); }

export function useLayoutItem(
    edge: Ref<LayoutEdge>,
    size: Ref<number>,
    active: Ref<boolean>,
    order: Ref<number>,
    name?: Ref<string | undefined>,
) {
    const layout = useAppLayout();
    const key = Symbol('layout-item');
    provide(layoutItemKey, key);
    const deactivated = ref(false);
    const fallbackId = `layout-item-${useId()}`;
    const id = computed(() => name?.value ?? fallbackId);
    watch([edge, size, active, order, id, deactivated], () => layout?.register(key, {
        id: id.value,
        edge: edge.value,
        size: size.value,
        active: active.value && !deactivated.value,
        order: order.value,
    }), { immediate: true });
    onBeforeUnmount(() => layout?.unregister(key));
    onDeactivated(() => { deactivated.value = true; });
    onActivated(() => { deactivated.value = false; });

    const rect: ComputedRef<LayoutItemGeometry> = computed(() => layout?.itemRect(key) ?? ({
        id: id.value,
        position: edge.value,
        size: normalizedSize(size.value),
        ...zeroRect(),
    }));
    // Ordered geometry is opt-in. Legacy consumers continue to use their old offsets.
    const styles = computed<CSSProperties>(() => {
        if (!layout?.ordered.value) return {};
        const item = rect.value;
        const horizontal = edge.value === 'left' || edge.value === 'right';
        return {
            position: layout.nested ? 'absolute' : undefined,
            top: edge.value === 'bottom' ? undefined : `${item.top}px`,
            bottom: edge.value === 'top' ? undefined : `${item.bottom}px`,
            left: edge.value === 'right' ? undefined : `${item.left}px`,
            right: edge.value === 'left' ? undefined : `${item.right}px`,
            ...(horizontal ? {} : { width: `calc(100% - ${item.left}px - ${item.right}px)` }),
            zIndex: 20 + layout.items.value.length - layout.items.value.findIndex(entry => entry.id === id.value),
        };
    });
    return { layout, offset: computed(() => layout?.before(key) ?? 0), key, id, rect, styles };
}

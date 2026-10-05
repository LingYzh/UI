import { computed, inject, onBeforeUnmount, provide, reactive, watch, type InjectionKey, type Ref } from 'vue';

type Edge = 'top' | 'right' | 'bottom' | 'left';
type Item = { edge: Edge; size: number; active: boolean; order: number };
export type AppLayout = ReturnType<typeof createAppLayout>;
export const appLayoutKey: InjectionKey<AppLayout> = Symbol('ui-app-layout');

export function createAppLayout() {
    const items = reactive(new Map<symbol, Item>());
    const offsets = computed(() => {
        const result = { top: 0, right: 0, bottom: 0, left: 0 };
        [...items.values()].sort((a, b) => a.order - b.order).forEach((item) => {
            if (item.active) result[item.edge] += item.size;
        });
        return result;
    });
    function register(key: symbol, item: Item) { items.set(key, item); }
    function unregister(key: symbol) { items.delete(key); }
    function before(key: symbol) {
        const target = items.get(key);
        if (!target) return 0;
        const entries = [...items.entries()];
        const targetIndex = entries.findIndex(([entryKey]) => entryKey === key);
        return entries.filter(([otherKey, item], index) => otherKey !== key && item.edge === target.edge && item.active && (item.order < target.order || (item.order === target.order && index < targetIndex)))
            .reduce((sum, [, item]) => sum + item.size, 0);
    }
    return { offsets, register, unregister, before };
}

export function provideAppLayout() {
    const layout = createAppLayout();
    provide(appLayoutKey, layout);
    return layout;
}

export function useAppLayout() { return inject(appLayoutKey, null); }

export function useLayoutItem(edge: Ref<Edge>, size: Ref<number>, active: Ref<boolean>, order: Ref<number>) {
    const layout = useAppLayout();
    const key = Symbol('layout-item');
    watch([edge, size, active, order], () => layout?.register(key, { edge: edge.value, size: size.value, active: active.value, order: order.value }), { immediate: true });
    onBeforeUnmount(() => layout?.unregister(key));
    return { layout, offset: computed(() => layout?.before(key) ?? 0) };
}

import { nextTick, onBeforeUnmount, ref } from 'vue';
import type { UiTransition } from './UiMaybeTransition.vue';

/** Native presentation stays open until the configured Vue transition finishes. */
export function useOverlayTransition(getTransition: () => UiTransition | undefined) {
    const visible = ref(false);
    let resolvePending: (() => void) | undefined;
    function finish(): void {
        const resolve = resolvePending;
        resolvePending = undefined;
        resolve?.();
    }
    async function run(value: boolean): Promise<void> {
        finish();
        if (getTransition() === undefined) return;
        if (visible.value === value) return;
        const completed = new Promise<void>(resolve => { resolvePending = resolve; });
        visible.value = value;
        await nextTick();
        await completed;
    }
    onBeforeUnmount(finish);
    return { visible, run, finish };
}

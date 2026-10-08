import { getCurrentInstance, onBeforeUnmount, onMounted, type Ref } from 'vue';
import { isTopOverlay } from './overlay-lifecycle';

interface BackRouter {
    beforeEach: (guard: () => boolean | undefined | Promise<boolean | undefined>) => () => void;
    afterEach: (guard: () => void) => () => void;
}
interface BackSurface {
    element: Ref<HTMLElement | undefined>;
    enabled: () => boolean;
    active: () => boolean;
    close: () => void;
}
interface BackManager {
    surfaces: Set<BackSurface>;
    dispose: () => void;
}
const managers = new WeakMap<BackRouter, BackManager>();

/** Vue Router restores history after a cancelled pop; no synthetic history entries are needed. */
export function useOverlayBack(element: Ref<HTMLElement | undefined>, enabled: () => boolean, active: () => boolean, close: () => void) {
    const router = (getCurrentInstance()?.proxy as unknown as { $router?: BackRouter })?.$router;
    const surface: BackSurface = { element, enabled, active, close };
    let manager: BackManager | undefined;
    onMounted(() => {
        if (!router?.beforeEach || !router.afterEach || typeof window === 'undefined') return;
        manager = managers.get(router);
        if (!manager) {
            const surfaces = new Set<BackSurface>();
            let popped = false;
            let resetTimer: ReturnType<typeof setTimeout> | undefined;
            const onPopstate = () => {
                popped = true;
                clearTimeout(resetTimer);
                resetTimer = setTimeout(() => { popped = false; }, 0);
            };
            // Record the native pop; the deferred guard also handles an earlier Router listener.
            window.addEventListener('popstate', onPopstate, true);
            const removeBefore = router.beforeEach(() => new Promise<boolean | undefined>((resolve) => {
                // Router can start its guard before this popstate listener receives the event.
                setTimeout(() => {
                    if (!popped) { resolve(undefined); return; }
                    popped = false;
                    const current = [...surfaces].find((entry) => entry.active() && entry.element.value && isTopOverlay(entry.element.value));
                    if (!current?.enabled()) { resolve(undefined); return; }
                    current.close();
                    resolve(false);
                }, 0);
            }));
            const removeAfter = router.afterEach(() => { popped = false; });
            manager = {
                surfaces,
                dispose: () => {
                    clearTimeout(resetTimer);
                    window.removeEventListener('popstate', onPopstate, true);
                    removeBefore();
                    removeAfter();
                    managers.delete(router);
                }
            };
            managers.set(router, manager);
        }
        manager.surfaces.add(surface);
    });
    onBeforeUnmount(() => {
        if (!manager) return;
        manager.surfaces.delete(surface);
        if (!manager.surfaces.size) manager.dispose();
    });
}

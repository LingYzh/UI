import { computed, inject, onScopeDispose, reactive, readonly, type ComputedRef, type InjectionKey } from 'vue';

export const displayThresholds = { xs: 0, sm: 600, md: 840, lg: 1145, xl: 1545, xxl: 2138 };
export type DisplayBreakpoint = keyof typeof displayThresholds;
export interface DisplayOptions {
    thresholds?: Partial<typeof displayThresholds>;
    mobileBreakpoint?: DisplayBreakpoint | number;
    ssr?: { clientWidth?: number; clientHeight?: number };
}
export type UIDisplay = ReturnType<typeof createDisplay>;
export const displayKey: InjectionKey<UIDisplay> = Symbol('u-display');
export function createDisplay(options: DisplayOptions = {}) {
    const thresholds = { ...displayThresholds, ...options.thresholds };
    const names = Object.keys(thresholds) as DisplayBreakpoint[];
    if (names.some((key, index) => !Number.isFinite(thresholds[key]) || thresholds[key] < 0 || (index > 0 && thresholds[key] <= thresholds[names[index - 1]]))) throw new Error('Display thresholds must be finite, nonnegative and strictly increasing.');
    const state = reactive({ width: options.ssr?.clientWidth ?? 0, height: options.ssr?.clientHeight ?? 0 });
    const width = computed(() => state.width);
    const height = computed(() => state.height);
    const name = computed(() => [...names].reverse().find(key => state.width >= thresholds[key]) ?? 'xs');
    const breakpoint = options.mobileBreakpoint ?? 'lg';
    const mobile = computed(() => state.width < (typeof breakpoint === 'number' ? breakpoint : thresholds[breakpoint]));
    const flags = {} as Record<DisplayBreakpoint | `${DisplayBreakpoint}AndUp` | `${DisplayBreakpoint}AndDown`, ComputedRef<boolean>>;
    names.forEach((key, index) => {
        flags[key] = computed(() => name.value === key);
        flags[`${key}AndUp`] = computed(() => state.width >= thresholds[key]);
        flags[`${key}AndDown`] = computed(() => index === names.length - 1 || state.width < thresholds[names[index + 1]]);
    });
    let installed = false;
    function update() {
        if (typeof window !== 'undefined') { state.width = window.innerWidth; state.height = window.innerHeight; }
    }
    function install() {
        if (installed || typeof window === 'undefined') return;
        installed = true;
        update();
        window.addEventListener('resize', update, { passive: true });
    }
    function dispose() {
        if (!installed || typeof window === 'undefined') return;
        installed = false;
        window.removeEventListener('resize', update);
    }
    return { ...flags, width, height, name, mobile, thresholds: readonly(thresholds), update, install, dispose };
}
export function useDisplay() {
    const injected = inject(displayKey, undefined);
    if (injected) return injected;
    const fallback = createDisplay();
    fallback.install();
    onScopeDispose(fallback.dispose);
    return fallback;
}

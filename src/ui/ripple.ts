import type { ObjectDirective } from 'vue';

export type RippleOptions = boolean | { center?: boolean; color?: string };
type State = { value: RippleOptions; cleanup: () => void };
const states = new WeakMap<HTMLElement, State>();

/** Pointer and keyboard feedback without changing the host's semantics or focus. */
export const vRipple: ObjectDirective<HTMLElement, RippleOptions | undefined> = {
    mounted(element, binding) {
        let layer: HTMLSpanElement | undefined;
        let wave: HTMLSpanElement | undefined;
        let expansion: Animation | undefined;
        let pointer: number | undefined;
        let held = false;
        const controller = new AbortController();
        const state: State = { value: binding.value ?? true, cleanup: () => {} };
        states.set(element, state);
        element.classList.add('ui-ripple-target');
        function clear() {
            expansion?.cancel();
            layer?.remove();
            layer = undefined;
            wave = undefined;
            held = false;
            pointer = undefined;
        }
        function start(event: PointerEvent | KeyboardEvent) {
            if (held || state.value === false || element.matches(':disabled, [aria-disabled="true"]') || element.closest('[inert]')) return;
            if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reducedMotion === 'true') return;
            if (event instanceof PointerEvent && (event.button !== 0 || !event.isPrimary)) return;
            clear();
            held = true;
            const options = typeof state.value === 'object' ? state.value : {};
            const bounds = element.getBoundingClientRect();
            const centered = options.center || event instanceof KeyboardEvent;
            const x = centered ? bounds.width / 2 : (event as PointerEvent).clientX - bounds.left;
            const y = centered ? bounds.height / 2 : (event as PointerEvent).clientY - bounds.top;
            const radius = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y));
            layer = document.createElement('span');
            layer.className = 'ui-ripple-layer';
            layer.setAttribute('aria-hidden', 'true');
            wave = document.createElement('span');
            wave.className = 'ui-ripple-wave';
            Object.assign(wave.style, { width: `${radius * 2}px`, height: `${radius * 2}px`, left: `${x - radius}px`, top: `${y - radius}px`, background: options.color || 'currentColor' });
            layer.append(wave);
            element.append(layer);
            expansion = wave.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: .14 }], { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
            if (event instanceof PointerEvent) pointer = event.pointerId;
        }
        async function release() {
            if (!held || !wave) return;
            held = false;
            pointer = undefined;
            const released = layer;
            const releasedWave = wave;
            await expansion?.finished.catch(() => {});
            if (released !== layer) return;
            await releasedWave.animate([{ opacity: .14 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).finished.catch(() => {});
            if (released === layer) clear();
        }
        const signal = controller.signal;
        element.addEventListener('pointerdown', start, { signal });
        window.addEventListener('pointerup', (event) => { if (event.pointerId === pointer) void release(); }, { signal });
        window.addEventListener('pointercancel', (event) => { if (event.pointerId === pointer) clear(); }, { signal });
        element.addEventListener('keydown', (event) => { if (!event.repeat && ['Enter', ' '].includes(event.key)) start(event); }, { signal });
        element.addEventListener('keyup', (event) => { if (['Enter', ' '].includes(event.key)) void release(); }, { signal });
        element.addEventListener('blur', clear, { signal });
        window.addEventListener('blur', clear, { signal });
        state.cleanup = () => { controller.abort(); clear(); element.classList.remove('ui-ripple-target'); };
    },
    updated(element, binding) {
        // Vue may replace the class attribute before this directive hook runs.
        element.classList.add('ui-ripple-target');
        const state = states.get(element);
        if (state) state.value = binding.value ?? true;
    },
    beforeUnmount(element) { states.get(element)?.cleanup(); states.delete(element); }
};

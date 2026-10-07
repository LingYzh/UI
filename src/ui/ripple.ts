import type { ObjectDirective } from 'vue';
import { isNestedControlEvent } from './action-events';

export type RippleOptions = boolean | { center?: boolean; circle?: boolean; color?: string; class?: string; keys?: string[] };
type Wave = { layer: HTMLSpanElement; element: HTMLSpanElement; started: number; animations: Animation[]; timer?: ReturnType<typeof setTimeout>; released: boolean };
type Press = { pointer?: number; key?: string; touch: boolean; x: number; y: number; timer?: ReturnType<typeof setTimeout>; cancelled?: boolean; wave?: Wave };
type State = { value: RippleOptions; modifiers: Partial<Record<string, boolean>>; update: () => void; cleanup: () => void };
const states = new WeakMap<HTMLElement, State>();
const handled = new WeakSet<Event>();
const minimumVisible = 250;
const touchDelay = 80;
const easing = 'cubic-bezier(0, 0, .2, 1)';
const keyName = (key: string) => key === ' ' || key === 'Spacebar' ? 'Space' : key;

/** Vuetify-compatible lifecycle, adapted to UAH tokens, Pointer Events and focus policy. */
export const vRipple: ObjectDirective<HTMLElement, RippleOptions | undefined> = {
    mounted(host, binding) {
        const controller = new AbortController();
        const waves = new Set<Wave>();
        const state: State = { value: binding.value === undefined ? true : binding.value, modifiers: binding.modifiers, update: () => {}, cleanup: () => {} };
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        let press: Press | undefined;
        let previousPosition: { value: string; priority: string } | undefined;
        const options = () => typeof state.value === 'object' ? state.value : {};
        const enabled = () => Boolean(state.value) && !host.matches(':disabled, [aria-disabled="true"]') && !host.closest('[inert], [aria-readonly="true"]') && !(host.matches('.ui-selection-ripple, .ui-swatch') && host.querySelector('input:disabled, input[aria-readonly="true"]')) && !media.matches && document.documentElement.dataset.reducedMotion !== 'true';
        function position() {
            if (getComputedStyle(host).position !== 'static') return;
            previousPosition ??= { value: host.style.getPropertyValue('position'), priority: host.style.getPropertyPriority('position') };
            host.style.setProperty('position', 'relative');
        }
        function restorePosition() {
            if (waves.size || !previousPosition) return;
            if (host.style.getPropertyValue('position') === 'relative') {
                if (previousPosition.value) host.style.setProperty('position', previousPosition.value, previousPosition.priority);
                else host.style.removeProperty('position');
            }
            previousPosition = undefined;
        }
        function remove(wave: Wave) {
            clearTimeout(wave.timer);
            wave.animations.forEach(animation => animation.cancel());
            wave.layer.remove();
            waves.delete(wave);
            restorePosition();
        }
        function clear() {
            clearTimeout(press?.timer);
            press = undefined;
            [...waves].forEach(remove);
        }
        function show(current: Press) {
            if (!enabled() || current.cancelled || current.wave) return;
            const config = options();
            const bounds = host.getBoundingClientRect();
            const width = host.clientWidth;
            const height = host.clientHeight;
            const centered = state.modifiers.center || config.center || current.key !== undefined;
            const localX = current.key ? width / 2 : current.x - bounds.left;
            const localY = current.key ? height / 2 : current.y - bounds.top;
            const circular = state.modifiers.circle || config.circle;
            const radius = circular ? width / 2 + (centered ? 0 : Math.hypot(localX - width / 2, localY - width / 2) / 4) : Math.hypot(width, height) / 2;
            const x = centered ? width / 2 : localX;
            const y = centered ? height / 2 : localY;
            const layer = document.createElement('span');
            layer.className = 'ui-ripple-layer';
            if (config.class) layer.classList.add(...config.class.split(/\s+/).filter(Boolean));
            if (config.color) layer.style.color = config.color;
            layer.setAttribute('aria-hidden', 'true');
            const element = document.createElement('span');
            element.className = 'ui-ripple-wave';
            Object.assign(element.style, { width: `${radius * 2}px`, height: `${radius * 2}px`, left: `${x - radius}px`, top: `${y - radius}px` });
            layer.append(element);
            position();
            host.append(layer);
            const opacity = getComputedStyle(element).getPropertyValue('--ripple-opacity').trim() || '.14';
            const scale = circular ? .15 : .3;
            const wave: Wave = { layer, element, started: performance.now(), animations: [], released: false };
            waves.add(wave);
            current.wave = wave;
            const expand = element.animate([
                { transform: `translate(0px, 0px) scale(${scale})` },
                { transform: `translate(${width / 2 - x}px, ${height / 2 - y}px) scale(1)` }
            ], { duration: 250, easing, fill: 'forwards' });
            const appear = element.animate([{ opacity: 0 }, { opacity }], { duration: 100, easing, fill: 'forwards' });
            wave.animations.push(expand, appear);
        }
        function fade(wave: Wave) {
            if (wave.released || !waves.has(wave)) return;
            wave.released = true;
            wave.timer = setTimeout(() => {
                if (!waves.has(wave)) return;
                const from = getComputedStyle(wave.element).opacity;
                wave.animations[1]?.cancel();
                const exit = wave.element.animate([{ opacity: from }, { opacity: 0 }], { duration: 300, easing, fill: 'forwards' });
                wave.animations.push(exit);
                void exit.finished.then(() => remove(wave)).catch(() => {});
            }, Math.max(0, minimumVisible - (performance.now() - wave.started)));
        }
        function release(commitTouch = false) {
            const current = press;
            if (!current) return;
            clearTimeout(current.timer);
            current.timer = undefined;
            if (commitTouch && current.touch && !current.cancelled && !current.wave) show(current);
            press = undefined;
            if (current.wave) fade(current.wave);
        }
        function claim(event: Event) {
            if (handled.has(event)) return false;
            const proxyInput = host.matches('.ui-selection-ripple, .ui-swatch') && event.target instanceof HTMLInputElement && ['checkbox', 'radio'].includes(event.target.type);
            if (!proxyInput && isNestedControlEvent(event, host)) return false;
            if (state.modifiers.stop && Boolean(state.value)) { handled.add(event); return false; }
            if (!enabled() || press) return false;
            handled.add(event);
            return true;
        }
        function pointerDown(event: PointerEvent) {
            if (event.button !== 0 || !event.isPrimary || !claim(event)) return;
            const current: Press = { pointer: event.pointerId, touch: event.pointerType === 'touch', x: event.clientX, y: event.clientY };
            press = current;
            if (current.touch) current.timer = setTimeout(() => { current.timer = undefined; if (press === current) show(current); }, touchDelay);
            else show(current);
        }
        function pointerUp(event: PointerEvent) { if (press?.pointer === event.pointerId) release(true); }
        function pointerCancel(event: PointerEvent) { if (press?.pointer === event.pointerId) release(); }
        function pointerMove(event: PointerEvent) {
            if (!press?.touch || press.pointer !== event.pointerId || press.wave || (event.clientX === press.x && event.clientY === press.y)) return;
            clearTimeout(press.timer);
            press.timer = undefined;
            press.cancelled = true;
        }
        function keyDown(event: KeyboardEvent) {
            const defaultKeys = host.matches('.ui-selection-ripple, .ui-swatch') ? ['Space'] : ['Enter', 'Space'];
            if (event.repeat || !(options().keys ?? defaultKeys).some(key => keyName(key) === keyName(event.key)) || !claim(event)) return;
            press = { key: keyName(event.key), touch: false, x: 0, y: 0 };
            show(press);
        }
        function choiceClick(event: MouseEvent) {
            // Native label activation forwards a trusted click without a pointerdown on the input.
            if (!host.matches('.ui-selection-ripple, .ui-swatch') || !event.isTrusted || !(event.target instanceof HTMLInputElement) || !['checkbox', 'radio'].includes(event.target.type) || handled.has(event) || press || !enabled()) return;
            const bounds = host.getBoundingClientRect();
            // Pointer/keyboard activation already started a wave. Label text clicks
            // arrive outside the input bounds and each deserve their own feedback.
            const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
            if (waves.size && (event.detail === 0 || inside)) return;
            handled.add(event);
            const current: Press = { touch: false, x: bounds.left + host.clientWidth / 2, y: bounds.top + host.clientHeight / 2 };
            show(current);
            if (current.wave) fade(current.wave);
        }
        const signal = controller.signal;
        host.classList.add('ui-ripple-target');
        host.addEventListener('pointerdown', pointerDown, { signal });
        host.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch' && press?.pointer === event.pointerId) release(); }, { signal });
        window.addEventListener('pointerup', pointerUp, { signal, capture: true });
        window.addEventListener('pointercancel', pointerCancel, { signal, capture: true });
        window.addEventListener('pointermove', pointerMove, { signal, capture: true, passive: true });
        host.addEventListener('keydown', keyDown, { signal });
        host.addEventListener('click', choiceClick, { signal });
        host.addEventListener('keyup', event => { if (press?.key === keyName(event.key)) release(); }, { signal });
        host.addEventListener('blur', () => { if (press?.key !== undefined) release(); }, { signal });
        host.addEventListener('focusout', () => { if (press?.key !== undefined) release(); }, { signal });
        host.addEventListener('dragstart', () => release(), { signal });
        window.addEventListener('blur', () => release(), { signal });
        document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); }, { signal });
        const motionChanged = () => { if (!enabled()) clear(); };
        media.addEventListener('change', motionChanged);
        const motionObserver = new MutationObserver(motionChanged);
        motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });
        state.update = () => {
            if (media.matches || document.documentElement.dataset.reducedMotion === 'true') clear();
            else if (!enabled() || state.modifiers.stop) { release(); waves.forEach(fade); }
            else if (waves.size) position();
        };
        state.cleanup = () => { controller.abort(); motionObserver.disconnect(); media.removeEventListener('change', motionChanged); clear(); host.classList.remove('ui-ripple-target'); };
        states.set(host, state);
    },
    updated(host, binding) {
        host.classList.add('ui-ripple-target');
        const state = states.get(host);
        if (state) { state.value = binding.value === undefined ? true : binding.value; state.modifiers = binding.modifiers; state.update(); }
    },
    beforeUnmount(host) { states.get(host)?.cleanup(); states.delete(host); }
};

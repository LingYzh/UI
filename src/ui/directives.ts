import type { Directive, DirectiveBinding } from 'vue';

type Listener = (event: Event) => void;
type Cleanup = () => void;
function listening<T>(connect: (element: HTMLElement, binding: DirectiveBinding<T>) => Cleanup): Directive<HTMLElement, T> {
    const cleanups = new WeakMap<HTMLElement, Cleanup>();
    const mount = (element: HTMLElement, binding: DirectiveBinding<T>) => { cleanups.get(element)?.(); cleanups.set(element, connect(element, binding)); };
    return { mounted: mount, updated: (element, binding) => { if (binding.value !== binding.oldValue) mount(element, binding); }, beforeUnmount: element => { cleanups.get(element)?.(); cleanups.delete(element); } };
}
export type ClickOutsideValue = ((event: Event) => void) | { handler: (event: Event) => void; include?: () => HTMLElement[]; closeConditional?: (event: Event) => boolean };
export const vClickOutside = listening<ClickOutsideValue>((element, binding) => {
    const handler: Listener = event => {
        const value = binding.value;
        const excluded = typeof value === 'function' ? [] : value.include?.() ?? [];
        const path = event.composedPath();
        if (path.includes(element) || excluded.some(node => path.includes(node))) return;
        if (typeof value === 'function') value(event);
        else if (value.closeConditional?.(event) !== false) value.handler(event);
    };
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
});
export type IntersectValue = ((visible: boolean, entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void) | { handler: (visible: boolean, entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void; options?: IntersectionObserverInit };
export const vIntersect = listening<IntersectValue>((element, binding) => {
    if (typeof IntersectionObserver === 'undefined') return () => {};
    let initialized = false;
    const value = binding.value;
    const handler = typeof value === 'function' ? value : value.handler;
    const observer = new IntersectionObserver((entries, observer) => {
        const visible = entries.some(entry => entry.isIntersecting);
        if (!binding.modifiers.quiet || initialized) handler(visible, entries, observer);
        initialized = true;
        if (visible && binding.modifiers.once) observer.disconnect();
    }, typeof value === 'function' ? undefined : value.options);
    observer.observe(element);
    return () => observer.disconnect();
});
export type ResizeValue = (entries?: ResizeObserverEntry[]) => void;
export const vResize = listening<ResizeValue>((element, binding) => {
    if (typeof ResizeObserver === 'undefined') return () => {};
    let initialized = false;
    const observer = new ResizeObserver(entries => {
        if (!binding.modifiers.quiet || initialized) binding.value(entries);
        initialized = true;
    });
    observer.observe(element);
    return () => observer.disconnect();
});
export type MutateValue = ((entries: MutationRecord[], observer: MutationObserver) => void) | { handler: (entries: MutationRecord[], observer: MutationObserver) => void; options?: MutationObserverInit };
export const vMutate = listening<MutateValue>((element, binding) => {
    if (typeof MutationObserver === 'undefined') return () => {};
    const value = binding.value;
    const observer = new MutationObserver((entries, observer) => { (typeof value === 'function' ? value : value.handler)(entries, observer); if (binding.modifiers.once) observer.disconnect(); });
    observer.observe(element, typeof value === 'function' ? { childList: true, subtree: true, characterData: true } : value.options ?? { childList: true, subtree: true });
    return () => observer.disconnect();
});
export type ScrollValue = ((event: Event) => void) | { handler: (event: Event) => void; options?: AddEventListenerOptions };
export const vScroll = listening<ScrollValue>((element, binding) => {
    const target = binding.modifiers.self ? element : binding.arg ? document.querySelector(binding.arg) : window;
    const value = binding.value;
    const handler = typeof value === 'function' ? value : value.handler;
    const options = typeof value === 'function' ? { passive: true } : value.options ?? { passive: true };
    target?.addEventListener('scroll', handler, options);
    return () => target?.removeEventListener('scroll', handler, options);
});
export interface TouchGesture { event: PointerEvent; touchstartX: number; touchstartY: number; touchendX: number; touchendY: number; offsetX: number; offsetY: number; }
export type TouchValue = Partial<Record<'left' | 'right' | 'up' | 'down' | 'start' | 'move' | 'end', (gesture: TouchGesture) => void>>;
export const vTouch = listening<TouchValue>((element, binding) => {
    let start: PointerEvent | undefined;
    const gesture = (event: PointerEvent): TouchGesture => ({ event, touchstartX: start?.clientX ?? 0, touchstartY: start?.clientY ?? 0, touchendX: event.clientX, touchendY: event.clientY, offsetX: event.clientX - (start?.clientX ?? event.clientX), offsetY: event.clientY - (start?.clientY ?? event.clientY) });
    const down = (event: PointerEvent) => { if (event.pointerType === 'mouse' || !event.isPrimary) return; start = event; binding.value.start?.(gesture(event)); };
    const move = (event: PointerEvent) => { if (start && event.pointerId === start.pointerId) binding.value.move?.(gesture(event)); };
    const up = (event: PointerEvent) => {
        if (!start || event.pointerId !== start.pointerId) return;
        const result = gesture(event);
        binding.value.end?.(result);
        if (Math.max(Math.abs(result.offsetX), Math.abs(result.offsetY)) >= 50) {
            const direction = Math.abs(result.offsetX) > Math.abs(result.offsetY) ? result.offsetX < 0 ? 'left' : 'right' : result.offsetY < 0 ? 'up' : 'down';
            binding.value[direction]?.(result);
        }
        start = undefined;
    };
    const cancel = () => { start = undefined; };
    element.addEventListener('pointerdown', down); element.addEventListener('pointermove', move); element.addEventListener('pointerup', up); element.addEventListener('pointercancel', cancel);
    return () => { element.removeEventListener('pointerdown', down); element.removeEventListener('pointermove', move); element.removeEventListener('pointerup', up); element.removeEventListener('pointercancel', cancel); };
});
export const vTooltip = listening<string>((element, binding) => {
    let tooltip: HTMLDivElement | undefined;
    const previous = element.getAttribute('aria-describedby');
    const hide = () => { tooltip?.remove(); tooltip = undefined; if (previous) element.setAttribute('aria-describedby', previous); else element.removeAttribute('aria-describedby'); };
    const show = () => {
        if (!binding.value || tooltip) return;
        tooltip = document.createElement('div'); tooltip.className = 'ui-directive-tooltip'; tooltip.textContent = binding.value; tooltip.role = 'tooltip'; tooltip.id = `u-tooltip-${++tooltipSequence}`;
        document.body.append(tooltip); element.setAttribute('aria-describedby', [previous, tooltip.id].filter(Boolean).join(' '));
        const rect = element.getBoundingClientRect(); const box = tooltip.getBoundingClientRect();
        tooltip.style.left = `${Math.max(8, Math.min(innerWidth - box.width - 8, rect.left + (rect.width - box.width) / 2))}px`;
        tooltip.style.top = `${rect.top - box.height - 8 >= 8 ? rect.top - box.height - 8 : rect.bottom + 8}px`;
    };
    const focus = () => { if (element.matches(':focus-visible')) show(); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') hide(); };
    element.addEventListener('pointerenter', show); element.addEventListener('pointerleave', hide); element.addEventListener('focus', focus); element.addEventListener('blur', hide); element.addEventListener('pointerdown', hide); element.addEventListener('keydown', escape);
    return () => { hide(); element.removeEventListener('pointerenter', show); element.removeEventListener('pointerleave', hide); element.removeEventListener('focus', focus); element.removeEventListener('blur', hide); element.removeEventListener('pointerdown', hide); element.removeEventListener('keydown', escape); };
});
let tooltipSequence = 0;

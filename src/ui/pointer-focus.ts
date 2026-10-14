import type { ObjectDirective } from 'vue';
import { trackFocusModality } from './focus-modality';

const pointerTargets = new WeakSet<HTMLElement>();
const cleanups = new WeakMap<HTMLElement, () => void>();
const pendingBlur = new WeakMap<HTMLElement, number>();

/** A closing overlay may restore its trigger before that trigger's click frame completes. */
export function cancelPointerBlur(element: HTMLElement): void {
    const frame = pendingBlur.get(element);
    if (frame !== undefined) cancelAnimationFrame(frame);
    pendingBlur.delete(element);
}

export function wasPointerActivated(element: HTMLElement | null) {
    return Boolean(element && pointerTargets.has(element));
}

/** Release only the activated control; never steal focus moved by its action. */
export const vPointerBlur: ObjectDirective<HTMLElement> = {
    mounted(element) {
        const releaseModality = trackFocusModality(element);
        let frame = 0;
        let pointer = false;
        const pointerDown = () => {
            pointer = true;
            pointerTargets.add(element);
        };
        const keydown = () => {
            pointer = false;
            pointerTargets.delete(element);
            cancelAnimationFrame(frame);
        };
        const click = (event: MouseEvent) => {
            if (!pointer && event.detail === 0) return;
            pointer = false;
            pointerTargets.add(element);
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                pendingBlur.delete(element);
                if (document.activeElement === element) element.blur();
            });
            pendingBlur.set(element, frame);
        };
        element.addEventListener('pointerdown', pointerDown);
        element.addEventListener('keydown', keydown);
        element.addEventListener('click', click);
        cleanups.set(element, () => {
            releaseModality();
            cancelAnimationFrame(frame);
            pendingBlur.delete(element);
            element.removeEventListener('pointerdown', pointerDown);
            element.removeEventListener('keydown', keydown);
            element.removeEventListener('click', click);
            pointerTargets.delete(element);
        });
    },
    beforeUnmount(element) {
        cleanups.get(element)?.();
        cleanups.delete(element);
    }
};

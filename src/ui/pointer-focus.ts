import type { ObjectDirective } from 'vue';
import { trackFocusModality } from './focus-modality';

const pointerTargets = new WeakSet<HTMLElement>();
const cleanups = new WeakMap<HTMLElement, () => void>();

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
                if (document.activeElement === element) element.blur();
            });
        };
        element.addEventListener('pointerdown', pointerDown);
        element.addEventListener('keydown', keydown);
        element.addEventListener('click', click);
        cleanups.set(element, () => {
            releaseModality();
            cancelAnimationFrame(frame);
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

import type { ObjectDirective } from 'vue';

type ModalityState = { elements: Map<HTMLElement, number>; pointer: boolean; dispose: () => void };
const documents = new WeakMap<Document, ModalityState>();
const releases = new WeakMap<HTMLElement, () => void>();

/** Native :focus-visible may stay true when a focused range is dragged with a mouse. */
export function trackFocusModality(element: HTMLElement): () => void {
    const owner = element.ownerDocument;
    let state = documents.get(owner);
    if (!state) {
        const elements = new Map<HTMLElement, number>();
        const current: ModalityState = { elements, pointer: false, dispose: () => {} };
        const update = (pointer: boolean) => {
            current.pointer = pointer;
            for (const target of elements.keys()) target.toggleAttribute('data-ui-pointer-focus', pointer);
        };
        const pointer = () => update(true);
        const keyboard = () => update(false);
        owner.addEventListener('pointerdown', pointer, { capture: true, passive: true });
        owner.addEventListener('keydown', keyboard, true);
        current.dispose = () => {
            owner.removeEventListener('pointerdown', pointer, true);
            owner.removeEventListener('keydown', keyboard, true);
            documents.delete(owner);
        };
        documents.set(owner, current);
        state = current;
    }
    const current = state;
    current.elements.set(element, (current.elements.get(element) ?? 0) + 1);
    element.toggleAttribute('data-ui-pointer-focus', current.pointer);
    let released = false;
    return () => {
        if (released) return;
        released = true;
        const remaining = (current.elements.get(element) ?? 1) - 1;
        if (remaining) current.elements.set(element, remaining);
        else {
            current.elements.delete(element);
            element.removeAttribute('data-ui-pointer-focus');
        }
        if (!current.elements.size) current.dispose();
    };
}

/** Non-text controls retain their native focus, pointer capture and editing behavior. */
export const vFocusModality: ObjectDirective<HTMLElement> = {
    mounted(element) { releases.set(element, trackFocusModality(element)); },
    beforeUnmount(element) { releases.get(element)?.(); releases.delete(element); }
};

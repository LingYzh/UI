import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import { isTopOverlay, overlayFocusable } from './overlay-lifecycle';

/** DOM layers need the focus redirection previously supplied by showModal(). */
export function useOverlayFocus(content: Ref<HTMLElement | undefined>, isActive: () => boolean, retain: () => boolean): void {
    function focusIn(event: FocusEvent) {
        const element = content.value;
        if (!isActive() || !retain() || !element || !isTopOverlay(element) || element.contains(event.target as Node) || !element.getClientRects().length) return;
        (overlayFocusable(element)[0] ?? element).focus({ preventScroll: true });
    }
    onMounted(() => document.addEventListener('focusin', focusIn));
    onBeforeUnmount(() => document.removeEventListener('focusin', focusIn));
}

const openOverlays: HTMLElement[] = [];
const dismissedEvents = new WeakSet<Event>();
const scrollLocks = new Set<symbol>();
let previousOverflow = '';

/** Non-modal dialog semantics inside a DOM layer; focus retention is managed by the library. */
export function presentOverlay(element: HTMLDialogElement, _modal: boolean) {
    element.show();
}

export function dismissOverlay(element: HTMLDialogElement) {
    if (element.matches(':popover-open')) element.hidePopover();
    element.close();
    element.removeAttribute('popover');
}

export function pushOverlay(element: HTMLElement) {
    if (!openOverlays.includes(element)) openOverlays.push(element);
    let next = 2000;
    for (const overlay of openOverlays) {
        const layer = overlay.closest<HTMLElement>('.ui-overlay-layer');
        if (!layer) continue;
        layer.style.setProperty('--ui-overlay-stack-z', String(next));
        next = Math.max(next, Number(getComputedStyle(layer).zIndex) || next) + 10;
    }
}

export function popOverlay(element: HTMLElement) {
    const index = openOverlays.indexOf(element);
    if (index >= 0) openOverlays.splice(index, 1);
}

export function isTopOverlay(element: HTMLElement) {
    const sorted = openOverlays.map((overlay, index) => ({ overlay, index, zIndex: overlay.matches(':popover-open') ? Infinity : Number(getComputedStyle(overlay.closest('.ui-overlay-layer') ?? overlay).zIndex) || 0 }));
    sorted.sort((a, b) => a.zIndex - b.zIndex || a.index - b.index);
    return sorted.at(-1)?.overlay === element;
}

/** Native capture listeners can flush Vue updates between callbacks; claim a
 * dismissal once so the newly exposed layer cannot consume the same click. */
export function claimOverlayDismiss(event: Event): boolean {
    if (dismissedEvents.has(event)) return false;
    dismissedEvents.add(event);
    return true;
}

const focusableSelector = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
export function overlayFocusable(element: HTMLElement, includeNegative = false): HTMLElement[] {
    const selector = includeNegative ? focusableSelector.replace('[tabindex]:not([tabindex="-1"])', '[tabindex]') : focusableSelector;
    return [...element.querySelectorAll<HTMLElement>(selector)].filter(node => !node.matches(':disabled, [aria-disabled="true"]') && node.getClientRects().length > 0 && !node.closest('[inert], [hidden], [aria-hidden="true"]'));
}

/** Tab remains inside the top retained layer, including its empty-content fallback. */
export function retainOverlayFocus(element: HTMLElement, event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !isTopOverlay(element)) return;
    const nodes = overlayFocusable(element);
    const index = nodes.indexOf(document.activeElement as HTMLElement);
    if (!nodes.length || index < 0 || event.shiftKey && index === 0 || !event.shiftKey && index === nodes.length - 1) {
        event.preventDefault();
        (event.shiftKey ? nodes.at(-1) : nodes[0] ?? element)?.focus({ preventScroll: true });
        if (!nodes.length) element.focus({ preventScroll: true });
    }
}

export function acquireScrollLock(token: symbol) {
    if (scrollLocks.has(token)) return;
    if (scrollLocks.size === 0) previousOverflow = document.body.style.overflow;
    scrollLocks.add(token);
    document.body.style.overflow = 'hidden';
}

export function releaseScrollLock(token: symbol) {
    if (!scrollLocks.delete(token)) return;
    if (scrollLocks.size === 0) document.body.style.overflow = previousOverflow;
}

type ElementProps = Record<string, unknown>;

function classValue(value: unknown): string {
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.map(classValue).filter(Boolean).join(' ');
    if (value && typeof value === 'object') {
        return Object.entries(value).filter(([, active]) => Boolean(active)).map(([name]) => name).join(' ');
    }
    return '';
}

function styleValue(value: unknown): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(styleValue).filter(Boolean).join(';');
    if (!value || typeof value !== 'object') return '';
    return Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== false && item !== '')
        .map(([name, item]) => {
            const property = name.startsWith('--') ? name : name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
            return `${property}:${String(item)}`;
        }).join(';');
}

function invokeHandler(handler: unknown, event: Event) {
    if (Array.isArray(handler)) {
        for (const callback of handler) invokeHandler(callback, event);
    } else if (typeof handler === 'function') {
        handler(event);
    }
}

const booleanAttributes = new Set(['autofocus', 'checked', 'disabled', 'hidden', 'multiple', 'readonly', 'required', 'selected']);

/** Apply Vue-style attrs and listeners to an externally supplied activator, restoring prior DOM state on cleanup. */
export function bindElementProps(element: HTMLElement, props: ElementProps): () => void {
    const previous = new Map<string, string | null>();
    const listeners: Array<{ name: string; callback: EventListener; options: AddEventListenerOptions }> = [];
    const remember = (name: string) => {
        if (!previous.has(name)) previous.set(name, element.getAttribute(name));
    };

    for (const [key, value] of Object.entries(props)) {
        if (key === 'ref' || key === 'key' || key === 'ref_for' || key === 'ref_key' || key === 'innerHTML' || key === 'textContent') continue;
        if (key === 'class' || key === 'style') {
            remember(key);
            const current = element.getAttribute(key);
            const additional = key === 'class' ? classValue(value) : styleValue(value);
            const combined = [current, additional].filter(Boolean).join(key === 'class' ? ' ' : ';');
            if (combined) element.setAttribute(key, combined);
            else element.removeAttribute(key);
            continue;
        }

        const eventMatch = key.match(/^on([A-Z][A-Za-z0-9]*?)(Capture|Once|Passive)*$/);
        if (eventMatch) {
            const eventName = eventMatch[1].replace(/[A-Z]/g, (letter) => letter.toLowerCase());
            const suffix = key.slice(2 + eventMatch[1].length);
            const options = { capture: suffix.includes('Capture'), once: suffix.includes('Once'), passive: suffix.includes('Passive') };
            const callback: EventListener = (event) => invokeHandler(value, event);
            element.addEventListener(eventName, callback, options);
            listeners.push({ name: eventName, callback, options });
            continue;
        }

        if (key.startsWith('on')) continue;
        const attribute = key === 'tabIndex' ? 'tabindex' : key === 'htmlFor' ? 'for' : key;
        if (!/^(?:[a-zA-Z_:][\w:.-]*)$/.test(attribute)) continue;
        remember(attribute);
        if (value === null || value === undefined || (booleanAttributes.has(attribute.toLowerCase()) && value === false)) {
            element.removeAttribute(attribute);
        } else if (booleanAttributes.has(attribute.toLowerCase())) {
            element.setAttribute(attribute, '');
        } else {
            element.setAttribute(attribute, String(value));
        }
    }

    return () => {
        for (const { name, callback, options } of listeners) element.removeEventListener(name, callback, options);
        for (const [name, value] of previous) {
            if (value === null) element.removeAttribute(name);
            else element.setAttribute(name, value);
        }
    };
}

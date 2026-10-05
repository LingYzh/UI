const openOverlays: HTMLDialogElement[] = [];
const scrollLocks = new Set<symbol>();
let previousOverflow = '';

export function pushOverlay(element: HTMLDialogElement) {
    if (!openOverlays.includes(element)) openOverlays.push(element);
}

export function popOverlay(element: HTMLDialogElement) {
    const index = openOverlays.indexOf(element);
    if (index >= 0) openOverlays.splice(index, 1);
}

export function isTopOverlay(element: HTMLDialogElement) {
    return openOverlays.at(-1) === element;
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

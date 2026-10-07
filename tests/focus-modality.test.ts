import test from 'node:test';
import assert from 'node:assert/strict';
import { trackFocusModality } from '../src/ui/focus-modality';

class CountingDocument extends EventTarget {
    listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
        if (listener) {
            const listeners = this.listeners.get(type) ?? new Set();
            listeners.add(listener);
            this.listeners.set(type, listeners);
        }
        super.addEventListener(type, listener, options);
    }

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) {
        if (listener) this.listeners.get(type)?.delete(listener);
        super.removeEventListener(type, listener, options);
    }

    listenerCount(type: string) { return this.listeners.get(type)?.size ?? 0; }
}

class ModalityElement {
    ownerDocument: CountingDocument;
    attributes = new Set<string>();
    blurCalls = 0;

    constructor(ownerDocument: CountingDocument) { this.ownerDocument = ownerDocument; }
    toggleAttribute(name: string, force?: boolean) {
        const next = force ?? !this.attributes.has(name);
        if (next) this.attributes.add(name);
        else this.attributes.delete(name);
        return next;
    }
    removeAttribute(name: string) { this.attributes.delete(name); }
    hasAttribute(name: string) { return this.attributes.has(name); }
    blur() { this.blurCalls++; }
}

const track = (element: ModalityElement) => trackFocusModality(element as unknown as HTMLElement);
const event = (type: string) => new Event(type, { cancelable: true });
const isPointerFocused = (element: ModalityElement) => element.hasAttribute('data-ui-pointer-focus');

test('shares document listeners and applies current modality to existing and late-mounted controls', () => {
    const owner = new CountingDocument();
    const first = new ModalityElement(owner);
    const second = new ModalityElement(owner);
    const releaseFirst = track(first);
    const releaseFirstAgain = track(first);
    const releaseSecond = track(second);

    assert.equal(owner.listenerCount('pointerdown'), 1);
    assert.equal(owner.listenerCount('keydown'), 1);
    owner.dispatchEvent(event('pointerdown'));
    assert.equal(isPointerFocused(first), true);
    assert.equal(isPointerFocused(second), true);

    const late = new ModalityElement(owner);
    const releaseLate = track(late);
    assert.equal(isPointerFocused(late), true, 'newly tracked controls inherit pointer modality');

    const key = event('keydown');
    owner.dispatchEvent(key);
    assert.equal(key.defaultPrevented, false, 'modality tracking must not cancel keyboard behavior');
    assert.equal(isPointerFocused(first), false);
    assert.equal(isPointerFocused(second), false);
    assert.equal(isPointerFocused(late), false);
    assert.equal(first.blurCalls + second.blurCalls + late.blurCalls, 0, 'modality tracking must not blur controls');

    releaseFirst();
    releaseFirst();
    owner.dispatchEvent(event('pointerdown'));
    assert.equal(isPointerFocused(first), true, 'a duplicate registration keeps the element tracked until its last release');
    assert.equal(isPointerFocused(second), true);

    releaseFirstAgain();
    releaseSecond();
    releaseLate();
    assert.equal(owner.listenerCount('pointerdown'), 0);
    assert.equal(owner.listenerCount('keydown'), 0);
});

test('keeps modality state isolated between owner documents', () => {
    const firstDocument = new CountingDocument();
    const secondDocument = new CountingDocument();
    const first = new ModalityElement(firstDocument);
    const second = new ModalityElement(secondDocument);
    const releaseFirst = track(first);
    const releaseSecond = track(second);

    firstDocument.dispatchEvent(event('pointerdown'));
    assert.equal(isPointerFocused(first), true);
    assert.equal(isPointerFocused(second), false);

    secondDocument.dispatchEvent(event('keydown'));
    assert.equal(isPointerFocused(first), true, 'keyboard input in another document does not change this document modality');
    assert.equal(isPointerFocused(second), false);
    assert.equal(firstDocument.listenerCount('pointerdown'), 1);
    assert.equal(secondDocument.listenerCount('pointerdown'), 1);

    releaseFirst();
    releaseSecond();
});

test('releasing one control preserves others; repeated release and final cleanup are safe', () => {
    const owner = new CountingDocument();
    const removed = new ModalityElement(owner);
    const live = new ModalityElement(owner);
    const releaseRemoved = track(removed);
    const releaseLive = track(live);

    releaseRemoved();
    releaseRemoved();
    assert.equal(removed.hasAttribute('data-ui-pointer-focus'), false);
    assert.equal(owner.listenerCount('pointerdown'), 1, 'one live control keeps the shared listener installed');

    owner.dispatchEvent(event('pointerdown'));
    assert.equal(isPointerFocused(removed), false);
    assert.equal(isPointerFocused(live), true, 'remaining controls continue following modality changes');

    releaseLive();
    assert.equal(live.hasAttribute('data-ui-pointer-focus'), false);
    assert.equal(owner.listenerCount('pointerdown'), 0);
    assert.equal(owner.listenerCount('keydown'), 0);

    owner.dispatchEvent(event('keydown'));
    assert.equal(removed.hasAttribute('data-ui-pointer-focus'), false);
    assert.equal(live.hasAttribute('data-ui-pointer-focus'), false);
});

import { onBeforeUnmount, watch } from 'vue';

type Geometry = { height: string; paddingTop: string; paddingBottom: string; borderTopWidth: string; borderBottomWidth: string };
type Run = { animation: Animation; restore: () => void; done: () => void };

/** Shared height motion for single panels and flat tree branches. */
export function useExpandMotion(disabled: () => boolean) {
    const running = new Map<HTMLElement, Run>();
    const interrupted = new WeakMap<HTMLElement, Geometry>();
    function geometry(node: HTMLElement): Geometry {
        const style = getComputedStyle(node);
        return { height: `${node.getBoundingClientRect().height}px`, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, borderTopWidth: style.borderTopWidth, borderBottomWidth: style.borderBottomWidth };
    }
    function finish(node: HTMLElement, cancelled = false) {
        const run = running.get(node);
        if (!run) return;
        if (cancelled) interrupted.set(node, geometry(node));
        else interrupted.delete(node);
        running.delete(node);
        run.animation.cancel();
        run.restore();
        if (!cancelled) run.done();
    }
    function animate(element: Element, done: () => void, opening: boolean) {
        const node = element as HTMLElement;
        if (running.has(node)) finish(node, true);
        const previous = interrupted.get(node);
        interrupted.delete(node);
        if (disabled()) { done(); return; }
        const full = geometry(node);
        const zero: Geometry = { height: '0px', paddingTop: '0px', paddingBottom: '0px', borderTopWidth: '0px', borderBottomWidth: '0px' };
        const style = getComputedStyle(node);
        const durationToken = style.getPropertyValue('--motion-layout').trim() || '240ms';
        const duration = parseFloat(durationToken) * (durationToken.endsWith('ms') ? 1 : 1000);
        const easing = style.getPropertyValue('--ease').trim() || 'ease';
        const properties = ['overflow', 'min-height', 'box-sizing'] as const;
        const original = properties.map((property) => [property, node.style.getPropertyValue(property), node.style.getPropertyPriority(property)] as const);
        node.style.overflow = 'hidden';
        node.style.minHeight = '0';
        node.style.boxSizing = 'border-box';
        const animation = node.animate([previous ?? (opening ? zero : full), opening ? full : zero], { duration, easing, fill: 'both' });
        running.set(node, { animation, done, restore: () => {
            for (const [property, value, priority] of original) {
                if (value) node.style.setProperty(property, value, priority);
                else node.style.removeProperty(property);
            }
        } });
        animation.onfinish = () => { if (running.get(node)?.animation === animation) finish(node); };
    }
    watch(disabled, (value) => { if (value) for (const node of [...running.keys()]) finish(node); }, { flush: 'sync' });
    onBeforeUnmount(() => { for (const node of [...running.keys()]) finish(node, true); });
    return {
        enter: (element: Element, done: () => void) => animate(element, done, true),
        leave: (element: Element, done: () => void) => animate(element, done, false),
        cancel: (element: Element) => finish(element as HTMLElement, true)
    };
}

import { unref, type CSSProperties } from 'vue';

/** Slot activators receive component refs as well as native element refs. */
export function overlayActivatorElement(value: unknown): HTMLElement | undefined {
    if (value instanceof HTMLElement) return value;
    if (!value || typeof value !== 'object') return undefined;
    const component = value as { element?: unknown; $el?: unknown };
    const element = unref(component.element);
    if (element instanceof HTMLElement) return element;
    return component.$el instanceof HTMLElement ? component.$el : undefined;
}

export type OverlayTarget = string | HTMLElement | [number, number] | null;
export interface OverlayPositionProps {
    location?: string;
    locationStrategy?: 'static' | 'connected';
    origin?: string;
    offset?: number | string | [number, number];
    target?: OverlayTarget;
    stickToTarget?: boolean;
    viewportMargin?: number | string;
}
type Side = 'top' | 'bottom' | 'left' | 'right' | 'center';
type Align = 'top' | 'bottom' | 'left' | 'right' | 'center';
interface Anchor { side: Side; align: Align }
interface Box { left: number; top: number; width: number; height: number }
const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left', center: 'center' } as const;

function anchor(value: string, rtl: boolean): Anchor {
    const tokens = value.replace(/-/g, ' ').trim().split(/\s+/);
    let side = tokens[0] || 'bottom';
    if (side === 'start') side = rtl ? 'right' : 'left';
    if (side === 'end') side = rtl ? 'left' : 'right';
    if (!['top', 'bottom', 'left', 'right', 'center'].includes(side)) side = 'bottom';
    const vertical = side === 'top' || side === 'bottom' || side === 'center';
    let align = tokens[1] || 'center';
    if (align === 'start') align = vertical ? rtl ? 'right' : 'left' : 'top';
    if (align === 'end') align = vertical ? rtl ? 'left' : 'right' : 'bottom';
    if (!(vertical ? ['left', 'right', 'center'] : ['top', 'bottom', 'center']).includes(align)) align = 'center';
    return { side: side as Side, align: align as Align };
}
function point(box: Box, parsed: Anchor) {
    const x = parsed.side === 'left' ? 0 : parsed.side === 'right' ? box.width : parsed.align === 'left' ? 0 : parsed.align === 'right' ? box.width : box.width / 2;
    const y = parsed.side === 'top' ? 0 : parsed.side === 'bottom' ? box.height : parsed.align === 'top' ? 0 : parsed.align === 'bottom' ? box.height : box.height / 2;
    return { x: box.left + x, y: box.top + y };
}
function offsets(value: OverlayPositionProps['offset']): [number, number] {
    const values = Array.isArray(value) ? value : typeof value === 'string' ? value.trim().split(/\s+/).map(Number) : [value ?? 0, 0];
    return [Number.isFinite(Number(values[0])) ? Number(values[0]) : 0, Number.isFinite(Number(values[1])) ? Number(values[1]) : 0];
}
export function resolveOverlayTarget(target: OverlayTarget | undefined, activator: HTMLElement | undefined, content: HTMLElement | undefined, cursor?: [number, number]): HTMLElement | [number, number] | undefined {
    if (Array.isArray(target)) return target.every(Number.isFinite) ? target : undefined;
    if (target instanceof HTMLElement) return target;
    if (target === 'cursor') return cursor ?? activator;
    if (target === 'parent') return activator?.parentElement ?? content?.parentElement ?? undefined;
    if (typeof target === 'string') {
        try { return document.querySelector<HTMLElement>(target) ?? undefined; }
        catch { return undefined; }
    }
    return activator;
}

/** Anchor/origin placement with viewport flipping and logical start/end alignment. */
export function connectedOverlayPosition(props: OverlayPositionProps, target: Box, size: { width: number; height: number }, viewport: Box, rtl = false): CSSProperties {
    const preferred = anchor(props.location === 'anchor' ? 'bottom start' : props.location ?? 'bottom', rtl);
    const preferredOrigin = props.origin === 'overlap' ? preferred : !props.origin || props.origin === 'auto' ? { ...preferred, side: opposite[preferred.side] } : anchor(props.origin, rtl);
    const [main, cross] = offsets(props.offset);
    const rawMargin = Number(props.viewportMargin ?? 12);
    const margin = Number.isFinite(rawMargin) ? Math.max(0, rawMargin) : 12;
    const bounds = { left: viewport.left + margin, top: viewport.top + margin, right: viewport.left + viewport.width - margin, bottom: viewport.top + viewport.height - margin };
    const candidates: Array<{ anchor: Anchor; origin: Anchor }> = [{ anchor: preferred, origin: preferredOrigin }];
    if (props.stickToTarget) {
        bounds.left = Math.min(bounds.left, target.left);
        bounds.top = Math.min(bounds.top, target.top);
        bounds.right = Math.max(bounds.right, target.left + target.width);
        bounds.bottom = Math.max(bounds.bottom, target.top + target.height);
    }
    candidates.push({ anchor: { ...preferred, side: opposite[preferred.side] }, origin: { ...preferredOrigin, side: opposite[preferredOrigin.side] } });
    candidates.push(...candidates.slice().map(candidate => ({ anchor: { ...candidate.anchor, align: opposite[candidate.anchor.align] }, origin: { ...candidate.origin, align: opposite[candidate.origin.align] } })));
    const placed = candidates.map(candidate => {
        const targetPoint = point(target, candidate.anchor);
        const originPoint = point({ left: 0, top: 0, ...size }, candidate.origin);
        const vertical = candidate.anchor.side === 'top' || candidate.anchor.side === 'bottom';
        const x = targetPoint.x - originPoint.x + (vertical ? cross : candidate.anchor.side === 'left' ? -main : main);
        const y = targetPoint.y - originPoint.y + (vertical ? candidate.anchor.side === 'top' ? -main : main : cross);
        const overflow = Math.max(0, bounds.left - x) + Math.max(0, x + size.width - bounds.right) + Math.max(0, bounds.top - y) + Math.max(0, y + size.height - bounds.bottom);
        return { x, y, overflow, origin: candidate.origin };
    });
    const best = placed.reduce((current, candidate) => candidate.overflow < current.overflow ? candidate : current);
    const left = Math.max(bounds.left, Math.min(best.x, bounds.right - size.width));
    const top = Math.max(bounds.top, Math.min(best.y, bounds.bottom - size.height));
    return {
        position: 'fixed', inset: 'auto', margin: '0', left: `${left}px`, top: `${top}px`,
        transformOrigin: `${best.origin.side} ${best.origin.align}`,
        positionArea: 'none', positionTryFallbacks: 'none'
    };
}

export function overlayPositionStyles(props: OverlayPositionProps, content: HTMLElement, activator?: HTMLElement, cursor?: [number, number]): CSSProperties {
    const rtl = getComputedStyle(activator ?? content).direction === 'rtl';
    const layer = content.closest<HTMLElement>('.ui-overlay-layer');
    if ((props.locationStrategy ?? (props.location === 'anchor' ? 'connected' : 'static')) !== 'connected') {
        const origin = props.origin && props.origin !== 'auto' && props.origin !== 'overlap' ? anchor(props.origin, rtl) : undefined;
        const styles: CSSProperties = origin ? { transformOrigin: `${origin.side} ${origin.align}` } : {};
        if (props.location && props.location !== 'anchor' && (props.locationStrategy === 'static' || props.location.includes(' '))) {
            const parsed = anchor(props.location, rtl);
            const top = parsed.side === 'top' || parsed.align === 'top';
            const bottom = parsed.side === 'bottom' || parsed.align === 'bottom';
            const left = parsed.side === 'left' || parsed.align === 'left';
            const right = parsed.side === 'right' || parsed.align === 'right';
            styles.margin = `${top ? '12px' : 'auto'} ${right ? '12px' : 'auto'} ${bottom ? '12px' : 'auto'} ${left ? '12px' : 'auto'}`;
            styles.position = 'fixed';
            styles.inset = '0';
            styles.positionAnchor = 'none';
            styles.positionArea = 'none';
            styles.positionTryFallbacks = 'none';
        }
        if (layer && getComputedStyle(layer).position === 'absolute') styles.position = 'absolute';
        return styles;
    }
    const target = resolveOverlayTarget(props.target, activator, content, cursor);
    if (!target) return {};
    // Client rects include ancestor CSS zoom; fixed-position styles use the content's local units.
    // Keep animation transforms out of this ratio so opening/closing does not move the anchor.
    let zoom = 1;
    for (let node: HTMLElement | null = content; node; node = node.parentElement) {
        const value = getComputedStyle(node).zoom;
        const factor = Number.parseFloat(value) / (value.endsWith('%') ? 100 : 1);
        if (Number.isFinite(factor) && factor > 0) zoom *= factor;
    }
    const clientBox = Array.isArray(target) ? { left: target[0], top: target[1], width: 0, height: 0 } : target.getBoundingClientRect();
    const box = { left: clientBox.left / zoom, top: clientBox.top / zoom, width: clientBox.width / zoom, height: clientBox.height / zoom };
    const view = window.visualViewport;
    const layerBox = layer?.getBoundingClientRect();
    const viewport = layerBox
        ? { left: layerBox.left / zoom, top: layerBox.top / zoom, width: layerBox.width / zoom, height: layerBox.height / zoom }
        : { left: (view?.offsetLeft ?? 0) / zoom, top: (view?.offsetTop ?? 0) / zoom, width: (view?.width ?? window.innerWidth) / zoom, height: (view?.height ?? window.innerHeight) / zoom };
    const styles = connectedOverlayPosition(props, box, { width: content.offsetWidth, height: content.offsetHeight }, viewport, rtl);
    if (layerBox) {
        styles.position = 'absolute';
        styles.left = `${Number.parseFloat(String(styles.left)) - layerBox.left / zoom}px`;
        styles.top = `${Number.parseFloat(String(styles.top)) - layerBox.top / zoom}px`;
    }
    return styles;
}

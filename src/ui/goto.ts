export interface GoToOptions { container?: HTMLElement | string; offset?: number; behavior?: ScrollBehavior; block?: ScrollLogicalPosition; }
export function useGoTo() {
    return async (target: number | string | HTMLElement, options: GoToOptions = {}) => {
        if (typeof document === 'undefined') return;
        const container = typeof options.container === 'string' ? document.querySelector<HTMLElement>(options.container) : options.container;
        const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : typeof target === 'number' ? undefined : target;
        const behavior = document.documentElement.dataset.reducedMotion === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : options.behavior ?? 'smooth';
        if (typeof target === 'number') (container ?? window).scrollTo({ top: target + (options.offset ?? 0), behavior });
        else if (element && container) {
            const targetRect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const centered = options.block === 'center' ? (container.clientHeight - targetRect.height) / 2 : 0;
            container.scrollTo({ top: container.scrollTop + targetRect.top - containerRect.top - centered + (options.offset ?? 0), behavior });
        } else element?.scrollIntoView({ behavior, block: options.block ?? 'center' });
    };
}

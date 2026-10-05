export function createMarkdownDetailsMotion() {
    const active = new Map<HTMLDetailsElement, { animation: Animation; open: boolean }>();
    function finish(element: HTMLDetailsElement, open: boolean) { active.get(element)?.animation.cancel(); active.delete(element); element.open = open; }
    function click(event: MouseEvent) {
        const summary = event.target instanceof Element ? event.target.closest('summary') : null;
        const details = summary?.parentElement;
        if (!(details instanceof HTMLDetailsElement) || details.querySelector(':scope > summary') !== summary) return;
        if (event.target instanceof Element && event.target.closest('a, button, input, select, textarea')) return;
        event.preventDefault();
        const next = !(active.get(details)?.open ?? details.open);
        const from = details.getBoundingClientRect().height;
        active.get(details)?.animation.cancel(); active.delete(details);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reducedMotion === 'true') { details.open = next; return; }
        details.open = true;
        const style = getComputedStyle(details);
        const closedHeight = summary!.getBoundingClientRect().height + ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((total, key) => total + parseFloat(style[key as keyof CSSStyleDeclaration] as string || '0'), 0);
        const to = next ? details.getBoundingClientRect().height : closedHeight;
        const token = style.getPropertyValue('--motion-layout').trim();
        const duration = parseFloat(token) * (token.endsWith('ms') ? 1 : 1000) || 240;
        const animation = details.animate([{ height: `${from}px`, overflow: 'hidden' }, { height: `${to}px`, overflow: 'hidden' }], { duration, easing: style.getPropertyValue('--ease').trim() || 'ease', fill: 'both' });
        active.set(details, { animation, open: next });
        void animation.finished.then(() => { if (active.get(details)?.animation === animation) finish(details, next); }).catch(() => {});
    }
    function settle() { for (const [element, state] of active) finish(element, state.open); }
    return { click, settle, dispose: () => { for (const state of active.values()) state.animation.cancel(); active.clear(); } };
}

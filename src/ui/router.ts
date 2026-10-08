import { computed, getCurrentInstance, onBeforeUnmount, resolveDynamicComponent, toRef, type Ref } from 'vue';
import { isNestedControlEvent } from './action-events';

/** Keep a nested control's native default action without following its containing link. */
export function useNestedLinkGuard(element: Ref<HTMLElement | undefined>, href: () => string | undefined, disabled: () => boolean) {
    const pending = new Set<ReturnType<typeof setTimeout>>();
    onBeforeUnmount(() => { pending.forEach(clearTimeout); pending.clear(); });
    return (event: MouseEvent) => {
        if (disabled()) { event.preventDefault(); event.stopImmediatePropagation(); return; }
        const host = element.value;
        if (!(host instanceof HTMLAnchorElement) || !isNestedControlEvent(event, host)) return;
        const nestedLink = event.target instanceof Element ? event.target.closest('a[href]') : undefined;
        if (nestedLink && nestedLink !== host) return;
        // Cancelling a checkbox click also cancels its checked state. Remove only the
        // containing link target until the browser has completed this default action.
        host.removeAttribute('href');
        const timer = setTimeout(() => {
            pending.delete(timer);
            if (!host.isConnected || disabled()) return;
            const target = href();
            if (target !== undefined) host.setAttribute('href', target);
        }, 0);
        pending.add(timer);
    };
}

export interface RouterProps {
    href?: string;
    to?: string | Record<string, unknown>;
    replace?: boolean;
    exact?: boolean;
    disabled?: boolean;
}

interface RouterLinkState {
    route: Ref<{ href: string; query?: Record<string, unknown> }>;
    isActive: Ref<boolean>;
    isExactActive: Ref<boolean>;
    navigate: (event?: MouseEvent) => unknown;
}

/** Uses the application's RouterLink when registered; vue-router stays optional. */
export function useUiLink(props: RouterProps) {
    const instance = getCurrentInstance();
    const component = resolveDynamicComponent('RouterLink') as string | { useLink?: (props: object) => RouterLinkState };
    const routerLink = typeof component !== 'string' && component?.useLink
        ? component.useLink({ to: toRef(() => props.to ?? ''), replace: toRef(() => props.replace) })
        : undefined;
    const isLink = computed(() => !!(props.href || props.to));
    const href = computed(() => props.to && routerLink ? routerLink.route.value.href : props.href ?? (typeof props.to === 'string' ? props.to : undefined));
    const isActive = computed(() => {
        if (!props.to || !routerLink) return false;
        if (!props.exact) return routerLink.isActive.value;
        const route = (instance?.proxy as unknown as { $route?: { query?: object } })?.$route;
        const stableQuery = (query: object = {}) => Object.entries(query).sort(([a], [b]) => a.localeCompare(b));
        return routerLink.isExactActive.value && (!route || JSON.stringify(stableQuery(route.query)) === JSON.stringify(stableQuery(routerLink.route.value.query)));
    });
    function navigate(event: MouseEvent) {
        if (props.disabled) { event.preventDefault(); return; }
        if (!props.to || !routerLink || event.defaultPrevented) return;
        return routerLink.navigate(event);
    }
    return { isLink, href, isActive, navigate };
}

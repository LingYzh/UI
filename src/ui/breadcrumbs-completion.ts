import type { InjectionKey } from 'vue';

/** Dynamic parent values keep nested breadcrumb items reactive without copying booleans. */
export const breadcrumbsKey: InjectionKey<() => string> = Symbol('ui-breadcrumbs-divider');
export const breadcrumbsDisabledKey: InjectionKey<() => boolean> = Symbol('ui-breadcrumbs-disabled');

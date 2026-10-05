import type { InjectionKey } from 'vue';
export const breadcrumbsKey: InjectionKey<() => string> = Symbol('ui-breadcrumbs');

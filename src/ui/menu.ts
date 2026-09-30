import type { InjectionKey } from 'vue';

/** UiMenu 提供给 UiMenuItem 的上下文：关闭菜单（焦点回到触发器）。 */
export interface MenuContext {
    close: () => void;
}

export const menuContextKey: InjectionKey<MenuContext> = Symbol('ui-menu');

export type MenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

import type { InjectionKey } from 'vue';

/** UiMenu 提供给菜单项和嵌套菜单的运行时关系。 */
export interface MenuContext {
    /** 内容选择时按 closeOnContentClick 设置关闭此菜单及其祖先。 */
    close: () => void;
    /** 父菜单关闭或同级互斥时，只关闭此菜单分支。 */
    closeSelf: () => void;
    /** 在后代菜单关闭后延迟判断本菜单及祖先是否应关闭。 */
    closeParents: (event?: MouseEvent) => void;
    /** 清除本菜单和祖先尚未执行的 closeParents 回调。 */
    cancelCloseParents: () => void;
    /** 子菜单关闭时，仅在本菜单仍可承载焦点时恢复到触发器。 */
    canRestoreFocus: () => boolean;
    openChild: (key: object, closeChild: () => void, deactivateChild?: () => void) => void;
    unregisterChild: (key: object) => void;
}

export const menuContextKey: InjectionKey<MenuContext | null> = Symbol('ui-menu');

export type MenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

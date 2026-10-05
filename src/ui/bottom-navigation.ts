import type { InjectionKey } from 'vue';

export type BottomNavigationContext = { value: () => string | number | undefined; select: (value: string | number) => void };
export const bottomNavigationKey: InjectionKey<BottomNavigationContext> = Symbol('ui-bottom-navigation');

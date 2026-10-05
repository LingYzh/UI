import type { InjectionKey } from 'vue';
export interface TimelineContext { register: () => number; side: 'start' | 'end' | 'alternate'; reverse: boolean }
export const timelineKey: InjectionKey<TimelineContext> = Symbol('u-timeline');

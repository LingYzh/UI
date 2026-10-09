import type { InjectionKey } from 'vue';
import type { GroupContext, GroupValue } from './group-state';

export interface StepperContext extends GroupContext {
    blocked: Set<GroupValue>;
    go: (value: GroupValue) => void;
    finish: () => void;
}
export const stepperContextKey: InjectionKey<StepperContext> = Symbol('u-stepper-context');

import { ref, type InjectionKey } from 'vue';
import type { GroupContext } from './group-state';

export interface WindowContext extends GroupContext { direction: ReturnType<typeof ref<'forward' | 'backward'>>; visited: Set<string | number>; eager?: Readonly<ReturnType<typeof ref<boolean>>>; orientation?: Readonly<ReturnType<typeof ref<'horizontal' | 'vertical'>>> }
export const windowContextKey: InjectionKey<WindowContext> = Symbol('u-window-context');

export function attachWindowMotion(context: GroupContext, onChange: (direction: 'forward' | 'backward') => void) {
    let startX: number | null = null;
    let startY: number | null = null;
    function onTouchStart(event: TouchEvent): void {
        if (event.touches.length !== 1) return;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    }
    function onTouchEnd(event: TouchEvent): void {
        if (startX == null || startY == null || !event.changedTouches.length) return;
        const deltaX = event.changedTouches[0].clientX - startX;
        const deltaY = event.changedTouches[0].clientY - startY;
        startX = null;
        startY = null;
        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;
        if (deltaX < 0) { onChange('forward'); context.next(); } else { onChange('backward'); context.prev(); }
    }
    function onTouchCancel(): void { startX = null; startY = null; }
    function onKeydown(event: KeyboardEvent): void {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); onChange('forward'); context.next(); }
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); onChange('backward'); context.prev(); }
    }
    return { onTouchStart, onTouchEnd, onTouchCancel, onKeydown };
}

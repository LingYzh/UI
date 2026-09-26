import { readonly, ref } from 'vue';

export type SnackbarPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type SnackbarTone = 'info' | 'success' | 'error';
export interface SnackbarOptions {
    position?: SnackbarPosition;
    duration?: number;
    tone?: SnackbarTone;
}
export interface SnackbarNotice {
    id: number;
    message: string;
    position: SnackbarPosition;
    duration: number;
    tone: SnackbarTone;
}
const notices = ref<SnackbarNotice[]>([]);
const defaults: Required<SnackbarOptions> = { position: 'bottom-center', duration: 6000, tone: 'info' };
const clocks = new Map<number, { remaining: number; started: number; pauses: Set<string>; timer?: ReturnType<typeof setTimeout> }>();
let nextId = 0;
const positions: SnackbarPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
function normalize(options: SnackbarOptions): Required<SnackbarOptions> {
    return {
        position: positions.includes(options.position!) ? options.position! : defaults.position,
        duration: typeof options.duration === 'number' && Number.isFinite(options.duration) ? Math.max(0, options.duration) : defaults.duration,
        tone: options.tone && ['info', 'success', 'error'].includes(options.tone) ? options.tone : defaults.tone
    };
}
function dismiss(id: number) {
    clearTimeout(clocks.get(id)?.timer);
    clocks.delete(id);
    notices.value = notices.value.filter((notice) => notice.id !== id);
}
function schedule(id: number) {
    const clock = clocks.get(id);
    if (!clock || clock.pauses.size) return;
    clock.started = Date.now();
    clock.timer = setTimeout(() => dismiss(id), clock.remaining);
}
function pause(id: number, reason: string) {
    const clock = clocks.get(id);
    if (!clock || clock.pauses.has(reason)) return;
    if (!clock.pauses.size) {
        clearTimeout(clock.timer);
        clock.remaining = Math.max(0, clock.remaining - (Date.now() - clock.started));
    }
    clock.pauses.add(reason);
}
function resume(id: number, reason: string) {
    const clock = clocks.get(id);
    if (!clock?.pauses.delete(reason)) return;
    if (!clock.pauses.size) schedule(id);
}
function show(message: string, options: SnackbarOptions = {}) {
    const merged = normalize(options);
    const duration = merged.duration;
    const notice = { ...merged, duration, id: ++nextId, message };
    // Bound each stack; dismiss also cancels the removed notice's timer.
    const stack = notices.value.filter((item) => item.position === notice.position);
    if (stack.length >= 3) dismiss(stack[0].id);
    notices.value.push(notice);
    if (duration > 0) {
        clocks.set(notice.id, { remaining: duration, started: Date.now(), pauses: new Set() });
        schedule(notice.id);
    }
    return notice.id;
}
function clear() { for (const notice of [...notices.value]) dismiss(notice.id); }

/** Import from any application module. Mount one UiSnackbarHost at the app root. */
export const snackbar = {
    show,
    dismiss,
    clear,
    configure(options: SnackbarOptions) { Object.assign(defaults, normalize(options)); }
};
export const snackbarState = { notices: readonly(notices), pause, resume };

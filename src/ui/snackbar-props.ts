export interface SnackbarProps {
    title?: string;
    text?: string;
    timeout?: number | string;
    location?: string;
    color?: string;
    variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain';
    vertical?: boolean;
    loading?: boolean;
    closable?: boolean | string;
    closeText?: string;
    contained?: boolean;
    attach?: string | HTMLElement | false;
    rounded?: boolean;
    timer?: boolean | 'top' | 'bottom';
    timerColor?: string;
    reverseTimer?: boolean;
    persistent?: boolean;
    queueIndex?: number;
}
export type SnackbarDismissReason = 'dismissed' | 'cleared' | 'overflow' | 'auto';
export type SnackbarMessage = string | (SnackbarProps & {
    onDismiss?: (reason: SnackbarDismissReason) => void;
    promise?: Promise<unknown>;
    success?: (value: unknown) => SnackbarProps;
    error?: (error: unknown) => SnackbarProps;
});

export function snackbarLocation(value: string): string {
    const parts = value.toLowerCase().split(/[\s-]+/);
    const block = parts.find(part => ['top', 'bottom'].includes(part)) ?? (parts.includes('center') ? 'center' : 'bottom');
    const inline = parts.find(part => ['left', 'right', 'start', 'end'].includes(part)) ?? 'center';
    return `${block}-${inline}`;
}

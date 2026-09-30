import { readonly, ref } from 'vue';

export interface ConfirmOptions {
    message: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    /** danger 时确认按钮使用危险层级，适用于删除等不可撤销操作。 */
    tone?: 'default' | 'danger';
}

interface ConfirmRequest extends ConfirmOptions {
    id: number;
    resolve: (value: boolean) => void;
}

const queue = ref<ConfirmRequest[]>([]);
let nextId = 0;

/**
 * 从任意模块发起确认，返回用户选择。需要在根组件挂载一次 UiConfirmHost。
 * 多个请求按调用顺序排队依次显示；Promise 在弹窗真正关闭（焦点已恢复）后才 resolve。
 */
export function confirmDialog(options: ConfirmOptions | string): Promise<boolean> {
    const normalized = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
        queue.value.push({ ...normalized, id: ++nextId, resolve });
    });
}

function settle(id: number, value: boolean) {
    const request = queue.value.find((item) => item.id === id);
    if (!request) return;
    queue.value = queue.value.filter((item) => item.id !== id);
    request.resolve(value);
}

/** Host 卸载时调用：未处理的请求一律视为取消，避免调用方永远等待。 */
function cancelAll() {
    const pending = queue.value;
    queue.value = [];
    for (const request of pending) request.resolve(false);
}

export const confirmState = { queue: readonly(queue), settle, cancelAll };

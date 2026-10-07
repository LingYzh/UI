<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import UiButton from './UiButton.vue';
import UiDialog from './UiDialog.vue';
import { confirmState } from './confirm';
import { uiText } from './locale';

const current = computed(() => confirmState.queue.value[0]);
const open = ref(false);
const titleId = useId();
const messageId = useId();
// 记录本次选择；Esc 或遮罩关闭保持 false。
let answer = false;

// 队首变化（新请求或上一条已结算）时打开下一条；关闭动画期间队首不变，不会提前切换内容。
watch(current, (request) => {
    if (request && !open.value) {
        answer = false;
        open.value = true;
    }
}, { immediate: true });

function choose(value: boolean) {
    answer = value;
    open.value = false;
}
function closed() {
    const request = current.value;
    const value = answer;
    answer = false;
    if (request) confirmState.settle(request.id, value);
}
onBeforeUnmount(confirmState.cancelAll);
</script>

<template>
    <UiDialog v-model:open="open" class="ui-confirm" size="sm" role="alertdialog" :aria-labelledby="titleId" :aria-describedby="messageId" @closed="closed">
        <template v-if="current">
            <h2 :id="titleId" class="ui-confirm-title">{{ current.title ?? uiText('confirm.title') }}</h2>
            <p :id="messageId" class="ui-confirm-message">{{ current.message }}</p>
            <div class="ui-confirm-actions">
                <UiButton autofocus @click="choose(false)">{{ current.cancelText ?? uiText('common.cancel') }}</UiButton>
                <UiButton variant="flat" :color="current.tone === 'danger' ? 'danger' : 'primary'" @click="choose(true)">{{ current.confirmText ?? uiText('common.confirm') }}</UiButton>
            </div>
        </template>
    </UiDialog>
</template>

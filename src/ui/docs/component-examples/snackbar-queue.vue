<script setup>
import { ref } from 'vue';
import { UButton, USelect, USnackbarQueue, USwitch } from '../../index';
const messages = ref([]);
const queue = ref();
const strategy = ref('hold');
const totalVisible = ref(1);
const collapsed = ref(false);
const events = ref([]);
let sequence = 0;
function add() {
    messages.value = [
        ...messages.value,
        ...Array.from({ length: 3 }, () => ({
            text: `消息 ${++sequence}：已保存本次修改。`,
            timeout: 4000,
            onDismiss: (reason) => events.value.push(reason),
        })),
    ];
}
function asyncNotice(fail = false) {
    messages.value = [
        ...messages.value,
        {
            text: '正在保存…',
            promise: new Promise((resolve, reject) =>
                setTimeout(() => (fail ? reject(new Error('保存失败')) : resolve('成功')), 900)
            ),
            success: () => ({ text: '保存成功', color: 'success', timeout: 3000 }),
            error: () => ({ text: '保存失败，请重试', color: 'error', timeout: 3000 }),
        },
    ];
}
</script>

<template>
    <div class="component-demo" data-demo-component="USnackbarQueue">
        <div class="demo-row">
            <u-select v-model="strategy" :items="['hold', 'overflow']" label="队列策略" />
            <u-select v-model="totalVisible" :items="[1, 2, 3]" label="同时显示数量" />
            <u-switch v-model="collapsed" label="折叠堆叠" />
        </div>
        <div class="demo-row">
            <u-button @click="add">加入3条消息</u-button>
            <u-button @click="asyncNotice()">异步成功</u-button>
            <u-button @click="asyncNotice(true)">异步失败</u-button>
            <u-button @click="queue.clear()">清空队列</u-button>
        </div>
        <div class="notice-demo-stage">
            <p>hold 等待上一条关闭；overflow 淘汰最早消息。数组模型只保存待显示项。</p>
            <u-snackbar-queue
                ref="queue"
                v-model="messages"
                :total-visible="totalVisible"
                :display-strategy="strategy"
                :collapsed="collapsed"
                contained
                closable
            />
        </div>
        <output>等待：{{ messages.length }}；关闭原因：{{ events.join(', ') || '无' }}</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.demo-row {
    margin: 0;
}
.demo-row > .ui-control-frame {
    flex: 1 1 160px;
    min-width: 0;
}
.notice-demo-stage {
    position: relative;
    min-height: 270px;
    padding: 20px;
    border: 1px dashed var(--border);
    border-radius: 8px;
}
.notice-demo-stage p {
    margin: 0;
    color: var(--muted);
    line-height: 1.7;
}
.component-demo > output {
    font-size: 14px;
    color: var(--muted);
    overflow-wrap: anywhere;
}
</style>

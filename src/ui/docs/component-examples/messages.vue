<script setup>
import { ref } from 'vue';
import { UButton, UMessages } from '../../index';
const error = ref(false);
const active = ref(true);
</script>

<template>
    <div class="component-demo" data-demo-component="UMessages">
        <u-button size="sm" @click="error = !error">切换错误消息</u-button>
        <u-button size="sm" @click="active = !active">
            {{ active ? '隐藏消息' : '显示消息' }}
        </u-button>
        <u-messages
            :active="active"
            :error="error"
            :messages="error ? ['请检查输入内容。'] : ['配置已保存。']"
        >
            <template #message="{ message }">
                <strong>{{ message }}</strong>
            </template>
        </u-messages>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    justify-items: stretch;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
.component-demo > .ui-button {
    justify-self: start;
}
</style>

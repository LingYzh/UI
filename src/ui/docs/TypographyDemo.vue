<script setup>
import { typography, UButton, UTextField } from '../index';
import { ref } from 'vue';
const value = ref('正文与输入框 16px');
</script>

<template>
    <div class="typography-demo">
        <div
            v-for="role in typography"
            :key="role.name"
            class="typography-row"
            :data-font-role="role.name"
        >
            <span class="text-body-small text-muted">
                {{ role.name }} · {{ role.size }} / {{ role.lineHeight }} px
            </span>
            <div :class="`text-${role.name}`">字体 Typography</div>
        </div>
        <p class="text-body-medium">响应式工具类：手机正文、宽屏标题。</p>
        <p data-font-responsive class="text-body-large text-sm-title-large">
            随着容器所在视口调整字号
        </p>
        <u-text-field v-model="value" label="表单标签 16px" hint="辅助说明 12px" persistent-hint />
        <div class="d-flex flex-wrap ga-2">
            <u-button
                v-for="size in ['x-small', 'small', 'default', 'large', 'x-large']"
                :key="size"
                :size="size"
            >
                {{ size }}
            </u-button>
        </div>
    </div>
</template>

<style scoped>
.typography-demo {
    min-width: 0;
    display: grid;
    gap: 16px;
}
.typography-row {
    min-width: 0;
    padding-block-end: 12px;
    border-bottom: 1px solid var(--line);
}
.typography-row > div {
    overflow-wrap: anywhere;
}
.typography-demo > p {
    margin: 0;
}
</style>

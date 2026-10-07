<script setup>
import { ref } from 'vue';
import { UButton, USelect, USnackbar, USwitch, UTextField } from '../../index';
const open = ref(false);
const text = ref('配置已保存，可以继续编辑。');
const permanent = ref(false);
const contained = ref(true);
const variant = ref('elevated');
const location = ref('bottom center');
const colors = ref('');
const closed = ref(0);
const variants = ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'];
const locations = [
    'top left',
    'top center',
    'top right',
    'bottom left',
    'bottom center',
    'bottom right',
];
</script>

<template>
    <div class="component-demo" data-demo-component="USnackbar">
        <u-text-field v-model="text" label="消息内容" />
        <div class="demo-row">
            <u-select v-model="variant" :items="variants" label="样式" />
            <u-select v-model="location" :items="locations" label="位置" />
            <u-text-field v-model="colors" label="主题/CSS颜色" placeholder="primary / #47745c" />
        </div>
        <div class="demo-row">
            <u-switch v-model="permanent" label="持续显示" />
            <u-switch v-model="contained" label="容器内显示" />
            <u-button @click="open = !open">{{ open ? '隐藏消息' : '显示消息' }}</u-button>
        </div>
        <div class="notice-demo-stage">
            <p>鼠标悬停和键盘进入操作区都会暂停倒计时。</p>
            <u-snackbar
                v-model="open"
                :text="text"
                :timeout="permanent ? -1 : 3500"
                :contained="contained"
                :variant="variant"
                :location="location"
                :color="colors"
                timer
                @after-leave="closed++"
            >
                <template #actions="{ close }">
                    <u-button variant="text" size="sm" @click="close">关闭</u-button>
                </template>
            </u-snackbar>
        </div>
        <output>显示：{{ open }}；已关闭：{{ closed }}</output>
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
    min-height: 180px;
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
}
</style>

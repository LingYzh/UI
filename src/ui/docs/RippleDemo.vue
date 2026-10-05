<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { UButton, USwitch, UTabs, vRipple } from '../index';
const props = defineProps({ example: { type: String, default: 'ripple-feedback' } });
const enabled = ref(true);
const dense = ref(false);
const clicks = ref(0);
const bubbled = ref(0);
const tab = ref('first');
const busy = ref(false);
let busyTimer;
function wait() { busy.value = true; busyTimer = setTimeout(() => { busy.value = false; }, 800); }
onBeforeUnmount(() => clearTimeout(busyTimer));
</script>

<template>
    <div class="ripple-demo">
        <template v-if="props.example === 'ripple-feedback'">
            <div class="ripple-demo-toolbar"><u-switch id="ripple-enabled" v-model="enabled" label="启用涟漪" /><u-switch id="ripple-dense" v-model="dense" label="紧凑按钮" /></div>
            <div class="ripple-demo-actions"><u-button :ripple="enabled" :dense="dense" variant="primary" @click="clicks++">指针位置扩散</u-button><u-button :ripple="enabled && { center: true }" :dense="dense" @click="clicks++">居中扩散</u-button><button v-ripple="enabled" class="ripple-demo-native" :class="{ 'text-muted': dense }" @click="clicks++">原生按钮</button><u-button :loading="busy" :ripple="enabled" aria-label="点击后进入等待" @click="wait">{{ busy ? '正在等待…' : '点击后进入等待' }}</u-button><u-button disabled>禁用反馈</u-button></div>
            <p class="ripple-demo-note">快速点击后完整扩散与淡出；连续点击可同时看到多个波纹。长按保持，松开后淡出。</p><p class="ripple-demo-note" role="status">点击 {{ clicks }} 次 · 指针操作释放焦点，键盘操作保留焦点</p>
            <u-tabs v-model="tab" :ripple="enabled" :items="[{ value: 'first', text: '标签一' }, { value: 'second', text: '标签二' }]" aria-label="涟漪标签页" />
        </template>
        <template v-else>
            <div class="ripple-demo-actions"><button v-ripple.circle.center class="ripple-demo-circle" aria-label="圆形指令波纹">+</button><u-button :ripple="{ class: 'text-primary' }">主题辅助类颜色</u-button><u-button :ripple="{ color: '#246a91' }">指定反馈颜色</u-button><u-button :ripple="{ keys: ['a'] }">自定义按键反馈</u-button></div>
            <p class="ripple-demo-note">Tab 选中“自定义按键反馈”后按 A；其他按钮默认响应 Enter / 空格。圆形波纹使用 .circle.center。</p>
            <div v-ripple data-ripple="outer" class="ripple-demo-outer" @click="bubbled++">
                <p>外层波纹区域</p><div class="ripple-demo-actions"><button v-ripple data-ripple="inner" class="ripple-demo-native">内层独立波纹</button><button v-ripple.stop data-ripple="stop" class="ripple-demo-native">仅阻止外层波纹</button></div>
            </div>
            <p class="ripple-demo-note" role="status">外层收到 {{ bubbled }} 次 click · .stop 只拦截波纹，事件正常冒泡</p>
        </template>
    </div>
</template>

<style scoped>
.ripple-demo { display: grid; gap: 16px; min-width: 0; }
.ripple-demo-toolbar, .ripple-demo-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.ripple-demo-native { padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--soft); color: var(--text); font: inherit; cursor: pointer; }
.ripple-demo-native:focus-visible, .ripple-demo-circle:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; }
.ripple-demo-circle { width: 56px; height: 56px; padding: 0; border: 1px solid var(--border); border-radius: 50%; background: var(--soft); color: var(--accent-text); font: inherit; font-size: 24px; cursor: pointer; }
.ripple-demo-note { margin: 0; font-size: 12px; line-height: 1.7; color: var(--muted); }
.ripple-demo-outer { padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: var(--soft); }
.ripple-demo-outer > p { margin: 0 0 12px; color: var(--muted); }
</style>

<script setup>
import { ref } from 'vue';
import { UImg, USwitch } from '../../index';
const cover = ref(true);
const standardProtocol = ref(false);
const events = ref([]);
function loaded(value) {
    events.value.push(
        typeof value === 'string' ? 'URL 协议：图片已加载' : '原生 Event 协议：图片已加载'
    );
}
const image =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><rect width="640" height="320" fill="#efe8df"/><circle cx="480" cy="100" r="60" fill="#bd6749"/><path d="M0 320 180 90 360 320Z" fill="#789380"/><path d="M230 320 420 150 640 320Z" fill="#a7b7a5"/></svg>'
    );
</script>

<template>
    <div class="component-demo" data-demo-component="UImg">
        <u-switch v-model="cover" label="铺满容器（关闭后完整显示图片）" />
        <u-switch v-model="standardProtocol" label="load/error 使用标准 URL 协议" />
        <u-img
            :key="String(standardProtocol)"
            :src="{ src: image, aspect: 2 }"
            alt="柔和的山丘图形"
            :cover="cover"
            :standard-protocol="standardProtocol"
            height="220"
            position="center"
            gradient="to top, rgb(0 0 0 / .45), transparent"
            lazy
            @load="loaded"
        >
            <template #placeholder>正在加载示例图片…</template>
            <div class="image-caption">支持图片源对象、裁剪、渐变与内容插槽</div>
        </u-img>
        <output>{{ events.at(-1) || '等待图片加载' }}</output>
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
.image-caption {
    position: absolute;
    inset: auto 16px 16px;
    color: white;
    font-size: 14px;
}
</style>

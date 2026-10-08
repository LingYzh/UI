<script setup>
import { ref, computed } from 'vue';
import { UImg, ULazy, UNoSsr, UScrollArea, USwitch, UButton } from '../../index';
const visible = ref(false);
const once = ref(false);
const disabled = ref(false);
const scroll = ref();
const observed = ref(0);
const options = computed(() => ({ root: scroll.value?.element, threshold: 0.2 }));
const image =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><rect width="640" height="320" fill="#efe8df"/><circle cx="480" cy="100" r="60" fill="#bd6749"/><path d="M0 320 180 90 360 320Z" fill="#789380"/><path d="M230 320 420 150 640 320Z" fill="#a7b7a5"/></svg>'
    );
</script>

<template>
    <div class="component-demo" data-demo-component="ULazy">
        <u-switch v-model="once" label="进入后保持挂载" />
        <u-switch v-model="disabled" label="禁用观察并立即显示" />
        <u-scroll-area ref="scroll" height="220px" label="懒显示示例滚动区域" always>
            <div class="lazy-spacer">向下滚动，让图片进入观察区域。</div>
            <u-lazy
                v-model="visible"
                :once="once"
                :disabled="disabled"
                :options="options"
                root-margin="0px"
                min-height="160"
                tag="section"
                @intersect="observed++"
            >
                <u-no-ssr>
                    <u-img :src="image" alt="延迟显示的山丘图形" height="160" />
                    <template #placeholder>客户端加载中…</template>
                </u-no-ssr>
                <template #placeholder>
                    <div class="lazy-placeholder">等待进入视口…</div>
                </template>
            </u-lazy>
            <div class="lazy-spacer">向上返回，观察 once=false 时的卸载。</div>
        </u-scroll-area>
        <u-button @click="visible = false">重置可见模型</u-button>
        <output>modelValue：{{ visible }}；进入观察区域 {{ observed }} 次。</output>
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
.lazy-spacer {
    display: grid;
    place-items: center;
    height: 260px;
    padding: 16px;
    text-align: center;
    color: var(--muted);
}
.lazy-placeholder {
    display: grid;
    place-items: center;
    height: 160px;
    background: var(--surface);
    color: var(--muted);
}
</style>

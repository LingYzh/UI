<script setup>
import { ref } from 'vue';
import { UImg, UParallax, UScrollArea, USwitch, USlider } from '../../index';
const disabled = ref(false);
const standard = ref(false);
const scale = ref(0.5);
const loaded = ref(false);
const image =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><rect width="640" height="320" fill="#efe8df"/><circle cx="480" cy="100" r="60" fill="#bd6749"/><path d="M0 320 180 90 360 320Z" fill="#789380"/><path d="M230 320 420 150 640 320Z" fill="#a7b7a5"/></svg>'
    );
</script>

<template>
    <div class="component-demo" data-demo-component="UParallax">
        <label class="parallax-control">
            <u-switch v-model="disabled" aria-label="关闭视差" />
            <span>关闭视差</span>
        </label>
        <u-switch v-model="standard" label="使用 src 与标准 scale" />
        <u-slider
            v-if="standard"
            v-model="scale"
            :min="0"
            :max="1"
            :step="0.1"
            label="视差比例 scale"
        />
        <p class="parallax-note">在下方区域滚动：山丘背景与标题以不同速度移动。</p>
        <u-scroll-area class="parallax-demo-scroll" height="360px" label="视差演示滚动区域" always>
            <div class="parallax-spacer">向下滚动查看效果</div>
            <u-parallax
                class="parallax-scene"
                :src="image"
                :scale="standard ? scale : undefined"
                :speed="0.6"
                :disabled="disabled"
                alt="背景山丘"
                @load="loaded = true"
            >
                <template v-if="!standard" #background>
                    <u-img :src="image" alt="背景山丘" />
                </template>
                <template #default="{ offset }">
                    <div class="parallax-caption">
                        <strong>山丘随滚动轻轻移动</strong>
                        <output>背景位移：{{ offset.toFixed(1) }} px</output>
                        <span v-if="standard">
                            scale {{ scale }}；图片{{ loaded ? '已加载' : '加载中' }}
                        </span>
                    </div>
                </template>
            </u-parallax>
            <div class="parallax-spacer is-after">
                继续滚动，或向上返回；启用减少动效时背景保持静止。
            </div>
        </u-scroll-area>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    justify-items: stretch;
    gap: 16px;
    min-width: 0;
}
.parallax-control {
    display: flex;
    align-items: center;
    gap: 10px;
}
.parallax-note,
.parallax-spacer {
    color: var(--muted);
    font-size: 14px;
}
.parallax-demo-scroll {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
}
.parallax-spacer {
    display: grid;
    place-items: center;
    height: 120px;
    padding: 24px;
    text-align: center;
}
.parallax-spacer.is-after {
    height: 300px;
}
.parallax-scene {
    height: 240px;
}
.parallax-caption {
    display: grid;
    gap: 8px;
    margin: 20px;
    padding: 16px 20px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    text-align: center;
}
.parallax-caption output {
    font: 14px/1.5 var(--mono);
    color: var(--muted);
}
</style>

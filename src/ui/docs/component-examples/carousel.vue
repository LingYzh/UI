<script setup>
import { ref } from 'vue';
import { UCarousel, UCarouselItem } from '../../index';
const carousel = ref(1);
</script>

<template>
    <div class="component-demo" data-demo-component="UCarousel">
        <u-carousel v-model="carousel" :cycle="false" label="内容轮播"><u-carousel-item v-for="value in [1, 2, 3]" :key="value" :value="value"><div class="completion-window-card">第 {{ value }} 项</div></u-carousel-item></u-carousel>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }
.completion-window-card { display: grid; place-items: center; min-height: 140px; padding: 20px; background: var(--accent-soft); color: var(--accent-text); }
</style>

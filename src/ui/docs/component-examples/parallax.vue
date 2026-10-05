<script setup>
import { UImg, UParallax } from '../../index';
const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><rect width="640" height="320" fill="#efe8df"/><circle cx="480" cy="100" r="60" fill="#bd6749"/><path d="M0 320 180 90 360 320Z" fill="#789380"/><path d="M230 320 420 150 640 320Z" fill="#a7b7a5"/></svg>');
</script>

<template>
    <div class="component-demo" data-demo-component="UParallax">
        <u-parallax class="mt-4"><template #background><u-img :src="image" alt="背景山丘" /></template><strong>滚动产生轻微视差；减少动效时保持静止。</strong></u-parallax>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>

<script setup>
import { ref } from 'vue';
import { UButton, UImageViewer } from '@lingyzh/ui';

const open = ref(false);
const index = ref(0);
// 内嵌示例图保证离线文档也能验证查看器。
const sources = ['#a34f36', '#47745c'].map((color, i) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="${color}"/><circle cx="480" cy="290" r="140" fill="#faf9f5"/><text x="480" y="540" text-anchor="middle" font-size="48" fill="#faf9f5">Image ${i + 1}</text></svg>`)}`
);
</script>

<template>
    <div data-demo-component="UImageViewer">
        <UButton @click="open = true">打开图片查看器</UButton>
        <UImageViewer :sources="sources" label="示例图片"
            v-model="open" v-model:index="index" />
    </div>
</template>

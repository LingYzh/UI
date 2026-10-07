<script setup>
import { ref } from 'vue';
import { UFileUpload } from '../../index';
const upload = ref([]);
</script>

<template>
    <div class="component-demo" data-demo-component="UFileUpload">
        <u-file-upload
            v-model="upload"
            label="拖放附件"
            multiple
            :max-size="10485760"
            hint="支持拖放、删除，限制单文件 10 MB。"
        />
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

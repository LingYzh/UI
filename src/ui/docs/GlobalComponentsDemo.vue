<script setup>
import { ref } from 'vue';

// createUI() 已在应用入口安装；这里不导入任何 UI 组件。
const name = ref('');
const count = ref(0);
</script>

<template>
    <div class="global-components-demo d-flex flex-column ga-3">
        <UTextField label="项目名称" placeholder="请输入项目名称"
            v-model="name"
        />
        <div>
            <u-button color="primary" variant="flat"
                @click="count++"
            >
                保存 {{ count }} 次
            </u-button>
        </div>
        <p aria-live="polite">{{ name || '未填写项目名称' }}</p>
    </div>
</template>

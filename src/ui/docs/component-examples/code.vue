<script setup>
import { UCode } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UCode">
        <p>
            安装组件库：
            <u-code>npm install @lingyzh/ui</u-code>
        </p>
        <p>
            模板使用
            <u-code>&lt;u-button color="primary" /&gt;</u-code>
            ，普通正文与代码保持可读字号。
        </p>
    </div>
</template>

<style scoped>
.component-demo {
    min-width: 0;
}
.component-demo p {
    margin: 0 0 16px;
    line-height: 1.8;
}
</style>

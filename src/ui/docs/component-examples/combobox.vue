<script setup>
import { ref } from 'vue';
import { UCombobox } from '../../index';
const tags = ref(['文档']);
</script>

<template>
    <div class="component-demo" data-demo-component="UCombobox">
        <u-combobox v-model="tags" :items="['文档', '测试', '设计']" label="可创建标签" multiple chips clearable hint="输入新标签并按 Enter 创建。" />
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>

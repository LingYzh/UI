<script setup>
import { UButton, UEmptyState } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UEmptyState">
        <u-empty-state title="没有工作区" text="创建工作区后，相关内容会出现在这里。" icon="mdi-folder-outline"><template #actions><u-button size="sm">创建工作区</u-button></template></u-empty-state>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>

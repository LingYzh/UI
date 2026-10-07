<script setup>
import UDiff from '../UiDiff.vue';
import UActivity from '../UiActivity.vue';
const before = 'export function greet(name: string) {\n    return "Hello " + name;\n}\n';
const after =
    'export function greet(name: string) {\n    const label = name.trim() || "world";\n    return `Hello ${label}`;\n}\n';
</script>

<template>
    <div class="d-flex flex-column ga-4">
        <u-activity title="编辑 src/greeting.ts" status="已完成" :open="true" :scrollable="false">
            <u-diff path="src/greeting.ts" :before="before" :after="after" />
        </u-activity>
        <u-diff
            path="notes.md"
            :before="null"
            after="# 新建文档&#10;记录实际变更。&#10;"
            proposed
        />
        <u-diff path="旧文件.txt" before="已移除的内容" :after="null" />
    </div>
</template>

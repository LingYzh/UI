<script setup>
import { ref } from 'vue';
import { UFileInput, USwitch } from '../../index';
const files = ref([
    new File(['组件库附件示例'], '组件深度对齐验收记录与交接说明.md', { type: 'text/markdown' }),
]);
const filterFiles = ref(true);
const chips = ref(true);
const customSelection = ref(false);
const hideInput = ref(false);
const rejected = ref([]);
const details = ref([]);
</script>

<template>
    <div class="component-demo" data-demo-component="UFileInput">
        <u-switch v-model="filterFiles" label="校验文件类型" />
        <u-switch v-model="chips" label="用 Chip 显示文件" />
        <u-switch v-model="customSelection" label="自定义文件摘要" />
        <u-switch v-model="hideInput" label="隐藏文件字段，保留选择按钮" />
        <u-file-input
            v-model="files"
            label="选择附件"
            multiple
            accept=".md,.txt,.png"
            :filter-by-type="filterFiles ? '.md,.txt,.png' : undefined"
            show-size="1024"
            :chips="chips"
            :hide-input="hideInput"
            counter
            :max-size="10485760"
            hint="accept 筛选系统对话框；打开类型校验后，拖放和粘贴也会校验。"
            @rejected="rejected = $event"
            @rejected-details="details = $event"
        >
            <template v-if="customSelection" #selection="{ fileNames, totalBytesReadable }">
                {{ fileNames.join('、') }} · 合计 {{ totalBytesReadable }}
            </template>
            <template #counter="{ value, totalBytesReadable }">
                已选 {{ value }} 项 · {{ totalBytesReadable }}
            </template>
        </u-file-input>
        <output>
            模型 {{ files?.length ?? 0 }} 项；拒绝 {{ rejected.length }} 项{{
                details.length
                    ? '：' +
                      details.map((item) => item.file.name + '（' + item.reason + '）').join('、')
                    : ''
            }}
        </output>
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

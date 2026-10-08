<script setup>
import { ref } from 'vue';
import { UButton, UFileUpload, USwitch } from '../../index';
const upload = ref(null);
const single = ref(new File(['单文件示例'], '交接说明.txt', { type: 'text/plain' }));
const inset = ref(false);
const showSize = ref(true);
const clearable = ref(true);
const loading = ref(false);
const rejected = ref([]);
const details = ref([]);
</script>

<template>
    <div class="component-demo" data-demo-component="UFileUpload">
        <u-switch v-model="inset" label="文件列表内嵌" />
        <u-switch v-model="showSize" label="显示文件大小" />
        <u-switch v-model="clearable" label="显示移除按钮" />
        <u-switch v-model="loading" label="显示加载状态" />
        <u-file-upload
            v-model="upload"
            label="拖放附件"
            multiple
            accept=".md,.txt,.png"
            filter-by-type=".md,.txt,.png"
            :max-size="10485760"
            :inset-file-list="inset"
            :show-size="showSize"
            :clearable="clearable"
            :loading="loading"
            subtitle="Markdown、文本或图片，单文件最多 10 MB"
            hint="支持拖放、粘贴与删除；空模型为 null，选择后为 File 数组。"
            @rejected="rejected = $event"
            @rejected-details="details = $event"
        >
            <template #browse="{ props }">
                <u-button v-bind="props" variant="tonal">浏览附件</u-button>
            </template>
        </u-file-upload>
        <u-file-upload
            v-model="single"
            label="单文件和自定义条目"
            :clearable="clearable"
            :show-size="showSize"
            inset-file-list
        >
            <template #single="{ file, props }">
                <span>{{ file.name }}</span>
                <u-button v-if="clearable" v-bind="props" variant="text" aria-label="移除单文件">
                    移除
                </u-button>
            </template>
        </u-file-upload>
        <output>
            多文件：{{ upload === null ? 'null' : upload.length + ' 项' }}；单文件：{{
                single?.name ?? 'null'
            }}
        </output>
        <output>
            拒绝 {{ rejected.length }} 项{{
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

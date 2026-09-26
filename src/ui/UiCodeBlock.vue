<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
import UiButton from './UiButton.vue';
import UiScrollArea from './UiScrollArea.vue';
import Icon from '../components/Icon.vue';
const props = defineProps({ code: { type: String, required: true }, language: { type: String, default: 'vue' }, dense: Boolean, ghost: Boolean, rounded: { type: Boolean, default: true } });
const highlighted = computed(() => {
    const aliases: Record<string, string> = { vue: 'xml', html: 'xml', js: 'javascript', ts: 'typescript' };
    const language = aliases[props.language] || props.language;
    if (!hljs.getLanguage(language)) return props.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return hljs.highlight(props.code, { language, ignoreIllegals: true }).value;
});
const wrap = ref(false);
const copied = ref(false);
const feedback = ref('');
watch(() => props.code, () => { copied.value = false; feedback.value = ''; });
async function copy(code: string) {
    try {
        await navigator.clipboard.writeText(code);
        copied.value = true;
        feedback.value = '源码已复制。';
    } catch {
        feedback.value = '浏览器未允许剪贴板访问，请选中源码手动复制。';
    }
}
</script>

<template>
    <div class="ui-code-block" :class="{ 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded }">
        <div class="ui-code-toolbar"><span>{{ language }}</span><div><UiButton variant="ghost" size="sm" :dense="dense" :rounded="rounded" :aria-pressed="wrap" @click="wrap = !wrap">{{ wrap ? '取消换行' : '自动换行' }}</UiButton><UiButton variant="ghost" size="sm" :dense="dense" :rounded="rounded" @click="copy(code)"><Icon :name="copied ? 'check' : 'copy'" :size="14" />{{ copied ? '已复制' : '复制源码' }}</UiButton></div></div>
        <UiScrollArea label="源码内容" axis="both" max-height="580px" :dense="dense" :rounded="rounded"><pre :class="{ 'is-wrapped': wrap }"><!-- Only the escaping highlighter output is rendered; source is never executable HTML. --><code class="hljs" v-html="highlighted"></code></pre></UiScrollArea>
        <span class="ui-visually-hidden" role="status">{{ feedback }}</span>
    </div>
</template>

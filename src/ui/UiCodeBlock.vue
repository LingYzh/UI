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
import { patchMarkdownDom } from './markdownDom';
import { writeClipboard } from './clipboard';
import { uiText } from './locale';
const props = defineProps({ code: { type: String, required: true }, language: { type: String, default: 'vue' }, maxHeight: { type: String, default: '580px' }, streaming: Boolean, dense: Boolean, ghost: Boolean, rounded: { type: Boolean, default: true } });
const highlighted = computed(() => {
    const aliases: Record<string, string> = { vue: 'xml', html: 'xml', js: 'javascript', ts: 'typescript' };
    const language = aliases[props.language] || props.language;
    if (!hljs.getLanguage(language)) return props.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return hljs.highlight(props.code, { language, ignoreIllegals: true }).value;
});
function updateCode(element: HTMLElement, html: string) {
    const fragment = document.createElement('template');
    fragment.innerHTML = html;
    patchMarkdownDom(element, fragment.content);
}
const vStableCode = {
    mounted: (element: HTMLElement, binding: { value: string }) => updateCode(element, binding.value),
    updated: (element: HTMLElement, binding: { value: string; oldValue: string }) => { if (binding.value !== binding.oldValue) updateCode(element, binding.value); }
};
const wrap = ref(false);
const copied = ref(false);
const feedback = ref('');
watch(() => props.code, () => { copied.value = false; feedback.value = ''; });
async function copy(code: string) {
    try {
        await writeClipboard(code);
        copied.value = true;
        feedback.value = uiText('code.copySuccess');
    } catch {
        feedback.value = uiText('code.copyBlocked');
    }
}
</script>

<template>
    <div class="ui-code-block" :class="{ 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded }">
        <div class="ui-code-toolbar"><span>{{ language }}</span><div><UiButton variant="ghost" size="sm" :dense="dense" :rounded="rounded" :aria-pressed="wrap" @click="wrap = !wrap">{{ wrap ? uiText('code.unwrap') : uiText('common.autoWrap') }}</UiButton><UiButton variant="ghost" size="sm" :dense="dense" :rounded="rounded" @click="copy(code)"><Icon :name="copied ? 'check' : 'copy'" :size="14" />{{ copied ? uiText('common.copied') : uiText('code.copy') }}</UiButton></div></div>
        <UiScrollArea :label="uiText('code.content')" axis="both" :max-height="maxHeight" :dense="dense" :rounded="rounded"><pre :class="{ 'is-wrapped': wrap }"><!-- Only escaping highlighter output is rendered; source is never executable HTML. --><code v-stable-code="highlighted" class="hljs"></code></pre></UiScrollArea>
        <span class="ui-visually-hidden" role="status">{{ feedback }}</span>
    </div>
</template>

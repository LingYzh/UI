<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import DOMPurify from 'dompurify';
import UiCodeBlock from './UiCodeBlock.vue';
import UiScrollArea from './UiScrollArea.vue';
import { uiText } from './locale';

const props = defineProps<{ code: string; complete: boolean; id: string }>();
const svg = ref('');
let version = 0;
let disposed = false;
const theme = ref(document.documentElement.dataset.theme || 'light');
const observer = new MutationObserver(() => { theme.value = document.documentElement.dataset.theme || 'light'; });
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
watch([() => props.code, () => props.complete, theme], async () => {
    const current = ++version;
    if (!props.complete || props.code.length > 50000) { svg.value = ''; return; }
    try {
        const { default: mermaid } = await import('mermaid');
        if (disposed || current !== version) return;
        const tokens = getComputedStyle(document.documentElement);
        const color = (name: string) => tokens.getPropertyValue(name).trim();
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true, maxTextSize: 50000, maxEdges: 500, theme: 'base', flowchart: { htmlLabels: false }, themeVariables: { darkMode: theme.value === 'dark', fontFamily: 'Segoe UI, Microsoft YaHei, sans-serif', primaryColor: color('--soft'), primaryTextColor: color('--text'), primaryBorderColor: color('--border'), lineColor: color('--muted'), secondaryColor: color('--accent-soft'), tertiaryColor: color('--surface'), textColor: color('--text') } });
        // Reject configuration directives so model text cannot override the
        // renderer's strict security settings or inject CSS/HTML labels.
        const source = props.code.replace(/%%\{[\s\S]*?\}%%/g, '');
        if (/^\s*---\s*\n/.test(source)) throw new Error('Diagram configuration is not supported.');
        const result = await mermaid.render(`${props.id}-${current}`, source);
        if (disposed || current !== version) return;
        svg.value = DOMPurify.sanitize(result.svg, { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS: ['foreignObject', 'a', 'script'], FORBID_ATTR: ['href', 'xlink:href', 'onload', 'onclick'] });
    } catch {
        if (!disposed && current === version) svg.value = '';
    }
}, { immediate: true });
onBeforeUnmount(() => { disposed = true; version++; observer.disconnect(); });
</script>

<template>
    <div class="ui-markdown-diagram">
        <UiScrollArea v-if="svg" :label="uiText('markdown.diagram')" axis="both" max-height="560px"><div class="ui-markdown-diagram-svg" v-html="svg"></div></UiScrollArea>
        <UiCodeBlock v-else :code="code" language="mermaid" :streaming="!complete" />
    </div>
</template>

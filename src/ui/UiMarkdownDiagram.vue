<script lang="ts">
// Mermaid configuration is global; serialize renders from different theme scopes.
let diagramRenderQueue: Promise<unknown> = Promise.resolve();
</script>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import DOMPurify from 'dompurify';
import UiCodeBlock from './UiCodeBlock.vue';
import UiScrollArea from './UiScrollArea.vue';
import { uiText } from './locale';
import { useUiTheme } from './theme';

const props = defineProps<{ code: string; complete: boolean; id: string }>();
const svg = ref('');
let version = 0;
let disposed = false;
const theme = useUiTheme();
watch([() => props.code, () => props.complete, theme.current], async () => {
    const current = ++version;
    if (!props.complete || props.code.length > 50000) { svg.value = ''; return; }
    try {
        const { default: mermaid } = await import('mermaid');
        if (disposed || current !== version) return;
        // Reject configuration directives so model text cannot override the
        // renderer's strict security settings or inject CSS/HTML labels.
        const source = props.code.replace(/%%\{[\s\S]*?\}%%/g, '');
        if (/^\s*---\s*\n/.test(source)) throw new Error('Diagram configuration is not supported.');
        const rendering = diagramRenderQueue.then(async () => {
            if (disposed || current !== version) return;
            const color = (name: string) => {
                const value = theme.current.value.colors[name];
                if (/^#[a-f\d]{6}$/i.test(value)) return value;
                // Mermaid's color parser cannot resolve CSS color-mix().
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 1;
                const paint = canvas.getContext('2d')!;
                paint.fillStyle = value;
                paint.fillRect(0, 0, 1, 1);
                return '#' + [...paint.getImageData(0, 0, 1, 1).data].slice(0, 3).map(channel => channel.toString(16).padStart(2, '0')).join('');
            };
            mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true, maxTextSize: 50000, maxEdges: 500, theme: 'base', htmlLabels: false, flowchart: { htmlLabels: false }, themeVariables: { darkMode: theme.current.value.dark, fontFamily: 'Segoe UI, Microsoft YaHei, sans-serif', primaryColor: color('soft'), primaryTextColor: color('text'), primaryBorderColor: color('border'), lineColor: color('muted'), secondaryColor: color('accent-soft'), tertiaryColor: color('surface'), textColor: color('text') } });
            return mermaid.render(`${props.id}-${current}`, source);
        });
        diagramRenderQueue = rendering.catch(() => {});
        const result = await rendering;
        if (!result || disposed || current !== version) return;
        svg.value = DOMPurify.sanitize(result.svg, { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS: ['foreignObject', 'a', 'script'], FORBID_ATTR: ['href', 'xlink:href', 'onload', 'onclick'] });
    } catch {
        if (!disposed && current === version) svg.value = '';
    }
}, { immediate: true });
onBeforeUnmount(() => { disposed = true; version++; });
</script>

<template>
    <div class="ui-markdown-diagram">
        <UiScrollArea v-if="svg" :label="uiText('markdown.diagram')" axis="both" max-height="560px"><div class="ui-markdown-diagram-svg" v-html="svg"></div></UiScrollArea>
        <UiCodeBlock v-else :code="code" language="mermaid" :streaming="!complete" />
    </div>
</template>

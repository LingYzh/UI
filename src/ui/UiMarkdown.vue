<script setup lang="ts">
import { onBeforeUnmount, ref, useId, watch } from 'vue';
import { parseMarkdown, safeMarkdownUrl, type MarkdownBlock } from './markdown';
import { StreamingTextPacer } from './streamingTextPacer';
import UiCodeBlock from './UiCodeBlock.vue';
import UiScrollArea from './UiScrollArea.vue';
import UiMarkdownHtml from './UiMarkdownHtml.vue';
import UiMarkdownDiagram from './UiMarkdownDiagram.vue';
import { uiText } from './locale';

const props = withDefaults(defineProps<{ source: string; streaming?: boolean }>(), { streaming: false });
const emit = defineEmits<{ 'link-click': [href: string]; rendered: [source: string] }>();
const prefix = `ui-md-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
const element = ref<HTMLElement>();
const blocks = ref<MarkdownBlock[]>([]);
const displaying = ref(props.streaming);
const pacer = new StreamingTextPacer(props.streaming ? '' : props.source);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionDisabled = () => reducedMotion.matches || document.documentElement.dataset.reducedMotion === 'true';
let frame = 0;
let lastPublished = -Infinity;
let parseInterval = 0;
let publishedSource = '\0';
let previouslyStreaming = props.streaming;
function tick(now: number, immediate = false) {
    frame = 0;
    const shown = pacer.next(props.source, now, props.streaming, immediate || motionDisabled());
    const pending = pacer.hasPending;
    displaying.value = props.streaming || pending;
    const interval = props.streaming ? Math.min(180, Math.max(pacer.updateIntervalMs, parseInterval)) : 32;
    if (immediate || !pending || now - lastPublished >= interval) {
        if (shown !== publishedSource || !displaying.value) {
            const started = performance.now();
            blocks.value = parseMarkdown(shown, displaying.value);
            parseInterval = (performance.now() - started) * 2;
            publishedSource = shown;
            lastPublished = now;
            emit('rendered', shown);
        }
    }
    if (pending) frame = requestAnimationFrame(tick);
}
watch([() => props.source, () => props.streaming], () => {
    cancelAnimationFrame(frame);
    // Historical messages render immediately. A live turn gets the same short
    // buffer, adaptive rate and bounded finish catch-up as the mobile client.
    tick(performance.now(), !props.streaming && !previouslyStreaming);
    previouslyStreaming = props.streaming;
}, { immediate: true });
function motionChanged() { if (motionDisabled()) { cancelAnimationFrame(frame); tick(performance.now(), true); } }
reducedMotion.addEventListener('change', motionChanged);
const motionObserver = new MutationObserver(motionChanged);
motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });
function linkClick(event: MouseEvent) {
    const target = event.target instanceof Element ? event.target.closest('a') : null;
    if (!target || !element.value?.contains(target)) return;
    event.preventDefault();
    const href = target.getAttribute('href') || '';
    if (href.startsWith(`#${prefix}-`)) {
        const anchor = Array.from(element.value.querySelectorAll<HTMLElement>('[id]')).find(node => node.id === href.slice(1));
        if (anchor) {
            anchor.scrollIntoView({ block: 'center', inline: 'nearest', behavior: motionDisabled() ? 'instant' : 'smooth' });
            const previous = anchor.getAttribute('tabindex');
            anchor.setAttribute('tabindex', '-1');
            anchor.focus({ preventScroll: true });
            anchor.addEventListener('blur', () => { if (previous === null) anchor.removeAttribute('tabindex'); else anchor.setAttribute('tabindex', previous); }, { once: true });
        }
    } else if (safeMarkdownUrl(href)) emit('link-click', href);
}
onBeforeUnmount(() => { cancelAnimationFrame(frame); reducedMotion.removeEventListener('change', motionChanged); motionObserver.disconnect(); });
</script>

<template>
    <div ref="element" class="ui-markdown" :class="{ 'is-streaming': displaying }" :aria-busy="displaying" @click="linkClick">
        <div v-for="block in blocks" :key="block.key" class="ui-markdown-block" :data-block-kind="block.kind">
            <UiCodeBlock v-if="block.kind === 'code'" :code="block.code" :language="block.language" :streaming="displaying" />
            <UiMarkdownDiagram v-else-if="block.kind === 'mermaid'" :code="block.code" :complete="block.complete" :id="`${prefix}-${block.key}`" />
            <UiScrollArea v-else-if="block.kind === 'table' || block.kind === 'math'" :label="block.kind === 'table' ? uiText('markdown.table') : uiText('markdown.math')" axis="horizontal"><UiMarkdownHtml :html="block.html" :prefix="prefix" /></UiScrollArea>
            <UiMarkdownHtml v-else :html="block.html" :prefix="prefix" />
        </div>
        <span v-if="displaying" class="ui-markdown-cursor" aria-hidden="true"></span>
    </div>
</template>

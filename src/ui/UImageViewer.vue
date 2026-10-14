<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { mdiClose, mdiChevronLeft, mdiChevronRight, mdiMagnifyPlusOutline, mdiMagnifyMinusOutline, mdiRotateRight, mdiRestore } from '@mdi/js';
import UiDialog from './UiDialog.vue';
import UiButton from './UiButton.vue';
import { useDefaults } from './defaults';
import { useLocale } from './locale-context';

const rawProps = withDefaults(defineProps<{
    sources?: string[];
    label?: string;
    referrerpolicy?: ReferrerPolicy;
}>(), { sources: () => [] });
const props = useDefaults(rawProps, 'UImageViewer');
const locale = useLocale();
const label = computed(() => props.label ?? locale.t('imageViewer.label'));
const open = defineModel<boolean>({ default: false });
const index = defineModel<number>('index', { default: 0 });
const emit = defineEmits<{ closed: [] }>();
const scale = ref(1);
const rotation = ref(0);
const offset = ref({ x: 0, y: 0 });
const failed = ref(false);
let drag: { id: number; x: number; y: number; originX: number; originY: number } | undefined;
const currentIndex = computed(() => Math.max(0, Math.min(props.sources.length - 1, index.value)));
const source = computed(() => props.sources[currentIndex.value]);
const transform = computed(() => `translate(${offset.value.x}px, ${offset.value.y}px) scale(${scale.value}) rotate(${rotation.value}deg)`);

function reset() {
    scale.value = 1;
    rotation.value = 0;
    offset.value = { x: 0, y: 0 };
    drag = undefined;
}
watch([source, open], () => { reset(); failed.value = false; });
function move(direction: number) {
    if (!props.sources.length) return;
    index.value = (currentIndex.value + direction + props.sources.length) % props.sources.length;
}
function zoom(delta: number) {
    if (!source.value || failed.value) return;
    scale.value = Math.min(5, Math.max(0.25, Math.round((scale.value + delta) * 100) / 100));
}
function rotate() { rotation.value = (rotation.value + 90) % 360; }
function close() { open.value = false; }
function keydown(event: KeyboardEvent) {
    // 只处理查看器快捷键；Esc 与焦点恢复由 Dialog 统一处理。
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') move(-1);
    else if (event.key === 'ArrowRight') move(1);
    else if (event.key === '+' || event.key === '=') zoom(0.25);
    else if (event.key === '-') zoom(-0.25);
    else if (event.key === '0') reset();
    else return;
    event.preventDefault();
}
function startDrag(event: PointerEvent) {
    if (event.button !== 0 || !source.value || failed.value) return;
    const element = event.currentTarget as HTMLElement;
    element.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: offset.value.x, originY: offset.value.y };
}
function dragImage(event: PointerEvent) {
    if (!drag || drag.id !== event.pointerId) return;
    offset.value = { x: drag.originX + event.clientX - drag.x, y: drag.originY + event.clientY - drag.y };
}
function endDrag() { drag = undefined; }
defineExpose({ close, reset });
</script>

<template>
    <UiDialog class="ui-image-viewer" :aria-label="label" fullscreen
        v-model="open"
        @keydown="keydown" @closed="emit('closed')">
        <header class="ui-image-viewer-header">
            <span>{{ label }}</span>
            <span class="ui-image-viewer-counter" aria-live="polite">{{ props.sources.length ? currentIndex + 1 : 0 }} / {{ props.sources.length }}</span>
            <UiButton :icon="mdiClose" :aria-label="locale.t('common.close')" variant="text"
                @click="close" />
        </header>
        <div class="ui-image-viewer-stage"
            @pointerdown="startDrag" @pointermove="dragImage" @pointerup="endDrag" @pointercancel="endDrag" @lostpointercapture="endDrag"
            @wheel.prevent="zoom($event.deltaY < 0 ? 0.25 : -0.25)">
            <img class="ui-image-viewer-image" :src="source" :alt="`${label} ${currentIndex + 1}`" :style="{ transform }" :referrerpolicy="props.referrerpolicy" draggable="false"
                v-if="source && !failed"
                @error="failed = true" />
            <p class="ui-image-viewer-empty" role="status" v-else>{{ locale.t(failed ? 'imageViewer.failed' : 'imageViewer.empty') }}</p>
        </div>
        <footer class="ui-image-viewer-toolbar" :aria-label="locale.t('imageViewer.tools')">
            <UiButton :icon="mdiChevronLeft" :disabled="props.sources.length < 2" :aria-label="locale.t('imageViewer.previous')"
                @click="move(-1)" />
            <UiButton :icon="mdiMagnifyMinusOutline" :disabled="scale <= 0.25 || !source || failed" :aria-label="locale.t('imageViewer.zoomOut')"
                @click="zoom(-0.25)" />
            <output class="ui-image-viewer-scale">{{ Math.round(scale * 100) }}%</output>
            <UiButton :icon="mdiMagnifyPlusOutline" :disabled="scale >= 5 || !source || failed" :aria-label="locale.t('imageViewer.zoomIn')"
                @click="zoom(0.25)" />
            <UiButton :icon="mdiRotateRight" :disabled="!source || failed" :aria-label="locale.t('imageViewer.rotate')"
                @click="rotate" />
            <UiButton :icon="mdiRestore" :disabled="!source || failed" :aria-label="locale.t('imageViewer.reset')"
                @click="reset" />
            <UiButton :icon="mdiChevronRight" :disabled="props.sources.length < 2" :aria-label="locale.t('imageViewer.next')"
                @click="move(1)" />
        </footer>
    </UiDialog>
</template>

<style>
.ui-image-viewer {
    padding: 0;
    overflow: hidden;
}
.ui-image-viewer[open] {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
}
.ui-image-viewer-header,
.ui-image-viewer-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--surface);
    z-index: 1;
}
.ui-image-viewer-header {
    border-bottom: 1px solid var(--border);
}
.ui-image-viewer-counter {
    flex: 1;
    color: var(--muted);
    text-align: right;
}
.ui-image-viewer-toolbar {
    justify-content: center;
    flex-wrap: wrap;
    border-top: 1px solid var(--border);
}
.ui-image-viewer-stage {
    display: grid;
    place-items: center;
    overflow: hidden;
    min-height: 0;
    background: var(--background);
    touch-action: none;
    cursor: grab;
}
.ui-image-viewer-stage:active { cursor: grabbing; }
.ui-image-viewer-image {
    max-width: 100%;
    max-height: 100%;
    min-height: 0;
    object-fit: contain;
    user-select: none;
}
.ui-image-viewer-empty { color: var(--muted); }
.ui-image-viewer-scale {
    min-width: 48px;
    text-align: center;
    font-variant-numeric: tabular-nums;
}
</style>

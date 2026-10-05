<script setup lang="ts">
import { useDefaults } from './defaults';
import { onMounted, onBeforeUnmount, ref } from 'vue';
const rawProps = withDefaults(defineProps<{ speed?: number; disabled?: boolean }>(), { speed: 0.3 });
const props = useDefaults(rawProps, 'UParallax');
const element = ref<HTMLElement>();
const ratio = ref(0);
const offset = ref(0);
let frame = 0;
function setElement(value: HTMLElement | null): void { element.value = value ?? undefined; schedule(); }
function measure(): void {
    frame = 0;
    if (!element.value || props.disabled) { offset.value = 0; return; }
    const rect = element.value.getBoundingClientRect();
    const span = window.innerHeight + rect.height;
    ratio.value = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / span));
    offset.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : (ratio.value - 0.5) * rect.height * Math.max(-1, Math.min(1, props.speed));
}
function schedule(): void { if (!frame) frame = requestAnimationFrame(measure); }
onMounted(() => { window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule); schedule(); });
onBeforeUnmount(() => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); if (frame) cancelAnimationFrame(frame); });
</script>
<template>
    <div ref="element" class="u-parallax"><div class="u-parallax-background" :style="{ transform: 'translateY(' + offset + 'px)' }"><slot name="background" /></div><div class="u-parallax-content"><slot :offset="offset" :ratio="ratio" /></div></div>
</template>

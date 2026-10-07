<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { useDefaults } from './defaults';
import Icon from '../components/Icon.vue';
import { vPointerBlur } from './pointer-focus';
import { onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue';
import { createGroup, windowKey, type GroupValue } from './group-state';
import { attachWindowMotion, windowContextKey, type WindowContext } from './window-state';
import { useReducedMotion } from './motion';
const rawProps = withDefaults(defineProps<{ interval?: number; cycle?: boolean; disabled?: boolean; label?: string; touch?: boolean; keyboard?: boolean } & { ripple?: RippleOptions }>(), { ripple: true, interval: 6000, cycle: true, touch: true, keyboard: true });
const props = useDefaults(rawProps, 'UCarousel');
const model = defineModel<GroupValue | null>({ default: null });
const group = createGroup(model, { mandatory: true, disabled: props.disabled });
const direction = ref<'forward' | 'backward'>('forward');
const visited = reactive(new Set<GroupValue>());
const paused = ref(false);
const reducedMotion = useReducedMotion();
const context: WindowContext = { ...group, direction, visited };
provide(windowKey, context);
provide(windowContextKey, context);
const motion = attachWindowMotion(context, (value) => { direction.value = value; });
let timer: ReturnType<typeof setInterval> | undefined;
function next(): void { if (!props.disabled) { direction.value = 'forward'; context.next(); } }
function prev(): void { if (!props.disabled) { direction.value = 'backward'; context.prev(); } }
function onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && (event.currentTarget as HTMLElement | null)?.contains(next)) return;
    paused.value = false;
}
function resetTimer(): void {
    if (timer) clearInterval(timer);
    timer = undefined;
    if (props.cycle && !props.disabled && !paused.value && !reducedMotion.value && props.interval > 0) timer = setInterval(next, Math.max(1000, props.interval));
}
watch([() => props.interval, () => props.cycle, () => props.disabled, paused, reducedMotion], resetTimer);
watch(model, (value) => { if (value != null) visited.add(value); }, { immediate: true });
onMounted(resetTimer);
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
defineExpose({ next, prev });
</script>
<template>
    <section class="u-carousel" role="region" aria-roledescription="轮播" :aria-label="props.label || '轮播内容'" @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="onFocusOut" @keydown="props.keyboard && motion.onKeydown($event)" @touchstart.passive="props.touch && motion.onTouchStart($event)" @touchend.passive="props.touch && motion.onTouchEnd($event)" @touchcancel="motion.onTouchCancel">
            <div class="u-carousel-content"><slot :next="next" :prev="prev" :model-value="model" /></div>
            <button v-ripple="props.ripple" v-pointer-blur type="button" class="u-carousel-prev" aria-label="上一项" :disabled="props.disabled" @click="prev"><Icon name="mdi-chevron-left" :size="20" /></button><button v-ripple="props.ripple" v-pointer-blur type="button" class="u-carousel-next" aria-label="下一项" :disabled="props.disabled" @click="next"><Icon name="mdi-chevron-right" :size="20" /></button>
            <div class="u-carousel-controls"><button v-ripple.center.circle="props.ripple" v-for="(value, index) in context.values" :key="value" v-pointer-blur type="button" :aria-label="'前往第 ' + (index + 1) + ' 项'" :aria-pressed="model === value" :disabled="props.disabled" @click="context.select(value)"><span class="u-carousel-dot" aria-hidden="true" /></button></div>
        </section>
</template>

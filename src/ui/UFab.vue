<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue';
import { useDefaults } from './defaults';
import { useLayoutItem } from './layout-completion';
import UiButton from './UiButton.vue';
import UTransition from './UTransition.vue';
defineOptions({ inheritAttrs: false });
const rawProps = withDefaults(defineProps<{
    disabled?: boolean; loading?: boolean; label?: string; active?: boolean;
    app?: boolean; absolute?: boolean; extended?: boolean; layout?: boolean; offset?: boolean;
    location?: string; order?: number | string; appear?: boolean; transition?: boolean | 'fade' | 'scale' | 'slide-x' | 'slide-y';
}>(), { active: true, location: 'bottom end', order: 0, transition: 'scale' });
const props = useDefaults(rawProps, 'UFab');
const model = defineModel<boolean>({ default: true });
const attrs = useAttrs();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const element = ref<HTMLElement>();
const measured = ref(44);
const edge = computed<'top' | 'bottom'>(() => props.location.includes('top') ? 'top' : 'bottom');
const { offset } = useLayoutItem(edge, computed(() => props.layout ? measured.value + 24 : 0), computed(() => props.app && model.value), computed(() => Number(props.order)));
const positioned = computed(() => props.app || props.absolute);
const positionStyle = computed(() => {
    if (!positioned.value) return {};
    const result: Record<string, string> = { position: props.absolute ? 'absolute' : 'fixed', [edge.value]: `${offset.value + (props.offset ? 0 : 12)}px` };
    if (props.location.includes('center')) { result.left = '50%'; result.transform = 'translateX(-50%)'; }
    else result[props.location.includes('start') || props.location.includes('left') ? 'insetInlineStart' : 'insetInlineEnd'] = '12px';
    return result;
});
let observer: ResizeObserver | undefined;
onMounted(() => {
    if (typeof ResizeObserver === 'undefined') return;
    observer = new ResizeObserver(() => { measured.value = element.value?.offsetHeight || 44; });
    if (element.value) observer.observe(element.value);
});
onBeforeUnmount(() => observer?.disconnect());
function activate(event: MouseEvent) { if (!props.disabled && !props.loading) emit('click', event); }
</script>

<template>
    <div ref="element" class="u-fab-wrapper" :class="{ 'is-positioned': positioned, 'is-offset': props.offset }" :style="positionStyle">
        <UTransition :variant="props.transition === false || props.transition === true ? 'scale' : props.transition" :disabled="props.transition === false" :appear="props.appear">
            <span v-show="props.active" class="u-fab-container"><UiButton v-bind="attrs" class="u-fab" :class="{ 'is-extended': props.extended }" :disabled="props.disabled" :loading="props.loading" :aria-label="props.label" @click="activate"><template v-if="$slots.prepend" #prepend><slot name="prepend" /></template><template v-if="$slots.default || !attrs.icon" #default><slot v-if="$slots.default" /><template v-else>+</template></template><template v-if="$slots.append" #append><slot name="append" /></template><template v-if="$slots.loader" #loader><slot name="loader" /></template></UiButton></span>
        </UTransition>
    </div>
</template>

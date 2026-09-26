<script setup lang="ts">
import { Tabs } from '@vuetify/v0';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import UiTabTrigger from './UiTabTrigger.vue';
import type { RippleOptions } from './ripple';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
    items: readonly { id: string; label: string; disabled?: boolean; icon?: string }[];
    idPrefix: string;
    orientation?: 'horizontal' | 'vertical';
    indicatorSide?: 'start' | 'end';
    variant?: 'soft' | 'underline';
    ripple?: RippleOptions;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
}>(), { orientation: 'horizontal', indicatorSide: 'end', variant: 'underline', ripple: true, rounded: true });
const model = defineModel<string>({ required: true });
const list = ref<HTMLElement>();
const slider = ref<Record<string, string>>({ opacity: '0' });
const ready = ref(false);
let observer: ResizeObserver | undefined;
function measure() {
    const host = list.value;
    const active = host?.querySelector<HTMLButtonElement>('button[aria-selected="true"]');
    if (!host || !active || !host.clientWidth) { slider.value = { opacity: '0' }; return; }
    slider.value = props.orientation === 'vertical'
        ? { opacity: '1', height: `${active.offsetHeight}px`, transform: `translateY(${active.offsetTop}px)` }
        : { opacity: '1', width: `${active.offsetWidth}px`, transform: `translateX(${active.offsetLeft}px)` };
}
async function sync() {
    await nextTick();
    observer?.disconnect();
    if (list.value) {
        observer?.observe(list.value);
        list.value.querySelectorAll('button').forEach((button) => observer?.observe(button));
    }
    measure();
}
watch([model, () => props.orientation, () => props.items], sync, { deep: true });
onMounted(async () => {
    observer = new ResizeObserver(measure);
    await sync();
    requestAnimationFrame(() => { ready.value = true; });
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
    <Tabs.Root v-model="model" :orientation="orientation" activation="automatic" circular>
        <Tabs.List v-slot="{ attrs }" :label="$attrs['aria-label'] as string" renderless>
            <div ref="list" v-bind="{ ...attrs, ...$attrs }" class="ui-tabs" :class="{ 'is-dense': dense, 'is-ghost': ghost, 'is-square': !rounded }" :data-variant="variant" :data-ready="ready" :data-indicator-side="indicatorSide">
                <UiTabTrigger v-for="item in items" :key="item.id" :item="item" :id-prefix="idPrefix" :ripple="ripple"><slot :item="item">{{ item.label }}</slot></UiTabTrigger>
                <span v-if="variant === 'underline'" class="ui-tabs-slider" :style="slider" aria-hidden="true"></span>
            </div>
        </Tabs.List>
    </Tabs.Root>
</template>

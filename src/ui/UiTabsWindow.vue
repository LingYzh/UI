<script setup lang="ts">
import { computed, inject, onMounted, onUpdated, provide, ref, shallowReactive, useId } from 'vue';
import { tabsKey, tabsWindowKey, tabToken, type TabValue } from './tabs';

const props = defineProps<{ idPrefix?: string }>();
const model = defineModel<TabValue | null | undefined>();
const tabs = inject(tabsKey, undefined);
const uid = `ui-tabs-window-${useId()}`;
const element = ref<HTMLElement>();
const adjacentPrefix = ref<string>();
const adjacentLegacy = ref(false);
const prefix = computed(() => props.idPrefix ?? tabs?.prefix.value ?? adjacentPrefix.value ?? uid);
const selected = computed(() => model.value !== undefined ? model.value : tabs?.model.value);
const entries = shallowReactive<{ id: string }[]>([]);
provide(tabsWindowKey, { prefix, model: selected, entries, token: value => tabs?.token(value) ?? (adjacentLegacy.value ? String(value) : tabToken(value)) });
onUpdated(() => {
    const order = Array.from(element.value?.querySelectorAll<HTMLElement>(':scope > [data-ui-panel]') ?? []).map(panel => panel.dataset.uiPanel);
    const sorted = [...entries].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    if (sorted.some((entry, index) => entries[index] !== entry)) entries.splice(0, entries.length, ...sorted);
});
onMounted(() => {
    if (tabs) return;
    if (props.idPrefix) {
        const list = Array.from(document.querySelectorAll('[data-ui-tabs-prefix]')).find(list => list.getAttribute('data-ui-tabs-prefix') === props.idPrefix);
        adjacentLegacy.value = list?.getAttribute('data-ui-tabs-legacy') === 'true';
        return;
    }
    // Adjacent Tabs/Window is the usual sibling composition; nested windows use injection.
    let previous = element.value?.previousElementSibling;
    while (previous) {
        const list = previous.matches('[data-ui-tabs-prefix]') ? previous : previous.querySelector('[data-ui-tabs-prefix]');
        if (list) { adjacentPrefix.value = list.getAttribute('data-ui-tabs-prefix') ?? undefined; adjacentLegacy.value = list.getAttribute('data-ui-tabs-legacy') === 'true'; break; }
        previous = previous.previousElementSibling;
    }
});
defineExpose({ element });
</script>

<template><div ref="element" class="ui-tabs-window"><slot /></div></template>

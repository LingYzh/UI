<script setup lang="ts">
import { computed, ref } from 'vue';
import { isNestedControlEvent } from './action-events';
import { useNestedLinkGuard, useUiLink, type RouterProps } from './router';

defineOptions({ inheritAttrs: false });
const props = defineProps<RouterProps & { tag?: string }>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const element = ref<HTMLElement>();
const link = useUiLink(props);
const tag = computed(() => props.tag ?? (link.isLink.value ? 'a' : 'div'));
const captureClick = useNestedLinkGuard(element, () => link.href.value, () => !!props.disabled);
function click(event: MouseEvent) {
    if (props.disabled) { event.preventDefault(); return; }
    if (isNestedControlEvent(event, element.value)) return;
    emit('click', event);
    link.navigate(event);
}
defineExpose({ element });
</script>

<template>
    <component :is="tag" ref="element" v-bind="$attrs" :href="props.disabled ? undefined : link.href.value" :aria-current="link.isActive.value ? 'page' : undefined" :aria-disabled="props.disabled || $attrs['aria-disabled'] || undefined" @click.capture="captureClick" @click="click"><slot /></component>
</template>

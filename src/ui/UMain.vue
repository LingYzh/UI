<script setup lang="ts">
import { computed } from 'vue';
import { useAppLayout } from './layout-completion';
import { useDefaults } from './defaults';
import { dimensionStyles, type DimensionProps } from './dimensions';
const rawProps = withDefaults(defineProps<DimensionProps & { tag?: string; scrollable?: boolean }>(), { tag: 'main' });
const props = useDefaults(rawProps, 'UMain');
const layout = useAppLayout();
const style = computed(() => {
    const offsets = layout?.offsets.value ?? { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        '--ui-app-top': `${offsets.top}px`,
        '--ui-app-right': `${offsets.right}px`,
        '--ui-app-bottom': `${offsets.bottom}px`,
        '--ui-app-left': `${offsets.left}px`,
        ...dimensionStyles(props)
    };
});
</script>

<template>
    <component :is="props.tag" class="ui-main" :class="{ 'is-scrollable': props.scrollable }" :style="style">
        <div v-if="props.scrollable" class="ui-main-scroller"><slot /></div>
        <slot v-else />
    </component>
</template>

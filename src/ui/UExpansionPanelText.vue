<script setup lang="ts">
import UTransition from './UTransition.vue';
import { computed, inject, ref, watch } from 'vue';
import { expansionPanelKey } from './expansion-state';
const props = withDefaults(defineProps<{ eager?: boolean }>(), { eager: undefined });
const panel = inject(expansionPanelKey, undefined);
const isOpen = computed(() => panel?.open() ?? false);
const eager = computed(() => props.eager ?? panel?.eager?.() ?? false);
const hasContent = ref(eager.value || isOpen.value);
watch([eager, isOpen], ([isEager, open]) => {
    if (isEager || open) hasContent.value = true;
});
function afterLeave(): void {
    if (!eager.value && !isOpen.value) hasContent.value = false;
}
</script>
<template>
    <UTransition variant="expand" @after-leave="afterLeave">
        <div v-if="hasContent" v-show="isOpen" :id="panel?.textId" class="u-expansion-text" role="region" :aria-labelledby="panel?.titleId" :aria-hidden="!isOpen || undefined"><slot /></div>
    </UTransition>
</template>

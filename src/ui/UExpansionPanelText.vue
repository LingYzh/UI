<script setup lang="ts">
import UTransition from './UTransition.vue';
import { inject } from 'vue';
import { expansionPanelKey } from './expansion-state';
const panel = inject(expansionPanelKey, undefined);
</script>
<template>
    <UTransition variant="expand"><div v-if="panel?.open()" :id="panel?.textId" class="u-expansion-text" role="region" :aria-labelledby="panel?.titleId"><slot /></div></UTransition>
</template>

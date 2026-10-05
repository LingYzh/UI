<script setup lang="ts">
import { inject } from 'vue';
import { expansionPanelKey } from './expansion-state';
import { vPointerBlur } from './pointer-focus';
const panel = inject(expansionPanelKey, undefined);
</script>
<template>
    <button :id="panel?.titleId" v-pointer-blur type="button" class="u-expansion-title" :aria-expanded="panel?.open() ?? false" :aria-controls="panel?.textId" :disabled="panel?.disabled()" @click="panel?.toggle()"><span><slot :expanded="panel?.open()" /></span><span class="u-expansion-chevron" aria-hidden="true">⌄</span></button>
</template>

<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { inject } from 'vue';
import Icon from '../components/Icon.vue';
import { expansionPanelKey } from './expansion-state';
import { vPointerBlur } from './pointer-focus';
const props = withDefaults(defineProps<{ ripple?: RippleOptions }>(), { ripple: true });
const panel = inject(expansionPanelKey, undefined);
</script>
<template>
    <button v-ripple="props.ripple" :id="panel?.titleId" v-pointer-blur type="button" class="u-expansion-title" :aria-expanded="panel?.open() ?? false" :aria-controls="panel?.textId" :disabled="panel?.disabled()" @click="panel?.toggle()"><span><slot :expanded="panel?.open()" /></span><Icon name="mdi-chevron-down" :size="18" class="ui-disclosure-icon is-down" :class="{ 'is-open': panel?.open() }" /></button>
</template>

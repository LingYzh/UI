<script setup lang="ts">
import { vPointerBlur } from './pointer-focus';
import { Tabs } from '@vuetify/v0';
import { ref } from 'vue';
import { vRipple, type RippleOptions } from './ripple';
defineProps<{ item: { id: string; disabled?: boolean }; idPrefix: string; ripple?: RippleOptions }>();
const element = ref<HTMLButtonElement>();
</script>

<template>
    <!-- v0 owns selection and keyboard focus; UAH keeps stable sibling-panel IDs. -->
    <Tabs.Item v-slot="{ attrs }" :id="item.id" :value="item.id" :disabled="item.disabled" :el="element" renderless>
        <button v-pointer-blur ref="element" v-ripple="ripple" v-bind="attrs" :id="`${idPrefix}-tab-${item.id}`" :aria-controls="`${idPrefix}-panel-${item.id}`"><slot /></button>
    </Tabs.Item>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue';
import { useDefaults } from './defaults';
import UStepperActions from './UStepperActions.vue';

defineOptions({ inheritAttrs: false });

const rawProps = defineProps<{
    prevText?: string;
    nextText?: string;
    color?: string;
    disabled?: boolean | 'prev' | 'next';
}>();
const props = useDefaults(rawProps, 'UStepperVerticalActions');
const attrs = useAttrs();
const emit = defineEmits<{ 'click:prev': [event?: MouseEvent]; 'click:next': [event?: MouseEvent]; 'click:finish': [] }>();

function forwardPrev(event?: MouseEvent): void { emit('click:prev', event); }
function forwardNext(event?: MouseEvent): void { emit('click:next', event); }
function forwardFinish(): void { emit('click:finish'); }
</script>

<template>
    <UStepperActions
        v-bind="{ ...props, ...attrs }"
        @click:prev="forwardPrev"
        @click:next="forwardNext"
        @click:finish="forwardFinish"
    >
        <template v-if="$slots.default" #default="scope"><slot v-bind="scope" /></template>
        <template v-if="$slots.prev" #prev="scope"><slot name="prev" v-bind="scope" /></template>
        <template v-if="$slots.next" #next="scope"><slot name="next" v-bind="scope" /></template>
    </UStepperActions>
</template>

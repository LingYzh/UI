<script setup lang="ts">
import { computed } from 'vue';
import { useDefaults } from './defaults';
import UiMaybeTransition, { type UiTransition } from './UiMaybeTransition.vue';
const rawProps = withDefaults(defineProps<{
    value?: number | string;
    max?: number | string;
    active?: boolean;
    disabled?: boolean;
    transition?: UiTransition;
    /** 保留字符串长度统计；value 模式直接显示字符串，与标准 Counter 一致。 */
    displayMode?: 'length' | 'value';
}>(), { value: 0, active: true, displayMode: 'length' });
const props = useDefaults(rawProps, 'UCounter');
const count = computed(() => typeof props.value === 'number' || props.displayMode === 'value' ? props.value : [...props.value].length);
const counter = computed(() => props.max === undefined ? String(count.value) : `${count.value} / ${props.max}`);
const over = computed(() => !props.disabled && props.max !== undefined && parseFloat(String(count.value)) > parseFloat(String(props.max)));
</script>

<template>
    <UiMaybeTransition :transition="props.transition">
        <span v-if="props.active" class="ui-counter" :class="{ 'is-over': over }" :aria-label="props.displayMode === 'value' ? counter : props.max === undefined ? `${count} characters` : `${count} of ${props.max} characters`">
            <slot :counter="counter" :max="props.max" :value="props.value">{{ counter }}</slot>
        </span>
    </UiMaybeTransition>
</template>

<script setup lang="ts">
import { useDefaults } from './defaults';
import { computed } from 'vue';
import UiMaybeTransition, { type UiTransition } from './UiMaybeTransition.vue';
const rawProps = withDefaults(defineProps<{
    messages?: string | readonly string[];
    error?: boolean;
    id?: string;
    active?: boolean;
    color?: string;
    transition?: UiTransition;
}>(), { error: false, active: true });
const props = useDefaults(rawProps, 'UMessages');
const messages = computed(() => typeof props.messages === 'string' ? props.messages ? [props.messages] : [] : props.messages ?? []);
const textColor = computed(() => props.color && /^[a-z][\w-]*$/i.test(props.color) ? `var(--ui-theme-${props.color}, ${props.color})` : props.color);
</script>

<template>
    <div class="ui-messages" :class="{ 'is-error': props.error }" :id="props.id" :style="{ color: textColor }" :role="props.error ? 'alert' : 'status'">
        <UiMaybeTransition :transition="props.transition">
            <div v-if="props.active" class="ui-messages-content">
                <slot>
                    <span v-for="(message, index) in messages" :key="`${index}-${message}`">
                        <slot name="message" :message="message">{{ message }}</slot>
                    </span>
                </slot>
            </div>
        </UiMaybeTransition>
    </div>
</template>

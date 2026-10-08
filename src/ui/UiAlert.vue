<script setup lang="ts">
import { computed } from 'vue';
import { useDefaults } from './defaults';
import UiButton from './UiButton.vue';
const rawProps = withDefaults(defineProps<{
    tone?: 'info' | 'success' | 'warning' | 'error';
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    text?: string;
    closable?: boolean;
    closeLabel?: string;
    dense?: boolean;
}>(), { tone: 'info', dense: false });
const props = useDefaults(rawProps, 'UAlert');
const shown = defineModel<boolean>({ default: true });
const emit = defineEmits<{ 'click:close': [event: MouseEvent] }>();
const tone = computed(() => props.type ?? props.tone);
function close(event: MouseEvent) { shown.value = false; emit('click:close', event); }
</script>

<template>
    <!-- error 使用 alert 立即播报，其余使用 status；宿主可透传 role 覆盖（例如静态说明用 note）。 -->
    <div v-if="shown" class="ui-alert" :class="{ 'is-dense': props.dense }" :data-tone="tone" :role="tone === 'error' ? 'alert' : 'status'">
        <span class="ui-alert-icon" aria-hidden="true">
            <slot name="prepend"><slot name="icon"><span class="ui-alert-mark">{{ tone === 'success' ? '✓' : tone === 'info' ? 'i' : '!' }}</span></slot></slot>
        </span>
        <div class="ui-alert-body">
            <p v-if="props.title || $slots.title" class="ui-alert-title"><slot name="title">{{ props.title }}</slot></p>
            <div v-if="$slots.default || $slots.text || props.text" class="ui-alert-text"><slot name="text">{{ props.text }}</slot><slot /></div>
        </div>
        <div v-if="$slots.actions" class="ui-alert-actions"><slot name="actions" /></div>
        <slot name="append" />
        <slot v-if="props.closable" name="close" :props="{ onClick: close, 'aria-label': props.closeLabel ?? '关闭提示' }"><UiButton size="small" variant="text" icon :aria-label="props.closeLabel ?? '关闭提示'" @click="close">×</UiButton></slot>
    </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    tone?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    dense?: boolean;
}>(), { tone: 'info', dense: false });
</script>

<template>
    <!-- error 使用 alert 立即播报，其余使用 status；宿主可透传 role 覆盖（例如静态说明用 note）。 -->
    <div class="ui-alert" :class="{ 'is-dense': dense }" :data-tone="tone" :role="tone === 'error' ? 'alert' : 'status'">
        <span class="ui-alert-icon" aria-hidden="true">
            <slot name="icon"><span class="ui-alert-mark">{{ tone === 'success' ? '✓' : tone === 'info' ? 'i' : '!' }}</span></slot>
        </span>
        <div class="ui-alert-body">
            <p v-if="title" class="ui-alert-title">{{ title }}</p>
            <div v-if="$slots.default" class="ui-alert-text"><slot /></div>
        </div>
        <div v-if="$slots.actions" class="ui-alert-actions"><slot name="actions" /></div>
    </div>
</template>

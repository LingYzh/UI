<script setup lang="ts">
import { computed, provide } from 'vue';
import { createLocale, useLocale, type LocaleOptions } from './locale-context';
import { localeKey } from './locale';
const props = withDefaults(defineProps<LocaleOptions & { tag?: string }>(), { tag: 'div' });
const parent = useLocale();
const source = computed(() => props.locale ?? parent.current.value);
const locale = computed(() => createLocale({ fallback: props.fallback, messages: props.messages, rtl: props.rtl }, source));
provide(localeKey, { current: source, isRtl: computed(() => locale.value.isRtl.value), t: (key, params) => locale.value.t(key, params), n: (value, options) => locale.value.n(value, options) });
</script>

<template><component :is="props.tag" :dir="locale.isRtl.value ? 'rtl' : 'ltr'" :lang="source"><slot /></component></template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import UiButton from './UiButton.vue';
import Icon from '../components/Icon.vue';
import { positiveInteger } from './table';
import { uiText } from './locale';
import type { RippleOptions } from './ripple';
const props = withDefaults(
    defineProps<{
        length: number;
        totalVisible?: number;
        disabled?: boolean;
        dense?: boolean;
        ghost?: boolean;
        rounded?: boolean;
        label?: string;
        prevIcon?: string;
        nextIcon?: string;
        prevLabel?: string;
        nextLabel?: string;
        color?: string;
        ripple?: RippleOptions;
    }>(),
    { ripple: true, totalVisible: 5, rounded: true, label: undefined }
);
const model = defineModel<number>({ default: 1 });
const count = computed(() => positiveInteger(props.length));
const current = computed(() => Math.min(count.value, positiveInteger(model.value)));
watch(
    [model, count],
    () => {
        if (current.value !== model.value) model.value = current.value;
    },
    { immediate: true }
);
const entries = computed(() => {
    const visible = Math.min(9, Math.max(3, positiveInteger(props.totalVisible, 5)));
    const start = Math.max(
        1,
        Math.min(current.value - Math.floor(visible / 2), count.value - visible + 1)
    );
    const end = Math.min(count.value, start + visible - 1);
    const result: (number | string)[] = [];
    if (start > 1) {
        result.push(1);
        if (start > 2) result.push('before');
    }
    for (let page = start; page <= end; page++) result.push(page);
    if (end < count.value) {
        if (end < count.value - 1) result.push('after');
        result.push(count.value);
    }
    return result;
});
function select(page: number) {
    if (!props.disabled) model.value = Math.max(1, Math.min(count.value, page));
}
</script>

<template>
    <nav
        class="ui-pagination"
        :class="{ 'is-dense': dense }"
        :aria-label="label ?? uiText('pagination.label')"
    >
        <UiButton
            :ripple="props.ripple"
            icon
            :dense="dense"
            :ghost="ghost"
            :rounded="rounded"
            :disabled="disabled || current === 1"
            :aria-label="
                props.prevLabel && !props.prevLabel.startsWith('$vuetify.')
                    ? props.prevLabel
                    : uiText('pagination.previous')
            "
            @click="select(current - 1)"
        >
            <Icon :name="props.prevIcon ?? 'mdi-chevron-left'" :size="16" />
        </UiButton>
        <template v-for="entry in entries" :key="entry">
            <UiButton
                :ripple="props.ripple"
                v-if="typeof entry === 'number'"
                :dense="dense"
                :variant="entry === current ? 'flat' : 'outlined'"
                :color="entry === current ? (props.color ?? 'primary') : undefined"
                :ghost="ghost && entry !== current"
                :rounded="rounded"
                :disabled="disabled"
                :aria-label="uiText('pagination.page', { page: entry })"
                :aria-current="entry === current ? 'page' : undefined"
                @click="select(entry)"
            >
                {{ entry }}
            </UiButton>
            <span v-else class="ui-pagination-ellipsis" aria-hidden="true">…</span>
        </template>
        <UiButton
            :ripple="props.ripple"
            icon
            :dense="dense"
            :ghost="ghost"
            :rounded="rounded"
            :disabled="disabled || current === count"
            :aria-label="
                props.nextLabel && !props.nextLabel.startsWith('$vuetify.')
                    ? props.nextLabel
                    : uiText('pagination.next')
            "
            @click="select(current + 1)"
        >
            <Icon :name="props.nextIcon ?? 'mdi-chevron-right'" :size="16" />
        </UiButton>
    </nav>
</template>

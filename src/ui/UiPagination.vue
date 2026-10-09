<script setup lang="ts">
import { computed, nextTick, ref, useModel, watch } from 'vue';
import UiButton from './UiButton.vue';
import Icon from '../components/Icon.vue';
import type { IconValue } from './icon-config';
import { positiveInteger } from './table';
import { useLocale } from './locale-context';
import type { RippleOptions } from './ripple';

type PageEntry = {
    key: number | string;
    page: string;
    value?: number;
    isActive: boolean;
    ellipsis: boolean;
    props: Record<string, unknown>;
};

type ControlName = 'first' | 'prev' | 'next' | 'last';
type ControlSlotProps = {
    icon: IconValue;
    disabled: boolean;
    'aria-label': string;
    'aria-disabled': boolean;
    onClick: (event: Event) => void;
};

const props = withDefaults(defineProps<{
    length: number | string;
    modelValue?: number;
    start?: number | string;
    totalVisible?: number | string;
    disabled?: boolean;
    dense?: boolean;
    ghost?: boolean;
    rounded?: boolean;
    label?: string;
    prevIcon?: IconValue;
    nextIcon?: IconValue;
    firstIcon?: IconValue;
    lastIcon?: IconValue;
    prevLabel?: string;
    nextLabel?: string;
    ariaLabel?: string;
    pageAriaLabel?: string;
    currentPageAriaLabel?: string;
    firstAriaLabel?: string;
    previousAriaLabel?: string;
    nextAriaLabel?: string;
    lastAriaLabel?: string;
    ellipsis?: string;
    showFirstLastPage?: boolean | 'only-first';
    tag?: string;
    color?: string;
    ripple?: RippleOptions;
}>(), {
    ripple: true,
    start: 1,
    totalVisible: 5,
    rounded: true,
    label: undefined,
    tag: 'nav',
    ellipsis: '…',
    showFirstLastPage: false
});

const emit = defineEmits<{
    'update:modelValue': [page: number];
    first: [page: number];
    prev: [page: number];
    next: [page: number];
    last: [page: number];
}>();
const model = useModel(props, 'modelValue');
const locale = useLocale();
const root = ref<HTMLElement>();
const integerValue = (value: string | number | undefined, fallback: number) => {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const startPage = computed(() => integerValue(props.start, 1));
const count = computed(() => positiveInteger(Number(props.length), 1));
const endPage = computed(() => startPage.value + count.value - 1);
const current = computed(() => {
    const requested = model.value ?? startPage.value;
    return Math.max(startPage.value, Math.min(endPage.value, integerValue(requested, startPage.value)));
});

watch([model, startPage, endPage], () => {
    if (model.value !== undefined && model.value !== current.value) model.value = current.value;
}, { immediate: true });

const entries = computed(() => {
    const visibleLimit = Math.min(9, Math.max(3, positiveInteger(Number(props.totalVisible), 5)));
    const visible = Math.min(count.value, visibleLimit);
    const first = Math.max(startPage.value, Math.min(current.value - Math.floor(visible / 2), endPage.value - visible + 1));
    const last = Math.min(endPage.value, first + visible - 1);
    const result: Array<number | 'before' | 'after'> = [];

    if (first > startPage.value) {
        result.push(startPage.value);
        if (first > startPage.value + 1) result.push('before');
    }
    for (let page = first; page <= last; page++) result.push(page);
    if (last < endPage.value) {
        if (last < endPage.value - 1) result.push('after');
        result.push(endPage.value);
    }
    return result;
});

function labelText(value: string | undefined, fallbackKey: string, params?: Record<string, string | number>): string {
    if (value === undefined) return locale.t(fallbackKey, params);
    return value.startsWith('$vuetify.') ? locale.t(value, params) : value;
}

const navLabel = computed(() => labelText(props.label ?? props.ariaLabel, 'pagination.label'));
const previousLabel = computed(() => labelText(props.prevLabel ?? props.previousAriaLabel, 'pagination.previous'));
const nextLabel = computed(() => labelText(props.nextLabel ?? props.nextAriaLabel, 'pagination.next'));

function select(page: number): boolean {
    if (props.disabled) return false;
    const value = Math.max(startPage.value, Math.min(endPage.value, page));
    if (value === current.value) return false;
    model.value = value;
    return true;
}

function pageEntry(entry: number | 'before' | 'after', index: number): PageEntry {
    if (typeof entry !== 'number') {
        return {
            key: `ellipsis-${entry}-${index}`,
            page: props.ellipsis,
            isActive: false,
            ellipsis: true,
            props: { disabled: true, 'aria-hidden': true }
        };
    }

    const isActive = entry === current.value;
    const pageLabel = labelText(isActive ? props.currentPageAriaLabel : props.pageAriaLabel,
        isActive ? 'pagination.currentPage' : 'pagination.page', { page: entry });
    const onClick = (event?: Event) => {
        event?.preventDefault();
        select(entry);
    };
    return {
        key: entry,
        page: locale.n(entry),
        value: entry,
        isActive,
        ellipsis: false,
        props: {
            disabled: props.disabled,
            icon: true,
            'aria-current': isActive ? 'page' : undefined,
            'aria-label': pageLabel,
            onClick
        }
    };
}

const pageItems = computed(() => entries.value.map(pageEntry));

function createControl(name: ControlName): ControlSlotProps {
    const rtl = locale.isRtl.value;
    const target = name === 'first' ? startPage.value
        : name === 'prev' ? current.value - 1
            : name === 'next' ? current.value + 1
                : endPage.value;
    const disabled = props.disabled || (name === 'first' || name === 'prev'
        ? current.value <= startPage.value
        : current.value >= endPage.value);
    const icon = name === 'first' ? (rtl ? props.lastIcon ?? '$last' : props.firstIcon ?? '$first')
        : name === 'prev' ? (rtl ? props.nextIcon ?? '$next' : props.prevIcon ?? '$prev')
            : name === 'next' ? (rtl ? props.prevIcon ?? '$prev' : props.nextIcon ?? '$next')
                : (rtl ? props.firstIcon ?? '$first' : props.lastIcon ?? '$last');
    const ariaLabel = name === 'first' ? labelText(props.firstAriaLabel, 'pagination.first')
        : name === 'prev' ? previousLabel.value
            : name === 'next' ? nextLabel.value
                : labelText(props.lastAriaLabel, 'pagination.last');

    return {
        icon,
        disabled,
        'aria-label': ariaLabel,
        'aria-disabled': disabled,
        onClick(event: Event) {
            event.preventDefault();
            if (disabled || !select(target)) return;
            if (name === 'first') emit('first', target);
            else if (name === 'prev') emit('prev', target);
            else if (name === 'next') emit('next', target);
            else emit('last', target);
        }
    };
}

const firstControl = computed(() => props.showFirstLastPage === true || props.showFirstLastPage === 'only-first'
    ? createControl('first') : undefined);
const prevControl = computed(() => createControl('prev'));
const nextControl = computed(() => createControl('next'));
const lastControl = computed(() => props.showFirstLastPage === true ? createControl('last') : undefined);

function focusPage(page: number) {
    void nextTick(() => root.value?.querySelector<HTMLElement>(`[data-pagination-page="${page}"]`)?.focus());
}

function onKeydown(event: KeyboardEvent) {
    if (props.disabled || event.target instanceof HTMLElement && (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))) return;
    const rtl = locale.isRtl.value;
    const target = event.key === 'Home' ? startPage.value
        : event.key === 'End' ? endPage.value
            : event.key === 'ArrowLeft' ? current.value + (rtl ? 1 : -1)
                : event.key === 'ArrowRight' ? current.value + (rtl ? -1 : 1)
                    : undefined;
    if (target === undefined || target < startPage.value || target > endPage.value || !select(target)) return;
    event.preventDefault();
    focusPage(target);
}
</script>

<template>
    <component
        :is="props.tag"
        ref="root"
        class="ui-pagination"
        :class="{ 'is-dense': dense }"
        role="navigation"
        :aria-label="navLabel"
        @keydown="onKeydown"
    >
        <template v-if="firstControl">
            <slot name="first" v-bind="firstControl">
                <UiButton
                    :ripple="props.ripple"
                    icon
                    :dense="dense"
                    :ghost="ghost"
                    :rounded="rounded"
                    :disabled="firstControl.disabled"
                    :aria-label="firstControl['aria-label']"
                    :aria-disabled="firstControl['aria-disabled']"
                    @click="firstControl.onClick"
                >
                    <Icon :icon="firstControl.icon" :size="16" />
                </UiButton>
            </slot>
        </template>
        <slot name="prev" v-bind="prevControl">
            <UiButton
                :ripple="props.ripple"
                icon
                :dense="dense"
                :ghost="ghost"
                :rounded="rounded"
                :disabled="prevControl.disabled"
                :aria-label="prevControl['aria-label']"
                :aria-disabled="prevControl['aria-disabled']"
                @click="prevControl.onClick"
            >
                <Icon :icon="prevControl.icon" :size="16" />
            </UiButton>
        </slot>
        <template v-for="item in pageItems" :key="item.key">
            <slot name="item" v-bind="item">
                <UiButton
                    v-if="!item.ellipsis"
                    :data-pagination-page="item.value"
                    :ripple="props.ripple"
                    :dense="dense"
                    :variant="item.isActive ? 'flat' : 'outlined'"
                    :color="item.isActive ? (props.color ?? 'primary') : undefined"
                    :ghost="ghost && !item.isActive"
                    :rounded="rounded"
                    :disabled="Boolean(item.props.disabled)"
                    :aria-label="String(item.props['aria-label'])"
                    :aria-current="item.props['aria-current'] as string | undefined"
                    @click="item.value && select(item.value)"
                >
                    {{ item.page }}
                </UiButton>
                <span v-else class="ui-pagination-ellipsis" aria-hidden="true">{{ item.page }}</span>
            </slot>
        </template>
        <slot name="next" v-bind="nextControl">
            <UiButton
                :ripple="props.ripple"
                icon
                :dense="dense"
                :ghost="ghost"
                :rounded="rounded"
                :disabled="nextControl.disabled"
                :aria-label="nextControl['aria-label']"
                :aria-disabled="nextControl['aria-disabled']"
                @click="nextControl.onClick"
            >
                <Icon :icon="nextControl.icon" :size="16" />
            </UiButton>
        </slot>
        <template v-if="lastControl">
            <slot name="last" v-bind="lastControl">
                <UiButton
                    :ripple="props.ripple"
                    icon
                    :dense="dense"
                    :ghost="ghost"
                    :rounded="rounded"
                    :disabled="lastControl.disabled"
                    :aria-label="lastControl['aria-label']"
                    :aria-disabled="lastControl['aria-disabled']"
                    @click="lastControl.onClick"
                >
                    <Icon :icon="lastControl.icon" :size="16" />
                </UiButton>
            </slot>
        </template>
    </component>
</template>

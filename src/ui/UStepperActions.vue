<script setup lang="ts">
import UiButton from './UiButton.vue';
import { useDefaults } from './defaults';
import { computed, inject } from 'vue';
import { stepperContextKey } from './stepper-state';
import { useLocale } from './locale-context';

type ActionDisabled = boolean | 'prev' | 'next';

const rawProps = withDefaults(defineProps<{
    prevText?: string;
    nextText?: string;
    color?: string;
    disabled?: ActionDisabled;
}>(), { prevText: '$vuetify.stepper.prev', nextText: '$vuetify.stepper.next', color: 'primary', disabled: false });
const props = useDefaults(rawProps, 'UStepperActions');
const emit = defineEmits<{ 'click:prev': [event?: MouseEvent]; 'click:next': [event?: MouseEvent]; 'click:finish': [] }>();
const stepper = inject(stepperContextKey, undefined);
const locale = useLocale();

function resolveText(value: string): string {
    if (!value.startsWith('$vuetify.')) return value;
    const localized = locale.t(value);
    if (localized !== value) return localized;
    const key = value.slice('$vuetify.'.length);
    const unprefixed = locale.t(key);
    if (unprefixed !== key) return unprefixed;
    // The built-in locale catalog does not define Vuetify's stepper keys.
    if (value === '$vuetify.stepper.prev') return locale.current.value.startsWith('zh') ? '上一步' : 'Previous';
    if (value === '$vuetify.stepper.next') return locale.current.value.startsWith('zh') ? '下一步' : 'Next';
    return value;
}

function handlePrev(event?: MouseEvent): void {
    emit('click:prev', event);
    stepper?.prev();
}

function handleNext(event?: MouseEvent): void {
    emit('click:next', event);
    stepper?.next();
}

const prevDisabled = computed(() => props.disabled === true || props.disabled === 'prev' || !!stepper?.disabled);
const nextDisabled = computed(() => props.disabled === true || props.disabled === 'next' || !!stepper?.disabled);
const prevProps = computed(() => ({ onClick: handlePrev, disabled: prevDisabled.value }));
const nextProps = computed(() => ({ onClick: handleNext, disabled: nextDisabled.value, color: props.color }));
</script>

<template>
    <div class="u-stepper-actions">
        <slot :prev="handlePrev" :next="handleNext" :prev-props="prevProps" :next-props="nextProps">
            <slot name="prev" :props="prevProps" :prev="handlePrev">
                <UiButton v-bind="prevProps" variant="text">{{ resolveText(props.prevText) }}</UiButton>
            </slot>
            <slot name="next" :props="nextProps" :next="handleNext">
                <UiButton v-bind="nextProps" variant="flat">{{ resolveText(props.nextText) }}</UiButton>
            </slot>
        </slot>
    </div>
</template>

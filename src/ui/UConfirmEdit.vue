<script setup lang="ts">
import { computed, h, ref, watch, type VNode } from "vue";
import { useDefaults } from "./defaults";
import { useLocale } from "./locale-context";
import { cloneEditValue, equalEditValues } from "./confirm-edit";
import UiButton from "./UiButton.vue";
const rawProps = withDefaults(
    defineProps<{
        disabled?: boolean | ("save" | "cancel")[];
        readonly?: boolean;
        validate?: (value: unknown) => boolean | Promise<boolean>;
        cancelText?: string;
        okText?: string;
        hideActions?: boolean;
        color?: string;
    }>(),
    { disabled: undefined },
);
const props = useDefaults(rawProps, "UConfirmEdit");
type EditValue = string | number | boolean | object | null | undefined;
const model = defineModel<EditValue>({ default: null });
const emit = defineEmits<{ save: [value: unknown]; cancel: [] }>();
const locale = useLocale();
const saving = ref(false);
const draft = ref<EditValue>();
let revision = 0;
let actionsUsed = false;
watch(
    model,
    (value) => {
        revision++;
        draft.value = cloneEditValue(value);
    },
    { deep: true, immediate: true, flush: "sync" },
);
const isPristine = computed(() => equalEditValues(model.value, draft.value));
function actionDisabled(action: "save" | "cancel"): boolean {
    if (saving.value || props.readonly) return true;
    if (typeof props.disabled === "boolean") return props.disabled;
    if (Array.isArray(props.disabled)) return props.disabled.includes(action);
    return isPristine.value;
}
/** Compatibility helper: reset the always-visible draft to the latest model. */
function begin(): void {
    if (saving.value || props.readonly || props.disabled === true) return;
    revision++;
    draft.value = cloneEditValue(model.value);
}
async function save(): Promise<void> {
    if (actionDisabled("save")) return;
    const generation = revision;
    const value = cloneEditValue(draft.value);
    saving.value = true;
    try {
        if (props.validate && !(await props.validate(value))) return;
        if (
            generation !== revision ||
            props.readonly ||
            props.disabled === true ||
            (Array.isArray(props.disabled) && props.disabled.includes("save"))
        )
            return;
        model.value = value;
        draft.value = cloneEditValue(value);
        emit("save", value);
    } finally {
        saving.value = false;
    }
}
function cancel(): void {
    if (actionDisabled("cancel")) return;
    revision++;
    draft.value = cloneEditValue(model.value);
    emit("cancel");
}
function text(value: string | undefined, fallback: string): string {
    return value === undefined
        ? locale.t(fallback)
        : value.startsWith("$vuetify.")
          ? locale.t(value)
          : value;
}
function actions(actionProps: Record<string, unknown> = {}): VNode[] {
    return [
        h(
            UiButton,
            {
                variant: "text",
                color: props.color,
                disabled: actionDisabled("cancel"),
                onClick: cancel,
                ...actionProps,
            },
            () => text(props.cancelText, "common.cancel"),
        ),
        h(
            UiButton,
            {
                variant: "flat",
                color: props.color ?? "primary",
                disabled: actionDisabled("save"),
                loading: saving.value,
                onClick: save,
                ...actionProps,
            },
            () => text(props.okText, "common.confirm"),
        ),
    ];
}
const scope = computed(() => ({
    model: draft,
    draft: draft.value,
    open: true,
    saving: saving.value,
    isPristine: isPristine.value,
    begin,
    save,
    cancel,
    get actions() {
        actionsUsed = true;
        return actions;
    },
}));
defineExpose({ begin, save, cancel, isPristine });
defineSlots<{
    default?: (scope: {
        model: typeof draft;
        draft: EditValue;
        open: boolean;
        saving: boolean;
        isPristine: boolean;
        begin: () => void;
        save: () => Promise<void>;
        cancel: () => void;
        actions: (props?: Record<string, unknown>) => VNode[];
    }) => any;
    activator?: (scope: { open: boolean; begin: () => void }) => any;
}>();
</script>
<template>
    <div class="u-confirm-edit">
        <slot name="activator" :open="true" :begin="begin" />
        <slot v-bind="scope" />
        <div
            v-if="!props.hideActions && !actionsUsed"
            class="u-confirm-actions"
        >
            <UiButton
                variant="text"
                :color="props.color"
                :disabled="actionDisabled('cancel')"
                @click="cancel"
            >
                {{ text(props.cancelText, "common.cancel") }}
            </UiButton>
            <UiButton
                variant="flat"
                :color="props.color ?? 'primary'"
                :disabled="actionDisabled('save')"
                :loading="saving"
                @click="save"
            >
                {{ text(props.okText, "common.confirm") }}
            </UiButton>
        </div>
    </div>
</template>

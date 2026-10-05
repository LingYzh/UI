<script setup lang="ts">
import { useDefaults } from './defaults';
import UiButton from './UiButton.vue';
import { ref, watch } from 'vue';
const rawProps = defineProps<{ disabled?: boolean; readonly?: boolean; validate?: (value: unknown) => boolean | Promise<boolean> }>();
const props = useDefaults(rawProps, 'UConfirmEdit');
type EditValue = string | number | boolean | object | null | undefined;
const model = defineModel<EditValue>({ default: null });
const emit = defineEmits<{ save: [value: unknown]; cancel: [] }>();
const open = ref(false);
const saving = ref(false);
const draft = ref<EditValue>(model.value);
const draftModel = { get value() { return draft.value; }, set value(value: EditValue) { draft.value = value; } };
watch(model, (value) => { if (!open.value) draft.value = value; });
function begin(): void { if (props.disabled || props.readonly || saving.value) return; draft.value = model.value; open.value = true; }
async function save(): Promise<void> {
    if (!open.value || saving.value || props.disabled || props.readonly) return;
    saving.value = true;
    try {
        if (props.validate && !await props.validate(draft.value)) return;
        model.value = draft.value;
        open.value = false;
        emit('save', draft.value);
    } finally { saving.value = false; }
}
function cancel(): void { if (saving.value) return; draft.value = model.value; open.value = false; emit('cancel'); }
defineExpose({ begin, save, cancel });
</script>
<template>
    <div class="u-confirm-edit"><slot name="activator" :open="open" :begin="begin"><UiButton v-if="!open" :disabled="props.disabled || props.readonly" @click="begin">编辑</UiButton></slot><div v-if="open"><slot :open="open" :draft="draft" :model="draftModel" :begin="begin" :save="save" :cancel="cancel" :saving="saving" /><div class="u-confirm-actions"><UiButton variant="ghost" :disabled="saving" @click="cancel">取消</UiButton><UiButton variant="primary" :loading="saving" @click="save">保存</UiButton></div></div></div>
</template>

<script setup lang="ts">
import { useDefaults } from './defaults';
import UTransition from './UTransition.vue';
import UiButton from './UiButton.vue';
import Icon from '../components/Icon.vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
const rawProps = withDefaults(defineProps<{ disabled?: boolean; closeOnClick?: boolean }>(), { closeOnClick: true });
const props = useDefaults(rawProps, 'USpeedDial');
const model = defineModel<boolean>({ default: false });
const root = ref<HTMLElement>();
function setRoot(value: HTMLElement | null): void { root.value = value ?? undefined; }
function open(): void { if (!props.disabled) model.value = true; }
function close(): void { model.value = false; }
function toggle(): void { if (!props.disabled) model.value = !model.value; }
function onKeydown(event: KeyboardEvent): void { if (event.key === 'Escape' && model.value) { event.preventDefault(); close(); } }
function onPointerDown(event: PointerEvent): void { if (model.value && root.value && !root.value.contains(event.target as Node)) close(); }
function onAction(): void { if (props.closeOnClick) close(); }
onMounted(() => { document.addEventListener('pointerdown', onPointerDown); document.addEventListener('keydown', onKeydown); });
onBeforeUnmount(() => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeydown); });
defineExpose({ open, close, toggle });
</script>
<template>
    <div ref="root" class="u-speed-dial"><slot name="activator" :props="{ onClick: toggle, 'aria-expanded': model, 'aria-haspopup': 'menu', disabled: props.disabled }" :open="model" :toggle="toggle"><UiButton :disabled="props.disabled" :aria-expanded="model" aria-label="快捷操作" @click="toggle"><Icon name="mdi-plus" :size="20" class="u-speed-dial-icon" :class="{ 'is-open': model }" /></UiButton></slot><UTransition variant="scale"><div v-if="model" class="u-speed-dial-actions" @click="onAction"><slot :close="close" /></div></UTransition></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import UiButton from './UiButton.vue';
import UiTooltip from './UiTooltip.vue';
import { writeClipboard } from './clipboard';
import { uiText } from './locale';

const props = withDefaults(defineProps<{
    /** 要复制的原始文本；函数形式在点击时才求值，适合较大的内容。 */
    text: string | (() => string);
    label?: string;
    copiedLabel?: string;
    dense?: boolean;
}>(), { dense: true });
const emit = defineEmits<{ copied: [text: string]; error: [error: unknown] }>();
const copied = ref(false);
const announcement = ref('');
let timer: ReturnType<typeof setTimeout> | undefined;
const name = computed(() => props.label ?? uiText('copy.label'));
const doneName = computed(() => props.copiedLabel ?? uiText('common.copied'));

async function copy() {
    const value = typeof props.text === 'function' ? props.text() : props.text;
    try {
        await writeClipboard(value);
        copied.value = true;
        announcement.value = doneName.value;
        clearTimeout(timer);
        // 1.6 秒后恢复复制图标，期间再次点击会重新计时。
        timer = setTimeout(() => { copied.value = false; announcement.value = ''; }, 1600);
        emit('copied', value);
    } catch (error) {
        emit('error', error);
    }
}
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
    <UiTooltip :text="copied ? doneName : name" :focusable="false">
        <UiButton class="ui-copy-button" :class="{ 'is-copied': copied }" icon variant="ghost" :dense="dense" :aria-label="name" @click="copy">
            <svg v-if="copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.5 5 5L19.5 7" /></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V3H3v13h5" /></svg>
        </UiButton>
        <!-- 屏幕阅读器播报复制结果；按钮名称保持“复制”不变，避免焦点下名称跳变。 -->
        <span class="ui-visually-hidden" role="status">{{ announcement }}</span>
    </UiTooltip>
</template>

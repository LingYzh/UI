<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import UiButton from './UiButton.vue';
import UiTooltip from './UiTooltip.vue';
import Icon from '../components/Icon.vue';
import { writeClipboard } from './clipboard';
import { uiText } from './locale';

// 根节点是 Tooltip 的包裹 span，未声明的属性（id、data-*、aria-*）需转给内部按钮。
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
    /** 要复制的原始文本；函数形式在点击时才求值，适合较大的内容。 */
    text: string | (() => string);
    label?: string;
    copiedLabel?: string;
    dense?: boolean;
    disabled?: boolean;
}>(), { dense: true, disabled: false });
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
        <UiButton v-bind="$attrs" class="ui-copy-button" :class="{ 'is-copied': copied }" icon variant="text" :dense="dense" :disabled="disabled" :aria-label="name" @click="copy">
            <Icon :key="copied ? 'copied' : 'copy'" class="ui-copy-button-icon" :icon="copied ? '$complete' : '$copy'" :size="15" />
        </UiButton>
        <!-- 屏幕阅读器播报复制结果；按钮名称保持“复制”不变，避免焦点下名称跳变。 -->
        <span class="ui-visually-hidden" role="status">{{ announcement }}</span>
    </UiTooltip>
</template>

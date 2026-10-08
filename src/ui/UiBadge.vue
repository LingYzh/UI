<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { vPointerBlur } from './pointer-focus';
import { computed, useId } from 'vue';
import { uiText } from './locale';

const props = withDefaults(defineProps<{
    tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'error';
    variant?: 'soft' | 'outline';
    /** 用户自定义颜色（任意 CSS 颜色）；设置后覆盖 tone，底色、边框与文字按主题自动混合。 */
    color?: string;
    dense?: boolean;
    closable?: boolean;
    closeLabel?: string;
} & { ripple?: RippleOptions }>(), { ripple: true, tone: 'neutral', variant: 'soft', dense: false, closable: false });
const emit = defineEmits<{ close: [event: MouseEvent] }>();
const labelId = useId();
const style = computed(() => (props.color ? { '--badge-color': props.color } : undefined));
</script>

<template>
    <span class="ui-badge" :class="[`ui-badge--${variant}`, { 'is-dense': dense, 'has-color': Boolean(color) }]" :data-tone="color ? undefined : tone" :style="style">
        <span v-if="$slots.icon" class="ui-badge-icon"><slot name="icon" /></span>
        <span :id="labelId" class="ui-badge-label"><slot /></span>
        <!-- 关闭按钮名称固定为“移除”，通过 aria-describedby 关联标签文字，读屏可区分列表中的多个标签。 -->
        <slot v-if="closable" name="close" :props="{ onClick: (event: MouseEvent) => emit('close', event), 'aria-label': closeLabel ?? uiText('badge.remove'), 'aria-describedby': labelId }"><button v-ripple="props.ripple" v-pointer-blur
            v-if="closable"
            type="button"
            class="ui-badge-close"
            :aria-label="closeLabel ?? uiText('badge.remove')"
            :aria-describedby="labelId"
            @click="emit('close', $event)"
        >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        </slot>
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UKbd from './UKbd.vue';
import UiThemeProvider from './UiThemeProvider.vue';
import UHotkeyListener from './UHotkeyListener.vue';
import Icon from '../components/Icon.vue';
import { useDefaults } from './defaults';
import { defaultHotkeyMap, formatHotkeys, type HotkeyMap, type HotkeyDisplayMode, type HotkeyPlatform } from './hotkey';
import { borderStyles, roundedStyles } from './appearance';

const rawProps = withDefaults(defineProps<{
    keys?: string;
    displayMode?: HotkeyDisplayMode;
    keyMap?: HotkeyMap;
    platform?: HotkeyPlatform;
    inline?: boolean;
    disabled?: boolean;
    prefix?: string;
    suffix?: string;
    variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain' | 'contained';
    color?: string;
    border?: boolean | string | number;
    rounded?: boolean | string | number;
    elevation?: number | string;
    theme?: string;
    /** 本库监听功能保留；纯快捷键展示可关闭 listen。 */
    listen?: boolean;
    preventDefault?: boolean;
    allowInput?: boolean;
}>(), { displayMode: 'icon', platform: 'auto', variant: 'outlined', listen: true, preventDefault: true, rounded: true });
const props = useDefaults(rawProps, 'UHotkey');
const emit = defineEmits<{ trigger: [event: KeyboardEvent] }>();
const isMac = computed(() => props.platform === 'mac' || props.platform === 'auto' && typeof navigator !== 'undefined' && /macintosh|mac os/i.test(navigator.userAgent));
const combinations = computed(() => formatHotkeys(props.keys, props.displayMode, props.keyMap ?? defaultHotkeyMap, isMac.value));
const accessibleLabel = computed(() => `快捷键 ${combinations.value.map(keys => keys.map(key => key.kind === 'key' ? key.text : key.content).join(' ')).join('，')}`.trim());
const keyStyles = computed(() => ({
    color: props.color && /^[a-z][\w-]*$/i.test(props.color) ? `var(--ui-theme-${props.color}, ${props.color})` : props.color,
    ...borderStyles(props.border),
    ...roundedStyles(props.rounded),
    boxShadow: props.elevation !== undefined ? Number(props.elevation) > 0 ? `0 ${Number(props.elevation) * 2}px ${Number(props.elevation) * 6}px rgb(0 0 0 / .12)` : 'none' : undefined
}));
</script>

<template>
    <UiThemeProvider :theme="props.theme" class="u-hotkey-display" :class="[`is-${props.variant}`, { 'is-inline': props.inline, 'is-disabled': props.disabled, 'is-contained': props.variant === 'contained' }]" role="img" :aria-label="accessibleLabel">
        <UHotkeyListener v-if="props.listen && props.keys" :keys="props.keys" :disabled="props.disabled" :prevent-default="props.preventDefault" :allow-input="props.allowInput"
            @trigger="emit('trigger', $event)">
            <slot :keys="props.keys">
                <span v-if="props.prefix" class="u-hotkey-affix">{{ props.prefix }}</span>
                <span v-for="(combination, index) in combinations" :key="index" class="u-hotkey-combination" aria-hidden="true">
                    <template v-for="(key, keyIndex) in combination" :key="keyIndex">
                        <UKbd v-if="key.kind === 'key'" class="u-hotkey-key" :title="key.mode === 'text' ? undefined : key.text" :style="keyStyles">
                            <Icon v-if="key.mode === 'icon'" :icon="key.content" :size="16" />
                            <template v-else>{{ key.content }}</template>
                        </UKbd>
                        <span v-else class="u-hotkey-divider">{{ key.content }}</span>
                    </template>
                </span>
                <span v-if="props.suffix" class="u-hotkey-affix">{{ props.suffix }}</span>
            </slot>
        </UHotkeyListener>
        <slot v-else :keys="props.keys">
            <span v-if="props.prefix" class="u-hotkey-affix">{{ props.prefix }}</span>
            <span v-for="(combination, index) in combinations" :key="index" class="u-hotkey-combination" aria-hidden="true">
                <template v-for="(key, keyIndex) in combination" :key="keyIndex">
                    <UKbd v-if="key.kind === 'key'" class="u-hotkey-key" :title="key.mode === 'text' ? undefined : key.text" :style="keyStyles">
                        <Icon v-if="key.mode === 'icon'" :icon="key.content" :size="16" />
                        <template v-else>{{ key.content }}</template>
                    </UKbd>
                    <span v-else class="u-hotkey-divider">{{ key.content }}</span>
                </template>
            </span>
            <span v-if="props.suffix" class="u-hotkey-affix">{{ props.suffix }}</span>
        </slot>
    </UiThemeProvider>
</template>

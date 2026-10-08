<script setup lang="ts">
import { vRipple, type RippleOptions } from './ripple';
import { computed, inject } from 'vue';
import Icon from '../components/Icon.vue';
import { expansionPanelKey } from './expansion-state';
import { vPointerBlur } from './pointer-focus';
import { useDefaults } from './defaults';
import { dimensionStyles, type DimensionProps } from './dimensions';
import { buttonColorStyles } from './button-colors';
const rawProps = withDefaults(defineProps<DimensionProps & {
    ripple?: RippleOptions;
    readonly?: boolean;
    hideActions?: boolean;
    expandIcon?: string;
    collapseIcon?: string;
    color?: string;
    focusable?: boolean;
    static?: boolean;
    hover?: boolean;
}>(), { ripple: true, hover: true, focusable: undefined, static: undefined });
const props = useDefaults(rawProps, 'UExpansionPanelTitle');
const panel = inject(expansionPanelKey, undefined);
const readonly = computed(() => props.readonly || (panel as { readonly?: () => boolean } | undefined)?.readonly?.() || false);
const focusable = computed(() => props.focusable ?? panel?.focusable?.() ?? false);
const staticTitle = computed(() => props.static ?? panel?.static?.() ?? false);
const scope = computed(() => ({
    expanded: panel?.open() ?? false, disabled: panel?.disabled() ?? false, readonly: readonly.value,
    expandIcon: props.expandIcon ?? 'mdi-chevron-down', collapseIcon: props.collapseIcon ?? 'mdi-chevron-up'
}));
const icon = computed(() => !props.expandIcon && !props.collapseIcon ? 'mdi-chevron-down' : scope.value.expanded ? scope.value.collapseIcon : scope.value.expandIcon);
</script>
<template>
    <button v-ripple="readonly ? false : props.ripple" :id="panel?.titleId" v-pointer-blur type="button" class="u-expansion-title" :class="{ 'is-static': staticTitle, 'is-focusable': focusable, 'has-hover': props.hover }" :style="[dimensionStyles(props), props.color ? buttonColorStyles(props.color) : undefined]" :aria-expanded="scope.expanded" :aria-controls="panel?.textId" :aria-readonly="readonly || undefined" :disabled="scope.disabled" :tabindex="scope.disabled ? -1 : undefined" @click="!readonly && panel?.toggle()"><span><slot v-bind="scope" /></span><span v-if="!props.hideActions" class="u-expansion-title-actions"><slot name="actions" v-bind="scope"><Icon :name="icon" :size="18" class="ui-disclosure-icon is-down" :class="{ 'is-open': scope.expanded && !props.expandIcon && !props.collapseIcon }" /></slot></span></button>
</template>

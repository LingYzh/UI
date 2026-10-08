<script setup lang="ts">
import { computed, inject, type PropType } from 'vue';
import { breadcrumbsDisabledKey } from './breadcrumbs-completion';
import { useDefaults } from './defaults';
import { useUiLink, type RouterProps } from './router';

const rawProps = defineProps({
    href: String,
    to: [String, Object] as PropType<RouterProps['to']>,
    replace: Boolean,
    exact: Boolean,
    disabled: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    active: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    title: String,
    tag: { type: String, default: 'li' }
});
const props = useDefaults(rawProps, 'UBreadcrumbsItem');
const inheritedDisabled = inject(breadcrumbsDisabledKey, () => false);
const effectiveDisabled = computed(() => rawProps.disabled ?? (inheritedDisabled() || Boolean(props.disabled)));
const link = useUiLink({
    get href() { return props.href; },
    get to() { return props.to; },
    get replace() { return props.replace; },
    get exact() { return props.exact; },
    get disabled() { return effectiveDisabled.value; }
});
</script>

<template>
    <component :is="props.tag" class="ui-breadcrumbs-item">
        <component
            :is="link.isLink.value && !effectiveDisabled ? 'a' : 'span'"
            :href="effectiveDisabled ? undefined : link.href.value"
            :aria-current="props.active ?? link.isActive.value ? 'page' : undefined"
            :aria-disabled="effectiveDisabled || undefined"
            @click="link.navigate"
        ><slot>{{ props.title }}</slot></component>
    </component>
</template>

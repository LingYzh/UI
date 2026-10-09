<script setup>
import { mdiAccountOutline } from '@mdi/js';
import { UAvatar } from '../../index';
</script>

<template>
    <div class="component-demo" data-demo-component="UAvatar">
        <div class="demo-row">
            <u-avatar text="AY" />
            <u-avatar :icon="mdiAccountOutline" :size="32" />
            <u-avatar text="UI" :rounded="false" :size="32" />
        </div>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    justify-items: stretch;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
.component-demo > .ui-button {
    justify-self: start;
}
</style>

<script setup>
import { ref } from 'vue';
import { UItem, UItemGroup } from '../../index';
const selected = ref('a');
const disabled = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="UItemGroup">
        <u-item-group v-model="selected" mandatory>
            <u-item value="a">概览</u-item>
            <u-item value="b">详情</u-item>
            <u-item value="c" disabled>禁用</u-item>
        </u-item-group>
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

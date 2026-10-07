<script setup>
import { ref } from 'vue';
import { URadioGroup, USelectionControl } from '../../index';
const radio = ref('a');
</script>

<template>
    <div class="component-demo" data-demo-component="URadioGroup">
        <u-radio-group v-model="radio" label="单选组" hint="值由组统一管理。">
            <u-selection-control value="a" label="默认" type="radio" />
            <u-selection-control value="b" label="自定义" type="radio" />
        </u-radio-group>
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

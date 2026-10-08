<script setup>
import { ref } from 'vue';
import { UColorPicker } from '../../index';
const color = ref('#bd6749');
const rgba = ref({ r: 189, g: 103, b: 73, a: 0.65 });
const mode = ref('rgba');
</script>

<template>
    <div class="component-demo" data-demo-component="UColorPicker">
        <u-color-picker
            v-model="color"
            label="颜色编辑器"
            :swatches="['#bd6749', '#679775', '#627ca0', '#8b739e']"
        />
        <output>{{ color }}</output>
        <u-color-picker
            v-model="rgba"
            v-model:mode="mode"
            :hide-canvas="false"
            :width="360"
            label="二维面板与透明度"
            :swatches="[
                ['#bd674980', '#679775'],
                ['#627ca0', '#8b739e80'],
            ]"
        />
        <output>{{ mode }} · {{ rgba }}</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
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

<script setup>
import { ref } from 'vue';
import { UButton, UChip, UChipGroup } from '../../index';
const selected = ref('a');
const group = ref();
const scrolling = ref('item-1');
</script>

<template>
    <div class="component-demo" data-demo-component="UChipGroup">
        <u-chip-group ref="group" v-model="selected" mandatory v-slot="{ selectedValues }">
            <u-chip value="a">概览</u-chip>
            <u-chip value="b" closable>详情</u-chip>
            <output>作用域已选值：{{ selectedValues.join('、') }}</output>
        </u-chip-group>
        <div class="demo-row">
            <u-button variant="text" @click="group.prev()">前一项</u-button>
            <u-button variant="text" @click="group.next()">后一项</u-button>
        </div>
        <output>公开 ref 已选值：{{ group?.selectedValues.join('、') }}</output>
        <u-chip-group
            v-model="scrolling"
            scrollable
            show-arrows
            center-active
            class="scroll-example"
        >
            <u-chip v-for="index in 12" :key="index" :value="'item-' + index">
                滚动条目 {{ index }}
            </u-chip>
        </u-chip-group>
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
.scroll-example {
    max-width: 360px;
}
</style>

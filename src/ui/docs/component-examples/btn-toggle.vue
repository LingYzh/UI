<script setup>
import { ref } from 'vue';
import { UBtnToggle, UButton, USwitch } from '../../index';
const selected = ref('a');
const implicit = ref(0);
const group = ref();
const multiple = ref(false);
const disabled = ref(false);
const mandatory = ref(true);
const readonly = ref(false);
function changeMultiple(value) {
    selected.value = value ? [selected.value].filter(Boolean) : selected.value[0];
}
</script>

<template>
    <div class="component-demo" data-demo-component="UBtnToggle">
        <div class="demo-row">
            <u-switch v-model="multiple" label="多选" @update:model-value="changeMultiple" />
            <u-switch v-model="mandatory" label="必须选择" />
            <u-switch v-model="disabled" label="禁用" />
            <u-switch v-model="readonly" label="只读" />
        </div>
        <u-btn-toggle
            ref="group"
            v-model="selected"
            :multiple="multiple"
            :mandatory="mandatory"
            :disabled="disabled"
            :readonly="readonly"
            :max="2"
            label="视图选择"
        >
            <u-button value="a" color="primary">概览</u-button>
            <u-button value="b" color="primary">详情</u-button>
            <u-button value="c" color="primary">设置</u-button>
        </u-btn-toggle>
        <output>当前：{{ JSON.stringify(selected) }}</output>
        <div class="demo-row">
            <u-button variant="text" @click="group.prev()">前一项</u-button>
            <u-button variant="text" @click="group.next()">后一项</u-button>
        </div>
        <output>公开 ref 已选值：{{ JSON.stringify(group?.selectedValues) }}</output>
        <p>省略 value 时使用组内索引：</p>
        <u-btn-toggle v-model="implicit" aria-label="索引选择" v-slot="{ selectedValues }">
            <u-button>索引一</u-button>
            <u-button>索引二</u-button>
            <u-button>索引三</u-button>
            <output>作用域索引：{{ selectedValues.join('、') }}</output>
        </u-btn-toggle>
        <output>索引：{{ implicit }}</output>
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

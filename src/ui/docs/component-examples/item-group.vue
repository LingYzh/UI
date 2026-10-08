<script setup>
import { ref } from 'vue';
import { UButton, UItem, UItemGroup, USwitch } from '../../index';
const value = ref('a');
const multiple = ref(false);
const disabled = ref(false);
const readonly = ref(false);
const events = ref(0);
function changeMultiple(enabled) {
    value.value = enabled ? [value.value].filter((item) => item !== undefined) : value.value[0];
}
</script>

<template>
    <div class="component-demo" data-demo-component="UItemGroup">
        <div class="demo-row">
            <u-switch
                v-model="multiple"
                label="多选，最多两项"
                @update:model-value="changeMultiple"
            />
            <u-switch v-model="disabled" label="禁用" />
            <u-switch v-model="readonly" label="只读" />
        </div>
        <u-item-group
            v-model="value"
            :multiple="multiple"
            :max="2"
            :disabled="disabled"
            :readonly="readonly"
            mandatory
            selected-class="demo-selected"
        >
            <template #default="{ selected, selectedValues, next, prev }">
                <u-item value="a" @group:selected="events++">概览</u-item>
                <u-item value="b" @group:selected="events++">详情</u-item>
                <u-item value="disabled" disabled>禁用项</u-item>
                <u-item value="c" @group:selected="events++">设置</u-item>
                <div class="item-navigation">
                    <u-button :disabled="disabled || readonly" @click="prev">上一项</u-button>
                    <u-button :disabled="disabled || readonly" @click="next">下一项</u-button>
                    <output>
                        选中 {{ selected.length }} 项：{{ JSON.stringify(selectedValues) }}
                    </output>
                </div>
            </template>
        </u-item-group>
        <output>当前值：{{ JSON.stringify(value) }}；选择状态变化 {{ events }} 次。</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.demo-row,
.item-navigation {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
.item-navigation {
    flex-basis: 100%;
    padding-top: 12px;
}
output {
    color: var(--muted);
    font-size: 14px;
    overflow-wrap: anywhere;
}
</style>

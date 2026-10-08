<script setup>
import { ref } from 'vue';
import { UButton, UItem, UItemGroup } from '../../index';
const value = ref('a');
const events = ref(0);
</script>

<template>
    <div class="component-demo" data-demo-component="UItem">
        <u-item-group v-model="value" selected-class="demo-selected" mandatory>
            <u-item value="a" @group:selected="events++">保留默认按钮</u-item>
            <u-item
                v-slot="{ isSelected, selectedClass, disabled, toggle }"
                value="b"
                :tag="false"
                @group:selected="events++"
            >
                <u-button
                    :class="selectedClass"
                    :disabled="disabled"
                    :aria-pressed="isSelected"
                    :variant="isSelected ? 'tonal' : 'outlined'"
                    @click="toggle"
                >
                    自定义按钮
                </u-button>
            </u-item>
            <u-item v-slot="{ value: index }">未传 value，使用索引 {{ index }}</u-item>
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
output {
    color: var(--muted);
    font-size: 14px;
    overflow-wrap: anywhere;
}
</style>

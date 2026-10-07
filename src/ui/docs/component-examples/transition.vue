<script setup>
import { ref } from 'vue';
import { UButton, USwitch, UTextField, UTransition } from '../../index';
const expanded = ref(true);
const disabled = ref(false);
const reduced = ref(document.documentElement.dataset.reducedMotion === 'true');
const lines = ref(1);
const name = ref('保持内容');
function updateReduced(value) {
    reduced.value = value;
    document.documentElement.dataset.reducedMotion = String(value);
}
</script>

<template>
    <div class="component-demo" data-demo-component="UTransition">
        <div class="demo-row">
            <u-button size="sm" @click="expanded = !expanded">切换展开</u-button>
            <u-button size="sm" @click="lines++">增加内容</u-button>
        </div>
        <div class="demo-row">
            <u-switch v-model="disabled" label="禁用过渡" />
            <u-switch
                :model-value="reduced"
                label="减少动态效果"
                @update:model-value="updateReduced"
            />
        </div>
        <u-transition variant="expand" :disabled="disabled">
            <div
                v-show="expanded"
                class="completion-panel"
                style="overflow: visible; min-height: 72px"
            >
                <strong>带内边距和边框的内容</strong>
                <p v-for="line in lines" :key="line">
                    第 {{ line }} 行：快速切换会从当前高度继续，过渡结束恢复自动尺寸。
                </p>
                <u-text-field v-model="name" label="面板内名称" />
            </div>
        </u-transition>
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
.completion-panel {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
}
</style>

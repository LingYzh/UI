<script setup>
import { ref, watch } from 'vue';
import { UInfiniteScroll, USelect, USwitch, UButton } from '../../index';
const direction = ref('vertical');
const side = ref('both');
const mode = ref('manual');
const disabled = ref(false);
const items = ref([1, 2, 3, 4, 5, 6]);
const edgeLoads = ref({ start: 0, end: 0 });
const instance = ref();
let requestVersion = 0;
function reset() {
    requestVersion++;
    items.value = [1, 2, 3, 4, 5, 6];
    edgeLoads.value = { start: 0, end: 0 };
    instance.value?.reset('both');
}
watch([direction, side, mode], reset);
async function load({ side: edge, done }) {
    const version = requestVersion;
    await new Promise((resolve) => setTimeout(resolve, 220));
    // Resetting the example also invalidates the parent's pending data request.
    if (version !== requestVersion) return;
    const batch = Array.from({ length: 3 }, (_, index) =>
        edge === 'start' ? items.value[0] - 3 + index : items.value.at(-1) + 1 + index
    );
    items.value = edge === 'start' ? [...batch, ...items.value] : [...items.value, ...batch];
    edgeLoads.value[edge]++;
    done(edgeLoads.value[edge] >= 3 ? 'empty' : 'ok');
}
</script>

<template>
    <div class="component-demo" data-demo-component="UInfiniteScroll">
        <u-select v-model="direction" :items="['vertical', 'horizontal']" label="滚动方向" />
        <u-select v-model="side" :items="['start', 'end', 'both']" label="加载边缘" />
        <u-select v-model="mode" :items="['manual', 'intersect']" label="加载方式" />
        <u-switch v-model="disabled" label="暂停加载" />
        <u-infinite-scroll
            :key="`${direction}-${side}-${mode}`"
            ref="instance"
            :direction="direction"
            :side="side"
            :mode="mode"
            :disabled="disabled"
            height="260"
            :margin="0"
            @load="load"
        >
            <div class="records" :class="{ 'is-horizontal': direction === 'horizontal' }">
                <div v-for="item in items" :key="item" class="record">示例记录 {{ item }}</div>
            </div>
            <template #loading="{ side: edge }">
                {{ edge === 'start' ? '前端' : '后端' }}正在加载…
            </template>
            <template #empty="{ side: edge }">
                {{ edge === 'start' ? '前端' : '后端' }}没有更多记录
            </template>
        </u-infinite-scroll>
        <u-button @click="reset">重置两侧状态</u-button>
        <output>
            前端加载 {{ edgeLoads.start }} 次；后端加载 {{ edgeLoads.end }} 次。旧
            direction="start/end" 用法继续支持。
        </output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
.records {
    flex: 1 0 auto;
}
.records.is-horizontal {
    display: flex;
    height: 100%;
}
.record {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
}
.records.is-horizontal .record {
    display: grid;
    place-items: center;
    width: 180px;
    border-bottom: 0;
    border-inline-end: 1px solid var(--border);
}
</style>

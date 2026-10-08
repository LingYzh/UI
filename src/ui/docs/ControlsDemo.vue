<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import {
    UButton,
    UCard,
    UCheckbox,
    UColorSwatches,
    UCopyButton,
    UFormField,
    UTextField,
    UProgress,
    URadio,
    snackbar,
} from '../index';

defineProps({ example: { type: String, required: true } });

// 全选：父级根据子项计算 checked / indeterminate，子项独立勾选。
const accounts = ref([
    { id: 'a', email: 'alice@example.com', selected: true },
    { id: 'b', email: 'bob@example.com', selected: false },
    { id: 'c', email: 'carol@example.com', selected: true },
    { id: 'd', email: 'dave@example.com', selected: false },
]);
const selectedCount = computed(() => accounts.value.filter((item) => item.selected).length);
const allSelected = computed({
    get: () => selectedCount.value === accounts.value.length,
    set: (value) => {
        accounts.value.forEach((item) => {
            item.selected = value;
        });
    },
});
const partial = computed(
    () => selectedCount.value > 0 && selectedCount.value < accounts.value.length
);
const includeCredentials = ref(true);

const routes = [
    { id: 'opus', model: 'claude-opus-5-5', tier: 'Opus' },
    { id: 'sonnet', model: 'claude-sonnet-5', tier: 'Sonnet' },
    { id: 'haiku', model: 'claude-haiku-4-5', tier: 'Haiku' },
];
const defaultRoute = ref('sonnet');

const usage = ref(36);
const batch = ref(0);
let timer;
function runBatch() {
    clearInterval(timer);
    batch.value = 0;
    timer = setInterval(() => {
        batch.value = Math.min(100, batch.value + 9);
        if (batch.value >= 100) clearInterval(timer);
    }, 180);
}
onBeforeUnmount(() => clearInterval(timer));
const usageTone = computed(() =>
    usage.value > 95 ? 'error' : usage.value > 80 ? 'warning' : 'accent'
);

const token = 'eyJhbGciOiJIUzI1NiJ9.demo.signature';
const color = ref('#4A78B8');
const legacy = ref('#2f6f9f');
const tagName = ref('工作');
</script>

<template>
    <div class="controls-demo">
        <template v-if="example === 'checkbox-select-all'">
            <u-card density="compact" flush aria-label="账号选择">
                <div class="d-flex align-center justify-space-between ga-3 pa-4 demo-list-head">
                    <u-checkbox v-model="allSelected" :indeterminate="partial">全选</u-checkbox>
                    <span class="text-body-2 text-muted">
                        已选 {{ selectedCount }} / {{ accounts.length }}
                    </span>
                </div>
                <div class="d-flex flex-column">
                    <label
                        v-for="item in accounts"
                        :key="item.id"
                        class="d-flex align-center ga-3 px-4 py-3 demo-list-row"
                    >
                        <u-checkbox v-model="item.selected" :aria-label="`选择 ${item.email}`" />
                        <span class="text-body-1 text-truncate">{{ item.email }}</span>
                    </label>
                </div>
            </u-card>
        </template>
        <template v-else-if="example === 'checkbox-states'">
            <div class="d-flex flex-wrap align-center ga-5">
                <u-checkbox v-model="includeCredentials">包含凭证</u-checkbox>
                <u-checkbox :model-value="false" disabled>禁用 · 未选</u-checkbox>
                <u-checkbox :model-value="true" disabled>禁用 · 已选</u-checkbox>
                <u-checkbox :model-value="false" indeterminate disabled>禁用 · 部分</u-checkbox>
            </div>
            <output>包含凭证：{{ includeCredentials }}</output>
        </template>
        <template v-else-if="example === 'radio-cards'">
            <div class="d-grid grid-cols-3 ga-3 demo-route-grid">
                <u-card
                    v-for="route in routes"
                    :key="route.id"
                    density="compact"
                    :aria-label="route.tier"
                >
                    <div class="d-flex align-center justify-space-between ga-2">
                        <strong class="text-subtitle">{{ route.tier }}</strong>
                        <u-radio v-model="defaultRoute" name="demo-default-route" :value="route.id">
                            {{ defaultRoute === route.id ? '默认模型' : '设为默认' }}
                        </u-radio>
                    </div>
                    <p class="ma-0 mt-2 text-body-2 text-muted font-mono text-truncate">
                        {{ route.model }}
                    </p>
                </u-card>
            </div>
            <div class="d-flex flex-wrap align-center ga-5 mt-4">
                <u-radio :model-value="null" value="off" disabled>禁用 · 未选</u-radio>
                <u-radio model-value="on" value="on" disabled>禁用 · 已选</u-radio>
            </div>
            <output>默认路由：{{ defaultRoute }}</output>
        </template>
        <template v-else-if="example === 'progress-tones'">
            <div class="d-flex flex-column ga-4">
                <div>
                    <div class="d-flex justify-space-between text-body-2 mb-2">
                        <span>本月用量</span>
                        <span class="text-muted">{{ usage }}%</span>
                    </div>
                    <u-progress :value="usage" :tone="usageTone" label="本月用量" />
                </div>
                <div class="d-flex ga-2">
                    <u-button size="sm" @click="usage = 36">36%</u-button>
                    <u-button size="sm" @click="usage = 86">86%</u-button>
                    <u-button size="sm" @click="usage = 98">98%</u-button>
                </div>
                <div>
                    <div class="d-flex justify-space-between text-body-2 mb-2">
                        <span>批量注册</span>
                        <span class="text-muted">{{ batch }}%</span>
                    </div>
                    <u-progress
                        :value="batch"
                        :tone="batch >= 100 ? 'success' : 'accent'"
                        dense
                        label="批量注册进度"
                    />
                </div>
                <div>
                    <u-button size="sm" variant="flat" color="primary" @click="runBatch">
                        开始批量任务
                    </u-button>
                </div>
            </div>
        </template>
        <template v-else-if="example === 'copy-inline'">
            <u-card density="compact" aria-label="账号凭证">
                <div class="d-flex align-center ga-2">
                    <span class="text-body-2 text-muted flex-shrink-0">Access Token</span>
                    <code class="flex-1-1 text-truncate font-mono text-body-2 demo-token">
                        {{ token }}
                    </code>
                    <u-copy-button
                        :text="token"
                        label="复制 Access Token"
                        @copied="snackbar.show('已复制 Access Token。', { tone: 'success' })"
                    />
                </div>
                <div class="d-flex align-center ga-2 mt-3">
                    <span class="text-body-2 text-muted flex-shrink-0">邮箱</span>
                    <span class="flex-1-1 text-truncate text-body-1">alice@example.com</span>
                    <u-copy-button text="alice@example.com" label="复制邮箱" />
                </div>
            </u-card>
        </template>
        <template v-else-if="example === 'swatches-tag'">
            <u-card title="新建标签" density="compact" aria-label="新建标签">
                <u-form-field v-slot="{ controlAttrs }" label="名称" for="demo-tag-name">
                    <u-text-field v-model="tagName" v-bind="controlAttrs" dense />
                </u-form-field>
                <div class="mt-4">
                    <p class="ma-0 mb-2 text-body-2">颜色</p>
                    <u-color-swatches v-model="color" label="标签颜色" />
                </div>
                <div class="d-flex align-center ga-2 mt-4 text-body-2 text-muted">
                    预览
                    <span class="demo-tag-preview" :style="{ '--tag': color }">
                        {{ tagName || '未命名' }}
                    </span>
                </div>
            </u-card>
        </template>
        <template v-else-if="example === 'swatches-legacy'">
            <div class="d-flex flex-column ga-3">
                <u-color-swatches v-model="legacy" label="已有标签颜色" />
                <output>当前值：{{ legacy }}</output>
                <p class="ma-0 text-body-2 text-muted">
                    已保存但不在色板中的颜色会作为“当前颜色”显示在末尾，选择其他颜色后消失。
                </p>
            </div>
        </template>
    </div>
</template>

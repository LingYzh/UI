<script setup>
import { ref } from 'vue';
import { UPullToRefresh, USwitch, UButton } from '../../index';
const refreshed = ref(0);
const disabled = ref(false);
const instance = ref();
let requestVersion = 0;
async function refresh({ done }) {
    const version = requestVersion;
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (version !== requestVersion) return;
    refreshed.value++;
    done();
}
function reset() {
    requestVersion++;
    instance.value?.reset();
    refreshed.value = 0;
}
</script>

<template>
    <div class="component-demo" data-demo-component="UPullToRefresh">
        <u-switch v-model="disabled" label="禁用下拉刷新" />
        <u-pull-to-refresh
            ref="instance"
            style="max-height: 240px"
            :disabled="disabled"
            :pull-down-threshold="64"
            :resistance="1"
            @load="refresh"
        >
            <template #pullDownPanel="{ canRefresh, goingUp, refreshing }">
                {{
                    refreshing
                        ? '正在刷新…'
                        : canRefresh
                          ? '松开刷新'
                          : goingUp
                            ? '已回拉'
                            : '继续下拉'
                }}
            </template>
            <p>鼠标或触屏下拉，松开后刷新。已刷新 {{ refreshed }} 次。</p>
            <ul>
                <li v-for="item in 10" :key="item" class="py-2">示例记录 {{ item }}</li>
            </ul>
        </u-pull-to-refresh>
        <u-button @click="reset">重置请求</u-button>
        <output>
            旧 refresh、threshold 和 indicator 用法继续保留；默认阻尼0.5，示例显式设为1。
        </output>
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

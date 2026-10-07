<script setup>
import { ref } from 'vue';
import { UPullToRefresh } from '../../index';
const refreshed = ref(0);
function refresh({ done }) {
    refreshed.value++;
    done();
}
</script>

<template>
    <div class="component-demo" data-demo-component="UPullToRefresh">
        <u-pull-to-refresh style="max-height: 240px" @refresh="refresh">
            <p>触屏下拉刷新，已刷新 {{ refreshed }} 次。</p>
            <ul>
                <li v-for="item in 6" :key="item" class="py-2">示例记录 {{ item }}</li>
            </ul>
        </u-pull-to-refresh>
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

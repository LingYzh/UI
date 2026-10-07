<script setup>
import { ref } from 'vue';
import { UInfiniteScroll } from '../../index';
const loaded = ref(6);
function load({ done }) {
    loaded.value += 3;
    done(loaded.value >= 18 ? 'empty' : 'ok');
}
</script>

<template>
    <div class="component-demo" data-demo-component="UInfiniteScroll">
        <u-infinite-scroll @load="load">
            <ul>
                <li v-for="item in loaded" :key="item" class="py-2">示例记录 {{ item }}</li>
            </ul>
        </u-infinite-scroll>
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

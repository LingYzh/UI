<script setup>
import { ref } from 'vue';
import { UBottomNavigation, UButton } from '../../index';
const bottom = ref('overview');
</script>

<template>
    <div class="component-demo" data-demo-component="UBottomNavigation">
        <u-bottom-navigation v-model="bottom">
            <template #default="{ selected, select }">
                <u-button
                    v-for="value in ['overview', 'search', 'settings']"
                    :key="value"
                    variant="text"
                    :aria-current="selected === value ? 'page' : undefined"
                    @click="select(value)"
                >
                    {{ { overview: '概览', search: '搜索', settings: '设置' }[value] }}
                </u-button>
            </template>
        </u-bottom-navigation>
        <output>当前：{{ bottom }}</output>
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

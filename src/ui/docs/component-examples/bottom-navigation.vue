<script setup>
import { ref } from 'vue';
import { UBottomNavigation, UButton, UIcon, USwitch } from '../../index';
const bottom = ref('overview');
const active = ref(true);
</script>

<template>
    <div class="component-demo" data-demo-component="UBottomNavigation">
        <u-switch v-model="active" label="显示底部导航" />
        <u-bottom-navigation
            v-model="bottom"
            v-model:active="active"
            mandatory
            grow
            mode="horizontal"
        >
            <template #default="{ selected }">
                <u-button
                    v-for="value in ['overview', 'search', 'settings']"
                    :key="value"
                    :value="value"
                    variant="text"
                    :aria-current="selected === value ? 'page' : undefined"
                >
                    <u-icon
                        :icon="
                            {
                                overview: 'mdi-home-outline',
                                search: 'mdi-magnify',
                                settings: 'mdi-cog-outline',
                            }[value]
                        "
                        :size="18"
                    />
                    <span>{{ { overview: '概览', search: '搜索', settings: '设置' }[value] }}</span>
                </u-button>
            </template>
        </u-bottom-navigation>
        <output>当前：{{ bottom }}；选择由真实按钮自动注册和分组管理。</output>
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

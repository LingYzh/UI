<script setup>
import { ref } from 'vue';
import { UButton, UIcon, UList, UListGroup, UListItem, UTextField } from '../../index';
const opened = ref([]);
const name = ref('工作区');
</script>

<template>
    <div class="component-demo" data-demo-component="UListGroup">
        <div class="demo-row">
            <u-button size="sm" @click="opened = ['settings', 'advanced']">展开全部</u-button>
            <u-button size="sm" @click="opened = []">收起全部</u-button>
        </div>
        <u-list v-model:opened="opened">
            <u-list-group value="settings" title="配置">
                <u-list-item value="models" title="模型配置" />
                <u-list-item value="permissions" title="权限配置" />
                <u-text-field v-model="name" label="分组内名称" hint="收起再展开，输入内容保持。" />
                <u-list-group value="advanced" title="高级配置">
                    <u-list-item title="日志与诊断" />
                </u-list-group>
            </u-list-group>
            <u-list-group value="custom">
                <template #activator="{ props }">
                    <u-button v-bind="props" variant="text">
                        自定义分组触发器
                        <u-icon
                            name="mdi-chevron-down"
                            class="ui-disclosure-icon is-down"
                            :class="{ 'is-open': props['aria-expanded'] }"
                        />
                    </u-button>
                </template>
                <u-list-item title="自定义分组内容" />
            </u-list-group>
            <u-list-group value="disabled" title="禁用分组" disabled>
                <u-list-item title="不可展开" />
            </u-list-group>
        </u-list>
        <output>展开项：{{ opened.join('、') || '无' }}</output>
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

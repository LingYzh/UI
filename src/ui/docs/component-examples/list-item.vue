<script setup>
import { ref } from 'vue';
import { UButton, UCheckbox, UList, UListItem, USwitch } from '../../index';
const selected = ref('overview');
const ripple = ref(true);
const appendCount = ref(0);
const notifications = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="UListItem">
        <u-switch v-model="ripple" label="启用列表项涟漪" />
        <u-list v-model="selected">
            <u-list-item
                :ripple="ripple"
                value="overview"
                title="概览"
                subtitle="快速点击后反馈仍完整淡出"
            />
            <u-list-item :ripple="ripple" value="settings" title="设置">
                <template #append>
                    <u-button size="sm" variant="text" @click="appendCount++">独立操作</u-button>
                </template>
            </u-list-item>
            <u-list-item :ripple="ripple" value="quiet-action" title="带无涟漪按钮的列表项">
                <template #append>
                    <u-button size="sm" variant="text" :ripple="false" @click="appendCount++">
                        无涟漪操作
                    </u-button>
                </template>
            </u-list-item>
            <u-list-item :ripple="ripple" value="notifications" title="列表内选择控件">
                <template #append>
                    <u-checkbox v-model="notifications" :ripple="ripple">通知</u-checkbox>
                </template>
            </u-list-item>
            <u-list-item :ripple="false" value="quiet" title="此项关闭涟漪" />
            <u-list-item
                :ripple="ripple && { center: true, color: 'var(--accent-text)' }"
                value="center"
                title="居中主题色反馈"
            />
            <u-list-item value="disabled" title="归档" disabled />
        </u-list>
        <output>已选：{{ selected }} · 独立操作：{{ appendCount }} 次</output>
        <div class="demo-append-list">
            <u-list nav :selectable="false" aria-label="右侧内容与长名称示例">
                <u-list-item title="栅格与布局规范" href="#/grid" append-icon="arrowRight" active />
                <u-list-item
                    title="路径分隔符"
                    href="#/breadcrumbs-divider"
                    append-text="UBreadcrumbsDivider"
                />
                <u-list-item title="通知设置" append-text="已开启" append-icon="mdi-check" />
                <u-list-item title="自定义操作" append-text="被插槽替换" append-icon="mdi-check">
                    <template #append>
                        <u-button size="sm" variant="text" @click="appendCount++">操作</u-button>
                    </template>
                </u-list-item>
            </u-list>
        </div>
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
.demo-append-list {
    width: 238px;
    max-width: 100%;
    border: 1px solid var(--border);
    border-radius: 8px;
}
</style>

<script setup>
import { ref } from 'vue';
import {
    UExpansionPanels,
    UExpansionPanel,
    UExpansionPanelTitle,
    UExpansionPanelText,
    UStepper,
    UStepperVertical,
    UStepperItem,
    UStepperWindow,
    UStepperWindowItem,
    UStepperActions,
    UWindow,
    UWindowItem,
    UCarousel,
    UCarouselItem,
    UImg,
    UResponsive,
    UHover,
    UHotkeyListener,
    UKbd,
    ULazy,
    UNoSsr,
    UInfiniteScroll,
    UParallax,
    UPullToRefresh,
    USparkline,
    UTimeline,
    UTimelineItem,
    USpeedDial,
    UFab,
    UButton,
    UTextField,
} from '../index';
defineProps({ example: String });
const panel = ref('overview');
const step = ref(1);
const verticalStep = ref(1);
const windowValue = ref('a');
const carousel = ref(1);
const hotkey = ref(0);
const dial = ref(false);
const loaded = ref(6);
const refreshed = ref(0);
const action = ref('尚未执行');
const image =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><rect width="640" height="320" fill="#efe8df"/><circle cx="480" cy="100" r="60" fill="#bd6749"/><path d="M0 320 180 90 360 320Z" fill="#789380"/><path d="M230 320 420 150 640 320Z" fill="#a7b7a5"/></svg>'
    );
function load({ done }) {
    loaded.value += 3;
    done(loaded.value >= 18 ? 'empty' : 'ok');
}
function refresh({ done }) {
    refreshed.value++;
    done();
}
</script>

<template>
    <div class="completion-demo">
        <template v-if="example === 'completion-panels'">
            <UExpansionPanels v-model="panel">
                <UExpansionPanel value="overview">
                    <UExpansionPanelTitle>组件使用规范</UExpansionPanelTitle>
                    <UExpansionPanelText>
                        基础控件内置 label/hint，Form 统一管理验证；Row/Col 决定布局。
                    </UExpansionPanelText>
                </UExpansionPanel>
                <UExpansionPanel value="details">
                    <UExpansionPanelTitle>更多说明</UExpansionPanelTitle>
                    <UExpansionPanelText>
                        点击标题、Enter 或 Space 展开，过渡跟随减少动效偏好。
                    </UExpansionPanelText>
                </UExpansionPanel>
                <UExpansionPanel value="disabled" disabled>
                    <UExpansionPanelTitle>禁用面板</UExpansionPanelTitle>
                    <UExpansionPanelText>此面板不可展开。</UExpansionPanelText>
                </UExpansionPanel>
            </UExpansionPanels>
        </template>
        <template v-else-if="example === 'completion-stepper'">
            <UStepper v-model="step">
                <UStepperItem :value="1" title="填写资料" :complete="step > 1" editable />
                <UStepperItem :value="2" title="检查配置" :complete="step > 2" editable />
                <UStepperItem :value="3" title="完成" editable />
                <UStepperWindow>
                    <UStepperWindowItem :value="1">
                        <UTextField label="工作区名称" model-value="示例工作区" />
                    </UStepperWindowItem>
                    <UStepperWindowItem :value="2">确认当前配置后继续。</UStepperWindowItem>
                    <UStepperWindowItem :value="3">配置已完成。</UStepperWindowItem>
                </UStepperWindow>
                <UStepperActions />
            </UStepper>
            <UStepperVertical v-model="verticalStep" class="mt-4">
                <UStepperItem :value="1" title="准备" editable />
                <UStepperWindowItem :value="1">检查输入信息。</UStepperWindowItem>
                <UStepperItem :value="2" title="执行" editable />
                <UStepperWindowItem :value="2">开始执行。</UStepperWindowItem>
                <UStepperActions />
            </UStepperVertical>
        </template>
        <template v-else-if="example === 'completion-window'">
            <div class="completion-toolbar">
                <UButton @click="windowValue = windowValue === 'a' ? 'b' : 'a'">切换内容</UButton>
                <output>当前：{{ windowValue }}</output>
            </div>
            <UWindow v-model="windowValue" continuous label="内容窗口">
                <UWindowItem value="a">
                    <div class="completion-window-card">概览面板</div>
                </UWindowItem>
                <UWindowItem value="b">
                    <div
                        class="completion-window-card"
                        style="background: var(--soft); color: var(--text)"
                    >
                        详情面板
                    </div>
                </UWindowItem>
            </UWindow>
            <UCarousel v-model="carousel" :cycle="false" label="工作区轮播" class="mt-4">
                <UCarouselItem v-for="value in [1, 2, 3]" :key="value" :value="value">
                    <div class="completion-window-card">第 {{ value }} 项</div>
                </UCarouselItem>
            </UCarousel>
        </template>
        <template v-else-if="example === 'completion-media'">
            <div class="completion-grid">
                <UResponsive aspect-ratio="2/1">
                    <UImg :src="image" alt="柔和的山丘图形" lazy />
                </UResponsive>
                <UHover>
                    <template #default="{ isHovering, props: hoverProps }">
                        <div
                            v-bind="hoverProps"
                            class="completion-panel"
                            :style="{
                                background: isHovering ? 'var(--accent-soft)' : 'var(--surface)',
                            }"
                        >
                            <h4>Hover 提供交互状态</h4>
                            <p>{{ isHovering ? '指针或键盘位于此区域' : '移入此区域查看状态' }}</p>
                            <UHotkeyListener keys="ctrl+shift+k" @trigger="hotkey++">
                                <UKbd keys="Ctrl + Shift + K" />
                            </UHotkeyListener>
                            <p>快捷键触发 {{ hotkey }} 次</p>
                        </div>
                    </template>
                </UHover>
            </div>
            <ULazy class="mt-4">
                <UNoSsr>
                    <UResponsive aspect-ratio="4/1">
                        <UImg :src="image" alt="延迟显示的山丘图形" lazy />
                    </UResponsive>
                    <template #placeholder>客户端加载中…</template>
                </UNoSsr>
                <template #placeholder>等待进入视口…</template>
            </ULazy>
            <UParallax class="mt-4">
                <template #background>
                    <UImg :src="image" alt="背景山丘" />
                </template>
                <strong>滚动产生轻微视差；减少动效时保持静止。</strong>
            </UParallax>
        </template>
        <template v-else-if="example === 'completion-loading'">
            <UPullToRefresh style="max-height: 240px" @refresh="refresh">
                <p>触屏下拉刷新，已刷新 {{ refreshed }} 次。</p>
                <UInfiniteScroll @load="load">
                    <ul>
                        <li v-for="item in loaded" :key="item" class="py-2">示例记录 {{ item }}</li>
                    </ul>
                </UInfiniteScroll>
            </UPullToRefresh>
        </template>
        <template v-else>
            <USparkline :values="[12, 18, 14, 25, 22, 35, 28, 40]" />
            <UTimeline side="alternate" class="mt-4">
                <UTimelineItem title="完成盘点" subtitle="09:00">
                    <template #opposite>设计阶段</template>
                    确认组件和使用接口。
                </UTimelineItem>
                <UTimelineItem title="组件实现" subtitle="10:00">
                    编写真实模板与交互示例。
                </UTimelineItem>
                <UTimelineItem title="验证与验收" subtitle="11:00">
                    检查键盘、宽度、主题和动效。
                </UTimelineItem>
            </UTimeline>
            <div class="completion-toolbar">
                <USpeedDial v-model="dial">
                    <template #activator="{ props: activatorProps }">
                        <UFab v-bind="activatorProps" label="打开快捷操作" />
                    </template>
                    <UButton size="sm" @click="action = '已新建项目'">新建项目</UButton>
                    <UButton size="sm" @click="action = '已导出配置'">导出配置</UButton>
                </USpeedDial>
                <output role="status">{{ action }}</output>
            </div>
        </template>
    </div>
</template>

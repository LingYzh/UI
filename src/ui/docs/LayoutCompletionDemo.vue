<script setup>
import { ref } from 'vue';
import { mdiAccountOutline, mdiInformationOutline, mdiViewDashboardOutline } from '@mdi/js';
import {
    UApp,
    ULayout,
    UMain,
    UAppBar,
    UAppBarTitle,
    UToolbar,
    UToolbarTitle,
    UToolbarItems,
    UFooter,
    USystemBar,
    UNavigationDrawer,
    UList,
    UListItem,
    UListGroup,
    UListSubheader,
    UListItemTitle,
    UListItemSubtitle,
    UTreeview,
    UVirtualScroll,
    UAvatar,
    UBadge,
    UDivider,
    USheet,
    UEmptyState,
    USkeletonLoader,
    UBanner,
    UBreadcrumbs,
    UBreadcrumbsItem,
    UBreadcrumbsDivider,
    UBottomNavigation,
    UBottomSheet,
    UOverlay,
    UButton,
    UIcon,
    ULabel,
    UMessages,
    UCounter,
    UTransition,
} from '../index';
defineProps({ example: String });
const drawer = ref(true);
const selected = ref('overview');
const tree = ref([]);
const opened = ref(['components']);
const bottom = ref('overview');
const banner = ref(true);
const overlay = ref(false);
const sheet = ref(false);
const expanded = ref(true);
const items = Array.from({ length: 5000 }, (_, index) => ({
    id: index,
    title: `项目 ${index + 1}`,
}));
const nodes = [
    {
        title: '组件库',
        value: 'components',
        children: [
            {
                title: '表单控件',
                value: 'forms',
                children: [
                    { title: '输入与选择', value: 'inputs' },
                    { title: '验证与提交', value: 'validation' },
                ],
            },
            { title: '布局组件', value: 'layout' },
            {
                title: '归档组件',
                value: 'archive',
                disabled: true,
                children: [{ title: '历史组件', value: 'history' }],
            },
        ],
    },
    { title: '文档与示例', value: 'docs' },
];
</script>

<template>
    <div class="completion-demo">
        <template v-if="example === 'completion-app'">
            <div class="completion-toolbar">
                <UButton size="sm" @click="drawer = !drawer">切换抽屉</UButton>
                <span class="text-muted">Main 自动为顶部栏、侧栏和底部栏保留空间。</span>
            </div>
            <div class="completion-layout">
                <UApp>
                    <USystemBar :height="24">
                        本地工作区
                        <span class="ms-auto">在线</span>
                    </USystemBar>
                    <UAppBar :height="48">
                        <UAppBarTitle>工作台</UAppBarTitle>
                        <UAvatar text="A" :size="28" class="ms-auto" />
                    </UAppBar>
                    <UNavigationDrawer v-model="drawer" :width="140" :mobile-breakpoint="600">
                        <UList v-model="selected" nav>
                            <UListItem value="overview" title="概览" />
                            <UListItem value="settings" title="设置" />
                        </UList>
                    </UNavigationDrawer>
                    <UMain>
                        <div class="pa-4">
                            <UToolbar density="compact">
                                <UToolbarTitle>项目概览</UToolbarTitle>
                                <UToolbarItems>
                                    <UButton size="sm" variant="text">新建</UButton>
                                </UToolbarItems>
                            </UToolbar>
                            <p class="pa-3">
                                选择：{{ selected }}。关闭抽屉后，内容会填满空出的宽度。
                            </p>
                        </div>
                    </UMain>
                    <UFooter fixed :height="32">
                        <small>布局由组件注册，避免手写重复的 padding。</small>
                    </UFooter>
                </UApp>
            </div>
            <ULayout class="mt-4">
                <p class="ma-0 text-muted">Layout 也可独立提供同一套布局上下文。</p>
            </ULayout>
        </template>
        <template v-else-if="example === 'completion-lists'">
            <div class="completion-grid">
                <USheet border class="pa-2">
                    <UList v-model="selected">
                        <UListSubheader>工作区</UListSubheader>
                        <UListItem value="overview">
                            <template #prepend>
                                <UIcon :icon="mdiViewDashboardOutline" />
                            </template>
                            <UListItemTitle>概览</UListItemTitle>
                            <UListItemSubtitle>项目运行状况</UListItemSubtitle>
                        </UListItem>
                        <UListGroup value="settings" title="配置">
                            <UListItem value="models" title="模型配置" />
                            <UListItem value="permissions" title="权限配置" />
                        </UListGroup>
                        <UListItem value="disabled" title="归档工作区" disabled />
                    </UList>
                </USheet>
                <USheet border class="pa-2">
                    <UTreeview v-model="tree" v-model:opened="opened" :items="nodes" />
                    <output class="text-muted">已选：{{ tree.join('、') || '无' }}</output>
                </USheet>
            </div>
            <ULabel class="mt-4">虚拟滚动：5,000 项</ULabel>
            <UVirtualScroll :items="items" :item-height="36" :height="180" item-key="id">
                <template #default="{ item, index }">
                    <div class="px-3 py-2">{{ index + 1 }} · {{ item.title }}</div>
                </template>
            </UVirtualScroll>
        </template>
        <template v-else-if="example === 'completion-surfaces'">
            <div class="completion-toolbar">
                <UBadge :content="120" :max="99">
                    <UAvatar text="AY" />
                </UBadge>
                <UBadge dot>
                    <UButton variant="text">消息</UButton>
                </UBadge>
                <UDivider vertical />
                <UAvatar :icon="mdiAccountOutline" :size="32" />
                <UAvatar text="UI" :rounded="false" :size="32" />
            </div>
            <UBanner
                v-model="banner"
                text="文档和交互示例始终使用同一个组件实现。"
                :icon="mdiInformationOutline"
            >
                <template #actions>
                    <UButton size="sm" variant="text" @click="banner = false">知道了</UButton>
                </template>
            </UBanner>
            <UButton v-if="!banner" size="sm" @click="banner = true">重新显示提示</UButton>
            <UDivider />
            <div class="completion-grid">
                <USheet border>
                    <UEmptyState
                        title="没有工作区"
                        text="创建工作区后，相关内容会出现在这里。"
                        icon="mdi-folder-outline"
                    >
                        <template #actions>
                            <UButton size="sm">创建工作区</UButton>
                        </template>
                    </UEmptyState>
                </USheet>
                <USheet border class="pa-4">
                    <USkeletonLoader type="avatar" />
                    <USkeletonLoader :lines="3" class="mt-4" />
                    <ULabel class="mt-4">加载中的内容</ULabel>
                    <UMessages :messages="['骨架占位保留阅读结构，减少动效时停止闪动。']" />
                    <UCounter :value="12" :max="20" />
                </USheet>
            </div>
            <UButton class="mt-4" size="sm" @click="expanded = !expanded">
                过渡：{{ expanded ? '收起' : '展开' }}
            </UButton>
            <UTransition variant="expand">
                <USheet v-if="expanded" border class="pa-4 mt-3">
                    展开动画与减少动效偏好同步。
                </USheet>
            </UTransition>
        </template>
        <template v-else>
            <UBreadcrumbs aria-label="项目路径">
                <UBreadcrumbsItem href="#/overview" title="文档" />
                <UBreadcrumbsDivider />
                <UBreadcrumbsItem title="工作区" />
                <UBreadcrumbsItem title="当前项目" active />
            </UBreadcrumbs>
            <UBottomNavigation v-model="bottom" class="mt-4">
                <template #default="{ selected: active, select }">
                    <UButton
                        v-for="value in ['overview', 'search', 'settings']"
                        :key="value"
                        variant="text"
                        :aria-current="active === value ? 'page' : undefined"
                        @click="select(value)"
                    >
                        {{ { overview: '概览', search: '搜索', settings: '设置' }[value] }}
                    </UButton>
                </template>
            </UBottomNavigation>
            <div class="completion-toolbar mt-4">
                <UButton @click="overlay = true">打开浮层</UButton>
                <UButton @click="sheet = true">打开底部面板</UButton>
            </div>
            <UOverlay v-model="overlay" :width="360">
                <template #default="{ close }">
                    <h3>通用浮层</h3>
                    <p>原生对话框管理焦点，Escape 和外部点击关闭。</p>
                    <UButton @click="close">关闭</UButton>
                </template>
            </UOverlay>
            <UBottomSheet v-model="sheet">
                <h3>底部操作面板</h3>
                <p>适合移动设备上的次要操作。</p>
                <UButton @click="sheet = false">完成</UButton>
            </UBottomSheet>
        </template>
    </div>
</template>

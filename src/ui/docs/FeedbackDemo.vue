<script setup>
import { computed, ref } from 'vue';
import { UiAlert, UiBadge, UiButton, UiCard, UiDialog, UiField, UiInput, UiMenu, UiMenuItem, UiSelect, UiSpinner, UiSwitch, confirmDialog, snackbar } from '../index';
import Icon from '../../components/Icon.vue';

defineProps({ example: { type: String, required: true } });

const tones = ['neutral', 'accent', 'success', 'warning', 'error'];
const toneLabels = { neutral: '中性', accent: '强调', success: '正常', warning: '即将到期', error: '已封禁' };
const tags = ref([
    { id: 'work', label: '工作', color: '#3b82f6' },
    { id: 'trial', label: '试用', color: '#22c55e' },
    { id: 'shared', label: '共享', color: '#8b5cf6' },
    { id: 'expired', label: '已过期', color: '#ef4444' },
    { id: 'long', label: '一个很长的自定义标签名称', color: '#f97316' }
]);
function removeTag(id) {
    tags.value = tags.value.filter((tag) => tag.id !== id);
    snackbar.show('已移除标签。');
}

const alertTones = [
    { tone: 'info', title: '批量导入说明', text: '每行一个账号，支持 ---- 或 Tab 分隔。' },
    { tone: 'success', title: '检测完成', text: '12 个账号状态正常，可以继续使用。' },
    { tone: 'warning', title: '额度即将用尽', text: '当前账号本月剩余额度低于 10%。' },
    { tone: 'error', title: '刷新失败', text: 'Token 已过期，请重新登录该账号。' }
];

const busy = ref(false);
function simulate() {
    if (busy.value) return;
    busy.value = true;
    setTimeout(() => { busy.value = false; }, 1600);
}

// 菜单模式：单选分组与多选标签。
const menuOpen = ref(false);
const group = ref('all');
const groups = [{ id: 'all', label: '全部账号' }, { id: 'work', label: '工作分组' }, { id: 'test', label: '测试分组' }];
const groupLabel = computed(() => groups.find((item) => item.id === group.value)?.label);
const selectedTags = ref(['work']);
function toggleTag(id) {
    selectedTags.value = selectedTags.value.includes(id) ? selectedTags.value.filter((item) => item !== id) : [...selectedTags.value, id];
}
// 面板模式：自由表单内容。
const panelOpen = ref(false);
const filterKeyword = ref('');
const filterStatus = ref('any');
const onlyActive = ref(false);
function applyFilter() {
    panelOpen.value = false;
    snackbar.show(`已应用筛选：${filterKeyword.value || '无关键字'} · ${filterStatus.value}`);
}

const result = ref('尚未确认');
async function remove() {
    const ok = await confirmDialog({ title: '删除账号', message: '确定删除账号 demo@example.com？删除后无法恢复。', confirmText: '删除', tone: 'danger' });
    result.value = ok ? '已确认删除' : '已取消';
    if (ok) snackbar.show('账号已删除。', { tone: 'success' });
}
async function logout() {
    const ok = await confirmDialog('这将清除本地 SSO 缓存并退出登录，是否继续？');
    result.value = ok ? '已确认退出' : '已取消';
}
async function queued() {
    const answers = await Promise.all([confirmDialog('第一条确认：切换到账号 A？'), confirmDialog('第二条确认：同时刷新 Token？')]);
    result.value = `排队结果：${answers.map((value) => (value ? '确认' : '取消')).join('、')}`;
}

const drawerOpen = ref(false);
const sizeOpen = ref(false);
const dialogSize = ref('md');
</script>

<template>
    <div class="feedback-demo">
        <template v-if="example === 'badge-tones'">
            <div class="d-flex flex-wrap align-center ga-2">
                <UiBadge v-for="tone in tones" :key="tone" :tone="tone">{{ toneLabels[tone] }}</UiBadge>
            </div>
            <div class="d-flex flex-wrap align-center ga-2 mt-3">
                <UiBadge v-for="tone in tones" :key="tone" :tone="tone" variant="outline">{{ toneLabels[tone] }}</UiBadge>
            </div>
            <div class="d-flex flex-wrap align-center ga-2 mt-3">
                <UiBadge tone="accent" dense>PRO</UiBadge>
                <UiBadge dense variant="outline" class="font-mono">v1.7.9</UiBadge>
                <UiBadge tone="success"><template #icon><Icon name="checkCircle" :size="12" /></template>已验证</UiBadge>
                <UiBadge tone="warning">3 天后到期</UiBadge>
            </div>
        </template>
        <template v-else-if="example === 'badge-custom'">
            <div class="d-flex flex-wrap align-center ga-2 demo-tag-list">
                <UiBadge v-for="tag in tags" :key="tag.id" :color="tag.color" closable @close="removeTag(tag.id)">{{ tag.label }}</UiBadge>
                <span v-if="!tags.length" class="text-muted text-body-2">标签已全部移除</span>
            </div>
            <UiButton class="mt-3" size="sm" @click="tags = [{ id: 'work', label: '工作', color: '#3b82f6' }, { id: 'trial', label: '试用', color: '#22c55e' }, { id: 'shared', label: '共享', color: '#8b5cf6' }, { id: 'expired', label: '已过期', color: '#ef4444' }, { id: 'long', label: '一个很长的自定义标签名称', color: '#f97316' }]">恢复标签</UiButton>
        </template>
        <template v-else-if="example === 'alert-tones'">
            <div class="d-flex flex-column ga-3">
                <UiAlert v-for="item in alertTones" :key="item.tone" :tone="item.tone" :title="item.title">{{ item.text }}</UiAlert>
            </div>
        </template>
        <template v-else-if="example === 'alert-actions'">
            <div class="d-flex flex-column ga-3">
                <UiAlert tone="error" title="代理启动失败">
                    端口 5580 已被占用。
                    <template #actions><UiButton size="sm" @click="snackbar.show('已重新尝试启动。')">重试</UiButton></template>
                </UiAlert>
                <UiAlert tone="warning" dense>当前处于隐私模式，邮箱与昵称已打码显示。</UiAlert>
                <UiAlert tone="info" role="note"><template #icon><Icon name="info" :size="18" /></template>静态说明可透传 role="note"，避免被读屏当作实时状态播报。</UiAlert>
            </div>
        </template>
        <template v-else-if="example === 'spinner-states'">
            <div class="d-flex flex-wrap align-center ga-4">
                <UiSpinner :size="14" />
                <UiSpinner />
                <UiSpinner :size="24" class="text-accent" />
                <span class="d-inline-flex align-center ga-2 text-body-2 text-muted"><UiSpinner :size="14" label="正在刷新账号" />正在刷新账号…</span>
            </div>
            <div class="d-flex flex-wrap align-center ga-2 mt-4">
                <UiButton :loading="busy" @click="simulate"><UiSpinner v-if="busy" :size="14" />{{ busy ? '检测中…' : '批量检测' }}</UiButton>
                <UiButton variant="primary" :loading="busy" @click="simulate"><UiSpinner v-if="busy" :size="14" />{{ busy ? '保存中…' : '保存' }}</UiButton>
                <UiButton icon variant="ghost" :loading="busy" aria-label="刷新" @click="simulate"><UiSpinner v-if="busy" :size="16" /><Icon v-else name="refresh" :size="16" /></UiButton>
            </div>
        </template>
        <template v-else-if="example === 'menu-items'">
            <div class="d-flex flex-wrap align-center ga-3">
                <UiMenu v-model:open="menuOpen">
                    <template #activator="{ props }"><UiButton v-bind="props"><Icon name="folder" :size="16" />{{ groupLabel }}<Icon name="down" :size="14" /></UiButton></template>
                    <p class="ui-menu-label">移动到分组</p>
                    <UiMenuItem v-for="item in groups" :key="item.id" :checked="group === item.id" @click="group = item.id">{{ item.label }}</UiMenuItem>
                    <hr class="ui-menu-divider" />
                    <UiMenuItem @click="snackbar.show('打开分组管理。')"><template #icon><Icon name="settings" /></template>管理分组…</UiMenuItem>
                </UiMenu>
                <UiMenu placement="bottom-start">
                    <template #activator="{ props }"><UiButton v-bind="props" variant="ghost"><Icon name="flag" :size="16" />标签 · {{ selectedTags.length }}</UiButton></template>
                    <UiMenuItem v-for="tag in tags" :key="tag.id" :checked="selectedTags.includes(tag.id)" keep-open @click="toggleTag(tag.id)">
                        <template #icon><span class="demo-swatch" :style="{ background: tag.color }"></span></template>{{ tag.label }}
                    </UiMenuItem>
                </UiMenu>
                <UiMenu placement="bottom-end">
                    <template #activator="{ props }"><UiButton v-bind="props" icon variant="ghost" aria-label="更多操作"><Icon name="more" :size="16" /></UiButton></template>
                    <UiMenuItem @click="snackbar.show('已复制凭证。')"><template #icon><Icon name="copy" /></template>复制凭证<template #trailing>Ctrl C</template></UiMenuItem>
                    <UiMenuItem @click="snackbar.show('已刷新 Token。')"><template #icon><Icon name="refresh" /></template>刷新 Token</UiMenuItem>
                    <UiMenuItem disabled><template #icon><Icon name="lock" /></template>导出（需要解锁）</UiMenuItem>
                    <hr class="ui-menu-divider" />
                    <UiMenuItem danger @click="snackbar.show('已删除示例账号。', { tone: 'error' })"><template #icon><Icon name="trash" /></template>删除账号</UiMenuItem>
                </UiMenu>
            </div>
            <output>分组：{{ groupLabel }} · 标签：{{ selectedTags.join('、') || '（无）' }}</output>
        </template>
        <template v-else-if="example === 'menu-panel'">
            <UiMenu v-model:open="panelOpen" panel placement="bottom-start" label="筛选账号">
                <template #activator="{ props }"><UiButton v-bind="props"><Icon name="search" :size="16" />筛选</UiButton></template>
                <div class="demo-filter-panel d-flex flex-column ga-3">
                    <UiField v-slot="{ controlAttrs }" label="关键字" for="demo-filter-keyword"><UiInput v-model="filterKeyword" v-bind="controlAttrs" dense placeholder="邮箱或昵称" /></UiField>
                    <UiField v-slot="{ controlAttrs }" label="状态" for="demo-filter-status"><UiSelect v-model="filterStatus" v-bind="controlAttrs" dense><option value="any">全部</option><option value="active">正常</option><option value="banned">已封禁</option></UiSelect></UiField>
                    <label class="d-flex align-center justify-space-between ga-3 text-body-2">仅显示当前账号<UiSwitch v-model="onlyActive" /></label>
                    <div class="d-flex justify-end ga-2"><UiButton size="sm" variant="ghost" @click="filterKeyword = ''; filterStatus = 'any'; onlyActive = false">重置</UiButton><UiButton size="sm" variant="primary" @click="applyFilter">应用</UiButton></div>
                </div>
            </UiMenu>
            <output>面板：{{ panelOpen ? '已打开' : '已关闭' }}</output>
        </template>
        <template v-else-if="example === 'confirm-basic'">
            <div class="d-flex flex-wrap align-center ga-2">
                <UiButton variant="danger" @click="remove"><Icon name="trash" :size="16" />删除账号</UiButton>
                <UiButton @click="logout"><Icon name="logout" :size="16" />退出登录</UiButton>
                <UiButton variant="ghost" @click="queued">连续两次确认</UiButton>
            </div>
            <output aria-live="polite">{{ result }}</output>
        </template>
        <template v-else-if="example === 'button-danger'">
            <div class="d-flex flex-wrap align-center ga-2">
                <UiButton variant="danger" @click="snackbar.show('已执行危险操作。', { tone: 'error' })"><Icon name="trash" :size="16" />删除</UiButton>
                <UiButton variant="danger" ghost @click="snackbar.show('已清空。')">清空日志</UiButton>
                <UiButton variant="danger" size="sm">移除</UiButton>
                <UiButton variant="danger" icon aria-label="删除项目"><Icon name="trash" :size="16" /></UiButton>
                <UiButton variant="danger" disabled>不可删除</UiButton>
            </div>
        </template>
        <template v-else-if="example === 'dialog-sizes'">
            <div class="d-flex flex-wrap align-center ga-2">
                <UiButton v-for="size in ['sm', 'md', 'lg', 'xl']" :key="size" @click="dialogSize = size; sizeOpen = true">{{ size }}</UiButton>
                <UiButton variant="primary" @click="drawerOpen = true"><Icon name="panelRight" :size="16" />打开抽屉</UiButton>
            </div>
            <UiDialog v-model:open="sizeOpen" :size="dialogSize" aria-labelledby="demo-size-title" class="docs-dialog">
                <h2 id="demo-size-title">宽度 · {{ dialogSize }}</h2>
                <p>弹窗宽度由 size 控制，并始终不超过视口宽度减去 40px。</p>
                <div class="d-flex justify-end mt-4"><UiButton variant="primary" @click="sizeOpen = false">关闭</UiButton></div>
            </UiDialog>
            <UiDialog v-model:open="drawerOpen" placement="end" scrollable aria-labelledby="demo-drawer-title">
                <template #header><div class="d-flex align-center justify-space-between ga-3"><h2 id="demo-drawer-title" class="ma-0 text-title">任务中心</h2><UiButton icon variant="ghost" size="sm" aria-label="关闭任务中心" @click="drawerOpen = false"><Icon name="close" :size="16" /></UiButton></div></template>
                <div class="d-flex flex-column ga-3">
                    <UiCard v-for="index in 8" :key="index" density="compact" :aria-label="`任务 ${index}`">
                        <div class="d-flex align-center justify-space-between ga-3"><strong class="text-body-1 text-truncate">批量刷新 Token · 第 {{ index }} 批</strong><UiBadge :tone="index === 1 ? 'accent' : index === 2 ? 'error' : 'success'" dense>{{ index === 1 ? '进行中' : index === 2 ? '失败' : '完成' }}</UiBadge></div>
                        <p class="ma-0 mt-1 text-body-2 text-muted">共 20 个账号 · {{ index * 3 }} 分钟前</p>
                    </UiCard>
                </div>
                <template #footer><div class="d-flex justify-end ga-2"><UiButton variant="ghost" @click="drawerOpen = false">关闭</UiButton><UiButton variant="danger">清除已完成</UiButton></div></template>
            </UiDialog>
        </template>
    </div>
</template>

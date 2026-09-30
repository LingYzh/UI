<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { UiActivity, UiButton, UiInput, UiSelect, UiSwitch, UiField, UiTabs, UiTabPanel, UiDialog, UiCollapse, UiCard, UiScrollArea, UiCodeBlock, UiIcon, UiTooltip, vRipple, snackbar } from '../index';
import Icon from '../../components/Icon.vue';
import { UiTextarea } from '../index';
import VariantExample from './VariantExample.vue';
import TableExample from './TableExample.vue';
import DiffDemo from './DiffDemo.vue';
import MarkdownDemo from './MarkdownDemo.vue';
import ConversationDemo from './ConversationDemo.vue';
import UsageMeterDemo from './UsageMeterDemo.vue';
import FeedbackDemo from './FeedbackDemo.vue';
import LocaleDemo from './LocaleDemo.vue';

const feedbackExamples = ['badge-tones', 'badge-custom', 'alert-tones', 'alert-actions', 'spinner-states', 'menu-items', 'menu-panel', 'confirm-basic', 'button-danger', 'dialog-sizes'];
const port = ref(5580);
import { reducedMotion as reduced } from './preferences';

const activityOpen = ref(true);
const props = defineProps({ example: { type: String, required: true } });
const query = ref('');
const input = ref();
const saving = ref(false);
const size = ref(13);
const density = ref('comfortable');
const permissionMode = ref('default');
const planVersion = ref('v1');
const planSubmitted = ref(false);
const planVersionItems = computed(() => [{ value: 'v1', label: planSubmitted.value ? 'v1 · 待审批' : 'v1 · 草稿', description: planSubmitted.value ? '已提交，等待审阅。' : '正在编写。' }]);
const modeItems = [
    { value: 'default', label: 'Default', description: 'Ask before making changes or running commands.' },
    { value: 'accept-edits', label: 'Accept edits', description: 'Allow file edits; ask before running commands.' },
    { value: 'plan', label: 'Plan', description: 'Explore and prepare a plan before implementation.' },
    { value: 'dont-ask', label: "Don't ask", description: 'Run allowed actions without approval prompts.' },
    { value: 'bypass', label: 'Bypass permissions', description: 'Allow all actions within the configured environment.' },
    { value: 'auto', label: 'Auto', description: 'Let the application choose its approval behavior.', disabled: true }
];
const project = ref('');
const projectError = computed(() => project.value ? '' : '请选择项目。');
const codeSample = '<script setup>\nimport { ref } from \'vue\';\nconst saved = ref(false);\n<\/script>\n\n<template>\n    <UiButton :disabled="saved" @click="saved = true">保存</UiButton>\n</template>';
const rippleEnabled = ref(true);
const dense = ref(false);
const ghost = ref(false);
const square = ref(false);
const lineCount = ref(24);
const enabled = ref(true);
const name = ref('');
const error = ref('');
const selected = ref('overview');
const draft = ref('');
const vertical = ref(false);
const indicatorStart = ref(false);
const expanded = ref(false);
const open = ref(false);
const present = ref(false);
const closes = ref(0);
const dialogLog = ref('尚未打开');
const position = ref('bottom-center');
const duration = ref(6000);
const tone = ref('success');
const message = ref('更改已保存，可继续工作。');
const lastId = ref(null);
const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
const items = [
    { id: 'overview', label: '概览', icon: 'book' },
    { id: 'unavailable', label: '尚未启用', icon: 'lock', disabled: true },
    { id: 'details', label: '详情', icon: 'file' }
];
const prefix = `docs-${props.example}`;
let saveTimer;
function save() {
    if (saving.value) return;
    saving.value = true;
    saveTimer = setTimeout(() => {
        saving.value = false;
        snackbar.show('示例保存完成。', { tone: 'success' });
    }, 1400);
}
function showNotice() {
    lastId.value = snackbar.show(message.value || '一条来自 UAH 的提示。', { position: position.value, duration: duration.value, tone: tone.value });
}
function closed() {
    closes.value++;
    dialogLog.value = 'closed · 原生弹窗已关闭，焦点已恢复';
}
onBeforeUnmount(() => clearTimeout(saveTimer));
</script>

<template>
    <div class="live-example">
        <UsageMeterDemo v-if="example === 'usage-meter-basic'" />
        <ConversationDemo v-else-if="example.startsWith('conversation-')" :example="example" />
        <MarkdownDemo v-else-if="example.startsWith('markdown-')" :example="example" />
        <DiffDemo v-else-if="example === 'diff-content'" />
        <TableExample v-else-if="['table-basic', 'table-fixed', 'table-server', 'pagination-basic', 'table-variants', 'server-variants', 'pagination-variants'].includes(example)" :example="example" />
        <VariantExample v-else-if="example.endsWith('-shared-variants')" :component="example.replace('-shared-variants', '')" />
        <template v-else-if="example === 'activity-basic'">
            <UiActivity v-model:open="activityOpen" title="思考过程" status="已完成"><p>先确认项目约束，再检查相关模块。这里展示服务返回的思考摘要，正文回答在活动之外。</p></UiActivity>
            <UiActivity title="读取 src/main.ts" status="已完成" tone="success">读取 84 行，找到应用入口。</UiActivity>
            <UiActivity title="运行 npm test" status="等待审批" tone="busy" :open="true">命令将在当前用户权限下运行。<template #actions><UiButton size="sm">批准本次</UiButton><UiButton size="sm" variant="ghost">拒绝</UiButton></template></UiActivity>
            <UiActivity title="编辑 src/main.ts" status="失败" tone="error">文件内容已变化，请重新读取后再试。</UiActivity>
        </template>
        <template v-else-if="example === 'style-variants'">
            <div class="d-flex flex-wrap ga-4 mb-4">
                <label class="d-flex align-center ga-2"><UiSwitch v-model="dense" aria-label="密集布局" />dense</label>
                <label class="d-flex align-center ga-2"><UiSwitch v-model="ghost" aria-label="幽灵表面" />ghost</label>
                <label class="d-flex align-center ga-2"><UiSwitch v-model="square" aria-label="直角边界" />rounded=false</label>
            </div>
            <UiCard class="variants-card" title="统一样式变体" subtitle="切换上方开关，观察所有控件与容器。" :dense="dense" :ghost="ghost" :rounded="!square" aria-label="统一样式变体预览">
                <UiField v-slot="{ controlAttrs }" label="工作区名称" for="variants-name"><UiInput v-model="name" v-bind="controlAttrs" :dense="dense" :ghost="ghost" :rounded="!square" placeholder="例如 UAH" /></UiField>
                <UiField v-slot="{ controlAttrs }" label="显示密度" for="variants-select"><UiSelect v-model="density" v-bind="controlAttrs" :dense="dense" :ghost="ghost" :rounded="!square"><option value="comfortable">舒适</option><option value="compact">紧凑</option></UiSelect></UiField>
                <UiTabs v-model="selected" :items="items" id-prefix="variants" :dense="dense" :ghost="ghost" :rounded="!square" aria-label="变体标签页" class="mt-4" />
                <UiTabPanel :model-value="selected" value="overview" id-prefix="variants"><p class="text-muted my-4">所有变体保留原来的键盘操作、错误态与焦点。</p></UiTabPanel>
                <UiTabPanel :model-value="selected" value="details" id-prefix="variants"><p class="text-muted my-4">通过相同属性控制密度、表面和圆角。</p></UiTabPanel>
                <UiTabPanel :model-value="selected" value="unavailable" id-prefix="variants">尚未启用。</UiTabPanel>
                <UiCodeBlock :code="codeSample" language="vue" :dense="dense" :ghost="ghost" :rounded="!square" />
                <template #actions><UiButton :dense="dense" :ghost="ghost" :rounded="!square" @click="snackbar.show('样式设置示例。')">查看反馈</UiButton></template>
            </UiCard>
        </template>
        <FeedbackDemo v-else-if="feedbackExamples.includes(example)" :example="example" />
        <LocaleDemo v-else-if="example === 'locale-switch'" />
        <template v-else-if="example === 'input-number'">
            <UiField v-slot="{ controlAttrs }" label="代理端口" :for="`${prefix}-port`" description="type=number 时模型为数字，清空为 null。"><UiInput v-model="port" v-bind="controlAttrs" type="number" min="1" max="65535" /></UiField>
            <output>{{ port === null ? 'null' : `${typeof port} · ${port}` }}</output>
        </template>
        <template v-else-if="example === 'scroll-horizontal'">
            <UiScrollArea label="横向项目" axis="horizontal" always><div class="d-flex ga-4 pa-4" style="width: max-content"><UiCard v-for="item in 12" :key="item" :title="`项目 ${item}`" density="compact" style="width: 160px">水平拖动查看。</UiCard></div></UiScrollArea>
        </template>
        <template v-else-if="example === 'textarea-instructions'">
            <div class="d-flex flex-column ga-3"><label for="demo-instructions">Agent 指令</label><UiTextarea id="demo-instructions" v-model="query" placeholder="描述职责、回答方式与任务边界…" /><UiTextarea model-value="禁用状态" disabled aria-label="禁用指令" :rows="2" /><UiTextarea model-value="待修正指令" invalid aria-label="错误指令" :rows="2" /></div>
        </template>
        <template v-else-if="example === 'tooltip-capability'">
            <div class="d-flex ga-4"><UiTooltip text="图片输入"><UiIcon name="image" /></UiTooltip><UiTooltip text="音频输入"><UiIcon name="volume" /></UiTooltip><UiTooltip text="PDF 输入"><UiIcon name="file" /></UiTooltip></div>
        </template>
        <template v-else-if="example === 'card-provider'">
            <UiCard density="compact" aria-label="紧凑服务卡片">
                <div class="d-flex align-center justify-space-between ga-3">
                    <strong class="ellipsis" title="Local Model Provider">Local Model Provider</strong>
                    <label class="d-flex align-center ga-2 small"><span>启用</span><UiSwitch v-model="expanded" aria-label="启用示例服务" /></label>
                </div>
                <p class="muted small ellipsis my-2" title="http://localhost:5580/v1">http://localhost:5580/v1</p>
                <div class="d-flex flex-wrap align-center justify-space-between ga-2">
                    <span class="muted small">OpenAI Chat · 25 个模型</span>
                    <div class="d-flex ga-1"><UiButton size="sm" variant="ghost">编辑</UiButton><UiButton size="sm" variant="ghost">删除</UiButton></div>
                </div>
                <div class="d-flex flex-wrap align-center ga-2 small muted" aria-label="模型能力示例">
                    <span v-for="item in [['image','图片输入'],['file','PDF 输入'],['volume','音频输入'],['monitor','视频输入'],['puzzle','工具调用'],['spark','推理']]" :key="item[0]" role="img" :aria-label="item[1]" :title="item[1]"><UiIcon :name="item[0]" :size="16" /></span>
                    <span>上下文 128K</span>
                </div>
            </UiCard>
        </template>
        <template v-else-if="example === 'card-form'">
            <UiCard title="工作区偏好" subtitle="保存当前工作区的显示选项。" aria-label="工作区偏好">
                <UiField v-slot="{ controlAttrs }" label="名称" for="demo-card-name"><UiInput v-model="name" v-bind="controlAttrs" placeholder="例如 UAH" /></UiField>
                <UiField v-slot="{ controlAttrs }" label="显示密度" for="demo-card-density"><UiSelect v-model="density" v-bind="controlAttrs"><option value="comfortable">舒适</option><option value="compact">紧凑</option></UiSelect></UiField>
                <template #actions><UiButton variant="ghost" @click="name = ''">清空</UiButton><UiButton variant="primary" @click="snackbar.show('示例偏好已保存。', { tone: 'success' })">保存</UiButton></template>
            </UiCard>
        </template>
        <template v-else-if="example === 'card-variants'">
            <div class="d-grid ga-4 demo-card-grid"><UiCard v-for="variant in ['outlined', 'elevated', 'tonal', 'flat']" :key="variant" :variant="variant" density="compact" :title="variant" :aria-label="variant">同一套内容与间距。</UiCard></div>
        </template>
        <template v-else-if="example === 'scroll-content'">
            <div class="d-flex ga-2 mb-4"><UiButton size="sm" @click="lineCount += 8">增加日志</UiButton><UiButton size="sm" @click="lineCount = 3">缩短日志</UiButton></div>
            <UiScrollArea label="运行日志" max-height="220px"><p v-for="line in lineCount" :key="line" class="px-4 py-2 ma-0">日志 {{ line }} · 等待任务</p></UiScrollArea>
        </template>
        <template v-else-if="example === 'code-highlight'"><UiCodeBlock :code="codeSample" language="vue" /></template>
        <template v-else-if="example === 'ripple-feedback'">
            <div class="d-flex align-center ga-2 mb-4"><UiSwitch id="ripple-enabled" v-model="rippleEnabled" /><label for="ripple-enabled">启用涟漪</label></div>
            <div class="d-flex flex-wrap ga-4"><UiButton :ripple="rippleEnabled" variant="primary">指针位置扩散</UiButton><UiButton :ripple="rippleEnabled && { center: true }">居中扩散</UiButton><button v-ripple="rippleEnabled" class="pa-4 rounded">原生按钮</button><UiButton disabled>禁用反馈</UiButton></div>
        </template>
        <template v-else-if="example === 'utility-layout'">
            <div class="d-flex align-center justify-space-between ga-4 pa-4 demo-utility"><span class="flex-grow-1">工作区</span><UiButton size="sm" @click="snackbar.show('已打开示例工作区。')">打开</UiButton></div>
        </template>
        <template v-else-if="example === 'button-variants'">
            <div class="demo-row">
                <UiButton variant="primary" @click="snackbar.show('更改已保存。', { tone: 'success' })"><Icon name="check" :size="16" />保存更改</UiButton>
                <UiButton @click="snackbar.show('已执行次要操作。')">次要操作</UiButton>
                <UiButton variant="ghost" @click="snackbar.show('已执行轻量操作。')">轻量操作</UiButton>
            </div>
        </template>
        <template v-else-if="example === 'button-states'">
            <div class="demo-row">
                <UiButton size="sm" @click="snackbar.show('紧凑按钮已点击。')">紧凑按钮</UiButton>
                <UiButton icon aria-label="添加项目" @click="snackbar.show('已添加示例项目。')"><Icon name="plus" /></UiButton>
                <UiButton disabled>不可用</UiButton>
                <UiButton :loading="saving" @click="save"><Icon :name="saving ? 'clock' : 'check'" :size="16" />{{ saving ? '正在保存…' : '模拟保存' }}</UiButton>
            </div>
            <output aria-live="polite">{{ saving ? '等待态 · disabled=true · aria-busy=true' : '就绪 · 点击“模拟保存”试验等待态' }}</output>
        </template>
        <template v-else-if="example === 'input-search'">
            <UiField v-slot="{ controlAttrs }" label="搜索" :for="`${prefix}-search`" description="支持前后插槽与原生输入属性。">
                <UiInput ref="input" v-model="query" v-bind="controlAttrs" placeholder="搜索会话、项目与设置">
                    <template #leading><Icon name="search" :size="16" /></template>
                    <template #trailing><span class="demo-count">{{ query.length }}</span></template>
                </UiInput>
            </UiField>
            <div class="demo-row"><UiButton size="sm" @click="input?.focus()">聚焦输入</UiButton><UiButton size="sm" variant="ghost" @click="query = ''">清空</UiButton></div>
            <output>输入值：{{ query || '（空）' }}</output>
        </template>
        <template v-else-if="example === 'input-states'">
            <UiField v-slot="{ controlAttrs }" label="项目名称" :for="`${prefix}-error`" error="请输入项目名称。"><UiInput v-bind="controlAttrs" invalid placeholder="例如：我的工作区" /></UiField>
            <UiField v-slot="{ controlAttrs }" label="只读能力" :for="`${prefix}-disabled`"><UiInput v-bind="controlAttrs" disabled model-value="尚未接入" /></UiField>
        </template>
        <template v-else-if="example === 'select-dynamic'">
            <UiSelect v-model="planVersion" :items="planVersionItems" aria-label="动态计划版本" />
            <UiButton class="mt-3" @click="planSubmitted = !planSubmitted">切换计划状态</UiButton>
            <output>选中值始终是 {{ planVersion }}，状态变更同步更新收起后的标签。</output>
        </template>
        <template v-else-if="example === 'select-described'">
            <UiSelect v-model="permissionMode" :items="modeItems" menu-title="Mode" compact ghost aria-label="Permission mode" />
            <output>Selected: {{ permissionMode }}</output>
        </template>
        <template v-else-if="example === 'select-groups'">
            <UiSelect v-model="draft" placeholder="选择模型" aria-label="分组模型"><optgroup v-for="group in ['Provider A', 'Provider B']" :key="group" :label="group"><option v-for="n in 20" :key="n" :value="group + n">model-{{ n }}</option></optgroup></UiSelect>
        </template>
        <template v-else-if="example === 'select-values'">
            <UiField v-slot="{ controlAttrs }" label="代码字号" :for="`${prefix}-size`"><UiSelect v-model="size" v-bind="controlAttrs"><option v-for="value in [12, 13, 14, 16]" :key="value" :value="value">{{ value }} px</option></UiSelect></UiField>
            <UiField v-slot="{ controlAttrs }" label="显示密度" :for="`${prefix}-density`"><UiSelect v-model="density" v-bind="controlAttrs" compact><option value="comfortable">舒适</option><option value="compact">紧凑</option></UiSelect></UiField>
            <output id="size-value">{{ typeof size }} · {{ size }}</output>
        </template>
        <template v-else-if="example === 'select-states'">
            <UiField v-slot="{ controlAttrs }" label="需要选择的项目" :for="`${prefix}-project`" :error="projectError">
                <UiSelect v-model="project" v-bind="controlAttrs" :invalid="Boolean(projectError)"><option value="">请选择项目</option><option value="uah">UAH 工作台</option></UiSelect>
            </UiField>
            <UiField v-slot="{ controlAttrs }" label="不可用的选择" :for="`${prefix}-disabled`"><UiSelect model-value="unavailable" disabled v-bind="controlAttrs"><option value="unavailable">尚未启用</option></UiSelect></UiField>
            <output>选中项目：{{ project || '（未选择）' }}</output>
        </template>
        <template v-else-if="example === 'switch-preference' || example === 'motion-toggle'">
            <UiField v-slot="{ controlAttrs }" label="示例减少动效" :for="`${prefix}-motion`" description="影响当前文档；与顶部偏好同步，系统偏好仍独立生效。"><UiSwitch v-model="reduced" v-bind="controlAttrs" /></UiField>
            <output>应用减少动效：{{ reduced ? '已开启' : '未开启' }}</output>
        </template>
        <template v-else-if="example === 'switch-states'">
            <UiField v-slot="{ controlAttrs }" label="启用通知" :for="`${prefix}-enabled`"><UiSwitch v-model="enabled" v-bind="controlAttrs" /></UiField>
            <div class="demo-row"><span>禁用 · 关</span><UiSwitch :model-value="false" disabled aria-label="禁用的关闭状态" /><span>禁用 · 开</span><UiSwitch :model-value="true" disabled aria-label="禁用的开启状态" /></div>
            <output>{{ enabled ? '通知已启用' : '通知已关闭' }}</output>
        </template>
        <template v-else-if="example === 'field-validation'">
            <UiField v-slot="{ controlAttrs }" label="项目名称" :for="`${prefix}-name`" description="2 个字符以上，便于识别。" :error="error"><UiInput v-model="name" v-bind="controlAttrs" :invalid="Boolean(error)" placeholder="给工作区起个名字" /></UiField>
            <div class="demo-row"><UiButton @click="error = name.trim().length < 2 ? '请至少输入 2 个字符。' : ''">校验名称</UiButton><span v-if="name.trim().length >= 2 && !error" class="demo-success">名称可用</span></div>
        </template>
        <template v-else-if="example === 'field-heading'">
            <UiField label="运行环境" description="UAH 桌面工作台"><span class="demo-value">本地工作区</span></UiField>
        </template>
        <template v-else-if="['tabs-soft', 'tabs-variants', 'panel-persistence'].includes(example)">
            <div v-if="example === 'tabs-variants'" class="demo-row"><UiSwitch v-model="vertical" :id="`${prefix}-vertical`" /><label :for="`${prefix}-vertical`">垂直布局</label></div>
            <div v-if="example === 'tabs-variants' && vertical" class="demo-row"><UiSwitch v-model="indicatorStart" :id="`${prefix}-indicator`" /><label :for="`${prefix}-indicator`">内容放在左侧</label></div>
            <div :class="{ 'demo-vertical': vertical, 'demo-content-first': vertical && indicatorStart }">
                <UiTabs v-model="selected" :items="items" :id-prefix="prefix" variant="underline" :orientation="vertical ? 'vertical' : 'horizontal'" :indicator-side="indicatorStart ? 'start' : 'end'" aria-label="示例标签页">
                    <template v-if="example === 'tabs-variants'" #default="{ item }"><Icon :name="item.icon" :size="15" />{{ item.label }}</template>
                </UiTabs>
                <div class="demo-panels">
                    <UiTabPanel :model-value="selected" value="overview" :id-prefix="prefix"><p>概览内容 · 切换时保留组件状态。</p><UiInput v-if="example === 'panel-persistence'" v-model="draft" aria-label="面板草稿" placeholder="在这里输入，再切换面板" /></UiTabPanel>
                    <UiTabPanel :model-value="selected" value="unavailable" :id-prefix="prefix">尚未启用。</UiTabPanel>
                    <UiTabPanel :model-value="selected" value="details" :id-prefix="prefix"><p>详情内容 · 标签与面板通过 ARIA 关联。</p><span class="demo-value">当前工作区 · UAH</span></UiTabPanel>
                </div>
            </div>
            <output>选中：{{ selected }}{{ example === 'panel-persistence' ? ` · 草稿：${draft || '（空）'}` : '' }}</output>
        </template>
        <template v-else-if="example === 'dialog-scrollable'">
            <UiButton @click="open = true; error = ''">打开长表单弹窗</UiButton>
            <UiDialog v-model:open="open" scrollable :error="error" :aria-labelledby="`${prefix}-title`">
                <template #header><h2 :id="`${prefix}-title`">固定提示与内部滚动</h2></template>
                <div class="d-flex flex-column ga-4">
                    <UiField v-for="number in 18" :key="number" v-slot="{ controlAttrs }" :label="`示例字段 ${number}`" :for="`${prefix}-field-${number}`"><UiInput v-bind="controlAttrs" placeholder="滚动查看其余字段" /></UiField>
                    <UiButton @click="error = '读取失败：请检查服务地址与认证信息。此提示始终留在弹窗顶部。'">显示顶部错误</UiButton>
                </div>
                <template #footer><div class="d-flex justify-end ga-2"><UiButton @click="error = ''">清除错误</UiButton><UiButton variant="primary" @click="open = false">关闭长表单</UiButton></div></template>
            </UiDialog>
        </template>
        <template v-else-if="example === 'dialog-lifecycle'">
            <UiButton @click="open = true"><Icon name="panel" :size="16" />打开示例弹窗</UiButton>
            <output id="dialog-status" aria-live="polite">{{ present ? '弹窗占用中' : '已关闭' }} · {{ closes }}</output>
            <output>{{ dialogLog }}</output>
            <UiDialog v-model:open="open" :aria-labelledby="`${prefix}-title`" class="docs-dialog" @present-change="present = $event" @opened="dialogLog = 'opened · 进入动效完成'" @closed="closed">
                <p class="docs-dialog-kicker">UAH / DIALOG</p><h2 :id="`${prefix}-title`">共享弹窗</h2>
                <p>按 Esc、点击遮罩或关闭按钮结束。退出动画完成后恢复焦点。</p>
                <UiInput autofocus aria-label="弹窗输入" placeholder="试试键盘操作" />
                <div class="demo-row"><UiButton variant="primary" @click="open = false">关闭弹窗</UiButton></div>
            </UiDialog>
        </template>
        <template v-else-if="example === 'collapse-content'">
            <UiButton :aria-expanded="expanded" :aria-controls="`${prefix}-content`" @click="expanded = !expanded"><Icon :name="expanded ? 'minus' : 'plus'" :size="16" />{{ expanded ? '收起高级选项' : '展开高级选项' }}</UiButton>
            <UiCollapse :id="`${prefix}-content`" :open="expanded"><div class="demo-collapse-body"><p>这个区域保留实例，关闭后立即阻止交互。</p><UiInput v-model="draft" aria-label="高级选项草稿" placeholder="输入会在折叠后保留" /></div></UiCollapse>
            <output>open={{ expanded }} · 草稿：{{ draft || '（空）' }}</output>
        </template>
        <template v-else-if="example === 'snackbar-playground' || example === 'snackbar-service'">
            <UiField v-slot="{ controlAttrs }" label="提示内容" :for="`${prefix}-message`"><UiInput v-model="message" v-bind="controlAttrs" /></UiField>
            <div class="demo-options">
                <UiField v-slot="{ controlAttrs }" label="提示方位" :for="`${prefix}-position`"><UiSelect v-model="position" v-bind="controlAttrs"><option v-for="value in positions" :key="value" :value="value">{{ value }}</option></UiSelect></UiField>
                <UiField v-slot="{ controlAttrs }" label="提示时长" :for="`${prefix}-duration`"><UiSelect v-model="duration" v-bind="controlAttrs"><option :value="6000">6 秒</option><option :value="800">0.8 秒</option><option :value="0">手动关闭</option></UiSelect></UiField>
                <UiField v-slot="{ controlAttrs }" label="提示类型" :for="`${prefix}-tone`"><UiSelect v-model="tone" v-bind="controlAttrs"><option value="success">成功</option><option value="info">信息</option><option value="error">错误</option></UiSelect></UiField>
            </div>
            <div class="demo-row"><UiButton variant="primary" @click="showNotice">显示提示</UiButton><UiButton :disabled="lastId === null" @click="snackbar.dismiss(lastId)">撤销上一条</UiButton><UiButton variant="ghost" @click="snackbar.clear()">清空提示</UiButton></div>
            <output aria-live="polite">{{ lastId === null ? '尚未创建提示' : `最近提示 id：${lastId}` }}</output>
        </template>
    </div>
</template>

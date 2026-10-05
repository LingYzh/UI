<script setup>
import { computed, ref } from 'vue';
import FormDemo from './FormDemo.vue';
import { mdiDatabaseOutline } from '@mdi/js';
import {
    UiContainer, UiRow, UiCol, UiSpacer, UiForm, UiFormSection, UiFormActions, UiField,
    UiInput, UiTextarea, UiSelect, UiSwitch, UiButton, UiIcon, UiDialog, UiCard, UiMenu, UiMenuItem, UiCheckbox, UiRadio, UiColorSwatches, UiTabs, UiTabPanel, UiActivity, confirmDialog
} from '../index';
defineProps({ example: { type: String, required: true } });
const density = ref('comfortable');
const name = ref('UAH 工作区');
const model = ref('default');
const description = ref('先阅读项目约定，再开始实现。');
const enabled = ref(true);
const status = ref('');
const dialog = ref(false);
const draft = ref('');
const disabled = ref(false);
const readonly = ref(false);
const invalid = ref(false);
const dense = ref(false);
const autoGrow = ref(true);
const noGutters = ref(false);
const align = ref('center');
const justify = ref('start');
const previewWidth = ref('320');
const installPath = ref('C:/Program Files/Codex/codex.exe');
const args = ref('["app-server", "--stdio"]');
const compare = ref('同一套边框、圆角和字号');
const selectedTab = ref('first');
const choice = ref('a');
const color = ref(null);
const textareaMode = computed(() => ({ disabled: disabled.value, readonly: readonly.value, invalid: invalid.value, dense: dense.value }));
const mdiNames = ['mdi-account', 'mdi-home-outline', 'mdi-folder-outline', 'mdi-cog-outline', 'mdi-view-grid-outline', 'mdi-form-textbox', 'mdi-text-box-outline', 'mdi-alert-circle-outline', 'mdi-plus', 'mdi-check', 'mdi-close', 'mdi-magnify'];
function reset() { name.value = 'UAH 工作区'; model.value = 'default'; description.value = '先阅读项目约定，再开始实现。'; enabled.value = true; status.value = ''; }
async function confirm() { status.value = await confirmDialog({ title: '保存配置', message: '这是真实 UiConfirmHost 的交互演示。' }) ? '已确认' : '已取消'; }
</script>

<template>
    <div class="layout-demo">
        <FormDemo v-if="example.startsWith('layout-form-')" :example="example" />
        <template v-else-if="example === 'layout-focus'">
            <p>点击或触摸完成动作后释放焦点；用 Tab 聚焦后操作会保留键盘焦点。输入框在编辑时保持聚焦。</p>
            <div class="layout-demo-toolbar">
                <label>
                    <UiSwitch v-model="enabled" />
                    焦点示例开关
                </label>
                <UiCheckbox v-model="enabled">焦点示例复选框</UiCheckbox>
                <UiRadio v-model="choice" name="focus-choice" value="a">选项 A</UiRadio>
                <UiRadio v-model="choice" name="focus-choice" value="b">选项 B</UiRadio>
                <UiButton @click="status = '动作已执行'">执行动作</UiButton>
            </div>
            <UiTabs v-model="selectedTab" id-prefix="focus-demo" :items="[{ id: 'first', label: '第一项' }, { id: 'second', label: '第二项' }]" />
            <UiTabPanel :model-value="selectedTab" value="first" id-prefix="focus-demo">第一项内容</UiTabPanel>
            <UiTabPanel :model-value="selectedTab" value="second" id-prefix="focus-demo">第二项内容</UiTabPanel>
            <UiColorSwatches v-model="color" label="焦点示例色板" class="my-4" />
            <UiActivity title="焦点示例折叠">展开后标题按钮不保留指针焦点。</UiActivity>
            <UiForm class="mt-4">
                <UiRow>
                    <UiCol :cols="12">
                        <UiInput v-model="compare"  label="保持编辑焦点" id="focus-edit" />
                    </UiCol>
                </UiRow>
            </UiForm>
            <p role="status">{{ status }}</p>
        </template>
        <template v-else-if="['layout-grid', 'layout-container', 'layout-col', 'layout-row'].includes(example)">
            <div class="layout-demo-toolbar">
                <UiSelect v-model="density" inline aria-label="栅格密度" :items="[{ value: 'default', label: '默认 · 24px' }, { value: 'comfortable', label: '舒适 · 16px' }, { value: 'compact', label: '紧凑 · 8px' }]" />
                <span>缩窄窗口查看列换行</span>
            </div>
            <UiContainer fluid class="layout-demo-container">
                <UiRow :density="density" class="layout-demo-main-grid">
                    <UiCol :cols="12" :md="6">
                        <UiCard title="基本信息" subtitle="cols=12 / md=6">
                            <p>窄屏一列，宽屏两列。列间距由 Row 统一管理。</p>
                        </UiCard>
                    </UiCol>
                    <UiCol :cols="12" :md="6">
                        <UiCard title="运行设置" subtitle="cols=12 / md=6">
                            <p>长内容允许换行，不挤压旁边的列。</p>
                        </UiCard>
                    </UiCol>
                    <UiCol :cols="12" :md="8">
                        <UiCard title="指令与说明" subtitle="cols=12 / md=8">
                            <p>长字段使用更宽列，保留清晰的阅读宽度。</p>
                        </UiCard>
                    </UiCol>
                    <UiCol :cols="12" :md="4">
                        <UiCard title="辅助信息" subtitle="cols=12 / md=4">
                            <p>不同列宽也使用统一间距。</p>
                        </UiCard>
                    </UiCol>
                </UiRow>
                <UiRow :size="5" density="compact" class="layout-demo-fractions">
                    <UiCol cols="2/5">
                        <div class="layout-demo-cell">2 / 5</div>
                    </UiCol>
                    <UiCol cols="3/5">
                        <div class="layout-demo-cell">3 / 5</div>
                    </UiCol>
                </UiRow>
                <UiRow density="compact" class="layout-demo-offset">
                    <UiCol :cols="6" :offset="3">
                        <div class="layout-demo-cell">cols 6 · offset 3</div>
                    </UiCol>
                </UiRow>
                <UiRow density="compact" class="layout-demo-order">
                    <UiCol :cols="6" :order="2">
                        <div class="layout-demo-cell">视觉顺序 2</div>
                    </UiCol>
                    <UiCol :cols="6" :order="1">
                        <div class="layout-demo-cell">视觉顺序 1</div>
                    </UiCol>
                </UiRow>
                <UiRow class="layout-demo-nested">
                    <UiCol :cols="12">
                        <UiRow density="compact">
                            <UiCol>
                                <div class="layout-demo-cell">嵌套等分 A</div>
                            </UiCol>
                            <UiCol>
                                <div class="layout-demo-cell">嵌套等分 B</div>
                            </UiCol>
                        </UiRow>
                    </UiCol>
                </UiRow>
            </UiContainer>
        </template>
        <template v-else-if="example === 'layout-grid-advanced'">
            <div class="layout-demo-toolbar">
                <label>
                    <UiSwitch v-model="noGutters" />
                    无间距
                </label>
                <UiSelect v-model="align" inline aria-label="交叉轴对齐" :items="['start', 'center', 'end', 'stretch', 'baseline'].map(value => ({ value, label: value }))" />
                <UiSelect v-model="justify" inline aria-label="主轴对齐" :items="['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'].map(value => ({ value, label: value }))" />
            </div>
            <UiRow :no-gutters="noGutters" :align="align" :justify="justify" class="layout-demo-advanced-row">
                <UiCol cols="auto">
                    <div class="layout-demo-cell">auto</div>
                </UiCol>
                <UiCol :cols="4">
                    <div class="layout-demo-cell py-8">固定 4 列</div>
                </UiCol>
                <UiCol>
                    <div class="layout-demo-cell">等分剩余空间</div>
                </UiCol>
            </UiRow>
            <UiRow density="compact" class="layout-demo-all-breakpoints">
                <UiCol v-for="index in 6" :key="index" :cols="12" :sm="6" :md="4" :lg="3" :xl="2" :xxl="1">
                    <div class="layout-demo-cell">
                        列
                        {{ index }}
                        <br />
                        12 / 6 / 4 / 3 / 2 / 1
                    </div>
                </UiCol>
            </UiRow>
        </template>
        <template v-else-if="example === 'layout-widths'">
            <div class="layout-demo-toolbar">
                <UiSelect v-model="previewWidth" inline aria-label="控件区域宽度" :items="[{ value: '240', label: '240px 容器' }, { value: '320', label: '320px 容器' }, { value: '480', label: '480px 容器' }]" />
                <span>控件未指定宽度，跟随可用空间</span>
            </div>
            <UiForm :style="{ width: `${previewWidth}px`, maxWidth: '100%' }" aria-label="默认宽度演示">
                <UiRow>
                    <UiCol :cols="12">
                        <UiInput v-model="compare"  label="默认输入宽度" id="width-input" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiSelect v-model="model" :items="[{ value: 'default', label: '长选项也受父容器约束，不扩展整页' }]"  label="默认选择宽度" id="width-select" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiTextarea v-model="description" :rows="3"  label="默认多行宽度" id="width-textarea" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiSwitch v-model="enabled"  label="开关保持内容宽度" id="width-switch" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiInput v-model="name" :max-width="200"  label="宽度上限 200px" id="width-limited" />
                    </UiCol>
                </UiRow>
            </UiForm>
            <div class="layout-demo-toolbar mt-4">
                <UiSelect v-model="model" inline aria-label="工具栏选择" :items="[{ value: 'default', label: '内容宽度' }]" />
                <UiInput v-model="name" inline :width="160" aria-label="工具栏输入" />
                <UiButton>工具栏操作</UiButton>
            </div>
        </template>
        <template v-else-if="example === 'layout-spacer'">
            <div class="layout-demo-toolbar">
                <UiIcon name="folder" />
                <span>项目设置</span>
                <UiSpacer />
                <UiButton>关闭</UiButton>
                <UiButton variant="primary">保存</UiButton>
            </div>
        </template>
        <template v-else-if="example === 'layout-form'">
            <UiForm aria-label="工作区配置" @submit="status = '配置已保存'">
                <UiRow>
                    <UiCol :cols="12">
                        <UiFormSection title="基本信息" description="先填写识别信息，相关字段放在同一组。">
                            <UiRow>
                                <UiCol :cols="12" :sm="6">
                                    <UiInput v-model="name" placeholder="请输入名称"  label="工作区名称" id="layout-name" required hint="名称用于识别工作区。" />
                                </UiCol>
                                <UiCol :cols="12" :sm="6">
                                    <UiSelect v-model="model" :items="[{ value: 'default', label: '继承会话默认模型' }, { value: 'custom', label: '自定义模型' }]"  label="默认模型" id="layout-model" />
                                </UiCol>
                                <UiCol :cols="12">
                                    <UiTextarea v-model="description" :rows="3" auto-grow :max-rows="8" counter maxlength="200"  label="用途说明" id="layout-description" hint="长文本跨整行，避免被压缩成狭长文本框。" />
                                </UiCol>
                            </UiRow>
                        </UiFormSection>
                    </UiCol>
                    <UiCol :cols="12">
                        <UiFormSection title="运行设置" description="开关保持在所属字段下方，不与长说明争抢空间。">
                            <UiRow>
                                <UiCol :cols="12">
                                    <UiSwitch v-model="enabled"  label="启用工作区" id="layout-enabled" hint="停用后仍保留已保存的配置。" />
                                </UiCol>
                            </UiRow>
                        </UiFormSection>
                    </UiCol>
                    <UiCol :cols="12">
                        <UiFormActions>
                            <UiFormActions>
                                <template #leading>
                                    <span role="status">{{ status || '更改只影响此演示' }}</span>
                                </template>
                                <UiButton @click="reset">重置表单</UiButton>
                                <UiButton variant="primary" type="submit">保存配置</UiButton>
                            </UiFormActions>
                        </UiFormActions>
                    </UiCol>
                </UiRow>
            </UiForm>
            <UiButton class="mt-4" @click="dialog = true">在弹窗中预览</UiButton>
            <UiDialog v-model:open="dialog" size="md" scrollable aria-labelledby="layout-dialog-title">
                <template #header>
                    <h2 id="layout-dialog-title" class="ma-0 text-lg">弹窗中的表单</h2>
                </template>
                <UiForm label-position="left" aria-label="弹窗配置" @submit="status = '弹窗配置已保存'">
                    <UiRow>
                        <UiCol :cols="12">
                            <UiInput v-model="installPath"  label="安装路径" id="dialog-path" hint="按弹窗自身宽度降为竖排。" />
                        </UiCol>
                        <UiCol :cols="12">
                            <UiTextarea v-model="args" :rows="3"  label="启动参数" id="dialog-args" />
                        </UiCol>
                        <UiCol :cols="12">
                            <UiFormActions>
                                <UiFormActions>
                                    <UiButton @click="dialog = false">关闭预览</UiButton>
                                </UiFormActions>
                            </UiFormActions>
                        </UiCol>
                    </UiRow>
                </UiForm>
            </UiDialog>
        </template>
        <template v-else-if="example === 'layout-horizontal'">
            <UiForm label-position="left" aria-label="安装配置">
                <UiRow>
                    <UiCol :cols="12">
                        <UiFormSection title="安装与启动" description="所有标签使用同一列宽；在窄容器中自动上下排列。">
                            <UiRow>
                                <UiCol :cols="12">
                                    <UiInput v-model="installPath"  label="安装路径" id="layout-path" hint="使用已检测到的可执行文件。" />
                                </UiCol>
                                <UiCol :cols="12">
                                    <UiTextarea v-model="args" :rows="3"  label="启动参数" id="layout-args" hint="多行输入与单行输入共享外观。" />
                                </UiCol>
                                <UiCol :cols="12">
                                    <UiSwitch v-model="enabled"  label="允许委派" id="layout-delegation" hint="说明位于开关下方，与输入控件保持一致。" />
                                </UiCol>
                            </UiRow>
                        </UiFormSection>
                    </UiCol>
                </UiRow>
            </UiForm>
        </template>
        <template v-else-if="example === 'layout-actions'">
            <UiFormActions>
                <template #leading>配置尚未保存</template>
                <UiButton>取消</UiButton>
                <UiButton variant="primary">保存更改</UiButton>
            </UiFormActions>
        </template>
        <template v-else-if="example === 'layout-icons'">
            <div class="layout-demo-icons">
                <div v-for="icon in mdiNames" :key="icon">
                    <UiIcon :name="icon" :size="24" />
                    <code>{{ icon }}</code>
                </div>
            </div>
            <div class="layout-demo-toolbar mt-4">
                <UiIcon name="folder" label="原型文件夹" />
                <span>原型图标</span>
                <UiIcon :path="mdiDatabaseOutline" label="数据库" :size="24" />
                <span>按需导入路径</span>
                <UiSpacer />
                <UiButton>
                    <UiIcon name="mdi-plus" />
                    新增配置
                </UiButton>
            </div>
        </template>
        <template v-else-if="example === 'textarea-grow'">
            <div class="layout-demo-toolbar">
                <label>
                    <UiSwitch v-model="dense" />
                    紧凑
                </label>
                <label>
                    <UiSwitch v-model="disabled" />
                    禁用
                </label>
                <label>
                    <UiSwitch v-model="readonly" />
                    只读
                </label>
                <label>
                    <UiSwitch v-model="invalid" />
                    错误
                </label>
                <label>
                    <UiSwitch v-model="autoGrow" />
                    自动增高
                </label>
            </div>
            <UiForm aria-label="输入样式比较">
                <UiRow>
                    <UiCol :cols="12" :sm="6">
                        <UiInput v-model="compare" v-bind="textareaMode"  label="单行文本" id="compare-input" />
                    </UiCol>
                    <UiCol :cols="12" :sm="6">
                        <UiTextarea v-model="compare" v-bind="textareaMode" :rows="1" no-resize  label="多行文本" id="compare-textarea" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiTextarea v-model="draft" v-bind="textareaMode" :rows="3" :auto-grow="autoGrow" :max-rows="8" counter maxlength="500" placeholder="在这里输入多行文本…"  label="自动增高指令" id="grow-textarea" hint="输入或粘贴多行内容，最低 3 行、最多 8 行；字数限制 500。" />
                    </UiCol>
                </UiRow>
            </UiForm>
            <div class="layout-demo-toolbar mt-4">
                <UiButton @click="draft = Array.from({ length: 14 }, (_, i) => `第 ${i + 1} 行：这是用于演示高度上限的文本。`).join('\n')">填入长文本</UiButton>
                <UiButton @click="draft = ''">清空文本</UiButton>
                <span>观察高度随内容收缩</span>
            </div>
        </template>
        <template v-else-if="example === 'layout-menu-item'">
            <UiMenu>
                <template #activator="{ props }">
                    <UiButton v-bind="props">操作菜单</UiButton>
                </template>
                <UiMenuItem @click="status = '已选择编辑'">
                    <template #icon>
                        <UiIcon name="mdi-pencil-outline" />
                    </template>
                    编辑配置
                </UiMenuItem>
                <UiMenuItem disabled>暂不可用</UiMenuItem>
                <UiMenuItem :checked="enabled" keep-open @click="enabled = !enabled">启用</UiMenuItem>
                <UiMenuItem danger @click="status = '已选择删除'">删除</UiMenuItem>
            </UiMenu>
            <p role="status">{{ status }}</p>
        </template>
        <template v-else-if="example === 'layout-confirm-host'">
            <UiButton @click="confirm">打开确认对话框</UiButton>
            <p role="status">{{ status || 'Host 已挂载在文档根组件' }}</p>
            <span class="text-muted">UiConfirmHost 由文档根节点唯一挂载，当前示例调用真实确认服务。</span>
        </template>
    </div>
</template>

<style scoped>
.layout-demo { min-width: 0; width: 100%; }
.layout-demo-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; color: var(--muted); font-size: 12px; margin-block-end: 20px; }
.layout-demo-toolbar label { display: flex; align-items: center; gap: 7px; }
.layout-demo-container { padding: 0; }
.layout-demo-main-grid .ui-card { height: 100%; box-sizing: border-box; }
.layout-demo-main-grid p { margin: 8px 0 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
.layout-demo-fractions, .layout-demo-offset, .layout-demo-order, .layout-demo-nested { margin-block-start: 16px; }
.layout-demo-all-breakpoints { margin-block-start: 20px; }
.layout-demo-cell { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--soft); text-align: center; font-size: 12px; }
.layout-demo-icons { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.layout-demo-icons > div { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--line); border-radius: 8px; min-width: 0; }
.layout-demo-icons code { font-size: 10px; overflow-wrap: anywhere; }
</style>

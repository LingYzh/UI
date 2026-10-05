<script setup>
import { computed, ref } from 'vue';
import FormDemo from './FormDemo.vue';
import { mdiDatabaseOutline } from '@mdi/js';
import {
    UContainer, URow, UCol, USpacer, UForm, UFormSection, UFormActions, UField,
    UTextField, UTextarea, USelect, USwitch, UButton, UIcon, UDialog, UCard, UMenu, UMenuItem, UCheckbox, URadio, UColorSwatches, UTabs, UTabPanel, UActivity, confirmDialog
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
async function confirm() { status.value = await confirmDialog({ title: '保存配置', message: '这是真实 UConfirmHost 的交互演示。' }) ? '已确认' : '已取消'; }
</script>

<template>
    <div class="layout-demo">
        <FormDemo v-if="example.startsWith('layout-form-')" :example="example" />
        <template v-else-if="example === 'layout-focus'">
            <p>点击或触摸完成动作后释放焦点；用 Tab 聚焦后操作会保留键盘焦点。输入框在编辑时保持聚焦。</p>
            <div class="layout-demo-toolbar">
                <label>
                    <u-switch v-model="enabled" />
                    焦点示例开关
                </label>
                <u-checkbox v-model="enabled">焦点示例复选框</u-checkbox>
                <u-radio v-model="choice" name="focus-choice" value="a">选项 A</u-radio>
                <u-radio v-model="choice" name="focus-choice" value="b">选项 B</u-radio>
                <u-button @click="status = '动作已执行'">执行动作</u-button>
            </div>
            <u-tabs v-model="selectedTab" id-prefix="focus-demo" :items="[{ id: 'first', label: '第一项' }, { id: 'second', label: '第二项' }]" />
            <u-tab-panel :model-value="selectedTab" value="first" id-prefix="focus-demo">第一项内容</u-tab-panel>
            <u-tab-panel :model-value="selectedTab" value="second" id-prefix="focus-demo">第二项内容</u-tab-panel>
            <u-color-swatches v-model="color" label="焦点示例色板" class="my-4" />
            <u-activity title="焦点示例折叠">展开后标题按钮不保留指针焦点。</u-activity>
            <u-form class="mt-4">
                <u-row>
                    <u-col :cols="12">
                        <u-text-field v-model="compare"  label="保持编辑焦点" id="focus-edit" />
                    </u-col>
                </u-row>
            </u-form>
            <p role="status">{{ status }}</p>
        </template>
        <template v-else-if="['layout-grid', 'layout-container', 'layout-col', 'layout-row'].includes(example)">
            <div class="layout-demo-toolbar">
                <u-select v-model="density" inline aria-label="栅格密度" :items="[{ value: 'default', label: '默认 · 24px' }, { value: 'comfortable', label: '舒适 · 16px' }, { value: 'compact', label: '紧凑 · 8px' }]" />
                <span>缩窄窗口查看列换行</span>
            </div>
            <u-container fluid class="layout-demo-container">
                <u-row :density="density" class="layout-demo-main-grid">
                    <u-col :cols="12" :md="6">
                        <u-card title="基本信息" subtitle="cols=12 / md=6">
                            <p>窄屏一列，宽屏两列。列间距由 Row 统一管理。</p>
                        </u-card>
                    </u-col>
                    <u-col :cols="12" :md="6">
                        <u-card title="运行设置" subtitle="cols=12 / md=6">
                            <p>长内容允许换行，不挤压旁边的列。</p>
                        </u-card>
                    </u-col>
                    <u-col :cols="12" :md="8">
                        <u-card title="指令与说明" subtitle="cols=12 / md=8">
                            <p>长字段使用更宽列，保留清晰的阅读宽度。</p>
                        </u-card>
                    </u-col>
                    <u-col :cols="12" :md="4">
                        <u-card title="辅助信息" subtitle="cols=12 / md=4">
                            <p>不同列宽也使用统一间距。</p>
                        </u-card>
                    </u-col>
                </u-row>
                <u-row :size="5" density="compact" class="layout-demo-fractions">
                    <u-col cols="2/5">
                        <div class="layout-demo-cell">2 / 5</div>
                    </u-col>
                    <u-col cols="3/5">
                        <div class="layout-demo-cell">3 / 5</div>
                    </u-col>
                </u-row>
                <u-row density="compact" class="layout-demo-offset">
                    <u-col :cols="6" :offset="3">
                        <div class="layout-demo-cell">cols 6 · offset 3</div>
                    </u-col>
                </u-row>
                <u-row density="compact" class="layout-demo-order">
                    <u-col :cols="6" :order="2">
                        <div class="layout-demo-cell">视觉顺序 2</div>
                    </u-col>
                    <u-col :cols="6" :order="1">
                        <div class="layout-demo-cell">视觉顺序 1</div>
                    </u-col>
                </u-row>
                <u-row class="layout-demo-nested">
                    <u-col :cols="12">
                        <u-row density="compact">
                            <u-col>
                                <div class="layout-demo-cell">嵌套等分 A</div>
                            </u-col>
                            <u-col>
                                <div class="layout-demo-cell">嵌套等分 B</div>
                            </u-col>
                        </u-row>
                    </u-col>
                </u-row>
            </u-container>
        </template>
        <template v-else-if="example === 'layout-grid-advanced'">
            <div class="layout-demo-toolbar">
                <label>
                    <u-switch v-model="noGutters" />
                    无间距
                </label>
                <u-select v-model="align" inline aria-label="交叉轴对齐" :items="['start', 'center', 'end', 'stretch', 'baseline'].map(value => ({ value, label: value }))" />
                <u-select v-model="justify" inline aria-label="主轴对齐" :items="['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'].map(value => ({ value, label: value }))" />
            </div>
            <u-row :no-gutters="noGutters" :align="align" :justify="justify" class="layout-demo-advanced-row">
                <u-col cols="auto">
                    <div class="layout-demo-cell">auto</div>
                </u-col>
                <u-col :cols="4">
                    <div class="layout-demo-cell py-8">固定 4 列</div>
                </u-col>
                <u-col>
                    <div class="layout-demo-cell">等分剩余空间</div>
                </u-col>
            </u-row>
            <u-row density="compact" class="layout-demo-all-breakpoints">
                <u-col v-for="index in 6" :key="index" :cols="12" :sm="6" :md="4" :lg="3" :xl="2" :xxl="1">
                    <div class="layout-demo-cell">
                        列
                        {{ index }}
                        <br />
                        12 / 6 / 4 / 3 / 2 / 1
                    </div>
                </u-col>
            </u-row>
        </template>
        <template v-else-if="example === 'layout-widths'">
            <div class="layout-demo-toolbar">
                <u-select v-model="previewWidth" inline aria-label="控件区域宽度" :items="[{ value: '240', label: '240px 容器' }, { value: '320', label: '320px 容器' }, { value: '480', label: '480px 容器' }]" />
                <span>控件未指定宽度，跟随可用空间</span>
            </div>
            <u-form :style="{ width: `${previewWidth}px`, maxWidth: '100%' }" aria-label="默认宽度演示">
                <u-row>
                    <u-col :cols="12">
                        <u-text-field v-model="compare"  label="默认输入宽度" id="width-input" />
                    </u-col>
                    <u-col :cols="12">
                        <u-select v-model="model" :items="[{ value: 'default', label: '长选项也受父容器约束，不扩展整页' }]"  label="默认选择宽度" id="width-select" />
                    </u-col>
                    <u-col :cols="12">
                        <u-textarea v-model="description" :rows="3"  label="默认多行宽度" id="width-textarea" />
                    </u-col>
                    <u-col :cols="12">
                        <u-switch v-model="enabled"  label="开关保持内容宽度" id="width-switch" />
                    </u-col>
                    <u-col :cols="12">
                        <u-text-field v-model="name" :max-width="200"  label="宽度上限 200px" id="width-limited" />
                    </u-col>
                </u-row>
            </u-form>
            <div class="layout-demo-toolbar mt-4">
                <u-select v-model="model" inline aria-label="工具栏选择" :items="[{ value: 'default', label: '内容宽度' }]" />
                <u-text-field v-model="name" inline :width="160" aria-label="工具栏输入" />
                <u-button>工具栏操作</u-button>
            </div>
        </template>
        <template v-else-if="example === 'layout-spacer'">
            <div class="layout-demo-toolbar">
                <u-icon name="folder" />
                <span>项目设置</span>
                <u-spacer />
                <u-button>关闭</u-button>
                <u-button variant="primary">保存</u-button>
            </div>
        </template>
        <template v-else-if="example === 'layout-form'">
            <u-form aria-label="工作区配置" @submit="status = '配置已保存'">
                <u-row>
                    <u-col :cols="12">
                        <u-form-section title="基本信息" description="先填写识别信息，相关字段放在同一组。">
                            <u-row>
                                <u-col :cols="12" :sm="6">
                                    <u-text-field v-model="name" placeholder="请输入名称"  label="工作区名称" id="layout-name" required hint="名称用于识别工作区。" />
                                </u-col>
                                <u-col :cols="12" :sm="6">
                                    <u-select v-model="model" :items="[{ value: 'default', label: '继承会话默认模型' }, { value: 'custom', label: '自定义模型' }]"  label="默认模型" id="layout-model" />
                                </u-col>
                                <u-col :cols="12">
                                    <u-textarea v-model="description" :rows="3" auto-grow :max-rows="8" counter maxlength="200"  label="用途说明" id="layout-description" hint="长文本跨整行，避免被压缩成狭长文本框。" />
                                </u-col>
                            </u-row>
                        </u-form-section>
                    </u-col>
                    <u-col :cols="12">
                        <u-form-section title="运行设置" description="开关保持在所属字段下方，不与长说明争抢空间。">
                            <u-row>
                                <u-col :cols="12">
                                    <u-switch v-model="enabled"  label="启用工作区" id="layout-enabled" hint="停用后仍保留已保存的配置。" />
                                </u-col>
                            </u-row>
                        </u-form-section>
                    </u-col>
                    <u-col :cols="12">
                        <u-form-actions>
                            <u-form-actions>
                                <template #leading>
                                    <span role="status">{{ status || '更改只影响此演示' }}</span>
                                </template>
                                <u-button @click="reset">重置表单</u-button>
                                <u-button variant="primary" type="submit">保存配置</u-button>
                            </u-form-actions>
                        </u-form-actions>
                    </u-col>
                </u-row>
            </u-form>
            <u-button class="mt-4" @click="dialog = true">在弹窗中预览</u-button>
            <u-dialog v-model:open="dialog" size="md" scrollable aria-labelledby="layout-dialog-title">
                <template #header>
                    <h2 id="layout-dialog-title" class="ma-0 text-lg">弹窗中的表单</h2>
                </template>
                <u-form label-position="left" aria-label="弹窗配置" @submit="status = '弹窗配置已保存'">
                    <u-row>
                        <u-col :cols="12">
                            <u-text-field v-model="installPath"  label="安装路径" id="dialog-path" hint="按弹窗自身宽度降为竖排。" />
                        </u-col>
                        <u-col :cols="12">
                            <u-textarea v-model="args" :rows="3"  label="启动参数" id="dialog-args" />
                        </u-col>
                        <u-col :cols="12">
                            <u-form-actions>
                                <u-form-actions>
                                    <u-button @click="dialog = false">关闭预览</u-button>
                                </u-form-actions>
                            </u-form-actions>
                        </u-col>
                    </u-row>
                </u-form>
            </u-dialog>
        </template>
        <template v-else-if="example === 'layout-horizontal'">
            <u-form label-position="left" aria-label="安装配置">
                <u-row>
                    <u-col :cols="12">
                        <u-form-section title="安装与启动" description="所有标签使用同一列宽；在窄容器中自动上下排列。">
                            <u-row>
                                <u-col :cols="12">
                                    <u-text-field v-model="installPath"  label="安装路径" id="layout-path" hint="使用已检测到的可执行文件。" />
                                </u-col>
                                <u-col :cols="12">
                                    <u-textarea v-model="args" :rows="3"  label="启动参数" id="layout-args" hint="多行输入与单行输入共享外观。" />
                                </u-col>
                                <u-col :cols="12">
                                    <u-switch v-model="enabled"  label="允许委派" id="layout-delegation" hint="说明位于开关下方，与输入控件保持一致。" />
                                </u-col>
                            </u-row>
                        </u-form-section>
                    </u-col>
                </u-row>
            </u-form>
        </template>
        <template v-else-if="example === 'layout-actions'">
            <u-form-actions>
                <template #leading>配置尚未保存</template>
                <u-button>取消</u-button>
                <u-button variant="primary">保存更改</u-button>
            </u-form-actions>
        </template>
        <template v-else-if="example === 'layout-icons'">
            <div class="layout-demo-icons">
                <div v-for="icon in mdiNames" :key="icon">
                    <u-icon :name="icon" :size="24" />
                    <code>{{ icon }}</code>
                </div>
            </div>
            <div class="layout-demo-toolbar mt-4">
                <u-icon name="folder" label="原型文件夹" />
                <span>原型图标</span>
                <u-icon :path="mdiDatabaseOutline" label="数据库" :size="24" />
                <span>按需导入路径</span>
                <u-spacer />
                <u-button>
                    <u-icon name="mdi-plus" />
                    新增配置
                </u-button>
            </div>
        </template>
        <template v-else-if="example === 'textarea-grow'">
            <div class="layout-demo-toolbar">
                <label>
                    <u-switch v-model="dense" />
                    紧凑
                </label>
                <label>
                    <u-switch v-model="disabled" />
                    禁用
                </label>
                <label>
                    <u-switch v-model="readonly" />
                    只读
                </label>
                <label>
                    <u-switch v-model="invalid" />
                    错误
                </label>
                <label>
                    <u-switch v-model="autoGrow" />
                    自动增高
                </label>
            </div>
            <u-form aria-label="输入样式比较">
                <u-row>
                    <u-col :cols="12" :sm="6">
                        <u-text-field v-model="compare" v-bind="textareaMode"  label="单行文本" id="compare-input" />
                    </u-col>
                    <u-col :cols="12" :sm="6">
                        <u-textarea v-model="compare" v-bind="textareaMode" :rows="1" no-resize  label="多行文本" id="compare-textarea" />
                    </u-col>
                    <u-col :cols="12">
                        <u-textarea v-model="draft" v-bind="textareaMode" :rows="3" :auto-grow="autoGrow" :max-rows="8" counter maxlength="500" placeholder="在这里输入多行文本…"  label="自动增高指令" id="grow-textarea" hint="输入或粘贴多行内容，最低 3 行、最多 8 行；字数限制 500。" />
                    </u-col>
                </u-row>
            </u-form>
            <div class="layout-demo-toolbar mt-4">
                <u-button @click="draft = Array.from({ length: 14 }, (_, i) => `第 ${i + 1} 行：这是用于演示高度上限的文本。`).join('\n')">填入长文本</u-button>
                <u-button @click="draft = ''">清空文本</u-button>
                <span>观察高度随内容收缩</span>
            </div>
        </template>
        <template v-else-if="example === 'layout-menu-item'">
            <u-menu>
                <template #activator="{ props }">
                    <u-button v-bind="props">操作菜单</u-button>
                </template>
                <u-menu-item @click="status = '已选择编辑'">
                    <template #icon>
                        <u-icon name="mdi-pencil-outline" />
                    </template>
                    编辑配置
                </u-menu-item>
                <u-menu-item disabled>暂不可用</u-menu-item>
                <u-menu-item :checked="enabled" keep-open @click="enabled = !enabled">启用</u-menu-item>
                <u-menu-item danger @click="status = '已选择删除'">删除</u-menu-item>
            </u-menu>
            <p role="status">{{ status }}</p>
        </template>
        <template v-else-if="example === 'layout-confirm-host'">
            <u-button @click="confirm">打开确认对话框</u-button>
            <p role="status">{{ status || 'Host 已挂载在文档根组件' }}</p>
            <span class="text-muted">UConfirmHost 由文档根节点唯一挂载，当前示例调用真实确认服务。</span>
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

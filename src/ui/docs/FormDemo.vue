<script setup>
import { ref } from 'vue';
import { UiForm, UiRow, UiCol, UiFormActions, UiInput, UiTextarea, UiSelect, UiSwitch, UiCheckbox, UiRadio, UiColorSwatches, UiButton, UiField, UiDialog, UiTooltip } from '../index';
defineProps({ example: String });
const form = ref();
const valid = ref(null);
const name = ref('');
const description = ref('');
const choice = ref('short');
const enabled = ref(true);
const accepted = ref(false);
const radio = ref('a');
const color = ref(null);
const disabled = ref(false);
const readonly = ref(false);
const dense = ref(false);
const ghost = ref(false);
const rounded = ref(true);
const position = ref('top');
const gridDensity = ref('comfortable');
const status = ref('尚未提交');
const dialog = ref(false);
const showError = ref(true);
const longError = ref(false);
const longText = ref('这是需要保持单行的很长表单内容，选择器使用省略号，输入框仍能横向滚动和选择完整文本。');
const longChoice = ref('long');
const asyncName = ref('');
const required = value => !!String(value ?? '').trim() || '请填写名称。';
const minLength = value => String(value).length >= 3 || '名称至少需要 3 个字符。';
const nameRules = [required, minLength];
const acceptRules = [value => value || '请先同意约定。'];
const asyncRules = [value => new Promise(resolve => setTimeout(() => resolve(value === 'taken' ? '此名称已经被使用。' : true), 400))];
async function validate() { const result = await form.value.validate(); status.value = result.cancelled ? '验证已取消' : result.valid ? '验证通过' : `发现 ${result.errors.length} 项错误`; }
</script>

<template>
    <div class="form-demo">
        <template v-if="example === 'layout-form-simple'">
            <div class="form-demo-toolbar">
                <UiSelect v-model="position" inline aria-label="标签方向" :items="[{ value: 'top', label: '标签在上方' }, { value: 'left', label: '标签在左侧' }]" />
                <UiCheckbox v-model="disabled">统一禁用</UiCheckbox>
                <UiCheckbox v-model="readonly">统一只读</UiCheckbox>
                <UiCheckbox v-model="dense">统一紧凑</UiCheckbox>
                <UiCheckbox v-model="ghost">透明控件</UiCheckbox>
                <UiCheckbox v-model="rounded">圆角</UiCheckbox>
            </div>
            <UiForm ref="form" v-model="valid" :label-position="position" label-width="140px" :disabled="disabled" :readonly="readonly" :dense="dense" :ghost="ghost" :rounded="rounded"
                v-slot="{ isValidating }" aria-label="简化验证表单" @submit="status = '已保存配置'" @invalid="status = '请修正表单错误'">
                <UiRow>
                    <UiCol :cols="12">
                        <UiInput v-model="name" label="名称" hint="至少 3 个字符；说明始终位于控件下方。" :rules="nameRules" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiInput v-model="asyncName" label="异步名称" hint="输入 taken 测试异步错误；快速修改不会保留旧错误。" :rules="asyncRules" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiSelect v-model="choice" label="运行方式" :items="[{ value: 'short', label: '默认方式' }, { value: 'long', label: '需要保留完整名称的运行方式，控件内以省略号显示' }]" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiTextarea v-model="description" label="说明" hint="可自由换行；与单行控件使用同一套外观。" :rows="3" auto-grow counter />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiSwitch v-model="enabled" label="启用配置" hint="开关保留内容宽度。" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiCheckbox v-model="accepted" label="使用约定" hint="验证也适用于复选框。" :rules="acceptRules">我已阅读并同意</UiCheckbox>
                    </UiCol>
                    <UiCol :cols="12">
                        <UiRadio v-model="radio" name="simple-radio" value="a" label="单选项">选项 A</UiRadio>
                    </UiCol>
                    <UiCol :cols="12">
                        <UiColorSwatches v-model="color" label="标记颜色" hint="选择一个颜色，也可保持未选择。" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiFormActions>
                            <UiButton @click="validate">验证表单</UiButton>
                            <UiButton @click="form.resetValidation(); status = '验证已清除'">清除验证</UiButton>
                            <UiButton type="reset" @click="status = '已重置表单'">重置</UiButton>
                            <UiButton type="submit" variant="primary" :loading="isValidating">保存配置</UiButton>
                        </UiFormActions>
                    </UiCol>
                </UiRow>
            </UiForm>
            <p role="status">{{ status }} · 有效状态：{{ valid === null ? '未验证' : valid ? '有效' : '无效' }}</p>
        </template>
        <template v-else-if="example === 'layout-form-grid'">
            <div class="form-demo-toolbar">
                <UiSelect v-model="gridDensity" inline aria-label="表单行间距" :items="[{ value: 'default', label: '默认 24px' }, { value: 'comfortable', label: '舒适 16px' }, { value: 'compact', label: '紧凑 8px' }]" />
                <span>Row 管理间距，Col 管理响应式宽度，Form 管理验证。</span>
            </div>
            <UiForm aria-label="行列表单案例" @submit="status = '行列表单已保存'">
                <UiRow :density="gridDensity">
                    <UiCol :cols="12" :md="6">
                        <UiInput v-model="name" label="项目名称" hint="必填；宽屏与运行方式并排。" :rules="[required]" />
                    </UiCol>
                    <UiCol :cols="12" :md="6">
                        <UiSelect v-model="choice" label="运行方式" :items="[{ value: 'short', label: '默认方式' }, { value: 'other', label: '自定义方式' }]" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiTextarea v-model="description" label="完整说明" hint="cols=12 占整行；保持 DOM 与键盘顺序一致。" :rows="3" auto-grow />
                    </UiCol>
                    <UiCol :cols="12" :sm="6">
                        <UiSwitch v-model="enabled" label="启用项目" />
                    </UiCol>
                    <UiCol :cols="12" :sm="6">
                        <UiCheckbox v-model="accepted" label="通知偏好">接收通知</UiCheckbox>
                    </UiCol>
                    <UiCol :cols="12">
                        <UiFormActions>
                            <template #leading>
                                <span role="status">{{ status || '修改后点击保存，体验表单验证。' }}</span>
                            </template>
                            <UiButton type="reset">重置</UiButton>
                            <UiButton type="submit" variant="primary">保存行列表单</UiButton>
                        </UiFormActions>
                    </UiCol>
                </UiRow>
            </UiForm>
        </template>
        <template v-else-if="example === 'layout-form-labels'">
            <UiForm aria-label="标签位置比较">
                <UiRow>
                    <UiCol :cols="12" :sm="6">
                        <UiInput v-model="longText" label="上方标签" hint="说明位于输入框下方。" />
                    </UiCol>
                    <UiCol :cols="12" :sm="6">
                        <UiInput v-model="longText" label="没有说明" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiInput v-model="longText" label="左侧标签" label-position="left" label-width="100px" hint="单个控件可以覆盖表单方向。" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiTextarea v-model="description" label="左侧多行" label-position="left" label-width="100px" hint="左侧标签与控件顶部对齐，说明跟随控件列。" :rows="3" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiField label="自定义项目" for="custom-native" description="UiField 用于自定义内容，说明也在下方。" v-slot="{ controlAttrs }">
                            <input v-model="name" v-bind="controlAttrs" class="form-demo-native" />
                        </UiField>
                    </UiCol>
                </UiRow>
            </UiForm>
        </template>
        <template v-else-if="example === 'layout-form-text'">
            <UiForm class="form-demo-text" aria-label="长文本显示规则">
                <UiRow>
                    <UiCol :cols="12">
                        <UiInput v-model="longText" label="单行输入裁剪" hint="点击后按 End，可滚动至文本结尾并选择完整内容。" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiSelect v-model="longChoice" label="选择内容省略" :items="[{ value: 'long', label: longText }, { value: 'short', label: '短选项' }]" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiSelect v-model="choice" label="短菜单与控件同宽" :items="[{ value: 'short', label: '默认' }, { value: 'other', label: '其他' }]" />
                    </UiCol>
                    <UiCol :cols="12">
                        <UiSelect v-model="longChoice" label="原生选项也保持单行">
                            <option value="long">{{ longText }}</option>
                            <option value="short">短选项</option>
                        </UiSelect>
                    </UiCol>
                </UiRow>
            </UiForm>
        </template>
        <template v-else-if="example === 'layout-form-tooltip'">
            <p>指针点击后移出触发器，提示关闭；Tab 聚焦后保持显示，Esc 关闭。</p>
            <div class="form-demo-toolbar">
                <UiTooltip text="鼠标移出关闭，键盘聚焦保留">
                    <UiButton @click="status = '已点击提示触发器'">提示触发器</UiButton>
                </UiTooltip>
                <UiButton>下一项</UiButton>
            </div>
            <p role="status">{{ status }}</p>
        </template>
        <template v-else-if="example === 'layout-form-dialog'">
            <UiButton @click="dialog = true">打开浮动错误表单</UiButton>
            <UiDialog v-model:open="dialog" scrollable size="md" aria-labelledby="floating-form-title" :error="showError ? longError ? '第一项配置未通过校验。\n第二项配置仍需检查。\n请确认并重试。' : '配置未保存，请检查表单内容。' : ''">
                <template #header>
                    <h2 id="floating-form-title" class="ma-0 text-lg">浮动错误与可滚动表单</h2>
                </template>
                <UiForm aria-label="浮动错误表单">
                    <UiRow>
                        <UiCol v-for="index in 12" :key="index" :cols="12">
                            <UiInput v-model="name" :label="`配置项 ${index}`" :hint="index === 1 ? '此项不应被顶部错误遮住。' : undefined" />
                        </UiCol>
                    </UiRow>
                </UiForm>
                <template #footer>
                    <div class="form-demo-toolbar ma-0">
                        <UiCheckbox v-model="showError">显示顶部错误</UiCheckbox>
                        <UiCheckbox v-model="longError">多行错误</UiCheckbox>
                        <UiButton @click="dialog = false">关闭表单</UiButton>
                    </div>
                </template>
            </UiDialog>
        </template>
    </div>
</template>

<style scoped>
.form-demo { min-width: 0; width: 100%; }
.form-demo-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 20px; }
.form-demo > p { font-size: 12px; color: var(--muted); line-height: 1.6; }
.form-demo-text { width: 240px; max-width: 100%; }
.form-demo-native { box-sizing: border-box; width: 100%; min-width: 0; border: 1px solid var(--border); padding: 8px 11px; border-radius: 8px; background: var(--surface); color: var(--text); font: inherit; }
</style>

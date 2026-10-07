<script setup>
import { ref } from 'vue';
import { ULocaleProvider, UPagination } from '../index';
import {
    UForm,
    URow,
    UCol,
    UAutocomplete,
    UCombobox,
    UNumberInput,
    UFileInput,
    UFileUpload,
    USlider,
    URangeSlider,
    UOtpInput,
    UColorInput,
    UColorPicker,
    URating,
    URadioGroup,
    UCheckboxGroup,
    USelectionControl,
    USelectionControlGroup,
    UItemGroup,
    UItem,
    UChipGroup,
    UChip,
    UBtnToggle,
    UBtnGroup,
    UInput,
    UValidation,
    ULabel,
    UMessages,
    UCounter,
    UButton,
    UTextField,
    UDefaultsProvider,
} from '../index';
const props = defineProps({ example: String });
const options = [
    { title: '默认工作区', value: 'default' },
    { title: '完整的很长选项文字应保持单行，并在控件宽度不足时截断显示', value: 'long' },
    { title: '归档工作区', value: 'archived', props: { disabled: true } },
];
const choice = ref('default');
const choices = ref(['default']);
const tags = ref(['文档']);
const number = ref(5);
const files = ref(null);
const upload = ref([]);
const progress = ref(35);
const range = ref([20, 70]);
const otp = ref('');
const color = ref('#bd6749');
const rating = ref(3);
const radio = ref('a');
const checks = ref(['a']);
const selected = ref('a');
const custom = ref('');
const localePage = ref(2);
const form = ref();
const disabled = ref(false);
const readonly = ref(false);
const density = ref('default');
const variant = ref('outlined');
const result = ref('尚未验证');
const required = (value) => (Array.isArray(value) ? value.length > 0 : !!value) || '请填写此项。';
async function validate() {
    const response = await form.value.validate();
    result.value = response.valid ? '验证通过' : `有 ${response.errors.length} 项错误`;
}
</script>

<template>
    <div class="completion-demo">
        <div class="completion-toolbar">
            <UButton size="sm" :aria-pressed="disabled" @click="disabled = !disabled">
                {{ disabled ? '解除禁用' : '统一禁用' }}
            </UButton>
            <UButton size="sm" :aria-pressed="readonly" @click="readonly = !readonly">
                {{ readonly ? '解除只读' : '统一只读' }}
            </UButton>
            <UButton size="sm" @click="density = density === 'compact' ? 'default' : 'compact'">
                {{ density === 'compact' ? '默认密度' : '紧凑密度' }}
            </UButton>
            <UButton size="sm" @click="variant = variant === 'filled' ? 'outlined' : 'filled'">
                {{ variant === 'filled' ? '边框外观' : '填充外观' }}
            </UButton>
        </div>
        <UForm
            ref="form"
            :disabled="disabled"
            :readonly="readonly"
            :density="density"
            :variant="variant"
            @submit="result = '提交成功'"
        >
            <URow :gap="[16, 20]">
                <template v-if="example === 'completion-selection'">
                    <UCol :cols="12" :md="6">
                        <UAutocomplete
                            v-model="choice"
                            :items="options"
                            label="搜索工作区"
                            hint="输入筛选，方向键选择；选项保留对象模型能力。"
                            clearable
                            :rules="[required]"
                        />
                    </UCol>
                    <UCol :cols="12" :md="6">
                        <UAutocomplete
                            v-model="choices"
                            :items="options"
                            label="多选与标签"
                            multiple
                            chips
                            clearable
                            hint="移除单个标签，或一次清除所有选择。"
                        />
                    </UCol>
                    <UCol :cols="12">
                        <UCombobox
                            v-model="tags"
                            :items="['文档', '测试', '设计']"
                            label="可创建标签"
                            multiple
                            chips
                            clearable
                            hint="输入新标签并按 Enter 创建。"
                        />
                    </UCol>
                </template>
                <template v-else-if="example === 'completion-inputs'">
                    <UCol :cols="12" :md="6">
                        <UNumberInput
                            v-model="number"
                            label="执行并发数"
                            :min="1"
                            :max="10"
                            :step="1"
                            hint="按钮与方向键均遵守 1–10 边界。"
                        />
                    </UCol>
                    <UCol :cols="12" :md="6">
                        <UColorInput
                            v-model="color"
                            label="标记颜色"
                            hint="颜色面板和十六进制输入共用一个模型。"
                        />
                    </UCol>
                    <UCol :cols="12" :md="6">
                        <USlider v-model="progress" label="进度" thumb-label show-ticks />
                    </UCol>
                    <UCol :cols="12" :md="6">
                        <URangeSlider
                            v-model="range"
                            label="可接受范围"
                            hint="两个手柄不能越过彼此。"
                        />
                    </UCol>
                    <UCol :cols="12" :md="6">
                        <UOtpInput
                            v-model="otp"
                            label="六位验证码"
                            numeric
                            :length="6"
                            hint="支持粘贴、方向键和退格。"
                        />
                    </UCol>
                    <UCol :cols="12" :md="6">
                        <URating v-model="rating" label="完成质量" clearable />
                    </UCol>
                    <UCol :cols="12" :md="6">
                        <UFileInput
                            v-model="files"
                            label="选择附件"
                            multiple
                            accept=".md,.txt,.png"
                            show-size
                            hint="本地选择，仅更新示例模型。"
                        />
                    </UCol>
                    <UCol :cols="12" :md="6">
                        <UFileUpload
                            v-model="upload"
                            label="拖放附件"
                            multiple
                            :max-size="10485760"
                            hint="支持拖放、删除，限制单文件 10 MB。"
                        />
                    </UCol>
                    <UCol :cols="12">
                        <UColorPicker
                            v-model="color"
                            label="颜色编辑器"
                            :swatches="['#bd6749', '#679775', '#627ca0', '#8b739e']"
                        />
                    </UCol>
                </template>
                <template v-else-if="example === 'completion-groups'">
                    <UCol :cols="12" :md="6">
                        <URadioGroup v-model="radio" label="单选组" hint="值由组统一管理。">
                            <USelectionControl value="a" label="默认" type="radio" />
                            <USelectionControl value="b" label="自定义" type="radio" />
                        </URadioGroup>
                    </UCol>
                    <UCol :cols="12" :md="6">
                        <UCheckboxGroup v-model="checks" label="多选组">
                            <USelectionControl value="a" label="测试" />
                            <USelectionControl value="b" label="文档" />
                        </UCheckboxGroup>
                    </UCol>
                    <UCol :cols="12">
                        <USelectionControlGroup
                            v-model="checks"
                            multiple
                            label="自定义选择组"
                            direction="row"
                        >
                            <USelectionControl value="a" label="测试" />
                            <USelectionControl value="b" label="文档" />
                        </USelectionControlGroup>
                    </UCol>
                    <UCol :cols="12">
                        <ULabel>可选择项目</ULabel>
                        <UItemGroup v-model="selected" mandatory>
                            <UItem value="a">概览</UItem>
                            <UItem value="b">详情</UItem>
                            <UItem value="c" disabled>禁用</UItem>
                        </UItemGroup>
                    </UCol>
                    <UCol :cols="12">
                        <ULabel>标签组</ULabel>
                        <UChipGroup v-model="selected" mandatory>
                            <UChip value="a">概览</UChip>
                            <UChip value="b" closable>详情</UChip>
                        </UChipGroup>
                    </UCol>
                    <UCol :cols="12">
                        <ULabel>按钮切换组</ULabel>
                        <UBtnToggle v-model="selected" mandatory>
                            <UItem value="a">概览</UItem>
                            <UItem value="b">详情</UItem>
                        </UBtnToggle>
                    </UCol>
                    <UCol :cols="12">
                        <UBtnGroup>
                            <UButton size="sm">复制</UButton>
                            <UButton size="sm">导出</UButton>
                        </UBtnGroup>
                    </UCol>
                </template>
                <template v-else>
                    <UCol :cols="12">
                        <UInput
                            v-model="custom"
                            label="自定义输入的验证基座"
                            :rules="[required]"
                            hint="UInput 只提供状态、验证和框架，插槽放入自定义控件。"
                        >
                            <template
                                #default="{
                                    controlAttrs,
                                    disabled: isDisabled,
                                    readonly: isReadonly,
                                }"
                            >
                                <input
                                    v-model="custom"
                                    v-bind="controlAttrs"
                                    class="completion-native-input"
                                    :disabled="isDisabled"
                                    :readonly="isReadonly"
                                />
                            </template>
                        </UInput>
                    </UCol>
                    <UCol :cols="12">
                        <UValidation v-model="custom" :rules="[required]">
                            <template #default="{ errors, validate: validateControl }">
                                <UButton @click="validateControl">单独验证自定义内容</UButton>
                                <UMessages :messages="errors" error />
                            </template>
                        </UValidation>
                    </UCol>
                    <UCol :cols="12">
                        <UDefaultsProvider
                            :defaults="{ UTextField: { density: 'compact', variant: 'filled' } }"
                        >
                            <UTextField
                                v-model="custom"
                                label="局部默认配置"
                                hint="只在此容器内继承紧凑、填充外观。"
                            />
                        </UDefaultsProvider>
                        <UCounter :value="custom.length" :max="20" />
                    </UCol>
                    <UCol :cols="12">
                        <ULabel>局部英语区域</ULabel>
                        <ULocaleProvider locale="en">
                            <UPagination v-model="localePage" :length="5" />
                        </ULocaleProvider>
                    </UCol>
                </template>
                <UCol :cols="12">
                    <div class="completion-toolbar">
                        <UButton @click="validate">验证</UButton>
                        <UButton type="reset">重置</UButton>
                        <UButton type="submit" variant="flat" color="primary">提交</UButton>
                        <output role="status">{{ result }}</output>
                    </div>
                </UCol>
            </URow>
        </UForm>
    </div>
</template>

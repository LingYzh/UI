<script setup>
import { computed, ref } from 'vue';
import {
    UCascader,
    UForm,
    URow,
    UCol,
    UTextField,
    UCheckbox,
    UButton,
    UFormActions,
} from '../index';

const disabled = ref(false);
const readonly = ref(false);
const dense = ref(false);
const ghost = ref(false);
const rounded = ref(true);
const changeOnSelect = ref(false);
const showAllLevels = ref(true);
const path = ref([]);
const name = ref('');
const status = ref('尚未提交');
const valid = ref(null);
const choices = [
    {
        value: 'east',
        label: '华东',
        children: [
            {
                value: 'zhejiang',
                label: '浙江省',
                children: [
                    { value: 'hangzhou', label: '杭州市' },
                    { value: 'ningbo', label: '宁波市' },
                ],
            },
            {
                value: 'jiangsu',
                label: '江苏省',
                children: [
                    { value: 'nanjing', label: '南京市' },
                    { value: 'suzhou', label: '苏州市', disabled: true },
                ],
            },
        ],
    },
    {
        value: 'south',
        label: '华南',
        children: [
            {
                value: 'guangdong',
                label: '广东省',
                children: [
                    { value: 'shenzhen', label: '深圳市' },
                    { value: 'guangzhou', label: '广州市' },
                ],
            },
        ],
    },
    { value: 'overseas', label: '暂未开放的区域', disabled: true },
    { value: 0, label: '其他区域（数字值 0）' },
];
const items = computed(() => choices);
</script>

<template>
    <div class="cascader-demo">
        <div class="cascader-demo-toolbar">
            <u-checkbox v-model="disabled">统一禁用</u-checkbox>
            <u-checkbox v-model="readonly">统一只读</u-checkbox>
            <u-checkbox v-model="dense">紧凑控件</u-checkbox>
            <u-checkbox v-model="ghost">透明控件</u-checkbox>
            <u-checkbox v-model="rounded">圆角</u-checkbox>
            <u-checkbox v-model="changeOnSelect">允许选择父级</u-checkbox>
            <u-checkbox v-model="showAllLevels">显示完整路径</u-checkbox>
        </div>
        <u-form
            v-model="valid"
            :disabled="disabled"
            :readonly="readonly"
            :dense="dense"
            :ghost="ghost"
            :rounded="rounded"
            aria-label="级联选择表单"
            @submit="status = '已保存区域配置'"
            @invalid="status = '请先选择区域'"
        >
            <u-row density="comfortable">
                <u-col :cols="12" :md="6">
                    <u-cascader
                        v-model="path"
                        :items="items"
                        label="所属区域"
                        hint="逐级点击或用方向键导航；默认选择完整叶节点路径。"
                        required
                        clearable
                        :change-on-select="changeOnSelect"
                        :show-all-levels="showAllLevels"
                    />
                </u-col>
                <u-col :cols="12" :md="6">
                    <u-text-field
                        v-model="name"
                        label="项目名称"
                        hint="与级联选择器使用相同高度、边框和标签间距。"
                    />
                </u-col>
                <u-col :cols="12">
                    <u-form-actions>
                        <template #leading>
                            <span role="status">
                                {{ status }} ·
                                {{ valid === null ? '未验证' : valid ? '有效' : '无效' }}
                            </span>
                        </template>
                        <u-button type="reset">重置级联表单</u-button>
                        <u-button type="submit" variant="flat" color="primary">保存区域</u-button>
                    </u-form-actions>
                </u-col>
            </u-row>
        </u-form>
        <p class="cascader-demo-value">
            值路径：
            <code>{{ JSON.stringify(path) }}</code>
        </p>
        <p class="cascader-demo-help">
            Tab 聚焦触发器；Enter／↓ 打开，↑／↓、Home／End 在同级移动，→ 展开下级，←
            返回父级，Enter／Space 选择，Esc／Tab 关闭。禁用分支与叶节点不可选。
        </p>
    </div>
</template>

<style scoped>
.cascader-demo {
    min-width: 0;
    width: 100%;
}
.cascader-demo-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
}
.cascader-demo-value,
.cascader-demo-help {
    margin: 16px 0 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.6;
    overflow-wrap: anywhere;
}
</style>

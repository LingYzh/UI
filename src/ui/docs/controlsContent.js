export const controlPages = [
    {
        "id": "checkbox",
        "title": "复选框",
        "name": "UiCheckbox",
        "group": "表单组件",
        "kind": "component",
        "description": "原生复选框语义与键盘行为，支持部分选中，用于批量选择和独立选项。",
        "examples": [
            {
                "id": "checkbox-select-all",
                "title": "全选与部分选中",
                "description": "父级按子项计算 checked 与 indeterminate；点击全选会切换所有子项。列表行使用 label 扩大点击区域。",
                "code": "<script setup>\nimport { computed, ref } from 'vue';\nimport { UiCheckbox } from '@lingyzh/ui';\nconst items = ref([{ id: 'a', selected: true }, { id: 'b', selected: false }]);\nconst count = computed(() => items.value.filter((item) => item.selected).length);\nconst all = computed({ get: () => count.value === items.value.length, set: (value) => items.value.forEach((item) => { item.selected = value; }) });\n</script>\n\n<template>\n    <UiCheckbox v-model=\"all\" :indeterminate=\"count > 0 && count < items.length\">全选</UiCheckbox>\n    <UiCheckbox v-for=\"item in items\" :key=\"item.id\" v-model=\"item.selected\" :aria-label=\"`选择 ${item.id}`\" />\n</template>",
                "fullSource": true
            },
            {
                "id": "checkbox-states",
                "title": "标签与禁用",
                "description": "传入默认插槽时渲染为可点击的 label；禁用状态同时作用于标签。",
                "code": "<script setup>\nimport { computed, ref } from 'vue';\nimport { UiCheckbox } from '@lingyzh/ui';\nconst include = ref(true);\n</script>\n\n<template>\n    <UiCheckbox v-model=\"include\">包含凭证</UiCheckbox>\n    <UiCheckbox :model-value=\"true\" disabled>禁用 · 已选</UiCheckbox>\n</template>",
                "fullSource": true
            },
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UiField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiInput, UiTextarea, UiRow, UiCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <UiForm label-position=\"left\" label-width=\"120px\">\n        <UiRow>\n            <UiCol :cols=\"12\">\n                <UiInput v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </UiCol>\n            <UiCol :cols=\"12\">\n                <UiTextarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
            }
        ],
        "notes": [
            "indeterminate 只影响显示，用户点击后变为明确的选中或未选中，由调用方重新计算。",
            "ref 暴露 element 与 focus()。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。",
            "ref 暴露 validate()、reset()、resetValidation() 与 errors；UiForm 自动注册和管理控件。"
        ]
    },
    {
        "id": "radio",
        "title": "单选框",
        "name": "UiRadio",
        "group": "表单组件",
        "kind": "component",
        "description": "单个原生单选框，同组共享 name 与 v-model；布局由页面决定，可以放进各自的卡片。",
        "examples": [
            {
                "id": "radio-cards",
                "title": "分布在卡片中的单选",
                "description": "三张路由卡片各放一个单选框，共享同一 name 与模型；方向键在组内切换。",
                "code": "<script setup>\nimport { computed, ref } from 'vue';\nimport { UiRadio } from '@lingyzh/ui';\nconst route = ref('sonnet');\n</script>\n\n<template>\n    <UiRadio v-model=\"route\" name=\"default-route\" value=\"opus\">设为默认</UiRadio>\n    <UiRadio v-model=\"route\" name=\"default-route\" value=\"sonnet\">设为默认</UiRadio>\n</template>",
                "fullSource": true
            },
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UiField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiInput, UiTextarea, UiRow, UiCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <UiForm label-position=\"left\" label-width=\"120px\">\n        <UiRow>\n            <UiCol :cols=\"12\">\n                <UiInput v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </UiCol>\n            <UiCol :cols=\"12\">\n                <UiTextarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
            }
        ],
        "notes": [
            "需要带标题的列表式单选组时，外层用 fieldset + legend 或 role=\"radiogroup\" 提供组名。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。",
            "ref 暴露 validate()、reset()、resetValidation() 与 errors；UiForm 自动注册和管理控件。"
        ]
    },
    {
        "id": "progress",
        "title": "进度条",
        "name": "UiProgress",
        "group": "反馈组件",
        "kind": "component",
        "description": "确定进度的细线进度条，带 progressbar 语义；阈值配色由调用方决定。",
        "examples": [
            {
                "id": "progress-tones",
                "title": "语气与过渡",
                "description": "用量超过阈值时由页面切换 tone；数值变化平滑过渡，减少动效时直接跳到目标值。",
                "code": "<script setup>\nimport { computed, ref } from 'vue';\nimport { UiProgress } from '@lingyzh/ui';\nconst usage = ref(36);\n</script>\n\n<template>\n    <UiProgress :value=\"usage\" :tone=\"usage > 95 ? 'error' : usage > 80 ? 'warning' : 'accent'\" label=\"本月用量\" />\n    <UiProgress :value=\"60\" dense label=\"批量注册进度\" />\n</template>",
                "fullSource": true
            }
        ],
        "notes": [
            "只表达确定进度；未知时长的等待使用 UiSpinner。",
            "百分比数字由页面在进度条旁显示，组件不内置文字。"
        ]
    },
    {
        "id": "copy-button",
        "title": "复制按钮",
        "name": "UiCopyButton",
        "group": "操作组件",
        "kind": "component",
        "description": "一键复制文本的图标按钮，成功后短暂显示勾选并播报结果；桌面宿主可通过 setClipboardWriter 接管写入。",
        "examples": [
            {
                "id": "copy-inline",
                "title": "行内复制",
                "description": "长值截断显示，复制得到完整原文；复制成功 1.6 秒内显示绿色勾选，读屏播报“已复制”。",
                "code": "<script setup>\nimport { UiCopyButton } from '@lingyzh/ui';\n</script>\n\n<template>\n    <UiCopyButton :text=\"token\" label=\"复制 Access Token\" @copied=\"notify\" />\n</template>",
                "fullSource": true
            }
        ],
        "notes": [
            "按钮名称固定，结果通过隐藏的 status 区域播报，避免焦点停留时名称跳变。",
            "失败不会自动弹出提示；需要时监听 error 事件。"
        ]
    },
    {
        "id": "color-swatches",
        "title": "颜色选择",
        "name": "UiColorSwatches",
        "group": "表单组件",
        "kind": "component",
        "description": "从一组预设颜色中选择，使用原生单选语义；默认 10 色与界面 tokens 协调。",
        "examples": [
            {
                "id": "swatches-tag",
                "title": "标签颜色",
                "description": "方向键在色块间移动并立即选中；已保存的大写十六进制值同样匹配色板。选中色块以表面色间隔加描边标记，任意颜色上都清晰。",
                "code": "<script setup>\nimport { computed, ref } from 'vue';\nimport { UiColorSwatches } from '@lingyzh/ui';\nconst color = ref('#4A78B8');\n</script>\n\n<template>\n    <UiColorSwatches v-model=\"color\" label=\"标签颜色\" />\n</template>",
                "fullSource": true
            },
            {
                "id": "swatches-legacy",
                "title": "兼容已有颜色",
                "description": "已保存但不在色板中的颜色显示为末尾的“当前颜色”，保留原值直到用户重新选择。",
                "code": "<script setup>\nimport { computed, ref } from 'vue';\nimport { UiColorSwatches } from '@lingyzh/ui';\nconst color = ref('#2f6f9f');\n</script>\n\n<template>\n    <UiColorSwatches v-model=\"color\" label=\"已有标签颜色\" />\n</template>",
                "fullSource": true
            },
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UiField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiInput, UiTextarea, UiRow, UiCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <UiForm label-position=\"left\" label-width=\"120px\">\n        <UiRow>\n            <UiCol :cols=\"12\">\n                <UiInput v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </UiCol>\n            <UiCol :cols=\"12\">\n                <UiTextarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
            }
        ],
        "notes": [
            "比较颜色时忽略大小写，其余格式（ARGB、rgba 等）由调用方转换。",
            "颜色名称来自 locale，自定义色板请提供可读的 label。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。",
            "ref 暴露 validate()、reset()、resetValidation() 与 errors；UiForm 自动注册和管理控件。"
        ]
    },
    {
        "id": "cascader",
        "title": "级联选择器",
        "name": "UiCascader",
        "group": "表单组件",
        "kind": "component",
        "description": "逐级选择树形选项，模型保存完整值路径；沿用表单控件的标签、说明、宽度与验证方式。",
        "examples": [
            {
                "id": "cascader-form",
                "title": "级联选择与行列表单",
                "description": "真实三级选项、禁用分支／叶节点、数字值、父级选择、完整路径显示、清空、状态变体和验证／重置。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiRow, UiCol, UiCascader, UiButton } from '@lingyzh/ui';\nconst region = ref([]);\nconst items = [{ value: 'east', label: '华东', children: [{ value: 'zhejiang', label: '浙江省', children: [{ value: 'hangzhou', label: '杭州市' }] }] }];\nfunction save() { console.log(region.value); }\n</script>\n\n<template>\n    <UiForm @submit=\"save\">\n        <UiRow density=\"comfortable\">\n            <UiCol :cols=\"12\" :md=\"6\"><UiCascader v-model=\"region\" :items=\"items\" label=\"所属区域\" hint=\"逐级选择完整路径。\" required clearable /></UiCol>\n            <UiCol :cols=\"12\"><UiButton type=\"submit\" variant=\"primary\">保存区域</UiButton></UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
            }
        ],
        "notes": [
            "items 为 { value: string | number, label: string, disabled?: boolean, children?: CascaderItem[] }[]；同级 value 必须唯一，不同分支允许重复。",
            "v-model 为完整值路径数组，默认 []。默认只提交叶节点；changeOnSelect=true 允许显式选中父节点；按 → 始终导航下一级。",
            "required 验证非空路径；失效／禁用路径在验证时显示错误。rules 与 errorMessages 接入 UiForm。",
            "↑／↓、Home／End 同级移动，→ 展开下级，← 返回父级，Enter／Space 选择，Esc／Tab 关闭。指针选中释放焦点，键盘选中返回触发器。",
            "选中内容保持单行省略；弹层至少与控件同宽，多列超出视口时在弹层内部横向滚动。依赖原生 Popover 与 CSS anchor positioning。",
            "label/hint 直接放控件，Row/Col 管理布局；标准级联选择器不需要 UiField。"
        ]
    }
];

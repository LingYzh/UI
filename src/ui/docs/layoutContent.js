export const layoutPages = [
    {
        "id": "grid",
        "title": "栅格与布局规范",
        "name": "Layout",
        "kind": "guide",
        "group": "布局组件",
        "description": "用库组件约束宽度、列、间距和表单结构，避免逐页拼接局部布局。",
        "sections": [
            {
                "id": "principles",
                "title": "页面结构",
                "text": "页面使用 Container → Row → Col；表单使用 Form → Row → Col → 带 label/hint 的控件。Form 负责验证与共享状态，Row/Col 负责布局，Field 仅用于自定义表单项。",
                "items": [
                    "间距默认24px、comfortable16px、compact8px；Row不使用负外边距。",
                    "长文本、路径与提示词占整行。相关字段先分组，再决定是否两列。",
                    "行列使用 viewport 断点；弹窗可直接用 cols=12 保持单列，不依赖 Form 隐式分列。"
                ]
            },
            {
                "id": "responsive",
                "title": "断点与列宽",
                "text": "cols 是默认宽度，sm600 / md840 / lg1145 / xl1545 / xxl2138 向上覆盖。数值按 Row.size（默认12）计算；2/5 等分数使用自己的分母。",
                "demo": "layout-grid",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UContainer, URow, UCol, UCard } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-container fluid>\n        <u-row density=\"comfortable\">\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-card title=\"基本信息\">内容</u-card>\n            </u-col>\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-card title=\"运行设置\">内容</u-card>\n            </u-col>\n        </u-row>\n    </u-container>\n</template>\n"
            },
            {
                "id": "forms",
                "title": "规范表单",
                "text": "Row 管理行列间距；Col 的 cols=12 占整行，md=6 在宽屏占半行。Form 可统一 labelPosition=top/left；左侧标签在 Form 宽度低于 560px 时显示在上方。",
                "demo": "layout-form-grid",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UForm,\n    URow,\n    UCol,\n    UTextField,\n    USelect,\n    UTextarea,\n    UFormActions,\n    UButton,\n} from '@lingyzh/ui';\nconst name = ref('');\nconst choice = ref('default');\nconst description = ref('');\nconst saved = ref(false);\nconst items = [\n    { value: 'default', label: '默认方式' },\n    { value: 'other', label: '自定义方式' },\n];\n</script>\n\n<template>\n    <u-form @submit=\"saved = true\">\n        <u-row density=\"comfortable\">\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-text-field\n                    v-model=\"name\"\n                    label=\"项目名称\"\n                    hint=\"必填；宽屏与运行方式并排。\"\n                    :rules=\"[(value) => !!value.trim() || '请填写名称。']\"\n                />\n            </u-col>\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-select v-model=\"choice\" label=\"运行方式\" :items=\"items\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"完整说明\" :rows=\"3\" auto-grow />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-form-actions>\n                    <u-button type=\"reset\">重置</u-button>\n                    <u-button type=\"submit\" variant=\"flat\" color=\"primary\">保存行列表单</u-button>\n                </u-form-actions>\n            </u-col>\n        </u-row>\n    </u-form>\n</template>\n"
            },
            {
                "id": "acceptance",
                "title": "约束与选型",
                "items": [
                    "表单不要用 order 改键盘顺序，DOM 顺序与阅读顺序保持一致。",
                    "UForm 自动注册内部控件，rules 支持同步／异步验证，兼容原生 required 等约束。",
                    "UFormSection 使用 fieldset/legend，提供组名称；FormActions 只负责操作排列。",
                    "FormSection 仅分组；内部直接使用 Row/Col。标签和 hint 放在标准控件上，Field 用于自定义项目。",
                    "参考 Vuetify 4 的布局能力，UAH 保持自身 tokens、主题及控件尺寸。"
                ]
            }
        ]
    },
    {
        "id": "container",
        "title": "内容容器",
        "name": "UiContainer",
        "description": "居中内容宽度与统一水平留白；fluid 延展到父容器。",
        "group": "布局组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-container",
                "title": "响应式网格",
                "description": "从完整宽度到 6/6、8/4，支持分数、偏移和视觉顺序；切换真实 Row 密度。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UContainer, URow, UCol, UCard } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-container fluid>\n        <u-row density=\"comfortable\">\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-card title=\"基本信息\">内容</u-card>\n            </u-col>\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-card title=\"运行设置\">内容</u-card>\n            </u-col>\n        </u-row>\n    </u-container>\n</template>\n"
            }
        ],
        "notes": []
    },
    {
        "id": "row",
        "title": "栅格行",
        "name": "UiRow",
        "description": "统一管理列间距、换行、对齐及基准列数。",
        "group": "布局组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-row",
                "title": "响应式网格",
                "description": "从完整宽度到 6/6、8/4，支持分数、偏移和视觉顺序；切换真实 Row 密度。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UContainer, URow, UCol, UCard } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-container fluid>\n        <u-row density=\"comfortable\">\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-card title=\"基本信息\">内容</u-card>\n            </u-col>\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-card title=\"运行设置\">内容</u-card>\n            </u-col>\n        </u-row>\n    </u-container>\n</template>\n"
            },
            {
                "id": "layout-grid-advanced",
                "title": "对齐、自动列与完整断点",
                "description": "切换真实对齐和无间距行为；下方列覆盖sm到xxl全部断点。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URow, UCol } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-row align=\"center\" justify=\"space-between\" no-gutters>\n        <u-col cols=\"auto\">内容宽度</u-col>\n        <u-col :cols=\"4\">固定列</u-col>\n        <u-col>剩余空间</u-col>\n    </u-row>\n    <u-row>\n        <u-col :cols=\"12\" :sm=\"6\" :md=\"4\" :lg=\"3\" :xl=\"2\" :xxl=\"1\">全部断点</u-col>\n    </u-row>\n</template>\n"
            },
            {
                "id": "layout-form-grid",
                "title": "Row／Col 组织实际表单",
                "description": "宽屏两列、窄屏一列，多行说明占整行；切换 Row 密度，体验验证、提交和重置。Form 不决定字段布局。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UForm,\n    URow,\n    UCol,\n    UTextField,\n    USelect,\n    UTextarea,\n    UFormActions,\n    UButton,\n} from '@lingyzh/ui';\nconst name = ref('');\nconst choice = ref('default');\nconst description = ref('');\nconst saved = ref(false);\nconst items = [\n    { value: 'default', label: '默认方式' },\n    { value: 'other', label: '自定义方式' },\n];\n</script>\n\n<template>\n    <u-form @submit=\"saved = true\">\n        <u-row density=\"comfortable\">\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-text-field\n                    v-model=\"name\"\n                    label=\"项目名称\"\n                    hint=\"必填；宽屏与运行方式并排。\"\n                    :rules=\"[(value) => !!value.trim() || '请填写名称。']\"\n                />\n            </u-col>\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-select v-model=\"choice\" label=\"运行方式\" :items=\"items\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"完整说明\" :rows=\"3\" auto-grow />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-form-actions>\n                    <u-button type=\"reset\">重置</u-button>\n                    <u-button type=\"submit\" variant=\"flat\" color=\"primary\">保存行列表单</u-button>\n                </u-form-actions>\n            </u-col>\n        </u-row>\n    </u-form>\n</template>\n"
            }
        ],
        "notes": [
            "Col 必须是直接子项；内嵌 Row 重新计算列宽。"
        ]
    },
    {
        "id": "col",
        "title": "栅格列",
        "name": "UiCol",
        "description": "按数值、分数或内容宽度排列；可按断点覆盖。",
        "group": "布局组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-col",
                "title": "响应式网格",
                "description": "从完整宽度到 6/6、8/4，支持分数、偏移和视觉顺序；切换真实 Row 密度。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UContainer, URow, UCol, UCard } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-container fluid>\n        <u-row density=\"comfortable\">\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-card title=\"基本信息\">内容</u-card>\n            </u-col>\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-card title=\"运行设置\">内容</u-card>\n            </u-col>\n        </u-row>\n    </u-container>\n</template>\n"
            },
            {
                "id": "layout-form-grid",
                "title": "Row／Col 组织实际表单",
                "description": "宽屏两列、窄屏一列，多行说明占整行；切换 Row 密度，体验验证、提交和重置。Form 不决定字段布局。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UForm,\n    URow,\n    UCol,\n    UTextField,\n    USelect,\n    UTextarea,\n    UFormActions,\n    UButton,\n} from '@lingyzh/ui';\nconst name = ref('');\nconst choice = ref('default');\nconst description = ref('');\nconst saved = ref(false);\nconst items = [\n    { value: 'default', label: '默认方式' },\n    { value: 'other', label: '自定义方式' },\n];\n</script>\n\n<template>\n    <u-form @submit=\"saved = true\">\n        <u-row density=\"comfortable\">\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-text-field\n                    v-model=\"name\"\n                    label=\"项目名称\"\n                    hint=\"必填；宽屏与运行方式并排。\"\n                    :rules=\"[(value) => !!value.trim() || '请填写名称。']\"\n                />\n            </u-col>\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-select v-model=\"choice\" label=\"运行方式\" :items=\"items\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"完整说明\" :rows=\"3\" auto-grow />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-form-actions>\n                    <u-button type=\"reset\">重置</u-button>\n                    <u-button type=\"submit\" variant=\"flat\" color=\"primary\">保存行列表单</u-button>\n                </u-form-actions>\n            </u-col>\n        </u-row>\n    </u-form>\n</template>\n"
            }
        ],
        "notes": []
    },
    {
        "id": "spacer",
        "title": "弹性占位",
        "name": "UiSpacer",
        "description": "填充 flex 剩余空间，用于工具栏两端对齐。",
        "group": "布局组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-spacer",
                "title": "工具栏占位",
                "description": "真实Spacer将保存操作推到右侧。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USpacer, UButton } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"d-flex align-center ga-3\">\n        <span>项目设置</span>\n        <u-spacer />\n        <u-button>关闭</u-button>\n        <u-button variant=\"flat\" color=\"primary\">保存</u-button>\n    </div>\n</template>\n"
            }
        ],
        "notes": [
            "仅用于flex父容器，对辅助技术隐藏。"
        ]
    },
    {
        "id": "form",
        "title": "表单",
        "name": "UiForm",
        "description": "管理验证、提交、重置及统一控件状态和外观；行列布局由内部 Row/Col 负责。",
        "group": "表单组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-form-simple",
                "title": "直接使用控件与统一验证",
                "description": "直接传 label、hint 和 rules；统一切换状态与外观，体验异步验证、提交、重置和清除错误。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UForm,\n    UTextField,\n    UTextarea,\n    USwitch,\n    UButton,\n    URow,\n    UCol,\n    UFormActions,\n} from '@lingyzh/ui';\nconst form = ref();\nconst valid = ref(null);\nconst name = ref('');\nconst description = ref('');\nconst enabled = ref(true);\nconst saved = ref(false);\nconst nameRules = [\n    (value) => !!value.trim() || '请填写名称。',\n    (value) => value.length >= 3 || '至少 3 个字符。',\n];\n</script>\n\n<template>\n    <u-form ref=\"form\" v-model=\"valid\" @submit=\"saved = true\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field\n                    v-model=\"name\"\n                    label=\"名称\"\n                    hint=\"至少 3 个字符。\"\n                    :rules=\"nameRules\"\n                />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"说明\" :rows=\"3\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-switch v-model=\"enabled\" label=\"启用\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-form-actions>\n                    <u-button type=\"reset\">重置</u-button>\n                    <u-button type=\"submit\" variant=\"flat\" color=\"primary\">保存</u-button>\n                </u-form-actions>\n            </u-col>\n        </u-row>\n    </u-form>\n</template>\n"
            },
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UFormField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <u-form label-position=\"left\" label-width=\"120px\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </u-col>\n        </u-row>\n    </u-form>\n</template>\n"
            },
            {
                "id": "layout-form",
                "title": "分组表单与弹窗",
                "description": "真实表单含两列、跨行多行文本、必填校验、重置和提交；弹窗根据自己的宽度排版。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UForm,\n    UFormSection,\n    UTextField,\n    UTextarea,\n    UFormActions,\n    UButton,\n    URow,\n    UCol,\n} from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\nconst saved = ref(false);\n</script>\n\n<template>\n    <u-form @submit=\"saved = true\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-form-section title=\"基本信息\">\n                    <u-row>\n                        <u-col :cols=\"12\" :sm=\"6\">\n                            <u-text-field v-model=\"name\" label=\"工作区名称\" id=\"name\" required />\n                        </u-col>\n                        <u-col :cols=\"12\">\n                            <u-textarea\n                                v-model=\"description\"\n                                :rows=\"3\"\n                                auto-grow\n                                counter\n                                maxlength=\"200\"\n                                label=\"用途说明\"\n                                id=\"description\"\n                            />\n                        </u-col>\n                    </u-row>\n                </u-form-section>\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-form-actions>\n                    <u-button type=\"submit\" variant=\"flat\" color=\"primary\">保存配置</u-button>\n                </u-form-actions>\n            </u-col>\n        </u-row>\n    </u-form>\n</template>\n"
            },
            {
                "id": "layout-form-grid",
                "title": "Row／Col 组织实际表单",
                "description": "宽屏两列、窄屏一列，多行说明占整行；切换 Row 密度，体验验证、提交和重置。Form 不决定字段布局。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UForm,\n    URow,\n    UCol,\n    UTextField,\n    USelect,\n    UTextarea,\n    UFormActions,\n    UButton,\n} from '@lingyzh/ui';\nconst name = ref('');\nconst choice = ref('default');\nconst description = ref('');\nconst saved = ref(false);\nconst items = [\n    { value: 'default', label: '默认方式' },\n    { value: 'other', label: '自定义方式' },\n];\n</script>\n\n<template>\n    <u-form @submit=\"saved = true\">\n        <u-row density=\"comfortable\">\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-text-field\n                    v-model=\"name\"\n                    label=\"项目名称\"\n                    hint=\"必填；宽屏与运行方式并排。\"\n                    :rules=\"[(value) => !!value.trim() || '请填写名称。']\"\n                />\n            </u-col>\n            <u-col :cols=\"12\" :md=\"6\">\n                <u-select v-model=\"choice\" label=\"运行方式\" :items=\"items\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"完整说明\" :rows=\"3\" auto-grow />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-form-actions>\n                    <u-button type=\"reset\">重置</u-button>\n                    <u-button type=\"submit\" variant=\"flat\" color=\"primary\">保存行列表单</u-button>\n                </u-form-actions>\n            </u-col>\n        </u-row>\n    </u-form>\n</template>\n"
            }
        ],
        "notes": [
            "validate(): Promise<{ valid, errors, cancelled? }>；rules 可返回 true、false 或错误文本，也可返回 Promise。过期异步结果不会提交。",
            "reset() 恢复初始模型并清除验证；resetValidation() 只清除验证；requestSubmit() 触发统一提交验证。",
            "ref 和默认插槽暴露 isValid、isValidating、errors 与验证／重置方法。错误列表为 { id, errorMessages }[]。",
            "label、hint、rules 直接放在控件上；UFormField 仅用于自定义表单项。不要嵌套 form。"
        ]
    },
    {
        "id": "form-section",
        "title": "表单分组",
        "name": "UiFormSection",
        "description": "用原生fieldset和legend组织相关字段。",
        "group": "表单组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-horizontal",
                "title": "横排与长字段",
                "description": "标签统一列宽，输入、textarea与开关各占控件列；窄容器降为竖排。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UFormSection, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst path = ref('');\nconst args = ref('');\n</script>\n\n<template>\n    <u-form label-position=\"left\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-form-section title=\"安装与启动\" description=\"所有标签使用同一列宽。\">\n                    <u-row>\n                        <u-col :cols=\"12\">\n                            <u-text-field v-model=\"path\" label=\"安装路径\" id=\"path\" />\n                        </u-col>\n                        <u-col :cols=\"12\">\n                            <u-textarea v-model=\"args\" :rows=\"3\" label=\"启动参数\" id=\"args\" />\n                        </u-col>\n                    </u-row>\n                </u-form-section>\n            </u-col>\n        </u-row>\n    </u-form>\n</template>\n"
            }
        ],
        "notes": [
            "仅提供 fieldset/legend 分组语义，内部使用 Row/Col 组织字段。"
        ]
    },
    {
        "id": "form-actions",
        "title": "表单操作区",
        "name": "UiFormActions",
        "description": "固定操作层级、间距和辅助说明，窄容器自动换行。",
        "group": "表单组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-actions",
                "title": "状态与操作",
                "description": "说明在左侧，取消及主要操作在右侧。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UFormActions, UButton } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-form-actions>\n        <template #leading>配置尚未保存</template>\n        <u-button>取消</u-button>\n        <u-button variant=\"flat\" color=\"primary\">保存更改</u-button>\n    </u-form-actions>\n</template>\n"
            }
        ],
        "notes": [
            "提交按钮需显式type=submit，UButton默认仍为button。"
        ]
    },
    {
        "id": "icons",
        "title": "图标",
        "name": "UiIcon",
        "description": "统一 IconValue：按需 SVG 路径、多路径、Vue 组件和语义别名，兼容旧名称。",
        "group": "内容组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-icons",
                "title": "MDI与原型图标",
                "description": "从 @mdi/js 具名导入后直接传给 icon 类属性；同一协议用于按钮、输入框和卡片。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { mdiAccount, mdiClose } from '@mdi/js';\nimport { UIcon, UButton, UTextField } from '@lingyzh/ui';\nconst query = ref('账户');\n</script>\n\n<template>\n    <UIcon :icon=\"mdiAccount\" label=\"账户\" :size=\"24\" />\n    <UButton :icon=\"mdiAccount\" aria-label=\"账户操作\" />\n    <UButton :prepend-icon=\"mdiAccount\">账户</UButton>\n    <UTextField v-model=\"query\" :clear-icon=\"mdiClose\" clearable label=\"账户名称\" />\n</template>"
            }
        ],
        "notes": [
            "新增业务图标具名导入路径并传 icon；createUI 的 icons 配置支持 $alias 与自定义图标集，name/path/registerIcons 保留兼容。未知值在开发环境警告并留空。",
            "mdi-svg 不自动转换任意 mdi-* 名称；仅保留有限名称兼容表。本地 67 个 SVG 仍为 eager 字典，字体集须由应用配置。图标按钮用 UButton 提供行为与可访问名称。"
        ]
    },
    {
        "id": "menu-item",
        "title": "菜单项",
        "name": "UiMenuItem",
        "description": "菜单中的操作、禁用、勾选与危险动作。",
        "group": "操作组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-menu-item",
                "title": "菜单项状态",
                "description": "在真实Menu里体验方向键、禁用、勾选及危险样式。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UMenu, UButton, UMenuItem } from '@lingyzh/ui';\nconst enabled = ref(true);\n</script>\n\n<template>\n    <u-menu>\n        <template #activator=\"{ props }\">\n            <u-button v-bind=\"props\">操作菜单</u-button>\n        </template>\n        <u-menu-item>编辑配置</u-menu-item>\n        <u-menu-item disabled>暂不可用</u-menu-item>\n        <u-menu-item :checked=\"enabled\" keep-open @click=\"enabled = !enabled\">启用</u-menu-item>\n        <u-menu-item danger>删除</u-menu-item>\n    </u-menu>\n</template>\n"
            }
        ],
        "notes": [
            "仅在UMenu中使用，由Menu管理键盘与焦点。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "confirm-host",
        "title": "确认弹窗宿主",
        "name": "UiConfirmHost",
        "description": "在根组件挂载一次，消费confirmDialog队列。",
        "group": "反馈组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-confirm-host",
                "title": "真实确认服务",
                "description": "文档根部已挂载Host，当前示例调用它；确认／取消／Esc均有结果。",
                "fullSource": true,
                "code": "<script setup>\nimport { UConfirmHost, UButton, confirmDialog } from '@lingyzh/ui';\nasync function confirm() {\n    await confirmDialog({ title: '保存配置', message: '确认保存？' });\n}\n</script>\n\n<template>\n    <u-confirm-host />\n    <u-button @click=\"confirm\">打开确认对话框</u-button>\n</template>\n"
            }
        ],
        "notes": [
            "只挂载一个Host；文档不在每个示例重复挂载，避免重复队列。"
        ]
    }
];

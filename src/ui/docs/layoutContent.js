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
                "text": "cols 是默认宽度，sm600 / md960 / lg1280 / xl1920 / xxl2560 向上覆盖。数值按 Row.size（默认12）计算；2/5 等分数使用自己的分母。",
                "demo": "layout-grid",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiContainer, UiRow, UiCol, UiCard } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <UiContainer fluid>\n        <UiRow density=\"comfortable\">\n            <UiCol :cols=\"12\" :md=\"6\"><UiCard title=\"基本信息\">内容</UiCard></UiCol>\n            <UiCol :cols=\"12\" :md=\"6\"><UiCard title=\"运行设置\">内容</UiCard></UiCol>\n        </UiRow>\n    </UiContainer>\n</template>"
            },
            {
                "id": "forms",
                "title": "规范表单",
                "text": "Row 管理行列间距；Col 的 cols=12 占整行，md=6 在宽屏占半行。Form 可统一 labelPosition=top/left；左侧标签在 Form 宽度低于 560px 时显示在上方。",
                "demo": "layout-form-grid",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiRow, UiCol, UiInput, UiSelect, UiTextarea, UiFormActions, UiButton } from '@lingyzh/ui';\nconst name = ref('');\nconst choice = ref('default');\nconst description = ref('');\nconst saved = ref(false);\nconst items = [{ value: 'default', label: '默认方式' }, { value: 'other', label: '自定义方式' }];\n</script>\n\n<template>\n    <UiForm @submit=\"saved = true\">\n        <UiRow density=\"comfortable\">\n            <UiCol :cols=\"12\" :md=\"6\"><UiInput v-model=\"name\" label=\"项目名称\" hint=\"必填；宽屏与运行方式并排。\" :rules=\"[value => !!value.trim() || '请填写名称。']\" /></UiCol>\n            <UiCol :cols=\"12\" :md=\"6\"><UiSelect v-model=\"choice\" label=\"运行方式\" :items=\"items\" /></UiCol>\n            <UiCol :cols=\"12\"><UiTextarea v-model=\"description\" label=\"完整说明\" :rows=\"3\" auto-grow /></UiCol>\n            <UiCol :cols=\"12\"><UiFormActions><UiButton type=\"reset\">重置</UiButton><UiButton type=\"submit\" variant=\"primary\">保存行列表单</UiButton></UiFormActions></UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
            },
            {
                "id": "acceptance",
                "title": "约束与选型",
                "items": [
                    "表单不要用 order 改键盘顺序，DOM 顺序与阅读顺序保持一致。",
                    "UiForm 自动注册内部控件，rules 支持同步／异步验证，兼容原生 required 等约束。",
                    "UiFormSection 使用 fieldset/legend，提供组名称；FormActions 只负责操作排列。",
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiContainer, UiRow, UiCol, UiCard } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <UiContainer fluid>\n        <UiRow density=\"comfortable\">\n            <UiCol :cols=\"12\" :md=\"6\"><UiCard title=\"基本信息\">内容</UiCard></UiCol>\n            <UiCol :cols=\"12\" :md=\"6\"><UiCard title=\"运行设置\">内容</UiCard></UiCol>\n        </UiRow>\n    </UiContainer>\n</template>"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiContainer, UiRow, UiCol, UiCard } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <UiContainer fluid>\n        <UiRow density=\"comfortable\">\n            <UiCol :cols=\"12\" :md=\"6\"><UiCard title=\"基本信息\">内容</UiCard></UiCol>\n            <UiCol :cols=\"12\" :md=\"6\"><UiCard title=\"运行设置\">内容</UiCard></UiCol>\n        </UiRow>\n    </UiContainer>\n</template>"
            },
            {
                "id": "layout-grid-advanced",
                "title": "对齐、自动列与完整断点",
                "description": "切换真实对齐和无间距行为；下方列覆盖sm到xxl全部断点。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiRow, UiCol } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <UiRow align=\"center\" justify=\"space-between\" no-gutters>\n        <UiCol cols=\"auto\">内容宽度</UiCol><UiCol :cols=\"4\">固定列</UiCol><UiCol>剩余空间</UiCol>\n    </UiRow>\n    <UiRow><UiCol :cols=\"12\" :sm=\"6\" :md=\"4\" :lg=\"3\" :xl=\"2\" :xxl=\"1\">全部断点</UiCol></UiRow>\n</template>"
            },
            {
                "id": "layout-form-grid",
                "title": "Row／Col 组织实际表单",
                "description": "宽屏两列、窄屏一列，多行说明占整行；切换 Row 密度，体验验证、提交和重置。Form 不决定字段布局。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiRow, UiCol, UiInput, UiSelect, UiTextarea, UiFormActions, UiButton } from '@lingyzh/ui';\nconst name = ref('');\nconst choice = ref('default');\nconst description = ref('');\nconst saved = ref(false);\nconst items = [{ value: 'default', label: '默认方式' }, { value: 'other', label: '自定义方式' }];\n</script>\n\n<template>\n    <UiForm @submit=\"saved = true\">\n        <UiRow density=\"comfortable\">\n            <UiCol :cols=\"12\" :md=\"6\"><UiInput v-model=\"name\" label=\"项目名称\" hint=\"必填；宽屏与运行方式并排。\" :rules=\"[value => !!value.trim() || '请填写名称。']\" /></UiCol>\n            <UiCol :cols=\"12\" :md=\"6\"><UiSelect v-model=\"choice\" label=\"运行方式\" :items=\"items\" /></UiCol>\n            <UiCol :cols=\"12\"><UiTextarea v-model=\"description\" label=\"完整说明\" :rows=\"3\" auto-grow /></UiCol>\n            <UiCol :cols=\"12\"><UiFormActions><UiButton type=\"reset\">重置</UiButton><UiButton type=\"submit\" variant=\"primary\">保存行列表单</UiButton></UiFormActions></UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiContainer, UiRow, UiCol, UiCard } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <UiContainer fluid>\n        <UiRow density=\"comfortable\">\n            <UiCol :cols=\"12\" :md=\"6\"><UiCard title=\"基本信息\">内容</UiCard></UiCol>\n            <UiCol :cols=\"12\" :md=\"6\"><UiCard title=\"运行设置\">内容</UiCard></UiCol>\n        </UiRow>\n    </UiContainer>\n</template>"
            },
            {
                "id": "layout-form-grid",
                "title": "Row／Col 组织实际表单",
                "description": "宽屏两列、窄屏一列，多行说明占整行；切换 Row 密度，体验验证、提交和重置。Form 不决定字段布局。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiRow, UiCol, UiInput, UiSelect, UiTextarea, UiFormActions, UiButton } from '@lingyzh/ui';\nconst name = ref('');\nconst choice = ref('default');\nconst description = ref('');\nconst saved = ref(false);\nconst items = [{ value: 'default', label: '默认方式' }, { value: 'other', label: '自定义方式' }];\n</script>\n\n<template>\n    <UiForm @submit=\"saved = true\">\n        <UiRow density=\"comfortable\">\n            <UiCol :cols=\"12\" :md=\"6\"><UiInput v-model=\"name\" label=\"项目名称\" hint=\"必填；宽屏与运行方式并排。\" :rules=\"[value => !!value.trim() || '请填写名称。']\" /></UiCol>\n            <UiCol :cols=\"12\" :md=\"6\"><UiSelect v-model=\"choice\" label=\"运行方式\" :items=\"items\" /></UiCol>\n            <UiCol :cols=\"12\"><UiTextarea v-model=\"description\" label=\"完整说明\" :rows=\"3\" auto-grow /></UiCol>\n            <UiCol :cols=\"12\"><UiFormActions><UiButton type=\"reset\">重置</UiButton><UiButton type=\"submit\" variant=\"primary\">保存行列表单</UiButton></UiFormActions></UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiSpacer, UiButton } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <div class=\"d-flex align-center ga-3\">\n        <span>项目设置</span><UiSpacer /><UiButton>关闭</UiButton><UiButton variant=\"primary\">保存</UiButton>\n    </div>\n</template>"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiInput, UiTextarea, UiSwitch, UiButton, UiRow, UiCol, UiFormActions } from '@lingyzh/ui';\nconst form = ref();\nconst valid = ref(null);\nconst name = ref('');\nconst description = ref('');\nconst enabled = ref(true);\nconst saved = ref(false);\nconst nameRules = [value => !!value.trim() || '请填写名称。', value => value.length >= 3 || '至少 3 个字符。'];\n</script>\n\n<template>\n    <UiForm ref=\"form\" v-model=\"valid\" @submit=\"saved = true\">\n        <UiRow>\n            <UiCol :cols=\"12\">\n                <UiInput v-model=\"name\" label=\"名称\" hint=\"至少 3 个字符。\" :rules=\"nameRules\" />\n            </UiCol>\n            <UiCol :cols=\"12\">\n                <UiTextarea v-model=\"description\" label=\"说明\" :rows=\"3\" />\n            </UiCol>\n            <UiCol :cols=\"12\">\n                <UiSwitch v-model=\"enabled\" label=\"启用\" />\n            </UiCol>\n            <UiCol :cols=\"12\">\n                <UiFormActions>\n                    <UiButton type=\"reset\">重置</UiButton>\n                    <UiButton type=\"submit\" variant=\"primary\">保存</UiButton>\n                </UiFormActions>\n            </UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
            },
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UiField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiInput, UiTextarea, UiRow, UiCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <UiForm label-position=\"left\" label-width=\"120px\">\n        <UiRow>\n            <UiCol :cols=\"12\">\n                <UiInput v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </UiCol>\n            <UiCol :cols=\"12\">\n                <UiTextarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
            },
            {
                "id": "layout-form",
                "title": "分组表单与弹窗",
                "description": "真实表单含两列、跨行多行文本、必填校验、重置和提交；弹窗根据自己的宽度排版。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiFormSection, UiInput, UiTextarea, UiFormActions, UiButton, UiRow, UiCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\nconst saved = ref(false);\n</script>\n\n<template>\n    <UiForm @submit=\"saved = true\">\n        <UiRow>\n            <UiCol :cols=\"12\">\n                <UiFormSection title=\"基本信息\">\n                    <UiRow>\n                        <UiCol :cols=\"12\" :sm=\"6\">\n                            <UiInput v-model=\"name\"  label=\"工作区名称\" id=\"name\" required />\n                        </UiCol>\n                        <UiCol :cols=\"12\">\n                            <UiTextarea v-model=\"description\" :rows=\"3\" auto-grow counter maxlength=\"200\"  label=\"用途说明\" id=\"description\" />\n                        </UiCol>\n                    </UiRow>\n                </UiFormSection>\n            </UiCol>\n            <UiCol :cols=\"12\">\n                <UiFormActions>\n                    <UiButton type=\"submit\" variant=\"primary\">保存配置</UiButton>\n                </UiFormActions>\n            </UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
            },
            {
                "id": "layout-form-grid",
                "title": "Row／Col 组织实际表单",
                "description": "宽屏两列、窄屏一列，多行说明占整行；切换 Row 密度，体验验证、提交和重置。Form 不决定字段布局。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiRow, UiCol, UiInput, UiSelect, UiTextarea, UiFormActions, UiButton } from '@lingyzh/ui';\nconst name = ref('');\nconst choice = ref('default');\nconst description = ref('');\nconst saved = ref(false);\nconst items = [{ value: 'default', label: '默认方式' }, { value: 'other', label: '自定义方式' }];\n</script>\n\n<template>\n    <UiForm @submit=\"saved = true\">\n        <UiRow density=\"comfortable\">\n            <UiCol :cols=\"12\" :md=\"6\"><UiInput v-model=\"name\" label=\"项目名称\" hint=\"必填；宽屏与运行方式并排。\" :rules=\"[value => !!value.trim() || '请填写名称。']\" /></UiCol>\n            <UiCol :cols=\"12\" :md=\"6\"><UiSelect v-model=\"choice\" label=\"运行方式\" :items=\"items\" /></UiCol>\n            <UiCol :cols=\"12\"><UiTextarea v-model=\"description\" label=\"完整说明\" :rows=\"3\" auto-grow /></UiCol>\n            <UiCol :cols=\"12\"><UiFormActions><UiButton type=\"reset\">重置</UiButton><UiButton type=\"submit\" variant=\"primary\">保存行列表单</UiButton></UiFormActions></UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
            }
        ],
        "notes": [
            "validate(): Promise<{ valid, errors, cancelled? }>；rules 可返回 true、false 或错误文本，也可返回 Promise。过期异步结果不会提交。",
            "reset() 恢复初始模型并清除验证；resetValidation() 只清除验证；requestSubmit() 触发统一提交验证。",
            "ref 和默认插槽暴露 isValid、isValidating、errors 与验证／重置方法。错误列表为 { id, errorMessages }[]。",
            "label、hint、rules 直接放在控件上；UiField 仅用于自定义表单项。不要嵌套 form。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiForm, UiFormSection, UiInput, UiTextarea, UiRow, UiCol } from '@lingyzh/ui';\nconst path = ref('');\nconst args = ref('');\n</script>\n\n<template>\n    <UiForm label-position=\"left\">\n        <UiRow>\n            <UiCol :cols=\"12\">\n                <UiFormSection title=\"安装与启动\" description=\"所有标签使用同一列宽。\">\n                    <UiRow>\n                        <UiCol :cols=\"12\">\n                            <UiInput v-model=\"path\"  label=\"安装路径\" id=\"path\" />\n                        </UiCol>\n                        <UiCol :cols=\"12\">\n                            <UiTextarea v-model=\"args\" :rows=\"3\"  label=\"启动参数\" id=\"args\" />\n                        </UiCol>\n                    </UiRow>\n                </UiFormSection>\n            </UiCol>\n        </UiRow>\n    </UiForm>\n</template>"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiFormActions, UiButton } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <UiFormActions>\n        <template #leading>配置尚未保存</template>\n        <UiButton>取消</UiButton>\n        <UiButton variant=\"primary\">保存更改</UiButton>\n    </UiFormActions>\n</template>"
            }
        ],
        "notes": [
            "提交按钮需显式type=submit，UiButton默认仍为button。"
        ]
    },
    {
        "id": "icons",
        "title": "图标",
        "name": "UiIcon",
        "description": "原型图标、常用MDI名称和按需SVG路径，支持可访问名称。",
        "group": "内容组件",
        "kind": "component",
        "examples": [
            {
                "id": "layout-icons",
                "title": "MDI与原型图标",
                "description": "实际SVG图标；常用名称开箱可用，其他MDI从@mdi/js按需导入并传path。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiIcon, UiButton } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <UiIcon name=\"mdi-account\" :size=\"24\" />\n    <UiIcon name=\"folder\" label=\"文件夹\" />\n    <UiButton><UiIcon name=\"mdi-plus\" />新增配置</UiButton>\n</template>"
            }
        ],
        "notes": [
            "新增应用图标优先path按需导入；registerIcons({ name: path })可集中注册，未知name保持原file回退。",
            "不加载CDN、网络字体或整套MDI；图标按钮用UiButton提供行为及名称。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiMenu, UiButton, UiMenuItem } from '@lingyzh/ui';\nconst enabled = ref(true);\n</script>\n\n<template>\n    <UiMenu>\n        <template #activator=\"{ props }\"><UiButton v-bind=\"props\">操作菜单</UiButton></template>\n        <UiMenuItem>编辑配置</UiMenuItem><UiMenuItem disabled>暂不可用</UiMenuItem>\n        <UiMenuItem :checked=\"enabled\" keep-open @click=\"enabled = !enabled\">启用</UiMenuItem>\n        <UiMenuItem danger>删除</UiMenuItem>\n    </UiMenu>\n</template>"
            }
        ],
        "notes": [
            "仅在UiMenu中使用，由Menu管理键盘与焦点。",
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
                "code": "<script setup>\nimport { UiConfirmHost, UiButton, confirmDialog } from '@lingyzh/ui';\nasync function confirm() { await confirmDialog({ title: '保存配置', message: '确认保存？' }); }\n</script>\n\n<template>\n    <UiConfirmHost />\n    <UiButton @click=\"confirm\">打开确认对话框</UiButton>\n</template>"
            }
        ],
        "notes": [
            "只挂载一个Host；文档不在每个示例重复挂载，避免重复队列。"
        ]
    }
];

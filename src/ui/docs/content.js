import { themePages } from './themeContent.js';
import { completionPages } from './completionContent.js';
import { buttonLoadingExample } from './buttonContent.js';
import { tablePages } from './tableContent.js';
import { feedbackPages } from './feedbackContent.js';
import { controlPages } from './controlsContent.js';
import { layoutPages } from './layoutContent.js';
import { componentApi } from './apiReference.js';

export const groups = [
    "开始使用",
    "布局组件",
    "操作组件",
    "表单组件",
    "导航组件",
    "容器组件",
    "反馈组件",
    "内容组件",
    "服务",
    "设计基础"
];

export const tokens = [
    [
        "--background",
        "页面背景"
    ],
    [
        "--sidebar",
        "侧栏背景"
    ],
    [
        "--surface",
        "内容表面"
    ],
    [
        "--soft",
        "轻量表面"
    ],
    [
        "--text",
        "主要文字"
    ],
    [
        "--muted",
        "次要文字"
    ],
    [
        "--border",
        "边框"
    ],
    [
        "--accent-text",
        "强调文字"
    ],
    [
        "--accent",
        "主要动作"
    ],
    [
        "--accent-soft",
        "强调背景"
    ],
    [
        "--green",
        "成功"
    ],
    [
        "--red",
        "错误"
    ],
    [
        "--code-keyword",
        "代码关键字"
    ],
    [
        "--code-string",
        "代码字符串"
    ],
    [
        "--code-tag",
        "代码标签"
    ],
    [
        "--code-number",
        "代码数字"
    ],
    [
        "--code-comment",
        "代码注释"
    ],
    [
        "--code-property",
        "代码属性"
    ]
];

export const pages = [
    {
        "id": "usage-meter",
        "title": "用量与分类",
        "name": "UiUsageMeter",
        "description": "紧凑用量入口与独立分类构成，明确区分已知统计、本地估算和未知容量。",
        "kind": "component",
        "group": "内容组件",
        "examples": [
            {
                "id": "usage-meter-basic",
                "title": "用量状态",
                "description": "点击或用 Enter/Space 查看详情；更新按钮演示动态数据。分类合计与服务用量独立。嵌套内容弹窗使用真实 Dialog、Collapse 与 CodeBlock，展开后正文独立滚动。",
                "code": "<script setup>\nimport { UUsageMeter } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-usage-meter compact :used=\"24800\" :capacity=\"200000\" estimated @inspect=\"openDetails\" />\n    <u-usage-meter :used=\"24800\" :capacity=\"200000\" :segments=\"segments\" />\n</template>"
            }
        ],
        "notes": [
            "超过容量保留实际百分比，圆环绘制限制为100%。",
            "分类条按分类自身合计展示；未知项不当作已知零值。",
            "无窗口API、模型或业务依赖。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "message-actions",
        "title": "轮末操作",
        "name": "UiMessageActions",
        "description": "按原型显示轻量图标操作和轮次耗时；操作由宿主实现。",
        "kind": "component",
        "group": "操作组件",
        "examples": [
            {
                "id": "conversation-actions",
                "title": "回复操作",
                "description": "复制、编辑、分支、重新生成和删除按钮；禁用状态、悬停与键盘提示。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UMessageActions } from '@lingyzh/ui';\nconst selected = ref('');\nconst actions = [{ id: 'copy', icon: 'copy', label: '复制回复' }, { id: 'edit', icon: 'edit', label: '编辑历史回复' }, { id: 'branch', icon: 'branch', label: '从此回复创建分支' }, { id: 'refresh', icon: 'refresh', label: '重新生成最新回复' }, { id: 'delete', icon: 'trash', label: '删除消息' }];\nfunction handleAction(id) { selected.value = id; }\n</script>\n\n<template>\n    <u-message-actions label=\"第 2 轮 · 32 秒\" :actions=\"actions\" @action=\"handleAction\" />\n</template>"
            }
        ],
        "notes": [
            "提示跟随按钮键盘焦点，不增加额外 Tab 停靠。",
            "删除、重新生成等操作是否可用由宿主决定。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "file-changes",
        "title": "本轮文件改动",
        "name": "UiFileChanges",
        "description": "依据原型显示本轮改动文件与可核实的增删统计；文件选择和右栏导航由应用处理。",
        "kind": "component",
        "group": "内容组件",
        "examples": [
            {
                "id": "conversation-inline",
                "title": "对话中的工具与改动",
                "description": "轻量工具标题、原位展开的紧凑 Diff，以及本轮文件改动列表。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UActivity, UDiff, UFileChanges } from '@lingyzh/ui';\nconst selected = ref('');\nconst items = [{ id: 'tool', path: 'src/ui/ToolCallRow.ts', status: 'M', added: 16, removed: 2 }];\nfunction inspectFile() { selected.value = 'tool'; }\nfunction selectFile(id) { selected.value = id; }\nfunction viewAll() { selected.value = 'all'; }\n</script>\n\n<template>\n    <u-activity title=\"已编辑 ToolCallRow.ts\" variant=\"inline\" icon=\"file\" :added=\"16\" :removed=\"2\" :open=\"true\" :scrollable=\"false\">\n        <u-diff compact inspectable path=\"src/ui/ToolCallRow.ts\" before=\"旧内容\" after=\"新内容\" @inspect=\"inspectFile\" />\n    </u-activity>\n    <u-file-changes title=\"第 2 轮文件改动\" :items=\"items\" @select=\"selectFile\" @view-all=\"viewAll\" />\n</template>"
            },
            {
                "id": "conversation-file-states",
                "title": "未知统计与空改动",
                "description": "无法核实增删行数时明确显示统计不可用；完整路径通过文件行提示查看。",
                "code": "<script setup>\nimport { UFileChanges } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-file-changes title=\"第 3 轮文件改动\" :items=\"[{ id: 'asset', path: 'assets/image.png', status: 'M', added: null, removed: null }]\" />\n</template>"
            }
        ],
        "notes": [
            "仅显示保存的统计，不读取磁盘或推断缺失的快照。",
            "文件名显示 basename，完整路径保留为原生 tooltip 与可访问名称。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "markdown",
        "title": "Markdown 正文",
        "name": "UiMarkdown",
        "description": "安全的富文本正文与自适应平滑流式显示；主题主色强调、折叠过渡和脚注居中跳转。",
        "kind": "component",
        "group": "内容组件",
        "examples": [
            {
                "id": "markdown-rich",
                "title": "完整正文",
                "description": "表格、代码、公式、图表、脚注与折叠说明。",
                "code": "<script setup>\nimport { UMarkdown } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-markdown :source=\"text\" @link-click=\"openLink\" />\n</template>"
            },
            {
                "id": "markdown-navigation",
                "title": "主题强调、折叠与脚注跳转",
                "description": "行内代码和标记使用 primary；展开／收起平滑过渡，脚注双向平滑居中。减少动态效果时立即更新。",
                "code": "<script setup>\nimport { UMarkdown, UScrollArea } from '@lingyzh/ui';\nconst text = '\u0060行内代码\u0060 与 ==标记==。脚注[^note]。\\n\\n<details><summary>补充说明</summary><p>支持展开和收起动画。</p></details>\\n\\n[^note]: 点击返回箭头回到引用处。';\n</script>\n\n<template>\n    <u-scroll-area height=\"420px\" label=\"Markdown 阅读\"><u-markdown :source=\"text\" /></u-scroll-area>\n</template>"
            },
            {
                "id": "markdown-streaming",
                "title": "平滑流式输出",
                "description": "短暂缓冲突发数据，自适应追赶，完成后及时显示完整内容。",
                "code": "<script setup>\nimport { UMarkdown } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-markdown :source=\"text\" :streaming=\"running\" />\n</template>"
            }
        ],
        "notes": [
            "正文支持 CommonMark、GFM 表格和任务列表、脚注、定义列表、标记、上下标、KaTeX 与 Mermaid。",
            "HTML 仅保留安全语义标签；外部链接不会自动导航。折叠保留原生 details/summary 的语义和键盘操作。"
        ]
    },
    {
        "id": "diff",
        "title": "文件差异",
        "name": "UiDiff",
        "description": "基于不可变前后文本的逐行差异，显示增删行号、变更统计与未改动上下文。",
        "kind": "component",
        "group": "内容组件",
        "examples": [
            {
                "id": "diff-content",
                "title": "历史与提议",
                "description": "仅使用传入的快照，不读取磁盘；待审批修改单独标识为提议。支持换行、复制完整内容和有界预览。",
                "code": "<script setup>\nimport { UDiff } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-diff path=\"notes.md\" :before=\"null\" after=\"# 新文档\" proposed />\n</template>"
            }
        ],
        "notes": [
            "大体积或复杂差异明确省略预览，不伪造结果；仍可复制完整快照。",
            "预览上限600行，默认只显示变更及前后3行；复制不受预览限制。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "activity",
        "title": "执行活动",
        "name": "UiActivity",
        "description": "可折叠的思考与工具活动，轻量标题、状态和有界滚动内容；正文回答由业务独立呈现。",
        "kind": "component",
        "group": "内容组件",
        "examples": [
            {
                "id": "activity-basic",
                "title": "思考与工具调用",
                "description": "键盘 Enter/Space 展开；审批动作置于滚动区外，长内容不遮挡按钮。",
                "code": "<script setup>\nimport { UActivity } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-activity title=\"思考过程\" status=\"已完成\">服务返回的摘要</u-activity>\n</template>"
            }
        ],
        "notes": [
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "textarea",
        "title": "多行输入",
        "name": "UiTextarea",
        "description": "长指令和说明编辑，支持原生选择、换行、键盘和垂直调整大小。",
        "kind": "component",
        "group": "表单组件",
        "examples": [
            {
                "id": "textarea-grow",
                "title": "与单行输入一致的样式",
                "description": "切换密度、禁用、只读和错误态，比较真实Input与Textarea；自动增高支持最低行数、最高行数与字数提示。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst text = ref('同一套边框、圆角和字号');\nconst prompt = ref('');\n</script>\n\n<template>\n    <u-form>\n        <u-row>\n            <u-col :cols=\"12\" :sm=\"6\">\n                <u-text-field v-model=\"text\"  label=\"单行文本\" id=\"single\" />\n            </u-col>\n            <u-col :cols=\"12\" :sm=\"6\">\n                <u-textarea v-model=\"text\" :rows=\"1\" no-resize  label=\"多行文本\" id=\"multi\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"prompt\" :rows=\"3\" auto-grow :max-rows=\"8\" counter maxlength=\"500\"  label=\"自动增高指令\" id=\"prompt\" />\n            </u-col>\n        </u-row>\n    </u-form>\n</template>"
            },
            {
                "id": "textarea-instructions",
                "title": "指令编辑",
                "description": "默认、聚焦、禁用与错误状态；与其他表单使用同一组 tokens。",
                "code": "<script setup>\nimport { UTextarea } from '@lingyzh/ui';\n</script>\n\n<template>\n    <label for=\"instructions\">Agent 指令</label>\n    <u-textarea id=\"instructions\" v-model=\"instructions\" :rows=\"5\" />\n</template>"
            },
            {
                "id": "layout-widths",
                "title": "默认宽度与容器约束",
                "description": "输入、选择和多行文本默认占满可用区域，可在240/320/480px容器中实际比较；inline用于工具栏，开关不拉伸。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst name = ref('UAH');\nconst description = ref('');\n</script>\n\n<template>\n    <u-form style=\"max-width: 320px\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\"  label=\"名称\" id=\"width-name\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" :rows=\"3\"  label=\"用途\" id=\"width-description\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\" :max-width=\"200\"  label=\"上限200px\" id=\"width-limit\" />\n            </u-col>\n        </u-row>\n    </u-form>\n    <u-text-field v-model=\"name\" inline :width=\"160\" aria-label=\"工具栏输入\" />\n</template>"
            },
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <u-form label-position=\"left\" label-width=\"120px\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </u-col>\n        </u-row>\n    </u-form>\n</template>"
            }
        ],
        "notes": [
            "默认根节点仍为textarea；开启counter时增加包裹层，但原生attrs与id透传给textarea。ref.element与focus保持兼容。",
            "宽度由Field、Col或父容器约束，不按文本长度撑宽；inline工具栏控件可显式设置width。",
            "ref 暴露 validate()、reset()、resetValidation() 与 errors；UForm 自动注册和管理控件。"
        ]
    },
    {
        "id": "tooltip",
        "title": "文字提示",
        "name": "UiTooltip",
        "description": "能力图标的悬停和键盘提示，使用原生顶层避免被滚动容器裁剪。",
        "kind": "component",
        "group": "反馈组件",
        "examples": [
            {
                "id": "tooltip-capability",
                "title": "能力名称",
                "description": "悬停或 Tab 聚焦图标，Esc 关闭；滚动或调整窗口时关闭提示。",
                "code": "<script setup>\nimport { UTooltip, UIcon } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-tooltip text=\"图片输入\"><u-icon name=\"image\" /></u-tooltip>\n</template>"
            },
            {
                "id": "layout-form-tooltip",
                "title": "指针与键盘触发",
                "description": "点击后移出即关闭；Tab 聚焦时保持显示，Esc 关闭。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTooltip, UButton } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <u-tooltip text=\"鼠标移出关闭，键盘聚焦保留\"><u-button>提示触发器</u-button></u-tooltip>\n</template>"
            }
        ],
        "notes": []
    },
    {
        "id": "overview",
        "title": "概览",
        "name": "UAH UI",
        "kind": "guide",
        "group": "开始使用",
        "description": "温和的外观，清晰的交互。为 UAH 工作台设计的 Vue 3 组件与交互契约。",
        "sections": [
            {
                "id": "principles",
                "title": "为专注的工作而设计",
                "text": "温暖米白承载内容，陶土色标记动作。控件以紧凑的密度、轻量边框与明确焦点，让长时间阅读和操作保持舒适。这里的所有演示都直接调用工作台使用的组件。"
            },
            {
                "id": "layers",
                "title": "三层职责",
                "items": [
                    "基础行为：键盘导航、状态协调与可访问语义。",
                    "UAH 组件：保持稳定的 Ui* API，以及原生控件、生命周期和视觉约定。",
                    "业务页面：拥有数据、校验、异步任务与布局，通过 props 和事件接入组件。"
                ]
            },
            {
                "id": "catalog",
                "title": "从一个真实组件开始",
                "text": "先阅读接入指南，再在左侧选择组件。每页提供可操作示例、源码、API 和使用约定；顶部主题选择会同步更新所有控件和设计变量。"
            }
        ]
    },
    {
        "id": "getting-started",
        "title": "接入指南",
        "name": "Getting started",
        "kind": "guide",
        "group": "开始使用",
        "description": "从项目内公共入口导入组件，一次加载共享样式，再让页面持有业务状态。",
        "sections": [
            {
                "id": "import",
                "title": "导入与样式",
                "text": "运行 npm install @lingyzh/ui；安装包导出 Vue/TypeScript 源码，需使用支持 Vue SFC 的构建工具。本地联调 UAH 可继续使用 file:../UI，并在 Vite 中配置 Vue dedupe。只在应用入口引入一次共享样式。",
                "code": "import { UButton, UTextField, UField, USnackbarHost, snackbar } from '@lingyzh/ui';\nimport '@lingyzh/ui/styles.css';"
            },
            {
                "id": "form",
                "title": "组合一个表单",
                "text": "UField 提供关联属性，UTextField 接收字符串状态。校验属于页面；同时传入 error 与 invalid，分别提供说明和错误视觉。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UField, UTextField, snackbar } from '@lingyzh/ui';\nconst name = ref('');\nconst error = ref('');\nfunction save() {\n    error.value = name.value.trim() ? '' : '请输入项目名称。';\n    if (!error.value) snackbar.show('项目已保存', { tone: 'success' });\n}\n</script>\n\n<template>\n    <form @submit.prevent=\"save\">\n        <u-text-field label=\"项目名称\" id=\"name\" :error-messages=\"error\" v-model=\"name\" :invalid=\"Boolean(error)\" />\n        <u-button type=\"submit\" variant=\"primary\">保存</u-button>\n    </form>\n</template>"
            },
            {
                "id": "host",
                "title": "挂载全局提示",
                "text": "在根组件挂载一个 USnackbarHost。之后任何应用模块都能调用 snackbar，无需通过页面 ref 寻找 Host。",
                "code": "<template>\n    <AppContent />\n    <u-snackbar-host />\n</template>"
            },
            {
                "id": "workflow",
                "title": "开发与交付",
                "items": [
                    "npm run dev：在 5174 端口直接验证组件。",
                    "npm run build：构建独立文档和库产物。",
                    "npm run typecheck：检查 TypeScript 与 Vue SFC。",
                    "特殊外观通过组件 variant 或局部布局处理，避免全局 input:hover 等覆盖。"
                ]
            }
        ]
    },
    {
        "id": "button",
        "title": "按钮",
        "name": "UiButton",
        "description": "通过层级、尺寸和状态传达动作的重要性。默认使用原生 button，保留键盘和表单语义。",
        "kind": "component",
        "group": "操作组件",
        "examples": [
            {
                "id": "button-variants",
                "title": "动作层级",
                "description": "主要动作保持单一；次要动作和轻量动作服务于同一任务。点击按钮可观察反馈。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, snackbar } from '@lingyzh/ui';\nfunction save() { snackbar.show('更改已保存。', { tone: 'success' }); }\n</script>\n\n<template>\n    <u-button variant=\"primary\" @click=\"save\">保存更改</u-button>\n    <u-button>次要操作</u-button>\n    <u-button variant=\"ghost\">轻量操作</u-button>\n</template>"
            },
            {
                "id": "button-states",
                "title": "尺寸、图标与等待态",
                "description": "等待态同时设置 disabled 与 aria-busy，阻止重复操作。图标按钮始终提供可访问名称。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UIcon } from '@lingyzh/ui';\nconst saving = ref(false);\nfunction save() {\n    if (saving.value) return;\n    saving.value = true;\n    setTimeout(() => { saving.value = false; }, 1400);\n}\n</script>\n\n<template>\n    <u-button size=\"sm\">紧凑按钮</u-button>\n    <u-button icon aria-label=\"添加项目\"><u-icon name=\"plus\" /></u-button>\n    <u-button disabled>不可用</u-button>\n    <u-button :loading=\"saving\" @click=\"save\">{{ saving ? '正在保存…' : '模拟保存' }}</u-button>\n</template>"
            },
            {
                "id": "button-shared-variants",
                "title": "密度、透明与直角变体",
                "description": "分别比较默认、dense、ghost 和 rounded=false；每个示例使用真实组件，可独立操作。",
                "code": "<script setup>\nimport { UButton } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-button >保存更改</u-button>\n    <u-button dense>保存更改</u-button>\n    <u-button ghost>保存更改</u-button>\n    <u-button :rounded=\"false\">保存更改</u-button>\n</template>"
            },
            {
                "id": "button-danger",
                "title": "危险操作",
                "description": "红色文字与悬停弱底区分不可撤销的操作，不与主要动作的强调填充混淆；可与 ghost、尺寸和图标组合。",
                "code": "<script setup>\nimport { UButton, UIcon } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-button variant=\"danger\">删除</u-button>\n    <u-button variant=\"danger\" ghost>清空日志</u-button>\n    <u-button variant=\"danger\" icon aria-label=\"删除项目\"><u-icon name=\"trash\" /></u-button>\n</template>"
            }
        ],
        "notes": [
            "ref 暴露原生 element 和 focus(options?)，避免依赖组件 $el。",
            "每个操作区推荐只有一个主要动作。",
            "使用 loading 控制等待视觉，同时在业务处理函数中守卫重复请求。",
            "本页提供各变体的独立示例；跨组件组合见“统一样式变体”文档。",
            "danger 只用于删除、清空等不可撤销的操作，并配合 confirmDialog 二次确认。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "input",
        "title": "输入框",
        "name": "UiInput",
        "description": "字符串输入与前后附加内容组成一个完整外壳；悬停、焦点和错误反馈覆盖整块控件。",
        "kind": "component",
        "group": "表单组件",
        "examples": [
            {
                "id": "input-search",
                "title": "带图标的输入",
                "description": "输入文字，清空或聚焦。前后插槽不承担输入控件的可访问名称。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTextField, UIcon } from '@lingyzh/ui';\nconst input = ref();\nconst query = ref('');\n</script>\n\n<template>\n    <u-text-field ref=\"input\" v-model=\"query\" aria-label=\"搜索\" placeholder=\"搜索会话、项目与设置\">\n        <template #leading><u-icon name=\"search\" :size=\"16\" /></template>\n        <template #trailing><span>{{ query.length }}</span></template>\n    </u-text-field>\n</template>"
            },
            {
                "id": "input-states",
                "title": "错误与禁用",
                "description": "控件直接接收 label、hint 和 errorMessages；disabled 与 readonly 均为控件属性。",
                "code": "<script setup>\nimport { UTextField } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-text-field label=\"项目名称\" error-messages=\"请输入项目名称。\" placeholder=\"例如：我的工作区\" />\n    <u-text-field label=\"只读能力\" readonly model-value=\"尚未接入\" />\n    <u-text-field label=\"禁用项目\" disabled model-value=\"暂不可编辑\" />\n</template>"
            },
            {
                "id": "input-shared-variants",
                "title": "密度、透明与直角变体",
                "description": "分别比较默认、dense、ghost 和 rounded=false；每个示例使用真实组件，可独立操作。",
                "code": "<script setup>\nimport { UTextField } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-text-field model-value=\"UAH\" aria-label=\"工作区名称\"  />\n    <u-text-field model-value=\"UAH\" aria-label=\"工作区名称\" dense />\n    <u-text-field model-value=\"UAH\" aria-label=\"工作区名称\" ghost />\n    <u-text-field model-value=\"UAH\" aria-label=\"工作区名称\" :rounded=\"false\" />\n</template>"
            },
            {
                "id": "layout-widths",
                "title": "默认宽度与容器约束",
                "description": "输入、选择和多行文本默认占满可用区域，可在240/320/480px容器中实际比较；inline用于工具栏，开关不拉伸。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst name = ref('UAH');\nconst description = ref('');\n</script>\n\n<template>\n    <u-form style=\"max-width: 320px\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\"  label=\"名称\" id=\"width-name\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" :rows=\"3\"  label=\"用途\" id=\"width-description\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\" :max-width=\"200\"  label=\"上限200px\" id=\"width-limit\" />\n            </u-col>\n        </u-row>\n    </u-form>\n    <u-text-field v-model=\"name\" inline :width=\"160\" aria-label=\"工具栏输入\" />\n</template>"
            },
            {
                "id": "input-number",
                "title": "数字输入",
                "description": "type=\"number\" 时模型保持数字类型；清空为 null，输入中间态不会被提前改写。min / max / step 透传给原生输入。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTextField } from '@lingyzh/ui';\nconst port = ref(5580);\n</script>\n\n<template>\n    <u-text-field v-model=\"port\" type=\"number\" min=\"1\" max=\"65535\" aria-label=\"端口\" />\n</template>"
            },
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <u-form label-position=\"left\" label-width=\"120px\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </u-col>\n        </u-row>\n    </u-form>\n</template>"
            },
            {
                "id": "layout-form-text",
                "title": "长文本与菜单宽度",
                "description": "选择值保持单行省略，输入保留原生横向滚动；短菜单与控件同宽，长内容可扩展到视口范围内。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, USelect, URow, UCol } from '@lingyzh/ui';\nconst text = ref('需要保持单行的很长表单内容');\nconst choice = ref('long');\nconst items = [{ value: 'long', label: '需要完整保留的很长选项名称' }];\n</script>\n\n<template>\n    <u-form style=\"width: 240px; max-width: 100%\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"text\" label=\"单行裁剪\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-select v-model=\"choice\" label=\"单行省略\" :items=\"items\" />\n            </u-col>\n        </u-row>\n    </u-form>\n</template>"
            }
        ],
        "notes": [
            "ref 暴露 element、focus()、select()。",
            "可见 label 或 aria-label / aria-labelledby 提供名称，placeholder 不代替名称。",
            "本页提供各变体的独立示例；跨组件组合见“统一样式变体”文档。",
            "宽度由Field、Col或父容器约束，不按文本长度撑宽；inline工具栏控件可显式设置width。",
            "数字模式只做类型转换，范围校验仍由业务页面负责。",
            "ref 暴露 validate()、reset()、resetValidation() 与 errors；UForm 自动注册和管理控件。"
        ]
    },
    {
        "id": "select",
        "title": "选择器",
        "name": "UiSelect",
        "description": "保留原生选择语义和键盘操作，支持字符串与数字 option 值。",
        "kind": "component",
        "group": "表单组件",
        "examples": [
            {
                "id": "select-described",
                "title": "带说明的选项",
                "description": "收起时只显示简短名称，菜单提供标题、说明和右侧选中标记。禁用项不能选择；文案由应用提供，不代表组件实施权限策略。",
                "code": "<script setup>\nimport { USelect } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-select v-model=\"mode\" :items=\"[{ value: 'default', label: 'Default', description: 'Ask before making changes.' }]\" menu-title=\"Mode\" compact ghost aria-label=\"Permission mode\" />\n</template>"
            },
            {
                "id": "select-groups",
                "title": "分组与占位提示",
                "description": "占位提示不进入选项列表；长列表复用 UScrollArea，原生 optgroup 标识分组。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USelect } from '@lingyzh/ui';\nconst model = ref('');\n</script>\n\n<template>\n    <u-select v-model=\"model\" placeholder=\"选择模型\" aria-label=\"模型\"><optgroup label=\"Provider A\"><option value=\"a\">model-a</option></optgroup></u-select>\n</template>"
            },
            {
                "id": "select-values",
                "title": "数字值与紧凑样式",
                "description": "切换代码字号，观察模型类型仍为 number。紧凑样式适合工具栏内的低频选择。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USelect } from '@lingyzh/ui';\nconst size = ref(13);\nconst density = ref('comfortable');\n</script>\n\n<template>\n    <u-select v-model=\"size\" aria-label=\"代码字号\">\n        <option v-for=\"value in [12, 13, 14, 16]\" :key=\"value\" :value=\"value\">{{ value }} px</option>\n    </u-select>\n    <u-select v-model=\"density\" compact aria-label=\"显示密度\">\n        <option value=\"comfortable\">舒适</option>\n        <option value=\"compact\">紧凑</option>\n    </u-select>\n</template>"
            },
            {
                "id": "select-states",
                "title": "错误和禁用",
                "description": "invalid 与 disabled 可分别表达校验结果和当前不可操作状态。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UField, USelect } from '@lingyzh/ui';\nconst project = ref('');\n</script>\n\n<template>\n    <u-select label=\"需要选择的项目\" id=\"project\" :error-messages=\"project ? '' : '请选择项目。'\" v-model=\"project\" :invalid=\"!project\"><option value=\"\">请选择项目</option><option value=\"uah\">UAH 工作台</option></u-select>\n    <u-select model-value=\"unavailable\" disabled aria-label=\"不可用的选择\"><option value=\"unavailable\">尚未启用</option></u-select>\n</template>"
            },
            {
                "id": "select-shared-variants",
                "title": "密度、透明与直角变体",
                "description": "分别比较默认、dense、ghost 和 rounded=false；每个示例使用真实组件，可独立操作。",
                "code": "<script setup>\nimport { USelect } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-select model-value=\"UAH\" aria-label=\"工作区\" ><option value=\"UAH\">UAH 工作台</option></u-select>\n    <u-select model-value=\"UAH\" aria-label=\"工作区\" dense><option value=\"UAH\">UAH 工作台</option></u-select>\n    <u-select model-value=\"UAH\" aria-label=\"工作区\" ghost><option value=\"UAH\">UAH 工作台</option></u-select>\n    <u-select model-value=\"UAH\" aria-label=\"工作区\" :rounded=\"false\"><option value=\"UAH\">UAH 工作台</option></u-select>\n</template>"
            },
            {
                "id": "layout-widths",
                "title": "默认宽度与容器约束",
                "description": "输入、选择和多行文本默认占满可用区域，可在240/320/480px容器中实际比较；inline用于工具栏，开关不拉伸。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst name = ref('UAH');\nconst description = ref('');\n</script>\n\n<template>\n    <u-form style=\"max-width: 320px\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\"  label=\"名称\" id=\"width-name\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" :rows=\"3\"  label=\"用途\" id=\"width-description\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\" :max-width=\"200\"  label=\"上限200px\" id=\"width-limit\" />\n            </u-col>\n        </u-row>\n    </u-form>\n    <u-text-field v-model=\"name\" inline :width=\"160\" aria-label=\"工具栏输入\" />\n</template>"
            },
            {
                "id": "select-dynamic",
                "title": "选项文本动态更新",
                "description": "items 中的 label、description 可以随数据更新；value 不变时，收起后的选中内容也会同步刷新，不重建整个选择器。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USelect, UButton } from '@lingyzh/ui';\nconst version = ref('v1');\nconst submitted = ref(false);\n</script>\n\n<template>\n    <u-select v-model=\"version\" label=\"配置版本\" :items=\"[{ value: 'v1', label: submitted ? 'v1 · 待审批' : 'v1 · 草稿' }]\" />\n    <u-button @click=\"submitted = !submitted\">切换选项文案</u-button>\n</template>"
            },
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <u-form label-position=\"left\" label-width=\"120px\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </u-col>\n        </u-row>\n    </u-form>\n</template>"
            },
            {
                "id": "layout-form-text",
                "title": "长文本与菜单宽度",
                "description": "选择值保持单行省略，输入保留原生横向滚动；短菜单与控件同宽，长内容可扩展到视口范围内。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, USelect, URow, UCol } from '@lingyzh/ui';\nconst text = ref('需要保持单行的很长表单内容');\nconst choice = ref('long');\nconst items = [{ value: 'long', label: '需要完整保留的很长选项名称' }];\n</script>\n\n<template>\n    <u-form style=\"width: 240px; max-width: 100%\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"text\" label=\"单行裁剪\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-select v-model=\"choice\" label=\"单行省略\" :items=\"items\" />\n            </u-col>\n        </u-row>\n    </u-form>\n</template>"
            }
        ],
        "notes": [
            "支持 appearance: base-select 时使用共享弹层外观，其余浏览器回退到原生弹层。",
            "避免用自绘 div 模拟 option；浏览器提供成熟的键盘和辅助技术支持。",
            "不传模型时默认选择首项；显式传空值的受控模型仍由调用方决定占位项。",
            "本页提供各变体的独立示例；跨组件组合见“统一样式变体”文档。",
            "宽度由Field、Col或父容器约束，不按文本长度撑宽；inline工具栏控件可显式设置width。",
            "ref 暴露 validate()、reset()、resetValidation() 与 errors；UForm 自动注册和管理控件。"
        ]
    },
    {
        "id": "switch",
        "title": "开关",
        "name": "UiSwitch",
        "description": "二元偏好使用布尔模型；原生 checkbox 提供 Space 切换与表单行为。",
        "kind": "component",
        "group": "表单组件",
        "examples": [
            {
                "id": "switch-preference",
                "title": "立即生效的偏好",
                "description": "“减少动效”同时更新当前文档的根属性。系统偏好仍独立生效。",
                "code": "<script setup>\nimport { ref, watch } from 'vue';\nimport { UField, USwitch } from '@lingyzh/ui';\nconst reduced = ref(false);\nwatch(reduced, (value) => {\n    document.documentElement.dataset.reducedMotion = String(value);\n});\n</script>\n\n<template>\n    <u-switch label=\"减少动效\" id=\"motion\" v-model=\"reduced\" />\n</template>"
            },
            {
                "id": "switch-states",
                "title": "开与关、禁用",
                "description": "静态状态用于比较；旁边的可操作开关可通过鼠标或 Space 切换。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USwitch } from '@lingyzh/ui';\nconst enabled = ref(true);\n</script>\n\n<template>\n    <u-switch v-model=\"enabled\" aria-label=\"启用通知\" />\n    <u-switch :model-value=\"false\" disabled aria-label=\"禁用的关闭状态\" />\n    <u-switch :model-value=\"true\" disabled aria-label=\"禁用的开启状态\" />\n</template>"
            },
            {
                "id": "layout-focus",
                "title": "指针操作与键盘焦点",
                "description": "使用真实开关、复选框、单选、按钮、Tabs、色板、折叠和输入框比较两种操作方式。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USwitch, UCheckbox, URadio, UButton, UTabs, UTabPanel, UColorSwatches, UActivity, UTextField } from '@lingyzh/ui';\nconst enabled = ref(false);\nconst choice = ref('a');\nconst text = ref('');\nconst selectedTab = ref('first');\nconst color = ref(null);\nconst status = ref('');\n</script>\n\n<template>\n    <label><u-switch v-model=\"enabled\" />开关</label>\n    <u-checkbox v-model=\"enabled\">复选框</u-checkbox>\n    <u-radio v-model=\"choice\" name=\"choice\" value=\"a\">选项 A</u-radio>\n    <u-radio v-model=\"choice\" name=\"choice\" value=\"b\">选项 B</u-radio>\n    <u-button @click=\"status = '动作已执行'\">执行动作</u-button>\n    <u-tabs v-model=\"selectedTab\" id-prefix=\"focus\" :items=\"[{ id: 'first', label: '第一项' }, { id: 'second', label: '第二项' }]\" />\n    <u-tab-panel :model-value=\"selectedTab\" value=\"first\" id-prefix=\"focus\">第一项内容</u-tab-panel>\n    <u-tab-panel :model-value=\"selectedTab\" value=\"second\" id-prefix=\"focus\">第二项内容</u-tab-panel>\n    <u-color-swatches v-model=\"color\" label=\"示例色板\" />\n    <u-activity title=\"示例折叠\">折叠内容</u-activity>\n    <u-text-field v-model=\"text\" aria-label=\"保持编辑焦点\" />\n    <p role=\"status\">{{ status }}</p>\n</template>"
            },
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <u-form label-position=\"left\" label-width=\"120px\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </u-col>\n        </u-row>\n    </u-form>\n</template>"
            }
        ],
        "notes": [
            "使用关联 label 或 aria-label 提供名称。",
            "需要提交后生效的一组选择，请在业务页面解释保存时机。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。",
            "ref 暴露 validate()、reset()、resetValidation() 与 errors；UForm 自动注册和管理控件。"
        ]
    },
    {
        "id": "field",
        "title": "字段",
        "name": "UiField",
        "description": "自定义表单项的布局容器；标准控件直接使用内置 label 和 hint。说明与错误显示在控件下方。",
        "kind": "component",
        "group": "表单组件",
        "examples": [
            {
                "id": "layout-form-labels",
                "title": "标签方向与下方说明",
                "description": "上方／左侧由 labelPosition 配置，可在 Form 中统一设置；无说明时不预留空白。UField 用于自定义内容。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UForm, UTextField, UTextarea, URow, UCol } from '@lingyzh/ui';\nconst name = ref('');\nconst description = ref('');\n</script>\n\n<template>\n    <u-form label-position=\"left\" label-width=\"120px\">\n        <u-row>\n            <u-col :cols=\"12\">\n                <u-text-field v-model=\"name\" label=\"名称\" hint=\"说明始终位于控件下方。\" />\n            </u-col>\n            <u-col :cols=\"12\">\n                <u-textarea v-model=\"description\" label=\"说明\" label-position=\"top\" />\n            </u-col>\n        </u-row>\n    </u-form>\n</template>"
            }
        ],
        "notes": [
            "UField 不执行校验，也不自动创建输入框。",
            "即使 controlAttrs 包含 aria-invalid，仍建议给 UTextField 传 invalid 以同步边框状态。",
            "标准表单控件不需要额外 UField 或 controlAttrs；自定义原生控件仍可用插槽 controlAttrs 关联标签和提示。"
        ]
    },
    {
        "id": "tabs",
        "title": "标签页",
        "name": "UiTabs",
        "description": "声明式 Tab 或 items 定义标签，统一模型连接内容；默认方向键移动焦点，Enter / Space 确认选择。",
        "kind": "component",
        "group": "导航组件",
        "examples": [
            {
                "id": "tabs-declarative",
                "title": "声明式标签与共享内容模型",
                "description": "Tab 与 Window 共享一个模型，value 对应内容；无需 items 或 idPrefix。默认首个可用项选中，方向键仅移动焦点。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTabs, UTab, UTabsWindow, UTabsWindowItem, UTextField } from '@lingyzh/ui';\nconst tab = ref();\nconst draft = ref('');\n</script>\n\n<template>\n    <u-tabs v-model=\"tab\" aria-label=\"工作区视图\">\n        <u-tab value=\"overview\">概览</u-tab>\n        <u-tab value=\"locked\" disabled>尚未启用</u-tab>\n        <u-tab value=\"details\">详情</u-tab>\n    </u-tabs>\n    <u-tabs-window v-model=\"tab\">\n        <u-tabs-window-item value=\"overview\"><u-text-field v-model=\"draft\" label=\"草稿\" /></u-tabs-window-item>\n        <u-tabs-window-item value=\"locked\">尚未启用</u-tabs-window-item>\n        <u-tabs-window-item value=\"details\">详情内容</u-tabs-window-item>\n    </u-tabs-window>\n</template>"
            },
            {
                "id": "tabs-items",
                "title": "数组标签与自动内容容器",
                "description": "value/text 数组和 #item 即可创建完整标签页，支持数字值、禁用和动态移除。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTabs } from '@lingyzh/ui';\nconst tab = ref();\nconst items = [{ value: 0, text: '常规设置' }, { value: 2, text: '运行设置' }];\n</script>\n\n<template>\n    <u-tabs v-model=\"tab\" :items=\"items\" aria-label=\"设置\">\n        <template #item=\"{ item }\">{{ item.text }}内容</template>\n    </u-tabs>\n</template>"
            },
            {
                "id": "tabs-window",
                "title": "自动关联的内容插槽",
                "description": "#window 中的 WindowItem 自动继承选中值和关联 ID；内容首次访问挂载并保留，eager 可预先挂载。",
                "fullSource": true,
                "code": "<script setup>\nimport { UTabs, UTab, UTabsWindowItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-tabs aria-label=\"自动关联内容\">\n        <u-tab value=\"overview\">概览</u-tab>\n        <u-tab value=\"details\">详情</u-tab>\n        <template #window>\n            <u-tabs-window-item value=\"overview\">概览内容</u-tabs-window-item>\n            <u-tabs-window-item value=\"details\">详情内容</u-tabs-window-item>\n        </template>\n    </u-tabs>\n</template>"
            },
            {
                "id": "tabs-values",
                "title": "默认索引与可空选择",
                "description": "不设置 value 时使用索引，默认强制首个可用项；mandatory=false 可保留空模型。",
                "fullSource": true,
                "code": "<script setup>\nimport { UTabs, UTab, UTabsWindowItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-tabs aria-label=\"默认索引\">\n        <u-tab>第一项</u-tab>\n        <u-tab disabled>禁用项</u-tab>\n        <u-tab>第三项</u-tab>\n        <template #window>\n            <u-tabs-window-item>索引 0</u-tabs-window-item>\n            <u-tabs-window-item>索引 1</u-tabs-window-item>\n            <u-tabs-window-item>索引 2</u-tabs-window-item>\n        </template>\n    </u-tabs>\n</template>"
            },
            {
                "id": "tabs-scroll",
                "title": "溢出滚动与标签布局",
                "description": "选中项自动滚入可见区域；箭头仅滚动列表，grow/fixedTabs/stacked/alignTabs/hideSlider 配置标签布局。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTabs } from '@lingyzh/ui';\nconst selected = ref();\nconst items = Array.from({ length: 10 }, (_, value) => ({ value, text: `工作区配置 ${value + 1}` }));\n</script>\n\n<template>\n    <div style=\"width: 480px; max-width: 100%\">\n        <u-tabs v-model=\"selected\" :items=\"items\" show-arrows center-active aria-label=\"工作区配置\" />\n    </div>\n    <u-tabs v-model=\"selected\" :items=\"items.slice(0, 3)\" grow align-tabs=\"center\" aria-label=\"伸展标签\" />\n</template>"
            },
            {
                "id": "tabs-soft",
                "title": "基础标签与禁用项",
                "description": "左右键、Home / End 移动焦点，Enter / Space 确认。禁用项会被跳过，旧数组和面板用法继续兼容。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTabs, UTabPanel } from '@lingyzh/ui';\nconst selected = ref('overview');\nconst items = [\n    { id: 'overview', label: '概览' },\n    { id: 'unavailable', label: '尚未启用', disabled: true },\n    { id: 'details', label: '详情' }\n];\n</script>\n\n<template>\n    <u-tabs v-model=\"selected\" :items=\"items\" id-prefix=\"example\" aria-label=\"示例标签页\" />\n    <u-tab-panel :model-value=\"selected\" value=\"overview\" id-prefix=\"example\">概览</u-tab-panel>\n    <u-tab-panel :model-value=\"selected\" value=\"details\" id-prefix=\"example\">详情</u-tab-panel>\n    <u-tab-panel :model-value=\"selected\" value=\"unavailable\" id-prefix=\"example\">尚未启用</u-tab-panel>\n</template>"
            },
            {
                "id": "tabs-variants",
                "title": "下划线与垂直布局",
                "description": "切换布局可观察方向键规则；自定义插槽可加入 UAH 图标。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTabs, UTabPanel, UIcon } from '@lingyzh/ui';\nconst selected = ref('overview');\nconst items = [\n    { id: 'overview', label: '概览', icon: 'book' },\n    { id: 'details', label: '详情', icon: 'file' }\n];\n</script>\n\n<template>\n    <u-tabs v-model=\"selected\" :items=\"items\" id-prefix=\"tools\" variant=\"underline\">\n        <template #default=\"{ item }\"><u-icon :name=\"item.icon\" />{{ item.label }}</template>\n    </u-tabs>\n    <u-tabs v-model=\"selected\" :items=\"items\" id-prefix=\"vertical\" orientation=\"vertical\" indicator-side=\"start\" />\n    <u-tab-panel v-for=\"item in items\" :key=\"item.id\" :model-value=\"selected\" :value=\"item.id\" id-prefix=\"tools\">{{ item.label }}内容</u-tab-panel>\n    <u-tab-panel v-for=\"item in items\" :key=\"item.id\" :model-value=\"selected\" :value=\"item.id\" id-prefix=\"vertical\">{{ item.label }}内容</u-tab-panel>\n</template>"
            },
            {
                "id": "tabs-shared-variants",
                "title": "密度、透明与直角变体",
                "description": "分别比较默认、dense、ghost 和 rounded=false；每个示例使用真实组件，可独立操作。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTabs, UTabPanel } from '@lingyzh/ui';\nconst selected = ref('overview');\nconst items = [{ id: 'overview', label: '概览' }, { id: 'details', label: '详情' }];\n</script>\n\n<template>\n    <u-tabs v-model=\"selected\" :items=\"items\" id-prefix=\"sample-0\"  />\n    <u-tab-panel v-for=\"item in items\" :key=\"item.id\" :model-value=\"selected\" :value=\"item.id\" id-prefix=\"sample-0\">{{ item.label }}内容</u-tab-panel>\n    <u-tabs v-model=\"selected\" :items=\"items\" id-prefix=\"sample-1\" dense />\n    <u-tab-panel v-for=\"item in items\" :key=\"item.id\" :model-value=\"selected\" :value=\"item.id\" id-prefix=\"sample-1\">{{ item.label }}内容</u-tab-panel>\n    <u-tabs v-model=\"selected\" :items=\"items\" id-prefix=\"sample-2\" ghost />\n    <u-tab-panel v-for=\"item in items\" :key=\"item.id\" :model-value=\"selected\" :value=\"item.id\" id-prefix=\"sample-2\">{{ item.label }}内容</u-tab-panel>\n    <u-tabs v-model=\"selected\" :items=\"items\" id-prefix=\"sample-3\" :rounded=\"false\" />\n    <u-tab-panel v-for=\"item in items\" :key=\"item.id\" :model-value=\"selected\" :value=\"item.id\" id-prefix=\"sample-3\">{{ item.label }}内容</u-tab-panel>\n</template>"
            }
        ],
        "notes": [
            "默认 activation=manual：方向键／Home／End 移动焦点，Enter／Space 选择；activation=automatic 可在聚焦时选择。",
            "direction 控制方向；orientation 是兼容别名，同时设置时 direction 优先。",
            "value 支持字符串和数字；不传 value 时使用项索引。动态列表建议显式提供稳定且唯一的 value。",
            "mandatory 默认 force，自动选中首个可用项；false 允许空选择，true 只保留已有选择。",
            "Tabs 与相邻 TabsWindow 共享 v-model；#window 与 #item 自动关联模型，无需重复绑定。分离到不同容器时可设置一致的 idPrefix。",
            "旧 items{id,label}、idPrefix 和 UTabPanel 继续支持；新数据形式为 value/text。",
            "showArrows 默认仅桌面溢出显示；true 两端溢出显示，always 始终，desktop/mobile 按设备，never/false 隐藏。箭头只滚动不更改选中值。",
            "grow 伸展，fixedTabs 等宽且上限300px，stacked 图标在上方；溢出时保持单行。",
            "垂直内容在左侧可设置 indicatorSide=start；pointer 完成动作释放焦点，键盘保留。"
        ]
    },
    {
        "id": "tab",
        "title": "标签项",
        "name": "UiTab",
        "kind": "component",
        "group": "导航组件",
        "description": "在 UTabs 中声明 value、禁用、图标及自定义标签内容；未传 value 时使用索引。",
        "examples": [
            {
                "id": "tabs-declarative",
                "title": "声明式标签与共享内容模型",
                "description": "与 Window 共享模型，标签与内容使用相同 value。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTabs, UTab, UTabsWindow, UTabsWindowItem, UTextField } from '@lingyzh/ui';\nconst tab = ref();\nconst draft = ref('');\n</script>\n\n<template>\n    <u-tabs v-model=\"tab\" aria-label=\"工作区视图\">\n        <u-tab value=\"overview\">概览</u-tab>\n        <u-tab value=\"locked\" disabled>尚未启用</u-tab>\n        <u-tab value=\"details\">详情</u-tab>\n    </u-tabs>\n    <u-tabs-window v-model=\"tab\">\n        <u-tabs-window-item value=\"overview\"><u-text-field v-model=\"draft\" label=\"草稿\" /></u-tabs-window-item>\n        <u-tabs-window-item value=\"locked\">尚未启用</u-tabs-window-item>\n        <u-tabs-window-item value=\"details\">详情内容</u-tabs-window-item>\n    </u-tabs-window>\n</template>"
            }
        ],
        "notes": [
            "必须位于 UTabs 内；v-model 放在父 Tabs 上。",
            "默认只在确认后选择，禁用项跳过；可设置 text/icon，也可使用默认插槽。"
        ]
    },
    {
        "id": "tabs-window",
        "title": "标签内容容器",
        "name": "UiTabsWindow",
        "kind": "component",
        "group": "容器组件",
        "description": "统一模型管理全部 WindowItem，可与 Tabs 共享模型或在 #window 中自动关联。",
        "examples": [
            {
                "id": "tabs-declarative",
                "title": "声明式标签与共享内容模型",
                "description": "只在容器上绑定模型，WindowItem 不重复绑定。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTabs, UTab, UTabsWindow, UTabsWindowItem, UTextField } from '@lingyzh/ui';\nconst tab = ref();\nconst draft = ref('');\n</script>\n\n<template>\n    <u-tabs v-model=\"tab\" aria-label=\"工作区视图\">\n        <u-tab value=\"overview\">概览</u-tab>\n        <u-tab value=\"locked\" disabled>尚未启用</u-tab>\n        <u-tab value=\"details\">详情</u-tab>\n    </u-tabs>\n    <u-tabs-window v-model=\"tab\">\n        <u-tabs-window-item value=\"overview\"><u-text-field v-model=\"draft\" label=\"草稿\" /></u-tabs-window-item>\n        <u-tabs-window-item value=\"locked\">尚未启用</u-tabs-window-item>\n        <u-tabs-window-item value=\"details\">详情内容</u-tabs-window-item>\n    </u-tabs-window>\n</template>"
            },
            {
                "id": "tabs-window",
                "title": "自动关联的内容插槽",
                "description": "与父 Tabs 自动关联，不需要传模型或 ID。",
                "fullSource": true,
                "code": "<script setup>\nimport { UTabs, UTab, UTabsWindowItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-tabs aria-label=\"自动关联内容\">\n        <u-tab value=\"overview\">概览</u-tab>\n        <u-tab value=\"details\">详情</u-tab>\n        <template #window>\n            <u-tabs-window-item value=\"overview\">概览内容</u-tabs-window-item>\n            <u-tabs-window-item value=\"details\">详情内容</u-tabs-window-item>\n        </template>\n    </u-tabs>\n</template>"
            }
        ],
        "notes": [
            "在 Tabs #window 中自动继承；独立相邻窗口共享 v-model，自动匹配前面的 Tabs 标识。",
            "跨容器放置时设置一致 idPrefix，确保标签和内容的 ARIA 关联。"
        ]
    },
    {
        "id": "tabs-window-item",
        "title": "标签内容项",
        "name": "UiTabsWindowItem",
        "kind": "component",
        "group": "容器组件",
        "description": "通过 value 对应标签，由 Window 控制显示；默认首次访问挂载并保留状态。",
        "examples": [
            {
                "id": "tabs-window",
                "title": "自动关联的内容插槽",
                "description": "使用 value 对应标签；切换后草稿仍保留，eager 预先挂载。",
                "fullSource": true,
                "code": "<script setup>\nimport { UTabs, UTab, UTabsWindowItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-tabs aria-label=\"自动关联内容\">\n        <u-tab value=\"overview\">概览</u-tab>\n        <u-tab value=\"details\">详情</u-tab>\n        <template #window>\n            <u-tabs-window-item value=\"overview\">概览内容</u-tabs-window-item>\n            <u-tabs-window-item value=\"details\">详情内容</u-tabs-window-item>\n        </template>\n    </u-tabs>\n</template>"
            }
        ],
        "notes": [
            "必须位于 UTabsWindow 或 Tabs 的 #window 内。",
            "未传 value 时使用项索引；eager 预先挂载内容，默认首次访问才挂载并保留。"
        ]
    },
    {
        "id": "tab-panel",
        "title": "标签面板",
        "name": "UiTabPanel",
        "description": "兼容旧版独立面板用法；新的统一内容管理推荐 TabsWindow / TabsWindowItem。",
        "kind": "component",
        "group": "容器组件",
        "examples": [
            {
                "id": "panel-persistence",
                "title": "切换与状态保留",
                "description": "在概览面板输入草稿，再切换到详情并返回；草稿仍在。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTabs, UTabPanel, UTextField } from '@lingyzh/ui';\nconst selected = ref('overview');\nconst draft = ref('');\nconst items = [\n    { id: 'overview', label: '概览' },\n    { id: 'details', label: '详情' }\n];\n</script>\n\n<template>\n    <u-tabs v-model=\"selected\" :items=\"items\" id-prefix=\"draft\" />\n    <u-tab-panel :model-value=\"selected\" value=\"overview\" id-prefix=\"draft\">\n        <u-text-field v-model=\"draft\" aria-label=\"面板草稿\" />\n    </u-tab-panel>\n    <u-tab-panel :model-value=\"selected\" value=\"details\" id-prefix=\"draft\">详情内容</u-tab-panel>\n</template>"
            }
        ],
        "notes": [
            "保留旧 modelValue/value/idPrefix 关联方式，始终挂载并使用 v-show 隐藏；新用法使用 UTabsWindow 统一管理。",
            "面板具备 role=tabpanel、aria-labelledby 与 tabindex=0。"
        ]
    },
    {
        "id": "dialog",
        "title": "弹窗",
        "name": "UiDialog",
        "description": "基于原生 modal 的焦点约束，明确区分“请求关闭”和“真正完成退出”。",
        "kind": "component",
        "group": "反馈组件",
        "examples": [
            {
                "id": "dialog-scrollable",
                "title": "长表单与固定提示",
                "description": "只有正文滚动；标题、错误和操作始终可见，滚动条裁剪在圆角内部。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDialog, UButton } from '@lingyzh/ui';\nconst open = ref(false);\nconst error = ref('');\n</script>\n\n<template>\n    <u-dialog v-model:open=\"open\" scrollable :error=\"error\" aria-label=\"长表单\">\n        <template #header><h2>编辑配置</h2></template>\n        <p>表单正文</p>\n        <template #footer><u-button @click=\"open = false\">关闭</u-button></template>\n    </u-dialog>\n</template>"
            },
            {
                "id": "dialog-lifecycle",
                "title": "原生弹窗与生命周期",
                "description": "打开弹窗后尝试 Tab、Esc、遮罩和关闭按钮。状态记录覆盖整个进出过程。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UDialog, UTextField } from '@lingyzh/ui';\nconst open = ref(false);\nconst present = ref(false);\nconst closes = ref(0);\n</script>\n\n<template>\n    <u-button @click=\"open = true\">打开示例弹窗</u-button>\n    <u-dialog v-model:open=\"open\" aria-labelledby=\"dialog-title\" @present-change=\"present = $event\" @closed=\"closes++\">\n        <h2 id=\"dialog-title\">共享弹窗</h2>\n        <u-text-field autofocus aria-label=\"弹窗输入\" />\n        <u-button @click=\"open = false\">关闭弹窗</u-button>\n    </u-dialog>\n</template>"
            },
            {
                "id": "dialog-sizes",
                "title": "宽度与侧边抽屉",
                "description": "size 固定弹窗宽度并始终适应视口；placement=\"end\" 适合任务中心等侧边面板，焦点约束与生命周期不变。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDialog } from '@lingyzh/ui';\nconst open = ref(false);\nconst drawer = ref(false);\n</script>\n\n<template>\n    <u-dialog v-model:open=\"open\" size=\"md\" aria-labelledby=\"title\">…</u-dialog>\n    <u-dialog v-model:open=\"drawer\" placement=\"end\" scrollable aria-labelledby=\"drawer-title\">\n        <template #header><h2 id=\"drawer-title\">任务中心</h2></template>\n        …\n    </u-dialog>\n</template>"
            },
            {
                "id": "layout-form-dialog",
                "title": "顶部浮动错误",
                "description": "错误浮在滚动区顶部，正文高度保持稳定；动态内边距保护第一项，多行错误可实际切换。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDialog, UForm, UTextField, UButton, URow, UCol } from '@lingyzh/ui';\nconst open = ref(false);\nconst name = ref('');\n</script>\n\n<template>\n    <u-dialog v-model:open=\"open\" scrollable error=\"配置未保存，请检查表单内容。\">\n        <template #header>\n            <h2>表单配置</h2>\n        </template>\n        <u-form>\n            <u-row>\n                <u-col :cols=\"12\">\n                    <u-text-field v-model=\"name\" label=\"名称\" />\n                </u-col>\n            </u-row>\n        </u-form>\n        <template #footer>\n            <u-button @click=\"open = false\">关闭</u-button>\n        </template>\n    </u-dialog>\n</template>"
            }
        ],
        "notes": [
            "须提供可访问名称；ref 暴露原生 element。",
            "Electron WebContentsView 在 present=true 期间保持隐藏。跳转、打开下一个弹窗和操作结果提示应放在 closed 后。",
            "快速重开会使过期关闭回调失效。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "collapse",
        "title": "折叠区域",
        "name": "UiCollapse",
        "description": "高度与透明度平滑过渡，关闭后立即阻止交互，内容实例继续保留。",
        "kind": "component",
        "group": "容器组件",
        "examples": [
            {
                "id": "collapse-content",
                "title": "展开说明与保留输入",
                "description": "展开后输入草稿，再收起和展开。草稿保留，收起期间内部输入不会进入 Tab 顺序。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UCollapse, UTextField } from '@lingyzh/ui';\nconst expanded = ref(false);\nconst draft = ref('');\n</script>\n\n<template>\n    <u-button :aria-expanded=\"expanded\" aria-controls=\"advanced\" @click=\"expanded = !expanded\">高级选项</u-button>\n    <u-collapse id=\"advanced\" :open=\"expanded\">\n        <u-text-field v-model=\"draft\" aria-label=\"高级选项草稿\" />\n    </u-collapse>\n</template>"
            }
        ],
        "notes": [
            "触发按钮由页面提供，并设置 aria-expanded / aria-controls。",
            "关闭时立即 inert、aria-hidden；隐藏不会销毁子组件。"
        ]
    },
    {
        "id": "snackbar-host",
        "title": "提示容器",
        "name": "UiSnackbarHost",
        "description": "在应用根部挂载一次，负责全局提示的六方位布局、辅助技术通知与计时暂停。",
        "kind": "component",
        "group": "反馈组件",
        "examples": [
            {
                "id": "snackbar-playground",
                "title": "提示游乐场",
                "description": "选择位置、时长和类型，连续添加提示。悬停或聚焦关闭按钮都会暂停计时。",
                "code": "<script setup>\nimport { USnackbarHost, UButton, snackbar } from '@lingyzh/ui';\nfunction show() { snackbar.show('更改已保存，可继续工作。', { position: 'bottom-center', duration: 6000, tone: 'success' }); }\n</script>\n\n<template>\n    <!-- 根组件中挂载一次 -->\n    <u-snackbar-host />\n    <u-button @click=\"show\">显示通知</u-button>\n</template>"
            }
        ],
        "notes": [
            "无 props、emits 与 slots；提示通过 snackbar 服务创建。",
            "每个方位最多保留 3 条，超出时移除最早一条并清理计时器。",
            "普通提示 role=status，错误 role=alert；Host 卸载会清理全部提示。",
            "Host 位于文档层；原生 modal 打开期间遵循顶层遮罩。"
        ]
    },
    {
        "id": "snackbar",
        "title": "全局提示服务",
        "name": "snackbar",
        "kind": "service",
        "group": "服务",
        "description": "用模块单例从任意 JS / TS 文件显示反馈；业务模块无需获得容器 ref。",
        "examples": [
            {
                "id": "snackbar-service",
                "title": "创建、撤销与清空",
                "description": "每次 show 返回数字 id，可按 id 撤销。duration=0 适合必须手动关闭的提示。",
                "code": "const id = snackbar.show('连接失败，请重试。', {\n    position: 'top-right', duration: 0, tone: 'error'\n});\nsnackbar.dismiss(id);\nsnackbar.clear();\nsnackbar.configure({ position: 'bottom-center', duration: 6000 });"
            }
        ],
        "props": [
            {
                "name": "position",
                "type": "top-left | top-center | top-right | bottom-left | bottom-center | bottom-right",
                "fallback": "bottom-center",
                "description": "提示方位。"
            },
            {
                "name": "duration",
                "type": "number（毫秒）",
                "fallback": "6000",
                "description": "0 表示手动关闭，负数归一为 0。"
            },
            {
                "name": "tone",
                "type": "'info' | 'success' | 'error'",
                "fallback": "info",
                "description": "通知语义和状态标记。"
            }
        ],
        "events": [
            {
                "name": "show(message, options?)",
                "type": "(string, SnackbarOptions) => number",
                "fallback": "—",
                "description": "显示提示并返回唯一 id。"
            },
            {
                "name": "dismiss(id)",
                "type": "(number) => void",
                "fallback": "—",
                "description": "移除指定提示与计时器。"
            },
            {
                "name": "clear()",
                "type": "() => void",
                "fallback": "—",
                "description": "移除全部提示。"
            },
            {
                "name": "configure(options)",
                "type": "(SnackbarOptions) => void",
                "fallback": "—",
                "description": "更新全局默认值，仅影响之后的提示。"
            }
        ],
        "notes": [
            "指针悬停、键盘焦点分别暂停计时；两者都离开后按剩余时间继续。",
            "不要在每个业务模块重复挂载 Host；服务不污染 window。",
            "用户必须处理的错误应在对应字段或页面中持续可见，提示用于补充反馈。"
        ]
    },
    {
        "id": "tokens",
        "title": "设计变量",
        "name": "Design tokens",
        "kind": "guide",
        "group": "设计基础",
        "description": "语义化 CSS 变量连接浅深主题、字体与动效。页面按用途取值，无需记住具体色码。",
        "sections": [
            {
                "id": "palette",
                "title": "颜色与表面",
                "text": "主题选择会更新根元素 data-theme，以下色卡直接使用当前 tokens。色彩传达层级，同时辅以文本和形状表达状态。"
            },
            {
                "id": "type",
                "title": "字体与阅读",
                "items": [
                    "--font：系统无衬线与中文字体，用于正文与操作。",
                    "--serif：Georgia 与中文宋体，用于文档标题。",
                    "--mono：Cascadia Code / Consolas，用于源码和技术标识。",
                    "--code-size：默认 13px，代码区支持换行和横向滚动。"
                ]
            },
            {
                "id": "layout",
                "title": "布局与间距",
                "text": "组件尺寸取自 styles.css：常规输入与按钮最小高度 36px，紧凑按钮 29px，按钮圆角 8px，弹窗圆角 15px。布局工具类使用 4px 间距步长，支持 0–16 级和方向组合。",
                "code": ".workspace-section {\n    padding: 24px;\n    background: var(--surface);\n    border: 1px solid var(--border);\n    color: var(--text);\n}"
            },
            {
                "id": "theme",
                "title": "切换主题",
                "text": "使用 createUiTheme 注册主题，useUiTheme 切换；局部区域使用 UThemeProvider 或 Card/Dialog 的 theme 属性。详见主题页。",
                "code": "import { useUiTheme } from '@lingyzh/ui';\nconst theme = useUiTheme();\nawait theme.change('dark');\nawait theme.change('system');"
            }
        ]
    },
    {
        "id": "accessibility",
        "title": "可访问性",
        "name": "Accessibility",
        "kind": "guide",
        "group": "设计基础",
        "description": "可访问性来自原生语义、稳定的名称与明确状态，也来自页面正确地组合它们。",
        "sections": [
            {
                "id": "names",
                "title": "每个控件都需要名称",
                "text": "优先使用可见 label。UField 的 controlAttrs 必须绑定到控件。图标按钮用 aria-label，弹窗用 aria-labelledby 关联可见标题。提示和 placeholder 都不能代替控件名称。",
                "code": "<u-button icon aria-label=\"关闭面板\"><Icon name=\"close\" /></u-button>\n<u-dialog v-model:open=\"open\" aria-labelledby=\"title\">\n    <h2 id=\"title\">设置</h2>\n</u-dialog>"
            },
            {
                "id": "keyboard",
                "title": "键盘操作",
                "items": [
                    "按钮：Enter / Space；禁用与 loading 时不可触发。",
                    "输入与选择：浏览器原生编辑和选择规则。",
                    "开关：Space 切换，Tab 进入。",
                    "标签页：单一 Tab 入口；方向键、Home / End 移动焦点，Enter / Space 确认，跳过禁用项；automatic 可显式启用。",
                    "弹窗：约束焦点，Esc 请求关闭，键盘退出后恢复触发控件焦点，指针退出后释放操作焦点。",
                    "折叠区域：关闭时 inert，内部控件退出可交互范围。"
                ]
            },
            {
                "id": "feedback",
                "title": "状态和反馈",
                "text": "错误同时提供文字、边框和语义，避免只靠红色。Snackbar 的错误使用 alert，其余使用 status。保持焦点可见，不用 outline:none 覆盖组件焦点样式。"
            },
            {
                "id": "verify",
                "title": "页面验收",
                "items": [
                    "仅用键盘完成主要任务，确认焦点顺序符合阅读顺序。",
                    "检查名称、描述、aria-invalid 及 Tabs / Panel ID 配对。",
                    "200% 缩放下仍能读取、操作，代码与 API 表允许滚动。",
                    "浅深主题与减少动效均可用，重要内容不依赖动画显现。"
                ]
            }
        ]
    },
    {
        "id": "motion",
        "title": "动效与生命周期",
        "name": "Motion & lifecycle",
        "kind": "guide",
        "group": "设计基础",
        "description": "动效帮助理解状态变化；生命周期信号用于协调真正的操作时机。",
        "sections": [
            {
                "id": "rhythm",
                "title": "三种节奏",
                "items": [
                    "--motion-fast：140ms，快速状态反馈。",
                    "--motion-normal：180ms，标签面板与折叠状态。",
                    "--motion-layout：240ms，预留布局节奏。",
                    "--ease：cubic-bezier(.2, .7, .2, 1)，统一过渡曲线。"
                ],
                "text": "控件 hover / focus 与 Snackbar 使用轻量过渡；弹窗进入 180ms、退出 140ms。具体实现以共享样式为准，避免为流式文本逐 token 播放动画。"
            },
            {
                "id": "reduced",
                "title": "尊重减少动效",
                "text": "系统 prefers-reduced-motion 或应用 data-reduced-motion=\"true\" 任一启用，都关闭非必要动效。使用下面的真实开关试验。",
                "demo": "motion-toggle",
                "code": "document.documentElement.dataset.reducedMotion = 'true';"
            },
            {
                "id": "lifecycle",
                "title": "等待真正关闭",
                "text": "open=false 是关闭请求，closed 才代表原生弹窗已释放顶层且焦点恢复。present-change 在进入开始发出 true、退出结束发出 false。嵌入视图的隐藏和恢复必须跟随 present 信号。",
                "code": "<u-dialog v-model:open=\"open\"\n    @present-change=\"embeddedViewHidden = $event\"\n    @closed=\"completeAction\"\n>\n    <!-- 内容 -->\n</u-dialog>"
            },
            {
                "id": "persistence",
                "title": "保留阅读与输入状态",
                "text": "UTabPanel 和 UCollapse 保留子组件实例。切换时让用户继续原来的草稿与阅读任务；业务页面自行决定何时清理状态。"
            }
        ]
    },
    {
        "id": "card",
        "title": "卡片",
        "name": "UiCard",
        "description": "把标题、内容和操作组织成明确的容器，统一表单、标签页与操作区的内边距。",
        "kind": "component",
        "group": "容器组件",
        "examples": [
            {
                "id": "card-provider",
                "title": "紧凑服务卡片",
                "description": "长地址截断、操作换行；能力图标提供可访问名称和悬停说明。",
                "code": "<script setup>\nimport { UCard, USwitch, UIcon } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-card density=\"compact\"><label>启用 <u-switch v-model=\"enabled\" /></label><span title=\"图片输入\" role=\"img\" aria-label=\"图片输入\"><u-icon name=\"image\" :size=\"16\" /></span></u-card>\n</template>"
            },
            {
                "id": "card-form",
                "title": "卡片中的表单",
                "description": "标题与说明、字段、底部操作各有稳定的区域。紧凑密度适用于侧栏。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCard, UField, UTextField, UButton } from '@lingyzh/ui';\nconst name = ref('UAH');\n</script>\n\n<template>\n    <u-card title=\"工作区偏好\" subtitle=\"保存当前工作区的显示选项。\">\n        <u-text-field label=\"名称\" id=\"card-name\" v-model=\"name\" />\n        <template #actions><u-button variant=\"ghost\">取消</u-button><u-button variant=\"primary\">保存</u-button></template>\n    </u-card>\n</template>"
            },
            {
                "id": "card-variants",
                "title": "表面与布局",
                "description": "outlined、elevated、tonal 与 flat；使用 flush 让 Tabs、代码块或媒体对齐卡片边缘。",
                "code": "<script setup>\nimport { UCard } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"d-flex flex-wrap ga-4\">\n        <u-card v-for=\"variant in ['outlined', 'elevated', 'tonal', 'flat']\" :key=\"variant\" :variant=\"variant\" density=\"compact\" :title=\"variant\">同一套内容与间距。</u-card>\n    </div>\n</template>"
            },
            {
                "id": "card-shared-variants",
                "title": "密度、透明与直角变体",
                "description": "分别比较默认、dense、ghost 和 rounded=false；每个示例使用真实组件，可独立操作。",
                "code": "<script setup>\nimport { UCard } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-card title=\"工作区\" >项目、文件与最近使用的内容。</u-card>\n    <u-card title=\"工作区\" dense>项目、文件与最近使用的内容。</u-card>\n    <u-card title=\"工作区\" ghost>项目、文件与最近使用的内容。</u-card>\n    <u-card title=\"工作区\" :rounded=\"false\">项目、文件与最近使用的内容。</u-card>\n</template>"
            }
        ],
        "notes": [
            "为 section 提供可访问名称，例如 aria-label 或 aria-labelledby。",
            "卡片本身不是按钮；可点击动作使用真正按钮，避免嵌套交互。",
            "本页提供各变体的独立示例；跨组件组合见“统一样式变体”文档。"
        ]
    },
    {
        "id": "scroll-area",
        "title": "滚动区域",
        "name": "UiScrollArea",
        "description": "透明轨道与悬浮圆角滑块，悬停、聚焦或滚动时显示；内容仍使用浏览器原生滚动。",
        "kind": "component",
        "group": "容器组件",
        "examples": [
            {
                "id": "scroll-content",
                "title": "受限高度与键盘滚动",
                "description": "聚焦后使用方向键或 PageDown；滚动条在整个应用中使用同一份样式。",
                "code": "<script setup>\nimport { UScrollArea } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-scroll-area label=\"运行日志\" max-height=\"220px\">\n        <p v-for=\"line in 24\" :key=\"line\" class=\"px-4 py-2 ma-0\">日志 {{ line }} · 等待任务</p>\n    </u-scroll-area>\n</template>"
            },
            {
                "id": "scroll-horizontal",
                "title": "横向滑块与常显",
                "description": "拖动滑块或点击轨道跳转。always 可保持滑块显示，无溢出时自动隐藏。",
                "code": "<script setup>\nimport { UScrollArea, UCard } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-scroll-area label=\"横向项目\" axis=\"horizontal\" always><div class=\"d-flex ga-4 pa-4\" style=\"width: max-content\"><u-card v-for=\"item in 12\" :key=\"item\" :title=\"`项目 ${item}`\" density=\"compact\" style=\"width: 160px\">水平拖动查看。</u-card></div></u-scroll-area>\n</template>"
            },
            {
                "id": "scroll-area-shared-variants",
                "title": "密度、透明与直角变体",
                "description": "分别比较默认、dense、ghost 和 rounded=false；每个示例使用真实组件，可独立操作。",
                "code": "<script setup>\nimport { UScrollArea } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-scroll-area label=\"运行日志\" height=\"120px\" always ><p v-for=\"line in 10\" :key=\"line\" class=\"pa-3 ma-0\">日志 {{ line }}</p></u-scroll-area>\n    <u-scroll-area label=\"运行日志\" height=\"120px\" always dense><p v-for=\"line in 10\" :key=\"line\" class=\"pa-3 ma-0\">日志 {{ line }}</p></u-scroll-area>\n    <u-scroll-area label=\"运行日志\" height=\"120px\" always ghost><p v-for=\"line in 10\" :key=\"line\" class=\"pa-3 ma-0\">日志 {{ line }}</p></u-scroll-area>\n    <u-scroll-area label=\"运行日志\" height=\"120px\" always :rounded=\"false\"><p v-for=\"line in 10\" :key=\"line\" class=\"pa-3 ma-0\">日志 {{ line }}</p></u-scroll-area>\n</template>"
            }
        ],
        "notes": [
            "ref 暴露实际 viewport element、focus()、scrollTo(options)、update()。",
            "滑块支持拖动、点击轨道、pointercancel 与卸载清理；ResizeObserver 同步内容尺寸。",
            "原生区域共享细圆角透明轨道样式；本组件提供不占布局空间的悬浮滑块。",
            "代码块直接复用本组件，键盘操作由带名称的滚动区域承接。",
            "本页提供各变体的独立示例；跨组件组合见“统一样式变体”文档。"
        ]
    },
    {
        "id": "code-block",
        "title": "代码块",
        "name": "UiCodeBlock",
        "description": "用语法颜色区分标签、属性、字符串和关键字，支持浅深主题、复制与换行。",
        "kind": "component",
        "group": "内容组件",
        "examples": [
            {
                "id": "code-highlight",
                "title": "Vue 语法高亮",
                "description": "源码作为字符串展示，绝不执行；复制得到不含高亮标签的原始文本。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCodeBlock, UButton } from '@lingyzh/ui';\nconst source = '<template><u-button>保存</u-button></template>';\n</script>\n\n<template>\n    <u-code-block :code=\"source\" language=\"vue\" />\n</template>"
            },
            {
                "id": "code-block-shared-variants",
                "title": "密度、透明与直角变体",
                "description": "分别比较默认、dense、ghost 和 rounded=false；每个示例使用真实组件，可独立操作。",
                "code": "<script setup>\nimport { UCodeBlock } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-code-block code=\"const saved = true;\" language=\"javascript\"  />\n    <u-code-block code=\"const saved = true;\" language=\"javascript\" dense />\n    <u-code-block code=\"const saved = true;\" language=\"javascript\" ghost />\n    <u-code-block code=\"const saved = true;\" language=\"javascript\" :rounded=\"false\" />\n</template>"
            }
        ],
        "notes": [
            "支持真实 Vue SFC 的 script/template/style 高亮。",
            "代码区最大高度 580px；横向溢出可滚动或手动启用换行。",
            "本页提供各变体的独立示例；跨组件组合见“统一样式变体”文档。"
        ]
    },
    {
        "id": "ripple",
        "title": "涟漪反馈",
        "name": "vRipple",
        "group": "设计基础",
        "kind": "guide",
        "description": "对齐 Vuetify 的按下、最短显示与退场周期；快速点击也完整扩散淡出，连续点击的波纹可并存。",
        "sections": [
            {
                "id": "demo",
                "title": "指针与键盘",
                "demo": "ripple-feedback",
                "text": "按钮和 Tabs 默认启用。快速点击、长按和连续点击均可验收；扩散 250ms、显现 100ms、最短显示 250ms 后淡出 300ms。自动释放指针焦点不删除波纹。禁用控件和减少动效不产生涟漪。",
                "code": "import { vRipple } from '@lingyzh/ui';\n// 在 script setup 中导入后可直接使用 v-ripple\n<u-button :ripple=\"{ center: true }\">居中反馈</u-button>\n<button v-ripple class=\"pa-4\">原生按钮</button>"
            },
            {
                "id": "options",
                "title": "修饰符、颜色与传播",
                "demo": "ripple-options",
                "text": ".center 固定中心，.circle 使用圆形扩散半径，.stop 只阻止祖先波纹而保留事件冒泡。支持 class 主题辅助类、color 兼容选项和自定义 keys。触摸延迟 80ms，短点按依然完成反馈，滚动在延迟前取消显示。",
                "code": "<script setup>\nimport { UButton, vRipple } from '@lingyzh/ui';\n</script>\n\n<template>\n    <button v-ripple.center.circle aria-label=\"圆形反馈\" style=\"width:56px;height:56px;border-radius:50%\">+</button>\n    <u-button :ripple=\"{ class: 'text-primary' }\">主题颜色</u-button>\n    <u-button :ripple=\"{ keys: ['a'] }\">按 A 反馈</u-button>\n    <div v-ripple>\n        <button v-ripple>内层反馈</button>\n        <button v-ripple.stop>仅阻止外层反馈</button>\n    </div>\n</template>"
            },
            {
                "id": "contract",
                "title": "使用契约",
                "items": [
                    "UButton / UTabs / UTab：ripple 为 boolean 或 { center?: boolean, circle?: boolean, class?: string, color?: string, keys?: string[] }，默认为 true；键盘 keys 默认为 Enter / Space，也接受空格字符。",
                    "v-ripple 只负责视觉；原生元素须自行提供按钮语义、键盘操作与名称。",
                    "v-ripple 支持 .center / .circle / .stop。嵌套时仅内层产生波纹；.stop 不产生自身波纹，也不调用 stopPropagation。键盘重复按键不会叠加；普通指针失焦不清除波纹，键盘失焦和鼠标离开会完成退场。",
                    "触摸短点按提交延迟中的波纹，滑动／取消不强制提交。动态关闭、禁用、减少动态效果、隐藏页面与卸载清理动画和定时器；默认 UAH 波纹强度保留为 .14，可用 --ripple-opacity 覆盖。不改变宿主 overflow，静态宿主仅在波纹显示时临时定位并恢复。"
                ]
            }
        ]
    },
    {
        "id": "utilities",
        "title": "布局工具类",
        "name": "Utilities",
        "group": "设计基础",
        "kind": "guide",
        "description": "用预制 class 组合常见布局和间距，让卡片、表单与操作区保持一致。",
        "sections": [
            {
                "id": "demo",
                "title": "组合布局",
                "demo": "utility-layout",
                "code": "<div class=\"d-flex align-center justify-space-between ga-4 pa-4\">\n    <span class=\"flex-grow-1\">工作区</span>\n    <u-button size=\"sm\">打开</u-button>\n</div>"
            },
            {
                "id": "spacing",
                "title": "间距：每级 4px",
                "items": [
                    "ma-0 … ma-16 / pa-0 … pa-16：所有方向；1 = 4px，4 = 16px。",
                    "x / y：水平/垂直；t / b / l / r：单边；s / e：逻辑起始/结束边。示例 mx-2、pt-2、pe-4。",
                    "margin 支持 auto，例如 ms-auto、mx-auto。ga-0 … ga-16 用于 gap。",
                    "工具类使用 !important 明确覆盖组件布局；不承诺兼容 Vuetify 全量工具类。"
                ]
            },
            {
                "id": "layout",
                "title": "布局与断点",
                "items": [
                    "d-flex / d-inline-flex / d-grid / d-block / d-none。",
                    "flex-row / flex-column / flex-wrap / flex-nowrap / flex-grow-1 / flex-shrink-0。",
                    "align-start/center/end；justify-start/center/end/space-between。",
                    "w-100 / h-100 / min-w-0 / overflow-auto/hidden / text-start/center/end/muted。",
                    "sm ≥ 600px、md ≥ 840px、lg ≥ 1145px、xl ≥ 1545px、xxl ≥ 2138px：显示、flex、对齐和间距支持断点，例如 d-none d-md-flex、flex-column flex-sm-row、pa-lg-4。"
                ]
            }
        ]
    },
    {
        "id": "variants",
        "title": "统一样式变体",
        "name": "Variants",
        "group": "设计基础",
        "kind": "guide",
        "description": "用同一组属性控制适用组件的密度、表面与圆角。",
        "sections": [
            {
                "id": "playground",
                "title": "组合预览",
                "demo": "style-variants",
                "code": "<u-card dense ghost :rounded=\"false\">\n    <u-text-field v-model=\"name\" dense ghost :rounded=\"false\" aria-label=\"名称\" />\n    <u-button dense ghost :rounded=\"false\">操作</u-button>\n</u-card>"
            },
            {
                "id": "scope",
                "title": "支持范围",
                "items": [
                    "按钮、输入框、选择器、Tabs、Card、代码块、滚动区域、表格、服务端表格及分页器支持 dense、ghost、rounded；各自页面提供变体演示。",
                    "dense 缩小控件高度、内边距或滚动滑块宽度；不缩小字体到不可读尺寸。",
                    "ghost 使用透明表面；输入框聚焦和错误状态仍有明确边框。",
                    "rounded=false 去除组件圆角，包含 Tabs 指示条和滚动滑块。",
                    "开关、弹窗、Snackbar 等保留表达状态所需的既定形态，不机械套用透明表面。"
                ]
            }
        ]
    },
    {
        "id": "focus",
        "title": "操作与焦点规范",
        "name": "Focus",
        "kind": "guide",
        "group": "开始使用",
        "description": "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。",
        "sections": [
            {
                "id": "demo",
                "title": "指针操作与键盘焦点",
                "text": "使用真实开关、复选框、单选、按钮、Tabs、色板、折叠和输入框比较两种操作方式。",
                "demo": "layout-focus",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USwitch, UCheckbox, URadio, UButton, UTabs, UTabPanel, UColorSwatches, UActivity, UTextField } from '@lingyzh/ui';\nconst enabled = ref(false);\nconst choice = ref('a');\nconst text = ref('');\nconst selectedTab = ref('first');\nconst color = ref(null);\nconst status = ref('');\n</script>\n\n<template>\n    <label><u-switch v-model=\"enabled\" />开关</label>\n    <u-checkbox v-model=\"enabled\">复选框</u-checkbox>\n    <u-radio v-model=\"choice\" name=\"choice\" value=\"a\">选项 A</u-radio>\n    <u-radio v-model=\"choice\" name=\"choice\" value=\"b\">选项 B</u-radio>\n    <u-button @click=\"status = '动作已执行'\">执行动作</u-button>\n    <u-tabs v-model=\"selectedTab\" id-prefix=\"focus\" :items=\"[{ id: 'first', label: '第一项' }, { id: 'second', label: '第二项' }]\" />\n    <u-tab-panel :model-value=\"selectedTab\" value=\"first\" id-prefix=\"focus\">第一项内容</u-tab-panel>\n    <u-tab-panel :model-value=\"selectedTab\" value=\"second\" id-prefix=\"focus\">第二项内容</u-tab-panel>\n    <u-color-swatches v-model=\"color\" label=\"示例色板\" />\n    <u-activity title=\"示例折叠\">折叠内容</u-activity>\n    <u-text-field v-model=\"text\" aria-label=\"保持编辑焦点\" />\n    <p role=\"status\">{{ status }}</p>\n</template>"
            }
        ]
    }
];

pages.push(...tablePages, ...feedbackPages, ...controlPages, ...layoutPages, ...themePages);
for (const page of pages) {
    if (page.name?.startsWith('Ui')) page.name = page.name === 'Ui' + 'Input' ? 'UTextField' : page.name === 'Ui' + 'Badge' ? 'UChip' : 'U' + page.name.slice(2);
    if (page.name === 'UChip' && page.id === 'badge') { page.id = 'chip'; page.title = '标签'; }
}
for (const page of completionPages) {
    const existing = pages.find(existing => existing.name === page.name);
    if (!existing) pages.push(page);
    else for (const example of page.examples) if (!existing.examples.some(item => item.id === example.id)) existing.examples.push(example);
}
pages.find(page => page.name === 'UButton').examples.push(buttonLoadingExample);
for (const page of pages.filter(page => page.kind === 'component')) {
    const api = componentApi[page.name];
    if (!api) throw new Error(`Missing API reference for ${page.name}`);
    Object.assign(page, api);
}

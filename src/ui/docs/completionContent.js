// Generated from root-authored real demos.
export const completionPages = [
    {
        "id": "code",
        "title": "行内代码",
        "name": "UCode",
        "kind": "component",
        "group": "内容组件",
        "description": "行内代码的独立用法与交互。",
        "examples": [
            {
                "id": "component-code",
                "title": "行内代码的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UCode } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCode\">\n        <p>\n            安装组件库：\n            <u-code>npm install @lingyzh/ui</u-code>\n        </p>\n        <p>\n            模板使用\n            <u-code>&lt;u-button color=\"primary\" /&gt;</u-code>\n            ，普通正文与代码保持可读字号。\n        </p>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    min-width: 0;\n}\n.component-demo p {\n    margin: 0 0 16px;\n    line-height: 1.8;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "slide-group",
        "title": "滑动选择组",
        "name": "USlideGroup",
        "kind": "component",
        "group": "导航组件",
        "description": "滑动选择组的独立用法与交互。",
        "examples": [
            {
                "id": "component-slide-group",
                "title": "滑动选择组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, USlideGroup, USlideGroupItem, USwitch } from '@lingyzh/ui';\nconst selected = ref('project-1');\nconst multiple = ref(false);\nconst vertical = ref(false);\nconst disabled = ref(false);\nconst center = ref(true);\nfunction changeMultiple(value) {\n    selected.value = value ? [selected.value].filter(Boolean) : selected.value[0];\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USlideGroup\">\n        <div class=\"demo-row\">\n            <u-switch\n                v-model=\"multiple\"\n                label=\"多选（最多3项）\"\n                @update:model-value=\"changeMultiple\"\n            />\n            <u-switch v-model=\"vertical\" label=\"垂直\" />\n            <u-switch v-model=\"center\" label=\"居中当前项\" />\n            <u-switch v-model=\"disabled\" label=\"禁用组\" />\n        </div>\n        <u-slide-group\n            v-model=\"selected\"\n            :multiple=\"multiple\"\n            mandatory\n            :max=\"3\"\n            :disabled=\"disabled\"\n            :center-active=\"center\"\n            :direction=\"vertical ? 'vertical' : 'horizontal'\"\n            show-arrows=\"always\"\n            scroll-snap=\"center\"\n            aria-label=\"项目选择\"\n        >\n            <u-slide-group-item\n                v-for=\"item in 12\"\n                :key=\"item\"\n                v-slot=\"{ isSelected, toggle }\"\n                :value=\"`project-${item}`\"\n                :disabled=\"item === 5\"\n            >\n                <u-button\n                    :variant=\"isSelected ? 'tonal' : 'outlined'\"\n                    :color=\"isSelected ? 'primary' : undefined\"\n                    :aria-pressed=\"isSelected\"\n                    :disabled=\"disabled || item === 5\"\n                    @click=\"toggle\"\n                >\n                    项目 {{ item }}{{ item === 5 ? ' · 禁用' : '' }}\n                </u-button>\n            </u-slide-group-item>\n        </u-slide-group>\n        <output>当前值：{{ JSON.stringify(selected) }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    font-size: 14px;\n    color: var(--muted);\n    overflow-wrap: anywhere;\n}\n.demo-row {\n    margin: 0;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "slide-group-item",
        "title": "滑动选择项",
        "name": "USlideGroupItem",
        "kind": "component",
        "group": "导航组件",
        "description": "滑动选择项的独立用法与交互。",
        "examples": [
            {
                "id": "component-slide-group-item",
                "title": "滑动选择项的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, USlideGroup, USlideGroupItem } from '@lingyzh/ui';\nconst selected = ref();\nconst selections = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USlideGroupItem\">\n        <u-slide-group v-model=\"selected\" show-arrows=\"always\" aria-label=\"无包装选择项\">\n            <u-slide-group-item\n                v-for=\"item in ['概览', '文件', '设置']\"\n                :key=\"item\"\n                v-slot=\"{ isSelected, selectedClass, toggle }\"\n                :value=\"item\"\n                selected-class=\"demo-selected\"\n                @group:selected=\"selections++\"\n            >\n                <u-button\n                    :class=\"selectedClass\"\n                    :variant=\"isSelected ? 'tonal' : 'text'\"\n                    color=\"primary\"\n                    :aria-pressed=\"isSelected\"\n                    @click=\"toggle\"\n                >\n                    {{ item }}\n                </u-button>\n            </u-slide-group-item>\n        </u-slide-group>\n        <p>Item 通过插槽提供选择状态和操作；直接使用你自己的按钮、卡片或其他可操作内容。</p>\n        <output>当前：{{ selected || '未选择' }}；状态变化：{{ selections }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo p {\n    margin: 0;\n    color: var(--muted);\n    line-height: 1.7;\n}\n.component-demo > output {\n    font-size: 14px;\n    color: var(--muted);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "snackbar",
        "title": "受控消息",
        "name": "USnackbar",
        "kind": "component",
        "group": "反馈组件",
        "description": "受控消息的独立用法与交互。",
        "examples": [
            {
                "id": "component-snackbar",
                "title": "受控消息的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, USelect, USnackbar, USwitch, UTextField } from '@lingyzh/ui';\nconst open = ref(false);\nconst text = ref('配置已保存，可以继续编辑。');\nconst permanent = ref(false);\nconst contained = ref(true);\nconst variant = ref('elevated');\nconst location = ref('bottom center');\nconst colors = ref('');\nconst closed = ref(0);\nconst variants = ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'];\nconst locations = [\n    'top left',\n    'top center',\n    'top right',\n    'bottom left',\n    'bottom center',\n    'bottom right',\n];\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USnackbar\">\n        <u-text-field v-model=\"text\" label=\"消息内容\" />\n        <div class=\"demo-row\">\n            <u-select v-model=\"variant\" :items=\"variants\" label=\"样式\" />\n            <u-select v-model=\"location\" :items=\"locations\" label=\"位置\" />\n            <u-text-field v-model=\"colors\" label=\"主题/CSS颜色\" placeholder=\"primary / #47745c\" />\n        </div>\n        <div class=\"demo-row\">\n            <u-switch v-model=\"permanent\" label=\"持续显示\" />\n            <u-switch v-model=\"contained\" label=\"容器内显示\" />\n            <u-button @click=\"open = !open\">{{ open ? '隐藏消息' : '显示消息' }}</u-button>\n        </div>\n        <div class=\"notice-demo-stage\">\n            <p>鼠标悬停和键盘进入操作区都会暂停倒计时。</p>\n            <u-snackbar\n                v-model=\"open\"\n                :text=\"text\"\n                :timeout=\"permanent ? -1 : 3500\"\n                :contained=\"contained\"\n                :variant=\"variant\"\n                :location=\"location\"\n                :color=\"colors\"\n                timer\n                @after-leave=\"closed++\"\n            >\n                <template #actions=\"{ close }\">\n                    <u-button variant=\"text\" size=\"sm\" @click=\"close\">关闭</u-button>\n                </template>\n            </u-snackbar>\n        </div>\n        <output>显示：{{ open }}；已关闭：{{ closed }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.demo-row {\n    margin: 0;\n}\n.demo-row > .ui-control-frame {\n    flex: 1 1 160px;\n    min-width: 0;\n}\n.notice-demo-stage {\n    position: relative;\n    min-height: 180px;\n    padding: 20px;\n    border: 1px dashed var(--border);\n    border-radius: 8px;\n}\n.notice-demo-stage p {\n    margin: 0;\n    color: var(--muted);\n    line-height: 1.7;\n}\n.component-demo > output {\n    font-size: 14px;\n    color: var(--muted);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "snackbar-queue",
        "title": "消息队列",
        "name": "USnackbarQueue",
        "kind": "component",
        "group": "反馈组件",
        "description": "消息队列的独立用法与交互。",
        "examples": [
            {
                "id": "component-snackbar-queue",
                "title": "消息队列的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, USelect, USnackbarQueue, USwitch } from '@lingyzh/ui';\nconst messages = ref([]);\nconst queue = ref();\nconst strategy = ref('hold');\nconst totalVisible = ref(1);\nconst collapsed = ref(false);\nconst events = ref([]);\nlet sequence = 0;\nfunction add() {\n    messages.value = [\n        ...messages.value,\n        ...Array.from({ length: 3 }, () => ({\n            text: `消息 ${++sequence}：已保存本次修改。`,\n            timeout: 4000,\n            onDismiss: (reason) => events.value.push(reason),\n        })),\n    ];\n}\nfunction asyncNotice(fail = false) {\n    messages.value = [\n        ...messages.value,\n        {\n            text: '正在保存…',\n            promise: new Promise((resolve, reject) =>\n                setTimeout(() => (fail ? reject(new Error('保存失败')) : resolve('成功')), 900)\n            ),\n            success: () => ({ text: '保存成功', color: 'success', timeout: 3000 }),\n            error: () => ({ text: '保存失败，请重试', color: 'error', timeout: 3000 }),\n        },\n    ];\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USnackbarQueue\">\n        <div class=\"demo-row\">\n            <u-select v-model=\"strategy\" :items=\"['hold', 'overflow']\" label=\"队列策略\" />\n            <u-select v-model=\"totalVisible\" :items=\"[1, 2, 3]\" label=\"同时显示数量\" />\n            <u-switch v-model=\"collapsed\" label=\"折叠堆叠\" />\n        </div>\n        <div class=\"demo-row\">\n            <u-button @click=\"add\">加入3条消息</u-button>\n            <u-button @click=\"asyncNotice()\">异步成功</u-button>\n            <u-button @click=\"asyncNotice(true)\">异步失败</u-button>\n            <u-button @click=\"queue.clear()\">清空队列</u-button>\n        </div>\n        <div class=\"notice-demo-stage\">\n            <p>hold 等待上一条关闭；overflow 淘汰最早消息。数组模型只保存待显示项。</p>\n            <u-snackbar-queue\n                ref=\"queue\"\n                v-model=\"messages\"\n                :total-visible=\"totalVisible\"\n                :display-strategy=\"strategy\"\n                :collapsed=\"collapsed\"\n                contained\n                closable\n            />\n        </div>\n        <output>等待：{{ messages.length }}；关闭原因：{{ events.join(', ') || '无' }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.demo-row {\n    margin: 0;\n}\n.demo-row > .ui-control-frame {\n    flex: 1 1 160px;\n    min-width: 0;\n}\n.notice-demo-stage {\n    position: relative;\n    min-height: 270px;\n    padding: 20px;\n    border: 1px dashed var(--border);\n    border-radius: 8px;\n}\n.notice-demo-stage p {\n    margin: 0;\n    color: var(--muted);\n    line-height: 1.7;\n}\n.component-demo > output {\n    font-size: 14px;\n    color: var(--muted);\n    overflow-wrap: anywhere;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "autocomplete",
        "title": "自动完成",
        "name": "UAutocomplete",
        "kind": "component",
        "group": "表单组件",
        "description": "自动完成的独立用法与交互。",
        "examples": [
            {
                "id": "component-autocomplete",
                "title": "自动完成的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UAutocomplete } from '@lingyzh/ui';\nconst options = [\n    { title: '默认工作区', value: 'default' },\n    { title: '完整的很长选项文字应保持单行，并在控件宽度不足时截断显示', value: 'long' },\n    { title: '归档工作区', value: 'archived', props: { disabled: true } },\n];\nconst choice = ref('default');\nconst required = (value) => (Array.isArray(value) ? value.length > 0 : !!value) || '请填写此项。';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UAutocomplete\">\n        <u-autocomplete\n            v-model=\"choice\"\n            :items=\"options\"\n            label=\"搜索工作区\"\n            hint=\"输入筛选，方向键选择；选项保留对象模型能力。\"\n            clearable\n            :rules=\"[required]\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "combobox",
        "title": "可创建选择器",
        "name": "UCombobox",
        "kind": "component",
        "group": "表单组件",
        "description": "可创建选择器的独立用法与交互。",
        "examples": [
            {
                "id": "component-combobox",
                "title": "可创建选择器的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCombobox } from '@lingyzh/ui';\nconst tags = ref(['文档']);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCombobox\">\n        <u-combobox\n            v-model=\"tags\"\n            :items=\"['文档', '测试', '设计']\"\n            label=\"可创建标签\"\n            multiple\n            chips\n            clearable\n            hint=\"输入新标签并按 Enter 创建。\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "number-input",
        "title": "数值输入",
        "name": "UNumberInput",
        "kind": "component",
        "group": "表单组件",
        "description": "数值输入的独立用法与交互。",
        "examples": [
            {
                "id": "component-number-input",
                "title": "数值输入的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UNumberInput } from '@lingyzh/ui';\nconst number = ref(5);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UNumberInput\">\n        <u-number-input\n            v-model=\"number\"\n            label=\"执行并发数\"\n            :min=\"1\"\n            :max=\"10\"\n            :step=\"1\"\n            hint=\"按钮与方向键均遵守 1–10 边界。\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "file-input",
        "title": "文件输入",
        "name": "UFileInput",
        "kind": "component",
        "group": "表单组件",
        "description": "文件输入的独立用法与交互。",
        "examples": [
            {
                "id": "component-file-input",
                "title": "文件输入的基本用法",
                "description": "鼠标选择文件不显示键盘焦点框；Tab 进入时显示焦点提示。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UFileInput } from '@lingyzh/ui';\nconst files = ref(null);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFileInput\">\n        <u-file-input\n            v-model=\"files\"\n            label=\"选择附件\"\n            multiple\n            accept=\".md,.txt,.png\"\n            show-size\n            hint=\"本地选择，仅更新示例模型。\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "鼠标选择文件不显示键盘焦点框；Tab 进入时显示焦点提示。"
        ]
    },
    {
        "id": "file-upload",
        "title": "文件上传",
        "name": "UFileUpload",
        "kind": "component",
        "group": "表单组件",
        "description": "文件上传的独立用法与交互。",
        "examples": [
            {
                "id": "component-file-upload",
                "title": "文件上传的基本用法",
                "description": "上传区域仅在键盘焦点或拖放文件时高亮；鼠标点击选择文件不保持焦点高亮。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UFileUpload } from '@lingyzh/ui';\nconst upload = ref([]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFileUpload\">\n        <u-file-upload\n            v-model=\"upload\"\n            label=\"拖放附件\"\n            multiple\n            :max-size=\"10485760\"\n            hint=\"支持拖放、删除，限制单文件 10 MB。\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "上传区域仅在键盘焦点或拖放文件时高亮；鼠标点击选择文件不保持焦点高亮。"
        ]
    },
    {
        "id": "slider",
        "title": "滑块",
        "name": "USlider",
        "kind": "component",
        "group": "表单组件",
        "description": "滑块的独立用法与交互。",
        "examples": [
            {
                "id": "component-slider",
                "title": "滑块的基本用法",
                "description": "鼠标点击或拖动不显示焦点外框；Tab 进入后显示焦点提示，方向键调整数值。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USlider } from '@lingyzh/ui';\nconst progress = ref(35);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USlider\">\n        <u-slider v-model=\"progress\" label=\"进度\" thumb-label show-ticks />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "鼠标点击或拖动不显示焦点外框；Tab 进入后显示焦点提示，方向键调整数值。"
        ]
    },
    {
        "id": "range-slider",
        "title": "范围滑块",
        "name": "URangeSlider",
        "kind": "component",
        "group": "表单组件",
        "description": "范围滑块的独立用法与交互。",
        "examples": [
            {
                "id": "component-range-slider",
                "title": "范围滑块的基本用法",
                "description": "鼠标拖动不显示焦点外框；Tab 分别进入两个手柄时显示焦点提示，方向键调整范围。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URangeSlider } from '@lingyzh/ui';\nconst range = ref([20, 70]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"URangeSlider\">\n        <u-range-slider v-model=\"range\" label=\"可接受范围\" hint=\"两个手柄不能越过彼此。\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "鼠标拖动不显示焦点外框；Tab 分别进入两个手柄时显示焦点提示，方向键调整范围。"
        ]
    },
    {
        "id": "otp-input",
        "title": "验证码输入",
        "name": "UOtpInput",
        "kind": "component",
        "group": "表单组件",
        "description": "验证码输入的独立用法与交互。",
        "examples": [
            {
                "id": "component-otp-input",
                "title": "验证码输入的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UOtpInput } from '@lingyzh/ui';\nconst otp = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UOtpInput\">\n        <u-otp-input\n            v-model=\"otp\"\n            label=\"六位验证码\"\n            numeric\n            :length=\"6\"\n            hint=\"支持粘贴、方向键和退格。\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "color-input",
        "title": "颜色输入",
        "name": "UColorInput",
        "kind": "component",
        "group": "表单组件",
        "description": "颜色输入的独立用法与交互。",
        "examples": [
            {
                "id": "component-color-input",
                "title": "颜色输入的基本用法",
                "description": "颜色按钮和文本编辑共享模型；非文本操作仅在键盘焦点时提示，文本编辑保留活动状态。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UColorInput } from '@lingyzh/ui';\nconst color = ref('#bd6749');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UColorInput\">\n        <u-color-input\n            v-model=\"color\"\n            label=\"标记颜色\"\n            hint=\"颜色面板和十六进制输入共用一个模型。\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "颜色按钮和文本编辑共享模型；非文本操作仅在键盘焦点时提示，文本编辑保留活动状态。"
        ]
    },
    {
        "id": "color-picker",
        "title": "颜色编辑器",
        "name": "UColorPicker",
        "kind": "component",
        "group": "表单组件",
        "description": "颜色编辑器的独立用法与交互。",
        "examples": [
            {
                "id": "component-color-picker",
                "title": "颜色编辑器的基本用法",
                "description": "颜色通道滑块仅在键盘操作时显示焦点外框；十六进制文本输入保留编辑提示。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UColorPicker } from '@lingyzh/ui';\nconst color = ref('#bd6749');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UColorPicker\">\n        <u-color-picker\n            v-model=\"color\"\n            label=\"颜色编辑器\"\n            :swatches=\"['#bd6749', '#679775', '#627ca0', '#8b739e']\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "颜色通道滑块仅在键盘操作时显示焦点外框；十六进制文本输入保留编辑提示。"
        ]
    },
    {
        "id": "rating",
        "title": "评分",
        "name": "URating",
        "kind": "component",
        "group": "表单组件",
        "description": "评分的独立用法与交互。",
        "examples": [
            {
                "id": "component-rating",
                "title": "评分的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URating } from '@lingyzh/ui';\nconst rating = ref(3);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"URating\">\n        <u-rating v-model=\"rating\" label=\"完成质量\" clearable />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "selection-control-group",
        "title": "选择控件组",
        "name": "USelectionControlGroup",
        "kind": "component",
        "group": "表单组件",
        "description": "选择控件组的独立用法与交互。",
        "examples": [
            {
                "id": "component-selection-control-group",
                "title": "选择控件组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USelectionControl, USelectionControlGroup } from '@lingyzh/ui';\nconst checks = ref(['a']);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USelectionControlGroup\">\n        <u-selection-control-group v-model=\"checks\" multiple label=\"自定义选择组\" direction=\"row\">\n            <u-selection-control value=\"a\" label=\"测试\" />\n            <u-selection-control value=\"b\" label=\"文档\" />\n        </u-selection-control-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "selection-control",
        "title": "选择控件",
        "name": "USelectionControl",
        "kind": "component",
        "group": "表单组件",
        "description": "选择控件的独立用法与交互。",
        "examples": [
            {
                "id": "component-selection-control",
                "title": "选择控件的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USelectionControl } from '@lingyzh/ui';\nconst checked = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USelectionControl\">\n        <u-selection-control v-model=\"checked\" type=\"checkbox\" label=\"接收通知\" />\n        <output>当前值：{{ checked }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "radio-group",
        "title": "单选组",
        "name": "URadioGroup",
        "kind": "component",
        "group": "表单组件",
        "description": "单选组的独立用法与交互。",
        "examples": [
            {
                "id": "component-radio-group",
                "title": "单选组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URadioGroup, USelectionControl } from '@lingyzh/ui';\nconst radio = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"URadioGroup\">\n        <u-radio-group v-model=\"radio\" label=\"单选组\" hint=\"值由组统一管理。\">\n            <u-selection-control value=\"a\" label=\"默认\" type=\"radio\" />\n            <u-selection-control value=\"b\" label=\"自定义\" type=\"radio\" />\n        </u-radio-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "checkbox-group",
        "title": "多选组",
        "name": "UCheckboxGroup",
        "kind": "component",
        "group": "表单组件",
        "description": "多选组的独立用法与交互。",
        "examples": [
            {
                "id": "component-checkbox-group",
                "title": "多选组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCheckboxGroup, USelectionControl } from '@lingyzh/ui';\nconst checks = ref(['a']);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCheckboxGroup\">\n        <u-checkbox-group v-model=\"checks\" label=\"多选组\">\n            <u-selection-control value=\"a\" label=\"测试\" />\n            <u-selection-control value=\"b\" label=\"文档\" />\n        </u-checkbox-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "item-group",
        "title": "选择项组",
        "name": "UItemGroup",
        "kind": "component",
        "group": "表单组件",
        "description": "选择项组的独立用法与交互。",
        "examples": [
            {
                "id": "component-item-group",
                "title": "选择项组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UItem, UItemGroup } from '@lingyzh/ui';\nconst selected = ref('a');\nconst disabled = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UItemGroup\">\n        <u-item-group v-model=\"selected\" mandatory>\n            <u-item value=\"a\">概览</u-item>\n            <u-item value=\"b\">详情</u-item>\n            <u-item value=\"c\" disabled>禁用</u-item>\n        </u-item-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "item",
        "title": "选择项",
        "name": "UItem",
        "kind": "component",
        "group": "表单组件",
        "description": "选择项的独立用法与交互。",
        "examples": [
            {
                "id": "component-item",
                "title": "选择项的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UItem, UItemGroup } from '@lingyzh/ui';\nconst selected = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UItem\">\n        <u-item-group v-model=\"selected\" mandatory>\n            <u-item value=\"a\">概览</u-item>\n            <u-item value=\"b\">详情</u-item>\n        </u-item-group>\n        <output>当前值：{{ selected }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "chip",
        "title": "标签",
        "name": "UChip",
        "kind": "component",
        "group": "表单组件",
        "description": "标签的独立用法与交互。",
        "examples": [
            {
                "id": "component-chip",
                "title": "标签的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UChip } from '@lingyzh/ui';\nconst visible = ref(true);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UChip\">\n        <u-chip closable tone=\"accent\" @close=\"visible = false\" v-if=\"visible\">组件文档</u-chip>\n        <u-button v-else size=\"sm\" @click=\"visible = true\">恢复标签</u-button>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "chip-group",
        "title": "标签组",
        "name": "UChipGroup",
        "kind": "component",
        "group": "表单组件",
        "description": "标签组的独立用法与交互。",
        "examples": [
            {
                "id": "component-chip-group",
                "title": "标签组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UChip, UChipGroup } from '@lingyzh/ui';\nconst selected = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UChipGroup\">\n        <u-chip-group v-model=\"selected\" mandatory>\n            <u-chip value=\"a\">概览</u-chip>\n            <u-chip value=\"b\" closable>详情</u-chip>\n        </u-chip-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "btn-group",
        "title": "按钮组",
        "name": "UBtnGroup",
        "kind": "component",
        "group": "表单组件",
        "description": "按钮组的独立用法与交互。",
        "examples": [
            {
                "id": "component-btn-group",
                "title": "按钮组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UBtnGroup, UButton } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBtnGroup\">\n        <u-btn-group>\n            <u-button size=\"sm\">复制</u-button>\n            <u-button size=\"sm\">导出</u-button>\n        </u-btn-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "btn-toggle",
        "title": "按钮切换组",
        "name": "UBtnToggle",
        "kind": "component",
        "group": "表单组件",
        "description": "按钮切换组的独立用法与交互。",
        "examples": [
            {
                "id": "component-btn-toggle",
                "title": "按钮切换组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBtnToggle, UButton, USwitch } from '@lingyzh/ui';\nconst selected = ref('a');\nconst implicit = ref(0);\nconst multiple = ref(false);\nconst disabled = ref(false);\nconst mandatory = ref(true);\nconst readonly = ref(false);\nfunction changeMultiple(value) {\n    selected.value = value ? [selected.value].filter(Boolean) : selected.value[0];\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBtnToggle\">\n        <div class=\"demo-row\">\n            <u-switch v-model=\"multiple\" label=\"多选\" @update:model-value=\"changeMultiple\" />\n            <u-switch v-model=\"mandatory\" label=\"必须选择\" />\n            <u-switch v-model=\"disabled\" label=\"禁用\" />\n            <u-switch v-model=\"readonly\" label=\"只读\" />\n        </div>\n        <u-btn-toggle\n            v-model=\"selected\"\n            :multiple=\"multiple\"\n            :mandatory=\"mandatory\"\n            :disabled=\"disabled\"\n            :readonly=\"readonly\"\n            :max=\"2\"\n            label=\"视图选择\"\n        >\n            <u-button value=\"a\" color=\"primary\">概览</u-button>\n            <u-button value=\"b\" color=\"primary\">详情</u-button>\n            <u-button value=\"c\" color=\"primary\">设置</u-button>\n        </u-btn-toggle>\n        <output>当前：{{ JSON.stringify(selected) }}</output>\n        <p>省略 value 时使用组内索引：</p>\n        <u-btn-toggle v-model=\"implicit\" aria-label=\"索引选择\">\n            <u-button>索引一</u-button>\n            <u-button>索引二</u-button>\n            <u-button>索引三</u-button>\n        </u-btn-toggle>\n        <output>索引：{{ implicit }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "label",
        "title": "标签文字",
        "name": "ULabel",
        "kind": "component",
        "group": "表单组件",
        "description": "标签文字的独立用法与交互。",
        "examples": [
            {
                "id": "component-label",
                "title": "标签文字的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { ULabel } from '@lingyzh/ui';\nconst text = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULabel\">\n        <u-label for=\"custom-label-demo\" required>自定义输入名称</u-label>\n        <input id=\"custom-label-demo\" class=\"completion-native-input\" v-model=\"text\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-native-input {\n    width: 100%;\n    min-width: 0;\n    min-height: 36px;\n    padding: 7px 11px;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    background: var(--surface);\n    color: var(--text);\n    font: inherit;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "messages",
        "title": "控件消息",
        "name": "UMessages",
        "kind": "component",
        "group": "表单组件",
        "description": "控件消息的独立用法与交互。",
        "examples": [
            {
                "id": "component-messages",
                "title": "控件消息的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UMessages } from '@lingyzh/ui';\nconst error = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UMessages\">\n        <u-button size=\"sm\" @click=\"error = !error\">切换错误消息</u-button>\n        <u-messages :error=\"error\" :messages=\"error ? ['请检查输入内容。'] : ['配置已保存。']\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "counter",
        "title": "计数",
        "name": "UCounter",
        "kind": "component",
        "group": "表单组件",
        "description": "计数的独立用法与交互。",
        "examples": [
            {
                "id": "component-counter",
                "title": "计数的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCounter, UTextField } from '@lingyzh/ui';\nconst text = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCounter\">\n        <u-text-field v-model=\"text\" label=\"名称\" />\n        <u-counter :value=\"text.length\" :max=\"20\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "input-base",
        "title": "自定义输入基座",
        "name": "UInput",
        "kind": "component",
        "group": "表单组件",
        "description": "自定义输入基座的独立用法与交互。",
        "examples": [
            {
                "id": "component-input",
                "title": "自定义输入基座的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UInput } from '@lingyzh/ui';\nconst custom = ref('');\nconst disabled = ref(false);\nconst readonly = ref(false);\nconst required = (value) => (Array.isArray(value) ? value.length > 0 : !!value) || '请填写此项。';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UInput\">\n        <u-input\n            v-model=\"custom\"\n            label=\"自定义输入的验证基座\"\n            :rules=\"[required]\"\n            hint=\"UInput 只提供状态、验证和框架，插槽放入自定义控件。\"\n        >\n            <template #default=\"{ controlAttrs, disabled: isDisabled, readonly: isReadonly }\">\n                <input\n                    v-model=\"custom\"\n                    v-bind=\"controlAttrs\"\n                    class=\"completion-native-input\"\n                    :disabled=\"isDisabled\"\n                    :readonly=\"isReadonly\"\n                />\n            </template>\n        </u-input>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-native-input {\n    width: 100%;\n    min-width: 0;\n    min-height: 36px;\n    padding: 7px 11px;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    background: var(--surface);\n    color: var(--text);\n    font: inherit;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "validation",
        "title": "验证基座",
        "name": "UValidation",
        "kind": "component",
        "group": "表单组件",
        "description": "验证基座的独立用法与交互。",
        "examples": [
            {
                "id": "component-validation",
                "title": "验证基座的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UMessages, UTextField, UValidation } from '@lingyzh/ui';\nconst custom = ref('');\nconst required = (value) => !!value || '请填写此项。';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UValidation\">\n        <u-validation\n            ref=\"validation\"\n            v-model=\"custom\"\n            :rules=\"[required]\"\n            v-slot=\"{ errors, validate }\"\n        >\n            <u-text-field v-model=\"custom\" label=\"自定义内容\" />\n            <u-button @click=\"validate\">验证</u-button>\n            <u-messages :messages=\"errors\" error />\n        </u-validation>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "defaults-provider",
        "title": "默认配置容器",
        "name": "UDefaultsProvider",
        "kind": "component",
        "group": "表单组件",
        "description": "默认配置容器的独立用法与交互。",
        "examples": [
            {
                "id": "component-defaults-provider",
                "title": "默认配置容器的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDefaultsProvider, UTextField } from '@lingyzh/ui';\nconst text = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDefaultsProvider\">\n        <u-defaults-provider :defaults=\"{ UTextField: { density: 'compact', variant: 'filled' } }\">\n            <u-text-field\n                v-model=\"text\"\n                label=\"继承紧凑、填充样式\"\n                hint=\"默认配置只作用于这个容器。\"\n            />\n        </u-defaults-provider>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "locale-provider",
        "title": "局部语言容器",
        "name": "ULocaleProvider",
        "kind": "component",
        "group": "表单组件",
        "description": "局部语言容器的独立用法与交互。",
        "examples": [
            {
                "id": "component-locale-provider",
                "title": "局部语言容器的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { ULocaleProvider, UPagination } from '@lingyzh/ui';\nconst page = ref(2);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULocaleProvider\">\n        <u-locale-provider locale=\"en\">\n            <u-pagination v-model=\"page\" :length=\"5\" label=\"English pagination\" />\n        </u-locale-provider>\n        <output>当前页：{{ page }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "app",
        "title": "应用容器",
        "name": "UApp",
        "kind": "component",
        "group": "布局组件",
        "description": "应用容器的独立用法与交互。",
        "examples": [
            {
                "id": "component-app",
                "title": "应用容器的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UApp\">\n        <div class=\"completion-layout\">\n            <u-app>\n                <u-app-bar :height=\"48\">\n                    <u-app-bar-title>应用顶栏</u-app-bar-title>\n                </u-app-bar>\n                <u-main>\n                    <p class=\"pa-4\">主要内容自动避开已注册的栏。</p>\n                </u-main>\n            </u-app>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "layout",
        "title": "布局上下文",
        "name": "ULayout",
        "kind": "component",
        "group": "布局组件",
        "description": "布局上下文的独立用法与交互。",
        "examples": [
            {
                "id": "component-layout",
                "title": "布局上下文的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UAppBar, UAppBarTitle, ULayout, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULayout\">\n        <div class=\"completion-layout\">\n            <u-layout>\n                <u-app-bar :height=\"48\">\n                    <u-app-bar-title>应用顶栏</u-app-bar-title>\n                </u-app-bar>\n                <u-main>\n                    <p class=\"pa-4\">主要内容自动避开已注册的栏。</p>\n                </u-main>\n            </u-layout>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "main",
        "title": "主要内容",
        "name": "UMain",
        "kind": "component",
        "group": "布局组件",
        "description": "主要内容的独立用法与交互。",
        "examples": [
            {
                "id": "component-main",
                "title": "主要内容的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UMain\">\n        <div class=\"completion-layout\">\n            <u-app>\n                <u-app-bar :height=\"48\">\n                    <u-app-bar-title>应用顶栏</u-app-bar-title>\n                </u-app-bar>\n                <u-main>\n                    <p class=\"pa-4\">主要内容自动避开已注册的栏。</p>\n                </u-main>\n            </u-app>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "app-bar",
        "title": "应用顶栏",
        "name": "UAppBar",
        "kind": "component",
        "group": "布局组件",
        "description": "应用顶栏的独立用法与交互。",
        "examples": [
            {
                "id": "component-app-bar",
                "title": "应用顶栏的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UAppBar\">\n        <div class=\"completion-layout\">\n            <u-app>\n                <u-app-bar :height=\"48\">\n                    <u-app-bar-title>应用顶栏</u-app-bar-title>\n                </u-app-bar>\n                <u-main>\n                    <p class=\"pa-4\">主要内容自动避开已注册的栏。</p>\n                </u-main>\n            </u-app>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "app-bar-title",
        "title": "应用顶栏标题",
        "name": "UAppBarTitle",
        "kind": "component",
        "group": "布局组件",
        "description": "应用顶栏标题的独立用法与交互。",
        "examples": [
            {
                "id": "component-app-bar-title",
                "title": "应用顶栏标题的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UAppBarTitle\">\n        <div class=\"completion-layout\">\n            <u-app>\n                <u-app-bar :height=\"48\">\n                    <u-app-bar-title>应用顶栏</u-app-bar-title>\n                </u-app-bar>\n                <u-main>\n                    <p class=\"pa-4\">主要内容自动避开已注册的栏。</p>\n                </u-main>\n            </u-app>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "toolbar",
        "title": "工具栏",
        "name": "UToolbar",
        "kind": "component",
        "group": "布局组件",
        "description": "工具栏的独立用法与交互。",
        "examples": [
            {
                "id": "component-toolbar",
                "title": "工具栏的基本用法",
                "description": "标题和操作区内置：title属性或title插槽配置标题，actions插槽直接放按钮（也支持append），无需额外标题/操作组件。extension显示扩展内容；四种密度采用64/56/48/128px。保留本库字体、间距、圆角和按钮尺寸，不注册应用布局占位。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UBtnToggle, USwitch, UTabs, UToolbar } from '@lingyzh/ui';\nconst action = ref(0);\nconst density = ref('default');\nconst extended = ref(true);\nconst collapse = ref(false);\nconst tab = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UToolbar\">\n        <u-btn-toggle v-model=\"density\" mandatory aria-label=\"工具栏密度\">\n            <u-button\n                v-for=\"value in ['default', 'comfortable', 'compact', 'prominent']\"\n                :key=\"value\"\n                :value=\"value\"\n                size=\"sm\"\n            >\n                {{ value }}\n            </u-button>\n        </u-btn-toggle>\n        <div class=\"d-flex flex-wrap ga-4\">\n            <u-switch v-model=\"extended\" label=\"显示扩展区\" />\n            <u-switch v-model=\"collapse\" label=\"折叠工具栏\" />\n        </div>\n        <u-toolbar\n            data-toolbar=\"interactive\"\n            :density=\"density\"\n            :extended=\"extended\"\n            :collapse=\"collapse\"\n            color=\"primary\"\n            title=\"工作区：一个会随容器宽度自动截断的长标题\"\n        >\n            <template #prepend>\n                <u-button icon=\"mdi-view-grid-outline\" aria-label=\"工作区菜单\" @click=\"action++\" />\n            </template>\n            <template #actions>\n                <u-button @click=\"action++\">刷新</u-button>\n                <u-button icon=\"mdi-cog-outline\" aria-label=\"设置\" @click=\"action++\" />\n            </template>\n            <template #extension>\n                <u-tabs\n                    v-model=\"tab\"\n                    :items=\"[\n                        { value: 'overview', text: '概览' },\n                        { value: 'activity', text: '活动' },\n                    ]\"\n                />\n            </template>\n        </u-toolbar>\n        <output>操作 {{ action }} 次；当前 {{ tab }}</output>\n        <u-toolbar\n            data-toolbar=\"custom-height\"\n            height=\"80\"\n            extension-height=\"32\"\n            rounded\n            border\n            title=\"显式高度 80 / 32\"\n        >\n            <template #title>\n                <span>标题插槽优先于 title 属性</span>\n            </template>\n            <template #actions>\n                <u-button variant=\"outlined\" @click=\"action++\">独立样式</u-button>\n            </template>\n            <template #extension>\n                <span class=\"px-4 text-body-2\">有 extension 插槽时默认显示扩展区。</span>\n            </template>\n        </u-toolbar>\n        <u-toolbar data-toolbar=\"floating\" floating rounded :elevation=\"3\">\n            <u-button @click=\"action++\">浮动工具栏</u-button>\n            <u-button icon=\"mdi-plus\" aria-label=\"新增\" @click=\"action++\" />\n        </u-toolbar>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.component-demo > .ui-toolbar.is-floating {\n    justify-self: start;\n}\n.component-demo :deep(.u-item-group.u-btn-group) {\n    flex-wrap: wrap;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "标题和操作区内置：title属性或title插槽配置标题，actions插槽直接放按钮（也支持append），无需额外标题/操作组件。extension显示扩展内容；四种密度采用64/56/48/128px。保留本库字体、间距、圆角和按钮尺寸，不注册应用布局占位。"
        ]
    },
    {
        "id": "toolbar-title",
        "title": "工具栏标题",
        "name": "UToolbarTitle",
        "kind": "component",
        "group": "布局组件",
        "description": "工具栏标题的独立用法与交互。",
        "examples": [
            {
                "id": "component-toolbar-title",
                "title": "工具栏标题的基本用法",
                "description": "此组件保留用于兼容自定义组合；常用标题直接使用UToolbar的title属性或title插槽。text属性、text插槽与默认插槽均支持，长文本省略，不挤掉操作。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UToolbar, UToolbarItems, UToolbarTitle } from '@lingyzh/ui';\nconst action = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UToolbarTitle\">\n        <u-toolbar border>\n            <u-toolbar-title text=\"很长的工作区名称，容器收窄时标题截断，操作始终可见\" />\n            <u-toolbar-items>\n                <u-button size=\"sm\" variant=\"text\" @click=\"action++\">刷新</u-button>\n            </u-toolbar-items>\n        </u-toolbar>\n        <u-toolbar density=\"prominent\" color=\"primary\">\n            <u-toolbar-title tag=\"h3\" text=\"此内容被 text 插槽替代\">\n                <template #text>自定义标题内容</template>\n            </u-toolbar-title>\n        </u-toolbar>\n        <output>已刷新 {{ action }} 次</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "此组件保留用于兼容自定义组合；常用标题直接使用UToolbar的title属性或title插槽。text属性、text插槽与默认插槽均支持，长文本省略，不挤掉操作。"
        ]
    },
    {
        "id": "toolbar-items",
        "title": "工具栏操作",
        "name": "UToolbarItems",
        "kind": "component",
        "group": "布局组件",
        "description": "工具栏操作的独立用法与交互。",
        "examples": [
            {
                "id": "component-toolbar-items",
                "title": "工具栏操作的基本用法",
                "description": "此组件保留用于兼容自定义组合；常用操作直接放入UToolbar的actions插槽。color/variant统一下发给按钮，显式属性优先；按钮使用本库圆角、尺寸和间距。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UBtnToggle, UToolbar, UToolbarItems } from '@lingyzh/ui';\nconst action = ref(0);\nconst variant = ref('text');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UToolbarItems\">\n        <u-btn-toggle v-model=\"variant\" mandatory aria-label=\"操作区样式\">\n            <u-button\n                v-for=\"value in ['text', 'tonal', 'outlined']\"\n                :key=\"value\"\n                :value=\"value\"\n                size=\"sm\"\n            >\n                {{ value }}\n            </u-button>\n        </u-btn-toggle>\n        <u-toolbar title=\"文件操作\" border>\n            <u-toolbar-items :variant=\"variant\" color=\"primary\">\n                <u-button @click=\"action++\">保存</u-button>\n                <u-button @click=\"action++\">导出</u-button>\n                <u-button color=\"danger\" variant=\"text\" @click=\"action++\">删除</u-button>\n            </u-toolbar-items>\n        </u-toolbar>\n        <u-toolbar color=\"primary\" title=\"继承工具栏前景色\">\n            <template #append>\n                <u-toolbar-items>\n                    <u-button @click=\"action++\">刷新</u-button>\n                </u-toolbar-items>\n            </template>\n        </u-toolbar>\n        <output>已刷新 {{ action }} 次</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "此组件保留用于兼容自定义组合；常用操作直接放入UToolbar的actions插槽。color/variant统一下发给按钮，显式属性优先；按钮使用本库圆角、尺寸和间距。"
        ]
    },
    {
        "id": "footer",
        "title": "页脚",
        "name": "UFooter",
        "kind": "component",
        "group": "布局组件",
        "description": "页脚的独立用法与交互。",
        "examples": [
            {
                "id": "component-footer",
                "title": "页脚的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UFooter, ULayout, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFooter\">\n        <div class=\"completion-layout\">\n            <u-layout>\n                <u-main>\n                    <p class=\"pa-4\">页脚占位由 Main 自动处理。</p>\n                </u-main>\n                <u-footer fixed :height=\"40\">固定页脚</u-footer>\n            </u-layout>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "system-bar",
        "title": "系统状态栏",
        "name": "USystemBar",
        "kind": "component",
        "group": "布局组件",
        "description": "系统状态栏的独立用法与交互。",
        "examples": [
            {
                "id": "component-system-bar",
                "title": "系统状态栏的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ULayout, UMain, USystemBar } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USystemBar\">\n        <div class=\"completion-layout\">\n            <u-layout>\n                <u-system-bar :height=\"28\">\n                    本地工作区\n                    <span class=\"ms-auto\">在线</span>\n                </u-system-bar>\n                <u-main>\n                    <p class=\"pa-4\">主要内容自动避开已注册的栏。</p>\n                </u-main>\n            </u-layout>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "navigation-drawer",
        "title": "导航抽屉",
        "name": "UNavigationDrawer",
        "kind": "component",
        "group": "布局组件",
        "description": "导航抽屉的独立用法与交互。",
        "examples": [
            {
                "id": "component-navigation-drawer",
                "title": "导航抽屉的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, ULayout, UList, UListItem, UMain, UNavigationDrawer, USwitch } from '@lingyzh/ui';\nconst drawer = ref(true);\nconst temporary = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UNavigationDrawer\">\n        <div class=\"demo-row\">\n            <u-button size=\"sm\" @click=\"drawer = !drawer\">切换抽屉</u-button>\n            <u-switch v-model=\"temporary\" label=\"临时抽屉\" />\n        </div>\n        <div class=\"completion-layout\">\n            <u-layout>\n                <u-navigation-drawer\n                    v-model=\"drawer\"\n                    :temporary=\"temporary\"\n                    :width=\"160\"\n                    :mobile-breakpoint=\"600\"\n                >\n                    <u-list>\n                        <u-list-item title=\"概览\" />\n                        <u-list-item title=\"配置\" />\n                    </u-list>\n                </u-navigation-drawer>\n                <u-main>\n                    <p class=\"pa-4\">面板滑动与遮罩淡入淡出同步，关闭后内容填满剩余空间。</p>\n                </u-main>\n            </u-layout>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "list",
        "title": "列表",
        "name": "UList",
        "kind": "component",
        "group": "导航组件",
        "description": "列表的独立用法与交互。",
        "examples": [
            {
                "id": "component-list",
                "title": "列表的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UList, UListItem } from '@lingyzh/ui';\nconst selected = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UList\">\n        <u-list v-model=\"selected\">\n            <u-list-item value=\"overview\" title=\"概览\" subtitle=\"项目运行状况\" />\n            <u-list-item value=\"settings\" title=\"设置\" />\n            <u-list-item value=\"disabled\" title=\"归档\" disabled />\n        </u-list>\n        <output>已选：{{ selected }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "list-item",
        "title": "列表项",
        "name": "UListItem",
        "kind": "component",
        "group": "导航组件",
        "description": "列表项的独立用法与交互。",
        "examples": [
            {
                "id": "component-list-item",
                "title": "列表项的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UCheckbox, UList, UListItem, USwitch } from '@lingyzh/ui';\nconst selected = ref('overview');\nconst ripple = ref(true);\nconst appendCount = ref(0);\nconst notifications = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListItem\">\n        <u-switch v-model=\"ripple\" label=\"启用列表项涟漪\" />\n        <u-list v-model=\"selected\">\n            <u-list-item\n                :ripple=\"ripple\"\n                value=\"overview\"\n                title=\"概览\"\n                subtitle=\"快速点击后反馈仍完整淡出\"\n            />\n            <u-list-item :ripple=\"ripple\" value=\"settings\" title=\"设置\">\n                <template #append>\n                    <u-button size=\"sm\" variant=\"text\" @click=\"appendCount++\">独立操作</u-button>\n                </template>\n            </u-list-item>\n            <u-list-item :ripple=\"ripple\" value=\"quiet-action\" title=\"带无涟漪按钮的列表项\">\n                <template #append>\n                    <u-button size=\"sm\" variant=\"text\" :ripple=\"false\" @click=\"appendCount++\">\n                        无涟漪操作\n                    </u-button>\n                </template>\n            </u-list-item>\n            <u-list-item :ripple=\"ripple\" value=\"notifications\" title=\"列表内选择控件\">\n                <template #append>\n                    <u-checkbox v-model=\"notifications\" :ripple=\"ripple\">通知</u-checkbox>\n                </template>\n            </u-list-item>\n            <u-list-item :ripple=\"false\" value=\"quiet\" title=\"此项关闭涟漪\" />\n            <u-list-item\n                :ripple=\"ripple && { center: true, color: 'var(--accent-text)' }\"\n                value=\"center\"\n                title=\"居中主题色反馈\"\n            />\n            <u-list-item value=\"disabled\" title=\"归档\" disabled />\n        </u-list>\n        <output>已选：{{ selected }} · 独立操作：{{ appendCount }} 次</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "list-group",
        "title": "列表分组",
        "name": "UListGroup",
        "kind": "component",
        "group": "导航组件",
        "description": "列表分组的独立用法与交互。",
        "examples": [
            {
                "id": "component-list-group",
                "title": "列表分组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UIcon, UList, UListGroup, UListItem, UTextField } from '@lingyzh/ui';\nconst opened = ref([]);\nconst name = ref('工作区');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListGroup\">\n        <div class=\"demo-row\">\n            <u-button size=\"sm\" @click=\"opened = ['settings', 'advanced']\">展开全部</u-button>\n            <u-button size=\"sm\" @click=\"opened = []\">收起全部</u-button>\n        </div>\n        <u-list v-model:opened=\"opened\">\n            <u-list-group value=\"settings\" title=\"配置\">\n                <u-list-item value=\"models\" title=\"模型配置\" />\n                <u-list-item value=\"permissions\" title=\"权限配置\" />\n                <u-text-field v-model=\"name\" label=\"分组内名称\" hint=\"收起再展开，输入内容保持。\" />\n                <u-list-group value=\"advanced\" title=\"高级配置\">\n                    <u-list-item title=\"日志与诊断\" />\n                </u-list-group>\n            </u-list-group>\n            <u-list-group value=\"custom\">\n                <template #activator=\"{ props }\">\n                    <u-button v-bind=\"props\" variant=\"text\">\n                        自定义分组触发器\n                        <u-icon\n                            name=\"mdi-chevron-down\"\n                            class=\"ui-disclosure-icon is-down\"\n                            :class=\"{ 'is-open': props['aria-expanded'] }\"\n                        />\n                    </u-button>\n                </template>\n                <u-list-item title=\"自定义分组内容\" />\n            </u-list-group>\n            <u-list-group value=\"disabled\" title=\"禁用分组\" disabled>\n                <u-list-item title=\"不可展开\" />\n            </u-list-group>\n        </u-list>\n        <output>展开项：{{ opened.join('、') || '无' }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "list-subheader",
        "title": "列表小标题",
        "name": "UListSubheader",
        "kind": "component",
        "group": "导航组件",
        "description": "列表小标题的独立用法与交互。",
        "examples": [
            {
                "id": "component-list-subheader",
                "title": "列表小标题的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UList, UListItem, UListSubheader } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListSubheader\">\n        <u-list>\n            <u-list-subheader>当前工作区</u-list-subheader>\n            <u-list-item title=\"设计工作区\" />\n            <u-list-subheader>归档</u-list-subheader>\n            <u-list-item title=\"历史工作区\" disabled />\n        </u-list>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "list-item-title",
        "title": "列表项标题",
        "name": "UListItemTitle",
        "kind": "component",
        "group": "导航组件",
        "description": "列表项标题的独立用法与交互。",
        "examples": [
            {
                "id": "component-list-item-title",
                "title": "列表项标题的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UList, UListItem, UListItemSubtitle, UListItemTitle } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListItemTitle\">\n        <u-list>\n            <u-list-item>\n                <u-list-item-title>设计工作区</u-list-item-title>\n                <u-list-item-subtitle>自定义列表项标题与说明</u-list-item-subtitle>\n            </u-list-item>\n        </u-list>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "list-item-subtitle",
        "title": "列表项说明",
        "name": "UListItemSubtitle",
        "kind": "component",
        "group": "导航组件",
        "description": "列表项说明的独立用法与交互。",
        "examples": [
            {
                "id": "component-list-item-subtitle",
                "title": "列表项说明的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UList, UListItem, UListItemSubtitle, UListItemTitle } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListItemSubtitle\">\n        <u-list>\n            <u-list-item>\n                <u-list-item-title>设计工作区</u-list-item-title>\n                <u-list-item-subtitle>自定义列表项标题与说明</u-list-item-subtitle>\n            </u-list-item>\n        </u-list>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "treeview",
        "title": "树形视图",
        "name": "UTreeview",
        "kind": "component",
        "group": "导航组件",
        "description": "树形视图的独立用法与交互。",
        "examples": [
            {
                "id": "component-treeview",
                "title": "树形视图的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTreeview } from '@lingyzh/ui';\nconst tree = ref([]);\nconst opened = ref(['components']);\nconst items = Array.from({ length: 5000 }, (_, index) => ({\n    id: index,\n    title: `项目 ${index + 1}`,\n}));\nconst nodes = [\n    {\n        title: '组件库',\n        value: 'components',\n        children: [\n            {\n                title: '表单控件',\n                value: 'forms',\n                children: [\n                    { title: '输入与选择', value: 'inputs' },\n                    { title: '验证与提交', value: 'validation' },\n                ],\n            },\n            { title: '布局组件', value: 'layout' },\n            {\n                title: '归档组件',\n                value: 'archive',\n                disabled: true,\n                children: [{ title: '历史组件', value: 'history' }],\n            },\n        ],\n    },\n    { title: '文档与示例', value: 'docs' },\n];\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTreeview\">\n        <u-treeview v-model=\"tree\" v-model:opened=\"opened\" :items=\"nodes\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "virtual-scroll",
        "title": "虚拟滚动",
        "name": "UVirtualScroll",
        "kind": "component",
        "group": "导航组件",
        "description": "虚拟滚动的独立用法与交互。",
        "examples": [
            {
                "id": "component-virtual-scroll",
                "title": "虚拟滚动的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UVirtualScroll } from '@lingyzh/ui';\nconst items = Array.from({ length: 5000 }, (_, index) => ({\n    id: index,\n    title: `项目 ${index + 1}`,\n}));\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UVirtualScroll\">\n        <u-virtual-scroll :items=\"items\" :item-height=\"36\" :height=\"180\" item-key=\"id\">\n            <template #default=\"{ item, index }\">\n                <div class=\"px-3 py-2\">{{ index + 1 }} · {{ item.title }}</div>\n            </template>\n        </u-virtual-scroll>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "avatar",
        "title": "头像",
        "name": "UAvatar",
        "kind": "component",
        "group": "反馈组件",
        "description": "头像的独立用法与交互。",
        "examples": [
            {
                "id": "component-avatar",
                "title": "头像的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UAvatar } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UAvatar\">\n        <div class=\"demo-row\">\n            <u-avatar text=\"AY\" />\n            <u-avatar icon=\"mdi-account-outline\" :size=\"32\" />\n            <u-avatar text=\"UI\" :rounded=\"false\" :size=\"32\" />\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "badge",
        "title": "附着徽标",
        "name": "UBadge",
        "kind": "component",
        "group": "反馈组件",
        "description": "附着徽标的独立用法与交互。",
        "examples": [
            {
                "id": "component-badge",
                "title": "附着徽标的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UAvatar, UBadge, UButton } from '@lingyzh/ui';\nconst count = ref(90);\nconst visible = ref(true);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBadge\">\n        <div class=\"demo-row\">\n            <u-badge :model-value=\"visible\" :content=\"count\" :max=\"99\">\n                <u-button @click=\"count += 10\">消息</u-button>\n            </u-badge>\n            <u-badge :model-value=\"visible\" dot>\n                <u-avatar text=\"UI\" />\n            </u-badge>\n            <u-button size=\"sm\" @click=\"visible = !visible\">切换徽标</u-button>\n        </div>\n        <output>消息数：{{ count }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "divider",
        "title": "分隔线",
        "name": "UDivider",
        "kind": "component",
        "group": "反馈组件",
        "description": "分隔线的独立用法与交互。",
        "examples": [
            {
                "id": "component-divider",
                "title": "分隔线的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UDivider } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDivider\">\n        <p>第一段内容</p>\n        <u-divider />\n        <p>分隔线后的内容</p>\n        <div class=\"demo-row\">\n            <span>左侧</span>\n            <u-divider vertical />\n            <span>右侧</span>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "sheet",
        "title": "表面容器",
        "name": "USheet",
        "kind": "component",
        "group": "反馈组件",
        "description": "表面容器的独立用法与交互。",
        "examples": [
            {
                "id": "component-sheet",
                "title": "表面容器的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { USheet } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USheet\">\n        <u-sheet border class=\"pa-4\">带边框的表面容器</u-sheet>\n        <u-sheet color=\"var(--accent-soft)\" class=\"pa-4\">使用主题色的表面容器</u-sheet>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "empty-state",
        "title": "空状态",
        "name": "UEmptyState",
        "kind": "component",
        "group": "反馈组件",
        "description": "空状态的独立用法与交互。",
        "examples": [
            {
                "id": "component-empty-state",
                "title": "空状态的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UButton, UEmptyState } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UEmptyState\">\n        <u-empty-state\n            title=\"没有工作区\"\n            text=\"创建工作区后，相关内容会出现在这里。\"\n            icon=\"mdi-folder-outline\"\n        >\n            <template #actions>\n                <u-button size=\"sm\">创建工作区</u-button>\n            </template>\n        </u-empty-state>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "skeleton-loader",
        "title": "骨架占位",
        "name": "USkeletonLoader",
        "kind": "component",
        "group": "反馈组件",
        "description": "骨架占位的独立用法与交互。",
        "examples": [
            {
                "id": "component-skeleton-loader",
                "title": "骨架占位的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { USkeletonLoader } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USkeletonLoader\">\n        <u-skeleton-loader type=\"avatar\" />\n        <u-skeleton-loader :lines=\"3\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "banner",
        "title": "横幅提示",
        "name": "UBanner",
        "kind": "component",
        "group": "反馈组件",
        "description": "横幅提示的独立用法与交互。",
        "examples": [
            {
                "id": "component-banner",
                "title": "横幅提示的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBanner, UButton } from '@lingyzh/ui';\nconst banner = ref(true);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBanner\">\n        <u-banner v-model=\"banner\" text=\"配置已同步。\" icon=\"mdi-information-outline\">\n            <template #actions>\n                <u-button size=\"sm\" variant=\"text\" @click=\"banner = false\">知道了</u-button>\n            </template>\n        </u-banner>\n        <u-button v-if=\"!banner\" size=\"sm\" @click=\"banner = true\">重新显示提示</u-button>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "transition",
        "title": "过渡",
        "name": "UTransition",
        "kind": "component",
        "group": "反馈组件",
        "description": "过渡的独立用法与交互。",
        "examples": [
            {
                "id": "component-transition",
                "title": "过渡的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, USwitch, UTextField, UTransition } from '@lingyzh/ui';\nconst expanded = ref(true);\nconst disabled = ref(false);\nconst reduced = ref(document.documentElement.dataset.reducedMotion === 'true');\nconst lines = ref(1);\nconst name = ref('保持内容');\nfunction updateReduced(value) {\n    reduced.value = value;\n    document.documentElement.dataset.reducedMotion = String(value);\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTransition\">\n        <div class=\"demo-row\">\n            <u-button size=\"sm\" @click=\"expanded = !expanded\">切换展开</u-button>\n            <u-button size=\"sm\" @click=\"lines++\">增加内容</u-button>\n        </div>\n        <div class=\"demo-row\">\n            <u-switch v-model=\"disabled\" label=\"禁用过渡\" />\n            <u-switch\n                :model-value=\"reduced\"\n                label=\"减少动态效果\"\n                @update:model-value=\"updateReduced\"\n            />\n        </div>\n        <u-transition variant=\"expand\" :disabled=\"disabled\">\n            <div\n                v-show=\"expanded\"\n                class=\"completion-panel\"\n                style=\"overflow: visible; min-height: 72px\"\n            >\n                <strong>带内边距和边框的内容</strong>\n                <p v-for=\"line in lines\" :key=\"line\">\n                    第 {{ line }} 行：快速切换会从当前高度继续，过渡结束恢复自动尺寸。\n                </p>\n                <u-text-field v-model=\"name\" label=\"面板内名称\" />\n            </div>\n        </u-transition>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-panel {\n    padding: 16px;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "breadcrumbs",
        "title": "面包屑",
        "name": "UBreadcrumbs",
        "kind": "component",
        "group": "导航组件",
        "description": "面包屑的独立用法与交互。",
        "examples": [
            {
                "id": "component-breadcrumbs",
                "title": "面包屑的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UBreadcrumbs, UBreadcrumbsItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBreadcrumbs\">\n        <u-breadcrumbs aria-label=\"项目路径\">\n            <u-breadcrumbs-item href=\"#/overview\" title=\"文档\" />\n            <u-breadcrumbs-item title=\"当前项目\" active />\n        </u-breadcrumbs>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "breadcrumbs-item",
        "title": "路径项",
        "name": "UBreadcrumbsItem",
        "kind": "component",
        "group": "导航组件",
        "description": "路径项的独立用法与交互。",
        "examples": [
            {
                "id": "component-breadcrumbs-item",
                "title": "路径项的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UBreadcrumbs, UBreadcrumbsItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBreadcrumbsItem\">\n        <u-breadcrumbs aria-label=\"项目路径\">\n            <u-breadcrumbs-item href=\"#/overview\" title=\"文档\" />\n            <u-breadcrumbs-item title=\"当前项目\" active />\n        </u-breadcrumbs>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "breadcrumbs-divider",
        "title": "路径分隔符",
        "name": "UBreadcrumbsDivider",
        "kind": "component",
        "group": "导航组件",
        "description": "路径分隔符的独立用法与交互。",
        "examples": [
            {
                "id": "component-breadcrumbs-divider",
                "title": "路径分隔符的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UBreadcrumbsDivider } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBreadcrumbsDivider\">\n        <ol class=\"demo-row\">\n            <li>文档</li>\n            <u-breadcrumbs-divider />\n            <li>当前项目</li>\n        </ol>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "bottom-navigation",
        "title": "底部导航",
        "name": "UBottomNavigation",
        "kind": "component",
        "group": "导航组件",
        "description": "底部导航的独立用法与交互。",
        "examples": [
            {
                "id": "component-bottom-navigation",
                "title": "底部导航的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBottomNavigation, UButton } from '@lingyzh/ui';\nconst bottom = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBottomNavigation\">\n        <u-bottom-navigation v-model=\"bottom\">\n            <template #default=\"{ selected, select }\">\n                <u-button\n                    v-for=\"value in ['overview', 'search', 'settings']\"\n                    :key=\"value\"\n                    variant=\"text\"\n                    :aria-current=\"selected === value ? 'page' : undefined\"\n                    @click=\"select(value)\"\n                >\n                    {{ { overview: '概览', search: '搜索', settings: '设置' }[value] }}\n                </u-button>\n            </template>\n        </u-bottom-navigation>\n        <output>当前：{{ bottom }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "bottom-sheet",
        "title": "底部面板",
        "name": "UBottomSheet",
        "kind": "component",
        "group": "导航组件",
        "description": "底部面板的独立用法与交互。",
        "examples": [
            {
                "id": "component-bottom-sheet",
                "title": "底部面板的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBottomSheet, UButton } from '@lingyzh/ui';\nconst open = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBottomSheet\">\n        <u-button @click=\"open = true\">打开底部面板</u-button>\n        <u-bottom-sheet v-model=\"open\">\n            <h3>底部操作面板</h3>\n            <p>适合移动设备上的次要操作。</p>\n            <u-button @click=\"open = false\">完成</u-button>\n        </u-bottom-sheet>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "overlay",
        "title": "浮层",
        "name": "UOverlay",
        "kind": "component",
        "group": "导航组件",
        "description": "浮层的独立用法与交互。",
        "examples": [
            {
                "id": "component-overlay",
                "title": "浮层的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UOverlay } from '@lingyzh/ui';\nconst open = ref(false);\nfunction reopen() {\n    open.value = false;\n    requestAnimationFrame(() => {\n        open.value = true;\n    });\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UOverlay\">\n        <u-button @click=\"open = true\">打开浮层</u-button>\n        <u-overlay v-model=\"open\" :width=\"360\" v-slot=\"{ close }\">\n            <h3>通用浮层</h3>\n            <p>Escape 或点击外部关闭，退出动画完成后恢复焦点和滚动。</p>\n            <div class=\"demo-row\">\n                <u-button @click=\"close\">关闭</u-button>\n                <u-button variant=\"text\" @click=\"reopen\">快速重开</u-button>\n            </div>\n        </u-overlay>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "data-table",
        "title": "客户端数据表格",
        "name": "UDataTable",
        "kind": "component",
        "group": "内容组件",
        "description": "客户端数据表格的独立用法与交互。",
        "examples": [
            {
                "id": "component-data-table",
                "title": "客户端数据表格的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UDataTable } from '@lingyzh/ui';\nconst headers = [\n    { key: 'title', title: '工作区', sortable: true },\n    { key: 'category', title: '分类', sortable: true },\n    { key: 'count', title: '任务数', sortable: true, align: 'end' },\n];\nconst items = Array.from({ length: 60 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: index % 2 ? '设计' : '开发',\n    count: (index * 7) % 31,\n}));\nconst search = ref('');\nconst selected = ref([]);\nconst expanded = ref([]);\nconst groups = ref([]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDataTable\">\n        <u-button\n            size=\"sm\"\n            @click=\"groups = groups.length ? [] : [{ key: 'category', order: 'asc' }]\"\n        >\n            切换分组\n        </u-button>\n        <u-data-table\n            v-model=\"selected\"\n            v-model:expanded=\"expanded\"\n            v-model:group-by=\"groups\"\n            :headers=\"headers\"\n            :items=\"items\"\n            :search=\"search\"\n            show-select\n            show-expand\n            multi-sort\n            label=\"工作区列表\"\n        >\n            <template #expanded-row=\"{ item }\">\n                <strong>{{ item.title }}</strong>\n                <p>{{ item.category }} · 详情内容随高度平滑展开、收起。</p>\n            </template>\n        </u-data-table>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "data-table-virtual",
        "title": "虚拟数据表格",
        "name": "UDataTableVirtual",
        "kind": "component",
        "group": "内容组件",
        "description": "虚拟数据表格的独立用法与交互。",
        "examples": [
            {
                "id": "component-data-table-virtual",
                "title": "虚拟数据表格的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDataTableVirtual } from '@lingyzh/ui';\nconst headers = [\n    { key: 'title', title: '工作区', sortable: true },\n    { key: 'category', title: '分类', sortable: true },\n    { key: 'count', title: '任务数', sortable: true, align: 'end' },\n];\nconst items = Array.from({ length: 60 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: index % 2 ? '设计' : '开发',\n    count: (index * 7) % 31,\n}));\nconst largeItems = Array.from({ length: 10000 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: '开发',\n    count: index,\n}));\nconst search = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDataTableVirtual\">\n        <u-data-table-virtual\n            :headers=\"headers\"\n            :items=\"largeItems\"\n            :search=\"search\"\n            :height=\"260\"\n            label=\"虚拟工作区列表\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "data-iterator",
        "title": "数据迭代器",
        "name": "UDataIterator",
        "kind": "component",
        "group": "内容组件",
        "description": "数据迭代器的独立用法与交互。",
        "examples": [
            {
                "id": "component-data-iterator",
                "title": "数据迭代器的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UCard, UDataIterator } from '@lingyzh/ui';\nconst items = Array.from({ length: 60 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: index % 2 ? '设计' : '开发',\n    count: (index * 7) % 31,\n}));\nconst page = ref(1);\nconst title = ref('工作区名称');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDataIterator\">\n        <u-data-iterator v-model:page=\"page\" :items=\"items\" :items-per-page=\"4\">\n            <template #default=\"{ items: current, pageCount, nextPage, prevPage }\">\n                <div class=\"completion-grid\">\n                    <u-card\n                        v-for=\"item in current\"\n                        :key=\"item.id\"\n                        :title=\"item.title\"\n                        :subtitle=\"item.category\"\n                    >\n                        {{ item.count }} 个任务\n                    </u-card>\n                </div>\n                <div class=\"completion-toolbar mt-4\">\n                    <u-button :disabled=\"page === 1\" @click=\"prevPage\">上一页</u-button>\n                    <output>{{ page }} / {{ pageCount }}</output>\n                    <u-button :disabled=\"page === pageCount\" @click=\"nextPage\">下一页</u-button>\n                </div>\n            </template>\n        </u-data-iterator>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "date-input",
        "title": "日期输入",
        "name": "UDateInput",
        "kind": "component",
        "group": "表单组件",
        "description": "日期输入的独立用法与交互。",
        "examples": [
            {
                "id": "component-date-input",
                "title": "日期输入的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDateInput } from '@lingyzh/ui';\nconst date = ref('2026-10-06');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDateInput\">\n        <u-date-input v-model=\"date\" label=\"开始日期\" hint=\"输入 ISO 日期或打开日历选择。\" />\n        <output>当前日期：{{ date }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "date-picker",
        "title": "日期选择面板",
        "name": "UDatePicker",
        "kind": "component",
        "group": "表单组件",
        "description": "日期选择面板的独立用法与交互。",
        "examples": [
            {
                "id": "component-date-picker",
                "title": "日期选择面板的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDatePicker } from '@lingyzh/ui';\nconst date = ref('2026-10-06');\nconst range = ref(['2026-10-06', '2026-10-10']);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDatePicker\">\n        <u-date-picker\n            v-model=\"range\"\n            mode=\"range\"\n            locale=\"zh-CN\"\n            label=\"日期范围\"\n            min=\"2026-10-01\"\n            max=\"2026-10-31\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "time-picker",
        "title": "时间选择",
        "name": "UTimePicker",
        "kind": "component",
        "group": "表单组件",
        "description": "时间选择的独立用法与交互。",
        "examples": [
            {
                "id": "component-time-picker",
                "title": "时间选择的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTimePicker } from '@lingyzh/ui';\nconst time = ref('09:30');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTimePicker\">\n        <u-time-picker v-model=\"time\" label=\"执行时间\" />\n        <output>当前时间：{{ time }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "calendar",
        "title": "日历",
        "name": "UCalendar",
        "kind": "component",
        "group": "表单组件",
        "description": "日历的独立用法与交互。",
        "examples": [
            {
                "id": "component-calendar",
                "title": "日历的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCalendar } from '@lingyzh/ui';\nconst date = ref('2026-10-06');\nconst title = ref('工作区名称');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCalendar\">\n        <u-calendar\n            v-model=\"date\"\n            locale=\"zh-CN\"\n            :events=\"[\n                { id: 1, title: '设计评审', start: '2026-10-06' },\n                { id: 2, title: '组件验收', start: '2026-10-10' },\n            ]\"\n            class=\"mt-4\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "picker",
        "title": "选择面板",
        "name": "UPicker",
        "kind": "component",
        "group": "表单组件",
        "description": "选择面板的独立用法与交互。",
        "examples": [
            {
                "id": "component-picker",
                "title": "选择面板的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UPicker } from '@lingyzh/ui';\nconst items = Array.from({ length: 60 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: index % 2 ? '设计' : '开发',\n    count: (index * 7) % 31,\n}));\nconst chosen = ref('设计');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UPicker\">\n        <u-picker v-model=\"chosen\" :items=\"['设计', '开发', '文档']\" class=\"mt-4\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "confirm-edit",
        "title": "确认编辑",
        "name": "UConfirmEdit",
        "kind": "component",
        "group": "表单组件",
        "description": "确认编辑的独立用法与交互。",
        "examples": [
            {
                "id": "component-confirm-edit",
                "title": "确认编辑的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UConfirmEdit, UTextField } from '@lingyzh/ui';\nconst title = ref('工作区名称');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UConfirmEdit\">\n        <u-confirm-edit v-model=\"title\" v-slot=\"{ model }\">\n            <u-text-field v-model=\"model.value\" label=\"编辑名称\" />\n        </u-confirm-edit>\n        <output>已确认：{{ title }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "progress-circular",
        "title": "圆形进度",
        "name": "UProgressCircular",
        "kind": "component",
        "group": "反馈组件",
        "description": "圆形进度的独立用法与交互。",
        "examples": [
            {
                "id": "component-progress-circular",
                "title": "圆形进度的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UProgressCircular } from '@lingyzh/ui';\nconst progress = ref(40);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UProgressCircular\">\n        <div class=\"demo-row\">\n            <u-progress-circular :model-value=\"progress\" label=\"确定进度\" v-slot=\"{ value }\">\n                {{ value }}\n            </u-progress-circular>\n            <u-progress-circular indeterminate label=\"处理中\" />\n            <u-button size=\"sm\" @click=\"progress = (progress + 20) % 120\">增加进度</u-button>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "progress-linear",
        "title": "线性进度",
        "name": "UProgressLinear",
        "kind": "component",
        "group": "反馈组件",
        "description": "线性进度的独立用法与交互。",
        "examples": [
            {
                "id": "component-progress-linear",
                "title": "线性进度的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UProgressLinear } from '@lingyzh/ui';\nconst progress = ref(40);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UProgressLinear\">\n        <u-progress-linear :model-value=\"progress\" :buffer-value=\"80\" label=\"后台执行进度\" />\n        <u-progress-linear indeterminate label=\"等待服务\" />\n        <u-button size=\"sm\" @click=\"progress = (progress + 20) % 120\">增加进度</u-button>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "expansion-panels",
        "title": "折叠面板组",
        "name": "UExpansionPanels",
        "kind": "component",
        "group": "容器组件",
        "description": "折叠面板组的独立用法与交互。",
        "examples": [
            {
                "id": "component-expansion-panels",
                "title": "折叠面板组的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UExpansionPanel,\n    UExpansionPanelText,\n    UExpansionPanelTitle,\n    UExpansionPanels,\n} from '@lingyzh/ui';\nconst panel = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UExpansionPanels\">\n        <u-expansion-panels v-model=\"panel\">\n            <u-expansion-panel value=\"overview\">\n                <u-expansion-panel-title>组件说明</u-expansion-panel-title>\n                <u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text>\n            </u-expansion-panel>\n            <u-expansion-panel value=\"details\">\n                <u-expansion-panel-title>更多说明</u-expansion-panel-title>\n                <u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text>\n            </u-expansion-panel>\n        </u-expansion-panels>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "expansion-panel",
        "title": "折叠面板",
        "name": "UExpansionPanel",
        "kind": "component",
        "group": "容器组件",
        "description": "折叠面板的独立用法与交互。",
        "examples": [
            {
                "id": "component-expansion-panel",
                "title": "折叠面板的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UExpansionPanel,\n    UExpansionPanelText,\n    UExpansionPanelTitle,\n    UExpansionPanels,\n} from '@lingyzh/ui';\nconst panel = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UExpansionPanel\">\n        <u-expansion-panels v-model=\"panel\">\n            <u-expansion-panel value=\"overview\">\n                <u-expansion-panel-title>组件说明</u-expansion-panel-title>\n                <u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text>\n            </u-expansion-panel>\n            <u-expansion-panel value=\"details\">\n                <u-expansion-panel-title>更多说明</u-expansion-panel-title>\n                <u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text>\n            </u-expansion-panel>\n        </u-expansion-panels>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "expansion-panel-title",
        "title": "折叠标题",
        "name": "UExpansionPanelTitle",
        "kind": "component",
        "group": "容器组件",
        "description": "折叠标题的独立用法与交互。",
        "examples": [
            {
                "id": "component-expansion-panel-title",
                "title": "折叠标题的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UExpansionPanel,\n    UExpansionPanelText,\n    UExpansionPanelTitle,\n    UExpansionPanels,\n} from '@lingyzh/ui';\nconst panel = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UExpansionPanelTitle\">\n        <u-expansion-panels v-model=\"panel\">\n            <u-expansion-panel value=\"overview\">\n                <u-expansion-panel-title>组件说明</u-expansion-panel-title>\n                <u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text>\n            </u-expansion-panel>\n            <u-expansion-panel value=\"details\">\n                <u-expansion-panel-title>更多说明</u-expansion-panel-title>\n                <u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text>\n            </u-expansion-panel>\n        </u-expansion-panels>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "expansion-panel-text",
        "title": "折叠内容",
        "name": "UExpansionPanelText",
        "kind": "component",
        "group": "容器组件",
        "description": "折叠内容的独立用法与交互。",
        "examples": [
            {
                "id": "component-expansion-panel-text",
                "title": "折叠内容的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UExpansionPanel,\n    UExpansionPanelText,\n    UExpansionPanelTitle,\n    UExpansionPanels,\n} from '@lingyzh/ui';\nconst panel = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UExpansionPanelText\">\n        <u-expansion-panels v-model=\"panel\">\n            <u-expansion-panel value=\"overview\">\n                <u-expansion-panel-title>组件说明</u-expansion-panel-title>\n                <u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text>\n            </u-expansion-panel>\n            <u-expansion-panel value=\"details\">\n                <u-expansion-panel-title>更多说明</u-expansion-panel-title>\n                <u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text>\n            </u-expansion-panel>\n        </u-expansion-panels>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "stepper",
        "title": "步骤容器",
        "name": "UStepper",
        "kind": "component",
        "group": "导航组件",
        "description": "步骤容器的独立用法与交互。",
        "examples": [
            {
                "id": "component-stepper",
                "title": "步骤容器的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UStepper,\n    UStepperActions,\n    UStepperItem,\n    UStepperWindow,\n    UStepperWindowItem,\n} from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepper\">\n        <u-stepper v-model=\"step\">\n            <u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable />\n            <u-stepper-item :value=\"2\" title=\"完成\" editable />\n            <u-stepper-window>\n                <u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item>\n                <u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item>\n            </u-stepper-window>\n            <u-stepper-actions />\n        </u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "stepper-vertical",
        "title": "垂直步骤",
        "name": "UStepperVertical",
        "kind": "component",
        "group": "导航组件",
        "description": "垂直步骤的独立用法与交互。",
        "examples": [
            {
                "id": "component-stepper-vertical",
                "title": "垂直步骤的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UStepperActions,\n    UStepperItem,\n    UStepperVertical,\n    UStepperWindow,\n    UStepperWindowItem,\n} from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperVertical\">\n        <u-stepper-vertical v-model=\"step\">\n            <u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable />\n            <u-stepper-item :value=\"2\" title=\"完成\" editable />\n            <u-stepper-window>\n                <u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item>\n                <u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item>\n            </u-stepper-window>\n            <u-stepper-actions />\n        </u-stepper-vertical>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "stepper-item",
        "title": "步骤项",
        "name": "UStepperItem",
        "kind": "component",
        "group": "导航组件",
        "description": "步骤项的独立用法与交互。",
        "examples": [
            {
                "id": "component-stepper-item",
                "title": "步骤项的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UStepper,\n    UStepperActions,\n    UStepperItem,\n    UStepperWindow,\n    UStepperWindowItem,\n} from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperItem\">\n        <u-stepper v-model=\"step\">\n            <u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable />\n            <u-stepper-item :value=\"2\" title=\"完成\" editable />\n            <u-stepper-window>\n                <u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item>\n                <u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item>\n            </u-stepper-window>\n            <u-stepper-actions />\n        </u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "stepper-window",
        "title": "步骤内容容器",
        "name": "UStepperWindow",
        "kind": "component",
        "group": "导航组件",
        "description": "步骤内容容器的独立用法与交互。",
        "examples": [
            {
                "id": "component-stepper-window",
                "title": "步骤内容容器的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UStepper,\n    UStepperActions,\n    UStepperItem,\n    UStepperWindow,\n    UStepperWindowItem,\n} from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperWindow\">\n        <u-stepper v-model=\"step\">\n            <u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable />\n            <u-stepper-item :value=\"2\" title=\"完成\" editable />\n            <u-stepper-window>\n                <u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item>\n                <u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item>\n            </u-stepper-window>\n            <u-stepper-actions />\n        </u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "stepper-window-item",
        "title": "步骤内容",
        "name": "UStepperWindowItem",
        "kind": "component",
        "group": "导航组件",
        "description": "步骤内容的独立用法与交互。",
        "examples": [
            {
                "id": "component-stepper-window-item",
                "title": "步骤内容的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UStepper,\n    UStepperActions,\n    UStepperItem,\n    UStepperWindow,\n    UStepperWindowItem,\n} from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperWindowItem\">\n        <u-stepper v-model=\"step\">\n            <u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable />\n            <u-stepper-item :value=\"2\" title=\"完成\" editable />\n            <u-stepper-window>\n                <u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item>\n                <u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item>\n            </u-stepper-window>\n            <u-stepper-actions />\n        </u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "stepper-actions",
        "title": "步骤操作",
        "name": "UStepperActions",
        "kind": "component",
        "group": "导航组件",
        "description": "步骤操作的独立用法与交互。",
        "examples": [
            {
                "id": "component-stepper-actions",
                "title": "步骤操作的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UStepper,\n    UStepperActions,\n    UStepperItem,\n    UStepperWindow,\n    UStepperWindowItem,\n} from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperActions\">\n        <u-stepper v-model=\"step\">\n            <u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable />\n            <u-stepper-item :value=\"2\" title=\"完成\" editable />\n            <u-stepper-window>\n                <u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item>\n                <u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item>\n            </u-stepper-window>\n            <u-stepper-actions />\n        </u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "window",
        "title": "内容窗口",
        "name": "UWindow",
        "kind": "component",
        "group": "容器组件",
        "description": "内容窗口的独立用法与交互。",
        "examples": [
            {
                "id": "component-window",
                "title": "内容窗口的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UWindow, UWindowItem } from '@lingyzh/ui';\nconst windowValue = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UWindow\">\n        <u-button size=\"sm\" @click=\"windowValue = windowValue === 'a' ? 'b' : 'a'\">\n            切换面板\n        </u-button>\n        <u-window v-model=\"windowValue\" continuous label=\"内容窗口\">\n            <u-window-item value=\"a\">\n                <div class=\"completion-window-card\">概览面板</div>\n            </u-window-item>\n            <u-window-item value=\"b\">\n                <div class=\"completion-window-card\">详情面板</div>\n            </u-window-item>\n        </u-window>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-window-card {\n    display: grid;\n    place-items: center;\n    min-height: 140px;\n    padding: 20px;\n    background: var(--accent-soft);\n    color: var(--accent-text);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "window-item",
        "title": "窗口项",
        "name": "UWindowItem",
        "kind": "component",
        "group": "容器组件",
        "description": "窗口项的独立用法与交互。",
        "examples": [
            {
                "id": "component-window-item",
                "title": "窗口项的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UWindow, UWindowItem } from '@lingyzh/ui';\nconst windowValue = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UWindowItem\">\n        <u-button size=\"sm\" @click=\"windowValue = windowValue === 'a' ? 'b' : 'a'\">\n            切换面板\n        </u-button>\n        <u-window v-model=\"windowValue\" continuous label=\"内容窗口\">\n            <u-window-item value=\"a\">\n                <div class=\"completion-window-card\">概览面板</div>\n            </u-window-item>\n            <u-window-item value=\"b\">\n                <div class=\"completion-window-card\">详情面板</div>\n            </u-window-item>\n        </u-window>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-window-card {\n    display: grid;\n    place-items: center;\n    min-height: 140px;\n    padding: 20px;\n    background: var(--accent-soft);\n    color: var(--accent-text);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "carousel",
        "title": "轮播",
        "name": "UCarousel",
        "kind": "component",
        "group": "容器组件",
        "description": "轮播的独立用法与交互。",
        "examples": [
            {
                "id": "component-carousel",
                "title": "轮播的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCarousel, UCarouselItem } from '@lingyzh/ui';\nconst carousel = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCarousel\">\n        <u-carousel v-model=\"carousel\" :cycle=\"false\" label=\"内容轮播\">\n            <u-carousel-item v-for=\"value in [1, 2, 3]\" :key=\"value\" :value=\"value\">\n                <div class=\"completion-window-card\">第 {{ value }} 项</div>\n            </u-carousel-item>\n        </u-carousel>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-window-card {\n    display: grid;\n    place-items: center;\n    min-height: 140px;\n    padding: 20px;\n    background: var(--accent-soft);\n    color: var(--accent-text);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "carousel-item",
        "title": "轮播项",
        "name": "UCarouselItem",
        "kind": "component",
        "group": "容器组件",
        "description": "轮播项的独立用法与交互。",
        "examples": [
            {
                "id": "component-carousel-item",
                "title": "轮播项的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCarousel, UCarouselItem } from '@lingyzh/ui';\nconst carousel = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCarouselItem\">\n        <u-carousel v-model=\"carousel\" :cycle=\"false\" label=\"内容轮播\">\n            <u-carousel-item v-for=\"value in [1, 2, 3]\" :key=\"value\" :value=\"value\">\n                <div class=\"completion-window-card\">第 {{ value }} 项</div>\n            </u-carousel-item>\n        </u-carousel>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-window-card {\n    display: grid;\n    place-items: center;\n    min-height: 140px;\n    padding: 20px;\n    background: var(--accent-soft);\n    color: var(--accent-text);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "img",
        "title": "图片",
        "name": "UImg",
        "kind": "component",
        "group": "内容组件",
        "description": "图片的独立用法与交互。",
        "examples": [
            {
                "id": "component-img",
                "title": "图片的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UImg } from '@lingyzh/ui';\nconst image =\n    'data:image/svg+xml,' +\n    encodeURIComponent(\n        '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>'\n    );\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UImg\">\n        <u-img :src=\"image\" alt=\"柔和的山丘图形\" lazy />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "responsive",
        "title": "比例容器",
        "name": "UResponsive",
        "kind": "component",
        "group": "内容组件",
        "description": "比例容器的独立用法与交互。",
        "examples": [
            {
                "id": "component-responsive",
                "title": "比例容器的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UResponsive } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UResponsive\">\n        <u-responsive aspect-ratio=\"2/1\">\n            <div class=\"completion-window-card\">2 : 1 的内容区域</div>\n        </u-responsive>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-window-card {\n    display: grid;\n    place-items: center;\n    min-height: 140px;\n    padding: 20px;\n    background: var(--accent-soft);\n    color: var(--accent-text);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "hover",
        "title": "悬停状态",
        "name": "UHover",
        "kind": "component",
        "group": "内容组件",
        "description": "悬停状态的独立用法与交互。",
        "examples": [
            {
                "id": "component-hover",
                "title": "悬停状态的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UButton, UHover } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UHover\">\n        <u-hover v-slot=\"{ isHovering, props: hoverProps }\">\n            <div\n                v-bind=\"hoverProps\"\n                class=\"completion-panel\"\n                :style=\"{ background: isHovering ? 'var(--accent-soft)' : 'var(--surface)' }\"\n            >\n                {{ isHovering ? '指针或键盘位于此区域' : '移入或聚焦查看状态' }}\n                <u-button size=\"sm\" class=\"mt-3\">可聚焦的操作</u-button>\n            </div>\n        </u-hover>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-panel {\n    padding: 16px;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "hotkey",
        "title": "快捷键",
        "name": "UHotkey",
        "kind": "component",
        "group": "内容组件",
        "description": "快捷键的独立用法与交互。",
        "examples": [
            {
                "id": "component-hotkey",
                "title": "快捷键的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UHotkey, UKbd } from '@lingyzh/ui';\nconst hotkey = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UHotkey\">\n        <u-hotkey keys=\"ctrl+shift+k\" @trigger=\"hotkey++\">\n            <u-kbd keys=\"Ctrl + Shift + K\" />\n        </u-hotkey>\n        <output>快捷键触发 {{ hotkey }} 次</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "kbd",
        "title": "键盘标记",
        "name": "UKbd",
        "kind": "component",
        "group": "内容组件",
        "description": "键盘标记的独立用法与交互。",
        "examples": [
            {
                "id": "component-kbd",
                "title": "键盘标记的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UKbd } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UKbd\">\n        <div class=\"demo-row\">\n            <u-kbd keys=\"Ctrl + K\" />\n            <u-kbd keys=\"Enter\" />\n            <u-kbd keys=\"Escape\" />\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "lazy",
        "title": "延迟显示",
        "name": "ULazy",
        "kind": "component",
        "group": "内容组件",
        "description": "延迟显示的独立用法与交互。",
        "examples": [
            {
                "id": "component-lazy",
                "title": "延迟显示的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UImg, ULazy, UNoSsr, UResponsive } from '@lingyzh/ui';\nconst image =\n    'data:image/svg+xml,' +\n    encodeURIComponent(\n        '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>'\n    );\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULazy\">\n        <u-lazy class=\"mt-4\">\n            <u-no-ssr>\n                <u-responsive aspect-ratio=\"4/1\">\n                    <u-img :src=\"image\" alt=\"延迟显示的山丘图形\" lazy />\n                </u-responsive>\n                <template #placeholder>客户端加载中…</template>\n            </u-no-ssr>\n            <template #placeholder>等待进入视口…</template>\n        </u-lazy>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "no-ssr",
        "title": "客户端内容",
        "name": "UNoSsr",
        "kind": "component",
        "group": "内容组件",
        "description": "客户端内容的独立用法与交互。",
        "examples": [
            {
                "id": "component-no-ssr",
                "title": "客户端内容的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UImg, UNoSsr, UResponsive } from '@lingyzh/ui';\nconst image =\n    'data:image/svg+xml,' +\n    encodeURIComponent(\n        '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>'\n    );\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UNoSsr\">\n        <u-no-ssr>\n            <u-responsive aspect-ratio=\"4/1\">\n                <u-img :src=\"image\" alt=\"延迟显示的山丘图形\" lazy />\n            </u-responsive>\n            <template #placeholder>客户端加载中…</template>\n        </u-no-ssr>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "parallax",
        "title": "视差",
        "name": "UParallax",
        "kind": "component",
        "group": "内容组件",
        "description": "视差的独立用法与交互。",
        "examples": [
            {
                "id": "component-parallax",
                "title": "视差的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UImg, UParallax } from '@lingyzh/ui';\nconst image =\n    'data:image/svg+xml,' +\n    encodeURIComponent(\n        '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>'\n    );\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UParallax\">\n        <u-parallax class=\"mt-4\">\n            <template #background>\n                <u-img :src=\"image\" alt=\"背景山丘\" />\n            </template>\n            <strong>滚动产生轻微视差；减少动效时保持静止。</strong>\n        </u-parallax>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "infinite-scroll",
        "title": "滚动加载",
        "name": "UInfiniteScroll",
        "kind": "component",
        "group": "内容组件",
        "description": "滚动加载的独立用法与交互。",
        "examples": [
            {
                "id": "component-infinite-scroll",
                "title": "滚动加载的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UInfiniteScroll } from '@lingyzh/ui';\nconst loaded = ref(6);\nfunction load({ done }) {\n    loaded.value += 3;\n    done(loaded.value >= 18 ? 'empty' : 'ok');\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UInfiniteScroll\">\n        <u-infinite-scroll @load=\"load\">\n            <ul>\n                <li v-for=\"item in loaded\" :key=\"item\" class=\"py-2\">示例记录 {{ item }}</li>\n            </ul>\n        </u-infinite-scroll>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "pull-to-refresh",
        "title": "下拉刷新",
        "name": "UPullToRefresh",
        "kind": "component",
        "group": "内容组件",
        "description": "下拉刷新的独立用法与交互。",
        "examples": [
            {
                "id": "component-pull-to-refresh",
                "title": "下拉刷新的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UPullToRefresh } from '@lingyzh/ui';\nconst refreshed = ref(0);\nfunction refresh({ done }) {\n    refreshed.value++;\n    done();\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UPullToRefresh\">\n        <u-pull-to-refresh style=\"max-height: 240px\" @refresh=\"refresh\">\n            <p>触屏下拉刷新，已刷新 {{ refreshed }} 次。</p>\n            <ul>\n                <li v-for=\"item in 6\" :key=\"item\" class=\"py-2\">示例记录 {{ item }}</li>\n            </ul>\n        </u-pull-to-refresh>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "sparkline",
        "title": "趋势线",
        "name": "USparkline",
        "kind": "component",
        "group": "内容组件",
        "description": "趋势线的独立用法与交互。",
        "examples": [
            {
                "id": "component-sparkline",
                "title": "趋势线的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { USparkline } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USparkline\">\n        <u-sparkline :values=\"[12, 18, 14, 25, 22, 35, 28, 40]\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "timeline",
        "title": "时间线",
        "name": "UTimeline",
        "kind": "component",
        "group": "内容组件",
        "description": "时间线的独立用法与交互。",
        "examples": [
            {
                "id": "component-timeline",
                "title": "时间线的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UTimeline, UTimelineItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTimeline\">\n        <u-timeline side=\"alternate\">\n            <u-timeline-item title=\"完成盘点\" subtitle=\"09:00\">\n                确认组件和使用接口。\n            </u-timeline-item>\n            <u-timeline-item title=\"组件实现\" subtitle=\"10:00\">\n                编写真实模板与交互示例。\n            </u-timeline-item>\n        </u-timeline>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "timeline-item",
        "title": "时间线项",
        "name": "UTimelineItem",
        "kind": "component",
        "group": "内容组件",
        "description": "时间线项的独立用法与交互。",
        "examples": [
            {
                "id": "component-timeline-item",
                "title": "时间线项的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { UTimeline, UTimelineItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTimelineItem\">\n        <u-timeline side=\"alternate\">\n            <u-timeline-item title=\"完成盘点\" subtitle=\"09:00\">\n                确认组件和使用接口。\n            </u-timeline-item>\n            <u-timeline-item title=\"组件实现\" subtitle=\"10:00\">\n                编写真实模板与交互示例。\n            </u-timeline-item>\n        </u-timeline>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "speed-dial",
        "title": "快捷操作展开",
        "name": "USpeedDial",
        "kind": "component",
        "group": "内容组件",
        "description": "快捷操作展开的独立用法与交互。",
        "examples": [
            {
                "id": "component-speed-dial",
                "title": "快捷操作展开的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UFab, USpeedDial } from '@lingyzh/ui';\nconst dial = ref(false);\nconst action = ref('尚未执行');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USpeedDial\">\n        <u-speed-dial v-model=\"dial\">\n            <template #activator=\"{ props: activatorProps }\">\n                <u-fab v-bind=\"activatorProps\" label=\"打开快捷操作\" />\n            </template>\n            <u-button size=\"sm\" @click=\"action = '已新建项目'\">新建项目</u-button>\n            <u-button size=\"sm\" @click=\"action = '已导出配置'\">导出配置</u-button>\n        </u-speed-dial>\n        <output role=\"status\">{{ action }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    },
    {
        "id": "fab",
        "title": "浮动按钮",
        "name": "UFab",
        "kind": "component",
        "group": "内容组件",
        "description": "浮动按钮的独立用法与交互。",
        "examples": [
            {
                "id": "component-fab",
                "title": "浮动按钮的基本用法",
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UFab } from '@lingyzh/ui';\nconst count = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFab\">\n        <div class=\"demo-row\">\n            <u-fab label=\"新建项目\" @click=\"count++\" />\n            <output>已新建 {{ count }} 次</output>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    }
];

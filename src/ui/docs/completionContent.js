// Generated from root-authored real demos.
export const completionPages = [
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UAutocomplete } from '@lingyzh/ui';\nconst options = [{ title: '默认工作区', value: 'default' }, { title: '完整的很长选项文字应保持单行，并在控件宽度不足时截断显示', value: 'long' }, { title: '归档工作区', value: 'archived', props: { disabled: true } }];\nconst choice = ref('default');\nconst required = value => (Array.isArray(value) ? value.length > 0 : !!value) || '请填写此项。';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UAutocomplete\">\n        <u-autocomplete v-model=\"choice\" :items=\"options\" label=\"搜索工作区\" hint=\"输入筛选，方向键选择；选项保留对象模型能力。\" clearable :rules=\"[required]\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCombobox } from '@lingyzh/ui';\nconst tags = ref(['文档']);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCombobox\">\n        <u-combobox v-model=\"tags\" :items=\"['文档', '测试', '设计']\" label=\"可创建标签\" multiple chips clearable hint=\"输入新标签并按 Enter 创建。\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UNumberInput } from '@lingyzh/ui';\nconst number = ref(5);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UNumberInput\">\n        <u-number-input v-model=\"number\" label=\"执行并发数\" :min=\"1\" :max=\"10\" :step=\"1\" hint=\"按钮与方向键均遵守 1–10 边界。\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UFileInput } from '@lingyzh/ui';\nconst files = ref(null);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFileInput\">\n        <u-file-input v-model=\"files\" label=\"选择附件\" multiple accept=\".md,.txt,.png\" show-size hint=\"本地选择，仅更新示例模型。\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
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
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UFileUpload } from '@lingyzh/ui';\nconst upload = ref([]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFileUpload\">\n        <u-file-upload v-model=\"upload\" label=\"拖放附件\" multiple :max-size=\"10485760\" hint=\"支持拖放、删除，限制单文件 10 MB。\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
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
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USlider } from '@lingyzh/ui';\nconst progress = ref(35);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USlider\">\n        <u-slider v-model=\"progress\" label=\"进度\" thumb-label show-ticks />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
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
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URangeSlider } from '@lingyzh/ui';\nconst range = ref([20, 70]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"URangeSlider\">\n        <u-range-slider v-model=\"range\" label=\"可接受范围\" hint=\"两个手柄不能越过彼此。\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UOtpInput } from '@lingyzh/ui';\nconst otp = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UOtpInput\">\n        <u-otp-input v-model=\"otp\" label=\"六位验证码\" numeric :length=\"6\" hint=\"支持粘贴、方向键和退格。\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UColorInput } from '@lingyzh/ui';\nconst color = ref('#bd6749');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UColorInput\">\n        <u-color-input v-model=\"color\" label=\"标记颜色\" hint=\"颜色面板和十六进制输入共用一个模型。\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
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
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UColorPicker } from '@lingyzh/ui';\nconst color = ref('#bd6749');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UColorPicker\">\n        <u-color-picker v-model=\"color\" label=\"颜色编辑器\" :swatches=\"['#bd6749', '#679775', '#627ca0', '#8b739e']\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URating } from '@lingyzh/ui';\nconst rating = ref(3);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"URating\">\n        <u-rating v-model=\"rating\" label=\"完成质量\" clearable />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USelectionControl, USelectionControlGroup } from '@lingyzh/ui';\nconst checks = ref(['a']);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USelectionControlGroup\">\n        <u-selection-control-group v-model=\"checks\" multiple label=\"自定义选择组\" direction=\"row\"><u-selection-control value=\"a\" label=\"测试\" /><u-selection-control value=\"b\" label=\"文档\" /></u-selection-control-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USelectionControl } from '@lingyzh/ui';\nconst checked = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USelectionControl\">\n        <u-selection-control v-model=\"checked\" type=\"checkbox\" label=\"接收通知\" /><output>当前值：{{ checked }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URadioGroup, USelectionControl } from '@lingyzh/ui';\nconst radio = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"URadioGroup\">\n        <u-radio-group v-model=\"radio\" label=\"单选组\" hint=\"值由组统一管理。\"><u-selection-control value=\"a\" label=\"默认\" type=\"radio\" /><u-selection-control value=\"b\" label=\"自定义\" type=\"radio\" /></u-radio-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCheckboxGroup, USelectionControl } from '@lingyzh/ui';\nconst checks = ref(['a']);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCheckboxGroup\">\n        <u-checkbox-group v-model=\"checks\" label=\"多选组\"><u-selection-control value=\"a\" label=\"测试\" /><u-selection-control value=\"b\" label=\"文档\" /></u-checkbox-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UItem, UItemGroup } from '@lingyzh/ui';\nconst selected = ref('a');\nconst disabled = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UItemGroup\">\n        <u-item-group v-model=\"selected\" mandatory><u-item value=\"a\">概览</u-item><u-item value=\"b\">详情</u-item><u-item value=\"c\" disabled>禁用</u-item></u-item-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UItem, UItemGroup } from '@lingyzh/ui';\nconst selected = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UItem\">\n        <u-item-group v-model=\"selected\" mandatory><u-item value=\"a\">概览</u-item><u-item value=\"b\">详情</u-item></u-item-group><output>当前值：{{ selected }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UChip } from '@lingyzh/ui';\nconst visible = ref(true);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UChip\">\n        <u-chip closable tone=\"accent\" @close=\"visible = false\" v-if=\"visible\">组件文档</u-chip><u-button v-else size=\"sm\" @click=\"visible = true\">恢复标签</u-button>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UChip, UChipGroup } from '@lingyzh/ui';\nconst selected = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UChipGroup\">\n        <u-chip-group v-model=\"selected\" mandatory><u-chip value=\"a\">概览</u-chip><u-chip value=\"b\" closable>详情</u-chip></u-chip-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UBtnGroup, UButton } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBtnGroup\">\n        <u-btn-group><u-button size=\"sm\">复制</u-button><u-button size=\"sm\">导出</u-button></u-btn-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBtnToggle, UItem } from '@lingyzh/ui';\nconst selected = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBtnToggle\">\n        <u-btn-toggle v-model=\"selected\" mandatory><u-item value=\"a\">概览</u-item><u-item value=\"b\">详情</u-item></u-btn-toggle>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { ULabel } from '@lingyzh/ui';\nconst text = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULabel\">\n        <u-label for=\"custom-label-demo\" required>自定义输入名称</u-label><input id=\"custom-label-demo\" class=\"completion-native-input\" v-model=\"text\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-native-input { width: 100%; min-width: 0; min-height: 36px; padding: 7px 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font: inherit; }\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UMessages } from '@lingyzh/ui';\nconst error = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UMessages\">\n        <u-button size=\"sm\" @click=\"error = !error\">切换错误消息</u-button><u-messages :error=\"error\" :messages=\"error ? ['请检查输入内容。'] : ['配置已保存。']\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCounter, UTextField } from '@lingyzh/ui';\nconst text = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCounter\">\n        <u-text-field v-model=\"text\" label=\"名称\" /><u-counter :value=\"text.length\" :max=\"20\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UInput } from '@lingyzh/ui';\nconst custom = ref('');\nconst disabled = ref(false);\nconst readonly = ref(false);\nconst required = value => (Array.isArray(value) ? value.length > 0 : !!value) || '请填写此项。';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UInput\">\n        <u-input v-model=\"custom\" label=\"自定义输入的验证基座\" :rules=\"[required]\" hint=\"UInput 只提供状态、验证和框架，插槽放入自定义控件。\"><template #default=\"{ controlAttrs, disabled: isDisabled, readonly: isReadonly }\"><input v-model=\"custom\" v-bind=\"controlAttrs\" class=\"completion-native-input\" :disabled=\"isDisabled\" :readonly=\"isReadonly\" /></template></u-input>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-native-input { width: 100%; min-width: 0; min-height: 36px; padding: 7px 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font: inherit; }\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UMessages, UTextField, UValidation } from '@lingyzh/ui';\nconst custom = ref('');\nconst required = value => !!value || '请填写此项。';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UValidation\">\n        <u-validation ref=\"validation\" v-model=\"custom\" :rules=\"[required]\" v-slot=\"{ errors, validate }\"><u-text-field v-model=\"custom\" label=\"自定义内容\" /><u-button @click=\"validate\">验证</u-button><u-messages :messages=\"errors\" error /></u-validation>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDefaultsProvider, UTextField } from '@lingyzh/ui';\nconst text = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDefaultsProvider\">\n        <u-defaults-provider :defaults=\"{ UTextField: { density: 'compact', variant: 'filled' } }\"><u-text-field v-model=\"text\" label=\"继承紧凑、填充样式\" hint=\"默认配置只作用于这个容器。\" /></u-defaults-provider>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { ULocaleProvider, UPagination } from '@lingyzh/ui';\nconst page = ref(2);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULocaleProvider\">\n        <u-locale-provider locale=\"en\"><u-pagination v-model=\"page\" :length=\"5\" label=\"English pagination\" /></u-locale-provider><output>当前页：{{ page }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UApp\">\n        <div class=\"completion-layout\"><u-app><u-app-bar :height=\"48\"><u-app-bar-title>应用顶栏</u-app-bar-title></u-app-bar><u-main><p class=\"pa-4\">主要内容自动避开已注册的栏。</p></u-main></u-app></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }\n.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }\n</style>\n"
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
                "code": "<script setup>\nimport { UAppBar, UAppBarTitle, ULayout, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULayout\">\n        <div class=\"completion-layout\"><u-layout><u-app-bar :height=\"48\"><u-app-bar-title>应用顶栏</u-app-bar-title></u-app-bar><u-main><p class=\"pa-4\">主要内容自动避开已注册的栏。</p></u-main></u-layout></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }\n.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }\n</style>\n"
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
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UMain\">\n        <div class=\"completion-layout\"><u-app><u-app-bar :height=\"48\"><u-app-bar-title>应用顶栏</u-app-bar-title></u-app-bar><u-main><p class=\"pa-4\">主要内容自动避开已注册的栏。</p></u-main></u-app></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }\n.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }\n</style>\n"
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
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UAppBar\">\n        <div class=\"completion-layout\"><u-app><u-app-bar :height=\"48\"><u-app-bar-title>应用顶栏</u-app-bar-title></u-app-bar><u-main><p class=\"pa-4\">主要内容自动避开已注册的栏。</p></u-main></u-app></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }\n.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }\n</style>\n"
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
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UAppBarTitle\">\n        <div class=\"completion-layout\"><u-app><u-app-bar :height=\"48\"><u-app-bar-title>应用顶栏</u-app-bar-title></u-app-bar><u-main><p class=\"pa-4\">主要内容自动避开已注册的栏。</p></u-main></u-app></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }\n.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }\n</style>\n"
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
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UToolbar, UToolbarItems, UToolbarTitle } from '@lingyzh/ui';\nconst action = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UToolbar\">\n        <u-toolbar><u-toolbar-title>工作区</u-toolbar-title><u-toolbar-items><u-button size=\"sm\" variant=\"ghost\" @click=\"action++\">刷新</u-button></u-toolbar-items></u-toolbar><output>已刷新 {{ action }} 次</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
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
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UToolbar, UToolbarItems, UToolbarTitle } from '@lingyzh/ui';\nconst action = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UToolbarTitle\">\n        <u-toolbar><u-toolbar-title>工作区</u-toolbar-title><u-toolbar-items><u-button size=\"sm\" variant=\"ghost\" @click=\"action++\">刷新</u-button></u-toolbar-items></u-toolbar><output>已刷新 {{ action }} 次</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
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
                "description": "只演示当前组件及其所需的容器或子组件，源码与此示例一致。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UToolbar, UToolbarItems, UToolbarTitle } from '@lingyzh/ui';\nconst action = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UToolbarItems\">\n        <u-toolbar><u-toolbar-title>工作区</u-toolbar-title><u-toolbar-items><u-button size=\"sm\" variant=\"ghost\" @click=\"action++\">刷新</u-button></u-toolbar-items></u-toolbar><output>已刷新 {{ action }} 次</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
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
                "code": "<script setup>\nimport { UFooter, ULayout, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFooter\">\n        <div class=\"completion-layout\"><u-layout><u-main><p class=\"pa-4\">页脚占位由 Main 自动处理。</p></u-main><u-footer fixed :height=\"40\">固定页脚</u-footer></u-layout></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }\n.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }\n</style>\n"
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
                "code": "<script setup>\nimport { ULayout, UMain, USystemBar } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USystemBar\">\n        <div class=\"completion-layout\"><u-layout><u-system-bar :height=\"28\">本地工作区 <span class=\"ms-auto\">在线</span></u-system-bar><u-main><p class=\"pa-4\">主要内容自动避开已注册的栏。</p></u-main></u-layout></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }\n.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, ULayout, UList, UListItem, UMain, UNavigationDrawer } from '@lingyzh/ui';\nconst drawer = ref(true);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UNavigationDrawer\">\n        <u-button size=\"sm\" @click=\"drawer = !drawer\">切换抽屉</u-button><div class=\"completion-layout\"><u-layout><u-navigation-drawer v-model=\"drawer\" :width=\"160\" :mobile-breakpoint=\"600\"><u-list><u-list-item title=\"概览\" /><u-list-item title=\"配置\" /></u-list></u-navigation-drawer><u-main><p class=\"pa-4\">关闭抽屉后内容填满剩余空间。</p></u-main></u-layout></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }\n.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UList, UListItem } from '@lingyzh/ui';\nconst selected = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UList\">\n        <u-list v-model=\"selected\"><u-list-item value=\"overview\" title=\"概览\" subtitle=\"项目运行状况\" /><u-list-item value=\"settings\" title=\"设置\" /><u-list-item value=\"disabled\" title=\"归档\" disabled /></u-list><output>已选：{{ selected }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UList, UListItem } from '@lingyzh/ui';\nconst selected = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListItem\">\n        <u-list v-model=\"selected\"><u-list-item value=\"overview\" title=\"概览\" subtitle=\"项目运行状况\" /><u-list-item value=\"settings\" title=\"设置\" /><u-list-item value=\"disabled\" title=\"归档\" disabled /></u-list><output>已选：{{ selected }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UList, UListGroup, UListItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListGroup\">\n        <u-list><u-list-group value=\"settings\" title=\"配置\"><u-list-item value=\"models\" title=\"模型配置\" /><u-list-item value=\"permissions\" title=\"权限配置\" /></u-list-group></u-list>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UList, UListItem, UListSubheader } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListSubheader\">\n        <u-list><u-list-subheader>当前工作区</u-list-subheader><u-list-item title=\"设计工作区\" /><u-list-subheader>归档</u-list-subheader><u-list-item title=\"历史工作区\" disabled /></u-list>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UList, UListItem, UListItemSubtitle, UListItemTitle } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListItemTitle\">\n        <u-list><u-list-item><u-list-item-title>设计工作区</u-list-item-title><u-list-item-subtitle>自定义列表项标题与说明</u-list-item-subtitle></u-list-item></u-list>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UList, UListItem, UListItemSubtitle, UListItemTitle } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListItemSubtitle\">\n        <u-list><u-list-item><u-list-item-title>设计工作区</u-list-item-title><u-list-item-subtitle>自定义列表项标题与说明</u-list-item-subtitle></u-list-item></u-list>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTreeview } from '@lingyzh/ui';\nconst tree = ref([]);\nconst opened = ref(['components']);\nconst items = Array.from({ length: 5000 }, (_, index) => ({ id: index, title: `项目 ${index + 1}` }));\nconst nodes = [{ title: '组件库', value: 'components', children: [{ title: '表单控件', value: 'forms' }, { title: '布局组件', value: 'layout' }, { title: '归档组件', value: 'archive', disabled: true }] }, { title: '文档与示例', value: 'docs' }];\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTreeview\">\n        <u-treeview v-model=\"tree\" v-model:opened=\"opened\" :items=\"nodes\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UVirtualScroll } from '@lingyzh/ui';\nconst items = Array.from({ length: 5000 }, (_, index) => ({ id: index, title: `项目 ${index + 1}` }));\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UVirtualScroll\">\n        <u-virtual-scroll :items=\"items\" :item-height=\"36\" :height=\"180\" item-key=\"id\"><template #default=\"{ item, index }\"><div class=\"px-3 py-2\">{{ index + 1 }} · {{ item.title }}</div></template></u-virtual-scroll>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UAvatar } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UAvatar\">\n        <div class=\"demo-row\"><u-avatar text=\"AY\" /><u-avatar icon=\"mdi-account-outline\" :size=\"32\" /><u-avatar text=\"UI\" :rounded=\"false\" :size=\"32\" /></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UAvatar, UBadge, UButton } from '@lingyzh/ui';\nconst count = ref(90);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBadge\">\n        <div class=\"demo-row\"><u-badge :content=\"count\" :max=\"99\"><u-button @click=\"count += 10\">消息</u-button></u-badge><u-badge dot><u-avatar text=\"UI\" /></u-badge></div><output>消息数：{{ count }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UDivider } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDivider\">\n        <p>第一段内容</p><u-divider /><p>分隔线后的内容</p><div class=\"demo-row\"><span>左侧</span><u-divider vertical /><span>右侧</span></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { USheet } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USheet\">\n        <u-sheet border class=\"pa-4\">带边框的表面容器</u-sheet><u-sheet color=\"var(--accent-soft)\" class=\"pa-4\">使用主题色的表面容器</u-sheet>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UButton, UEmptyState } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UEmptyState\">\n        <u-empty-state title=\"没有工作区\" text=\"创建工作区后，相关内容会出现在这里。\" icon=\"mdi-folder-outline\"><template #actions><u-button size=\"sm\">创建工作区</u-button></template></u-empty-state>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { USkeletonLoader } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USkeletonLoader\">\n        <u-skeleton-loader type=\"avatar\" /><u-skeleton-loader :lines=\"3\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBanner, UButton } from '@lingyzh/ui';\nconst banner = ref(true);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBanner\">\n        <u-banner v-model=\"banner\" text=\"配置已同步。\" icon=\"mdi-information-outline\"><template #actions><u-button size=\"sm\" variant=\"ghost\" @click=\"banner = false\">知道了</u-button></template></u-banner><u-button v-if=\"!banner\" size=\"sm\" @click=\"banner = true\">重新显示提示</u-button>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UTransition } from '@lingyzh/ui';\nconst expanded = ref(true);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTransition\">\n        <u-button size=\"sm\" @click=\"expanded = !expanded\">{{ expanded ? '收起' : '展开' }}</u-button><u-transition variant=\"expand\"><div v-if=\"expanded\" class=\"completion-panel\">展开动画跟随减少动效偏好。</div></u-transition>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-panel { padding: 16px; border: 1px solid var(--border); border-radius: 8px; }\n</style>\n"
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
                "code": "<script setup>\nimport { UBreadcrumbs, UBreadcrumbsItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBreadcrumbs\">\n        <u-breadcrumbs aria-label=\"项目路径\"><u-breadcrumbs-item href=\"#/overview\" title=\"文档\" /><u-breadcrumbs-item title=\"当前项目\" active /></u-breadcrumbs>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UBreadcrumbs, UBreadcrumbsItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBreadcrumbsItem\">\n        <u-breadcrumbs aria-label=\"项目路径\"><u-breadcrumbs-item href=\"#/overview\" title=\"文档\" /><u-breadcrumbs-item title=\"当前项目\" active /></u-breadcrumbs>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UBreadcrumbsDivider } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBreadcrumbsDivider\">\n        <ol class=\"demo-row\"><li>文档</li><u-breadcrumbs-divider /><li>当前项目</li></ol>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBottomNavigation, UButton } from '@lingyzh/ui';\nconst bottom = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBottomNavigation\">\n        <u-bottom-navigation v-model=\"bottom\"><template #default=\"{ selected, select }\"><u-button v-for=\"value in ['overview', 'search', 'settings']\" :key=\"value\" variant=\"ghost\" :aria-current=\"selected === value ? 'page' : undefined\" @click=\"select(value)\">{{ { overview: '概览', search: '搜索', settings: '设置' }[value] }}</u-button></template></u-bottom-navigation><output>当前：{{ bottom }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBottomSheet, UButton } from '@lingyzh/ui';\nconst open = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBottomSheet\">\n        <u-button @click=\"open = true\">打开底部面板</u-button><u-bottom-sheet v-model=\"open\"><h3>底部操作面板</h3><p>适合移动设备上的次要操作。</p><u-button @click=\"open = false\">完成</u-button></u-bottom-sheet>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UOverlay } from '@lingyzh/ui';\nconst open = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UOverlay\">\n        <u-button @click=\"open = true\">打开浮层</u-button><u-overlay v-model=\"open\" :width=\"360\" v-slot=\"{ close }\"><h3>通用浮层</h3><p>Escape 或点击外部关闭。</p><u-button @click=\"close\">关闭</u-button></u-overlay>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDataTable } from '@lingyzh/ui';\nconst headers = [{ key: 'title', title: '工作区', sortable: true }, { key: 'category', title: '分类', sortable: true }, { key: 'count', title: '任务数', sortable: true, align: 'end' }];\nconst items = Array.from({ length: 60 }, (_, index) => ({ id: index, title: `工作区 ${index + 1}`, category: index % 2 ? '设计' : '开发', count: index * 7 % 31 }));\nconst search = ref('');\nconst selected = ref([]);\nconst expanded = ref([]);\nconst groups = ref([]);\nconst title = ref('工作区名称');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDataTable\">\n        <u-data-table v-model=\"selected\" v-model:expanded=\"expanded\" v-model:group-by=\"groups\" :headers=\"headers\" :items=\"items\" :search=\"search\" show-select show-expand multi-sort label=\"工作区列表\"><template #expanded-row=\"{ item }\">{{ item.title }} · {{ item.category }} · 可在插槽放入详情。</template></u-data-table>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDataTableVirtual } from '@lingyzh/ui';\nconst headers = [{ key: 'title', title: '工作区', sortable: true }, { key: 'category', title: '分类', sortable: true }, { key: 'count', title: '任务数', sortable: true, align: 'end' }];\nconst items = Array.from({ length: 60 }, (_, index) => ({ id: index, title: `工作区 ${index + 1}`, category: index % 2 ? '设计' : '开发', count: index * 7 % 31 }));\nconst largeItems = Array.from({ length: 10000 }, (_, index) => ({ id: index, title: `工作区 ${index + 1}`, category: '开发', count: index }));\nconst search = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDataTableVirtual\">\n        <u-data-table-virtual :headers=\"headers\" :items=\"largeItems\" :search=\"search\" :height=\"260\" label=\"虚拟工作区列表\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UCard, UDataIterator } from '@lingyzh/ui';\nconst items = Array.from({ length: 60 }, (_, index) => ({ id: index, title: `工作区 ${index + 1}`, category: index % 2 ? '设计' : '开发', count: index * 7 % 31 }));\nconst page = ref(1);\nconst title = ref('工作区名称');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDataIterator\">\n        <u-data-iterator v-model:page=\"page\" :items=\"items\" :items-per-page=\"4\"><template #default=\"{ items: current, pageCount, nextPage, prevPage }\"><div class=\"completion-grid\"><u-card v-for=\"item in current\" :key=\"item.id\" :title=\"item.title\" :subtitle=\"item.category\">{{ item.count }} 个任务</u-card></div><div class=\"completion-toolbar mt-4\"><u-button :disabled=\"page === 1\" @click=\"prevPage\">上一页</u-button><output>{{ page }} / {{ pageCount }}</output><u-button :disabled=\"page === pageCount\" @click=\"nextPage\">下一页</u-button></div></template></u-data-iterator>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDateInput } from '@lingyzh/ui';\nconst date = ref('2026-10-06');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDateInput\">\n        <u-date-input v-model=\"date\" label=\"开始日期\" hint=\"输入 ISO 日期或打开日历选择。\" /><output>当前日期：{{ date }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDatePicker } from '@lingyzh/ui';\nconst date = ref('2026-10-06');\nconst range = ref(['2026-10-06', '2026-10-10']);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDatePicker\">\n        <u-date-picker v-model=\"range\" mode=\"range\" locale=\"zh-CN\" label=\"日期范围\" min=\"2026-10-01\" max=\"2026-10-31\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTimePicker } from '@lingyzh/ui';\nconst time = ref('09:30');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTimePicker\">\n        <u-time-picker v-model=\"time\" label=\"执行时间\" /><output>当前时间：{{ time }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCalendar } from '@lingyzh/ui';\nconst date = ref('2026-10-06');\nconst title = ref('工作区名称');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCalendar\">\n        <u-calendar v-model=\"date\" locale=\"zh-CN\" :events=\"[{ id: 1, title: '设计评审', start: '2026-10-06' }, { id: 2, title: '组件验收', start: '2026-10-10' }]\" class=\"mt-4\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UPicker } from '@lingyzh/ui';\nconst items = Array.from({ length: 60 }, (_, index) => ({ id: index, title: `工作区 ${index + 1}`, category: index % 2 ? '设计' : '开发', count: index * 7 % 31 }));\nconst chosen = ref('设计');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UPicker\">\n        <u-picker v-model=\"chosen\" :items=\"['设计', '开发', '文档']\" class=\"mt-4\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UConfirmEdit, UTextField } from '@lingyzh/ui';\nconst title = ref('工作区名称');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UConfirmEdit\">\n        <u-confirm-edit v-model=\"title\" v-slot=\"{ model }\"><u-text-field v-model=\"model.value\" label=\"编辑名称\" /></u-confirm-edit><output>已确认：{{ title }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UProgressCircular } from '@lingyzh/ui';\nconst progress = ref(40);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UProgressCircular\">\n        <div class=\"demo-row\"><u-progress-circular :model-value=\"progress\" label=\"确定进度\" v-slot=\"{ value }\">{{ value }}</u-progress-circular><u-progress-circular indeterminate label=\"处理中\" /><u-button size=\"sm\" @click=\"progress = (progress + 20) % 120\">增加进度</u-button></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UProgressLinear } from '@lingyzh/ui';\nconst progress = ref(40);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UProgressLinear\">\n        <u-progress-linear :model-value=\"progress\" :buffer-value=\"80\" label=\"后台执行进度\" /><u-progress-linear indeterminate label=\"等待服务\" /><u-button size=\"sm\" @click=\"progress = (progress + 20) % 120\">增加进度</u-button>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UExpansionPanel, UExpansionPanelText, UExpansionPanelTitle, UExpansionPanels } from '@lingyzh/ui';\nconst panel = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UExpansionPanels\">\n        <u-expansion-panels v-model=\"panel\"><u-expansion-panel value=\"overview\"><u-expansion-panel-title>组件说明</u-expansion-panel-title><u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text></u-expansion-panel><u-expansion-panel value=\"details\"><u-expansion-panel-title>更多说明</u-expansion-panel-title><u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text></u-expansion-panel></u-expansion-panels>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UExpansionPanel, UExpansionPanelText, UExpansionPanelTitle, UExpansionPanels } from '@lingyzh/ui';\nconst panel = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UExpansionPanel\">\n        <u-expansion-panels v-model=\"panel\"><u-expansion-panel value=\"overview\"><u-expansion-panel-title>组件说明</u-expansion-panel-title><u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text></u-expansion-panel><u-expansion-panel value=\"details\"><u-expansion-panel-title>更多说明</u-expansion-panel-title><u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text></u-expansion-panel></u-expansion-panels>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UExpansionPanel, UExpansionPanelText, UExpansionPanelTitle, UExpansionPanels } from '@lingyzh/ui';\nconst panel = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UExpansionPanelTitle\">\n        <u-expansion-panels v-model=\"panel\"><u-expansion-panel value=\"overview\"><u-expansion-panel-title>组件说明</u-expansion-panel-title><u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text></u-expansion-panel><u-expansion-panel value=\"details\"><u-expansion-panel-title>更多说明</u-expansion-panel-title><u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text></u-expansion-panel></u-expansion-panels>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UExpansionPanel, UExpansionPanelText, UExpansionPanelTitle, UExpansionPanels } from '@lingyzh/ui';\nconst panel = ref('overview');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UExpansionPanelText\">\n        <u-expansion-panels v-model=\"panel\"><u-expansion-panel value=\"overview\"><u-expansion-panel-title>组件说明</u-expansion-panel-title><u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text></u-expansion-panel><u-expansion-panel value=\"details\"><u-expansion-panel-title>更多说明</u-expansion-panel-title><u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text></u-expansion-panel></u-expansion-panels>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UStepper, UStepperActions, UStepperItem, UStepperWindow, UStepperWindowItem } from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepper\">\n        <u-stepper v-model=\"step\"><u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable /><u-stepper-item :value=\"2\" title=\"完成\" editable /><u-stepper-window><u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item><u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item></u-stepper-window><u-stepper-actions /></u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UStepperActions, UStepperItem, UStepperVertical, UStepperWindow, UStepperWindowItem } from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperVertical\">\n        <u-stepper-vertical v-model=\"step\"><u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable /><u-stepper-item :value=\"2\" title=\"完成\" editable /><u-stepper-window><u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item><u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item></u-stepper-window><u-stepper-actions /></u-stepper-vertical>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UStepper, UStepperActions, UStepperItem, UStepperWindow, UStepperWindowItem } from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperItem\">\n        <u-stepper v-model=\"step\"><u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable /><u-stepper-item :value=\"2\" title=\"完成\" editable /><u-stepper-window><u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item><u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item></u-stepper-window><u-stepper-actions /></u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UStepper, UStepperActions, UStepperItem, UStepperWindow, UStepperWindowItem } from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperWindow\">\n        <u-stepper v-model=\"step\"><u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable /><u-stepper-item :value=\"2\" title=\"完成\" editable /><u-stepper-window><u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item><u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item></u-stepper-window><u-stepper-actions /></u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UStepper, UStepperActions, UStepperItem, UStepperWindow, UStepperWindowItem } from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperWindowItem\">\n        <u-stepper v-model=\"step\"><u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable /><u-stepper-item :value=\"2\" title=\"完成\" editable /><u-stepper-window><u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item><u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item></u-stepper-window><u-stepper-actions /></u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UStepper, UStepperActions, UStepperItem, UStepperWindow, UStepperWindowItem } from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperActions\">\n        <u-stepper v-model=\"step\"><u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable /><u-stepper-item :value=\"2\" title=\"完成\" editable /><u-stepper-window><u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item><u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item></u-stepper-window><u-stepper-actions /></u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UWindow, UWindowItem } from '@lingyzh/ui';\nconst windowValue = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UWindow\">\n        <u-button size=\"sm\" @click=\"windowValue = windowValue === 'a' ? 'b' : 'a'\">切换面板</u-button><u-window v-model=\"windowValue\" continuous label=\"内容窗口\"><u-window-item value=\"a\"><div class=\"completion-window-card\">概览面板</div></u-window-item><u-window-item value=\"b\"><div class=\"completion-window-card\">详情面板</div></u-window-item></u-window>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-window-card { display: grid; place-items: center; min-height: 140px; padding: 20px; background: var(--accent-soft); color: var(--accent-text); }\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UWindow, UWindowItem } from '@lingyzh/ui';\nconst windowValue = ref('a');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UWindowItem\">\n        <u-button size=\"sm\" @click=\"windowValue = windowValue === 'a' ? 'b' : 'a'\">切换面板</u-button><u-window v-model=\"windowValue\" continuous label=\"内容窗口\"><u-window-item value=\"a\"><div class=\"completion-window-card\">概览面板</div></u-window-item><u-window-item value=\"b\"><div class=\"completion-window-card\">详情面板</div></u-window-item></u-window>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-window-card { display: grid; place-items: center; min-height: 140px; padding: 20px; background: var(--accent-soft); color: var(--accent-text); }\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCarousel, UCarouselItem } from '@lingyzh/ui';\nconst carousel = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCarousel\">\n        <u-carousel v-model=\"carousel\" :cycle=\"false\" label=\"内容轮播\"><u-carousel-item v-for=\"value in [1, 2, 3]\" :key=\"value\" :value=\"value\"><div class=\"completion-window-card\">第 {{ value }} 项</div></u-carousel-item></u-carousel>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-window-card { display: grid; place-items: center; min-height: 140px; padding: 20px; background: var(--accent-soft); color: var(--accent-text); }\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCarousel, UCarouselItem } from '@lingyzh/ui';\nconst carousel = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCarouselItem\">\n        <u-carousel v-model=\"carousel\" :cycle=\"false\" label=\"内容轮播\"><u-carousel-item v-for=\"value in [1, 2, 3]\" :key=\"value\" :value=\"value\"><div class=\"completion-window-card\">第 {{ value }} 项</div></u-carousel-item></u-carousel>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-window-card { display: grid; place-items: center; min-height: 140px; padding: 20px; background: var(--accent-soft); color: var(--accent-text); }\n</style>\n"
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
                "code": "<script setup>\nimport { UImg } from '@lingyzh/ui';\nconst image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UImg\">\n        <u-img :src=\"image\" alt=\"柔和的山丘图形\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UResponsive } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UResponsive\">\n        <u-responsive aspect-ratio=\"2/1\"><div class=\"completion-window-card\">2 : 1 的内容区域</div></u-responsive>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-window-card { display: grid; place-items: center; min-height: 140px; padding: 20px; background: var(--accent-soft); color: var(--accent-text); }\n</style>\n"
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
                "code": "<script setup>\nimport { UButton, UHover } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UHover\">\n        <u-hover v-slot=\"{ isHovering, props: hoverProps }\"><div v-bind=\"hoverProps\" class=\"completion-panel\" :style=\"{ background: isHovering ? 'var(--accent-soft)' : 'var(--surface)' }\">{{ isHovering ? '指针或键盘位于此区域' : '移入或聚焦查看状态' }}<u-button size=\"sm\" class=\"mt-3\">可聚焦的操作</u-button></div></u-hover>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n.completion-panel { padding: 16px; border: 1px solid var(--border); border-radius: 8px; }\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UHotkey, UKbd } from '@lingyzh/ui';\nconst hotkey = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UHotkey\">\n        <u-hotkey keys=\"ctrl+shift+k\" @trigger=\"hotkey++\"><u-kbd keys=\"Ctrl + Shift + K\" /></u-hotkey><output>快捷键触发 {{ hotkey }} 次</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UKbd } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UKbd\">\n        <div class=\"demo-row\"><u-kbd keys=\"Ctrl + K\" /><u-kbd keys=\"Enter\" /><u-kbd keys=\"Escape\" /></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UImg, ULazy, UNoSsr, UResponsive } from '@lingyzh/ui';\nconst image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULazy\">\n        <u-lazy class=\"mt-4\"><u-no-ssr><u-responsive aspect-ratio=\"4/1\"><u-img :src=\"image\" alt=\"延迟显示的山丘图形\" lazy /></u-responsive><template #placeholder>客户端加载中…</template></u-no-ssr><template #placeholder>等待进入视口…</template></u-lazy>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UImg, UNoSsr, UResponsive } from '@lingyzh/ui';\nconst image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UNoSsr\">\n        <u-no-ssr><u-responsive aspect-ratio=\"4/1\"><u-img :src=\"image\" alt=\"延迟显示的山丘图形\" lazy /></u-responsive><template #placeholder>客户端加载中…</template></u-no-ssr>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UImg, UParallax } from '@lingyzh/ui';\nconst image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UParallax\">\n        <u-parallax class=\"mt-4\"><template #background><u-img :src=\"image\" alt=\"背景山丘\" /></template><strong>滚动产生轻微视差；减少动效时保持静止。</strong></u-parallax>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UInfiniteScroll } from '@lingyzh/ui';\nconst loaded = ref(6);\nfunction load({ done }) { loaded.value += 3; done(loaded.value >= 18 ? 'empty' : 'ok'); }\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UInfiniteScroll\">\n        <u-infinite-scroll @load=\"load\"><ul><li v-for=\"item in loaded\" :key=\"item\" class=\"py-2\">示例记录 {{ item }}</li></ul></u-infinite-scroll>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UPullToRefresh } from '@lingyzh/ui';\nconst refreshed = ref(0);\nfunction refresh({ done }) { refreshed.value++; done(); }\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UPullToRefresh\">\n        <u-pull-to-refresh style=\"max-height:240px\" @refresh=\"refresh\"><p>触屏下拉刷新，已刷新 {{ refreshed }} 次。</p><ul><li v-for=\"item in 6\" :key=\"item\" class=\"py-2\">示例记录 {{ item }}</li></ul></u-pull-to-refresh>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { USparkline } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USparkline\">\n        <u-sparkline :values=\"[12, 18, 14, 25, 22, 35, 28, 40]\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UTimeline, UTimelineItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTimeline\">\n        <u-timeline side=\"alternate\"><u-timeline-item title=\"完成盘点\" subtitle=\"09:00\">确认组件和使用接口。</u-timeline-item><u-timeline-item title=\"组件实现\" subtitle=\"10:00\">编写真实模板与交互示例。</u-timeline-item></u-timeline>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { UTimeline, UTimelineItem } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTimelineItem\">\n        <u-timeline side=\"alternate\"><u-timeline-item title=\"完成盘点\" subtitle=\"09:00\">确认组件和使用接口。</u-timeline-item><u-timeline-item title=\"组件实现\" subtitle=\"10:00\">编写真实模板与交互示例。</u-timeline-item></u-timeline>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UFab, USpeedDial } from '@lingyzh/ui';\nconst dial = ref(false);\nconst action = ref('尚未执行');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USpeedDial\">\n        <u-speed-dial v-model=\"dial\"><template #activator=\"{ props: activatorProps }\"><u-fab v-bind=\"activatorProps\" label=\"打开快捷操作\" /></template><u-button size=\"sm\" @click=\"action = '已新建项目'\">新建项目</u-button><u-button size=\"sm\" @click=\"action = '已导出配置'\">导出配置</u-button></u-speed-dial><output role=\"status\">{{ action }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UFab } from '@lingyzh/ui';\nconst count = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFab\">\n        <div class=\"demo-row\"><u-fab label=\"新建项目\" @click=\"count++\" /><output>已新建 {{ count }} 次</output></div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 12px; }\n.component-demo > .ui-button { justify-self: start; }\n\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。"
        ]
    }
];

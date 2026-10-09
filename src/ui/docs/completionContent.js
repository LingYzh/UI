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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, USelect, USnackbar, USwitch, UTextField } from '@lingyzh/ui';\nconst open = ref(false);\nconst text = ref('配置已保存，可以继续编辑。');\nconst permanent = ref(false);\nconst persistent = ref(false);\nconst contained = ref(true);\nconst variant = ref('elevated');\nconst location = ref('bottom center');\nconst colors = ref('');\nconst closed = ref(0);\nconst variants = ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'];\nconst locations = [\n    'top left',\n    'top center',\n    'top right',\n    'bottom left',\n    'bottom center',\n    'bottom right',\n];\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USnackbar\">\n        <u-text-field v-model=\"text\" label=\"消息内容\" />\n        <div class=\"demo-row\">\n            <u-select v-model=\"variant\" :items=\"variants\" label=\"样式\" />\n            <u-select v-model=\"location\" :items=\"locations\" label=\"位置\" />\n            <u-text-field v-model=\"colors\" label=\"主题/CSS颜色\" placeholder=\"primary / #47745c\" />\n        </div>\n        <div class=\"demo-row\">\n            <u-switch v-model=\"permanent\" label=\"持续显示\" />\n            <u-switch v-model=\"persistent\" label=\"阻止 Escape 和外部点击关闭\" />\n            <u-switch v-model=\"contained\" label=\"容器内显示\" />\n            <u-button @click=\"open = !open\">{{ open ? '隐藏消息' : '显示消息' }}</u-button>\n        </div>\n        <div class=\"notice-demo-stage\">\n            <p>鼠标悬停和键盘进入操作区都会暂停倒计时。</p>\n            <u-snackbar\n                v-model=\"open\"\n                :text=\"text\"\n                :timeout=\"permanent ? -1 : 3500\"\n                :persistent=\"persistent\"\n                :contained=\"contained\"\n                :variant=\"variant\"\n                :location=\"location\"\n                :color=\"colors\"\n                timer\n                @after-leave=\"closed++\"\n            >\n                <template #actions=\"{ close }\">\n                    <u-button variant=\"text\" size=\"sm\" @click=\"close\">关闭</u-button>\n                </template>\n            </u-snackbar>\n        </div>\n        <output>显示：{{ open }}；已关闭：{{ closed }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.demo-row {\n    margin: 0;\n}\n.demo-row > .ui-control-frame {\n    flex: 1 1 160px;\n    min-width: 0;\n}\n.notice-demo-stage {\n    position: relative;\n    min-height: 180px;\n    padding: 20px;\n    border: 1px dashed var(--border);\n    border-radius: 8px;\n}\n.notice-demo-stage p {\n    margin: 0;\n    color: var(--muted);\n    line-height: 1.7;\n}\n.component-demo > output {\n    font-size: 14px;\n    color: var(--muted);\n}\n</style>\n"
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
                "description": "保留默认小数精度与左右分置按钮；controlVariant=end 显式末端排列，stacked/hidden/inset 支持不同控制配置。只有显式 locale 才本地化显示，模型仍为数字，空模型为 null。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UNumberInput, USwitch } from '@lingyzh/ui';\nconst number = ref(5);\nconst price = ref(1234.5);\nconst loading = ref(false);\nconst persistentCounter = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UNumberInput\">\n        <u-number-input\n            v-model=\"number\"\n            label=\"执行并发数\"\n            :min=\"1\"\n            :max=\"10\"\n            :step=\"1\"\n            hint=\"按钮与方向键均遵守 1–10 边界。\"\n        />\n        <u-number-input\n            :model-value=\"1234.5\"\n            locale=\"de-DE\"\n            control-variant=\"end\"\n            grouping\n            label=\"末端按钮与本地化小数\"\n        />\n        <u-number-input :model-value=\"5\" control-variant=\"stacked\" inset label=\"上下排列按钮\" />\n        <u-switch v-model=\"loading\" label=\"显示加载状态\" />\n        <u-switch v-model=\"persistentCounter\" label=\"始终显示计数\" />\n        <u-number-input\n            v-model=\"price\"\n            label=\"金额与自定义按钮\"\n            prefix=\"¥\"\n            suffix=\"元\"\n            clearable\n            :loading=\"loading\"\n            counter=\"12\"\n            :persistent-counter=\"persistentCounter\"\n            :step=\"0.5\"\n            :min=\"0\"\n            control-variant=\"end\"\n            data-number-custom-demo\n        >\n            <template #increment=\"{ props }\">\n                <u-button v-bind=\"props\" variant=\"text\">+</u-button>\n            </template>\n            <template #decrement=\"{ props }\">\n                <u-button v-bind=\"props\" variant=\"text\">−</u-button>\n            </template>\n            <template #counter=\"{ counter }\">输入 {{ counter }} 个字符</template>\n        </u-number-input>\n        <output>金额模型：{{ price === null ? 'null' : price }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "保留默认小数精度与左右分置按钮；controlVariant=end 显式末端排列，stacked/hidden/inset 支持不同控制配置。只有显式 locale 才本地化显示，模型仍为数字，空模型为 null。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UFileInput, USwitch } from '@lingyzh/ui';\nconst files = ref([\n    new File(['组件库附件示例'], '组件深度对齐验收记录与交接说明.md', { type: 'text/markdown' }),\n]);\nconst filterFiles = ref(true);\nconst chips = ref(true);\nconst customSelection = ref(false);\nconst hideInput = ref(false);\nconst rejected = ref([]);\nconst details = ref([]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFileInput\">\n        <u-switch v-model=\"filterFiles\" label=\"校验文件类型\" />\n        <u-switch v-model=\"chips\" label=\"用 Chip 显示文件\" />\n        <u-switch v-model=\"customSelection\" label=\"自定义文件摘要\" />\n        <u-switch v-model=\"hideInput\" label=\"隐藏文件字段，保留选择按钮\" />\n        <u-file-input\n            v-model=\"files\"\n            label=\"选择附件\"\n            multiple\n            accept=\".md,.txt,.png\"\n            :filter-by-type=\"filterFiles ? '.md,.txt,.png' : undefined\"\n            show-size=\"1024\"\n            :chips=\"chips\"\n            :hide-input=\"hideInput\"\n            counter\n            :max-size=\"10485760\"\n            hint=\"accept 筛选系统对话框；打开类型校验后，拖放和粘贴也会校验。\"\n            @rejected=\"rejected = $event\"\n            @rejected-details=\"details = $event\"\n        >\n            <template v-if=\"customSelection\" #selection=\"{ fileNames, totalBytesReadable }\">\n                {{ fileNames.join('、') }} · 合计 {{ totalBytesReadable }}\n            </template>\n            <template #counter=\"{ value, totalBytesReadable }\">\n                已选 {{ value }} 项 · {{ totalBytesReadable }}\n            </template>\n        </u-file-input>\n        <output>\n            模型 {{ files?.length ?? 0 }} 项；拒绝 {{ rejected.length }} 项{{\n                details.length\n                    ? '：' +\n                      details.map((item) => item.file.name + '（' + item.reason + '）').join('、')\n                    : ''\n            }}\n        </output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UFileUpload, USwitch } from '@lingyzh/ui';\nconst upload = ref(null);\nconst single = ref(new File(['单文件示例'], '交接说明.txt', { type: 'text/plain' }));\nconst inset = ref(false);\nconst showSize = ref(true);\nconst clearable = ref(true);\nconst loading = ref(false);\nconst rejected = ref([]);\nconst details = ref([]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UFileUpload\">\n        <u-switch v-model=\"inset\" label=\"文件列表内嵌\" />\n        <u-switch v-model=\"showSize\" label=\"显示文件大小\" />\n        <u-switch v-model=\"clearable\" label=\"显示移除按钮\" />\n        <u-switch v-model=\"loading\" label=\"显示加载状态\" />\n        <u-file-upload\n            v-model=\"upload\"\n            label=\"拖放附件\"\n            multiple\n            accept=\".md,.txt,.png\"\n            filter-by-type=\".md,.txt,.png\"\n            :max-size=\"10485760\"\n            :inset-file-list=\"inset\"\n            :show-size=\"showSize\"\n            :clearable=\"clearable\"\n            :loading=\"loading\"\n            subtitle=\"Markdown、文本或图片，单文件最多 10 MB\"\n            hint=\"支持拖放、粘贴与删除；空模型为 null，选择后为 File 数组。\"\n            @rejected=\"rejected = $event\"\n            @rejected-details=\"details = $event\"\n        >\n            <template #browse=\"{ props }\">\n                <u-button v-bind=\"props\" variant=\"tonal\">浏览附件</u-button>\n            </template>\n        </u-file-upload>\n        <u-file-upload\n            v-model=\"single\"\n            label=\"单文件和自定义条目\"\n            :clearable=\"clearable\"\n            :show-size=\"showSize\"\n            inset-file-list\n        >\n            <template #single=\"{ file, props }\">\n                <span>{{ file.name }}</span>\n                <u-button v-if=\"clearable\" v-bind=\"props\" variant=\"text\" aria-label=\"移除单文件\">\n                    移除\n                </u-button>\n            </template>\n        </u-file-upload>\n        <output>\n            多文件：{{ upload === null ? 'null' : upload.length + ' 项' }}；单文件：{{\n                single?.name ?? 'null'\n            }}\n        </output>\n        <output>\n            拒绝 {{ rejected.length }} 项{{\n                details.length\n                    ? '：' +\n                      details.map((item) => item.file.name + '（' + item.reason + '）').join('、')\n                    : ''\n            }}\n        </output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "description": "默认 step=0 允许连续小数；显式正 step 才限制步长。鼠标拖动不显示焦点外框，Tab 和方向键保留键盘提示。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { USlider } from '@lingyzh/ui';\nconst progress = ref(35.125);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USlider\">\n        <u-slider\n            v-model=\"progress\"\n            label=\"连续进度\"\n            thumb-label\n            hint=\"默认连续小数；显式 step 限制步长。\"\n        />\n        <output>{{ progress }}</output>\n        <u-slider :model-value=\"40\" :step=\"10\" show-ticks label=\"按 10 步进\" />\n        <div class=\"demo-row\">\n            <u-slider\n                :model-value=\"35\"\n                direction=\"vertical\"\n                :ticks=\"{ 0: '0', 50: '50', 100: '100' }\"\n                show-ticks\n                thumb-label=\"always\"\n                label=\"纵向\"\n            />\n            <u-slider\n                :model-value=\"35\"\n                direction=\"vertical\"\n                reverse\n                thumb-label=\"always\"\n                label=\"纵向反转\"\n            />\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "默认 step=0 允许连续小数；显式正 step 才限制步长。鼠标拖动不显示焦点外框，Tab 和方向键保留键盘提示。"
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
                "description": "默认空值 [0,0]、step=0 连续小数；清空时按 [min,min] 展示。手柄不可互相越过，Tab 分别进入两个手柄。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URangeSlider } from '@lingyzh/ui';\nconst range = ref([20.125, 70.875]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"URangeSlider\">\n        <u-range-slider\n            v-model=\"range\"\n            label=\"连续小数范围\"\n            hint=\"默认步长为 0，两个手柄不能越过彼此。\"\n        />\n        <output>{{ range }}</output>\n        <u-range-slider\n            :model-value=\"[25, 75]\"\n            direction=\"vertical\"\n            :ticks=\"{ 0: '0', 50: '50', 100: '100' }\"\n            show-ticks\n            thumb-label=\"always\"\n            label=\"纵向范围\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "默认空值 [0,0]、step=0 连续小数；清空时按 [min,min] 展示。手柄不可互相越过，Tab 分别进入两个手柄。"
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
                "description": "默认允许字母和数字，未设置模型为 undefined；numeric 显式限制数字。聚焦外框平滑淡入淡出，减少动效设置关闭过渡。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UOtpInput } from '@lingyzh/ui';\nconst otp = ref();\nconst numericOtp = ref();\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UOtpInput\">\n        <u-otp-input\n            v-model=\"otp\"\n            label=\"六位字母或数字\"\n            :length=\"6\"\n            hint=\"默认允许字母；聚焦外框平滑淡入，失焦淡出。支持粘贴、方向键和退格。\"\n        />\n        <output>当前值：{{ otp ?? '未设置' }}</output>\n        <u-otp-input v-model=\"numericOtp\" numeric label=\"仅数字验证码\" :length=\"4\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "默认允许字母和数字，未设置模型为 undefined；numeric 显式限制数字。聚焦外框平滑淡入淡出，减少动效设置关闭过渡。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UColorInput } from '@lingyzh/ui';\nconst color = ref('#bd6749');\nconst translucent = ref({ r: 189, g: 103, b: 73, a: 0.45 });\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UColorInput\">\n        <u-color-input\n            v-model=\"color\"\n            label=\"标记颜色\"\n            hint=\"点击色块打开组件库面板，确认后提交，取消保留原颜色。\"\n        />\n        <u-color-input\n            v-model=\"translucent\"\n            label=\"透明色对象\"\n            :picker-props=\"{ mode: 'rgba', hideCanvas: false }\"\n            open-on-focus\n        />\n        <u-color-input v-model=\"color\" label=\"即时更新\" hide-actions pip-location=\"append-inner\" />\n        <u-color-input v-model=\"color\" label=\"系统选择器扩展\" native-picker />\n        <output>{{ translucent }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "description": "保留默认黑色、HSV 滑块与 hex 输入。显式 hideCanvas=false 开启饱和度/明度二维面板，mode 切换 hex/hexa/rgb/rgba/hsl/hsla；对象模型保留颜色通道类型与透明度。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UColorPicker } from '@lingyzh/ui';\nconst color = ref('#bd6749');\nconst rgba = ref({ r: 189, g: 103, b: 73, a: 0.65 });\nconst mode = ref('rgba');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UColorPicker\">\n        <u-color-picker\n            v-model=\"color\"\n            label=\"颜色编辑器\"\n            :swatches=\"['#bd6749', '#679775', '#627ca0', '#8b739e']\"\n        />\n        <output>{{ color }}</output>\n        <u-color-picker\n            v-model=\"rgba\"\n            v-model:mode=\"mode\"\n            :hide-canvas=\"false\"\n            :width=\"360\"\n            label=\"二维面板与透明度\"\n            :swatches=\"[\n                ['#bd674980', '#679775'],\n                ['#627ca0', '#8b739e80'],\n            ]\"\n        />\n        <output>{{ mode }} · {{ rgba }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    grid-template-columns: minmax(0, 1fr);\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "保留默认黑色、HSV 滑块与 hex 输入。显式 hideCanvas=false 开启饱和度/明度二维面板，mode 切换 hex/hexa/rgb/rgba/hsl/hsla；对象模型保留颜色通道类型与透明度。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URating } from '@lingyzh/ui';\nconst rating = ref(3.5);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"URating\">\n        <u-rating v-model=\"rating\" label=\"完成质量\" half-increments hover clearable />\n        <u-rating :model-value=\"rating\" label=\"只读半星\" half-increments readonly />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "description": "可直接组合URadio，组统一管理模型、name、对象比较、禁用和只读；子Radio仍可独立使用v-model。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { URadioGroup, URadio, USwitch } from '@lingyzh/ui';\nconst radio = ref('a');\nconst disabled = ref(false);\nconst readonly = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"URadioGroup\">\n        <u-switch v-model=\"disabled\" label=\"禁用整组\" />\n        <u-switch v-model=\"readonly\" label=\"整组只读\" />\n        <u-radio-group\n            v-model=\"radio\"\n            :disabled=\"disabled\"\n            :readonly=\"readonly\"\n            label=\"单选组\"\n            hint=\"URadio读取组的模型、名称、禁用和只读状态。\"\n        >\n            <u-radio value=\"a\">默认</u-radio>\n            <u-radio value=\"b\">自定义</u-radio>\n        </u-radio-group>\n        <output>当前选择：{{ radio }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "可直接组合URadio，组统一管理模型、name、对象比较、禁用和只读；子Radio仍可独立使用v-model。"
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
                "description": "selected插槽统一为标准内部ID数组，isSelected/select接收该ID，next/prev跳过禁用项；selectedValues提供公开值。旧按值判断使用isValueSelected，toggle按值切换继续保留。mandatory=true只阻止取消最后一项，force还初始选择首个可用项。保留表单校验、按钮组与标签组扩展。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UItem, UItemGroup, USwitch } from '@lingyzh/ui';\nconst value = ref('a');\nconst multiple = ref(false);\nconst disabled = ref(false);\nconst readonly = ref(false);\nconst events = ref(0);\nfunction changeMultiple(enabled) {\n    value.value = enabled ? [value.value].filter((item) => item !== undefined) : value.value[0];\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UItemGroup\">\n        <div class=\"demo-row\">\n            <u-switch\n                v-model=\"multiple\"\n                label=\"多选，最多两项\"\n                @update:model-value=\"changeMultiple\"\n            />\n            <u-switch v-model=\"disabled\" label=\"禁用\" />\n            <u-switch v-model=\"readonly\" label=\"只读\" />\n        </div>\n        <u-item-group\n            v-model=\"value\"\n            :multiple=\"multiple\"\n            :max=\"2\"\n            :disabled=\"disabled\"\n            :readonly=\"readonly\"\n            mandatory\n            selected-class=\"demo-selected\"\n        >\n            <template #default=\"{ selected, selectedValues, next, prev }\">\n                <u-item value=\"a\" @group:selected=\"events++\">概览</u-item>\n                <u-item value=\"b\" @group:selected=\"events++\">详情</u-item>\n                <u-item value=\"disabled\" disabled>禁用项</u-item>\n                <u-item value=\"c\" @group:selected=\"events++\">设置</u-item>\n                <div class=\"item-navigation\">\n                    <u-button :disabled=\"disabled || readonly\" @click=\"prev\">上一项</u-button>\n                    <u-button :disabled=\"disabled || readonly\" @click=\"next\">下一项</u-button>\n                    <output>\n                        选中 {{ selected.length }} 项：{{ JSON.stringify(selectedValues) }}\n                    </output>\n                </div>\n            </template>\n        </u-item-group>\n        <output>当前值：{{ JSON.stringify(value) }}；选择状态变化 {{ events }} 次。</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.demo-row,\n.item-navigation {\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    gap: 12px;\n}\n.item-navigation {\n    flex-basis: 100%;\n    padding-top: 12px;\n}\noutput {\n    color: var(--muted);\n    font-size: 14px;\n    overflow-wrap: anywhere;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "selected插槽统一为标准内部ID数组，isSelected/select接收该ID，next/prev跳过禁用项；selectedValues提供公开值。旧按值判断使用isValueSelected，toggle按值切换继续保留。mandatory=true只阻止取消最后一项，force还初始选择首个可用项。保留表单校验、按钮组与标签组扩展。"
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
                "description": "默认保留本库按钮，tag=false可只输出标准作用域插槽；提供isSelected/selectedClass/value/disabled/select/toggle和扩展id，旧selected布尔仍保留。value省略按当前组索引，group:selected携带{value:boolean}。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UItem, UItemGroup } from '@lingyzh/ui';\nconst value = ref('a');\nconst events = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UItem\">\n        <u-item-group v-model=\"value\" selected-class=\"demo-selected\" mandatory>\n            <u-item value=\"a\" @group:selected=\"events++\">保留默认按钮</u-item>\n            <u-item\n                v-slot=\"{ isSelected, selectedClass, disabled, toggle }\"\n                value=\"b\"\n                :tag=\"false\"\n                @group:selected=\"events++\"\n            >\n                <u-button\n                    :class=\"selectedClass\"\n                    :disabled=\"disabled\"\n                    :aria-pressed=\"isSelected\"\n                    :variant=\"isSelected ? 'tonal' : 'outlined'\"\n                    @click=\"toggle\"\n                >\n                    自定义按钮\n                </u-button>\n            </u-item>\n            <u-item v-slot=\"{ value: index }\">未传 value，使用索引 {{ index }}</u-item>\n        </u-item-group>\n        <output>当前值：{{ JSON.stringify(value) }}；选择状态变化 {{ events }} 次。</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\noutput {\n    color: var(--muted);\n    font-size: 14px;\n    overflow-wrap: anywhere;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "默认保留本库按钮，tag=false可只输出标准作用域插槽；提供isSelected/selectedClass/value/disabled/select/toggle和扩展id，旧selected布尔仍保留。value省略按当前组索引，group:selected携带{value:boolean}。"
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
                "description": "默认插槽透传选择项组的八项作用域，selected为内部ID，selectedValues为公开值；公共ref同步暴露selected/selectedValues/isSelected/select/next/prev，并保留原表单方法。真实示例同时使用作用域和ref导航。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UChip, UChipGroup } from '@lingyzh/ui';\nconst selected = ref('a');\nconst group = ref();\nconst scrolling = ref('item-1');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UChipGroup\">\n        <u-chip-group ref=\"group\" v-model=\"selected\" mandatory v-slot=\"{ selectedValues }\">\n            <u-chip value=\"a\">概览</u-chip>\n            <u-chip value=\"b\" closable>详情</u-chip>\n            <output>作用域已选值：{{ selectedValues.join('、') }}</output>\n        </u-chip-group>\n        <div class=\"demo-row\">\n            <u-button variant=\"text\" @click=\"group.prev()\">前一项</u-button>\n            <u-button variant=\"text\" @click=\"group.next()\">后一项</u-button>\n        </div>\n        <output>公开 ref 已选值：{{ group?.selectedValues.join('、') }}</output>\n        <u-chip-group\n            v-model=\"scrolling\"\n            scrollable\n            show-arrows\n            center-active\n            class=\"scroll-example\"\n        >\n            <u-chip v-for=\"index in 12\" :key=\"index\" :value=\"'item-' + index\">\n                滚动条目 {{ index }}\n            </u-chip>\n        </u-chip-group>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.scroll-example {\n    max-width: 360px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "默认插槽透传选择项组的八项作用域，selected为内部ID，selectedValues为公开值；公共ref同步暴露selected/selectedValues/isSelected/select/next/prev，并保留原表单方法。真实示例同时使用作用域和ref导航。"
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
                "description": "默认插槽透传选择项组的八项作用域，selected为内部ID，selectedValues为公开值；公共ref同步暴露selected/selectedValues/isSelected/select/next/prev，并保留原表单方法。值模型、多选、mandatory、max、禁用和只读继续遵循组契约。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBtnToggle, UButton, USwitch } from '@lingyzh/ui';\nconst selected = ref('a');\nconst implicit = ref(0);\nconst group = ref();\nconst multiple = ref(false);\nconst disabled = ref(false);\nconst mandatory = ref(true);\nconst readonly = ref(false);\nfunction changeMultiple(value) {\n    selected.value = value ? [selected.value].filter(Boolean) : selected.value[0];\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBtnToggle\">\n        <div class=\"demo-row\">\n            <u-switch v-model=\"multiple\" label=\"多选\" @update:model-value=\"changeMultiple\" />\n            <u-switch v-model=\"mandatory\" label=\"必须选择\" />\n            <u-switch v-model=\"disabled\" label=\"禁用\" />\n            <u-switch v-model=\"readonly\" label=\"只读\" />\n        </div>\n        <u-btn-toggle\n            ref=\"group\"\n            v-model=\"selected\"\n            :multiple=\"multiple\"\n            :mandatory=\"mandatory\"\n            :disabled=\"disabled\"\n            :readonly=\"readonly\"\n            :max=\"2\"\n            label=\"视图选择\"\n        >\n            <u-button value=\"a\" color=\"primary\">概览</u-button>\n            <u-button value=\"b\" color=\"primary\">详情</u-button>\n            <u-button value=\"c\" color=\"primary\">设置</u-button>\n        </u-btn-toggle>\n        <output>当前：{{ JSON.stringify(selected) }}</output>\n        <div class=\"demo-row\">\n            <u-button variant=\"text\" @click=\"group.prev()\">前一项</u-button>\n            <u-button variant=\"text\" @click=\"group.next()\">后一项</u-button>\n        </div>\n        <output>公开 ref 已选值：{{ JSON.stringify(group?.selectedValues) }}</output>\n        <p>省略 value 时使用组内索引：</p>\n        <u-btn-toggle v-model=\"implicit\" aria-label=\"索引选择\" v-slot=\"{ selectedValues }\">\n            <u-button>索引一</u-button>\n            <u-button>索引二</u-button>\n            <u-button>索引三</u-button>\n            <output>作用域索引：{{ selectedValues.join('、') }}</output>\n        </u-btn-toggle>\n        <output>索引：{{ implicit }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "默认插槽透传选择项组的八项作用域，selected为内部ID，selectedValues为公开值；公共ref同步暴露selected/selectedValues/isSelected/select/next/prev，并保留原表单方法。值模型、多选、mandatory、max、禁用和只读继续遵循组契约。"
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
                "description": "保留active=true和旧default整体替换；新增active控制、color、transition与每条message插槽。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UMessages } from '@lingyzh/ui';\nconst error = ref(false);\nconst active = ref(true);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UMessages\">\n        <u-button size=\"sm\" @click=\"error = !error\">切换错误消息</u-button>\n        <u-button size=\"sm\" @click=\"active = !active\">\n            {{ active ? '隐藏消息' : '显示消息' }}\n        </u-button>\n        <u-messages\n            :active=\"active\"\n            :error=\"error\"\n            :messages=\"error ? ['请检查输入内容。'] : ['配置已保存。']\"\n        >\n            <template #message=\"{ message }\">\n                <strong>{{ message }}</strong>\n            </template>\n        </u-messages>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "保留active=true和旧default整体替换；新增active控制、color、transition与每条message插槽。"
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
                "description": "active默认true，字符串value默认按Unicode码点统计长度，保留本库行为。displayMode=\"value\"直接显示原值；max支持数字和字符串。default插槽提供{counter,max,value}，disabled仅关闭超限着色。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCounter, UTextField } from '@lingyzh/ui';\nconst text = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCounter\">\n        <u-text-field v-model=\"text\" label=\"名称\" />\n        <u-counter :value=\"text\" max=\"20\" />\n        <u-counter value=\"剩余 8 个名额\" display-mode=\"value\" />\n        <u-counter :value=\"text\" max=\"20\">\n            <template #default=\"{ counter, value }\">\n                {{ counter }}（原文：{{ value || '空' }}）\n            </template>\n        </u-counter>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "active默认true，字符串value默认按Unicode码点统计长度，保留本库行为。displayMode=\"value\"直接显示原值；max支持数字和字符串。default插槽提供{counter,max,value}，disabled仅关闭超限着色。"
        ]
    },
    {
        "id": "field",
        "title": "字段表面",
        "name": "UField",
        "kind": "component",
        "group": "表单组件",
        "description": "字段表面的独立用法与交互。",
        "examples": [
            {
                "id": "component-field",
                "title": "字段表面的基本用法",
                "description": "UField现为输入装饰表面：七种variant、内侧图标、clear/loader/label插槽、focused模型和标准default scope。输入值由使用者管理。旧布局组件更名UFormField，UiField仍指向旧实现；description/error/layout/controlAttrs保留为扩展。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UField, USelect, USwitch } from '@lingyzh/ui';\nconst value = ref('');\nconst focused = ref(false);\nconst disabled = ref(false);\nconst variant = ref('outlined');\nconst variants = [\n    'outlined',\n    'filled',\n    'underlined',\n    'plain',\n    'solo',\n    'solo-inverted',\n    'solo-filled',\n];\nfunction clear() {\n    value.value = '';\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UField\">\n        <u-select v-model=\"variant\" :items=\"variants\" label=\"字段变体\" />\n        <u-switch v-model=\"disabled\" label=\"禁用字段\" />\n        <u-field\n            v-model:focused=\"focused\"\n            :variant=\"variant\"\n            :dirty=\"!!value\"\n            :disabled=\"disabled\"\n            label=\"自定义原生输入\"\n            description=\"字段提供装饰、标签、焦点和 ARIA；输入值由页面管理。\"\n            clearable\n            prepend-inner-icon=\"mdi-account-outline\"\n            @click:clear=\"clear\"\n        >\n            <template #default=\"{ props: inputProps }\">\n                <input v-model=\"value\" v-bind=\"inputProps\" :disabled=\"disabled\" />\n            </template>\n        </u-field>\n        <output>当前值：{{ value || '空' }}；焦点：{{ focused ? '有' : '无' }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "UField现为输入装饰表面：七种variant、内侧图标、clear/loader/label插槽、focused模型和标准default scope。输入值由使用者管理。旧布局组件更名UFormField，UiField仍指向旧实现；description/error/layout/controlAttrs保留为扩展。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UMessages, UTextField, UValidation } from '@lingyzh/ui';\nconst custom = ref('');\nconst validation = ref();\nconst lastErrors = ref([]);\nconst required = (value) => !!value || '请填写此项。';\nasync function check() {\n    lastErrors.value = await validation.value.validate();\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UValidation\">\n        <u-validation\n            ref=\"validation\"\n            v-model=\"custom\"\n            :rules=\"[required]\"\n            name=\"custom-validation\"\n            v-slot=\"{ errorMessages, isDirty, isPristine, isValidating, reset, resetValidation }\"\n        >\n            <u-text-field v-model=\"custom\" label=\"自定义内容\" />\n            <u-button @click=\"check\">验证</u-button>\n            <u-button @click=\"reset\">清空并重置</u-button>\n            <u-button @click=\"resetValidation\">重置校验状态</u-button>\n            <u-messages :messages=\"errorMessages\" error />\n            <output>\n                有值：{{ isDirty }} · 初始状态：{{ isPristine }} · 校验中：{{ isValidating }} ·\n                返回错误数：{{ lastErrors.length }}\n            </output>\n        </u-validation>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "description": "按祖先配置链深合并，显式控件属性优先。reset=true回溯一个父配置层，reset数字/字符串指定回溯层数；root=true回溯根配置，root字符串叠加命名根配置。scoped独立配置优先于reset/root，disabled直接透传父配置。本轮按用户选择统一标准规则，不再以reset清空继承。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UDefaultsProvider, USwitch } from '@lingyzh/ui';\nconst reset = ref(false);\nconst root = ref(false);\nconst disabled = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDefaultsProvider\">\n        <u-switch v-model=\"reset\" label=\"reset=true：回溯一个父配置层级\" />\n        <u-switch v-model=\"root\" label=\"root=true：回溯根配置\" />\n        <u-switch v-model=\"disabled\" label=\"禁用最内层配置：直接继承父配置\" />\n        <u-defaults-provider\n            :defaults=\"{ UButton: { size: 30, color: 'primary', variant: 'outlined' } }\"\n        >\n            <u-button>外层默认：30px</u-button>\n            <u-defaults-provider :defaults=\"{ UButton: { size: 38, color: 'success' } }\">\n                <u-button>父层默认：38px</u-button>\n                <u-defaults-provider\n                    :defaults=\"{ UButton: { size: 46, color: 'warning' } }\"\n                    :reset=\"reset\"\n                    :root=\"root\"\n                    :disabled=\"disabled\"\n                >\n                    <u-button>切换开关观察最内层尺寸与颜色</u-button>\n                </u-defaults-provider>\n            </u-defaults-provider>\n        </u-defaults-provider>\n        <output>reset 回溯父层；root 返回应用根配置；disabled 直接继承父层。</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "按祖先配置链深合并，显式控件属性优先。reset=true回溯一个父配置层，reset数字/字符串指定回溯层数；root=true回溯根配置，root字符串叠加命名根配置。scoped独立配置优先于reset/root，disabled直接透传父配置。本轮按用户选择统一标准规则，不再以reset清空继承。"
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
                "description": "子语言容器继承祖先自定义文案、fallback和RTL；支持旧fallback及新fallbackLocale（旧属性显式值优先）。messages可使用原扁平键或嵌套字符串字典，扁平同名键优先，支持$vuetify命名空间路径。分页内置名称与快捷键文案已实际消费最近作用域，语言切换不改变全局其它控件。",
                "fullSource": true,
                "code": "<script setup>\nimport { defineComponent, h, ref } from 'vue';\nimport { UHotkey, ULocaleProvider, UPagination, USwitch, useLocale } from '@lingyzh/ui';\nconst page = ref(2);\nconst english = ref(true);\nconst rtl = ref(false);\nconst messages = {\n    en: {\n        demo: { greeting: 'Hello {name}', inherited: 'Inherited from the outer provider' },\n        hotkey: { save: 'Save' },\n    },\n    zh: {\n        demo: { greeting: '你好，{name}', inherited: '继承外层的自定义文案' },\n        hotkey: { save: '保存' },\n    },\n};\nconst keyMap = { save: { default: { text: '$vuetify.hotkey.save' } } };\nconst MessagePreview = defineComponent({\n    setup() {\n        const locale = useLocale();\n        return () =>\n            h(\n                'output',\n                { class: 'locale-message-preview' },\n                `${locale.t('demo.greeting', { name: 'Ling' })} · ${locale.t('demo.inherited')} · ${locale.n(1234.5)}`\n            );\n    },\n});\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULocaleProvider\">\n        <u-switch v-model=\"english\" label=\"英文语言范围\" />\n        <u-switch v-model=\"rtl\" label=\"从右向左排列\" />\n        <u-locale-provider\n            :locale=\"english ? 'en' : 'zh'\"\n            :messages=\"messages\"\n            :rtl=\"{ en: rtl, zh: rtl }\"\n            fallback-locale=\"en\"\n        >\n            <MessagePreview />\n            <u-pagination v-model=\"page\" :length=\"5\" />\n            <u-hotkey keys=\"save/enter-g\" display-mode=\"text\" :key-map=\"keyMap\" :listen=\"false\" />\n            <u-locale-provider\n                :messages=\"{ en: { 'demo.greeting': 'Child says hello to {name}' } }\"\n                tag=\"section\"\n            >\n                <MessagePreview />\n            </u-locale-provider>\n        </u-locale-provider>\n        <output>当前页：{{ page }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.component-demo :deep(.locale-message-preview) {\n    display: block;\n    margin-block: 12px;\n    color: var(--muted);\n    font-size: 14px;\n    overflow-wrap: anywhere;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "子语言容器继承祖先自定义文案、fallback和RTL；支持旧fallback及新fallbackLocale（旧属性显式值优先）。messages可使用原扁平键或嵌套字符串字典，扁平同名键优先，支持$vuetify命名空间路径。分页内置名称与快捷键文案已实际消费最近作用域，语言切换不改变全局其它控件。"
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
                "description": "继承应用栏布局偏移，tag 与六项尺寸实际消费；scrollable 开启独立正文滚动，不改变外层布局。",
                "fullSource": true,
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UMain\">\n        <div class=\"completion-layout\">\n            <u-app>\n                <u-app-bar :height=\"48\">\n                    <u-app-bar-title>应用顶栏</u-app-bar-title>\n                </u-app-bar>\n                <u-main tag=\"section\" scrollable :height=\"260\" :min-height=\"0\">\n                    <p v-for=\"index in 12\" :key=\"index\" class=\"pa-4\">\n                        第 {{ index }} 行：主要内容自动避开已注册的栏，正文独立滚动。\n                    </p>\n                </u-main>\n            </u-app>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "继承应用栏布局偏移，tag 与六项尺寸实际消费；scrollable 开启独立正文滚动，不改变外层布局。"
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
                "code": "<script setup>\nimport { UApp, UAppBar, UAppBarTitle, UButton, UMain } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UAppBar\">\n        <div class=\"completion-layout\">\n            <u-app>\n                <u-app-bar :height=\"48\">\n                    <u-app-bar-title>应用顶栏</u-app-bar-title>\n                    <template #actions>\n                        <u-button variant=\"text\">操作</u-button>\n                    </template>\n                    <template #extension>\n                        <u-app-bar-title text=\"可复用扩展区\" />\n                    </template>\n                </u-app-bar>\n                <u-main>\n                    <p class=\"pa-4\">主要内容自动避开已注册的栏。</p>\n                </u-main>\n            </u-app>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-layout {\n    position: relative;\n    height: 260px;\n    overflow: clip;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    transform: translateZ(0);\n}\n.completion-layout :deep(.ui-app),\n.completion-layout :deep(.ui-layout),\n.completion-layout :deep(.ui-main) {\n    min-height: 260px;\n}\n</style>\n"
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
                "description": "navigationStrategy=\"track\" 时根节点为唯一键盘入口，aria-activedescendant 指向可见可用行；默认 focus 保留逐行焦点。对象值由 valueComparator 比较，activeStrategy 默认 single-independent，multiple 只控制选择。item 插槽直接替换整行，绑定作用域 props；title 插槽只替换标题。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UList, UListItem } from '@lingyzh/ui';\nconst selected = ref(['overview']);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UList\">\n        <u-list v-model=\"selected\" selectable>\n            <u-list-item value=\"overview\" title=\"概览\" subtitle=\"项目运行状况\" />\n            <u-list-item value=\"settings\" title=\"设置\" />\n            <u-list-item value=\"disabled\" title=\"归档\" disabled />\n        </u-list>\n        <output>已选：{{ selected }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "navigationStrategy=\"track\" 时根节点为唯一键盘入口，aria-activedescendant 指向可见可用行；默认 focus 保留逐行焦点。对象值由 valueComparator 比较，activeStrategy 默认 single-independent，multiple 只控制选择。item 插槽直接替换整行，绑定作用域 props；title 插槽只替换标题。"
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
                "description": "appendIcon沿用Vuetify列表项的右侧图标入口；appendText是本库额外的辅助文本能力，空间不足时优先省略并保留完整title提示。append插槽优先替换两者。nav列表内href保持原生链接和aria-current，方向键/Home/End移动焦点，Enter/Space激活。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UCheckbox, UList, UListItem, USwitch } from '@lingyzh/ui';\nconst selected = ref('overview');\nconst ripple = ref(true);\nconst appendCount = ref(0);\nconst notifications = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListItem\">\n        <u-switch v-model=\"ripple\" label=\"启用列表项涟漪\" />\n        <u-list v-model=\"selected\">\n            <u-list-item\n                :ripple=\"ripple\"\n                value=\"overview\"\n                title=\"概览\"\n                subtitle=\"快速点击后反馈仍完整淡出\"\n            />\n            <u-list-item :ripple=\"ripple\" value=\"settings\" title=\"设置\">\n                <template #append>\n                    <u-button size=\"sm\" variant=\"text\" @click=\"appendCount++\">独立操作</u-button>\n                </template>\n            </u-list-item>\n            <u-list-item :ripple=\"ripple\" value=\"quiet-action\" title=\"带无涟漪按钮的列表项\">\n                <template #append>\n                    <u-button size=\"sm\" variant=\"text\" :ripple=\"false\" @click=\"appendCount++\">\n                        无涟漪操作\n                    </u-button>\n                </template>\n            </u-list-item>\n            <u-list-item :ripple=\"ripple\" value=\"notifications\" title=\"列表内选择控件\">\n                <template #append>\n                    <u-checkbox v-model=\"notifications\" :ripple=\"ripple\">通知</u-checkbox>\n                </template>\n            </u-list-item>\n            <u-list-item :ripple=\"false\" value=\"quiet\" title=\"此项关闭涟漪\" />\n            <u-list-item\n                :ripple=\"ripple && { center: true, color: 'var(--accent-text)' }\"\n                value=\"center\"\n                title=\"居中主题色反馈\"\n            />\n            <u-list-item value=\"disabled\" title=\"归档\" disabled />\n        </u-list>\n        <output>已选：{{ selected }} · 独立操作：{{ appendCount }} 次</output>\n        <div class=\"demo-append-list\">\n            <u-list nav :selectable=\"false\" aria-label=\"右侧内容与长名称示例\">\n                <u-list-item title=\"栅格与布局规范\" href=\"#/grid\" append-icon=\"arrowRight\" active />\n                <u-list-item\n                    title=\"路径分隔符\"\n                    href=\"#/breadcrumbs-divider\"\n                    append-text=\"UBreadcrumbsDivider\"\n                />\n                <u-list-item title=\"通知设置\" append-text=\"已开启\" append-icon=\"mdi-check\" />\n                <u-list-item title=\"自定义操作\" append-text=\"被插槽替换\" append-icon=\"mdi-check\">\n                    <template #append>\n                        <u-button size=\"sm\" variant=\"text\" @click=\"appendCount++\">操作</u-button>\n                    </template>\n                </u-list-item>\n            </u-list>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.demo-append-list {\n    width: 238px;\n    max-width: 100%;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "appendIcon沿用Vuetify列表项的右侧图标入口；appendText是本库额外的辅助文本能力，空间不足时优先省略并保留完整title提示。append插槽优先替换两者。nav列表内href保持原生链接和aria-current，方向键/Home/End移动焦点，Enter/Space激活。"
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
                "description": "activator 提供 props 和 isOpen；根 disabled/readonly 影响展开与操作。公开 open/select 可以传明确布尔值与原始事件，路径使用业务值。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UIcon, UList, UListGroup, UListItem, UTextField } from '@lingyzh/ui';\nconst opened = ref([]);\nconst name = ref('工作区');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UListGroup\">\n        <div class=\"demo-row\">\n            <u-button size=\"sm\" @click=\"opened = ['settings', 'advanced']\">展开全部</u-button>\n            <u-button size=\"sm\" @click=\"opened = []\">收起全部</u-button>\n        </div>\n        <u-list v-model:opened=\"opened\">\n            <u-list-group value=\"settings\" title=\"配置\">\n                <u-list-item value=\"models\" title=\"模型配置\" />\n                <u-list-item value=\"permissions\" title=\"权限配置\" />\n                <u-text-field v-model=\"name\" label=\"分组内名称\" hint=\"收起再展开，输入内容保持。\" />\n                <u-list-group value=\"advanced\" title=\"高级配置\">\n                    <u-list-item title=\"日志与诊断\" />\n                </u-list-group>\n            </u-list-group>\n            <u-list-group value=\"custom\">\n                <template #activator=\"{ props }\">\n                    <u-button v-bind=\"props\" variant=\"text\">\n                        自定义分组触发器\n                        <u-icon\n                            name=\"mdi-chevron-down\"\n                            class=\"ui-disclosure-icon is-down\"\n                            :class=\"{ 'is-open': props['aria-expanded'] }\"\n                        />\n                    </u-button>\n                </template>\n                <u-list-item title=\"自定义分组内容\" />\n            </u-list-group>\n            <u-list-group value=\"disabled\" title=\"禁用分组\" disabled>\n                <u-list-item title=\"不可展开\" />\n            </u-list-group>\n        </u-list>\n        <output>展开项：{{ opened.join('、') || '无' }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "activator 提供 props 和 isOpen；根 disabled/readonly 影响展开与操作。公开 open/select 可以传明确布尔值与原始事件，路径使用业务值。"
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
                "description": "items 可省略；默认按渲染节点注册（itemsRegistration=\"render\"），\"props\" 使用完整树。activeStrategy 默认 single-independent，重复激活可取消；默认显示最近语言的无数据文案，hideNoData 可关闭。筛选支持模式、按键回调、重音和 noFilter，模型在收起或筛选时保持。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTreeview } from '@lingyzh/ui';\nconst tree = ref([]);\nconst opened = ref(['components']);\nconst nodes = [\n    {\n        title: '组件库',\n        value: 'components',\n        children: [\n            {\n                title: '表单控件',\n                value: 'forms',\n                children: [\n                    { title: '输入与选择', value: 'inputs' },\n                    { title: '验证与提交', value: 'validation' },\n                ],\n            },\n            { title: '布局组件', value: 'layout' },\n            {\n                title: '归档组件',\n                value: 'archive',\n                disabled: true,\n                children: [{ title: '历史组件', value: 'history' }],\n            },\n        ],\n    },\n    { title: '文档与示例', value: 'docs' },\n];\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTreeview\">\n        <u-treeview v-model=\"tree\" v-model:opened=\"opened\" :items=\"nodes\" selectable />\n        <output>选中的叶节点：{{ tree }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "items 可省略；默认按渲染节点注册（itemsRegistration=\"render\"），\"props\" 使用完整树。activeStrategy 默认 single-independent，重复激活可取消；默认显示最近语言的无数据文案，hideNoData 可关闭。筛选支持模式、按键回调、重音和 noFilter，模型在收起或筛选时保持。"
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
                "description": "有默认内容插槽时默认显示内容，loading=true 才显示骨架；无默认内容插槽时始终显示骨架。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UCard, USkeletonLoader } from '@lingyzh/ui';\nconst loading = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"USkeletonLoader\">\n        <u-skeleton-loader type=\"avatar\" />\n        <u-skeleton-loader :lines=\"3\" />\n        <u-button @click=\"loading = !loading\">{{ loading ? '显示内容' : '显示骨架' }}</u-button>\n        <u-skeleton-loader type=\"card\" :loading=\"loading\">\n            <u-card title=\"内容已就绪\" text=\"有默认插槽时直接显示内容；显式 loading 才显示骨架。\" />\n        </u-skeleton-loader>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "有默认内容插槽时默认显示内容，loading=true 才显示骨架；无默认内容插槽时始终显示骨架。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBottomNavigation, UButton, UIcon, USwitch } from '@lingyzh/ui';\nconst bottom = ref('overview');\nconst active = ref(true);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBottomNavigation\">\n        <u-switch v-model=\"active\" label=\"显示底部导航\" />\n        <u-bottom-navigation\n            v-model=\"bottom\"\n            v-model:active=\"active\"\n            mandatory\n            grow\n            mode=\"horizontal\"\n        >\n            <template #default=\"{ selected }\">\n                <u-button\n                    v-for=\"value in ['overview', 'search', 'settings']\"\n                    :key=\"value\"\n                    :value=\"value\"\n                    variant=\"text\"\n                    :aria-current=\"selected === value ? 'page' : undefined\"\n                >\n                    <u-icon\n                        :icon=\"\n                            {\n                                overview: 'mdi-home-outline',\n                                search: 'mdi-magnify',\n                                settings: 'mdi-cog-outline',\n                            }[value]\n                        \"\n                        :size=\"18\"\n                    />\n                    <span>{{ { overview: '概览', search: '搜索', settings: '设置' }[value] }}</span>\n                </u-button>\n            </template>\n        </u-bottom-navigation>\n        <output>当前：{{ bottom }}；选择由真实按钮自动注册和分组管理。</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UBottomSheet, UButton, USwitch } from '@lingyzh/ui';\nconst open = ref(false);\nconst inset = ref(false);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UBottomSheet\">\n        <u-button @click=\"open = true\">打开底部面板</u-button>\n        <u-switch v-model=\"inset\" label=\"保留面板外边距\" />\n        <u-bottom-sheet\n            v-model=\"open\"\n            :inset=\"inset\"\n            :max-width=\"680\"\n            :max-height=\"400\"\n            v-slot=\"{ close }\"\n        >\n            <h3>底部操作面板</h3>\n            <p>适合移动设备上的次要操作。关闭后卸载内容，eager 可保留。</p>\n            <u-button @click=\"close\">完成</u-button>\n        </u-bottom-sheet>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "description": "默认普通DOM浮层，支持attach/contained/absolute及zIndex；默认非模态，captureFocus/retainFocus=false，scrollStrategy=none。retainFocus=true显式限制焦点；scrim支持布尔/颜色，opacity控制遮罩透明度。内容懒挂载，关闭动画完成后卸载，eager=true保留；default/activator的isActive为Ref。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UOverlay } from '@lingyzh/ui';\nconst open = ref(false);\nfunction reopen() {\n    open.value = false;\n    requestAnimationFrame(() => {\n        open.value = true;\n    });\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UOverlay\">\n        <u-button @click=\"open = true\">打开浮层</u-button>\n        <u-overlay v-model=\"open\" :width=\"360\" v-slot=\"{ close }\">\n            <h3>通用浮层</h3>\n            <p>\n                默认允许焦点离开，不锁定页面滚动。Escape 或点击外部关闭；retain-focus\n                可显式限制焦点。\n            </p>\n            <div class=\"demo-row\">\n                <u-button @click=\"close\">关闭</u-button>\n                <u-button variant=\"text\" @click=\"reopen\">快速重开</u-button>\n            </div>\n        </u-overlay>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "默认普通DOM浮层，支持attach/contained/absolute及zIndex；默认非模态，captureFocus/retainFocus=false，scrollStrategy=none。retainFocus=true显式限制焦点；scrim支持布尔/颜色，opacity控制遮罩透明度。内容懒挂载，关闭动画完成后卸载，eager=true保留；default/activator的isActive为Ref。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UDataTable, UTextField } from '@lingyzh/ui';\nconst headers = [\n    { key: 'title', title: '工作区', sortable: true },\n    { key: 'category', title: '分类', sortable: true },\n    { key: 'count', title: '任务数', sortable: true, align: 'end' },\n];\nconst items = Array.from({ length: 60 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: index % 2 ? '设计' : '开发',\n    count: (index * 7) % 31,\n}));\nconst search = ref('');\nconst selected = ref([]);\nconst expanded = ref([]);\nconst groups = ref([]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDataTable\">\n        <u-text-field\n            v-model=\"search\"\n            aria-label=\"搜索工作区\"\n            placeholder=\"搜索工作区或分类\"\n            dense\n        />\n        <u-button\n            size=\"sm\"\n            @click=\"groups = groups.length ? [] : [{ key: 'category', order: 'asc' }]\"\n        >\n            切换分组\n        </u-button>\n        <u-data-table\n            v-model=\"selected\"\n            v-model:expanded=\"expanded\"\n            v-model:group-by=\"groups\"\n            :headers=\"headers\"\n            :items=\"items\"\n            :search=\"search\"\n            show-select\n            show-expand\n            multi-sort\n            open-all\n            :mobile=\"false\"\n            label=\"工作区列表\"\n        >\n            <template #expanded-row=\"{ item }\">\n                <strong>{{ item.title }}</strong>\n                <p>{{ item.category }} · 详情内容随高度平滑展开、收起。</p>\n            </template>\n        </u-data-table>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDataTableVirtual } from '@lingyzh/ui';\nconst headers = [\n    { key: 'title', title: '工作区', sortable: true },\n    { key: 'category', title: '分类', sortable: true },\n    { key: 'count', title: '任务数', sortable: true, align: 'end' },\n];\nconst items = Array.from({ length: 60 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: index % 2 ? '设计' : '开发',\n    count: (index * 7) % 31,\n}));\nconst largeItems = Array.from({ length: 10000 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: '开发',\n    count: index,\n}));\nconst search = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDataTableVirtual\">\n        <u-data-table-virtual\n            :headers=\"headers\"\n            :items=\"largeItems\"\n            :search=\"search\"\n            :height=\"260\"\n            :mobile=\"false\"\n            label=\"虚拟工作区列表\"\n        />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "description": "默认每页10，items插槽仍给原始项并保持原渲染方式；standardProtocol=true使用包装项、标准容器和分页/选择/展开/分组作用域。itemsLength仅跳过本地切片，过滤和排序仍执行；提供options与currentItems事件。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UButton,\n    UCard,\n    UDataIterator,\n    UTextField,\n    USwitch,\n    UCheckbox,\n    UCollapse,\n} from '@lingyzh/ui';\nconst items = Array.from({ length: 60 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: index % 2 ? '设计' : '开发',\n    count: (index * 7) % 31,\n    selectable: index % 7 !== 0,\n}));\nconst page = ref(1);\nconst selected = ref([]);\nconst expanded = ref([]);\nconst standardPage = ref(1);\nconst group = ref(false);\nconst disabled = ref(false);\nconst search = ref('');\nconst options = ref();\nconst currentCount = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDataIterator\">\n        <u-data-iterator\n            v-model:page=\"page\"\n            :items=\"items\"\n            :items-per-page=\"4\"\n            :standard-protocol=\"false\"\n        >\n            <template #default=\"{ items: current, pageCount, nextPage, prevPage }\">\n                <div class=\"completion-grid\">\n                    <u-card\n                        v-for=\"item in current\"\n                        :key=\"item.id\"\n                        :title=\"item.title\"\n                        :subtitle=\"item.category\"\n                    >\n                        {{ item.count }} 个任务\n                    </u-card>\n                </div>\n                <div class=\"completion-toolbar mt-4\">\n                    <u-button :disabled=\"page === 1\" @click=\"prevPage\">上一页</u-button>\n                    <output>{{ page }} / {{ pageCount }}</output>\n                    <u-button :disabled=\"page === pageCount\" @click=\"nextPage\">下一页</u-button>\n                </div>\n            </template>\n        </u-data-iterator>\n        <u-text-field v-model=\"search\" label=\"标准迭代器搜索\" />\n        <u-switch v-model=\"group\" label=\"按类别分组\" />\n        <u-switch v-model=\"disabled\" label=\"禁用选择与分页\" />\n        <u-data-iterator\n            v-model=\"selected\"\n            v-model:page=\"standardPage\"\n            v-model:expanded=\"expanded\"\n            :items=\"items\"\n            :search=\"search\"\n            :items-per-page=\"4\"\n            :group-by=\"group ? [{ key: 'category', order: 'asc' }] : []\"\n            :disabled=\"disabled\"\n            item-selectable=\"selectable\"\n            open-all\n            standard-protocol\n            @update:options=\"options = $event\"\n            @update:current-items=\"currentCount = $event.length\"\n        >\n            <template #header=\"{ selectAll, toggleSort, itemsCount }\">\n                <div class=\"iterator-actions\">\n                    <u-button :disabled=\"disabled\" @click=\"selectAll(true)\">选择本页</u-button>\n                    <u-button :disabled=\"disabled\" @click=\"toggleSort('count')\">\n                        按任务数排序\n                    </u-button>\n                    <span>筛选后 {{ itemsCount }} 条</span>\n                </div>\n            </template>\n            <template\n                #default=\"{\n                    groupedItems,\n                    isGroupOpen,\n                    toggleGroup,\n                    isSelected,\n                    toggleSelect,\n                    isExpanded,\n                    toggleExpand,\n                }\"\n            >\n                <div class=\"iterator-rows\">\n                    <template\n                        v-for=\"item in groupedItems\"\n                        :key=\"item.type === 'group' ? item.id : item.key\"\n                    >\n                        <u-button\n                            v-if=\"item.type === 'group'\"\n                            variant=\"text\"\n                            :disabled=\"disabled\"\n                            :aria-expanded=\"isGroupOpen(item)\"\n                            @click=\"toggleGroup(item)\"\n                        >\n                            {{ isGroupOpen(item) ? '收起' : '展开' }} {{ item.value }} 分组\n                        </u-button>\n                        <u-card v-else :title=\"item.raw.title\" :subtitle=\"item.raw.category\">\n                            <div class=\"iterator-actions\">\n                                <u-checkbox\n                                    :model-value=\"isSelected(item)\"\n                                    :disabled=\"disabled || !item.selectable\"\n                                    @update:model-value=\"toggleSelect(item)\"\n                                >\n                                    选择此项\n                                </u-checkbox>\n                                <u-button\n                                    variant=\"text\"\n                                    :disabled=\"disabled\"\n                                    :aria-expanded=\"isExpanded(item)\"\n                                    @click=\"toggleExpand(item)\"\n                                >\n                                    详情\n                                </u-button>\n                            </div>\n                            <u-collapse :open=\"isExpanded(item)\">\n                                <p>\n                                    {{ item.raw.count }} 个任务；标准包装项包含 raw、value 和\n                                    selectable。\n                                </p>\n                            </u-collapse>\n                        </u-card>\n                    </template>\n                </div>\n            </template>\n            <template #no-data>未找到匹配的工作区。</template>\n            <template #footer=\"{ page: currentPage, pageCount, prevPage, nextPage }\">\n                <div class=\"iterator-actions\">\n                    <u-button :disabled=\"disabled || currentPage === 1\" @click=\"prevPage\">\n                        上一页\n                    </u-button>\n                    <output>{{ currentPage }} / {{ pageCount }}</output>\n                    <u-button :disabled=\"disabled || currentPage === pageCount\" @click=\"nextPage\">\n                        下一页\n                    </u-button>\n                </div>\n            </template>\n        </u-data-iterator>\n        <output>\n            已选 {{ selected.length }} 项；当前事件 {{ currentCount }} 行；查询页码\n            {{ options?.page || 1 }}。上方第一个迭代器保留原始项用法。\n        </output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.iterator-actions {\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    gap: 12px;\n    padding-block: 12px;\n}\n.iterator-rows {\n    display: grid;\n    gap: 12px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "默认每页10，items插槽仍给原始项并保持原渲染方式；standardProtocol=true使用包装项、标准容器和分页/选择/展开/分组作用域。itemsLength仅跳过本地切片，过滤和排序仍执行；提供options与currentItems事件。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDateInput } from '@lingyzh/ui';\nconst date = ref(new Date(2026, 9, 6));\nconst range = ref([new Date(2026, 9, 6), new Date(2026, 9, 10)]);\nfunction describe(value) {\n    return (Array.isArray(value) ? value : value ? [value] : [])\n        .map((date) => (date instanceof Date ? date.toLocaleDateString('zh-CN') : date))\n        .join(' - ');\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDateInput\">\n        <u-date-input\n            v-model=\"date\"\n            label=\"开始日期\"\n            input-format=\"yyyy-mm-dd\"\n            hint=\"输入 ISO 日期或打开日历，输出 Date 对象。\"\n        />\n        <u-date-input\n            v-model=\"range\"\n            label=\"需确认的范围草稿\"\n            multiple=\"range\"\n            :hide-actions=\"false\"\n            input-format=\"yyyy-mm-dd\"\n        />\n        <output>Date 模型：{{ describe(date) }}；范围：{{ describe(range) }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UDatePicker, USelect, USwitch } from '@lingyzh/ui';\nconst date = ref(new Date(2026, 9, 6));\nconst range = ref([new Date(2026, 9, 6), new Date(2026, 9, 10)]);\nconst locale = ref('zh-CN');\nconst sunday = ref(false);\nconst yearOnly = ref(false);\nconst weekThreshold = ref('locale');\nfunction describe(value) {\n    return (Array.isArray(value) ? value : value ? [value] : [])\n        .map((date) => (date instanceof Date ? date.toLocaleDateString('zh-CN') : date))\n        .join(' - ');\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UDatePicker\">\n        <u-select\n            v-model=\"locale\"\n            :items=\"['zh-CN', 'zh-HK', 'en-US', 'en-GB']\"\n            label=\"语言地区与周起始日\"\n        />\n        <u-switch v-model=\"sunday\" label=\"显式指定周日开始\" />\n        <u-switch v-model=\"yearOnly\" label=\"标题直接选择年份\" />\n        <u-select\n            v-model=\"weekThreshold\"\n            :items=\"[\n                { value: 'locale', label: '地区默认周号' },\n                { value: '0', label: '周日阈值（0）' },\n                { value: '4', label: '周四阈值（4）' },\n            ]\"\n            label=\"周一年份阈值\"\n        />\n        <u-date-picker\n            v-model=\"date\"\n            :locale=\"locale\"\n            :first-day-of-week=\"sunday ? 0 : undefined\"\n            :first-day-of-year=\"weekThreshold === 'locale' ? undefined : weekThreshold\"\n            :no-month-picker=\"yearOnly\"\n            label=\"默认隐藏相邻日期\"\n            show-week\n            :events=\"['2026-10-06', '2026-10-10']\"\n            event-color=\"var(--accent)\"\n        />\n        <u-date-picker\n            v-model=\"range\"\n            multiple=\"range\"\n            :locale=\"locale\"\n            :first-day-of-week=\"sunday ? 0 : undefined\"\n            label=\"日期范围与悬停预览\"\n            min=\"2026-10-01\"\n            max=\"2026-10-31\"\n            show-adjacent-months\n        />\n        <output>Date 模型：{{ describe(date) }}；范围：{{ describe(range) }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UTimePicker } from '@lingyzh/ui';\nconst time = ref('14:30');\nconst seconds = ref('09:15:20');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UTimePicker\">\n        <u-time-picker\n            v-model=\"time\"\n            label=\"默认 24 小时拨盘\"\n            :allowed-hours=\"(hour) => hour >= 8 && hour <= 20\"\n        />\n        <u-time-picker\n            v-model=\"time\"\n            label=\"12 小时显示，模型仍为 24 小时\"\n            format=\"ampm\"\n            variant=\"select\"\n        />\n        <u-time-picker v-model=\"seconds\" label=\"秒级输入\" use-seconds variant=\"input\" />\n        <output>模型：{{ time }} / {{ seconds }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n</style>\n"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCalendar, USelect, USwitch } from '@lingyzh/ui';\nconst date = ref('2026-10-06');\nconst locale = ref('zh-CN');\nconst showWeek = ref(false);\nconst ripple = ref(false);\nconst compactEvents = ref(false);\nconst events = [\n    { id: 1, title: '跨周组件验收', start: '2026-10-06', end: '2026-10-13', allDay: true },\n    {\n        id: 2,\n        title: '设计评审',\n        start: '2026-10-06 09:00',\n        end: '2026-10-06 10:30',\n        timed: true,\n        category: '设计',\n    },\n    {\n        id: 3,\n        title: '开发同步',\n        start: '2026-10-06 09:30',\n        end: '2026-10-06 11:00',\n        timed: true,\n        category: '开发',\n    },\n];\nconst selected = ref('');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCalendar\">\n        <u-select\n            v-model=\"locale\"\n            :items=\"['zh-CN', 'zh-HK', 'en-US', 'en-GB']\"\n            label=\"语言地区与周起始日\"\n        />\n        <div class=\"calendar-demo-settings\">\n            <u-switch v-model=\"showWeek\" label=\"显示地区周号\" />\n            <u-switch v-model=\"ripple\" label=\"事件点击波纹\" />\n            <u-switch v-model=\"compactEvents\" label=\"事件行间距 1px\" />\n        </div>\n        <u-calendar\n            v-model=\"date\"\n            :locale=\"locale\"\n            :events=\"events\"\n            :show-week=\"showWeek\"\n            :event-ripple=\"ripple\"\n            :event-margin-bottom=\"compactEvents ? 1 : 3\"\n            @click:event=\"selected = $event.event.title\"\n        />\n        <u-calendar\n            v-model=\"date\"\n            type=\"day\"\n            :locale=\"locale\"\n            first-time=\"08:00\"\n            :interval-count=\"5\"\n            :events=\"events\"\n            :event-ripple=\"ripple\"\n            :event-margin-bottom=\"compactEvents ? 1 : 3\"\n            @click:event=\"selected = $event.event.title\"\n        />\n        <u-calendar\n            v-model=\"date\"\n            type=\"category\"\n            :locale=\"locale\"\n            :categories=\"['设计', '开发']\"\n            first-time=\"08:00\"\n            :interval-count=\"5\"\n            :events=\"events\"\n            :event-ripple=\"ripple\"\n            :event-margin-bottom=\"compactEvents ? 1 : 3\"\n            @click:event=\"selected = $event.event.title\"\n        />\n        <output>\n            选中事件：{{ selected || '尚未选择' }}；时间视图可滚动，重叠事件保留独立点击区域。\n        </output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.calendar-demo-settings {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 16px;\n}\n</style>\n"
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
                "description": "UPicker现为标题/header/body/actions容器，支持横向布局、分隔线和尺寸。原items/model选项列表能力保留，独立旧实现更名UOptionPicker。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UPicker, UOptionPicker, UButton, USwitch } from '@lingyzh/ui';\nconst value = ref('开发');\nconst landscape = ref(false);\nconst hideHeader = ref(false);\nconst saved = ref('');\nconst items = ['设计', '开发', '文档'];\nfunction save() {\n    saved.value = value.value;\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UPicker\">\n        <u-switch v-model=\"landscape\" label=\"横向布局\" />\n        <u-switch v-model=\"hideHeader\" label=\"隐藏标题区域\" />\n        <u-picker title=\"工作类别\" :landscape=\"landscape\" :hide-header=\"hideHeader\" divided border>\n            <template #header>\n                <strong>{{ value }}</strong>\n            </template>\n            <u-option-picker v-model=\"value\" :items=\"items\" />\n            <template #actions>\n                <u-button @click=\"save\">确认</u-button>\n            </template>\n        </u-picker>\n        <output>已确认：{{ saved || '尚未确认' }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "UPicker现为标题/header/body/actions容器，支持横向布局、分隔线和尺寸。原items/model选项列表能力保留，独立旧实现更名UOptionPicker。"
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
                "description": "编辑内容始终可见；model为深克隆草稿Ref，保存前不修改原模型，取消重置草稿。isPristine表示草稿未变；未设disabled时禁用未变更操作，disabled可按save/cancel分别指定。hideActions或消费actions渲染函数可自定义操作区。readonly、异步validate及begin重置草稿作为本库扩展保留，begin不再控制展开。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UConfirmEdit, UTextField } from '@lingyzh/ui';\nconst settings = ref({ title: '工作区名称', details: { owner: 'Ling' } });\nconst compact = ref('内联确认');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UConfirmEdit\">\n        <u-confirm-edit v-model=\"settings\" v-slot=\"{ model, isPristine }\" ok-text=\"保存\">\n            <u-text-field v-model=\"model.value.title\" label=\"编辑名称\" />\n            <u-text-field v-model=\"model.value.details.owner\" label=\"编辑负责人\" />\n            <output>{{ isPristine ? '草稿与已确认内容一致' : '草稿有待确认修改' }}</output>\n        </u-confirm-edit>\n        <output>已确认：{{ settings.title }} · {{ settings.details.owner }}</output>\n        <u-confirm-edit v-model=\"compact\" v-slot=\"{ model, save, cancel, isPristine }\" hide-actions>\n            <u-text-field v-model=\"model.value\" label=\"自定义操作区\" />\n            <div class=\"u-confirm-actions\">\n                <u-button :disabled=\"isPristine\" variant=\"text\" @click=\"cancel\">恢复</u-button>\n                <u-button :disabled=\"isPristine\" @click=\"save\">确认草稿</u-button>\n            </div>\n        </u-confirm-edit>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "编辑内容始终可见；model为深克隆草稿Ref，保存前不修改原模型，取消重置草稿。isPristine表示草稿未变；未设disabled时禁用未变更操作，disabled可按save/cancel分别指定。hideActions或消费actions渲染函数可自定义操作区。readonly、异步validate及begin重置草稿作为本库扩展保留，begin不再控制展开。"
        ]
    },
    {
        "id": "option-picker",
        "title": "选项选择器（旧 Picker）",
        "name": "UOptionPicker",
        "kind": "component",
        "group": "表单组件",
        "description": "选项选择器（旧 Picker）的独立用法与交互。",
        "examples": [
            {
                "id": "component-option-picker",
                "title": "选项选择器（旧 Picker）的基本用法",
                "description": "原UPicker选项列表实现更名保留；本轮没有安排弃用日期。新UPicker承载Vuetify容器职责，并可选择开启items扩展。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UOptionPicker } from '@lingyzh/ui';\nconst items = Array.from({ length: 60 }, (_, index) => ({\n    id: index,\n    title: `工作区 ${index + 1}`,\n    category: index % 2 ? '设计' : '开发',\n    count: (index * 7) % 31,\n}));\nconst chosen = ref('设计');\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UOptionPicker\">\n        <u-option-picker v-model=\"chosen\" :items=\"['设计', '开发', '文档']\" class=\"mt-4\" />\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "原UPicker选项列表实现更名保留；本轮没有安排弃用日期。新UPicker承载Vuetify容器职责，并可选择开启items扩展。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UExpansionPanel,\n    UExpansionPanelText,\n    UExpansionPanelTitle,\n    UExpansionPanels,\n} from '@lingyzh/ui';\nconst panel = ref('overview');\nconst selectedEvents = ref([]);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UExpansionPanels\">\n        <u-expansion-panels v-model=\"panel\" focusable>\n            <u-expansion-panel value=\"overview\">\n                <u-expansion-panel-title>组件说明</u-expansion-panel-title>\n                <u-expansion-panel-text>点击标题、Enter 或 Space 展开。</u-expansion-panel-text>\n            </u-expansion-panel>\n            <u-expansion-panel value=\"details\" @group:selected=\"selectedEvents.push($event.value)\">\n                <u-expansion-panel-title>更多说明</u-expansion-panel-title>\n                <u-expansion-panel-text>面板间由组统一管理展开状态。</u-expansion-panel-text>\n            </u-expansion-panel>\n        </u-expansion-panels>\n        <u-expansion-panels mandatory=\"force\">\n            <u-expansion-panel\n                title=\"自动索引 0\"\n                text=\"未传 value 时按位置输出；force 自动选择首个可用面板。\"\n            />\n            <u-expansion-panel title=\"自动索引 1\" text=\"默认离场后卸载，eager 可保留内容。\" />\n        </u-expansion-panels>\n        <output>\n            当前：{{ panel ?? '无' }}；第二项状态变化：{{ selectedEvents.join(' → ') || '暂无' }}\n        </output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
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
                "description": "items 自动生成 header/window/actions，手动 default 插槽继续保留。editable 默认严格关闭，显式开启可点击标题；操作文案跟随最近语言。multiple 支持 max，多选窗口按步骤注册顺序显示首项，next/prev 只保留跳转目标。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UStepper,\n    UStepperActions,\n    UStepperItem,\n    UStepperWindow,\n    UStepperWindowItem,\n} from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepper\">\n        <u-stepper v-model=\"step\">\n            <u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable />\n            <u-stepper-item :value=\"2\" title=\"完成\" editable />\n            <u-stepper-window>\n                <u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item>\n                <u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item>\n            </u-stepper-window>\n            <u-stepper-actions />\n        </u-stepper>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "items 自动生成 header/window/actions，手动 default 插槽继续保留。editable 默认严格关闭，显式开启可点击标题；操作文案跟随最近语言。multiple 支持 max，多选窗口按步骤注册顺序显示首项，next/prev 只保留跳转目标。"
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
                "description": "items 自动生成垂直 Item/Actions，逐项展开，规则不通过时阻止继续；最后一步继续会实际发出 click:finish。手动步骤组合保留。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport {\n    UStepperActions,\n    UStepperItem,\n    UStepperVertical,\n    UStepperWindow,\n    UStepperWindowItem,\n} from '@lingyzh/ui';\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperVertical\">\n        <u-stepper-vertical v-model=\"step\">\n            <u-stepper-item :value=\"1\" title=\"填写资料\" :complete=\"step > 1\" editable />\n            <u-stepper-item :value=\"2\" title=\"完成\" editable />\n            <u-stepper-window>\n                <u-stepper-window-item :value=\"1\">填写当前步骤所需的资料。</u-stepper-window-item>\n                <u-stepper-window-item :value=\"2\">资料已准备好。</u-stepper-window-item>\n            </u-stepper-window>\n            <u-stepper-actions />\n        </u-stepper-vertical>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "items 自动生成垂直 Item/Actions，逐项展开，规则不通过时阻止继续；最后一步继续会实际发出 click:finish。手动步骤组合保留。"
        ]
    },
    {
        "id": "stepper-vertical-item",
        "title": "垂直步骤项",
        "name": "UStepperVerticalItem",
        "kind": "component",
        "group": "导航组件",
        "description": "垂直步骤项的独立用法与交互。",
        "examples": [
            {
                "id": "component-stepper-vertical-item",
                "title": "垂直步骤项的基本用法",
                "description": "标题与正文分别替换；状态作用域包含 canEdit/hasError/hasCompleted/active，规则控制继续操作，group:selected 和操作事件透传。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UStepperVertical, UStepperVerticalItem } from '@lingyzh/ui';\n\nconst step = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperVerticalItem\">\n        <UStepperVertical v-model=\"step\">\n            <UStepperVerticalItem :value=\"1\" title=\"准备\" subtitle=\"当前步骤展开正文\" editable>\n                请确认资料后继续。\n            </UStepperVerticalItem>\n            <UStepperVerticalItem :value=\"2\" title=\"完成\" editable>\n                点击下一步会发出完成事件。\n            </UStepperVerticalItem>\n        </UStepperVertical>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "标题与正文分别替换；状态作用域包含 canEdit/hasError/hasCompleted/active，规则控制继续操作，group:selected 和操作事件透传。"
        ]
    },
    {
        "id": "stepper-vertical-actions",
        "title": "垂直步骤操作",
        "name": "UStepperVerticalActions",
        "kind": "component",
        "group": "导航组件",
        "description": "垂直步骤操作的独立用法与交互。",
        "examples": [
            {
                "id": "component-stepper-vertical-actions",
                "title": "垂直步骤操作的基本用法",
                "description": "prev/next 作用域提供可绑定的 props，文案支持最近语言和显式文字；disabled 可分别控制前后按钮，最后一步由 Item 上下文转成真实完成事件。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UStepperVertical, UStepperVerticalItem, UStepperVerticalActions } from '@lingyzh/ui';\n\nconst step = ref(1);\nconst status = ref('尚未完成');\nfunction finished() {\n    status.value = '已完成';\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UStepperVerticalActions\">\n        <UStepperVertical v-model=\"step\" @click:finish=\"finished\">\n            <UStepperVerticalItem :value=\"1\" title=\"当前步骤\" editable>\n                <template #actions>\n                    <UStepperVerticalActions prev-text=\"返回\" next-text=\"完成\" disabled=\"prev\" />\n                </template>\n            </UStepperVerticalItem>\n        </UStepperVertical>\n        <output aria-live=\"polite\">{{ status }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\noutput {\n    color: var(--muted);\n    font-size: var(--ui-font-body-small);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "prev/next 作用域提供可绑定的 props，文案支持最近语言和显式文字；disabled 可分别控制前后按钮，最后一步由 Item 上下文转成真实完成事件。"
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
                "description": "disabled动态变化后，公开next/prev、键盘和触摸均读取最新禁用状态；初始空模型的强制组选择首项。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, USwitch, UWindow, UWindowItem } from '@lingyzh/ui';\nconst windowValue = ref('a');\nconst windowRef = ref();\nconst disabled = ref(false);\nfunction next() {\n    windowRef.value?.next();\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UWindow\">\n        <u-switch v-model=\"disabled\" label=\"禁用窗口交互\" />\n        <u-button size=\"sm\" @click=\"next\">调用下一项</u-button>\n        <u-window\n            ref=\"windowRef\"\n            v-model=\"windowValue\"\n            :disabled=\"disabled\"\n            continuous\n            show-arrows=\"hover\"\n            label=\"内容窗口\"\n            tabindex=\"0\"\n            role=\"region\"\n        >\n            <u-window-item value=\"a\">\n                <div class=\"completion-window-card\">概览面板</div>\n            </u-window-item>\n            <u-window-item value=\"b\">\n                <div class=\"completion-window-card\">详情面板</div>\n            </u-window-item>\n        </u-window>\n        <output>鼠标悬停或键盘聚焦时显示箭头；箭头遵守禁用状态。</output>\n        <output>当前面板：{{ windowValue }}；禁用后下一项、方向键与触摸均保持当前项。</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-window-card {\n    display: grid;\n    place-items: center;\n    min-height: 140px;\n    padding: 20px;\n    background: var(--accent-soft);\n    color: var(--accent-text);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "disabled动态变化后，公开next/prev、键盘和触摸均读取最新禁用状态；初始空模型的强制组选择首项。"
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
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UCarousel, UCarouselItem } from '@lingyzh/ui';\nconst carousel = ref(1);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UCarousel\">\n        <u-carousel\n            v-model=\"carousel\"\n            :cycle=\"false\"\n            :continuous=\"false\"\n            hide-delimiter-background\n            label=\"内容轮播\"\n        >\n            <u-carousel-item v-for=\"value in [1, 2, 3]\" :key=\"value\" :value=\"value\">\n                <div class=\"completion-window-card\">第 {{ value }} 项</div>\n            </u-carousel-item>\n            <template #prev=\"{ props }\">\n                <button type=\"button\" v-bind=\"props\">‹</button>\n            </template>\n            <template #next=\"{ props }\">\n                <button type=\"button\" v-bind=\"props\">›</button>\n            </template>\n        </u-carousel>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-window-card {\n    display: grid;\n    place-items: center;\n    min-height: 140px;\n    padding: 20px;\n    background: var(--accent-soft);\n    color: var(--accent-text);\n}\n</style>\n"
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
                "description": "load/error默认仍给原生Event；standardProtocol=true改给浏览器实际currentSrc URL。支持src对象、srcset/sources、lazySrc、aspectRatio与尺寸、cover/position/gradient；lazy由观察器控制src，进入区域后立即请求，避免原生lazy和隐藏图片互等。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UImg, USwitch } from '@lingyzh/ui';\nconst cover = ref(true);\nconst standardProtocol = ref(false);\nconst events = ref([]);\nfunction loaded(value) {\n    events.value.push(\n        typeof value === 'string' ? 'URL 协议：图片已加载' : '原生 Event 协议：图片已加载'\n    );\n}\nconst image =\n    'data:image/svg+xml,' +\n    encodeURIComponent(\n        '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>'\n    );\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UImg\">\n        <u-switch v-model=\"cover\" label=\"铺满容器（关闭后完整显示图片）\" />\n        <u-switch v-model=\"standardProtocol\" label=\"load/error 使用标准 URL 协议\" />\n        <u-img\n            :key=\"String(standardProtocol)\"\n            :src=\"{ src: image, aspect: 2 }\"\n            alt=\"柔和的山丘图形\"\n            :cover=\"cover\"\n            :standard-protocol=\"standardProtocol\"\n            height=\"220\"\n            position=\"center\"\n            gradient=\"to top, rgb(0 0 0 / .45), transparent\"\n            lazy\n            @load=\"loaded\"\n        >\n            <template #placeholder>正在加载示例图片…</template>\n            <div class=\"image-caption\">支持图片源对象、裁剪、渐变与内容插槽</div>\n        </u-img>\n        <output>{{ events.at(-1) || '等待图片加载' }}</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.image-caption {\n    position: absolute;\n    inset: auto 16px 16px;\n    color: white;\n    font-size: 14px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "load/error默认仍给原生Event；standardProtocol=true改给浏览器实际currentSrc URL。支持src对象、srcset/sources、lazySrc、aspectRatio与尺寸、cover/position/gradient；lazy由观察器控制src，进入区域后立即请求，避免原生lazy和隐藏图片互等。"
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
                "description": "比例支持数字或宽/高字符串，并保留宽高推导；补齐min/max尺寸、contentClass、inline与additional层。数字及数字字符串尺寸均按px，CSS长度原样使用。",
                "fullSource": true,
                "code": "<script setup>\nimport { UResponsive } from '@lingyzh/ui';\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UResponsive\">\n        <u-responsive\n            aspect-ratio=\"2/1\"\n            :min-width=\"120\"\n            max-width=\"640\"\n            content-class=\"ratio-content\"\n        >\n            <template #additional>\n                <span class=\"ratio-label\">additional 标记层</span>\n            </template>\n            <div class=\"completion-window-card\">2 : 1 的内容区域</div>\n        </u-responsive>\n        <u-responsive :width=\"180\" :height=\"90\" inline>\n            <template #default=\"{ ratio }\">\n                <div class=\"completion-window-card is-small\">宽高推导：{{ ratio }} : 1</div>\n            </template>\n        </u-responsive>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-window-card {\n    display: grid;\n    place-items: center;\n    min-height: 140px;\n    padding: 20px;\n    background: var(--accent-soft);\n    color: var(--accent-text);\n}\n.completion-window-card.is-small {\n    min-height: 0;\n    height: 100%;\n    padding: 12px;\n}\n.ratio-label {\n    position: absolute;\n    inset: 8px auto auto 8px;\n    color: var(--muted);\n    font-size: 12px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "比例支持数字或宽/高字符串，并保留宽高推导；补齐min/max尺寸、contentClass、inline与additional层。数字及数字字符串尺寸均按px，CSS长度原样使用。"
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
                "description": "modelValue初始null，鼠标和本库焦点扩展按openDelay/closeDelay同步模型。disabled时保留公开模型并继续记录内部指针状态，恢复后同步最新内部状态；延迟接受数字和数字字符串，卸载清理待执行回调。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UHover, USwitch } from '@lingyzh/ui';\nconst disabled = ref(false);\nconst hovering = ref(null);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UHover\">\n        <u-switch v-model=\"disabled\" label=\"禁用状态同步（仍记录区域内的指针状态）\" />\n        <u-hover v-model=\"hovering\" :disabled=\"disabled\" v-slot=\"{ isHovering, props: hoverProps }\">\n            <div\n                v-bind=\"hoverProps\"\n                class=\"completion-panel\"\n                :style=\"{ background: isHovering ? 'var(--accent-soft)' : 'var(--surface)' }\"\n            >\n                {{ isHovering ? '指针或键盘位于此区域' : '移入或聚焦查看状态' }}\n                <u-button size=\"sm\" class=\"mt-3\">可聚焦的操作</u-button>\n            </div>\n        </u-hover>\n        <output>\n            公开悬停状态：{{\n                hovering === null ? '尚未进入' : hovering ? '已进入' : '已离开'\n            }}；禁用时保留，恢复时同步。\n        </output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.completion-panel {\n    padding: 16px;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "modelValue初始null，鼠标和本库焦点扩展按openDelay/closeDelay同步模型。disabled时保留公开模型并继续记录内部指针状态，恢复后同步最新内部状态；延迟接受数字和数字字符串，卸载清理待执行回调。"
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
                "description": "按platform和displayMode展示组合键，支持keyMap、前后文字与组合/或/顺序分隔；$vuetify文案token、分隔词、title与无障碍名称跟随最近ULocaleProvider。listen仅保留本库原trigger监听，不据展示语法声称序列监听。旧监听组件更名UHotkeyListener，未安排弃用日期。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UHotkey, ULocaleProvider, USelect, USwitch } from '@lingyzh/ui';\nconst mode = ref('symbol');\nconst platform = ref('mac');\nconst disabled = ref(false);\nconst triggered = ref(0);\nconst english = ref(false);\nconst keyMap = { save: { default: { text: '$vuetify.hotkey.save' } } };\nconst messages = { zh: { hotkey: { save: '保存' } }, en: { hotkey: { save: 'Save' } } };\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UHotkey\">\n        <u-select v-model=\"mode\" :items=\"['symbol', 'icon', 'text']\" label=\"快捷键显示方式\" />\n        <u-select v-model=\"platform\" :items=\"['mac', 'pc', 'auto']\" label=\"平台\" />\n        <u-switch v-model=\"disabled\" label=\"禁用快捷键\" />\n        <u-hotkey\n            keys=\"meta+shift+k\"\n            :display-mode=\"mode\"\n            :platform=\"platform\"\n            :disabled=\"disabled\"\n            :listen=\"false\"\n            prefix=\"打开命令面板\"\n        />\n        <u-hotkey\n            keys=\"ctrl+shift+k\"\n            display-mode=\"text\"\n            :disabled=\"disabled\"\n            @trigger=\"triggered++\"\n        />\n        <u-hotkey keys=\"ctrl+k/ctrl+p-g\" display-mode=\"text\" variant=\"contained\" :listen=\"false\" />\n        <u-switch v-model=\"english\" label=\"英文展示范围\" />\n        <u-locale-provider :locale=\"english ? 'en' : 'zh'\" :messages=\"messages\">\n            <u-hotkey keys=\"save/enter-g\" display-mode=\"text\" :key-map=\"keyMap\" :listen=\"false\" />\n        </u-locale-provider>\n        <output>按 Ctrl + Shift + K：已触发 {{ triggered }} 次；平台展示与监听分别配置。</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "按platform和displayMode展示组合键，支持keyMap、前后文字与组合/或/顺序分隔；$vuetify文案token、分隔词、title与无障碍名称跟随最近ULocaleProvider。listen仅保留本库原trigger监听，不据展示语法声称序列监听。旧监听组件更名UHotkeyListener，未安排弃用日期。"
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
                "description": "受控modelValue、options观察参数、tag、六种尺寸和transition；保留rootMargin=100px、once=true、disabled立即显示，以及placeholder与visible作用域。模型重置false可重新观察，once=false支持进出视口卸载。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref, computed } from 'vue';\nimport { UImg, ULazy, UNoSsr, UScrollArea, USwitch, UButton } from '@lingyzh/ui';\nconst visible = ref(false);\nconst once = ref(false);\nconst disabled = ref(false);\nconst scroll = ref();\nconst observed = ref(0);\nconst options = computed(() => ({ root: scroll.value?.element, threshold: 0.2 }));\nconst image =\n    'data:image/svg+xml,' +\n    encodeURIComponent(\n        '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>'\n    );\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"ULazy\">\n        <u-switch v-model=\"once\" label=\"进入后保持挂载\" />\n        <u-switch v-model=\"disabled\" label=\"禁用观察并立即显示\" />\n        <u-scroll-area ref=\"scroll\" height=\"220px\" label=\"懒显示示例滚动区域\" always>\n            <div class=\"lazy-spacer\">向下滚动，让图片进入观察区域。</div>\n            <u-lazy\n                v-model=\"visible\"\n                :once=\"once\"\n                :disabled=\"disabled\"\n                :options=\"options\"\n                root-margin=\"0px\"\n                min-height=\"160\"\n                tag=\"section\"\n                @intersect=\"observed++\"\n            >\n                <u-no-ssr>\n                    <u-img :src=\"image\" alt=\"延迟显示的山丘图形\" height=\"160\" />\n                    <template #placeholder>客户端加载中…</template>\n                </u-no-ssr>\n                <template #placeholder>\n                    <div class=\"lazy-placeholder\">等待进入视口…</div>\n                </template>\n            </u-lazy>\n            <div class=\"lazy-spacer\">向上返回，观察 once=false 时的卸载。</div>\n        </u-scroll-area>\n        <u-button @click=\"visible = false\">重置可见模型</u-button>\n        <output>modelValue：{{ visible }}；进入观察区域 {{ observed }} 次。</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n.lazy-spacer {\n    display: grid;\n    place-items: center;\n    height: 260px;\n    padding: 16px;\n    text-align: center;\n    color: var(--muted);\n}\n.lazy-placeholder {\n    display: grid;\n    place-items: center;\n    height: 160px;\n    background: var(--surface);\n    color: var(--muted);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "受控modelValue、options观察参数、tag、六种尺寸和transition；保留rootMargin=100px、once=true、disabled立即显示，以及placeholder与visible作用域。模型重置false可重新观察，once=false支持进出视口卸载。"
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
                "description": "默认仍使用speed=0.3，支持-1至1（负数反向、0静止）；显式scale改用标准比例与背景缩放。src对象、srcset、lazySrc、图片事件和placeholder/error/sources插槽通过内置UImg实现，load/error给URL。background插槽优先保留自建背景；disabled和减少动效均停止位移。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UImg, UParallax, UScrollArea, USwitch, USlider } from '@lingyzh/ui';\nconst disabled = ref(false);\nconst standard = ref(false);\nconst scale = ref(0.5);\nconst loaded = ref(false);\nconst image =\n    'data:image/svg+xml,' +\n    encodeURIComponent(\n        '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"320\" viewBox=\"0 0 640 320\"><rect width=\"640\" height=\"320\" fill=\"#efe8df\"/><circle cx=\"480\" cy=\"100\" r=\"60\" fill=\"#bd6749\"/><path d=\"M0 320 180 90 360 320Z\" fill=\"#789380\"/><path d=\"M230 320 420 150 640 320Z\" fill=\"#a7b7a5\"/></svg>'\n    );\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UParallax\">\n        <label class=\"parallax-control\">\n            <u-switch v-model=\"disabled\" aria-label=\"关闭视差\" />\n            <span>关闭视差</span>\n        </label>\n        <u-switch v-model=\"standard\" label=\"使用 src 与标准 scale\" />\n        <u-slider\n            v-if=\"standard\"\n            v-model=\"scale\"\n            :min=\"0\"\n            :max=\"1\"\n            :step=\"0.1\"\n            label=\"视差比例 scale\"\n        />\n        <p class=\"parallax-note\">在下方区域滚动：山丘背景与标题以不同速度移动。</p>\n        <u-scroll-area class=\"parallax-demo-scroll\" height=\"360px\" label=\"视差演示滚动区域\" always>\n            <div class=\"parallax-spacer\">向下滚动查看效果</div>\n            <u-parallax\n                class=\"parallax-scene\"\n                :src=\"image\"\n                :scale=\"standard ? scale : undefined\"\n                :speed=\"0.6\"\n                :disabled=\"disabled\"\n                alt=\"背景山丘\"\n                @load=\"loaded = true\"\n            >\n                <template v-if=\"!standard\" #background>\n                    <u-img :src=\"image\" alt=\"背景山丘\" />\n                </template>\n                <template #default=\"{ offset }\">\n                    <div class=\"parallax-caption\">\n                        <strong>山丘随滚动轻轻移动</strong>\n                        <output>背景位移：{{ offset.toFixed(1) }} px</output>\n                        <span v-if=\"standard\">\n                            scale {{ scale }}；图片{{ loaded ? '已加载' : '加载中' }}\n                        </span>\n                    </div>\n                </template>\n            </u-parallax>\n            <div class=\"parallax-spacer is-after\">\n                继续滚动，或向上返回；启用减少动效时背景保持静止。\n            </div>\n        </u-scroll-area>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.parallax-control {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n}\n.parallax-note,\n.parallax-spacer {\n    color: var(--muted);\n    font-size: 14px;\n}\n.parallax-demo-scroll {\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    overflow: hidden;\n}\n.parallax-spacer {\n    display: grid;\n    place-items: center;\n    height: 120px;\n    padding: 24px;\n    text-align: center;\n}\n.parallax-spacer.is-after {\n    height: 300px;\n}\n.parallax-scene {\n    height: 240px;\n}\n.parallax-caption {\n    display: grid;\n    gap: 8px;\n    margin: 20px;\n    padding: 16px 20px;\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    background: var(--surface);\n    text-align: center;\n}\n.parallax-caption output {\n    font: 14px/1.5 var(--mono);\n    color: var(--muted);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "默认仍使用speed=0.3，支持-1至1（负数反向、0静止）；显式scale改用标准比例与背景缩放。src对象、srcset、lazySrc、图片事件和placeholder/error/sources插槽通过内置UImg实现，load/error给URL。background插槽优先保留自建背景；disabled和减少动效均停止位移。"
        ]
    },
    {
        "id": "hotkey-listener",
        "title": "快捷键监听（旧 Hotkey）",
        "name": "UHotkeyListener",
        "kind": "component",
        "group": "内容组件",
        "description": "快捷键监听（旧 Hotkey）的独立用法与交互。",
        "examples": [
            {
                "id": "component-hotkey-listener",
                "title": "快捷键监听（旧 Hotkey）的基本用法",
                "description": "原UHotkey监听实现更名保留；keys/preventDefault/allowInput/disabled和trigger事件仍使用原协议。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UHotkeyListener, UKbd } from '@lingyzh/ui';\nconst hotkey = ref(0);\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UHotkeyListener\">\n        <u-hotkey-listener keys=\"ctrl+shift+k\" @trigger=\"hotkey++\">\n            <u-kbd keys=\"Ctrl + Shift + K\" />\n        </u-hotkey-listener>\n        <output>快捷键触发 {{ hotkey }} 次</output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "原UHotkey监听实现更名保留；keys/preventDefault/allowInput/disabled和trigger事件仍使用原协议。"
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
                "description": "direction同时接受旧start/end/both与新vertical/horizontal，side配置新轴值的加载边缘；默认纵向end。两侧状态与完成回调独立，mode支持manual/intersect，reset使旧回调失效，前端追加记录保持滚动位置；status插槽提供side和操作props。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref, watch } from 'vue';\nimport { UInfiniteScroll, USelect, USwitch, UButton } from '@lingyzh/ui';\nconst direction = ref('vertical');\nconst side = ref('both');\nconst mode = ref('manual');\nconst disabled = ref(false);\nconst items = ref([1, 2, 3, 4, 5, 6]);\nconst edgeLoads = ref({ start: 0, end: 0 });\nconst instance = ref();\nlet requestVersion = 0;\nfunction reset() {\n    requestVersion++;\n    items.value = [1, 2, 3, 4, 5, 6];\n    edgeLoads.value = { start: 0, end: 0 };\n    instance.value?.reset('both');\n}\nwatch([direction, side, mode], reset);\nasync function load({ side: edge, done }) {\n    const version = requestVersion;\n    await new Promise((resolve) => setTimeout(resolve, 220));\n    // Resetting the example also invalidates the parent's pending data request.\n    if (version !== requestVersion) return;\n    const batch = Array.from({ length: 3 }, (_, index) =>\n        edge === 'start' ? items.value[0] - 3 + index : items.value.at(-1) + 1 + index\n    );\n    items.value = edge === 'start' ? [...batch, ...items.value] : [...items.value, ...batch];\n    edgeLoads.value[edge]++;\n    done(edgeLoads.value[edge] >= 3 ? 'empty' : 'ok');\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UInfiniteScroll\">\n        <u-select v-model=\"direction\" :items=\"['vertical', 'horizontal']\" label=\"滚动方向\" />\n        <u-select v-model=\"side\" :items=\"['start', 'end', 'both']\" label=\"加载边缘\" />\n        <u-select v-model=\"mode\" :items=\"['manual', 'intersect']\" label=\"加载方式\" />\n        <u-switch v-model=\"disabled\" label=\"暂停加载\" />\n        <u-infinite-scroll\n            :key=\"`${direction}-${side}-${mode}`\"\n            ref=\"instance\"\n            :direction=\"direction\"\n            :side=\"side\"\n            :mode=\"mode\"\n            :disabled=\"disabled\"\n            height=\"260\"\n            :margin=\"0\"\n            @load=\"load\"\n        >\n            <div class=\"records\" :class=\"{ 'is-horizontal': direction === 'horizontal' }\">\n                <div v-for=\"item in items\" :key=\"item\" class=\"record\">示例记录 {{ item }}</div>\n            </div>\n            <template #loading=\"{ side: edge }\">\n                {{ edge === 'start' ? '前端' : '后端' }}正在加载…\n            </template>\n            <template #empty=\"{ side: edge }\">\n                {{ edge === 'start' ? '前端' : '后端' }}没有更多记录\n            </template>\n        </u-infinite-scroll>\n        <u-button @click=\"reset\">重置两侧状态</u-button>\n        <output>\n            前端加载 {{ edgeLoads.start }} 次；后端加载 {{ edgeLoads.end }} 次。旧\n            direction=\"start/end\" 用法继续支持。\n        </output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.records {\n    flex: 1 0 auto;\n}\n.records.is-horizontal {\n    display: flex;\n    height: 100%;\n}\n.record {\n    padding: 16px;\n    border-bottom: 1px solid var(--border);\n    white-space: nowrap;\n}\n.records.is-horizontal .record {\n    display: grid;\n    place-items: center;\n    width: 180px;\n    border-bottom: 0;\n    border-inline-end: 1px solid var(--border);\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "direction同时接受旧start/end/both与新vertical/horizontal，side配置新轴值的加载边缘；默认纵向end。两侧状态与完成回调独立，mode支持manual/intersect，reset使旧回调失效，前端追加记录保持滚动位置；status插槽提供side和操作props。"
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
                "description": "补标准load事件、pullDownThreshold与pullDownPanel(canRefresh/goingUp/refreshing)，旧refresh/threshold=72/indicator仍保留。鼠标与单指触摸均可操作，默认阻尼0.5，resistance可显式设1。reset失效旧done，只检查最近实际滚动视口是否到顶。",
                "fullSource": true,
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UPullToRefresh, USwitch, UButton } from '@lingyzh/ui';\nconst refreshed = ref(0);\nconst disabled = ref(false);\nconst instance = ref();\nlet requestVersion = 0;\nasync function refresh({ done }) {\n    const version = requestVersion;\n    await new Promise((resolve) => setTimeout(resolve, 400));\n    if (version !== requestVersion) return;\n    refreshed.value++;\n    done();\n}\nfunction reset() {\n    requestVersion++;\n    instance.value?.reset();\n    refreshed.value = 0;\n}\n</script>\n\n<template>\n    <div class=\"component-demo\" data-demo-component=\"UPullToRefresh\">\n        <u-switch v-model=\"disabled\" label=\"禁用下拉刷新\" />\n        <u-pull-to-refresh\n            ref=\"instance\"\n            style=\"max-height: 240px\"\n            :disabled=\"disabled\"\n            :pull-down-threshold=\"64\"\n            :resistance=\"1\"\n            @load=\"refresh\"\n        >\n            <template #pullDownPanel=\"{ canRefresh, goingUp, refreshing }\">\n                {{\n                    refreshing\n                        ? '正在刷新…'\n                        : canRefresh\n                          ? '松开刷新'\n                          : goingUp\n                            ? '已回拉'\n                            : '继续下拉'\n                }}\n            </template>\n            <p>鼠标或触屏下拉，松开后刷新。已刷新 {{ refreshed }} 次。</p>\n            <ul>\n                <li v-for=\"item in 10\" :key=\"item\" class=\"py-2\">示例记录 {{ item }}</li>\n            </ul>\n        </u-pull-to-refresh>\n        <u-button @click=\"reset\">重置请求</u-button>\n        <output>\n            旧 refresh、threshold 和 indicator 用法继续保留；默认阻尼0.5，示例显式设为1。\n        </output>\n    </div>\n</template>\n\n<style scoped>\n.component-demo {\n    display: grid;\n    justify-items: stretch;\n    gap: 16px;\n    min-width: 0;\n}\n.component-demo > output {\n    color: var(--muted);\n    font-size: 14px;\n}\n.component-demo > .ui-button {\n    justify-self: start;\n}\n</style>\n"
            }
        ],
        "notes": [
            "公开属性、模型、事件和插槽以本页 API 为准。",
            "组件保留 UAH 主题与尺寸；使用方式参考 Vuetify，未承诺所有上游属性逐项相同。",
            "补标准load事件、pullDownThreshold与pullDownPanel(canRefresh/goingUp/refreshing)，旧refresh/threshold=72/indicator仍保留。鼠标与单指触摸均可操作，默认阻尼0.5，resistance可显式设1。reset失效旧done，只检查最近实际滚动视口是否到顶。"
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

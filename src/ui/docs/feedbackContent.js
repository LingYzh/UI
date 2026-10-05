export const feedbackPages = [
    {
        "id": "badge",
        "title": "徽标",
        "name": "UiBadge",
        "group": "内容组件",
        "kind": "component",
        "description": "用简短文字标记状态、类型与用户标签；语义色和自定义颜色都在浅深主题下自动保持可读。",
        "examples": [
            {
                "id": "badge-tones",
                "title": "语义与外观",
                "description": "tone 表达状态含义，variant 在弱底与描边之间选择；dense 适合表格与卡片角落。",
                "code": "<script setup>\nimport { UChip } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-chip tone=\"success\">正常</u-chip>\n    <u-chip tone=\"warning\" variant=\"outline\">即将到期</u-chip>\n    <u-chip tone=\"accent\" dense>PRO</u-chip>\n</template>",
                "fullSource": true
            },
            {
                "id": "badge-custom",
                "title": "自定义颜色与移除",
                "description": "用户标签传入任意 CSS 颜色，底色与文字由组件按主题混合；closable 提供可访问的移除按钮。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UChip } from '@lingyzh/ui';\nconst tags = ref([{ id: 'work', label: '工作', color: '#3b82f6' }]);\n</script>\n\n<template>\n    <u-chip v-for=\"tag in tags\" :key=\"tag.id\" :color=\"tag.color\" closable @close=\"tags = tags.filter((item) => item.id !== tag.id)\">{{ tag.label }}</u-chip>\n</template>",
                "fullSource": true
            }
        ],
        "notes": [
            "移除按钮名称固定为“移除”，并通过 aria-describedby 关联标签文字，读屏可区分多个标签。",
            "徽标不是按钮；需要点击筛选时放在真正的按钮内，或使用 UMenuItem。",
            "颜色只是辅助，状态文字本身必须能说明含义。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "alert",
        "title": "提示条",
        "name": "UiAlert",
        "group": "反馈组件",
        "kind": "component",
        "description": "在页面或卡片内持续展示说明、结果与错误；与瞬时的 snackbar 互补。",
        "examples": [
            {
                "id": "alert-tones",
                "title": "四种语气",
                "description": "info、success、warning、error 使用对应的弱底与状态标记，正文保持主文字对比度。",
                "code": "<script setup>\nimport { UAlert } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-alert tone=\"warning\" title=\"额度即将用尽\">当前账号本月剩余额度低于 10%。</u-alert>\n</template>",
                "fullSource": true
            },
            {
                "id": "alert-actions",
                "title": "操作、紧凑与语义",
                "description": "actions 插槽放置与提示相关的操作；dense 适合表单内；静态说明可透传 role=\"note\"。",
                "code": "<script setup>\nimport { UAlert, UButton } from '@lingyzh/ui';\n</script>\n\n<template>\n    <u-alert tone=\"error\" title=\"代理启动失败\">\n        端口 5580 已被占用。\n        <template #actions><u-button size=\"sm\" @click=\"retry\">重试</u-button></template>\n    </u-alert>\n    <u-alert tone=\"info\" role=\"note\">静态说明。</u-alert>\n</template>",
                "fullSource": true
            }
        ],
        "notes": [
            "需要用户处理的错误应持续显示在相关位置，snackbar 只作补充反馈。",
            "页面加载时即存在的说明性提示使用 role=\"note\"，避免读屏把它当作新状态播报。"
        ]
    },
    {
        "id": "spinner",
        "title": "加载指示",
        "name": "UiSpinner",
        "group": "反馈组件",
        "kind": "component",
        "description": "不确定时长的等待指示，继承文字颜色，可单独使用或放入按钮。",
        "examples": [
            {
                "id": "spinner-states",
                "title": "尺寸与按钮中的等待态",
                "description": "UButton 的 loading 负责禁用与 aria-busy，指示器由业务按需放入插槽，保持现有按钮外观不变。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, USpinner } from '@lingyzh/ui';\nconst busy = ref(false);\n</script>\n\n<template>\n    <u-spinner label=\"正在刷新账号\" />\n    <u-button :loading=\"busy\" @click=\"run\"><u-spinner v-if=\"busy\" :size=\"14\" />{{ busy ? '检测中…' : '批量检测' }}</u-button>\n</template>",
                "fullSource": true
            }
        ],
        "notes": [
            "旋转属于必要的状态指示：减少动效时放慢到 1.6 秒一圈而不是停止。",
            "按钮内的等待文字（如“保存中…”）比单独的图标更清楚，推荐同时提供。"
        ]
    },
    {
        "id": "menu",
        "title": "菜单",
        "name": "UiMenu",
        "group": "操作组件",
        "kind": "component",
        "description": "由按钮打开的操作菜单或自由内容面板；原生顶层显示，不会被滚动容器或弹窗裁切。",
        "examples": [
            {
                "id": "menu-items",
                "title": "操作与勾选菜单",
                "description": "方向键在菜单项间移动，Home/End 跳到首尾，Esc 或点击外部关闭并把焦点还给触发按钮。keep-open 用于多选。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UMenu, UMenuItem } from '@lingyzh/ui';\nconst group = ref('all');\n</script>\n\n<template>\n    <u-menu>\n        <template #activator=\"{ props }\"><u-button v-bind=\"props\">移动到分组</u-button></template>\n        <u-menu-item :checked=\"group === 'all'\" @click=\"group = 'all'\">全部账号</u-menu-item>\n        <u-menu-item :checked=\"group === 'work'\" @click=\"group = 'work'\">工作分组</u-menu-item>\n        <hr class=\"ui-menu-divider\" />\n        <u-menu-item danger @click=\"remove\">删除账号</u-menu-item>\n    </u-menu>\n</template>",
                "fullSource": true
            },
            {
                "id": "menu-panel",
                "title": "自由内容面板",
                "description": "panel 模式为 role=dialog，内部表单使用正常 Tab 顺序；应用后由业务关闭面板。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UButton, UTextField, UMenu } from '@lingyzh/ui';\nconst open = ref(false);\nconst keyword = ref('');\n</script>\n\n<template>\n    <u-menu v-model:open=\"open\" panel label=\"筛选账号\">\n        <template #activator=\"{ props }\"><u-button v-bind=\"props\">筛选</u-button></template>\n        <u-text-field v-model=\"keyword\" aria-label=\"关键字\" />\n        <u-button variant=\"primary\" @click=\"open = false\">应用</u-button>\n    </u-menu>\n</template>",
                "fullSource": true
            }
        ],
        "notes": [
            "activator 必须是按钮（UButton 或原生 button）：打开与关闭由原生 popovertarget 负责，点击外部关闭后不会被同一次点击重新打开。",
            "UMenuItem：checked 为布尔值时成为 menuitemcheckbox；disabled、danger、keep-open；插槽 icon / default / trailing。",
            "辅助 class：ui-menu-label（分组标题）、ui-menu-divider（hr 分隔线）。",
            "ref 暴露 close()。菜单使用 popover=\"auto\"，同一时间只保留一个自动弹层。",
            "依赖 CSS anchor positioning 与 Popover API（Chromium 125+）。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "confirm",
        "title": "确认对话框",
        "name": "confirmDialog",
        "group": "服务",
        "kind": "service",
        "description": "从任意模块发起确认并等待结果，替代原生 window.confirm；根组件挂载一次 UConfirmHost。",
        "examples": [
            {
                "id": "confirm-basic",
                "title": "确认、危险操作与排队",
                "description": "危险确认使用红色操作；默认焦点在取消按钮。多次调用按顺序排队，Promise 在弹窗真正关闭、焦点恢复后才 resolve。",
                "code": "<script setup>\nimport { confirmDialog, snackbar, UConfirmHost, UButton } from '@lingyzh/ui';\nasync function remove() {\n    const ok = await confirmDialog({ title: '删除账号', message: '确定删除该账号？', confirmText: '删除', tone: 'danger' });\n    if (ok) snackbar.show('账号已删除。', { tone: 'success' });\n}\n</script>\n\n<template>\n    <!-- 根组件中挂载一次 -->\n    <u-confirm-host />\n    <u-button variant=\"danger\" @click=\"remove\">删除账号</u-button>\n</template>",
                "fullSource": true
            }
        ],
        "props": [
            {
                "name": "message",
                "type": "string",
                "fallback": "必填",
                "description": "确认内容；也可直接传入字符串。"
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "请确认",
                "description": "标题，默认取 locale 文案。"
            },
            {
                "name": "confirmText / cancelText",
                "type": "string",
                "fallback": "确定 / 取消",
                "description": "按钮文字。"
            },
            {
                "name": "tone",
                "type": "'default' | 'danger'",
                "fallback": "default",
                "description": "danger 时确认按钮为危险层级。"
            }
        ],
        "events": [
            {
                "name": "confirmDialog(options)",
                "type": "(ConfirmOptions | string) => Promise<boolean>",
                "fallback": "—",
                "description": "确认为 true；取消、Esc、遮罩为 false。"
            }
        ],
        "notes": [
            "UConfirmHost 在应用根部只挂载一次；多个 Host 会共享同一队列。",
            "UConfirmHost 卸载时，所有未处理请求 resolve 为 false。",
            "在 resolve 之后显示 snackbar 或打开下一个弹窗，符合 UDialog 的 closed 生命周期约定。"
        ]
    },
    {
        "id": "locale",
        "title": "国际化",
        "name": "setLocale",
        "group": "设计基础",
        "kind": "guide",
        "description": "组件内置文案支持中文与英文；默认中文，应用在语言切换时调用一次 setLocale。",
        "sections": [
            {
                "id": "demo",
                "title": "切换内置文案",
                "demo": "locale-switch",
                "text": "切换后分页器、表格空状态、代码块工具栏和确认对话框的按钮同步更新；业务传入的文字不受影响。",
                "code": "import { setLocale, getLocale } from '@lingyzh/ui';\n\nsetLocale('en');\nconsole.log(getLocale()); // 'en'"
            },
            {
                "id": "scope",
                "title": "范围与约定",
                "items": [
                    "只翻译组件自身生成的文字：按钮名称、空状态、辅助技术标签与数量格式。",
                    "显式传入的 label、empty-text、confirmText 等 props 始终优先。",
                    "文案表以中文为基准，英文键集合由单元测试保证完全一致。",
                    "数字格式随语言切换（zh-CN / en-US）。"
                ]
            }
        ]
    }
];

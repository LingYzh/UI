export const typographyPage = {
    "id": "typography",
    "title": "字体排版",
    "name": "Typography",
    "kind": "guide",
    "group": "设计基础",
    "description": "采用 Vuetify 4.2.4 的15级字号体系：正文16/14/12px，标题22/16/14px。保留现有中文字体、技术字体与主题。",
    "apiKind": "utilities",
    "props": [
        {
            "name": "text-display-large",
            "type": "CSS class",
            "fallback": "57px",
            "description": "行高64px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-display-medium",
            "type": "CSS class",
            "fallback": "45px",
            "description": "行高52px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-display-small",
            "type": "CSS class",
            "fallback": "36px",
            "description": "行高44px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-headline-large",
            "type": "CSS class",
            "fallback": "32px",
            "description": "行高40px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-headline-medium",
            "type": "CSS class",
            "fallback": "28px",
            "description": "行高36px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-headline-small",
            "type": "CSS class",
            "fallback": "24px",
            "description": "行高32px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-title-large",
            "type": "CSS class",
            "fallback": "22px",
            "description": "行高28px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-title-medium",
            "type": "CSS class",
            "fallback": "16px",
            "description": "行高24px，字重500；以16px根字号计算。"
        },
        {
            "name": "text-title-small",
            "type": "CSS class",
            "fallback": "14px",
            "description": "行高20px，字重500；以16px根字号计算。"
        },
        {
            "name": "text-body-large",
            "type": "CSS class",
            "fallback": "16px",
            "description": "行高24px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-body-medium",
            "type": "CSS class",
            "fallback": "14px",
            "description": "行高20px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-body-small",
            "type": "CSS class",
            "fallback": "12px",
            "description": "行高16px，字重400；以16px根字号计算。"
        },
        {
            "name": "text-label-large",
            "type": "CSS class",
            "fallback": "14px",
            "description": "行高20px，字重500；以16px根字号计算。"
        },
        {
            "name": "text-label-medium",
            "type": "CSS class",
            "fallback": "12px",
            "description": "行高16px，字重500；以16px根字号计算。"
        },
        {
            "name": "text-label-small",
            "type": "CSS class",
            "fallback": "11px",
            "description": "行高16px，字重500；以16px根字号计算。"
        }
    ],
    "examples": [
        {
            "id": "typography-scale",
            "title": "字号层级与真实控件",
            "description": "按真实工具类展示全部字号；响应式字号随视口变化，输入与按钮使用对应字号。以16px根字号计算，浏览器缩放会等比例调整。",
            "fullSource": true,
            "code": "<script setup>\nimport { typography, UButton, UTextField } from '@lingyzh/ui';\nimport { ref } from 'vue';\nconst value = ref('正文与输入框 16px');\n</script>\n\n<template>\n    <div class=\"typography-demo\">\n        <div\n            v-for=\"role in typography\"\n            :key=\"role.name\"\n            class=\"typography-row\"\n            :data-font-role=\"role.name\"\n        >\n            <span class=\"text-body-small text-muted\">\n                {{ role.name }} · {{ role.size }} / {{ role.lineHeight }} px\n            </span>\n            <div :class=\"`text-${role.name}`\">字体 Typography</div>\n        </div>\n        <p class=\"text-body-medium\">响应式工具类：手机正文、宽屏标题。</p>\n        <p data-font-responsive class=\"text-body-large text-sm-title-large\">\n            随着容器所在视口调整字号\n        </p>\n        <u-text-field v-model=\"value\" label=\"表单标签 16px\" hint=\"辅助说明 12px\" persistent-hint />\n        <div class=\"d-flex flex-wrap ga-2\">\n            <u-button\n                v-for=\"size in ['x-small', 'small', 'default', 'large', 'x-large']\"\n                :key=\"size\"\n                :size=\"size\"\n            >\n                {{ size }}\n            </u-button>\n        </div>\n    </div>\n</template>\n\n<style scoped>\n.typography-demo {\n    min-width: 0;\n    display: grid;\n    gap: 16px;\n}\n.typography-row {\n    min-width: 0;\n    padding-block-end: 12px;\n    border-bottom: 1px solid var(--line);\n}\n.typography-row > div {\n    overflow-wrap: anywhere;\n}\n.typography-demo > p {\n    margin: 0;\n}\n</style>\n"
        }
    ],
    "notes": [
        "text-display-*、text-headline-*、text-title-*、text-body-*、text-label-*与Vuetify4命名一致，large/medium/small各三级。",
        "text-sm-* / text-md-* / text-lg-* / text-xl-* / text-xxl-*支持响应式字号。旧text-body-1/2、text-caption、text-subtitle与text-title映射到新层级。",
        "默认按钮14px，x-small/small/default/large/x-large为10/12/14/16/18px；输入16px，表单辅助12px，表格14px，工具栏标题20px、prominent24px。",
        "字号使用rem单位，随浏览器缩放等比例变化；字体家族、配色与控件圆角由现有设计tokens控制。"
    ]
};

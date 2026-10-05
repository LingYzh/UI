export const tablePages = [
    {
        "id": "table",
        "title": "表格",
        "name": "UiTable",
        "group": "内容组件",
        "kind": "component",
        "description": "原生表格语义、共享滚动区域与可定制单元格。文档各页的 API 表格也使用此组件。",
        "examples": [
            {
                "id": "table-basic",
                "title": "列与单元格",
                "description": "通过 headers 和 items 渲染；具名单元格插槽用于状态、代码或操作。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiTable } from '@lingyzh/ui';\nconst headers = [{ key: 'name', title: '项目' }, { key: 'files', title: '文件数', align: 'end' }];\nconst items = [{ id: 1, name: 'UAH', files: 24 }, { id: 2, name: '文档站', files: 12 }];\n</script>\n\n<template>\n    <UiTable :headers=\"headers\" :items=\"items\" label=\"项目概览\"><template #item.name=\"{ value }\"><strong>{{ value }}</strong></template></UiTable>\n</template>",
                "fullSource": true
            },
            {
                "id": "table-fixed",
                "title": "固定表头",
                "description": "内容在限制高度内滚动，列标题保持可见。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiTable } from '@lingyzh/ui';\nconst headers = [{ key: 'name', title: '项目' }, { key: 'files', title: '文件数', align: 'end' }];\nconst items = [{ id: 1, name: 'UAH', files: 24 }, { id: 2, name: '文档站', files: 12 }];\n</script>\n\n<template>\n    <UiTable :headers=\"headers\" :items=\"items\" label=\"项目\" height=\"220px\" fixed-header dense />\n</template>",
                "fullSource": true
            },
            {
                "id": "table-variants",
                "title": "表格样式变体",
                "description": "默认、dense、ghost 与直角的真实组件对照。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiTable } from '@lingyzh/ui';\nconst headers = [{ key: 'name', title: '项目' }, { key: 'files', title: '文件数', align: 'end' }];\nconst items = [{ id: 1, name: 'UAH', files: 24 }, { id: 2, name: '文档站', files: 12 }];\n</script>\n\n<template>\n    <UiTable :headers=\"headers\" :items=\"items\" label=\"项目\" ></UiTable>\n    <UiTable :headers=\"headers\" :items=\"items\" label=\"项目\" dense></UiTable>\n    <UiTable :headers=\"headers\" :items=\"items\" label=\"项目\" ghost></UiTable>\n    <UiTable :headers=\"headers\" :items=\"items\" label=\"项目\" :rounded=\"false\"></UiTable>\n</template>",
                "fullSource": true
            }
        ],
        "notes": [
            "使用稳定 item-value，避免排序后行状态错位。",
            "基础表格不包含分页；远程分页与排序使用 UiDataTableServer。",
            "宽表在内部横向滚动，保留父级纵向滚动。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    },
    {
        "id": "data-table-server",
        "title": "服务端表格",
        "name": "UiDataTableServer",
        "group": "内容组件",
        "kind": "component",
        "description": "调用方负责数据请求，表格负责排序参数、加载状态及可组合的分页页脚。",
        "examples": [
            {
                "id": "table-server",
                "title": "远程分页与排序",
                "description": "本地模拟服务端请求，可查询、排序、翻页及模拟失败重试。源码提供真实 API 接入方式。",
                "code": "<script setup>\nimport { ref, onBeforeUnmount } from 'vue';\nimport { UiDataTableServer } from '@lingyzh/ui';\nconst headers = [{ key: 'name', title: '项目', sortable: true }];\nconst items = ref([]);\nconst total = ref(0);\nconst loading = ref(true);\nconst error = ref('');\nconst page = ref(1);\nconst itemsPerPage = ref(10);\nconst sortBy = ref([]);\nlet controller;\nlet lastOptions;\nasync function load(options = lastOptions) {\n    lastOptions = options;\n    controller?.abort();\n    const current = new AbortController();\n    controller = current;\n    loading.value = true;\n    error.value = '';\n    try {\n        // 替换为项目 API 模块；服务端返回当前页 items 和总数 total。\n        const query = new URLSearchParams({ page: String(options.page), limit: String(options.itemsPerPage), sort: JSON.stringify(options.sortBy) });\n        const response = await fetch('/api/projects?' + query, { signal: current.signal });\n        if (!response.ok) throw new Error('请求失败');\n        const result = await response.json();\n        if (current !== controller || current.signal.aborted) return;\n        items.value = result.items;\n        total.value = result.total;\n    } catch (cause) {\n        if (current === controller && !current.signal.aborted) error.value = '加载失败，请重试。';\n    } finally {\n        if (current === controller && !current.signal.aborted) loading.value = false;\n    }\n}\nonBeforeUnmount(() => controller?.abort());\n</script>\n\n<template>\n    <UiDataTableServer v-model:page=\"page\" v-model:items-per-page=\"itemsPerPage\" v-model:sort-by=\"sortBy\" :headers=\"headers\" :items=\"items\" :items-length=\"total\" :loading=\"loading\" :error=\"error\" label=\"项目\" @update:options=\"load\" @retry=\"load()\" />\n</template>",
                "fullSource": true
            },
            {
                "id": "server-variants",
                "title": "服务端表格样式变体",
                "description": "页脚、每页选择器与分页器跟随表格的密度和表面。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiDataTableServer } from '@lingyzh/ui';\nconst headers = [{ key: 'name', title: '项目' }, { key: 'files', title: '文件数', align: 'end' }];\nconst items = [{ id: 1, name: 'UAH', files: 24 }, { id: 2, name: '文档站', files: 12 }];\n</script>\n\n<template>\n    <UiDataTableServer :headers=\"headers\" :items=\"items\" :items-length=\"items.length\" label=\"项目\" ></UiDataTableServer>\n    <UiDataTableServer :headers=\"headers\" :items=\"items\" :items-length=\"items.length\" label=\"项目\" dense></UiDataTableServer>\n    <UiDataTableServer :headers=\"headers\" :items=\"items\" :items-length=\"items.length\" label=\"项目\" ghost></UiDataTableServer>\n    <UiDataTableServer :headers=\"headers\" :items=\"items\" :items-length=\"items.length\" label=\"项目\" :rounded=\"false\"></UiDataTableServer>\n</template>",
                "fullSource": true
            }
        ],
        "notes": [
            "组件不请求网络，不对当前页数据二次分页或排序。",
            "loading 期间锁定排序与分页，查询入口仍由调用方管理。",
            "调用方负责请求取消或序号校验，防止过期响应覆盖新结果；组件卸载时清理请求。",
            "支持单列排序，不提供行选择、分组或虚拟滚动；不宣称兼容 Vuetify 全量 API。"
        ]
    },
    {
        "id": "pagination",
        "title": "分页器",
        "name": "UiPagination",
        "group": "导航组件",
        "kind": "component",
        "description": "可独立使用的页码导航，具备首尾页、省略号、边界禁用和当前页语义。",
        "examples": [
            {
                "id": "pagination-basic",
                "title": "页码与边界",
                "description": "跳到中段查看省略号；总页数收缩时自动校正当前页。支持原生 Tab 与 Enter/Space 操作。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiPagination } from '@lingyzh/ui';\nconst page = ref(1);\n</script>\n\n<template>\n    <UiPagination v-model=\"page\" :length=\"24\" :total-visible=\"5\" label=\"项目分页\" />\n</template>",
                "fullSource": true
            },
            {
                "id": "pagination-variants",
                "title": "分页器样式变体",
                "description": "默认、dense、ghost 和直角；选中页始终保留明确强调。",
                "code": "<script setup>\nimport { ref } from 'vue';\nimport { UiPagination } from '@lingyzh/ui';\n\n</script>\n\n<template>\n    <UiPagination :length=\"6\" ></UiPagination>\n    <UiPagination :length=\"6\" dense></UiPagination>\n    <UiPagination :length=\"6\" ghost></UiPagination>\n    <UiPagination :length=\"6\" :rounded=\"false\"></UiPagination>\n</template>",
                "fullSource": true
            }
        ],
        "notes": [
            "空数据的调用方应同时传 disabled，服务端表格已自动处理。",
            "窄容器允许控件换行，不产生页面水平溢出。",
            "鼠标／触摸完成操作后释放当前控件焦点；键盘 Enter、Space 和方向键操作保留焦点。打开的菜单／弹窗仍管理内部焦点，关闭时仅为键盘操作恢复触发器焦点；文本输入保留编辑焦点。"
        ]
    }
];

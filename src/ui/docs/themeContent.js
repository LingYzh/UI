const scopedCode = "<script setup>\nimport { ref } from 'vue';\nimport { UThemeProvider, UCard, UTextField, UButton, UMarkdown, UDialog } from '@lingyzh/ui';\nconst name = ref('工作空间');\nconst open = ref(false);\n</script>\n\n<template>\n    <u-theme-provider theme=\"dark\" with-background>\n        <u-card title=\"继承深色主题\">\n            <u-text-field v-model=\"name\" label=\"名称\" />\n            <u-markdown source=\"`行内代码` 与 ==标记== 使用主题主色。\" />\n            <u-button variant=\"flat\" color=\"primary\" @click=\"open = true\">打开继承主题弹窗</u-button>\n        </u-card>\n        <u-card theme=\"light\" title=\"独立浅色卡片\">嵌套区域可覆盖主题。</u-card>\n        <u-dialog v-model:open=\"open\"><h3>继承深色主题</h3><u-button @click=\"open = false\">关闭</u-button></u-dialog>\n    </u-theme-provider>\n</template>";
const setupCode = `import { createApp } from 'vue';
import { createUiTheme } from '@lingyzh/ui';
import '@lingyzh/ui/styles.css';
import App from './App.vue';

const theme = createUiTheme({
    defaultTheme: 'system',
    themes: {
        ocean: { colors: { primary: '#246a91' } },
        midnight: { dark: true, colors: { primary: '#8ecce9', 'primary-surface': '#246a91' } }
    },
    variations: { colors: ['primary'], lighten: 2, darken: 2 }
});
createApp(App).use(theme).mount('#app');`;
const switchingCode = `<script setup>
import { useUiTheme, UButton } from '@lingyzh/ui';
const theme = useUiTheme();
</script>

<template>
    <u-button @click="theme.change('system')">跟随系统</u-button>
    <u-button @click="theme.toggle()">切换明暗</u-button>
    <u-button @click="theme.cycle(['light', 'dark', 'ocean'])">循环主题</u-button>
    <p>模式 {{ theme.mode.value }} · 实际主题 {{ theme.name.value }}</p>
</template>`;
const row = (name, type, fallback, description) => ({ name, type, fallback, description });
export const themePages = [
    {
        id: 'theme', title: '主题', name: 'createUiTheme / useUiTheme', group: '设计基础', kind: 'service',
        description: '注册与切换 light、dark、system 和自定义主题；沿用现有 UAH 配色，通过容器继承控制局部外观。',
        examples: [
            { id: 'theme-switch', title: '全局切换与跟随系统', description: '模式保留 system，实际主题随系统明暗变化。切换默认播放过渡，减少动态效果时立即更新；与顶栏明暗开关使用相同策略。', code: switchingCode },
            { id: 'theme-custom', title: '自定义主题与实时配色', description: '注册主题继承对应明暗默认值；修改响应式 themes 即时更新所有使用该主题的区域。', code: setupCode },
            { id: 'theme-scoped', title: '局部主题与嵌套覆盖', description: 'Provider、Card 和 Dialog 的主题沿组件树继承；局部切换不改变全局选择。', code: scopedCode },
            { id: 'theme-diagrams', title: 'Markdown 图表继承主题', description: '同一图表并行显示于两个主题区域，SVG 配色与文字继承各自作用域；动态修改主题后重新呈现。', code: "<script setup>\nimport { UThemeProvider, UMarkdown } from '@lingyzh/ui';\nconst diagram = '```mermaid\\nflowchart LR\\n    A[主题颜色] --> B[安全图表]\\n```';\n</script>\n\n<template>\n    <u-theme-provider theme=\"ocean\" with-background>\n        <u-markdown :source=\"diagram\" />\n    </u-theme-provider>\n    <u-theme-provider theme=\"midnight\" with-background>\n        <u-markdown :source=\"diagram\" />\n    </u-theme-provider>\n</template>\n" }
        ],
        props: [
            row('defaultTheme', 'string', "'light'", '初始主题名；system 跟随系统 prefers-color-scheme。'),
            row('themes', 'Record<string, UiThemeDefinition>', '{}', '每项包含 dark?: boolean、colors?: Record<string,string>、variables?: Record<string,string|number>。自定义主题继承对应明暗基底；可覆盖内置主题。主题、颜色及变量名称使用字母开头的字母、数字或连字符，system 是保留名。'),
            row('variations', '{ colors: string[]; lighten?: number; darken?: number }', '—', '可选颜色变体。每档与白／黑混合 10%，最多 10 档，产生 primary-lighten-1 等颜色；仅支持十六进制 RGB。'),
            row('target', 'HTMLElement | string | false', 'document.documentElement', '全局 CSS 变量写入目标；字符串为 CSS 选择器，false 不向根元素写入变量，仍提供主题上下文和颜色辅助样式；同时设 utilities:false 可完全避免全局 DOM 写入。SSR 不访问 DOM。'),
            row('utilities', 'boolean', 'true', '生成 text-{color}、bg-{color}、border-{color} 辅助类；背景类搭配 on-{color} 字色。'),
            row('cspNonce', 'string', '—', '写入生成的主题辅助类与切换动画 style 元素。'),
            row('transition', 'boolean | { origin?: string; duration?: number }', 'true', '默认启用浏览器 View Transition；默认起点 50% 0%、400ms，可显式设 false。系统或手动减少动态效果时立即切换，并结束播放中的过渡；关闭减少动效后自动恢复。不支持时直接切换；duration 限制在 0–2000ms。')
        ],
        events: [
            row('change(name, transition?)', 'Promise<void>', '—', '切换主题；未知名称拒绝 Promise。可覆盖本次过渡参数，Promise 在新主题已应用时完成。'),
            row('toggle(names?, transition?)', 'Promise<void>', "['light', 'dark']", '在指定两个主题间切换。'),
            row('cycle(names?, transition?)', 'Promise<void>', '全部已注册主题及 system', '依次循环指定主题；空列表或未知名称拒绝 Promise。'),
            row('setTransitionOrigin(origin)', 'Element | { clientX: number; clientY: number } | null', '—', '以元素中心或点击位置指定下一次过渡起点；null 重置。'),
            row('resolveName(name)', 'string → string', '—', '将 system 解析为当前系统主题；其他名称原样返回，不检查是否已注册。'),
            row('install(app)', 'void', '—', 'Vue 插件入口，通过 app.use(theme) 调用；每个 app 使用独立主题实例。'),
            row('dispose()', 'void', '—', '清理监听、辅助样式与已写入的变量。Vue app 卸载时自动调用。')
        ], slots: [], methods: [],
        notes: [
            'createUiTheme 返回可直接 app.use(theme) 的实例；组件 setup 中通过 useUiTheme() 获取当前作用域。每个 app 创建独立实例。未安装时兼容根节点 data-theme 的既有明暗切换。',
            'themes 是可写 Ref；computedThemes、current、name、mode、isSystem、themeNames、styles 是响应式计算值。JavaScript 与嵌套对象模板中使用 .value。name 是实际主题，mode 保留 system 等选择；global.name 可写、global.current 始终指向全局。change/toggle/cycle 始终切换全局，局部主题通过 Provider 的 theme 属性控制。',
            'primary 用于可读文字，primary-surface 用于实心主色背景。默认明暗保持原 accent-text / accent；自定义 primary 默认同步 primary-surface，可独立覆盖。支持 success/error/warning/info 与现有全部 tokens。',
            '未明确提供的 on-{color} 会根据十六进制 RGB 的亮度自动选择黑／白；其他颜色格式建议显式提供 on-{color}。on-surface 同时映射正文 text。颜色变量为 --ui-theme-{color} 与 --{color}；普通 variables 为 --{name}。',
            '主题定义在 setup 时保持完整；局部 theme 必须为已注册名称或 system。Provider 不添加间距，with-background 只增加主题背景。Card/Dialog 可用 theme 属性覆盖，其他控件通过容器继承；Teleport 通知保持所在作用域。',
            '切换动画与系统／手动减少动态效果设置联动。light / dark 默认配色来自现有 tokens，不引入 Material 主题。'
        ]
    },
    {
        id: 'theme-provider', title: '主题容器', name: 'UiThemeProvider', group: '容器组件', kind: 'component',
        description: '为任意内容提供局部主题，子组件自动继承；支持嵌套覆盖，不改变全局主题。',
        examples: [{ id: 'theme-scoped', title: '局部主题、嵌套卡片与弹窗', description: '切换外层主题，观察内部控件、Markdown 和弹窗同步变化；浅色卡片保持独立。', code: scopedCode }],
        notes: ['theme 未传时继承上级；system 根据系统外观解析为 light 或 dark。', 'with-background 只设置主题背景；间距、行列布局使用 UContainer / URow / UCol 或自己的容器样式。', '局部自定义主题须先通过 createUiTheme 注册。UCard、UDialog 的 theme 属性也能提供局部覆盖。']
    }
];

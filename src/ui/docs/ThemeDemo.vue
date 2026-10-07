<script setup>
import { computed, ref } from 'vue';
import {
    UThemeProvider,
    UCard,
    UButton,
    UTextField,
    USelect,
    USwitch,
    URow,
    UCol,
    UDialog,
    UMarkdown,
    useUiTheme,
} from '../index';
import { reducedMotion } from './preferences';
const props = defineProps({ example: { type: String, default: 'theme-switch' } });
const theme = useUiTheme();
theme.themes.value.ocean ??= { colors: { primary: '#246a91' } };
theme.themes.value.midnight ??= {
    dark: true,
    colors: { primary: '#8ecce9', 'primary-surface': '#246a91' },
};
const mode = computed({
    get: () => theme.mode.value,
    set: (value) => {
        void theme.change(value);
    },
});
const localTheme = ref('dark');
const primary = computed({
    get: () => theme.computedThemes.value.ocean.colors.primary,
    set: (value) => {
        (theme.themes.value.ocean.colors ??= {}).primary = value;
    },
});
const name = ref('工作空间');
const enabled = ref(true);
const dialog = ref(false);
const sample = '`行内代码` 与 ==标记== 使用当前主题的 primary。';
const diagram = '```mermaid\nflowchart LR\n    A[主题颜色] --> B[安全图表]\n```';
const choices = [
    { value: 'light', label: '浅色 · 现有配色' },
    { value: 'dark', label: '深色 · 现有配色' },
    { value: 'system', label: '跟随系统' },
    { value: 'ocean', label: '海蓝 · 自定义浅色' },
    { value: 'midnight', label: '夜海 · 自定义深色' },
];
</script>

<template>
    <div class="theme-demo" :data-example="props.example">
        <template v-if="props.example === 'theme-switch'">
            <u-row align="end">
                <u-col :cols="12" :sm="7">
                    <u-select
                        v-model="mode"
                        label="全局主题"
                        :items="choices"
                        hint="system 会在系统外观改变时自动更新。"
                    />
                </u-col>
                <u-col :cols="12" :sm="5">
                    <u-switch
                        v-model="reducedMotion"
                        label="减少动态效果"
                        hint="关闭时默认播放主题过渡；系统减少动效仍生效。"
                    />
                </u-col>
            </u-row>
            <div class="theme-demo-actions">
                <u-button @click="theme.toggle()">切换明暗</u-button>
                <u-button variant="text" @click="theme.cycle()">循环主题</u-button>
                <span role="status">模式 {{ theme.mode.value }} · 当前 {{ theme.name.value }}</span>
            </div>
            <u-card title="当前主题预览" subtitle="文档与组件同步更新">
                <u-text-field v-model="name" label="名称" />
                <u-markdown :source="sample" />
                <u-button variant="flat" color="primary">主要操作</u-button>
            </u-card>
        </template>
        <template v-else-if="props.example === 'theme-custom'">
            <label class="theme-demo-color">
                海蓝主题 primary
                <input v-model="primary" type="color" aria-label="海蓝主题主色" />
                <code>{{ primary }}</code>
            </label>
            <u-theme-provider theme="ocean" with-background class="theme-demo-scope">
                <u-card title="实时自定义主题" subtitle="调整主色，只影响使用海蓝主题的区域。">
                    <u-markdown :source="sample" />
                    <u-text-field v-model="name" label="名称" />
                    <div class="theme-demo-actions">
                        <u-button variant="flat" color="primary">主要操作</u-button>
                        <u-switch v-model="enabled" label="启用" />
                    </div>
                    <div class="theme-demo-swatches">
                        <span class="bg-primary">primary</span>
                        <template
                            v-if="theme.computedThemes.value.ocean.colors['primary-lighten-1']"
                        >
                            <span class="bg-primary-lighten-1">lighten-1</span>
                            <span class="bg-primary-darken-1">darken-1</span>
                        </template>
                        <span v-else class="bg-secondary">secondary</span>
                    </div>
                </u-card>
            </u-theme-provider>
        </template>
        <template v-else-if="props.example === 'theme-diagrams'">
            <u-row>
                <u-col :cols="12" :sm="6">
                    <u-theme-provider theme="ocean" with-background class="theme-demo-scope">
                        <u-markdown :source="diagram" />
                    </u-theme-provider>
                </u-col>
                <u-col :cols="12" :sm="6">
                    <u-theme-provider theme="midnight" with-background class="theme-demo-scope">
                        <u-markdown :source="diagram" />
                    </u-theme-provider>
                </u-col>
            </u-row>
        </template>
        <template v-else>
            <u-select
                v-model="localTheme"
                label="局部主题"
                :items="choices"
                hint="只更新下面的容器，外部文档保持全局主题。"
            />
            <u-theme-provider :theme="localTheme" with-background class="theme-demo-scope">
                <u-row>
                    <u-col :cols="12" :md="6">
                        <u-card title="继承容器主题">
                            <u-text-field
                                v-model="name"
                                label="名称"
                                hint="label、控件和说明使用同一主题。"
                            />
                            <u-markdown :source="sample" />
                            <u-button variant="flat" color="primary" @click="dialog = true">
                                打开继承主题弹窗
                            </u-button>
                        </u-card>
                    </u-col>
                    <u-col :cols="12" :md="6">
                        <u-card theme="light" title="嵌套浅色卡片">
                            <u-markdown :source="sample" />
                            <u-button variant="flat" color="primary">固定浅色操作</u-button>
                            <u-theme-provider
                                theme="midnight"
                                with-background
                                class="theme-demo-nested"
                            >
                                <u-markdown :source="'更深一层也可独立使用 `midnight` 主题。'" />
                            </u-theme-provider>
                        </u-card>
                    </u-col>
                </u-row>
                <u-dialog v-model:open="dialog">
                    <h3>继承局部主题</h3>
                    <u-markdown :source="sample" />
                    <u-button @click="dialog = false">关闭</u-button>
                </u-dialog>
            </u-theme-provider>
        </template>
    </div>
</template>

<style scoped>
.theme-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.theme-demo-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}
.theme-demo-actions span {
    color: var(--muted);
    font-size: 14px;
}
.theme-demo :deep(.ui-card-content) {
    display: grid;
    gap: 16px;
}
.theme-demo-scope {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 12px;
}
.theme-demo-nested {
    padding: 12px;
    border-radius: 8px;
}
.theme-demo-color {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}
.theme-demo-color input {
    width: 44px;
    height: 32px;
    padding: 2px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface);
    cursor: pointer;
}
.theme-demo-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.theme-demo-swatches span {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
}
</style>

# UAH UI

独立 Vue 3 UI 库。业务组件通过 `@lingyzh/ui` 导入；共享外观由 `tokens.css` 与 `styles.css` 管理。业务状态仍由页面或 Pinia 持有。

基于 [Vuetify0](https://0.vuetifyjs.com/introduction/getting-started) 的 headless 组件逐步整合，运行依赖固定为 `@vuetify/v0@1.2.3`。`UiButton` 使用 `Button.Root`，`UiTabs` 使用 `Tabs.Root/List/Item` 提供键盘导航和激活状态；UAH 保留设计 tokens、真实按钮 DOM 和公开 API。其余组件仍使用现有 Vue/原生实现，尤其 Dialog 保留退出动画、焦点恢复与 Electron 原生网页隐藏生命周期。没有引入 Material 主题。npm 包发布 Vue/TypeScript 源码，使用方需配置支持 Vue SFC 的构建工具。

## 使用

先安装 `npm install @lingyzh/ui`；本地开发 UAH 时也可以继续使用 `file:../UI`。

```js
import { UiInput, UiSelect, UiButton, snackbar } from '@lingyzh/ui';
import '@lingyzh/ui/styles.css';
```

运行 `npm run dev` 后打开 http://127.0.0.1:5174 查看完整组件文档与真实示例。运行 `npm run build` 生成 `dist/docs` 文档及 `dist/lib` 库构建；预览文档可运行 `npm run preview` 并打开 http://127.0.0.1:4174。文档与正式工作台构建分离，不加入工作台导航。

Electron 的 Vue 渲染层直接使用上述组件，无需放宽 `contextIsolation`、sandbox 或 Node 集成设置。当前项目 Vue 3.5 与 Node 24 满足该版本要求。

## 实施顺序

统一风格的项目先从原型整理 tokens、可复用组件和真实预览文档，由主代理完成视觉验收并记录结果，再迁移业务页面与实现系统。后续共用外观和交互修改也先更新本库及 demo。引入 headless 依赖不改变这一顺序。

## 组件契约

| 组件 | 主要 API | 交互约定 |
| --- | --- | --- |
| `UiButton` | `variant="primary/secondary/ghost/danger"`、`size="sm/md"`、`icon`、`loading`、`disabled` | 默认 `type="button"`；等待态禁止重复点击；纯图标按钮必须传 `aria-label`；`ripple` 默认开启，可设 false；ref 暴露 `element/focus(options?)` |
| `UiInput` | 字符串 `v-model`（`type="number"` 时为 number，清空为 null）、`disabled`、`invalid`；`leading/trailing` 插槽 | 边框、背景、hover/focus 属于整个外壳。`class/style` 落外壳，其余原生属性与事件落 input。ref 暴露 `element/focus()/select()` |
| `UiSelect` | 字符串或数字 `v-model`、`compact`、`invalid`；原生 option 插槽 | 未传模型默认选择首项；指针选完默认释放焦点（`blur-on-select=false` 可关闭），键盘保留焦点；保留数字 option 值；支持 base-select 时使用统一弹层与居中箭头，否则使用原生弹层 |
| `UiSwitch` | 布尔 `v-model`、原生 checkbox 属性 | Space 切换；使用关联 label 或 `aria-label` 提供名称 |
| `UiField` | `label`、`for`、`description`、`error`；默认插槽 `controlAttrs` | 将 `controlAttrs` 绑定控件，自动关联 label、描述与错误。没有 `for` 时显示非表单标题 |
| `UiTabs` | `v-model`、`items`、`id-prefix`、`orientation`、`variant="soft/underline"` | 默认 underline；底部/垂直右侧的连续滑动指示条，默认 ripple；方向键、Home/End、跳过禁用项、自动激活；插槽获得 `item` |
| `UiTabPanel` | `model-value`、`value`、与 Tabs 相同的 `id-prefix` | ARIA 关联，隐藏时保留实例和内部状态，显示时淡入。每组 id-prefix 必须唯一 |
| `UiDialog` | `v-model:open`、`size="sm/md/lg/xl/full"`、`placement="center/end"`；`opened/closed/present-change` | 原生 modal、焦点约束、Esc/遮罩关闭、退出后恢复焦点；须提供 `aria-label` 或 `aria-labelledby` |
| `UiCollapse` | `open` | 高度和透明度过渡；关闭立即 inert，内容保留实例 |
| `UiSnackbarHost` | 根组件挂载一次 | 显示全局提示；卸载时清理提示和定时器 |
| `UiCard` | title/subtitle、variant、density、flush、as；header/media/default/actions 插槽 | 统一标题、表单、Tabs 与底部操作间距，容器本身不隐式承担按钮行为 |
| `UiScrollArea` | label、height/max-height、axis、always；ref element/focus/scrollTo/update | 悬浮滑块与原生滚动行为；支持拖动、轨道点击和动态尺寸 |
| `UiCodeBlock` | code、language | highlight.js 按需语法；浅深主题、复制、换行，原始源码不执行 |
| `UiBadge` | `tone`、`variant="soft/outline"`、`color`、`dense`、`closable` + `close` | 自定义颜色按主题混合；移除按钮通过 aria-describedby 关联标签文字 |
| `UiAlert` | `tone="info/success/warning/error"`、`title`、`dense`；`icon/actions` 插槽 | error 为 alert，其余 status，可透传 role（如 note） |
| `UiSpinner` | `size`、`label` | 继承文字颜色；有 label 时为 status，减少动效时放慢而不停止 |
| `UiMenu` / `UiMenuItem` | `v-model:open`、`placement`、`panel`、`label`；activator 插槽 `{ props }`；MenuItem `checked/disabled/danger/keep-open` | popover 顶层与 anchor 定位；菜单方向键漫游，面板 Tab 导航；Esc/点击外部关闭并还焦点 |
| `confirmDialog` / `UiConfirmHost` | `confirmDialog({ message, title?, confirmText?, cancelText?, tone? }) => Promise<boolean>` | 根组件挂载一次 Host；排队显示，关闭后才 resolve，默认焦点在取消 |
| `setLocale` | `setLocale('zh' / 'en')`、`getLocale()` | 只翻译组件内置文案，默认 zh；显式 props 优先 |


```vue
<UiField v-slot="{ controlAttrs }" label="名称" for="project-name" :error="error">
    <UiInput v-model="name" v-bind="controlAttrs" :invalid="Boolean(error)" />
</UiField>
```

自定义页面只负责布局、数据和业务事件，不再写全局 `input:hover`、`select`、`.primary` 来覆盖共享控件。特殊视觉形态优先增加组件 variant，避免依赖加载顺序覆盖。

## 全局 Snackbar（任意 JS/TS 模块）

```js
import { snackbar } from '@lingyzh/ui';

snackbar.configure({ position: 'bottom-center', duration: 6000 });
snackbar.show('设置已保存', { tone: 'success' });

const id = snackbar.show('连接失败，请重试。', {
    position: 'top-right',
    duration: 0,
    tone: 'error'
});
snackbar.dismiss(id);
snackbar.clear();
```

- 方位：`top-left/top-center/top-right/bottom-left/bottom-center/bottom-right`。
- 类型：`info/success/error`。普通提示使用 `role=status`，错误使用 `role=alert`。
- `duration` 单位毫秒，默认 6000；0 表示手动关闭。每个方位最多保留 3 条，超出时移除最早一条并清理计时器。
- 指针悬停、键盘聚焦独立暂停计时；两者都离开后按剩余时长继续，重复暂停不会重置时长。
- 全局指应用模块共享的单例服务；不污染 `window`，不需要在页面中获取组件 ref。
- Host 位于文档层，native modal 打开时遵循原生顶层遮罩；涉及弹窗的操作结果应在 `closed` 后提示。

## 动效与生命周期

`--motion-fast/normal/layout` 定义 140/180/240ms 节奏。控件颜色和边框轻量过渡，页签内容淡入，折叠区域过渡高度，弹窗与 Snackbar 有进出动效。系统 `prefers-reduced-motion` 或应用 `data-reduced-motion="true"` 任一启用都关闭非必要动效。

`open=false` 表示请求关闭，`closed` 才表示 native dialog 真正关闭；`present-change` 覆盖整个进出过程。Electron WebContentsView 必须在 present 为 true 时保持隐藏。跳转或打开下一弹窗放在 `closed` 后，避免顶层视图抢焦点。快速重开会使过期的关闭回调失效。

会话流式文本、光标和阅读位置保持即时更新，不对每个 token 重新播放动画；页面/面板切换保留 DOM 和状态。

## 验证

`npm run typecheck` 检查 UI Vue SFC；UAH 自行检查主进程。独立项目使用 TypeScript 6.0.2 与 vue-tsc，UAH 主进程保留 TypeScript 7。

`npm run test:ui` 检查整块 hover、真实进出中间帧、快速重开、焦点、减少动效、页签底角、控件语义、数字选择值和 Snackbar 六方位及计时。`npm test` 包含 Snackbar 定时器与独立暂停原因测试；已有桌面/搜索/浏览器/外观回归继续运行。


## Ripple、Card 与布局工具类

```vue
<script setup>
import { UiCard, UiButton, vRipple } from '@lingyzh/ui';
</script>
<template>
    <UiCard title="工作区" density="compact">
        <div class="d-flex align-center justify-space-between ga-4 pa-2">
            <span class="flex-grow-1">内容</span>
            <UiButton :ripple="{ center: true }">打开</UiButton>
        </div>
        <template #actions><UiButton variant="ghost">取消</UiButton></template>
    </UiCard>
    <button v-ripple class="pa-4 rounded">原生按钮</button>
</template>
```

`vRipple` 支持 false 或 `{ center, color }`，UiButton/UiTabs 默认开启。指针和键盘按住扩散、松开淡出，取消/失焦清理；禁用和减少动效不显示。该指令不添加点击行为或可访问语义，使用真正按钮承载操作。

Card 支持 outlined/elevated/tonal/flat，comfortable/compact 的 24/16px 内容间距。flush 可让 Tabs 和代码贴齐内容边缘；actions 独立分隔且自动换行。示例文档全部使用真实 UiCard。

`utilities.css` 全局随共享样式加载：`d-flex`、对齐、宽高、文本、overflow 与圆角；`ma/pa` 等 0–16 级间距（每级 4px）、x/y/t/b/l/r/s/e 方向、margin-auto 和 `ga` 间距。显示与 flex 方向支持 sm(600)/md(960)/lg(1280) 断点。工具类使用 !important，不宣称兼容 Vuetify 全量类名。

代码高亮只注册 XML/Vue、JavaScript、TypeScript、CSS 和 JSON。使用高亮器转义后的 HTML，未知语言转义为纯文本；复制始终取原字符串。语法色由 `--code-*` tokens 定义，没有 CDN 依赖。

## 悬浮滚动条与统一变体

UiScrollArea 参考 Element Plus 的悬浮滚动条交互：透明轨道、圆头滑块，悬停、聚焦、滚动或拖动时显示，`always` 可常显。支持 `height/maxHeight`、`axis="vertical|horizontal|both"`、滑块拖动和轨道点击；内容或容器尺寸变化时重新计算，无溢出时隐藏。滚轮、触摸和键盘仍使用原生滚动。必须提供 `label` 作为滚动区域名称。

`scroll` 事件返回 `{ scrollTop, scrollLeft }`，实例暴露 `element/focus/scrollTo/update`。代码块已复用此组件；应用其他原生滚动区域使用相同颜色与细滑块的全局样式，没有全部替换为自定义滚动组件。预览：`/ui.html#/scroll-area`。

Button、Input、Select、Tabs、Card、CodeBlock、ScrollArea 统一支持 `dense`、`ghost` 和 `:rounded="false"`。dense 缩小控件高度或内容间距，ghost 使用透明表面，rounded=false 去除圆角；保持错误、禁用和键盘焦点状态。既有 size、compact、density 参数继续兼容。Switch 等依赖固定形状表达状态的组件不机械套用这些变体。

组合预览 `/ui.html#/variants` 可同时切换三种属性，检查 Card 内表单、Tabs、代码和操作按钮的布局。文档当前共 39 页。

上述七类组件自己的页面也提供默认、dense、ghost、直角的独立演示及源码。滚动区域允许原生滚动衔接：横向区域不会阻断父级的纵向滚轮操作，滚动到边界后可继续滚动祖先容器。

垂直 UiTabs 可设置 `indicator-side="start|end"`，默认 end。LTR 布局中 start 将指示条放在左边，end 放在右边；RTL 随逻辑方向反转。内容在左侧时可用 start，让色条靠近内容；此属性不改变键盘导航或水平布局的底部指示条。Tabs 文档提供内容位置切换示例。


## 表格、服务端表格与分页器

- `UiTable`：headers/items/item-value/label 描述数据，保留原生 table/th 语义；支持 loading、空数据、固定表头、横向滚动，以及 `item.[key]`、`header.[key]`、loading/no-data 插槽。所有文档 API 表格已迁移。
- `UiDataTableServer`：接收当前页 items 与总数 items-length，通过 `v-model:page`、`v-model:items-per-page`、`v-model:sort-by` 管理参数；初始化和参数变化触发 `update:options`。单列排序按升序/降序/取消循环，点击排序或修改每页条数回到第一页。加载期间锁定分页和排序，支持 error/retry；不发请求、不对当前页二次排序或切片。
- `UiPagination`：独立 `v-model` 页码，length 表示总页数；自动校正越界值，首尾页、省略号、前后页和 aria-current。total-visible 控制 3–9 个连续页码，首尾页额外保留。原生按钮支持 Tab/Enter/Space。

三者均提供 dense/ghost/rounded 变体及各自文档演示。服务端表格复用分页器和 UiSelect：每页条数、记录范围、页码在窄容器自动换行。公开类型由 ui/index.ts 导出 TableHeader/TableSort/TableOptions。

服务端示例用本地 450ms 延迟模拟查询，带失败重试和请求序号保护；示例源码提供 fetch + AbortController 的接入方式，实际项目应使用自身 API 模块。调用方负责过期响应隔离和卸载取消。未实现行选择、分组、多列排序或虚拟滚动，也不宣称兼容 Vuetify 全量 API。

参考 [Vuetify 服务端表格](https://vuetifyjs.com/en/components/data-tables/server-side-tables/) 与 [分页器](https://vuetifyjs.com/en/components/paginations/)，保持 UAH 主题，没有引入 Vuetify Material 组件库依赖。

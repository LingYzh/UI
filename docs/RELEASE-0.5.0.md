# 0.5.0 图标协议迁移

## 新协议

`UIcon` / `UiIcon` 与组件的 `icon`、`prependIcon`、`appendIcon`、`clearIcon` 等图标入口共享 `IconValue`。从 `@mdi/js` 具名导入的 SVG 路径可以直接传入，无需逐项注册；也支持多路径数组、`[path, opacity]` 图层、Vue 组件和 `$alias`。

```vue
<script setup>
import { UiButton, UiIcon } from '@lingyzh/ui';
import { mdiAccount } from '@mdi/js';
</script>

<template>
    <UiIcon :icon="mdiAccount" label="账户" />
    <UiButton :prepend-icon="mdiAccount">账户</UiButton>
</template>
```

应用可使用 `createUI({ icons: { defaultSet, aliases, sets } })` 配置图标集；`@lingyzh/ui/iconsets/mdi-svg` 导出 `mdi` 集合及标准语义 `aliases`。各应用配置独立。内置控件默认图标改用语义别名，补齐 Carousel、Pagination 默认值，Stepper 图标通过统一渲染器显示。

## 需要检查的行为变化

- 未知名称、别名、循环别名及未知图标集在开发环境警告并留空，不再回退成 `file.svg`。业务有意展示文件图标时应显式传 `file`。
- 按钮默认插槽优先于非布尔 `icon` 回退。如果同时需要图标和文字，使用 `prependIcon` / `appendIcon` 或插槽。布尔 `icon` 继续控制图标按钮外观。
- 旧 `name`、`path`、有限 MDI 名称表和 `registerIcons` 保留，解析优先级为 `path > icon > name`；旧用户裸别名保留，新配置推荐 `$alias`。
- 默认语义别名只通过 `$` 引用，裸 `copy/close/edit` 等继续指向既有本地 SVG，避免升级后意外换图。
- 任意 `mdi-*` 字符串不会自动变成 SVG。使用具名路径导入，或者显式配置字体渲染器并加载字体资源。消费者直接导入 `@mdi/js` 时应声明自己的直接依赖。

## 验证与范围

发布前完整类型检查、327 项单测、文档及库构建、173 条文档路由与 21 组 UI 回归通过；另有图标专项 52 项源码浏览器检查、复制按钮 6 组、feedback 7 组、controls 6 组，以及独立 tarball 消费检查。详细结果与首次失败记录见本版发布证据。

本地 67 个 SVG 仍 eager 导入；单 Icon + `mdiAccount` 的独立消费入口 gzip 从 46,668 增至 51,180 bytes（+4,512），不是完整库体积。两个未使用 MDI 路径探针未进入此入口，不能据此宣称本地图标可逐项裁剪。本版同步图标值与集合协议，不宣称全部 VIcon API 完全一致。

# 文档导航与列表右侧内容

2026-10-08：UiPreview侧栏使用UList nav/UListItem，href与active由当前文档路由控制，selectable=false；保留原生链接、aria-current、方向键/Home/End、搜索和移动菜单。库入口已导出组件，无需新组件。

UListItem的appendIcon沿用Vuetify的属性命名，appendText是本库扩展。append插槽优先替换两个属性；辅助文本单行省略并提供title提示。共享layout-components.css在有内置appendText时分配主标题自然宽度，辅助名称优先压缩，极长主标题仍可在自身区域截断。自定义append插槽布局和独立交互语义保持原样。

Icon根节点为span，不能以a > span笼统设置主文本flex，避免图标容器占据剩余空间。侧栏当前320px，移动屏幕max-width为calc(100vw - 32px)，保留遮罩关闭区域；不再在1220px断点缩到238px。

真实示例src/ui/docs/component-examples/list-item.vue；源码/页面说明由scripts/generate-completion-docs.mjs生成，API说明来自scripts/sync-api-reference.mjs。先验收共享组件再接入侧栏。构建后node tests/desktop/docs-navigation.mjs可检查全部导航项文字、图标和键盘/搜索操作；2026-10-08生产证据artifacts/docs-navigation-F41jzi，typecheck/build/87单测/完整UI21组通过。

Windows125%系统缩放会影响旧桌面脚本的尺寸和1px精确断言，单独测试进程可传--force-device-scale-factor=1；这不替代真实页面125%缩放验收。完整记录见VALIDATION.md。本轮不发布npm或更新UAH依赖。

# Toolbar 整合与 Vuetify 4 字号

## 范围与依据

用户在复制图标修复期间追加：Toolbar 对齐 Vuetify，标题/操作整合到 Toolbar，组件遵守本库设计规范；随后明确整体字号也采用 Vuetify。root 盘点现有 Toolbar/Title/Items、默认属性容器、主题、Collapse、按钮、Tabs 与三个真实 demo 后亲自实现所有产品、样式和 demo。辅助代理只编写和运行专项测试。

依据官方 Vuetify 4.2.4 npm 包（`artifacts/vuetify-4.2.4.tgz`）中的 VToolbar、VToolbarTitle、VToolbarItems、全局 typography settings 及 Button/Input/Card/Table 等字号变量。公开资料：[Toolbar](https://vuetifyjs.com/en/components/toolbars/)、[字体排版](https://vuetifyjs.com/zh-Hans/styles/text-and-typography/)。原有 tokens、字体家族和明暗颜色保留。

## 实现

- Toolbar 直接内置标题与操作区：`title`/`#title`、`#actions`（兼容 `#append`），调用方无需再组合 Title/Items。独立组件保留兼容与独立文档；统一字体、12px内边距、4/8px间距、10px圆角和普通按钮尺寸。
- 对齐内容/扩展区结构、prepend/extension/image 插槽、四种密度（内容64/56/48/128px，扩展48/44/40/96px）、显式高度、自动/受控 extended、主题颜色及 on-color、背景图片、flat/elevation、border/rounded、floating、absolute/location、collapse112px与逻辑侧底角。扩展区有双向动画，关闭时 inert；减少动效关闭动画。公开 contentHeight/extensionHeight/element。
- 标题占据剩余宽度并省略长文本，不挤掉操作；prominent底部标题。Toolbar 按钮默认 text，操作区可提供颜色/variant 默认，按钮显式属性优先。彩色 Toolbar 的 Tabs 前景/状态层使用对应前景色。
- 字号以16px根字号和rem为基准。Vuetify4采用display/headline/title/body/label各三级，共15级：display57/45/36、headline32/28/24、title22/16/14、body16/14/12、label14/12/11。字号、行高、字重有同源数据；提供同名与sm/md/lg/xl/xxl响应式工具类，原工具类映射保留。
- 正文/输入16、辅助12、表格/普通按钮14、Toolbar标题20/prominent24；按钮五尺寸字号10/12/14/16/18，代码默认16。此字号决定替代之前“小字号加1至2px”的要求，不把历史字号增量当作当前规范。
- 新增 Typography 真实控件示例和15行工具类参考；三个 Toolbar 示例、显示/复制源码、API 描述、README 同步。`docs:sync`维护字号CSS、真实源码与API，240源码片段重复格式化updated0。153 canonical、1386 props/models、126 events、213 slots、281 exposed，168文档页。

## 验收证据

- 最终 typecheck、build、git diff --check通过：`artifacts/toolbar-typography-{typecheck,build,diff-check}-final.log`；API最终日志`toolbar-typography-api-final.log`，同步`toolbar-typography-sync-final.log`。87/87单测通过：`toolbar-typography-unit.log`。
- Toolbar最终8/8：`artifacts/toolbar-oQoLUT/report.json`；root验收8张原生PNG，包含浅深1440/390、显式80/32、浮动、Title与Items。确认密度、标题截断、按钮继承/显式覆盖、真实事件与Tabs、扩展双向中帧/关闭inert/减效、112px折叠。前一轮`toolbar-akpZws`由测试修正边框盒模型与h3根节点定位后通过；最终补充完整可见截图。
- Typography最终4/4：`artifacts/typography-e7zwLh/report.json`；root验收全部5张原生PNG，包含浅深宽窄、顶部字号、实际底部控件和真实125%缩放。15级computed字号/行高/字重、22→16响应式、输入/标签/提示/按钮、表格14px及工具类参考均通过。此前`typography-cvFxpl`底部截图落到页脚，不能作为控件视觉证据；已改为按控件定位并断言完整可见后重新截图。
- 全局字号改动后的完整UI21组/168路由：`artifacts/ui-7faSb6/report.json`；Forms14组：`artifacts/toolbar-typography-forms.log`，PNG在`artifacts/forms-p6VOoc`（此脚本不输出report.json）；ButtonLoading3组：`artifacts/button-loading-x3Dokh/report.json`。root另复核完整UI中的卡片表单、表格、浅深代码和200%文档截图，以及Forms浅色390、左标签深色1440与125%截图。完整UI/按钮回归早于最终折叠角CSS变量和工具类文档收尾；最终Toolbar/Typography专项已覆盖这些收尾。
- 字号改动后复制图标再次6/6：`artifacts/copy-icons-NbGjaD/report.json`，root复核浅色1440/深色390默认/成功4张PNG。专项无页面错误、产品控制台错误或Vue警告；隔离Electron宿主CSP开发提示单独记录。宿主均已关闭。

本轮不承诺所有Vuetify属性逐项兼容（如Material表面外观、完整location组合/SSR/RTL仍未全面验收）。UI仍main a8220aa/package0.3.2，未提交/推送/发布；UAH仍97c43a9、工作区干净，固定依赖未变。

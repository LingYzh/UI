# 全局组件接入

- createUI 默认注册全部公开 U* / u-* 组件以及 Ui* 兼容别名；模板无需逐项导入。components:false 主动禁用组件注册，组合函数/服务/h()/动态组件对象依然需要 JavaScript 绑定。
- 2026-10-15 Admin 接入时发现 UTreeTable 公开导出但未进入全局注册表，已补齐。注册表生成器旧版会覆盖 UFormField 别名并丢失人工类型/工具导出，现保留公开入口原契约后补新增组件；生成可重复且不改既有 index.ts。
- 接入指南加入真实 GlobalComponentsDemo，仅导入 Vue ref，覆盖 PascalCase 和 kebab-case。已有各组件 demo 的显式导入继续兼容。README 明确单次安装插件与 theme 配置。
- 专项：node --import tsx --test tests/component-registration.test.ts tests/layout.test.ts tests/tree-table.test.ts；正在运行的文档服务下 node tests/desktop/global-components.mjs。证据 artifacts/global-components。
- 用户已授权推送与升级，UI准备发布0.6.3。完整类型检查、387项测试、双构建和Electron完整回归通过；发布结果以后续RELEASE-0.6.3-evidence.json为准。Admin升级后可移除入口对npm0.6.2树表遗漏的兼容。

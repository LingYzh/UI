# Vuetify 使用方式补齐与 u- 前缀迁移

用户授权：补齐 2026-10-06 审计中的组件与能力，并将模板引用前缀统一为 `<u-xxx />`。保持原 UAH 视觉风格，先 UI 组件、公开 API、真实 demo 和文档，验收后才能发布及升级消费端。

## 已定设计

- canonical 导入为 UButton/UForm 等，模板为 u-button/u-form；保留既有 Ui* 导出作为兼容别名，不强制消费端立刻迁移。新组件使用 U* 文件/导出名。
- createUI 插件提供 u- 全局组件注册和 defaults/display/theme/locale/icons 配置；也支持按需 U* 导入。内部 CSS/token 名称不作为模板前缀迁移对象。
- 色彩继续用 --background/--surface/--text/--muted/--border/--accent 及已有主题 tokens。正文13px，控件默认36px、compact28px，间距4px步进；面板圆角沿用现有变量。表单 label/hint 内置，hint 在控件下方，labelPosition 支持 top/left。
- 交互沿用指针操作释放焦点、键盘操作保留焦点，文本输入保持编辑焦点；菜单/对话框处理 Tab/Escape 与恢复焦点。减少动效与现有偏好一致。
- Form 只管理状态与验证；布局用 Row/Col。统一 density/variant/color/details/clear API，与 dense/ghost/rounded 兼容。所有可继承属性保留省略/true/false 区别。
- 断点采用 Vuetify 4.2.3 的0/600/840/1145/1545/2138，由 display 服务与响应式样式共享。Row gap 支持数值/CSS长度/[水平,垂直]；优先响应式工具类，不扩散已弃用的布局属性。
- Select/Autocomplete/Combobox 共享 items 标准化与选择模型，支持数字/字符串/对象、multiple、returnObject、itemTitle/itemValue/itemProps、比较器、清除和 chips。原生单值插槽用法继续兼容。
- 数据表格明确客户端和服务端职责，补选择/展开/分组/多排序/搜索/虚拟化；日期/数字/文件等控件必须有真实值模型和边界行为，不能用空壳别名替代。
- 稳定组件与 Labs 分开记录。以真正实现的能力更新审计状态，不宣称逐属性完全相同。

## 写入范围

root：**用户最新明确要求，所有视觉部分由 root 直接实现**，包括所有组件的视觉模板/排版/CSS/视觉状态/动效与真实视觉 demo；另负责基础配置/验证/display/指令、旧组件的统一接入、公开入口、命名前缀迁移、文档集成/API生成、检查与视觉验收。

表单 worker：独立选择器/组控件/专门控件的模型、事件、状态逻辑、算法及测试。停止视觉模板/CSS/demo写入；已有草稿交 root 接管。

布局展示 worker：应用布局注册和占位数值、列表/树/虚拟化状态、Overlay 生命周期与测试。所有视觉模板/CSS/demo由root实现。

数据体验 worker：数据管线/选择分页排序、日期算法、步骤/折叠/窗口/媒体生命周期与测试。所有视觉模板/CSS/demo由root实现。

共享 index/styles/content/apiReference/tests helper 由 root 统一合入，避免并行编辑。不得加新依赖，不发布/提交，不修改 UAH，不再派下级代理。

## 验收清单

- [x] u- 模板、U* 导入、createUI 注册，Ui* 兼容可用
- [ ] defaults/display/locale/icons/goto/rules 与公共指令
- [ ] Form/Field/Input/选择控件公共状态与布局一致
- [ ] 选择器与组控件/专门输入
- [ ] 应用布局/Overlay/列表/树/虚拟化/基础展示
- [ ] 客户端/服务端数据组件
- [ ] 步骤/折叠/窗口/轮播/媒体/扩展组件
- [x] 所有公开组件具备实际 demo、可运行源码和当前 API
- [x] typecheck、源码契约/模型测试、构建、全 UI 与重点交互通过
- [ ] root 浅深、窄屏、缩放、键盘/长内容/减少动效视觉验收记录
- [x] 审计与交接更新；明确未发布状态

本次实现和验收范围详见 VALIDATION.md 的2026-10-06增量。101个新增示例均拆分独立页面；最新全UI21组、162路由、82单测通过。未勾选的家族仍需完整交互/状态对等验收，不能由逐页smoke推定完成；原审计实现进展保留尚未对齐的组件及Labs范围。

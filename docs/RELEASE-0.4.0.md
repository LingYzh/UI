# UI 0.4.0

此标签首次CI因API文档源码表达式的CRLF/LF差异失败，Publish未执行；正式发布改为0.4.1，包含下列同批迁移及生成器换行修复。v0.4.0保留为失败尝试记录，不作为已发布npm版本。

本版本包含 `codex/handoff-component-alignment-20261008` 累计组件协议修复、真实示例与文档整理。用户已授权先合并 UI 主分支并发版，再从正式 npm 包适配 UAH。发布结果以 `.Codex/memory/publishing.md` 的最新记录和官方 registry 为准。

## 升级时检查

| 范围 | 0.4.0 协议及迁移方式 |
| --- | --- |
| List / Tree 激活 | 默认 `single-independent`：单项、再次点击可取消。使用其他激活策略时显式指定 `activeStrategy`。 |
| List 插槽 | `#item` 替换整行；只替换标题改用 `#title`。整行实现需传递行属性与事件。 |
| Tree 注册 | 默认仅注册已渲染节点；需要关闭分支也参与模型与选择策略时，指定 `itemsRegistration="props"`。空数据与无匹配结果默认显示本地化提示。 |
| Overlay / Menu / Dialog | 统一使用 DOM 层，支持 attach/contained/absolute/zIndex；最高层负责关闭、焦点与滚动锁。Tooltip 保留原生 popover。检查业务代码是否依赖原生 dialog/popover 方法或 `:modal`。 |
| Menu 键盘 | 普通菜单由 Menu 处理方向键，Tab/Shift+Tab 在可聚焦项间遍历，到边界关闭；`panel` 自由内容由其内部组件导航。 |
| Stepper | 默认本地化文案与严格 editable；multiple 导航将目标变为唯一已选项，Window 按注册顺序显示首个已选步骤。垂直终点实际发出 finish。 |
| Window / Carousel | 默认离场后卸载非当前内容；需要保持表单或子组件状态时显式 `eager=true`。 |
| Tabs | 新组合使用 TabsWindow/Item。迁移旧 TabPanel 时共享显式 modelValue/idPrefix，并用 eager、transition=false、keyboard=false 保留旧持久性和键盘边界。独立旧 TabPanel 与 Ui* 入口仍保留。 |
| 原同名扩展 | 旧表单 Field、选项 Picker、键盘 Listener 的标准入口为 UFormField、UOptionPicker、UHotkeyListener；新 UField/UPicker/UHotkey 承担标准职责。UiField 等旧兼容别名继续保留，不能机械替换名称。 |
| ItemGroup | 标准 selected 为注册 ID 数组，isSelected/select 接收 ID；兼容公开值查询用 isValueSelected，toggle 仍按值。 |
| FileUpload / FileInput | accept 只限制系统选择器；实际过滤用 filterByType。rejected 输出 File[]，原因用 rejected-details；Upload 单文件模型 File/null、多文件数组，默认显示大小与移除操作。 |
| 日期与 Snackbar | 未指定周起点按语言地区推断，显式属性优先。Snackbar 默认允许 Escape/外部关闭，persistent 显式阻止；普通条默认5000ms，服务默认6000ms。服务 Host 由服务唯一计时。 |
| ConfirmEdit / Hover / Defaults | 本批按已批准策略统一标准行为；依赖旧深克隆/显示、禁用状态或 defaults reset 回溯行为的调用方应复核。 |

应用布局继续保留原默认，显式 `layoutMode="ordered"` 启用按 order 分配四边空间。Img、Tooltip、DataIterator 的既有本库协议默认继续保留，标准模式由 `standardProtocol` 显式开启。

## 实现与文档

- Progress、Spinner、MenuItem、SnackbarHost 分别复用 Linear、Circular、ListItem、Snackbar，同时保留旧入口的几何、模型、角色与插槽。
- 文档保留173页数据及158项组件 API；使用目录按26家族收纳到125入口，16分类可折叠。旧子页 URL、精确 API、搜索和示例链接继续可用。
- 数据表格的客户端、服务端、虚拟模式保留各自子页；水平/垂直 Stepper、Chip/ChipGroup、Snackbar/Queue、Button/按钮组保留独立主边界。
- API 文档的静态插槽转发识别已修正，消除误推导的公开插槽；没有删除运行时公共插槽。
- TabsWindowItem 将 class/style、原生属性与事件转发到语义面板根。Menu/Dialog/Overlay 支持组件触发器暴露的 element，修复 UButton 重渲染后 Escape 焦点不能归还的问题。
- Dialog 在最高层 Escape 捕获处理时记录键盘焦点归还，修复鼠标打开抽屉、Escape 关闭后触发器失焦的问题。

组件全库深度审计仍保留未覆盖项。本次发布完成已授权批次，不代表与 Vuetify 全部行为等价。逐批范围见 `component-audit-2026-10-08/`、HANDOFF 与 VALIDATION 最新入口。

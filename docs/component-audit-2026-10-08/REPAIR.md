# 全库对齐修复进度

修复依据为本目录 REPORT.md 中的逐项审计，基准 Vuetify 4.2.4。原报告保留为修复前快照，不因修复后属性名存在就改成兼容完成。

用户授权修复全部报告差异，保留本库新增特性；冲突先询问。当前处于实现阶段，尚未完成全库验收。经济型执行继续使用 gpt-6-luna/max，Root 负责契约决策、样式、真实用例及最终验收；执行代理不得递归委派。

## 已确认的兼容决策

- 保留本库默认值，补齐可显式配置的标准能力。
- Counter 保留字符串 Unicode 码点计数和 active=true；新增 displayMode="value" 显示原值，标准插槽保留原始 value。
- 旧 UField 更名 UFormField，UiField 仍为旧实现；旧 UPicker 更名 UOptionPicker；旧 UHotkey 更名 UHotkeyListener。旧组件本轮保留且不设弃用日期。原名称承载标准能力版本，同时加入可兼容的原有特性。
- Img 的 load/error 默认仍为 DOM Event；Tooltip 的 default 默认仍为触发器；DataIterator 的 items 默认仍为原始项。标准协议通过显式开关选择。
- InfiniteScroll direction 接受旧 start/end（以及扩展 both）和标准 vertical/horizontal；side 承载标准加载边缘。默认仍纵向、end 边缘。
- UItemGroup 用户选择统一标准 selected ID 数组并迁移旧用例；isSelected/select 按 ID 操作，selectedValues 提供公开值，旧按值判断以 isValueSelected 保留，toggle 继续按值。UItem 默认按钮保留，tag=false 是显式无包装入口。

## 已实施与专项边界

- 分组配置由布尔快照改为响应性 getter：Window、Carousel、Stepper、ExpansionPanels 的相关消费者专项验证。
- 强制分组空模型初始选择首个同步注册项；受控模型回写前不被后注册项覆盖，首项同步卸载仍有有效回退。
- Radio 接入 RadioGroup、对象比较、独立真值、name 和禁用/只读；Form validate/reset、内联 rules、原地替换闭包及 trueValue-only 专项通过。
- Form 修复重建空 errors 数组触发递归渲染、重建内联 rules 函数导致校验取消；相同数组原地换规则仍会失效并读取新闭包。
- Counter 直接显示模式、字符串 max、超限 disabled、标准 default 插槽。
- UField 新输入装饰表面；UPicker 新容器并保留 items 扩展；UHotkey 新平台展示并保留 trigger 监听；三类旧实现保留。
- 公共 createUI 入口 156 canonical 注册、上面七类真实示例与契约专项通过；修正新 Field 复用旧默认两列后压缩输入，以及 Picker 横向隐藏头部仍留下空列的问题。视觉复核继续进行。
- Img/InfiniteScroll 真实组件专项及隔离类型检查通过，含真实图像请求、陈旧回调、内联 src 对象重建、独立边缘回调与 prepend 保持；数字字符串 margin 现在加 px，0 有效。Tooltip 标准协议/交互/外部锚点/滚动策略与 click 模式专项通过，Root 已复核开态窄屏图。
- DataIterator 状态层 14 项与公开 Chromium 集成 11 组通过；itemsLength 只跳分页切片，本地过滤排序分组保留。标准 currentItems 给包装分页行（含组行），手动长度不发标准事件；标准 search 重置 page。Electron host 创建窗口未成功，该专项只证明 Chromium 源码 renderer。真实旧示例显式 standardProtocol=false，防全局配置覆盖后卡片字段丢失。
- Lazy/Responsive 真实组件专项与类型检查通过；Lazy 修复连续观察重建引发双通知，以及原子 reenable/model-reset 时序。Responsive 640px 上限、additional、180×90 inline 推导与窄屏无横向溢出有几何证据。
- Messages/Label 公开入口与真实示例专项通过，保留默认及旧插槽；新增 active/message/text、颜色和过渡配置，验证标签点击聚焦。Root 已复核窄屏 DataIterator、深色消息与标签截图。
- Parallax/PullRefresh Vite+Electron集成、ItemGroup/Item/Chip/按钮注册Chromium集成10组、Locale状态16项与真实Provider Electron专项已通过，Root复核当前截图；分组13项状态测试及各scope类型检查通过。最终台账28项部分验证、125项待处理，用户要求换设备交接后停止，尚未完成全库修复。

## 尚未取得用户决定的冲突

此前已询问 UConfirmEdit 的常显深克隆草稿与旧 begin 开启编辑、UHover 的 disabled 保留/恢复状态与旧清空、UDefaultsProvider reset=true 根回溯与旧清空继承的同名协议。用户尚未答复；本轮没有修改这三项冲突行为。恢复时先取得决定，再实施相应分支。

## 验证规则和剩余范围

日常仅专项测试、隔离类型检查和必要的源码浏览器/视觉验收，不做完整构建或全量测试。提交推送前才进行完整检查。本轮不提交、不推送、不发布，不改相邻 UAH 的消费依赖。

后续按报告逐项推进表单/选择、导航弹层、媒体与数据、布局展示 API，同步真实 SFC、复制源码和 API 文档。未逐项标明证据的组件仍未完成修复；扩展和同名职责不能用名称检查视为对齐。

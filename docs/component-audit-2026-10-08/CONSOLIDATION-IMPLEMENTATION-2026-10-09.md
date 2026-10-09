# Vuetify 合并方案落地

日期：2026-10-09。用户已批准 VUETIFY-CONSOLIDATION-2026-10-09.md 的方案。本批完成使用文档收纳、四处实现复用和 Tabs 示例迁移，保留原有公共导出、兼容协议和已经裁定的默认行为。

## 实际完成

| 范围 | 落地结果 |
| --- | --- |
| 文档目录 | 原173页数据保留；26个显式使用家族，16个分类折叠组，125个可导航使用页。独立组件 API 目录保留158项。 |
| 家族页面 | 同页聚合成员示例与使用约定，通过组件选择器查询独立 Props/Emits/Slots/Expose。共享示例只挂载一次，避免重复 DOM ID 与注册上下文。 |
| 路由与搜索 | 旧子页裸 hash 选中并滚动到该子组件 API，保留原 URL；examples/usage/API hash 定位对应内容。搜索继续匹配子组件名，Enter 进入准确的子 API。上一篇/下一篇按使用目录排列。 |
| 数据表格 | 家族菜单可折叠，客户端、服务端和虚拟表格保留三个使用子页；UTable 独立。 |
| Progress | UiProgress/UProgress 复用 UProgressLinear 的数值归一化与绘制；单向 value、tone、dense、6/4px、缩放填充与 ARIA 保留。稳定 Linear/Circular 入口独立，未引入 Labs VProgress。 |
| Spinner | 复用 UProgressCircular indeterminate；保留16px默认、24px坐标内半径9/线宽2.5/四分之一弧线、800ms旋转，减少动效时1600ms。仅外层带 label 的 status 播报。 |
| MenuItem | 复用 UListItem 行结构，保留角色、checked、disabled、keepOpen、danger、icon/trailing。标准菜单真实示例使用 List/ListItem，旧 MenuItem 示例作为兼容验证继续保留。 |
| 菜单键盘 | 普通 Menu 统一处理方向键；自由内容 panel 将 List 导航交还内容组件。整行插槽与 track 根节点不会再双重处理。Tab 保留当前负 tabindex 行的 DOM 位置，向前/向后寻找可 Tab 目标，到边界关闭。 |
| SnackbarHost | 服务宿主复用 USnackbar 表面，保留六位置与外层堆叠/过渡。内部 timeout=-1，服务是唯一计时所有者。普通消息 status/polite，错误 alert/assertive；pointer/focus 暂停分别管理，卸载清空通知及计时器。 |
| Tabs | ExampleCard、LayoutDemo、VariantExample 和正常标签示例迁至 TabsWindow/Item，保持显式模型、ARIA 前缀、eager、无切换过渡与原键盘边界。panel-persistence 保留旧 TabPanel 协议示例。 |
| API 生成 | 修正静态插槽改名转发的识别：消费子组件的 prepend/title/append 不意味着兼容 MenuItem 暴露这些名字。同步后158组件、2704 props/models、324 emits、604实际公开slots、541 exposes。数量变化来自移除误推导的 API 行，没有删除运行时公共插槽。 |

文档家族包含 App/Main/Layout、Grid、List、ExpansionPanels、Tabs、水平与垂直 Stepper 各自的配套组件、Toolbar、AppBar、Breadcrumbs、ItemGroup、SlideGroup、Window、Carousel、Timeline、按钮组，以及已批准的 CheckboxGroup、ColorSwatches、表单布局、HotkeyListener、ConfirmHost、服务宿主和旧兼容入口扩展章节。Chip/ChipGroup、Button/按钮组、Snackbar/Queue、水平/垂直步骤仍保留独立主入口。

## 兼容边界

- 未删除组件导出或48个 Ui* 别名，未改变既有 Layout、Tree、List、DOM 浮层和 Stepper 的用户裁定。
- TabPanel 的旧显式 modelValue/idPrefix 协议仍可独立运行。迁移示例后复核认为，直接 alias 到依赖注册上下文的 WindowItem 会改变挂载、禁用、ARIA 和焦点协议，因此保留小型兼容实现，并在使用页明确新组合。进一步移除旧入口需要版本迁移决定。
- UAH 未修改，仍消费正式 npm 0.3.2；本次迁移调用方限 UI 项目真实示例。

## 验收

- API/导航/示例专项单测：21/21。
- `vue-tsc --noEmit -p tests/tsconfig.component-consolidation.json`：通过。
- Vite 源码 + Chrome 组件专项：12组，通过；包括进度/Spinner、菜单整行插槽与 track/panel 键盘、Tab/Shift+Tab、旧 TabPanel、Snackbar 六位置、默认时长、暂停、超时和卸载。
- 真实文档 Vite + Chrome 专项：57项，通过；包括 API 选择器、全部158 API、旧路由定位、搜索/返回、折叠与键盘、手机关闭及视口无横向溢出。
- Root 检查8张文档截图和1张组件夹具截图。125%结果为312×800 CSS viewport + DPR1.25的模拟，截图390×1000像素，不是原生 Ctrl+ 缩放。
- 两套浏览器报告无运行错误或 Vue 警告；报告记录运行前后源码 hash，无在途变化。版本化证据见 `checkpoint-evidence/2026-10-09-component-consolidation.json`。

早期夹具修复包含 Chrome channel、直接导入组件、导入别名、函数插槽与独立通知避免被菜单点击关闭。Progress 的首次矩阵0.612237是连续改值期间的过渡中间帧，最终断言等待0.5及目标颜色；Tab 返回较早根节点则是真实实现问题，按固定 Vuetify4.2.4源码修正后复跑。不得将早期失败说成从未发生。

## 当前工作区

UI 基于8873720，分支 codex/handoff-component-alignment-20261008；UAH 基于86f75d4且干净。本批未提交、推送、构建或发布。完整 typecheck/test/build/Electron UI 仍是用户要求提交或推送时的门禁；本批专项结果不代表全库历史审计全部完成。

调度保持经济方案：首批四名限定任务执行者中两名 CCS Luna；验证夹具经具体指导仍重复出错，按既定规则升级一次到 gpt-6-sol/medium。Root 负责方案、共享 CSS、实现修正和最终验收；普通执行者未递归分派。

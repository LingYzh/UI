# 当前批次后的续作边界

## 2026-10-09 合并方案已获批准并执行

用户“就按照这个方案来”批准最新 Vuetify复评；26家族使用页、API目录/选择器、旧链接/搜索、Progress/Spinner/MenuItem/SnackbarHost复用及Tabs示例迁移已完成。下方“清单不能当授权”仅保留历史，在本次明确批准范围内不再待确认。详情与兼容边界见 CONSOLIDATION-IMPLEMENTATION-2026-10-09.md；21单测、56文档检查、12组件组及专项类型检查通过。

TabPanel保持独立旧显式模型协议，不直接alias；其他公共导出和别名均保留。没有版本升级、提交、推送或发包；UAH仍干净且使用npm0.3.2。后续删除兼容入口或升级消费方是新的版本迁移决定。若要求提交当前工作区，先跑完整门禁；本批不自动启动全库其他审计阶段。

## 2026-10-09 后续 demo 导航整理

16组Vuetify分类和折叠菜单已完成，所有173页面/158组件保留；专项13单测及45项Chrome检查通过。合并候选见本目录 COMPONENT-CONSOLIDATION-2026-10-09.md。用户已明确要求先列清单，由用户最后决定如何合并；下一批不得将该清单直接当成执行授权。最新证据见根VALIDATION和checkpoint-evidence/2026-10-09-docs-navigation-groups.json。

## 2026-10-09 续作完成入口

下表六组交接范围已在后续会话实现并专项验证，详见根 HANDOFF、VALIDATION 最新节及各 `.Codex/memory/` 文件。该表保留原始审计范围用于追溯，不再是当前未完成列表。所有实质默认/模型冲突均已得到用户答复并落实，不再等待答复。

当前未提交 UI 工作区基于 8873720；UAH 基于 86f75d4 且干净，仍消费正式 npm 0.3.2。没有新的提交/推送/发布；若用户要求提交，再运行完整 typecheck/test/docs+lib build/Electron UI 门禁。全库历史深度审计另有部分验证范围，不能用本次六组完成替代全库验收。

用户于 2026-10-09 要求：完成手中批次、更新交接、提交推送后停下。全库深度对齐尚未完成；下一会话先读根 HANDOFF 和 VALIDATION，再检查两个仓库真实状态。

## 已裁定

- Tabs：null 是有效值，undefined 是空选择；对象/数组比较、多选/max、稳定注册和唯一键盘入口已补齐。
- Tooltip：保留上方、8px、滚动关闭默认，显式属性可切换；触发插槽、eager=true、closeOnBack=false 继续保留。
- 文件控件：Upload 默认显示大小/移除按钮；FileInput 默认完整名称。accept 只筛选对话框，filterByType 校验；拒绝文件和拒绝原因分通道；模型按已批准的单文件/多文件规则输出。
- 不采用“剩余差异自动统一”的总原则。其他实质默认或模型冲突仍询问用户。

## 应用布局已裁定并续作

本会话用户已确认保留旧默认，显式 `layoutMode="ordered"` 启用 order 逐项分配四边空间。实际组件已接入有序几何、公开 overlaps 与嵌套 absolute 定位，Chrome专项8组通过，root复核真实demo宽屏、390px暗色和125%缩放；详见 `.Codex/memory/layout-order.md`。下面旧批次审计范围仍作逐项对照，已补内容以根HANDOFF及项目记忆为准。

layout-completion helper 具备稳定命名、查询、重排、四边累计及命名 overlaps。UApp/ULayout公开 `layoutMode` 和 `overlaps`；legacy模式继续原有几何，ordered模式才消费命名重叠。tag/fullHeight、ULayout尺寸和栏/侧栏name/order继续保留。

## 此前只读审计范围（本轮已完成）

以下为前一停止检查点与固定 Vuetify 4.2.4 的对照范围，本轮已按用户裁定完成实现。旧缺失字段数不能直接换算任务量。

| 家族 | 后续范围 |
| --- | --- |
| Stepper | items 驱动 header/window/actions、multiple/max/editable/hideActions；Actions 文案/禁用/事件/槽；Item rules/状态槽/group:selected；WindowItem 过渡及事件转发 |
| Vertical Stepper | 目前仅基本 Stepper 包装；标准垂直 Item/Actions、逐项展开/规则和 finish 事件未实现 |
| List | track 的根单一 tab stop / aria-activedescendant；对象模型/比较器/activeStrategy；整行 item 槽及状态槽；Group isOpen；明确 open/select 值和路径/注册 refs |
| Treeview | filterMode/customKeyFilter/ignoreAccents/noFilter；itemType/openAll/空状态/操作槽；click:open/select；activeStrategy/itemsRegistration；省略 items 的安全默认 |
| Overlay/Menu/Dialog | attach/contained/absolute 容器语义；scrim 字符串/opacity/zIndex 与 native top layer 的映射；完整 transition 配置和更多嵌套焦点/Tab 行为 |
| Tooltip | 显式 closeOnBack=true 尚未复用路由取消回退机制；命名 transition 未完整消费。保留默认位置/间距/滚动规则 |

菜单分支外部关闭、KeepAlive 停用清理和非 Menu 注入边界属于本次已经在做的收尾批次，其最终结果以 HANDOFF / VALIDATION 为准。

## 继续操作

1. 核查 Git 分支、HEAD、工作区和现有服务，不把历史交接状态当现状。
2. 固定测试依赖源码可运行 `node scripts/prepare-upstream-router-fixtures.mjs` 准备，脚本核对官方 tarball integrity，拒绝覆盖不匹配缓存。
3. 日常继续只跑专项和隔离类型检查，完整门禁留到下次提交推送。真实视觉 demo、共享 CSS 和最终验收仍由 root 负责；本会话经济型子代理只承担明确非视觉任务。
4. UAH 继续固定消费已发布 npm `@lingyzh/ui@0.3.2`，不接入 UI 未发布源码。本会话未提交推送；提交、标签与发布均按后续用户明确指示执行。

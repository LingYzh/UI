# 当前批次后的续作边界

用户于 2026-10-09 要求：完成手中批次、更新交接、提交推送后停下。全库深度对齐尚未完成；下一会话先读根 HANDOFF 和 VALIDATION，再检查两个仓库真实状态。

## 已裁定

- Tabs：null 是有效值，undefined 是空选择；对象/数组比较、多选/max、稳定注册和唯一键盘入口已补齐。
- Tooltip：保留上方、8px、滚动关闭默认，显式属性可切换；触发插槽、eager=true、closeOnBack=false 继续保留。
- 文件控件：Upload 默认显示大小/移除按钮；FileInput 默认完整名称。accept 只筛选对话框，filterByType 校验；拒绝文件和拒绝原因分通道；模型按已批准的单文件/多文件规则输出。
- 不采用“剩余差异自动统一”的总原则。其他实质默认或模型冲突仍询问用户。

## 应用布局尚待决定

当前实际组件继续保留侧栏避开全部顶/底栏的旧几何。未答问题是：是否统一按 order 逐项分配四边空间，先注册的侧栏可占满高度、后续顶栏从侧栏旁开始。

layout-completion helper 已具备稳定命名、查询、重排、四边累计及命名 overlaps，专项 8 项和旧 5 项通过。公开 UApp/ULayout 已补 tag、fullHeight 和布局查询，ULayout 补尺寸；栏和侧栏补 name / 字符串 order。**公开 overlaps 属性没有加入**，避免声明暂时不改变组件几何的能力。后续确定默认几何后再接入实际布局样式、overlaps、nested absolute 定位和真实 demo。

## 最新只读审计确认的残留

以下来自当前源码与固定 Vuetify 4.2.4 对照，未在本次停止前开始新实现。旧缺失字段数不能直接换算任务量。

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
4. UAH 继续固定消费已发布 npm `@lingyzh/ui@0.3.2`，不接入 UI 未发布源码。两仓本次只提交推送交接分支，不打版本标签、不发包、不升级消费端。

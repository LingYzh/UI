# 四类表格稳定功能对齐

2026-10-08 用户确认全面补齐 UTable/UDataTable/UDataTableServer/UDataTableVirtual 的稳定功能、属性、事件、插槽和真实用例，保留本库外观；每页选择框最终为13px。组件复用 UiScrollArea/UiSelect/UiPagination/UiButton/UTransition；三种数据表共用 DataTableCore、data-table-state、data-pipeline、data-table-virtual，维护公开 wrappers 和 imported types。禁止在 wrappers 重建各自管线。

官方基准固定 Vuetify4.2.4。scripts/audit-table-contracts.mjs 对照官方解压包 propsFactory、d.ts 插槽和 emits/Rows事件；清单 docs/TABLE-ALIGNMENT-AUDIT-2026-10-08.json 名称缺口均0，不能把该名称结果当行为或跨平台完全兼容证据。详解和差异见 docs/TABLE-ALIGNMENT-2026-10-08.md。

8个真实用例位于 docs/table-examples，sync-table-docs.mjs 同步全源码与基础示例，docs:sync 已接入。table-alignment专项19组、分页7组、虚拟滚动4组几何及交互、指定单测19项、API2项、表格入口类型检查通过。证据 artifacts/table-alignment-F0WPkZ、table-footer-d0Avdd、virtual-table-qDcB8h；root查看相关浅深/窄屏/缩放/文档页截图。日常不完整构建或跑全量，提交推送前再全检查。

接口细节：ignoreAccents 为 true/target/query，复用现有v0 findMatchRanges以保留原文字高亮坐标；自定义sort返回null跳过该列，mustSort只保留最后一列；未指定group order不排序。openAll保持用户收起，false→true打开所有现有组。标准分组单元格槽是data-table-group/data-table-select，兼容group-header前缀；插槽可返回完整td。body替换仍保留prepend/append。loader scope有color/isActive，side支持start/end/both。update:currentItems返回内部分页项/组，slot.items原始数据；虚拟options每页为-1。

兼容差异：pageBy默认auto（分组按根组），上游默认any可显式配置；hover既有默认开启；height虚拟外框语义；主题/图标/locale/动画使用本库，完整tr展开槽自管结构，旧正文槽用UTransition。服务端跳过本地过滤排序/切片，all选择仅已传入当前页。移动断点lg1145，mobile=false传统列。保持Ui*别名、dense/ghost/rounded/ripple及原有回调。包版本0.3.2，未提交/推送/发布，入口前已有lockfile改动保留，UAH原有变更未处理。

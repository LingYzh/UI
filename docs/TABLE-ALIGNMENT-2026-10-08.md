# 四类表格稳定接口与真实用例对齐

2026-10-08，用户确认范围为 UTable、UDataTable、UDataTableServer、UDataTableVirtual 的稳定功能、属性、事件、插槽及真实用例，保留本库外观。每页数量选择框单独设为 13px；原有自适应宽度、计数不压缩和窄屏换行继续保留。版本仍为 0.3.2，改动尚未提交、推送或发布。

## 盘点与实现

开发前确认现有四类表格、公开入口与文档页面；复用 UiScrollArea、UiSelect、UiPagination、UiButton、UTransition、图标、主题、locale、defaults 和 ripple。原有三种数据表的过滤、选择、展开、分组、虚拟窗口实现不一致，缺少嵌套表头、完整列映射、结构插槽和大量标准策略。现在通过私有 DataTableCore、共享数据管线与状态统一，公开组件仍使用原来的入口和兼容别名。

| 组件 | 补齐内容 | 新真实用例 |
| --- | --- | --- |
| UTable | 原生结构与 top/wrapper/default/bottom；密度、网格线、交替行、固定表头/页尾、标签与主题；保留 headers/items 的便利接口 | layout |
| UDataTable | 自动表头、嵌套表头、字段/数组/函数取值、固定列、列属性、过滤/排序、选择/展开/分组策略、分页、结构插槽、事件、移动布局 | columns、filter-sort、selection-expand、grouping、slots |
| UDataTableServer | 共享列/选择/展开/分组/布局；服务端总数、查询参数事件、全部选项、加载与重试、自定义页脚 | server |
| UDataTableVirtual | 共享列与本地数据处理；一万行、实际行高测量、展开/分组测量、稳定缓存键、overscan、scrollToIndex、搜索排序后真实滚动复位 | virtual |

用例位于 `src/ui/docs/table-examples/`，挂载在四个已有文档路由。`scripts/sync-table-docs.mjs` 从实际 SFC 生成源码，`docs:sync` 已串入该步骤。源代码中的包导入在展示时转换成 `@lingyzh/ui`。

## 稳定接口核对

基准为官方 npm 包 Vuetify 4.2.4 的 propsFactory、类型声明和运行源码：

- [VTable](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VTable/VTable.tsx)
- [VDataTable](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VDataTable/VDataTable.tsx)
- [VDataTableServer](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VDataTable/VDataTableServer.tsx)
- [VDataTableVirtual](https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/src/components/VDataTable/VDataTableVirtual.tsx)

`TABLE-ALIGNMENT-AUDIT-2026-10-08.json` 保存逐项清单；属性包含继承的 class/style，事件包含 Rows 从 attrs 转发的行/分组事件，动态插槽由 header.* / item.* 覆盖。

| 组件 | 上游属性/模型名 | 上游插槽名/模式 | 上游事件名 | 名称缺口 |
| --- | ---: | ---: | ---: | ---: |
| UTable | 11 | 4 | 0 | 0 |
| UDataTable | 82 | 30 | 15 | 0 |
| UDataTableServer | 77 | 30 | 14 | 0 |
| UDataTableVirtual | 67 | 27 | 12 | 0 |

名称核对只说明公开入口覆盖；行为由下述专项验证证明，不能单独等同于所有平台上的完整兼容。

关键语义：

- 过滤支持 some/every/union/intersection、自定义列函数、filterKeys、noFilter；ignoreAccents 支持 true/target/query。复用已有 `@vuetify/v0/utilities` 的 findMatchRanges，确保重音转换和多次匹配后高亮仍定位原文。
- 排序支持列取值、sort/sortRaw/customKeySort、初始方向、mustSort、多列与修饰键优先级；自定义比较返回 null 跳过该列。mustSort 只阻止清掉最后一个条件。未声明 order 的 groupBy 保留输入顺序。
- 选择支持 page/all/single/自定义策略、不可选行、对象模型、比较器和 Shift 范围；当前页全选保留其他页模型。展开支持 single/multiple、expandOnClick 与受控模型。
- 分组支持嵌套、opened、openAll、groupKey、分组选择与汇总；openAll 只打开新增分组，手动收起不会被普通更新覆盖。pageBy 支持 item/group/any 及本库 auto。
- 标准 data-table-group/data-table-select 可返回完整 td；group-header/group-summary/expanded-row 可返回完整 tr。body 替换正文时 body.prepend/body.append 仍显示。loader 提供 color/isActive，loading.side 支持 start/end/both。
- update:currentItems 提供标准内部数据项或分页分组节点；槽中的 items 保留原始数据、internalItems 提供内部信息。virtual 的 update:options.itemsPerPage 固定为 -1。
- 服务端数据不执行本地过滤、排序或二次分页；请求由调用方实现。示例演示参数快照、请求序号、卸载清理和失败重试。

## 保留的本库约定

- UAH 主题、字体、圆角、间距、密度尺寸、覆盖式滚动条与涟漪继续使用现有组件。theme/color/icon/localization 通过本库系统解释，未引入 Vuetify Material 运行时或内部注入对象。
- 保留 dense/ghost/rounded/ripple、itemTitle、label、error/retry、sticky、旧正文展开插槽与 Ui* 别名；新增 props/types/slots 从公开入口可用。UiPagination 增加颜色、图标和按钮名称配置供页脚复用。
- pageBy 默认 auto：有分组时按根分组分页，其他情况按数据项。要与上游默认按可见行计数一致，显式设置 pageBy="any"。hover 保留本库既有默认开启。
- 数据表默认按 lg（1145px）切换移动布局；mobile=false 保持传统列，mobile=true 强制移动布局，null/省略采用断点。固定列需要明确像素宽度以计算多个固定列的偏移。
- virtual 的 height 仍表示本库整个外框高度，包含 top/bottom 内容；分页控件不出现在虚拟表格中。选择策略 all 对服务端只覆盖已传入的当前页数据。
- 完整 tr 的展开槽由调用方负责行结构；旧正文槽仍使用本库展开过渡。内部实例、Vue 注入符号和 Material 默认样式不作为二进制替换协议。

## 验证证据

遵循用户最新规则，只运行相关专项及视觉复核，无完整 build、全量测试或全项目 typecheck。此前记录里的完整检查属于更早阶段。

| 检查 | 结果 |
| --- | --- |
| table-alignment/data-completion/data-props-compile 指定单测 | 19 项通过，含真实 SFC 编译、策略行为、官方名称清单和 8 个源码同步用例 |
| API 契约与递归插槽两项 | 2 项通过；当前全库生成清单为 153 canonical、1589 props/models、156 events、287 slots、294 exposed |
| tests/tsconfig.tables.json | 四个表格入口及其依赖类型检查通过 |
| 源码表格浏览器专项 | 19 组通过，无 Vue 警告或 pageerror；`artifacts/table-alignment-F0WPkZ` |
| 分页源码专项 | 7 组通过；`artifacts/table-footer-d0Avdd` |
| 虚拟表格源码专项 | 浅深/宽窄/125% 四组几何、末行键盘、排序、滚轮、滚动条拖动、横向滚动通过；`artifacts/virtual-table-qDcB8h` |
| whitespace diff | git diff --check 通过 |

Root 已直接检查真实用例浅深截图、390px 与 125% 缩放、四个实际文档页、标准分组 td、左右固定列与页尾、末行可变高度，以及 13px 数量选择和长选项显示。浏览器专项同时实际操作远程失败/重试/搜索/全部数据、忽略重音搜索高亮、受控分组收起、虚拟展开与定位末行；文档页检查实际示例及源码 Tab。

本次命令使用当前环境 Node.js22.19.0，截图验证使用 Windows Electron/Chromium；项目目标运行时仍为 Node.js24+，未更改系统版本。其他浏览器、SSR、RTL、消费方版本联调和完整工程构建尚未在本轮验证；提交推送前再按项目目标运行时执行完整检查，发布前再做消费方及打包核对。

复现专项：

```powershell
npx tsx --test tests/table-alignment.test.ts tests/data-completion.test.ts tests/data-props-compile.test.ts
npx tsx --test --test-name-pattern="every API|slot API" tests/api-reference.test.ts
npx vue-tsc --noEmit -p tests/tsconfig.tables.json
node tests/desktop/table-alignment.mjs
node tests/desktop/table-footer.mjs
node tests/desktop/virtual-table.mjs
```

离线名称审计使用已解压的官方包，不安装依赖：

```powershell
node scripts/audit-table-contracts.mjs artifacts/upstream-table-audit/package/lib docs/TABLE-ALIGNMENT-AUDIT-2026-10-08.json
```

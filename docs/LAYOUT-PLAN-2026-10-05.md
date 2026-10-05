# 布局与表单组件盘点

两仓起始状态干净；UI 与 UAH 当前均为官方 npm 0.2.3。

参考：Vuetify 官方 grid、textarea、forms、icon-fonts 文档及 npm 最新稳定版 4.2.3（2026-10-05 查询）。只对照能力，不引入 Material 主题或替换 UAH tokens。

## 复用与缺口

| 能力 | 现有实现 | 本轮处理 |
| --- | --- | --- |
| 输入／选择／开关／校验提示 | UiInput、UiSelect、UiSwitch、UiField | 复用控件；Field 增加布局、必填与完整描述关联 |
| 多行输入 | UiTextarea 原生 rows、disabled、invalid | 增加 autoGrow、maxRows、counter、noResize、readonly、密度；保留 textarea 根节点和原生属性透传 |
| 栅格 | 少量工具类 | 新增 UiContainer／UiRow／UiCol／UiSpacer；断点、列宽／分数、偏移、顺序、对齐与密度 |
| 表单布局 | 固定横排 Field，业务局部 flex 类 | 新增 UiForm／UiFormSection／UiFormActions；标签对齐、宽度、分组、两列、长字段跨列、窄容器降为一列 |
| 图标 | 本地原型 SVG 名称 | 保留原名称；增加 SVG path、可访问 label、MDI 常用名称与自定义注册；用 @mdi/js 按需导入，不装字体/CDN |
| 弹窗／滚动／卡片 | UiDialog、UiScrollArea、UiCard | 复用，demo 包含弹窗中的实际表单 |

## 视觉及行为约束

- UI owns spacing：普通间距 24、舒适 16、紧凑 8；字段间距 20，组间距 28，控件沿用 36px、13px、8px 圆角。
- 普通栅格以 viewport 的 sm 600／md 960／lg 1280／xl 1920／xxl 2560 向上覆盖；表单以自身可用宽度 640px 分列、560px 横排降为竖排，适应 Electron 弹窗和侧栏。
- 表单默认竖排，明确 layout=horizontal 可用于设置页；长文本 span=full，不让文本框挤占标签。旧 Field 未进入 Form 时保留 legacy 行为。
- Grid 不使用负 margin；多列 min-width:0，长路径可换行；视觉 order 不作为表单键盘顺序方案。
- Form 使用原生 form/fieldset/legend，保留 required、maxlength 与浏览器验证；submit 事件不内置请求、规则引擎或秘密数据。
- 图标默认装饰性隐藏，label 提供可访问名称，操作仍使用 UiButton。原型图标兼容。
- 真实组件 demo／文档先完成浅深主题、1440／900／窄屏／125% 缩放、键盘及交互验收，记录结果后才可供 UAH 使用。

## 本轮交付范围

完成库能力、公开 API、布局规范、真实 demo 与测试。UAH 消费固定 npm 新版，正式发布需要具体版本与验收结果完成后取得发布授权；发布前不替换 UAH 官方依赖或复制组件源码。

## 后续补充：宽度与焦点

- 盘点 Input/Select/Textarea：此前单独 width 样式与表单规则不统一；默认跟随容器，新增共享 ControlSizing（width/minWidth/maxWidth/inline），selection 控件保持自身尺寸。
- 盘点原生离散控件、v0 Button/TabTrigger、内容操作入口与弹层：原生点击保留焦点，Menu/Dialog 显式恢复焦点；新增内部 pointer-focus 指令，操作完成仅释放当前动作控件，键盘与文本编辑继续保留焦点；弹层按最后操作方式恢复触发器。
- 复用 Button 的 Pagination/CopyButton/MessageActions/Alert/Snackbar/CodeBlock/ConfirmHost 自动继承；ScrollArea、文本输入、Markdown 链接及页面导航保留其编辑／导航用途所需的焦点。
- Switch 页面与新增 focus 指南使用真实控件比较指针与键盘。宽度示例纳入 Input/Select/Textarea 页面；组件导出与文档导航建立自动覆盖检查。

# Root复核记录

本轮逐项审计已完成，完整结果见REPORT.md/validation.json。153项中117项存在差异/部分覆盖、10项未确认行为缺口、23项本库扩展、3项确认同名职责不同。2454个自动属性候选均已分区，0项待判；另外人工追踪了10项未能自动提取的属性工厂/类型继承。确认清单按组件记录1282个属性、105个事件、330个插槽名称缺口，包含未实现的公开配置入口，不是同等严重的独立故障数。

本轮只检查，未批量修复或声明全库兼容。152项为源码审阅、1项UWindow采用Root本轮运行证据。schema、名单、分区、行号检查通过后，Root另复核标准组合、默认值、继承/转发与实际行为，并纠正误报。

基准包由官方registry元数据核对，并校验已下载vuetify-4.2.4.tgz的sha512与官方dist.integrity一致。公开名称盘点通过，153个canonical组件、三批45/55/53互不重叠。上游源码链接由包source map还原.ts/.tsx路径，避免同名文件链接猜测。

## 已独立复核的行为

- UWindow动态disabled：本地UWindow.vue创建group时复制disabled值；group-state.ts在move/select读取该固定options，返回disabled也为布尔快照。官方composables/group.js使用动态props并记录项disabled、导航跳过禁用项。Root运行源码fixture：正常next到b，重置a并disabled=true后调用公开next仍到b，预期保持a。已复现，无Vue警告/pageerror。证据artifacts/component-audit-root/window-VbAUIi/report.json；探针在artifacts/component-audit-root/probe.mjs，不将当前错误行为写成正常回归要求。
- 共享group缺口不能一概泛化：UStepper自身blocked/go/move会额外拦截单项和父disabled，ExpansionPanel也拦自身disabled，必须按消费者判定。已将该要求反馈原审计worker。
- UBtnGroup上游只承担视觉分组，选择协议属于VBtnToggle；不可因UiButton没订阅UItemGroup就直接判上游选择缺口。已要求原worker重新按实际声明/上游职责核对。
- URadio/URadioGroup标准组合：本库UiRadio只绑定自身model，未注入selectionGroupKey；真实radio-group示例使用的是USelectionControl。上游VRadio复用的VSelectionControl注入组并读写group.modelValue，因此不能把现有示例当作URadio嵌套组协作已经支持。此项为源码确认，未在本轮运行该组合。
- UCounter字符串与默认值：本库会计算字符串码点长度；VCounter将字符串value直接显示，且active默认false、max允许字符串。本库active默认true/max为number，不能仅因两边都接受string|number value判为同语义。default slot还缺标准{counter,max,value}scope。
- 自动props盘点可有假阳性：URadioGroup的Omit类型间接继承FormControlProps并转发到USelectionControlGroup，标准校验/禁用等需看真实消费者；UiInput的defineModel经当前Vue编译器生成modelModifiers，Vue emit读取trim/number修饰符。Root用单SFC编译观察该生成路径，未进行完整编译或构建。反过来，USelectionControl模板显式:name=group?.name会覆盖独立attrs.name，因此普通DOM属性透传也必须看绑定顺序。

## 优先处理顺序

1. 已声明行为的实际缺陷：UWindow动态disabled已运行复现；先修正并增加行为回归。分组注册、禁用项、mandatory取消/回退需逐个消费者核对，不能把共享helper问题直接推广为每个组件都坏。
2. 表单与选择协议：Select/Autocomplete/Combobox的受控菜单、过滤配置、真实item/selection插槽；RangeSlider方向、刻度、thumbLabel；Form/Validation的异步校验、submit事件与slot scope；Radio组协作、Calendar的间隔/分类/事件协议、NumberInput的本地化格式和长按。现有普通示例不足以证明这些契约。
3. 导航、列表与弹层：List/Treeview的策略、惰性加载与搜索、选中/展开模型；Button/ListItem/Card等RouterLink接入；Overlay/Dialog/Menu的激活器、定位、滚动与生命周期事件。基础鼠标路径存在不等于完整路由或嵌套协议。
4. 媒体与数据：CarouselItem的VImg图像管线、Parallax的scale/图像协议、InfiniteScroll/PullToRefresh的完成回调和方向；DataIterator的选择/展开/分组及事件/插槽。四类表格先前的专项只能证明记录的场景，审计仍保留新发现的差异与待补用例。
5. 布局与展示入口：网格响应式对齐、布局尺寸/registry查询、各种默认值和标准命名插槽，最后统一补真实demo、可复制源码及API文档。外观差异项的入口需逐项决定，不应因保留本库主题直接认为兼容。

这是基于影响范围的建议顺序，未在审计中批量修复或改变公开API。

## 映射与证据边界

UField（本库form-field布局/ARIA）、UPicker（本库选项列表）、UHotkey（本库键盘事件监听）需要区分同名上游但不同职责。UInfiniteScroll仍属同功能组件，direction将轴向与加载边缘混用是协议差异，不能通过改标自定义组件排除。UParallax本库speed/背景槽修复有效，但与VParallax的scale/VImg图像与插槽协议仍不同。

ULayout与VLayout同为布局registry职责：本库layout-completion.ts有reactive Map、register/unregister、按边offsets、before/order计算，真实ULayout/AppBar/Main用例会消费；缺的是上游更完整的overlaps/fullHeight/尺寸与查询协议，不判为同名异义。

Root首轮验收发现Select/Autocomplete/RangeSlider与Badge/Sheet/ProgressCircular等漏查，要求原三个Luna worker补查全部属性候选并复核全部事件/插槽，不升级模型。后续抽核纠正VCarousel的默认interval：6000ms，500为height；CarouselItem继承VImg props而非仅外观属性，继承props也不自动证明group:selected事件转发。源码行号/schema通过只能证明引用与覆盖存在，Root另做语义复核。

最终另纠正UNumberInput的validationValue误报：上游在makeVTextFieldProps中显式omit它，内部始终验证自身model，不能把祖先类型中的属性当作wrapper可配置功能。UCalendar/UValidation/UNumberInput/UItem等null候选的手工清单已经补齐；manual/null不等于不存在稳定功能。UBtnGroup额外selection/model协议未接入普通UButton，按本库已声明扩展缺口记录，不认作VBtnGroup本身要求选择功能；后续才决定补实现或调整该扩展。

运行层次仅UWindow上述行为探针；其观察事实保存在ROOT-RUNTIME.json，原探针与完整本地报告在忽略的artifacts目录。其余记录为源码/类型/真实SFC对照，未运行153个组件的全部交互、浏览器与视觉矩阵。自动属性候选为null的10个组件人工读取运行源码与类型继承；Ui*别名不重复计算。审计完整指逐个列出证据和差异，不代表全库已对齐或所有稳定功能已获运行验收。

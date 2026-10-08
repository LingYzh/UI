# 全库深度对齐审计

2026-10-08用户要求逐个检查组件，并明确使用经济型子代理。沿用官方Vuetify4.2.4稳定包作为对齐基准，保留UAH外观。此次是逐项检查和缺口清单，不批量修复公共行为。Root制定审计规格/最终判断，三个gpt-6-luna/max只承担独占批次的源码与用例证据整理，不做产品/架构/审美决策，不递归委派。

公开src/ui/index.ts盘点153个canonical U*，Ui*别名共享实现；130可初步映射上游，23需按本库扩展或无直接对应检查。分批45表单/55布局导航容器/53内容反馈动作。完整dispatch/schema见docs/component-audit-2026-10-08/README.md，inventory与batch列表由scripts/prepare-component-audit.mjs生成。名称候选不能当深度支持结论，必须核对真实转发、类型/defaults、事件payload、slot scope与具体功能；源码与实测层次严格区分。

scripts/validate-component-audit.mjs验证完整名单、独占结果schema、完整候选分区、文件/行号证据与当前源码SHA256；scripts/render-component-audit.mjs仅在完整验收后生成逐项REPORT.md。最终153/153通过，2454候选全部分类、0待判；117差异/部分覆盖、10未确认行为缺口、23扩展、3同名异义。手工10个null提取组件不能视为零缺口。确认名称缺口按组件累计1282属性/105事件/330插槽，包含公开配置入口，不能直接衡量严重度或当作唯一故障数。

最终报告与Root复核优先级见docs/component-audit-2026-10-08/REPORT.md、ROOT-REVIEW.md。Root指导原经济型worker补查，纠正泛称视觉差异、DOM attrs冒充功能、继承props冒充emits、Carousel500高度误认interval、NumberInput祖先validationValue误报等。UField/UPicker/UHotkey同名但职责不同，审计判断完成，后续兼容策略再定；ULayout/InfiniteScroll同职责的协议缺口不能改标自定义以排除。

UWindow动态disabled：正常next到b，重置a并disabled=true后公开next仍到b；Root源码fixture/Electron已复现，errors=[]，事实随版本记录ROOT-RUNTIME.json，原探针与证据artifacts/component-audit-root/window-VbAUIi。其余152项静态审阅，不代表完整运行兼容。另确认URadio不消费组上下文、UCounter string value计数不同、Calendar分类/间隔、NumberInput本地化/长按等具体缺口。

审计脚本syntax、完整schema/覆盖/分区/行引用、渲染与diff-check通过。日常只做相关专项，不完整build/typecheck/npm test/test:ui；本轮只加工具与文档，不批量修复、不安装、不提交推送、不修改UAH-desktop，保留已有未提交变更。源代码变更后须重做人工核对，validator只是结构/引用检查。

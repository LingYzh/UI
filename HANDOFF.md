# UI 项目交接

## 2026-10-08：提交推送检查点

用户要求将本次全部变更按过往中文主题、文件组正文及 `Co-Authored-By: Codex/GPT-6` 格式提交并推送到 `origin/main`。检查点涵盖上次 a8220aa 之后的稳定组件补齐、按钮颜色与变体、焦点与涟漪、MDI/展开动画、Markdown脚注滚动、代码自然高度与源码排版、复制图标、Toolbar整合和最终Vuetify4字号规范；详细验证见下文及VALIDATION.md。

提交前已fetch确认本地与远端main一致，git diff --check通过。包版本保持0.3.2；本次只推送分支，不创建版本标签或发布npm，UAH仓库未改动。下文的未提交状态保留为各阶段完成时的历史记录；本检查点提交号以实际Git历史为准。

## 2026-10-08：Toolbar 整合与字号对齐（最新本地状态）

Toolbar直接内置title/#title与#actions（兼容append），常规使用不需要额外Title/Items；扩展区、四密度、高度、折叠/浮动、主题颜色与按钮默认、动画/减效补齐。字体按用户最新要求采用Vuetify4的15级体系，正文16/14/12、普通按钮14、输入16、Toolbar20/prominent24；保留字体家族与自定义主题/圆角/间距。此前的小字号增量已被此次要求替代。

真实Toolbar三页与Typography新页、源码/15行工具类参考/API同步。最终Toolbar8组、Typography4组、复制6组通过，root直接验收17张最终专项原生PNG；另完整UI21组/168路由、Forms14组、ButtonLoading3组、87单测及最终typecheck/build通过。完整UI与按钮回归早于折叠角/工具类说明收尾，最终专项覆盖收尾，详情见 [本轮记录](docs/TOOLBAR-TYPOGRAPHY-2026-10-08.md)。最新153 canonical、1386 props/models、213 slots、281 exposed，240源码片段；UI main a8220aa/package0.3.2未提交/推送/发布；UAH干净且未改动。

## 2026-10-08：复制图标修复

UiCopyButton 的旧直接子 SVG 选择器在 UiButton 增加内容包裹层后失效。root 改为固定15px的mdi-content-copy/mdi-check，动画与减少动效规则使用专用图标类，保留绿色成功反馈、status播报和1.6秒恢复。沿用现有真实copy-button demo，公开API不变。

typecheck、build、现有控件6组通过，root已检查浅深复制状态截图。具体证据见 [本轮记录](docs/COPY-ICON-2026-10-08.md) 与VALIDATION.md。UI main a8220aa/package0.3.2，未提交/推送/发布；UAH仍干净、97c43a9且固定依赖不变。

## 2026-10-08：代码自然高度与源码排版

CodeBlock的maxHeight不再默认580px；底层viewport未传值时不设置max-height，旧pre冗余580px声明也删除。显式max-height仍限制并纵向滚动；长行横滚、自动换行、复制与高亮保留。code-block页新增真实48行自然高度/240px对照，API与说明同步。

真实示例、源码片段、split/generate来源统一四空格缩进，Vue父子标签按层级分行，即使短标签也不糅在一行。npm run docs:sync同步真实SFC、源码与API；固定Prettier3.9.9只作devDependency，不进入组件运行时，compiler AST避免误分属性表达式或字面代码。239个源码片段整理完成，重复执行updated0。root直接实现所有产品/demo；子代理只写和执行测试。

typecheck、87单测、build、代码专项3组、完整UI21组/167路由、106独立示例回归通过；root验收最终代码专项3张原生PNG及代表组件12张浅深/宽窄PNG。最终证据及最后等效CSS/API文案收尾顺序见 [本轮记录](docs/CODE-SOURCE-2026-10-08.md) 和VALIDATION.md。UI仍main a8220aa/package0.3.2，未提交/推送/发布；UAH干净、97c43a9、固定npm0.3.2未变。

## 2026-10-08：字号与稳定组件再对齐

本轮 root 直接完成所有产品源码、共享样式、真实独立demo及视觉验收；辅助代理只审计和测试。14px文本提高到15px，13px及以下增加2px；代码默认token与浅深主题均15px，辅助字号保持层级。沿用现有UAH外观。

对照官方Vuetify4.2.4补齐Code、SlideGroup/Item、受控Snackbar与SnackbarQueue；UBtnToggle可直接组合UButton/value，也支持省略值的索引选择。所有新组件均注册u-前缀、独立真实示例、源码和最新API；当前153个canonical组件、167页、106个独立示例、1366 props/models。旧全局通知服务继续保留，说明路由改为snackbar-service，避免遮蔽新的受控Snackbar页。

实际交互修复Queue受控defineModel消费循环的重复/overflow冻结：本地pending快照逐项消费后一次性回写。13组专项验证真实键盘、多选/mandatory/max、只读/禁用、消息暂停/重开、FIFO/并发消息唯一性/overflow/clear/promise；类型检查、87单测、build、完整UI21组/167路由、Forms14组、按钮等待态3组通过。root亲自验收36张浅深/宽窄原生PNG，另复核最终专项5张状态PNG。具体文件与边界见 [本轮记录](docs/READABILITY-ALIGNMENT-2026-10-08.md) 和VALIDATION.md。

最新入口盘点见docs/VUETIFY-ALIGNMENT-AUDIT-2026-10-08.json：102稳定家族与8指令都有基础公共实现或职责映射；10 Labs、逐属性兼容和完整SSR/RTL平台验收仍独立记录。旧4.2.3 JSON及下文旧组件数量保留为历史，不当作当前缺口。UI仍在main a8220aa、package0.3.2，改动未提交/推送/发布；UAH干净、HEAD97c43a9、固定npm0.3.2未修改。

## 2026-10-01 Ripple 修复与 0.2.2 发布完成

独立工作树 `D:/UI-ripple-fix` 的 `codex/fix-ripple-update` 基于上游 `059f785`，原 `D:/UI` main 已按用户要求完全对齐上游并保持干净。0.2.2 修复 Vue 动态 class 更新删掉 `ui-ripple-target` 后涟漪定位到页面的问题：`vRipple.updated` 恢复定位类，真实文档 demo 与专项测试覆盖重复切换和实际鼠标/键盘操作。

root 已验收浅深两张 held 截图；类型检查、23 单测、文档/库构建、完整 UI 回归 20/20、ripple 专项 66 断言、A 批 7/7 与 B 批 6/6 通过，详见 VALIDATION.md 最新记录。KAM 候选源码兼容验证 dev 53 / prod 52 检查通过；修改后的 ripple.ts 使用 KAM 的 TypeScript 5.9 校验通过。

用户确认后发布提交 `cd9d3ce5d08bb5416e14a69bfecca30e9f02097b` 与标签 `v0.2.2` 已原子推送到 main，Actions [36757427137](https://github.com/LingYzh/UI/actions/runs/36757427137) 的所有检查与 Publish 步骤成功，完成 npm Trusted Publishing 和 provenance。官方 npm 已确认 0.2.2，latest 指向 0.2.2；KAM package/lock/实际安装已正式升级，只替换一个包，最终消费回归记录见 KAM 的 `docs/vue-phase2-validation.md`。原 `D:/UI` main 已快进到上游新版本，旧四个本地提交保留在备份分支，不再进入 main。

更新日期：2026-10-01（Ripple 与自动发布）；下文开发检查点保留历史记录，消费方式和验证结果需以实际仓库状态核对。完整跨仓库交接位于相邻 UAH 项目的 `D:/UAH/docs/HANDOFF.md`。本项目的持续规则在 AGENTS.md。

## 当前 npm 发布入口

- 提交 `f26cdc9` 已加入 `.github/workflows/publish.yml`：推送 `v*` 标签，经版本匹配、类型检查、单测、构建和打包预览后，由 GitHub Actions 使用 npm Trusted Publishing / OIDC 发布到官方 registry，dist-tag 为 `latest`。
- 发布前同步 package.json/lockfile 版本并完成本地桌面 UI、专项、兼容性与视觉验收；当前 CI 未覆盖这些检查。推送标签会实际发包，完成后核查 Actions 和 registry，再更新 `.Codex/memory/publishing.md`。
- 0.2.1 的网页授权发布属于历史记录，不代表新 workflow 已完成发包。相邻 UAH-desktop 当前 package.json/lockfile 使用 npm `@lingyzh/ui@0.1.0`；下文 `file:../UI` 描述属于旧检查点或显式本地联调。

## 开发顺序与分工

动手前先盘点要用到的组件。缺少组件或通用能力时，先在本项目实现、导出，增加真实 demo、文档页并调试，由 root 视觉验收并记录，之后才在 UAH 使用。子代理发现缺口先上报 root，不自行规划或在业务项目里绕过。

视觉效果的样式编写由 root 亲自完成，或委派至少 GPT-6 Sol medium；Luna/Terra 不承担视觉样式。已验收组件的组装及非视觉工作可交给低级模型，经济优先不能降低视觉任务下限。

## 项目结构与消费方式

- `src/ui/index.ts`：公开导出；同目录维护组件、tokens、样式、ripple 和 snackbar。
- `src/ui/docs`、`src/ui/UiPreview.vue`：真实文档与 demo，当前全组件回归覆盖33个文档路由；以 content.js 和公开导出为准。
- `src/components/Icon.vue`、`src/assets/icons`：库内图标，不依赖 UAH 原型目录。
- `tests/desktop/ui.mjs`：隔离 Electron 文档回归；`tests/snackbar.test.mjs`：服务单元测试。
- UAH 使用 `@lingyzh/ui: file:../UI`；package exports 指向 Vue/TypeScript 源码，Vite dedupe Vue。不是复制源码，也不是从远程仓库实时加载。
- 修改本库后，UAH 开发服务读取该本地包；生产构建需重跑。保持相邻 checkout，并先在 UI 安装依赖，再在 UAH 安装。

命令：`npm ci`、`npm run dev`（5174）、`npm run typecheck`、`npm test`、`npm run test:ui`。`npm run build` 输出文档 `dist/docs` 和库 `dist/lib`；`npm run preview` 使用 4174。

## 最近状态

用户明确要求将两仓当前累计改动连同handoff提交。本检查点基于 main 的 `010605f`，包含此前尚未提交的所有组件、依赖锁文件、文档与测试；具体新提交号以 `git log -1` 为准。仅创建本地提交，未请求push。UAH同步保存匹配功能检查点，恢复时两仓应一起checkout。

累计交付：UiTextarea与UiTooltip；UiActivity执行活动与内联样式；UiDiff行级快照差异和共享line-diff；UiFileChanges、UiMessageActions及剪贴板宿主适配；UiMarkdown的GFM、公式、Mermaid、安全HTML和自适应流式文本；UiUsageMeter的紧凑入口、服务/估算/未知状态及独立分类条。相关tokens、CSS、公开API、真实demo和文档已同步。依赖版本锁在package-lock.json，不引入Material主题。

已有组件修复：UiDialog的固定标题/错误/footer与正文滚动；UiSelect分组、描述式选项、原生回退及相同value的动态标签更新；UiCodeBlock共享复制、换行与长内容；UiScrollArea外壳使用overflow:clip，避免聚焦折叠按钮时外壳意外滚动，使弹窗正文移出视口。真实viewport仍负责鼠标、键盘和滚动条交互，无UAH局部CSS补丁。

最新验收：typecheck、文档/库构建通过；全组件20项回归通过（artifacts/ui-PHOT1i）。UiUsageMeter专项及六张浅深1440/900/125%截图通过（usage-meter-qKhMlm）；嵌套Dialog→Collapse→CodeBlock的实际文本Range可见性、viewport对齐、尾部与footer专项及八张截图通过（dialog-nested-Avpq9P），root均已亲自验收。此前Markdown、Diff、对话操作、Tooltip、Textarea和Select专项记录见VALIDATION.md与各专项验证文档。测试证据artifacts为本地忽略内容，不随Git提交；共享源码、脚本、文档均提交。

配套UAH已通过263项自动测试、Git/context真实Electron37条断言与Plan回归。使用file:../UI和Vue dedupe；不要复制本库源码到UAH。生产端需重新build并重启Electron，网页刷新不足以加载UAH主进程更新。

已知边界：UiUsageMeter不提供tokenizer或模型能力猜测；分类合计与服务计数独立。Markdown仅渲染可见内容，不接受任意执行；嵌套列表/引用/details中的Mermaid围栏保留代码回退。新业务需求先盘点组件并遵循UI-first，当前没有未完成的已授权UI修复。

## 2026-09-30 A 批（0.2.0）

为 KAM（Kiro Account Manager）从 React 迁移到 Vue 补齐组件，UAH 默认行为不变。

- locale：新增 zh/en 两种语言，默认 zh，文案与原文逐字一致。
- 新增组件：UiBadge、UiAlert、UiSpinner、UiMenu/UiMenuItem、confirmDialog/UiConfirmHost。
- 现有组件扩展：UiButton 加 danger，UiDialog 加 size 与 placement=end，UiInput 加数字模式，utilities 补充字号、截断、定位、网格等类。
- UAH 如需使用 confirmDialog，要在根组件挂载一次 UiConfirmHost。
- 验收记录见 VALIDATION.md“2026-09-30 A 批组件验收”。
## 2026-09-30 B 批（0.2.1）

- 新增组件：UiCheckbox、UiRadio、UiProgress、UiCopyButton、UiColorSwatches，样式集中在 `controls.css`；新增 `copy.label` 与 `swatch.*` 文案。
- UiColorSwatches 的选中判断忽略大小写；色板外的已保存颜色保留为“当前颜色”，不会被改写。
- UiCopyButton 的根节点是 Tooltip 包裹层，未声明的属性转给内部按钮。
- 验收记录见 VALIDATION.md“2026-09-30 B 批组件验收”。专项回归为 `node tests/desktop/controls.mjs`。
- KAM 迁移计划中的 UI 库补缺到此完成；后续页面迁移发现的新缺口按 0.2.x 追加。
- 0.2.1 已于 2026-09-30 发布到官方 npm，latest 指向 0.2.1；UI main 与 v0.2.1 标签已推送，标签对应发布准备提交 `449183b`。发布校验与消费方 integrity 见 `.Codex/memory/publishing.md`。

## 2026-10-05：空闲上下文分类颜色（0.2.3 待发布）

UiUsageMeter 的 UsageSegment 新增可选 tone: 'remaining'，使用独立 --usage-remaining 冷灰色（浅色 #c1c8d0，深色 #555f6e），不随分类位置变化。默认分类行为保持兼容；真实 demo 和 API 文档同步。

typecheck、23项测试、build、pack白名单检查通过。usage-meter专项通过，root已检查 artifacts/usage-meter-WPh1Qi 的浅色1440与深色900/125%截图，空闲与绿色内容分类可辨。正式发布需按AGENTS以版本提交+标签触发Actions；当前待授权。

## 2026-10-05：0.2.3 发布完成

用户已明确授权发布并升级 UAH。发布提交 6f405a84e6dd1e3c36e9b04853488eff571214b8，标签 v0.2.3；GitHub Actions 37226243401 的 Publish 步骤成功，官方 npm 的 latest 为 0.2.3。tarball：https://registry.npmjs.org/@lingyzh/ui/-/ui-0.2.3.tgz；integrity：sha512-P+sBNm4KjRNkBcoIImV2+PQRT9mYxqqYqkzAWGNZNVfBqea6owCklrupb7W6ap8jx9s5alWi78rcH7/z74PgRQ==。

UAH 已从官方 registry 固定安装 0.2.3，并更新 lockfile。发布前 typecheck、23/23 单测、build、pack 白名单及 usage-meter 桌面专项通过；root 检查 artifacts/usage-meter-WPh1Qi 的浅色 1440 与深色 900/125% 截图。剩余量使用独立冷灰 token，不再与消息分类共享绿色。

## 2026-10-05：布局、输入宽度、全组件文档与指针焦点（本地待发布）

用户要求参考 Vuetify 4 补充布局能力，统一多行输入与单行输入的样式、补齐所有组件 demo，并同步默认输入宽度和点击后不保留控件焦点。

- 新增 UiContainer/UiRow/UiCol/UiSpacer、UiForm/UiFormSection/UiFormActions；12 列、分数、auto、sm–xxl、偏移／顺序／对齐／密度，以及以自身容器响应的两列表单和横排标签。Field 增加布局、required、span=full，继续支持既有独立横排使用方式。
- Textarea 增加 autoGrow/maxRows/counter/noResize/readonly/dense/ghost/rounded，使用与 Input 相同的表面和状态；Input/Select/Textarea 共享 width/minWidth/maxWidth/inline，默认跟随父容器，选择类控件维持自身尺寸。
- UiIcon 保留原型 SVG，新增常用 mdi-* 名称、按需 path、registerIcons 与 label。依赖固定 @mdi/js 7.4.47，无 Material 主题、字体或 CDN。
- 内部 pointer-focus 指令统一离散操作点击后的 blur，覆盖选择类、Button/TabTrigger/MenuItem 及内容操作入口。键盘和文本编辑保留焦点；菜单／弹窗关闭区分指针和键盘。Select 沿用 blurOnSelect。
- 43 个公开组件均有可访问导航、独立文档和真实组件 demo，文档共 56 页。修复未注册导航组使部分旧组件页面不可见的问题，并新增 grid/focus 指南、宽度比较、textarea 状态比较、MDI 和实际弹窗表单。
- Duplicate attribute 编译错误已修复：控制属性合并为一个 v-bind。selectedcontent 使用 VNode 组件，避免消费方 Vue 报未知标签警告。

设计与缺口记录：docs/LAYOUT-PLAN-2026-10-05.md。验收结果见 VALIDATION.md 新增记录。所有改动仍在 UI 工作区，未提交、发包或修改 UAH 依赖；package 当前仍 0.2.3，UAH 继续固定消费已发布 0.2.3。正式发布应使用新版本提交和标签触发 Actions，再升级 UAH；不可将本地组件复制到 UAH。

本轮最终验收：29/29 单测、20 项全 UI、7 项反馈、6 项选择类、11 项布局／宽度／焦点专项通过，typecheck/build/pack/diff-check 通过。root 已复核 artifacts/layout-DfKnam 的最终浅深／窄屏／125% 图像；42 张证据及测试覆盖详见 VALIDATION.md。5174 dev 服务保持运行，忽略 Electron artifacts 后不再触发缓存锁文件监听。


## 2026-10-05：内置标签、简化 Form 与验证（本地待发布）

用户继续要求 Form 像 v-form 一样直接包裹控件，并将 label/hint 内置在所有输入控件，Field 仅用于自定义项目；标签方向通过属性配置。现已在 UI 实现 label/hint/labelPosition(top/left)/labelWidth、下方说明和错误、同步／异步 rules、错误汇总、三态 v-model、validate/reset/resetValidation、disabled/readonly/dense/ghost/rounded 继承。FormSection/FormActions 可选，真实 demo 和 API／源码已同步简化。可在5174的/#/form查看。

同时修复长选择值换行、短 picker 固定过宽、丰富选项不显示省略号、Tooltip 指针聚焦残留、scrollable Dialog 错误缩短正文空间，以及横排紧凑控件标签基线偏差。Input 保留原生横向文本选择；Dialog 错误悬浮且正文按实测高度留 padding。

最终验证：typecheck/build、38单测、20全UI、13表单专项、11布局专项通过，pack172文件无测试或artifacts泄漏。root复核浅深、窄屏、125%及实时菜单、tooltip和浮动错误。最终证据为 artifacts/forms-K8yOpZ、artifacts/layout-PhX36A、artifacts/ui-Zl4v7R；截图使用Electron NativeImage完整窗口并检查物理尺寸。详情见 VALIDATION.md、docs/FORM-PLAN-2026-10-05.md 和 src/ui/README.md。

仍未提交或发包，UI和UAH版本保持0.2.3，UAH实际工作区干净；按授权发布新版本后再更新其固定npm依赖。

## 2026-10-05：Form 布局分工、级联选择器及 API 完整核对（本地状态）

Form 已收敛为验证、提交、重置与共享控件状态／外观容器，布局直接使用 Row/Col；不再提供 layout/columns/density/actions。FormSection 仅分组，控件与 Field 不再提供 span。所有 demo、源码与 README 已更新；Form、Row、Col 页面包含实际行列表单案例。标准控件内置 label/hint，Field 仅用于自定义项目。

新增 UiCascader 与公开 CascaderItem/CascaderValue 类型，独立文档 #/cascader；路径数组 v-model、父级／叶子选择、禁用项、数字值、清空、显示路径、键盘导航和 Form 注册验证均已实现。菜单和级联弹层补充键盘打开后外部指针关闭的焦点释放。

现在共有 44 个公开组件、57 个文档页。API 参考由 src/ui/docs/apiReference.js 统一提供；五份页面 metadata 仅负责导航、示例和说明。props／类型／required／默认值／事件参数／插槽参数／expose 全量核对 0 差异、源码重复声明 0，报告为 docs/API-AUDIT-2026-10-05.json。全部组件源码示例可编译，并清理了多余 Row/FormActions 嵌套。

验证通过：typecheck/build、44 单测、20 全 UI、14 表单、11 布局、14 级联。最终证据：artifacts/ui-dhrVFX、artifacts/forms-ioeQeZ、artifacts/layout-Z9pi97、artifacts/cascader-wo09Ic。root 已亲自复核浅深、窄屏、125% 和三级弹层；完整窗口 PNG 尺寸已断言。详细验收见 VALIDATION.md 最新增量。

本轮尚未提交或发布，UI package 仍为 0.2.3；UAH 工作区干净并固定消费官方 npm 0.2.3。5174 dev 服务可直接查看最新 demo。后续发布新版本并升级 UAH 时遵循各仓库发布规范，不复制 UI 源码或恢复 file: 依赖。

## 2026-10-05：Tabs 对齐

Tabs 已支持声明式 UiTab、统一 UiTabsWindow/UiTabsWindowItem、数组 items 与 #tab/#item/#window。model/idPrefix/items 均可省略；兄弟 Tabs/Window 显式绑定同一模型，#window 自动继承。默认首个可用项选中，方向键/Home/End 移动焦点、Enter/Space 确认；支持 automatic、数字0、隐式索引、禁用、可空选择、动态列表与空列表恢复。内容首次访问挂载并保留，eager 可预先挂载；旧 id/label/orientation/UiTabPanel 兼容。

新增水平／垂直滚动箭头、centerActive、alignTabs、grow、fixedTabs、stacked、hideSlider；滚动不改变选择，窄屏不撑宽页面。所有新组件有独立文档和真实示例，当前47组件、60页；API 全量审计0差异。计划见 docs/TABS-PLAN-2026-10-05.md，预览为5174的/#/tabs。

最终验证：typecheck/build、48单测、20全UI、11布局／焦点、5组Tabs专项通过；证据 artifacts/ui-El84a3、artifacts/layout-kKB6ie、artifacts/tabs-tZ7icE。root 已复核浅深、390px、125%以及垂直滚动；截图尺寸和主题均有断言。pack182文件无测试／artifacts／dist泄漏，详细记录见 VALIDATION.md。

上述 Form/Row/Col、级联与 Tabs 修改均仍在 UI 本地，尚未提交或发包，版本保持0.2.3；UAH 工作区干净且仍固定消费已发布 npm 0.2.3。发布新版本并升级消费端时继续遵守 UI-first 和固定 npm 版本要求。

## 2026-10-05：准备发布 0.3.0

用户已授权发布最新版。本轮包含布局、表单接口调整及新增组件，版本升级为0.3.0，package.json与lockfile一致；以v0.3.0标签触发既有GitHub Actions/OIDC正式发布。发布前再次通过typecheck、48单测、build及pack182文件白名单检查；此前最终20全UI、11布局、14表单、14级联与5组Tabs专项及root视觉验收保持有效。发布成功后核对官方npm latest、tarball/integrity，再固定升级UAH依赖并验证兼容性。此段是发布准备记录，实际发布结果另追加。

## 2026-10-05：0.3.0 已发布，准备 0.3.1 兼容修复

0.3.0 发布提交为 a7ea191a1166e842ea4018b246ff0a28a25bc1e7，注释标签 v0.3.0 已推送；GitHub Actions 37287893853 成功，官方 npm registry 确认版本和 latest。tarball 为 https://registry.npmjs.org/@lingyzh/ui/-/ui-0.3.0.tgz，integrity 为 sha512-MrxVpXbQrqGvVFrqTmmU2ieS/OZ7uHAmceqAw7hX/D+ejNi2ApHAb7TjPutcwyHDblsMMniR9DTjlQJfpb4c7A==。

UAH 固定安装官方 npm 0.3.0 后，实际端点编辑器的嵌套模型能力弹窗触发 Vue 更新循环。UiSelect 每次 updated 都重建相同 selectedcontent，UiScrollArea 的内容观察器每次都生成相同几何的新响应式对象，造成重复更新。0.3.1 在内容／几何实际改变时才更新，保留动态选项文字、选择值及滚动能力，无 API 或样式变更。

新增 tests/desktop/select-initialization.mjs 使用真实组件复现关闭状态的八个选择器，在打开嵌套弹窗时同时初始化模型，覆盖浅深主题、选择、关闭及重新打开。原始版本复现卡住，修复后通过，证据 artifacts/select-initialization-eZNDNF。root 已检查浅深截图。0.3.1 发布前继续完整回归，发布结果另追加；消费端必须固定安装最终 npm 版本。

0.3.1 最终发布前验证已通过：typecheck、48 单测、build、20 全 UI、嵌套选择器专项；最终证据 artifacts/ui-4XLID7 与 artifacts/select-initialization-Shg8O8，root 已复核主题截图。修复源码恢复后重新 pack 为182文件，无测试／artifacts／dist／docs泄漏。公开 API 无变动。推送 v0.3.1 后核对 Actions 与官方 registry，再将 UAH 固定升级并完成实际端点回归。

## 2026-10-05：0.3.1 已发布，0.3.2 补齐插槽文字同步

0.3.1 发布提交 55c1d7b74e31eec396610c1b701bf729e113dd71，标签 v0.3.1；Actions 37292273421 成功，官方 npm 版本／latest 已确认。integrity 为 sha512-jjRUnrDkuKbiJj5EW80i811mYZ7GJKc9y3n2qmWxUHJqiDYyPsmvVMIJcUatfJThh8V7JhWJZz2TqDWfyk1uiw==，tarball 为 https://registry.npmjs.org/@lingyzh/ui/-/ui-0.3.1.tgz。

补充回归发现停止重复渲染后，旧 slot 提供的 option 文本在 UiScrollArea 内更新时不会触发 UiSelect 的 updated，选中文本克隆停留在旧内容。0.3.2 仅观察选项容器的子节点与文本变化，同步真正变化的克隆并在卸载时清理监听；不观察 selectedcontent，避免监听自身写入。专项增加修改选中项文字后显示更新且模型不变的断言，浅深主题均通过，证据 artifacts/select-initialization-KIxN9D。UI API／样式无变动；UAH 最终消费 0.3.2，0.3.0 与 0.3.1 是中间版本。

0.3.2 发布前 typecheck、48/48 单测、build、20/20 全 UI 通过，证据 artifacts/ui-EQH98h，日志 artifacts/release-0.3.2-*；root 检查最终嵌套选择器截图与两次修复 diff。发布按现有标签／OIDC流程进行，最终 registry 和消费端记录另追加。

## 2026-10-05：0.3.2 正式发布结果

发布提交 9961a7858a0757f588c70935ccd7f237cf1cfab4，注释标签 v0.3.2 已推送并核对远端解引用；GitHub Actions 37293347476 成功，官方 npm latest 为0.3.2，tarball已可下载。tarball 为 https://registry.npmjs.org/@lingyzh/ui/-/ui-0.3.2.tgz，integrity 为 sha512-XaR61MNq1VH4hz+eFeh42/tCSqYI2XmctYzK0zInd1tpaW8aRgth5l2IOavOKsAQurQOrJCa36kuvgwHDqURUg==。完整 registry 元数据保存在 artifacts/release-0.3.2-registry.json。

UAH 已固定安装官方 npm 0.3.2，package／lockfile／实际 node_modules 版本一致，integrity 与官方一致，Vue 3.5.43 保持 dedupe。消费端 TypeScript 7 无 ts.sys，Vite Vue plugin 已显式提供 Node 文件读取／realpath 适配；typecheck、应用 build、build:ui 均通过。UAH 最终桌面结果另追加。

### UAH 最终兼容验收

UAH已完成0.3.2固定npm升级，本地提交97c43a907520c5d747abdd00b985d3ec4dde9d32，工作区干净。最终typecheck、应用／文档构建通过；完整UI25/25（60路由）、Agent15/15、端点11/11通过，无pageerror；证据D:/UAH/artifacts/ui-q949vX、agents-sQ9goh、endpoints-98M7dG。root复核实际能力弹窗深色窄屏和endpoint-error-fixed.png，表单滚动时错误固定悬浮顶部，padding保护首项，外层没有滚动。

消费端仅更新固定依赖、TypeScript7的SFC文件访问适配、测试夹具和记录；保留Vue dedupe、Electron隔离及原业务／运行时代码。旧桌面夹具同步V2动态上下文、条件提示词模块、启动草稿后显式选择历史会话，以及Tabs手动激活和悬浮错误，原模型／历史／权限／持久化／委派断言保留。此前单测1043通过／2跳过、外观7和扩展32通过，相关产品代码未变。本轮未发布UAH桌面应用安装包；UI正式最新npm版本为0.3.2，无阻断项。

## 2026-10-05：主题、Markdown 与 Ripple

新增 createUiTheme/useUiTheme 与 UiThemeProvider；支持 light/dark/system、自定义主题、响应式颜色／变量、颜色辅助类、变体、局部继承与可选切换动画。Card/Dialog 可覆盖 theme，Snackbar 和 Mermaid 遵循局部主题；默认浅深色沿用原 tokens。UiPreview 独立入口也能自动安装主题，并在卸载时恢复根变量／属性、清理样式和监听。当前48组件、62文档页，真实 demo 与全部 API 已同步。

Markdown 行内 code 与 mark 使用 primary；补充说明支持可反转的展开／收起动画，脚注与返回平滑滚动并居中目标，键盘焦点保持可访问。系统和手动减少动效均有效。主题与 Markdown 计划见 docs/THEME-MARKDOWN-PLAN-2026-10-05.md。

Ripple 对照 Vuetify 官方生命周期重写：扩散250ms／显现100ms、最短显示250ms后淡出300ms；快速松手、自动失焦和点击后 loading 不会截断，连续波纹独立。补齐触摸80ms延迟与滑动取消、键盘、自定义 keys/class、circle/center/stop、嵌套传播和宿主定位恢复；保留原 UAH 视觉强度。真实示例为5174的/#/ripple、/#/theme、/#/markdown。

最终验证：typecheck/build、58单测、20全UI（62路由）、78项 Ripple 与43项激活断言、12组主题／Markdown、3组独立预览全部通过，无渲染错误。证据为 artifacts/ui-G5YeQ8、ripple-GVjh5S、ripple-activation-v0fBHd、theme-markdown-RA2pzB、theme-preview-BuAUCk；root复核浅深、390px、125%及快速松手仍在播放的波纹截图，详见 VALIDATION.md。

本轮仅为 UI 本地更新，尚未提交或发布，package仍0.3.2；UAH工作区干净，HEAD97c43a9，继续固定消费已发布npm0.3.2。后续发布后再升级消费端，不复制源码。

### 主题过渡默认开启与顶栏修复

用户要求完整动效默认开启主题过渡，并与减少动效绑定。createUiTheme 的 transition 默认值改为 true；顶栏仍调用同一 change 路径，同时将开关元素中心作为揭示起点。ThemeDemo 删除独立 animate=false 参数，改用已有共享 reducedMotion 偏好；系统或手动减少动效会抑制下一次过渡，并立即结束正在播放的动画，恢复完整动效后自动恢复。宿主显式 transition=false 仍可按需使用。

本地最新验证：typecheck/build、58单测、7组真实主题过渡、12组主题／Markdown、3组独立预览、20全UI（62路由）和78项Ripple全部通过。证据为 artifacts/theme-transitions-GRZOBH、theme-markdown-nm39sL、theme-preview-nOQb7p、ui-ooSTop、ripple-v1Z5kb。root复核1440×900动画中间帧，测试断言左侧仍为旧浅色、右侧已为新深色，确认实际播放400ms动画；支持播放中减少动效、键盘焦点及卸载清理。API默认值、README与demo同步；仍未提交或发布，UAH无改动。

### Tabs 激活态 hover 修复

普通Tabs的hover选择器覆盖aria-selected背景，ExampleCard额外选中样式掩盖了问题。共享hover规则现在仅作用于未选中且非禁用的项，选中项保持原背景与文字，ghost保留透明；文档重复选中覆盖已移除，示例／源码与普通Tabs共用库样式，无API变化。旧构建在新增实际交互检查中复现色值变化，修复后浅深、横纵、默认／dense／ghost／square、禁用项和示例／源码切换均通过。

最新typecheck/build、58单测、6组Tabs及20全UI（62路由）全部通过，无pageerror；证据 artifacts/tabs-TW7NhX 和 artifacts/ui-wNNSzC。root复核1440×900浅深选中详情hover截图；测试断言真实:hover及前后背景／文字完全一致。UAH工作区干净；UI仍本地未发布，版本0.3.2。

## 2026-10-06：Vuetify 4.2.3 全量对齐审计

根据用户要求完成组件类型与使用方式盘点；官方 npm latest 为4.2.3，读取固定v4.2.3源码，不混入旧版或Labs。完整清单见 docs/VUETIFY-ALIGNMENT-AUDIT-2026-10-06.md，机器快照为同名.json。逐项记录102个稳定组件家族、10个Labs家族、8个指令与本地48组件/62文档页；家族与单组件计数单位不同，不计算覆盖率。

优先缺口：v4断点已为600/840/1145/1545/2138，本地仍600/960/1280/1920/2560；缺统一display/defaults/完整响应式工具类。选择器缺multiple/search/对象映射，组控件和专门输入类型不足，客户端表格与Server的多排序/选择/展开/分组/虚拟化尚缺。UiInput实际对应TextField，UiBadge接近Chip而非附着徽标，UiField/UiTable等职责与上游不完全一致。

静态复核发现Checkbox/Radio/Switch/ColorSwatches省略dense/ghost/rounded时，编译后的Boolean props会挡住Form的nullish继承，且模板未消费这些外观状态。编译/源码证据已记录，尚未浏览器专项复现或修复。已有Form验证、内置label/hint及标签方向、级联、Tabs、主题/Ripple不重复记作完全缺失。

本轮仅新增审计资料与本交接记录，未改产品代码/依赖或发布。现有58单测通过，公开48组件均有文档/API映射。最近主题/Markdown/Ripple/Tabs仍是未发布工作区改动，UI package仍0.3.2；UAH干净、HEAD97c43a9，继续固定消费npm0.3.2。后续按审计顺序先UI能力与真实demo验收，再发布升级消费端。

### 审计后的实现与用户修正（当前状态）

上述48组件/62页面和“仅审计”是历史基线。当前工作区已有148个canonical U*组件、162页面；createUI注册 `<u-xxx>`，Ui*导出仍兼容。补充公共配置、选择器/组控件/专门输入、布局/Overlay/列表/树/虚拟化、数据表格、日期和步骤/窗口等基本能力；全部视觉模板、共享CSS及视觉demo由root直接实现。公开API同步源码，当前82单测及全部真实示例源码编译通过。

用户指出组件页混入整组示例，已将新增demo拆成101个独立SFC，位于`src/ui/docs/component-examples`；LiveExample通过manifest对应id挂载，文档源码来自同一文件。`split-completion-demos.mjs`用于从root原始family demo生成独立模板，`generate-completion-docs.mjs`生成页面与源码，`sync-api-reference.mjs`同步API。以后修改独立案例时注意同步生成来源，避免再生成覆盖。4个family文件仅是作者源，不再直接挂在公共组件页。

Button loading修复三个问题：单一loader、切换前宽高不变、原variant/color/透明度保持。服务端表格内核换成UDataTable后旧CSS未清除新内框，已统一只画外层边框；ghost/square/dense正确，独立UDataTable仍保留自己的框。Select包装层默认blurOnSelect和ref方法、组控件props传递、Chip组选择及ListGroup激活器嵌套也已修复。表格排序维持双三角SVG和本地化可访问名称。

最新typecheck/build、82单测、完整UI21组（162路由）、独立demo专项全部通过，无pageerror/Vue warning。证据：`artifacts/ui-zoj9Oy`、`component-examples-PuXGlT`、`button-loading-QC8Ixq`。root已亲自复核12张独立输入示例浅深/宽窄图像、4张表格变体浅深/390截图及按钮loading浅深图像，详细范围和边界见VALIDATION.md。未把逐页smoke当成所有新组件全状态与Vuetify全属性对等验收；Code/SlideGroup/受控Snackbar与Queue、Labs、SSR/完整RTL等剩余差异已在原审计的实现进展处明确保留。

当前仍为UI本地未提交/未发布修改，package0.3.2；UAH工作区干净并继续npm0.3.2。未做发布或消费端升级。下一轮先看本段及实际状态，保留已有主题/Markdown/Ripple/Tabs的未发布改动，不把版本号当作工作区发布状态。

### 2026-10-06：提交检查点，暂不发布

用户已授权按既有中文主题、逐文件组正文和 `Co-Authored-By: Codex/GPT-6` 格式提交并推送本轮累计UI改动。本检查点包含主题/Markdown/Ripple/Tabs修复、U*组件与u-模板迁移、独立示例/API以及按钮/表格修正，验证证据沿用上段。本次只推送普通main分支，不创建或推送发布标签，不修改0.3.2包版本，不发布npm或升级UAH。提交/远端结果以实际Git状态为准；之前“未提交”描述属于提交前的历史状态，“未发布”仍有效。

## 2026-10-07：Markdown 脚注滚动修复

上一轮累计改动已经提交并推送 main，检查点为 a8220aaf200365f326e634fe54041774de2a4619，尚未发布。用户随后报告脚注跳转使整个页面滚动、顶栏被遮盖；本轮修改 UMarkdown 的锚点滚动逻辑，只滚动最近的纵向阅读容器并按其内容视口居中，没有局部容器才回退文档滚动根。保留平滑前往/返回、减少动效立即定位及 preventScroll 焦点移交，没有新增公开 API 或组件。

root 已复现旧构建将页面根滚动33px、顶栏移到−33px；修复后内层 ScrollArea 跳转不带动任何外层容器，普通正文跳转仅改变 docs-content-scroll。实现、真实 demo、README 和计划说明由 root 完成。最新 typecheck、82单测、文档/库 build 通过；对照证据见 VALIDATION.md。

当前脚注修复为 UI 本地未提交、未发布修改，包版本保持0.3.2。UAH工作区干净，继续固定消费npm0.3.2，未复制组件源码或升级依赖。

最终主题/Markdown桌面专项17组通过、无pageerror，证据 `artifacts/theme-markdown-1tL79b`；普通正文和内层阅读区在浅深、1440px/390px的前往/返回共16次路径均保持外层位置，另验证Enter、减少动效与外链事件。root亲自复核8张最终脚注截图，顶栏完整可见且目标在所属阅读视口居中。原主题/Mermaid/details回归保留，测试避免locator点击准备阶段额外滚动祖先；诊断与最终验收见VALIDATION.md。

## 2026-10-07：MDI 指示图标与内容过渡

按用户要求盘点并替换 ListGroup、Treeview、ExpansionPanelTitle、Autocomplete/Cascader、日期翻页、Calendar、Carousel、Pagination、Activity 和表格展开入口的文字/自绘箭头，统一复用现有 MDI；日期输入、上传/移除和快捷操作也改为真实图标。表格排序保留此前验收的双三角 SVG。公开 props/models/events 未变，无新依赖。

ListGroup 复用 Collapse，子树和输入状态保留；Treeview 分支增加高度动效，离场立即 inert / aria-hidden。root 重写内部 expand helper，处理 padding/border/min-height、取消反转和 inline 样式恢复。补充输入弹出面板、Tooltip、抽屉遮罩、徽标、步骤内容、表格详情、ConfirmEdit/Lazy 的过渡。Overlay/BottomSheet 等退出动效完成后再释放原生 top layer、滚动锁及焦点；减少动效立即完成。Window/Carousel/StepperWindow 的进出内容在同一 grid 单元，避免切换中间帧叠高。

本轮产品、共享样式、真实 demo 和源码文档均由 root 直接修改；辅助代理只做独立交互回归。生成来源仍为 split-completion-demos.mjs，勿仅修改生成后的 SFC。计划与范围见 docs/ICONS-MOTION-2026-10-07.md。最终 typecheck、82/82 单测、库/文档 build 和完整 UI21/21（162 路由）通过，证据 artifacts/ui-VIKMWB；专项和 root 视觉复核另见 VALIDATION.md。

本轮和之前脚注修复均为 UI 本地未提交、未发布修改，main 检查点仍为 a8220aa，package0.3.2。UAH工作区干净，npm 消费版本不变。

专项还发现 ULazy/UImg 的 immediate watch 在 ref 未挂载时提前设置 visible=true，跳过真正的延迟加载。root 已改为等待 ref；不支持 IntersectionObserver 或显式关闭延迟时才立即显示。Img 真实示例同步 lazy 用法，Lazy 实际可以呈现占位离场→内容入场；两个小窗口的视口外/滚动进入路径由专项验证。

最终动效专项17/17通过、pageerror / Vue warnings 为0，证据 artifacts/disclosure-motion-azJW1B；新增测试为 tests/desktop/disclosure-motion.mjs。Lazy/Img修复后的typecheck、82/82单测、库/文档build和完整UI21/21（162路由）均通过，最终完整UI证据 artifacts/ui-HbR60v。root亲自验收浅深/宽窄列表与树、原生弹层/窗口中帧、表格详情和抽屉关闭布局，范围与边界见VALIDATION.md。仍未提交或发布。

## 2026-10-07：默认涟漪补齐

ListItem 默认启用 ripple，完成列表分组/菜单、选择器/树、展开/步骤、日期/轮播、表格动作和选择、颜色/评级/数值、清除/关闭/文件等离散操作的漏项。公开相关组件支持 false 或 RippleOptions；分页/服务端表格/Select/Combobox 等包装层转发配置。选择控件使用原生尺寸的局部反馈，保留 label/ref/键盘和焦点行为；内部 action-events.ts 隔离子控件，子按钮关闭 ripple 也不会触发父列表选择或父涟漪。静态 Card、输入编辑面、文本链接和遮罩不增加整面反馈。

root 完成全部产品代码、共享样式、真实 demo、生成来源与 API；辅助代理只新增独立 click-ripple.mjs 回归。视觉复核修正选择控件网格拉伸、窄屏顶栏开关隐藏及 Carousel/Label 的通用 span 样式误命中。ListItem、Ripple、Card 的真实示例已补全；公开 API 当前 148 个 canonical 组件、1306 props/models，详情和证据见 docs/RIPPLE-COVERAGE-2026-10-07.md。

最终 typecheck、82/82 单测、文档/库 build、原 Ripple78项和 activation43项通过。新专项154项通过 artifacts/click-ripple-LlPrpE，无 pageerror / Vue warnings。最新完整 UI21/21（162路由）通过 artifacts/ui-K4haar，展开/退出17/17通过 artifacts/disclosure-motion-qIqany；root 亲自验收16张浅深/1440px/390px原生图像 artifacts/ripple-visual-19s5C6。测试 Lazy 记录读取增加等待真实 transitionrun，消除首帧采样竞态，未放宽动作断言。

本轮及此前脚注/MDI/过渡更新仍在 UI 本地，未提交、未发布；main 检查点 a8220aa、package0.3.2。UAH 工作区再次核对干净，HEAD97c43a9，继续固定消费 npm0.3.2。

## 2026-10-07：按钮变体、颜色与反馈边缘

按钮 variant 统一为 elevated/flat/tonal/outlined/text/plain，仅负责样式；颜色改用独立 color，danger 默认随 error/on-error，显式危险色仍可覆盖。按用户要求默认 outlined，不采用上游默认 elevated。所有颜色的 elevated 共用增强三层阴影。elevated/flat/tonal 去掉占位透明边框，用 padding 补回原尺寸，让 ripple 覆盖按钮整面；图标固定尺寸和 loading 原变体/颜色/尺寸保持。

root 直接完成产品、全部共享样式和真实视觉 demo；内部按钮、示例、源码与生成来源同步迁移，API 不再列旧语义 variant。新增 ButtonAppearanceDemo，覆盖六变体四色及主题/CSS颜色，公开 API 仍为148个 canonical 组件、1306 props/models。细节见 docs/BUTTON-COLORS-2026-10-07.md。

最终 typecheck、84/84单测、库/文档 build 通过；按钮专项722项 artifacts/button-variants-35mtmy，loading3组 artifacts/button-loading-cMMoHK，完整UI21/21及162路由 artifacts/ui-pI2hLP，无 pageerror/Vue warnings。表单14/14证据 forms-RrbEQh。root 亲自复核浅深/宽窄16张外观/loading图像 Wc9vk1，以及边框修正后的12张真实按住图像 UAumHf，波纹边缘、阴影和尺寸验收通过。

当前按钮及之前脚注/MDI/过渡/ripple修改均未提交、未发布。UI main检查点a8220aa、package0.3.2不变；UAH工作区干净、HEAD97c43a9，固定npm0.3.2未升级。

## 2026-10-07：鼠标与键盘焦点提示

用户报告滑块鼠标操作仍有外框。root 复现文档 input:focus 的1px轮廓，同时发现原生 range 在键盘聚焦后再鼠标拖动仍保留 focus-visible=true；仅改伪类不足。新增内部 focus-modality.ts，按 ownerDocument 共享输入模式及节点注册，动作指令与保留原生焦点的非文本控件共同消费。鼠标模式抑制键盘轮廓，真实 Tab/方向键恢复；滑块不 blur、不阻止拖动。最后卸载清理监听，不新增公开 API 或依赖。

root 亲自完成滑块/颜色通道、复合输入与上传表面、原生文件/颜色/Select、树/卡片/级联/阅读区/标签面板和 UsageMeter 的焦点规则；文本/OTP编辑、选中装饰与拖放高亮保留。六个独立输入组件的真实 demo 说明和 README 同步。真实操作还暴露 ColorInput 的三位 hex 提前规范化和小色块 hover/focus 撑宽；保留编辑草稿、失焦规范化，专用选择器保持26×26。详细范围和证据见 docs/FOCUS-MODALITY-2026-10-07.md。

最终 typecheck、87/87单测、文档/库 build 通过；焦点专项28项操作观察无失败，artifacts/focus-modality-9raHif；完整 UI21/21、162路由通过 artifacts/ui-AmJ3ov。表单14/14通过 artifacts/forms-NTzx0x，涟漪 activation43项通过 artifacts/ripple-activation-EH0Zqj。root 亲自复核36张浅深/宽窄原生窗口图像；另一次深色390px焦点专项28项通过 artifacts/focus-modality-Cpwuz6。未把系统选择器或Firefox运行时列为已验收。

本轮和此前脚注/MDI/过渡/Ripple/按钮改动均为 UI 本地未提交、未发布更新；main 检查点仍 a8220aa、package0.3.2。UAH再次核对工作区干净，HEAD97c43a9，继续固定消费npm0.3.2。

# 文档导航与列表右侧内容

## 2026-10-09 发布门禁与家族路由

正式CI发现文档多行expose表达式JSON中嵌入CRLF，Linux原文提取LF导致精确契约检查失败；component-contracts读取时统一LF并加入同一SFC两种换行的等价回归。manifest/table示例原文比较也仅规范化两边换行后继续逐字校验，避免git switch重新检出CRLF后的Windows假失败；不能用trim、宽松包含或跳过契约代替。

发布消费盘点发现 TabsWindowItem 是多根组件，原生 class/style/属性/监听器必须显式透传到语义 panel 根；隐藏注册标记不能接收这些属性。tabs-window-protocols 增加真实消费属性与事件检查，Chrome 源码夹具11组通过。

完整 feedback 暴露 UButton 触发器重渲染后 Escape 不归还焦点：组件 ref 被原生 HTMLElement 判断清空。Menu/Dialog/Overlay 共用 overlayActivatorElement，先解析暴露的 element（支持 ref），再回退到 $el；不能把多根 UButton 的 $el 注释节点当成触发器。焦点断言仍等待离场完成，禁止用延时或删除断言掩盖引用丢失。

Dialog 的 Escape 在 document capture 阶段关闭，最高活跃层必须在这里标记 restoreKeyboardFocus=true；仅在内容 bubble handler 标记会因关闭而失去执行机会，导致鼠标打开、键盘关闭的抽屉不能归还焦点。feedback 保留鼠标打开路径，等待离场后再断言实际焦点；独立诊断等待超时证明并非仅检查过早。

用户要求先合并 UI 发0.4.0，再适配 UAH。完整 `tests/desktop/ui.mjs` 继续遍历173个原URL，但 h1 按 getDocsUsageFamily 的主页面断言，不能要求子组件独立 h1；保留旧hash与无溢出断言。Snackbar 家族并存两个游乐场，服务控件应在“创建、撤销与清空”region定位，实际通知仍从body查询。首轮 strict-mode 重复选择器失败必须保留，不能删除另一个真实demo来满足测试。

feedback/controls 的兼容标签游乐场现为chip，badge用于标准覆盖徽标；Spinner/Progress 动画与填充定位到复用组件的svg/u-progress-value。Progress使用家族包含真实indeterminate示例，截图只等待有限动画的finished，无限动画必须保持运行；否则controls的截图等待永不完成。

feedback键盘导航/焦点归还验证必须用focus+Enter打开普通Menu及panel。DOM菜单的finishEnter仅在keyboardInteraction时设置初始焦点；指针打开不能假定浏览器原生popover会自动把焦点移入内容。保留方向键、Esc归还、checked/keepOpen及panel Tab断言。

## 2026-10-09 用户批准合并方案并完成落地

用户最新“就按照这个方案来”批准 VUETIFY-CONSOLIDATION-2026-10-09.md，取代下方仅评估/待决定状态。完成记录见同目录审计中的 CONSOLIDATION-IMPLEMENTATION-2026-10-09.md；没有提交、推送或发包。

navigation.js 保留173页原始分类，新增26个显式使用家族，使用目录125个可导航页；API mode 保留158组件独立 href。UiPreview 以原页面数据派生家族页，API选择器选中真实 routePage，旧子裸 hash 保留 URL 并定位 API，有章节 hash 保留例子/约定定位。共享示例按 ID 去重挂载，子章节链接回公共示例；不能重复挂载同一 example-card 前缀。

Progress→Linear、Spinner→Circular、MenuItem→ListItem、SnackbarHost→USnackbar 已复用。保留旧几何、ARIA、tone/dense、checked/keepOpen/danger 等兼容项。MenuContext.ownsNavigation 区分普通菜单和自由内容 panel；ListItem、整行 slot 与 track 根键盘同样门控。Menu Tab 必须把负 tabindex 当前项纳入定位，再寻找 tabIndex>=0 的目标，不能先排除当前项导致索引-1回到列表根节点。

Host 内部 USnackbar timeout=-1/persistent/attach=false，服务仍唯一计时、6000ms默认；单条5000ms默认独立。role/aria-live允许原生属性透传，error=alert/assertive。Tabs 正常示例已迁至 eager、transition=false、keyboard=false 的 Window/Item，panel-persistence保留独立旧TabPanel协议；不能直接alias上下文依赖不同的两者。

静态消费插槽改名不等于公开子插槽；contract helper只为已声明静态槽合并scope，动态转发继续继承。同步API为158组件/2704props-models/324emits/604实际slots/541exposes，无运行时槽删除。专项21单测、57文档检查、12组件组和新tsconfig.component-consolidation检查通过；root视觉复核9截图。证据版本化到 checkpoint-evidence/2026-10-09-component-consolidation.json。源码Vite+Chrome夹具避免完整构建，提交推送前再全门禁。

## 2026-10-09 以 Vuetify 为标准重新评估合并

当前建议入口为 docs/component-audit-2026-10-08/VUETIFY-CONSOLIDATION-2026-10-09.md，采用夹具固定Vuetify4.2.4导航、API与导出。此次为评估，没有执行合并。子组件的使用文档可收纳，公共组件/API保留；水平/垂直Stepper、Chip/ChipGroup、Snackbar/Queue、Button/按钮组保留上游独立主边界。修正第一版过宽的统一家族页建议。

建议Progress→Linear、Spinner→Circular indeterminate保留兼容适配；MenuItem评估复用ListItem并解决唯一键盘处理者；SnackbarHost复用单条表面，Queue仍独立且保留计时/ARIA；TabPanel需先迁移上下文，不能直接alias到WindowItem。Vuetify Labs VProgress不是本库旧简单线性UProgress的等价协议，稳定Linear/Circular不删。

48个Ui*别名已经指向相同源码；CheckboxGroup已经薄封装，Hotkey已复用Listener，不为减少名称重复抽象。用户决定合并批次前不实施。

## 2026-10-09 Vuetify 分类与折叠菜单

当前入口为 `src/ui/docs/navigation.js`：16个分类显式声明页面id及显示顺序。content.js导出groups并在各生成模块合并完成后统一page.group，避免生成器恢复旧分类；新页面必须加入分类，专项检查173页/158组件完全覆盖且不重复。

UiPreview复用UList nav、UListGroup和UListItem，opened受控且openStrategy=multiple；开始使用/当前路由默认展开，hash及浏览器返回自动展开所属组。搜索首个非空值快照手动opened，结果类别自动展开，清空恢复；按Enter选首结果。前后篇按照未过滤导航次序。

没有合并组件、导出或页面。用户要求先列合并候选，最后由用户决定。候选清单为docs/component-audit-2026-10-08/COMPONENT-CONSOLIDATION-2026-10-09.md；下一步等待用户裁定具体范围。

专项单测13/13，真实源码Chrome45项通过，浅深/390px/125%浏览器缩放模拟无横向溢出、0 runtime issues、11源文件SHA稳定。缩放模拟为312×800 CSS px + DPR1.25，截图390×1000物理px，不是原生Ctrl+缩放。JSON已存checkpoint-evidence/2026-10-09-docs-navigation-groups.json；旧Electron专项已适配折叠，但本批没有完整构建或运行该Electron脚本。没有提交/推送/发布。

## 2026-10-08 旧平铺导航记录

2026-10-08：UiPreview侧栏使用UList nav/UListItem，href与active由当前文档路由控制，selectable=false；保留原生链接、aria-current、方向键/Home/End、搜索和移动菜单。库入口已导出组件，无需新组件。

UListItem的appendIcon沿用Vuetify的属性命名，appendText是本库扩展。append插槽优先替换两个属性；辅助文本单行省略并提供title提示。共享layout-components.css在有内置appendText时分配主标题自然宽度，辅助名称优先压缩，极长主标题仍可在自身区域截断。自定义append插槽布局和独立交互语义保持原样。

Icon根节点为span，不能以a > span笼统设置主文本flex，避免图标容器占据剩余空间。侧栏当前320px，移动屏幕max-width为calc(100vw - 32px)，保留遮罩关闭区域；不再在1220px断点缩到238px。

真实示例src/ui/docs/component-examples/list-item.vue；源码/页面说明由scripts/generate-completion-docs.mjs生成，API说明来自scripts/sync-api-reference.mjs。先验收共享组件再接入侧栏。构建后node tests/desktop/docs-navigation.mjs可检查全部导航项文字、图标和键盘/搜索操作；2026-10-08生产证据artifacts/docs-navigation-F41jzi，typecheck/build/87单测/完整UI21组通过。

Windows125%系统缩放会影响旧桌面脚本的尺寸和1px精确断言，单独测试进程可传--force-device-scale-factor=1；这不替代真实页面125%缩放验收。完整记录见VALIDATION.md。本轮不发布npm或更新UAH依赖。

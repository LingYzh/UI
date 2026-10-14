# NC_Admin 消费迁移

## 2026-10-13 选择器与连续表头

- 增强选择器边框按下后默认焦点转移会关闭刚开的菜单；fieldPointerdown阻止默认转移，fieldClick单次转发业务回调。selectOnly按聚焦前menu快照决定再次点击收起；清除独立stop、readonly/disabled无业务回调。只选型禁双击/Ctrl+A/Shift选文，普通搜索/组合输入保持文本编辑；原生selectedcontent禁选文。
- 固定表头thead使用连续sticky主题底色，避免分数宽度下露底；horizontal label gap统一12px。消费端设计器独立360px列宽阈值，不改变库普通表单559px阈值。
- Root控件9/9、设计器12/12、生成7/7；库选择/表格21/21、选择器类型检查、原选择协议16项通过，零warning/error。菜单传送后的专项用aria-labelledby关联触发器；UI_QA_BROWSER=msedge可用本机Edge，无需下载另一个浏览器。未全量构建/提交/推送/发布。

## 2026-10-12 行内按钮中线与小号尺寸

- 消费端任务操作行的纯文本按钮比prepend-icon按钮低4.4375px，原因是inline-flex首项基线不同，内容盒已flex居中。公共.ui-button设置vertical-align:middle，同行中心差恢复0；不用随字号translateY修正。
- UiButton的18px图标和默认padding使x-small/small撑到30px。显式小号padding2/4px，sm高度28px与small一致；五档24/28/36/44/52px，图标/文本同行同高，md全局密度与显式dense优先级保持。真实ButtonAppearanceDemo及buttonContent完整源码同步增加中英字号矩阵。
- NC_Admin旧AppMain全局滚动条颜色覆盖库；消费端移除后侧栏明暗透明轨道恢复。库滚动条实现无需改动。
- Root实际Edge检查24个几何/视觉场景（五档字号×六变体×明暗、125%缩放/窄屏、三档消费端密度、可滚动侧栏），零warning/error，证据NC_Admin/.Codex/evidence/button-geometry。操作列54/54、消费端专项18/18、button-directives3/3，未全量构建、提交、推送或发布。

## 2026-10-12 异步冻结与校验修复

- NC_Admin参考lorcana-ui activity统一列表读取/写入互斥，校验期间readonly冻结，成功后disabled保存，失败保留输入与错误。消费端实际CRUD发现form.ts把readonly变化当作校验失效，导致校验取消或必填提示消失。
- readonly只限制编辑，不改变校验资格；form.ts的规则/disabled监听不再监听readonly，不清空错误、不取消在途规则。disabled仍排除校验并清除错误，规则及值变化仍正常失效。
- 新增真实控件协议断言：只读恢复保留错误、异步规则中反复只读切换不取消、disabled保持原语义。`$env:UI_QA_BROWSER='msedge'; node tests/desktop/form-protocols.mjs`8/8；`node --import tsx --test tests/form-validation.test.ts tests/forms-prop-inheritance.test.ts`10/10；form-protocols专项类型检查通过。Root检查截图；证据artifacts/component-audit-root/form-protocols。
- 消费端异步24/24、CRUD10/10与交互14/14，管理端专项110/110；详情见NC_Admin/docs/ui-migration-acceptance.md。未发布/提交/推送或全量构建，继续本地链接。

## 2026-10-12 消费端全页验收检查点

- NC_Admin保持link:../UI，Root已完成29路由双宽度58/58、10管理页CRUD10/10、综合交互14/14、公共组件9/9、导航4/4、iframe5/5、设计器11/11。验收证据与边界在 NC_Admin/docs/ui-migration-acceptance.md。
- 消费端列默认均分与手动24栅格由既有UCol支撑；列内以ui-form容器查询实现窄列顶部/宽列左侧标签。编辑装饰只作用于外层字段，不击穿UNumberInput内部布局。本批未改库源码或发布版本。
- 任务、监控、缓存、注册/锁屏与文件演示范围已逐项获用户确认；原若依API/权限链路保留。生成/导出模板继续延后，真实后端权限和文件接口尚待接入，不能以预览绿测宣称生产全量通过。
- 前批库控件11/11浏览器专项、69/69逻辑专项及三个专项类型检查保留；提交/发布前仍需完整门禁。当前本地源码docs5174、管理端5173；用户localhost窗口未操作。

## 2026-10-12 新控件与属性页签整合

- 用户批准树内拖放、图片/图片卡片、HSV/HSVA、勾选下限、边框选项和自定义日期分隔符；均保留原协议并在NC_Admin本地链接接入。UTimeInput及高级日期模式公开入口、样式、demo/API文档已同步。
- UCascader按用户确认的Element Plus主要交互：标签放输入内、折叠计数、输入搜索、普通模式只可选叶子/严格模式允许父项；完整路径模型不变。beforetoggle同步open，避免原生toggle延迟导致清空后立即搜索不重新打开。严格单选图标引用@mdi/js路径，不能传未注册的legacy名字。
- Root视觉验收发现bordered+label属性没有渲染边框；UiCheckbox/UiRadio新bordered模式把label作为选项内文字，普通模式保留原外置label语义。
- 属性页签切换时滚动条来自UiTabs的offset取整，末端159.5px滑块宽被算160px；矩形测量保留小数坐标/尺寸并计入滚动位置与边框。NC_Admin属性页签rounded=false，三宽度动画采样通过；tabs专项类型检查通过。
- Dialog补非scrollable具名槽、closeOnClickOutside、页脚间距；Icon数字字符串转px；上传图片预览使用对象URL并随模型/模式/卸载释放；图片Viewer保留禁用/只读语义。
- 库控件真实浏览器11/11，NC设计器11/11、公共布局6/6，均无warning/error。Root亲自检查截图；相关库专项69/69及专用类型检查通过。未全量构建、提交或发布，组件缺口与全站业务验收仍继续。
- 本仓库npm管理，专项直接node；不要运行pnpm exec/install改变node_modules布局。

## 2026-10-10

- 用户授权在本仓库补齐 NC_Admin 迁移缺口，通过本地链接验证，所有缺口确认完成后再发布版本。
- 不改后端；生成模板后置。执行 worker 限定 CCS Luna，组件方案、视觉样式与最终验收由 root 负责。
- 初始 UI 仓库干净，版本 0.5.0。当前新增 UImageViewer，包含多图浏览、缩放、旋转、拖动及真实 demo；尚待专项与视觉验收，未发布。
- 后续待核查与补齐：树选择、树表格及其他消费过程中确认的缺口。不能把当前首个组件完成当作全量迁移或发布门禁通过。
- UImageViewer 已接入中英文 locale 文案；locale 专项 7/7 通过。曾误用 pnpm exec 触发自动安装，已删除本次生成的 pnpm 文件并以 npm ci --ignore-scripts 按原锁恢复，package-lock 未改；此仓库专项直接 node 执行或 npm，不使用 pnpm。
- UTreeSelect 已新增映射/搜索/清空/单值选择实现、主题样式、真实示例和导出；逻辑专项 6 项通过。当前 NC_Admin 已本地链接本库，尚未发布。
- UiButton 外层改为实际 button/a，Button.Root 移至内部提供上下文：v0 的 Button.Root 即使非 renderless 也包含 Fragment，不能作为需要消费方 DOM 指令的根。若依必须继续使用原 v-hasPermi/v-hasRole，不以条件判断绕过兼容问题。
- UListGroup 默认触发器增加 prepend/title 插槽，保留内部 activator ref 和键盘管理，用于侧栏图标及标题。
- 表格遗留的原生 button/select 样式必须排除 USelect 及其直接 button；否则原生 base-select 的触发器被 28px 最小高度撑大。data-components.css 已缩小两个选择器作用域，在 NC_Admin 实测分页本体恢复 36px、选项 35.6px。
- Button DOM 指令专项 tests/button-directives.test.mjs：2/2 通过，覆盖允许保留和拒绝移除 button/a，使用真实 v0 Button.Root。
- 用户追加授权修复库内主题问题。原生库示例的双向展开没有复现 NC_Admin 的整页闪亮；NC_Admin 自有 Web Animations 裁剪残留在消费者修复，保留其明亮铺开、深色收束方向。
- 库内新增主题回归先出现 3 项失败：选择已有主题让工具类 style 写入由 1 增至 3，以及两种中断路径的 ready 未处理拒绝。theme.ts 改为只在配色定义变化时生成工具类，并处理 ready 的取消拒绝；不改变默认动画方向、公开 API 或动画时长。
- node --import tsx --test tests/theme.test.ts tests/theme-transition.test.ts：15/15；本批为专项检查，未全量构建或发布。
- theme.ts 严格专项类型检查通过（TypeScript 6 指定文件时需 --ignoreConfig）；库文档明暗切换与本地链接 NC_Admin 双向动画均已浏览器复测，本轮无新增 warning/error。

## 主题方向与 demo 补充验收

- 用户随后明确要求库自身也采用“明亮铺开、黑暗收束”，覆盖上一轮保留默认方向的边界。theme.ts 根据目标主题 dark 属性选择新快照 reveal 或旧快照 conceal，显式设层级和 mix-blend-mode，保留默认 400ms、减少动效和公开 API。
- ThemeDemo 的切换、循环和下拉设置触发控件中心，源码示例同步。用户确认循环示例限定 light/dark/ocean/midnight，system 保留在下拉中；默认 cycle() 仍包含 system。原末项 system 在系统浅色时与首项 light 同色，看似没有动画，实际浏览器 reveal 正常，不能误记为动画未启动。
- 真实 demo 已验证完整四主题循环及夜海回浅色、系统明暗变化、手动/系统减少动效及恢复、自定义颜色与 lighten/darken、局部及嵌套覆盖、Teleport Dialog、Mermaid 图表继承。颜色恢复 #246a91，局部恢复 dark，全局恢复 light，清除系统偏好模拟；控制台无 warning/error。
- UAvatar 增加 ui-avatar-wrapper 并使用 inline-flex/vertical-align:middle，消除普通 span 基线导致的头像居中偏差，继续支持 UBadge 包装。消费方实测按钮/头像中心差小于 0.001px。
- 主题专项 16/16、theme.ts 严格专项类型检查、git diff --check 通过。tests/desktop/theme-transitions.mjs 同步深色收束预期；本轮视觉验收通过 CUA 操作开发页，未运行完整桌面套件、构建或发布。

## 窄屏表格回归

- 用户要求继续参考项目原对齐基准 Vuetify 4.2.4。官方 VDataTableRow 在 mobile 时不传列 width/maxWidth，VDataTable.sass 采用等宽标题/值网格，选择框靠末端，展开按钮居中。
- DataTableCore 的移动单元格原来仍写入桌面列宽，导致 180px 时间列和操作列压缩中文 label；现按移动模式清除列几何尺寸，普通插槽与默认文本放入独立值区。桌面 DOM/列样式、选择/展开特殊插槽保持独立路径。
- data-components.css 移动行采用 repeat(2,minmax(0,1fr))，标签靠起始边、值靠末端，长文本在本区换行；选择/展开列使用内容宽度轨道分别末端/居中对齐，避免控件自身 justify-self:start 抵消布局方向。
- NC_Admin 本地链接实测 390px、602px、1280px，窄屏无列/整页溢出，桌面尺寸恢复，移动行选择和操作弹窗正常，控制台无 warning/error。table-alignment.test.ts 14/14、管理端相关专项 7/7；未全量构建或发布。

## 布局密度三档

- NC_Admin 反馈布局大小未生效，实测 compact 已有部分差异，但 comfortable/default 的文本框、选择器与普通按钮高度相同。用户确认在库中补齐三档并实时响应。
- UiButton 默认 md 高度按 default/comfortable/compact 为 36/34/32px，padding 也随密度改变；按钮及图标按钮 CSS 消费高度变量。显式 dense（包括 false）或 density 优先，显式 size 保留尺寸，不被全局 density 默认值覆盖。
- 文本/数字输入框与增强选择器补 comfortable 内部 input 的 min-height/padding；只改外壳 min-height 不能缩小内部内容。增强选择器设置与文本框一致的 1.4 行高；UiSelectNative 补 comfortable class；textarea 内边距随三档变化。
- NC_Admin 本地链接实测输入框/增强选择器 38/34/32px、按钮 36/34/32px，表格表头 52/44/40px，显式 compact 操作按钮固定 32px。实时切换不重建输入节点或清空内容，旧 Element Plus 由消费方配置同步。
- 新增真实按钮运行时密度回归，覆盖默认值响应更新、dense true/false、显式 compact 和数字 size；按钮/表单继承专项 4/4、tests/tsconfig.form-defaults.json 类型检查通过。未全量构建、提交或发布。

## 服务端表格滚动与日期控件（2026-10-10）

- NC_Admin 大量模拟数据联调确认：已有服务端 size 更新会重置 page=1，但翻页仍保留旧表体滚动位置。用户授权翻页/每页数量变化后回顶部；DataTableCore 的滚动重置监听增加 state.page/state.size，普通数据刷新、选择和展开不触发重置，virtual.reset 同时适用非虚拟表体。
- 服务端真实 demo 增加 240px 固定表头滚动区域，文档记录 size -> page=1、page/size -> scrollTop=0 及刷新保留位置。专项覆盖有限每页数量和 -1 均复位页码、服务端行不再次切片；table-alignment 14/14，通过 demo 与管理端翻页/数量变更实测。
- UDateInput 遗漏 hideDetails/persistentHint 的 undefined 默认值，Vue 将遗漏 Boolean 解析为 false，导致不能继承 UForm hide-details。补齐后日期筛选不再多出底部详情空行；真实 Vue props 继承矩阵纳入 UDateInput，先复现失败后修复，日期格式与继承专项 11/11 通过。
- ui-control-clear 原生 button 默认 padding 将 18px 图标挤出 24px 内容中心，且 ripple 指令临时设置的 inline position 会被 UiMenu activator 行内样式更新覆盖。公共样式固定 padding:0/position:relative，复用该按钮的日期、清空等控制保持居中和稳定波纹定位，不增加消费方定位补丁。
- NC_Admin 和原生 date-input demo 实测日历按钮中心偏差小于 0.001px，打开/关闭后的波纹范围与按钮完全一致；管理端 390px 无横向溢出、1280/1920px 日期控件与同排按钮底边一致，两页控制台无 warning/error。消费方继续 link:../UI；未全量构建、提交或发布。
# 2026-10-10 暂停检查点

## 2026-10-12 公共布局与设计器补齐（进行中）

- Icon无单位数字字符串size必须转换px；Vue静态size="16"之前导致实际SVG为300×300。兼容CSS长度与变量，SSR专项含数字/字符串/空格/小数/单位，管理端卡片及Chrome页签1440/390px已实测居中。
- UiDialog普通模式也须兑现header/footer具名slots；有具名槽采用固定header/footer+plain滚动body，裸default槽保留旧布局，scrollable保留UiScrollArea。公共SSR回归已通过，管理端Excel导入桌面/窄屏已检查。
- 新UTimeInput复用UiMenu/UTimePicker与FormControl，24小时canonical字符串模型；默认readonly输入但可通过popup选，明确readonly禁改；range双端数组，草稿确认/取消，allowedRanges+min/max限制，逆序阻止保存。helpers2/2、专用types通过，demo交互验收进行中，尚未发布。
- UCascader新增multiple/filterable/checkStrictly/max/chips，泛型兼容单值；multi parent checkbox只选择可选叶节点，路径标识包含完整分支。Root将clear定位容器从含chips根节点改为trigger容器，beforetoggle同步初始化搜索，避免异步toggle覆盖即时输入。高级日期与所有模式的最终browser验收待完成。

- 联合迁移暂停，完整接续入口：`E:/WebstormProjects/NC_Admin/HANDOFF.md`。本地链接和未提交源码全部保留，未发版。
- DataTableCore 的原生选择框/按钮改专用 class，避免后代通配规则将 USwitch 输入压成 16×16；管理端和 demo 实测恢复 36×20。
- UTreeview 可交互行 pointer、禁用 not-allowed，树文本 user-select:none，编辑输入保持选择。管理端和 demo 已验证点击、双击与键盘左右展开收起。
- 空 children 数组保留懒加载分支契约；普通管理端 TreePanel 通过 item-children 映射空数组为 undefined，其最后消费端改动尚未验证。
- 表格/树表专项最后 16/16（文档同步后），树状态 7/7 与树专项类型检查通过。部门/菜单的 UTreeTable 消费迁移已交付但 Root 浏览器验收待续；不代表全部迁移完成。

## 2026-10-12 固定列、详情抽屉与遮罩

- 表格横向单元格边距提取为 --u-data-table-cell-padding-inline（默认/comfortable 16px，compact 12px）；管理端用它从操作列的三分之一上限中扣除实际 padding，避免密度变化时提前换行。原来的表格 padding 和密度效果保持一致。
- DataTableCore 为固定列组内侧（最后 start / 首个 end）生成边界类，主题 border 细线作用于表头/数据行；普通 gridlines=none 不隐藏固定分界线，移动卡片不显示。已对照 Vuetify 4.2.4 官方 Sass，并在明暗 demo 和管理端实测。
- UDrawer 复用 UiDialog placement=end，提供 open/modelValue、header/default/footer/activator、open/close，默认 560px/maxWidth100vw；平直主题边界。管理端用户与字典详情已接入，未发布。
- UiOverlayHost 接收面板状态，遮罩以 opacity 180ms 淡入/140ms 淡出；UiDialog/UOverlay 等待兄弟遮罩过渡完成再卸载。减少动效与 transition=false 无动画，快速重开复用 CSS 过渡当前透明度。
- UDrawer 默认恢复触发器焦点。减少动效快速关闭会碰到触发器 vPointerBlur 下一帧失焦，需要 cancelPointerBlur 再恢复；源码浏览器回归已验证这个真实竞争。
- UDateInput 新 editable 默认 false，输入 readonly 但日历仍可修改；点击和 Enter/ArrowDown 打开。editable=true 继续手动输入。库原生选项与只选型 USelect 输入用 pointer，禁用保持 not-allowed。
- 最后库表格/树表 16/16、日期格式/props继承 11/11；drawer 浏览器专项 7/7（不隐式构建），相关专项类型检查通过。证据与恢复入口见 NC_Admin/HANDOFF.md，当前 docs 5174，未提交/发布。



## 2026-10-13 UI 控件细节与动效验收

- 按钮保留原圆角尺寸，支持的浏览器用轻量 superellipse 平滑圆角；加载态复用 UProgressCircular，保留按钮尺寸、禁用与 aria-busy。圆形进度归一化 pathLength；表格共用的线性进度参考本机 Vuetify 的双段 2.2s 动画，减少动效时保留静态可见进度。
- 数值输入使用语义 SVG 加减图标，stacked 变体共用连续侧栏、取消继承行间隙；纵向范围滑块原生轨道显式 4px，OTP 的边框/背景/阴影过渡统一 180ms。
- 多选 chip 与输入合为可收缩内容区，长名称单行省略并保留 title，已有选择不显示 placeholder；可创建选择器补齐 chip 两侧间距。菜单有进入/离开过渡，保留再次点击收起、焦点与旧分支协议。
- 日期默认提示改为“请选择日期／日期范围／日期时间”。日期时间组合采用用户确认的紧凑选择行：隐藏重复标题与整段文本输入，仍使用原选择限制与草稿确认/取消；390px 下开始、结束时间各占一行。新增 UTimePicker hideInput，不改变原默认展示。
- Calendar 跨日事件与短事件对齐起点；纵向 radio 标签与首项对齐。业务二值字段改为带当前状态文案的开关，分类选项继续横向单选，原字符串值及只读/禁用继承保持。
- FAB／快捷操作按本轮确认范围支持四向展开、动作依次进出、键盘导航、Esc/点外部收起和 Esc 焦点返回；UFab modelValue 与 active 共同控制显示。Demo 留足展开空间。未宣称完整兼容 Vuetify 全部属性。

### 本轮实测

- Root 在实际链接源码上操作并亲自查看明暗、桌面、390px 的组件与业务弹窗截图；证据在 NC_Admin/.Codex/evidence/library-polish/ 和 library-polish-business/。
- 新脚本 scripts/qa/library-polish.mjs：6 个数值图标几何居中、纵向 radio 首项标签、日程起点、进度多帧、菜单过渡、日期确认/取消、窄屏边界、四向 FAB/Esc 焦点，零 console error。
- scripts/qa/library-polish-demos.mjs：4 个真实 demo 路由通过；library-polish-business.mjs：9 个真实业务页新增弹窗逐个切换并恢复开关，零 warning/error。
- 管理端 async-controls 24/24、button-geometry 24/24、control-regressions 9/9 通过；异步读取/保存失败与控件冻结未回退。
- 库相关逻辑专项 18/18 + 25/25；speed-dial-behavior 1/1；真实选择协议 16 项、设计器控件 11 项、数值协议 5 项、日历协议 6 项、菜单分支 11 项通过。三个相关专项类型检查通过。业务 11 个 SFC 编译专项通过。
- API 文档及三个相关 demo 源码同步。没有运行全量构建，没有提交、推送或发布；仍使用本地 UI 链接。后端权限、真实调度、文件生成和导出模板不在本轮验收内。


## 2026-10-13 重合滑块、时间选项与复合字段回归

- URangeSlider 对照 lorcana-ui 安装的 Vuetify VRangeSlider.js：两个端点重合时按移动值的方向切换 activeIndex，并在同一原生 pointer 手势内持续使用活动端。结束时焦点跟随活动滑块，键盘仍分别操作各端且遵守边界，readonly/disabled 与 start/end 配对保持。修复真实 demo 的纵向滑块静态 modelValue，改为 v-model，并增加从重合点开始的演示。
- 原生时间 select 没有 UiScrollArea 子容器，却继承了 picker 的 overflow:hidden。仅对没有 .ui-select-options 的 picker 限高 min(280px,50dvh)，启用原生纵向滚动和 overscroll containment；有 UiScrollArea 的选择器继续自己的滚动协议。桌面和 390px 可滚到 59 秒并确认回填。
- UField slotted 原生输入被文档全局 input:focus-visible 画出额外轮廓；Field 输入移除自身轮廓，由字段表面提示焦点，plain 在键盘焦点时提供整个表面的细轮廓。多选同样由组合字段表面承担焦点，避免 1px readonly 输入或搜索尾部出现孤立细线。
- USelect/UAutocomplete 的 blurOnSelect 未指定时动态取 !multiple：多选保留焦点/菜单，单选沿用选择后关闭/指针失焦；显式 true/false 优先，Esc/外部点击继续关闭。UCombobox 原有默认保留，避免改变单选创建输入的受控 search 提交时序。新增真实 autocomplete 连续多选 demo，公开说明/API 同步。
- 用户编辑/新增的岗位字段改为单独整行，角色保留原列宽；仍使用库 USelect，无业务 CSS 仿造 chip。
- Root 新 scripts/qa/control-followup.mjs 通过 15 组真实组件操作：横向/纵向/反向/RTL 重合分离、0/100 边界、同手势经过重合、键盘/只读/禁用/start-end、三类多选、显式失焦/单选、时间选项滚动与保存、Field 七变体清除/禁用、真实 range/autocomplete demo 和用户编辑弹窗。错误/警告为零，明暗与 390px 截图已亲自复核。
- 库数值逻辑 6/6、选择协议 16 项、数值协议 5 项通过；选择/数值/专门输入三个专项类型检查及用户 SFC 编译通过。没有全量构建、提交、推送或发版。
- 复跑：源码预览 127.0.0.1:5173 + 库文档 127.0.0.1:5174，执行 node scripts/qa/control-followup.mjs；证据在 NC_Admin/.Codex/evidence/control-followup/。本轮 5173 为隔离预览，用户 localhost:80 窗口未操作。
# 2026-10-14 恢复与树形下拉多选

- 用户确认停止文档服务后，已用 npm ci 恢复依赖。UI 仓库只使用 npm；官方 registry 与 Electron 二进制下载分别启用本地代理。
- 角色自定义部门需要多选、独立勾选的树形下拉，用户批准补齐 UTreeSelect。multiple 模式采用数组模型，默认 independent；选择后保留菜单，清空为 []；父子节点不会隐式联动。
- 真实示例覆盖桌面浅色、暗色和 390px；专用表单夹具补充 required、readonly、disabled 与 reset。NC_Admin 继续本地 link，管理端不推送。
- 恢复依赖后的旧完整门禁已通过；新增多选源码后的最终发布门禁另行记录，不能引用旧结果替代。

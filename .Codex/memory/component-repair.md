# 全库对齐修复（进行中）

本会话2026-10-08已在D:/UI与D:/UAH交接分支恢复继续，经济型GPT-6 Luna/max执行非视觉子任务，root负责契约/示例/验收。用户已回答三项冲突：ConfirmEdit、Hover、DefaultsProvider均直接统一标准行为。下文旧“待确认/停止”是历史记录，由HANDOFF当前入口与RESUME-2026-10-08.md替代。三项实现、语言作用域、分组wrapper转发本批补齐，部分验证台账继续保留所有原始缺口。UAH仍消费正式UI0.3.2，不自动接入未发布源码。

2026-10-08 用户授权根据完整审计报告逐项修复和补充。保留本库新增特性与默认值，冲突先询问；经济配置的 gpt-6-luna/max 仅执行 Root 已明确的非视觉任务。Root 亲自处理契约、样式、真实示例和最终验收。日常仅专项检查，完整构建/测试留到提交推送前。

最新用户授权：完成当前任务后停止；交接改为 UI 与 UAH 分别提交推送新分支 `codex/handoff-component-alignment-20261008`，无需离线包，仍无发布授权。HANDOFF 顶部为新恢复入口；下方未提交及恢复包描述保留为先前快照。提交前完整检查与环境限制在 VALIDATION 更新。完整单测发现文档生成器没有同步三项新增示例到 manifest，以及路由检查遗漏 table-align 动态分支；已补生成器 manifest 输出，并让测试同时检查 table glob 与真实文件，相关8项及全量152项通过。

UI 最终 Node24.19.0 完整类型、152单测、docs/lib build、完整 Electron UI21组/171路由通过。像素断言固定测试窗口device scale=1以隔离Windows125%缩放；server/local共用DataTableCore后必须检查唯一根框与原生table，不能继续查旧内层UDataTable。旧ghost透明表头规则需同时覆盖新单根server结构，已修复并复核浅深截图。专项JSON与完整UI报告保存进docs/component-audit-2026-10-08/checkpoint-evidence便于跨设备；截图仍为本机忽略文件。

修复前报告 docs/component-audit-2026-10-08/REPORT.md 与三个 results JSON 是历史快照。源文件改变、canonical 数量由 153 增至 156 后，不再拿原审计 validator 当当前兼容性证明；修复记录在同目录 REPAIR.md。尚未完成全库对齐，不能因属性或插槽同名而标记已验收。

## 用户确认的兼容策略

- 保留本库默认值，通过显式属性开启标准行为。
- UCounter 字符串仍统计 Unicode 码点；displayMode="value" 直接显示字符串，max 支持字符串，disabled 仅关闭超限样式；标准插槽含原始 value。
- 旧 UField 更名 UFormField（UiField 兼容别名仍为原实现）；旧 UPicker 更名 UOptionPicker；旧 UHotkey 更名 UHotkeyListener。用户确认名称。新原名承担上游职责，并补原能力；旧版本保留，未设弃用日期。
- UImg 的 load/error 默认仍发 DOM Event；UTooltip 的 default 默认仍为触发器；UDataIterator 的 items 默认仍为原始项。统一用 standardProtocol 显式选择标准协议。
- InfiniteScroll 同时接受旧 direction=start/end/both 和新 vertical/horizontal；新轴值配合 side=start/end/both。默认仍纵向、end 边缘。
- UItemGroup 用户已明确选择统一标准 selected ID 数组并迁移旧用例；isSelected/select接收ID，selectedValues为公开值。兼容值函数命名isValueSelected，toggle仍按值切换。UItem按钮默认保留，tag=false可无包装。此项不再等待确认。

## 已有专项证据

- group-state 配置按最新 getter 读取；Window/Carousel/Stepper 上下文不能 spread 破坏 getter。受控 null 初始 mandatory 注册需先记录待回写选中项，否则后注册项抢占首项。tests/group-reactivity.test.ts、tests/desktop/group-reactivity.mjs 与隔离类型检查通过；证据 artifacts/component-audit-root/group-reactivity。
- UiRadio 注入 SelectionControlGroup；模型、name、disabled/readonly、trueValue 与对象比较、Form validate/reset 均有实际专项。USelectionControl value 可省略，优先 trueValue > value > true。tests/desktop/radio-group-alignment.mjs 与专项类型检查通过，最终证据 artifacts/radio-group-alignment-4AgSYc。
- Form 内联 rules 数组不能通过赋新空 errors 数组触发自身 slot 重渲染循环；复用相同函数的数组不失效；重建相同函数体的内联 callback 不取消本轮校验；同一数组原地换规则仍按身份失效，包含同源码不同捕获值测试。下次 validate 总读取当前 callbacks。相关实现 Root 在 form.ts，不能只测试 Radio 脱离 Form 的情况。
- 新 Field/Picker/Hotkey、三旧入口、Counter 与公开 createUI 注册有 tests/desktop/component-repair-protocols.mjs 专项和 156 项注册证据，隔离类型检查通过。实际截图发现 Field 复用旧 UiField 的默认两列压缩新表面，已将新 Field 默认布局设 vertical；旧 UFormField 布局不变。后续截图/几何专项继续验收此修复。
- field-picker.css 必须放在 styles.css 起始 @import 区域；放在规则之后会被 PostCSS 忽略。不要在 fixture 额外 import 掩盖产品入口问题。
- hotkey.ts 分隔符与平台映射专项 9/9。InfiniteScroll 纯状态 helper 的 fake observer/边缘/横向/回调代际/滚动 delta 专项通过；真实 Img/InfiniteScroll 集成已通过 media-scroll-protocols 和隔离类型检查，截图含浅深主题与窄屏。图片 lazy native loading 不能在隐藏节点继续等待原生 lazy 判定；进入组件观察区域后切 eager。内联 src 对象重建但请求字段未变时不能重载；父级 load 回调重渲染可能导致缓存图片循环。陈旧 DOM 回调必须核对当前图片节点。
- Tooltip 专项和隔离类型检查通过；click 模式不受 pointer-blur/mouseleave 关闭，只有实际 focus/hover 模式处理对应离开事件。标准 default 插槽的 isActive 是可写 Ref；Root 复核开态窄屏截图。外部 activator、滚动策略和清理仍需按具体覆盖范围描述，不能据此宣称整个 Overlay 契约完成。
- Responsive 尺寸、additional/contentClass、inline 与真实 demo 专项通过；640px 上限、180×90 推导及窄屏无横向溢出有几何证据。inline-block 在 Grid 子项中会 blockify，验证 inline 排版应放正常块流，不用共享 CSS 对抗规范行为。
- Lazy 已补受控模型、options/once/disabled、尺寸和过渡。实际 demo 发现 once=false 的 visible 更新重建 observer 导致每次进入通知两次；Root让持续 observer 保持实例，复测一次进入严格只通知一次。disabled=false与model=false同一tick合法，visible watch不能在旧disabled状态将模型回写true；原子更新专项通过。
- PullRefresh 独立状态层专项通过：只检查最近实际可滚动容器；组件自身为滚动容器时只检查自身顶部，不能因外层已滚动阻止。自身 scrollTop>0 必须阻止。reset/unmount 使旧完成回调失效；load/refresh 必须共享幂等 done。SFC 和真实 demo 正在集成验证。

## 当前边界

UImg、UInfiniteScroll、UiTooltip、Lazy/Responsive、Messages/Label、Parallax/PullRefresh、LocaleProvider 已有专项行为和局部视觉验收，但仍按 partially-verified 记录，保留原审计缺口。Parallax/Pull真实鼠标/触摸、直接图像协议和本地图片解码通过；Root复核浅深/窄屏。Locale helper16项及真实Provider Electron专项通过，Root复核截图；旧fallback优先新fallbackLocale，local/祖先同语言查找后才用fallback。扁平精确键→完整嵌套路径→$vuetify去前缀的扁平/嵌套路径，所有字典读取使用own property。UiPagination仍取全局uiText，未进一步修改。

DataIterator 状态 helper 14/14 专项通过；公开 Chromium 组件/真实demo集成11组通过，Electron host未能创建窗口，仅声明Chromium源码renderer验收。manual itemsLength只跳切片，本地过滤排序分组仍生效，标准协议不发本地currentItems；标准search重置页码。完整分组树与当前分页扁平group rows分开；提取当前组行递归去重。旧demo显式standardProtocol=false，否则fixture全局defaults=true会让原字段卡片空白。

隔离夹具引入docs-base后，html/body/#app的固定100%高度与overflow:hidden会裁剪超视口的locator截图，底部可能全空白；fixture显式auto高度/overflow:visible，保留真实组件样式，不能拿空白图验收。Vite虚拟入口应限定optimizeDeps.entries并忽略artifacts/cache/profile；遗漏watchignore曾使导航等待失效，先检查HTTP和DOM再定性为产品bug。

当前另有待用户确认的 ConfirmEdit 深克隆/常显、Hover 禁用保存状态、Defaults reset 根回溯三类同名冲突。未收到答复前不改。用户要求完成当前工作后停止、换设备交接；本轮不再启动其他缺口修复。新设备从HANDOFF顶部恢复；大部分表单、导航弹层、媒体和布局缺口仍需继续，不能宣称全库完成。相邻UAH既有改动保持原状。

## 换设备最终检查点

所有当前工作完成指定专项后停止。ItemGroup状态13项/公共Chromium10组、Locale相关16项/Provider Electron、Parallax/PullRefresh Electron集成均通过；Root复核当前媒体、分组、Provider截图。分组keyed反序索引更新必须在实际拥有slot render effect的UiControlFrame上用vue:updated同步；只UItemGroup onUpdated会漏，helper reorder同序必须直接return。UChip/ChipGroup/Button/BtnToggle注册和值/class/约束覆盖只代表对应特性，公共wrapper标准slot/方法转发仍待逐项补。

153项历史审计台账当前28部分专项验证、125待处理（92原明确差异、23本库扩展、10未确认缺口）。公开入口156；API声明文档1837属性模型/182事件/313插槽/356公开成员与5项源码/API检查一致，不等于完成兼容。UI main e63b618/package0.3.2，UAH main97c43a9且既有dirty；无提交/推送/发布。HANDOFF最新节包含剩余阶段、确认策略和3项待决定。恢复包artifacts/device-handoff-20261008.zip包含未提交与untracked源码和证据，排除依赖/缓存/dist/上游归档；换设备仅带HANDOFF不会同步代码。

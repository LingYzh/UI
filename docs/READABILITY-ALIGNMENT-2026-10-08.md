# 字号可读性与 Vuetify 再对齐

用户要求提高15px以下文本字号，并复查/补齐剩余组件与使用方式。root 负责所有产品样式、组件模板、真实独立demo和最终视觉验收；辅助代理只核对和测试。UI先行，不修改UAH、不发布、不变更包版本。

## 实现前盘点与规格

- 复用当前148个 canonical 组件、162文档页、选择模型、defaults、主题、MDI、减少动效与涟漪。旧审计表格是48组件基线，不能直接作当前缺口。
- 官方 npm latest 于2026-10-08核实为4.2.4，固定该标签的稳定入口、SlideGroup/Item、Snackbar/Queue与Code源码；Labs独立记录。
- 字号14px改15px，13px及以下增加2px；包括正文、控件、辅助文字、代码token、font shorthand、CSS工具类和真实demo来源。15px以上不放大，图标/几何尺寸不随字号批量修改。保持小字/正文层级及紧凑密度，放大后检查长内容、窄屏与缩放。
- 已确认缺独立UCode、公共USlideGroup/USlideGroupItem以及受控USnackbar/USnackbarQueue。代码块不代替行内代码，Tabs内部滚动不代替公共任意项目选择组，全局snackbar服务不代替局部v-model组件。
- Code采用语义code标签；SlideGroup使用值模型和无额外按钮/框架的renderless Item，支持多选/mandatory/max、滚动箭头、当前项定位、水平/垂直及真实键盘；Snackbar支持受控开关、内容/动作插槽、超时暂停与主题；Queue以待显示数组模型消费，支持显示限额、hold/overflow、清空和每项完成回调。每种组件有独立示例、源码和当前API。

## 实现补充

- 五个组件、独立真实SFC示例、u-注册、公开类型与API同步；153个canonical组件、167页面、106个独立示例。新示例以独立SFC为作者源，split脚本明确保留，不再从旧family示例抽取覆盖。
- UBtnToggle现可直接使用UButton/value；省略值时按索引注册，aria-pressed随模型变化。非mandatory单选可取消；readonly/disabled/max继续共用原表单状态。普通按钮仍透传调用者aria-pressed。ItemGroup与SelectionControlGroup修正aria-label透传。
- SlideGroup复用主题/MDI/减少动效，Item无额外按钮或容器；滚动只作用于自己的视口，不移动文档祖先。showArrows按4.2.4实际源码策略，centerActive在滚动边界钳制。
- Snackbar超时、悬停/内部焦点/文档隐藏暂停、重开、动作与过渡属于局部生命周期，不清除全局snackbar服务；Queue待显示数组FIFO、显示限额、hold/overflow、clear、promise结果与dismiss原因；折叠堆叠展开悬停时暂停所有条目，退出动效后清理表面。保留原全局服务，文档路由改为snackbar-service，避免抢占受控组件页。
- 实际overflow回归发现受控defineModel在父组件渲染前不会刷新getter，原消费循环会重复条目并在overflow时冻结renderer。pump改为本地pending快照逐项消费，循环末一次性回写；专项要求2/3条可见通知的内容、次序和消费后的等待数都正确，不仅检查DOM数量。
- 字号调整同时修正theme-defaults里覆盖CSS的13px代码值和代码字号Demo默认；Markdown相对行内代码加1px，保持正文中的代码可读。文档侧栏名称允许换行，代码/辅助层级仍与正文区分。
- 调试发现宏嵌套会残留withDefaults/defineProps运行时调用，已改为Vue可识别的rawProps声明再接useDefaults；真实渲染必须同时检查Vue console error，pageerror为空不够。单测补充所有组件/服务/指南路由跨类型唯一，避免相同路由隐藏真实示例。

## 验证

- 最终类型检查、87/87单测、文档/库构建通过，日志为artifacts/readability-{typecheck,unit,build}.log。当前153个canonical API包含1366 props/models、126 events、205 slots、278 exposed members；独立示例与全部167页面路由唯一性通过源码/编译检查。
- root逐张复核artifacts/readability-visual-1C2586的36张原生窗口PNG：Form/Button/Markdown/ServerTable/Code/SlideGroup/BtnToggle/Snackbar/Queue × 浅深 × 1440×900与390×844。字体、标签/说明位置、源码/表格内部滚动、菜单箭头、受控消息与窄屏换行可读；页面没有横向溢出，rootScroll/headerTop均为0，代码token为15px，pageErrors/consoleErrors为0。消息队列最后的消费循环修正不改变这些表面样式；其最终交互和并发状态另验收。
- 按钮加载态专项3组通过（artifacts/button-loading-XGjsob）：浅深主题各8组变体/颜色和5组尺寸/loader边界，等待态只有一个loader、尺寸保持且恢复正确；没有renderer错误。

- 新组件真实交互专项13/13通过（artifacts/readability-alignment-GQEmNn/report.json），包括真实Arrow/Enter/Space、多选上限/mandatory/禁用/只读、渲染无额外按钮、水平/垂直滚动与当前项边界、Snackbar颜色/位置/悬停和键盘焦点暂停、重开与超时、Queue FIFO/并发2或3条的消息唯一性/overflow/clear/promise成功失败。pageErrors、console error及Vue warning均为0（测试宿主自身的Electron CSP提示单独记录）。
- root另亲自检查该最终专项的5张原生PNG：垂直禁用SlideGroup、右上outlined自定义色Snackbar、三条不同消息并发、错误色异步结果及390px队列输出。文字、图标、圆角、阴影、条目间距与长输出换行通过；最后消费修正的并发消息确实不同，三条保持先后顺序。

- 完整UI21/21、全部167路由通过（artifacts/ui-cSmvXL/report.json），errors为空；Forms14/14通过（artifacts/forms-x7kekT），覆盖统一状态、验证/提交、label/hint、Row/Col响应式与表单几何。旧UI测试的全局通知服务场景同步到snackbar-service路由，保留真实原生select和全部定位/暂停断言。
- 脚本语法和git diff --check通过。UI本地main a8220aa、package0.3.2，改动未提交、推送或发布；UAH HEAD97c43a9且工作区干净，固定npm0.3.2未变。

## 再审计边界

官方4.2.4稳定102家族/8指令均有本地公共基础实现或明确职责映射；四个此前确无公共实现的稳定家族已补齐。Labs十家族仍是实验范围，DatePicker range和现有进度不等于Labs DateRangePicker/Progress完整契约；其余实验组件未宣称提供。沿用UAH外观，并保留用户指定的默认outlined按钮，未迁移Material主题。逐属性兼容、全面SSR/hydration、完整RTL平台测试不由组件入口盘点推定完成。

最新机器清单为 [4.2.4入口与职责映射](VUETIFY-ALIGNMENT-AUDIT-2026-10-08.json)，记录官方tarball/integrity、102稳定入口、8指令及10 Labs边界。99个稳定家族有同名U*公共实现；VBtn映射UButton，VGrid映射Container/Row/Col，VIconBtn通过UButton的icon使用。2026-10-06 JSON保留原4.2.3历史基线，不用旧数组中的缺口判断当前状态。
> 后续字号规范：用户随后明确改为整体采用Vuetify4字号；本文的字号增量仅是历史记录。当前字号和Toolbar实现、最终证据见[Toolbar与字号记录](TOOLBAR-TYPOGRAPHY-2026-10-08.md)。

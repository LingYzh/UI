# 输入、文件和日期组件视觉复核

Root 直接检查真实公开组件 demo 的原生截图。本记录只覆盖下列呈现状态，不能替代全部组件、全部状态的视觉验收。

- FileInput / FileUpload：浅色宽屏、深色 390px、浅色 390px 125% CSS zoom。检查完整文件名、自定义摘要、大小、移除按钮、单文件内嵌列表和浏览按钮；长内容换行，未发现横向溢出。文件控件专项 18 项及原有表单/数值/文件专项 11 组通过，包含真实系统文件选择器、FormData、键盘和异步拖放禁用竞态。
- NumberInput：浅色宽屏、深色 390px、浅色 390px 125% CSS zoom。修正新增内容容器漏命中输入透明样式的问题；复核左右按钮、末端按钮、上下排列、前后缀、自定义按钮和计数器。数值字段专项 7 项及原有数值专项 5 组通过；16 个原生输入没有额外灰色内框。
- Calendar / DatePicker：深色 390px Calendar 和浅色 390px 125% CSS zoom DatePicker。检查地区周号、事件间距、月/日/资源视图、单日期与日期范围；全天事件标题按日格宽度省略，时间视图保留重叠事件各自点击区域。日期专项 6 组通过。此项不覆盖所有日期面板和所有视图组合。
- Switch：深色 390px 键盘焦点与波纹、浅色 390px 125% CSS zoom。检查轨道、滑块、图标、加载、只读/禁用与校验提示；专项 25 项通过。
- 输入共享 Menu：Autocomplete 浅色宽屏、Combobox 浅色 390px、Select 浅色 390px 125% CSS zoom、DateInput 深色 390px 的实际打开状态。弹出物保持可读且位于视口内；专项 16 项、Overlay 12 项和后退关闭 8 项复跑通过。包括 Escape 后输入仍聚焦时再次点击重开。

执行与证据：`tests/desktop/file-slots-protocols.mjs`、`number-field-protocols.mjs`、`calendar-protocols.mjs`、`checkbox-switch-protocols.mjs`、`selection-menu-protocols.mjs`。原生截图及报告位于对应 `artifacts/full-alignment/` 子目录；每份报告保留当时实际源文件 SHA。截图是忽略产物，跨设备按脚本重跑。

关键文件基线：FileInput `2019e647ce3e4687e88be24028beb91562e26aa9a5a10953cb5c47252687f1e4`，FileUpload `659230aee7096f6e4d84570e287f98e3da287ac73192b30c8fee99feb77710a1`，共享 styles.css `43ea0404342d4d7886706edaa15bf28a68b5ce45de1a96f7b71241e076a337ba`。之后修改对应源文件时不得套用旧报告宣称新状态已验收。

继续范围：Tabs 复杂模型、应用布局命名及交叉边缘、弹层容器完整契约、列表/树和其余语义缺口。上述专项通过不代表全库对齐完成。

后续同批收尾复核：TabsSelectionDemo 在深色 390px 与浅色 390px / 125% CSS zoom 下，对象/数组双选项各有独立下划线，草稿字段与模型输出可读；专项 14 项、TabsWindow 10 项和真实 demo 3 组/3 视口通过。截图位于 `artifacts/full-alignment/tabs-selection-demo-acceptance/`，报告保存最新源 SHA。根样式已增补链接标签和多选标记，旧通用样式 SHA 只属于上文初次复核。

FileInput 增补作用域文案与 placeholder 后专项为 21 项；新 UFileInput SHA 为 `8e3257cbcdca0cd8a26ce7596a2b81eb39373148f6a56ab5d223f26112dea402`。相关截图和 source hashes 已由专项刷新，实际文件摘要/大小/移除布局保持本次已检查的呈现。

菜单分支收尾：root 查看独立真实 MenuBranchDemo 的浅色 1200px、深色 390px、浅色 390px/125% CSS zoom 和独立 Dialog 四张全视口图。菜单及子菜单文字/触发器可读，窄屏弹出物在视口内；Dialog 的 header、正文操作和 footer 清晰。截图前连续三帧断言可见 surface 为 open、所有子树动画结束、opacity=1，早期淡入中的图不作为验收。专项 11 项及 Overlay 12 项、SelectionMenu 16 项回归通过，无页面错误/警告。证据位于 `artifacts/component-audit-root/menu-branch-protocols/`，报告包含截图状态和源 SHA；UiMenu 为 `7b3e321178fc8b77d1121aed2547736aeb5baf7dd911de5b932d5d8db0dad6cd`，MenuBranchDemo 为 `66204fd9c73b0739220fcecfb0fd0d2692731a71480f063edb9347e29acab525`。

应用布局本批仅有基础 API/实际尺寸专项，未声明完整跨边缘几何或布局视觉验收。下一会话须在用户确定默认 order 后继续真实 demo 及视觉复核。

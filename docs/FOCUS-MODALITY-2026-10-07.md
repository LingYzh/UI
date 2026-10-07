# 鼠标与键盘焦点提示

复用现有 Slider、RangeSlider、ColorPicker、文件/颜色输入、共享焦点 tokens 与真实组件独立示例，不新增组件、公开 API 或依赖。root 直接负责产品样式、demo 说明和视觉验收；辅助代理只做交互审计与回归。

实现前盘点：文档基底 input:focus 为所有原生输入添加外框，单滑块与颜色编辑器的三个 range 通道未覆盖；双滑块仅在 focus-visible 移除轨道外框，鼠标焦点仍命中文档基底。上传区 focus-within 和复合输入容器也可能被内部非文本操作触发。按钮、列表、选择控件等显式焦点轮廓大多已经使用 focus-visible，继续验证真实操作。

目标：鼠标点击/拖动非文本控件不显示键盘焦点框，实际 Tab/方向键操作保持可见焦点、焦点位置和原生编辑语义；文本编辑时仍保留输入表面的活动提示、光标与选中。不会通过 blur 或阻止原生拖动来隐藏外框。选择状态的描边与拖放提示不属于焦点提示，保留。

旧构建真实操作报告 artifacts/focus-modality-YiCqT0/report.json：Slider、RangeSlider 下限、ColorPicker 色相通道鼠标拖动时实际聚焦、focus-visible=false，却均有1px实线外框。三者经真实 Tab/方向键聚焦后，在同节点鼠标拖动时还会保留 focus-visible=true。因此仅替换 CSS 伪类不足，必须明确输入模式。

内部 focus-modality.ts 按 ownerDocument 共享 pointerdown/keydown 捕获监听与注册节点；鼠标/触摸模式标记 data-ui-pointer-focus，键盘输入清除。vPointerBlur 的动作控件和 vFocusModality 的非文本原生输入共用追踪；后者不 blur、不阻止默认事件、不移交焦点。最后一个节点卸载时清理监听，文档和组件生命周期独立。键盘样式同时判断原生 focus-visible 与输入模式，复合容器检查内部未被抑制的焦点；文本输入不注册追踪，仍保持原生编辑提示。通过低优先级规则去掉浏览器残留的原生外框，选中状态的独立装饰仍优先。

审计补齐保留焦点的 Treeview 行、Card 表面、Cascader 触发器/选项、原生 Select、ScrollArea 阅读视口和 TabPanel；不引入点击后 blur，保留它们已有的漫游焦点、弹层和阅读滚动行为。UsageMeter 的局部 scoped 焦点样式也接入模式判断。滚动条随 hover/focus 显示、文本/OTP 编辑状态、色块选中描边和拖放高亮保持原语义。

六个独立组件文档页（Slider/RangeSlider/ColorPicker/ColorInput/FileInput/FileUpload）补充鼠标与键盘用法，来源为 generate-completion-docs.mjs，README 同步；真实组件与可复制示例继续对应，不新增配置属性。

实际键盘文本检查还发现 UColorInput 的原有规范化 watch 在输入合法三位 hex 时立即把编辑文本扩成六位，继续键入 `#12abef` 会得到 `#1122aabef`。root 同步修正：当前草稿与模型表示同色时保留文本/光标，外部不同色仍更新；失焦后统一为模型格式。保持测试逐字键入和完整值断言，不用一次性 fill 掩盖问题。

root 复核原生颜色/文件控件截图时还发现原生颜色按钮在 hover/focus 被通用 .ui-input > input 样式改成 flex:1 / width:100% 的长条。增强专用选择器优先级，保持26×26与flex:none；键盘提示由所属输入表面呈现，不再给小色块重复画框。该修正由 root 编写，测试补充实际几何不变检查。

root 已亲自复核 **24张原生窗口PNG**：artifacts/focus-visual-OcN4Yc（Slider/RangeSlider/ColorPicker × 鼠标/键盘 × 浅深 × 1440×900/390×844）。真实指针拖动后仍聚焦且数值改变，鼠标无外框，实际 Shift+Tab/Tab/ArrowRight 后恢复单滑块/颜色通道外框与范围手柄光晕。所有图像尺寸与窗口一致、没有横向溢出，rootScroll/headerTop为0，pageErrors为空。此后其他表面补丁不改变这三个组件的样式或原生输入行为。

最终产品的 typecheck、**87/87单测**、文档/库 build 通过，日志 artifacts/focus-{typecheck,unit,build}.log。新增三个 tracker 单测验证同文档共享/晚挂载继承、不同文档隔离、重复释放与最后卸载清理，事件不取消、控件不 blur；剩余存活控件继续响应输入模式。

最终桌面焦点专项 artifacts/focus-modality-9raHif/report.json 通过，28项操作观察、issues/pageErrors均为0。覆盖六个 range 输入的真实指针拖动、Tab/方向键和同一聚焦节点的键盘→鼠标→键盘切换；选择控件 direct/label/Space、按钮与列表、文本/多行/OTP编辑，以及原生颜色/文件/上传输入。原生颜色按钮空闲、鼠标、键盘三种状态都保持26×26，颜色文本逐字输入、失焦规范化及原生值事件同步通过。文件和颜色按钮的指针检查使用按下后移出释放，避免打开系统选择器；未宣称验收系统对话框。

root 亲自复核最终产品的另外 **12张原生PNG**：9raHif 的浅色桌面1264×1015，以及 artifacts/focus-modality-Cpwuz6 的深色窄屏390×844，各自覆盖 ColorInput/FileInput/FileUpload × 鼠标/键盘。颜色按钮尺寸稳定，鼠标没有键盘提示，Tab 的输入表面/文件外框/上传高亮清晰，暗色与窄屏布局通过。Cpwuz6 的28项操作观察也全部通过，issues/pageErrors均为0。结合前述24张滑块图像，本轮 root 共验收36张最终图像；Firefox手柄焦点样式已补齐但未做Firefox运行时验收。

完整 UI **21/21、162路由**通过 artifacts/ui-AmJ3ov/report.json，无pageerror；表单 **14/14**通过 artifacts/forms-NTzx0x，保留统一状态、几何、提交、只读与Tooltip键盘行为；涟漪 activation **43项**通过 artifacts/ripple-activation-EH0Zqj/report.json，无pageerror。最后的26px颜色按钮专用CSS修正后，焦点专项和完整UI均重新通过；表单与涟漪结果来自该局部几何修正之前。脚本语法与 git diff --check 通过。

UI 本地 package0.3.2，main 检查点 a8220aa；本轮未提交、未发布。UAH HEAD97c43a9、工作区干净，继续固定 npm0.3.2，不修改消费端。

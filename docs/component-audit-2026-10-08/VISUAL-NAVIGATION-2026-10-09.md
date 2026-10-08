# 导航与颜色弹层视觉复核

Root 直接检查真实公开组件 demo：ColorInput、Window、Carousel、ExpansionPanels、BottomNavigation、BottomSheet、StepperWindow，以及 TextareaProtocolDemo。此次只验收下列实际呈现的状态，不代表全库视觉验收。

- 1200px 浅色、390px 深色、390px 浅色 125% CSS zoom：选中导航按钮、展开面板、键盘切换的 Window、Carousel 第二页、步骤内容和文本域。
- ColorInput 真实弹层：浅色宽屏、深色窄屏、浅色窄屏 125% 缩放。修正原先在缩放下超出视口的宽度限制，弹层和 HSV/HEX 控件保持完整。
- BottomSheet 深色窄屏：底部定位、遮罩、内容与操作按钮。
- 对上述截图逐一人工复核：文字和图标可读、控件间距一致、选中与焦点状态可见，未发现横向溢出或控件重叠。自动 fixture 同时检查实际交互、边界框和控制台错误。

执行：`node tests/desktop/alignment-visual-navigation.mjs`。报告与原生截图：`artifacts/component-audit-root/alignment-visual-navigation/`；报告保存此次实际源文件 SHA。截图与浏览器 cache 是忽略文件，跨设备须重跑；不要将之后修改的源码套用旧报告。

仍需继续的范围：其余组件的语义缺口、弹层完整 attach/contained 契约、进一步定位边界及各剩余组件的专项视觉验收。上述页面通过不能替代这些工作。

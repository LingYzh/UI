# 视差组件

2026-10-08盘点：复用公开UParallax、background/default(offset,ratio)插槽、UImg与UScrollArea，注册和独立文档页已有；缺口是内部滚动事件、实际滚动视口计算与背景图片覆盖，并非需要新组件。

旧组件只监听window冒泡scroll，文档.docs-content-scroll与UScrollArea内部滚动不会触发；offset不更新。UImg根元素未填满背景高度，speed较大时原20%余量不足。

修复捕获祖先scroll，以滚动祖先可见范围计算ratio；rAF合并测量，ResizeObserver刷新尺寸，speed/disabled变化及系统/应用减少动效立即刷新，卸载清理。背景根据有效speed保留余量，UImg/原生img填满，前景按场景实际高度居中。公开API和默认speed0.3保持。

独立真实demo提供360px内部滚动区、关闭视差开关和位移读数；源码与生成说明同步。基线artifacts/parallax-FN5QMG：内部滚动200px后offset仍13.337。最终artifacts/parallax-GLu1NL：speed0.8时同样滚动从-48到12px，9组专项通过，无Vue警告/pageerror；含窗口/内部/外层裁剪滚动、前景与背景不同速、图片覆盖、动态速度/禁用/尺寸/重挂载、系统/应用减少动效、真实demo滚轮与开关及浅深/390px/125%布局。Root查看最终原生截图并验收。

tests/tsconfig.parallax.json只检查UParallax及依赖类型；API/插槽契约和发布源码编译3项通过，git diff --check通过。源码专项直接用Vite，无完整构建或全量测试；Node22.19.0是本次实际专项环境，项目目标仍24+。未提交/推送/发布，保留既有工作区改动。

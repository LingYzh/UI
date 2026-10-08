# 测试执行范围

四类表格补齐后的最新专项与兼容差异见table-alignment.md；表格入口类型配置tests/tsconfig.tables.json不包括全工程根文件。浏览器直接使用Vite源码fixture，完整UI脚本会隐式build，日常不要调用。当前脚本环境Node22.19.0，项目目标仍Node24+，提交完整检查需采用目标运行时。

2026-10-08用户明确要求：日常修改只做相关专项测试和必要视觉验收，不运行完整构建测试。提交推送前再跑完整检查（typecheck、全量单测、build、全UI）；发布前仍核查打包和消费方兼容。专项优先用开发服务或源码fixture，避免测试脚本隐式触发完整build。规则已同步AGENTS.md。

虚拟表格复用UiScrollArea：原生滚动条会占用宽度，让表头和行背景右侧出现空白。UDataTableVirtual改用覆盖式滚动条，scroll事件负责虚拟行窗口，高度保持外框语义，公共props/slots不变。源码专项node tests/desktop/virtual-table.mjs不需要build；基线virtual-table-rAMcyu，最终证据artifacts/virtual-table-rNEVUx。四组浅深/宽窄/125%几何、一万行虚拟化、键盘末行、固定表头、排序、滚轮、纵向拖动和横向滚动通过。详见VALIDATION.md。

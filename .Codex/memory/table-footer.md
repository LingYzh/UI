# 表格分页页脚文字

2026-10-08：UiDataTableServer使用既有UiSelect与UiPagination。ui-table-page-size中旧82px固定宽度在控件字号16px时会把10条省略。选择框改为width:auto、min-width:7.5em，随字号与选项调整；数量组和ui-table-range采用flex:0 0 auto，计数不被压缩。窄屏通过已有footer flex-wrap分行，不裁剪标签。随后按用户要求先改14px，再按最新指示改13px，不影响其他选择框；纯字号调整未单独测试。后续四类表格补齐复用共同页脚，最终13px专项7组artifacts/table-footer-d0Avdd通过，详见table-alignment.md。

源码专项node tests/desktop/table-footer.mjs无需完整构建。证据artifacts/table-footer-LOvRsu：7组，含浅深宽窄/125%/10000条/空计数/四外观，选值重置页码及loading禁用通过。root已验收6张原生截图。日常遵循testing.md：仅专项，完整测试和构建留到提交推送前。公开API与分页逻辑未变。

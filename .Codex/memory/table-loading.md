# 表格加载条复用线性进度

- 2026-10-15：DataTableCore原先用独立ui-table-progress缩放整条，和UProgressLinear长短双条循环不同。顶部/底部默认loader现在直接复用UProgressLinear，删除旧动画及transform-origin。
- 保留3px表格加载条高度、loading的颜色和start/end/both位置、自定义loader插槽及加载期间操作锁定。颜色通过color/currentColor传入，不能把品牌色涂到整个进度轨道背景；RTL及系统/应用减少动态效果交给公共组件处理。
- 普通、服务端、虚拟与树表共享DataTableCore；旧UiTable的文本loading插槽不在此次动画变更范围。
- 新增table-examples/loading.vue真实对照demo，由sync-table-docs.mjs同步生成文档与可复制源码。使用普通/服务端/虚拟表格切换，线性进度参考并排验收。
- 复跑node tests/desktop/table-loading.mjs：18项真实浏览器检查，每种模式在8个时刻对照两段动画的相对几何、周期和颜色，覆盖三个表格/三种位置/三档密度/RTL/暗色390px/减少动态效果/自定义slot与完成状态。专项类型检查及24项table-alignment/tree-table/layout测试通过。
- 证据artifacts/table-loading。当前改动尚未提交、推送或发版，npm0.6.3不变；Admin dev使用本地alias可见，backend/构建需后续UI发布升级。
- Admin真实岗位页使用本地源码，明暗两主题均验证长短双条动画，零异常/警告，Root亲自检查截图；证据NC_Admin/.Codex/evidence/table-loading。仅浏览器本地状态置为loading，不访问或写入真实后端。

- 2026-10-15后续已获授权发布0.6.4：c1f779a/v0.6.4、Actions38704665688与官方registry核对成功，完整门禁及18项逐帧检查通过。此前未发布状态被此记录替代，Admin消费固定0.6.4，dev仍使用本地alias。

# 2026-10-09 应用布局续作

用户确认保留当前默认几何，显式属性启用 order 分配。UApp/ULayout 新增 layoutMode="legacy"（默认）或 "ordered"；overlaps 仅 ordered 消费。ordered 将实际栏/侧栏按四边累计 rect 定位，嵌套布局使用 absolute；显式 absolute 栏仍预留内容空间。保留旧默认 fixed/absolute 保留空间规则。

共享 helper 同步 keyed 子项顺序，reorder 同序幂等；KeepAlive 停用取消预留，恢复重新预留。横向侧栏的 styles 不得写 width:undefined，否则 spread 会清掉原有 width，使侧栏按内容收缩。

已通过：状态专项13项、app-layout-api隔离类型检查与Chrome浏览器6组；layout-order-protocols Chrome8组（动态mode/order/width/open、实际overlaps/mainRect、嵌套absolute、KeepAlive、真实demo浅宽/深390px/CSS zoom125%），零页面错误。Root已复核最终三种视口截图。未运行完整门禁，没有提交/推送/发包，UAH继续正式0.3.2。

本机Playwright指定Chromium1243未安装，有已安装Chrome；专项显式channel:'chrome'。按源码生成API/真实示例，生成数量不表示全库行为完成。

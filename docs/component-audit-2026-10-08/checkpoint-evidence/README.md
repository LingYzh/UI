# 分支交接验证证据

2026-10-08 按用户要求将此前接受的源码专项 JSON、源码 hash 检查及最终完整 Electron UI report 保存在 Git，供新设备继续核查。脚本路径和验收边界见仓库 HANDOFF、VALIDATION 与 REPAIR。

- 完整检查：Node 24.19.0，typecheck 通过，152/152 单测通过，docs/lib build 通过，Electron UI 21/21 组通过，171 路由与 pageerrors=[]。
- 完整 UI 固定测试窗口 device scale=1，隔离本机 Windows 125% 显示缩放；此设置不改变组件或生产应用缩放。
- 旧专项报告中本机绝对路径、截图文件名、临时端口是当时的运行记录；截图、日志、profile、依赖与 dist 不在分支内。需要视觉复核时重新运行相应专项。
- source-evidence-check.json 仅统计报告实际提供的 hash；media-scroll 旧报告没有 source hash，不据此宣称 hash 验证。其他报告中列出的源码 hash 已与最终组件源码核对。
- 原153项台账仍为28项 partially-verified、125项 pending；完整基础回归通过不代表所有上游稳定接口已经深度对齐。

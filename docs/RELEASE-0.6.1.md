# @lingyzh/ui 0.6.1

修复 Snackbar 过渡方向、动态队列进入动画及计时条流畅度，保留现有公开属性、模型和超时语义。

## 变化

- 单条消息、队列与服务式通知共同按显示位置决定进出方向；中部居中仅淡入淡出，逻辑 start/end 支持 RTL。
- 计时条改为 requestAnimationFrame 驱动的 scaleX，避免固定40ms更新与宽度重排；保留反向进度、悬停/焦点/隐藏页面暂停和关闭清理。
- 队列条目先挂载关闭态再打开，恢复进入动画；提前取消的条目直接清理，避免等待不存在的 after-leave。
- demo 增加中部位置及计时条方向选项，展示源码与说明同步。
- 三个纯编译/SSR 测试关闭文件监听，避免并行 Electron profile 锁文件导致超时或 EBUSY。

## 验证与消费

- Node24.19.0：完整 typecheck、381/381 单测、文档与库构建通过。
- Electron 全量21组、178文档路由通过；Snackbar源码专项覆盖九种位置、RTL、队列 hold/overflow/Promise/clear、计时条及明暗/窄屏/减少动态效果。
- npm pack 白名单569文件及所有 exports 核对通过；发布结果另以标签、Actions 与官方 registry 为准，见同名 evidence JSON。
- NC_Admin 的开发服务继续使用本地 UI alias，构建和其他环境使用固定 npm 版本；本次发布后更新其 package 和锁文件。

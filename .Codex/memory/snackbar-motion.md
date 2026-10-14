# Snackbar 过渡与计时条

- 2026-10-14：进入/退出改为依赖实际 data-position 的 CSS 方向变量。顶部从上、底部从下，中部左右沿横向，中部居中仅淡入淡出；start/end 遵循 RTL。同一规则覆盖 USnackbar、USnackbarQueue 和 UiSnackbarHost。
- 计时条从 setInterval(40ms) 改为 requestAnimationFrame，使用 scaleX 替代 width，保持原 timeout、reverseTimer、暂停原因集合及页面可见性语义；关闭/卸载取消帧回调。运行时 timer 开关不重置关闭截止时间。
- Queue 新条目先挂载关闭态、下一 tick 打开，避免首次 open=true 跳过 Transition enter；尚未打开即被取消的条目直接清理，不能等待不存在的 after-leave。
- 源码浏览器专项：`node tests/desktop/snackbar-motion.mjs`，不触发 build；证据 `artifacts/snackbar-motion`。九种方向、逻辑 start/end 的 RTL、队列/服务通知、正反计时、真实 hover 与独立 focus 暂停恢复、自动关闭、关闭后重开、明暗/390px/减少动态效果通过。40 帧采样39次更新，布局宽度不变。
- 相关类型检查：`node scripts/typecheck.cjs --noEmit -p tests/tsconfig.snackbar-motion.json`；全局服务计时单测 `node --import tsx --test tests/snackbar.test.mjs` 2/2。
- 管理端自身的 FeedbackHost 同样按关闭态入队、nextTick 后打开，修复业务消息首次挂载缺少进入动画；其浏览器复跑 `node scripts/qa/feedback-motion.mjs`，Node 专项12/12。
- 本次没有提交、推送、发版或全量构建；已发布 npm 0.6.0 尚不包含这些修复，NC_Admin dev 的本地 alias 可立即验收。

## 0.6.1 发布检查点

- 用户随后授权提交并发布0.6.1，再升级并推送NC_Admin两个分支；上文“未提交/未发布”为此前状态。
- Node24.19.0全量类型、381项单测、docs/lib构建、Electron21组/178路由通过；源代码专项增加队列hold/overflow/Promise与提前clear。npm pack569文件及exports通过。
- 初次全量单测与Electron并行时，三个 configFile=false 的纯转换测试监听了整个工作区，触及 profile/Cookies 的锁文件并超时/EBUSY；为这些测试设置watch:null后全量复跑通过。对应初次与最终日志保留，不能把基础设施失败当作产品通过。

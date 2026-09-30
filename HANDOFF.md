# UI 项目交接

更新日期：2026-09-30（发布流程）；下文开发检查点保留历史记录，消费方式和验证结果需以实际仓库状态核对。完整跨仓库交接位于相邻 UAH 项目的 `D:/UAH/docs/HANDOFF.md`。本项目的持续规则在 AGENTS.md。

## 当前 npm 发布入口

- 提交 `f26cdc9` 已加入 `.github/workflows/publish.yml`：推送 `v*` 标签，经版本匹配、类型检查、单测、构建和打包预览后，由 GitHub Actions 使用 npm Trusted Publishing / OIDC 发布到官方 registry，dist-tag 为 `latest`。
- 发布前同步 package.json/lockfile 版本并完成本地桌面 UI、专项、兼容性与视觉验收；当前 CI 未覆盖这些检查。推送标签会实际发包，完成后核查 Actions 和 registry，再更新 `.Codex/memory/publishing.md`。
- 0.2.1 的网页授权发布属于历史记录，不代表新 workflow 已完成发包。相邻 UAH-desktop 当前 package.json/lockfile 使用 npm `@lingyzh/ui@0.1.0`；下文 `file:../UI` 描述属于旧检查点或显式本地联调。

## 开发顺序与分工

动手前先盘点要用到的组件。缺少组件或通用能力时，先在本项目实现、导出，增加真实 demo、文档页并调试，由 root 视觉验收并记录，之后才在 UAH 使用。子代理发现缺口先上报 root，不自行规划或在业务项目里绕过。

视觉效果的样式编写由 root 亲自完成，或委派至少 GPT-6 Sol medium；Luna/Terra 不承担视觉样式。已验收组件的组装及非视觉工作可交给低级模型，经济优先不能降低视觉任务下限。

## 项目结构与消费方式

- `src/ui/index.ts`：公开导出；同目录维护组件、tokens、样式、ripple 和 snackbar。
- `src/ui/docs`、`src/ui/UiPreview.vue`：真实文档与 demo，当前全组件回归覆盖33个文档路由；以 content.js 和公开导出为准。
- `src/components/Icon.vue`、`src/assets/icons`：库内图标，不依赖 UAH 原型目录。
- `tests/desktop/ui.mjs`：隔离 Electron 文档回归；`tests/snackbar.test.mjs`：服务单元测试。
- UAH 使用 `@lingyzh/ui: file:../UI`；package exports 指向 Vue/TypeScript 源码，Vite dedupe Vue。不是复制源码，也不是从远程仓库实时加载。
- 修改本库后，UAH 开发服务读取该本地包；生产构建需重跑。保持相邻 checkout，并先在 UI 安装依赖，再在 UAH 安装。

命令：`npm ci`、`npm run dev`（5174）、`npm run typecheck`、`npm test`、`npm run test:ui`。`npm run build` 输出文档 `dist/docs` 和库 `dist/lib`；`npm run preview` 使用 4174。

## 最近状态

用户明确要求将两仓当前累计改动连同handoff提交。本检查点基于 main 的 `010605f`，包含此前尚未提交的所有组件、依赖锁文件、文档与测试；具体新提交号以 `git log -1` 为准。仅创建本地提交，未请求push。UAH同步保存匹配功能检查点，恢复时两仓应一起checkout。

累计交付：UiTextarea与UiTooltip；UiActivity执行活动与内联样式；UiDiff行级快照差异和共享line-diff；UiFileChanges、UiMessageActions及剪贴板宿主适配；UiMarkdown的GFM、公式、Mermaid、安全HTML和自适应流式文本；UiUsageMeter的紧凑入口、服务/估算/未知状态及独立分类条。相关tokens、CSS、公开API、真实demo和文档已同步。依赖版本锁在package-lock.json，不引入Material主题。

已有组件修复：UiDialog的固定标题/错误/footer与正文滚动；UiSelect分组、描述式选项、原生回退及相同value的动态标签更新；UiCodeBlock共享复制、换行与长内容；UiScrollArea外壳使用overflow:clip，避免聚焦折叠按钮时外壳意外滚动，使弹窗正文移出视口。真实viewport仍负责鼠标、键盘和滚动条交互，无UAH局部CSS补丁。

最新验收：typecheck、文档/库构建通过；全组件20项回归通过（artifacts/ui-PHOT1i）。UiUsageMeter专项及六张浅深1440/900/125%截图通过（usage-meter-qKhMlm）；嵌套Dialog→Collapse→CodeBlock的实际文本Range可见性、viewport对齐、尾部与footer专项及八张截图通过（dialog-nested-Avpq9P），root均已亲自验收。此前Markdown、Diff、对话操作、Tooltip、Textarea和Select专项记录见VALIDATION.md与各专项验证文档。测试证据artifacts为本地忽略内容，不随Git提交；共享源码、脚本、文档均提交。

配套UAH已通过263项自动测试、Git/context真实Electron37条断言与Plan回归。使用file:../UI和Vue dedupe；不要复制本库源码到UAH。生产端需重新build并重启Electron，网页刷新不足以加载UAH主进程更新。

已知边界：UiUsageMeter不提供tokenizer或模型能力猜测；分类合计与服务计数独立。Markdown仅渲染可见内容，不接受任意执行；嵌套列表/引用/details中的Mermaid围栏保留代码回退。新业务需求先盘点组件并遵循UI-first，当前没有未完成的已授权UI修复。

## 2026-09-30 A 批（0.2.0）

为 KAM（Kiro Account Manager）从 React 迁移到 Vue 补齐组件，UAH 默认行为不变。

- locale：新增 zh/en 两种语言，默认 zh，文案与原文逐字一致。
- 新增组件：UiBadge、UiAlert、UiSpinner、UiMenu/UiMenuItem、confirmDialog/UiConfirmHost。
- 现有组件扩展：UiButton 加 danger，UiDialog 加 size 与 placement=end，UiInput 加数字模式，utilities 补充字号、截断、定位、网格等类。
- UAH 如需使用 confirmDialog，要在根组件挂载一次 UiConfirmHost。
- 验收记录见 VALIDATION.md“2026-09-30 A 批组件验收”。
## 2026-09-30 B 批（0.2.1）

- 新增组件：UiCheckbox、UiRadio、UiProgress、UiCopyButton、UiColorSwatches，样式集中在 `controls.css`；新增 `copy.label` 与 `swatch.*` 文案。
- UiColorSwatches 的选中判断忽略大小写；色板外的已保存颜色保留为“当前颜色”，不会被改写。
- UiCopyButton 的根节点是 Tooltip 包裹层，未声明的属性转给内部按钮。
- 验收记录见 VALIDATION.md“2026-09-30 B 批组件验收”。专项回归为 `node tests/desktop/controls.mjs`。
- KAM 迁移计划中的 UI 库补缺到此完成；后续页面迁移发现的新缺口按 0.2.x 追加。
- 0.2.1 已于 2026-09-30 发布到官方 npm，latest 指向 0.2.1；UI main 与 v0.2.1 标签已推送，标签对应发布准备提交 `449183b`。发布校验与消费方 integrity 见 `.Codex/memory/publishing.md`。

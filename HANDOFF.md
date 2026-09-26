# UI 项目交接

更新日期：2026-09-26。完整跨仓库交接位于相邻 UAH 项目的 `D:/UAH/docs/HANDOFF.md`；本项目的持续规则在 AGENTS.md。

## 开发顺序与分工

动手前先盘点要用到的组件。缺少组件或通用能力时，先在本项目实现、导出，增加真实 demo、文档页并调试，由 root 视觉验收并记录，之后才在 UAH 使用。子代理发现缺口先上报 root，不自行规划或在业务项目里绕过。

视觉效果的样式编写由 root 亲自完成，或委派至少 GPT-6 Sol medium；Luna/Terra 不承担视觉样式。已验收组件的组装及非视觉工作可交给低级模型，经济优先不能降低视觉任务下限。

## 项目结构与消费方式

- `src/ui/index.ts`：公开导出；同目录维护组件、tokens、样式、ripple 和 snackbar。
- `src/ui/docs`、`src/ui/UiPreview.vue`：真实文档与 demo，25 页、16 个文档化组件；图标组件另导出为 UiIcon。
- `src/components/Icon.vue`、`src/assets/icons`：库内图标，不依赖 UAH 原型目录。
- `tests/desktop/ui.mjs`：隔离 Electron 文档回归；`tests/snackbar.test.mjs`：服务单元测试。
- UAH 使用 `@lingyzh/ui: file:../UI`；package exports 指向 Vue/TypeScript 源码，Vite dedupe Vue。不是复制源码，也不是从远程仓库实时加载。
- 修改本库后，UAH 开发服务读取该本地包；生产构建需重跑。保持相邻 checkout，并先在 UI 安装依赖，再在 UAH 安装。

命令：`npm ci`、`npm run dev`（5174）、`npm run typecheck`、`npm test`、`npm run test:ui`。`npm run build` 输出文档 `dist/docs` 和库 `dist/lib`；`npm run preview` 使用 4174。

## 最近状态

功能基线提交 `4eb946a`，main 分支；origin 为 git@github.com:LingYzh/UI.git，尚未推送。交接资料和规则将另作本地文档提交，以实际 git log/status 为准。

排序指示改为上下三角，ghost hover 无边框并使用浅深主题适配的半透明状态层。类型检查/构建通过，单元 2/2、界面 20/20；证据在 `artifacts/ui-uX7okq`，视觉验收见 VALIDATION.md。artifact 不纳入版本控制。

没有未完成的已授权功能；下一步业务任务由用户在新会话指定。新会话先读规则并核对两个仓库状态。

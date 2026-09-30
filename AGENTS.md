# UI-first implementation workflow

- For a project with a highly consistent custom visual style and no existing third-party UI library, first derive tokens, shared components and interaction states from its prototype.
- Build the reusable UI library and an interactive preview/documentation HTML page before implementing business/system screens. Examples must use the real library components.
- Complete visual acceptance of component states, typography, icons, spacing, transitions, light/dark themes, keyboard interaction and responsive/zoom layouts before starting system implementation. Record evidence and unresolved items; functional tests alone are not visual acceptance.
- Later shared visual changes belong in the UI library and its demos first, then flow into consuming screens. Preserve this sequence even when a headless dependency is introduced later.
- Root owns visual specifications, component planning and final acceptance. Apply the ongoing model routing requirements below; the earlier one-off documentation assignment is not a standing routing rule.
- UAH retains its own tokens and styles over `@vuetify/v0` headless behavior. Do not add Material themes or bypass Electron isolation to integrate UI libraries.

## 开发前组件盘点与模型分工（持续执行）

- 每次动手实现前，root 先扫描计划中的界面和交互，对照 `D:/UI/src/ui/index.ts`、组件 API、demo 和文档目录，确认是否缺少需要的新组件或已有组件的通用能力。先记录复用项与缺口，再开始实现。
- 若存在缺口，必须先在 `D:/UI` 完成组件、公开 API、真实组件 demo 和对应文档页，调试交互及视觉效果，记录验收结果后，才能在 `D:/UAH` 使用。不得先在 UAH 临时写一套再搬回组件库，也不得用业务 CSS 绕过组件库规范。
- 子代理发现新组件或通用能力缺口时，应将用途、现有组件为何不足、所需接口和影响范围上报 root；暂停依赖该缺口的实现，可继续无依赖的工作。组件规划、视觉规格及验收属于 root 的职责，子代理不得擅自决定新增或另造实现。
- 涉及视觉效果的样式编写、设计调整和视觉 demo 实现由 root 亲自负责，或交给至少 **GPT-6 Sol / medium** 的子代理。不得交给 Luna、Terra 或更低配置；本条是用户明确指定的视觉任务模型下限，优先于一般经济型路由偏好。
- 使用已经验收的组件进行搭积木式页面组装、数据绑定和非视觉业务逻辑，可以交给更低级模型；不得借组装任务修改共享外观。是否需要新组件及最终视觉验收仍由 root 决定。
- UI 唯一实现位于相邻 UI 仓库。UAH 通过 `@lingyzh/ui` 导入，消费版本与来源以其 package.json 和 lockfile 为准；当前相邻 UAH 使用官方 npm 包，本地联调可显式使用 `file:../UI` 并保持 Vue dedupe，不复制组件源码回 UAH。

新会话首先阅读 `HANDOFF.md`，并检查两个仓库的实际状态，不将交接中的历史状态当成当前状态。

## 构建与发布约定

- `src/ui/index.ts` 是公开组件入口；`src/ui/styles.css` 汇总 tokens、工具类和扩展样式；`src/ui/docs/` 与 `UiPreview.vue` 是真实组件文档。UAH 仍可通过 `file:../UI` 使用源码导出。
- 开发环境按 README 使用 Node.js 24+。运行 `npm ci`、`npm run typecheck`、`npm test`、`npm run build` 和 `npm run test:ui`；`npm run dev` 在 5174 端口查看文档。
- `dist/docs` 与 `dist/lib` 是忽略的构建产物。npm 包只发布 `package.json#files` 白名单中的源码及自动包含的 README、LICENSE、package.json；发布前用 `npm pack --dry-run --json` 核查文件列表。
- 发布面向官方 npm registry，沿用 MIT、公开包与 `latest` dist-tag；版本、Git tag 和发布记录必须一致。不要把本地镜像站当成发布目标。

## npm 自动发布流程（2026-09-30 更新）

- 发布入口是 `.github/workflows/publish.yml`（`Publish npm package`）。推送 `v*` 标签触发；普通分支 push 不触发，也没有 `workflow_dispatch` 手动入口。正式发布走标签触发的 GitHub Actions。
- 发布前更新 package.json 与 package-lock.json 的版本并提交，`v<version>` 标签必须指向包含该版本和 workflow 的发布提交。获得发布授权后推送提交及对应标签；推送标签会实际发包。
- workflow 在 GitHub 托管的 `ubuntu-latest` 上使用 Node.js 24，依次执行 `npm ci`、标签/包版本一致性检查、`npm run typecheck`、`npm test`、`npm run build`、`npm pack --dry-run`，最后 `npm publish`。
- 认证使用 npm Trusted Publishing / OIDC，保留 `contents: read` 与 `id-token: write` 权限；当前 workflow 不依赖 `NPM_TOKEN` 或本地 npm 网页登录。npm Trusted Publisher 必须匹配 `LingYzh/UI` 和文件名 `publish.yml`，当前未配置 GitHub environment。认证要求与排错见 `.Codex/memory/publishing.md`。
- CI 未运行 `npm run test:ui`、feedback/controls 专项、消费方兼容性检查或 root 视觉验收；相关发布前检查仍须按改动范围在本地完成并记录证据，不能用 workflow 成功代替视觉验收。
- 当前所有 `v*` 标签均使用 package.json 中的 `latest`，没有预发布 dist-tag 分流。发布后检查 Actions 的 Publish 步骤和官方 registry 的版本、dist-tag、tarball/integrity，再更新发布记忆；已发布版本不能重复发布。

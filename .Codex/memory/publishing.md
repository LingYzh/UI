# npm 发布记忆

## 2026-10-01：0.2.2 自动发布已验证

- 用户确认发布 Ripple 动态 class 修复并升级 KAM 后，发布提交 `cd9d3ce5d08bb5416e14a69bfecca30e9f02097b` 与注释标签 `v0.2.2` 使用 atomic push 推送到 main。
- `.github/workflows/publish.yml` 首次实际运行 [36757427137](https://github.com/LingYzh/UI/actions/runs/36757427137) 全部成功，包括 Publish；npm Trusted Publishing / OIDC 生效，并生成 provenance，无需本地网页登录。
- npm 提示新包处理可能需要几分钟；首次完整 packument 暂时未列出 0.2.2，随后官方版本 endpoint、完整 packument 与 dist-tags 均确认发布，不重发同版本。
- 官方 latest 为 0.2.2；tarball `https://registry.npmjs.org/@lingyzh/ui/-/ui-0.2.2.tgz`，integrity `sha512-m0j1u26pgS0e+PSnl8aTvzTp6GQ9FuJmgoVgSMaQcGnsLuV7yCNfzTd5iMlpQXZgcyEDgi5OliExeoMXotgP7A==`，共 154 文件。
- 发布前类型检查、23 单测、完整 UI 20/20、ripple 专项 66 断言、A 批 7/7、B 批 6/6、root 浅深 held 图与 KAM 候选兼容 dev 53/prod 52 检查通过；修改后的指令使用 KAM TypeScript 5.9 检查通过。完整证据在 VALIDATION.md。
- KAM 已从官方 registry 精确升级 0.2.2，package/lock/实际安装一致，lock integrity 与 registry 一致；安装读取原 lockfile，只替换 UI 包。正式消费回归以 KAM 验证记录为准。

- 包名是 `@lingyzh/ui`，公开入口仍指向 `src/ui/` 下的 Vue SFC、TypeScript 与 CSS 源码。UAH 消费方式以其 package.json/lockfile 为准；2026-09-30 核对相邻 UAH-desktop 仍为官方 npm `0.1.0`，`file:../UI` 仅为显式本地联调选项。使用方需有支持 Vue SFC 的构建工具，并让 Vue peer dependency 与宿主共用同一实例。
- `package.json#files` 只包含 `src/`。npm 会另外包含根目录的 `package.json`、`README.md` 和 `LICENSE`；检查 `npm pack --dry-run --json`，不能带入 `.idea/`、测试、`dist/`、项目记忆或凭据。
- `publishConfig` 固定官方 `https://registry.npmjs.org/`、`access=public` 与 `tag=latest`，避免本机镜像 registry 或 scoped 包默认私有状态影响发布。
- 发布前先确认 UI 已含相邻 UAH 所需的公开导出，再运行 `npm ci`、`npm run typecheck`、`npm test`、`npm run test:ui` 和打包预览。桌面 UI 测试的复制断言应等待“已复制”反馈后读取剪贴板，避免异步写入的时序误报。
- 首次公开版本使用 MIT 协议，版权署名 `LingYzh`；首次 npm dist-tag 为 `latest`，对应 Git tag 为 `v0.1.0`。npm 发布及 Git tag 状态以实时 registry 和 Git 检查为准，不能仅凭本文件推断。
- 0.2.0（2026-09-30）是 KAM 迁移 A 批。发布前必须全部通过：typecheck、单测、完整 `test:ui`、`tests/desktop/feedback.mjs`，并用 KAM 的 TS 5.9.3 + vue-tsc 3.3.11 在临时 tsconfig 下检查 `src/ui`，要求零错误。运行环境最低 Chromium 140（KAM 为 Electron 38）。
- 0.2.1（2026-09-30）是 KAM 迁移 B 批。发布前验证项与 0.2.0 相同，另加 `tests/desktop/controls.mjs`。controls.css 在 styles.css 中先于按钮基础规则导入，覆盖 `.ui-button` 的样式须带 `.ui-button` 前缀提高特异度。

## 当前流程：GitHub Actions + npm Trusted Publishing（2026-09-30）

- 流程来源为提交 `f26cdc9` 的 `.github/workflows/publish.yml`；发布元数据沿用 package.json。该 workflow 在 0.2.1 手动发布之后加入，下方网页授权记录是历史操作，不是后续默认发包步骤。
- 触发条件仅为 push `v*` 标签，无普通分支 push 和 `workflow_dispatch`。workflow 不自动升级版本、提交或创建标签，也不创建 GitHub Release。
- GitHub 托管 `ubuntu-latest`、Node.js 24；`actions/checkout@v6` 与 `actions/setup-node@v6`，registry 指向官方 npm，`package-manager-cache: false`。同一 ref 使用 `npm-publish-${{ github.ref }}` 并发组，`cancel-in-progress: false`。
- 顺序为 `npm ci` → 比较 package.json.version 与去掉前缀 `v` 的标签 → typecheck → 单测 → build → `npm pack --dry-run` → `npm publish`。任一步失败都会阻止发包。CI 打包预览不带 `--json`，本地继续用 `--json` 核对文件白名单。
- CI 不含 `test:ui`、`tests/desktop/feedback.mjs`、`tests/desktop/controls.mjs`、KAM 类型兼容检查或视觉验收；根据发布涉及的组件完成对应本地检查，记录证据后再推标签。

### 认证约定

- npm Trusted Publishing 通过 OIDC 认证；workflow 保留 `contents: read`、`id-token: write`，不配置长期 `NPM_TOKEN`，不以本地 npm login/网页授权作为常规发布步骤。
- npm 包设置中的 GitHub Trusted Publisher 应匹配 owner `LingYzh`、repository `UI`、workflow filename `publish.yml`（仅文件名）；当前 job 无 `environment`，绑定应与之保持一致。2026-10-01 的 0.2.2 workflow 日志与官方 registry 已验证 OIDC 自动发布成功；未登录 npm 设置页读取远端配置。
- 按 [npm 官方 Trusted Publishing 文档](https://docs.npmjs.com/trusted-publishers/)，npm CLI 至少 11.5.1、Node.js 至少 22.14.0；仓库当前选用 Node.js 24。认证失败先检查运行日志中的 npm 版本、`id-token` 权限和远端绑定，不直接改成 token 发布。

### 后续发布步骤

1. 核对消费方需要的完整实现及公开导出，更新 package.json 和 package-lock.json 为未发布的新版本；可用 `npm version <version> --no-git-tag-version` 同步版本，再完成发布前验证与打包预览。
2. 提交源码、版本和验证记录；确认发布提交包含 `publish.yml`，创建对应的 `v<version>` 标签。需要用户授权的提交/推送/发布按当前会话指令执行，推送标签即启动实际 npm 发布。
3. 经授权后推送发布提交与该标签，例如 `git push --atomic origin main v<version>`。仅推送 main 不会发包；当前 workflow 对所有 `v*` 标签均用 `latest`，没有自动 beta/next 分流。
4. 等待 `Publish npm package` 的 Publish 步骤成功，再查询官方 registry，例如 `npm view @lingyzh/ui@<version> version dist.tarball dist.integrity --json --registry=https://registry.npmjs.org/` 和 `npm view @lingyzh/ui dist-tags --json --registry=https://registry.npmjs.org/`。记录发布提交/标签、Actions run、版本、dist-tag、integrity 与本地验证证据。
5. 发布成功后再升级消费方依赖与 lockfile，核对 tarball/integrity 和实际安装结果。相同版本不能重复发布；重跑前先查 registry，已发布时不能靠重推标签重新发同一版本。

## 历史：0.2.1 发布完成（2026-09-30，手动发布）

- 用户明确确认后，执行 npm 网页授权发布；官方 registry 已返回 0.2.1，latest 指向 0.2.1，154 个文件，tarball 为 `https://registry.npmjs.org/@lingyzh/ui/-/ui-0.2.1.tgz`。
- main 与注释标签 v0.2.1 已通过 `git push --atomic` 一起推送；远端标签解引用为发布准备提交 `449183b2f8095d7b2f4b9a097ca9c6213fbd84c5`。
- 发布前最后一轮完整 UI 回归 20/20（44 个文档路由）、A 批专项 7/7、B 批专项 6/6 均通过；单测 23/23、类型检查、文档/库构建与 KAM TS 5.9.3 兼容检查通过。证据分别在 artifacts/ui-r0qXEX、feedback-BrclXY、controls-JpdjPc。
- npm 公布的 integrity 为 `sha512-c7oSquzKLuYbfb/fI0yT2Z98N1zGxZCQ4Rov+h/u74RA/hR2dusIxPosYONVmnwWiDYZhdMnkYJ2El3dM9fEEw==`，消费方升级须与此一致。

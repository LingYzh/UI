# npm 发布记忆

- 包名是 `@lingyzh/ui`，公开入口仍指向 `src/ui/` 下的 Vue SFC、TypeScript 与 CSS 源码；UAH 的 `file:../UI` 联调依赖这些源码入口。使用方需有支持 Vue SFC 的构建工具，并让 Vue peer dependency 与宿主共用同一实例。
- `package.json#files` 只包含 `src/`。npm 会另外包含根目录的 `package.json`、`README.md` 和 `LICENSE`；检查 `npm pack --dry-run --json`，不能带入 `.idea/`、测试、`dist/`、项目记忆或凭据。
- `publishConfig` 固定官方 `https://registry.npmjs.org/`、`access=public` 与 `tag=latest`，避免本机镜像 registry 或 scoped 包默认私有状态影响发布。
- 发布前先确认 UI 已含相邻 UAH 所需的公开导出，再运行 `npm ci`、`npm run typecheck`、`npm test`、`npm run test:ui` 和打包预览。桌面 UI 测试的复制断言应等待“已复制”反馈后读取剪贴板，避免异步写入的时序误报。
- 首次公开版本使用 MIT 协议，版权署名 `LingYzh`；首次 npm dist-tag 为 `latest`，对应 Git tag 为 `v0.1.0`。npm 发布及 Git tag 状态以实时 registry 和 Git 检查为准，不能仅凭本文件推断。
- 0.2.0（2026-09-30）是 KAM 迁移 A 批。发布前必须全部通过：typecheck、单测、完整 `test:ui`、`tests/desktop/feedback.mjs`，并用 KAM 的 TS 5.9.3 + vue-tsc 3.3.11 在临时 tsconfig 下检查 `src/ui`，要求零错误。运行环境最低 Chromium 140（KAM 为 Electron 38）。

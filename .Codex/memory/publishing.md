# npm 发布记忆

## 2026-10-09：0.5.0 发布前完整验收完成

用户确定 0.5.0 并授权发布，再评估 UAH。完整 typecheck、327/327 单测、docs/lib build、Electron 21 组/173 路由、copy-icons 6 组、feedback 7 组、controls 6 组及 545 文件 pack/10 exports/9 项 tarball 消费检查通过，单一 Vue 与普通安装目录已核对。Root 复核复制按钮明暗/390px 截图。copy-icons 首次 Windows DPI 尺寸超时保留，测试统一 scale=1 后完整复跑通过；生产源码与已验收图标专项一致。证据：docs/component-audit-2026-10-08/checkpoint-evidence/2026-10-09-release-0.5.0.json；迁移说明 docs/RELEASE-0.5.0.md。

包与 lock 根版本已改为 0.5.0，下一步合并 main、推送 v0.5.0 并等待 OIDC/official registry 确认。UAH 仍固定 0.4.2，本轮仅只读评估。下方未提交/0.4.2 状态为图标专项完成时的历史。


## 2026-10-09：UAH 已合并 main

用户明确要求直接合并。PR #1 已从 draft 转为 ready 并成功合并，merge commit c02fb3be04f96acda515b8867d41676a375078fa，https://github.com/LingYzh/UAH-desktop/pull/1。合并后文件树与已验收适配提交 196d397 完全一致（tree d51f06740a4f5f9396da1791e360b094678fd38e），原 11 项门禁证据继续适用；本地 main 已同步。后续仅补记合并状态，未修改产品、依赖或测试，未制作安装包。下方待审阅/未合并状态为合并前历史。

## 2026-10-09：正式 0.4.2 消费验收通过

UAH 适配提交 196d397eedbf73bd0bdcb0f9ac0b3b81c0795bb9 已推送，审阅请求：https://github.com/LingYzh/UAH-desktop/pull/1（draft，目标 main）。

UAH 已使用官方 0.4.2 tarball/integrity 完成适配，最新 11 项消费门禁通过，完整单测 1045 项 / 1043 pass / 0 fail / 2 skip。共享 Vue 物理路径核对一致、普通安装目录、其他锁元数据不变；真实动画、800px 搜索布局/关闭按钮、焦点/原生视图关闭生命周期、15 eager Items 和 600px 阅读位置均受测。版本化消费者证据在 UAH docs/checkpoint-evidence/2026-10-09-ui-0.4.2-consumer.json，历史失败留档。UI 此次只提交发布证据和项目记忆，不移动已发布标签。

## 2026-10-09：0.4.2正式发布成功，UAH最终验收中

main7f6317940535e2d37f4db2eadba1b502ddcb8fd4/v0.4.2已原子推送，Actions37896838790/job113710005316包含Linux308/308、Build、Publish全部成功，Signed provenance确认。registry version/latest0.4.2、541文件、unpacked4429826B、tarball/integrity已确认；短暂传播404/ETARGET后才执行正常npm安装，没有使用直链或本地源码替代。正式integrity=sha512-eQiOy5BIz1ncwP2IrRP+wDxTXNRmjBryt+p394RujK0HAiLZlWYIIYT9zJAzmLjZ9fJ0++3KiwyvjVgqPVb5rg==。UAH已正式固定0.4.2，最终消费门禁中。发布证据2026-10-09-release-0.4.2-published.json。

## 2026-10-09：正式消费者发现遗漏属性动画回归，补丁0.4.2

UAH实际生产搜索弹窗未传transition，Vue把UiTransition中的Boolean联合属性缺省转换false，造成data-ui-transition=true且默认CSS动画被跳过。UiDialog、UiMenu、UOverlay显式声明transition: undefined，恢复省略时CSS分支，显式false仍禁用动画。feedback真实SFC新增省略属性的动画关键帧回归；旧presentation fixture显式传undefined，无法覆盖省略属性转换。0.4.1已经正式发布，使用新0.4.2补丁，不覆盖旧tag。门禁和最终发布结果待本轮验证。

## 2026-10-09：0.4.1 正式发布成功

UI累计分支已快进合并main，修复发布提交e891c7610c7abd7506ff9ab4eebd80cf622732a9与v0.4.1原子推送。Actions [37893864781](https://github.com/LingYzh/UI/actions/runs/37893864781) job113700635631全部成功，包括Linux测试、Build、白名单与Publish；Trusted Publishing/OIDC完成并带provenance。v0.4.0失败尝试保留，Publish未执行，没有覆盖该tag。

官方registry确认version/latest均0.4.1，tarball=https://registry.npmjs.org/@lingyzh/ui/-/ui-0.4.1.tgz；integrity=sha512-OHzaalIPPOZSEPFKxC396EAp4w8Fhz84J1KcKMqdoIEOPsJpTrTt+MKBbJJ1u3cXhiJIxd9gcvTydGx3eXWVeg==，541文件、unpacked4429533B。Linux实际发包integrity与Windows本地dry-run不同，消费lock必须使用官方值。

UAH已从正式registry固定安装0.4.1，package/lock/实际安装目录一致，lock只改UI四处版本/来源/integrity；npm自动重新添加的20个可选dev标记已按原HEAD元数据恢复，其他依赖不变。UAH业务适配与完整消费验证正在进行，最终结果以UAH docs/VALIDATION为准。

Git Credential Manager本机有LingYzh/Xzf0412两个账号；禁止交互的Username错误最初被误判为需要重新认证，实际单次显式credential.username=LingYzh即可推送。没有修改全局账号或网络设置，已结束本轮设备登录等待。

## 2026-10-09：0.4.0 标签 CI 换行失败，修复后使用0.4.1

UI累计分支已fast-forward main，1720374b3462e51b26820b1fb6ebc5ac1e830669与v0.4.0已原子推送。Actions run37892020013的job113694842685在Linux测试阶段306/307：api-reference UCalendar.getTimestampAtEvent表达式保存CRLF，Linux提取得到LF；类型检查通过，Build/Publish跳过。0.4.0没有发布，不能将本地307/307解释为CI通过。

不改写已推标签；后续正式候选0.4.1。component-contracts读取源码统一LF，同步API不改变158组件/2704属性模型/324事件/604插槽/541暴露成员；新增LF和CRLF源码契约相同的实际回归，专项7/7。Git checkout换行并不改变JSON字符串内的\\r\\n，生成器必须在读取时规范化，而不能仅改.gitattributes或跳过API精确比较。最终0.4.1门禁/Actions/registry状态见后续记录。

0.4.1最终本地typecheck、308/308测试、docs/lib构建、Electron UI21组/173URL、feedback7组、controls6组及pack541文件全部通过；第一次本地单测两处示例换行假失败保留，修正两边换行后完整复跑通过。发布前证据见checkpoint-evidence/2026-10-09-release-0.4.1.json，迁移说明RELEASE-0.4.1.md。

## 2026-10-09：0.4.0 已获合并和发版授权

用户明确要求先合并UI分支后发版，再适配UAH。package.json与lock根版本已同步0.4.0；发布前registry查询latest仍0.3.2。最终源码Node24.19.0完整typecheck、307/307单测、docs/lib构建、Electron21组/173路由、feedback7组、controls6组均通过；pack白名单541文件和全部exports通过。历史失败及两项真实焦点修复已保存，发布门禁证据见checkpoint-evidence/2026-10-09-release-0.4.0.json。

按原流程提交、fast-forward main，再原子推送main与v0.4.0触发OIDC。此授权不允许改写旧tag；必须确认Publish步骤及official registry version/latest/tarball/integrity后才能声称发版完成、升级UAH。迁移与默认变化见docs/RELEASE-0.4.0.md。最终发布SHA/run与消费端结果在本节后续增量记录。

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

## 2026-10-05：0.2.3 发布完成

用户已明确授权发布并升级 UAH。发布提交 6f405a84e6dd1e3c36e9b04853488eff571214b8，标签 v0.2.3；GitHub Actions 37226243401 的 Publish 步骤成功，官方 npm 的 latest 为 0.2.3。tarball：https://registry.npmjs.org/@lingyzh/ui/-/ui-0.2.3.tgz；integrity：sha512-P+sBNm4KjRNkBcoIImV2+PQRT9mYxqqYqkzAWGNZNVfBqea6owCklrupb7W6ap8jx9s5alWi78rcH7/z74PgRQ==。

UAH 已从官方 registry 固定安装 0.2.3，并更新 lockfile。发布前 typecheck、23/23 单测、build、pack 白名单及 usage-meter 桌面专项通过；root 检查 artifacts/usage-meter-WPh1Qi 的浅色 1440 与深色 900/125% 截图。剩余量使用独立冷灰 token，不再与消息分类共享绿色。

## 2026-10-05：0.3.0 / 0.3.1 发布完成

0.3.0：提交a7ea191a1166e842ea4018b246ff0a28a25bc1e7，标签v0.3.0，Actions37287893853；integrity sha512-MrxVpXbQrqGvVFrqTmmU2ieS/OZ7uHAmceqAw7hX/D+ejNi2ApHAb7TjPutcwyHDblsMMniR9DTjlQJfpb4c7A==。
0.3.1：提交55c1d7b74e31eec396610c1b701bf729e113dd71，标签v0.3.1，Actions37292273421；integrity sha512-jjRUnrDkuKbiJj5EW80i811mYZ7GJKc9y3n2qmWxUHJqiDYyPsmvVMIJcUatfJThh8V7JhWJZz2TqDWfyk1uiw==。
两次均由既有OIDC工作流成功发布，正式registry版本与latest已核对。UAH兼容回归发现嵌套选择器更新循环后补发0.3.1；补充slot动态文字回归发现遗漏，最终正在准备0.3.2。不要将中间版本当作消费方最终验收结果；完整过程见HANDOFF.md与VALIDATION.md。

## 2026-10-05：0.3.2 发布完成

发布提交9961a7858a0757f588c70935ccd7f237cf1cfab4，标签v0.3.2，Actions37293347476；官方latest为0.3.2，tarball https://registry.npmjs.org/@lingyzh/ui/-/ui-0.3.2.tgz，integrity sha512-XaR61MNq1VH4hz+eFeh42/tCSqYI2XmctYzK0zInd1tpaW8aRgth5l2IOavOKsAQurQOrJCa36kuvgwHDqURUg==。registry完整元数据为artifacts/release-0.3.2-registry.json。UAH已固定安装官方0.3.2，包/lock/node_modules一致且Vue dedupe保持；typecheck、应用和文档build通过，桌面最终验收见HANDOFF.md与VALIDATION.md后续增量。发布标签不改写，后续纯验证记录提交只推main，不触发再发包。

### UAH 最终兼容验收

UAH已完成0.3.2固定npm升级，本地提交97c43a907520c5d747abdd00b985d3ec4dde9d32，工作区干净。最终typecheck、应用／文档构建通过；完整UI25/25（60路由）、Agent15/15、端点11/11通过，无pageerror；证据D:/UAH/artifacts/ui-q949vX、agents-sQ9goh、endpoints-98M7dG。root复核实际能力弹窗深色窄屏和endpoint-error-fixed.png，表单滚动时错误固定悬浮顶部，padding保护首项，外层没有滚动。

消费端仅更新固定依赖、TypeScript7的SFC文件访问适配、测试夹具和记录；保留Vue dedupe、Electron隔离及原业务／运行时代码。旧桌面夹具同步V2动态上下文、条件提示词模块、启动草稿后显式选择历史会话，以及Tabs手动激活和悬浮错误，原模型／历史／权限／持久化／委派断言保留。此前单测1043通过／2跳过、外观7和扩展32通过，相关产品代码未变。本轮未发布UAH桌面应用安装包；UI正式最新npm版本为0.3.2，无阻断项。

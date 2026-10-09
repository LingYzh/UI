# 图标协议与 MDI 消费

## 2026-10-09：0.5.0 已正式发布，UAH 只读评估完成

main ee8fa4eb88196fa95d9c38b079c6fff215059e54 / v0.5.0 已推送。Actions 37911472623 / job 113757392405 的 Linux 327/327、typecheck、build、Publish 全部成功；签名 provenance 已生成，官方 metadata version/latest=0.5.0、545 文件及 tarball/integrity 已确认，attestation 源提交与 tarball 摘要一致。正式 integrity=sha512-gsuKUvq26X7hB+O1bbise3XbOkVpNNXITD4AFjfi18GiPJRE/qF+EoxtMVEdhYeiRtRvpUYsIBAcGaYCUwaJPQ==。发布后正常 npm 安装正式包，9 项消费检查和 UAH Vite8/TS7 代表性 SFC 构建通过；短暂 E404 传播保留，无重复发布。

UAH main 保持 0.4.2 且干净：34 处自有 Icon、142 处 UiButton，没有字符串 icon/默认插槽冲突；双方 67 个 SVG 内容一致。建议下一批固定升级 UI 并将自有 Icon 收敛成共享 UiIcon 薄包装，保留 name/size 调用，再跑完整消费门禁。没有进行 UAH 生产升级或运行时验收。详见 docs/UAH-ICON-ASSESSMENT-0.5.0.md 和 checkpoint-evidence/2026-10-09-release-0.5.0-published.json。本次补记不移动 v0.5.0 标签；下方待发布状态保留为历史。


## 2026-10-09：0.5.0 发布前完整验收完成

用户确定 0.5.0 并授权发布，再评估 UAH。完整 typecheck、327/327 单测、docs/lib build、Electron 21 组/173 路由、copy-icons 6 组、feedback 7 组、controls 6 组及 545 文件 pack/10 exports/9 项 tarball 消费检查通过，单一 Vue 与普通安装目录已核对。Root 复核复制按钮明暗/390px 截图。copy-icons 首次 Windows DPI 尺寸超时保留，测试统一 scale=1 后完整复跑通过；生产源码与已验收图标专项一致。证据：docs/component-audit-2026-10-08/checkpoint-evidence/2026-10-09-release-0.5.0.json；迁移说明 docs/RELEASE-0.5.0.md。

包与 lock 根版本已改为 0.5.0，下一步合并 main、推送 v0.5.0 并等待 OIDC/official registry 确认。UAH 仍固定 0.4.2，本轮仅只读评估。下方未提交/0.4.2 状态为图标专项完成时的历史。


## 2026-10-09 同步 Vuetify 4.2.4

用户要求图标与 `@mdi/js` 的处理同步 Vuetify。静态 review 的真实缺陷已由 Root 在 main 0da0186 后的源码核对：`icon/name` 的本地 SVG 回退不一致，原始 MDI path 不能直接穿过按钮等入口，Carousel/Pagination 默认图标缺项，Stepper 将图标插值为文字。

- 所有图标入口共享 `IconValue`：字符串 SVG 路径、含 `[path, opacity]` 的多路径数组、Vue 组件和 `$alias`；前后置、清除、切换状态和列表项图标也不得缩回 string。
- `createUI` 的 icons 配置按应用隔离；默认语义别名与用户 aliases 合并，图标集合组件接收 `tag/icon`。公共 `iconsets/mdi-svg` 导出 SVG 集合与语义别名，别名使用 `svg:` 路径，避免更换字体默认集合后被误读。
- 默认语义别名只经 `$` 使用；裸别名是旧用户配置的兼容扩展，不能让合并后的默认别名抢占 `copy/close/edit` 等本地名称。
- `path > icon > name`；旧 `name/path/registerIcons` 与有限 MDI 名称表保留。别名指向本地名称必须使用统一解析结果找 SVG，不能再次读取原始 name。
- 未知名称、别名、循环和未知图标集在开发环境告警且留空，不能显示无关的 file.svg。字体图标需要应用配置字体集合与字体资源，不把任意 `mdi-*` 自动转换为 SVG。
- 多路径透明度使用 `fill-opacity`；图标外层保留尺寸、颜色、事件和 ARIA，默认装饰性，label 提供可访问名称。
- 本地 67 个 SVG 的 eager 字典仍是兼容成本，不能宣称按图裁剪或与全量 `@mdi/js` 捆绑等同。使用单 Icon 消费入口的独立构建审计，与完整 docs/lib 构建区分。

实现分支：`codex/icon-protocol-alignment-20261009`。本批尚未提交、发版或升级 UAH；包版本仍为 0.4.2，不把旧发布门禁当作本次结果。

## 验收与维护

- Vue 的 type-based defineProps 引用 Component 联合类型时可能丢失 Object/Function 运行时构造器。IconValue 使用 Component 交集加对象/函数形态提示，保持公开值限定；必须以实际 compileScript、SSR 与组件 prop 更新验证，不能仅看 TS 通过。
- 新增或删除本地 SVG 时同步 local-icon-names.ts；icon-resolution.test.ts 对实际资产列表做一致性校验。
- 4 个旧 demo 中未登记的 mdi 名称已改为具名路径导入；库组件剩余有限名称均可解析，避免扩大兼容字典。
- 最终相关单测 62/62、tests/tsconfig.icons.json 通过；Chrome 夹具 52 项通过，Root 浅色/深色/390px 窄屏视觉验收通过，实际 docs demo 无横向溢出。源文件哈希稳定，3 个预期未知值告警，无非预期警告或页面错误。
- 单 Icon + mdiAccount 的独立入口 gzip 从 46,668 到 51,180 bytes（+4,512）；默认别名补齐有实际体积成本，67 个本地 SVG 仍 eager。两个未使用 MDI 路径探针未进入此入口；不能据此宣称完整库的体积或逐图裁剪。
- 首次失败包括 SFC 宏真实缺陷，以及测试夹具的虚拟表分页假设、重复 Vue、旧 opacity/tag 断言、注释节点/Field/Switch 选择器和 reactive 组件存储。Root 修正后完成最终验收，保留失败记录；主题动画在图标夹具中显式关闭，不声称并发 ViewTransition 覆盖。
- 版本化证据 docs/ICON-PROTOCOL-ALIGNMENT-2026-10-09.json；完整提交/推送门禁尚未运行。

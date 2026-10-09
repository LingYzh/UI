# Stepper 协议补齐续作记录

Root最终补修：Item和VerticalItem的error/complete默认显式undefined，避免Vue Boolean省略时false覆盖rules计算。真实水平/垂直demo验证未通过rules时is-error=true/is-complete=false，通过后相反；继续按钮同时恢复。19组真实demo专项及11张截图已更新，Root完成宽屏、390px暗色、125%缩放与垂直finish截图复核。

2026-10-09 按 `docs/component-audit-2026-10-08/NEXT-SESSION-2026-10-09.md` 补齐 Stepper 家族，固定上游为 Vuetify 4.2.4。CSS、公开入口、视觉 demo、文档与生成器由 Root 负责；本记录仅对应 Stepper 实现与专项证据。

## 已实现

- `UStepper` 保留原手动 default slot scope（`next`、`prev`、`go`、`modelValue`）；`items` 有内容时附加 header/window/actions。字段支持 title/value/props 路径或函数，`itemProps` 支持布尔模式，缺省值为 1-based 索引。`header-item.<value>` 优先于逐项 `header`，header/title/subtitle/icon/item 作用域提供 raw/title/value/props；item.<value> 提供动态内容。`hideActions` 只隐藏 items 路径生成的 actions 区域，不影响手动 default slot。
- 根 `editable` 默认 false，生成 header/VerticalItem 继承根值，逐项 `props.editable` 优先；根 prevText/nextText/color 实际传给生成 actions，Vertical 根值传入生成 VerticalItem，逐项的 prevText/nextText/color 优先。横向 `hideActions` 同时隐藏默认和自定义 actions 槽，手动 default slot 的 actions 仍由调用方管理。
- 横向生成 actions 在首步禁用 prev、末步禁用 next；只有一步时两侧都禁用，根 disabled 优先禁用两侧。standalone `UStepperActions` 的显式 disabled 行为保持不变。
- `multiple=true` 使用 `GroupValue[]`；手动选择遵守 `max`，mandatory 保留最后一项。`next`/`prev` 将选择收敛为目标步骤单元素数组，跳过 disabled 项并遵守 linear。窗口在多选时按注册顺序显示首个已选步骤。
- `UStepperActions` 支持 prevText/nextText/color/disabled 与 click:prev/next/finish 声明；prev/next slot 提供可绑定 props，原 default slot 仍可整体替换按钮。默认使用 Vuetify `$vuetify.stepper.prev/next`，随 locale 变化；本地 catalog 未提供 Vuetify stepper token 时回退本地中英文。默认外观保持 text/primary-flat。
- `UStepperItem` 的 value 可省略，按稳定注册位置分配不冲突正整数；支持 subtitle/icon/rules 与 active/complete、canEdit/hasError/hasCompleted/title/subtitle/step/value scope。`canEdit` 按 `!disabled && editable`，editable 决定可点击；rules 仅当同步 `rule() === true` 全通过，显式 error/complete 优先。真实透传 `{ value: boolean }` 的 group:selected。
- `UStepperWindowItem` 将 transition/reverseTransition 和 group:selected 传给真实 `UWindowItem`，其他 attrs 继续落在内容 div；独立模式也使用 transition 属性。
- 新增 `UStepperVerticalItem` / `UStepperVerticalActions`，复用基础 Item/Actions 与 UiCollapse；Vertical root 支持 items/multiple/max 并保留手动 default slot。next 在末步发出 click:finish，不改变模型；Vertical root 透传该事件。VerticalItem 和 VerticalActions 保留 click:prev/next 的原 MouseEvent。
- `stepper-selection.ts` 与 `tests/stepper-completion.test.ts` 覆盖 items 归一化及缺省值分配。
- Vuetify 4.2.4 `VStepperItem.tsx` 的 canEdit/isClickable 都基于 `!disabled && editable`；`VStepperActions.tsx` 默认文本 token 为 `$vuetify.stepper.prev/next`。
- 当前 stepper 手动视觉 demo 已显式设置 `editable`，无需迁移；新的 API 文档仍需由 Root 更新。

## 验证

- `node scripts/typecheck.cjs --noEmit -p tests/tsconfig.stepper-completion.json` 通过。
- `npx tsx --test tests/stepper-completion.test.ts tests/group-reactivity.test.ts` 11/11 通过。
- `node tests/desktop/stepper-completion-protocols.mjs` 通过；Vite 源码夹具用 Chrome channel，无 build。覆盖 manual 兼容、items/header/window/actions、slot scope 优先级、multiple/max/mandatory/linear、窗口注册顺序、vertical multiple 与 finish、rules/group:selected、MouseEvent 与过渡透传；无 Vue/浏览器错误。
- 完整 typecheck/test/build/UI regression 留待提交推送前；本轮未运行全量构建。
- 项目根及 `.Codex/memory/` 未发现 `CLAUDE.md`，无需同步 Claude 文件。

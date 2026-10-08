# 全库逐组件深度对齐审计

用户本轮请求逐个检查，采用经济型子代理配置。此轮产物为完整审计与有依据的缺口清单，不批量改变公共行为。Root负责基准、映射、差异判断及验收；三个Luna Max承担规定范围内代码对照和证据整理，不做产品/架构/审美决策。

范围：src/ui/index.ts中153个canonical U*公开组件；Ui*兼容别名共享实现，不重复计数。基准：已下载的官方vuetify@4.2.4包，artifacts/upstream-table-audit/package/lib；保留本库视觉、主题、图标、滚动与兼容别名。无直接上游对应的组件检查本库声明和真实用例，不能拿相似上游组件强行计为缺失。

inventory.json和batch-*.json是可重复生成的名称盘点。上游props仅由发布类型工厂的Defaults约束提取，包含监听器键或内部配置的可能性；potentialMissingProps只是人工复核候选，不能据此判为缺失。复核自动映射，遇到并非等价组件写明；类型声明、继承和实际运行源码都要查。

## 子代理交付格式

每个batch生成独占results-N.json，顶层对象包含batch、baseline、method、components数组。每个组件必须包含：

    {
        "name": "U...",
        "upstreamName": "V...或null",
        "reviewedFiles": ["本地组件、依赖、真实demo、上游runtime/types文件"],
        "classification": "gap | partial | no-confirmed-gap | custom | mapping-review",
        "confirmedMissingProps": ["人工确认未实现的稳定属性，不含仅外观差异"],
        "confirmedMissingEvents": ["人工确认未转发的事件"],
        "confirmedMissingSlots": ["人工确认未转发的槽"],
        "propertyReview": {
            "reviewedCandidates": ["盘点文件该组件potentialMissingProps的完整名单"],
            "missing": ["确认缺失，必须同时出现在confirmedMissingProps"],
            "supportedViaForwarding": ["本地/子组件/helper确有实现，不是仅落DOM属性"],
            "intentionallyDifferent": ["有明确证据的本库保留外观/约定"],
            "unverified": ["尚不能确定；不得写成已支持"],
            "notes": ["解释每个分区/分组的依据与文件行号，不用统一泛称视觉差异掩盖功能缺口"]
        },
        "contractNotes": ["类型、默认值、事件payload、slot scope与兼容差异的实际核对结论"],
        "semantics": [
            { "feature": "具体稳定功能", "result": "implemented | partial | missing | different | unverified", "detail": "具体触发与实际/预期结果", "localEvidence": ["repo/path:line"], "upstreamEvidence": ["artifacts/path:line"] }
        ],
        "demo": { "files": ["实际SFC或LiveExample分支"], "covered": ["已演示交互"], "missing": ["尚未覆盖的重要场景"] },
        "verification": "static | targeted-runtime | existing-evidence-only",
        "runtimeEvidence": ["运行的专项或已有验收文件；没有则空数组"],
        "limitations": ["未实测的关键能力等"],
        "summary": "一句话客观结论"
    }

不可仅凭props数/命名、DOM attrs透传、apiReference自动生成、构建通过、demo文本或历史HANDOFF判断功能已支持。复杂组件至少检查两个具体语义路径；纯标题/间隔组件按实际一项结构与透传路径检查。静态可证明缺口写代码证据；静态存在路径但未运行必须标static，no-confirmed-gap并不代表完全兼容。

Root首轮验收发现部分结果遗漏候选，因此增加propertyReview分区验收：所有potentialMissingProps必须恰好出现在missing/supportedViaForwarding/intentionallyDifferent/unverified之一，reviewedCandidates与盘点一致；candidate为null时名单为空并在notes说明已检查runtime/type契约。缺失分区纳入确认清单，不允许以两个常用路径替代全部候选复核；存在unverified不得标no-confirmed-gap。Root先指导原Luna worker修正，按用户经济型偏好未升级模型。

先确认models/defaults与真实事件和slot payload；对缺口聚合但保留完整名称清单。优先查看控制/非控制、用户触发、键盘、disabled/readonly、加载/错误/空状态、生命周期、嵌套协作与真实用例。既有表格、Toolbar、视差验收只是资料，仍检查代码，不重复全量回归。

写入范围：每个worker仅自己的results-N.json及artifacts/component-audit-N/证据临时文件；禁止修改产品代码、共享样式、demo、依赖、公共类型、其他worker产物或根交接/记忆。不得递归创建子代理。共享工作区有他人工作，不撤销其他变更。禁止完整build/typecheck/npm test/test:ui、npm install、提交推送发布或UAH写入。可执行相关只读专项，不启动全面视觉改造。

对缺少上游资料、映射含糊或需要设计决定的组件，标mapping-review并报告Root，继续独立项；不能省略该组件。验收：组件覆盖名单精确、每个结论有源码证据、公开契约与真实语义都看过，静态检查与运行验证分开，最终Root抽核并合并逐组件表和优先处理清单。

## 重放资料与检查

上游包和原运行探针在忽略的artifacts目录，不随审计文档提交；审计JSON保留来源、完整名称、判断与行号，ROOT-RUNTIME.json保留单项运行观察。新checkout要核对本地行引用，可从官方registry恢复同版本包；不安装到项目node_modules。以下PowerShell命令仅获取资料和检查审计产物，不能代替人工源码判断：

```powershell
New-Item -ItemType Directory -Force -Path artifacts/upstream-table-audit
Invoke-WebRequest -Uri https://registry.npmjs.org/vuetify/-/vuetify-4.2.4.tgz -OutFile artifacts/upstream-table-audit/vuetify.tgz
tar -xf artifacts/upstream-table-audit/vuetify.tgz -C artifacts/upstream-table-audit
node scripts/prepare-component-audit.mjs
node scripts/validate-component-audit.mjs --require-complete
node scripts/render-component-audit.mjs
```

prepare会校验官方SHA512及固定4.2.4版本，并重算盘点；源码发生改变后，不应把旧结论直接当作新版本已经验收，须重新人工复核。validator验证覆盖、分区、文件/行号与运行证据存在，不判定语义正确性。审计分类中的“未确认行为缺口”仍可能包含已列出的外观/命名约定差异，不能解读为全部属性兼容。

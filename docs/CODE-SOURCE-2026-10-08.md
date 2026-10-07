# CodeBlock自然高度与示例源码排版

## 需求、复用与实现

用户要求代码块仅在显式设置时使用最大高度，并把示例源码按嵌套层级换行、四空格缩进。复用UiCodeBlock、UiScrollArea、ExampleCard、真实SFC示例和现有源码/API生成器，不新增公共组件。root负责产品源码、示例与视觉；辅助代理只写/执行独立测试。

- UiCodeBlock移除maxHeight的580px默认值。未传入时底层viewport不设置max-height；显式字符串值继续透传。保留长行横向滚动、自动换行、复制和稳定高亮DOM。
- 新增CodeBlockHeightDemo和code-height文档示例，以相同48行代码对照自然高度和显式240px限制，包含可横向滚动的长行及末行标记。CodeBlock公开API、notes和README同步，不残留580px默认说明。
- 开发期Prettier固定3.9.9，仅devDependency。格式化脚本按Vue/JS/CSS解析源码，使用四空格和100列目标宽度；Vue模板再按compiler AST展开具有元素子项的父标签，即使父子组合较短也分行。保留混合行内正文、pre/textarea/script/style字面内容，属性表达式由解析器处理，不用全局正则替换尖括号。[格式化配置参考](https://prettier.io/docs/options)
- 真实component-examples和Demo SFC、239个文档源码片段同步排版；示例展示和复制仍直接读取同一example.code。完整SFC源码继续与对应真实文件一致，仅把本地导入改为公开包路径。旧Ripple混合JS/HTML片段修成可直接使用的script/template结构。
- 新增npm run docs:sync，依次格式化真实来源/源码元数据、生成独立示例说明与最新API。split和generate脚本都复用同一formatter，后续生成不会恢复紧挤标签。重复执行验证updated0，不累积缩进。

## 验证

类型检查、87/87单测、文档/库build通过（artifacts/code-source-{typecheck,unit,build}.log）。API仍153个canonical组件、1366 props/models；maxHeight默认不再为580px。源码同步与重复执行日志为artifacts/code-source-sync.log、code-source-sync-repeat.log。

- 最终构建之后代码高度/源码专项3/3通过artifacts/code-source-OuwW1g/report.json（前轮IETo8z同样通过）：默认computed maxHeight为none，48行代码无纵向溢出；显式240px仍限制并可滚到末行；长行能横向滚动，真实按钮开启/取消换行；App源码与example.code及剪贴板逐空白一致。pageErrors、console error/Vue warning为空（测试宿主标准Electron CSP提示独立记录）。
- component-examples回归通过全部167路由、106独立示例、9种隔离输入，证据artifacts/component-examples-71TbPD/report.json；完整UI21/21通过artifacts/ui-MR4M3W/report.json，errors为空。这两项在最后等效CSS冗余清理/API文案之前执行；最后构建和代码专项已在收尾后重跑。
- root逐张复核最终OuwW1g的3张原生窗口PNG：1440×900浅色自然高度与App源码、390×844深色显式高度滚至末行；顶栏固定、源码层级、文字/复制反馈、宽度与内部滚动通过。另外验收71TbPD的12张NumberInput/OTP/Slider × 浅深 × 1280×1100/390×844图像，格式化后示例外观与排布通过。
- 已删除旧pre CSS的580px冗余声明（此前被ScrollArea更高优先级覆盖）；公开API描述明确默认不限制高度。src中不残留580px默认，格式化模块不被src运行时引用。脚本语法与git diff --check通过。
- UI仍main a8220aa、package0.3.2，未提交/推送/发布。UAH HEAD97c43a9、工作区干净，固定npm0.3.2未修改。

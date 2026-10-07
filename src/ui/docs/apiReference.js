// Canonical public component contracts generated from current Vue source.
export const componentApi = {
    "UButton": {
        "props": [
            {
                "name": "variant",
                "type": "'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'",
                "fallback": "'outlined'",
                "description": "只选择样式变体：elevated、flat、tonal、outlined（本库默认）、text、plain；颜色独立由 color 配置。默认沿用无阴影描边外观，显式 elevated 才使用阴影。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'outlined'"
                },
                "required": false
            },
            {
                "name": "size",
                "type": "'sm' | 'md' | 'x-small' | 'small' | 'default' | 'large' | 'x-large' | number",
                "fallback": "'md'",
                "description": "紧凑或标准尺寸",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'md'"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "独立颜色：主题名称（primary、secondary、success、error、danger、warning、info 或自定义色）及 CSS 颜色。danger 默认跟随 error。elevated/flat 填充底色并使用对应 on-color，其余作用于文字/图标及 outlined 边框、tonal 底层。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "value",
                "type": "unknown",
                "fallback": "—",
                "description": "在 u-btn-toggle 中的选择值；省略时使用按钮在组中的索引。普通按钮不参与组选择。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "selectedClass",
                "type": "string",
                "fallback": "—",
                "description": "设置 selected Class，供 UButton 执行对应行为；公开类型为 string",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "href",
                "type": "string",
                "fallback": "—",
                "description": "设置启用时导航到的链接地址",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "to",
                "type": "string | Record<string, unknown>",
                "fallback": "—",
                "description": "设置导航目标；可传入路由路径或命名路由对象",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "等待时禁用并暴露 aria-busy；保留原 variant 和进入加载前的宽高，只显示一个居中的加载指示，可通过 loader 插槽定制。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "icon",
                "type": "boolean | string",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "纯图标方形按钮",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "type",
                "type": "'button' | 'submit' | 'reset'",
                "fallback": "'button'",
                "description": "原生按钮类型",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'button'"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "点击波纹；false 关闭，或 { center?, circle?, class?, color?, keys? }。快速点击完整退场，连续点击波纹并存",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "兼容透明外观属性；为 true 时映射到 text 变体，颜色仍由 color 控制。新用法优先使用 variant=\"text\"。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "loader",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义 loader 区域"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "按钮文本与图标"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "focus",
                "type": "(options?: FocusOptions) => void",
                "kind": "method",
                "expression": "(options?: FocusOptions) => element.value?.focus(options)",
                "description": "聚焦原生控件"
            }
        ],
        "attributes": []
    },
    "UTextField": {
        "props": [
            {
                "name": "width",
                "type": "string | number",
                "fallback": "—",
                "description": "控件宽度；数字按 px，默认占满可用区域",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "minWidth",
                "type": "string | number",
                "fallback": "—",
                "description": "最小宽度；数字按 px，默认允许缩至父容器",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxWidth",
                "type": "string | number",
                "fallback": "—",
                "description": "最大宽度；数字按 px，默认不超出父容器",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "inline",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "使用内容宽度，不主动填满父容器；适合工具栏",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "规则验证最多显示的错误数量，默认 1",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "invalid",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显式错误外观；规则错误也会自动应用错误态",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string | number | null",
                "fallback": "''",
                "description": "v-model：输入字符串；type=\"number\" 时为 number，清空为 null",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: string | number | null",
                "fallback": "—",
                "description": "输入变化时更新模型"
            }
        ],
        "slots": [
            {
                "name": "leading",
                "type": "—",
                "fallback": "—",
                "description": "输入前的图标或内容"
            },
            {
                "name": "trailing",
                "type": "—",
                "fallback": "—",
                "description": "输入后的辅助内容"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "focus",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "聚焦原生控件"
            },
            {
                "name": "select",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.select()",
                "description": "选择输入框中的完整文本"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "kind": "method",
                "expression": "control.validate",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果"
            },
            {
                "name": "reset",
                "type": "() => void",
                "kind": "method",
                "expression": "control.reset",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "保留模型，仅清除内部验证状态"
            },
            {
                "name": "errors",
                "type": "string[]",
                "kind": "property",
                "expression": "control.errors",
                "description": "当前错误信息，响应式只读"
            }
        ],
        "attributes": [
            {
                "name": "原生属性",
                "type": "InputHTMLAttributes",
                "fallback": "—",
                "description": "placeholder、type、readonly、autocomplete 等落在 input。"
            },
            {
                "name": "class / style",
                "type": "原生样式属性",
                "fallback": "—",
                "description": "落在外壳，用于布局。"
            }
        ]
    },
    "UTextarea": {
        "props": [
            {
                "name": "width",
                "type": "string | number",
                "fallback": "—",
                "description": "控件宽度；数字按 px，默认占满可用区域",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "minWidth",
                "type": "string | number",
                "fallback": "—",
                "description": "最小宽度；数字按 px，默认允许缩至父容器",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxWidth",
                "type": "string | number",
                "fallback": "—",
                "description": "最大宽度；数字按 px，默认不超出父容器",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "inline",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "使用内容宽度，不主动填满父容器；适合工具栏",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "规则验证最多显示的错误数量，默认 1",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "字符计数，可传提示上限；原生maxlength才阻止超长输入",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "invalid",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显式错误外观；规则错误也会自动应用错误态",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rows",
                "type": "number",
                "fallback": "5",
                "description": "可见行数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "5"
                },
                "required": false
            },
            {
                "name": "autoGrow",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "随内容和宽度增高、收缩；maxRows限制最高行数且不小于rows",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "maxRows",
                "type": "number",
                "fallback": "—",
                "description": "随内容和宽度增高、收缩；maxRows限制最高行数且不小于rows",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "noResize",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "原生只读／禁止手动调整；autoGrow自动关闭手动调整",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string",
                "fallback": "''",
                "description": "v-model：双向绑定文本",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: string",
                "fallback": "—",
                "description": "内容变化"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "focus",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "聚焦原生控件"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "kind": "method",
                "expression": "control.validate",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果"
            },
            {
                "name": "reset",
                "type": "() => void",
                "kind": "method",
                "expression": "control.reset",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "保留模型，仅清除内部验证状态"
            },
            {
                "name": "errors",
                "type": "string[]",
                "kind": "property",
                "expression": "control.errors",
                "description": "当前错误信息，响应式只读"
            }
        ],
        "attributes": []
    },
    "USelect": {
        "props": [
            {
                "name": "width",
                "type": "string | number",
                "fallback": "—",
                "description": "控件宽度；数字按 px，默认占满可用区域",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "minWidth",
                "type": "string | number",
                "fallback": "—",
                "description": "最小宽度；数字按 px，默认允许缩至父容器",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxWidth",
                "type": "string | number",
                "fallback": "—",
                "description": "最大宽度；数字按 px，默认不超出父容器",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "inline",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "使用内容宽度，不主动填满父容器；适合工具栏",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "—",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "—",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "规则验证最多显示的错误数量，默认 1",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "—",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "items",
                "type": "readonly unknown[]",
                "fallback": "—",
                "description": "富选项：{ value: string, label, description?, hint?, disabled? }[]；不传时使用 option/optgroup 插槽",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "menuTitle",
                "type": "string",
                "fallback": "—",
                "description": "富选项菜单的说明标题，不替代 aria-label",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "placeholder",
                "type": "string",
                "fallback": "—",
                "description": "未选择时显示；隐藏且不可选，不占用列表选项",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "compact",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "紧凑工具栏样式",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "invalid",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显式错误外观；规则错误也会自动应用错误态",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "blurOnSelect",
                "type": "boolean",
                "fallback": "true",
                "description": "指针选择后释放焦点；键盘选择保留焦点",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "chips",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "以可移除标签展示已选值",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "itemTitle",
                "type": "ItemProperty",
                "fallback": "—",
                "description": "从数据项读取显示文本的字段名或取值函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemValue",
                "type": "ItemProperty",
                "fallback": "—",
                "description": "从数据项读取模型值或稳定键的字段名或取值函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemProps",
                "type": "ItemProperty | boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "从数据项提取 disabled、标题等条目属性的映射规则",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "returnObject",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "让选择模型返回完整条目对象，而不是条目 value",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hideSelected",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "从候选列表中隐藏已经选中的条目",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "any",
                "fallback": "—",
                "description": "v-model：所选 option 值，保留绑定的数字类型",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: any",
                "fallback": "—",
                "description": "选择变化时更新"
            }
        ],
        "slots": [
            {
                "name": "item",
                "type": "{ item, index, selected }",
                "fallback": "有默认内容",
                "description": "自定义单个候选项或数据项的内容。 作用域提供 { item, index, selected }"
            },
            {
                "name": "selection",
                "type": "{ items }",
                "fallback": "有默认内容",
                "description": "自定义当前已选值的显示内容。 作用域提供 { items }"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "原生 option / optgroup"
            }
        ],
        "methods": [
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.validate()",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.reset()",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.resetValidation()",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": [
            {
                "name": "原生属性",
                "type": "SelectHTMLAttributes",
                "fallback": "—",
                "description": "disabled、name、required、aria-label 等透传。"
            }
        ]
    },
    "USwitch": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "规则验证最多显示的错误数量，默认 1",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "value",
                "type": "unknown",
                "fallback": "—",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "trueValue",
                "type": "unknown",
                "fallback": "—",
                "description": "指定选择控件进入选中状态时写入模型的值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "falseValue",
                "type": "unknown",
                "fallback": "—",
                "description": "指定选择控件退出选中状态时写入模型的值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "any",
                "fallback": "false",
                "description": "v-model：是否选中",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: any",
                "fallback": "—",
                "description": "选中状态变化"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "focus",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "聚焦原生控件"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "kind": "method",
                "expression": "control.validate",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果"
            },
            {
                "name": "reset",
                "type": "() => void",
                "kind": "method",
                "expression": "control.reset",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "保留模型，仅清除内部验证状态"
            },
            {
                "name": "errors",
                "type": "string[]",
                "kind": "property",
                "expression": "control.errors",
                "description": "当前错误信息，响应式只读"
            }
        ],
        "attributes": [
            {
                "name": "原生属性",
                "type": "InputHTMLAttributes",
                "fallback": "—",
                "description": "disabled、name、id 等落在 checkbox。"
            }
        ]
    },
    "UTooltip": {
        "props": [
            {
                "name": "text",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "简短说明文字",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "focusable",
                "type": "boolean",
                "fallback": "true",
                "description": "包裹已有按钮时可设 false，按钮本身承接键盘焦点与提示",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "undefined",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "location",
                "type": "'top' | 'bottom' | 'left' | 'right'",
                "fallback": "'top'",
                "description": "设置浮层或控件在锚点周围的放置位置。 可选值为 'top'、'bottom'、'left'、'right'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'top'"
                },
                "required": false
            },
            {
                "name": "openOnHover",
                "type": "boolean",
                "fallback": "true",
                "description": "指针移入触发器时打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "openOnFocus",
                "type": "boolean",
                "fallback": "true",
                "description": "触发器获得键盘焦点时打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "openOnClick",
                "type": "boolean",
                "fallback": "false",
                "description": "用户点击触发器时打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "openDelay",
                "type": "number",
                "fallback": "0",
                "description": "延迟指定毫秒后打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "closeDelay",
                "type": "number",
                "fallback": "0",
                "description": "延迟指定毫秒后关闭面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "persistent",
                "type": "boolean",
                "fallback": "false",
                "description": "阻止点击外部或按 Escape 自动关闭浮层",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "非交互图标；外层提供 Tab 焦点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UField": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "自定义表单项的可见标题",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "for",
                "type": "string",
                "fallback": "—",
                "description": "控件 id；存在时渲染关联 label",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "description",
                "type": "string",
                "fallback": "—",
                "description": "自定义控件下方的辅助说明",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "error",
                "type": "string",
                "fallback": "—",
                "description": "错误说明，使用 role=alert",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "layout",
                "type": "FieldLayout",
                "fallback": "—",
                "description": "标签与控件的排列方向；继承 Form，Form 外未指定时保留原字段排列",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "required",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "必填标记，并通过 controlAttrs 向自定义控件提供 required",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ controlAttrs }",
                "fallback": "—",
                "description": "id、aria-describedby、aria-invalid，须 v-bind 到控件"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UContainer": {
        "props": [
            {
                "name": "fluid",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "取消1200px最大宽度，保持水平留白",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "tag",
                "type": "string",
                "fallback": "'div'",
                "description": "原生标签",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'div'"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "真实子组件或内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "URow": {
        "props": [
            {
                "name": "tag",
                "type": "string",
                "fallback": "'div'",
                "description": "原生标签",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'div'"
                },
                "required": false
            },
            {
                "name": "size",
                "type": "number | string",
                "fallback": "12",
                "description": "正数基准列数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "12"
                },
                "required": false
            },
            {
                "name": "gap",
                "type": "number | string | (number | string)[]",
                "fallback": "—",
                "description": "设置网格行列之间的间隔",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "LayoutDensity",
                "fallback": "'default'",
                "description": "24 / 16 / 8px 间距",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'default'"
                },
                "required": false
            },
            {
                "name": "noGutters",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "列间距归零",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "align",
                "type": "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
                "fallback": "—",
                "description": "交叉轴对齐",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "justify",
                "type": "'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'",
                "fallback": "—",
                "description": "主轴对齐",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "真实子组件或内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UCol": {
        "props": [
            {
                "name": "tag",
                "type": "string",
                "fallback": "'div'",
                "description": "原生标签",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'div'"
                },
                "required": false
            },
            {
                "name": "cols",
                "type": "GridSize",
                "fallback": "—",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "sm",
                "type": "GridSize",
                "fallback": "—",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "md",
                "type": "GridSize",
                "fallback": "—",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "lg",
                "type": "GridSize",
                "fallback": "—",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "xl",
                "type": "GridSize",
                "fallback": "—",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "xxl",
                "type": "GridSize",
                "fallback": "—",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offset",
                "type": "GridSize",
                "fallback": "—",
                "description": "偏移继承较小断点；0可显式归零",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetSm",
                "type": "GridSize",
                "fallback": "—",
                "description": "偏移继承较小断点；0可显式归零",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetMd",
                "type": "GridSize",
                "fallback": "—",
                "description": "偏移继承较小断点；0可显式归零",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetLg",
                "type": "GridSize",
                "fallback": "—",
                "description": "偏移继承较小断点；0可显式归零",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetXl",
                "type": "GridSize",
                "fallback": "—",
                "description": "偏移继承较小断点；0可显式归零",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetXxl",
                "type": "GridSize",
                "fallback": "—",
                "description": "偏移继承较小断点；0可显式归零",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "order",
                "type": "number",
                "fallback": "—",
                "description": "视觉排列，不能用来改变键盘Tab顺序",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderSm",
                "type": "number",
                "fallback": "—",
                "description": "视觉排列，不能用来改变键盘Tab顺序",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderMd",
                "type": "number",
                "fallback": "—",
                "description": "视觉排列，不能用来改变键盘Tab顺序",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderLg",
                "type": "number",
                "fallback": "—",
                "description": "视觉排列，不能用来改变键盘Tab顺序",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderXl",
                "type": "number",
                "fallback": "—",
                "description": "视觉排列，不能用来改变键盘Tab顺序",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderXxl",
                "type": "number",
                "fallback": "—",
                "description": "视觉排列，不能用来改变键盘Tab顺序",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "alignSelf",
                "type": "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
                "fallback": "—",
                "description": "单列交叉轴对齐",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "真实子组件或内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "USpacer": {
        "props": [],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UForm": {
        "props": [
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "'top'",
                "description": "统一标签方向，单个控件可覆盖；不决定控件行列",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'top'"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "'180px'",
                "description": "统一左侧标签宽度",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'180px'"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "统一控件紧凑尺寸；行列间距由 Row.density 管理",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "统一控件透明表面",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "统一控件圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "'input'",
                "description": "统一验证时机：input、blur 或 submit；控件可覆盖，初始不显示错误",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'input'"
                },
                "required": false
            },
            {
                "name": "fastFail",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显式 validate 或提交遇到第一个错误后停止后续验证",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "resetMode",
                "type": "'initial' | 'empty'",
                "fallback": "'initial'",
                "description": "设置 reset Mode；可选值为 'initial'、'empty'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'initial'"
                },
                "required": false
            },
            {
                "name": "submitMode",
                "type": "'validated' | 'promise'",
                "fallback": "'validated'",
                "description": "设置 submit Mode；可选值为 'validated'、'promise'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'validated'"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean | null",
                "fallback": "null",
                "description": "v-model：true 为有效，false 为存在错误，null 为仍有未验证控件",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "submit",
                "type": "event: SubmitEvent & Partial<Promise<FormValidationResult>>, result?: FormValidationResult",
                "fallback": "—",
                "description": "有效且未禁用时触发；首个参数保留原生事件"
            },
            {
                "name": "invalid",
                "type": "result: FormValidationResult",
                "fallback": "—",
                "description": "提交验证失败，自动聚焦第一项错误"
            },
            {
                "name": "validated",
                "type": "result: FormValidationResult",
                "fallback": "—",
                "description": "当 validated 发生时触发，并携带 result 参数"
            },
            {
                "name": "update:modelValue",
                "type": "value: boolean | null",
                "fallback": "—",
                "description": "双向模型更新"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ isValid, isValidating, isDisabled, isReadonly, items, errors, validate, reset, resetValidation }",
                "fallback": "—",
                "description": "默认内容；在内部使用 Row/Col 布局，作用域提供验证与重置状态／方法"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "isValid",
                "type": "boolean | null",
                "kind": "property",
                "expression": "isValid",
                "description": "统一有效状态，true / false / null"
            },
            {
                "name": "isValidating",
                "type": "boolean",
                "kind": "property",
                "expression": "isValidating",
                "description": "当前是否正在执行验证"
            },
            {
                "name": "errors",
                "type": "FormError[]",
                "kind": "property",
                "expression": "errors",
                "description": "当前错误信息，响应式只读"
            },
            {
                "name": "validate",
                "type": "() => Promise<FormValidationResult>",
                "kind": "method",
                "expression": "validate",
                "description": "验证当前值；返回 { valid, errors, cancelled? }，丢弃过期异步结果"
            },
            {
                "name": "reset",
                "type": "() => Promise<void>",
                "kind": "method",
                "expression": "reset",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "kind": "method",
                "expression": "resetValidation",
                "description": "保留模型，仅清除内部验证状态"
            },
            {
                "name": "requestSubmit",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.requestSubmit()",
                "description": "触发原生提交流程，经过统一表单验证"
            }
        ],
        "attributes": []
    },
    "UFormSection": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "原生legend，给字段组命名",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "description",
                "type": "string",
                "fallback": "—",
                "description": "组说明",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "真实子组件或内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UFormActions": {
        "props": [
            {
                "name": "align",
                "type": "'start' | 'end' | 'between'",
                "fallback": "'end'",
                "description": "主轴对齐。leading存在时占左侧余量",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'end'"
                },
                "required": false
            },
            {
                "name": "divided",
                "type": "boolean",
                "fallback": "true",
                "description": "显示分隔线和顶部间距",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "leading",
                "type": "—",
                "fallback": "—",
                "description": "保存状态、说明等辅助信息"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "真实子组件或内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UTabs": {
        "props": [
            {
                "name": "items",
                "type": "readonly TabItem[]",
                "fallback": "每次实例化执行 () => []",
                "description": "标签数据；支持 string／number 与对象。对象使用 value/text，兼容旧 id/label",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "idPrefix",
                "type": "string",
                "fallback": "—",
                "description": "标签与面板关联 ID 的前缀；默认自动生成",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'horizontal' | 'vertical'",
                "fallback": "—",
                "description": "布局方向；设置后优先于旧 orientation 属性",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orientation",
                "type": "'horizontal' | 'vertical'",
                "fallback": "—",
                "description": "旧版方向属性；direction 未设置时生效",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "activation",
                "type": "'manual' | 'automatic'",
                "fallback": "'manual'",
                "description": "manual 时方向键只移动焦点，Enter／Space 确认；automatic 会随焦点选择",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'manual'"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean | 'force'",
                "fallback": "'force'",
                "description": "force 默认选中首个可用项；true 保持至少一个选中，false 允许无选择",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'force'"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用整组标签及导航按钮",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "alignTabs",
                "type": "'start' | 'center' | 'end' | 'title'",
                "fallback": "'start'",
                "description": "标签在列表中的对齐方式",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'start'"
                },
                "required": false
            },
            {
                "name": "grow",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "标签均分并填满列表宽度",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "fixedTabs",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "使用等宽标签布局",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "stacked",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "图标与文本上下排列",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideSlider",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "隐藏当前选中项的指示条",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "centerActive",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "选中或聚焦标签时将其滚动到列表中央",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "showArrows",
                "type": "boolean | 'always' | 'desktop' | 'mobile' | 'never'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "滚动箭头显示策略；省略时桌面列表溢出才显示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "indicatorSide",
                "type": "'start' | 'end'",
                "fallback": "'end'",
                "description": "垂直方向指示条的逻辑侧；水平方向始终位于底部",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'end'"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'soft' | 'underline'",
                "fallback": "'underline'",
                "description": "标签列表外观",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'underline'"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "传递给组内 UTab 的波纹配置：false 或 { center?, circle?, class?, color?, keys? }",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "使用紧凑标签尺寸",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "使用透明表面，保留焦点与选中反馈",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否使用圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "TabValue | null | undefined",
                "fallback": "—",
                "description": "v-model 当前值；支持字符串、数字、null 或 undefined。未传模型且有可用标签时 mandatory=\"force\" 选择首项；空列表或取消选择时可为 undefined",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: TabValue | null | undefined",
                "fallback": "—",
                "description": "v-model 更新事件；空列表或取消选择时 payload 可为 undefined"
            }
        ],
        "slots": [
            {
                "name": "tab",
                "type": "{ item }",
                "fallback": "有默认内容",
                "description": "数组模式的标签渲染插槽；接收完整标准化 item，并由插槽内容返回 UTab"
            },
            {
                "name": "default",
                "type": "{ item }",
                "fallback": "有默认内容",
                "description": "声明式放置 UTab；数组模式也可自定义每项标签内容"
            },
            {
                "name": "item",
                "type": "{ item }",
                "fallback": "—",
                "description": "数组模式的面板插槽；每项自动包装为 UTabsWindowItem"
            },
            {
                "name": "window",
                "type": "—",
                "fallback": "—",
                "description": "自定义窗口插槽；自动包装在共享模型的 UTabsWindow 中"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UTab": {
        "props": [
            {
                "name": "value",
                "type": "TabValue",
                "fallback": "—",
                "description": "标签值；省略时使用声明顺序索引，数字 0 是有效值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "text",
                "type": "string",
                "fallback": "—",
                "description": "标签文字；未提供默认插槽时作为内容",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用该标签并跳过方向键导航",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "icon",
                "type": "string",
                "fallback": "—",
                "description": "可选图标名称",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "undefined",
                "description": "此标签的波纹配置：false 或 { center?, circle?, class?, color?, keys? }；省略时继承 UTabs",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "标签内容与可选图标"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "HTMLButtonElement | undefined",
                "kind": "property",
                "expression": "element",
                "description": "读取原生标签按钮"
            },
            {
                "name": "focus",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "聚焦该标签"
            }
        ],
        "attributes": []
    },
    "UTabsWindow": {
        "props": [
            {
                "name": "idPrefix",
                "type": "string",
                "fallback": "—",
                "description": "关联标签与面板的 ID 前缀；相邻 UTabs 存在时自动继承",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "TabValue | null | undefined",
                "fallback": "—",
                "description": "v-model 当前显示的窗口值；仅在 UTabs 后代或 #window 上下文中可省略并自动继承。与相邻兄弟 UTabs 配对时需绑定同一模型",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: TabValue | null | undefined",
                "fallback": "—",
                "description": "v-model 更新事件"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "UTabsWindowItem 面板"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "HTMLElement | undefined",
                "kind": "property",
                "expression": "element",
                "description": "读取窗口容器"
            }
        ],
        "attributes": []
    },
    "UTabsWindowItem": {
        "props": [
            {
                "name": "value",
                "type": "TabValue",
                "fallback": "—",
                "description": "面板值；省略时使用声明顺序索引",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "eager",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "为 true 时初次渲染即挂载内容；默认首次激活时挂载并保留",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "当前标签面板内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UTabPanel": {
        "props": [
            {
                "name": "value",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "该面板对应的 item.id",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "modelValue",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "当前选中的标签 id，单向传入",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "idPrefix",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "与同组 UTabs 相同",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "面板内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UDialog": {
        "props": [
            {
                "name": "theme",
                "type": "string",
                "fallback": "—",
                "description": "局部主题名；省略时继承上级，可使用已注册名称或 system",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "open",
                "type": "boolean",
                "fallback": "undefined",
                "description": "打开状态；false 发起退出",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "undefined",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "persistent",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "阻止点击外部或按 Escape 自动关闭浮层",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "fullscreen",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "让对话框占满可用视口",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "scrollable",
                "type": "boolean",
                "fallback": "false",
                "description": "正文使用内部滚动区域，容器裁剪圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "error",
                "type": "string",
                "fallback": "''",
                "description": "scrollable 模式下固定在标题下方的错误提示",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            },
            {
                "name": "contentLabel",
                "type": "string",
                "fallback": "undefined",
                "description": "内部滚动区域可访问名称",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "size",
                "type": "'sm' | 'md' | 'lg' | 'xl' | 'full'",
                "fallback": "undefined",
                "description": "固定宽度 420 / 560 / 720 / 960px / 视口宽减 40px；不传保持原行为",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "placement",
                "type": "'center' | 'end'",
                "fallback": "'center'",
                "description": "end 为贴靠结束边的整高抽屉，只保留内侧圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'center'"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:open",
                "type": "value: boolean",
                "fallback": "—",
                "description": "Esc 或遮罩请求关闭"
            },
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            },
            {
                "name": "present-change",
                "type": "value: boolean",
                "fallback": "—",
                "description": "组件自定义事件"
            },
            {
                "name": "opened",
                "type": "—",
                "fallback": "—",
                "description": "进入动效完成"
            },
            {
                "name": "closed",
                "type": "—",
                "fallback": "—",
                "description": "退出完成，native dialog 已关闭，按操作方式完成焦点处理"
            }
        ],
        "slots": [
            {
                "name": "header",
                "type": "—",
                "fallback": "—",
                "description": "scrollable 模式下固定的标题区和操作区"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "默认布局内容；scrollable 模式下为可滚动正文"
            },
            {
                "name": "footer",
                "type": "—",
                "fallback": "—",
                "description": "scrollable 模式下固定的标题区和操作区"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            }
        ],
        "attributes": [
            {
                "name": "原生属性",
                "type": "DialogHTMLAttributes",
                "fallback": "—",
                "description": "aria-label / aria-labelledby、class、style 落在 dialog。"
            }
        ]
    },
    "UCollapse": {
        "props": [
            {
                "name": "open",
                "type": "boolean",
                "fallback": "无默认值（必填）",
                "description": "控制展开；组件不自行更改状态",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "折叠内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "USnackbarHost": {
        "props": [],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UCard": {
        "props": [
            {
                "name": "theme",
                "type": "string",
                "fallback": "—",
                "description": "局部主题名；省略时继承上级，可使用已注册名称或 system",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "标题与说明",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "subtitle",
                "type": "string",
                "fallback": "—",
                "description": "标题与说明",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'elevated' | 'tonal' | 'flat'",
                "fallback": "'outlined'",
                "description": "容器表面",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'outlined'"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'comfortable' | 'compact'",
                "fallback": "'comfortable'",
                "description": "内边距 24px / 16px",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'comfortable'"
                },
                "required": false
            },
            {
                "name": "flush",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "内容区无内边距，适用于 Tabs 或媒体",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "as",
                "type": "string",
                "fallback": "'section'",
                "description": "语义容器标签",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'section'"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "header",
                "type": "—",
                "fallback": "有默认内容",
                "description": "标题、媒体、内容、底部操作"
            },
            {
                "name": "media",
                "type": "—",
                "fallback": "—",
                "description": "标题、媒体、内容、底部操作"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "标题、媒体、内容、底部操作"
            },
            {
                "name": "actions",
                "type": "—",
                "fallback": "—",
                "description": "标题、媒体、内容、底部操作"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UScrollArea": {
        "props": [
            {
                "name": "focusable",
                "type": "boolean",
                "fallback": "true",
                "description": "复合控件内部可设 false，避免额外 Tab 焦点",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "string",
                "fallback": "—",
                "description": "固定视口高度；不传时按内容自适应",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxHeight",
                "type": "string",
                "fallback": "—",
                "description": "最大高度",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "axis",
                "type": "'vertical' | 'horizontal' | 'both'",
                "fallback": "'vertical'",
                "description": "滚动方向",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'vertical'"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "always",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "有溢出时始终显示滑块",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "scroll",
                "type": "position: { scrollTop: number; scrollLeft: number }",
                "fallback": "—",
                "description": "原生滚动位置同步"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "滚动内容"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "update",
                "type": "() => void",
                "kind": "method",
                "expression": "update",
                "description": "刷新滚动区域的尺寸和滑块位置"
            },
            {
                "name": "focus",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "聚焦原生控件"
            },
            {
                "name": "scrollTo",
                "type": "(options: ScrollToOptions) => void",
                "kind": "method",
                "expression": "(options: ScrollToOptions) => element.value?.scrollTo(options)",
                "description": "滚动到指定位置"
            }
        ],
        "attributes": []
    },
    "UCodeBlock": {
        "props": [
            {
                "name": "code",
                "type": "String",
                "fallback": "无默认值（必填）",
                "description": "原始源码字符串",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "language",
                "type": "String",
                "fallback": "'vue'",
                "description": "按需注册的语法；未知语言安全回退到纯文本",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'vue'"
                },
                "required": false
            },
            {
                "name": "maxHeight",
                "type": "string",
                "fallback": "—",
                "description": "默认不限制最大高度，代码随内容自然增高；显式传入CSS高度后在指定高度内纵向滚动。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "streaming",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "流式源码显示；文本与高亮节点增量更新，保留选择和滚动位置",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "Boolean",
                "fallback": "true",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UTable": {
        "props": [
            {
                "name": "headers",
                "type": "readonly TableHeader[]",
                "fallback": "每次实例化执行 () => []",
                "description": "key/title，以及可选 align、width、sortable",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "items",
                "type": "readonly Record<string, unknown>[]",
                "fallback": "每次实例化执行 () => []",
                "description": "行数据；不会隐式排序或切片",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "itemValue",
                "type": "string",
                "fallback": "'id'",
                "description": "唯一行键字段；正式数据应提供稳定的唯一键",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'id'"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "表格的可访问名称，用于 table 的 aria-label；不生成额外的可见表单标签。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "加载提示与 aria-busy，避免把旧页显示成新页",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "emptyText",
                "type": "string",
                "fallback": "undefined",
                "description": "空数据文案",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "sortBy",
                "type": "readonly TableSort[]",
                "fallback": "每次实例化执行 () => []",
                "description": "受控排序指示；基础表格只发事件，不修改数据",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "string",
                "fallback": "—",
                "description": "限制视口高度并固定表头",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "fixedHeader",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "限制视口高度并固定表头",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "sort",
                "type": "key: string",
                "fallback": "—",
                "description": "点击可排序表头"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            },
            {
                "name": "header.*",
                "type": "{ header }",
                "fallback": "有默认内容",
                "description": "定制表头内容，保留排序按钮语义"
            },
            {
                "name": "loading",
                "type": "—",
                "fallback": "有默认内容",
                "description": "定制加载与空数据状态"
            },
            {
                "name": "item.*",
                "type": "{ item, value, index }",
                "fallback": "有默认内容",
                "description": "按列定制内容"
            },
            {
                "name": "no-data",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义没有匹配或可显示条目时的空状态"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UDataTableServer": {
        "props": [
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "headers",
                "type": "readonly DataHeader[]",
                "fallback": "无默认值（必填）",
                "description": "key/title，以及可选 align、width、sortable",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "items",
                "type": "readonly DataItem[]",
                "fallback": "无默认值（必填）",
                "description": "行数据；不会隐式排序或切片",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "itemsLength",
                "type": "number",
                "fallback": "无默认值（必填）",
                "description": "服务端总记录数，不是当前页长度",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "itemValue",
                "type": "string",
                "fallback": "—",
                "description": "唯一行键字段；正式数据应提供稳定的唯一键",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemTitle",
                "type": "string",
                "fallback": "—",
                "description": "从数据项读取显示文本的字段名或取值函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "表格的可访问名称，用于 table 的 aria-label；不生成额外的可见表单标签。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "加载提示与 aria-busy，避免把旧页显示成新页",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "error",
                "type": "string",
                "fallback": "—",
                "description": "失败时展示错误与重试操作",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "showSelect",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "在数据行前显示选择控件并启用选择模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "returnObject",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "让选择模型返回完整条目对象，而不是条目 value",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "showExpand",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "为数据行显示展开操作及扩展内容区域",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "multiSort",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许排序模型同时包含多个排序字段",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "search",
                "type": "string",
                "fallback": "—",
                "description": "控制或读取候选项过滤使用的搜索文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemsPerPageOptions",
                "type": "readonly number[]",
                "fallback": "每次实例化执行 () => [10, 25, 50]",
                "description": "仅接受正整数；保留当前选项",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => [10, 25, 50]"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "string",
                "fallback": "—",
                "description": "限制视口高度并固定表头",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "fixedHeader",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "限制视口高度并固定表头",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "page",
                "type": "number",
                "fallback": "1",
                "description": "v-model:page：当前页，从 1 开始；总数收缩时校正越界页",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "itemsPerPage",
                "type": "number",
                "fallback": "10",
                "description": "v-model:itemsPerPage：每页条数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "10"
                },
                "required": false
            },
            {
                "name": "sortBy",
                "type": "TableSort[]",
                "fallback": "每次实例化执行 () => []",
                "description": "v-model:sort-by：排序模型；每列按升序、降序、取消循环，multi-sort 允许同时指定多列。",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "groupBy",
                "type": "DataGroup[]",
                "fallback": "每次实例化执行 () => []",
                "description": "分组模型；每项指定用于分组的字段",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown[]",
                "fallback": "每次实例化执行 () => []",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "expanded",
                "type": "unknown[]",
                "fallback": "每次实例化执行 () => []",
                "description": "提供 expanded 所需的数据集合；类型为 unknown[]",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:options",
                "type": "options: { page: number; itemsPerPage: number; sortBy: TableSort[]; groupBy: DataGroup[]; search: string }",
                "fallback": "—",
                "description": "初始化及参数变化时发出；修改每页条数或点击排序会回第一页"
            },
            {
                "name": "retry",
                "type": "—",
                "fallback": "—",
                "description": "请求调用方重试"
            },
            {
                "name": "update:page",
                "type": "value: number",
                "fallback": "—",
                "description": "双向模型更新"
            },
            {
                "name": "update:itemsPerPage",
                "type": "value: number",
                "fallback": "—",
                "description": "双向模型更新"
            },
            {
                "name": "update:sortBy",
                "type": "value: TableSort[]",
                "fallback": "—",
                "description": "双向模型更新"
            },
            {
                "name": "update:groupBy",
                "type": "value: DataGroup[]",
                "fallback": "—",
                "description": "双向属性 groupBy 更新时触发；参数为最新值"
            },
            {
                "name": "update:modelValue",
                "type": "value: unknown[]",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            },
            {
                "name": "update:expanded",
                "type": "value: unknown[]",
                "fallback": "—",
                "description": "双向属性 expanded 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "error",
                "type": "{ error }",
                "fallback": "有默认内容",
                "description": "定制失败状态"
            },
            {
                "name": "no-data",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义没有匹配或可显示条目时的空状态"
            },
            {
                "name": "header.*",
                "type": "{ header }",
                "fallback": "有默认内容",
                "description": "定制表头内容，保留排序按钮语义"
            },
            {
                "name": "loading",
                "type": "—",
                "fallback": "有默认内容",
                "description": "定制加载与空数据状态"
            },
            {
                "name": "group-header",
                "type": "{ group, toggle }",
                "fallback": "有默认内容",
                "description": "自定义数据分组标题及其展开、折叠操作。 作用域提供 { group, toggle }"
            },
            {
                "name": "item.*",
                "type": "{ item, value, index }",
                "fallback": "有默认内容",
                "description": "按列定制内容"
            },
            {
                "name": "expanded-row",
                "type": "{ item, index }",
                "fallback": "有默认内容",
                "description": "自定义展开行内容。 作用域提供 { item, index }"
            },
            {
                "name": "footer",
                "type": "{ page, pageCount, itemsPerPage, itemsLength }",
                "fallback": "有默认内容",
                "description": "替换组件内置分页栏。 作用域提供 { page, pageCount, itemsPerPage, itemsLength }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UPagination": {
        "props": [
            {
                "name": "length",
                "type": "number",
                "fallback": "无默认值（必填）",
                "description": "总页数；空集合按一个不可后翻的页展示",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "totalVisible",
                "type": "number",
                "fallback": "5",
                "description": "连续页码窗口，范围 3–9；首尾页与省略号另计",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "5"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "number",
                "fallback": "1",
                "description": "v-model：当前页，越界会更新为有效页",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: number",
                "fallback": "—",
                "description": "用户翻页或校正越界页"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UIcon": {
        "props": [
            {
                "name": "name",
                "type": "String",
                "fallback": "''",
                "description": "原型SVG名，或内置MDI名。额外名称可通过registerIcons注册",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            },
            {
                "name": "icon",
                "type": "String",
                "fallback": "''",
                "description": "指定使用的图标名称",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "String",
                "fallback": "''",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            },
            {
                "name": "path",
                "type": "String",
                "fallback": "''",
                "description": "SVG path d，优先于 name；从 @mdi/js 按需导入路径",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "String",
                "fallback": "''",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            },
            {
                "name": "size",
                "type": "[Number, String]",
                "fallback": "18",
                "description": "像素尺寸",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "18"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UActivity": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "活动名称与状态",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "status",
                "type": "string",
                "fallback": "—",
                "description": "活动名称与状态",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "tone",
                "type": "'neutral' | 'busy' | 'error' | 'success'",
                "fallback": "—",
                "description": "状态语气",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "scrollable",
                "type": "boolean",
                "fallback": "true",
                "description": "内容外层是否使用有界滚动；已有独立滚动的 Markdown/代码/diff 可设 false，避免嵌套滚动",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'default' | 'inline'",
                "fallback": "'default'",
                "description": "inline 采用原型轻量工具标题，展开正文不缩进",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'default'"
                },
                "required": false
            },
            {
                "name": "icon",
                "type": "string",
                "fallback": "—",
                "description": "inline 前置图标",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "filename",
                "type": "string",
                "fallback": "—",
                "description": "inline 标题后的等宽文件名；长文件名截断并保留完整提示",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "added",
                "type": "number",
                "fallback": "—",
                "description": "inline 文件修改增删行数；未传时不显示",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "removed",
                "type": "number",
                "fallback": "—",
                "description": "inline 文件修改增删行数；未传时不显示",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "open",
                "type": "boolean",
                "fallback": "false",
                "description": "v-model:open：折叠状态",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:open",
                "type": "value: boolean",
                "fallback": "—",
                "description": "展开状态变化"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "活动内容"
            },
            {
                "name": "actions",
                "type": "—",
                "fallback": "—",
                "description": "固定于滚动区外的动作"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UDiff": {
        "props": [
            {
                "name": "before",
                "type": "string | null",
                "fallback": "无默认值（必填）",
                "description": "变更前后完整文本；null 表示文件不存在，空字符串表示空文件",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "after",
                "type": "string | null",
                "fallback": "无默认值（必填）",
                "description": "变更前后完整文本；null 表示文件不存在，空字符串表示空文件",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "path",
                "type": "string",
                "fallback": "undefined",
                "description": "文件名或路径",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "proposed",
                "type": "boolean",
                "fallback": "false",
                "description": "尚未执行的修改提议",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "compact",
                "type": "boolean",
                "fallback": "false",
                "description": "原型浅底紧凑预览，无大工具栏和重复统计",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "inspectable",
                "type": "boolean",
                "fallback": "false",
                "description": "显示在右栏查看按钮",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "inspect",
                "type": "—",
                "fallback": "—",
                "description": "请求查看保存的文件快照；宿主负责右栏导航"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UMarkdown": {
        "props": [
            {
                "name": "source",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "完整累计 Markdown 文本",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "streaming",
                "type": "boolean",
                "fallback": "false",
                "description": "正在接收内容；历史正文直接显示，减少动态效果时立即追平",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "link-click",
                "type": "href: string",
                "fallback": "—",
                "description": "组件自定义事件"
            },
            {
                "name": "rendered",
                "type": "source: string",
                "fallback": "—",
                "description": "实际已呈现文本，可用于滚动跟随"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UFileChanges": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "当前轮次的列表标题",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "items",
                "type": "FileChangeItem[]",
                "fallback": "无默认值（必填）",
                "description": "id、path、status（A/M/D）、added/removed；未知统计传 null",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "select",
                "type": "id: string",
                "fallback": "—",
                "description": "用户选择文件"
            },
            {
                "name": "view-all",
                "type": "—",
                "fallback": "—",
                "description": "组件自定义事件"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UMessageActions": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "actions",
                "type": "MessageActionItem[]",
                "fallback": "无默认值（必填）",
                "description": "id、icon、label、disabled 可选；不内置业务",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "action",
                "type": "id: string",
                "fallback": "—",
                "description": "用户触发未禁用操作"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UUsageMeter": {
        "props": [
            {
                "name": "used",
                "type": "number | null",
                "fallback": "—",
                "description": "非负有限用量、正数容量；缺失或无效时明确未知，容量为零不计算比例",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "capacity",
                "type": "number | null",
                "fallback": "—",
                "description": "非负有限用量、正数容量；缺失或无效时明确未知，容量为零不计算比例",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "estimated",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "总用量为估算时显式标记",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "compact",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "紧凑原生按钮与禁用状态",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "segments",
                "type": "UsageSegment[]",
                "fallback": "—",
                "description": "id、label、value；可选 tone=\"remaining\" 使用独立的冷灰色空闲分类，不受分类顺序影响。null 为未统计，分类按已知值之和绘制",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "compositionLabel",
                "type": "string",
                "fallback": "undefined",
                "description": "分类标题与独立来源提示，不隐含等于服务总量",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "compositionEstimated",
                "type": "boolean",
                "fallback": "true",
                "description": "分类标题与独立来源提示，不隐含等于服务总量",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "inspect",
                "type": "—",
                "fallback": "—",
                "description": "紧凑入口触发，由宿主展示详情"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UChip": {
        "props": [
            {
                "name": "value",
                "type": "unknown",
                "fallback": "—",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "closable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示关闭操作，并允许用户移除当前内容",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "selected",
                "type": "boolean",
                "fallback": "undefined",
                "description": "控制条目是否作为已选择项呈现",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "tone",
                "type": "'neutral' | 'accent' | 'success' | 'warning' | 'error'",
                "fallback": "'neutral'",
                "description": "设置 tone；可选值为 'neutral'、'accent'、'success'、'warning'、'error'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'neutral'"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'soft' | 'outline' | 'tonal' | 'outlined' | 'text' | 'flat'",
                "fallback": "'soft'",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'soft'、'outline'、'tonal'、'outlined'、'text'、'flat'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'soft'"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "closeLabel",
                "type": "string",
                "fallback": "—",
                "description": "设置 close Label，供 UChip 执行对应行为；公开类型为 string",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "close",
                "type": "event: MouseEvent",
                "fallback": "—",
                "description": "组件请求关闭时触发；调用方可据此更新可见状态"
            }
        ],
        "slots": [
            {
                "name": "icon",
                "type": "—",
                "fallback": "—",
                "description": "替换组件默认图标"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UAlert": {
        "props": [
            {
                "name": "tone",
                "type": "'info' | 'success' | 'warning' | 'error'",
                "fallback": "'info'",
                "description": "语气与颜色",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'info'"
                },
                "required": false
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "加粗标题；与正文组合时正文变为次要颜色",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "icon",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换左侧图标"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "正文"
            },
            {
                "name": "actions",
                "type": "—",
                "fallback": "—",
                "description": "右侧操作按钮"
            }
        ],
        "methods": [],
        "attributes": [
            {
                "name": "role",
                "type": "原生属性",
                "fallback": "status / alert",
                "description": "error 默认 alert，其余默认 status，可透传覆盖。"
            }
        ]
    },
    "USpinner": {
        "props": [
            {
                "name": "size",
                "type": "number",
                "fallback": "16",
                "description": "像素尺寸",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "16"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UMenu": {
        "props": [
            {
                "name": "placement",
                "type": "MenuPlacement",
                "fallback": "'bottom-start'",
                "description": "相对触发按钮的位置，空间不足时自动翻转",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'bottom-start'"
                },
                "required": false
            },
            {
                "name": "location",
                "type": "MenuPlacement",
                "fallback": "—",
                "description": "设置浮层或控件在锚点周围的放置位置",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "undefined",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "open",
                "type": "boolean",
                "fallback": "undefined",
                "description": "v-model:open：打开状态；用户也可通过触发按钮、Esc 或点击外部改变",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "openOnClick",
                "type": "boolean",
                "fallback": "true",
                "description": "用户点击触发器时打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "openOnHover",
                "type": "boolean",
                "fallback": "false",
                "description": "指针移入触发器时打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "openOnFocus",
                "type": "boolean",
                "fallback": "false",
                "description": "触发器获得键盘焦点时打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "openDelay",
                "type": "number",
                "fallback": "0",
                "description": "延迟指定毫秒后打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "closeDelay",
                "type": "number",
                "fallback": "0",
                "description": "延迟指定毫秒后关闭面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "persistent",
                "type": "boolean",
                "fallback": "false",
                "description": "阻止点击外部或按 Escape 自动关闭浮层",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "panel",
                "type": "boolean",
                "fallback": "false",
                "description": "自由内容面板（role=dialog）",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:open",
                "type": "value: boolean",
                "fallback": "—",
                "description": "打开状态变化"
            },
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "activator",
                "type": "{ props, activatorProps, open }",
                "fallback": "—",
                "description": "把 props v-bind 到按钮上，提供 popovertarget、aria-expanded 与定位锚点"
            },
            {
                "name": "default",
                "type": "{ close }",
                "fallback": "—",
                "description": "菜单项、分隔线或面板内容"
            }
        ],
        "methods": [
            {
                "name": "close",
                "type": "() => void",
                "kind": "method",
                "expression": "close",
                "description": "关闭当前弹层"
            }
        ],
        "attributes": []
    },
    "UMenuItem": {
        "props": [
            {
                "name": "checked",
                "type": "boolean",
                "fallback": "undefined",
                "description": "设置时使用menuitemcheckbox",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "danger",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用／危险样式／点击后保留菜单",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "keepOpen",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用／危险样式／点击后保留菜单",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "click",
                "type": "event: MouseEvent",
                "fallback": "—",
                "description": "点击未禁用菜单项；由keepOpen控制是否关闭"
            }
        ],
        "slots": [
            {
                "name": "icon",
                "type": "—",
                "fallback": "—",
                "description": "前置图标／末尾内容"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "真实子组件或内容"
            },
            {
                "name": "trailing",
                "type": "—",
                "fallback": "—",
                "description": "前置图标／末尾内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UConfirmHost": {
        "props": [],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UCheckbox": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "规则验证最多显示的错误数量，默认 1",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "indeterminate",
                "type": "boolean",
                "fallback": "false",
                "description": "部分选中；显示横线并暴露 aria-checked=\"mixed\"",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "value",
                "type": "unknown",
                "fallback": "—",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "trueValue",
                "type": "unknown",
                "fallback": "—",
                "description": "指定选择控件进入选中状态时写入模型的值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "falseValue",
                "type": "unknown",
                "fallback": "—",
                "description": "指定选择控件退出选中状态时写入模型的值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "any",
                "fallback": "false",
                "description": "v-model：是否选中",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: any",
                "fallback": "—",
                "description": "勾选变化"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "标签文字；不传时需提供 aria-label"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "focus",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "聚焦原生控件"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "kind": "method",
                "expression": "control.validate",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果"
            },
            {
                "name": "reset",
                "type": "() => void",
                "kind": "method",
                "expression": "control.reset",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "保留模型，仅清除内部验证状态"
            },
            {
                "name": "errors",
                "type": "string[]",
                "kind": "property",
                "expression": "control.errors",
                "description": "当前错误信息，响应式只读"
            }
        ],
        "attributes": [
            {
                "name": "原生属性",
                "type": "InputHTMLAttributes",
                "fallback": "—",
                "description": "name、id、aria-label 等落在 input。"
            }
        ]
    },
    "URadio": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "规则验证最多显示的错误数量，默认 1",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "value",
                "type": "T",
                "fallback": "无默认值（必填）",
                "description": "本选项代表的值",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "T | null",
                "fallback": "null",
                "description": "v-model：当前选中的值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: T | null",
                "fallback": "—",
                "description": "选中变化"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "标签文字；不传时需提供 aria-label"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "focus",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "聚焦原生控件"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "kind": "method",
                "expression": "control.validate",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果"
            },
            {
                "name": "reset",
                "type": "() => void",
                "kind": "method",
                "expression": "control.reset",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "保留模型，仅清除内部验证状态"
            },
            {
                "name": "errors",
                "type": "string[]",
                "kind": "property",
                "expression": "control.errors",
                "description": "当前错误信息，响应式只读"
            }
        ],
        "attributes": [
            {
                "name": "name",
                "type": "InputHTMLAttributes",
                "fallback": "undefined",
                "description": "原生分组名；同一单选组使用相同 name 和模型。"
            }
        ]
    },
    "UProgress": {
        "props": [
            {
                "name": "value",
                "type": "number",
                "fallback": "0",
                "description": "当前值，自动限制在 0–max",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "100",
                "description": "最大值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "100"
                },
                "required": false
            },
            {
                "name": "tone",
                "type": "'accent' | 'success' | 'warning' | 'error'",
                "fallback": "'accent'",
                "description": "填充颜色",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'accent'"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UCopyButton": {
        "props": [
            {
                "name": "text",
                "type": "string | (() => string)",
                "fallback": "无默认值（必填）",
                "description": "要复制的原文；函数在点击时求值",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "copiedLabel",
                "type": "string",
                "fallback": "—",
                "description": "成功后的提示与播报",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "true",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "copied",
                "type": "text: string",
                "fallback": "—",
                "description": "写入成功"
            },
            {
                "name": "error",
                "type": "error: unknown",
                "fallback": "—",
                "description": "写入失败，由宿主提示用户手动复制"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UColorSwatches": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "可见色板标题及 radiogroup 名称；未设置时使用 locale 的颜色文案",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "规则验证最多显示的错误数量，默认 1",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "colors",
                "type": "ColorSwatch[]",
                "fallback": "—",
                "description": "自定义色板；label 作为色块名称",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string | null",
                "fallback": "null",
                "description": "v-model：CSS 颜色字符串，按原样保存",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: string | null",
                "fallback": "—",
                "description": "选择变化"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "focus",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.querySelector<HTMLInputElement>('input:checked, input:not(:disabled)')?.focus()",
                "description": "聚焦原生控件"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "kind": "method",
                "expression": "control.validate",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果"
            },
            {
                "name": "reset",
                "type": "() => void",
                "kind": "method",
                "expression": "control.reset",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "保留模型，仅清除内部验证状态"
            },
            {
                "name": "errors",
                "type": "string[]",
                "kind": "property",
                "expression": "control.errors",
                "description": "当前错误信息，响应式只读"
            }
        ],
        "attributes": []
    },
    "UCascader": {
        "props": [
            {
                "name": "width",
                "type": "string | number",
                "fallback": "—",
                "description": "控件宽度；数字按 px，默认占满可用区域",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "minWidth",
                "type": "string | number",
                "fallback": "—",
                "description": "最小宽度；数字按 px，默认允许缩至父容器",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxWidth",
                "type": "string | number",
                "fallback": "—",
                "description": "最大宽度；数字按 px，默认不超出父容器",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "inline",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "使用内容宽度，不主动填满父容器；适合工具栏",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "内置可见标签，自动关联控件，不需要额外 UField",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "紧凑尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "透明表面，聚焦与错误反馈仍保留",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "是否显示圆角",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "规则验证最多显示的错误数量，默认 1",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清空按钮，清空后模型变为 []",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "items",
                "type": "readonly CascaderItem[]",
                "fallback": "无默认值（必填）",
                "description": "树形选项：{ value: string | number, label, disabled?, children? }[]；同级 value 唯一",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "placeholder",
                "type": "string",
                "fallback": "—",
                "description": "未选择或路径已失效时显示的占位文字",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "changeOnSelect",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许显式选择父节点；默认只选叶节点，→ 始终导航下一级",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "showAllLevels",
                "type": "boolean",
                "fallback": "true",
                "description": "显示完整标签路径；false 只显示最后一级",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "separator",
                "type": "string",
                "fallback": "' / '",
                "description": "完整标签路径的分隔符",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "' / '"
                },
                "required": false
            },
            {
                "name": "invalid",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显式错误外观；规则错误也会自动应用错误态",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "CascaderValue[]",
                "fallback": "每次实例化执行 () => []",
                "description": "v-model：完整值路径数组，保留字符串／数字类型；默认 []",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: CascaderValue[]",
                "fallback": "—",
                "description": "双向模型更新"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "kind": "property",
                "expression": "element",
                "description": "组件原生控件；通过 ref 读取"
            },
            {
                "name": "focus",
                "type": "() => void",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "聚焦原生控件"
            },
            {
                "name": "close",
                "type": "() => void",
                "kind": "method",
                "expression": "close",
                "description": "关闭当前弹层"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "kind": "method",
                "expression": "control.validate",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果"
            },
            {
                "name": "reset",
                "type": "() => void",
                "kind": "method",
                "expression": "control.reset",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "保留模型，仅清除内部验证状态"
            },
            {
                "name": "errors",
                "type": "string[]",
                "kind": "property",
                "expression": "control.errors",
                "description": "当前错误信息，响应式只读"
            }
        ],
        "attributes": []
    },
    "UThemeProvider": {
        "props": [
            {
                "name": "theme",
                "type": "string",
                "fallback": "—",
                "description": "局部主题名；省略时继承上级，可使用已注册名称或 system",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "withBackground",
                "type": "boolean",
                "fallback": "false",
                "description": "为容器添加当前主题的 background，不自动添加间距",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "as",
                "type": "string",
                "fallback": "'div'",
                "description": "渲染的容器标签",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'div'"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "继承当前主题的内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UApp": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UAppBar": {
        "props": [
            {
                "name": "height",
                "type": "number",
                "fallback": "56",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "56"
                },
                "required": false
            },
            {
                "name": "fixed",
                "type": "boolean",
                "fallback": "true",
                "description": "将组件或表头固定在滚动容器或视口位置",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "absolute",
                "type": "boolean",
                "fallback": "false",
                "description": "脱离普通布局流定位组件；位置由组件和父级布局决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "order",
                "type": "number",
                "fallback": "10",
                "description": "设置组件在布局流中的顺序",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "10"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UAppBarTitle": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UAutocomplete": {
        "props": [
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "items",
                "type": "readonly unknown[]",
                "fallback": "每次实例化执行 () => []",
                "description": "供组件渲染或选择的数据项列表；条目字段按组件类型解析",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "itemTitle",
                "type": "ItemProperty",
                "fallback": "—",
                "description": "从数据项读取显示文本的字段名或取值函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemValue",
                "type": "ItemProperty",
                "fallback": "—",
                "description": "从数据项读取模型值或稳定键的字段名或取值函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemProps",
                "type": "ItemProperty | boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "从数据项提取 disabled、标题等条目属性的映射规则",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "returnObject",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "让选择模型返回完整条目对象，而不是条目 value",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "chips",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "以可移除标签展示已选值",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideSelected",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "从候选列表中隐藏已经选中的条目",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "noDataText",
                "type": "string",
                "fallback": "—",
                "description": "过滤后没有候选项时呈现的说明文字",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "placeholder",
                "type": "string",
                "fallback": "—",
                "description": "未输入或未选择时显示的提示文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "filter",
                "type": "(item: SelectionItem, query: string) => boolean",
                "fallback": "—",
                "description": "自定义候选条目的匹配判断；返回 true 的条目保留",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "combobox",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "Internal mode switch; UCombobox always enables this.",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "search",
                "type": "string",
                "fallback": "''",
                "description": "控制或读取候选项过滤使用的搜索文本",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            },
            {
                "name": "update:search",
                "type": "value: string",
                "fallback": "—",
                "description": "双向属性 search 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "item",
                "type": "{ item, index, selected }",
                "fallback": "有默认内容",
                "description": "自定义单个候选项或数据项的内容。 作用域提供 { item, index, selected }"
            },
            {
                "name": "selection",
                "type": "{ items }",
                "fallback": "有默认内容",
                "description": "自定义当前已选值的显示内容。 作用域提供 { items }"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "input",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => input.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            },
            {
                "name": "errors",
                "type": "exposed property",
                "kind": "property",
                "expression": "control.errors",
                "description": "读取当前控件或表单的验证错误"
            }
        ],
        "attributes": []
    },
    "UAvatar": {
        "props": [
            {
                "name": "image",
                "type": "string",
                "fallback": "—",
                "description": "指定图片资源地址",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "icon",
                "type": "string",
                "fallback": "—",
                "description": "指定使用的图标名称",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "text",
                "type": "string",
                "fallback": "—",
                "description": "组件的主要文字内容；存在默认插槽时可改用插槽",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "alt",
                "type": "string",
                "fallback": "—",
                "description": "提供图片或图标的替代文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "size",
                "type": "number | string",
                "fallback": "40",
                "description": "设置组件尺寸；数字或字符串的含义由类型列说明",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "40"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UBadge": {
        "props": [
            {
                "name": "content",
                "type": "string | number",
                "fallback": "—",
                "description": "设置徽标中显示的计数或短文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "dot",
                "type": "boolean",
                "fallback": "false",
                "description": "将徽标内容替换为不带文字的状态圆点",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "99",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "99"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "location",
                "type": "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'",
                "fallback": "'top-right'",
                "description": "设置浮层或控件在锚点周围的放置位置。 可选值为 'top-right'、'top-left'、'bottom-right'、'bottom-left'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'top-right'"
                },
                "required": false
            },
            {
                "name": "offsetX",
                "type": "number",
                "fallback": "0",
                "description": "沿水平方向微调徽标位置，单位为像素",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "offsetY",
                "type": "number",
                "fallback": "0",
                "description": "沿垂直方向微调徽标位置，单位为像素",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "true",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "inline",
                "type": "boolean",
                "fallback": "false",
                "description": "按内容宽度排列，不占满父容器可用宽度",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UBanner": {
        "props": [
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "undefined",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "icon",
                "type": "string",
                "fallback": "—",
                "description": "指定使用的图标名称",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "text",
                "type": "string",
                "fallback": "—",
                "description": "组件的主要文字内容；存在默认插槽时可改用插槽",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "sticky",
                "type": "boolean",
                "fallback": "false",
                "description": "滚动页面时将提示条固定在容器边缘",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "icon",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换组件默认图标"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            },
            {
                "name": "actions",
                "type": "—",
                "fallback": "—",
                "description": "放置与主要内容关联的操作"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UBottomNavigation": {
        "props": [
            {
                "name": "modelValue",
                "type": "string | number",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "number",
                "fallback": "56",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "56"
                },
                "required": false
            },
            {
                "name": "fixed",
                "type": "boolean",
                "fallback": "false",
                "description": "将组件或表头固定在滚动容器或视口位置",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "absolute",
                "type": "boolean",
                "fallback": "false",
                "description": "脱离普通布局流定位组件；位置由组件和父级布局决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: string | number",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ selected, select }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { selected, select }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UBottomSheet": {
        "props": [
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "undefined",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "persistent",
                "type": "boolean",
                "fallback": "false",
                "description": "阻止点击外部或按 Escape 自动关闭浮层",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "string | number",
                "fallback": "—",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "activator",
                "type": "{ props, activatorProps, open }",
                "fallback": "—",
                "description": "自定义打开浮层的触发器；作用域提供需绑定到触发器的属性。 作用域提供 { props, activatorProps, open }"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UBreadcrumbs": {
        "props": [
            {
                "name": "divider",
                "type": "string",
                "fallback": "'/'",
                "description": "设置面包屑层级之间显示的分隔文本",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'/'"
                },
                "required": false
            },
            {
                "name": "ariaLabel",
                "type": "string",
                "fallback": "'Breadcrumbs'",
                "description": "为没有可见文字的导航或控件提供无障碍名称",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'Breadcrumbs'"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UBreadcrumbsDivider": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UBreadcrumbsItem": {
        "props": [
            {
                "name": "href",
                "type": "string",
                "fallback": "—",
                "description": "设置启用时导航到的链接地址",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "active",
                "type": "boolean",
                "fallback": "false",
                "description": "控制当前条目或面板是否处于激活状态",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UBtnGroup": {
        "props": [
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'row' | 'column'",
                "fallback": "—",
                "description": "设置组件的主方向；可用值见联合类型。 可选值为 'row'、'column'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.validate()",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.reset()",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.resetValidation()",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UBtnToggle": {
        "props": [
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'row' | 'column'",
                "fallback": "—",
                "description": "设置组件的主方向；可用值见联合类型。 可选值为 'row'、'column'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.validate()",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.reset()",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.resetValidation()",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UCalendar": {
        "props": [
            {
                "name": "events",
                "type": "readonly CalendarEvent[]",
                "fallback": "每次实例化执行 () => []",
                "description": "提供 events 所需的数据集合；类型为 readonly CalendarEvent[]",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "view",
                "type": "'month' | 'week' | 'day'",
                "fallback": "'month'",
                "description": "设置 view；可选值为 'month'、'week'、'day'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'month'"
                },
                "required": false
            },
            {
                "name": "locale",
                "type": "string",
                "fallback": "—",
                "description": "选择日期、数字或文本格式化使用的语言区域",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "firstDayOfWeek",
                "type": "number",
                "fallback": "0",
                "description": "设置日历一周的起始日；0 表示星期日",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "min",
                "type": "string",
                "fallback": "—",
                "description": "设置数值、尺寸或日期范围的下界",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "string",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string",
                "fallback": "isoDate(new Date())",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "isoDate(new Date())"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: string",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "event",
                "type": "{ event, date }",
                "fallback": "有默认内容",
                "description": "自定义 event 区域。 作用域提供 { event, date }"
            },
            {
                "name": "day",
                "type": "{ date, events }",
                "fallback": "—",
                "description": "自定义 day 区域。 作用域提供 { date, events }"
            },
            {
                "name": "default",
                "type": "{ cells, title, move, goToday }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { cells, title, move, goToday }"
            }
        ],
        "methods": [
            {
                "name": "move",
                "type": "function",
                "kind": "method",
                "expression": "move",
                "description": "按组件支持的方向或步长移动当前状态"
            },
            {
                "name": "goToday",
                "type": "function",
                "kind": "method",
                "expression": "goToday",
                "description": "将日历定位到今天"
            }
        ],
        "attributes": []
    },
    "UCarousel": {
        "props": [
            {
                "name": "interval",
                "type": "number",
                "fallback": "6000",
                "description": "设置轮播自动切换的间隔毫秒数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "6000"
                },
                "required": false
            },
            {
                "name": "cycle",
                "type": "boolean",
                "fallback": "true",
                "description": "允许轮播到末项或首项后循环",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "touch",
                "type": "boolean",
                "fallback": "true",
                "description": "启用触摸手势切换或交互",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "keyboard",
                "type": "boolean",
                "fallback": "true",
                "description": "启用键盘快捷键或方向键交互",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "GroupValue | null",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约。 也可传入 null 清空或表示当前无值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: GroupValue | null",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ next, prev, modelValue }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { next, prev, modelValue }"
            }
        ],
        "methods": [
            {
                "name": "next",
                "type": "exposed property",
                "kind": "property",
                "expression": "next",
                "description": "移动到下一项"
            },
            {
                "name": "prev",
                "type": "function",
                "kind": "method",
                "expression": "prev",
                "description": "移动到上一项"
            }
        ],
        "attributes": []
    },
    "UCarouselItem": {
        "props": [
            {
                "name": "value",
                "type": "GroupValue",
                "fallback": "无默认值（必填）",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "eager",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "在首次显示前挂载内容；不启用时按组件生命周期延迟挂载",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UCheckboxGroup": {
        "props": [
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'row' | 'column'",
                "fallback": "—",
                "description": "设置组件的主方向；可用值见联合类型。 可选值为 'row'、'column'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "name",
                "type": "string",
                "fallback": "—",
                "description": "设置原生控件名称或条目标识",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown[]",
                "fallback": "每次实例化执行 () => []",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown[]",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.validate()",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.reset()",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.resetValidation()",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UChipGroup": {
        "props": [
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'row' | 'column'",
                "fallback": "—",
                "description": "设置组件的主方向；可用值见联合类型。 可选值为 'row'、'column'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.validate()",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.reset()",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.resetValidation()",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UCode": {
        "props": [
            {
                "name": "tag",
                "type": "string",
                "fallback": "—",
                "description": "选择组件根节点的 HTML 标签",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UColorInput": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "allowEmpty",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许用户清空当前输入值",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string | null",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约。 也可传入 null 清空或表示当前无值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: string | null",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "nativeInput",
                "type": "exposed property",
                "kind": "property",
                "expression": "nativeInput",
                "description": "读取 nativeInput，访问 nativeInput 对应的 UColorInput 成员"
            },
            {
                "name": "text",
                "type": "exposed property",
                "kind": "property",
                "expression": "text",
                "description": "读取 text，访问 text 对应的 UColorInput 成员"
            },
            {
                "name": "valid",
                "type": "exposed property",
                "kind": "property",
                "expression": "valid",
                "description": "读取 valid，访问 valid 对应的 UColorInput 成员"
            },
            {
                "name": "control",
                "type": "exposed property",
                "kind": "property",
                "expression": "control",
                "description": "读取 control，访问 control 对应的 UColorInput 成员"
            },
            {
                "name": "update",
                "type": "function",
                "kind": "method",
                "expression": "update",
                "description": "按当前参数重新计算或提交组件状态"
            },
            {
                "name": "commit",
                "type": "function",
                "kind": "method",
                "expression": "commit",
                "description": "调用 commit，访问 commit 对应的 UColorInput 成员"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UColorPicker": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "swatches",
                "type": "readonly string[]",
                "fallback": "—",
                "description": "提供 swatches 所需的数据集合；类型为 readonly string[]",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "showInputs",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示可直接编辑颜色通道或色值的输入控件",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string",
                "fallback": "'#000000'",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'#000000'"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: string",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "hsv",
                "type": "exposed property",
                "kind": "property",
                "expression": "hsv",
                "description": "读取 hsv，访问 hsv 对应的 UColorPicker 成员"
            },
            {
                "name": "control",
                "type": "exposed property",
                "kind": "property",
                "expression": "control",
                "description": "读取 control，访问 control 对应的 UColorPicker 成员"
            },
            {
                "name": "update",
                "type": "function",
                "kind": "method",
                "expression": "update",
                "description": "按当前参数重新计算或提交组件状态"
            },
            {
                "name": "updateChannel",
                "type": "function",
                "kind": "method",
                "expression": "updateChannel",
                "description": "调用 updateChannel，访问 updateChannel 对应的 UColorPicker 成员"
            },
            {
                "name": "updateHex",
                "type": "function",
                "kind": "method",
                "expression": "updateHex",
                "description": "调用 updateHex，访问 updateHex 对应的 UColorPicker 成员"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => element.value?.querySelector<HTMLElement>('input,button')?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UCombobox": {
        "props": [
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "items",
                "type": "readonly unknown[]",
                "fallback": "每次实例化执行 () => []",
                "description": "供组件渲染或选择的数据项列表；条目字段按组件类型解析",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "itemTitle",
                "type": "ItemProperty",
                "fallback": "—",
                "description": "从数据项读取显示文本的字段名或取值函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemValue",
                "type": "ItemProperty",
                "fallback": "—",
                "description": "从数据项读取模型值或稳定键的字段名或取值函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemProps",
                "type": "ItemProperty | boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "从数据项提取 disabled、标题等条目属性的映射规则",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "returnObject",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "让选择模型返回完整条目对象，而不是条目 value",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "chips",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "以可移除标签展示已选值",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideSelected",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "从候选列表中隐藏已经选中的条目",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "noDataText",
                "type": "string",
                "fallback": "—",
                "description": "过滤后没有候选项时呈现的说明文字",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "placeholder",
                "type": "string",
                "fallback": "—",
                "description": "未输入或未选择时显示的提示文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "filter",
                "type": "(item: SelectionItem, query: string) => boolean",
                "fallback": "—",
                "description": "自定义候选条目的匹配判断；返回 true 的条目保留",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "combobox",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "Internal mode switch; UCombobox always enables this.",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "search",
                "type": "string",
                "fallback": "''",
                "description": "控制或读取候选项过滤使用的搜索文本",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            },
            {
                "name": "update:search",
                "type": "value: string",
                "fallback": "—",
                "description": "双向属性 search 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "item",
                "type": "{ item, index, selected }",
                "fallback": "有默认内容",
                "description": "自定义单个候选项或数据项的内容。 作用域提供 { item, index, selected }"
            },
            {
                "name": "selection",
                "type": "{ items }",
                "fallback": "有默认内容",
                "description": "自定义当前已选值的显示内容。 作用域提供 { items }"
            }
        ],
        "methods": [
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.validate()",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.reset()",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.resetValidation()",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UConfirmEdit": {
        "props": [
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "validate",
                "type": "(value: unknown) => boolean | Promise<boolean>",
                "fallback": "—",
                "description": "在保存前执行同步或异步验证；返回 false 表示拒绝保存",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "EditValue",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "save",
                "type": "value: unknown",
                "fallback": "—",
                "description": "用户确认保存时触发，并携带待提交的数据"
            },
            {
                "name": "cancel",
                "type": "—",
                "fallback": "—",
                "description": "用户取消当前操作时触发"
            },
            {
                "name": "update:modelValue",
                "type": "value: EditValue",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "activator",
                "type": "{ open, begin }",
                "fallback": "有默认内容",
                "description": "自定义打开浮层的触发器；作用域提供需绑定到触发器的属性。 作用域提供 { open, begin }"
            },
            {
                "name": "default",
                "type": "{ open, draft, model, begin, save, cancel, saving }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { open, draft, model, begin, save, cancel, saving }"
            }
        ],
        "methods": [
            {
                "name": "begin",
                "type": "function",
                "kind": "method",
                "expression": "begin",
                "description": "调用 begin，访问 begin 对应的 UConfirmEdit 成员"
            },
            {
                "name": "save",
                "type": "function",
                "kind": "method",
                "expression": "save",
                "description": "调用 save，访问 save 对应的 UConfirmEdit 成员"
            },
            {
                "name": "cancel",
                "type": "function",
                "kind": "method",
                "expression": "cancel",
                "description": "取消当前进行中的操作"
            }
        ],
        "attributes": []
    },
    "UCounter": {
        "props": [
            {
                "name": "value",
                "type": "number | string",
                "fallback": "0",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "active",
                "type": "boolean",
                "fallback": "true",
                "description": "控制当前条目或面板是否处于激活状态",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UDataIterator": {
        "props": [
            {
                "name": "items",
                "type": "readonly DataItem[]",
                "fallback": "无默认值（必填）",
                "description": "供组件渲染或选择的数据项列表；条目字段按组件类型解析",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "headers",
                "type": "readonly DataHeader[]",
                "fallback": "—",
                "description": "定义表格列的键、标题、排序和显示方式",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "search",
                "type": "string",
                "fallback": "—",
                "description": "控制或读取候选项过滤使用的搜索文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "customFilter",
                "type": "(value: unknown, query: string, item: DataItem, key: string) => boolean",
                "fallback": "—",
                "description": "以 value、query、item 和 key 自定义表格过滤",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "itemsPerPage",
                "type": "number",
                "fallback": "10",
                "description": "分页模型每页显示的条目数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "10"
                },
                "required": false
            },
            {
                "name": "page",
                "type": "number",
                "fallback": "1",
                "description": "分页模型的当前页码",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "sortBy",
                "type": "TableSort[]",
                "fallback": "每次实例化执行 () => []",
                "description": "排序模型；每项包含排序字段与升降序",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:page",
                "type": "value: number",
                "fallback": "—",
                "description": "双向属性 page 更新时触发；参数为最新值"
            },
            {
                "name": "update:sortBy",
                "type": "value: TableSort[]",
                "fallback": "—",
                "description": "双向属性 sortBy 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ items, allItems, page, pageCount, sortBy, nextPage, prevPage, total }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { items, allItems, page, pageCount, sortBy, nextPage, prevPage, total }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UDataTable": {
        "props": [
            {
                "name": "headers",
                "type": "readonly DataHeader[]",
                "fallback": "无默认值（必填）",
                "description": "定义表格列的键、标题、排序和显示方式",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "items",
                "type": "readonly DataItem[]",
                "fallback": "无默认值（必填）",
                "description": "供组件渲染或选择的数据项列表；条目字段按组件类型解析",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "itemTitle",
                "type": "string",
                "fallback": "'title'",
                "description": "从数据项读取显示文本的字段名或取值函数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'title'"
                },
                "required": false
            },
            {
                "name": "itemValue",
                "type": "string",
                "fallback": "'id'",
                "description": "从数据项读取模型值或稳定键的字段名或取值函数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'id'"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "'Data table'",
                "description": "表格的可访问名称，用于 table 的 aria-label；不生成额外的可见表单标签。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'Data table'"
                },
                "required": false
            },
            {
                "name": "search",
                "type": "string",
                "fallback": "—",
                "description": "控制或读取候选项过滤使用的搜索文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "customFilter",
                "type": "(value: unknown, query: string, item: DataItem, key: string) => boolean",
                "fallback": "—",
                "description": "以 value、query、item 和 key 自定义表格过滤",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "showSelect",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "在数据行前显示选择控件并启用选择模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "returnObject",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "让选择模型返回完整条目对象，而不是条目 value",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "showExpand",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "为数据行显示展开操作及扩展内容区域",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "multiSort",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许排序模型同时包含多个排序字段",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "server",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "由调用方提供已处理的数据，并通过 options 事件接收查询状态",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "error",
                "type": "string",
                "fallback": "—",
                "description": "显示当前错误状态或错误内容；具体呈现由组件决定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideDefaultFooter",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "隐藏组件内置分页栏，便于调用方提供自定义页脚",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "itemsPerPageOptions",
                "type": "readonly number[]",
                "fallback": "每次实例化执行 () => [10, 25, 50]",
                "description": "供用户选择的每页条数选项",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => [10, 25, 50]"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "string",
                "fallback": "—",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "fixedHeader",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "滚动内容时固定表头",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "page",
                "type": "number",
                "fallback": "1",
                "description": "分页模型的当前页码",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "itemsPerPage",
                "type": "number",
                "fallback": "10",
                "description": "分页模型每页显示的条目数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "10"
                },
                "required": false
            },
            {
                "name": "sortBy",
                "type": "TableSort[]",
                "fallback": "每次实例化执行 () => []",
                "description": "v-model:sort-by：排序模型；每列按升序、降序、取消循环，multi-sort 允许同时指定多列。",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "groupBy",
                "type": "DataGroup[]",
                "fallback": "每次实例化执行 () => []",
                "description": "分组模型；每项指定用于分组的字段",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown[]",
                "fallback": "每次实例化执行 () => []",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "expanded",
                "type": "unknown[]",
                "fallback": "每次实例化执行 () => []",
                "description": "提供 expanded 所需的数据集合；类型为 unknown[]",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:options",
                "type": "options: { page: number; itemsPerPage: number; sortBy: TableSort[]; groupBy: DataGroup[]; search: string }",
                "fallback": "—",
                "description": "分页、排序、分组或搜索参数变化时触发，并携带最新查询选项"
            },
            {
                "name": "update:page",
                "type": "value: number",
                "fallback": "—",
                "description": "双向属性 page 更新时触发；参数为最新值"
            },
            {
                "name": "update:itemsPerPage",
                "type": "value: number",
                "fallback": "—",
                "description": "双向属性 itemsPerPage 更新时触发；参数为最新值"
            },
            {
                "name": "update:sortBy",
                "type": "value: TableSort[]",
                "fallback": "—",
                "description": "双向属性 sortBy 更新时触发；参数为最新值"
            },
            {
                "name": "update:groupBy",
                "type": "value: DataGroup[]",
                "fallback": "—",
                "description": "双向属性 groupBy 更新时触发；参数为最新值"
            },
            {
                "name": "update:modelValue",
                "type": "value: unknown[]",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            },
            {
                "name": "update:expanded",
                "type": "value: unknown[]",
                "fallback": "—",
                "description": "双向属性 expanded 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "header.*",
                "type": "{ header }",
                "fallback": "有默认内容",
                "description": "按列键自定义表格表头。 作用域提供 { header }"
            },
            {
                "name": "loading",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义数据加载期间显示的内容"
            },
            {
                "name": "error",
                "type": "{ error }",
                "fallback": "有默认内容",
                "description": "自定义错误状态内容；作用域包含错误信息。 作用域提供 { error }"
            },
            {
                "name": "group-header",
                "type": "{ group, toggle }",
                "fallback": "有默认内容",
                "description": "自定义数据分组标题及其展开、折叠操作。 作用域提供 { group, toggle }"
            },
            {
                "name": "item.*",
                "type": "{ item, value, index }",
                "fallback": "有默认内容",
                "description": "按列键自定义表格单元格内容。 作用域提供 { item, value, index }"
            },
            {
                "name": "expanded-row",
                "type": "{ item, index }",
                "fallback": "有默认内容",
                "description": "自定义展开行内容。 作用域提供 { item, index }"
            },
            {
                "name": "no-data",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义没有匹配或可显示条目时的空状态"
            },
            {
                "name": "footer",
                "type": "{ page, pageCount, itemsPerPage, itemsLength }",
                "fallback": "有默认内容",
                "description": "替换组件内置分页栏。 作用域提供 { page, pageCount, itemsPerPage, itemsLength }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UDataTableVirtual": {
        "props": [
            {
                "name": "headers",
                "type": "readonly DataHeader[]",
                "fallback": "无默认值（必填）",
                "description": "定义表格列的键、标题、排序和显示方式",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "items",
                "type": "readonly DataItem[]",
                "fallback": "无默认值（必填）",
                "description": "供组件渲染或选择的数据项列表；条目字段按组件类型解析",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "'Virtual data table'",
                "description": "表格的可访问名称，用于 table 的 aria-label；不生成额外的可见表单标签。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'Virtual data table'"
                },
                "required": false
            },
            {
                "name": "itemValue",
                "type": "string",
                "fallback": "'id'",
                "description": "从数据项读取模型值或稳定键的字段名或取值函数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'id'"
                },
                "required": false
            },
            {
                "name": "search",
                "type": "string",
                "fallback": "—",
                "description": "控制或读取候选项过滤使用的搜索文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "number",
                "fallback": "360",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "360"
                },
                "required": false
            },
            {
                "name": "itemHeight",
                "type": "number",
                "fallback": "40",
                "description": "设置虚拟列表中每一项的估算或固定高度",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "40"
                },
                "required": false
            },
            {
                "name": "overscan",
                "type": "number",
                "fallback": "5",
                "description": "在可视区域前后额外渲染的条目数量，减少快速滚动时的空白",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "5"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "sortBy",
                "type": "TableSort[]",
                "fallback": "每次实例化执行 () => []",
                "description": "排序模型；每项包含排序字段与升降序",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:sortBy",
                "type": "value: TableSort[]",
                "fallback": "—",
                "description": "双向属性 sortBy 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "header.*",
                "type": "{ header }",
                "fallback": "有默认内容",
                "description": "按列键自定义表格表头。 作用域提供 { header }"
            },
            {
                "name": "loading",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义数据加载期间显示的内容"
            },
            {
                "name": "item.*",
                "type": "{ item, value, index }",
                "fallback": "有默认内容",
                "description": "按列键自定义表格单元格内容。 作用域提供 { item, value, index }"
            },
            {
                "name": "no-data",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义没有匹配或可显示条目时的空状态"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UDateInput": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "'日期'",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'日期'"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mode",
                "type": "DateMode",
                "fallback": "'single'",
                "description": "选择组件的工作模式；具体可用值见类型列",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'single'"
                },
                "required": false
            },
            {
                "name": "min",
                "type": "string",
                "fallback": "—",
                "description": "设置数值、尺寸或日期范围的下界",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "string",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "allowedDates",
                "type": "AllowedDates",
                "fallback": "—",
                "description": "限制日历中允许选择的日期",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "locale",
                "type": "string",
                "fallback": "—",
                "description": "选择日期、数字或文本格式化使用的语言区域",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "DateSelection",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: DateSelection",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            },
            {
                "name": "errors",
                "type": "exposed property",
                "kind": "property",
                "expression": "control.errors",
                "description": "读取当前控件或表单的验证错误"
            }
        ],
        "attributes": []
    },
    "UDatePicker": {
        "props": [
            {
                "name": "mode",
                "type": "DateMode",
                "fallback": "'single'",
                "description": "选择组件的工作模式；具体可用值见类型列",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'single'"
                },
                "required": false
            },
            {
                "name": "min",
                "type": "string",
                "fallback": "—",
                "description": "设置数值、尺寸或日期范围的下界",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "string",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "allowedDates",
                "type": "AllowedDates",
                "fallback": "—",
                "description": "限制日历中允许选择的日期",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "locale",
                "type": "string",
                "fallback": "undefined",
                "description": "选择日期、数字或文本格式化使用的语言区域",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "firstDayOfWeek",
                "type": "number",
                "fallback": "0",
                "description": "设置日历一周的起始日；0 表示星期日",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "'Choose date'",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'Choose date'"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "DateSelection",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: DateSelection",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UDefaultsProvider": {
        "props": [
            {
                "name": "defaults",
                "type": "UIDefaults",
                "fallback": "每次实例化执行 () => ({})",
                "description": "为后代组件提供按组件名和属性名匹配的默认值",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => ({})"
                },
                "required": false
            },
            {
                "name": "reset",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "恢复默认值后重置后代组件的默认配置",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UDivider": {
        "props": [
            {
                "name": "vertical",
                "type": "boolean",
                "fallback": "false",
                "description": "按纵向排列内容或分隔线",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "inset",
                "type": "boolean",
                "fallback": "false",
                "description": "在组件两端留出缩进，不延伸到容器全宽",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "thickness",
                "type": "number | string",
                "fallback": "1",
                "description": "设置分隔线的厚度；数字按像素处理",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UEmptyState": {
        "props": [
            {
                "name": "icon",
                "type": "string",
                "fallback": "—",
                "description": "指定使用的图标名称",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "text",
                "type": "string",
                "fallback": "—",
                "description": "组件的主要文字内容；存在默认插槽时可改用插槽",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "media",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置图标、图片或其他媒体内容"
            },
            {
                "name": "title",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换组件默认标题内容"
            },
            {
                "name": "text",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换组件的文本内容"
            },
            {
                "name": "actions",
                "type": "—",
                "fallback": "—",
                "description": "放置与主要内容关联的操作"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UExpansionPanel": {
        "props": [
            {
                "name": "value",
                "type": "GroupValue",
                "fallback": "—",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ open, toggle }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { open, toggle }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UExpansionPanelText": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UExpansionPanelTitle": {
        "props": [
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ expanded }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { expanded }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UExpansionPanels": {
        "props": [
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "GroupValue | GroupValue[] | null",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约。 也可传入 null 清空或表示当前无值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: GroupValue | GroupValue[] | null",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UFab": {
        "props": [
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "click",
                "type": "event: MouseEvent",
                "fallback": "—",
                "description": "用户激活组件时触发；参数携带原生点击事件"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UFileInput": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "accept",
                "type": "string",
                "fallback": "—",
                "description": "设置文件输入允许的 MIME 类型或扩展名",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "maxSize",
                "type": "number",
                "fallback": "—",
                "description": "限制单个文件可接受的最大字节数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "showSize",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示已选文件的大小文本",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "File | File[] | null",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约。 也可传入 null 清空或表示当前无值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "rejected",
                "type": "result: FileValidationResult['rejected']",
                "fallback": "—",
                "description": "选择的文件不符合限制时触发，并携带拒绝原因"
            },
            {
                "name": "change",
                "type": "files: File[]",
                "fallback": "—",
                "description": "用户完成值变更时触发，并携带新值"
            },
            {
                "name": "update:modelValue",
                "type": "value: File | File[] | null",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "files",
                "type": "exposed property",
                "kind": "property",
                "expression": "files",
                "description": "读取 files，访问 files 对应的 UFileInput 成员"
            },
            {
                "name": "control",
                "type": "exposed property",
                "kind": "property",
                "expression": "control",
                "description": "读取 control，访问 control 对应的 UFileInput 成员"
            },
            {
                "name": "receive",
                "type": "function",
                "kind": "method",
                "expression": "receive",
                "description": "调用 receive，访问 receive 对应的 UFileInput 成员"
            },
            {
                "name": "change",
                "type": "function",
                "kind": "method",
                "expression": "change",
                "description": "调用 change，访问 change 对应的 UFileInput 成员"
            },
            {
                "name": "clear",
                "type": "function",
                "kind": "method",
                "expression": "clear",
                "description": "调用 clear，访问 clear 对应的 UFileInput 成员"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UFileUpload": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "accept",
                "type": "string",
                "fallback": "—",
                "description": "设置文件输入允许的 MIME 类型或扩展名",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "maxSize",
                "type": "number",
                "fallback": "—",
                "description": "限制单个文件可接受的最大字节数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "File[]",
                "fallback": "每次实例化执行 () => []",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "rejected",
                "type": "result: FileValidationResult['rejected']",
                "fallback": "—",
                "description": "选择的文件不符合限制时触发，并携带拒绝原因"
            },
            {
                "name": "change",
                "type": "files: File[]",
                "fallback": "—",
                "description": "用户完成值变更时触发，并携带新值"
            },
            {
                "name": "update:modelValue",
                "type": "value: File[]",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "input",
                "type": "exposed property",
                "kind": "property",
                "expression": "input",
                "description": "读取 input，访问 input 对应的 UFileUpload 成员"
            },
            {
                "name": "files",
                "type": "exposed property",
                "kind": "property",
                "expression": "files",
                "description": "读取 files，访问 files 对应的 UFileUpload 成员"
            },
            {
                "name": "dragging",
                "type": "exposed property",
                "kind": "property",
                "expression": "dragging",
                "description": "读取 dragging，访问 dragging 对应的 UFileUpload 成员"
            },
            {
                "name": "control",
                "type": "exposed property",
                "kind": "property",
                "expression": "control",
                "description": "读取 control，访问 control 对应的 UFileUpload 成员"
            },
            {
                "name": "receive",
                "type": "function",
                "kind": "method",
                "expression": "receive",
                "description": "调用 receive，访问 receive 对应的 UFileUpload 成员"
            },
            {
                "name": "drop",
                "type": "function",
                "kind": "method",
                "expression": "drop",
                "description": "调用 drop，访问 drop 对应的 UFileUpload 成员"
            },
            {
                "name": "change",
                "type": "function",
                "kind": "method",
                "expression": "change",
                "description": "调用 change，访问 change 对应的 UFileUpload 成员"
            },
            {
                "name": "remove",
                "type": "function",
                "kind": "method",
                "expression": "remove",
                "description": "调用 remove，访问 remove 对应的 UFileUpload 成员"
            },
            {
                "name": "clear",
                "type": "function",
                "kind": "method",
                "expression": "clear",
                "description": "调用 clear，访问 clear 对应的 UFileUpload 成员"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => input.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UFooter": {
        "props": [
            {
                "name": "height",
                "type": "number",
                "fallback": "48",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "48"
                },
                "required": false
            },
            {
                "name": "fixed",
                "type": "boolean",
                "fallback": "false",
                "description": "将组件或表头固定在滚动容器或视口位置",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "absolute",
                "type": "boolean",
                "fallback": "false",
                "description": "脱离普通布局流定位组件；位置由组件和父级布局决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "order",
                "type": "number",
                "fallback": "10",
                "description": "设置组件在布局流中的顺序",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "10"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UHotkey": {
        "props": [
            {
                "name": "keys",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "指定触发键盘快捷操作的按键集合",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "preventDefault",
                "type": "boolean",
                "fallback": "true",
                "description": "触发时阻止对应原生浏览器默认行为",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "allowInput",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许用户直接键入日期或时间值",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "trigger",
                "type": "event: KeyboardEvent",
                "fallback": "—",
                "description": "当 trigger 发生时触发，并携带 event 参数"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ keys }",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { keys }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UHover": {
        "props": [
            {
                "name": "openDelay",
                "type": "number",
                "fallback": "0",
                "description": "延迟指定毫秒后打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "closeDelay",
                "type": "number",
                "fallback": "0",
                "description": "延迟指定毫秒后关闭面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ isHovering, props, onEnter, onLeave }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { isHovering, props, onEnter, onLeave }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UImg": {
        "props": [
            {
                "name": "src",
                "type": "string",
                "fallback": "无默认值（必填）",
                "description": "设置图片、媒体或内容资源地址",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "alt",
                "type": "string",
                "fallback": "—",
                "description": "提供图片或图标的替代文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "lazy",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "内容接近可视区域时再创建或加载",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "load",
                "type": "event: Event",
                "fallback": "—",
                "description": "当 load 发生时触发，并携带 event 参数"
            },
            {
                "name": "error",
                "type": "event: Event",
                "fallback": "—",
                "description": "当 error 发生时触发，并携带 event 参数"
            }
        ],
        "slots": [
            {
                "name": "placeholder",
                "type": "—",
                "fallback": "—",
                "description": "自定义尚无内容时显示的占位区域"
            },
            {
                "name": "error",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义错误状态内容；作用域包含错误信息"
            },
            {
                "name": "default",
                "type": "{ loading, error }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { loading, error }"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "visible",
                "type": "exposed property",
                "kind": "property",
                "expression": "visible",
                "description": "读取 visible，访问 visible 对应的 UImg 成员"
            },
            {
                "name": "loading",
                "type": "exposed property",
                "kind": "property",
                "expression": "loading",
                "description": "读取 loading，访问 loading 对应的 UImg 成员"
            },
            {
                "name": "error",
                "type": "exposed property",
                "kind": "property",
                "expression": "error",
                "description": "读取 error，访问 error 对应的 UImg 成员"
            },
            {
                "name": "onLoad",
                "type": "function",
                "kind": "method",
                "expression": "onLoad",
                "description": "调用 onLoad，访问 onLoad 对应的 UImg 成员"
            },
            {
                "name": "onError",
                "type": "function",
                "kind": "method",
                "expression": "onError",
                "description": "调用 onError，访问 onError 对应的 UImg 成员"
            },
            {
                "name": "setElement",
                "type": "function",
                "kind": "method",
                "expression": "setElement",
                "description": "调用 setElement，访问 setElement 对应的 UImg 成员"
            }
        ],
        "attributes": []
    },
    "UInfiniteScroll": {
        "props": [
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rootMargin",
                "type": "string",
                "fallback": "'200px'",
                "description": "调整交叉观察器根区域的边界，用于提前或延后懒加载",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'200px'"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'end' | 'start'",
                "fallback": "'end'",
                "description": "设置组件的主方向；可用值见联合类型。 可选值为 'end'、'start'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'end'"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "load",
                "type": "context: { done: (status?: 'ok' | 'empty' | 'error') => void }",
                "fallback": "—",
                "description": "当 load 发生时触发，并携带 context 参数"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ busy, done, error, load, retry, reset }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { busy, done, error, load, retry, reset }"
            },
            {
                "name": "loading",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义数据加载期间显示的内容"
            },
            {
                "name": "empty",
                "type": "—",
                "fallback": "有默认内容",
                "description": "自定义空状态内容"
            },
            {
                "name": "error",
                "type": "{ retry }",
                "fallback": "有默认内容",
                "description": "自定义错误状态内容；作用域包含错误信息。 作用域提供 { retry }"
            },
            {
                "name": "load-more",
                "type": "{ load }",
                "fallback": "有默认内容",
                "description": "自定义 load more 区域。 作用域提供 { load }"
            }
        ],
        "methods": [
            {
                "name": "load",
                "type": "function",
                "kind": "method",
                "expression": "load",
                "description": "调用 load，访问 load 对应的 UInfiniteScroll 成员"
            },
            {
                "name": "retry",
                "type": "function",
                "kind": "method",
                "expression": "retry",
                "description": "调用 retry，访问 retry 对应的 UInfiniteScroll 成员"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            }
        ],
        "attributes": []
    },
    "UInput": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ controlAttrs, isValid, errors, disabled, readonly, validate }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { controlAttrs, isValid, errors, disabled, readonly, validate }"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            },
            {
                "name": "errors",
                "type": "exposed property",
                "kind": "property",
                "expression": "control.errors",
                "description": "读取当前控件或表单的验证错误"
            }
        ],
        "attributes": []
    },
    "UItem": {
        "props": [
            {
                "name": "value",
                "type": "unknown",
                "fallback": "无默认值（必填）",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ selected, toggle }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { selected, toggle }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UItemGroup": {
        "props": [
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'row' | 'column'",
                "fallback": "'row'",
                "description": "设置组件的主方向；可用值见联合类型。 可选值为 'row'、'column'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'row'"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ selected, toggle }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { selected, toggle }"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => element.value?.querySelector<HTMLElement>('button:not(:disabled)')?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            },
            {
                "name": "errors",
                "type": "exposed property",
                "kind": "property",
                "expression": "control.errors",
                "description": "读取当前控件或表单的验证错误"
            }
        ],
        "attributes": []
    },
    "UKbd": {
        "props": [
            {
                "name": "keys",
                "type": "string",
                "fallback": "—",
                "description": "指定触发键盘快捷操作的按键集合",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "ULabel": {
        "props": [
            {
                "name": "for",
                "type": "string",
                "fallback": "—",
                "description": "将标签或消息关联到指定控件的 DOM id",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "required",
                "type": "boolean",
                "fallback": "false",
                "description": "要求表单提交前提供有效值，并暴露原生或 ARIA 必填状态",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "ULayout": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "ULazy": {
        "props": [
            {
                "name": "rootMargin",
                "type": "string",
                "fallback": "'100px'",
                "description": "调整交叉观察器根区域的边界，用于提前或延后懒加载",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'100px'"
                },
                "required": false
            },
            {
                "name": "once",
                "type": "boolean",
                "fallback": "true",
                "description": "首次满足条件后停止后续观察或重复触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "intersect",
                "type": "entry: IntersectionObserverEntry",
                "fallback": "—",
                "description": "观察目标进入交叉区域时触发，并携带 IntersectionObserverEntry"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ visible }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { visible }"
            },
            {
                "name": "placeholder",
                "type": "—",
                "fallback": "—",
                "description": "自定义尚无内容时显示的占位区域"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UList": {
        "props": [
            {
                "name": "modelValue",
                "type": "ListValue | ListValue[]",
                "fallback": "undefined",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "activated",
                "type": "ListValue | ListValue[]",
                "fallback": "undefined",
                "description": "提供 activated 所需的数据集合；类型为 ListValue | ListValue[]",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "opened",
                "type": "ListValue[]",
                "fallback": "—",
                "description": "提供 opened 所需的数据集合；类型为 ListValue[]",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "selectable",
                "type": "boolean",
                "fallback": "true",
                "description": "允许条目参与选择模型",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "activatable",
                "type": "boolean",
                "fallback": "false",
                "description": "允许条目成为当前活动项，但不要求它改变选择模型",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "nav",
                "type": "boolean",
                "fallback": "false",
                "description": "将容器呈现为站点导航而不是可选择列表",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "items",
                "type": "unknown[]",
                "fallback": "—",
                "description": "供组件渲染或选择的数据项列表；条目字段按组件类型解析",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemTitle",
                "type": "string | ((item: unknown) => unknown)",
                "fallback": "'title'",
                "description": "从数据项读取显示文本的字段名或取值函数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'title'"
                },
                "required": false
            },
            {
                "name": "itemValue",
                "type": "string | ((item: unknown) => unknown)",
                "fallback": "'value'",
                "description": "从数据项读取模型值或稳定键的字段名或取值函数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'value'"
                },
                "required": false
            },
            {
                "name": "itemProps",
                "type": "string | ((item: unknown) => unknown)",
                "fallback": "'props'",
                "description": "从数据项提取 disabled、标题等条目属性的映射规则",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'props'"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: ListValue | ListValue[] | undefined",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            },
            {
                "name": "update:activated",
                "type": "value: ListValue | ListValue[] | undefined",
                "fallback": "—",
                "description": "双向属性 activated 更新时触发；参数为最新值"
            },
            {
                "name": "update:opened",
                "type": "value: ListValue[]",
                "fallback": "—",
                "description": "双向属性 opened 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ selected, activated, opened }",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { selected, activated, opened }"
            },
            {
                "name": "item",
                "type": "{ item, index }",
                "fallback": "—",
                "description": "自定义单个候选项或数据项的内容。 作用域提供 { item, index }"
            },
            {
                "name": "title",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换组件默认标题内容"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UListGroup": {
        "props": [
            {
                "name": "value",
                "type": "ListValue",
                "fallback": "无默认值（必填）",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "undefined",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "activator",
                "type": "{ props }",
                "fallback": "有默认内容",
                "description": "自定义打开浮层的触发器；作用域提供需绑定到触发器的属性。 作用域提供 { props }"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UListItem": {
        "props": [
            {
                "name": "value",
                "type": "ListValue",
                "fallback": "—",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "subtitle",
                "type": "string",
                "fallback": "—",
                "description": "显示标题下方的第二行说明",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "selectable",
                "type": "boolean",
                "fallback": "true",
                "description": "允许条目参与选择模型",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "activatable",
                "type": "boolean",
                "fallback": "true",
                "description": "允许条目成为当前活动项，但不要求它改变选择模型",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "active",
                "type": "boolean",
                "fallback": "undefined",
                "description": "控制当前条目或面板是否处于激活状态",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "href",
                "type": "string",
                "fallback": "—",
                "description": "设置启用时导航到的链接地址",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "click",
                "type": "event: MouseEvent",
                "fallback": "—",
                "description": "用户激活组件时触发；参数携带原生点击事件"
            }
        ],
        "slots": [
            {
                "name": "prepend",
                "type": "—",
                "fallback": "—",
                "description": "在主要内容前追加图标或节点"
            },
            {
                "name": "title",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换组件默认标题内容"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            },
            {
                "name": "subtitle",
                "type": "—",
                "fallback": "有默认内容",
                "description": "提供标题下方的辅助说明"
            },
            {
                "name": "append",
                "type": "—",
                "fallback": "—",
                "description": "在主要内容后追加图标或节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UListItemSubtitle": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UListItemTitle": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UListSubheader": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "ULocaleProvider": {
        "props": [
            {
                "name": "locale",
                "type": "string",
                "fallback": "—",
                "description": "选择日期、数字或文本格式化使用的语言区域",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "fallback",
                "type": "string",
                "fallback": "—",
                "description": "目标资源不可用时显示的备用值或内容",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "messages",
                "type": "Record<string, Record<string, string>>",
                "fallback": "—",
                "description": "提供当前语言环境的消息字典",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "rtl",
                "type": "Record<string, boolean>",
                "fallback": "—",
                "description": "为指定语言设置从右向左的书写方向",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "tag",
                "type": "string",
                "fallback": "'div'",
                "description": "选择组件根节点的 HTML 标签",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'div'"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UMain": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UMessages": {
        "props": [
            {
                "name": "messages",
                "type": "string | string[]",
                "fallback": "—",
                "description": "提供当前语言环境的消息字典",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "error",
                "type": "boolean",
                "fallback": "false",
                "description": "显示当前错误状态或错误内容；具体呈现由组件决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "id",
                "type": "string",
                "fallback": "—",
                "description": "设置根元素或原生控件的 DOM id",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UNavigationDrawer": {
        "props": [
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "undefined",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "location",
                "type": "'left' | 'right'",
                "fallback": "'left'",
                "description": "设置浮层或控件在锚点周围的放置位置。 可选值为 'left'、'right'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'left'"
                },
                "required": false
            },
            {
                "name": "width",
                "type": "number",
                "fallback": "256",
                "description": "设置组件或内容区域宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "256"
                },
                "required": false
            },
            {
                "name": "rail",
                "type": "boolean",
                "fallback": "false",
                "description": "将导航抽屉收窄为仅显示图标的轨道模式",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "railWidth",
                "type": "number",
                "fallback": "56",
                "description": "设置导航抽屉轨道模式的宽度",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "56"
                },
                "required": false
            },
            {
                "name": "temporary",
                "type": "boolean",
                "fallback": "false",
                "description": "在窄屏模式下使用可关闭的临时抽屉",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "mobileBreakpoint",
                "type": "number",
                "fallback": "—",
                "description": "低于该像素宽度时启用移动端抽屉行为",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "absolute",
                "type": "boolean",
                "fallback": "false",
                "description": "脱离普通布局流定位组件；位置由组件和父级布局决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "order",
                "type": "number",
                "fallback": "0",
                "description": "设置组件在布局流中的顺序",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ close }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { close }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UNoSsr": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            },
            {
                "name": "placeholder",
                "type": "—",
                "fallback": "—",
                "description": "自定义尚无内容时显示的占位区域"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UNumberInput": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "min",
                "type": "number",
                "fallback": "—",
                "description": "设置数值、尺寸或日期范围的下界",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "step",
                "type": "number",
                "fallback": "1",
                "description": "设置数值控件每次递增或递减的单位",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "precision",
                "type": "number",
                "fallback": "—",
                "description": "设置数值计算或格式化时保留的小数位精度",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "number | null",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约。 也可传入 null 清空或表示当前无值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: number | null",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "text",
                "type": "exposed property",
                "kind": "property",
                "expression": "text",
                "description": "读取 text，访问 text 对应的 UNumberInput 成员"
            },
            {
                "name": "invalidInput",
                "type": "exposed property",
                "kind": "property",
                "expression": "invalidInput",
                "description": "读取 invalidInput，访问 invalidInput 对应的 UNumberInput 成员"
            },
            {
                "name": "canDecrease",
                "type": "exposed property",
                "kind": "property",
                "expression": "canDecrease",
                "description": "读取 canDecrease，访问 canDecrease 对应的 UNumberInput 成员"
            },
            {
                "name": "canIncrease",
                "type": "exposed property",
                "kind": "property",
                "expression": "canIncrease",
                "description": "读取 canIncrease，访问 canIncrease 对应的 UNumberInput 成员"
            },
            {
                "name": "control",
                "type": "exposed property",
                "kind": "property",
                "expression": "control",
                "description": "读取 control，访问 control 对应的 UNumberInput 成员"
            },
            {
                "name": "updateText",
                "type": "function",
                "kind": "method",
                "expression": "updateText",
                "description": "调用 updateText，访问 updateText 对应的 UNumberInput 成员"
            },
            {
                "name": "commit",
                "type": "function",
                "kind": "method",
                "expression": "commit",
                "description": "调用 commit，访问 commit 对应的 UNumberInput 成员"
            },
            {
                "name": "change",
                "type": "function",
                "kind": "method",
                "expression": "change",
                "description": "调用 change，访问 change 对应的 UNumberInput 成员"
            },
            {
                "name": "keydown",
                "type": "function",
                "kind": "method",
                "expression": "keydown",
                "description": "调用 keydown，访问 keydown 对应的 UNumberInput 成员"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UOtpInput": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "length",
                "type": "number",
                "fallback": "6",
                "description": "设置分页、列表或输入格的项目总数；具体含义见组件行为",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "6"
                },
                "required": false
            },
            {
                "name": "numeric",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "限制输入内容为数字字符",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "autofocus",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "组件挂载后自动将焦点移到第一个可编辑控件",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string",
                "fallback": "''",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "finish",
                "type": "value: string",
                "fallback": "—",
                "description": "用户完成所有输入格时触发，并携带最终文本值"
            },
            {
                "name": "update:modelValue",
                "type": "value: string",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "inputs",
                "type": "exposed property",
                "kind": "property",
                "expression": "inputs",
                "description": "读取 inputs，访问 inputs 对应的 UOtpInput 成员"
            },
            {
                "name": "cells",
                "type": "exposed property",
                "kind": "property",
                "expression": "cells",
                "description": "读取 cells，访问 cells 对应的 UOtpInput 成员"
            },
            {
                "name": "control",
                "type": "exposed property",
                "kind": "property",
                "expression": "control",
                "description": "读取 control，访问 control 对应的 UOtpInput 成员"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "focus",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "update",
                "type": "function",
                "kind": "method",
                "expression": "update",
                "description": "按当前参数重新计算或提交组件状态"
            },
            {
                "name": "keydown",
                "type": "function",
                "kind": "method",
                "expression": "keydown",
                "description": "调用 keydown，访问 keydown 对应的 UOtpInput 成员"
            },
            {
                "name": "paste",
                "type": "function",
                "kind": "method",
                "expression": "paste",
                "description": "调用 paste，访问 paste 对应的 UOtpInput 成员"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UOverlay": {
        "props": [
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "undefined",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "location",
                "type": "Location",
                "fallback": "'center'",
                "description": "设置浮层或控件在锚点周围的放置位置",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'center'"
                },
                "required": false
            },
            {
                "name": "persistent",
                "type": "boolean",
                "fallback": "false",
                "description": "阻止点击外部或按 Escape 自动关闭浮层",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "scrollStrategy",
                "type": "'locked' | 'block' | 'close' | 'reposition'",
                "fallback": "'locked'",
                "description": "设置浮层打开时对页面滚动的处理方式。 可选值为 'locked'、'block'、'close'、'reposition'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'locked'"
                },
                "required": false
            },
            {
                "name": "width",
                "type": "string | number",
                "fallback": "—",
                "description": "设置组件或内容区域宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxWidth",
                "type": "string | number",
                "fallback": "—",
                "description": "设置组件最大宽度，限制内容区域展开",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "scrim",
                "type": "boolean",
                "fallback": "true",
                "description": "在浮层后显示遮罩，并按组件规则处理遮罩交互",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            },
            {
                "name": "click:outside",
                "type": "—",
                "fallback": "—",
                "description": "用户点击浮层外部时触发"
            }
        ],
        "slots": [
            {
                "name": "activator",
                "type": "{ props, activatorProps, open }",
                "fallback": "—",
                "description": "自定义打开浮层的触发器；作用域提供需绑定到触发器的属性。 作用域提供 { props, activatorProps, open }"
            },
            {
                "name": "default",
                "type": "{ close }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { close }"
            }
        ],
        "methods": [
            {
                "name": "close",
                "type": "function",
                "kind": "method",
                "expression": "close",
                "description": "关闭组件当前打开的面板或浮层"
            },
            {
                "name": "open",
                "type": "function",
                "kind": "method",
                "expression": "() => setOpen(true)",
                "description": "打开组件面板或浮层"
            },
            {
                "name": "dialog",
                "type": "exposed property",
                "kind": "property",
                "expression": "dialog",
                "description": "读取 dialog，访问 dialog 对应的 UOverlay 成员"
            }
        ],
        "attributes": []
    },
    "UParallax": {
        "props": [
            {
                "name": "speed",
                "type": "number",
                "fallback": "0.3",
                "description": "设置视差或动画跟随滚动的速度系数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0.3"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "background",
                "type": "—",
                "fallback": "—",
                "description": "自定义 background 区域"
            },
            {
                "name": "default",
                "type": "{ offset, ratio }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { offset, ratio }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UPicker": {
        "props": [
            {
                "name": "items",
                "type": "readonly PickerItem[]",
                "fallback": "无默认值（必填）",
                "description": "供组件渲染或选择的数据项列表；条目字段按组件类型解析",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "itemTitle",
                "type": "string",
                "fallback": "'title'",
                "description": "从数据项读取显示文本的字段名或取值函数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'title'"
                },
                "required": false
            },
            {
                "name": "itemValue",
                "type": "string",
                "fallback": "'value'",
                "description": "从数据项读取模型值或稳定键的字段名或取值函数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'value'"
                },
                "required": false
            },
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "returnObject",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "让选择模型返回完整条目对象，而不是条目 value",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "PickerValue | PickerValue[]",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: PickerValue | PickerValue[]",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "item",
                "type": "{ item, selected }",
                "fallback": "有默认内容",
                "description": "自定义单个候选项或数据项的内容。 作用域提供 { item, selected }"
            },
            {
                "name": "default",
                "type": "{ items, selected, choose, modelValue }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { items, selected, choose, modelValue }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UProgressCircular": {
        "props": [
            {
                "name": "modelValue",
                "type": "number",
                "fallback": "0",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "100",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "100"
                },
                "required": false
            },
            {
                "name": "indeterminate",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示复选控件的部分选中状态，不直接更改绑定模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "size",
                "type": "number",
                "fallback": "32",
                "description": "设置组件尺寸；数字或字符串的含义由类型列说明",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "32"
                },
                "required": false
            },
            {
                "name": "width",
                "type": "number",
                "fallback": "3",
                "description": "设置组件或内容区域宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "3"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ value, ratio }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { value, ratio }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UProgressLinear": {
        "props": [
            {
                "name": "modelValue",
                "type": "number",
                "fallback": "0",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "100",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "100"
                },
                "required": false
            },
            {
                "name": "bufferValue",
                "type": "number",
                "fallback": "—",
                "description": "设置进度条缓冲区的当前数值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "indeterminate",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示复选控件的部分选中状态，不直接更改绑定模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "stream",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示进度条尾部的动态流动效果",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ value, ratio }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { value, ratio }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UPullToRefresh": {
        "props": [
            {
                "name": "threshold",
                "type": "number",
                "fallback": "72",
                "description": "设置手势或观察行为触发所需的距离阈值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "72"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "refresh",
                "type": "context: { done: () => void }",
                "fallback": "—",
                "description": "用户完成下拉刷新手势时触发；回调参数提供完成方法"
            }
        ],
        "slots": [
            {
                "name": "indicator",
                "type": "{ distance, refreshing }",
                "fallback": "有默认内容",
                "description": "自定义 indicator 区域。 作用域提供 { distance, refreshing }"
            },
            {
                "name": "default",
                "type": "{ refreshing }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { refreshing }"
            }
        ],
        "methods": [
            {
                "name": "cancel",
                "type": "function",
                "kind": "method",
                "expression": "cancel",
                "description": "取消当前进行中的操作"
            }
        ],
        "attributes": []
    },
    "URadioGroup": {
        "props": [
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'row' | 'column'",
                "fallback": "—",
                "description": "设置组件的主方向；可用值见联合类型。 可选值为 'row'、'column'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "name",
                "type": "string",
                "fallback": "—",
                "description": "设置原生控件名称或条目标识",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.validate()",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.reset()",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "() => child.value?.resetValidation()",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "URangeSlider": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "min",
                "type": "number",
                "fallback": "0",
                "description": "设置数值、尺寸或日期范围的下界",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "100",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "100"
                },
                "required": false
            },
            {
                "name": "step",
                "type": "number",
                "fallback": "1",
                "description": "设置数值控件每次递增或递减的单位",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "[number, number]",
                "fallback": "每次实例化执行 () => [0, 100]",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => [0, 100]"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: [number, number]",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "startInput",
                "type": "exposed property",
                "kind": "property",
                "expression": "startInput",
                "description": "读取 startInput，访问 startInput 对应的 URangeSlider 成员"
            },
            {
                "name": "endInput",
                "type": "exposed property",
                "kind": "property",
                "expression": "endInput",
                "description": "读取 endInput，访问 endInput 对应的 URangeSlider 成员"
            },
            {
                "name": "range",
                "type": "exposed property",
                "kind": "property",
                "expression": "range",
                "description": "读取 range，访问 range 对应的 URangeSlider 成员"
            },
            {
                "name": "percentages",
                "type": "exposed property",
                "kind": "property",
                "expression": "percentages",
                "description": "读取 percentages，访问 percentages 对应的 URangeSlider 成员"
            },
            {
                "name": "control",
                "type": "exposed property",
                "kind": "property",
                "expression": "control",
                "description": "读取 control，访问 control 对应的 URangeSlider 成员"
            },
            {
                "name": "update",
                "type": "function",
                "kind": "method",
                "expression": "update",
                "description": "按当前参数重新计算或提交组件状态"
            },
            {
                "name": "input",
                "type": "function",
                "kind": "method",
                "expression": "input",
                "description": "调用 input，访问 input 对应的 URangeSlider 成员"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => startInput.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "URating": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "length",
                "type": "number",
                "fallback": "5",
                "description": "设置分页、列表或输入格的项目总数；具体含义见组件行为",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "5"
                },
                "required": false
            },
            {
                "name": "precision",
                "type": "number",
                "fallback": "1",
                "description": "设置数值计算或格式化时保留的小数位精度",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "number",
                "fallback": "0",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: number",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "value",
                "type": "exposed property",
                "kind": "property",
                "expression": "value",
                "description": "读取 value，访问 value 对应的 URating 成员"
            },
            {
                "name": "items",
                "type": "exposed property",
                "kind": "property",
                "expression": "items",
                "description": "读取 items，访问 items 对应的 URating 成员"
            },
            {
                "name": "control",
                "type": "exposed property",
                "kind": "property",
                "expression": "control",
                "description": "读取 control，访问 control 对应的 URating 成员"
            },
            {
                "name": "update",
                "type": "function",
                "kind": "method",
                "expression": "update",
                "description": "按当前参数重新计算或提交组件状态"
            },
            {
                "name": "keydown",
                "type": "function",
                "kind": "method",
                "expression": "keydown",
                "description": "调用 keydown，访问 keydown 对应的 URating 成员"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => element.value?.querySelector<HTMLElement>('button')?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "UResponsive": {
        "props": [
            {
                "name": "aspectRatio",
                "type": "number | string",
                "fallback": "—",
                "description": "设置媒体容器的宽高比",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "width",
                "type": "number | string",
                "fallback": "—",
                "description": "设置组件或内容区域宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "number | string",
                "fallback": "—",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ ratio }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { ratio }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "USelectionControl": {
        "props": [
            {
                "name": "value",
                "type": "unknown",
                "fallback": "无默认值（必填）",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "type",
                "type": "'checkbox' | 'radio' | 'switch'",
                "fallback": "'checkbox'",
                "description": "设置 type；可选值为 'checkbox'、'radio'、'switch'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'checkbox'"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "trueValue",
                "type": "unknown",
                "fallback": "—",
                "description": "指定选择控件进入选中状态时写入模型的值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "falseValue",
                "type": "unknown",
                "fallback": "—",
                "description": "指定选择控件退出选中状态时写入模型的值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "input",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => input.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            }
        ],
        "attributes": []
    },
    "USelectionControlGroup": {
        "props": [
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'row' | 'column'",
                "fallback": "'column'",
                "description": "设置组件的主方向；可用值见联合类型。 可选值为 'row'、'column'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'column'"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "name",
                "type": "string",
                "fallback": "—",
                "description": "设置原生控件名称或条目标识",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ selected, toggle }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { selected, toggle }"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => element.value?.querySelector<HTMLElement>('input:not(:disabled),button:not(:disabled)')?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            },
            {
                "name": "errors",
                "type": "exposed property",
                "kind": "property",
                "expression": "control.errors",
                "description": "读取当前控件或表单的验证错误"
            }
        ],
        "attributes": []
    },
    "USheet": {
        "props": [
            {
                "name": "elevation",
                "type": "number",
                "fallback": "0",
                "description": "设置表面阴影层级；0 表示不显示阴影",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "border",
                "type": "boolean",
                "fallback": "false",
                "description": "显示组件边框",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "USkeletonLoader": {
        "props": [
            {
                "name": "type",
                "type": "'text' | 'avatar' | 'button' | 'card'",
                "fallback": "'text'",
                "description": "设置 type；可选值为 'text'、'avatar'、'button'、'card'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'text'"
                },
                "required": false
            },
            {
                "name": "lines",
                "type": "number",
                "fallback": "1",
                "description": "设置骨架文本状态显示的行数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "width",
                "type": "string",
                "fallback": "—",
                "description": "设置组件或内容区域宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "string",
                "fallback": "—",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "true",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "USlideGroup": {
        "props": [
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean | 'force'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "true 阻止取消最后一项；force 还会在挂载时选择第一个可用项。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "selectedClass",
                "type": "string",
                "fallback": "'is-selected'",
                "description": "设置 selected Class，供 USlideGroup 执行对应行为；公开类型为 string",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'is-selected'"
                },
                "required": false
            },
            {
                "name": "valueComparator",
                "type": "ValueComparator",
                "fallback": "—",
                "description": "自定义两个候选值是否相等的比较函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'horizontal' | 'vertical'",
                "fallback": "'horizontal'",
                "description": "设置组件的主方向；可用值见联合类型。 可选值为 'horizontal'、'vertical'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'horizontal'"
                },
                "required": false
            },
            {
                "name": "centerActive",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "滚动标签列表时将当前标签移到可视区域中央",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "scrollToActive",
                "type": "boolean",
                "fallback": "true",
                "description": "控制是否启用 scroll To Active 行为",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "scrollDistance",
                "type": "number | string",
                "fallback": "'100%'",
                "description": "箭头滚动距离，支持px数值或百分比；默认100%为一个视口。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'100%'"
                },
                "required": false
            },
            {
                "name": "scrollSnap",
                "type": "'start' | 'center' | 'end'",
                "fallback": "—",
                "description": "设置 scroll Snap；可选值为 'start'、'center'、'end'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "showArrows",
                "type": "boolean | 'always' | 'desktop' | 'mobile' | 'never'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "always始终显示；never隐藏；true仅溢出时显示；desktop桌面始终显示；mobile在移动设备或溢出时显示；省略/false为桌面溢出时显示。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "contentClass",
                "type": "string",
                "fallback": "—",
                "description": "设置 content Class，供 USlideGroup 执行对应行为；公开类型为 string",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "prev",
                "type": "{ prev, next, select, isSelected }",
                "fallback": "有默认内容",
                "description": "自定义 prev 区域。 作用域提供 { prev, next, select, isSelected }"
            },
            {
                "name": "default",
                "type": "{ prev, next, select, isSelected }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { prev, next, select, isSelected }"
            },
            {
                "name": "next",
                "type": "{ prev, next, select, isSelected }",
                "fallback": "有默认内容",
                "description": "自定义 next 区域。 作用域提供 { prev, next, select, isSelected }"
            }
        ],
        "methods": [
            {
                "name": "viewport",
                "type": "exposed property",
                "kind": "property",
                "expression": "viewport",
                "description": "读取 viewport，访问 viewport 对应的 USlideGroup 成员"
            },
            {
                "name": "isOverflowing",
                "type": "exposed property",
                "kind": "property",
                "expression": "overflow",
                "description": "读取 isOverflowing，访问 overflow 对应的 USlideGroup 成员"
            },
            {
                "name": "isSelected",
                "type": "function",
                "kind": "method",
                "expression": "isSelected",
                "description": "调用 isSelected，访问 isSelected 对应的 USlideGroup 成员"
            },
            {
                "name": "select",
                "type": "function",
                "kind": "method",
                "expression": "select",
                "description": "选中原生文本输入框中的全部内容"
            },
            {
                "name": "next",
                "type": "function",
                "kind": "method",
                "expression": "() => move(1)",
                "description": "移动到下一项"
            },
            {
                "name": "prev",
                "type": "function",
                "kind": "method",
                "expression": "() => move(-1)",
                "description": "移动到上一项"
            },
            {
                "name": "scrollTo",
                "type": "function",
                "kind": "method",
                "expression": "scrollTo",
                "description": "调用 scrollTo，访问 scrollTo 对应的 USlideGroup 成员"
            }
        ],
        "attributes": []
    },
    "USlideGroupItem": {
        "props": [
            {
                "name": "value",
                "type": "unknown",
                "fallback": "—",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "selectedClass",
                "type": "string",
                "fallback": "—",
                "description": "设置 selected Class，供 USlideGroupItem 执行对应行为；公开类型为 string",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "group:selected",
                "type": "state: { value: boolean }",
                "fallback": "—",
                "description": "当 group:selected 发生时触发，并携带 state 参数"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ isSelected, selectedClass, select, toggle }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { isSelected, selectedClass, select, toggle }"
            }
        ],
        "methods": [
            {
                "name": "isSelected",
                "type": "exposed property",
                "kind": "property",
                "expression": "isSelected",
                "description": "读取 isSelected，访问 isSelected 对应的 USlideGroupItem 成员"
            },
            {
                "name": "selectedClass",
                "type": "exposed property",
                "kind": "property",
                "expression": "selectedClass",
                "description": "读取 selectedClass，访问 selectedClass 对应的 USlideGroupItem 成员"
            },
            {
                "name": "select",
                "type": "function",
                "kind": "method",
                "expression": "select",
                "description": "选中原生文本输入框中的全部内容"
            },
            {
                "name": "toggle",
                "type": "function",
                "kind": "method",
                "expression": "toggle",
                "description": "调用 toggle，访问 toggle 对应的 USlideGroupItem 成员"
            }
        ],
        "attributes": []
    },
    "USlider": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "undefined",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "undefined",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "min",
                "type": "number",
                "fallback": "0",
                "description": "设置数值、尺寸或日期范围的下界",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "100",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "100"
                },
                "required": false
            },
            {
                "name": "step",
                "type": "number",
                "fallback": "1",
                "description": "设置数值控件每次递增或递减的单位",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "showTicks",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "在滑块轨道上显示步进标记",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "thumbLabel",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "拖动滑块时显示当前值标签",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "number",
                "fallback": "0",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: number",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "value",
                "type": "exposed property",
                "kind": "property",
                "expression": "value",
                "description": "读取 value，访问 value 对应的 USlider 成员"
            },
            {
                "name": "percent",
                "type": "exposed property",
                "kind": "property",
                "expression": "percent",
                "description": "读取 percent，访问 percent 对应的 USlider 成员"
            },
            {
                "name": "control",
                "type": "exposed property",
                "kind": "property",
                "expression": "control",
                "description": "读取 control，访问 control 对应的 USlider 成员"
            },
            {
                "name": "update",
                "type": "function",
                "kind": "method",
                "expression": "update",
                "description": "按当前参数重新计算或提交组件状态"
            },
            {
                "name": "input",
                "type": "function",
                "kind": "method",
                "expression": "input",
                "description": "调用 input，访问 input 对应的 USlider 成员"
            },
            {
                "name": "focus",
                "type": "function",
                "kind": "method",
                "expression": "() => element.value?.focus()",
                "description": "将焦点移到组件的可编辑控件或首个可交互元素"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            }
        ],
        "attributes": []
    },
    "USnackbar": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "text",
                "type": "string",
                "fallback": "—",
                "description": "组件的主要文字内容；存在默认插槽时可改用插槽",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "timeout",
                "type": "number | string",
                "fallback": "5000",
                "description": "显示超时（毫秒），默认5000；负数持续显示，0立即结束。悬停、内部键盘焦点和文档隐藏暂停倒计时。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "5000"
                },
                "required": false
            },
            {
                "name": "location",
                "type": "string",
                "fallback": "'bottom center'",
                "description": "消息位置，如bottom center、top left；start/end映射逻辑侧。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'bottom center'"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'",
                "fallback": "'elevated'",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'elevated'、'flat'、'tonal'、'outlined'、'text'、'plain'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'elevated'"
                },
                "required": false
            },
            {
                "name": "vertical",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "按纵向排列内容或分隔线",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "closable",
                "type": "boolean | string",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示关闭操作，并允许用户移除当前内容",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "closeText",
                "type": "string",
                "fallback": "'关闭'",
                "description": "设置 close Text，供 USnackbar 执行对应行为；公开类型为 string",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'关闭'"
                },
                "required": false
            },
            {
                "name": "contained",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示在最近定位容器内；默认Teleport到body。attach可指定挂载目标或false原位渲染。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "attach",
                "type": "string | HTMLElement | false",
                "fallback": "—",
                "description": "设置 attach，供 USnackbar 执行对应行为；公开类型为 string | HTMLElement | false",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "timer",
                "type": "boolean | 'top' | 'bottom'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "设置 timer，供 USnackbar 执行对应行为；公开类型为 boolean | 'top' | 'bottom'",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "timerColor",
                "type": "string",
                "fallback": "—",
                "description": "设置 timer Color，供 USnackbar 执行对应行为；公开类型为 string",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "reverseTimer",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制是否启用 reverse Timer 行为",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "queueIndex",
                "type": "number",
                "fallback": "—",
                "description": "设置 queue Index，供 USnackbar 执行对应行为；公开类型为 number",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "false",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "after-leave",
                "type": "—",
                "fallback": "—",
                "description": "当 after leave 发生时触发"
            },
            {
                "name": "after-enter",
                "type": "—",
                "fallback": "—",
                "description": "当 after enter 发生时触发"
            },
            {
                "name": "timeout",
                "type": "—",
                "fallback": "—",
                "description": "当 timeout 发生时触发"
            },
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "activator",
                "type": "{ isActive, props }",
                "fallback": "—",
                "description": "自定义打开浮层的触发器；作用域提供需绑定到触发器的属性。 作用域提供 { isActive, props }"
            },
            {
                "name": "prepend",
                "type": "—",
                "fallback": "—",
                "description": "在主要内容前追加图标或节点"
            },
            {
                "name": "header",
                "type": "—",
                "fallback": "—",
                "description": "自定义 header 区域"
            },
            {
                "name": "title",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换组件默认标题内容"
            },
            {
                "name": "text",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换组件的文本内容"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            },
            {
                "name": "actions",
                "type": "{ isActive, close }",
                "fallback": "有默认内容",
                "description": "放置与主要内容关联的操作。 作用域提供 { isActive, close }"
            }
        ],
        "methods": [
            {
                "name": "close",
                "type": "function",
                "kind": "method",
                "expression": "close",
                "description": "关闭组件当前打开的面板或浮层"
            },
            {
                "name": "pause",
                "type": "function",
                "kind": "method",
                "expression": "pause",
                "description": "调用 pause，访问 pause 对应的 USnackbar 成员"
            },
            {
                "name": "resume",
                "type": "function",
                "kind": "method",
                "expression": "resume",
                "description": "调用 resume，访问 resume 对应的 USnackbar 成员"
            },
            {
                "name": "surface",
                "type": "exposed property",
                "kind": "property",
                "expression": "surface",
                "description": "读取 surface，访问 surface 对应的 USnackbar 成员"
            }
        ],
        "attributes": []
    },
    "USnackbarQueue": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "text",
                "type": "string",
                "fallback": "—",
                "description": "组件的主要文字内容；存在默认插槽时可改用插槽",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "timeout",
                "type": "number | string",
                "fallback": "—",
                "description": "显示超时（毫秒），默认5000；负数持续显示，0立即结束。悬停、内部键盘焦点和文档隐藏暂停倒计时。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "location",
                "type": "string",
                "fallback": "'bottom center'",
                "description": "消息位置，如bottom center、top left；start/end映射逻辑侧。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'bottom center'"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'elevated'、'flat'、'tonal'、'outlined'、'text'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "vertical",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "按纵向排列内容或分隔线",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "closable",
                "type": "boolean | string",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示关闭操作，并允许用户移除当前内容",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "closeText",
                "type": "string",
                "fallback": "'关闭'",
                "description": "设置 close Text，供 USnackbarQueue 执行对应行为；公开类型为 string",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'关闭'"
                },
                "required": false
            },
            {
                "name": "contained",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示在最近定位容器内；默认Teleport到body。attach可指定挂载目标或false原位渲染。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "attach",
                "type": "string | HTMLElement | false",
                "fallback": "—",
                "description": "设置 attach，供 USnackbarQueue 执行对应行为；公开类型为 string | HTMLElement | false",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "timer",
                "type": "boolean | 'top' | 'bottom'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "设置 timer，供 USnackbarQueue 执行对应行为；公开类型为 boolean | 'top' | 'bottom'",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "timerColor",
                "type": "string",
                "fallback": "—",
                "description": "设置 timer Color，供 USnackbarQueue 执行对应行为；公开类型为 string",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "reverseTimer",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制是否启用 reverse Timer 行为",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "queueIndex",
                "type": "number",
                "fallback": "—",
                "description": "设置 queue Index，供 USnackbarQueue 执行对应行为；公开类型为 number",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "totalVisible",
                "type": "number | string",
                "fallback": "1",
                "description": "同时活跃的消息上限，最小为1；关闭动画结束后移除表面。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "displayStrategy",
                "type": "'hold' | 'overflow'",
                "fallback": "'hold'",
                "description": "hold按顺序等待空位；overflow在容量满时淘汰最早活跃消息以显示新项。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'hold'"
                },
                "required": false
            },
            {
                "name": "gap",
                "type": "number | string",
                "fallback": "8",
                "description": "设置网格行列之间的间隔",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "8"
                },
                "required": false
            },
            {
                "name": "collapsed",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制是否启用 collapsed 行为",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "SnackbarMessage[]",
                "fallback": "每次实例化执行 () => []",
                "description": "v-model待显示消息数组；消息被取出显示时从数组移除。支持字符串、属性对象和promise及success/error回调。",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "dismiss",
                "type": "item: SnackbarMessage, reason: SnackbarDismissReason",
                "fallback": "—",
                "description": "当 dismiss 发生时触发，并携带 item、reason 参数"
            },
            {
                "name": "update:modelValue",
                "type": "value: SnackbarMessage[]",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "header",
                "type": "{ item }",
                "fallback": "—",
                "description": "自定义 header 区域。 作用域提供 { item }"
            },
            {
                "name": "text",
                "type": "{ item }",
                "fallback": "有默认内容",
                "description": "替换组件的文本内容。 作用域提供 { item }"
            },
            {
                "name": "actions",
                "type": "{ isActive, close, item, props }",
                "fallback": "有默认内容",
                "description": "放置与主要内容关联的操作。 作用域提供 { isActive, close, item, props }"
            }
        ],
        "methods": [
            {
                "name": "clear",
                "type": "function",
                "kind": "method",
                "expression": "clear",
                "description": "调用 clear，访问 clear 对应的 USnackbarQueue 成员"
            }
        ],
        "attributes": []
    },
    "USparkline": {
        "props": [
            {
                "name": "values",
                "type": "readonly number[]",
                "fallback": "无默认值（必填）",
                "description": "提供 values 所需的数据集合；类型为 readonly number[]",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "width",
                "type": "number",
                "fallback": "120",
                "description": "设置组件或内容区域宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "120"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "number",
                "fallback": "40",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "40"
                },
                "required": false
            },
            {
                "name": "min",
                "type": "number",
                "fallback": "—",
                "description": "设置数值、尺寸或日期范围的下界",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "number",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ points, path }",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { points, path }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "USpeedDial": {
        "props": [
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "closeOnClick",
                "type": "boolean",
                "fallback": "true",
                "description": "执行菜单项后关闭操作面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "false",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: boolean",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "activator",
                "type": "{ props, open, toggle }",
                "fallback": "有默认内容",
                "description": "自定义打开浮层的触发器；作用域提供需绑定到触发器的属性。 作用域提供 { props, open, toggle }"
            },
            {
                "name": "default",
                "type": "{ close }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { close }"
            }
        ],
        "methods": [
            {
                "name": "open",
                "type": "function",
                "kind": "method",
                "expression": "open",
                "description": "打开组件面板或浮层"
            },
            {
                "name": "close",
                "type": "function",
                "kind": "method",
                "expression": "close",
                "description": "关闭组件当前打开的面板或浮层"
            },
            {
                "name": "toggle",
                "type": "function",
                "kind": "method",
                "expression": "toggle",
                "description": "调用 toggle，访问 toggle 对应的 USpeedDial 成员"
            }
        ],
        "attributes": []
    },
    "UStepper": {
        "props": [
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "linear",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "只允许按顺序完成前置步骤后进入后续步骤",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "GroupValue | null",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约。 也可传入 null 清空或表示当前无值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: GroupValue | null",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ next, prev, go, modelValue }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { next, prev, go, modelValue }"
            }
        ],
        "methods": [
            {
                "name": "next",
                "type": "exposed property",
                "kind": "property",
                "expression": "context.next",
                "description": "移动到下一项"
            },
            {
                "name": "prev",
                "type": "exposed property",
                "kind": "property",
                "expression": "context.prev",
                "description": "移动到上一项"
            },
            {
                "name": "go",
                "type": "function",
                "kind": "method",
                "expression": "go",
                "description": "调用 go，访问 go 对应的 UStepper 成员"
            }
        ],
        "attributes": []
    },
    "UStepperActions": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ prev, next }",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { prev, next }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UStepperItem": {
        "props": [
            {
                "name": "value",
                "type": "GroupValue",
                "fallback": "无默认值（必填）",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "complete",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "将步骤标记为已完成状态",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "error",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前错误状态或错误内容；具体呈现由组件决定",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "editable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "允许用户直接编辑当前步骤或条目",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ active, complete }",
                "fallback": "有默认内容",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { active, complete }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UStepperVertical": {
        "props": [
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "linear",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "只允许按顺序完成前置步骤后进入后续步骤",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "GroupValue | null",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约。 也可传入 null 清空或表示当前无值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: GroupValue | null",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ next, prev, go, modelValue }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { next, prev, go, modelValue }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UStepperWindow": {
        "props": [],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UStepperWindowItem": {
        "props": [
            {
                "name": "value",
                "type": "GroupValue",
                "fallback": "无默认值（必填）",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "eager",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "在首次显示前挂载内容；不启用时按组件生命周期延迟挂载",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "USystemBar": {
        "props": [
            {
                "name": "height",
                "type": "number",
                "fallback": "24",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "24"
                },
                "required": false
            },
            {
                "name": "fixed",
                "type": "boolean",
                "fallback": "true",
                "description": "将组件或表头固定在滚动容器或视口位置",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "absolute",
                "type": "boolean",
                "fallback": "false",
                "description": "脱离普通布局流定位组件；位置由组件和父级布局决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "order",
                "type": "number",
                "fallback": "0",
                "description": "设置组件在布局流中的顺序",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UTimePicker": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "'时间'",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'时间'"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "format",
                "type": "'24h' | '12h'",
                "fallback": "'24h'",
                "description": "设置 format；可选值为 '24h'、'12h'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'24h'"
                },
                "required": false
            },
            {
                "name": "min",
                "type": "string",
                "fallback": "—",
                "description": "设置数值、尺寸或日期范围的下界",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "max",
                "type": "string",
                "fallback": "—",
                "description": "限制可选数量、数值上界或展示上限；具体含义由组件和本行类型确定",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "minuteStep",
                "type": "number",
                "fallback": "1",
                "description": "设置时间控件分钟字段的步进值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "1"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string",
                "fallback": "'00:00'",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'00:00'"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: string",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            },
            {
                "name": "errors",
                "type": "exposed property",
                "kind": "property",
                "expression": "control.errors",
                "description": "读取当前控件或表单的验证错误"
            }
        ],
        "attributes": []
    },
    "UTimeline": {
        "props": [
            {
                "name": "side",
                "type": "'start' | 'end' | 'alternate'",
                "fallback": "'alternate'",
                "description": "设置 side；可选值为 'start'、'end'、'alternate'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'alternate'"
                },
                "required": false
            },
            {
                "name": "reverse",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "反转内容或数据的显示顺序",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UTimelineItem": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "subtitle",
                "type": "string",
                "fallback": "—",
                "description": "显示标题下方的第二行说明",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "side",
                "type": "'start' | 'end'",
                "fallback": "—",
                "description": "设置 side；可选值为 'start'、'end'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "icon",
                "type": "—",
                "fallback": "—",
                "description": "替换组件默认图标"
            },
            {
                "name": "default",
                "type": "{ index, side }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { index, side }"
            },
            {
                "name": "opposite",
                "type": "—",
                "fallback": "—",
                "description": "自定义 opposite 区域"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UToolbar": {
        "props": [
            {
                "name": "density",
                "type": "'prominent' | 'default' | 'comfortable' | 'compact'",
                "fallback": "'default'",
                "description": "default/comfortable/compact/prominent：默认内容高度64/56/48/128px；扩展区48/44/40/96px。显式height与extensionHeight参与相同密度计算。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'default'"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "number | string",
                "fallback": "64",
                "description": "内容区基础高度，默认64px；数字或数字字符串。密度会从此基础高度计算最终尺寸。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "64"
                },
                "required": false
            },
            {
                "name": "extensionHeight",
                "type": "number | string",
                "fallback": "48",
                "description": "扩展区基础高度，默认48px；密度会调整最终高度，不包含内容区。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "48"
                },
                "required": false
            },
            {
                "name": "extended",
                "type": "boolean | null",
                "fallback": "null",
                "description": "默认null：存在extension插槽时显示扩展区；显式true/false控制显示，并提供展开收起过渡。关闭时内容不可聚焦。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "—",
                "description": "显示的标题文本；使用 title 插槽时可由插槽内容替代",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "主题名称（如primary）或CSS颜色；填充背景并使用对应on-color，未单独设置颜色的按钮继承前景色。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "image",
                "type": "string",
                "fallback": "—",
                "description": "指定图片资源地址",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "absolute",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "脱离普通布局流定位组件；位置由组件和父级布局决定",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "collapse",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "将工具栏限制到112px并隐藏标题；collapsePosition指定折叠侧。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "collapsePosition",
                "type": "'start' | 'end'",
                "fallback": "'start'",
                "description": "start/end指定折叠侧，使用逻辑方向并圆化对应底角；默认start。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'start'"
                },
                "required": false
            },
            {
                "name": "flat",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制是否启用 flat 行为",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "floating",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "宽度随内容收缩，适合独立浮动操作条；未启用时占满容器宽度。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "elevation",
                "type": "number | string",
                "fallback": "0",
                "description": "设置表面阴影层级；0 表示不显示阴影",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "0"
                },
                "required": false
            },
            {
                "name": "border",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示组件边框",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean | string | number",
                "fallback": "true",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "location",
                "type": "string",
                "fallback": "—",
                "description": "定位边缘，如top start或bottom end；通常与absolute配合使用。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "tag",
                "type": "string",
                "fallback": "'header'",
                "description": "选择组件根节点的 HTML 标签",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'header'"
                },
                "required": false
            },
            {
                "name": "theme",
                "type": "string",
                "fallback": "—",
                "description": "选择当前组件使用的主题名称",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "image",
                "type": "{ image }",
                "fallback": "有默认内容",
                "description": "自定义背景图片层，作用域image提供image属性。"
            },
            {
                "name": "prepend",
                "type": "—",
                "fallback": "—",
                "description": "内容区前置操作，如菜单按钮。"
            },
            {
                "name": "title",
                "type": "—",
                "fallback": "—",
                "description": "自定义内置标题，优先于title属性；长文本自动省略。"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "内容区中标题与操作之间的自定义内容。"
            },
            {
                "name": "actions",
                "type": "—",
                "fallback": "有默认内容",
                "description": "直接放入操作按钮，自动进入内置右侧操作区；默认text，无需额外ToolbarItems。"
            },
            {
                "name": "append",
                "type": "—",
                "fallback": "—",
                "description": "兼容的后置操作插槽；存在actions时优先使用actions。"
            },
            {
                "name": "extension",
                "type": "—",
                "fallback": "—",
                "description": "内容区下方的扩展行；默认存在插槽时显示，可由extended控制。"
            },
            {
                "name": "text",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换组件的文本内容"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "exposed property",
                "kind": "property",
                "expression": "element",
                "description": "访问组件关联的根元素或原生控件引用"
            },
            {
                "name": "contentHeight",
                "type": "exposed property",
                "kind": "property",
                "expression": "contentHeight",
                "description": "读取 contentHeight，访问 contentHeight 对应的 UToolbar 成员"
            },
            {
                "name": "extensionHeight",
                "type": "exposed property",
                "kind": "property",
                "expression": "extensionHeight",
                "description": "读取 extensionHeight，访问 extensionHeight 对应的 UToolbar 成员"
            }
        ],
        "attributes": []
    },
    "UToolbarItems": {
        "props": [
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "为操作按钮提供默认颜色；按钮显式color优先，未设置时继承工具栏前景色。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'",
                "fallback": "'text'",
                "description": "为操作按钮提供默认样式，默认text；按钮显式variant优先。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'text'"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UToolbarTitle": {
        "props": [
            {
                "name": "text",
                "type": "string",
                "fallback": "—",
                "description": "组件的主要文字内容；存在默认插槽时可改用插槽",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "tag",
                "type": "string",
                "fallback": "'div'",
                "description": "选择组件根节点的 HTML 标签",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'div'"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "text",
                "type": "—",
                "fallback": "有默认内容",
                "description": "替换组件的文本内容"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UTransition": {
        "props": [
            {
                "name": "variant",
                "type": "'fade' | 'scale' | 'slide-x' | 'slide-y' | 'expand'",
                "fallback": "'fade'",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'fade'、'scale'、'slide-x'、'slide-y'、'expand'",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'fade'"
                },
                "required": false
            },
            {
                "name": "mode",
                "type": "'in-out' | 'out-in' | 'default'",
                "fallback": "—",
                "description": "选择组件的工作模式；具体可用值见类型列。 可选值为 'in-out'、'out-in'、'default'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "appear",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "在组件首次渲染时也执行进入过渡",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UTreeview": {
        "props": [
            {
                "name": "items",
                "type": "Item[]",
                "fallback": "无默认值（必填）",
                "description": "供组件渲染或选择的数据项列表；条目字段按组件类型解析",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "modelValue",
                "type": "ListValue[]",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "opened",
                "type": "ListValue[]",
                "fallback": "—",
                "description": "提供 opened 所需的数据集合；类型为 ListValue[]",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "activated",
                "type": "ListValue | null",
                "fallback": "undefined",
                "description": "设置 activated；也可传入 null 清空或表示当前无值",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "itemTitle",
                "type": "string | ((item: unknown) => unknown)",
                "fallback": "'title'",
                "description": "从数据项读取显示文本的字段名或取值函数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'title'"
                },
                "required": false
            },
            {
                "name": "itemValue",
                "type": "string | ((item: unknown) => unknown)",
                "fallback": "'value'",
                "description": "从数据项读取模型值或稳定键的字段名或取值函数",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'value'"
                },
                "required": false
            },
            {
                "name": "itemChildren",
                "type": "string",
                "fallback": "'children'",
                "description": "指定树形数据中存放子节点的字段名",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'children'"
                },
                "required": false
            },
            {
                "name": "selectable",
                "type": "boolean",
                "fallback": "true",
                "description": "允许条目参与选择模型",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "multiple",
                "type": "boolean",
                "fallback": "true",
                "description": "允许选择多个条目；模型通常为数组，具体类型见本行契约",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "mandatory",
                "type": "boolean",
                "fallback": "false",
                "description": "要求选择模型保持至少一个有效值；可用模式见类型",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "openOnClick",
                "type": "boolean",
                "fallback": "false",
                "description": "用户点击触发器时打开面板",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "true",
                "description": "动作表面默认启用涟漪；false 关闭，或传入 { center, circle, color, class, keys }。禁用、只读和减少动效时停用；编辑区与静态容器不触发",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: ListValue[]",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            },
            {
                "name": "update:opened",
                "type": "value: ListValue[]",
                "fallback": "—",
                "description": "双向属性 opened 更新时触发；参数为最新值"
            },
            {
                "name": "update:activated",
                "type": "value: ListValue | null",
                "fallback": "—",
                "description": "双向属性 activated 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "title",
                "type": "{ item, title }",
                "fallback": "有默认内容",
                "description": "替换组件默认标题内容。 作用域提供 { item, title }"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UValidation": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "—",
                "description": "显示在控件下方的补充说明，并通过 aria-describedby 关联。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 UForm；独立为 top）",
                "description": "设置 label Position；可选值为 'top'、'left'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 UForm；独立为 180px）",
                "description": "设置标签左对齐时标签列的宽度；数字按像素处理",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "保留控件可读与聚焦状态，同时阻止用户修改模型",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用组件提供的紧凑间距与尺寸",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 false）",
                "description": "使用透明或弱化表面，同时保留组件的焦点与错误反馈",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 UForm；独立为 true）",
                "description": "启用或关闭组件的圆角表面",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "—",
                "description": "按顺序执行同步或异步校验规则；返回 false 或错误文本表示失败",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "—",
                "description": "向控件追加外部错误；禁用时错误不会参与 Form 汇总",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "—",
                "description": "限制本次验证最多保留的错误数量",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 UForm；独立为 input）",
                "description": "设置控件触发验证的时机；类型列给出允许值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "'default' | 'comfortable' | 'compact'",
                "fallback": "—",
                "description": "选择组件内部间距级别；可用值见联合类型。 可选值为 'default'、'comfortable'、'compact'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'filled' | 'underlined' | 'plain'",
                "fallback": "—",
                "description": "选择组件的语义样式变体；可用值见联合类型。 可选值为 'outlined'、'filled'、'underlined'、'plain'",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "—",
                "description": "设置组件使用的颜色或主题色值",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示清除当前选择或输入值的操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "persistentHint",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "即使控件没有焦点，也持续显示 hint 说明",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideDetails",
                "type": "boolean | 'auto'",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "控制 hint 与验证消息等辅助信息的显示；auto 会在需要时显示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "表示异步或延迟操作正在进行，并按组件约定限制重复操作",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "prefix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域前显示固定前缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "suffix",
                "type": "string",
                "fallback": "—",
                "description": "在输入区域后显示固定后缀文本",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "显示当前字符数；数字值也用作计数上限提示",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "unknown",
                "fallback": "—",
                "description": "组件的双向绑定值；类型和初始值见本行契约",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: unknown",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ modelValue, isValid, errors, validate, reset, resetValidation }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { modelValue, isValid, errors, validate, reset, resetValidation }"
            }
        ],
        "methods": [
            {
                "name": "validate",
                "type": "function",
                "kind": "method",
                "expression": "control.validate",
                "description": "立即执行当前控件或表单的同步、异步与原生验证"
            },
            {
                "name": "reset",
                "type": "function",
                "kind": "method",
                "expression": "control.reset",
                "description": "将模型恢复为挂载时记录的初始值，并清除验证状态"
            },
            {
                "name": "resetValidation",
                "type": "function",
                "kind": "method",
                "expression": "control.resetValidation",
                "description": "取消进行中的验证并清除当前错误，不改动模型值"
            },
            {
                "name": "errors",
                "type": "exposed property",
                "kind": "property",
                "expression": "control.errors",
                "description": "读取当前控件或表单的验证错误"
            }
        ],
        "attributes": []
    },
    "UVirtualScroll": {
        "props": [
            {
                "name": "items",
                "type": "unknown[]",
                "fallback": "无默认值（必填）",
                "description": "供组件渲染或选择的数据项列表；条目字段按组件类型解析",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "itemHeight",
                "type": "number",
                "fallback": "无默认值（必填）",
                "description": "设置虚拟列表中每一项的估算或固定高度",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "height",
                "type": "number | string",
                "fallback": "320",
                "description": "设置组件或滚动区域高度；单位由类型与实现决定",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "320"
                },
                "required": false
            },
            {
                "name": "overscan",
                "type": "number",
                "fallback": "4",
                "description": "在可视区域前后额外渲染的条目数量，减少快速滚动时的空白",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "4"
                },
                "required": false
            },
            {
                "name": "itemKey",
                "type": "string | ((item: unknown) => string | number)",
                "fallback": "—",
                "description": "指定虚拟列表条目的稳定键字段或取值函数",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "{ item, index }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { item, index }"
            }
        ],
        "methods": [
            {
                "name": "scrollToIndex",
                "type": "function",
                "kind": "method",
                "expression": "scrollToIndex",
                "description": "将虚拟滚动区域定位到指定条目索引"
            }
        ],
        "attributes": []
    },
    "UWindow": {
        "props": [
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "禁用用户交互；由表单禁用时，子控件不能单独恢复启用",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "touch",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "启用触摸手势切换或交互",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "keyboard",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "启用键盘快捷键或方向键交互",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "continuous",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "切换到首项或末项后继续循环播放",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "eager",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "在首次显示前挂载内容；不启用时按组件生命周期延迟挂载",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "—",
                "description": "控件或区域的可访问名称；有可见标题时仍会关联对应控件",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "GroupValue | null",
                "fallback": "null",
                "description": "组件的双向绑定值；类型和初始值见本行契约。 也可传入 null 清空或表示当前无值",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "null"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: GroupValue | null",
                "fallback": "—",
                "description": "双向属性 modelValue 更新时触发；参数为最新值"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ next, prev, modelValue }",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点。 作用域提供 { next, prev, modelValue }"
            }
        ],
        "methods": [
            {
                "name": "next",
                "type": "function",
                "kind": "method",
                "expression": "next",
                "description": "移动到下一项"
            },
            {
                "name": "prev",
                "type": "function",
                "kind": "method",
                "expression": "prev",
                "description": "移动到上一项"
            }
        ],
        "attributes": []
    },
    "UWindowItem": {
        "props": [
            {
                "name": "value",
                "type": "GroupValue",
                "fallback": "无默认值（必填）",
                "description": "当前条目或控件代表的值；选择类组件用它与绑定模型比较",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "eager",
                "type": "boolean",
                "fallback": "false（Vue Boolean 默认值）",
                "description": "在首次显示前挂载内容；不启用时按组件生命周期延迟挂载",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "放置组件主要内容；无作用域参数时由调用方直接提供节点"
            }
        ],
        "methods": [],
        "attributes": []
    }
};

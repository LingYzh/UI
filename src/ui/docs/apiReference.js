// Public component contracts. Checked against Vue source by tests/api-reference.test.ts.
export const componentApi = {
    "UiButton": {
        "props": [
            {
                "name": "variant",
                "type": "'secondary' | 'primary' | 'ghost' | 'danger'",
                "fallback": "'secondary'",
                "description": "动作层级；danger 用于删除等不可撤销操作，可与 ghost 组合。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'secondary'"
                },
                "required": false
            },
            {
                "name": "size",
                "type": "'sm' | 'md'",
                "fallback": "'md'",
                "description": "紧凑或标准尺寸。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'md'"
                },
                "required": false
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false",
                "description": "等待时禁用并暴露 aria-busy；不自动添加图标。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "icon",
                "type": "boolean",
                "fallback": "false",
                "description": "纯图标方形按钮。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "type",
                "type": "'button' | 'submit' | 'reset'",
                "fallback": "'button'",
                "description": "原生按钮类型。",
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
                "description": "点击波纹配置；false 关闭，也可传 RippleOptions。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 true）",
                "description": "是否显示圆角。",
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
                "fallback": "—",
                "description": "按钮文本与图标。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "focus",
                "type": "(options?: FocusOptions) => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            }
        ],
        "attributes": []
    },
    "UiInput": {
        "props": [
            {
                "name": "width",
                "type": "string | number",
                "fallback": "undefined",
                "description": "控件宽度；数字按 px，默认占满可用区域。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "minWidth",
                "type": "string | number",
                "fallback": "undefined",
                "description": "最小宽度；数字按 px，默认允许缩至父容器。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxWidth",
                "type": "string | number",
                "fallback": "undefined",
                "description": "最大宽度；数字按 px，默认不超出父容器。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "inline",
                "type": "boolean",
                "fallback": "false",
                "description": "使用内容宽度，不主动填满父容器；适合工具栏。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "undefined",
                "description": "控件下方的辅助说明；未设置时不预留空白。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 Form；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 Form；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 true）",
                "description": "是否显示圆角。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "undefined",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "undefined",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "undefined（有效值 1）",
                "description": "规则验证最多显示的错误数量，默认 1。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 Form；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "invalid",
                "type": "boolean",
                "fallback": "false",
                "description": "显式错误外观；规则错误也会自动应用错误态。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string | number | null",
                "fallback": "''",
                "description": "v-model：输入字符串；type=\"number\" 时为 number，清空为 null。",
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
                "description": "输入变化时更新模型。"
            }
        ],
        "slots": [
            {
                "name": "leading",
                "type": "—",
                "fallback": "—",
                "description": "输入前的图标或内容。"
            },
            {
                "name": "trailing",
                "type": "—",
                "fallback": "—",
                "description": "输入后的辅助内容。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            },
            {
                "name": "select",
                "type": "() => void",
                "fallback": "—",
                "description": "选择输入框中的完整文本。"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "fallback": "—",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果。"
            },
            {
                "name": "reset",
                "type": "() => void",
                "fallback": "—",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护。"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "fallback": "—",
                "description": "保留模型，仅清除内部验证状态。"
            },
            {
                "name": "errors",
                "type": "string[]",
                "fallback": "—",
                "description": "当前错误信息，响应式只读。"
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
    "UiTextarea": {
        "props": [
            {
                "name": "width",
                "type": "string | number",
                "fallback": "undefined",
                "description": "控件宽度；数字按 px，默认占满可用区域。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "minWidth",
                "type": "string | number",
                "fallback": "undefined",
                "description": "最小宽度；数字按 px，默认允许缩至父容器。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxWidth",
                "type": "string | number",
                "fallback": "undefined",
                "description": "最大宽度；数字按 px，默认不超出父容器。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "inline",
                "type": "boolean",
                "fallback": "false",
                "description": "使用内容宽度，不主动填满父容器；适合工具栏。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "undefined",
                "description": "控件下方的辅助说明；未设置时不预留空白。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 Form；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 Form；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 true）",
                "description": "是否显示圆角。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "undefined",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "undefined",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "undefined（有效值 1）",
                "description": "规则验证最多显示的错误数量，默认 1。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 Form；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "invalid",
                "type": "boolean",
                "fallback": "false",
                "description": "显式错误外观；规则错误也会自动应用错误态。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rows",
                "type": "number",
                "fallback": "5",
                "description": "可见行数。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "5"
                },
                "required": false
            },
            {
                "name": "autoGrow",
                "type": "boolean",
                "fallback": "false",
                "description": "随内容和宽度增高、收缩；maxRows限制最高行数且不小于rows。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "maxRows",
                "type": "number",
                "fallback": "undefined",
                "description": "随内容和宽度增高、收缩；maxRows限制最高行数且不小于rows。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "noResize",
                "type": "boolean",
                "fallback": "false",
                "description": "原生只读／禁止手动调整；autoGrow自动关闭手动调整。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "counter",
                "type": "boolean | number",
                "fallback": "undefined",
                "description": "字符计数，可传提示上限；原生maxlength才阻止超长输入。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string",
                "fallback": "''",
                "description": "v-model：双向绑定文本。",
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
                "description": "内容变化。"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "fallback": "—",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果。"
            },
            {
                "name": "reset",
                "type": "() => void",
                "fallback": "—",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护。"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "fallback": "—",
                "description": "保留模型，仅清除内部验证状态。"
            },
            {
                "name": "errors",
                "type": "string[]",
                "fallback": "—",
                "description": "当前错误信息，响应式只读。"
            }
        ],
        "attributes": []
    },
    "UiSelect": {
        "props": [
            {
                "name": "width",
                "type": "string | number",
                "fallback": "undefined",
                "description": "控件宽度；数字按 px，默认占满可用区域。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "minWidth",
                "type": "string | number",
                "fallback": "undefined",
                "description": "最小宽度；数字按 px，默认允许缩至父容器。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxWidth",
                "type": "string | number",
                "fallback": "undefined",
                "description": "最大宽度；数字按 px，默认不超出父容器。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "inline",
                "type": "boolean",
                "fallback": "false",
                "description": "使用内容宽度，不主动填满父容器；适合工具栏。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "undefined",
                "description": "控件下方的辅助说明；未设置时不预留空白。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 Form；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 Form；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 true）",
                "description": "是否显示圆角。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "undefined",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "undefined",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "undefined（有效值 1）",
                "description": "规则验证最多显示的错误数量，默认 1。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 Form；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "items",
                "type": "SelectItem[]",
                "fallback": "undefined",
                "description": "富选项：{ value: string, label, description?, hint?, disabled? }[]；不传时使用 option/optgroup 插槽。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "menuTitle",
                "type": "string",
                "fallback": "undefined",
                "description": "富选项菜单的说明标题，不替代 aria-label。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "placeholder",
                "type": "string",
                "fallback": "undefined",
                "description": "未选择时显示；隐藏且不可选，不占用列表选项。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "compact",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑工具栏样式。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "invalid",
                "type": "boolean",
                "fallback": "false",
                "description": "显式错误外观；规则错误也会自动应用错误态。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "blurOnSelect",
                "type": "boolean",
                "fallback": "true",
                "description": "指针选择后释放焦点；键盘选择保留焦点。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string | number | null",
                "fallback": "undefined",
                "description": "v-model：所选 option 值，保留绑定的数字类型。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "update:modelValue",
                "type": "value: string | number | null",
                "fallback": "—",
                "description": "选择变化时更新。"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "原生 option / optgroup。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "fallback": "—",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果。"
            },
            {
                "name": "reset",
                "type": "() => void",
                "fallback": "—",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护。"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "fallback": "—",
                "description": "保留模型，仅清除内部验证状态。"
            },
            {
                "name": "errors",
                "type": "string[]",
                "fallback": "—",
                "description": "当前错误信息，响应式只读。"
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
    "UiSwitch": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "undefined",
                "description": "控件下方的辅助说明；未设置时不预留空白。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 Form；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 Form；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "undefined",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "undefined",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "undefined（有效值 1）",
                "description": "规则验证最多显示的错误数量，默认 1。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 Form；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "false",
                "description": "v-model：是否选中。",
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
                "description": "选中状态变化。"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "fallback": "—",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果。"
            },
            {
                "name": "reset",
                "type": "() => void",
                "fallback": "—",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护。"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "fallback": "—",
                "description": "保留模型，仅清除内部验证状态。"
            },
            {
                "name": "errors",
                "type": "string[]",
                "fallback": "—",
                "description": "当前错误信息，响应式只读。"
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
    "UiTooltip": {
        "props": [
            {
                "name": "text",
                "type": "string",
                "fallback": "必填",
                "description": "简短说明文字。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "focusable",
                "type": "boolean",
                "fallback": "true",
                "description": "包裹已有按钮时可设 false，按钮本身承接键盘焦点与提示。",
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
                "description": "非交互图标；外层提供 Tab 焦点。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiField": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "必填",
                "description": "自定义表单项的可见标题。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "for",
                "type": "string",
                "fallback": "undefined",
                "description": "控件 id；存在时渲染关联 label。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "description",
                "type": "string",
                "fallback": "undefined",
                "description": "自定义控件下方的辅助说明。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "error",
                "type": "string",
                "fallback": "undefined",
                "description": "错误说明，使用 role=alert。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "layout",
                "type": "FieldLayout",
                "fallback": "undefined",
                "description": "标签与控件的排列方向；继承 Form，Form 外未指定时保留原字段排列。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "required",
                "type": "boolean",
                "fallback": "false",
                "description": "必填标记，并通过 controlAttrs 向自定义控件提供 required。",
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
                "description": "id、aria-describedby、aria-invalid，须 v-bind 到控件。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiContainer": {
        "props": [
            {
                "name": "fluid",
                "type": "boolean",
                "fallback": "false",
                "description": "取消1200px最大宽度，保持水平留白。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "tag",
                "type": "string",
                "fallback": "'div'",
                "description": "原生标签。",
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
                "description": "真实子组件或内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiRow": {
        "props": [
            {
                "name": "tag",
                "type": "string",
                "fallback": "'div'",
                "description": "原生标签。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'div'"
                },
                "required": false
            },
            {
                "name": "size",
                "type": "number",
                "fallback": "12",
                "description": "正数基准列数。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "12"
                },
                "required": false
            },
            {
                "name": "density",
                "type": "LayoutDensity",
                "fallback": "'default'",
                "description": "24 / 16 / 8px 间距。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'default'"
                },
                "required": false
            },
            {
                "name": "noGutters",
                "type": "boolean",
                "fallback": "false",
                "description": "列间距归零。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "align",
                "type": "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
                "fallback": "'stretch'",
                "description": "交叉轴对齐。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'stretch'"
                },
                "required": false
            },
            {
                "name": "justify",
                "type": "'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'",
                "fallback": "'start'",
                "description": "主轴对齐。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'start'"
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
                "description": "真实子组件或内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiCol": {
        "props": [
            {
                "name": "tag",
                "type": "string",
                "fallback": "'div'",
                "description": "原生标签。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'div'"
                },
                "required": false
            },
            {
                "name": "cols",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "sm",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "md",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "lg",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "xl",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "xxl",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "数值按Row.size；分数例如2/5；auto依内容宽度。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offset",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "偏移继承较小断点；0可显式归零。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetSm",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "偏移继承较小断点；0可显式归零。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetMd",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "偏移继承较小断点；0可显式归零。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetLg",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "偏移继承较小断点；0可显式归零。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetXl",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "偏移继承较小断点；0可显式归零。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "offsetXxl",
                "type": "GridSize",
                "fallback": "undefined",
                "description": "偏移继承较小断点；0可显式归零。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "order",
                "type": "number",
                "fallback": "undefined",
                "description": "视觉排列，不能用来改变键盘Tab顺序。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderSm",
                "type": "number",
                "fallback": "undefined",
                "description": "视觉排列，不能用来改变键盘Tab顺序。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderMd",
                "type": "number",
                "fallback": "undefined",
                "description": "视觉排列，不能用来改变键盘Tab顺序。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderLg",
                "type": "number",
                "fallback": "undefined",
                "description": "视觉排列，不能用来改变键盘Tab顺序。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderXl",
                "type": "number",
                "fallback": "undefined",
                "description": "视觉排列，不能用来改变键盘Tab顺序。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orderXxl",
                "type": "number",
                "fallback": "undefined",
                "description": "视觉排列，不能用来改变键盘Tab顺序。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "alignSelf",
                "type": "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
                "fallback": "undefined",
                "description": "单列交叉轴对齐。",
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
                "description": "真实子组件或内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiSpacer": {
        "props": [],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiForm": {
        "props": [
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "'top'",
                "description": "统一标签方向，单个控件可覆盖；不决定控件行列。",
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
                "description": "统一左侧标签宽度。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'180px'"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "统一控件紧凑尺寸；行列间距由 Row.density 管理。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "统一控件透明表面。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "统一控件圆角。",
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
                "description": "统一验证时机：input、blur 或 submit；控件可覆盖，初始不显示错误。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'input'"
                },
                "required": false
            },
            {
                "name": "fastFail",
                "type": "boolean",
                "fallback": "false",
                "description": "显式 validate 或提交遇到第一个错误后停止后续验证。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean | null",
                "fallback": "null",
                "description": "v-model：true 为有效，false 为存在错误，null 为仍有未验证控件。",
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
                "type": "event: SubmitEvent, result: FormValidationResult",
                "fallback": "—",
                "description": "有效且未禁用时触发；首个参数保留原生事件。"
            },
            {
                "name": "invalid",
                "type": "result: FormValidationResult",
                "fallback": "—",
                "description": "提交验证失败，自动聚焦第一项错误。"
            },
            {
                "name": "update:modelValue",
                "type": "value: boolean | null",
                "fallback": "—",
                "description": "双向模型更新。"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "{ isValid, isValidating, errors, validate, reset, resetValidation }",
                "fallback": "—",
                "description": "默认内容；在内部使用 Row/Col 布局，作用域提供验证与重置状态／方法。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "isValid",
                "type": "boolean | null",
                "fallback": "—",
                "description": "统一有效状态，true / false / null。"
            },
            {
                "name": "isValidating",
                "type": "boolean",
                "fallback": "—",
                "description": "当前是否正在执行验证。"
            },
            {
                "name": "errors",
                "type": "FormError[]",
                "fallback": "—",
                "description": "当前错误信息，响应式只读。"
            },
            {
                "name": "validate",
                "type": "() => Promise<FormValidationResult>",
                "fallback": "—",
                "description": "验证当前值；返回 { valid, errors, cancelled? }，丢弃过期异步结果。"
            },
            {
                "name": "reset",
                "type": "() => Promise<void>",
                "fallback": "—",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护。"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "fallback": "—",
                "description": "保留模型，仅清除内部验证状态。"
            },
            {
                "name": "requestSubmit",
                "type": "() => void",
                "fallback": "—",
                "description": "触发原生提交流程，经过统一表单验证。"
            }
        ],
        "attributes": []
    },
    "UiFormSection": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "必填",
                "description": "原生legend，给字段组命名。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "description",
                "type": "string",
                "fallback": "undefined",
                "description": "组说明。",
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
                "description": "真实子组件或内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiFormActions": {
        "props": [
            {
                "name": "align",
                "type": "'start' | 'end' | 'between'",
                "fallback": "'end'",
                "description": "主轴对齐。leading存在时占左侧余量。",
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
                "description": "显示分隔线和顶部间距。",
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
                "description": "保存状态、说明等辅助信息。"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "真实子组件或内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiTabs": {
        "props": [
            {
                "name": "items",
                "type": "readonly TabItem[]",
                "fallback": "[]",
                "description": "标签数据；支持 string／number 与对象。对象使用 value/text，兼容旧 id/label。",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "idPrefix",
                "type": "string",
                "fallback": "undefined",
                "description": "标签与面板关联 ID 的前缀；默认自动生成。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "direction",
                "type": "'horizontal' | 'vertical'",
                "fallback": "undefined",
                "description": "布局方向；设置后优先于旧 orientation 属性。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "orientation",
                "type": "'horizontal' | 'vertical'",
                "fallback": "undefined",
                "description": "旧版方向属性；direction 未设置时生效。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "activation",
                "type": "'manual' | 'automatic'",
                "fallback": "'manual'",
                "description": "manual 时方向键只移动焦点，Enter／Space 确认；automatic 会随焦点选择。",
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
                "description": "force 默认选中首个可用项；true 保持至少一个选中，false 允许无选择。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'force'"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用整组标签及导航按钮。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "alignTabs",
                "type": "'start' | 'center' | 'end' | 'title'",
                "fallback": "'start'",
                "description": "标签在列表中的对齐方式。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'start'"
                },
                "required": false
            },
            {
                "name": "grow",
                "type": "boolean",
                "fallback": "false",
                "description": "标签均分并填满列表宽度。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "fixedTabs",
                "type": "boolean",
                "fallback": "false",
                "description": "使用等宽标签布局。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "stacked",
                "type": "boolean",
                "fallback": "false",
                "description": "图标与文本上下排列。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "hideSlider",
                "type": "boolean",
                "fallback": "false",
                "description": "隐藏当前选中项的指示条。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "centerActive",
                "type": "boolean",
                "fallback": "false",
                "description": "选中或聚焦标签时将其滚动到列表中央。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "showArrows",
                "type": "boolean | 'always' | 'desktop' | 'mobile' | 'never'",
                "fallback": "undefined",
                "description": "滚动箭头显示策略；省略时桌面列表溢出才显示。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "indicatorSide",
                "type": "'start' | 'end'",
                "fallback": "'end'",
                "description": "垂直方向指示条的逻辑侧；水平方向始终位于底部。",
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
                "description": "标签列表外观。",
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
                "description": "传递给组内 UiTab 的波纹配置。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "使用紧凑标签尺寸。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "使用透明表面，保留焦点与选中反馈。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否使用圆角。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "TabValue | null | undefined",
                "fallback": "undefined",
                "description": "v-model 当前值；支持字符串、数字、null 或 undefined。未传模型且有可用标签时 mandatory=\"force\" 选择首项；空列表或取消选择时可为 undefined。",
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
                "description": "v-model 更新事件；空列表或取消选择时 payload 可为 undefined。"
            }
        ],
        "slots": [
            {
                "name": "tab",
                "type": "{ item }",
                "fallback": "内置内容",
                "description": "数组模式的标签渲染插槽；接收完整标准化 item，并由插槽内容返回 UiTab。"
            },
            {
                "name": "default",
                "type": "{ item }",
                "fallback": "内置内容",
                "description": "声明式放置 UiTab；数组模式也可自定义每项标签内容。"
            },
            {
                "name": "item",
                "type": "{ item }",
                "fallback": "—",
                "description": "数组模式的面板插槽；每项自动包装为 UiTabsWindowItem。"
            },
            {
                "name": "window",
                "type": "—",
                "fallback": "—",
                "description": "自定义窗口插槽；自动包装在共享模型的 UiTabsWindow 中。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiTab": {
        "props": [
            {
                "name": "value",
                "type": "TabValue",
                "fallback": "undefined",
                "description": "标签值；省略时使用声明顺序索引，数字 0 是有效值。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "text",
                "type": "string",
                "fallback": "undefined",
                "description": "标签文字；未提供默认插槽时作为内容。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用该标签并跳过方向键导航。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "icon",
                "type": "string",
                "fallback": "undefined",
                "description": "可选图标名称。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "ripple",
                "type": "RippleOptions",
                "fallback": "undefined",
                "description": "此标签的波纹配置；省略时继承 UiTabs。",
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
                "fallback": "内置内容",
                "description": "标签内容与可选图标。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "HTMLButtonElement | undefined",
                "fallback": "—",
                "description": "读取原生标签按钮。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦该标签。"
            }
        ],
        "attributes": []
    },
    "UiTabsWindow": {
        "props": [
            {
                "name": "idPrefix",
                "type": "string",
                "fallback": "undefined",
                "description": "关联标签与面板的 ID 前缀；相邻 UiTabs 存在时自动继承。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "TabValue | null | undefined",
                "fallback": "undefined",
                "description": "v-model 当前显示的窗口值；仅在 UiTabs 后代或 #window 上下文中可省略并自动继承。与相邻兄弟 UiTabs 配对时需绑定同一模型。",
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
                "description": "v-model 更新事件。"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "UiTabsWindowItem 面板。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "HTMLElement | undefined",
                "fallback": "—",
                "description": "读取窗口容器。"
            }
        ],
        "attributes": []
    },
    "UiTabsWindowItem": {
        "props": [
            {
                "name": "value",
                "type": "TabValue",
                "fallback": "undefined",
                "description": "面板值；省略时使用声明顺序索引。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "eager",
                "type": "boolean",
                "fallback": "false",
                "description": "为 true 时初次渲染即挂载内容；默认首次激活时挂载并保留。",
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
                "description": "当前标签面板内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiTabPanel": {
        "props": [
            {
                "name": "value",
                "type": "string",
                "fallback": "必填",
                "description": "该面板对应的 item.id。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "modelValue",
                "type": "string",
                "fallback": "必填",
                "description": "当前选中的标签 id，单向传入。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "idPrefix",
                "type": "string",
                "fallback": "必填",
                "description": "与同组 UiTabs 相同。",
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
                "description": "面板内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiDialog": {
        "props": [
            {
                "name": "open",
                "type": "boolean",
                "fallback": "必填",
                "description": "打开状态；false 发起退出。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "scrollable",
                "type": "boolean",
                "fallback": "false",
                "description": "正文使用内部滚动区域，容器裁剪圆角。",
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
                "description": "scrollable 模式下固定在标题下方的错误提示。",
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
                "description": "内部滚动区域可访问名称。",
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
                "description": "固定宽度 420 / 560 / 720 / 960px / 视口宽减 40px；不传保持原行为。",
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
                "description": "end 为贴靠结束边的整高抽屉，只保留内侧圆角。",
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
                "description": "Esc 或遮罩请求关闭。"
            },
            {
                "name": "present-change",
                "type": "value: boolean",
                "fallback": "—",
                "description": "组件自定义事件。"
            },
            {
                "name": "opened",
                "type": "—",
                "fallback": "—",
                "description": "进入动效完成。"
            },
            {
                "name": "closed",
                "type": "—",
                "fallback": "—",
                "description": "退出完成，native dialog 已关闭，按操作方式完成焦点处理。"
            }
        ],
        "slots": [
            {
                "name": "header",
                "type": "—",
                "fallback": "—",
                "description": "scrollable 模式下固定的标题区和操作区。"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "默认布局内容；scrollable 模式下为可滚动正文。"
            },
            {
                "name": "footer",
                "type": "—",
                "fallback": "—",
                "description": "scrollable 模式下固定的标题区和操作区。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
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
    "UiCollapse": {
        "props": [
            {
                "name": "open",
                "type": "boolean",
                "fallback": "必填",
                "description": "控制展开；组件不自行更改状态。",
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
                "description": "折叠内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiSnackbarHost": {
        "props": [],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiCard": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "undefined",
                "description": "标题与说明。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "subtitle",
                "type": "string",
                "fallback": "undefined",
                "description": "标题与说明。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'outlined' | 'elevated' | 'tonal' | 'flat'",
                "fallback": "'outlined'",
                "description": "容器表面。",
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
                "description": "内边距 24px / 16px。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'comfortable'"
                },
                "required": false
            },
            {
                "name": "flush",
                "type": "boolean",
                "fallback": "false",
                "description": "内容区无内边距，适用于 Tabs 或媒体。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "as",
                "type": "string",
                "fallback": "'section'",
                "description": "语义容器标签。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'section'"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角。",
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
                "fallback": "内置内容",
                "description": "标题、媒体、内容、底部操作。"
            },
            {
                "name": "media",
                "type": "—",
                "fallback": "—",
                "description": "标题、媒体、内容、底部操作。"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "标题、媒体、内容、底部操作。"
            },
            {
                "name": "actions",
                "type": "—",
                "fallback": "—",
                "description": "标题、媒体、内容、底部操作。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiScrollArea": {
        "props": [
            {
                "name": "focusable",
                "type": "boolean",
                "fallback": "true",
                "description": "复合控件内部可设 false，避免额外 Tab 焦点。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "string",
                "fallback": "undefined",
                "description": "固定视口高度；不传时按内容自适应。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxHeight",
                "type": "string",
                "fallback": "undefined",
                "description": "最大高度。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "axis",
                "type": "'vertical' | 'horizontal' | 'both'",
                "fallback": "'vertical'",
                "description": "滚动方向。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'vertical'"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "必填",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "always",
                "type": "boolean",
                "fallback": "false",
                "description": "有溢出时始终显示滑块。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角。",
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
                "description": "原生滚动位置同步。"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "滚动内容。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "update",
                "type": "() => void",
                "fallback": "—",
                "description": "刷新滚动区域的尺寸和滑块位置。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            },
            {
                "name": "scrollTo",
                "type": "(options: ScrollToOptions) => void",
                "fallback": "—",
                "description": "滚动到指定位置。"
            }
        ],
        "attributes": []
    },
    "UiCodeBlock": {
        "props": [
            {
                "name": "code",
                "type": "String",
                "fallback": "必填",
                "description": "原始源码字符串。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "language",
                "type": "String",
                "fallback": "'vue'",
                "description": "按需注册的语法；未知语言安全回退到纯文本。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'vue'"
                },
                "required": false
            },
            {
                "name": "maxHeight",
                "type": "String",
                "fallback": "'580px'",
                "description": "源码区域的最大高度；工具结果可设为 320px，保留独立滚动。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'580px'"
                },
                "required": false
            },
            {
                "name": "streaming",
                "type": "boolean",
                "fallback": "false",
                "description": "流式源码显示；文本与高亮节点增量更新，保留选择和滚动位置。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "Boolean",
                "fallback": "true",
                "description": "是否显示圆角。",
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
    "UiTable": {
        "props": [
            {
                "name": "headers",
                "type": "readonly TableHeader[]",
                "fallback": "必填",
                "description": "key/title，以及可选 align、width、sortable。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "items",
                "type": "readonly Record<string, unknown>[]",
                "fallback": "必填",
                "description": "行数据；不会隐式排序或切片。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "itemValue",
                "type": "string",
                "fallback": "'id'",
                "description": "唯一行键字段；正式数据应提供稳定的唯一键。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'id'"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "必填",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false",
                "description": "加载提示与 aria-busy，避免把旧页显示成新页。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "emptyText",
                "type": "string",
                "fallback": "undefined",
                "description": "空数据文案。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "sortBy",
                "type": "readonly TableSort[]",
                "fallback": "[]",
                "description": "受控排序指示；基础表格只发事件，不修改数据。",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => []"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "string",
                "fallback": "undefined",
                "description": "限制视口高度并固定表头。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "fixedHeader",
                "type": "boolean",
                "fallback": "false",
                "description": "限制视口高度并固定表头。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "sort",
                "type": "key: string",
                "fallback": "—",
                "description": "点击可排序表头。"
            }
        ],
        "slots": [
            {
                "name": "header.*",
                "type": "{ header }",
                "fallback": "内置内容",
                "description": "定制表头内容，保留排序按钮语义。"
            },
            {
                "name": "loading",
                "type": "—",
                "fallback": "内置内容",
                "description": "定制加载与空数据状态。"
            },
            {
                "name": "item.*",
                "type": "{ item, value, index }",
                "fallback": "内置内容",
                "description": "按列定制内容。"
            },
            {
                "name": "no-data",
                "type": "—",
                "fallback": "内置内容",
                "description": "组件内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiDataTableServer": {
        "props": [
            {
                "name": "headers",
                "type": "readonly TableHeader[]",
                "fallback": "必填",
                "description": "key/title，以及可选 align、width、sortable。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "items",
                "type": "readonly Record<string, unknown>[]",
                "fallback": "必填",
                "description": "行数据；不会隐式排序或切片。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "itemsLength",
                "type": "number",
                "fallback": "必填",
                "description": "服务端总记录数，不是当前页长度。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "itemValue",
                "type": "string",
                "fallback": "undefined",
                "description": "唯一行键字段；正式数据应提供稳定的唯一键。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "必填",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "loading",
                "type": "boolean",
                "fallback": "false",
                "description": "加载提示与 aria-busy，避免把旧页显示成新页。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "error",
                "type": "string",
                "fallback": "undefined",
                "description": "失败时展示错误与重试操作。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "itemsPerPageOptions",
                "type": "readonly number[]",
                "fallback": "[10, 25, 50]",
                "description": "仅接受正整数；保留当前选项。",
                "declaredDefault": {
                    "kind": "factory",
                    "source": "() => [10, 25, 50]"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "true"
                },
                "required": false
            },
            {
                "name": "height",
                "type": "string",
                "fallback": "undefined",
                "description": "限制视口高度并固定表头。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "fixedHeader",
                "type": "boolean",
                "fallback": "false",
                "description": "限制视口高度并固定表头。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "page",
                "type": "number",
                "fallback": "1",
                "description": "v-model:page：当前页，从 1 开始；总数收缩时校正越界页。",
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
                "description": "v-model:itemsPerPage：每页条数。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "10"
                },
                "required": false
            },
            {
                "name": "sortBy",
                "type": "TableSort[]",
                "fallback": "[]",
                "description": "v-model:sortBy：单列排序：升序 → 降序 → 无排序。",
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
                "type": "options: TableOptions",
                "fallback": "—",
                "description": "初始化及参数变化时发出；修改每页条数或点击排序会回第一页。"
            },
            {
                "name": "retry",
                "type": "—",
                "fallback": "—",
                "description": "请求调用方重试。"
            },
            {
                "name": "update:page",
                "type": "value: number",
                "fallback": "—",
                "description": "双向模型更新。"
            },
            {
                "name": "update:itemsPerPage",
                "type": "value: number",
                "fallback": "—",
                "description": "双向模型更新。"
            },
            {
                "name": "update:sortBy",
                "type": "value: TableSort[]",
                "fallback": "—",
                "description": "双向模型更新。"
            }
        ],
        "slots": [
            {
                "name": "error",
                "type": "{ error }",
                "fallback": "内置内容",
                "description": "定制失败状态。"
            },
            {
                "name": "no-data",
                "type": "—",
                "fallback": "内置内容",
                "description": "组件内容。"
            },
            {
                "name": "header.*",
                "type": "{ header }",
                "fallback": "内置内容",
                "description": "定制表头内容，保留排序按钮语义。"
            },
            {
                "name": "loading",
                "type": "—",
                "fallback": "内置内容",
                "description": "定制加载与空数据状态。"
            },
            {
                "name": "item.*",
                "type": "{ item, value, index }",
                "fallback": "内置内容",
                "description": "按列定制内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiPagination": {
        "props": [
            {
                "name": "length",
                "type": "number",
                "fallback": "必填",
                "description": "总页数；空集合按一个不可后翻的页展示。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "totalVisible",
                "type": "number",
                "fallback": "5",
                "description": "连续页码窗口，范围 3–9；首尾页与省略号另计。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "5"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "true",
                "description": "是否显示圆角。",
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
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "number",
                "fallback": "1",
                "description": "v-model：当前页，越界会更新为有效页。",
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
                "description": "用户翻页或校正越界页。"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiIcon": {
        "props": [
            {
                "name": "name",
                "type": "String",
                "fallback": "''",
                "description": "原型SVG名，或内置MDI名。额外名称可通过registerIcons注册。",
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
                "description": "SVG path d，优先于 name；从 @mdi/js 按需导入路径。",
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
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "''"
                },
                "required": false
            },
            {
                "name": "size",
                "type": "Number",
                "fallback": "18",
                "description": "像素尺寸。",
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
    "UiActivity": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "必填",
                "description": "活动名称与状态。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "status",
                "type": "string",
                "fallback": "undefined",
                "description": "活动名称与状态。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "tone",
                "type": "'neutral' | 'busy' | 'error' | 'success'",
                "fallback": "undefined",
                "description": "状态语气。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "scrollable",
                "type": "boolean",
                "fallback": "true",
                "description": "内容外层是否使用有界滚动；已有独立滚动的 Markdown/代码/diff 可设 false，避免嵌套滚动。",
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
                "description": "inline 采用原型轻量工具标题，展开正文不缩进。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'default'"
                },
                "required": false
            },
            {
                "name": "icon",
                "type": "string",
                "fallback": "undefined",
                "description": "inline 前置图标。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "filename",
                "type": "string",
                "fallback": "undefined",
                "description": "inline 标题后的等宽文件名；长文件名截断并保留完整提示。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "added",
                "type": "number",
                "fallback": "undefined",
                "description": "inline 文件修改增删行数；未传时不显示。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "removed",
                "type": "number",
                "fallback": "undefined",
                "description": "inline 文件修改增删行数；未传时不显示。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "open",
                "type": "boolean",
                "fallback": "false",
                "description": "v-model:open：折叠状态。",
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
                "description": "展开状态变化。"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "活动内容。"
            },
            {
                "name": "actions",
                "type": "—",
                "fallback": "—",
                "description": "固定于滚动区外的动作。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiDiff": {
        "props": [
            {
                "name": "before",
                "type": "string | null",
                "fallback": "必填",
                "description": "变更前后完整文本；null 表示文件不存在，空字符串表示空文件。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "after",
                "type": "string | null",
                "fallback": "必填",
                "description": "变更前后完整文本；null 表示文件不存在，空字符串表示空文件。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "path",
                "type": "string",
                "fallback": "undefined",
                "description": "文件名或路径。",
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
                "description": "尚未执行的修改提议。",
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
                "description": "原型浅底紧凑预览，无大工具栏和重复统计。",
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
                "description": "显示在右栏查看按钮。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "inspect",
                "type": "—",
                "fallback": "—",
                "description": "请求查看保存的文件快照；宿主负责右栏导航。"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiMarkdown": {
        "props": [
            {
                "name": "source",
                "type": "string",
                "fallback": "必填",
                "description": "完整累计 Markdown 文本。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "streaming",
                "type": "boolean",
                "fallback": "false",
                "description": "正在接收内容；历史正文直接显示，减少动态效果时立即追平。",
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
                "description": "组件自定义事件。"
            },
            {
                "name": "rendered",
                "type": "source: string",
                "fallback": "—",
                "description": "实际已呈现文本，可用于滚动跟随。"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiFileChanges": {
        "props": [
            {
                "name": "title",
                "type": "string",
                "fallback": "必填",
                "description": "当前轮次的列表标题。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "items",
                "type": "FileChangeItem[]",
                "fallback": "必填",
                "description": "id、path、status（A/M/D）、added/removed；未知统计传 null。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            }
        ],
        "events": [
            {
                "name": "select",
                "type": "id: string",
                "fallback": "—",
                "description": "用户选择文件。"
            },
            {
                "name": "view-all",
                "type": "—",
                "fallback": "—",
                "description": "组件自定义事件。"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiMessageActions": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "必填",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "actions",
                "type": "MessageActionItem[]",
                "fallback": "必填",
                "description": "id、icon、label、disabled 可选；不内置业务。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            }
        ],
        "events": [
            {
                "name": "action",
                "type": "id: string",
                "fallback": "—",
                "description": "用户触发未禁用操作。"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiUsageMeter": {
        "props": [
            {
                "name": "used",
                "type": "number | null",
                "fallback": "undefined",
                "description": "非负有限用量、正数容量；缺失或无效时明确未知，容量为零不计算比例。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "capacity",
                "type": "number | null",
                "fallback": "undefined",
                "description": "非负有限用量、正数容量；缺失或无效时明确未知，容量为零不计算比例。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "estimated",
                "type": "boolean",
                "fallback": "false",
                "description": "总用量为估算时显式标记。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "compact",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑原生按钮与禁用状态。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "segments",
                "type": "UsageSegment[]",
                "fallback": "undefined",
                "description": "id、label、value；可选 tone=\"remaining\" 使用独立的冷灰色空闲分类，不受分类顺序影响。null 为未统计，分类按已知值之和绘制。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "compositionLabel",
                "type": "string",
                "fallback": "undefined",
                "description": "分类标题与独立来源提示，不隐含等于服务总量。",
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
                "description": "分类标题与独立来源提示，不隐含等于服务总量。",
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
                "description": "紧凑入口触发，由宿主展示详情。"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiBadge": {
        "props": [
            {
                "name": "tone",
                "type": "'neutral' | 'accent' | 'success' | 'warning' | 'error'",
                "fallback": "'neutral'",
                "description": "语义色；设置 color 时忽略。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'neutral'"
                },
                "required": false
            },
            {
                "name": "variant",
                "type": "'soft' | 'outline'",
                "fallback": "'soft'",
                "description": "弱底或描边。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'soft'"
                },
                "required": false
            },
            {
                "name": "color",
                "type": "string",
                "fallback": "undefined",
                "description": "任意 CSS 颜色，用于用户自定义标签。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "closable",
                "type": "boolean",
                "fallback": "false",
                "description": "显示移除按钮。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "closeLabel",
                "type": "string",
                "fallback": "undefined",
                "description": "移除按钮名称，默认取 locale 文案。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "close",
                "type": "event: MouseEvent",
                "fallback": "—",
                "description": "点击移除按钮。"
            }
        ],
        "slots": [
            {
                "name": "icon",
                "type": "—",
                "fallback": "—",
                "description": "前置 12px 图标。"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "标签文字，超长时截断。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiAlert": {
        "props": [
            {
                "name": "tone",
                "type": "'info' | 'success' | 'warning' | 'error'",
                "fallback": "'info'",
                "description": "语气与颜色。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'info'"
                },
                "required": false
            },
            {
                "name": "title",
                "type": "string",
                "fallback": "undefined",
                "description": "加粗标题；与正文组合时正文变为次要颜色。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "紧凑尺寸。",
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
                "fallback": "内置内容",
                "description": "替换左侧图标。"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "正文。"
            },
            {
                "name": "actions",
                "type": "—",
                "fallback": "—",
                "description": "右侧操作按钮。"
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
    "UiSpinner": {
        "props": [
            {
                "name": "size",
                "type": "number",
                "fallback": "16",
                "description": "像素尺寸。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "16"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
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
    "UiMenu": {
        "props": [
            {
                "name": "placement",
                "type": "MenuPlacement",
                "fallback": "'bottom-start'",
                "description": "相对触发按钮的位置，空间不足时自动翻转。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "'bottom-start'"
                },
                "required": false
            },
            {
                "name": "panel",
                "type": "boolean",
                "fallback": "false",
                "description": "自由内容面板（role=dialog）。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "open",
                "type": "boolean",
                "fallback": "false",
                "description": "v-model:open：打开状态；用户也可通过触发按钮、Esc 或点击外部改变。",
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
                "description": "打开状态变化。"
            }
        ],
        "slots": [
            {
                "name": "activator",
                "type": "{ props, open }",
                "fallback": "—",
                "description": "把 props v-bind 到按钮上，提供 popovertarget、aria-expanded 与定位锚点。"
            },
            {
                "name": "default",
                "type": "{ close }",
                "fallback": "—",
                "description": "菜单项、分隔线或面板内容。"
            }
        ],
        "methods": [
            {
                "name": "close",
                "type": "() => void",
                "fallback": "—",
                "description": "关闭当前弹层。"
            }
        ],
        "attributes": []
    },
    "UiMenuItem": {
        "props": [
            {
                "name": "checked",
                "type": "boolean",
                "fallback": "undefined",
                "description": "设置时使用menuitemcheckbox。",
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
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
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
                "description": "禁用／危险样式／点击后保留菜单。",
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
                "description": "禁用／危险样式／点击后保留菜单。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            }
        ],
        "events": [
            {
                "name": "click",
                "type": "event: MouseEvent",
                "fallback": "—",
                "description": "点击未禁用菜单项；由keepOpen控制是否关闭。"
            }
        ],
        "slots": [
            {
                "name": "icon",
                "type": "—",
                "fallback": "—",
                "description": "前置图标／末尾内容。"
            },
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "真实子组件或内容。"
            },
            {
                "name": "trailing",
                "type": "—",
                "fallback": "—",
                "description": "前置图标／末尾内容。"
            }
        ],
        "methods": [],
        "attributes": []
    },
    "UiConfirmHost": {
        "props": [],
        "events": [],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiCheckbox": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "undefined",
                "description": "控件下方的辅助说明；未设置时不预留空白。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 Form；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 Form；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "undefined",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "undefined",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "undefined（有效值 1）",
                "description": "规则验证最多显示的错误数量，默认 1。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 Form；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "indeterminate",
                "type": "boolean",
                "fallback": "false",
                "description": "部分选中；显示横线并暴露 aria-checked=\"mixed\"。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "boolean",
                "fallback": "false",
                "description": "v-model：是否选中。",
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
                "description": "勾选变化。"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "标签文字；不传时需提供 aria-label。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "fallback": "—",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果。"
            },
            {
                "name": "reset",
                "type": "() => void",
                "fallback": "—",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护。"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "fallback": "—",
                "description": "保留模型，仅清除内部验证状态。"
            },
            {
                "name": "errors",
                "type": "string[]",
                "fallback": "—",
                "description": "当前错误信息，响应式只读。"
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
    "UiRadio": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "undefined",
                "description": "控件下方的辅助说明；未设置时不预留空白。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 Form；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 Form；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "undefined",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "undefined",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "undefined（有效值 1）",
                "description": "规则验证最多显示的错误数量，默认 1。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 Form；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "value",
                "type": "T",
                "fallback": "必填",
                "description": "本选项代表的值。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "modelValue",
                "type": "T | null",
                "fallback": "null",
                "description": "v-model：当前选中的值。",
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
                "description": "选中变化。"
            }
        ],
        "slots": [
            {
                "name": "default",
                "type": "—",
                "fallback": "—",
                "description": "标签文字；不传时需提供 aria-label。"
            }
        ],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "fallback": "—",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果。"
            },
            {
                "name": "reset",
                "type": "() => void",
                "fallback": "—",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护。"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "fallback": "—",
                "description": "保留模型，仅清除内部验证状态。"
            },
            {
                "name": "errors",
                "type": "string[]",
                "fallback": "—",
                "description": "当前错误信息，响应式只读。"
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
    "UiProgress": {
        "props": [
            {
                "name": "value",
                "type": "number",
                "fallback": "0",
                "description": "当前值，自动限制在 0–max。",
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
                "description": "最大值。",
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
                "description": "填充颜色。",
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
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
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
    "UiCopyButton": {
        "props": [
            {
                "name": "text",
                "type": "string | (() => string)",
                "fallback": "必填",
                "description": "要复制的原文；函数在点击时求值。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "copiedLabel",
                "type": "string",
                "fallback": "undefined",
                "description": "成功后的提示与播报。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "true",
                "description": "紧凑尺寸。",
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
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
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
                "description": "写入成功。"
            },
            {
                "name": "error",
                "type": "error: unknown",
                "fallback": "—",
                "description": "写入失败，由宿主提示用户手动复制。"
            }
        ],
        "slots": [],
        "methods": [],
        "attributes": []
    },
    "UiColorSwatches": {
        "props": [
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "可见色板标题及 radiogroup 名称；未设置时使用 locale 的颜色文案。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "undefined",
                "description": "控件下方的辅助说明；未设置时不预留空白。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 Form；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 Form；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "false",
                "description": "共享表单属性；此控件保留固有形态，当前不改变控件尺寸／表面／圆角。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "undefined",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "undefined",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "undefined（有效值 1）",
                "description": "规则验证最多显示的错误数量，默认 1。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 Form；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "colors",
                "type": "ColorSwatch[]",
                "fallback": "undefined",
                "description": "自定义色板；label 作为色块名称。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "string | null",
                "fallback": "null",
                "description": "v-model：CSS 颜色字符串，按原样保存。",
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
                "description": "选择变化。"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "fallback": "—",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果。"
            },
            {
                "name": "reset",
                "type": "() => void",
                "fallback": "—",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护。"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "fallback": "—",
                "description": "保留模型，仅清除内部验证状态。"
            },
            {
                "name": "errors",
                "type": "string[]",
                "fallback": "—",
                "description": "当前错误信息，响应式只读。"
            }
        ],
        "attributes": []
    },
    "UiCascader": {
        "props": [
            {
                "name": "width",
                "type": "string | number",
                "fallback": "undefined",
                "description": "控件宽度；数字按 px，默认占满可用区域。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "minWidth",
                "type": "string | number",
                "fallback": "undefined",
                "description": "最小宽度；数字按 px，默认允许缩至父容器。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxWidth",
                "type": "string | number",
                "fallback": "undefined",
                "description": "最大宽度；数字按 px，默认不超出父容器。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "inline",
                "type": "boolean",
                "fallback": "false",
                "description": "使用内容宽度，不主动填满父容器；适合工具栏。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "label",
                "type": "string",
                "fallback": "undefined",
                "description": "内置可见标签，自动关联控件，不需要额外 UiField。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "hint",
                "type": "string",
                "fallback": "undefined",
                "description": "控件下方的辅助说明；未设置时不预留空白。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelPosition",
                "type": "'top' | 'left'",
                "fallback": "undefined（继承 Form；独立为 top）",
                "description": "标签方向；继承 Form，独立使用为 top。窄 Form 自动显示在上方。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "labelWidth",
                "type": "string",
                "fallback": "undefined（继承 Form；独立为 180px）",
                "description": "左侧标签列宽；继承 Form，独立使用为 180px。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "disabled",
                "type": "boolean",
                "fallback": "false",
                "description": "禁用控件；Form 禁用时子控件不能解除禁用。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "readonly",
                "type": "boolean",
                "fallback": "false",
                "description": "禁止修改，保留阅读与聚焦；Form 只读时子控件不能解除只读。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "dense",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "紧凑尺寸。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "ghost",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 false）",
                "description": "透明表面，聚焦与错误反馈仍保留。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rounded",
                "type": "boolean",
                "fallback": "undefined（继承 Form；独立为 true）",
                "description": "是否显示圆角。",
                "declaredDefault": {
                    "kind": "explicit-undefined",
                    "source": "undefined"
                },
                "required": false
            },
            {
                "name": "rules",
                "type": "readonly ValidationRule[]",
                "fallback": "undefined",
                "description": "同步／异步规则；接收当前模型，true 通过，false 或字符串表示错误，也可返回 Promise。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "errorMessages",
                "type": "string | readonly string[]",
                "fallback": "undefined",
                "description": "调用方提供的错误；显示在控件下方，由调用方维护和清除。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "maxErrors",
                "type": "number",
                "fallback": "undefined（有效值 1）",
                "description": "规则验证最多显示的错误数量，默认 1。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "validateOn",
                "type": "ValidateOn",
                "fallback": "undefined（继承 Form；独立为 input）",
                "description": "验证时机：input、blur 或 submit；继承 Form，独立使用为 input，初始不显示错误。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "items",
                "type": "readonly CascaderItem[]",
                "fallback": "必填",
                "description": "树形选项：{ value: string | number, label, disabled?, children? }[]；同级 value 唯一。",
                "declaredDefault": {
                    "kind": "required"
                },
                "required": true
            },
            {
                "name": "placeholder",
                "type": "string",
                "fallback": "undefined",
                "description": "未选择或路径已失效时显示的占位文字。",
                "declaredDefault": {
                    "kind": "undefined"
                },
                "required": false
            },
            {
                "name": "clearable",
                "type": "boolean",
                "fallback": "false",
                "description": "显示清空按钮，清空后模型变为 []。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "changeOnSelect",
                "type": "boolean",
                "fallback": "false",
                "description": "允许显式选择父节点；默认只选叶节点，→ 始终导航下一级。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "showAllLevels",
                "type": "boolean",
                "fallback": "true",
                "description": "显示完整标签路径；false 只显示最后一级。",
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
                "description": "完整标签路径的分隔符。",
                "declaredDefault": {
                    "kind": "explicit",
                    "source": "' / '"
                },
                "required": false
            },
            {
                "name": "invalid",
                "type": "boolean",
                "fallback": "false",
                "description": "显式错误外观；规则错误也会自动应用错误态。",
                "declaredDefault": {
                    "kind": "vue-boolean-false"
                },
                "required": false
            },
            {
                "name": "modelValue",
                "type": "CascaderValue[]",
                "fallback": "[]",
                "description": "v-model：完整值路径数组，保留字符串／数字类型；默认 []。",
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
                "description": "双向模型更新。"
            }
        ],
        "slots": [],
        "methods": [
            {
                "name": "element",
                "type": "原生元素 | undefined",
                "fallback": "—",
                "description": "组件原生控件；通过 ref 读取。"
            },
            {
                "name": "focus",
                "type": "() => void",
                "fallback": "—",
                "description": "聚焦原生控件。"
            },
            {
                "name": "close",
                "type": "() => void",
                "fallback": "—",
                "description": "关闭当前弹层。"
            },
            {
                "name": "validate",
                "type": "() => Promise<ValidationResult>",
                "fallback": "—",
                "description": "验证当前值；返回 { valid, errorMessages, cancelled? }，丢弃过期异步结果。"
            },
            {
                "name": "reset",
                "type": "() => void",
                "fallback": "—",
                "description": "恢复初始模型并清除内部验证，外部错误由调用方维护。"
            },
            {
                "name": "resetValidation",
                "type": "() => void",
                "fallback": "—",
                "description": "保留模型，仅清除内部验证状态。"
            },
            {
                "name": "errors",
                "type": "string[]",
                "fallback": "—",
                "description": "当前错误信息，响应式只读。"
            }
        ],
        "attributes": []
    }
};

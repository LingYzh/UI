import { tablePages } from './tableContent.js';
const row = (name, type, fallback, description) => ({ name, type, fallback, description });
const example = (id, title, description, code) => ({ id, title, description, code });
const component = (id, title, name, description, examples, props, events = [], slots = [], notes = []) => ({
    id, title, name, description, kind: 'component', group: ({ button: '操作组件', input: '表单组件', select: '表单组件', switch: '表单组件', field: '表单组件', tabs: '导航组件', 'tab-panel': '容器组件', collapse: '容器组件', dialog: '反馈组件', 'snackbar-host': '反馈组件', card: '容器组件', 'scroll-area': '容器组件', 'code-block': '内容组件' })[id] || '组件', examples, props, events, slots, notes
});

export const pages = [
    {
        id: 'overview', title: '概览', name: 'UAH UI', kind: 'guide', group: '开始使用',
        description: '温和的外观，清晰的交互。为 UAH 工作台设计的 Vue 3 组件与交互契约。',
        sections: [
            { id: 'principles', title: '为专注的工作而设计', text: '温暖米白承载内容，陶土色标记动作。控件以紧凑的密度、轻量边框与明确焦点，让长时间阅读和操作保持舒适。这里的所有演示都直接调用工作台使用的组件。' },
            { id: 'layers', title: '三层职责', items: ['基础行为：键盘导航、状态协调与可访问语义。', 'UAH 组件：保持稳定的 Ui* API，以及原生控件、生命周期和视觉约定。', '业务页面：拥有数据、校验、异步任务与布局，通过 props 和事件接入组件。'] },
            { id: 'catalog', title: '从一个真实组件开始', text: '先阅读接入指南，再在左侧选择组件。每页提供可操作示例、源码、API 和使用约定；顶部主题选择会同步更新所有控件和设计变量。' }
        ]
    },
    {
        id: 'getting-started', title: '接入指南', name: 'Getting started', kind: 'guide', group: '开始使用',
        description: '从项目内公共入口导入组件，一次加载共享样式，再让页面持有业务状态。',
        sections: [
            { id: 'import', title: '导入与样式', text: '当前库在独立 UI 仓库维护，以 @lingyzh/ui 源码包供 Vue/Vite 项目使用；UAH 通过 file:../UI 引用。先安装 UI 依赖，再安装 UAH 依赖，并在 Vite 中配置 Vue dedupe。只在应用入口引入一次共享样式。', code: "import { UiButton, UiInput, UiField, UiSnackbarHost, snackbar } from '@lingyzh/ui';\nimport '@lingyzh/ui/styles.css';" },
            { id: 'form', title: '组合一个表单', text: 'UiField 提供关联属性，UiInput 接收字符串状态。校验属于页面；同时传入 error 与 invalid，分别提供说明和错误视觉。', code: `<script setup>\nimport { ref } from 'vue';\nimport { UiButton, UiField, UiInput, snackbar } from '@lingyzh/ui';\nconst name = ref('');\nconst error = ref('');\nfunction save() {\n    error.value = name.value.trim() ? '' : '请输入项目名称。';\n    if (!error.value) snackbar.show('项目已保存', { tone: 'success' });\n}\n<\/script>\n\n<template>\n    <form @submit.prevent="save">\n        <UiField v-slot="{ controlAttrs }" label="项目名称" for="name" :error="error">\n            <UiInput v-model="name" v-bind="controlAttrs" :invalid="Boolean(error)" />\n        </UiField>\n        <UiButton type="submit" variant="primary">保存</UiButton>\n    </form>\n</template>` },
            { id: 'host', title: '挂载全局提示', text: '在根组件挂载一个 UiSnackbarHost。之后任何应用模块都能调用 snackbar，无需通过页面 ref 寻找 Host。', code: '<template>\n    <AppContent />\n    <UiSnackbarHost />\n</template>' },
            { id: 'workflow', title: '开发与交付', items: ['npm run dev:web：打开 /ui.html，直接验证组件。', 'npm run build:ui：构建可独立浏览的文档入口。', 'npm run typecheck：检查 TypeScript 与 Vue SFC。', '特殊外观通过组件 variant 或局部布局处理，避免全局 input:hover 等覆盖。'] }
        ]
    },
    component('button', '按钮', 'UiButton', '通过层级、尺寸和状态传达动作的重要性。默认使用原生 button，保留键盘和表单语义。', [
        example('button-variants', '动作层级', '主要动作保持单一；次要动作和轻量动作服务于同一任务。点击按钮可观察反馈。', '<UiButton variant="primary" @click="save">保存更改</UiButton>\n<UiButton>次要操作</UiButton>\n<UiButton variant="ghost">轻量操作</UiButton>'),
        example('button-states', '尺寸、图标与等待态', '等待态同时设置 disabled 与 aria-busy，阻止重复操作。图标按钮始终提供可访问名称。', '<UiButton size="sm">紧凑按钮</UiButton>\n<UiButton icon aria-label="添加项目"><Icon name="plus" /></UiButton>\n<UiButton disabled>不可用</UiButton>\n<UiButton :loading="saving" @click="save">{{ saving ? \'正在保存…\' : \'模拟保存\' }}</UiButton>')
    ], [row('variant', "'primary' | 'secondary' | 'ghost'", 'secondary', '动作层级。'), row('size', "'sm' | 'md'", 'md', '紧凑或标准尺寸。'), row('icon', 'boolean', 'false', '纯图标方形按钮。'), row('loading', 'boolean', 'false', '等待时禁用并暴露 aria-busy；不自动添加图标。'), row('disabled', 'boolean', 'false', '禁用动作。'), row('type', "'button' | 'submit' | 'reset'", 'button', '原生按钮类型。')], [row('原生事件', 'MouseEvent / KeyboardEvent', '—', 'click 等原生事件透传到 button。')], [row('default', '—', '—', '按钮文本与图标。')], ['ref 暴露原生 element 和 focus(options?)，避免依赖组件 $el。', '每个操作区推荐只有一个主要动作。', '使用 loading 控制等待视觉，同时在业务处理函数中守卫重复请求。']),
    component('input', '输入框', 'UiInput', '字符串输入与前后附加内容组成一个完整外壳；悬停、焦点和错误反馈覆盖整块控件。', [
        example('input-search', '带图标的输入', '输入文字，清空或聚焦。前后插槽不承担输入控件的可访问名称。', '<UiInput ref="input" v-model="query" aria-label="搜索" placeholder="搜索会话、项目与设置">\n    <template #leading><Icon name="search" :size="16" /></template>\n    <template #trailing><span>{{ query.length }}</span></template>\n</UiInput>'),
        example('input-states', '错误与禁用', '字段说明由 UiField 关联；disabled 使用原生行为。readonly 可作为原生属性透传。', '<UiField v-slot="{ controlAttrs }" label="项目名称" for="project" error="请输入项目名称。">\n    <UiInput v-bind="controlAttrs" invalid placeholder="例如：我的工作区" />\n</UiField>\n<UiField v-slot="{ controlAttrs }" label="只读能力" for="disabled">\n    <UiInput v-bind="controlAttrs" disabled model-value="尚未接入" />\n</UiField>')
    ], [row('model-value / v-model', 'string', "''", '输入字符串。'), row('disabled', 'boolean', 'false', '禁用原生 input 与外壳状态。'), row('invalid', 'boolean', 'false', '错误边框与 aria-invalid。'), row('原生属性', 'InputHTMLAttributes', '—', 'placeholder、type、readonly、autocomplete 等落在 input。'), row('class / style', '原生样式属性', '—', '落在外壳，用于布局。')], [row('update:modelValue', 'string', '—', '输入变化时更新模型。'), row('原生事件', 'Event / FocusEvent', '—', 'input、change、focus 等落在 input。')], [row('leading', '—', '—', '输入前的图标或内容。'), row('trailing', '—', '—', '输入后的辅助内容。')], ['ref 暴露 element、focus()、select()。', '无 UiField 时传 aria-label 或 aria-labelledby；placeholder 不代替名称。']),
    component('select', '选择器', 'UiSelect', '保留原生选择语义和键盘操作，支持字符串与数字 option 值。', [
        example('select-values', '数字值与紧凑样式', '切换代码字号，观察模型类型仍为 number。紧凑样式适合工具栏内的低频选择。', '<UiSelect v-model="size" aria-label="代码字号">\n    <option v-for="value in [12, 13, 14, 16]" :key="value" :value="value">{{ value }} px</option>\n</UiSelect>\n<UiSelect v-model="density" compact aria-label="显示密度">\n    <option value="comfortable">舒适</option>\n    <option value="compact">紧凑</option>\n</UiSelect>'),
        example('select-states', '错误和禁用', 'invalid 与 disabled 可分别表达校验结果和当前不可操作状态。', '<UiSelect invalid aria-label="需要选择的项目"><option>请选择项目</option></UiSelect>\n<UiSelect disabled aria-label="不可用的选择"><option>尚未启用</option></UiSelect>')
    ], [row('model-value / v-model', 'string | number | null', 'undefined', '所选 option 值，保留绑定的数字类型。'), row('compact', 'boolean', 'false', '紧凑工具栏样式。'), row('invalid', 'boolean', 'false', '错误状态。'), row('原生属性', 'SelectHTMLAttributes', '—', 'disabled、name、required、aria-label 等透传。')], [row('update:modelValue', 'string | number | null', '—', '选择变化时更新。')], [row('default', '—', '—', '原生 option / optgroup。')], ['支持 appearance: base-select 时使用共享弹层外观，其余浏览器回退到原生弹层。', '避免用自绘 div 模拟 option；浏览器提供成熟的键盘和辅助技术支持。']),
    component('switch', '开关', 'UiSwitch', '二元偏好使用布尔模型；原生 checkbox 提供 Space 切换与表单行为。', [
        example('switch-preference', '立即生效的偏好', '“减少动效”同时更新当前文档的根属性。系统偏好仍独立生效。', '<UiField v-slot="{ controlAttrs }" label="减少动效" for="motion">\n    <UiSwitch v-model="reduced" v-bind="controlAttrs" />\n</UiField>'),
        example('switch-states', '开与关、禁用', '静态状态用于比较；旁边的可操作开关可通过鼠标或 Space 切换。', '<UiSwitch v-model="enabled" aria-label="启用通知" />\n<UiSwitch :model-value="false" disabled aria-label="禁用的关闭状态" />\n<UiSwitch :model-value="true" disabled aria-label="禁用的开启状态" />')
    ], [row('model-value / v-model', 'boolean', 'false', '是否选中。'), row('原生属性', 'InputHTMLAttributes', '—', 'disabled、name、id 等落在 checkbox。')], [row('update:modelValue', 'boolean', '—', '选中状态变化。')], [], ['使用关联 label 或 aria-label 提供名称。', '需要提交后生效的一组选择，请在业务页面解释保存时机。']),
    component('field', '字段', 'UiField', '统一标题、说明与错误信息，通过作用域插槽将关联属性交给真实控件。', [
        example('field-validation', '关联与业务校验', '输入项目名称后点击校验；说明与错误通过 aria-describedby 自动关联。', '<UiField v-slot="{ controlAttrs }" label="项目名称" for="field-name" description="2 个字符以上，便于识别。" :error="error">\n    <UiInput v-model="name" v-bind="controlAttrs" :invalid="Boolean(error)" />\n</UiField>\n<UiButton @click="error = name.trim().length < 2 ? \'请至少输入 2 个字符。\' : \'\'">校验名称</UiButton>'),
        example('field-heading', '非表单标题', '不传 for 时显示 span 标题，适用于配置信息与动作行。', '<UiField label="运行环境" description="UAH 桌面工作台">\n    <span>本地工作区</span>\n</UiField>')
    ], [row('label', 'string', '必填', '可见标题。'), row('for', 'string', 'undefined', '控件 id；存在时渲染关联 label。'), row('description', 'string', 'undefined', '辅助说明。'), row('error', 'string', 'undefined', '错误说明，使用 role=alert。')], [], [row('default', '{ controlAttrs }', '—', 'id、aria-describedby、aria-invalid，须 v-bind 到控件。')], ['UiField 不执行校验，也不自动创建输入框。', '即使 controlAttrs 包含 aria-invalid，仍建议给 UiInput 传 invalid 以同步边框状态。']),
    component('tabs', '标签页', 'UiTabs', '在同一上下文切换相关视图，具备自动激活、方向键导航和单一 Tab 入口。', [
        example('tabs-soft', '基础标签与禁用项', '用左右方向键、Home / End 切换。禁用项会被跳过，切换面板不销毁内部状态。', '<UiTabs v-model="selected" :items="items" id-prefix="example" aria-label="示例标签页" />\n<UiTabPanel :model-value="selected" value="overview" id-prefix="example">概览</UiTabPanel>\n<UiTabPanel :model-value="selected" value="details" id-prefix="example">详情</UiTabPanel>'),
        example('tabs-variants', '下划线与垂直布局', '切换布局可观察方向键规则；自定义插槽可加入 UAH 图标。', '<UiTabs v-model="selected" :items="items" id-prefix="tools" variant="underline">\n    <template #default="{ item }"><Icon :name="item.icon" />{{ item.label }}</template>\n</UiTabs>\n<UiTabs v-model="selected" :items="items" id-prefix="vertical" orientation="vertical" indicator-side="start" />')
    ], [row('model-value / v-model', 'string', '必填', '选中的 item.id。'), row('items', '{ id: string; label: string; disabled?: boolean; icon?: string }[]', '必填', '标签数据；icon 需用插槽渲染。'), row('id-prefix', 'string', '必填', '每组唯一，与 UiTabPanel 一致。'), row('orientation', "'horizontal' | 'vertical'", 'horizontal', '布局与方向键轴。'), row('variant', "'soft' | 'underline'", 'underline', '标签外观；保留 soft 变体。')], [row('update:modelValue', 'string', '—', '点击或键盘导航时自动激活。')], [row('default', '{ item }', 'item.label', '每个标签的内容。')], ['左右键用于水平布局，上下键用于垂直布局。', '每个 item.id 需唯一，为每个标签提供对应面板。']),
    component('tab-panel', '标签面板', 'UiTabPanel', '与 UiTabs 通过统一前缀关联，隐藏时保留 DOM、组件实例与用户输入。', [
        example('panel-persistence', '切换与状态保留', '在概览面板输入草稿，再切换到详情并返回；草稿仍在。', '<UiTabs v-model="selected" :items="items" id-prefix="draft" />\n<UiTabPanel :model-value="selected" value="overview" id-prefix="draft">\n    <UiInput v-model="draft" aria-label="面板草稿" />\n</UiTabPanel>\n<UiTabPanel :model-value="selected" value="details" id-prefix="draft">详情内容</UiTabPanel>')
    ], [row('model-value', 'string', '必填', '当前选中的标签 id，单向传入。'), row('value', 'string', '必填', '该面板对应的 item.id。'), row('id-prefix', 'string', '必填', '与同组 UiTabs 相同。')], [], [row('default', '—', '—', '面板内容。')], ['使用 v-show 隐藏面板，切换时播放淡入。', '面板具备 role=tabpanel、aria-labelledby 与 tabindex=0。']),
    component('dialog', '弹窗', 'UiDialog', '基于原生 modal 的焦点约束，明确区分“请求关闭”和“真正完成退出”。', [
        example('dialog-lifecycle', '原生弹窗与生命周期', '打开弹窗后尝试 Tab、Esc、遮罩和关闭按钮。状态记录覆盖整个进出过程。', '<UiButton @click="open = true">打开示例弹窗</UiButton>\n<UiDialog v-model:open="open" aria-labelledby="dialog-title" @present-change="present = $event" @closed="closes++">\n    <h2 id="dialog-title">共享弹窗</h2>\n    <UiInput autofocus aria-label="弹窗输入" />\n    <UiButton @click="open = false">关闭弹窗</UiButton>\n</UiDialog>')
    ], [row('open / v-model:open', 'boolean', '必填', '打开状态；false 发起退出。'), row('原生属性', 'DialogHTMLAttributes', '—', 'aria-label / aria-labelledby、class、style 落在 dialog。')], [row('update:open', 'boolean', '—', 'Esc 或遮罩请求关闭。'), row('opened', '无参数', '—', '进入动效完成。'), row('closed', '无参数', '—', '退出完成，native dialog 已关闭并恢复焦点。'), row('present-change', 'boolean', '—', 'true 覆盖进入到退出完成；false 表示顶层释放。')], [row('default', '—', '—', '标题、正文与操作，布局由页面负责。')], ['须提供可访问名称；ref 暴露原生 element。', 'Electron WebContentsView 在 present=true 期间保持隐藏。跳转、打开下一个弹窗和操作结果提示应放在 closed 后。', '快速重开会使过期关闭回调失效。']),
    component('collapse', '折叠区域', 'UiCollapse', '高度与透明度平滑过渡，关闭后立即阻止交互，内容实例继续保留。', [
        example('collapse-content', '展开说明与保留输入', '展开后输入草稿，再收起和展开。草稿保留，收起期间内部输入不会进入 Tab 顺序。', '<UiButton :aria-expanded="expanded" aria-controls="advanced" @click="expanded = !expanded">高级选项</UiButton>\n<UiCollapse id="advanced" :open="expanded">\n    <UiInput v-model="draft" aria-label="高级选项草稿" />\n</UiCollapse>')
    ], [row('open', 'boolean', '必填', '控制展开；组件不自行更改状态。')], [], [row('default', '—', '—', '折叠内容。')], ['触发按钮由页面提供，并设置 aria-expanded / aria-controls。', '关闭时立即 inert、aria-hidden；隐藏不会销毁子组件。']),
    component('snackbar-host', '提示容器', 'UiSnackbarHost', '在应用根部挂载一次，负责全局提示的六方位布局、辅助技术通知与计时暂停。', [
        example('snackbar-playground', '提示游乐场', '选择位置、时长和类型，连续添加提示。悬停或聚焦关闭按钮都会暂停计时。', '<UiSnackbarHost />\n\n// 在任意应用模块中调用\nsnackbar.show(\'更改已保存，可继续工作。\', {\n    position: \'bottom-center\',\n    duration: 6000,\n    tone: \'success\'\n});')
    ], [], [], [], ['无 props、emits 与 slots；提示通过 snackbar 服务创建。', '每个方位最多保留 3 条，超出时移除最早一条并清理计时器。', '普通提示 role=status，错误 role=alert；Host 卸载会清理全部提示。', 'Host 位于文档层；原生 modal 打开期间遵循顶层遮罩。']),
    {
        id: 'snackbar', title: '全局提示服务', name: 'snackbar', kind: 'service', group: '服务',
        description: '用模块单例从任意 JS / TS 文件显示反馈；业务模块无需获得容器 ref。',
        examples: [example('snackbar-service', '创建、撤销与清空', '每次 show 返回数字 id，可按 id 撤销。duration=0 适合必须手动关闭的提示。', "const id = snackbar.show('连接失败，请重试。', {\n    position: 'top-right', duration: 0, tone: 'error'\n});\nsnackbar.dismiss(id);\nsnackbar.clear();\nsnackbar.configure({ position: 'bottom-center', duration: 6000 });")],
        props: [row('position', 'top-left | top-center | top-right | bottom-left | bottom-center | bottom-right', 'bottom-center', '提示方位。'), row('duration', 'number（毫秒）', '6000', '0 表示手动关闭，负数归一为 0。'), row('tone', "'info' | 'success' | 'error'", 'info', '通知语义和状态标记。')],
        events: [row('show(message, options?)', '(string, SnackbarOptions) => number', '—', '显示提示并返回唯一 id。'), row('dismiss(id)', '(number) => void', '—', '移除指定提示与计时器。'), row('clear()', '() => void', '—', '移除全部提示。'), row('configure(options)', '(SnackbarOptions) => void', '—', '更新全局默认值，仅影响之后的提示。')],
        notes: ['指针悬停、键盘焦点分别暂停计时；两者都离开后按剩余时间继续。', '不要在每个业务模块重复挂载 Host；服务不污染 window。', '用户必须处理的错误应在对应字段或页面中持续可见，提示用于补充反馈。']
    },
    {
        id: 'tokens', title: '设计变量', name: 'Design tokens', kind: 'guide', group: '设计基础',
        description: '语义化 CSS 变量连接浅深主题、字体与动效。页面按用途取值，无需记住具体色码。',
        sections: [
            { id: 'palette', title: '颜色与表面', text: '主题选择会更新根元素 data-theme，以下色卡直接使用当前 tokens。色彩传达层级，同时辅以文本和形状表达状态。' },
            { id: 'type', title: '字体与阅读', items: ['--font：系统无衬线与中文字体，用于正文与操作。', '--serif：Georgia 与中文宋体，用于文档标题。', '--mono：Cascadia Code / Consolas，用于源码和技术标识。', '--code-size：默认 13px，代码区支持换行和横向滚动。'] },
            { id: 'layout', title: '布局与间距', text: '组件尺寸取自 styles.css：常规输入与按钮最小高度 36px，紧凑按钮 29px，按钮圆角 8px，弹窗圆角 15px。布局工具类使用 4px 间距步长，支持 0–16 级和方向组合。', code: '.workspace-section {\n    padding: 24px;\n    background: var(--surface);\n    border: 1px solid var(--border);\n    color: var(--text);\n}' },
            { id: 'theme', title: '切换主题', text: '只修改根属性，让共享控件自动使用语义色。局部区域可覆写变量，但不要改写全局控件选择器。', code: "document.documentElement.dataset.theme = 'dark';\n// 切回浅色\ndocument.documentElement.dataset.theme = 'light';" }
        ]
    },
    {
        id: 'accessibility', title: '可访问性', name: 'Accessibility', kind: 'guide', group: '设计基础',
        description: '可访问性来自原生语义、稳定的名称与明确状态，也来自页面正确地组合它们。',
        sections: [
            { id: 'names', title: '每个控件都需要名称', text: '优先使用可见 label。UiField 的 controlAttrs 必须绑定到控件。图标按钮用 aria-label，弹窗用 aria-labelledby 关联可见标题。提示和 placeholder 都不能代替控件名称。', code: '<UiButton icon aria-label="关闭面板"><Icon name="close" /></UiButton>\n<UiDialog v-model:open="open" aria-labelledby="title">\n    <h2 id="title">设置</h2>\n</UiDialog>' },
            { id: 'keyboard', title: '键盘操作', items: ['按钮：Enter / Space；禁用与 loading 时不可触发。', '输入与选择：浏览器原生编辑和选择规则。', '开关：Space 切换，Tab 进入。', '标签页：单一 Tab 入口；方向键自动激活，Home / End 跳转，跳过禁用项。', '弹窗：约束焦点，Esc 请求关闭，退出后恢复触发控件焦点。', '折叠区域：关闭时 inert，内部控件退出可交互范围。'] },
            { id: 'feedback', title: '状态和反馈', text: '错误同时提供文字、边框和语义，避免只靠红色。Snackbar 的错误使用 alert，其余使用 status。保持焦点可见，不用 outline:none 覆盖组件焦点样式。' },
            { id: 'verify', title: '页面验收', items: ['仅用键盘完成主要任务，确认焦点顺序符合阅读顺序。', '检查名称、描述、aria-invalid 及 Tabs / Panel ID 配对。', '200% 缩放下仍能读取、操作，代码与 API 表允许滚动。', '浅深主题与减少动效均可用，重要内容不依赖动画显现。'] }
        ]
    },
    {
        id: 'motion', title: '动效与生命周期', name: 'Motion & lifecycle', kind: 'guide', group: '设计基础',
        description: '动效帮助理解状态变化；生命周期信号用于协调真正的操作时机。',
        sections: [
            { id: 'rhythm', title: '三种节奏', items: ['--motion-fast：140ms，快速状态反馈。', '--motion-normal：180ms，标签面板与折叠状态。', '--motion-layout：240ms，预留布局节奏。', '--ease：cubic-bezier(.2, .7, .2, 1)，统一过渡曲线。'], text: '控件 hover / focus 与 Snackbar 使用轻量过渡；弹窗进入 180ms、退出 140ms。具体实现以共享样式为准，避免为流式文本逐 token 播放动画。' },
            { id: 'reduced', title: '尊重减少动效', text: '系统 prefers-reduced-motion 或应用 data-reduced-motion="true" 任一启用，都关闭非必要动效。使用下面的真实开关试验。', demo: 'motion-toggle', code: "document.documentElement.dataset.reducedMotion = 'true';" },
            { id: 'lifecycle', title: '等待真正关闭', text: 'open=false 是关闭请求，closed 才代表原生弹窗已释放顶层且焦点恢复。present-change 在进入开始发出 true、退出结束发出 false。嵌入视图的隐藏和恢复必须跟随 present 信号。', code: '<UiDialog v-model:open="open"\n    @present-change="embeddedViewHidden = $event"\n    @closed="completeAction"\n>\n    <!-- 内容 -->\n</UiDialog>' },
            { id: 'persistence', title: '保留阅读与输入状态', text: 'UiTabPanel 和 UiCollapse 保留子组件实例。切换时让用户继续原来的草稿与阅读任务；业务页面自行决定何时清理状态。' }
        ]
    }
];

export const groups = ['开始使用', '操作组件', '表单组件', '导航组件', '容器组件', '反馈组件', '内容组件', '服务', '设计基础'];
export const tokens = [
    ['--background', '页面背景'], ['--sidebar', '侧栏背景'], ['--surface', '内容表面'], ['--soft', '轻量表面'],
    ['--text', '主要文字'], ['--muted', '次要文字'], ['--border', '边框'], ['--accent-text', '强调文字'],
    ['--accent', '主要动作'], ['--accent-soft', '强调背景'], ['--green', '成功'], ['--red', '错误'],
    ['--code-keyword', '代码关键字'], ['--code-string', '代码字符串'], ['--code-tag', '代码标签'],
    ['--code-number', '代码数字'], ['--code-comment', '代码注释'], ['--code-property', '代码属性']
];


pages.push(
    component('card', '卡片', 'UiCard', '把标题、内容和操作组织成明确的容器，统一表单、标签页与操作区的内边距。', [
        example('card-form', '卡片中的表单', '标题与说明、字段、底部操作各有稳定的区域。紧凑密度适用于侧栏。', '<UiCard title="工作区偏好" subtitle="保存当前工作区的显示选项。">\n    <UiField v-slot="{ controlAttrs }" label="名称" for="card-name"><UiInput v-model="name" v-bind="controlAttrs" /></UiField>\n    <template #actions><UiButton variant="ghost">取消</UiButton><UiButton variant="primary">保存</UiButton></template>\n</UiCard>'),
        example('card-variants', '表面与布局', 'outlined、elevated、tonal 与 flat；使用 flush 让 Tabs、代码块或媒体对齐卡片边缘。', '<div class="d-flex flex-wrap ga-4">\n    <UiCard v-for="variant in [\'outlined\', \'elevated\', \'tonal\', \'flat\']" :key="variant" :variant="variant" density="compact" :title="variant">同一套内容与间距。</UiCard>\n</div>')
    ], [row('title / subtitle', 'string', 'undefined', '标题与说明。'), row('variant', 'outlined | elevated | tonal | flat', 'outlined', '容器表面。'), row('density', 'comfortable | compact', 'comfortable', '内边距 24px / 16px。'), row('flush', 'boolean', 'false', '内容区无内边距，适用于 Tabs 或媒体。'), row('as', 'string', 'section', '语义容器标签。')], [], [row('header / media / default / actions', 'slot', '—', '标题、媒体、内容、底部操作。')], ['为 section 提供可访问名称，例如 aria-label 或 aria-labelledby。', '卡片本身不是按钮；可点击动作使用真正按钮，避免嵌套交互。']),
    component('scroll-area', '滚动区域', 'UiScrollArea', '统一细滚动条样式，保留浏览器原生滚轮、触摸、文本选择和键盘滚动。', [
        example('scroll-content', '受限高度与键盘滚动', '聚焦后使用方向键或 PageDown；滚动条在整个应用中使用同一份样式。', '<UiScrollArea label="运行日志" max-height="220px">\n    <p v-for="line in 24" :key="line" class="px-4 py-2 ma-0">日志 {{ line }} · 等待任务</p>\n</UiScrollArea>')
    ], [row('label', 'string', '必填', '可访问区域名称。'), row('max-height', 'CSS length', 'undefined', '最大高度。'), row('axis', 'vertical | horizontal | both', 'vertical', '滚动方向。')], [], [row('default', 'slot', '—', '滚动内容。')], ['ref 暴露 element 和 scrollTo(options)。', '全局原生滚动条无需额外包裹组件；使用本组件声明局部滚动区域。']),
    component('code-block', '代码块', 'UiCodeBlock', '用语法颜色区分标签、属性、字符串和关键字，支持浅深主题、复制与换行。', [
        example('code-highlight', 'Vue 语法高亮', '源码作为字符串展示，绝不执行；复制得到不含高亮标签的原始文本。', '<UiCodeBlock :code="source" language="vue" />')
    ], [row('code', 'string', '必填', '原始源码字符串。'), row('language', 'vue | html | javascript | typescript | css | json', 'vue', '按需注册的语法；未知语言安全回退到纯文本。')], [], [], ['支持真实 Vue SFC 的 script/template/style 高亮。', '代码区最大高度 580px；横向溢出可滚动或手动启用换行。'])
);
pages.push(
    { id: 'ripple', title: '涟漪反馈', name: 'vRipple', group: '设计基础', kind: 'guide', description: '按下位置产生扩散反馈，松开后淡出；与原生点击和键盘行为分离。', sections: [
        { id: 'demo', title: '指针与键盘', demo: 'ripple-feedback', text: '按钮和 Tabs 默认启用。可关闭，或居中扩散并指定颜色；禁用控件和减少动效不产生涟漪。', code: "import { vRipple } from '@lingyzh/ui';\n// 在 script setup 中导入后可直接使用 v-ripple\n<UiButton :ripple=\"{ center: true }\">居中反馈</UiButton>\n<button v-ripple class=\"pa-4\">原生按钮</button>" },
        { id: 'contract', title: '使用契约', items: ['UiButton / UiTabs：ripple 为 false 或 { center?: boolean, color?: string }。', 'v-ripple 只负责视觉；原生元素须自行提供按钮语义、键盘操作与名称。', '支持 pointerup、pointercancel、失焦和键盘 Enter / Space；重复按键不叠加涟漪，卸载时清理监听与动画。', '不改变控件 overflow，避免裁切焦点和 Tabs 指示条。'] }
    ] },
    { id: 'utilities', title: '布局工具类', name: 'Utilities', group: '设计基础', kind: 'guide', description: '用预制 class 组合常见布局和间距，让卡片、表单与操作区保持一致。', sections: [
        { id: 'demo', title: '组合布局', demo: 'utility-layout', code: '<div class="d-flex align-center justify-space-between ga-4 pa-4">\n    <span class="flex-grow-1">工作区</span>\n    <UiButton size="sm">打开</UiButton>\n</div>' },
        { id: 'spacing', title: '间距：每级 4px', items: ['ma-0 … ma-16 / pa-0 … pa-16：所有方向；1 = 4px，4 = 16px。', 'x / y：水平/垂直；t / b / l / r：单边；s / e：逻辑起始/结束边。示例 mx-2、pt-2、pe-4。', 'margin 支持 auto，例如 ms-auto、mx-auto。ga-0 … ga-16 用于 gap。', '工具类使用 !important 明确覆盖组件布局；不承诺兼容 Vuetify 全量工具类。'] },
        { id: 'layout', title: '布局与断点', items: ['d-flex / d-inline-flex / d-grid / d-block / d-none。', 'flex-row / flex-column / flex-wrap / flex-nowrap / flex-grow-1 / flex-shrink-0。', 'align-start/center/end；justify-start/center/end/space-between。', 'w-100 / h-100 / min-w-0 / overflow-auto/hidden / text-start/center/end/muted。', 'sm ≥ 600px、md ≥ 960px、lg ≥ 1280px：显示与 flex 方向支持断点，例如 d-none d-md-flex、flex-column flex-sm-row。'] }
    ] }
);

const selectStates = pages.find((page) => page.id === 'select').examples.find((entry) => entry.id === 'select-states');
selectStates.code = `<UiField v-slot="{ controlAttrs }" label="需要选择的项目" for="project" :error="project ? '' : '请选择项目。'">
    <UiSelect v-model="project" v-bind="controlAttrs" :invalid="!project"><option value="">请选择项目</option><option value="uah">UAH 工作台</option></UiSelect>
</UiField>
<UiSelect model-value="unavailable" disabled aria-label="不可用的选择"><option value="unavailable">尚未启用</option></UiSelect>`;
pages.find((page) => page.id === 'select').props.push(row('blur-on-select', 'boolean', 'true', '指针选择后释放焦点；键盘操作保留焦点，可设 false 保持指针焦点。'));
pages.find((page) => page.id === 'select').notes.push('不传模型时默认选择首项；显式传空值的受控模型仍由调用方决定占位项。');
for (const id of ['button', 'tabs']) pages.find((page) => page.id === id).props.push(row('ripple', 'boolean | { center?: boolean; color?: string }', 'true', '启用涟漪，可指定居中与颜色。'));
pages.find((page) => page.id === 'tabs').props.push(row('indicator-side', "'start' | 'end'", 'end', '垂直指示条所在的逻辑边；LTR 下 start 在左、end 在右，RTL 相反。水平布局保持底部。'));
pages.find((page) => page.id === 'tabs').notes.push('垂直 Tabs 的内容在左侧时设置 indicator-side=\"start\"，在右侧时使用默认 end。');
const scrollingPage = pages.find((page) => page.id === 'scroll-area');
scrollingPage.description = '透明轨道与悬浮圆角滑块，悬停、聚焦或滚动时显示；内容仍使用浏览器原生滚动。';
scrollingPage.examples.push(example('scroll-horizontal', '横向滑块与常显', '拖动滑块或点击轨道跳转。always 可保持滑块显示，无溢出时自动隐藏。', '<UiScrollArea label="横向项目" axis="horizontal" always><div class="d-flex ga-4 pa-4" style="width: max-content"><UiCard v-for="item in 12" :key="item" :title="`项目 ${item}`" density="compact" style="width: 160px">水平拖动查看。</UiCard></div></UiScrollArea>'));
scrollingPage.props.push(row('height', 'CSS length', 'undefined', '固定视口高度；不传时按内容自适应。'), row('always', 'boolean', 'false', '有溢出时始终显示滑块。'));
scrollingPage.events = [row('scroll', '{ scrollTop, scrollLeft }', '—', '原生滚动位置同步。')];
scrollingPage.notes = ['ref 暴露实际 viewport element、focus()、scrollTo(options)、update()。', '滑块支持拖动、点击轨道、pointercancel 与卸载清理；ResizeObserver 同步内容尺寸。', '原生区域共享细圆角透明轨道样式；本组件提供不占布局空间的悬浮滑块。', '代码块直接复用本组件，键盘操作由带名称的滚动区域承接。'];
for (const id of ['button', 'input', 'select', 'tabs', 'card', 'scroll-area', 'code-block']) {
    pages.find((page) => page.id === id).props.push(row('dense', 'boolean', 'false', '统一紧凑密度；与 size=sm、compact、density=compact 兼容。'), row('ghost', 'boolean', 'false', '透明轻量表面，保留交互、焦点及错误状态。'), row('rounded', 'boolean', 'true', '设为 false 去掉圆角。'));
    const page = pages.find((page) => page.id === id);
    const samples = {
        button: '<UiButton ATTR>保存更改</UiButton>',
        input: '<UiInput model-value="UAH" aria-label="工作区名称" ATTR />',
        select: '<UiSelect model-value="UAH" aria-label="工作区" ATTR><option value="UAH">UAH 工作台</option></UiSelect>',
        tabs: '<UiTabs v-model="selected" :items="items" id-prefix="sample-KEY" ATTR />\n<UiTabPanel v-for="item in items" :key="item.id" :model-value="selected" :value="item.id" id-prefix="sample-KEY">{{ item.label }}内容</UiTabPanel>',
        card: '<UiCard title="工作区" ATTR>项目、文件与最近使用的内容。</UiCard>',
        'scroll-area': '<UiScrollArea label="运行日志" height="120px" always ATTR><p v-for="line in 10" :key="line" class="pa-3 ma-0">日志 {{ line }}</p></UiScrollArea>',
        'code-block': '<UiCodeBlock code="const saved = true;" language="javascript" ATTR />'
    };
    const source = ['', 'dense', 'ghost', ':rounded="false"'].map((attrs, index) => samples[id].replace('ATTR', attrs).replaceAll('KEY', String(index))).join('\n');
    page.examples.push(example(`${id}-shared-variants`, '密度、透明与直角变体', '分别比较默认、dense、ghost 和 rounded=false；每个示例使用真实组件，可独立操作。', source));
    page.notes.push('本页提供各变体的独立示例；跨组件组合见“统一样式变体”文档。');
}
pages.push({ id: 'variants', title: '统一样式变体', name: 'Variants', group: '设计基础', kind: 'guide', description: '用同一组属性控制适用组件的密度、表面与圆角。', sections: [
    { id: 'playground', title: '组合预览', demo: 'style-variants', code: '<UiCard dense ghost :rounded="false">\n    <UiInput v-model="name" dense ghost :rounded="false" aria-label="名称" />\n    <UiButton dense ghost :rounded="false">操作</UiButton>\n</UiCard>' },
    { id: 'scope', title: '支持范围', items: ['按钮、输入框、选择器、Tabs、Card、代码块、滚动区域、表格、服务端表格及分页器支持 dense、ghost、rounded；各自页面提供变体演示。', 'dense 缩小控件高度、内边距或滚动滑块宽度；不缩小字体到不可读尺寸。', 'ghost 使用透明表面；输入框聚焦和错误状态仍有明确边框。', 'rounded=false 去除组件圆角，包含 Tabs 指示条和滚动滑块。', '开关、弹窗、Snackbar 等保留表达状态所需的既定形态，不机械套用透明表面。'] }
] });
pages.push(...tablePages);
// The source view is a runnable Vue usage example, not an HTML facsimile.
const state = {
    'select-states': "const project = ref('');",
    'card-form': "const name = ref('UAH');",
    'code-highlight': "const source = '<template><UiButton>保存</UiButton></template>';",
    'button-variants': "function save() { snackbar.show('更改已保存。', { tone: 'success' }); }",
    'button-states': "const saving = ref(false);\nfunction save() {\n    if (saving.value) return;\n    saving.value = true;\n    setTimeout(() => { saving.value = false; }, 1400);\n}",
    'input-search': "const input = ref();\nconst query = ref('');",
    'select-values': "const size = ref(13);\nconst density = ref('comfortable');",
    'switch-preference': "const reduced = ref(false);\nwatch(reduced, (value) => {\n    document.documentElement.dataset.reducedMotion = String(value);\n});",
    'switch-states': 'const enabled = ref(true);',
    'field-validation': "const name = ref('');\nconst error = ref('');",
    'tabs-shared-variants': "const selected = ref('overview');\nconst items = [{ id: 'overview', label: '概览' }, { id: 'details', label: '详情' }];",
    'tabs-soft': "const selected = ref('overview');\nconst items = [\n    { id: 'overview', label: '概览' },\n    { id: 'unavailable', label: '尚未启用', disabled: true },\n    { id: 'details', label: '详情' }\n];",
    'tabs-variants': "const selected = ref('overview');\nconst items = [\n    { id: 'overview', label: '概览', icon: 'book' },\n    { id: 'details', label: '详情', icon: 'file' }\n];",
    'panel-persistence': "const selected = ref('overview');\nconst draft = ref('');\nconst items = [\n    { id: 'overview', label: '概览' },\n    { id: 'details', label: '详情' }\n];",
    'dialog-lifecycle': 'const open = ref(false);\nconst present = ref(false);\nconst closes = ref(0);',
    'collapse-content': "const expanded = ref(false);\nconst draft = ref('');"
};
for (const page of pages.filter((entry) => entry.kind === 'component')) {
    for (const entry of page.examples) {
        if (entry.id === 'snackbar-playground' || entry.fullSource) continue;
        const imports = [...new Set(entry.code.match(/Ui[A-Z]\w+/g) || [])];
        if (entry.id === 'button-variants') imports.push('snackbar');
        const iconImport = entry.code.includes('<Icon') ? "\nimport Icon from './components/Icon.vue';" : '';
        const vueImport = state[entry.id] ? `import { ref${entry.id === 'switch-preference' ? ', watch' : ''} } from 'vue';\n` : '';
        if (entry.id === 'tabs-soft') entry.code += '\n<UiTabPanel :model-value="selected" value="unavailable" id-prefix="example">尚未启用</UiTabPanel>';
        if (entry.id === 'tabs-variants') entry.code += '\n<UiTabPanel v-for="item in items" :key="item.id" :model-value="selected" :value="item.id" id-prefix="tools">{{ item.label }}内容</UiTabPanel>\n<UiTabPanel v-for="item in items" :key="item.id" :model-value="selected" :value="item.id" id-prefix="vertical">{{ item.label }}内容</UiTabPanel>';
        if (entry.id === 'tabs-variants') imports.push('UiTabPanel');
        entry.code = `<script setup>\n${vueImport}import { ${imports.join(', ')} } from '@lingyzh/ui';${iconImport}${state[entry.id] ? `\n${state[entry.id]}` : ''}\n<\/script>\n\n<template>\n${entry.code.split('\n').map((line) => `    ${line}`).join('\n')}\n</template>`;
    }
}

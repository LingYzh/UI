// Component examples and their visual composition are authored by root.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { parse as parseSfc } from '@vue/compiler-sfc';
import { parse as parseTemplate } from '@vue/compiler-dom';
import ts from 'typescript';
import { formatDemoSource } from './demo-source-format.mjs';
import { completionPages } from '../src/ui/docs/completionContent.js';

const directory = new URL('../src/ui/docs/component-examples/', import.meta.url);
await mkdir(directory, { recursive: true });
const sourceFamilies = ['Form', 'Layout', 'Data', 'Experience'];
const families = await Promise.all(sourceFamilies.map(async name => {
    const source = await readFile(new URL(`../src/ui/docs/${name}CompletionDemo.vue`, import.meta.url), 'utf8');
    const descriptor = parseSfc(source).descriptor;
    return { script: descriptor.scriptSetup.content, template: descriptor.template.content, tree: parseTemplate(descriptor.template.content) };
}));
const overrides = {};
function define(name, template, script = '') { overrides[name] = { template, script }; }
function defineMany(names, template, script = '') { for (const name of names) define(name, template, script); }

define('USelectionControl', '<USelectionControl v-model="checked" type="checkbox" label="接收通知" /><output>当前值：{{ checked }}</output>', 'const checked = ref(false);');
define('UItem', '<UItemGroup v-model="selected" mandatory><UItem value="a">概览</UItem><UItem value="b">详情</UItem></UItemGroup><output>当前值：{{ selected }}</output>', "const selected = ref('a');");
define('UChip', '<UChip closable tone="accent" @close="visible = false" v-if="visible">组件文档</UChip><UButton v-else size="sm" @click="visible = true">恢复标签</UButton>', 'const visible = ref(true);');
define('ULabel', '<ULabel for="custom-label-demo" required>自定义输入名称</ULabel><input id="custom-label-demo" class="completion-native-input" v-model="text" />', "const text = ref('');");
define('UMessages', '<UButton size="sm" @click="error = !error">切换错误消息</UButton><UMessages :error="error" :messages="error ? [\'请检查输入内容。\'] : [\'配置已保存。\']" />', 'const error = ref(false);');
define('UCounter', '<UTextField v-model="text" label="名称" /><UCounter :value="text.length" :max="20" />', "const text = ref('');");
define('UValidation', '<UValidation ref="validation" v-model="custom" :rules="[required]" v-slot="{ errors, validate }"><UTextField v-model="custom" label="自定义内容" /><UButton @click="validate">验证</UButton><UMessages :messages="errors" error /></UValidation>', "const custom = ref('');\nconst required = value => !!value || '请填写此项。';");
define('UDefaultsProvider', '<UDefaultsProvider :defaults="{ UTextField: { density: \'compact\', variant: \'filled\' } }"><UTextField v-model="text" label="继承紧凑、填充样式" hint="默认配置只作用于这个容器。" /></UDefaultsProvider>', "const text = ref('');");
define('ULocaleProvider', '<ULocaleProvider locale="en"><UPagination v-model="page" :length="5" label="English pagination" /></ULocaleProvider><output>当前页：{{ page }}</output>', 'const page = ref(2);');

const appBar = '<UAppBar :height="48"><UAppBarTitle>应用顶栏</UAppBarTitle></UAppBar>';
const main = '<UMain><p class="pa-4">主要内容自动避开已注册的栏。</p></UMain>';
defineMany(['UApp', 'ULayout', 'UMain', 'UAppBar', 'UAppBarTitle'], `<div class="completion-layout"><UApp>${appBar}${main}</UApp></div>`);
define('ULayout', `<div class="completion-layout"><ULayout>${appBar}${main}</ULayout></div>`);
defineMany(['UToolbar', 'UToolbarTitle', 'UToolbarItems'], "<UToolbar><UToolbarTitle>工作区</UToolbarTitle><UToolbarItems><UButton size=\"sm\" variant=\"text\" @click=\"action++\">刷新</UButton></UToolbarItems></UToolbar><output>已刷新 {{ action }} 次</output>", 'const action = ref(0);');
define('UFooter', '<div class="completion-layout"><ULayout><UMain><p class="pa-4">页脚占位由 Main 自动处理。</p></UMain><UFooter fixed :height="40">固定页脚</UFooter></ULayout></div>');
define('USystemBar', `<div class="completion-layout"><ULayout><USystemBar :height="28">本地工作区 <span class="ms-auto">在线</span></USystemBar>${main}</ULayout></div>`);
define('UNavigationDrawer', '<div class="demo-row"><UButton size="sm" @click="drawer = !drawer">切换抽屉</UButton><USwitch v-model="temporary" label="临时抽屉" /></div><div class="completion-layout"><ULayout><UNavigationDrawer v-model="drawer" :temporary="temporary" :width="160" :mobile-breakpoint="600"><UList><UListItem title="概览" /><UListItem title="配置" /></UList></UNavigationDrawer><UMain><p class="pa-4">面板滑动与遮罩淡入淡出同步，关闭后内容填满剩余空间。</p></UMain></ULayout></div>', 'const drawer = ref(true);\nconst temporary = ref(false);');

const list = '<UList v-model="selected"><UListItem value="overview" title="概览" subtitle="项目运行状况" /><UListItem value="settings" title="设置" /><UListItem value="disabled" title="归档" disabled /></UList><output>已选：{{ selected }}</output>';
defineMany(['UList', 'UListItem'], list, "const selected = ref('overview');");
define('UListItem', "<USwitch v-model=\"ripple\" label=\"启用列表项涟漪\" /><UList v-model=\"selected\"><UListItem :ripple=\"ripple\" value=\"overview\" title=\"概览\" subtitle=\"快速点击后反馈仍完整淡出\" /><UListItem :ripple=\"ripple\" value=\"settings\" title=\"设置\"><template #append><UButton size=\"sm\" variant=\"text\" @click=\"appendCount++\">独立操作</UButton></template></UListItem><UListItem :ripple=\"ripple\" value=\"quiet-action\" title=\"带无涟漪按钮的列表项\"><template #append><UButton size=\"sm\" variant=\"text\" :ripple=\"false\" @click=\"appendCount++\">无涟漪操作</UButton></template></UListItem><UListItem :ripple=\"ripple\" value=\"notifications\" title=\"列表内选择控件\"><template #append><UCheckbox v-model=\"notifications\" :ripple=\"ripple\">通知</UCheckbox></template></UListItem><UListItem :ripple=\"false\" value=\"quiet\" title=\"此项关闭涟漪\" /><UListItem :ripple=\"ripple && { center: true, color: 'var(--accent-text)' }\" value=\"center\" title=\"居中主题色反馈\" /><UListItem value=\"disabled\" title=\"归档\" disabled /></UList><output>已选：{{ selected }} · 独立操作：{{ appendCount }} 次</output>", "const selected = ref('overview');\nconst ripple = ref(true);\nconst appendCount = ref(0);\nconst notifications = ref(false);");
define('UListGroup', "<div class=\"demo-row\"><UButton size=\"sm\" @click=\"opened = ['settings', 'advanced']\">展开全部</UButton><UButton size=\"sm\" @click=\"opened = []\">收起全部</UButton></div><UList v-model:opened=\"opened\"><UListGroup value=\"settings\" title=\"配置\"><UListItem value=\"models\" title=\"模型配置\" /><UListItem value=\"permissions\" title=\"权限配置\" /><UTextField v-model=\"name\" label=\"分组内名称\" hint=\"收起再展开，输入内容保持。\" /><UListGroup value=\"advanced\" title=\"高级配置\"><UListItem title=\"日志与诊断\" /></UListGroup></UListGroup><UListGroup value=\"custom\"><template #activator=\"{ props }\"><UButton v-bind=\"props\" variant=\"text\">自定义分组触发器<UIcon name=\"mdi-chevron-down\" class=\"ui-disclosure-icon is-down\" :class=\"{ 'is-open': props['aria-expanded'] }\" /></UButton></template><UListItem title=\"自定义分组内容\" /></UListGroup><UListGroup value=\"disabled\" title=\"禁用分组\" disabled><UListItem title=\"不可展开\" /></UListGroup></UList><output>展开项：{{ opened.join('、') || '无' }}</output>", "const opened = ref([]);\nconst name = ref('工作区');");
define('UListSubheader', '<UList><UListSubheader>当前工作区</UListSubheader><UListItem title="设计工作区" /><UListSubheader>归档</UListSubheader><UListItem title="历史工作区" disabled /></UList>');
defineMany(['UListItemTitle', 'UListItemSubtitle'], '<UList><UListItem><UListItemTitle>设计工作区</UListItemTitle><UListItemSubtitle>自定义列表项标题与说明</UListItemSubtitle></UListItem></UList>');
define('UAvatar', '<div class="demo-row"><UAvatar text="AY" /><UAvatar icon="mdi-account-outline" :size="32" /><UAvatar text="UI" :rounded="false" :size="32" /></div>');
define('UBadge', '<div class="demo-row"><UBadge :model-value="visible" :content="count" :max="99"><UButton @click="count += 10">消息</UButton></UBadge><UBadge :model-value="visible" dot><UAvatar text="UI" /></UBadge><UButton size="sm" @click="visible = !visible">切换徽标</UButton></div><output>消息数：{{ count }}</output>', 'const count = ref(90);\nconst visible = ref(true);');
define('UDivider', '<p>第一段内容</p><UDivider /><p>分隔线后的内容</p><div class="demo-row"><span>左侧</span><UDivider vertical /><span>右侧</span></div>');
define('USheet', '<USheet border class="pa-4">带边框的表面容器</USheet><USheet color="var(--accent-soft)" class="pa-4">使用主题色的表面容器</USheet>');
define('USkeletonLoader', '<USkeletonLoader type="avatar" /><USkeletonLoader :lines="3" />');
define('UBanner', "<UBanner v-model=\"banner\" text=\"配置已同步。\" icon=\"mdi-information-outline\"><template #actions><UButton size=\"sm\" variant=\"text\" @click=\"banner = false\">知道了</UButton></template></UBanner><UButton v-if=\"!banner\" size=\"sm\" @click=\"banner = true\">重新显示提示</UButton>", 'const banner = ref(true);');
define('UTransition', '<div class="demo-row"><UButton size="sm" @click="expanded = !expanded">切换展开</UButton><UButton size="sm" @click="lines++">增加内容</UButton></div><div class="demo-row"><USwitch v-model="disabled" label="禁用过渡" /><USwitch :model-value="reduced" label="减少动态效果" @update:model-value="updateReduced" /></div><UTransition variant="expand" :disabled="disabled"><div v-show="expanded" class="completion-panel" style="overflow: visible; min-height: 72px"><strong>带内边距和边框的内容</strong><p v-for="line in lines" :key="line">第 {{ line }} 行：快速切换会从当前高度继续，过渡结束恢复自动尺寸。</p><UTextField v-model="name" label="面板内名称" /></div></UTransition>', "const expanded = ref(true);\nconst disabled = ref(false);\nconst reduced = ref(document.documentElement.dataset.reducedMotion === 'true');\nconst lines = ref(1);\nconst name = ref('保持内容');\nfunction updateReduced(value) { reduced.value = value; document.documentElement.dataset.reducedMotion = String(value); }");
defineMany(['UBreadcrumbs', 'UBreadcrumbsItem'], '<UBreadcrumbs aria-label="项目路径"><UBreadcrumbsItem href="#/overview" title="文档" /><UBreadcrumbsItem title="当前项目" active /></UBreadcrumbs>');
define('UBreadcrumbsDivider', '<ol class="demo-row"><li>文档</li><UBreadcrumbsDivider /><li>当前项目</li></ol>');
define('UBottomNavigation', "<UBottomNavigation v-model=\"bottom\"><template #default=\"{ selected, select }\"><UButton v-for=\"value in ['overview', 'search', 'settings']\" :key=\"value\" variant=\"text\" :aria-current=\"selected === value ? 'page' : undefined\" @click=\"select(value)\">{{ { overview: '概览', search: '搜索', settings: '设置' }[value] }}</UButton></template></UBottomNavigation><output>当前：{{ bottom }}</output>", "const bottom = ref('overview');");
define('UOverlay', "<UButton @click=\"open = true\">打开浮层</UButton><UOverlay v-model=\"open\" :width=\"360\" v-slot=\"{ close }\"><h3>通用浮层</h3><p>Escape 或点击外部关闭，退出动画完成后恢复焦点和滚动。</p><div class=\"demo-row\"><UButton @click=\"close\">关闭</UButton><UButton variant=\"text\" @click=\"reopen\">快速重开</UButton></div></UOverlay>", 'const open = ref(false);\nfunction reopen() { open.value = false; requestAnimationFrame(() => { open.value = true; }); }');
define('UDataTable', '<UButton size="sm" @click="groups = groups.length ? [] : [{ key: \'category\', order: \'asc\' }]">切换分组</UButton><UDataTable v-model="selected" v-model:expanded="expanded" v-model:group-by="groups" :headers="headers" :items="items" :search="search" show-select show-expand multi-sort label="工作区列表"><template #expanded-row="{ item }"><strong>{{ item.title }}</strong><p>{{ item.category }} · 详情内容随高度平滑展开、收起。</p></template></UDataTable>', "const headers = [{ key: 'title', title: '工作区', sortable: true }, { key: 'category', title: '分类', sortable: true }, { key: 'count', title: '任务数', sortable: true, align: 'end' }];\nconst items = Array.from({ length: 60 }, (_, index) => ({ id: index, title: `工作区 ${index + 1}`, category: index % 2 ? '设计' : '开发', count: index * 7 % 31 }));\nconst search = ref('');\nconst selected = ref([]);\nconst expanded = ref([]);\nconst groups = ref([]);");
define('UBottomSheet', '<UButton @click="open = true">打开底部面板</UButton><UBottomSheet v-model="open"><h3>底部操作面板</h3><p>适合移动设备上的次要操作。</p><UButton @click="open = false">完成</UButton></UBottomSheet>', 'const open = ref(false);');

define('UDateInput', '<UDateInput v-model="date" label="开始日期" hint="输入 ISO 日期或打开日历选择。" /><output>当前日期：{{ date }}</output>', "const date = ref('2026-10-06');");
define('UTimePicker', '<UTimePicker v-model="time" label="执行时间" /><output>当前时间：{{ time }}</output>', "const time = ref('09:30');");
define('UConfirmEdit', '<UConfirmEdit v-model="title" v-slot="{ model }"><UTextField v-model="model.value" label="编辑名称" /></UConfirmEdit><output>已确认：{{ title }}</output>', "const title = ref('工作区名称');");
define('UProgressCircular', '<div class="demo-row"><UProgressCircular :model-value="progress" label="确定进度" v-slot="{ value }">{{ value }}</UProgressCircular><UProgressCircular indeterminate label="处理中" /><UButton size="sm" @click="progress = (progress + 20) % 120">增加进度</UButton></div>', 'const progress = ref(40);');
define('UProgressLinear', '<UProgressLinear :model-value="progress" :buffer-value="80" label="后台执行进度" /><UProgressLinear indeterminate label="等待服务" /><UButton size="sm" @click="progress = (progress + 20) % 120">增加进度</UButton>', 'const progress = ref(40);');

const panels = '<UExpansionPanels v-model="panel"><UExpansionPanel value="overview"><UExpansionPanelTitle>组件说明</UExpansionPanelTitle><UExpansionPanelText>点击标题、Enter 或 Space 展开。</UExpansionPanelText></UExpansionPanel><UExpansionPanel value="details"><UExpansionPanelTitle>更多说明</UExpansionPanelTitle><UExpansionPanelText>面板间由组统一管理展开状态。</UExpansionPanelText></UExpansionPanel></UExpansionPanels>';
defineMany(['UExpansionPanels', 'UExpansionPanel', 'UExpansionPanelTitle', 'UExpansionPanelText'], panels, "const panel = ref('overview');");
const steps = '<UStepper v-model="step"><UStepperItem :value="1" title="填写资料" :complete="step > 1" editable /><UStepperItem :value="2" title="完成" editable /><UStepperWindow><UStepperWindowItem :value="1">填写当前步骤所需的资料。</UStepperWindowItem><UStepperWindowItem :value="2">资料已准备好。</UStepperWindowItem></UStepperWindow><UStepperActions /></UStepper>';
defineMany(['UStepper', 'UStepperItem', 'UStepperWindow', 'UStepperWindowItem', 'UStepperActions'], steps, 'const step = ref(1);');
define('UStepperVertical', steps.replaceAll('UStepper ', 'UStepperVertical ').replaceAll('</UStepper>', '</UStepperVertical>'), 'const step = ref(1);');
defineMany(['UWindow', 'UWindowItem'], '<UButton size="sm" @click="windowValue = windowValue === \'a\' ? \'b\' : \'a\'">切换面板</UButton><UWindow v-model="windowValue" continuous label="内容窗口"><UWindowItem value="a"><div class="completion-window-card">概览面板</div></UWindowItem><UWindowItem value="b"><div class="completion-window-card">详情面板</div></UWindowItem></UWindow>', "const windowValue = ref('a');");
defineMany(['UCarousel', 'UCarouselItem'], '<UCarousel v-model="carousel" :cycle="false" label="内容轮播"><UCarouselItem v-for="value in [1, 2, 3]" :key="value" :value="value"><div class="completion-window-card">第 {{ value }} 项</div></UCarouselItem></UCarousel>', 'const carousel = ref(1);');
define('UResponsive', '<UResponsive aspect-ratio="2/1"><div class="completion-window-card">2 : 1 的内容区域</div></UResponsive>');
define('UHover', '<UHover v-slot="{ isHovering, props: hoverProps }"><div v-bind="hoverProps" class="completion-panel" :style="{ background: isHovering ? \'var(--accent-soft)\' : \'var(--surface)\' }">{{ isHovering ? \'指针或键盘位于此区域\' : \'移入或聚焦查看状态\' }}<UButton size="sm" class="mt-3">可聚焦的操作</UButton></div></UHover>');
define('UHotkey', '<UHotkey keys="ctrl+shift+k" @trigger="hotkey++"><UKbd keys="Ctrl + Shift + K" /></UHotkey><output>快捷键触发 {{ hotkey }} 次</output>', 'const hotkey = ref(0);');
define('UKbd', '<div class="demo-row"><UKbd keys="Ctrl + K" /><UKbd keys="Enter" /><UKbd keys="Escape" /></div>');
define('UPullToRefresh', '<UPullToRefresh style="max-height:240px" @refresh="refresh"><p>触屏下拉刷新，已刷新 {{ refreshed }} 次。</p><ul><li v-for="item in 6" :key="item" class="py-2">示例记录 {{ item }}</li></ul></UPullToRefresh>', 'const refreshed = ref(0);\nfunction refresh({ done }) { refreshed.value++; done(); }');
define('UFab', '<div class="demo-row"><UFab label="新建项目" @click="count++" /><output>已新建 {{ count }} 次</output></div>', 'const count = ref(0);');
define('USpeedDial', '<USpeedDial v-model="dial"><template #activator="{ props: activatorProps }"><UFab v-bind="activatorProps" label="打开快捷操作" /></template><UButton size="sm" @click="action = \'已新建项目\'">新建项目</UButton><UButton size="sm" @click="action = \'已导出配置\'">导出配置</UButton></USpeedDial><output role="status">{{ action }}</output>', "const dial = ref(false);\nconst action = ref('尚未执行');");
defineMany(['UTimeline', 'UTimelineItem'], '<UTimeline side="alternate"><UTimelineItem title="完成盘点" subtitle="09:00">确认组件和使用接口。</UTimelineItem><UTimelineItem title="组件实现" subtitle="10:00">编写真实模板与交互示例。</UTimelineItem></UTimeline>');

const supportingStyle = {
    'completion-native-input': '.completion-native-input { width: 100%; min-width: 0; min-height: 36px; padding: 7px 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font: inherit; }',
    'completion-layout': '.completion-layout { position: relative; height: 260px; overflow: clip; border: 1px solid var(--border); border-radius: 8px; transform: translateZ(0); }\n.completion-layout :deep(.ui-app), .completion-layout :deep(.ui-layout), .completion-layout :deep(.ui-main) { min-height: 260px; }',
    'completion-panel': '.completion-panel { padding: 16px; border: 1px solid var(--border); border-radius: 8px; }',
    'completion-window-card': '.completion-window-card { display: grid; place-items: center; min-height: 140px; padding: 20px; background: var(--accent-soft); color: var(--accent-text); }',
};
const independent = new Set(['UBtnToggle', 'UCode', 'USlideGroup', 'USlideGroupItem', 'USnackbar', 'USnackbarQueue']);
const manifest = [];
for (const page of completionPages) {
    if (independent.has(page.name)) {
        const file = kebab(page.name).slice(2) + '.vue';
        await readFile(new URL(file, directory), 'utf8');
        manifest.push({ name: page.name, example: 'component-' + file.slice(0, -4), file });
        continue;
    }
    const family = families.find(family => findNode(family.tree, page.name));
    const custom = overrides[page.name];
    if (!family && !custom) throw new Error(`No actual example for ${page.name}`);
    const node = family && findNode(family.tree, page.name);
    const template = (custom?.template ?? node.loc.source).replace(/<(\/?)(U[A-Z]\w*)\b/g, (_, closing, name) => '<' + closing + kebab(name));
    const script = minimalScript(custom?.script ?? family.script, template);
    const extraStyles = Object.entries(supportingStyle).filter(([name]) => template.includes(name)).map(([, css]) => css);
    const source = `<script setup>\n${script}\n</script>\n\n<template>\n    <div class="component-demo" data-demo-component="${page.name}">\n        ${template}\n    </div>\n</template>\n\n<style scoped>\n.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }\n.component-demo > output { color: var(--muted); font-size: 14px; }\n.component-demo > .ui-button { justify-self: start; }\n${extraStyles.join('\n')}\n</style>\n`;
    const filename = kebab(page.name).slice(2) + '.vue';
    await writeFile(new URL(filename, directory), await formatDemoSource(source));
    manifest.push({ name: page.name, example: 'component-' + filename.slice(0, -4), file: filename });
}
await writeFile(new URL('../src/ui/docs/componentExampleManifest.json', import.meta.url), JSON.stringify(manifest, null, 4) + '\n');
console.log(`Wrote ${manifest.length} individual component demos.`);

function findNode(node, name) {
    if (node.type === 1 && node.tag === name) return node;
    for (const child of node.children ?? []) { const found = findNode(child, name); if (found) return found; }
}
function kebab(name) { return 'u-' + name.slice(1).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(); }
function identifiers(text) { return new Set(text.match(/[A-Za-z_$][\w$]*/g) ?? []); }
function minimalScript(original, template) {
    const needed = identifiers(template);
    const componentNames = new Set();
    for (const match of template.matchAll(/<u-([\w-]+)/g)) {
        const name = 'U' + match[1].split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');
        needed.add(name);
        componentNames.add(name);
    }
    const file = ts.createSourceFile('demo.js', original, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const statements = file.statements.filter(statement => !ts.isImportDeclaration(statement) && (ts.isVariableStatement(statement) || ts.isFunctionDeclaration(statement)));
    const selected = new Set();
    let changed = true;
    while (changed) {
        changed = false;
        for (const statement of statements) {
            if (selected.has(statement)) continue;
            const names = ts.isFunctionDeclaration(statement) ? [statement.name?.text] : statement.declarationList.declarations.filter(declaration => ts.isIdentifier(declaration.name)).map(declaration => declaration.name.text);
            if (!names.some(name => needed.has(name)) || statement.getText(file).includes('defineProps(')) continue;
            selected.add(statement);
            function collect(node) {
                if (ts.isIdentifier(node)) {
                    const parent = node.parent;
                    const propertyName = (ts.isPropertyAssignment(parent) || ts.isPropertyAccessExpression(parent)) && parent.name === node;
                    if (!propertyName) needed.add(node.text);
                }
                ts.forEachChild(node, collect);
            }
            collect(statement);
            changed = true;
        }
    }
    const imports = [];
    const vueImports = ['ref', 'computed', 'watch', 'onBeforeUnmount'].filter(name => needed.has(name));
    if (vueImports.length) imports.push(`import { ${vueImports.join(', ')} } from 'vue';`);
    const uiImports = [...componentNames].sort();
    if (uiImports.length) imports.push(`import { ${uiImports.join(', ')} } from '../../index';`);
    return [...imports, ...statements.filter(statement => selected.has(statement)).map(statement => statement.getText(file))].join('\n');
}

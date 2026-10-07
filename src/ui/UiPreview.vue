<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { UButton, UTextField, USwitch, USnackbarHost, UConfirmHost } from './index';
import { useUiThemeWithFallback } from './theme';
import { previewThemeOptions } from './docs/previewTheme';
import Icon from '../components/Icon.vue';
import { groups, pages, tokens } from './docs/content';
import ExampleCard from './docs/ExampleCard.vue';
import CodeBlock from './docs/CodeBlock.vue';
import ApiTable from './docs/ApiTable.vue';
import LiveExample from './docs/LiveExample.vue';
import packageInfo from '../../package.json';

const theme = useUiThemeWithFallback(previewThemeOptions());
const themeSwitch = ref();
const darkTheme = computed({ get: () => theme.current.value.dark, set: (value) => {
    theme.setTransitionOrigin(themeSwitch.value?.element ?? null);
    void theme.change(value ? 'dark' : 'light');
} });
const componentCount = pages.filter((page) => page.kind === 'component').length;
const search = ref('');
const searchInput = ref();
const route = ref('overview');
const section = ref('');
const menuOpen = ref(false);
const menuButton = ref();
const content = ref();
const headings = ref();
const current = computed(() => pages.find((page) => page.id === route.value) || pages[0]);
const pageIndex = computed(() => pages.findIndex((page) => page.id === current.value.id));
const previous = computed(() => pages[pageIndex.value - 1]);
const next = computed(() => pages[pageIndex.value + 1]);
const filteredGroups = computed(() => groups.map((name) => ({
    name,
    pages: pages.filter((page) => page.group === name && `${page.title} ${page.name} ${page.description}`.toLowerCase().includes(search.value.trim().toLowerCase()))
})).filter((group) => group.pages.length));
const toc = computed(() => current.value.sections?.map((item) => ({ id: item.id, title: item.title })) || [
    { id: 'examples', title: '交互示例' }, { id: 'api', title: 'API 参考' }, { id: 'usage', title: '使用约定' }
]);
watch(current, (value) => { document.title = `${value.title} · UAH UI 文档`; });
let observer;
async function readRoute() {
    const [pageId, sectionId] = location.hash.replace(/^#\/?/, '').split('/');
    route.value = pages.some((page) => page.id === pageId) ? pageId : 'overview';
    section.value = sectionId || '';
    menuOpen.value = false;
    await nextTick();
    if (sectionId) document.getElementById(`section-${sectionId}`)?.scrollIntoView({ block: 'start' });
    else content.value?.scrollTo({ top: 0 });
    observer?.disconnect();
    observer = new IntersectionObserver((entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) section.value = visible.target.id.replace('section-', '');
    }, { root: content.value, rootMargin: '-8% 0px -70% 0px', threshold: 0 });
    headings.value?.querySelectorAll('.docs-section').forEach((element) => observer.observe(element));
}
function keyboard(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        menuOpen.value = true;
        nextTick(() => searchInput.value?.focus());
    }
    if (event.key === 'Escape' && menuOpen.value) {
        menuOpen.value = false;
        nextTick(() => menuButton.value?.focus());
    }
}
function searchEnter() {
    const page = filteredGroups.value[0]?.pages[0];
    if (page) {
        location.hash = `/${page.id}`;
        search.value = '';
        menuOpen.value = false;
        nextTick(() => content.value?.focus({ preventScroll: true }));
    }
}
onMounted(() => {
    readRoute();
    window.addEventListener('hashchange', readRoute);
    window.addEventListener('keydown', keyboard);
});
onBeforeUnmount(() => {
    window.removeEventListener('hashchange', readRoute);
    window.removeEventListener('keydown', keyboard);
    observer?.disconnect();
});
</script>

<template>
    <div class="docs-shell">
        <a class="docs-skip" href="#docs-main" @click.prevent="content?.focus()">跳到文档内容</a>
        <header class="docs-header">
            <div class="docs-brand-wrap">
                <u-button ref="menuButton" class="docs-menu-button" icon variant="text" aria-label="切换文档导航" :aria-expanded="menuOpen" aria-controls="docs-navigation" @click="menuOpen = !menuOpen"><Icon name="panel" /></u-button>
                <a href="#/overview" class="docs-brand" aria-label="UAH UI 首页"><span class="docs-logo"><Icon name="spark" :size="21" /></span><strong>UAH <span>UI</span></strong></a>
                <span class="docs-version">{{ packageInfo.version }} · 独立库</span>
            </div>
            <div class="docs-header-links"><a href="#/getting-started" :class="{ active: current.group === '开始使用' }">文档</a><a href="#/tokens" :class="{ active: current.group === '设计基础' }">设计基础</a></div>
            <div class="docs-header-actions">
                <label class="docs-theme-switch"><Icon name="sun" :size="16" /><u-switch ref="themeSwitch" v-model="darkTheme" aria-label="深色主题" /><Icon name="moon" :size="16" /><span class="docs-theme-label">{{ darkTheme ? '深色' : '浅色' }}</span></label>
                <a class="docs-reference" href="https://0.vuetifyjs.com/introduction/getting-started" target="_blank" rel="noopener noreferrer" aria-label="Vuetify0 官方文档（新窗口）"><Icon name="external" :size="17" /></a>
            </div>
        </header>
        <div class="docs-workspace">
            <Transition name="docs-overlay"><button v-if="menuOpen" class="docs-nav-overlay" aria-label="关闭文档导航" @click="menuOpen = false"></button></Transition>
            <aside id="docs-navigation" class="docs-sidebar" :class="{ 'is-open': menuOpen }">
                <div class="docs-search"><u-text-field ref="searchInput" v-model="search" aria-label="搜索文档" placeholder="搜索文档…" @keydown.enter="searchEnter"><template #leading><Icon name="search" :size="15" /></template><template #trailing><kbd>Ctrl K</kbd></template></u-text-field></div>
                <nav aria-label="文档导航">
                    <div v-for="group in filteredGroups" :key="group.name" class="docs-nav-group">
                        <h2>{{ group.name }}<span>{{ group.pages.length }}</span></h2>
                        <a v-for="page in group.pages" :key="page.id" :href="`#/${page.id}`" :aria-current="current.id === page.id ? 'page' : undefined" :class="{ active: current.id === page.id }"><span>{{ page.title }}</span><small v-if="page.kind === 'component'">{{ page.name.replace('Ui', '') }}</small><Icon v-else-if="current.id === page.id" name="arrowRight" :size="13" /></a>
                    </div>
                    <p v-if="!filteredGroups.length" class="docs-no-results" role="status">未找到“{{ search }}”。试试组件名称，例如 Input。</p>
                </nav>
                <div class="docs-sidebar-footer"><span class="docs-status-dot"></span><span>与工作台共享实现</span><a href="#/getting-started">接入指南 <Icon name="arrowRight" :size="13" /></a></div>
            </aside>
            <main id="docs-main" ref="content" class="docs-content-scroll" tabindex="-1">
                <div class="docs-content-grid">
                    <article ref="headings" :key="current.id" class="docs-article">
                        <div class="docs-breadcrumb"><a href="#/overview">文档</a><Icon name="chevron" :size="12" /><span>{{ current.group }}</span><Icon name="chevron" :size="12" /><span>{{ current.title }}</span></div>
                        <div class="docs-page-heading">
                            <div class="docs-page-eyebrow">{{ current.kind === 'component' ? 'COMPONENT' : current.kind === 'service' ? 'SERVICE' : 'FOUNDATION' }}<span v-if="current.kind === 'component'">{{ ['button', 'tabs'].includes(current.id) ? 'v0 行为 + UAH 外观' : '原生行为 + UAH 外观' }}</span></div>
                            <h1>{{ current.title }}<code v-if="current.kind !== 'guide'">{{ current.name }}</code></h1><p>{{ current.description }}</p>
                        </div>
                        <template v-if="current.id === 'overview'">
                            <div class="docs-hero-demo"><div><span class="docs-hero-number">{{ componentCount }}</span><span>共享组件</span></div><div><span class="docs-hero-number">2</span><span>明暗主题</span></div><div><span class="docs-hero-number">1</span><span>一致的交互语言</span></div><Icon class="docs-hero-spark" name="spark" :size="72" /></div>
                            <div class="docs-quick-links"><a href="#/getting-started"><Icon name="arrowRight" :size="16" />开始接入</a><a href="#/button"><Icon name="puzzle" :size="16" />探索组件</a><a href="#/tokens"><Icon name="sun" :size="16" />设计变量</a></div>
                        </template>
                        <template v-if="current.sections">
                            <section v-for="item in current.sections" :id="`section-${item.id}`" :key="item.id" class="docs-section">
                                <h2><a :href="`#/${current.id}/${item.id}`">{{ item.title }}<span aria-hidden="true">#</span></a></h2>
                                <p v-if="item.text">{{ item.text }}</p><ul v-if="item.items" class="docs-prose-list"><li v-for="text in item.items" :key="text">{{ text }}</li></ul>
                                <CodeBlock v-if="item.code" :code="item.code" :language="item.id === 'theme' || item.id === 'import' ? 'javascript' : 'vue'" /><LiveExample v-if="item.demo" :example="item.demo" />
                                <div v-if="current.id === 'overview' && item.id === 'layers'" class="docs-note"><Icon name="info" :size="18" /><div><strong>行为与外观分开演进</strong><p>UButton 与 UTabs 已接入 @vuetify/v0。输入、选择、开关、字段、面板、折叠、提示和原生弹窗保留 UAH 实现；所有组件继续使用同一套设计变量。</p></div></div>
                                <div v-if="current.id === 'overview' && item.id === 'catalog'" class="docs-component-grid"><a v-for="page in pages.filter((entry) => entry.kind === 'component')" :key="page.id" :href="`#/${page.id}`"><code>{{ page.name }}</code><strong>{{ page.title }}</strong><Icon name="arrowRight" :size="15" /></a></div>
                                <div v-if="current.id === 'tokens' && item.id === 'palette'" class="docs-token-grid"><div v-for="[token, label] in tokens" :key="token" class="docs-token"><span :style="{ background: `var(${token})` }"></span><div><strong>{{ label }}</strong><code>{{ token }}</code></div></div></div>
                            </section>
                        </template>
                        <template v-else>
                            <section id="section-examples" class="docs-section"><h2><a :href="`#/${current.id}/examples`">交互示例<span aria-hidden="true">#</span></a></h2><p class="docs-section-intro">直接操作真实组件，或切换到源码查看组合方式。</p><ExampleCard v-for="example in current.examples" :key="example.id" :example="example" /></section>
                            <section id="section-api" class="docs-section">
                                <h2><a :href="`#/${current.id}/api`">API 参考<span aria-hidden="true">#</span></a></h2>
                                <p class="docs-section-intro">{{ current.apiKind === 'utilities' ? '工具类可直接添加到元素；以下为16px根字号下的尺寸，响应式前缀使用同一层级。' : current.kind === 'service' ? '服务选项与方法；以各方法签名为准。' : '公开组件契约；modelValue 使用 v-model，其他双向属性使用 v-model:属性名。未声明的原生属性与事件按组件约定透传。' }}</p>
                                <ApiTable :title="current.apiKind === 'utilities' ? '工具类' : current.kind === 'service' ? 'Options' : 'Props'" :rows="current.props" empty="无公开 props。" />
                                <ApiTable v-if="current.apiKind !== 'utilities'" :title="current.kind === 'service' ? 'Methods' : 'Emits'" :rows="current.events" empty="无自定义事件。" />
                                <ApiTable v-if="current.kind === 'component'" title="Slots" :rows="current.slots" empty="无公开插槽。" />
                                <ApiTable v-if="current.methods?.length" title="Expose（通过 ref 使用）" :rows="current.methods" />
                                <ApiTable v-if="current.attributes?.length" title="原生属性透传" :rows="current.attributes" />
                            </section>
                            <section id="section-usage" class="docs-section"><h2><a :href="`#/${current.id}/usage`">使用约定<span aria-hidden="true">#</span></a></h2><ul class="docs-prose-list"><li v-for="note in current.notes" :key="note">{{ note }}</li></ul><div class="docs-related"><Icon name="book" :size="18" /><div><strong>继续阅读</strong><p><a href="#/accessibility">可访问性</a><span> / </span><a href="#/motion">动效与生命周期</a><span> / </span><a href="#/getting-started">接入指南</a></p></div></div></section>
                        </template>
                        <footer class="docs-page-footer"><div class="docs-page-pagination"><a v-if="previous" :href="`#/${previous.id}`"><span>上一篇</span><strong><Icon name="back" :size="15" />{{ previous.title }}</strong></a><a v-if="next" :href="`#/${next.id}`" class="docs-pagination-next"><span>下一篇</span><strong>{{ next.title }}<Icon name="arrowRight" :size="15" /></strong></a></div><div class="docs-footnote"><span>UAH UI · 独立组件库</span><span>Vue 3 · 共享样式 · 中文文档</span></div></footer>
                    </article>
                    <aside class="docs-toc"><nav aria-label="当前页目录"><h2>当前页目录</h2><a v-for="item in toc" :key="item.id" :href="`#/${current.id}/${item.id}`" :class="{ active: section === item.id }">{{ item.title }}</a></nav><div class="docs-toc-note"><Icon name="keyboard" :size="19" /><p>键盘也能完整操作。<br />试试 Tab 与方向键。</p><a href="#/accessibility">查看交互约定 <Icon name="arrowRight" :size="12" /></a></div></aside>
                </div>
            </main>
        </div>
        <u-snackbar-host />
        <u-confirm-host />
    </div>
</template>

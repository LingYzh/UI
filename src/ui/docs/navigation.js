// Categories and ordering follow Vuetify's documentation navigation. UAH-only
// components keep their own extension category instead of inventing matches.
// Source: https://github.com/vuetifyjs/vuetify/blob/master/packages/docs/src/data/nav.json
export const docsNavigationGroups = [
    { id: 'getting-started', title: '开始使用', pageIds: ['overview', 'getting-started', 'focus'] },
    { id: 'foundations', title: '设计基础', pageIds: ['tokens', 'theme', 'typography', 'variants', 'utilities', 'motion', 'accessibility', 'locale', 'ripple'] },
    { id: 'application', title: '应用布局', pageIds: ['app', 'layout', 'main'] },
    { id: 'containment', title: '容器组件', pageIds: ['bottom-sheet', 'button', 'card', 'chip', 'dialog', 'divider', 'expansion-panels', 'expansion-panel', 'expansion-panel-title', 'expansion-panel-text', 'list', 'list-item', 'list-group', 'list-subheader', 'list-item-title', 'list-item-subtitle', 'menu', 'menu-item', 'overlay', 'sheet', 'toolbar', 'toolbar-title', 'toolbar-items', 'tooltip', 'collapse'] },
    { id: 'navigation', title: '导航组件', pageIds: ['app-bar', 'app-bar-title', 'bottom-navigation', 'breadcrumbs', 'breadcrumbs-item', 'breadcrumbs-divider', 'fab', 'footer', 'navigation-drawer', 'pagination', 'speed-dial', 'system-bar', 'tabs', 'tab', 'tabs-window', 'tabs-window-item', 'tab-panel'] },
    { id: 'form-inputs-and-controls', title: '表单输入与控件', pageIds: ['autocomplete', 'checkbox', 'checkbox-group', 'color-input', 'combobox', 'date-input', 'file-input', 'file-upload', 'form', 'form-section', 'form-actions', 'form-field', 'input-base', 'field', 'label', 'messages', 'counter', 'validation', 'number-input', 'otp-input', 'radio', 'radio-group', 'range-slider', 'select', 'selection-control-group', 'selection-control', 'slider', 'switch', 'input', 'textarea', 'cascader', 'option-picker'] },
    { id: 'data-and-display', title: '数据与展示', pageIds: ['calendar', 'confirm-edit', 'data-iterator', 'data-table', 'data-table-server', 'data-table-virtual', 'hotkey', 'hotkey-listener', 'kbd', 'sparkline', 'infinite-scroll', 'table', 'treeview', 'virtual-scroll'] },
    { id: 'grids', title: '栅格布局', pageIds: ['grid', 'container', 'row', 'col', 'spacer'] },
    { id: 'selection', title: '选择组件', pageIds: ['btn-group', 'btn-toggle', 'carousel', 'carousel-item', 'chip-group', 'item-group', 'item', 'slide-group', 'slide-group-item', 'stepper', 'stepper-item', 'stepper-actions', 'stepper-window', 'stepper-window-item', 'stepper-vertical', 'stepper-vertical-item', 'stepper-vertical-actions', 'window', 'window-item'] },
    { id: 'feedback', title: '反馈组件', pageIds: ['alert', 'badge', 'banner', 'empty-state', 'hover', 'progress-circular', 'progress-linear', 'progress', 'spinner', 'rating', 'skeleton-loader', 'snackbar', 'snackbar-queue', 'snackbar-host', 'confirm-host', 'timeline', 'timeline-item'] },
    { id: 'images-and-icons', title: '图像与图标', pageIds: ['responsive', 'avatar', 'icons', 'img', 'parallax'] },
    { id: 'pickers', title: '选择器', pageIds: ['picker', 'color-picker', 'color-swatches', 'date-picker', 'time-picker'] },
    { id: 'providers', title: '上下文提供器', pageIds: ['defaults-provider', 'locale-provider', 'theme-provider'] },
    { id: 'miscellaneous', title: '其他组件', pageIds: ['lazy', 'no-ssr', 'pull-to-refresh', 'scroll-area', 'transition'] },
    { id: 'uah-extensions', title: 'UAH 扩展', pageIds: ['markdown', 'code', 'code-block', 'diff', 'activity', 'usage-meter', 'file-changes', 'message-actions', 'copy-button'] },
    { id: 'services', title: '服务', pageIds: ['snackbar-service', 'confirm'] }
];

/**
 * Usage-page families change only the navigation presentation. Each component
 * page remains available as its own API route and keeps its original metadata.
 */
export const docsUsageFamilies = [
    { id: 'app', pageIds: ['app', 'main', 'layout'] },
    { id: 'grid', pageIds: ['grid', 'container', 'row', 'col', 'spacer'] },
    { id: 'list', pageIds: ['list', 'list-item', 'list-group', 'list-subheader', 'list-item-title', 'list-item-subtitle'] },
    { id: 'expansion-panels', pageIds: ['expansion-panels', 'expansion-panel', 'expansion-panel-title', 'expansion-panel-text'] },
    { id: 'tabs', pageIds: ['tabs', 'tab', 'tabs-window', 'tabs-window-item', 'tab-panel'] },
    { id: 'stepper', pageIds: ['stepper', 'stepper-item', 'stepper-actions', 'stepper-window', 'stepper-window-item'] },
    { id: 'stepper-vertical', pageIds: ['stepper-vertical', 'stepper-vertical-item', 'stepper-vertical-actions'] },
    { id: 'toolbar', pageIds: ['toolbar', 'toolbar-title', 'toolbar-items'] },
    { id: 'app-bar', pageIds: ['app-bar', 'app-bar-title'] },
    { id: 'breadcrumbs', pageIds: ['breadcrumbs', 'breadcrumbs-item', 'breadcrumbs-divider'] },
    { id: 'item-group', pageIds: ['item-group', 'item'] },
    { id: 'slide-group', pageIds: ['slide-group', 'slide-group-item'] },
    { id: 'window', pageIds: ['window', 'window-item'] },
    { id: 'carousel', pageIds: ['carousel', 'carousel-item'] },
    { id: 'timeline', pageIds: ['timeline', 'timeline-item'] },
    { id: 'btn-group', pageIds: ['btn-group', 'btn-toggle'] },
    { id: 'checkbox', pageIds: ['checkbox', 'checkbox-group'] },
    { id: 'color-picker', pageIds: ['color-picker', 'color-swatches'] },
    { id: 'form', pageIds: ['form', 'form-field', 'form-section', 'form-actions'] },
    { id: 'hotkey', pageIds: ['hotkey', 'hotkey-listener'] },
    { id: 'confirm', pageIds: ['confirm', 'confirm-host'] },
    { id: 'menu', pageIds: ['menu', 'menu-item'] },
    { id: 'progress-linear', pageIds: ['progress-linear', 'progress'] },
    { id: 'progress-circular', pageIds: ['progress-circular', 'spinner'] },
    { id: 'snackbar', pageIds: ['snackbar', 'snackbar-host', 'snackbar-service'] },
    { id: 'radio', pageIds: ['radio', 'radio-group'] }
];

const docsUsageFamilyByPageId = new Map(
    docsUsageFamilies.flatMap(family => family.pageIds.map(pageId => [pageId, family]))
);
const docsDataTablePageIds = ['data-table', 'data-table-server', 'data-table-virtual'];
const docsDataTablePageIdSet = new Set(docsDataTablePageIds);
const docsDataTableChildrenGroupValue = 'docs-family-data-table';

/** Return the explicit family, or a singleton descriptor for an independent page. */
export function getDocsUsageFamily(pageId) {
    const family = docsUsageFamilyByPageId.get(pageId);
    return family ? { id: family.id, pageIds: [...family.pageIds] } : { id: pageId, pageIds: [pageId] };
}

/** Resolve original page objects in the family declaration's stable order. */
export function getDocsUsagePages(pages, pageId) {
    const byId = new Map(pages.map(page => [page.id, page]));
    return getDocsUsageFamily(pageId).pageIds.map(id => byId.get(id)).filter(Boolean);
}

function findDocsNavigationGroup(pageId) {
    return docsNavigationGroups.find(group => group.pageIds.includes(pageId));
}

function matchesDocsSearch(page, query) {
    return `${page.title || ''} ${page.name || ''} ${page.description || ''}`.toLowerCase().includes(query);
}

function getUsageCategoryId(pageId) {
    const family = docsUsageFamilyByPageId.get(pageId);
    return findDocsNavigationGroup(family?.id || pageId)?.id;
}

function getUsageSearchFamilyId(pageId) {
    if (docsDataTablePageIdSet.has(pageId)) return 'data-table';
    return getDocsUsageFamily(pageId).id;
}

function getUsageSearchHref(page) {
    const family = docsUsageFamilyByPageId.get(page.id);
    const isFamilyChild = family && family.id !== page.id;
    return isFamilyChild && page.kind === 'component' ? `#/${page.id}/api` : `#/${page.id}`;
}

function buildDocsUsageSearchNavigation(pages, query) {
    const byId = new Map(pages.map(page => [page.id, page]));
    const matchesByCategory = new Map();
    const addedPageIds = new Set();

    // Expand families at their main page so cross-category children remain with
    // their usage page (for example, ConfirmHost under confirmDialog).
    for (const group of docsNavigationGroups) {
        for (const pageId of group.pageIds) {
            if (addedPageIds.has(pageId)) continue;
            const family = docsUsageFamilyByPageId.get(pageId);
            if (family && family.id !== pageId) continue;

            const orderedPageIds = family?.pageIds || (pageId === 'data-table' ? docsDataTablePageIds : [pageId]);
            for (const orderedPageId of orderedPageIds) {
                const page = byId.get(orderedPageId);
                if (!page || addedPageIds.has(orderedPageId)) continue;
                addedPageIds.add(orderedPageId);
                if (!matchesDocsSearch(page, query)) continue;

                const categoryId = getUsageCategoryId(page.id);
                if (!categoryId) continue;
                const categoryMatches = matchesByCategory.get(categoryId) || [];
                categoryMatches.push({
                    ...page,
                    href: getUsageSearchHref(page),
                    familyId: getUsageSearchFamilyId(page.id)
                });
                matchesByCategory.set(categoryId, categoryMatches);
            }
        }
    }

    return docsNavigationGroups.map(group => ({
        id: group.id,
        title: group.title,
        pages: matchesByCategory.get(group.id) || []
    })).filter(group => group.pages.length);
}

function buildDocsApiNavigation(pages, query) {
    const byId = new Map(pages.map(page => [page.id, page]));
    return docsNavigationGroups.map(group => ({
        id: group.id,
        title: group.title,
        pages: group.pageIds.map(id => byId.get(id)).filter(page => page &&
            page.kind === 'component' && matchesDocsSearch(page, query)).map(page => ({
            ...page,
            href: `#/${page.id}/api`
        }))
    })).filter(group => group.pages.length);
}

function createDocsTableNavigationEntry(page, pages) {
    const byId = new Map(pages.map(item => [item.id, item]));
    return {
        ...page,
        familyId: 'data-table',
        childrenGroupValue: docsDataTableChildrenGroupValue,
        children: docsDataTablePageIds.map(id => byId.get(id)).filter(Boolean).map(child => ({
            ...child,
            familyId: 'data-table',
            href: `#/${child.id}`
        }))
    };
}

/**
 * Usage mode presents one primary page per family. Search expands back to the
 * original pages so child APIs remain discoverable. API mode keeps all public
 * component pages separate and excludes guides/services.
 */
export function buildDocsNavigation(pages, search = '', mode = 'usage') {
    const query = search.trim().toLowerCase();
    if (mode === 'api') return buildDocsApiNavigation(pages, query);
    if (query) return buildDocsUsageSearchNavigation(pages, query);

    const byId = new Map(pages.map(page => [page.id, page]));
    return docsNavigationGroups.map(group => ({
        id: group.id,
        title: group.title,
        pages: group.pageIds.map(id => {
            const page = byId.get(id);
            if (!page) return undefined;

            const family = docsUsageFamilyByPageId.get(id);
            if (family) {
                if (family.id !== id) return undefined;
                return {
                    ...page,
                    href: `#/${page.id}`,
                    familyId: family.id,
                    members: getDocsUsagePages(pages, page.id)
                };
            }

            if (docsDataTablePageIdSet.has(id)) {
                if (id !== 'data-table') return undefined;
                return createDocsTableNavigationEntry(page, pages);
            }

            return { ...page, href: `#/${page.id}` };
        }).filter(Boolean)
    })).filter(group => group.pages.length);
}

/** Return the expanded navigation path for the selected documentation mode. */
export function getDocsNavigationPath(pageId, mode = 'usage') {
    if (mode === 'api') return [findDocsNavigationGroup(pageId)?.id].filter(Boolean);

    if (docsDataTablePageIdSet.has(pageId)) {
        const categoryId = findDocsNavigationGroup('data-table')?.id;
        return [categoryId, docsDataTableChildrenGroupValue].filter(Boolean);
    }

    const categoryId = getUsageCategoryId(pageId);
    return categoryId ? [categoryId] : [];
}
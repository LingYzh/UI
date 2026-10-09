import assert from 'node:assert/strict';
import test from 'node:test';
import { pages } from '../src/ui/docs/content.js';
import {
    buildDocsNavigation,
    docsNavigationGroups,
    docsUsageFamilies,
    getDocsNavigationPath,
    getDocsUsageFamily,
    getDocsUsagePages
} from '../src/ui/docs/navigation.js';

function flattenGroups(groups) {
    return groups.flatMap(group => group.pages);
}

function findNavigationEntry(groups, pageId) {
    return flattenGroups(groups).find(page => page.id === pageId);
}

function getPageIds(pagesToRead) {
    return pagesToRead.map(page => page.id);
}

function findSearchResult(groups, pageId) {
    return flattenGroups(groups).find(page => page.id === pageId);
}

function matchingPageIds(query, predicate = () => true) {
    const normalized = query.trim().toLowerCase();
    return new Set(pages.filter(page => predicate(page) &&
        `${page.title || ''} ${page.name || ''} ${page.description || ''}`.toLowerCase().includes(normalized)
    ).map(page => page.id));
}

const expectedUsageFamilies = {
    app: ['app', 'main', 'layout'],
    grid: ['grid', 'container', 'row', 'col', 'spacer'],
    list: ['list', 'list-item', 'list-group', 'list-subheader', 'list-item-title', 'list-item-subtitle'],
    'expansion-panels': ['expansion-panels', 'expansion-panel', 'expansion-panel-title', 'expansion-panel-text'],
    tabs: ['tabs', 'tab', 'tabs-window', 'tabs-window-item', 'tab-panel'],
    stepper: ['stepper', 'stepper-item', 'stepper-actions', 'stepper-window', 'stepper-window-item'],
    'stepper-vertical': ['stepper-vertical', 'stepper-vertical-item', 'stepper-vertical-actions'],
    toolbar: ['toolbar', 'toolbar-title', 'toolbar-items'],
    'app-bar': ['app-bar', 'app-bar-title'],
    breadcrumbs: ['breadcrumbs', 'breadcrumbs-item', 'breadcrumbs-divider'],
    'item-group': ['item-group', 'item'],
    'slide-group': ['slide-group', 'slide-group-item'],
    window: ['window', 'window-item'],
    carousel: ['carousel', 'carousel-item'],
    timeline: ['timeline', 'timeline-item'],
    'btn-group': ['btn-group', 'btn-toggle'],
    checkbox: ['checkbox', 'checkbox-group'],
    'color-picker': ['color-picker', 'color-swatches'],
    form: ['form', 'form-field', 'form-section', 'form-actions'],
    hotkey: ['hotkey', 'hotkey-listener'],
    confirm: ['confirm', 'confirm-host'],
    menu: ['menu', 'menu-item'],
    'progress-linear': ['progress-linear', 'progress'],
    'progress-circular': ['progress-circular', 'spinner'],
    snackbar: ['snackbar', 'snackbar-host', 'snackbar-service'],
    radio: ['radio', 'radio-group']
};

test('original documentation map covers all 173 pages and API mode retains all 158 components', () => {
    assert.equal(pages.length, 173);
    assert.equal(pages.filter(page => page.kind === 'component').length, 158);
    assert.equal(docsNavigationGroups.length, 16);
    assert.equal(new Set(docsNavigationGroups.map(group => group.id)).size, docsNavigationGroups.length);
    assert.equal(new Set(docsNavigationGroups.map(group => group.title)).size, docsNavigationGroups.length);

    const assignedIds = docsNavigationGroups.flatMap(group => group.pageIds);
    assert.equal(new Set(assignedIds).size, assignedIds.length, 'a page belongs to one original category only');
    assert.deepEqual(new Set(assignedIds), new Set(pages.map(page => page.id)));

    const apiNavigation = buildDocsNavigation(pages, '', 'api');
    const apiPages = flattenGroups(apiNavigation);
    const componentPages = pages.filter(page => page.kind === 'component');
    assert.equal(apiPages.length, 158);
    assert.deepEqual(new Set(getPageIds(apiPages)), new Set(getPageIds(componentPages)));
    assert.ok(apiPages.every(page => page.href === `#/${page.id}/api`));
    assert.ok(apiPages.every(page => page.kind === 'component'), 'guides and service pages are not API components');

    const expectedApiGroupIds = docsNavigationGroups.filter(group =>
        group.pageIds.some(id => pages.find(page => page.id === id)?.kind === 'component')
    ).map(group => group.id);
    assert.deepEqual(apiNavigation.map(group => group.id), expectedApiGroupIds);
    for (const group of docsNavigationGroups) {
        const expectedIds = group.pageIds.filter(id => pages.find(page => page.id === id)?.kind === 'component');
        const actualIds = apiNavigation.find(item => item.id === group.id)?.pages.map(page => page.id) || [];
        assert.deepEqual(actualIds, expectedIds, `${group.id} preserves original component ordering`);
    }
});

test('usage families are explicit and resolve original page objects in declared order', () => {
    assert.deepEqual(Object.fromEntries(docsUsageFamilies.map(family => [family.id, family.pageIds])), expectedUsageFamilies);

    const familyPageIds = docsUsageFamilies.flatMap(family => family.pageIds);
    assert.equal(new Set(familyPageIds).size, familyPageIds.length, 'family membership is not duplicated');
    assert.ok(familyPageIds.every(id => pages.some(page => page.id === id)), 'every family page exists');

    for (const family of docsUsageFamilies) {
        assert.equal(family.pageIds[0], family.id, `${family.id} starts with its usage page`);
        assert.deepEqual(getDocsUsageFamily(family.id), family);
        for (const pageId of family.pageIds) {
            assert.deepEqual(getDocsUsageFamily(pageId), family, `${pageId} resolves to ${family.id}`);
        }
        assert.deepEqual(getPageIds(getDocsUsagePages(pages, family.id)), family.pageIds);
        for (const [index, page] of getDocsUsagePages(pages, family.id).entries()) {
            assert.equal(page, pages.find(item => item.id === family.pageIds[index]), 'family members remain original page objects');
        }
    }

    assert.deepEqual(getDocsUsageFamily('button'), { id: 'button', pageIds: ['button'] });
    assert.deepEqual(getDocsUsageFamily('chip-group'), { id: 'chip-group', pageIds: ['chip-group'] });
    assert.deepEqual(getDocsUsageFamily('snackbar-queue'), { id: 'snackbar-queue', pageIds: ['snackbar-queue'] });
    for (const pageId of ['data-table', 'data-table-server', 'data-table-virtual']) {
        assert.deepEqual(getDocsUsageFamily(pageId), { id: pageId, pageIds: [pageId] }, 'table mode pages stay independent');
    }
    assert.deepEqual(getDocsUsagePages(pages, 'button'), [pages.find(page => page.id === 'button')]);
});

test('default usage navigation collapses families while preserving every page exactly once', () => {
    const navigation = buildDocsNavigation(pages);
    assert.deepEqual(navigation, buildDocsNavigation(pages, '', 'usage'));
    assert.deepEqual(navigation.map(group => ({ id: group.id, title: group.title })),
        docsNavigationGroups.map(({ id, title }) => ({ id, title })));

    for (const family of docsUsageFamilies) {
        const entry = findNavigationEntry(navigation, family.id);
        assert.ok(entry, `${family.id} has a usage entry`);
        assert.equal(entry.familyId, family.id);
        assert.equal(entry.href, `#/${family.id}`);
        assert.deepEqual(getPageIds(entry.members), family.pageIds);
        for (const childId of family.pageIds.slice(1)) {
            assert.equal(findNavigationEntry(navigation, childId), undefined, `${childId} is represented through ${family.id}`);
        }
        const expectedCategoryId = docsNavigationGroups.find(group => group.pageIds.includes(family.id)).id;
        assert.ok(navigation.find(group => group.id === expectedCategoryId).pages.includes(entry));
    }

    const dataTableEntry = findNavigationEntry(navigation, 'data-table');
    assert.equal(dataTableEntry.childrenGroupValue, 'docs-family-data-table');
    assert.deepEqual(getPageIds(dataTableEntry.children), ['data-table', 'data-table-server', 'data-table-virtual']);
    assert.ok(dataTableEntry.children.every(page => page.href === `#/${page.id}`));
    assert.equal(findNavigationEntry(navigation, 'data-table-server'), undefined, 'table modes are nested, not flattened');
    assert.equal(findNavigationEntry(navigation, 'data-table-virtual'), undefined, 'table modes are nested, not flattened');

    const navigableRouteIds = navigation.flatMap(group => group.pages.flatMap(page =>
        page.children ? getPageIds(page.children) : [page.id]
    ));
    const collapsedChildCount = docsUsageFamilies.reduce((count, family) => count + family.pageIds.length - 1, 0);
    assert.equal(navigableRouteIds.length, pages.length - collapsedChildCount);
    assert.equal(new Set(navigableRouteIds).size, navigableRouteIds.length, 'usage routes are unique');

    const representedPages = navigation.flatMap(group => group.pages.flatMap(page =>
        page.children || page.members || [page]
    ));
    assert.equal(representedPages.length, pages.length, 'all source pages remain represented');
    assert.deepEqual(new Set(getPageIds(representedPages)), new Set(pages.map(page => page.id)));
});

test('independent component families stay separate in usage navigation', () => {
    const navigation = buildDocsNavigation(pages);
    const button = findNavigationEntry(navigation, 'button');
    const buttonGroup = findNavigationEntry(navigation, 'btn-group');
    assert.equal(button.name, 'UButton');
    assert.equal(buttonGroup.name, 'UBtnGroup');
    assert.deepEqual(getPageIds(buttonGroup.members), ['btn-group', 'btn-toggle']);

    const horizontalStepper = findNavigationEntry(navigation, 'stepper');
    const verticalStepper = findNavigationEntry(navigation, 'stepper-vertical');
    assert.deepEqual(getPageIds(horizontalStepper.members), expectedUsageFamilies.stepper);
    assert.deepEqual(getPageIds(verticalStepper.members), expectedUsageFamilies['stepper-vertical']);
    assert.notEqual(horizontalStepper.familyId, verticalStepper.familyId);

    assert.ok(findNavigationEntry(navigation, 'chip'));
    assert.ok(findNavigationEntry(navigation, 'chip-group'));
    assert.ok(findNavigationEntry(navigation, 'snackbar-queue'));
    assert.deepEqual(getPageIds(findNavigationEntry(navigation, 'snackbar').members), expectedUsageFamilies.snackbar);
    assert.ok(!findNavigationEntry(navigation, 'snackbar').members.some(page => page.id === 'snackbar-queue'));

    const dataTableEntry = findNavigationEntry(navigation, 'data-table');
    assert.deepEqual(dataTableEntry.children.map(page => page.name), ['UDataTable', 'UDataTableServer', 'UDataTableVirtual']);
});

test('usage search exposes original child pages with routes to their API sections', () => {
    const listGroup = findSearchResult(buildDocsNavigation(pages, 'UListGroup'), 'list-group');
    assert.equal(listGroup.id, 'list-group');
    assert.equal(listGroup.href, '#/list-group/api');
    assert.equal(listGroup.familyId, 'list');

    const container = findSearchResult(buildDocsNavigation(pages, 'UContainer'), 'container');
    assert.equal(container.id, 'container');
    assert.equal(container.href, '#/container/api');
    assert.equal(container.familyId, 'grid');

    const gridGuide = findSearchResult(buildDocsNavigation(pages, '栅格与布局规范'), 'grid');
    assert.equal(gridGuide.id, 'grid');
    assert.equal(gridGuide.href, '#/grid');
    assert.equal(gridGuide.familyId, 'grid');

    const confirmHostGroups = buildDocsNavigation(pages, 'UConfirmHost');
    assert.deepEqual(confirmHostGroups.map(group => group.id), ['services'], 'cross-category child search follows its family');
    const confirmHost = findSearchResult(confirmHostGroups, 'confirm-host');
    assert.equal(confirmHost.href, '#/confirm-host/api');
    assert.equal(confirmHost.familyId, 'confirm');

    const tableServer = findSearchResult(buildDocsNavigation(pages, 'UDataTableServer'), 'data-table-server');
    assert.equal(tableServer.id, 'data-table-server');
    assert.equal(tableServer.href, '#/data-table-server', 'table modes remain distinct usage pages');
    assert.equal(tableServer.familyId, 'data-table');

    const textField = findSearchResult(buildDocsNavigation(pages, 'UTextField'), 'input');
    assert.equal(textField.href, '#/input', 'independent components keep their existing usage route');
    assert.equal(textField.familyId, 'input', 'unpaired pages have a singleton family descriptor');

    for (const query of ['栅格与布局规范', 'UListGroup', '温和的外观']) {
        const expectedIds = matchingPageIds(query);
        const results = buildDocsNavigation(pages, query);
        const resultIds = flattenGroups(results).map(page => page.id);
        assert.deepEqual(new Set(resultIds), expectedIds, `results for ${query}`);
        assert.equal(new Set(resultIds).size, resultIds.length, `no duplicate results for ${query}`);
        assert.deepEqual(results.map(group => group.id),
            docsNavigationGroups.map(group => group.id).filter(id => results.some(result => result.id === id)));
    }

    assert.deepEqual(buildDocsNavigation(pages, 'no-such-docs-navigation-entry-9f3c'), []);
    assert.deepEqual(buildDocsNavigation(pages, '   '), buildDocsNavigation(pages));
});

test('navigation paths open the family usage category and preserve original API categories', () => {
    for (const page of pages) {
        const originalCategory = docsNavigationGroups.find(group => group.pageIds.includes(page.id)).id;
        const usageFamily = docsUsageFamilies.find(family => family.pageIds.includes(page.id));
        const usageCategory = usageFamily
            ? docsNavigationGroups.find(group => group.pageIds.includes(usageFamily.id)).id
            : originalCategory;
        const usagePath = getDocsNavigationPath(page.id, 'usage');
        const apiPath = getDocsNavigationPath(page.id, 'api');

        if (['data-table', 'data-table-server', 'data-table-virtual'].includes(page.id)) {
            assert.deepEqual(usagePath, ['data-and-display', 'docs-family-data-table'], `${page.id} nested usage path`);
        } else {
            assert.deepEqual(usagePath, [usageCategory], `${page.id} usage path`);
        }
        assert.deepEqual(apiPath, [originalCategory], `${page.id} API path`);
    }

    assert.deepEqual(getDocsNavigationPath('confirm-host'), ['services']);
    assert.deepEqual(getDocsNavigationPath('confirm-host', 'api'), ['feedback']);
    assert.deepEqual(getDocsNavigationPath('list-item'), ['containment']);
    assert.deepEqual(getDocsNavigationPath('data-table-server'), ['data-and-display', 'docs-family-data-table']);
    assert.deepEqual(getDocsNavigationPath('data-table-server', 'api'), ['data-and-display']);
    assert.deepEqual(getDocsNavigationPath('missing-page'), []);
});

test('API search matches component metadata without changing original page routes', () => {
    const expectedIds = matchingPageIds('UListGroup', page => page.kind === 'component');
    const results = buildDocsNavigation(pages, 'UListGroup', 'api');
    const apiPages = flattenGroups(results);
    assert.deepEqual(new Set(getPageIds(apiPages)), expectedIds);
    assert.ok(apiPages.every(page => page.href === `#/${page.id}/api`));
    assert.ok(!apiPages.some(page => page.kind === 'guide' || page.kind === 'service'));
    assert.deepEqual(results.map(group => group.id), ['containment']);
});
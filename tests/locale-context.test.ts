import assert from 'node:assert/strict';
import test from 'node:test';
import { computed, ref } from 'vue';
import { createLocale, type LocaleMessages, type LocaleOptions } from '../src/ui/locale-context';
import type { LocaleContext } from '../src/ui/locale';

test('default locale stays zh and an omitted child locale follows its parent reactively', () => {
    const rootLanguage = ref('fr');
    const parent = createLocale({ messages: { fr: { 'parent.label': 'parent français' }, en: { 'parent.label': 'parent English' } } }, rootLanguage);
    const child = createLocale({ messages: { fr: { 'child.label': 'enfant' } } }, undefined, parent);
    const defaults = createLocale();

    assert.equal(defaults.current.value, 'zh');
    assert.equal(defaults.t('common.close'), '关闭');
    assert.equal(child.current.value, 'fr');
    assert.equal(child.t('parent.label'), 'parent français');
    assert.equal(child.t('child.label'), 'enfant');

    rootLanguage.value = 'en';
    assert.equal(parent.current.value, 'en');
    assert.equal(child.current.value, 'en');
    assert.equal(child.t('parent.label'), 'parent English');
    assert.equal(child.t('common.close'), 'Close');
});

test('explicit locale and source override parent locale without changing the parent', () => {
    const rootLanguage = ref('fr');
    const parent = createLocale({ messages: { en: { 'parent.key': 'ancestor English' } } }, rootLanguage);
    const explicitChild = createLocale({ locale: 'en', messages: { en: { 'local.key': 'child English' } } }, undefined, parent);
    const suppliedSource = ref('de');
    const sourceChild = createLocale({ locale: 'es' }, suppliedSource, parent);

    assert.equal(explicitChild.current.value, 'en');
    assert.equal(explicitChild.t('parent.key'), 'ancestor English');
    assert.equal(explicitChild.t('local.key'), 'child English');
    assert.equal(sourceChild.current.value, 'de', 'provided source takes precedence over options.locale and parent.current');
    rootLanguage.value = 'es';
    assert.equal(explicitChild.current.value, 'en');
    assert.equal(sourceChild.current.value, 'de');
});

test('local messages override ancestors, nested paths resolve, and explicit empty strings are kept', () => {
    const parent = createLocale({ locale: 'fr', messages: {
        fr: {
            'shared.key': 'ancestor flat',
            empty: 'ancestor fallback must not replace empty',
            section: { title: 'ancestor nested title' },
            '$vuetify': { hotkey: { alt: 'ancestor alt shortcut' } }
        }
    } });
    const childMessages = {
        fr: {
            'shared.key': 'child flat override',
            empty: '',
            'section.title': 'child flat title',
            section: { title: 'nested title loses to flat key', detail: 'child nested detail' },
            '$vuetify.hotkey.ctrl': 'flat Ctrl shortcut',
            '$vuetify': { hotkey: { ctrl: 'nested Ctrl shortcut', shift: 'full-path Shift shortcut' } },
            hotkey: {
                ctrl: 'unprefixed Ctrl shortcut loses to full path',
                shift: 'unprefixed Shift shortcut loses to full path',
                meta: 'unprefixed nested Meta shortcut'
            },
            'hotkey.escape': 'unprefixed flat Escape shortcut'
        }
    } as const;
    const child = createLocale({ messages: childMessages }, undefined, parent);

    assert.equal(child.t('shared.key'), 'child flat override');
    assert.equal(child.t('empty'), '');
    assert.equal(child.t('section.title'), 'child flat title', 'exact flat dotted key wins over the nested path');
    assert.equal(child.t('section.detail'), 'child nested detail');
    assert.equal(child.t('$vuetify.hotkey.ctrl'), 'flat Ctrl shortcut', 'exact $vuetify key wins over its nested path');
    assert.equal(child.t('$vuetify.hotkey.shift'), 'full-path Shift shortcut', 'full $vuetify nested path wins over the unprefixed alias');
    assert.equal(child.t('$vuetify.hotkey.meta'), 'unprefixed nested Meta shortcut');
    assert.equal(child.t('$vuetify.hotkey.escape'), 'unprefixed flat Escape shortcut');
    assert.equal(child.t('$vuetify.hotkey.alt'), 'ancestor alt shortcut');
    assert.equal(child.resolve?.('$vuetify.hotkey.ctrl', 'fr'), 'flat Ctrl shortcut');
    assert.equal(child.resolve?.('$vuetify.hotkey.meta', 'fr'), 'unprefixed nested Meta shortcut');
    assert.equal(child.resolve?.('section.title', 'fr'), 'child flat title');
});

test('messages with inherited prototype properties are never treated as translations', () => {
    const nested = Object.assign(Object.create({ toString: 'inherited nested poison', constructor: 'inherited constructor poison' }), {
        safe: 'own nested string'
    });
    const hotkey = Object.assign(Object.create({ poison: 'inherited unprefixed poison' }), { safe: 'own unprefixed string' });
    const french = Object.assign(Object.create({ toString: 'inherited flat poison', constructor: 'inherited flat constructor poison' }), {
        nested,
        hotkey
    });
    const messages = Object.assign(Object.create({ fr: { unsafe: 'inherited locale poison' } }), { fr: french }) as LocaleMessages;
    const locale = createLocale({ locale: 'fr', messages });

    assert.equal(locale.t('toString'), 'toString');
    assert.equal(locale.t('constructor'), 'constructor');
    assert.equal(locale.t('__proto__'), '__proto__');
    assert.equal(locale.t('nested.toString'), 'nested.toString');
    assert.equal(locale.t('nested.constructor'), 'nested.constructor');
    assert.equal(locale.t('nested.__proto__'), 'nested.__proto__');
    assert.equal(locale.t('nested.safe'), 'own nested string');
    assert.equal(locale.t('$vuetify.hotkey.poison'), '$vuetify.hotkey.poison');
    assert.equal(locale.t('$vuetify.hotkey.safe'), 'own unprefixed string');
    assert.equal(locale.t('unsafe'), 'unsafe');
});

test('fallback aliases keep legacy priority, then use parent fallback, then zh', () => {
    const parent = createLocale({ fallbackLocale: 'de', messages: {
        de: { 'ancestor.fallback': 'ancêtre de secours' }
    } }, ref('fr'));
    const oldAlias = createLocale({
        fallback: 'it',
        fallbackLocale: 'en',
        messages: {
            it: { 'fallback.value': 'legacy fallback wins' },
            en: { 'fallback.value': 'new alias loses to legacy' }
        }
    }, ref('fr'), parent);
    const newAlias = createLocale({
        fallbackLocale: 'en',
        messages: { en: { 'fallback.value': 'fallbackLocale alias' } }
    }, ref('fr'), parent);
    const inheritedFallback = createLocale({ messages: { fr: {} } }, undefined, parent);
    const defaultFallback = createLocale({}, undefined, {
        current: computed(() => 'fr'),
        isRtl: computed(() => false),
        t: key => key,
        n: value => String(value)
    });

    assert.equal(oldAlias.fallback?.value, 'it');
    assert.equal(oldAlias.t('fallback.value'), 'legacy fallback wins');
    assert.equal(newAlias.fallback?.value, 'en');
    assert.equal(newAlias.t('fallback.value'), 'fallbackLocale alias');
    assert.equal(inheritedFallback.fallback?.value, 'de');
    assert.equal(inheritedFallback.t('ancestor.fallback'), 'ancêtre de secours');
    assert.equal(defaultFallback.fallback?.value, 'zh', 'legacy parent contexts without fallback inherit the zh fallback');
});

test('RTL resolves local overrides first, then the parent locale rule, then automatic direction', () => {
    const rootLanguage = ref('fr');
    const parent = createLocale({ rtl: { fr: true, en: false, ar: false } }, rootLanguage);
    const inherited = createLocale({}, undefined, parent);
    const child = createLocale({ locale: 'fr', rtl: { fr: false, ar: true } }, undefined, parent);

    assert.equal(inherited.isRtl.value, true);
    assert.equal(inherited.rtlFor?.('fr'), true);
    assert.equal(inherited.rtlFor?.('en'), false);
    assert.equal(inherited.rtlFor?.('he-IL'), true, 'parent falls back to the automatic RTL language rule');
    assert.equal(child.isRtl.value, false, 'child explicit false overrides parent explicit true');
    assert.equal(child.rtlFor?.('fr'), false);
    assert.equal(child.rtlFor?.('ar'), true, 'child explicit true overrides parent explicit false');
    assert.equal(child.rtlFor?.('en'), false, 'unmatched child language inherits parent RTL rule');

    rootLanguage.value = 'en';
    assert.equal(inherited.isRtl.value, false, 'inherited direction updates when parent locale changes');
});

test('parameter substitution preserves missing placeholders and unknown keys', () => {
    const parent = createLocale({ locale: 'en', messages: {
        en: { greeting: 'Hello {name}, {count} items' }
    } });
    const child = createLocale({}, undefined, parent);

    assert.equal(child.t('greeting', { name: 'Ada' }), 'Hello Ada, {count} items');
    assert.equal(child.t('greeting', { name: 'Ada', count: 3 }), 'Hello Ada, 3 items');
    assert.equal(child.t('missing.custom.key'), 'missing.custom.key');
    assert.equal(child.resolve?.('missing.custom.key', 'en'), undefined);
});

test('number formatting uses the active locale and falls back to English for invalid locales', () => {
    const french = createLocale({ locale: 'fr-FR' });
    const invalid = createLocale({ locale: 'not a locale' });
    const format = { maximumFractionDigits: 1 };

    assert.equal(french.n(1234.5, format), new Intl.NumberFormat('fr-FR', format).format(1234.5));
    assert.equal(invalid.n(1234.5, format), new Intl.NumberFormat('en', format).format(1234.5));
});

test('recursive dictionaries accept strings but reject function-valued messages at compile time', () => {
    const options: LocaleOptions = {
        locale: 'fr',
        messages: {
            fr: {
                'flat.key': 'flat string',
                nested: { deeper: 'nested string' }
            }
        }
    };
    assert.equal(createLocale(options).t('nested.deeper'), 'nested string');

    const invalidMessages = { fr: { nested: { message: () => 'not a string' } } };
    // @ts-expect-error locale dictionaries contain strings or nested dictionaries, never functions.
    const invalidOptions: LocaleOptions = { messages: invalidMessages };
    assert.ok(invalidOptions);
});

test('legacy LocaleContext objects remain assignable as parents', () => {
    const language = ref('fr');
    const legacyParent: LocaleContext = {
        current: computed(() => language.value),
        isRtl: computed(() => false),
        t: key => `legacy:${key}`,
        n: value => String(value)
    };
    const child = createLocale({}, undefined, legacyParent);

    assert.equal(child.current.value, 'fr');
    assert.equal(child.fallback?.value, 'zh');
    language.value = 'en';
    assert.equal(child.current.value, 'en');
    assert.equal(child.t('common.close'), 'Close');
});

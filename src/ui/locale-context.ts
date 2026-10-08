import { computed, inject, ref, type Ref } from 'vue';
import { localeKey, uiLocale, uiMessages, type LocaleContext, type UiLocale } from './locale';

export type LocaleMessageValue = string | { readonly [key: string]: LocaleMessageValue };
export type LocaleMessageDictionary = Readonly<Record<string, LocaleMessageValue>>;
export type LocaleMessages = Readonly<Record<string, LocaleMessageDictionary>>;

export interface LocaleOptions {
    locale?: string;
    /** Legacy fallback option takes precedence over fallbackLocale. */
    fallback?: string;
    fallbackLocale?: string;
    messages?: LocaleMessages;
    rtl?: Readonly<Record<string, boolean>>;
}

function lookupNestedMessage(dictionary: LocaleMessageDictionary, key: string): string | undefined {
    let value: LocaleMessageValue | LocaleMessageDictionary = dictionary;
    for (const segment of key.split('.')) {
        if (typeof value !== 'object' || value === null || !Object.hasOwn(value, segment)) return undefined;
        value = value[segment];
    }
    return typeof value === 'string' ? value : undefined;
}

function lookupMessage(dictionary: LocaleMessageDictionary | undefined, key: string): string | undefined {
    if (!dictionary) return undefined;

    // Exact flat keys win over full nested paths, and every access stays own-property-only.
    if (Object.hasOwn(dictionary, key)) {
        const flat = dictionary[key];
        if (typeof flat === 'string') return flat;
    }

    const fullPath = lookupNestedMessage(dictionary, key);
    if (fullPath !== undefined) return fullPath;

    // Vuetify-style callers use a namespace prefix that some locale dictionaries omit.
    if (key.startsWith('$vuetify.')) {
        const unprefixedKey = key.slice('$vuetify.'.length);
        if (Object.hasOwn(dictionary, unprefixedKey)) {
            const flat = dictionary[unprefixedKey];
            if (typeof flat === 'string') return flat;
        }
        return lookupNestedMessage(dictionary, unprefixedKey);
    }

    return undefined;
}

function autoRtl(locale: string): boolean {
    return /^(ar|fa|he|ur)(-|$)/.test(locale);
}

export function createLocale(options: LocaleOptions = {}, source?: Ref<string>, parent?: LocaleContext): LocaleContext {
    const selection = source ?? (options.locale !== undefined ? ref(options.locale) : parent?.current ?? ref('zh'));
    const current = computed(() => selection.value);
    const fallback = computed(() => options.fallback ?? options.fallbackLocale ?? parent?.fallback?.value ?? 'zh');

    function resolve(key: string, locale: string): string | undefined {
        const localMessages = options.messages && Object.hasOwn(options.messages, locale)
            ? options.messages[locale]
            : undefined;
        const local = lookupMessage(localMessages, key);
        if (local !== undefined) return local;

        const inherited = parent?.resolve?.(key, locale);
        if (inherited !== undefined) return inherited;

        if (Object.hasOwn(uiMessages, locale)) {
            const builtin = uiMessages[locale as UiLocale] as Readonly<Record<string, string>>;
            if (Object.hasOwn(builtin, key)) return builtin[key];
        }
        return undefined;
    }

    function rtlFor(locale: string): boolean {
        if (options.rtl && Object.hasOwn(options.rtl, locale)) return options.rtl[locale];
        const inherited = parent?.rtlFor?.(locale);
        return inherited ?? autoRtl(locale);
    }

    const isRtl = computed(() => rtlFor(current.value));
    const t = (key: string, params?: Record<string, string | number>) => {
        const template = resolve(key, current.value) ?? resolve(key, fallback.value) ?? key;
        return template.replace(/\{(\w+)\}/g, (match, name: string) => params && Object.hasOwn(params, name) ? String(params[name]) : match);
    };
    const n = (value: number, format?: Intl.NumberFormatOptions) => {
        try { return new Intl.NumberFormat(current.value === 'zh' ? 'zh-CN' : current.value, format).format(value); }
        catch { return new Intl.NumberFormat('en', format).format(value); }
    };

    return { current, isRtl, t, n, fallback, resolve, rtlFor };
}

export function useLocale() { return inject(localeKey, createLocale({}, uiLocale as Ref<string>)); }

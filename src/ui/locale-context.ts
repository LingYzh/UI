import { computed, inject, ref, type Ref } from 'vue';
import { localeKey, uiLocale, uiMessages, type LocaleContext, type UiLocale } from './locale';

export interface LocaleOptions {
    locale?: string;
    fallback?: string;
    messages?: Record<string, Record<string, string>>;
    rtl?: Record<string, boolean>;
}
export function createLocale(options: LocaleOptions = {}, source?: Ref<string>): LocaleContext {
    const selection = source ?? ref(options.locale ?? 'zh');
    const current = computed(() => selection.value);
    const isRtl = computed(() => options.rtl?.[current.value] ?? /^(ar|fa|he|ur)(-|$)/.test(current.value));
    const t = (key: string, params?: Record<string, string | number>) => {
        const get = (locale: string) => options.messages?.[locale]?.[key] ?? (uiMessages[locale as UiLocale] as Record<string, string> | undefined)?.[key];
        const text = get(current.value) ?? get(options.fallback ?? 'zh') ?? key;
        return text.replace(/\{(\w+)\}/g, (match, name: string) => params && Object.hasOwn(params, name) ? String(params[name]) : match);
    };
    const n = (value: number, format?: Intl.NumberFormatOptions) => {
        try { return new Intl.NumberFormat(current.value === 'zh' ? 'zh-CN' : current.value, format).format(value); }
        catch { return new Intl.NumberFormat('en', format).format(value); }
    };
    return { current, isRtl, t, n };
}
export function useLocale() { return inject(localeKey, createLocale({}, uiLocale as Ref<string>)); }

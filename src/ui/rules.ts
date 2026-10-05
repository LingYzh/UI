import { inject, type InjectionKey } from 'vue';
import type { ValidationRule } from './validation';

export type RuleFactory = (...args: any[]) => ValidationRule;
export type RuleAliases = Record<string, RuleFactory>;
export const rulesKey: InjectionKey<RuleAliases> = Symbol('u-rules');
export function createRules(custom: RuleAliases = {}): RuleAliases {
    return {
        required: (message = '此项为必填项。') => value => (Array.isArray(value) ? value.length > 0 : value === 0 || value === false || !!value) || message,
        email: (message = '请输入有效的邮箱地址。') => value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) || message,
        number: (message = '请输入有效的数字。') => value => value === '' || value == null || Number.isFinite(Number(value)) || message,
        integer: (message = '请输入整数。') => value => value === '' || value == null || Number.isInteger(Number(value)) || message,
        minLength: (length: number, message = `至少输入 ${length} 个字符。`) => value => value == null || String(value).length >= length || message,
        maxLength: (length: number, message = `最多输入 ${length} 个字符。`) => value => value == null || String(value).length <= length || message,
        strictLength: (length: number, message = `需要 ${length} 个字符。`) => value => value == null || String(value).length === length || message,
        pattern: (pattern: RegExp, message = '输入格式不正确。') => value => { pattern.lastIndex = 0; return value === '' || value == null || pattern.test(String(value)) || message; },
        notEmpty: (message = '请选择或输入内容。') => value => Array.isArray(value) ? value.length > 0 || message : !!String(value ?? '').trim() || message,
        ...custom
    };
}
export function useRules(): RuleAliases { return inject(rulesKey, createRules()); }

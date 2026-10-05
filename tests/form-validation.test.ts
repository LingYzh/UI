import assert from 'node:assert/strict';
import test from 'node:test';
import { createValidationRunner, type ValidationRule } from '../src/ui/validation';

interface HarnessOptions {
    value?: string;
    rules?: readonly ValidationRule<string>[];
    nativeError?: string;
    externalErrors?: string[];
    enabled?: boolean;
    maxErrors?: number;
    fallback?: string;
    failure?: string;
    beforeValidate?: () => Promise<unknown>;
}

function createHarness(options: HarnessOptions = {}) {
    const state = {
        value: options.value ?? 'initial',
        rules: [...(options.rules ?? [])],
        nativeError: options.nativeError ?? '',
        externalErrors: [...(options.externalErrors ?? [])],
        enabled: options.enabled ?? true,
        maxErrors: options.maxErrors ?? 10
    };
    const commits: string[][] = [];
    const runner = createValidationRunner<string>({
        value: () => state.value,
        rules: () => state.rules,
        nativeError: () => state.nativeError,
        externalErrors: () => state.externalErrors,
        enabled: () => state.enabled,
        maxErrors: () => state.maxErrors,
        fallback: () => options.fallback ?? 'Invalid value',
        failure: () => options.failure ?? 'Validation failed',
        beforeValidate: options.beforeValidate ?? (async () => {}),
        commit: (errors) => commits.push([...errors])
    });
    return { state, runner, commits };
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

test('sync and async rules accept true, use a fallback for false, and keep explicit messages', async () => {
    const { runner, commits } = createHarness({
        rules: [
            () => true,
            () => false,
            () => 'Use a stronger value',
            async () => true,
            async () => false,
            async () => 'Must be unique'
        ]
    });

    const result = await runner.validate();

    assert.deepEqual(result, {
        valid: false,
        errorMessages: ['Invalid value', 'Use a stronger value', 'Must be unique']
    });
    assert.deepEqual(commits, [['Invalid value', 'Use a stronger value', 'Invalid value', 'Must be unique']]);
});

test('runs async rules in declaration order and converts thrown failures to a message', async () => {
    const order: string[] = [];
    const { runner, commits } = createHarness({
        failure: 'Could not validate this value',
        rules: [
            async () => { order.push('first:start'); await Promise.resolve(); order.push('first:end'); return true; },
            async () => { order.push('second'); throw new Error('private error detail'); },
            () => { order.push('third'); return false; }
        ]
    });

    const result = await runner.validate();

    assert.deepEqual(order, ['first:start', 'first:end', 'second', 'third']);
    assert.deepEqual(result.errorMessages, ['Could not validate this value', 'Invalid value']);
    assert.deepEqual(commits, [['Could not validate this value', 'Invalid value']]);
});

test('native validity counts toward maxErrors and stops later rules', async () => {
    let secondRuleRan = false;
    const { runner, commits } = createHarness({
        nativeError: 'Enter a valid email address',
        maxErrors: 2.9,
        rules: [() => 'Email is already in use', () => { secondRuleRan = true; return 'Another error'; }]
    });

    const result = await runner.validate();

    assert.equal(secondRuleRan, false);
    assert.deepEqual(result.errorMessages, ['Enter a valid email address', 'Email is already in use']);
    assert.deepEqual(commits, [['Enter a valid email address', 'Email is already in use']]);

    let zeroLimitRuleRan = false;
    const zeroLimit = createHarness({ nativeError: 'Required', maxErrors: 0, rules: [() => { zeroLimitRuleRan = true; return false; }] });
    assert.deepEqual((await zeroLimit.runner.validate()).errorMessages, ['Required']);
    assert.equal(zeroLimitRuleRan, false, 'the effective minimum is one error');
});

test('external errors are deduplicated in the result while commit receives rule and native errors only', async () => {
    let passes = false;
    const { state, runner, commits } = createHarness({
        externalErrors: ['Remote check failed', 'Duplicate message'],
        rules: [() => passes ? true : 'Duplicate message']
    });

    const first = await runner.validate();
    assert.deepEqual(first, { valid: false, errorMessages: ['Remote check failed', 'Duplicate message'] });
    assert.deepEqual(commits, [['Duplicate message']]);

    state.externalErrors.length = 0;
    passes = true;
    assert.deepEqual(await runner.validate(), { valid: true, errorMessages: [] });
    assert.deepEqual(commits, [['Duplicate message'], []]);
});

test('disabled validation skips native, external, and rule errors and commits an empty list', async () => {
    let ruleRan = false;
    const { runner, commits } = createHarness({
        enabled: false,
        nativeError: 'Native error',
        externalErrors: ['Server error'],
        rules: [() => { ruleRan = true; return 'Rule error'; }]
    });

    assert.deepEqual(await runner.validate(), { valid: true, errorMessages: [] });
    assert.equal(ruleRan, false);
    assert.deepEqual(commits, [[]]);
});

test('value changes while an async rule is pending cancel its stale result without committing', async () => {
    const pending = deferred<boolean | string>();
    const ruleStarted = deferred<void>();
    const { state, runner, commits } = createHarness({ rules: [() => { ruleStarted.resolve(); return pending.promise; }] });

    const validation = runner.validate();
    await ruleStarted.promise;
    state.value = 'edited';
    pending.resolve('Error for the previous value');

    assert.deepEqual(await validation, { valid: false, errorMessages: [], cancelled: true });
    assert.deepEqual(commits, []);
});

test('a newer validation supersedes an older one even when the value is unchanged', async () => {
    const oldResult = deferred<boolean | string>();
    const firstRuleStarted = deferred<void>();
    let invocation = 0;
    const { runner, commits } = createHarness({ rules: [() => {
        if (++invocation === 1) { firstRuleStarted.resolve(); return oldResult.promise; }
        return true;
    }] });

    const first = runner.validate();
    await firstRuleStarted.promise;
    assert.deepEqual(await runner.validate(), { valid: true, errorMessages: [] });
    oldResult.resolve('Stale result');

    assert.deepEqual(await first, { valid: false, errorMessages: [], cancelled: true });
    assert.deepEqual(commits, [[]], 'only the newest validation commits');
});

test('invalidate cancels pending work, as reset should, and advances the generation', async () => {
    const pending = deferred<boolean | string>();
    const { runner, commits } = createHarness({ rules: [() => pending.promise] });
    const validation = runner.validate();
    const revision = runner.revision();

    runner.invalidate();
    assert.equal(runner.revision(), revision + 1);
    pending.resolve(false);

    assert.deepEqual(await validation, { valid: false, errorMessages: [], cancelled: true });
    assert.deepEqual(commits, []);
});

test('value changes during beforeValidate cancel before rules run', async () => {
    const before = deferred<void>();
    let ruleRan = false;
    const { state, runner, commits } = createHarness({
        beforeValidate: () => before.promise,
        rules: [() => { ruleRan = true; return false; }]
    });

    const validation = runner.validate();
    state.value = 'reset value';
    before.resolve();

    assert.deepEqual(await validation, { valid: false, errorMessages: [], cancelled: true });
    assert.equal(ruleRan, false);
    assert.deepEqual(commits, []);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { computed, defineComponent, h, provide, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createServer } from 'vite';
import { defaultsKey, useDefaults } from '../src/ui/defaults';
import { formContextKey, useFormControl, type FormContext } from '../src/ui/form';

const files = [
    'UiCheckbox', 'UiRadio', 'UiSwitch', 'UiColorSwatches', 'UiInput', 'UiTextarea', 'UiSelect', 'UiSelectNative',
    'UAutocomplete', 'UCombobox', 'USelectionControlGroup', 'URadioGroup', 'UCheckboxGroup',
    'UItemGroup', 'UChipGroup', 'UBtnGroup', 'UBtnToggle', 'UNumberInput', 'UFileInput',
    'UFileUpload', 'USlider', 'URangeSlider', 'UOtpInput', 'UColorPicker', 'UColorInput', 'URating'
];

function formContext(): FormContext {
    return {
        disabled: computed(() => false), readonly: computed(() => false), dense: computed(() => true), ghost: computed(() => true),
        rounded: computed(() => true), labelPosition: computed(() => 'top' as const), labelWidth: computed(() => '180px'),
        validateOn: computed(() => 'input' as const), hideDetails: computed(() => true), resetting: ref(false),
        register: () => {}, unregister: () => {}
    };
}

test('real Vue props preserve omitted, explicit false and scoped false across form controls', { timeout: 60_000 }, async () => {
    const vite = await createServer({ server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true }, appType: 'custom', logLevel: 'silent' });
    try {
        for (const file of files) {
            const component = (await vite.ssrLoadModule(`/src/ui/${file}.vue`)).default as { props: Record<string, unknown> };
            assert.ok('dense' in component.props, `${file} runtime props: ${Object.keys(component.props ?? {}).join(',')}`);
            if (['URadioGroup', 'UCheckboxGroup', 'UChipGroup', 'UBtnGroup', 'UBtnToggle'].includes(file)) {
                assert.ok('mandatory' in component.props, `${file} mandatory prop`);
                assert.ok('direction' in component.props, `${file} direction prop`);
                assert.ok('valueComparator' in component.props, `${file} valueComparator prop`);
                assert.ok('modelValue' in component.props, `${file} modelValue prop`);
                assert.ok('max' in component.props === (file !== 'URadioGroup'), `${file} max contract`);
                assert.ok('multiple' in component.props === !['URadioGroup', 'UCheckboxGroup'].includes(file), `${file} multiple contract`);
            }
            async function inspect(incoming: Record<string, unknown>, global: Record<string, unknown> = {}) {
                let result: Record<string, unknown> = {};
                const Probe = defineComponent({
                    props: component.props,
                    setup(raw) {
                        const effective = useDefaults(raw, file === 'UiInput' ? 'UTextField' : file.replace(/^Ui(?=[A-Z])/, 'U'));
                        const control = useFormControl(effective, ref(null), ref(undefined));
                        result = {
                            rawDense: raw.dense, rawGhost: raw.ghost, rawRounded: raw.rounded,
                            rawHideDetails: raw.hideDetails, rawPersistentHint: raw.persistentHint,
                            dense: control.dense.value, ghost: control.ghost.value, rounded: control.rounded.value,
                            hideDetails: effective.hideDetails, persistentHint: effective.persistentHint
                        };
                        return () => h('span');
                    }
                });
                const Root = defineComponent({
                    setup() {
                        provide(formContextKey, formContext());
                        provide(defaultsKey, computed(() => ({ global })));
                return () => h(Probe, { value: 'test', ...incoming });
                    }
                });
                await renderToString(h(Root));
                return result;
            }

            const omitted = await inspect({});
            assert.equal(omitted.rawDense, undefined, `${file} dense omitted`);
            assert.equal(omitted.rawGhost, undefined, `${file} ghost omitted`);
            assert.equal(omitted.rawRounded, undefined, `${file} rounded omitted`);
            assert.equal(omitted.rawHideDetails, undefined, `${file} hideDetails omitted`);
            assert.equal(omitted.rawPersistentHint, undefined, `${file} persistentHint omitted`);
            assert.equal(omitted.dense, true, `${file} inherits dense`);
            assert.equal(omitted.ghost, true, `${file} inherits ghost`);
            assert.equal(omitted.rounded, true, `${file} inherits rounded`);

            const explicit = await inspect({ dense: false, ghost: false, rounded: false, hideDetails: false, persistentHint: false },
                { dense: true, ghost: true, rounded: true, hideDetails: true, persistentHint: true });
            assert.equal(explicit.dense, false, `${file} explicit dense false: ${JSON.stringify(explicit)}`);
            assert.equal(explicit.ghost, false, `${file} explicit ghost false`);
            assert.equal(explicit.rounded, false, `${file} explicit rounded false`);
            assert.equal(explicit.hideDetails, false, `${file} explicit hideDetails false`);
            assert.equal(explicit.persistentHint, false, `${file} explicit persistentHint false`);

            const scoped = await inspect({}, { rounded: false, hideDetails: false, persistentHint: false });
            assert.equal(scoped.rounded, false, `${file} global rounded false`);
            assert.equal(scoped.hideDetails, false, `${file} global hideDetails false`);
            assert.equal(scoped.persistentHint, false, `${file} global persistentHint false`);
        }
    } finally {
        await vite.close();
    }
});

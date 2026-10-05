import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { compileScript, parse } from '@vue/compiler-sfc';

const componentProps: Record<string, string> = {
    UDataTable: 'headers', UDataTableVirtual: 'headers', UDataIterator: 'items',
    UExpansionPanels: 'multiple', UExpansionPanel: 'value',
    UStepper: 'disabled', UStepperVertical: 'disabled', UStepperItem: 'value', UStepperWindowItem: 'value',
    UWindow: 'disabled', UWindowItem: 'value', UCarousel: 'interval', UCarouselItem: 'value',
    UDateInput: 'mode', UDatePicker: 'mode', UTimePicker: 'format', UCalendar: 'events', UPicker: 'items',
    UConfirmEdit: 'validate', UImg: 'src', UResponsive: 'aspectRatio', UHover: 'openDelay',
    UHotkey: 'keys', UKbd: 'keys', ULazy: 'rootMargin', UInfiniteScroll: 'rootMargin',
    UParallax: 'speed', UPullToRefresh: 'threshold', USparkline: 'values', UTimeline: 'side',
    UTimelineItem: 'title', USpeedDial: 'disabled', UFab: 'disabled',
    UProgressLinear: 'max', UProgressCircular: 'max', UiDataTableServer: 'headers'
};

test('data completion components retain runtime props after defaults wrapping', () => {
    for (const [name, key] of Object.entries(componentProps)) {
        const filename = join(process.cwd(), 'src', 'ui', `${name}.vue`);
        const descriptor = parse(readFileSync(filename, 'utf8'), { filename }).descriptor;
        const compiled = compileScript(descriptor, { id: name, fs: { fileExists: existsSync, readFile: (path) => readFileSync(path, 'utf8') } }).content;
        assert.match(compiled, new RegExp(`\\b${key}:\\s*\\{`), `${name} must declare runtime prop ${key}`);
        assert.match(compiled, /const rawProps = __props/, `${name} must bind the compiled props before defaults`);
        const defaultsName = name === 'UiDataTableServer' ? 'UDataTableServer' : name;
        assert.match(compiled, new RegExp(`useDefaults\\(rawProps, '${defaultsName}'\\)`), `${name} must read scoped defaults`);
    }
});

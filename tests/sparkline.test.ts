import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildMonotoneSparklinePath,
    buildRoundedSparklinePath,
    buildSparklineBars,
    buildSparklineGeometry,
    buildSparklineGradient,
    buildSparklinePath,
    extendSparklinePoints,
    findNearestSparklineIndex,
    moveSparklineIndex,
    normalizeSparklineValues,
    resampleSparklineValues,
    sparklineExitIndex,
    sparklineFocusIndex,
    sparklineIndexFromPointer,
    sparklineTooltipDefaults,
    type SparklinePoint
} from '../src/ui/sparkline';

test('standard modelValue resolves number and nested object values while values remains the local override', () => {
    assert.deepEqual(normalizeSparklineValues({ modelValue: [3, { value: '4.5' }, { value: 8 }] }), [3, 4.5, 8]);
    assert.deepEqual(normalizeSparklineValues({
        modelValue: [{ metrics: { score: '7.25' } }, { metrics: { score: 2 } }],
        itemValue: 'metrics.score'
    }), [7.25, 2]);
    assert.deepEqual(normalizeSparklineValues({ modelValue: [{ metrics: [{ score: 6 }] }], itemValue: 'metrics[0].score' }), [6]);
    assert.deepEqual(normalizeSparklineValues({ values: [10, 20], modelValue: [1, 2] }), [10, 20]);
    assert.deepEqual(normalizeSparklineValues({ modelValue: [{ missing: true }] }), [0]);
});

test('trend geometry uses padded bounds, min/max scaling, and upstream duplicate-point behavior for one sample', () => {
    const geometry = buildSparklineGeometry({ values: [2, 4, 6], width: 100, height: 50, padding: 5 });
    assert.deepEqual(geometry.boundary, { minX: 5, maxX: 95, minY: 5, maxY: 45 });
    assert.deepEqual(geometry.points, [
        { x: 5, y: 45, value: 2, index: 0 },
        { x: 50, y: 25, value: 4, index: 1 },
        { x: 95, y: 5, value: 6, index: 2 }
    ]);
    assert.equal(geometry.path, 'M5 45L50 25L95 5');

    const one = buildSparklineGeometry({ modelValue: [{ value: 9 }], width: 60, height: 30, padding: 8 });
    assert.deepEqual(one.points.map(point => point.value), [9, 9]);
    assert.deepEqual(one.points.map(point => point.x), [8, 52]);
    assert.deepEqual(buildSparklineGeometry({ values: [] }).points, []);
});

test('trend min/max overrides and equal domains preserve stable finite coordinates', () => {
    const geometry = buildSparklineGeometry({ values: [10, 20], min: 0, max: 40, width: 100, height: 60, padding: 10 });
    assert.deepEqual(geometry.points.map(point => point.y), [40, 30]);
    const equal = buildSparklineGeometry({ values: [4, 4], min: 4, max: 4, width: 50, height: 30, padding: 5 });
    assert.deepEqual(equal.points.map(point => point.y), [25, 25]);
});

test('bar geometry preserves positive/negative zero baseline, width floor, and centered offsets', () => {
    const mixed = buildSparklineBars([3, -1], 100, 40, 10);
    assert.equal(mixed.totalWidth, 100);
    assert.equal(mixed.offsetX, 20);
    assert.deepEqual(mixed.bars, [
        { x: 0, y: 0, height: 30, value: 3, index: 0 },
        { x: 50, y: 30, height: 10, value: -1, index: 1 }
    ]);

    const positive = buildSparklineBars([2, 4], 100, 40, 8);
    assert.deepEqual(positive.bars.map(bar => [bar.y, bar.height]), [[20, 20], [0, 40]]);
    const negative = buildSparklineBars([-3, -1], 100, 40, 8);
    assert.deepEqual(negative.bars.map(bar => [bar.y, bar.height]), [[0, 40], [0, 13.333333333333334]]);
    const single = buildSparklineBars([5], 20, 40, 12);
    assert.equal(single.totalWidth, 20);
    assert.equal(single.offsetX, 4);
    assert.equal(buildSparklineBars([1, 2, 3], 10, 40, 8).totalWidth, 24);
});

test('labels match distinct trend/bar fallbacks and the upstream label viewport sizing', () => {
    const trend = buildSparklineGeometry({
        values: [3, 4],
        labels: ['peak', 0],
        showLabels: true,
        width: 100,
        height: 40,
        labelSize: 8
    });
    assert.equal(trend.hasLabels, true);
    assert.equal(trend.totalHeight, 52);
    assert.deepEqual(trend.labels.map(label => label.value), ['peak', '4']);
    assert.deepEqual(trend.labels.map(label => label.y), [44, 44]);

    const bar = buildSparklineGeometry({ type: 'bar', values: [3, 4], labels: ['peak', 0], labelSlot: true, height: 40, labelSize: 8 });
    assert.deepEqual(bar.labels.map(label => label.value), ['peak', '0']);
    assert.deepEqual(bar.labels.map(label => label.y), [46, 46]);
    assert.equal(buildSparklineGeometry({ values: [1], labelSize: 9 }).totalHeight, 75);
});

test('gradient colors reverse, use evenly spaced stops, and preserve upstream direction vectors', () => {
    assert.deepEqual(buildSparklineGradient(['red', 'blue'], 'left'), {
        x1: '100%', y1: '0', x2: '0', y2: '0',
        stops: [{ offset: 0, color: 'blue' }, { offset: 1, color: 'red' }]
    });
    assert.deepEqual(buildSparklineGradient([], 'bottom'), {
        x1: '0', y1: '0', x2: '0', y2: '100%', stops: [{ offset: 0, color: 'currentColor' }]
    });
    assert.equal(buildSparklineGradient(['', 'green'], 'top').stops[0].color, 'green');
    assert.deepEqual(['top', 'bottom', 'left', 'right'].map(direction => {
        const { x1, y1, x2, y2 } = buildSparklineGradient([], direction as 'top' | 'bottom' | 'left' | 'right');
        return [x1, y1, x2, y2];
    }), [['0', '100%', '0', '0'], ['0', '0', '0', '100%'], ['100%', '0', '0', '0'], ['0', '0', '100%', '0']]);
});

test('rounded and monotone paths cover straight, filled, smooth, and animation-stable structures without mutation', () => {
    const points: SparklinePoint[] = [
        { x: 0, y: 10, value: 0, index: 0 },
        { x: 10, y: 5, value: 5, index: 1 },
        { x: 20, y: 10, value: 0, index: 2 }
    ];
    const original = structuredClone(points);
    const rounded = buildRoundedSparklinePath(points, 0);
    assert.match(rounded, /^M0 10/);
    assert.match(rounded, /L10 5S10 5 10 5/);
    assert.match(buildRoundedSparklinePath(points, 2), /S10 5/);
    assert.match(buildRoundedSparklinePath(points, 0, true, 40), /^M0 42 L0 10/);
    assert.match(buildSparklinePath(points, { smooth: true, smoothMode: 'monotone' }), /C/);
    assert.match(buildMonotoneSparklinePath(points, 0, true, 40), /Z$/);
    assert.match(buildRoundedSparklinePath(points, 0, false, 40, true), /S20 10 20 10$/);
    assert.deepEqual(points, original);
});

test('inset extrapolates end points and animation resampling is deterministic and non-mutating', () => {
    const points: SparklinePoint[] = [
        { x: 10, y: 20, value: 1, index: 0 },
        { x: 20, y: 10, value: 2, index: 1 },
        { x: 30, y: 20, value: 3, index: 2 }
    ];
    const inset = extendSparklinePoints(points, true, 40);
    assert.deepEqual(inset.map(point => [point.x, point.y]), [[0, 30], [10, 20], [20, 10], [30, 20], [40, 30]]);
    assert.deepEqual(extendSparklinePoints(points, false, 40), points);
    assert.deepEqual(resampleSparklineValues([0, 10], 3), [0, 5, 10]);
    assert.deepEqual(resampleSparklineValues([4], 3), [4, 4, 4]);
    assert.deepEqual(resampleSparklineValues([], 2), [0, 0]);
    assert.deepEqual(resampleSparklineValues([1, 2, 3], 1), [1]);
});

test('currentIndex follows nearest trend points/bar centers, focus, arrow keys, and tooltip exit lifecycle', () => {
    const trend = buildSparklineGeometry({ values: [1, 2, 3], width: 100, padding: 10 });
    assert.equal(findNearestSparklineIndex(11, trend), 0);
    assert.equal(findNearestSparklineIndex(88, trend), 2);
    assert.equal(sparklineIndexFromPointer(75, { left: 25, width: 100 }, trend), 1);
    assert.equal(sparklineIndexFromPointer(50, { left: 0, width: 0 }, trend), null);

    const bars = buildSparklineGeometry({ type: 'bar', values: [1, 2, 3], width: 90, lineWidth: 10 });
    assert.equal(findNearestSparklineIndex(29, bars), 0);
    assert.equal(findNearestSparklineIndex(31, bars), 1);
    assert.equal(sparklineFocusIndex(3), 2);
    assert.equal(sparklineFocusIndex(0), null);
    assert.equal(moveSparklineIndex(null, 'ArrowRight', 3), 0);
    assert.equal(moveSparklineIndex(null, 'ArrowLeft', 3), 2);
    assert.equal(moveSparklineIndex(2, 'ArrowRight', 3), 2);
    assert.equal(moveSparklineIndex(0, 'ArrowLeft', 3), 0);
    assert.equal(moveSparklineIndex(1, 'Enter', 3), undefined);
    assert.equal(moveSparklineIndex(null, 'ArrowRight', 0), undefined);
    assert.equal(sparklineExitIndex(1, true), 1);
    assert.equal(sparklineExitIndex(1, false), null);
    assert.equal(sparklineExitIndex(1, true, true), null);
    const tooltip = sparklineTooltipDefaults('trend');
    assert.equal(tooltip.showCrosshair, true);
    assert.equal(tooltip.offset, 16);
    assert.equal(tooltip.titleFormat({ index: 1, value: 4 }), '4');
    assert.deepEqual(sparklineTooltipDefaults('bar', { showCrosshair: true, offset: 3 }).showCrosshair, true);
});

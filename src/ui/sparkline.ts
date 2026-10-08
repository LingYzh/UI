export type SparklineType = 'trend' | 'bar';
export type SparklineDirection = 'top' | 'bottom' | 'left' | 'right';
export type SparklineSmoothMode = 'default' | 'monotone';
export interface SparklineAnimationOptions {
    duration?: number;
    easing?: string;
}
export type SparklineDatum = number | string | Readonly<Record<string, unknown>>;
export type SparklineLabelInput = string | number | Readonly<Record<string, unknown>>;

export interface SparklinePoint {
    x: number;
    y: number;
    value: number;
    index: number;
}

export interface SparklineBar {
    x: number;
    y: number;
    height: number;
    value: number;
    index: number;
}

export interface SparklineBoundary {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export interface SparklineGradientStop {
    offset: number;
    color: string;
}

export interface SparklineGradient {
    x1: '0' | '100%';
    y1: '0' | '100%';
    x2: '0' | '100%';
    y2: '0' | '100%';
    stops: SparklineGradientStop[];
}

export interface SparklineLabel {
    x: number;
    y: number;
    fontSize: number;
    index: number;
    value: string;
}

export interface SparklineOptions {
    /** Local extension. When supplied, this takes precedence over modelValue. */
    values?: readonly SparklineDatum[];
    /** Standard Vuetify input protocol. */
    modelValue?: readonly SparklineDatum[];
    itemValue?: string;
    type?: SparklineType;
    width?: number | string;
    height?: number | string;
    min?: number | string | null;
    max?: number | string | null;
    padding?: number | string;
    lineWidth?: number | string;
    markerSize?: number | string;
    smooth?: boolean | number | string;
    smoothMode?: SparklineSmoothMode;
    fill?: boolean;
    inset?: boolean;
    animation?: boolean | SparklineAnimationOptions;
    labels?: readonly SparklineLabelInput[];
    showLabels?: boolean;
    labelSlot?: boolean;
    labelSize?: number | string;
    gradient?: readonly string[];
    gradientDirection?: SparklineDirection;
}

export interface SparklineGeometry {
    type: SparklineType;
    values: number[];
    points: SparklinePoint[];
    pathPoints: SparklinePoint[];
    bars: SparklineBar[];
    boundary: SparklineBoundary;
    width: number;
    totalWidth: number;
    height: number;
    totalHeight: number;
    lineWidth: number;
    barOffsetX: number;
    markerRadius: number;
    cornerRadius: number;
    hasLabels: boolean;
    labels: SparklineLabel[];
    gradient: SparklineGradient;
    strokePath: string;
    fillPath: string;
    path: string;
}

function finiteNumber(value: unknown, fallback: number): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function parseInteger(value: unknown, fallback: number): number {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function parseFloatOr(value: unknown, fallback: number): number {
    const parsed = Number.parseFloat(String(value));
    return parsed || fallback;
}

function readPathValue(item: SparklineDatum, path: string): unknown {
    if (item === null || typeof item !== 'object') return item;

    const record = item as Readonly<Record<string, unknown>>;
    if (record[path] !== undefined) return record[path];

    const segments = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
    let value: unknown = item;
    for (const segment of segments) {
        if (value === null || typeof value !== 'object') return item;
        const next = (value as Readonly<Record<string, unknown>>)[segment];
        if (next === undefined) return item;
        value = next;
    }
    return value;
}

/**
 * Resolve both Vuetify's number/object modelValue items and this library's
 * legacy numeric values prop. Missing itemValue paths fall back to the item,
 * as Vuetify's getPropertyFromItem(item, itemValue, item) call does.
 */
export function normalizeSparklineValues(options: Pick<SparklineOptions, 'values' | 'modelValue' | 'itemValue'>): number[] {
    const items = options.values ?? options.modelValue ?? [];
    const itemValue = options.itemValue ?? 'value';

    return items.map((item) => {
        const raw = readPathValue(item, itemValue);
        let parsed: number;
        try {
            parsed = typeof raw === 'number' ? raw : Number(raw);
        } catch {
            parsed = Number.NaN;
        }
        // Preserve the existing component's finite-value fallback to zero.
        return Number.isFinite(parsed) ? parsed : 0;
    });
}

function resolveDomain(values: readonly number[], min?: number | string | null, max?: number | string | null, includeZero = false): { min: number; max: number } {
    const dataMin = values.length ? Math.min(...values) : 0;
    const dataMax = values.length ? Math.max(...values) : 1;
    let minValue = min == null ? dataMin : finiteNumber(min, dataMin);
    let maxValue = max == null ? dataMax : finiteNumber(max, dataMax);

    if (includeZero && min == null && minValue > 0) minValue = 0;
    if (includeZero && max == null && maxValue < 0) maxValue = 0;
    return { min: minValue, max: maxValue };
}

export function buildTrendPoints(values: readonly number[], boundary: SparklineBoundary, min?: number | string | null, max?: number | string | null): SparklinePoint[] {
    const samples = values.length === 1 ? [values[0], values[0]] : [...values];
    if (!samples.length) return [];

    const domain = resolveDomain(samples, min, max);
    const gridX = (boundary.maxX - boundary.minX) / (samples.length - 1);
    const gridY = (boundary.maxY - boundary.minY) / (domain.max - domain.min || 1);
    return samples.map((value, index) => ({
        x: boundary.minX + index * gridX,
        y: boundary.maxY - (value - domain.min) * gridY,
        value,
        index
    }));
}

export function buildSparklineBars(values: readonly number[], width: number, height: number, lineWidth: number, min?: number | string | null, max?: number | string | null): { bars: SparklineBar[]; offsetX: number; boundary: SparklineBoundary; totalWidth: number } {
    const totalWidth = Math.max(values.length * lineWidth, width);
    const boundary: SparklineBoundary = { minX: 0, maxX: totalWidth, minY: 0, maxY: height };
    if (!values.length) return { bars: [], offsetX: 0, boundary, totalWidth };

    const domain = resolveDomain(values, min, max, true);
    const gridX = totalWidth / (values.length === 1 ? 2 : values.length);
    const gridY = (height - boundary.minY) / (domain.max - domain.min || 1);
    const horizonY = height - Math.abs(domain.min * gridY);
    const bars = values.map((value, index) => {
        const barHeight = Math.abs(gridY * value);
        return {
            x: boundary.minX + index * gridX,
            y: horizonY - barHeight + Number(value < 0) * barHeight,
            height: barHeight,
            value,
            index
        };
    });
    const offsetX = values.length === 1 ? (boundary.maxX - lineWidth) / 2 : (Math.abs(bars[0].x - bars[1].x) - lineWidth) / 2;
    return { bars, offsetX, boundary, totalWidth };
}

export function extendSparklinePoints(points: readonly SparklinePoint[], inset: boolean, totalWidth: number): SparklinePoint[] {
    if (!inset || points.length < 2) return points.map(point => ({ ...point }));

    const first = points[0];
    const second = points[1];
    const last = points[points.length - 1];
    const secondLast = points[points.length - 2];
    const startDx = second.x - first.x;
    const endDx = last.x - secondLast.x;
    const slopeStart = startDx === 0 ? 0 : (second.y - first.y) / startDx;
    const slopeEnd = endDx === 0 ? 0 : (last.y - secondLast.y) / endDx;
    const ghostStart: SparklinePoint = { x: 0, y: first.y - first.x * slopeStart, value: first.value, index: first.index };
    const ghostEnd: SparklinePoint = { x: totalWidth, y: last.y + (totalWidth - last.x) * slopeEnd, value: last.value, index: last.index };
    return [ghostStart, ...points.map(point => ({ ...point })), ghostEnd];
}

export function resampleSparklineValues(values: readonly number[], targetCount: number): number[] {
    const count = Math.max(0, Math.floor(targetCount));
    if (count === 0) return [];
    if (!values.length) return Array(count).fill(0);
    if (values.length === 1) return Array(count).fill(values[0]);
    if (count === 1) return [values[0]];

    const result: number[] = [];
    for (let index = 0; index < count; index++) {
        const position = index / (count - 1) * (values.length - 1);
        const low = Math.floor(position);
        const high = Math.min(low + 1, values.length - 1);
        const fraction = position - low;
        result.push(values[low] + (values[high] - values[low]) * fraction);
    }
    return result;
}

function distance(a: SparklinePoint, b: SparklinePoint): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function pointAlong(from: SparklinePoint, to: SparklinePoint, radius: number): { x: number; y: number } {
    const length = distance(from, to);
    if (!length) return { x: from.x, y: from.y };
    return {
        x: from.x + (to.x - from.x) / length * radius,
        y: from.y + (to.y - from.y) / length * radius
    };
}

function checkCollinear(previous: SparklinePoint, point: SparklinePoint, next: SparklinePoint): boolean {
    return Number.parseInt(String(previous.x + next.x), 10) === Number.parseInt(String(2 * point.x), 10)
        && Number.parseInt(String(previous.y + next.y), 10) === Number.parseInt(String(2 * point.y), 10);
}

export function buildRoundedSparklinePath(points: readonly SparklinePoint[], radius: number, fill = false, height = 75, consistentStructure = false): string {
    if (!points.length) return '';

    const start = points[0];
    const remainder = points.slice(1);
    const end = points[points.length - 1];
    const baseline = height - start.x + 2;
    const prefix = fill ? `M${start.x} ${baseline} L${start.x} ${start.y}` : `M${start.x} ${start.y}`;
    const segments = remainder.map((point, index) => {
        const next = remainder[index + 1];
        const previous = remainder[index - 1] ?? start;
        const collinear = !!next && checkCollinear(previous, point, next);

        if (!next) {
            return consistentStructure
                ? `L${point.x} ${point.y}S${point.x} ${point.y} ${point.x} ${point.y}`
                : `L${point.x} ${point.y}`;
        }
        if (collinear && !consistentStructure) return `L${point.x} ${point.y}`;

        const threshold = Math.min(distance(previous, point), distance(next, point));
        const cornerRadius = Math.min(threshold / 2, radius);
        const before = pointAlong(point, previous, cornerRadius);
        const after = pointAlong(point, next, cornerRadius);
        return `L${before.x} ${before.y}S${point.x} ${point.y} ${after.x} ${after.y}`;
    });
    return prefix + segments.join('') + (fill ? `L${end.x} ${baseline} Z` : '');
}

export function buildMonotoneSparklinePath(points: readonly SparklinePoint[], smooth: number, fill = false, height = 75): string {
    if (!points.length) return '';
    const start = points[0];
    const end = points[points.length - 1];
    const baseline = height - start.x + 2;
    const prefix = fill ? `M${start.x} ${baseline} L${start.x} ${start.y}` : `M${start.x} ${start.y}`;
    const suffix = fill ? `L${end.x} ${baseline} Z` : '';
    if (smooth === 0 || points.length < 3) {
        return prefix + points.slice(1).map(point => `L${point.x} ${point.y}`).join('') + suffix;
    }

    const tension = Math.min(smooth / 8, 1);
    const deltas = Array.from({ length: points.length - 1 }, (_, index) => {
        const dx = points[index + 1].x - points[index].x;
        return dx === 0 ? 0 : (points[index + 1].y - points[index].y) / dx;
    });
    const tangents = new Array<number>(points.length);
    tangents[0] = deltas[0];
    tangents[points.length - 1] = deltas[deltas.length - 1];
    for (let index = 1; index < points.length - 1; index++) {
        const before = deltas[index - 1];
        const after = deltas[index];
        tangents[index] = before === 0 || after === 0 || (before > 0) !== (after > 0) ? 0 : (before + after) / 2;
    }
    for (let index = 0; index < deltas.length; index++) {
        const slope = deltas[index];
        if (slope === 0) {
            tangents[index] = 0;
            tangents[index + 1] = 0;
            continue;
        }
        const alpha = tangents[index] / slope;
        const beta = tangents[index + 1] / slope;
        const squaredSum = alpha * alpha + beta * beta;
        if (squaredSum > 9) {
            const tau = 3 / Math.sqrt(squaredSum);
            tangents[index] = tau * alpha * slope;
            tangents[index + 1] = tau * beta * slope;
        }
    }

    const curves = points.slice(1).map((point, index) => {
        const previous = points[index];
        const dx = point.x - previous.x;
        const control1X = previous.x + dx * tension / 3;
        const control1Y = previous.y + tangents[index] * dx * tension / 3;
        const control2X = point.x - dx * tension / 3;
        const control2Y = point.y - tangents[index + 1] * dx * tension / 3;
        return `C${control1X} ${control1Y} ${control2X} ${control2Y} ${point.x} ${point.y}`;
    });
    return prefix + curves.join('') + suffix;
}

export function buildSparklinePath(points: readonly SparklinePoint[], options: Pick<SparklineOptions, 'smooth' | 'smoothMode' | 'fill' | 'animation'> & { height?: number }): string {
    const smooth = typeof options.smooth === 'boolean'
        ? (options.smooth ? 8 : 0)
        : finiteNumber(options.smooth ?? 0, 0);
    const height = options.height ?? 75;
    if (options.smoothMode === 'monotone') return buildMonotoneSparklinePath(points, smooth, !!options.fill, height);
    return buildRoundedSparklinePath(points, smooth, !!options.fill, height, !!options.animation);
}

export function buildSparklineGradient(colors: readonly string[] = [], direction: SparklineDirection = 'top'): SparklineGradient {
    const gradientColors = colors.length ? [...colors].reverse() : [''];
    const validDirection = ['top', 'bottom', 'left', 'right'].includes(direction) ? direction : 'top';
    return {
        x1: validDirection === 'left' ? '100%' : '0',
        y1: validDirection === 'top' ? '100%' : '0',
        x2: validDirection === 'right' ? '100%' : '0',
        y2: validDirection === 'bottom' ? '100%' : '0',
        stops: gradientColors.map((color, index) => ({
            offset: index / Math.max(gradientColors.length - 1, 1),
            color: color || 'currentColor'
        }))
    };
}

function buildLabels(options: SparklineOptions, type: SparklineType, points: readonly SparklinePoint[], bars: readonly SparklineBar[], barOffsetX: number, lineWidth: number, height: number): SparklineLabel[] {
    const labels = options.labels ?? [];
    const labelSize = finiteNumber(options.labelSize, 7);
    const parsedLabelSize = parseInteger(options.labelSize ?? 7, 7);
    const fallbackLabelY = parsedLabelSize || 7 * 0.75;
    if (type === 'bar') {
        return bars.map((bar, index) => {
            const label = labels[index];
            return {
                x: bar.x + barOffsetX + lineWidth / 2,
                y: height - 2 + fallbackLabelY,
                fontSize: labelSize || 7,
                index,
                value: String(label ?? bar.value)
            };
        });
    }
    return points.map((point, index) => {
        const label = labels[index];
        return {
            x: point.x,
            y: height - 4 + fallbackLabelY,
            fontSize: labelSize || 7,
            index,
            // VTrendline uses a falsy check; VBarline uses nullish fallback.
            value: String(label || point.value)
        };
    });
}

export function buildSparklineGeometry(options: SparklineOptions = {}): SparklineGeometry {
    const type = options.type ?? 'trend';
    const values = normalizeSparklineValues(options);
    const width = finiteNumber(options.width ?? 300, 300);
    const height = parseInteger(options.height ?? 75, 75);
    const lineWidth = parseFloatOr(options.lineWidth ?? 4, 4);
    const padding = finiteNumber(options.padding ?? 8, 8);
    const markerRadius = parseFloatOr(options.markerSize ?? 8, 8) / 2;
    const smooth = typeof options.smooth === 'boolean' ? (options.smooth ? 2 : 0) : finiteNumber(options.smooth ?? 0, 0);
    const cornerRadius = type === 'bar' ? smooth : 0;
    const hasLabels = !!options.showLabels || !!options.labelSlot || !!options.labels?.length;
    const labelSize = parseInteger(options.labelSize ?? 7, 7);
    const totalHeight = height + (hasLabels ? labelSize * 1.5 : 0);

    let boundary: SparklineBoundary;
    let totalWidth: number;
    let barOffsetX = 0;
    let points: SparklinePoint[] = [];
    let bars: SparklineBar[] = [];

    if (type === 'bar') {
        const layout = buildSparklineBars(values, width, height, lineWidth, options.min, options.max);
        boundary = layout.boundary;
        totalWidth = layout.totalWidth;
        barOffsetX = layout.offsetX;
        bars = layout.bars;
    } else {
        totalWidth = width;
        boundary = { minX: padding, maxX: width - padding, minY: padding, maxY: height - padding };
        points = buildTrendPoints(values, boundary, options.min, options.max);
    }

    const pathPoints = type === 'trend' ? extendSparklinePoints(points, !!options.inset, totalWidth) : [];
    const pathOptions = { ...options, height, animation: !!options.animation };
    const strokePath = type === 'trend' ? buildSparklinePath(pathPoints, { ...pathOptions, fill: false }) : '';
    const fillPath = type === 'trend' ? buildSparklinePath(pathPoints, { ...pathOptions, fill: true }) : '';
    const labels = buildLabels(options, type, points, bars, barOffsetX, lineWidth, height);

    return {
        type,
        values,
        points,
        pathPoints,
        bars,
        boundary,
        width,
        totalWidth,
        height,
        totalHeight,
        lineWidth,
        barOffsetX,
        markerRadius,
        cornerRadius,
        hasLabels,
        labels,
        gradient: buildSparklineGradient(options.gradient, options.gradientDirection),
        strokePath,
        fillPath,
        path: options.fill && type === 'trend' ? fillPath : strokePath
    };
}

export function findNearestSparklineIndex(x: number, geometry: Pick<SparklineGeometry, 'type' | 'points' | 'bars' | 'lineWidth' | 'barOffsetX'>): number | null {
    const count = geometry.type === 'bar' ? geometry.bars.length : geometry.points.length;
    if (!count || !Number.isFinite(x)) return null;

    let nearest = 0;
    let minDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < count; index++) {
        const position = geometry.type === 'bar'
            ? geometry.bars[index].x + geometry.barOffsetX + geometry.lineWidth / 2
            : geometry.points[index].x;
        const currentDistance = Math.abs(position - x);
        if (currentDistance < minDistance) {
            minDistance = currentDistance;
            nearest = index;
        }
    }
    return nearest;
}

export function sparklineIndexFromPointer(clientX: number, rect: { left: number; width: number }, geometry: Pick<SparklineGeometry, 'type' | 'points' | 'bars' | 'lineWidth' | 'barOffsetX' | 'totalWidth'>): number | null {
    if (!Number.isFinite(clientX) || !Number.isFinite(rect.left) || !Number.isFinite(rect.width) || rect.width <= 0) return null;
    const chartX = (clientX - rect.left) / rect.width * geometry.totalWidth;
    return findNearestSparklineIndex(chartX, geometry);
}

export function sparklineFocusIndex(count: number): number | null {
    return count > 0 ? count - 1 : null;
}

/** Returns undefined for non-arrow keys or empty data; otherwise the upstream clamped index. */
export function moveSparklineIndex(currentIndex: number | null, key: string, count: number): number | undefined {
    if (count <= 0 || key !== 'ArrowLeft' && key !== 'ArrowRight') return undefined;
    const direction = key === 'ArrowLeft' ? -1 : 1;
    const current = currentIndex ?? (direction === 1 ? -1 : count);
    return Math.max(0, Math.min(count - 1, current + direction));
}

/** Mouseleave/blur clears immediately without a tooltip; otherwise afterLeave clears it. */
export function sparklineExitIndex(currentIndex: number | null, tooltipEnabled: boolean, afterLeave = false): number | null {
    if (currentIndex === null || afterLeave || !tooltipEnabled) return null;
    return currentIndex;
}

export function sparklineTooltipDefaults(type: SparklineType, tooltip?: boolean | { showCrosshair?: boolean; offset?: number; titleFormat?: (item: { index: number; value: number }) => string; class?: unknown }): { showCrosshair: boolean; offset?: number; titleFormat: (item: { index: number; value: number }) => string; class?: unknown } {
    const custom = tooltip && typeof tooltip === 'object' ? tooltip : {};
    return {
        showCrosshair: type === 'trend',
        ...(type === 'trend' ? { offset: 16 } : {}),
        titleFormat: item => String(item.value),
        ...custom
    };
}

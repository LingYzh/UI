import assert from 'node:assert/strict';
import test from 'node:test';
import {
    convertChannel,
    hslToHsv,
    hsvToHsl,
    hsvToRgb,
    parseColorModel,
    rgbToHsv,
    serializeColorModel,
    type HSVA
} from '../src/ui/color-model';

function near(actual: number, expected: number, tolerance = 1e-10): void {
    assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be within ${tolerance} of ${expected}`);
}

test('parses short and full hex, including alpha, into normalized HSVA', () => {
    const short = parseColorModel('#abc');
    assert.ok(short);
    near(short.h, 210);
    near(short.s, 1 / 6);
    near(short.v, 0.8);
    assert.equal(short.a, 1);
    const shortAlpha = parseColorModel('#f008');
    assert.ok(shortAlpha);
    const shortRgb = hsvToRgb(shortAlpha);
    assert.deepEqual(shortRgb, { r: 255, g: 0, b: 0, a: 0x88 / 0xff });

    const fullAlpha = parseColorModel('#12345680');
    assert.ok(fullAlpha);
    assert.deepEqual(hsvToRgb(fullAlpha), { r: 0x12, g: 0x34, b: 0x56, a: 0x80 / 0xff });
});

test('parses comma and modern CSS rgb/rgba and hsl/hsla syntax', () => {
    const rgb = parseColorModel('rgb(100% 0% 50%)');
    assert.ok(rgb);
    assert.deepEqual(hsvToRgb(rgb), { r: 255, g: 0, b: 128, a: 1 });
    assert.equal(serializeColorModel(rgb, 'rgb(100% 0% 50%)'), 'rgb(255 0 128)');

    const rgba = parseColorModel('rgba(1, 2, 3, 0.5)');
    assert.ok(rgba);
    assert.deepEqual(hsvToRgb(rgba), { r: 1, g: 2, b: 3, a: 0.5 });
    const rgbaOutput = serializeColorModel(rgba, 'rgba(1, 2, 3, 0.5)');
    assert.equal(rgbaOutput, 'rgb(1 2 3 / 0.5)');
    assert.deepEqual(parseColorModel(rgbaOutput), rgba);

    const hsl = parseColorModel('hsl(0 100% 50%)');
    assert.ok(hsl);
    assert.deepEqual(hsvToRgb(hsl), { r: 255, g: 0, b: 0, a: 1 });
    assert.equal(serializeColorModel(hsl, 'hsl(0 100% 50%)'), 'hsl(0 100 50)');

    const hsla = parseColorModel('hsla(120deg, 100%, 50%, 25%)');
    assert.ok(hsla);
    assert.deepEqual(hsvToRgb(hsla), { r: 0, g: 255, b: 0, a: 0.25 });
    const hslaOutput = serializeColorModel(hsla, 'hsla(120deg, 100%, 50%, 25%)');
    assert.equal(hslaOutput, 'hsl(120 100 50 / 0.25)');
    assert.deepEqual(parseColorModel(hslaOutput), hsla);

    const achromatic = parseColorModel('hsla(275 0% 50% / 0.4)');
    assert.ok(achromatic);
    const achromaticOutput = serializeColorModel(achromatic, 'hsla(275 0% 50% / 0.4)');
    assert.equal(achromaticOutput, 'hsl(275 0 50 / 0.4)');
    assert.deepEqual(parseColorModel(achromaticOutput), achromatic);
});

test('parses RGB, HSV, and HSL objects and serializes each in its original channel family', () => {
    const rgb = Object.freeze({ r: 255, g: 0, b: 0, a: 0.25 });
    const parsedRgb = parseColorModel(rgb);
    assert.ok(parsedRgb);
    assert.deepEqual(parsedRgb, { h: 0, s: 1, v: 1, a: 0.25 });
    assert.deepEqual(serializeColorModel(parsedRgb, rgb), { r: 255, g: 0, b: 0, a: 0.25 });
    const opaqueRgb = Object.freeze({ r: 10, g: 20, b: 30, a: 1 });
    const parsedOpaqueRgb = parseColorModel(opaqueRgb);
    assert.ok(parsedOpaqueRgb);
    assert.deepEqual(serializeColorModel(parsedOpaqueRgb, opaqueRgb), { r: 10, g: 20, b: 30, a: 1 });

    const hsv = Object.freeze({ h: 210, s: 0.5, v: 0.75, a: 0.4 });
    const parsedHsv = parseColorModel(hsv);
    assert.ok(parsedHsv);
    const serializedHsv = serializeColorModel(parsedHsv, hsv);
    assert.ok(typeof serializedHsv === 'object' && serializedHsv && 'v' in serializedHsv);
    near(serializedHsv.h, hsv.h);
    near(serializedHsv.s, hsv.s);
    near(serializedHsv.v, hsv.v);
    near(serializedHsv.a ?? 0, hsv.a);

    const hsl = Object.freeze({ h: 210, s: 0.5, l: 0.4, a: 0.3 });
    const parsedHsl = parseColorModel(hsl);
    assert.ok(parsedHsl);
    const serializedHsl = serializeColorModel(parsedHsl, hsl);
    assert.ok(typeof serializedHsl === 'object' && serializedHsl && 'l' in serializedHsl);
    near(serializedHsl.h, hsl.h);
    near(serializedHsl.s, hsl.s);
    near(serializedHsl.l, hsl.l);
    near(serializedHsl.a ?? 0, hsl.a);

    assert.deepEqual(serializeColorModel({ h: 30, s: 0.5, v: 0.8, a: 1 }, { h: 30, s: 0.5, v: 0.8 }), {
        h: 30,
        s: 0.5,
        v: 0.8
    });
});

test('serializes hex and CSS sources while preserving their alpha rules', () => {
    const red: HSVA = { h: 0, s: 1, v: 1, a: 1 };
    assert.equal(serializeColorModel(red, '#ff0000'), '#FF0000');
    assert.equal(serializeColorModel(red, '#ff0000ff'), '#FF0000FF');
    assert.equal(serializeColorModel(red, 'rgba(255, 0, 0, 1)'), 'rgb(255 0 0)');
    assert.equal(serializeColorModel({ ...red, a: 0.25 }, '#ff0000'), '#FF000040');
});

test('clamps finite channels, wraps hue through 360, and rejects non-finite input', () => {
    const clampedRgb = parseColorModel({ r: 300, g: -5, b: 18, a: 2 });
    assert.ok(clampedRgb);
    assert.deepEqual(hsvToRgb(clampedRgb), { r: 255, g: 0, b: 18, a: 1 });
    assert.deepEqual(parseColorModel({ h: 360, s: 2, v: -1, a: -0.5 }), { h: 0, s: 1, v: 0, a: 0 });
    assert.deepEqual(parseColorModel({ h: -1, s: 0.5, v: 0.5 }), { h: 359, s: 0.5, v: 0.5, a: 1 });
    assert.equal(parseColorModel({ r: Number.NaN, g: 0, b: 0 }), undefined);
    assert.equal(parseColorModel({ h: 0, s: Number.POSITIVE_INFINITY, v: 1 }), undefined);
    assert.equal(parseColorModel('rgb(1e999 0 0)'), undefined);
    assert.equal(parseColorModel('#12xz45'), undefined);
});

test('treats nullish and blank values as empty and malformed shapes as invalid', () => {
    assert.equal(parseColorModel(null), null);
    assert.equal(parseColorModel(undefined), null);
    assert.equal(parseColorModel(''), null);
    assert.equal(parseColorModel('  '), null);
    assert.equal(parseColorModel(0), undefined);
    assert.equal(parseColorModel({ r: 1, g: 2 }), undefined);
    assert.equal(parseColorModel('rgb(1 2)'), undefined);
    assert.equal(serializeColorModel(null, '#fff'), null);
    assert.equal(serializeColorModel(undefined), undefined);
});

test('round-trips RGB values, keeps achromatic HSL hue, and leaves inputs untouched', () => {
    const colors = [
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 12, g: 34, b: 56 },
        { r: 100, g: 100, b: 100, a: 0.6 }
    ];
    for (const color of colors) {
        const input = Object.freeze({ ...color });
        const hsva = rgbToHsv(input);
        assert.ok(hsva);
        assert.deepEqual(serializeColorModel(hsva, input), input);
    }

    const achromatic = hslToHsv({ h: 275, s: 0, l: 0.5, a: 0.2 });
    assert.ok(achromatic);
    const backToHsl = hsvToHsl(achromatic);
    assert.ok(backToHsl);
    assert.deepEqual(backToHsl, { h: 275, s: 0, l: 0.5, a: 0.2 });

    const original = Object.freeze({ h: 370, s: 0.4, v: 0.7, a: 0.8 });
    const parsed = parseColorModel(original);
    assert.ok(parsed);
    assert.deepEqual(original, { h: 370, s: 0.4, v: 0.7, a: 0.8 });
    assert.deepEqual(parsed, { h: 10, s: 0.4, v: 0.7, a: 0.8 });
});

test('converts between byte and normalized channels with finite clamping', () => {
    near(convertChannel(127.5, 'rgb', 'unit') ?? -1, 0.5);
    near(convertChannel(0.5, 'unit', 'rgb') ?? -1, 127.5);
    assert.equal(convertChannel(999, 'rgb', 'rgb'), 255);
    assert.equal(convertChannel(Number.NaN, 'unit', 'rgb'), undefined);
});

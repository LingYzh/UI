import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
    buttonColorStyles,
    themeColor,
    themeOnColor,
} from '../src/ui/button-colors';
import { createUiTheme } from '../src/ui/theme';
import { defaultUiThemes } from '../src/ui/theme-defaults';

function luminance(color: string) {
    const values = color
        .slice(1)
        .match(/../g)!
        .map((value) => parseInt(value, 16) / 255)
        .map((value) =>
            value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
        );
    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

function contrast(first: string, second: string) {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
}

test('light accents share the clay brand and dark text adapts, with aligned static CSS defaults', () => {
    const css = readFileSync(
        new URL('../src/ui/tokens.css', import.meta.url),
        'utf8',
    );
    const lightCss = css.slice(0, css.indexOf(':root[data-theme="dark"]'));
    const darkCss = css.slice(css.indexOf(':root[data-theme="dark"]'));
    for (const mode of ['light', 'dark'] as const) {
        const theme = createUiTheme({ defaultTheme: mode, target: false });
        const colors = theme.current.value.colors;
        assert.equal(colors.accent, '#d97757');
        assert.equal(colors['primary-surface'], colors.accent);
        assert.equal(colors.primary, mode === 'light' ? '#d97757' : '#e6a086');
        assert.equal(colors['accent-text'], colors.primary);
        assert.equal(colors['on-primary-surface'], '#ffffff');
        if (mode === 'light') assert.equal(colors['on-primary'], '#ffffff');
        assert.match(css, /--on-primary-surface: #fff;/);
        if (mode === 'dark') {
            assert.ok(contrast(colors.primary, colors.background) >= 4.5);
            assert.ok(contrast(colors.primary, colors['accent-soft']) >= 4.5);
        }
        for (const key of ['primary', 'secondary', 'success', 'error', 'danger', 'warning', 'info']) {
            const ink = colors[`on-${key}`] === '#ffffff' ? '#fff' : '#000';
            const staticInk = css.match(mode === 'light' ? /:root \{ --on-primary:([^}]+)\}/ : /:root\[data-theme="dark"\] \{ --on-primary:([^}]+)\}/)![0];
            assert.ok(staticInk.includes(`--on-${key}: ${ink};`), `${mode}: static ${key} ink`);
        }
        for (const key of [
            'background',
            'sidebar',
            'accent',
            'accent-text',
            'accent-soft',
        ]) {
            assert.ok(
                (mode === 'light' ? lightCss : darkCss).includes(
                    `--${key}: ${defaultUiThemes[mode].colors[key as keyof typeof defaultUiThemes.light.colors]};`,
                ),
            );
        }
        theme.dispose();
    }
});

test('solid primary gets a surface role while text, raw colors and other semantics keep their meaning', () => {
    const primary = buttonColorStyles('primary') as Record<string, string>;
    assert.match(primary['--ui-button-color'], /--ui-theme-primary,/);
    assert.match(primary['--ui-button-surface'], /--ui-theme-primary-surface/);
    assert.match(
        primary['--ui-button-on-surface'],
        /--ui-theme-on-primary-surface/,
    );
    for (const value of ['danger', '#d97757', 'var(--ui-theme-primary)']) {
        const styles = buttonColorStyles(value) as Record<string, string>;
        assert.equal(
            styles['--ui-button-surface'],
            styles['--ui-button-color'],
        );
    }
});

test('raw CSS colors and semantic text/surface roles resolve without invalid CSS variables', () => {
    assert.equal(themeColor('#ffeeba', true), '#ffeeba');
    assert.equal(themeColor('rgb(20, 30, 40)'), 'rgb(20, 30, 40)');
    assert.equal(themeColor('var(--custom-tone)', true), 'var(--custom-tone)');
    assert.notEqual(themeColor('primary'), themeColor('primary', true));
    assert.equal(themeOnColor('#ffeeba', true), '#000000');
    assert.equal(themeOnColor('#203050', true), '#ffffff');
    assert.match(themeOnColor('primary', true)!, /--on-primary-surface/);
    const theme = createUiTheme({ target: false });
    assert.equal(theme.current.value.colors['on-accent'], '#ffffff');
    theme.themes.value.light.colors!['primary-surface'] = '#D97757';
    assert.equal(theme.current.value.colors['on-primary-surface'], '#ffffff');
    theme.dispose();
});

test('custom primary surfaces still inherit automatic ink and follow live palette edits', () => {
    const theme = createUiTheme({ target: false });
    theme.themes.value.light.colors!.primary = '#246a91';
    theme.themes.value.light.colors!['primary-surface'] = '#246a91';
    assert.equal(theme.current.value.colors['on-primary-surface'], '#ffffff');
    theme.themes.value.light.colors!['primary-surface'] = '#faf9f5';
    assert.equal(theme.current.value.colors['on-primary-surface'], '#000000');
    theme.themes.value.light.colors!['on-primary-surface'] = '#123456';
    assert.equal(theme.current.value.colors['on-primary-surface'], '#123456');
    theme.dispose();
});

test('solid fills prefer white for medium tones and black only for bright fills, with explicit ink taking priority', () => {
    for (const color of ['#d97757', '#ff9800', '#4caf50', '#888888', '#c0c0c0', '#d0d0d0', '#9dc5e6', '#a4c4a6', '#dfbf82', 'rgb(217, 119, 87)']) {
        assert.equal(themeOnColor(color, true), '#ffffff', color);
    }
    for (const color of ['#ffffff', '#faf9f5', '#ffeeba', '#ffff00', '#e0e0e0']) {
        assert.equal(themeOnColor(color, true), '#000000', color);
    }
    const theme = createUiTheme({ target: false });
    for (const mode of ['light', 'dark']) {
        for (const color of ['#ff9800', '#4caf50', '#ffeeba']) {
            theme.themes.value[mode].colors!['primary-surface'] = color;
            theme.themes.value[mode].colors!.warning = color;
            const colors = theme.computedThemes.value[mode].colors;
            assert.equal(colors['on-primary-surface'], themeOnColor(color, true));
            assert.equal(colors['on-warning'], themeOnColor(color, true));
        }
        theme.themes.value[mode].colors!['on-primary-surface'] = '#123456';
        assert.equal(theme.computedThemes.value[mode].colors['on-primary-surface'], '#123456');
    }
    theme.dispose();
});

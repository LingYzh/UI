import type { UiThemeOptions } from '../theme';
export function previewThemeOptions(): UiThemeOptions {
    return {
        defaultTheme: typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
        themes: { ocean: { colors: { primary: '#246a91' } }, midnight: { dark: true, colors: { primary: '#8ecce9', 'primary-surface': '#246a91' } } },
        variations: { colors: ['primary'], lighten: 2, darken: 2 }
    };
}

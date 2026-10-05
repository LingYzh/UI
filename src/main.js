import { createApp } from 'vue';
import { createUI } from './ui/plugin';
import { previewThemeOptions } from './ui/docs/previewTheme';
import UiPreview from './ui/UiPreview.vue';
import './docs-base.css';
import './ui/styles.css';
import './ui/docs/docs.css';
const ui = createUI({ theme: previewThemeOptions() });
createApp(UiPreview).use(ui).mount('#app');

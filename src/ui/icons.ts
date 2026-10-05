import { shallowReactive } from 'vue';
import {
    mdiAccount, mdiAlertCircleOutline, mdiArrowLeft, mdiArrowRight, mdiCheck, mdiChevronDown, mdiChevronLeft, mdiChevronRight,
    mdiClose, mdiCogOutline, mdiContentCopy, mdiDeleteOutline, mdiFolderOutline, mdiHomeOutline,
    mdiMagnify, mdiPencilOutline, mdiPlus, mdiViewGridOutline, mdiFormTextbox, mdiTextBoxOutline
} from '@mdi/js';

/** Small built-in MDI set. Applications import additional paths individually. */
const paths = shallowReactive<Record<string, string>>({
    'mdi-account': mdiAccount, 'mdi-alert-circle-outline': mdiAlertCircleOutline,
    'mdi-arrow-left': mdiArrowLeft, 'mdi-arrow-right': mdiArrowRight, 'mdi-check': mdiCheck,
    'mdi-chevron-down': mdiChevronDown, 'mdi-chevron-left': mdiChevronLeft, 'mdi-chevron-right': mdiChevronRight, 'mdi-close': mdiClose, 'mdi-cog-outline': mdiCogOutline,
    'mdi-content-copy': mdiContentCopy, 'mdi-delete-outline': mdiDeleteOutline,
    'mdi-folder-outline': mdiFolderOutline, 'mdi-home-outline': mdiHomeOutline,
    'mdi-magnify': mdiMagnify, 'mdi-pencil-outline': mdiPencilOutline, 'mdi-plus': mdiPlus,
    'mdi-view-grid-outline': mdiViewGridOutline, 'mdi-form-textbox': mdiFormTextbox,
    'mdi-text-box-outline': mdiTextBoxOutline
});

export function registerIcons(icons: Record<string, string>): void {
    for (const [name, path] of Object.entries(icons)) {
        if (name && typeof path === 'string' && path.trim()) paths[name] = path;
    }
}

export function iconPath(name: string): string | undefined { return paths[name]; }

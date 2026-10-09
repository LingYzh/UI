import { shallowReactive } from 'vue';
import {
    mdiAccount, mdiAlertCircleOutline, mdiArrowLeft, mdiArrowRight, mdiCheck, mdiChevronDown, mdiChevronLeft, mdiChevronRight,
    mdiClose, mdiCogOutline, mdiContentCopy, mdiDeleteOutline, mdiFolderOutline, mdiHomeOutline, mdiCalendarMonthOutline,
    mdiMagnify, mdiPencilOutline, mdiPlus, mdiViewGridOutline, mdiFormTextbox, mdiTextBoxOutline, mdiUpload,
    mdiArrowUp, mdiArrowDown, mdiChevronUp, mdiPageFirst, mdiPageLast
} from '@mdi/js';

/** Small compatibility map for the MDI names supported by the library before icon sets were introduced. */
export const iconPaths = shallowReactive<Record<string, string>>({
    'mdi-account': mdiAccount, 'mdi-alert-circle-outline': mdiAlertCircleOutline,
    'mdi-arrow-left': mdiArrowLeft, 'mdi-arrow-right': mdiArrowRight, 'mdi-check': mdiCheck,
    'mdi-arrow-up': mdiArrowUp, 'mdi-arrow-down': mdiArrowDown, 'mdi-chevron-up': mdiChevronUp,
    'mdi-page-first': mdiPageFirst, 'mdi-page-last': mdiPageLast,
    'mdi-chevron-down': mdiChevronDown, 'mdi-chevron-left': mdiChevronLeft, 'mdi-chevron-right': mdiChevronRight, 'mdi-close': mdiClose, 'mdi-cog-outline': mdiCogOutline,
    'mdi-content-copy': mdiContentCopy, 'mdi-delete-outline': mdiDeleteOutline,
    'mdi-folder-outline': mdiFolderOutline, 'mdi-home-outline': mdiHomeOutline,
    'mdi-calendar-month-outline': mdiCalendarMonthOutline,
    'mdi-magnify': mdiMagnify, 'mdi-pencil-outline': mdiPencilOutline, 'mdi-plus': mdiPlus,
    'mdi-view-grid-outline': mdiViewGridOutline, 'mdi-form-textbox': mdiFormTextbox,
    'mdi-text-box-outline': mdiTextBoxOutline, 'mdi-upload': mdiUpload
});

export function registerIcons(icons: Record<string, string>): void {
    for (const [name, path] of Object.entries(icons)) {
        if (name && typeof path === 'string' && path.trim()) iconPaths[name] = path;
    }
}

export function iconPath(name: string): string | undefined {
    return iconPaths[name];
}

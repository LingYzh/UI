import {
    mdiAlert, mdiAlertCircle, mdiAppleKeyboardCommand, mdiAppleKeyboardControl, mdiAppleKeyboardOption,
    mdiAppleKeyboardShift, mdiArrowDown, mdiArrowLeft, mdiArrowRight, mdiArrowUp, mdiBackspace, mdiCalendar,
    mdiCached, mdiCheck, mdiCheckCircle, mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiChevronDown, mdiChevronLeft,
    mdiChevronRight, mdiChevronUp, mdiCircle, mdiClose, mdiCloseCircle, mdiCloudUpload, mdiContentCopy, mdiEyedropper,
    mdiFullscreen, mdiFullscreenExit, mdiInformation, mdiKeyboardEsc, mdiKeyboardReturn, mdiKeyboardSpace, mdiMagnify,
    mdiMenu, mdiMenuDown, mdiMenuRight, mdiMinus, mdiMinusBox, mdiPageFirst, mdiPageLast, mdiPaperclip, mdiPalette,
    mdiPause, mdiPencil, mdiPlay, mdiPlus, mdiRadioboxBlank, mdiRadioboxMarked, mdiSortAscending, mdiSortDescending,
    mdiStar, mdiStarHalfFull, mdiStarOutline, mdiUnfoldMoreHorizontal, mdiVolumeHigh, mdiVolumeLow, mdiVolumeMedium,
    mdiVolumeOff
} from '@mdi/js';
import type { IconAliases, IconSet } from '../icon-config';
import { SvgIcon } from '../icon-renderers';
import { iconPaths } from '../icons';

function svgAlias(path: string): string {
    return 'svg:' + path;
}

/** Vuetify semantic aliases stay SVG when the application uses another default set. */
export const aliases: IconAliases = {
    collapse: svgAlias(mdiChevronUp),
    complete: svgAlias(mdiCheck),
    cancel: svgAlias(mdiCloseCircle),
    close: svgAlias(mdiClose),
    delete: svgAlias(mdiCloseCircle),
    clear: svgAlias(mdiClose),
    success: svgAlias(mdiCheckCircle),
    info: svgAlias(mdiInformation),
    warning: svgAlias(mdiAlert),
    error: svgAlias(mdiAlertCircle),
    prev: svgAlias(mdiChevronLeft),
    next: svgAlias(mdiChevronRight),
    checkboxOn: svgAlias(mdiCheckboxMarked),
    checkboxOff: svgAlias(mdiCheckboxBlankOutline),
    checkboxIndeterminate: svgAlias(mdiMinusBox),
    delimiter: svgAlias(mdiCircle),
    sortAsc: svgAlias(mdiSortAscending),
    sortDesc: svgAlias(mdiSortDescending),
    sort: svgAlias(mdiArrowUp),
    expand: svgAlias(mdiChevronDown),
    menu: svgAlias(mdiMenu),
    subgroup: svgAlias(mdiMenuDown),
    dropdown: svgAlias(mdiMenuDown),
    radioOn: svgAlias(mdiRadioboxMarked),
    radioOff: svgAlias(mdiRadioboxBlank),
    edit: svgAlias(mdiPencil),
    ratingEmpty: svgAlias(mdiStarOutline),
    ratingFull: svgAlias(mdiStar),
    ratingHalf: svgAlias(mdiStarHalfFull),
    loading: svgAlias(mdiCached),
    first: svgAlias(mdiPageFirst),
    last: svgAlias(mdiPageLast),
    unfold: svgAlias(mdiUnfoldMoreHorizontal),
    file: svgAlias(mdiPaperclip),
    plus: svgAlias(mdiPlus),
    minus: svgAlias(mdiMinus),
    calendar: svgAlias(mdiCalendar),
    treeviewCollapse: svgAlias(mdiMenuDown),
    treeviewExpand: svgAlias(mdiMenuRight),
    tableGroupCollapse: svgAlias(mdiChevronDown),
    tableGroupExpand: svgAlias(mdiChevronRight),
    eyeDropper: svgAlias(mdiEyedropper),
    upload: svgAlias(mdiCloudUpload),
    color: svgAlias(mdiPalette),
    command: svgAlias(mdiAppleKeyboardCommand),
    ctrl: svgAlias(mdiAppleKeyboardControl),
    space: svgAlias(mdiKeyboardSpace),
    shift: svgAlias(mdiAppleKeyboardShift),
    alt: svgAlias(mdiAppleKeyboardOption),
    enter: svgAlias(mdiKeyboardReturn),
    arrowup: svgAlias(mdiArrowUp),
    arrowdown: svgAlias(mdiArrowDown),
    arrowleft: svgAlias(mdiArrowLeft),
    arrowright: svgAlias(mdiArrowRight),
    backspace: svgAlias(mdiBackspace),
    play: svgAlias(mdiPlay),
    pause: svgAlias(mdiPause),
    fullscreen: svgAlias(mdiFullscreen),
    fullscreenExit: svgAlias(mdiFullscreenExit),
    volumeHigh: svgAlias(mdiVolumeHigh),
    volumeMedium: svgAlias(mdiVolumeMedium),
    volumeLow: svgAlias(mdiVolumeLow),
    volumeOff: svgAlias(mdiVolumeOff),
    copy: svgAlias(mdiContentCopy),
    search: svgAlias(mdiMagnify),
    escape: svgAlias(mdiKeyboardEsc)
};

export const mdi: IconSet = {
    component: SvgIcon,
    paths: iconPaths
};

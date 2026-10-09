import { defineComponent, h, type PropType } from 'vue';
import type { IconValue as IconValueType } from './icon-config';

interface IconRendererProps {
    tag: string;
    icon: IconValueType;
}

const iconRendererProps = {
    tag: { type: String, default: 'span' },
    icon: { type: [String, Array, Object, Function] as PropType<IconValueType>, default: '' }
};

interface SvgPath {
    d: string;
    opacity?: number;
}

function getSvgPaths(icon: IconValueType): SvgPath[] {
    const entries = Array.isArray(icon) ? icon : [icon];
    const paths: SvgPath[] = [];
    for (const entry of entries) {
        if (typeof entry === 'string') {
            paths.push({ d: entry });
        } else if (Array.isArray(entry) && typeof entry[0] === 'string') {
            paths.push({ d: entry[0], opacity: entry[1] });
        }
    }
    return paths;
}

function setupSvgIcon(props: IconRendererProps) {
    return function renderSvgIcon() {
        const paths = getSvgPaths(props.icon).map(function renderPath(path) {
            return h('path', { d: path.d, 'fill-opacity': path.opacity });
        });
        return h(props.tag, { class: 'ui-icon-markup' }, [
            h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' }, paths)
        ]);
    };
}

function setupComponentIcon(props: IconRendererProps) {
    return function renderComponentIcon() {
        const icon = props.icon;
        return h(props.tag, { class: 'ui-icon-markup' }, [
            typeof icon === 'object' || typeof icon === 'function' ? h(icon) : null
        ]);
    };
}

function setupClassIcon(props: IconRendererProps) {
    return function renderClassIcon() {
        const classes = typeof props.icon === 'string' ? props.icon : '';
        return h(props.tag, { class: 'ui-icon-markup' }, [
            h('i', { class: classes, 'aria-hidden': 'true' })
        ]);
    };
}

function setupLigatureIcon(props: IconRendererProps) {
    return function renderLigatureIcon() {
        const text = typeof props.icon === 'string' ? props.icon : '';
        return h(props.tag, { class: 'ui-icon-markup', 'aria-hidden': 'true' }, text);
    };
}

export const SvgIcon = defineComponent({
    name: 'SvgIcon',
    props: iconRendererProps,
    setup: setupSvgIcon
});

export const ComponentIcon = defineComponent({
    name: 'ComponentIcon',
    props: iconRendererProps,
    setup: setupComponentIcon
});

export const ClassIcon = defineComponent({
    name: 'ClassIcon',
    props: iconRendererProps,
    setup: setupClassIcon
});

export const LigatureIcon = defineComponent({
    name: 'LigatureIcon',
    props: iconRendererProps,
    setup: setupLigatureIcon
});

import { defineComponent, h, Fragment, cloneVNode, isVNode, type VNode, type PropType } from 'vue';
import UTransition from './UTransition.vue';

/** 标准插槽可返回 tr/td；旧版 expanded-row 和 group-header 的正文插槽继续兼容。 */
export default defineComponent({
    name: 'DataTableSlotRows',
    inheritAttrs: false,
    props: {
        colspan: { type: Number, default: 1 },
        expanded: Boolean,
        cell: Boolean,
        visible: { type: Boolean, default: true },
        transition: { type: [Boolean, Object] as PropType<false | { component?: unknown; [key: string]: unknown }>, default: undefined }
    },
    setup(props, { slots, attrs }) {
        function elements(nodes: VNode[]): VNode[] {
            return nodes.flatMap(node => node.type === Fragment ? elements(node.children as VNode[]) : isVNode(node) && typeof node.type !== 'symbol' ? [node] : []);
        }
        return () => {
            const content = slots.default?.() ?? [];
            const nodes = elements(content);
            if (props.cell) return nodes.some(node => node.type === 'td' || node.type === 'th')
                ? h(Fragment, nodes.map(node => cloneVNode(node, attrs, true)))
                : h('td', { ...attrs, colspan: props.colspan }, content);
            if (nodes.some(node => node.type === 'tr')) return props.visible ? h(Fragment, nodes.map(node => cloneVNode(node, attrs, true))) : null;
            if (nodes.some(node => node.type === 'td' || node.type === 'th')) return props.visible ? h('tr', attrs, content) : null;
            if (!props.expanded) return props.visible ? h('tr', attrs, h('td', { colspan: props.colspan }, content)) : null;
            const body = props.visible ? h('div', { class: 'u-data-table-details' }, content) : null;
            const transition = props.transition === false ? body : h((props.transition?.component ?? UTransition) as typeof UTransition, { variant: 'expand', ...props.transition }, () => body);
            return h('tr', { ...attrs, class: ['u-data-table-details-row', attrs.class], 'aria-hidden': !props.visible }, h('td', { colspan: props.colspan }, transition ?? undefined));
        };
    }
});

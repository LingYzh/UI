import { defineComponent, h, type PropType } from 'vue';

export default defineComponent({
    props: { value: null, matches: { type: null as unknown as PropType<unknown> } },
    setup(props) {
        return () => {
            const text = String(props.value ?? '—');
            const input = props.matches;
            if (!Array.isArray(input) || !input.length) return text;
            const ranges: unknown[][] = typeof input[0] === 'number' ? [input] : input;
            const normalized = ranges.filter(range => Array.isArray(range) && range.length === 2 && range.every(value => typeof value === 'number')).map(range => [Math.max(0, Number(range[0])), Math.min(text.length, Number(range[1]))]).sort((a, b) => a[0] - b[0]);
            let cursor = 0;
            const nodes = [];
            for (const [start, end] of normalized) {
                if (start < cursor || end <= start) continue;
                nodes.push(text.slice(cursor, start), h('mark', text.slice(start, end)));
                cursor = end;
            }
            nodes.push(text.slice(cursor));
            return nodes;
        };
    }
});

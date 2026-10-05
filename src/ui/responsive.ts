import { displayThresholds } from './display';

export function responsiveStyles(thresholds: typeof displayThresholds = displayThresholds): string {
    const selectors: string[] = [];
    for (const [breakpoint, threshold] of Object.entries(thresholds)) {
        const suffix = breakpoint === 'xs' ? '' : `-${breakpoint}`;
        const rules: string[] = [];
        for (const value of ['none', 'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid']) rules.push(`.d${suffix}-${value}{display:${value}!important}`);
        for (const value of ['row', 'row-reverse', 'column', 'column-reverse']) rules.push(`.flex${suffix}-${value}{flex-direction:${value}!important}`);
        for (const value of ['start', 'end', 'center', 'baseline', 'stretch']) rules.push(`.align${suffix}-${value}{align-items:${value}!important}`);
        for (const value of ['start', 'end', 'center', 'space-between', 'space-around', 'space-evenly']) rules.push(`.justify${suffix}-${value}{justify-content:${value}!important}`);
        for (const value of ['start', 'end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch']) rules.push(`.align-content${suffix}-${value}{align-content:${value}!important}`);
        for (const value of ['start', 'end', 'center', 'baseline', 'stretch', 'auto']) rules.push(`.align-self${suffix}-${value}{align-self:${value}!important}`);
        for (let step = 0; step <= 16; step++) {
            for (const [name, properties] of Object.entries({ a: [''], x: ['-inline'], y: ['-block'], t: ['-top'], b: ['-bottom'], l: ['-left'], r: ['-right'], s: ['-inline-start'], e: ['-inline-end'] })) {
                for (const [prefix, property] of [['m', 'margin'], ['p', 'padding']]) rules.push(`.${prefix}${name}${suffix}-${step}{${properties.map(direction => `${property}${direction}:${step * 4}px!important`).join(';')}}`);
            }
            rules.push(`.ga${suffix}-${step}{gap:${step * 4}px!important}`);
        }
        if (breakpoint !== 'xs') {
            const cascade = Object.keys(thresholds).slice(0, Object.keys(thresholds).indexOf(breakpoint) + 1);
            const chain = (property: string, fallback: string) => cascade.reduce((value, key) => `var(--ui-col-${property}${key === 'xs' ? '' : `-${key}`},${value})`, fallback);
            rules.push(`.ui-col{flex-basis:${chain('basis', '0px')};flex-grow:${chain('grow', '1')};margin-inline-start:${chain('offset', '0px')};order:${chain('order', '0')}}`);
            const limit = Math.floor(threshold * .009375) * 100;
            if (limit) rules.push(`.ui-container:not(.is-fluid){max-width:${limit}px}`);
        }
        selectors.push(threshold === 0 ? rules.join('\n') : `@media(min-width:${threshold}px){\n${rules.join('\n')}\n}`);
    }
    return selectors.join('\n');
}

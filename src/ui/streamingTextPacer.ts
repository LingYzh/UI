/** Mobile StreamingTextPacer port. Presentation only; never delays provider data. */
export class StreamingTextPacer {
    private shown: string;
    private target: string;
    private lastTick = -Infinity;
    private lastPlayback = -Infinity;
    private bufferedUntil = -Infinity;
    private burstChars = 0;
    private lastArrival = -Infinity;
    private inputRate = 0;
    private budget = 0;
    private finishStart = -Infinity;

    constructor(initial = '') { this.shown = initial; this.target = initial; }
    get hasPending() { return this.shown.length < this.target.length; }
    get updateIntervalMs() { return this.inputRate < .08 ? 140 : this.inputRate < .24 ? 110 : 90; }

    next(source: string, now: number, streaming: boolean, immediate = false): string {
        const longGap = this.lastTick !== -Infinity && now - this.lastTick > 1000;
        this.lastTick = now;
        if (immediate || !source.startsWith(this.target) || source.length - this.shown.length > 4096 || longGap) {
            this.shown = this.target = source;
            this.bufferedUntil = this.lastArrival = this.finishStart = -Infinity;
            this.burstChars = this.inputRate = this.budget = 0;
            this.lastPlayback = now;
            return this.shown;
        }
        const exhausted = this.shown.length >= this.target.length;
        if (source !== this.target) {
            const delta = source.length - this.target.length;
            if (delta > 0) {
                if (streaming && exhausted) {
                    this.bufferedUntil = now + 200;
                    this.burstChars = delta;
                    this.lastArrival = now;
                    this.lastPlayback = this.finishStart = -Infinity;
                } else {
                    const interval = now - this.lastArrival;
                    this.lastArrival = now;
                    this.burstChars += delta;
                    if (Number.isFinite(interval) && interval > 0) {
                        const rate = delta / interval;
                        this.inputRate = this.inputRate <= 0 ? rate : .3 * rate + .7 * this.inputRate;
                    }
                }
            }
            this.target = source;
        }
        if (!streaming) this.bufferedUntil = -Infinity;
        if (streaming && now < this.bufferedUntil) return this.shown;
        let elapsed = 0;
        if (this.bufferedUntil !== -Infinity) {
            elapsed = Math.max(0, Math.min(1000, now - this.bufferedUntil));
            this.bufferedUntil = -Infinity;
        } else if (this.lastPlayback !== -Infinity) elapsed = Math.max(0, Math.min(1000, now - this.lastPlayback));
        this.lastPlayback = now;
        if (!this.hasPending) { this.budget = 0; this.finishStart = -Infinity; return this.shown; }
        let rate: number;
        if (streaming) {
            if (this.inputRate <= 0) this.inputRate = Math.max(this.burstChars / 200, .015);
            const base = Math.max(this.inputRate, .015);
            const excess = Math.max(0, this.target.length - this.shown.length - base * 320);
            rate = base * .9 + excess / 600;
        } else {
            if (this.finishStart === -Infinity) this.finishStart = now;
            const remaining = 200 - (now - this.finishStart);
            if (remaining <= 0) { this.shown = this.target; this.budget = 0; this.finishStart = -Infinity; return this.shown; }
            rate = Math.max((this.target.length - this.shown.length) / remaining, this.inputRate || .015);
        }
        this.budget += rate * elapsed;
        if (Math.floor(this.budget) <= 0) return this.shown;
        const safe = streaming ? safeStreamingLength(this.target) : this.target.length;
        let desired = Math.min(this.shown.length + Math.floor(this.budget), safe);
        while (desired < safe && !isGraphemeBoundary(this.target, desired)) desired++;
        if (desired > this.shown.length) {
            this.budget = Math.max(-4, this.budget - (desired - this.shown.length));
            this.shown = this.target.slice(0, desired);
        }
        if (!this.hasPending) { this.budget = 0; this.finishStart = -Infinity; }
        return this.shown;
    }
}

const regional = (point: number) => point >= 0x1f1e6 && point <= 0x1f1ff;
function previousPoint(source: string, end: number): number {
    const last = source.charCodeAt(end - 1);
    return last >= 0xdc00 && last <= 0xdfff && end >= 2 ? source.codePointAt(end - 2)! : last;
}
export function isGraphemeBoundary(source: string, index: number): boolean {
    if (index <= 0 || index >= source.length) return true;
    const point = source.codePointAt(index)!;
    const previous = source.charCodeAt(index - 1);
    if (point >= 0xdc00 && point <= 0xdfff && previous >= 0xd800 && previous <= 0xdbff) return false;
    if (/\p{Mark}/u.test(String.fromCodePoint(point)) || point >= 0xfe00 && point <= 0xfe0f || point >= 0xe0100 && point <= 0xe01ef || point >= 0x1f3fb && point <= 0x1f3ff || point >= 0xe0020 && point <= 0xe007f || point === 0x200d || previous === 0x200d) return false;
    if (regional(point)) {
        let count = 0;
        let cursor = index;
        while (cursor > 0 && regional(previousPoint(source, cursor))) { count++; cursor -= 2; }
        if (count % 2) return false;
    }
    return true;
}
export function safeStreamingLength(source: string): number {
    let end = source.length;
    const last = source.charCodeAt(end - 1);
    if (last >= 0xd800 && last <= 0xdbff) end--;
    if (source.charCodeAt(end - 1) === 0x200d) {
        end--;
        while (end > 0) {
            const point = previousPoint(source, end);
            end -= point > 0xffff ? 2 : 1;
            if (source.charCodeAt(end - 1) === 0x200d) end--;
            else if (end <= 0 || isGraphemeBoundary(source, end)) break;
        }
    }
    let count = 0;
    let cursor = end;
    while (cursor > 0 && regional(previousPoint(source, cursor))) { count++; cursor -= 2; }
    if (count % 2) end -= 2;
    while (end > 0 && !isGraphemeBoundary(source, end)) end--;
    return Math.max(0, end);
}

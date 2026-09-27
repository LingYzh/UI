let writer: ((text: string) => Promise<void>) | null = null;
/** Desktop hosts can provide an isolated, write-only clipboard bridge. */
export function setClipboardWriter(value: ((text: string) => Promise<void>) | null): void { writer = value; }
export function writeClipboard(text: string): Promise<void> { return writer ? writer(text) : navigator.clipboard.writeText(text); }

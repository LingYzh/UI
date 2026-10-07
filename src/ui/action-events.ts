/** A nested control owns its own activation, even when its ripple is disabled. */
export function isNestedControlEvent(event: Event, host: HTMLElement | undefined): boolean {
    if (!host || !(event.target instanceof Element)) return false;
    const control = event.target.closest('button, a[href], input, select, textarea, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"], [role="tab"], [role="textbox"], [role="combobox"], [role="listbox"], [role="option"], [role="treeitem"], [contenteditable]:not([contenteditable="false"])');
    return !!control && control !== host && host.contains(control);
}

import assert from "node:assert/strict";
import test from "node:test";
import { reactive } from "vue";
import { cloneEditValue, equalEditValues } from "../src/ui/confirm-edit";

test("draft clone isolates nested proxies, arrays, dates and map values", () => {
    const item = reactive({ name: "original" });
    const source = reactive({
        item,
        list: [item],
        map: new Map([["item", item]]),
        date: new Date("2026-10-08"),
    });
    const draft = cloneEditValue(source);
    assert.equal(equalEditValues(source, draft), true);
    draft.item.name = "draft";
    draft.date.setFullYear(2027);
    assert.equal(source.item.name, "original");
    assert.equal(source.map.get("item")?.name, "original");
    assert.equal(source.date.getUTCFullYear(), 2026);
    assert.equal(equalEditValues(source, draft), false);
});

test("clone preserves circular references and pristine checks terminate", () => {
    const source: { value: number; self?: unknown } = { value: 1 };
    source.self = source;
    const draft = cloneEditValue(reactive(source));
    assert.equal(draft.self, draft);
    assert.equal(equalEditValues(source, draft), true);
    draft.value = 2;
    assert.equal(equalEditValues(source, draft), false);
});

test("pristine detects binary contents, sparse array lengths, set contents and map changes", () => {
    assert.equal(
        equalEditValues(new Uint8Array([1]), new Uint8Array([2])),
        false,
    );
    assert.equal(equalEditValues(new Array(1), new Array(2)), false);
    assert.equal(equalEditValues(new Set([1]), new Set([2])), false);
    assert.equal(
        equalEditValues(new Map([["key", 1]]), new Map([["key", 2]])),
        false,
    );
    assert.equal(equalEditValues(null, undefined), false);
});

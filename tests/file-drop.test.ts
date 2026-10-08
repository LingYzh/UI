import assert from 'node:assert/strict';
import test from 'node:test';
import { collectDroppedFiles, hasFileDropItems, type FileDropEntry } from '../src/ui/file-drop';

function fileEntry(file: File): FileDropEntry {
    return {
        isFile: true,
        name: file.name,
        file(success) { queueMicrotask(() => success(file)); }
    };
}

function directoryEntry(name: string, children: FileDropEntry[]): FileDropEntry {
    let offset = 0;
    return {
        isDirectory: true,
        name,
        createReader: () => ({
            readEntries(success) {
                queueMicrotask(() => {
                    if (offset >= children.length) {
                        success([]);
                        return;
                    }
                    const batch = children.slice(offset, offset + 2);
                    offset += batch.length;
                    success(batch);
                });
            }
        })
    };
}

test('file drops walk nested directory entries and drain each reader batch', async () => {
    const first = new File(['one'], 'one.txt', { type: 'text/plain' });
    const second = new File(['two'], 'two.txt', { type: 'text/plain' });
    const third = new File(['three'], 'three.txt', { type: 'text/plain' });
    const nested = directoryEntry('nested', [fileEntry(second), fileEntry(third)]);
    const root = directoryEntry('root', [fileEntry(first), nested]);
    const transfer = {
        items: [{ kind: 'file', webkitGetAsEntry: () => root }],
        files: []
    };

    assert.equal(hasFileDropItems(transfer), true);
    assert.deepEqual((await collectDroppedFiles(transfer)).map(file => file.name), ['one.txt', 'two.txt', 'three.txt']);
});

test('file drops fall back to transfer files when entries are unavailable', async () => {
    const file = new File(['value'], 'plain.txt', { type: 'text/plain' });
    const transfer = {
        items: [{ kind: 'file', webkitGetAsEntry: () => null, getAsFile: () => file }],
        files: [file]
    };

    assert.equal(hasFileDropItems(transfer), true);
    assert.deepEqual(await collectDroppedFiles(transfer), [file]);
    assert.equal(hasFileDropItems({ items: [{ kind: 'string' }], files: [] }), false);
});

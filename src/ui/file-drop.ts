export interface FileDropEntry {
    isFile?: boolean;
    isDirectory?: boolean;
    name?: string;
    file?: (success: (file: File) => void, failure?: (error: unknown) => void) => void;
    createReader?: () => {
        readEntries: (success: (entries: FileDropEntry[]) => void, failure?: (error: unknown) => void) => void;
    };
}

export interface FileDropItem {
    kind?: string;
    webkitGetAsEntry?: () => FileDropEntry | null;
    getAsFile?: () => File | null;
}

export interface FileDropTransfer {
    items?: ArrayLike<FileDropItem> | Iterable<FileDropItem> | null;
    files?: ArrayLike<File> | Iterable<File> | null;
}

function toArray<T>(value: ArrayLike<T> | Iterable<T> | null | undefined): T[] {
    return value == null ? [] : Array.from(value);
}

function readFile(entry: FileDropEntry): Promise<File> {
    return new Promise((resolve, reject) => {
        if (!entry.file) {
            reject(new Error('The dropped file entry cannot be read.'));
            return;
        }
        entry.file(resolve, reject);
    });
}

function readDirectory(reader: NonNullable<ReturnType<NonNullable<FileDropEntry['createReader']>>>): Promise<FileDropEntry[]> {
    return new Promise((resolve, reject) => {
        const entries: FileDropEntry[] = [];
        const readNext = () => {
            reader.readEntries((batch) => {
                if (batch.length === 0) {
                    resolve(entries);
                    return;
                }
                entries.push(...batch);
                readNext();
            }, reject);
        };
        readNext();
    });
}

async function collectEntry(entry: FileDropEntry): Promise<File[]> {
    if (entry.isFile) return [await readFile(entry)];
    if (!entry.isDirectory || !entry.createReader) return [];
    const children = await readDirectory(entry.createReader());
    const files: File[] = [];
    for (const child of children) files.push(...await collectEntry(child));
    return files;
}

export function hasFileDropItems(transfer: FileDropTransfer | null | undefined): boolean {
    if (!transfer) return false;
    if (toArray(transfer.files).length > 0) return true;
    return toArray(transfer.items).some((item) => item.kind === 'file');
}

export async function collectDroppedFiles(transfer: FileDropTransfer | null | undefined): Promise<File[]> {
    if (!transfer) return [];
    const items = toArray(transfer.items).filter((item) => item.kind === 'file');
    if (items.length > 0) {
        const files: File[] = [];
        for (const item of items) {
            const entry = item.webkitGetAsEntry?.();
            if (entry) files.push(...await collectEntry(entry));
            else {
                const file = item.getAsFile?.();
                if (file) files.push(file);
            }
        }
        if (files.length > 0) return files;
    }
    return toArray(transfer.files);
}

const DEFAULT_FILE_SIZE_BASE = 1000;
const DEFAULT_TRUNCATE_LENGTH = 22;

/**
 * Format a byte count using the same decimal/binary units as Vuetify's
 * humanReadableFileSize helper. Invalid and negative sizes are shown as 0B.
 */
export function formatFileSize(bytes: unknown, base: number | string = DEFAULT_FILE_SIZE_BASE): string {
    if (typeof bytes === 'string' && bytes.trim() === '') return '0B';
    const size = typeof bytes === 'number' || typeof bytes === 'string' ? Number(bytes) : Number.NaN;
    if (!Number.isFinite(size) || size < 0) return '0B';
    if (size === 0) return '0 B';

    const requestedBase = Number(base);
    const unitBase = requestedBase === 1024 ? 1024 : DEFAULT_FILE_SIZE_BASE;
    if (size < unitBase) return `${size} B`;

    const prefixes = unitBase === 1024 ? ['Ki', 'Mi', 'Gi'] : ['k', 'M', 'G'];
    let unit = -1;
    let value = size;
    while (Math.abs(value) >= unitBase && unit < prefixes.length - 1) {
        value /= unitBase;
        unit += 1;
    }

    return `${value.toFixed(1)} ${prefixes[unit]}B`;
}

/**
 * Truncate a long file name around its middle, preserving equal portions of
 * its prefix and suffix. This follows VFileInput's truncateText rule.
 */
export function truncateFileName(name: unknown, length: number | string = DEFAULT_TRUNCATE_LENGTH): string {
    const text = name == null ? '' : String(name);
    const requestedLength = Number(length);
    const limit = Number.isFinite(requestedLength) && requestedLength > 0
        ? requestedLength
        : DEFAULT_TRUNCATE_LENGTH;

    if (text.length < limit) return text;

    const charsToKeep = Math.floor((limit - 1) / 2);
    return `${text.slice(0, charsToKeep)}…${text.slice(text.length - charsToKeep)}`;
}

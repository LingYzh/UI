import assert from 'node:assert/strict';
import test from 'node:test';
import { formatFileSize, truncateFileName } from '../src/ui/file-display';

test('file sizes use decimal units by default and preserve the upstream one-decimal labels', () => {
    assert.equal(formatFileSize(0), '0 B');
    assert.equal(formatFileSize(1), '1 B');
    assert.equal(formatFileSize(999), '999 B');
    assert.equal(formatFileSize(1000), '1.0 kB');
    assert.equal(formatFileSize(1500), '1.5 kB');
    assert.equal(formatFileSize(1_000_000), '1.0 MB');
    assert.equal(formatFileSize(1_000_000_000), '1.0 GB');
    assert.equal(formatFileSize(1_000_000_000_000), '1000.0 GB');
});

test('file sizes accept numeric-string bases and distinguish binary units', () => {
    assert.equal(formatFileSize(1023, '1024'), '1023 B');
    assert.equal(formatFileSize(1024, '1024'), '1.0 KiB');
    assert.equal(formatFileSize(1536, 1024), '1.5 KiB');
    assert.equal(formatFileSize(1_048_576, '1024'), '1.0 MiB');
    assert.equal(formatFileSize(1_073_741_824, 1024), '1.0 GiB');
    assert.equal(formatFileSize(1500, '1000'), '1.5 kB');
});

test('invalid sizes safely become zero and unsupported bases fall back to decimal', () => {
    assert.equal(formatFileSize(-1), '0B');
    assert.equal(formatFileSize(Number.NaN), '0B');
    assert.equal(formatFileSize(Number.POSITIVE_INFINITY), '0B');
    assert.equal(formatFileSize('not bytes'), '0B');
    assert.equal(formatFileSize('   '), '0B');
    assert.equal(formatFileSize(null), '0B');
    assert.equal(formatFileSize(1000, 'invalid'), '1.0 kB');
    assert.equal(formatFileSize(1000, 0), '1.0 kB');
});

test('file names below the threshold remain intact and longer names retain both ends', () => {
    assert.equal(truncateFileName('short.txt'), 'short.txt');
    assert.equal(truncateFileName('abcdefghij.txt', 10), 'abcd….txt');
    assert.equal(truncateFileName('abcdefghij.txt', '11'), 'abcde…j.txt');
    assert.equal(truncateFileName('abcdefghij.txt', 22), 'abcdefghij.txt');
});

test('file-name truncation matches the upstream floor rule for even and odd limits', () => {
    assert.equal(truncateFileName('abcdefghijklmnop', 8), 'abc…nop');
    assert.equal(truncateFileName('abcdefghijklmnop', 9), 'abcd…mnop');
    assert.equal(truncateFileName('abcdefghijklmnop', 1), '…');
    assert.equal(truncateFileName('abcdef', 4), 'a…f');
});

test('invalid truncation lengths use the stable default and nullish names become empty', () => {
    const longName = 'a-very-long-file-name-that-needs-truncation.txt';
    const defaultResult = truncateFileName(longName);
    assert.equal(truncateFileName(longName, 'not a number'), defaultResult);
    assert.equal(truncateFileName(longName, Number.POSITIVE_INFINITY), defaultResult);
    assert.equal(truncateFileName(longName, -1), defaultResult);
    assert.equal(truncateFileName(longName, 0), defaultResult);
    assert.equal(truncateFileName(null), '');
});

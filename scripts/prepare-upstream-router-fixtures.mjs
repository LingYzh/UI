#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import {
    lstat,
    mkdir,
    readFile,
    readdir,
    rename,
    rm,
    writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const REGISTRY = 'https://registry.npmjs.org';
const PACKAGES = [
    {
        name: 'vuetify',
        version: '4.2.4',
        relativeTarget: path.join('upstream-table-audit', 'package'),
        requiredFiles: ['lib/components/VDatePicker/VDatePicker.js'],
    },
    {
        name: 'vue-router',
        version: '4.6.3',
        relativeTarget: path.join('full-alignment', 'vue-router', 'package'),
        requiredFiles: ['dist/vue-router.esm-browser.prod.js'],
    },
];

function parseArgs(args) {
    let artifactRoot = path.join(REPO_ROOT, 'artifacts');
    let customRoot = false;
    let allowTempRoot = false;
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === '--artifact-root') {
            const value = args[index + 1];
            if (!value || value.startsWith('--')) throw new Error('--artifact-root requires a path.');
            artifactRoot = path.resolve(value);
            customRoot = true;
            index += 1;
        } else if (arg === '--allow-temp-root') {
            allowTempRoot = true;
        } else if (arg === '--help' || arg === '-h') {
            console.log('Usage: node scripts/prepare-upstream-router-fixtures.mjs [--artifact-root <path> --allow-temp-root]');
            console.log('Prepares only the pinned Vuetify and Vue Router package targets.');
            process.exit(0);
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }
    const defaultRoot = path.resolve(REPO_ROOT, 'artifacts');
    if (!customRoot && path.resolve(artifactRoot) !== defaultRoot) throw new Error('The default artifact root cannot be changed implicitly.');
    if (customRoot) {
        if (!allowTempRoot) throw new Error('A custom artifact root requires --allow-temp-root.');
        const tempRoot = path.resolve(os.tmpdir());
        if (!isWithin(tempRoot, artifactRoot) || path.resolve(tempRoot) === path.resolve(artifactRoot)) {
            throw new Error(`A custom artifact root must be a child of the OS temp directory: ${tempRoot}`);
        }
    } else if (allowTempRoot) {
        throw new Error('--allow-temp-root is only valid with --artifact-root.');
    }
    return { artifactRoot, customRoot };
}

function isWithin(parent, candidate) {
    const relative = path.relative(path.resolve(parent), path.resolve(candidate));
    return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function assertNoSymlinkPath(targetPath) {
    const absolute = path.resolve(targetPath);
    const parsed = path.parse(absolute);
    const segments = absolute.slice(parsed.root.length).split(path.sep).filter(Boolean);
    let current = parsed.root;
    for (const segment of segments) {
        current = path.join(current, segment);
        try {
            const info = await lstat(current);
            if (info.isSymbolicLink()) throw new Error(`Refusing symlink path: ${current}`);
            if (current !== absolute && !info.isDirectory()) throw new Error(`Expected a directory in target path: ${current}`);
        } catch (error) {
            if (error?.code === 'ENOENT') return;
            throw error;
        }
    }
}

function decodeSri(integrity) {
    const candidates = String(integrity ?? '').trim().split(/\s+/).map((token) => {
        const match = /^(sha512|sha384|sha256|sha1)-([A-Za-z0-9+/]+={0,2})(?:\?.*)?$/.exec(token);
        return match ? { algorithm: match[1], digest: match[2] } : null;
    }).filter(Boolean);
    const expected = candidates.find((candidate) => candidate.algorithm === 'sha512');
    if (!expected) throw new Error(`Registry metadata did not provide a SHA-512 SRI: ${integrity}`);
    return expected;
}

function verifyDigest(buffer, metadata) {
    const sri = decodeSri(metadata.dist?.integrity);
    const actualSri = createHash(sri.algorithm).update(buffer).digest('base64');
    if (actualSri !== sri.digest) throw new Error(`SHA-512 integrity mismatch for ${metadata.name}@${metadata.version}.`);
    const shasum = String(metadata.dist?.shasum ?? '').toLowerCase();
    if (shasum) {
        const actualShasum = createHash('sha1').update(buffer).digest('hex');
        if (actualShasum !== shasum) throw new Error(`SHA-1 shasum mismatch for ${metadata.name}@${metadata.version}.`);
    }
    return {
        integrity: `${sri.algorithm}-${sri.digest}`,
        sha256: createHash('sha256').update(buffer).digest('hex'),
    };
}

async function fetchJson(url) {
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`Registry request failed (${response.status}): ${url}`);
    const finalUrl = new URL(response.url);
    if (finalUrl.protocol !== 'https:' || finalUrl.hostname !== 'registry.npmjs.org') {
        throw new Error(`Registry metadata redirected to an unexpected origin: ${response.url}`);
    }
    return response.json();
}

function getNpmCacheRoot() {
    const configured = process.env.npm_config_cache ?? process.env.NPM_CONFIG_CACHE;
    if (configured) return path.resolve(configured);
    const base = process.env.LOCALAPPDATA || process.env.APPDATA || os.homedir();
    return path.join(base, process.platform === 'win32' ? 'npm-cache' : '.npm');
}

async function getTarball(metadata) {
    const expected = decodeSri(metadata.dist?.integrity);
    const digestHex = Buffer.from(expected.digest, 'base64').toString('hex');
    const cachePath = path.join(
        getNpmCacheRoot(),
        '_cacache',
        'content-v2',
        expected.algorithm,
        digestHex.slice(0, 2),
        digestHex.slice(2, 4),
        digestHex.slice(4),
    );
    try {
        const cached = await readFile(cachePath);
        verifyDigest(cached, metadata);
        return { buffer: cached, source: 'npm-cacache' };
    } catch (error) {
        if (error?.code !== 'ENOENT' && !String(error?.message ?? '').includes('integrity mismatch') && !String(error?.message ?? '').includes('shasum mismatch')) throw error;
    }

    const tarballUrl = new URL(metadata.dist?.tarball ?? '');
    if (tarballUrl.protocol !== 'https:' || tarballUrl.hostname !== 'registry.npmjs.org') {
        throw new Error(`Refusing non-registry tarball URL: ${tarballUrl.href}`);
    }
    const response = await fetch(tarballUrl, { redirect: 'error' });
    if (!response.ok) throw new Error(`Tarball request failed (${response.status}): ${tarballUrl.href}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    verifyDigest(buffer, metadata);
    return { buffer, source: 'registry' };
}

function parseTarNumber(field, label) {
    if (field.length && (field[0] & 0x80) !== 0) {
        let value = BigInt(field[0] & 0x7f);
        for (let index = 1; index < field.length; index += 1) value = (value << 8n) | BigInt(field[index]);
        if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`Tar ${label} exceeds the safe integer limit.`);
        return Number(value);
    }
    const value = field.toString('ascii').replace(/\0.*$/, '').trim();
    if (!value) return 0;
    if (!/^[0-7]+$/.test(value)) throw new Error(`Invalid tar ${label}: ${value}`);
    const result = Number.parseInt(value, 8);
    if (!Number.isSafeInteger(result)) throw new Error(`Tar ${label} exceeds the safe integer limit.`);
    return result;
}

function tarString(field) {
    const end = field.indexOf(0);
    return field.subarray(0, end < 0 ? field.length : end).toString('utf8');
}

function verifyTarHeader(header) {
    const stored = parseTarNumber(header.subarray(148, 156), 'header checksum');
    let actual = 0;
    for (let index = 0; index < header.length; index += 1) actual += index >= 148 && index < 156 ? 32 : header[index];
    if (stored !== actual) throw new Error('Tar header checksum mismatch.');
}

function parsePax(payload) {
    const values = {};
    let offset = 0;
    while (offset < payload.length) {
        const space = payload.indexOf(0x20, offset);
        if (space < 0) throw new Error('Malformed PAX record length.');
        const lengthText = payload.subarray(offset, space).toString('ascii');
        if (!/^\d+$/.test(lengthText)) throw new Error('Malformed PAX record length.');
        const length = Number(lengthText);
        if (!Number.isSafeInteger(length) || length <= space - offset + 1 || offset + length > payload.length) throw new Error('PAX record exceeds its header payload.');
        const record = payload.subarray(space + 1, offset + length - 1).toString('utf8');
        const equals = record.indexOf('=');
        if (equals > 0) values[record.slice(0, equals)] = record.slice(equals + 1);
        offset += length;
    }
    return values;
}

function normalizedPackagePath(value, isDirectory) {
    if (!value || value.includes('\\') || value.includes('\0') || value.includes(':') || /[\u0001-\u001f\u007f]/.test(value)) {
        throw new Error(`Unsafe path in package tarball: ${JSON.stringify(value)}`);
    }
    if (value.startsWith('/') || /^[A-Za-z]:/.test(value)) throw new Error(`Absolute path in package tarball: ${JSON.stringify(value)}`);
    const withoutTrailingSlash = isDirectory ? value.replace(/\/+$/, '') : value;
    const segments = withoutTrailingSlash.split('/');
    if (segments[0] !== 'package' || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
        if (withoutTrailingSlash === 'package') return '';
        throw new Error(`Tarball entry is outside the package root: ${JSON.stringify(value)}`);
    }
    const relative = segments.slice(1);
    for (const segment of relative) {
        if (/[. ]$/.test(segment) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(segment)) {
            throw new Error(`Non-portable package path: ${JSON.stringify(value)}`);
        }
    }
    return relative.join(path.sep);
}

async function extractPackageTarball(archive, destination) {
    const tar = gunzipSync(archive);
    let offset = 0;
    let globalPax = {};
    let localPax = {};
    let longName = null;
    const seenFiles = new Set();
    const seenDirectories = new Set();
    const entries = [];

    while (offset + 512 <= tar.length) {
        const header = tar.subarray(offset, offset + 512);
        if (header.every((byte) => byte === 0)) break;
        verifyTarHeader(header);
        const headerSize = parseTarNumber(header.subarray(124, 136), 'size');
        const type = String.fromCharCode(header[156] || 0);
        const name = tarString(header.subarray(0, 100));
        const prefix = tarString(header.subarray(345, 500));
        const rawPath = prefix ? `${prefix}/${name}` : name;
        const dataStart = offset + 512;
        const dataSize = headerSize;
        if (dataStart + dataSize > tar.length) throw new Error('Tar entry extends beyond archive bounds.');
        const payload = tar.subarray(dataStart, dataStart + dataSize);

        let consumedSize = dataSize;
        if (type === 'x' || type === 'g') {
            const pax = parsePax(payload);
            if (type === 'g') globalPax = { ...globalPax, ...pax };
            else localPax = { ...localPax, ...pax };
        } else if (type === 'L') {
            longName = payload.toString('utf8').replace(/[\0\n]+$/, '');
        } else if (type === 'K') {
            throw new Error('Link entries are not supported in package tarballs.');
        } else {
            const effectiveSize = Number(localPax.size ?? globalPax.size ?? headerSize);
            if (!Number.isSafeInteger(effectiveSize) || effectiveSize < 0 || dataStart + effectiveSize > tar.length) throw new Error('Invalid effective tar entry size.');
            const isDirectory = type === '5';
            if (type !== '0' && type !== '\0' && !isDirectory) throw new Error(`Unsupported tar entry type ${JSON.stringify(type)}.`);
            const effectivePath = localPax.path ?? longName ?? rawPath;
            const relative = normalizedPackagePath(effectivePath, isDirectory);
            consumedSize = effectiveSize;
            if (!relative && !isDirectory) throw new Error(`Unexpected file entry at package root: ${effectivePath}`);
            if (relative) {
                const key = relative.split(path.sep).join('/');
                const mode = parseTarNumber(header.subarray(100, 108), 'mode') & 0o777;
                if (isDirectory) {
                    if (seenFiles.has(key)) throw new Error(`Tarball path is both a file and directory: ${key}`);
                    seenDirectories.add(key);
                    entries.push({ kind: 'directory', relative, mode });
                } else {
                    if (seenFiles.has(key) || seenDirectories.has(key)) throw new Error(`Duplicate tarball path: ${key}`);
                    seenFiles.add(key);
                    entries.push({ kind: 'file', relative, mode, data: Buffer.from(tar.subarray(dataStart, dataStart + effectiveSize)) });
                }
            }
            localPax = {};
            longName = null;
        }
        offset = dataStart + Math.ceil(consumedSize / 512) * 512;
    }

    for (const entry of entries) {
        const outputPath = path.join(destination, entry.relative);
        if (!isWithin(destination, outputPath)) throw new Error(`Extraction path escaped staging directory: ${entry.relative}`);
        if (entry.kind === 'directory') {
            await mkdir(outputPath, { recursive: true });
        } else {
            await mkdir(path.dirname(outputPath), { recursive: true });
            await writeFile(outputPath, entry.data, { flag: 'wx', mode: entry.mode || 0o644 });
        }
    }
}

async function walkFiles(directory, prefix = '') {
    const output = new Map();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
        const info = await lstat(fullPath);
        if (info.isSymbolicLink()) throw new Error(`Unexpected symlink in package tree: ${fullPath}`);
        if (info.isDirectory()) {
            const nested = await walkFiles(fullPath, relative);
            for (const [name, digest] of nested) output.set(name, digest);
        } else if (info.isFile()) {
            const contents = await readFile(fullPath);
            output.set(relative, createHash('sha256').update(contents).digest('hex'));
        } else {
            throw new Error(`Unsupported filesystem entry in package tree: ${fullPath}`);
        }
    }
    return output;
}

async function assertPackageIdentity(packageRoot, spec) {
    const packageJsonPath = path.join(packageRoot, 'package.json');
    const packageInfo = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    if (packageInfo.name !== spec.name || packageInfo.version !== spec.version) {
        throw new Error(`Package identity mismatch at ${packageRoot}: expected ${spec.name}@${spec.version}, found ${packageInfo.name}@${packageInfo.version}.`);
    }
    for (const requiredFile of spec.requiredFiles) {
        const fullPath = path.join(packageRoot, ...requiredFile.split('/'));
        const info = await lstat(fullPath).catch(() => null);
        if (!info?.isFile() || info.isSymbolicLink()) throw new Error(`Missing required fixture file: ${fullPath}`);
    }
}

async function readRegistryMetadata(spec) {
    const metadata = await fetchJson(`${REGISTRY}/${encodeURIComponent(spec.name)}/${encodeURIComponent(spec.version)}`);
    if (metadata.name !== spec.name || metadata.version !== spec.version) throw new Error(`Unexpected registry package identity for ${spec.name}@${spec.version}.`);
    const tarball = new URL(metadata.dist?.tarball ?? '');
    if (tarball.protocol !== 'https:' || tarball.hostname !== 'registry.npmjs.org') throw new Error(`Unexpected registry tarball URL: ${tarball.href}`);
    decodeSri(metadata.dist?.integrity);
    return metadata;
}

async function preparePackage(spec, artifactRoot) {
    const target = path.resolve(artifactRoot, spec.relativeTarget);
    if (!isWithin(artifactRoot, target)) throw new Error(`Package target escaped artifact root: ${target}`);
    await assertNoSymlinkPath(target);
    const metadata = await readRegistryMetadata(spec);
    const { buffer, source } = await getTarball(metadata);
    const digest = verifyDigest(buffer, metadata);
    const targetInfo = await lstat(target).catch((error) => {
        if (error?.code === 'ENOENT') return null;
        throw error;
    });
    if (targetInfo && !targetInfo.isDirectory()) throw new Error(`Refusing to replace non-directory fixture target: ${target}`);

    await mkdir(path.dirname(target), { recursive: true });
    await assertNoSymlinkPath(path.dirname(target));
    const staging = path.join(path.dirname(target), `.${path.basename(target)}.prepare-${process.pid}-${cryptoRandomSuffix()}`);
    if (!isWithin(path.dirname(target), staging)) throw new Error(`Staging path escaped package parent: ${staging}`);
    await mkdir(staging, { recursive: false });
    try {
        await extractPackageTarball(buffer, staging);
        await assertPackageIdentity(staging, spec);
        if (targetInfo) {
            await assertNoSymlinkPath(target);
            await assertPackageIdentity(target, spec);
            const existing = await walkFiles(target);
            const expected = await walkFiles(staging);
            const identical = existing.size === expected.size && [...expected].every(([name, hash]) => existing.get(name) === hash);
            if (!identical) throw new Error(`Existing ${spec.name}@${spec.version} tree differs from verified registry bytes; leaving it untouched: ${target}`);
            return { name: spec.name, version: spec.version, action: 'reused', tarballSource: source, integrity: digest.integrity, sha256: digest.sha256, target };
        }
        await rename(staging, target);
        return { name: spec.name, version: spec.version, action: 'prepared', tarballSource: source, integrity: digest.integrity, sha256: digest.sha256, target };
    } finally {
        if (!isWithin(path.dirname(target), staging)) throw new Error(`Refusing cleanup outside package parent: ${staging}`);
        await rm(staging, { recursive: true, force: true });
    }
}

function cryptoRandomSuffix() {
    return createHash('sha256').update(`${Date.now()}-${Math.random()}-${process.pid}`).digest('hex').slice(0, 12);
}

async function main() {
    const { artifactRoot } = parseArgs(process.argv.slice(2));
    await assertNoSymlinkPath(artifactRoot);
    await mkdir(artifactRoot, { recursive: true });
    await assertNoSymlinkPath(artifactRoot);
    const results = [];
    for (const spec of PACKAGES) results.push(await preparePackage(spec, artifactRoot));
    console.log(JSON.stringify({ registry: REGISTRY, results }, null, 2));
}

main().catch((error) => {
    console.error(error?.stack ?? String(error));
    process.exitCode = 1;
});

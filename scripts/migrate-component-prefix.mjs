import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const uiRoot = path.resolve(path.dirname(scriptPath), '..');
const docsRoot = path.join(uiRoot, 'src', 'ui', 'docs');
const indexPath = path.join(uiRoot, 'src', 'ui', 'index.ts');
const previewPath = path.join(uiRoot, 'src', 'ui', 'UiPreview.vue');
const writeChanges = process.argv.includes('--write');

function readComponentMappings() {
    const source = fs.readFileSync(indexPath, 'utf8');
    const legacyExports = new Map();
    const canonicalExports = new Set();

    for (const match of source.matchAll(/export\s*\{\s*default\s+as\s+(Ui[A-Za-z0-9]+)\s*\}\s*from\s*(['"])([^'"]+)\2/g)) {
        legacyExports.set(match[1], match[3]);
    }

    for (const match of source.matchAll(/export\s*\{\s*default\s+as\s+(U[A-Za-z0-9]+)\s*\}\s*from\s*(['"])([^'"]+)\2/g)) {
        canonicalExports.add(match[1]);
    }

    const mappings = [];
    for (const [legacyName, sourcePath] of legacyExports) {
        const canonicalName = legacyName === 'UiInput'
            ? 'UTextField'
            : legacyName === 'UiBadge'
                ? 'UChip'
                : `U${legacyName.slice(2)}`;

        if (!canonicalExports.has(canonicalName)) {
            throw new Error(`No canonical export ${canonicalName} for ${legacyName} (${sourcePath})`);
        }

        mappings.push({ legacyName, canonicalName, tagName: toKebabTag(canonicalName) });
    }

    return mappings.sort((left, right) => right.legacyName.length - left.legacyName.length);
}

function toKebabTag(componentName) {
    return componentName
        .slice(1)
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase()
        .replace(/^/, 'u-');
}

function getTargetFiles() {
    const docFiles = fs.readdirSync(docsRoot, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .filter((entry) => entry.name.endsWith('.vue') || /^.+Content\.js$/i.test(entry.name) || entry.name === 'content.js')
        .map((entry) => path.join(docsRoot, entry.name));

    return [...docFiles, previewPath].filter((filePath) => fs.existsSync(filePath));
}

function replaceComponentReferences(original, mappings) {
    const guards = [];
    let text = original;

    const guardMatches = (pattern) => {
        text = text.replace(pattern, (match) => {
            const token = `__UI_PREFIX_MIGRATION_GUARD_${guards.length}__`;
            guards.push([token, match]);
            return token;
        });
    };

    // Keep import paths pointing at their existing UiFoo.vue files.
    guardMatches(/(['"])[^'"\r\n]*\/Ui[A-Z][A-Za-z0-9]*\.vue\1/g);

    // Content identity and API lookup keys stay legacy until apiReference.js is regenerated.
    for (const { legacyName } of mappings) {
        const escapedName = escapeRegExp(legacyName);
        guardMatches(new RegExp(`((?:"?(?:name|component|api|apiKey|apiName|componentName)"?)\\s*:\\s*)(['"])${escapedName}\\2`, 'g'));
        guardMatches(new RegExp(`(['"])${escapedName}\\1(?=\\s*:)`, 'g'));
        guardMatches(new RegExp(`\\b(?:apiReference|componentApi)\\s*\\.\\s*${escapedName}\\b`, 'g'));
        guardMatches(new RegExp(`\\b(?:apiReference|componentApi)\\s*\\[\\s*(['"])${escapedName}\\1\\s*\\]`, 'g'));
    }

    let tagCount = 0;
    let symbolCount = 0;
    for (const { legacyName, canonicalName, tagName } of mappings) {
        const tagPattern = new RegExp(`(<\\/?)(?:${escapeRegExp(legacyName)})(?=[\\s/>])`, 'g');
        text = text.replace(tagPattern, (_match, prefix) => {
            tagCount += 1;
            return `${prefix}${tagName}`;
        });

        const symbolPattern = new RegExp(`\\b${escapeRegExp(legacyName)}\\b`, 'g');
        text = text.replace(symbolPattern, () => {
            symbolCount += 1;
            return canonicalName;
        });
    }

    for (const [token, guardedText] of guards) {
        text = text.replace(token, guardedText);
    }

    return { text, tagCount, symbolCount };
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function printPreview(filePath, before, after) {
    const beforeLines = before.split(/\r?\n/);
    const afterLines = after.split(/\r?\n/);
    let shown = 0;

    for (let index = 0; index < Math.max(beforeLines.length, afterLines.length) && shown < 4; index += 1) {
        if (beforeLines[index] === afterLines[index]) continue;
        const oldLine = (beforeLines[index] ?? '').trim().slice(0, 160);
        const newLine = (afterLines[index] ?? '').trim().slice(0, 160);
        process.stdout.write(`  - ${oldLine}\n  + ${newLine}\n`);
        shown += 1;
    }

    if (shown === 4) process.stdout.write('  …\n');
}

function main() {
    const mappings = readComponentMappings();
    const files = getTargetFiles();
    let changedFiles = 0;
    let changedSymbols = 0;
    let changedTags = 0;

    for (const filePath of files) {
        const before = fs.readFileSync(filePath, 'utf8');
        const result = replaceComponentReferences(before, mappings);
        if (result.text === before) continue;

        changedFiles += 1;
        changedSymbols += result.symbolCount;
        changedTags += result.tagCount;
        const relativePath = path.relative(uiRoot, filePath).replaceAll(path.sep, '/');

        if (writeChanges) {
            fs.writeFileSync(filePath, result.text, 'utf8');
            process.stdout.write(`updated ${relativePath} (${result.symbolCount} names, ${result.tagCount} tags)\n`);
        } else {
            process.stdout.write(`would update ${relativePath} (${result.symbolCount} names, ${result.tagCount} tags)\n`);
            printPreview(filePath, before, result.text);
        }
    }

    const mode = writeChanges ? 'write' : 'dry-run';
    process.stdout.write(`\n${mode}: ${changedFiles} file(s), ${changedSymbols} component name(s), ${changedTags} tag(s); ${mappings.length} legacy component mappings checked.\n`);
}

main();

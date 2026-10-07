import { readdir, readFile, writeFile } from 'node:fs/promises';
import ts from 'typescript';
import { formatDemoSource } from './demo-source-format.mjs';

const directory = new URL('../src/ui/docs/', import.meta.url);
const files = await readdir(directory);
let changedFiles = 0;
let formattedExamples = 0;
async function writeChanged(file, previous, next) {
    if (previous === next) return;
    await writeFile(file, next);
    changedFiles++;
}

for (const folder of [directory, new URL('component-examples/', directory)]) {
    for (const name of await readdir(folder)) {
        if (folder === directory ? !name.endsWith('Demo.vue') : !name.endsWith('.vue')) continue;
        const file = new URL(name, folder);
        const source = await readFile(file, 'utf8');
        await writeChanged(file, source, await formatDemoSource(source));
    }
}

// Edit only literal `code` properties, leaving document metadata and prose
// untouched. TypeScript's parser avoids confusing embedded quotes with JS.
for (const name of files.filter(name => name === 'content.js' || /Content\.js$/.test(name))) {
    const file = new URL(name, directory);
    const source = await readFile(file, 'utf8');
    const tree = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const properties = [];
    function visit(node) {
        if (ts.isPropertyAssignment(node) && node.name.getText(tree).replace(/^['"]|['"]$/g, '') === 'code'
            && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))) {
            properties.push(node.initializer);
        }
        ts.forEachChild(node, visit);
    }
    visit(tree);
    const edits = [];
    for (const literal of properties) {
        let formatted;
        try { formatted = await formatDemoSource(literal.text); }
        catch (error) { throw new Error(`${name}:${tree.getLineAndCharacterOfPosition(literal.getStart(tree)).line + 1}: ${error.message}`); }
        edits.push({ start: literal.getStart(tree), end: literal.end, text: JSON.stringify(formatted) });
        formattedExamples++;
    }
    let next = source;
    for (const edit of edits.sort((a, b) => b.start - a.start)) next = next.slice(0, edit.start) + edit.text + next.slice(edit.end);
    await writeChanged(file, source, next);
}
console.log(`Formatted ${formattedExamples} source examples; updated ${changedFiles} files.`);

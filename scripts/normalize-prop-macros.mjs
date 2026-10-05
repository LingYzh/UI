import { readFile, writeFile, readdir } from 'node:fs/promises';
import ts from 'typescript';
const directory = new URL('../src/ui/', import.meta.url);
for (const file of await readdir(directory)) {
    if (!file.endsWith('.vue')) continue;
    const path = new URL(file, directory);
    let source = await readFile(path, 'utf8');
    const script = /<script setup[^>]*>([\s\S]*?)<\/script>/.exec(source);
    if (!script) continue;
    const code = script[1];
    const parsed = ts.createSourceFile(file + '.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const edits = [];
    for (const statement of parsed.statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const declaration of statement.declarationList.declarations) {
            const call = declaration.initializer;
            if (!call || !ts.isCallExpression(call) || call.expression.getText(parsed) !== 'useDefaults') continue;
            const first = call.arguments[0];
            if (!ts.isCallExpression(first) || !['defineProps', 'withDefaults'].includes(first.expression.getText(parsed))) continue;
            const name = declaration.name.getText(parsed);
            const rest = call.arguments.slice(1).map(argument => argument.getText(parsed)).join(', ');
            edits.push({ start: statement.getStart(parsed), end: statement.end, text: `const rawProps = ${first.getText(parsed)};\nconst ${name} = useDefaults(rawProps${rest ? ', ' + rest : ''});` });
        }
    }
    let result = code;
    for (const edit of edits.reverse()) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
    if (result !== code) { source = source.replace(code, result); await writeFile(path, source); }
}

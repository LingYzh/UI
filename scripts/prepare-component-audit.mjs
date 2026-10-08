import ts from 'typescript';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { extractPublicComponentContracts } from '../tests/helpers/component-contracts.mjs';
import { pages } from '../src/ui/docs/content.js';

const output = path.resolve('docs/component-audit-2026-10-08');
const upstreamRoot = path.resolve(process.argv[2] ?? 'artifacts/upstream-table-audit/package/lib');
const version = JSON.parse(readFileSync(path.join(upstreamRoot, '../package.json'), 'utf8')).version;
if (version !== '4.2.4') throw new Error('Audit baseline must be vuetify@4.2.4.');
// Pinned official registry metadata was queried during this audit. Verify the
// existing archive without installing a second UI runtime in the project.
const integrity = 'sha512-zLYtVGJcg2hK3DHoeiBXSImpzg4E0N19p3zCgGnNhMp/YwaVQZXP4cPkIKeL/evVnUeLP/CjSnFsFBThWSl2Ew==';
const tarballFile = path.resolve(upstreamRoot, '../../vuetify.tgz');
const archiveIntegrity = 'sha512-' + createHash('sha512').update(readFileSync(tarballFile)).digest('base64');
if (archiveIntegrity !== integrity) throw new Error('Upstream archive does not match the official registry integrity.');
const files = readdirSync(path.join(upstreamRoot, 'components'), { recursive: true }).filter(file => file.endsWith('.js'));
const overrides = { UButton: 'VBtn' };
const custom = new Set(['UFormSection', 'UFormActions', 'UTabPanel', 'UCollapse', 'USnackbarHost', 'UScrollArea', 'UCodeBlock', 'UActivity', 'UDiff', 'UMarkdown', 'UFileChanges', 'UMessageActions', 'UUsageMeter', 'USpinner', 'UMenuItem', 'UConfirmHost', 'UProgress', 'UCopyButton', 'UColorSwatches', 'UCascader', 'UCheckboxGroup', 'UTransition']);

function upstreamContract(name) {
    if (custom.has(name)) return null;
    const target = overrides[name] ?? 'V' + name.slice(1);
    const relative = files.find(file => path.basename(file) === target + '.js');
    if (!relative) return null;
    const filename = path.join(upstreamRoot, 'components', relative);
    const originalSource = existsSync(filename + '.map') ? JSON.parse(readFileSync(filename + '.map', 'utf8')).sources?.find(source => source.includes('/src/components/'))?.match(/src\/components\/.+$/)?.[0] : undefined;
    const typeFile = filename.replace(/\.js$/, '.d.ts');
    const source = ts.createSourceFile(typeFile, readFileSync(typeFile, 'utf8'), ts.ScriptTarget.Latest, true);
    let props = null;
    // Published factory declarations flatten inherited defaults. This is a name
    // inventory only: runtime forwarding, types and semantics still need review.
    for (const statement of source.statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const declaration of statement.declarationList.declarations) {
            if (declaration.name.getText(source) !== 'make' + target + 'Props') continue;
            const constraint = declaration.type?.typeParameters?.[0]?.constraint;
            if (constraint && ts.isTypeLiteralNode(constraint)) props = constraint.members.filter(member => member.name).map(member => member.name.getText(source).replace(/^['"]|['"]$/g, ''));
        }
    }
    return { name: target, file: path.relative(process.cwd(), filename).replaceAll('\\', '/'), typeFile: path.relative(process.cwd(), typeFile).replaceAll('\\', '/'), props, extraction: props ? 'published-factory-default-keys' : 'manual-review-required', url: `https://github.com/vuetifyjs/vuetify/blob/v4.2.4/packages/vuetify/${originalSource ?? 'src/components/' + relative.replaceAll('\\', '/').replace(/\.js$/, '.tsx')}` };
}

const inventory = extractPublicComponentContracts(process.cwd()).map(contract => {
    const page = pages.find(page => page.name === contract.name);
    const upstream = upstreamContract(contract.name);
    const props = [...contract.props, ...contract.models].map(prop => prop.name);
    return { name: contract.name, file: contract.file, group: page?.group ?? '无独立页面', page: page?.id ?? null, upstream, local: { props, events: contract.emits.map(event => event.name), slots: contract.slots.map(slot => slot.name === '<dynamic>' ? slot.pattern : slot.name) }, potentialMissingProps: upstream?.props?.filter(prop => !props.includes(prop) && !['class', 'style'].includes(prop) && !prop.startsWith('onUpdate:')) ?? null, examples: page?.examples?.map(example => ({ id: example.id, fullSource: example.fullSource === true })) ?? [] };
});
const buckets = [[], [], []];
for (const item of inventory) {
    const bucket = item.group === '表单组件' ? 0 : ['布局组件', '导航组件', '容器组件'].includes(item.group) ? 1 : 2;
    buckets[bucket].push(item);
}
mkdirSync(output, { recursive: true });
writeFileSync(path.join(output, 'inventory.json'), JSON.stringify({ baseline: version, baselineSource: { tarball: 'https://registry.npmjs.org/vuetify/-/vuetify-4.2.4.tgz', integrity, archiveIntegrity, verified: true }, scope: 'canonical public U* components, legacy Ui* aliases share implementations', inventory }, null, 4) + '\n');
buckets.forEach((components, index) => writeFileSync(path.join(output, `batch-${index + 1}.json`), JSON.stringify(components, null, 4) + '\n'));
console.log(JSON.stringify({ total: inventory.length, upstreamMapped: inventory.filter(item => item.upstream).length, customOrUnmapped: inventory.filter(item => !item.upstream).length, batches: buckets.map(items => ({ count: items.length, names: items.map(item => item.name) })) }, null, 4));

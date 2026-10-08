import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { extractPublicComponentContracts } from '../tests/helpers/component-contracts.mjs';

const directory = path.resolve('docs/component-audit-2026-10-08');
const inventory = JSON.parse(readFileSync(path.join(directory, 'inventory.json'), 'utf8'));
const current = extractPublicComponentContracts(process.cwd());
const sort = values => [...values].sort();
assert.deepEqual(sort(inventory.inventory.map(item => item.name)), sort(current.map(item => item.name)), 'inventory covers current canonical public exports');
const statuses = new Set(['gap', 'partial', 'no-confirmed-gap', 'custom', 'mapping-review']);
const semantics = new Set(['implemented', 'partial', 'missing', 'different', 'unverified']);
const reviewed = [];
const problems = [];

function verifyReference(reference, label) {
    const match = /^(.+):(\d+)(?:-\d+)?$/.exec(reference);
    assert.ok(match, `${label}: source evidence must include a line number: ${reference}`);
    assert.ok(existsSync(match[1]), `${label}: source evidence file exists: ${reference}`);
    assert.ok(Number(match[2]) >= 1 && Number(match[2]) <= readFileSync(match[1], 'utf8').split('\n').length, `${label}: source evidence line exists: ${reference}`);
}

for (let batch = 1; batch <= 3; batch++) {
    const expected = JSON.parse(readFileSync(path.join(directory, `batch-${batch}.json`), 'utf8'));
    const resultFile = path.join(directory, `results-${batch}.json`);
    if (!existsSync(resultFile)) { problems.push(`batch ${batch} pending`); continue; }
    const result = JSON.parse(readFileSync(resultFile, 'utf8'));
    assert.equal(result.batch, batch);
    assert.equal(result.baseline, inventory.baseline);
    assert.deepEqual(sort(result.components.map(item => item.name)), sort(expected.map(item => item.name)), `batch ${batch}: exactly one result per assigned component`);
    for (const row of result.components) {
        assert.ok(statuses.has(row.classification), `${row.name}: classification`);
        assert.ok(['static', 'targeted-runtime', 'existing-evidence-only'].includes(row.verification), `${row.name}: verification`);
        for (const field of ['reviewedFiles', 'confirmedMissingProps', 'confirmedMissingEvents', 'confirmedMissingSlots', 'contractNotes', 'semantics', 'runtimeEvidence', 'limitations']) assert.ok(Array.isArray(row[field]), `${row.name}: ${field}`);
        for (const field of ['confirmedMissingProps', 'confirmedMissingEvents', 'confirmedMissingSlots']) assert.equal(new Set(row[field]).size, row[field].length, `${row.name}: no duplicate ${field}`);
        if (row.classification === 'no-confirmed-gap') assert.equal(row.confirmedMissingProps.length + row.confirmedMissingEvents.length + row.confirmedMissingSlots.length, 0, `${row.name}: no-confirmed-gap must not contradict confirmed missing contracts`);
        assert.ok(row.reviewedFiles.length > 0 && row.contractNotes.length > 0 && row.semantics.length > 0 && row.summary?.trim(), `${row.name}: meaningful review`);
        for (const filename of row.reviewedFiles) assert.ok(existsSync(filename), `${row.name}: reviewed file exists: ${filename}`);
        const assigned = expected.find(item => item.name === row.name);
        assert.equal(row.upstreamName, assigned.upstream?.name ?? null, `${row.name}: mapping matches the inventory; responsibility differences belong in the review`);
        assert.ok(row.reviewedFiles.includes(assigned.file), `${row.name}: implementation was reviewed`);
        const properties = row.propertyReview;
        assert.ok(properties && Array.isArray(properties.notes) && properties.notes.length > 0, `${row.name}: all candidate properties require a review disposition`);
        const candidates = assigned.potentialMissingProps ?? [];
        assert.deepEqual(sort(properties.reviewedCandidates), sort(candidates), `${row.name}: every property candidate was reviewed`);
        const partition = ['missing', 'supportedViaForwarding', 'intentionallyDifferent', 'unverified'].flatMap(field => {
            assert.ok(Array.isArray(properties[field]), `${row.name}: propertyReview.${field}`);
            return properties[field];
        });
        assert.deepEqual(sort(partition), sort(candidates), `${row.name}: property review partition is complete and disjoint`);
        assert.ok(properties.missing.every(prop => row.confirmedMissingProps.includes(prop)), `${row.name}: confirmed missing property list contains all proven missing candidates`);
        if (properties.unverified.length) assert.notEqual(row.classification, 'no-confirmed-gap', `${row.name}: unverified candidates must be stated`);
        assert.ok(row.demo && Array.isArray(row.demo.files) && Array.isArray(row.demo.covered) && Array.isArray(row.demo.missing), `${row.name}: real demo review`);
        for (const filename of row.demo.files) assert.ok(existsSync(filename), `${row.name}: demo file exists: ${filename}`);
        for (const filename of row.runtimeEvidence) assert.ok(existsSync(filename), `${row.name}: runtime evidence exists: ${filename}`);
        if (row.verification === 'targeted-runtime') assert.ok(row.runtimeEvidence.length > 0, `${row.name}: runtime review must cite actual evidence`);
        for (const check of row.semantics) {
            assert.ok(semantics.has(check.result) && check.feature?.trim() && check.detail?.trim(), `${row.name}: concrete semantic check`);
            assert.ok(check.localEvidence?.length > 0 && Array.isArray(check.upstreamEvidence), `${row.name}: evidence required`);
            check.localEvidence.forEach(reference => verifyReference(reference, row.name));
            check.upstreamEvidence.forEach(reference => verifyReference(reference, row.name));
        }
        reviewed.push(row);
    }
}

if (process.argv.includes('--require-complete')) assert.deepEqual(problems, [], 'all batches must finish before publishing the audit');
const classifications = Object.fromEntries([...statuses].map(status => [status, reviewed.filter(row => row.classification === status).length]));
const verification = Object.fromEntries(['static', 'targeted-runtime', 'existing-evidence-only'].map(method => [method, reviewed.filter(row => row.verification === method).length]));
const sourceSnapshots = inventory.inventory.map(item => ({ name: item.name, file: item.file, sha256: createHash('sha256').update(readFileSync(item.file)).digest('hex') }));
const propertyReview = Object.fromEntries(['reviewedCandidates', 'missing', 'supportedViaForwarding', 'intentionallyDifferent', 'unverified'].map(field => [field, reviewed.reduce((total, row) => total + row.propertyReview[field].length, 0)]));
const contracts = Object.fromEntries(['confirmedMissingProps', 'confirmedMissingEvents', 'confirmedMissingSlots'].map(field => [field, reviewed.reduce((total, row) => total + row[field].length, 0)]));
const report = { baseline: inventory.baseline, baselineSource: inventory.baselineSource, total: inventory.inventory.length, reviewed: reviewed.length, complete: problems.length === 0, classifications, verification, propertyReview, contracts, pending: problems, sourceSnapshots };
if (process.argv.includes('--require-complete')) writeFileSync(path.join(directory, 'validation.json'), JSON.stringify(report, null, 4) + '\n');
console.log(JSON.stringify({ ...report, sourceSnapshots: undefined }, null, 4));

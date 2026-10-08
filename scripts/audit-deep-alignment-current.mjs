import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import ts from 'typescript'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'

/*
 * Re-runs only the per-prop Vue compiler reference scan against an existing matrix.
 * It does not refresh the canonical export mapping, API docs, Vuetify source mapping,
 * demo comparisons, reports, or hand-confirmed findings. A full refresh needs those
 * registries, the current upstream archive, real docs SFCs, focused report files,
 * approved decisions, and the current source tree; regenerate those fields first.
 */

const matrixPath = 'docs/component-audit-2026-10-08/DEEP-ALIGNMENT-CURRENT.json'
const markdownPath = 'docs/component-audit-2026-10-08/DEEP-ALIGNMENT-CURRENT.md'
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'))
const scannedAt = new Date().toISOString()
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const totals = { declaredProps: 0, directReads: 0, modelManagedWithoutDirectRead: 0, nonModelNoDirectRead: 0, componentsWithNoDirectRead: 0 }
const rowsWithNoDirectRead = []
const staleSourceRows = []

for (const row of matrix.components) {
    const source = fs.readFileSync(row.source, 'utf8')
    const currentSourceHash = sha256(row.source)
    if (currentSourceHash !== row.sourceSha256) staleSourceRows.push({ component: row.name, source: row.source, matrixSha256: row.sourceSha256, currentSha256: currentSourceHash })
    const descriptor = parse(source, { filename: row.source }).descriptor
    let scriptCode = ''
    let templateCode = ''
    let bindings = {}
    let compileError = null
    if (descriptor.scriptSetup || descriptor.script) {
        try {
            const compiled = compileScript(descriptor, {
                id: row.name,
                fs: {
                    fileExists: (file) => fs.existsSync(file),
                    readFile: (file) => fs.readFileSync(path.resolve(file), 'utf8'),
                },
            })
            scriptCode = compiled.content
            bindings = compiled.bindings || {}
            if (descriptor.template) {
                const template = compileTemplate({
                    source: descriptor.template.content,
                    filename: row.source,
                    id: row.name,
                    compilerOptions: { bindingMetadata: bindings },
                })
                templateCode = template.code || ''
                if (template.errors?.length) compileError = template.errors.map(String)
            }
        } catch (error) {
            compileError = String(error?.message || error)
        }
    }

    const aliases = new Set(['__props', 'props', 'rawProps'])
    let foundAlias = true
    const scriptFile = ts.createSourceFile(row.source + '.ts', scriptCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    while (foundAlias) {
        foundAlias = false
        const visitAliases = (node) => {
            if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
                const init = node.initializer
                const directAlias = ts.isIdentifier(init) && aliases.has(init.text)
                const defaultsAlias = ts.isCallExpression(init)
                    && ts.isIdentifier(init.expression)
                    && init.expression.text === 'useDefaults'
                    && ts.isIdentifier(init.arguments[0])
                    && aliases.has(init.arguments[0].text)
                if ((directAlias || defaultsAlias) && !aliases.has(node.name.text)) {
                    aliases.add(node.name.text)
                    foundAlias = true
                }
            }
            ts.forEachChild(node, visitAliases)
        }
        visitAliases(scriptFile)
    }

    const propertyReads = new Set()
    const objectCallSites = []
    let dynamicPropertyAccess = false
    const visitReads = (node) => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && aliases.has(node.expression.text)) {
            propertyReads.add(node.name.text)
        } else if (ts.isElementAccessExpression(node) && ts.isIdentifier(node.expression) && aliases.has(node.expression.text)
            && node.argumentExpression && (ts.isStringLiteral(node.argumentExpression) || ts.isNoSubstitutionTemplateLiteral(node.argumentExpression))) {
            propertyReads.add(node.argumentExpression.text)
        } else if (ts.isElementAccessExpression(node) && ts.isIdentifier(node.expression) && aliases.has(node.expression.text)) {
            dynamicPropertyAccess = true
        }
        if (ts.isCallExpression(node)) {
            node.arguments.forEach((argument) => {
                if (!ts.isIdentifier(argument) || !aliases.has(argument.text)) return
                let callee = ts.isIdentifier(node.expression) ? node.expression.text : node.expression.getText(scriptFile)
                objectCallSites.push({ callee, argument: argument.text })
            })
        }
        ts.forEachChild(node, visitReads)
    }
    visitReads(scriptFile)

    const templateReads = new Set()
    const templateObjectCallSites = []
    for (const match of templateCode.matchAll(/\$setup\.([A-Za-z_$][\w$]*)\(\$setup\.props\)/g)) {
        templateObjectCallSites.push(match[1])
    }
    for (const prop of row.currentContract.props) {
        const name = escape(prop)
        const directBinding = new RegExp('(?:\\$setup\\.(?:props\\.)?|_ctx\\.|\\$props\\.)' + name + '\\b')
        if (directBinding.test(templateCode)) templateReads.add(prop)
    }
    const directlyRead = row.currentContract.props.filter((prop) => propertyReads.has(prop) || templateReads.has(prop))
    const noDirectRead = row.currentContract.props.filter((prop) => !directlyRead.includes(prop))
    const modelManaged = noDirectRead.filter((prop) => row.currentContract.modelChannels.includes(prop))
    const nonModelNoDirectRead = noDirectRead.filter((prop) => !modelManaged.includes(prop))
    const wholeObjectForwarded = /\bv-bind\s*=\s*["'](?:props|rawProps)["']/.test(descriptor.template?.content || '')
    row.currentContract.propConsumption = {
        method: 'Vue compiler output reference scan',
        directReads: directlyRead.map((name) => ({
            name,
            setupReference: propertyReads.has(name),
            templateReference: templateReads.has(name),
        })),
        declaredWithoutDirectReference: noDirectRead,
        modelManagedWithoutDirectReference: modelManaged,
        nonModelWithoutDirectReference: nonModelNoDirectRead,
        propsObjectCallSites: objectCallSites,
        templateObjectCallSites,
        wholePropsObjectForwardedInTemplate: wholeObjectForwarded,
        dynamicPropertyAccess,
        compileError,
        boundary: 'A direct reference is evidence of a code-level read, not proof of correct behavior. No direct reference is not by itself a functional gap: props may be forwarded as an object, fall through, or require manual call-chain review. Only manually confirmed inert props are reported as gaps.'
    }
    totals.declaredProps += row.currentContract.props.length
    totals.directReads += directlyRead.length
    totals.modelManagedWithoutDirectRead += modelManaged.length
    totals.nonModelNoDirectRead += nonModelNoDirectRead.length
    if (noDirectRead.length) {
        totals.componentsWithNoDirectRead++
        rowsWithNoDirectRead.push({
            component: row.name,
            props: nonModelNoDirectRead,
            modelManagedProps: modelManaged,
            propsObjectCallSites: objectCallSites,
            templateObjectCallSites,
            wholePropsObjectForwarded: wholeObjectForwarded,
            dynamicPropertyAccess,
        })
    }
}

matrix.propConsumptionAudit = {
    method: 'Vue compiler output reference scan',
    scriptPath: 'scripts/audit-deep-alignment-current.mjs',
    scannedAt,
    staleSourceRows,
    fullMatrixRebuildRequires: [
        'current src/ui/index.ts export/name-to-SFC mapping',
        'Vuetify 4.2.4 runtime and d.ts source mapping from the pinned archive',
        'current src/ui/docs/apiReference.js records',
        'current completionContent.js and component-examples/*.vue sources',
        'current focused tests/reports and their sourceHashBinding fields',
        'approved user decisions, unresolved defaults, and manually verified findings',
    ],
    ...totals,
    rowsWithNoDirectRead,
}
const boundarySuffix = ' Prop consumption also records compiler-output direct-reference signals per declared prop; absent references are candidates for review, not automatic gaps.'
if (!matrix.verificationBoundary.local.includes(boundarySuffix)) matrix.verificationBoundary.local += boundarySuffix
fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2) + '\n', 'utf8')

const markdown = fs.readFileSync(markdownPath, 'utf8').replace(/\n\nProps were declared:[^\n]*/, '')
const propSummary = `公开属性声明 ${totals.declaredProps} 项；Vue 编译输出中直接引用信号 ${totals.directReads} 项、生成模型通道无直接读取 ${totals.modelManagedWithoutDirectRead} 项、其余无直接读取 ${totals.nonModelNoDirectRead} 项（分布于 ${totals.componentsWithNoDirectRead} 个组件）。无直接读取只是复核候选，可由 helper/对象转发/fallthrough 消费，不自动认定缺口。引用扫描时间 ${scannedAt}；source SHA 与矩阵不一致 ${staleSourceRows.length} 项${staleSourceRows.length ? '：' + staleSourceRows.map((row) => row.component).join('、') : ''}。`
const rebuildNote = '可重跑脚本：scripts/audit-deep-alignment-current.mjs；它只刷新属性引用信号。完整矩阵刷新还需要最新 index 导出映射、Vuetify 4.2.4 runtime/d.ts 映射、API registry、真实 demo 源、focused reports/hash、用户裁定与人工确认 gap。'
let updated = markdown.replace(/\n\n(?:Prop-reference scan:|Props declared:|公开属性声明)[^\n]*/, '')
updated = updated.replace(/逐项读取当前 canonical SFC，记录[^\n]+/, (line) => line + '\n\n' + propSummary + '\n\n' + rebuildNote)
for (const row of matrix.components) {
    const p = row.currentContract.propConsumption
    const metrics = `props=${row.currentContract.props.length} (directRef=${p.directReads.length}, model=${p.modelManagedWithoutDirectReference.length}, noRef=${p.nonModelWithoutDirectReference.length})`
    const escapeName = row.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    updated = updated.replace(new RegExp(`(\\| ${escapeName} / [^|]+\\| )props=\\d+;`), `$1${metrics};`)
}
fs.writeFileSync(markdownPath, updated, 'utf8')
console.log(JSON.stringify({ scannedAt, totals, staleSourceRows, rows: matrix.components.length }, null, 2))

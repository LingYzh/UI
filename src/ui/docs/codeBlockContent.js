export const codeBlockHeightExample = {
    "id": "code-height",
    "title": "自然高度与显式高度上限",
    "description": "默认完整展开代码；只在传入 max-height 时限制高度，保留横向滚动与自动换行。",
    "fullSource": true,
    "code": "<script setup>\nimport { UCodeBlock } from '@lingyzh/ui';\n\nconst source = [\n    '// 未设置 max-height 时，代码区随内容自然增高。',\n    `const description = '${'这是一条可以横向滚动或开启换行的长代码。'.repeat(8)}';`,\n    ...Array.from({ length: 45 }, (_, index) => `const entry${index + 1} = ${index + 1};`),\n    \"const lastLine = '末行可见';\",\n].join('\\n');\n</script>\n\n<template>\n    <div class=\"code-height-demo\">\n        <section data-code-height=\"unbounded\">\n            <h4>默认随内容增高</h4>\n            <p>不传 max-height，代码完整展开；长行仍可横向滚动或启用自动换行。</p>\n            <u-code-block :code=\"source\" language=\"javascript\" />\n        </section>\n        <section data-code-height=\"bounded\">\n            <h4>显式限制高度</h4>\n            <p>传入 max-height=\"240px\" 后，代码区在指定高度内滚动。</p>\n            <u-code-block :code=\"source\" language=\"javascript\" max-height=\"240px\" />\n        </section>\n    </div>\n</template>\n\n<style scoped>\n.code-height-demo {\n    display: grid;\n    gap: 24px;\n    min-width: 0;\n}\n.code-height-demo section {\n    min-width: 0;\n}\n.code-height-demo h4 {\n    margin: 0 0 8px;\n}\n.code-height-demo p {\n    margin: 0 0 12px;\n    color: var(--muted);\n}\n</style>\n"
};

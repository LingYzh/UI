<script setup>
import { UCodeBlock } from '../index';

const source = [
    '// 未设置 max-height 时，代码区随内容自然增高。',
    `const description = '${'这是一条可以横向滚动或开启换行的长代码。'.repeat(8)}';`,
    ...Array.from({ length: 45 }, (_, index) => `const entry${index + 1} = ${index + 1};`),
    "const lastLine = '末行可见';",
].join('\n');
</script>

<template>
    <div class="code-height-demo">
        <section data-code-height="unbounded">
            <h4>默认随内容增高</h4>
            <p>不传 max-height，代码完整展开；长行仍可横向滚动或启用自动换行。</p>
            <u-code-block :code="source" language="javascript" />
        </section>
        <section data-code-height="bounded">
            <h4>显式限制高度</h4>
            <p>传入 max-height="240px" 后，代码区在指定高度内滚动。</p>
            <u-code-block :code="source" language="javascript" max-height="240px" />
        </section>
    </div>
</template>

<style scoped>
.code-height-demo {
    display: grid;
    gap: 24px;
    min-width: 0;
}
.code-height-demo section {
    min-width: 0;
}
.code-height-demo h4 {
    margin: 0 0 8px;
}
.code-height-demo p {
    margin: 0 0 12px;
    color: var(--muted);
}
</style>

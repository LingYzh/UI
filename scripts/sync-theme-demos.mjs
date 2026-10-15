import { readFile, writeFile } from 'node:fs/promises';
import { formatDemoSource } from './demo-source-format.mjs';
import {
    buttonAppearanceExample,
    buttonLoadingExample,
} from '../src/ui/docs/buttonContent.js';

const source = await formatDemoSource(
    await readFile(
        new URL('../src/ui/docs/ThemePaletteDemo.vue', import.meta.url),
        'utf8',
    ),
);
const example = {
    id: 'theme-palette',
    title: '主色填充、主题文字与前景色',
    description:
        '同一主题的真实按钮、工具栏、标签、头像、快捷键、勾选与消息共同使用颜色角色；实心填充及浅蓝、浅灰优先白字，仅接近白色时使用黑字，显式前景覆盖保持优先。',
    fullSource: true,
    code: source.replaceAll("from '../index'", "from '@lingyzh/ui'"),
};
await writeFile(
    new URL('../src/ui/docs/themePaletteContent.js', import.meta.url),
    `export const themePaletteExample = ${JSON.stringify(example, null, 4)};\n`,
);
const buttonSource = await formatDemoSource(
    await readFile(
        new URL('../src/ui/docs/ButtonAppearanceDemo.vue', import.meta.url),
        'utf8',
    ),
);
const appearance = {
    ...buttonAppearanceExample,
    code: buttonSource.replaceAll("from '../index'", "from '@lingyzh/ui'"),
};
await writeFile(
    new URL('../src/ui/docs/buttonContent.js', import.meta.url),
    `export const buttonAppearanceExample = ${JSON.stringify(appearance, null, 4)};\n\nexport const buttonLoadingExample = ${JSON.stringify(buttonLoadingExample, null, 4)};\n`,
);

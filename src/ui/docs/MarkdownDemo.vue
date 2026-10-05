<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import UMarkdown from '../UiMarkdown.vue';
import UButton from '../UiButton.vue';
import UScrollArea from '../UiScrollArea.vue';
import USwitch from '../UiSwitch.vue';
import { reducedMotion } from './preferences';

const props = defineProps({ example: { type: String, default: 'markdown-rich' } });
const navigationArea = ref();
onMounted(async () => { await nextTick(); if (props.example === 'markdown-navigation') navigationArea.value?.scrollTo({ top: 220 }); });
const navigation = `## 阅读与补充说明

\`行内代码\` 和 ==标记== 跟随主题 primary。这里有一条脚注[^motion]，点击后观察平滑滚动与居中位置，再点击脚注的返回箭头。

<details><summary>展开补充说明</summary><p>展开和收起均有高度过渡，可用 Tab 选中后按 Enter 或空格操作。</p><p>快速重复操作会从当前高度继续，不必等待上一次动画。</p><p>减少动态效果时立即展开和收起。</p></details>

${Array.from({ length: 8 }, (_, index) => `### 阅读段落 ${index + 1}\n\n滚动中的正文保持稳定，脚注链接仅在当前 Markdown 内定位。`).join('\n\n')}

[^motion]: 这是脚注目标。返回箭头会平滑滚动到正文引用处并移交键盘焦点。
`;
const rich = `# 一份可阅读的回答

正文支持 **重点**、*强调*、~~删除~~、\`行内代码\`、==标记==、H~2~O 与 x^2^。链接 [Markdown 文档](https://spec.commonmark.org/) 由应用接管；https://example.com 自动识别。

> 信息分层，保留自然阅读的节奏。

- [x] 通用 Markdown
- [x] 表格、公式与脚注
- [ ] 继续当前对话

| 能力 | 显示 | 状态 |
| :--- | :---: | ---: |
| 表格 | 独立滚动 | 已支持 |
| 流式输出 | 平滑追赶 | 已支持 |

\`\`\`typescript
const message = { content: 'Hello Markdown', streaming: true };
console.log(message);
\`\`\`

行内公式 $E = mc^2$，以及独立公式：

$$
\\int_0^1 x^2 \\, dx = \\frac{1}{3}
$$

定义列表
: 展示术语与解释。

<details><summary>查看补充说明</summary><p>这是可用键盘展开的说明。<mark>安全 HTML</mark> 支持语义标签。</p></details>

这里有一条脚注[^note]。

[^note]: 脚注在当前正文内部跳转。

\`\`\`mermaid
flowchart LR
    A[收到消息] --> B[平滑呈现]
    B --> C[完成回答]
\`\`\`
`;
const streamingText = `## 平滑流式输出

这段正文先接收内容，再以自适应速度平滑展示。**已完成的段落保持原来的节点**，选中文字或查看代码时不会因为后续内容到达而重置。中文、组合字符 é、旗帜 🇨🇳 和表情 👨‍👩‍👧‍👦 都按安全边界呈现。

\`\`\`typescript
const chunks = ['你好', '，世界'];
for (const chunk of chunks) {
    render(chunk);
}
\`\`\`

网络到达速度变化时，显示速度自动调整；结束时会在短时间内追上完整正文。
`;
const source = ref('');
const active = ref(false);
const progress = ref(0);
const lastLink = ref('');
let timer;
function restart() {
    clearTimeout(timer);
    source.value = '';
    progress.value = 0;
    active.value = true;
    let position = 0;
    let sequence = 0;
    function next() {
        position = Math.min(streamingText.length, position + [8, 16, 30, 10, 45][sequence++ % 5]);
        source.value = streamingText.slice(0, position);
        progress.value = Math.round(position / streamingText.length * 100);
        if (position < streamingText.length) timer = setTimeout(next, [160, 100, 250, 80][sequence % 4]);
        else active.value = false;
    }
    next();
}
function finish() { clearTimeout(timer); source.value = streamingText; progress.value = 100; active.value = false; }
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
    <div class="markdown-demo">
        <template v-if="props.example === 'markdown-navigation'">
            <div class="markdown-demo-toolbar"><u-switch v-model="reducedMotion" label="减少动态效果" /><span>比较平滑过渡与立即定位</span></div>
            <u-scroll-area ref="navigationArea" label="Markdown 跳转与折叠示例" height="420px"><div class="markdown-demo-reading"><u-markdown :source="navigation" /></div></u-scroll-area>
        </template>
        <template v-else-if="props.example === 'markdown-streaming'">
            <div class="markdown-demo-toolbar"><u-button size="sm" @click="restart">开始 / 重新播放</u-button><u-button size="sm" variant="ghost" :disabled="!active" @click="finish">立即结束接收</u-button><span aria-live="polite">接收 {{ progress }}%</span></div>
            <u-scroll-area label="流式 Markdown 示例" height="420px"><u-markdown :source="source" :streaming="active" @link-click="lastLink = $event" /></u-scroll-area>
        </template>
        <u-markdown v-else :source="rich" @link-click="lastLink = $event" />
        <p v-if="lastLink" role="status" class="markdown-demo-link">应用收到链接：{{ lastLink }}</p>
    </div>
</template>

<style scoped>
.markdown-demo { min-width: 0; }
.markdown-demo-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.markdown-demo-toolbar span, .markdown-demo-link { color: var(--muted); font-size: 12px; }
.markdown-demo-reading { padding-block: 220px; }
</style>

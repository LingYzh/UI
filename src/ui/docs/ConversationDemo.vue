<script setup>
import { ref } from 'vue';
import UActivity from '../UiActivity.vue';
import UDiff from '../UiDiff.vue';
import UFileChanges from '../UiFileChanges.vue';
import UMessageActions from '../UiMessageActions.vue';

defineProps({ example: { type: String, default: 'conversation-inline' } });
const editOpen = ref(true);
const feedback = ref('');
const before = 'export function ToolCallRow(call) {\n    return renderToolCard(call);\n}\n';
const after =
    'export function ToolCallRow(call) {\n    const expanded = expansionState.get(call.id) ?? false;\n    return renderInlineTool(call, expanded);\n}\n';
const items = [
    { id: 'tool', path: 'src/ui/ToolCallRow.ts', status: 'M', added: 16, removed: 2 },
    { id: 'state', path: 'src/state/useSessionState.ts', status: 'M', added: 11, removed: 4 },
    { id: 'test', path: 'tests/tool-call.spec.ts', status: 'A', added: 10, removed: 0 },
];
const actions = [
    { id: 'copy', icon: 'copy', label: '复制回复' },
    { id: 'edit', icon: 'edit', label: '编辑历史回复' },
    { id: 'branch', icon: 'branch', label: '从此回复创建分支' },
    { id: 'refresh', icon: 'refresh', label: '重新生成最新回复' },
    { id: 'delete', icon: 'trash', label: '删除消息' },
];
</script>

<template>
    <div class="conversation-demo">
        <template v-if="example === 'conversation-inline'">
            <p>
                这次会保留完整的执行记录，但让它们退到正文之后。命令、文件编辑和每轮产物各自承担清晰的职责。
            </p>
            <u-activity
                title="使用了 3 个工具"
                variant="inline"
                icon="terminal"
                :open="true"
                :scrollable="false"
            >
                <u-activity
                    title="已读取 3 个文件"
                    variant="inline"
                    icon="folder"
                    :scrollable="false"
                >
                    <div class="conversation-demo-muted">
                        src/ui/ToolCallRow.ts
                        <br />
                        src/state/useSessionState.ts
                        <br />
                        tests/tool-call.spec.ts
                    </div>
                </u-activity>
                <u-activity
                    v-model:open="editOpen"
                    title="已编辑"
                    filename="ToolCallRow.ts"
                    variant="inline"
                    icon="file"
                    :added="16"
                    :removed="2"
                    :scrollable="false"
                >
                    <u-diff
                        compact
                        inspectable
                        path="src/ui/ToolCallRow.ts"
                        :before="before"
                        :after="after"
                        @inspect="feedback = '在右栏查看：src/ui/ToolCallRow.ts'"
                    />
                </u-activity>
                <u-activity title="运行了命令" variant="inline" icon="terminal" :scrollable="false">
                    <div class="conversation-demo-command">
                        npm run test -- tool-call
                        <br />
                        <span>Tests 7 passed (7) · 退出码 0</span>
                    </div>
                </u-activity>
            </u-activity>
            <h3>现在的交互更接近阅读，而不是查看日志。</h3>
            <p>
                工具摘要直接排列在对话中；点击后，就在原位置查看命令输出或
                Diff。展开状态由应用保存。
            </p>
            <p>
                本轮改动已保存为历史快照。右侧查看的是
                <strong>这一轮的变化</strong>
                ，与磁盘上的当前文件分开。
            </p>
            <u-file-changes
                title="第 2 轮文件改动"
                :items="items"
                @select="feedback = `查看文件：${$event}`"
                @view-all="feedback = '查看全部文件改动'"
            />
            <u-message-actions
                label="第 2 轮 · 32 秒"
                :actions="actions"
                @action="feedback = `执行操作：${$event}`"
            />
        </template>
        <template v-else-if="example === 'conversation-actions'">
            <u-message-actions
                label="第 2 轮 · 32 秒"
                :actions="actions"
                @action="feedback = `执行操作：${$event}`"
            />
            <u-message-actions
                label="部分操作不可用"
                :actions="
                    actions.map((action) => ({ ...action, disabled: action.id === 'refresh' }))
                "
                @action="feedback = `执行操作：${$event}`"
            />
        </template>
        <template v-else>
            <u-file-changes
                title="第 3 轮文件改动"
                :items="[
                    {
                        id: 'asset',
                        path: 'assets/an-extremely-long-file-name-with-unavailable-line-statistics.png',
                        status: 'M',
                        added: null,
                        removed: null,
                    },
                    {
                        id: 'deleted',
                        path: 'src/legacy/deleted-component.ts',
                        status: 'D',
                        added: 0,
                        removed: 12,
                    },
                ]"
                @select="feedback = `查看文件：${$event}`"
                @view-all="feedback = '查看全部文件改动'"
            />
            <u-file-changes title="第 4 轮文件改动" :items="[]" />
        </template>
        <p v-if="feedback" class="conversation-demo-feedback" role="status">{{ feedback }}</p>
    </div>
</template>

<style scoped>
.conversation-demo {
    min-width: 0;
    width: 100%;
    max-width: 744px;
    color: var(--text);
    font-size: var(--ui-font-body-large);
    line-height: 1.75;
}
.conversation-demo > p {
    margin: 0 0 13px;
}
.conversation-demo h3 {
    margin: 22px 0 10px;
    font-size: 18px;
    line-height: 1.5;
    font-weight: 600;
}
.conversation-demo-muted {
    color: var(--muted);
    font-size: 14px;
}
.conversation-demo-command {
    padding: 12px 15px;
    border-radius: 8px;
    background: var(--soft);
    font: 14px/1.8 var(--mono);
}
.conversation-demo-command > span {
    color: var(--muted);
}
.conversation-demo-feedback {
    margin-top: 12px;
    color: var(--muted);
    font-size: var(--ui-font-body-small);
}
</style>

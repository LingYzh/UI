<script setup lang="ts">
import Icon from '../components/Icon.vue';
import { uiText } from './locale';

export interface FileChangeItem {
    id: string;
    path: string;
    status: 'A' | 'M' | 'D';
    added: number | null;
    removed: number | null;
}
defineProps<{ title: string; items: FileChangeItem[] }>();
const emit = defineEmits<{ select: [id: string]; 'view-all': [] }>();
const basename = (path: string) => path.split(/[\\/]/).filter(Boolean).at(-1) || path;
</script>

<template>
    <section class="ui-file-changes" :aria-label="title">
        <header class="ui-file-changes-heading"><Icon name="diff" :size="14" /><span>{{ title }}</span><span v-if="items.length">· {{ uiText('files.count', { count: items.length }) }}</span><button v-if="items.length" type="button" class="ui-file-changes-view-all" @click="emit('view-all')">{{ uiText('files.viewAll') }} <Icon name="chevron" :size="12" /></button></header>
        <button v-for="item in items" :key="item.id" type="button" class="ui-file-change-row" :title="item.path" :aria-label="`${item.path} ${item.status} ${item.added === null || item.removed === null ? uiText('files.statsUnavailable') : uiText('files.stats', { added: item.added, removed: item.removed })}`" @click="emit('select', item.id)">
            <span class="ui-file-change-status">{{ item.status }}</span><Icon name="file" :size="14" /><span class="ui-file-change-name">{{ basename(item.path) }}</span><span class="ui-file-change-stats"><template v-if="item.added !== null && item.removed !== null"><span class="ui-file-change-added">+{{ item.added }}</span><span class="ui-file-change-removed">−{{ item.removed }}</span></template><span v-else class="ui-file-change-unavailable">{{ uiText('files.statsUnavailable') }}</span></span>
        </button>
        <p v-if="!items.length" class="ui-file-changes-empty">{{ uiText('files.empty') }}</p>
    </section>
</template>

<script setup>
import { ref } from 'vue';
import { UButton, UConfirmEdit, UTextField } from '../../index';
const settings = ref({ title: '工作区名称', details: { owner: 'Ling' } });
const compact = ref('内联确认');
</script>

<template>
    <div class="component-demo" data-demo-component="UConfirmEdit">
        <u-confirm-edit v-model="settings" v-slot="{ model, isPristine }" ok-text="保存">
            <u-text-field v-model="model.value.title" label="编辑名称" />
            <u-text-field v-model="model.value.details.owner" label="编辑负责人" />
            <output>{{ isPristine ? '草稿与已确认内容一致' : '草稿有待确认修改' }}</output>
        </u-confirm-edit>
        <output>已确认：{{ settings.title }} · {{ settings.details.owner }}</output>
        <u-confirm-edit v-model="compact" v-slot="{ model, save, cancel, isPristine }" hide-actions>
            <u-text-field v-model="model.value" label="自定义操作区" />
            <div class="u-confirm-actions">
                <u-button :disabled="isPristine" variant="text" @click="cancel">恢复</u-button>
                <u-button :disabled="isPristine" @click="save">确认草稿</u-button>
            </div>
        </u-confirm-edit>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    justify-items: stretch;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
.component-demo > .ui-button {
    justify-self: start;
}
</style>

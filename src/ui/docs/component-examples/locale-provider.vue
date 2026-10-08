<script setup>
import { defineComponent, h, ref } from 'vue';
import { UHotkey, ULocaleProvider, UPagination, USwitch, useLocale } from '../../index';
const page = ref(2);
const english = ref(true);
const rtl = ref(false);
const messages = {
    en: {
        demo: { greeting: 'Hello {name}', inherited: 'Inherited from the outer provider' },
        hotkey: { save: 'Save' },
    },
    zh: {
        demo: { greeting: '你好，{name}', inherited: '继承外层的自定义文案' },
        hotkey: { save: '保存' },
    },
};
const keyMap = { save: { default: { text: '$vuetify.hotkey.save' } } };
const MessagePreview = defineComponent({
    setup() {
        const locale = useLocale();
        return () =>
            h(
                'output',
                { class: 'locale-message-preview' },
                `${locale.t('demo.greeting', { name: 'Ling' })} · ${locale.t('demo.inherited')} · ${locale.n(1234.5)}`
            );
    },
});
</script>

<template>
    <div class="component-demo" data-demo-component="ULocaleProvider">
        <u-switch v-model="english" label="英文语言范围" />
        <u-switch v-model="rtl" label="从右向左排列" />
        <u-locale-provider
            :locale="english ? 'en' : 'zh'"
            :messages="messages"
            :rtl="{ en: rtl, zh: rtl }"
            fallback-locale="en"
        >
            <MessagePreview />
            <u-pagination v-model="page" :length="5" />
            <u-hotkey keys="save/enter-g" display-mode="text" :key-map="keyMap" :listen="false" />
            <u-locale-provider
                :messages="{ en: { 'demo.greeting': 'Child says hello to {name}' } }"
                tag="section"
            >
                <MessagePreview />
            </u-locale-provider>
        </u-locale-provider>
        <output>当前页：{{ page }}</output>
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
.component-demo :deep(.locale-message-preview) {
    display: block;
    margin-block: 12px;
    color: var(--muted);
    font-size: 14px;
    overflow-wrap: anywhere;
}
</style>

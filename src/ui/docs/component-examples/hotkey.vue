<script setup>
import { ref } from 'vue';
import { UHotkey, UKbd } from '../../index';
const hotkey = ref(0);
</script>

<template>
    <div class="component-demo" data-demo-component="UHotkey">
        <u-hotkey keys="ctrl+shift+k" @trigger="hotkey++">
            <u-kbd keys="Ctrl + Shift + K" />
        </u-hotkey>
        <output>快捷键触发 {{ hotkey }} 次</output>
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

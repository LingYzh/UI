<script setup>
import { ref } from 'vue';
import { UHotkey, USelect, USwitch } from '../../index';
const mode = ref('symbol');
const platform = ref('mac');
const disabled = ref(false);
const triggered = ref(0);
</script>

<template>
    <div class="component-demo" data-demo-component="UHotkey">
        <u-select v-model="mode" :items="['symbol', 'icon', 'text']" label="快捷键显示方式" />
        <u-select v-model="platform" :items="['mac', 'pc', 'auto']" label="平台" />
        <u-switch v-model="disabled" label="禁用快捷键" />
        <u-hotkey
            keys="meta+shift+k"
            :display-mode="mode"
            :platform="platform"
            :disabled="disabled"
            :listen="false"
            prefix="打开命令面板"
        />
        <u-hotkey
            keys="ctrl+shift+k"
            display-mode="text"
            :disabled="disabled"
            @trigger="triggered++"
        />
        <u-hotkey keys="ctrl+k/ctrl+p-g" display-mode="text" variant="contained" :listen="false" />
        <output>按 Ctrl + Shift + K：已触发 {{ triggered }} 次；平台展示与监听分别配置。</output>
    </div>
</template>

<style scoped>
.component-demo {
    display: grid;
    gap: 16px;
    min-width: 0;
}
.component-demo > output {
    color: var(--muted);
    font-size: 14px;
}
</style>

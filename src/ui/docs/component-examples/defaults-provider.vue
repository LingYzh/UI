<script setup>
import { ref } from 'vue';
import { UButton, UDefaultsProvider, USwitch } from '../../index';
const reset = ref(false);
const root = ref(false);
const disabled = ref(false);
</script>

<template>
    <div class="component-demo" data-demo-component="UDefaultsProvider">
        <u-switch v-model="reset" label="reset=true：回溯一个父配置层级" />
        <u-switch v-model="root" label="root=true：回溯根配置" />
        <u-switch v-model="disabled" label="禁用最内层配置：直接继承父配置" />
        <u-defaults-provider
            :defaults="{ UButton: { size: 30, color: 'primary', variant: 'outlined' } }"
        >
            <u-button>外层默认：30px</u-button>
            <u-defaults-provider :defaults="{ UButton: { size: 38, color: 'success' } }">
                <u-button>父层默认：38px</u-button>
                <u-defaults-provider
                    :defaults="{ UButton: { size: 46, color: 'warning' } }"
                    :reset="reset"
                    :root="root"
                    :disabled="disabled"
                >
                    <u-button>切换开关观察最内层尺寸与颜色</u-button>
                </u-defaults-provider>
            </u-defaults-provider>
        </u-defaults-provider>
        <output>reset 回溯父层；root 返回应用根配置；disabled 直接继承父层。</output>
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

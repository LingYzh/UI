<script setup>
import { ref } from 'vue';
import { UBanner, UButton } from '../../index';
const banner = ref(true);
</script>

<template>
    <div class="component-demo" data-demo-component="UBanner">
        <u-banner v-model="banner" text="配置已同步。" icon="mdi-information-outline"><template #actions><u-button size="sm" variant="ghost" @click="banner = false">知道了</u-button></template></u-banner><u-button v-if="!banner" size="sm" @click="banner = true">重新显示提示</u-button>
    </div>
</template>

<style scoped>
.component-demo { display: grid; justify-items: stretch; gap: 16px; min-width: 0; }
.component-demo > output { color: var(--muted); font-size: 12px; }
.component-demo > .ui-button { justify-self: start; }

</style>

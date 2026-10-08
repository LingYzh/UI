<script setup>
import { ref } from 'vue';
import { UButton, UMessages, UTextField, UValidation } from '../../index';
const custom = ref('');
const validation = ref();
const lastErrors = ref([]);
const required = (value) => !!value || '请填写此项。';
async function check() {
    lastErrors.value = await validation.value.validate();
}
</script>

<template>
    <div class="component-demo" data-demo-component="UValidation">
        <u-validation
            ref="validation"
            v-model="custom"
            :rules="[required]"
            name="custom-validation"
            v-slot="{ errorMessages, isDirty, isPristine, isValidating, reset, resetValidation }"
        >
            <u-text-field v-model="custom" label="自定义内容" />
            <u-button @click="check">验证</u-button>
            <u-button @click="reset">清空并重置</u-button>
            <u-button @click="resetValidation">重置校验状态</u-button>
            <u-messages :messages="errorMessages" error />
            <output>
                有值：{{ isDirty }} · 初始状态：{{ isPristine }} · 校验中：{{ isValidating }} ·
                返回错误数：{{ lastErrors.length }}
            </output>
        </u-validation>
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

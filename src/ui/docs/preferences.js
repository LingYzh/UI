import { ref, watch } from 'vue';

export const reducedMotion = ref(document.documentElement.dataset.reducedMotion === 'true');
watch(reducedMotion, (value) => { document.documentElement.dataset.reducedMotion = String(value); });

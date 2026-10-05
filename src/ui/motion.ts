import { onMounted, onScopeDispose, ref } from 'vue';

export function useReducedMotion() {
    const read = () => typeof document !== 'undefined' && (document.documentElement.dataset.reducedMotion === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const reduced = ref(read());
    let observer: MutationObserver | undefined;
    let media: MediaQueryList | undefined;
    const update = () => { reduced.value = read(); };
    onMounted(() => {
        media = window.matchMedia('(prefers-reduced-motion: reduce)'); media.addEventListener('change', update);
        observer = new MutationObserver(update); observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });
    });
    onScopeDispose(() => { media?.removeEventListener('change', update); observer?.disconnect(); });
    return reduced;
}

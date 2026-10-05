import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({
    plugins: [vue()],
    resolve: { dedupe: ['vue'] },
    // Electron profiles include locked caches; generated evidence is not app source.
    server: { watch: { ignored: ['**/artifacts/**'] } },
    build: { outDir: 'dist/docs' }
});

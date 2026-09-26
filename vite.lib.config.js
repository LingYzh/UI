import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({ plugins: [vue()], build: { outDir: 'dist/lib', lib: { entry: 'src/ui/index.ts', formats: ['es'], fileName: 'index' }, rollupOptions: { external: (id) => id === 'vue' || id.startsWith('@vuetify/') || id.startsWith('highlight.js/') } } });

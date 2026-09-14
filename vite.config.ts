import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: { index: 'src/index.ts', 'style-entry': 'src/style-entry.ts' },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'style',
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: (id) => !id.endsWith('.css') && /^(vue|element-plus|cron-parser)(\/|$)/.test(id),
    },
  },
})

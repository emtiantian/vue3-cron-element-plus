import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  root: 'site',
  base: './',
  build: { outDir: '../site/dist', emptyOutDir: true },
  plugins: [vue()],
})

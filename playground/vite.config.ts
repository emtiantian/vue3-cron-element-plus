import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  root: 'playground',
  base: './',
  build: { outDir: '../playground/dist', emptyOutDir: true },
  plugins: [vue()],
})

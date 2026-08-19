import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// base relativo: funciona tanto en /sst/ como en un dominio custom (ej. sst.cacsb.net)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // pdfmake y exceljs quedan fuera del chunk fijo para que solo se
        // descarguen cuando la ruta de exportación los importa.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          recharts: ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5187,
  },
})

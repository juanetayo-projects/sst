import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// GitHub Pages sirve la app bajo /sst/, por eso el base fijo.
export default defineConfig({
  base: '/sst/',
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
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5187,
  },
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Ensure React resolves to a single copy so motion/framer-motion's
    // optional-peer React import doesn't get stubbed by rolldown.
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['motion/react', 'react', 'react-dom'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

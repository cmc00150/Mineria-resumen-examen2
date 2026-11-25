import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' para que la carpeta dist/ funcione en cualquier ruta
// (GitHub Pages, Netlify, un servidor estático o abriéndola en local).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1200,
  },
});

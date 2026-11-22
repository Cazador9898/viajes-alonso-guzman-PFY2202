import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true }, '/graphql': { target: 'http://127.0.0.1:3001', changeOrigin: true } },
  },
  preview: {
    proxy: { '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true }, '/graphql': { target: 'http://127.0.0.1:3001', changeOrigin: true } },
  },
  // GitHub Pages sirve el sitio desde el subdirectorio del repositorio.
  base: process.env.VITE_GITHUB_PAGES === 'true'
    ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'supermercado-alonso-guzman-PFY2202'}/`
    : '/',
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/generate': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/patient': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/privacy': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/validate': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/cohort': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/export': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/metrics': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/edge-cases': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/api-keys': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});

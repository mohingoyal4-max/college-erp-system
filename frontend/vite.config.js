import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backend = 'http://127.0.0.1:5001';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: backend, changeOrigin: true, secure: false },
      '/erp-static': { target: backend, changeOrigin: true },
      '/fees': { target: backend, changeOrigin: true },
      '/timetable': { target: backend, changeOrigin: true },
      '/reports': { target: backend, changeOrigin: true },
    },
  },
});

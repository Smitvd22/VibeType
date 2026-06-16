import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import manifest from './manifest.json';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  },
  define: {
    'process.env.NEXT_PUBLIC_STT_BACKEND_URL': JSON.stringify('http://localhost:10000'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
});

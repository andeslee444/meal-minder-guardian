import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Get requested port from environment or use default
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8081;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: PORT,
    strictPort: false,
    cors: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/api': path.resolve(__dirname, './src/api'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/lib': path.resolve(__dirname, './src/lib'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  define: {
    'process.env': process.env,
    // Define development mode variables
    __DEV_MOCK__: true,
  },
  // Specifically use the mock index.html file
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index-mock.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react', '@supabase/supabase-js'],
  },
  // Override the main entry point to use dev-mode.tsx instead
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});

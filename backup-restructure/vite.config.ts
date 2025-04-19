import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    cors: true,
    proxy: {
      '/functions': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/functions/, '/functions/v1'),
      },
    },
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
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Minimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Set to true in production
        drop_debugger: true,
      },
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ui: ['@/components/ui'],
          vendor: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
  // Enable global environment variables
  envPrefix: ['VITE_'],
  // Enhance performance for dev mode
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react', '@supabase/supabase-js'],
  },
});

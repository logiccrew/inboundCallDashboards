import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
   plugins: [
     react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },


  server: {
  proxy: {
    '/api': {
      target: 'http://localhost:6000',
      changeOrigin: true,
      credentials: true,
      rewrite: (path) => path.replace(/^\/api/, '/api'),
    },
  }
}


//   build: {
//     outDir: 'dist',
//   },
 }));

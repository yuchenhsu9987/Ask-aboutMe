import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-pdf', 'lucide-react']
        }
      },
    },
  },
  base: '/Ask-aboutMe/',
  define: {
    'import.meta.env.VITE_OPENAI_API_KEY': undefined
  }
});
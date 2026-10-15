process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    async configureServer(server) {
      try {
        const { app: expressApp } = await import('./server/app');
        server.middlewares.use(expressApp);
      } catch (err) {
        console.warn('Express dev server not loaded:', err);
      }
    }
  };
}

export default defineConfig(({ command }) => {
  const plugins: any[] = [react(), tailwindcss()];
  if (command === 'serve') {
    plugins.push(expressApiPlugin());
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

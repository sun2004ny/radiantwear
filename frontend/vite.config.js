import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_PORT) || 5173;
  const backendPort = parseInt(env.VITE_BACKEND_PORT) || 5000;

  return {
    plugins: [react()],
    server: {
      port,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});

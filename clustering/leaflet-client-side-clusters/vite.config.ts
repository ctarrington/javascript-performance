import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import cesium from 'vite-plugin-cesium';

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      'host.containers.internal'
    ],
    host: true,
    port: 8080,
  },
  plugins: [react()],
});

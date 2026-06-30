import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  server: {
    allowedHosts: ['host.containers.internal'],
    host: true,
    port: 8080,
  },
  plugins: [react()],
});

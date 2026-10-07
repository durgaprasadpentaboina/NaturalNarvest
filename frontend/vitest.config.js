import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', environmentOptions: { jsdom: { url: 'http://localhost:5173' } }, setupFiles: ['./src/test-setup.js'], testTimeout: 30000, env: { VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:5000/api' } },
});

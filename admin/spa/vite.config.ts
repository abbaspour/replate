import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        sourcemap: true, // or 'inline'
        chunkSizeWarningLimit: 1200
    },
    server: {
        port: 5175
    }
});

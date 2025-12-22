import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        assetsInlineLimit: 0
    },
    resolve: {
        alias: {
            '@': resolve(process.cwd(), 'src')
        }
    },
    server: {
        port: 5173,
        strictPort: true
    },
    base: ''
});
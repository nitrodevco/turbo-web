import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [ react(), tailwindcss() ],
    resolve: {
        alias: { '#': `${import.meta.dirname}/src` },
    },
    server: {
        // The port the server's Turbo:Web:SiteUrl expects by default.
        port: 5175,
        strictPort: true,
        // The site's API on its own origin, as the deployed site serves it: its cookies are the
        // site's, and nothing is cross-origin.
        proxy: { '/api': { target: 'http://127.0.0.1:8092', xfwd: true } },
    },
});

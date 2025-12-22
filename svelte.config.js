import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            pages: 'dist',
            assets: 'dist',
            fallback: 'index.html',
            precompress: false,
            strict: true
        }),
        paths: {
            base: process.argv.includes('dev') ? '' : process.env.BASE_PATH || ''
        },
        prerender: {
            handleHttpError: 'warn'
        }
    }
};

export default config;
import {createVuePlugin} from "vite-plugin-vue2";
import {defineConfig} from 'vite'
import path from 'path';

export default defineConfig({
    resolve: {
        alias: [
            {
                find: '@/',
                replacement: `${path.resolve(__dirname, './src')}/`,
            },
        ],
    },
    plugins: [
        createVuePlugin(),
    ],
    build: {
        target: 'es2021',
        commonjsOptions: {transformMixedEsModules: true},
        lib: {
            entry: 'src/main.ts',
            name: 'test',
            fileName: 'client',
        },
        outDir: 'dist/client',
        rollupOptions: {},
        minify: 'esbuild',
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }
})


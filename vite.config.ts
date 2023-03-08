import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const globals = {
    '@pixi/core': 'PIXI',
    '@pixi/display': 'PIXI',
    '@pixi/graphics': 'PIXI'
};

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            formats: ['es', 'cjs', 'umd'],
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'PIXI.tilemap',
            fileName: (format, _) => {
                switch (format) {
                    case 'cjs':
                        return 'pixi-tilemap.js';
                    case 'es':
                        return 'pixi-tilemap.es.js';
                    case 'umd':
                        return 'pixi-tilemap.umd.js';
                }

                return 'pixi-tilemap';
            },
        },
        rollupOptions: {
            external: [
                'pixi.js',
                ...Object.keys(globals),
            ],
            output: {
                globals
            },
        },
    },
    plugins: [dts({
        rollupTypes: true,
        compilerOptions: {
            removeComments: false
        }
    })]
});

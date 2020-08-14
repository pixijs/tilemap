import path from 'path';
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json'

const plugins = [
    sourcemaps(),
    resolve({
        browser: true,
        preferBuiltins: false
    }),
    typescript()
];
const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
const banner = [
    `/*!`,
    ` * ${pkg.name} - v${pkg.version}`,
    ` * Compiled ${compiled}`,
    ` *`,
    ` * ${pkg.name} is licensed under the MIT License.`,
    ` * http://www.opensource.org/licenses/mit-license`,
    ` * `,
    ` * Copyright 2016-20, Ivan Popelyshev All Rights Reserved`,
    ` */`,
].join('\n');
const input = path.join(__dirname, './src/index.ts');
const freeze = false;
const sourcemap = true;

// @SukantPal: I'm going to publish @pixi-build-tools/rollup to handle all this crap. Stay tuned!
const external = [
    'pixi.js',
    '@pixi/core',
    '@pixi/display',
    '@pixi/constants',
    '@pixi/sprite',
    '@pixi/math',
    '@pixi/utils',
    '@pixi/graphics'
];
const globals = {
    '@pixi/core': '_pixi_core',
    '@pixi/display': '_pixi_display',
    '@pixi/constants': '_pixi_constants',
    '@pixi/sprite': '_pixi_sprite',
    '@pixi/math': '_pixi_math',
    '@pixi/utils': '_pixi_utils',
    '@pixi/graphics': '_pixi_graphics'
}
const name = 'pixi_tilemap';

export default [
    {
        plugins,
        input,
        external,
        output: [
            {
                // FIXME: dist/pixi-tilemap.js for the CJS build is an anti-pattern for PixiJS plugins. This needs to be moved
                // to lib/pixi-tilemap.js in the future.
                banner,
                file: path.join(__dirname, 'dist/pixi-tilemap.js'),
                format: 'cjs',
                freeze,
                sourcemap
            },
            {
                banner,
                file: path.join(__dirname, 'lib/pixi-tilemap.es.js'),
                format: 'esm',
                freeze,
                sourcemap
            }
        ]
    },
    {
        plugins,
        input,
        external,
        output: [
            {
                name,
                globals,
                banner,
                file: path.join(__dirname, 'dist/pixi-tilemap.umd.js'),
                format: 'iife',
                freeze,
                sourcemap
            }
        ]
    },
    {
        plugins: [...plugins, terser()],
        input,
        external,
        output: [
            {
                name,
                globals,
                banner,
                file: path.join(__dirname, 'dist/pixi-tilemap.umd.min.js'),
                format: 'iife',
                freeze,
                sourcemap
            }
        ]
    }
]
const { globals } = require('@pixi-build-tools/globals');
const pkg = require('./package.json');

const compiled = new Date().toUTCString().replace(/GMT/g, 'UTC');

const banner = `/*!
 * ${pkg.name} - v${pkg.version}
 * Compiled ${compiled}
 * 
 * ${pkg.name} is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, ${pkg.author}, All Rights Reserved
 */

`;

const umdBanner = `${banner}

this.PIXI = this.PIXI || {};
this.PIXI.tilemap = this.PIXI.tilemap || {};
`;

const footer = `
if (typeof pixi_tilemap !== 'undefined') {
  Object.assign(this.PIXI.tilemap, pixi_tilemap);
}
`;

module.exports = {
  rollup(config, options) {
    switch (options.format) {
      case 'umd':
        config.output = {
          ...config.output,
          banner:umdBanner,
          footer,
          name: 'pixi_tilemap',
          globals: {
            ...globals,
            '@pixi/utils': 'PIXI.utils',
          },
        };
        return config;
      case 'esm':
        delete config.output.file;
        config.preserveModules = true;
        config.output.dir = './dist/esm';
        config.output.banner = banner;
        config.output.esModule = true;
        return config;
      case 'cjs':
        config.output.banner = banner;
        return config;
      default:
        return config;
    }
  },
};

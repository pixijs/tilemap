/* eslint-env node */

module.exports = {
    root: true,
    extends: ['@pixi/eslint-config'],
    rules: {
        'linebreak-style': 'off',
        'camelcase': 'off'
    },
    ignorePatterns: [
        'dist'
    ]
};

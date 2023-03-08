/* eslint-env node */

module.exports = {
    root: true,
    extends: [
        '@pixi/eslint-config',
        'eslint:recommended'
    ],
    rules: {
        'linebreak-style': 'off'
    },
    ignorePatterns: [
        'dist'
    ]
};

module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'airbnb-base',
        'airbnb-typescript/base',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    ignorePatterns: ['.eslintrc.js'],
    plugins: ['@typescript-eslint/eslint-plugin'],
    rules: {
        'comma-dangle': 'off',
        '@typescript-eslint/no-useless-constructor': ['error'],
        'max-len': ["error", { "code": 120 }],
        'no-plusplus': ["error", { "allowForLoopAfterthoughts": true }],
        'class-methods-use-this': 'off',
        'import/no-import-module-exports': 'off',
        'padding-line-between-statements': ['error',
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'always', prev: '*', next: 'if' },
        ],
        'no-magic-numbers': 'off',
        '@typescript-eslint/no-magic-numbers': [
            'warn',
            {
                'ignore' : [0,1],
                'ignoreReadonlyClassProperties': true,
            }
        ]
    },
};
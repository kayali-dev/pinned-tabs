// eslint.config.js
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'CommonJS',
                project: './tsconfig.json',
            },
            globals: {
                // Add Chrome extension API globals
                chrome: 'readonly',
                // Add standard browser globals
                window: 'readonly',
                document: 'readonly',
                fetch: 'readonly',
                navigator: 'readonly',
                Response: 'readonly',
                Headers: 'readonly',
                Request: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'prettier': prettierPlugin,
        },
        rules: {
            // Prettier integration
            'prettier/prettier': 'error',
            ...prettierConfig.rules,

            // TypeScript specific rules
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            "no-unused-vars": "off",
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],

            // General rules
            'no-console': 'off', // Allow console for extension development
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        },
    },
    {
        ignores: ['eslint.config.js', 'dist/**', 'dist-prod/**', 'scripts/**/*', 'packages/**/*', 'node_modules/**', 'webpack.config.js'],
    },
];
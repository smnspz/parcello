import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,tsx,astro}'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                process: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
    ...astro.configs.recommended,
    prettier,
    {
        ignores: [
            'dist/',
            '.astro/',
            'node_modules/',
            'playwright-report/',
            'test-results/',
            'functions/', // Cloudflare Pages Functions - TypeScript handles type checking
        ],
    },
];

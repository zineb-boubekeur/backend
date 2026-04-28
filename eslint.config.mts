import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // 🔥 IGNORE (IMPORTANT)
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // config JS
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      globals: globals.node,
    },
  },

  // config TS
  ...tseslint.configs.recommended,
]);

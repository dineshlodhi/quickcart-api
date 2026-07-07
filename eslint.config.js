import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

// Minimal ESLint configuration using the modern "flat config" format.
// This enforces basic JavaScript and TypeScript best practices.
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Honor two intentional, idiomatic patterns for unused identifiers:
      //  - args/vars prefixed with `_` are deliberately unused (e.g. Express
      //    error handlers need a 4th `_next` param they don't call).
      //  - `ignoreRestSiblings` allows destructuring-to-omit a field, e.g.
      //    `const { stock, ...publicFields } = product` to strip `stock`.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    }
  }
);

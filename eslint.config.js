import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

// Minimal ESLint configuration using the modern "flat config" format.
// This enforces basic JavaScript and TypeScript best practices.
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Add any specific rules here. For now, the recommended defaults are excellent.
    }
  }
);

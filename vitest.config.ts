import { defineConfig } from 'vitest/config';

// Tests unitaires et d'intégration (Vitest). Les tests du site construit
// (Playwright + axe) vivent dans tests/e2e et passent par `npm run test:e2e`.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
  },
});

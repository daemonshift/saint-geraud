import { getViteConfig } from 'astro/config';

// Tests de composants Astro rendus seuls (API Container d'Astro), pour les cas
// que les données d'exemple ne permettent pas de construire (Accueil sans
// Actualité…). Config séparée : la compilation `.astro` n'alourdit pas
// vitest.config.ts. Lancés par `npm test`, après les tests unitaires.
export default getViteConfig({
  test: {
    include: ['tests/composants/**/*.test.ts'],
    environment: 'node',
  },
});

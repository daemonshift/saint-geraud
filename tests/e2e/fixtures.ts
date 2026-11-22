/**
 * `test` de Playwright pour tout le site construit : à importer à la place de
 * `@playwright/test` (`import { expect, test } from './fixtures'`).
 *
 * Les tuiles OpenStreetMap de la carte des Églises sont servies localement
 * (tuile transparente). Sans cela, l'événement `load` de chaque page qui
 * affiche la carte (Accueil, Nos églises) attend une douzaine de tuiles du
 * vrai serveur : sous la charge de la suite complète, ou si OpenStreetMap
 * ralentit les clients automatisés, `page.goto` et `page.reload` dépassent
 * leur délai. Les requêtes restent visibles (`page.on('request')`) : le
 * contrôle des domaines tiers les voit toujours partir vers
 * tile.openstreetmap.org.
 */
import { test as base } from '@playwright/test';

export * from '@playwright/test';

/** Tuiles du fond de carte (domaine de la liste blanche). */
export const TUILES_OPENSTREETMAP = /^https:\/\/tile\.openstreetmap\.org\//;

/** PNG transparent de 1 × 1 pixel. */
const TUILE_TRANSPARENTE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(TUILES_OPENSTREETMAP, (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: TUILE_TRANSPARENTE }),
    );
    await use(context);
  },
});

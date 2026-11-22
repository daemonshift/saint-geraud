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
import { CLE_CONSENTEMENT, enregistrementDuChoix } from '../../src/lib/consentement';

export * from '@playwright/test';

/** Tuiles du fond de carte (domaine de la liste blanche). */
export const TUILES_OPENSTREETMAP = /^https:\/\/tile\.openstreetmap\.org\//;

/** PNG transparent de 1 × 1 pixel. */
const TUILE_TRANSPARENTE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/**
 * Choix déjà fait dans la bannière cookies au début du test (ADR 0004).
 * Par défaut « refuse » : la bannière ne recouvre pas le bas des pages et rien
 * ne part vers messes.info. `null` : première visite, la bannière s'affiche.
 * Le choix n'est posé que si le stockage n'en contient pas, pour qu'un choix
 * fait pendant le test survive au rechargement.
 */
export type ChoixCookies = 'accepte' | 'refuse' | null;

export const test = base.extend<{ choixCookies: ChoixCookies }>({
  choixCookies: ['refuse', { option: true }],
  context: async ({ context, choixCookies }, use) => {
    await context.route(TUILES_OPENSTREETMAP, (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: TUILE_TRANSPARENTE }),
    );
    if (choixCookies) {
      await context.addInitScript(
        ({ cle, valeur }) => {
          try {
            if (localStorage.getItem(cle) === null) localStorage.setItem(cle, valeur);
          } catch {}
        },
        { cle: CLE_CONSENTEMENT, valeur: enregistrementDuChoix(choixCookies, new Date()) },
      );
    }
    await use(context);
  },
});

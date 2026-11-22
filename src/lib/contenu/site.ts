/**
 * Contenu du site pour le build : ce que les pages appellent.
 *
 *   const { actualites } = await contenuDuSite();
 *
 * Le chargement n'a lieu qu'une fois par build, quel que soit le nombre de pages.
 */
import { join } from 'node:path';
import { creerClientAirtable, type ClientAirtable } from '../airtable/client';
import { creerClientEnMemoire } from '../airtable/client-en-memoire';
import { chargerContenuDuSite, type StockageImages } from './charger';
import { DONNEES_EXEMPLE } from './donnees-exemple';
import type { ContenuDuSite } from './modele';
import { creerStockageImagesSurDisque } from './stockage-images';

interface Environnement {
  /** Token Airtable en lecture seule ; secret, présent uniquement dans Vercel. */
  AIRTABLE_TOKEN?: string;
  /** `production`, `preview` ou `development` sur Vercel ; absent en local et en CI. */
  VERCEL_ENV?: string;
}

/**
 * Avec un token : Airtable. Sans token : données d'exemple, sauf en production
 * où c'est une erreur (le site en ligne n'affiche jamais de données d'exemple).
 */
export function clientSelonEnvironnement(env: Environnement, fetch: typeof globalThis.fetch = globalThis.fetch): ClientAirtable {
  const token = env.AIRTABLE_TOKEN?.trim();
  if (token) return creerClientAirtable({ token, fetch });
  if (env.VERCEL_ENV === 'production') {
    throw new Error('AIRTABLE_TOKEN est absent : un build de production ne peut pas utiliser les données d’exemple.');
  }
  return creerClientEnMemoire(DONNEES_EXEMPLE);
}

/**
 * Images du contenu : écrites au chargement dans ce dossier de travail (hors
 * de `public/`, dont toute écriture relance le serveur de développement),
 * puis servies à `/images-du-site/…` par l'intégration
 * src/integrations/contenu-du-site.ts (copiées dans le site produit au
 * build, servies par un middleware en développement).
 */
export const IMAGES_DU_SITE = {
  dossier: join(process.cwd(), 'node_modules', '.cache', 'saint-geraud', 'images-du-site'),
  prefixePublic: '/images-du-site',
} as const;

/** Le stockage n'est créé qu'au premier chargement (il vide le dossier). */
function stockageImagesDuSite(): StockageImages {
  return creerStockageImagesSurDisque({
    ...IMAGES_DU_SITE,
    dossierExemples: join(process.cwd(), 'src', 'assets', 'exemple'),
  });
}

/**
 * Chargement partagé par tout le processus de build : la configuration
 * d'Astro (redirections, plan du site) et le rendu des pages chargent ce
 * module dans deux graphes de modules distincts. Mémoïsé sur `globalThis`,
 * Airtable n'est lu qu'une fois.
 *
 * Le premier chargement a lieu dans `astro:config:setup`
 * (src/integrations/contenu-du-site.ts) : toutes les images sont écrites
 * avant le rendu des pages.
 */
const CLE = Symbol.for('saint-geraud.contenuDuSite');
const memoire = globalThis as { [CLE]?: Promise<ContenuDuSite> };

export function contenuDuSite(): Promise<ContenuDuSite> {
  memoire[CLE] ??= chargerContenuDuSite({
    client: clientSelonEnvironnement(process.env),
    horloge: () => new Date(),
    images: stockageImagesDuSite(),
  });
  return memoire[CLE];
}

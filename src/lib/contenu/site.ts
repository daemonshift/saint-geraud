/**
 * Contenu du site pour le build : ce que les pages appellent.
 *
 *   const { actualites } = await contenuDuSite();
 *
 * Le chargement n'a lieu qu'une fois par build, quel que soit le nombre de pages.
 */
import { creerClientAirtable, type ClientAirtable } from '../airtable/client';
import { creerClientEnMemoire } from '../airtable/client-en-memoire';
import { chargerContenuDuSite, type StockageImages } from './charger';
import { DONNEES_EXEMPLE } from './donnees-exemple';
import type { ContenuDuSite } from './modele';

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

/** Les images arrivent avec le ticket #5 : en attendant, tout enregistrement est une erreur. */
const imagesNonBranchees: StockageImages = {
  async enregistrer() {
    throw new Error('Stockage des images pas encore branché (ticket #5).');
  },
};

let chargement: Promise<ContenuDuSite> | undefined;

export function contenuDuSite(): Promise<ContenuDuSite> {
  chargement ??= chargerContenuDuSite({
    client: clientSelonEnvironnement(process.env),
    horloge: () => new Date(),
    images: imagesNonBranchees,
  });
  return chargement;
}

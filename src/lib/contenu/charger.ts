import type { ClientAirtable, EnregistrementAirtable } from '../airtable/client';
import { ACTUALITES, EGLISES } from '../airtable/schema';
import { jourAParis } from './dates';
import type { ContenuDuSite } from './modele';
import { estEnLigne, trierActualites, versActualite, versEgliseLiee } from './actualites';

/** Rend l'instant présent (fixé dans les tests). */
export type Horloge = () => Date;

/** Stockage des images téléchargées au build ; rend le chemin public de l'image. */
export interface StockageImages {
  enregistrer(image: { url: string; nom: string }): Promise<string>;
}

export interface DependancesContenu {
  client: ClientAirtable;
  horloge: Horloge;
  images: StockageImages;
}

export async function chargerContenuDuSite({ client, horloge }: DependancesContenu): Promise<ContenuDuSite> {
  const aujourdhui = jourAParis(horloge());
  const [actualites, eglises] = await Promise.all([lireTable(client, ACTUALITES.id), lireTable(client, EGLISES.id)]);
  const eglisesParId = new Map(eglises.map((e) => [e.id, versEgliseLiee(e)]));

  return {
    actualites: trierActualites(
      actualites.filter((e) => estEnLigne(e, aujourdhui)).map((e) => versActualite(e, eglisesParId)),
    ),
  };
}

async function lireTable(client: ClientAirtable, tableId: string): Promise<EnregistrementAirtable[]> {
  const page = await client.lirePage(tableId);
  return page.records;
}

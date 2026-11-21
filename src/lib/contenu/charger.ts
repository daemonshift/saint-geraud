import type { ClientAirtable, EnregistrementAirtable } from '../airtable/client';
import { ACTUALITES } from '../airtable/schema';
import type { Actualite, ContenuDuSite } from './modele';

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

export async function chargerContenuDuSite({ client }: DependancesContenu): Promise<ContenuDuSite> {
  const page = await client.lirePage(ACTUALITES.id);
  return { actualites: page.records.map(versActualite) };
}

function versActualite(e: EnregistrementAirtable): Actualite {
  const c = ACTUALITES.champs;
  return { id: e.id, titre: String(e.fields[c.titre.id]) } as Actualite;
}

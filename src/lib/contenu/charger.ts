import type { ClientAirtable, EnregistrementAirtable } from '../airtable/client';
import { ACTUALITES, EGLISES, INFOS_PRATIQUES, TABLES } from '../airtable/schema';
import { controlerSchema } from './controle-schema';
import { jourAParis } from './dates';
import type { ContenuDuSite } from './modele';
import { estArchivee, estEnLigne, trierActualites, versActualite, versEgliseLiee } from './actualites';
import { eglisesAffichees } from './eglises';
import { versInfosPratiques } from './infos-pratiques';

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

export async function chargerContenuDuSite({ client, horloge, images }: DependancesContenu): Promise<ContenuDuSite> {
  const maintenant = horloge();
  const aujourdhui = jourAParis(maintenant);
  controlerSchema(await client.lireSchema(), TABLES);
  const [actualites, eglises, infosPratiques] = await Promise.all([
    lireTable(client, ACTUALITES.id),
    lireTable(client, EGLISES.id),
    lireTable(client, INFOS_PRATIQUES.id),
  ]);
  const eglisesParId = new Map(eglises.map((e) => [e.id, versEgliseLiee(e)]));

  return {
    actualites: trierActualites(
      actualites.filter((e) => estEnLigne(e, aujourdhui)).map((e) => versActualite(e, eglisesParId, maintenant)),
    ),
    actualitesArchivees: actualites.filter((e) => estArchivee(e, aujourdhui)).map((e) => ({ id: e.id })),
    eglises: await eglisesAffichees(eglises, images),
    infosPratiques: await versInfosPratiques(infosPratiques, images),
  };
}

/** Lit tous les enregistrements d'une table, page après page (100 par page chez Airtable). */
async function lireTable(client: ClientAirtable, tableId: string): Promise<EnregistrementAirtable[]> {
  const enregistrements: EnregistrementAirtable[] = [];
  let offset: string | undefined;
  do {
    const page = await client.lirePage(tableId, offset);
    enregistrements.push(...page.records);
    offset = page.offset;
  } while (offset);
  return enregistrements;
}

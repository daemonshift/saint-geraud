import { describe, expect, it } from 'vitest';
import { creerClientEnMemoire, type DonneesAirtable } from '../../../src/lib/airtable/client-en-memoire';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { actualite } from '../../../src/lib/contenu/donnees-exemple';
import { fauxStockageImages } from './outils';

/** Charge le contenu à l'instant donné (UTC), avec le faux client. */
function chargerA(instant: string, donnees: DonneesAirtable) {
  return chargerContenuDuSite({
    client: creerClientEnMemoire(donnees),
    horloge: () => new Date(instant),
    images: fauxStockageImages(),
  });
}

const titres = async (instant: string, donnees: DonneesAirtable) =>
  (await chargerA(instant, donnees)).actualites.map((a) => a.titre);

describe('Actualités En ligne', () => {
  it('rend une Actualité Validée dont la Date de publication est passée', async () => {
    const contenu = await chargerA('2026-06-15T10:00:00Z', {
      actualites: [actualite('rec1', { titre: 'Kermesse', datePublication: '2026-06-01' })],
    });
    expect(contenu.actualites).toMatchObject([{ id: 'rec1', titre: 'Kermesse' }]);
  });
});

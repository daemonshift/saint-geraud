import { describe, expect, it } from 'vitest';
import { creerClientEnMemoire, type DonneesAirtable } from '../../../src/lib/airtable/client-en-memoire';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { actualite } from '../../../src/lib/contenu/donnees-exemple';
import { fauxStockageImages } from './outils';

/** Identifiants des Actualités Archivées le 15 juin 2026 à midi (Paris). */
async function archivees(donnees: DonneesAirtable) {
  const contenu = await chargerContenuDuSite({
    client: creerClientEnMemoire(donnees),
    horloge: () => new Date('2026-06-15T10:00:00Z'),
    images: fauxStockageImages(),
  });
  return contenu.actualitesArchivees.map((a) => a.id);
}

describe('Actualités Archivées (redirections)', () => {
  it('rend une Actualité Validée dont la Fin d’affichage est passée', async () => {
    expect(await archivees({ actualites: [actualite('recFinie', { finAffichage: '2026-06-14' })] })).toEqual(['recFinie']);
  });

  it('une Actualité dont la Fin d’affichage est aujourd’hui est encore En ligne, pas Archivée', async () => {
    expect(await archivees({ actualites: [actualite('recDuJour', { finAffichage: '2026-06-15' })] })).toEqual([]);
  });

  it('ignore les Actualités En ligne, sans Fin d’affichage ou programmées', async () => {
    const donnees = {
      actualites: [
        actualite('recEnLigne', { finAffichage: '2026-07-01' }),
        actualite('recSansFin'),
        actualite('recProgrammee', { datePublication: '2026-07-01' }),
      ],
    };
    expect(await archivees(donnees)).toEqual([]);
  });

  it('une Actualité dévalidée ne produit pas de redirection', async () => {
    expect(await archivees({ actualites: [actualite('recDevalidee', { finAffichage: '2026-06-14', valide: false })] })).toEqual([]);
  });

  it('une Actualité sans Date de publication ne produit pas de redirection', async () => {
    const donnees = { actualites: [actualite('recSansDate', { finAffichage: '2026-06-14', datePublication: undefined })] };
    expect(await archivees(donnees)).toEqual([]);
  });

  it('une Actualité supprimée d’Airtable ne produit pas de redirection', async () => {
    expect(await archivees({ actualites: [] })).toEqual([]);
  });
});

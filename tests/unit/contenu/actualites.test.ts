import { describe, expect, it } from 'vitest';
import { creerClientEnMemoire, type DonneesAirtable } from '../../../src/lib/airtable/client-en-memoire';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { actualite, eglise } from '../../../src/lib/contenu/donnees-exemple';
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

  it('ignore une Actualité dont Valide est décoché', async () => {
    expect(await titres('2026-06-15T10:00:00Z', { actualites: [actualite('rec1', { valide: false })] })).toEqual([]);
  });

  it('ignore une Actualité sans Date de publication', async () => {
    expect(await titres('2026-06-15T10:00:00Z', { actualites: [actualite('rec1', { datePublication: undefined })] })).toEqual([]);
  });

  it('ignore une Actualité programmée (Date de publication future)', async () => {
    expect(await titres('2026-06-15T10:00:00Z', { actualites: [actualite('rec1', { datePublication: '2026-06-16' })] })).toEqual([]);
  });

  it('ignore une Actualité dont la Fin d’affichage est passée', async () => {
    expect(await titres('2026-06-15T10:00:00Z', { actualites: [actualite('rec1', { finAffichage: '2026-06-14' })] })).toEqual([]);
  });

  it('rend une Actualité dont la Date de publication et la Fin d’affichage sont aujourd’hui', async () => {
    const donnees = { actualites: [actualite('rec1', { titre: 'Du jour', datePublication: '2026-06-15', finAffichage: '2026-06-15' })] };
    expect(await titres('2026-06-15T00:00:00+02:00', donnees)).toEqual(['Du jour']);
    expect(await titres('2026-06-15T23:59:59+02:00', donnees)).toEqual(['Du jour']);
  });
});

describe('« Aujourd’hui » est calculé en heure de Paris, pas en UTC', () => {
  const duJour = (jour: string) => ({ actualites: [actualite('rec1', { titre: 'Du jour', datePublication: jour, finAffichage: jour })] });

  it('build à 23 h 15 UTC : il est déjà le lendemain à Paris', async () => {
    // 15 juin 23 h 15 UTC = 16 juin 1 h 15 à Paris (heure d'été).
    expect(await titres('2026-06-15T23:15:00Z', duJour('2026-06-16'))).toEqual(['Du jour']);
    expect(await titres('2026-06-15T23:15:00Z', duJour('2026-06-15'))).toEqual([]);
  });

  it('nuit du changement d’heure de mars (29 mars 2026, UTC+1 → UTC+2)', async () => {
    // 28 mars 23 h 15 UTC = 29 mars 0 h 15 (encore UTC+1).
    expect(await titres('2026-03-28T23:15:00Z', duJour('2026-03-29'))).toEqual(['Du jour']);
    // 29 mars 22 h 15 UTC = 30 mars 0 h 15 (déjà UTC+2).
    expect(await titres('2026-03-29T22:15:00Z', duJour('2026-03-30'))).toEqual(['Du jour']);
    // 29 mars 21 h 59 UTC = 29 mars 23 h 59.
    expect(await titres('2026-03-29T21:59:00Z', duJour('2026-03-29'))).toEqual(['Du jour']);
  });

  it('nuit du changement d’heure d’octobre (25 octobre 2026, UTC+2 → UTC+1)', async () => {
    // 24 octobre 22 h 15 UTC = 25 octobre 0 h 15 (encore UTC+2).
    expect(await titres('2026-10-24T22:15:00Z', duJour('2026-10-25'))).toEqual(['Du jour']);
    // 25 octobre 22 h 15 UTC = 25 octobre 23 h 15 (déjà UTC+1).
    expect(await titres('2026-10-25T22:15:00Z', duJour('2026-10-25'))).toEqual(['Du jour']);
    // 25 octobre 23 h 15 UTC = 26 octobre 0 h 15.
    expect(await titres('2026-10-25T23:15:00Z', duJour('2026-10-26'))).toEqual(['Du jour']);
  });
});

describe('Dates et lieu affichés', () => {
  it('Date de publication en toutes lettres', async () => {
    const [a] = (await chargerA('2026-12-30T10:00:00Z', { actualites: [actualite('rec1', { datePublication: '2026-12-25' })] })).actualites;
    expect(a!.datePublicationEnLettres).toBe('vendredi 25 décembre 2026');
  });

  it('Date de l’événement convertie de l’UTC vers l’heure de Paris, en hiver et en été', async () => {
    const contenu = await chargerA('2026-06-15T10:00:00Z', {
      actualites: [
        actualite('hiver', { miseEnAvant: true, dateEvenement: '2026-12-24T22:30:00.000Z' }),
        actualite('ete', { dateEvenement: '2026-07-05T08:30:00.000Z' }),
        actualite('sans', { datePublication: '2025-01-01' }),
      ],
    });
    expect(contenu.actualites.map((a) => a.evenement?.enLettres ?? null)).toEqual([
      'jeudi 24 décembre 2026, 23 h 30',
      'dimanche 5 juillet 2026, 10 h 30',
      null,
    ]);
  });

  it('lieu tiré des Églises liées ; aucun lieu sans Église liée', async () => {
    const contenu = await chargerA('2026-06-15T10:00:00Z', {
      eglises: [
        eglise('recA', { nom: 'Église Saint-Antoine', commune: 'Fumel' }),
        eglise('recB', { nom: 'Église Saint-Géraud', commune: 'Monsempron-Libos' }),
      ],
      actualites: [
        actualite('deux', { miseEnAvant: true, eglises: ['recA', 'recB'] }),
        actualite('aucune', {}),
      ],
    });
    expect(contenu.actualites.map((a) => a.lieu)).toEqual([
      'Église Saint-Antoine, Fumel · Église Saint-Géraud, Monsempron-Libos',
      null,
    ]);
  });
});

describe('Tri des Actualités En ligne', () => {
  it('Mises en avant d’abord, puis Date de publication décroissante', async () => {
    const donnees = {
      actualites: [
        actualite('a', { titre: 'Ancienne', datePublication: '2026-01-10' }),
        actualite('b', { titre: 'Récente', datePublication: '2026-03-10' }),
        actualite('c', { titre: 'Ancienne en avant', datePublication: '2026-01-05', miseEnAvant: true }),
        actualite('d', { titre: 'Récente en avant', datePublication: '2026-02-01', miseEnAvant: true }),
        actualite('e', { titre: 'Milieu', datePublication: '2026-02-10' }),
      ],
    };
    expect(await titres('2026-06-15T10:00:00Z', donnees)).toEqual([
      'Récente en avant',
      'Ancienne en avant',
      'Récente',
      'Milieu',
      'Ancienne',
    ]);
  });
});

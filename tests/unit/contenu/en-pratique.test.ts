import { describe, expect, it } from 'vitest';
import { creerClientEnMemoire, type DonneesAirtable } from '../../../src/lib/airtable/client-en-memoire';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { actualite, eglise } from '../../../src/lib/contenu/donnees-exemple';
import { fauxStockageImages } from './outils';

const BUILD = '2026-06-15T10:00:00Z';

async function actualitesA(donnees: DonneesAirtable) {
  const contenu = await chargerContenuDuSite({
    client: creerClientEnMemoire(donnees),
    horloge: () => new Date(BUILD),
    images: fauxStockageImages(),
  });
  return new Map(contenu.actualites.map((a) => [a.id, a]));
}

describe('Données d’agenda d’une Actualité', () => {
  it('produites seulement si la Date de l’événement est remplie', async () => {
    const actualites = await actualitesA({
      actualites: [actualite('avec', { dateEvenement: '2026-12-24T22:30:00.000Z' }), actualite('sans', {})],
    });
    expect(actualites.get('avec')!.agenda).not.toBeNull();
    expect(actualites.get('sans')!.agenda).toBeNull();
  });

  it('début à l’instant de l’événement, durée d’une heure, titre, résumé et adresse du fichier .ics', async () => {
    const actualites = await actualitesA({
      actualites: [
        actualite('recNoel', {
          titre: 'Messe de Noël',
          resume: 'À l’église Saint-Antoine.',
          dateEvenement: '2026-12-24T22:30:00.000Z',
          modifieLe: '2026-11-02T09:00:00.000Z',
        }),
      ],
    });
    expect(actualites.get('recNoel')!.agenda).toEqual({
      uid: 'actualite-recNoel@paroisse-saint-geraud',
      debut: new Date('2026-12-24T22:30:00.000Z'),
      fin: new Date('2026-12-24T23:30:00.000Z'),
      horodatage: new Date('2026-11-02T09:00:00.000Z'),
      titre: 'Messe de Noël',
      description: 'À l’église Saint-Antoine.',
      lieu: null,
      fichier: '/actualites/recNoel.ics',
    });
  });

  it('lieu : nom, adresse et commune des Églises liées', async () => {
    const actualites = await actualitesA({
      eglises: [eglise('recA', { nom: 'Église Saint-Antoine', commune: 'Fumel', adresse: 'Place de l’Église\n47500 Fumel' })],
      actualites: [actualite('rec1', { dateEvenement: '2026-12-24T22:30:00.000Z', eglises: ['recA'] })],
    });
    expect(actualites.get('rec1')!.agenda!.lieu).toBe('Église Saint-Antoine, Place de l’Église, 47500 Fumel');
  });
});

describe('Églises liées à une Actualité (bloc « En pratique »)', () => {
  it('adresse, Accès PMR, position et présence sur Nos églises', async () => {
    const actualites = await actualitesA({
      eglises: [
        eglise('recA', { nom: 'Église Saint-Antoine', adresse: 'Place de l’Église\n47500 Fumel', latitude: 44.4986, longitude: 0.9653, accesPmr: true }),
        eglise('recInactive', { nom: 'Église masquée', latitude: 44.5, longitude: 0.95, active: false }),
        eglise('recSansCoordonnees', { nom: 'Église sans coordonnées' }),
      ],
      actualites: [actualite('rec1', { eglises: ['recA', 'recInactive', 'recSansCoordonnees'] })],
    });
    expect(actualites.get('rec1')!.eglises).toEqual([
      {
        id: 'recA',
        nom: 'Église Saint-Antoine',
        commune: 'Fumel',
        adresse: ['Place de l’Église', '47500 Fumel'],
        accesPmr: true,
        position: { latitude: 44.4986, longitude: 0.9653 },
        surNosEglises: true,
      },
      {
        id: 'recInactive',
        nom: 'Église masquée',
        commune: 'Fumel',
        adresse: [],
        accesPmr: false,
        position: { latitude: 44.5, longitude: 0.95 },
        surNosEglises: false,
      },
      {
        id: 'recSansCoordonnees',
        nom: 'Église sans coordonnées',
        commune: 'Fumel',
        adresse: [],
        accesPmr: false,
        position: null,
        surNosEglises: false,
      },
    ]);
  });
});

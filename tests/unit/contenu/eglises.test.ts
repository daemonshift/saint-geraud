import { describe, expect, it } from 'vitest';
import { creerClientEnMemoire, type DonneesAirtable } from '../../../src/lib/airtable/client-en-memoire';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { eglise } from '../../../src/lib/contenu/donnees-exemple';
import { fauxStockageImages } from './outils';

function charger(donnees: DonneesAirtable, images = fauxStockageImages()) {
  return chargerContenuDuSite({
    client: creerClientEnMemoire(donnees),
    horloge: () => new Date('2026-06-15T10:00:00Z'),
    images,
  });
}

/** Église Active placée sur la carte. */
const placee = (id: string, valeurs: Parameters<typeof eglise>[1] = {}) =>
  eglise(id, { latitude: 44.5, longitude: 0.96, ...valeurs });

describe('Églises affichées', () => {
  it('une Église inactive est masquée', async () => {
    const { eglises } = await charger({ eglises: [placee('recActive'), placee('recInactive', { active: false })] });
    expect(eglises.map((e) => e.id)).toEqual(['recActive']);
  });

  it('une Église sans latitude ou sans longitude est masquée', async () => {
    const { eglises } = await charger({
      eglises: [
        placee('recPlacee'),
        eglise('recSansLatitude', { longitude: 0.96 }),
        eglise('recSansLongitude', { latitude: 44.5 }),
        eglise('recSansCoordonnees'),
      ],
    });
    expect(eglises.map((e) => e.id)).toEqual(['recPlacee']);
  });

  it('une latitude à 0 est une coordonnée renseignée', async () => {
    const { eglises } = await charger({ eglises: [placee('recEquateur', { latitude: 0 })] });
    expect(eglises.map((e) => e.id)).toEqual(['recEquateur']);
  });

  it('triées par Ordre croissant, les Églises sans Ordre à la fin, puis par nom', async () => {
    const { eglises } = await charger({
      eglises: [
        placee('recSansOrdreB', { nom: 'Église Saint-Martin' }),
        placee('recTrois', { ordre: 3 }),
        placee('recSansOrdreA', { nom: 'Église Saint-Front' }),
        placee('recUn', { ordre: 1 }),
        placee('recDeux', { ordre: 2 }),
      ],
    });
    expect(eglises.map((e) => e.id)).toEqual(['recUn', 'recDeux', 'recTrois', 'recSansOrdreA', 'recSansOrdreB']);
  });

  it('rend nom, commune, adresse, coordonnées, accès PMR et lien messes.info', async () => {
    const { eglises } = await charger({
      eglises: [
        placee('recSaintAntoine', {
          nom: 'Église Saint-Antoine',
          commune: 'Fumel',
          adresse: 'Place de l’Église\n47500 Fumel',
          latitude: 44.4986,
          longitude: 0.9653,
          accesPmr: true,
          lienMessesInfo: 'https://messes.info/lieu/47/fumel/saint-antoine',
        }),
      ],
    });
    expect(eglises).toEqual([
      {
        id: 'recSaintAntoine',
        nom: 'Église Saint-Antoine',
        commune: 'Fumel',
        adresse: ['Place de l’Église', '47500 Fumel'],
        latitude: 44.4986,
        longitude: 0.9653,
        accesPmr: true,
        lienMessesInfo: 'https://messes.info/lieu/47/fumel/saint-antoine',
        photo: null,
      },
    ]);
  });

  it('champs facultatifs vides : pas d’adresse, pas d’accès PMR, pas de lien messes.info', async () => {
    const [e] = (await charger({ eglises: [placee('recNue')] })).eglises;
    expect(e).toMatchObject({ adresse: [], accesPmr: false, lienMessesInfo: null, photo: null });
  });
});

describe('Photo d’une Église', () => {
  const photo = (id: string, filename: string) => ({ id, url: `https://v5.airtableusercontent.com/${id}`, filename });

  it('seule la première pièce jointe est téléchargée et servie par le site, avec son texte alternatif', async () => {
    const images = fauxStockageImages();
    const { eglises } = await charger(
      {
        eglises: [
          placee('recPhoto', {
            photo: [photo('attPremiere', 'Façade Saint-Antoine.JPG'), photo('attSeconde', 'autre.png')],
            texteAlternatif: 'Façade de l’église Saint-Antoine',
          }),
        ],
      },
      images,
    );
    expect(images.enregistrees).toEqual(['https://v5.airtableusercontent.com/attPremiere']);
    expect(eglises[0]!.photo).toEqual({ chemin: '/images/attPremiere.jpg', texteAlternatif: 'Façade de l’église Saint-Antoine' });
  });

  it('photo sans texte alternatif : ignorée, l’Église reste affichée', async () => {
    const images = fauxStockageImages();
    const { eglises } = await charger({ eglises: [placee('recPhoto', { photo: [photo('attPhoto', 'facade.jpg')] })] }, images);
    expect(eglises).toHaveLength(1);
    expect(eglises[0]!.photo).toBeNull();
    expect(images.enregistrees).toEqual([]);
  });

  it('la photo d’une Église masquée n’est pas téléchargée', async () => {
    const images = fauxStockageImages();
    await charger(
      { eglises: [placee('recInactive', { active: false, photo: [photo('attPhoto', 'facade.jpg')], texteAlternatif: 'Façade' })] },
      images,
    );
    expect(images.enregistrees).toEqual([]);
  });
});

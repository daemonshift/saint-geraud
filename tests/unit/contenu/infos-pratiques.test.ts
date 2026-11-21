import { describe, expect, it } from 'vitest';
import { creerClientEnMemoire } from '../../../src/lib/airtable/client-en-memoire';
import type { EnregistrementAirtable } from '../../../src/lib/airtable/client';
import { chargerContenuDuSite } from '../../../src/lib/contenu';
import { infoPratique } from '../../../src/lib/contenu/donnees-exemple';
import { contactPour } from '../../../src/lib/contenu/infos-pratiques';
import { fauxStockageImages } from './outils';

function charger(infosPratiques: EnregistrementAirtable[], images = fauxStockageImages()) {
  return chargerContenuDuSite({
    client: creerClientEnMemoire({ infosPratiques }),
    horloge: () => new Date('2026-06-15T10:00:00Z'),
    images,
  });
}

describe('Infos pratiques', () => {
  it('Contacts : seules les Infos pratiques actives, triées par Ordre', async () => {
    const { infosPratiques } = await charger([
      infoPratique('recMariage', { rubrique: 'Contacts', libelle: 'Mariage', valeur: 'mariage@example.org', ordre: 2 }),
      infoPratique('recInactive', { rubrique: 'Contacts', libelle: 'Inactive', valeur: 'x@example.org', ordre: 0, active: false }),
      infoPratique('recBapteme', { rubrique: 'Contacts', libelle: 'Baptême', valeur: 'bapteme@example.org', ordre: 1 }),
    ]);
    expect(infosPratiques.contacts.map((c) => c.role)).toEqual(['Baptême', 'Mariage']);
  });

  it('Info pratique inactive : absente de toutes les Rubriques', async () => {
    const { infosPratiques } = await charger([
      infoPratique('recCure', { rubrique: 'Curé', libelle: 'Curé', valeur: 'Père Exemple', active: false }),
      infoPratique('recLundi', { rubrique: 'Presbytère', libelle: 'Lundi', valeur: '9 h – 12 h', description: 'Permanence d’accueil', active: false }),
    ]);
    expect(infosPratiques.cure).toBeNull();
    expect(infosPratiques.presbytere.accueil).toEqual([]);
    expect(infosPratiques.parRubrique).toEqual({ 'Curé': [], 'Presbytère': [], Contacts: [] });
  });

  it('Curé sans photo : nom et fonctions, une par ligne', async () => {
    const { infosPratiques } = await charger([
      infoPratique('recCure', {
        rubrique: 'Curé',
        libelle: 'Curé',
        valeur: 'Père Exemple',
        description: 'Curé de la paroisse\n\nDoyen du Fumélois\n',
      }),
    ]);
    expect(infosPratiques.cure).toEqual({
      titre: 'Curé',
      nom: 'Père Exemple',
      fonctions: ['Curé de la paroisse', 'Doyen du Fumélois'],
      photo: null,
    });
  });

  it('Curé avec photo et texte alternatif : seule la première image est téléchargée au build', async () => {
    const images = fauxStockageImages();
    const { infosPratiques } = await charger(
      [
        infoPratique('recCure', {
          rubrique: 'Curé',
          libelle: 'Curé',
          valeur: 'Père Exemple',
          image: [
            { id: 'att1', url: 'https://airtable.test/cure.JPG', filename: 'portrait.JPG' },
            { id: 'att2', url: 'https://airtable.test/autre.jpg', filename: 'autre.jpg' },
          ],
          texteAlternatif: 'Le Curé devant l’église',
        }),
      ],
      images,
    );
    expect(infosPratiques.cure?.photo).toEqual({ src: '/images/cure-recCure.jpg', alt: 'Le Curé devant l’église' });
    expect(images.enregistrees).toEqual(['https://airtable.test/cure.JPG']);
  });

  it('Curé avec photo sans texte alternatif : photo ignorée', async () => {
    const images = fauxStockageImages();
    const { infosPratiques } = await charger(
      [infoPratique('recCure', { rubrique: 'Curé', libelle: 'Curé', valeur: 'Père Exemple', image: [{ url: 'https://airtable.test/cure.jpg' }] })],
      images,
    );
    expect(infosPratiques.cure?.photo).toBeNull();
    expect(images.enregistrees).toEqual([]);
  });

  it('image hors Rubrique « Curé » : ignorée, même avec un texte alternatif', async () => {
    const images = fauxStockageImages();
    const { infosPratiques } = await charger(
      [
        infoPratique('recBapteme', {
          rubrique: 'Contacts',
          libelle: 'Baptême',
          image: [{ url: 'https://airtable.test/benevole.jpg' }],
          texteAlternatif: 'Une bénévole',
        }),
        infoPratique('recAdresse', {
          rubrique: 'Presbytère',
          libelle: 'Adresse',
          image: [{ url: 'https://airtable.test/presbytere.jpg' }],
          texteAlternatif: 'Le presbytère',
        }),
      ],
      images,
    );
    expect(images.enregistrees).toEqual([]);
    expect([...infosPratiques.parRubrique.Contacts, ...infosPratiques.parRubrique['Presbytère']].map((i) => i.image)).toEqual([null, null]);
  });

  it('Presbytère : coordonnées, et lignes « Permanence d’accueil » regroupées sous Accueil', async () => {
    const { infosPratiques } = await charger([
      infoPratique('recAdresse', { rubrique: 'Presbytère', libelle: 'Adresse', valeur: '1 place de l’Église, 47500 Fumel', ordre: 1 }),
      infoPratique('recTel', { rubrique: 'Presbytère', libelle: 'Téléphone', telephone: '05 53 00 00 00', ordre: 2 }),
      infoPratique('recMail', { rubrique: 'Presbytère', libelle: 'E-mail', valeur: 'paroisse@example.org', ordre: 3 }),
      infoPratique('recSamedi', { rubrique: 'Presbytère', libelle: 'Samedi', valeur: '10 h – 12 h', description: "Permanence d'accueil", ordre: 5 }),
      infoPratique('recLundi', { rubrique: 'Presbytère', libelle: 'Lundi', valeur: '9 h 30 – 12 h', description: 'Permanence d’accueil', ordre: 4 }),
    ]);
    expect(infosPratiques.presbytere).toEqual({
      adresse: '1 place de l’Église, 47500 Fumel',
      telephone: '05 53 00 00 00',
      email: 'paroisse@example.org',
      accueil: [
        { jour: 'Lundi', horaires: '9 h 30 – 12 h' },
        { jour: 'Samedi', horaires: '10 h – 12 h' },
      ],
      autres: [],
    });
  });

  it('Contacts : un rôle et ses deux moyens, le téléphone du presbytère par défaut', async () => {
    const { infosPratiques } = await charger([
      infoPratique('recTel', { rubrique: 'Presbytère', libelle: 'Téléphone', telephone: '05 53 00 00 00' }),
      infoPratique('recBapteme', { rubrique: 'Contacts', libelle: 'Baptême', valeur: 'bapteme@example.org', ordre: 1 }),
      infoPratique('recObseques', {
        rubrique: 'Contacts',
        libelle: 'Obsèques',
        valeur: 'obseques@example.org',
        telephone: '05 53 00 00 01',
        ordre: 2,
      }),
    ]);
    expect(infosPratiques.contacts).toEqual([
      { id: 'recBapteme', role: 'Baptême', cle: 'bapteme', email: 'bapteme@example.org', telephone: '05 53 00 00 00', precision: '' },
      { id: 'recObseques', role: 'Obsèques', cle: 'obseques', email: 'obseques@example.org', telephone: '05 53 00 00 01', precision: '' },
    ]);
    expect(contactPour(infosPratiques.contacts, 'obsèques')?.id).toBe('recObseques');
  });
});

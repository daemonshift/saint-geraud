import { describe, expect, it } from 'vitest';
import { fichierIcs } from '../../src/lib/agenda';
import type { EvenementAgenda } from '../../src/lib/contenu';

const NOEL: EvenementAgenda = {
  uid: 'actualite-recNoel@paroisse-saint-geraud',
  debut: new Date('2026-12-24T22:30:00.000Z'),
  fin: new Date('2026-12-24T23:30:00.000Z'),
  horodatage: new Date('2026-11-02T09:00:00.000Z'),
  titre: 'Messe de Noël',
  description: 'À l’église Saint-Antoine.',
  lieu: 'Église Saint-Antoine, Place de l’Église, 47500 Fumel',
  fichier: '/actualites/recNoel.ics',
};

const URL_ACTUALITE = 'https://exemple.vercel.app/actualites/recNoel';

describe('Fichier d’agenda (.ics, RFC 5545)', () => {
  it('un événement complet, heures en UTC explicite, lignes terminées par CRLF', () => {
    expect(fichierIcs(NOEL, { url: URL_ACTUALITE })).toBe(
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Paroisse Saint-Géraud//Site de la paroisse//FR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:actualite-recNoel@paroisse-saint-geraud',
        'DTSTAMP:20261102T090000Z',
        'DTSTART:20261224T223000Z',
        'DTEND:20261224T233000Z',
        'SUMMARY:Messe de Noël',
        'DESCRIPTION:À l’église Saint-Antoine.\\n\\nhttps://exemple.vercel.app/act',
        ' ualites/recNoel',
        'LOCATION:Église Saint-Antoine\\, Place de l’Église\\, 47500 Fumel',
        'URL:https://exemple.vercel.app/actualites/recNoel',
        'END:VEVENT',
        'END:VCALENDAR',
        '',
      ].join('\r\n'),
    );
  });

  it('échappe barre oblique inverse, point-virgule, virgule et retours à la ligne', () => {
    const ics = fichierIcs({ ...NOEL, titre: 'Messe; veillée, chants\\orgue\nsuite', lieu: null }, { url: URL_ACTUALITE });
    expect(ics).toContain('\r\nSUMMARY:Messe\\; veillée\\, chants\\\\orgue\\nsuite\r\n');
    expect(ics).not.toContain('LOCATION');
  });

  it('plie les lignes à 75 octets sans couper un caractère accentué', () => {
    const ics = fichierIcs({ ...NOEL, titre: 'é'.repeat(60) }, { url: URL_ACTUALITE });
    const lignes = ics.split('\r\n');
    for (const ligne of lignes) expect(Buffer.byteLength(ligne, 'utf8')).toBeLessThanOrEqual(75);
    const resume = lignes.slice(lignes.findIndex((l) => l.startsWith('SUMMARY:')));
    // « SUMMARY: » (8 octets) + 33 « é » (66 octets) = 74 ; un 34e ferait 76.
    expect(resume[0]).toBe(`SUMMARY:${'é'.repeat(33)}`);
    expect(resume[1]).toBe(` ${'é'.repeat(27)}`);
  });

  it('sans résumé : la description est l’adresse de l’Actualité', () => {
    expect(fichierIcs({ ...NOEL, description: '' }, { url: URL_ACTUALITE })).toContain(
      '\r\nDESCRIPTION:https://exemple.vercel.app/actualites/recNoel\r\n',
    );
  });
});

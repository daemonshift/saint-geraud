import { describe, expect, it } from 'vitest';
import { choixEnregistre, enregistrementDuChoix } from '../../src/lib/consentement';

const LE_1ER_MARS = new Date('2026-03-01T10:00:00Z');

describe('Choix du visiteur sur les cookies de messes.info', () => {
  it('sans choix enregistré, la question est posée', () => {
    expect(choixEnregistre(null, LE_1ER_MARS)).toBeNull();
  });

  it('un choix enregistré est relu tel quel', () => {
    expect(choixEnregistre(enregistrementDuChoix('accepte', LE_1ER_MARS), LE_1ER_MARS)).toBe('accepte');
    expect(choixEnregistre(enregistrementDuChoix('refuse', LE_1ER_MARS), LE_1ER_MARS)).toBe('refuse');
  });

  it('le choix vaut six mois, puis la question est reposée', () => {
    const enregistrement = enregistrementDuChoix('accepte', LE_1ER_MARS);
    expect(choixEnregistre(enregistrement, new Date('2026-08-31T10:00:00Z'))).toBe('accepte');
    expect(choixEnregistre(enregistrement, new Date('2026-09-01T10:00:01Z'))).toBeNull();
  });

  it('un enregistrement illisible ou inconnu repose la question', () => {
    for (const illisible of ['', 'oui', '{}', '{"choix":"peut-etre","le":"2026-03-01"}', '{"choix":"accepte","le":"hier"}']) {
      expect(choixEnregistre(illisible, LE_1ER_MARS)).toBeNull();
    }
  });
});

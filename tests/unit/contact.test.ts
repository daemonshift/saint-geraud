import { describe, expect, it } from 'vitest';
import { lienTelephone } from '../../src/lib/contact';

describe('lien tel: d’un numéro affiché', () => {
  it('passe un numéro français au format international', () => {
    expect(lienTelephone('05 53 71 00 00')).toBe('tel:+33553710000');
  });

  it('accepte points, tirets et espaces insécables', () => {
    expect(lienTelephone('05.53.71-00 00')).toBe('tel:+33553710000');
  });

  it('garde un numéro déjà international', () => {
    expect(lienTelephone('+33 5 53 71 00 00')).toBe('tel:+33553710000');
  });

  it('refuse un numéro illisible plutôt que de produire un lien faux', () => {
    expect(() => lienTelephone('à confirmer')).toThrow(/numéro de téléphone/);
  });
});

import { describe, expect, it } from 'vitest';
import { formaterPoids } from '../../src/lib/poids-fichier';

describe('poids d’un fichier affiché dans un libellé de lien', () => {
  it('arrondit au kilo-octet supérieur, sans décimale, sous 1 Mo', () => {
    expect(formaterPoids(2_345)).toBe('3 Ko');
  });

  it('n’affiche jamais 0 Ko pour un petit fichier', () => {
    expect(formaterPoids(10)).toBe('1 Ko');
  });

  it('passe en Mo avec une décimale et une virgule à partir de 1 Mo', () => {
    expect(formaterPoids(1_572_864)).toBe('1,5 Mo');
  });

  it('refuse un poids négatif ou non entier', () => {
    expect(() => formaterPoids(-1)).toThrow(/poids/);
  });
});

import { describe, expect, it } from 'vitest';
import { couleursHorsTokens } from '../../scripts/controles/couleurs.ts';

const TOKENS = 'src/styles/tokens.css';

describe('contrôle des couleurs hors tokens', () => {
  it('accepte une valeur hexadécimale dans le fichier de tokens de la charte', () => {
    const fichiers = [{ chemin: TOKENS, contenu: '--color-vert-profond: #315B43;' }];
    expect(couleursHorsTokens(fichiers, TOKENS)).toEqual([]);
  });

  it('signale une valeur hexadécimale ailleurs, avec le fichier, la ligne et la valeur', () => {
    const fichiers = [
      { chemin: 'src/components/EnTete.astro', contenu: '<div>\n  <p style="color:#fff">x</p>\n</div>' },
    ];
    expect(couleursHorsTokens(fichiers, TOKENS)).toEqual([
      { chemin: 'src/components/EnTete.astro', ligne: 2, valeur: '#fff' },
    ]);
  });

  it('reconnaît les formes à 3, 4, 6 et 8 chiffres', () => {
    const contenu = 'a{color:#abc} b{color:#abcd} c{color:#aabbcc} d{color:#aabbccdd}';
    const valeurs = couleursHorsTokens([{ chemin: 'x.css', contenu }], TOKENS).map((v) => v.valeur);
    expect(valeurs).toEqual(['#abc', '#abcd', '#aabbcc', '#aabbccdd']);
  });

  it("n'est pas trompé par une ancre ou un identifiant qui ressemble à une couleur", () => {
    const contenu = '<a href="#contenu">Aller au contenu</a> <a href="#cafe">x</a> <a href="#add">y</a>';
    expect(couleursHorsTokens([{ chemin: 'x.astro', contenu }], TOKENS)).toEqual([]);
  });

  it('ignore les entités HTML numériques', () => {
    const contenu = '<span>&#8599;</span> <span>&#x2197;</span>';
    expect(couleursHorsTokens([{ chemin: 'x.astro', contenu }], TOKENS)).toEqual([]);
  });
});

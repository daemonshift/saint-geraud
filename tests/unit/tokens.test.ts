import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Valeurs recopiées de docs/context/charte-design.md (charte v2).
const CHARTE = {
  'vert-profond': '#315B43',
  'vert-sauge': '#A9BE9D',
  ivoire: '#F5F2E9',
  'or-doux': '#C5A66A',
  'or-fonce': '#7A5F2A',
  encre: '#1F2A24',
  'gris-vert': '#4A564F',
  'or-pale': '#E8D9B5',
  'vert-pale': '#E8EDE4',
  'gris-clair': '#D9DED9',
  'beige-filet': '#E4DCC8',
  'vert-gris': '#3A4A40',
  'vert-survol': '#244634',
};

describe('tokens de couleur', () => {
  const css = readFileSync('src/styles/tokens.css', 'utf-8');
  const declares = Object.fromEntries(
    [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)].map((m) => [m[1], m[2].toUpperCase()]),
  );

  it('sont exactement les 13 couleurs de la charte v2, plus le blanc', () => {
    expect(declares).toEqual({ ...CHARTE, blanc: '#FFFFFF' });
  });

  it('remplacent la palette par défaut de Tailwind', () => {
    expect(css).toMatch(/--color-\*:\s*initial;/);
  });
});

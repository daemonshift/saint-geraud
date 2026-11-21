import { describe, expect, it } from 'vitest';
import { domaineAutorise, ressourcesTiersInterdites } from '../../scripts/controles/domaines.ts';

describe('liste blanche des domaines tiers (ADR 0003)', () => {
  it.each([
    'messes.info',
    'www.messes.info',
    'tile.openstreetmap.org',
    'a.tile.openstreetmap.org',
    'va.vercel-scripts.com',
  ])('autorise %s', (domaine) => {
    expect(domaineAutorise(domaine)).toBe(true);
  });

  it.each([
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'www.google-analytics.com',
    'www.googletagmanager.com',
    'messes.info.example.com',
    'openstreetmap.org.evil.test',
  ])('refuse %s', (domaine) => {
    expect(domaineAutorise(domaine)).toBe(false);
  });
});

describe('ressources tierces chargées par le site construit', () => {
  it('signale une feuille de style Google Fonts', () => {
    const html = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant">';
    expect(ressourcesTiersInterdites([{ chemin: 'dist/index.html', contenu: html }])).toEqual([
      { chemin: 'dist/index.html', url: 'https://fonts.googleapis.com/css2?family=Cormorant' },
    ]);
  });

  it('signale un script, une image, une iframe et une url() CSS hors liste blanche', () => {
    const html = [
      '<script src="https://www.googletagmanager.com/gtag/js"></script>',
      '<img src="//cdn.example.com/a.png" alt="">',
      '<iframe src="https://www.youtube.com/embed/x"></iframe>',
      '<style>@font-face{src:url(https://fonts.gstatic.com/x.woff2)}</style>',
    ].join('\n');
    const urls = ressourcesTiersInterdites([{ chemin: 'dist/a.html', contenu: html }]).map((r) => r.url);
    expect(urls).toEqual([
      'https://www.googletagmanager.com/gtag/js',
      '//cdn.example.com/a.png',
      'https://www.youtube.com/embed/x',
      'https://fonts.gstatic.com/x.woff2',
    ]);
  });

  it('accepte les ressources locales et celles de la liste blanche', () => {
    const html = [
      '<script src="/_vercel/insights/script.js"></script>',
      '<link rel="stylesheet" href="/_astro/index.css">',
      '<iframe src="https://messes.info/widget"></iframe>',
      '<img src="https://a.tile.openstreetmap.org/1/1/1.png" alt="">',
    ].join('\n');
    expect(ressourcesTiersInterdites([{ chemin: 'dist/a.html', contenu: html }])).toEqual([]);
  });

  it("ne confond pas un simple lien de navigation avec une ressource chargée", () => {
    const html = '<a href="https://www.google.com/maps/dir/?api=1">Itinéraire (Google Maps)</a>';
    expect(ressourcesTiersInterdites([{ chemin: 'dist/a.html', contenu: html }])).toEqual([]);
  });

  it('contrôle aussi les feuilles de style construites', () => {
    const css = '@import url("https://fonts.googleapis.com/css2?family=Source+Sans+3");';
    expect(ressourcesTiersInterdites([{ chemin: 'dist/_astro/a.css', contenu: css }])).toHaveLength(1);
  });
});

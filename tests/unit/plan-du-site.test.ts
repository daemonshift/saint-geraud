import { describe, expect, it } from 'vitest';
import { planDuSite, redirectionsDesArchivees } from '../../src/lib/plan-du-site';

describe('Redirections des Actualités Archivées', () => {
  it('chaque Archivée redirige temporairement (302) vers /actualites/terminee', () => {
    expect(redirectionsDesArchivees([{ id: 'recA' }, { id: 'recB' }])).toEqual({
      '/actualites/recA': { status: 302, destination: '/actualites/terminee' },
      '/actualites/recB': { status: 302, destination: '/actualites/terminee' },
    });
  });

  it('aucune Archivée : aucune redirection', () => {
    expect(redirectionsDesArchivees([])).toEqual({});
  });
});

describe('Plan du site', () => {
  const site = new URL('https://paroisse.example/');
  const pages = ['', 'actualites/', 'actualites/recA/', 'actualites/terminee/', '404/', 'mentions-legales/'];
  const actualites = [{ id: 'recA', modifieLe: new Date('2026-03-04T08:15:00.000Z') }];

  it('liste les pages construites, adresses complètes sans barre finale', () => {
    const xml = planDuSite(site, pages, actualites);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
    expect([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])).toEqual([
      'https://paroisse.example/',
      'https://paroisse.example/actualites',
      'https://paroisse.example/actualites/recA',
      'https://paroisse.example/mentions-legales',
    ]);
  });

  it('lastmod d’une Actualité = Modifie_le ; aucune autre page n’en a', () => {
    const xml = planDuSite(site, pages, actualites);
    expect(xml).toContain('<url><loc>https://paroisse.example/actualites/recA</loc><lastmod>2026-03-04T08:15:00.000Z</lastmod></url>');
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
  });

  it('Actualité sans Modifie_le : pas de lastmod', () => {
    expect(planDuSite(site, ['actualites/recA/'], [{ id: 'recA', modifieLe: null }])).not.toContain('<lastmod>');
  });

  it('exclut la page Actualité terminée et la 404', () => {
    const xml = planDuSite(site, pages, actualites);
    expect(xml).not.toContain('terminee');
    expect(xml).not.toContain('404');
  });
});

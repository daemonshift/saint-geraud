import { expect, test } from './fixtures';
import { domaineAutorise } from '../../scripts/controles/domaines';
import { PAGES } from './pages';

// ADR 0003 : le navigateur ne contacte que le site lui-même et les domaines de
// la liste blanche. Aucune requête vers Google (polices auto-hébergées).
for (const { nom, chemin } of PAGES) {
  test(`${nom} : aucune requête hors liste blanche`, async ({ page, baseURL }) => {
    const site = new URL(baseURL!).host;
    const interdites: string[] = [];
    page.on('request', (requete) => {
      const url = new URL(requete.url());
      if (url.protocol === 'data:' || url.host === site) return;
      if (!domaineAutorise(url.hostname)) interdites.push(requete.url());
    });
    await page.goto(chemin, { waitUntil: 'networkidle' });
    expect(interdites).toEqual([]);
  });
}

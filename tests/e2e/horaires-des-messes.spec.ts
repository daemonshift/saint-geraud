import { expect, test, type Page } from './fixtures';

/**
 * Horaires des messes (widget messes.info). Le widget dépose des cookies de
 * mesure d'audience (Google Analytics, essai réel consigné dans l'issue #10) :
 * il n'est chargé qu'au clic sur « Afficher les horaires » (ADR 0003).
 * Aucune requête ne part vers messes.info : le script du widget est remplacé
 * par un faux.
 */
const LIEN_PAROISSE = 'https://messes.info/communaute:ag/47/saint-geraud-des-vallees-en-fumelois';

/** Intercepte tout messes.info ; le faux script remplit le conteneur du widget. */
async function fauxMessesInfo(page: Page): Promise<string[]> {
  const requetes: string[] = [];
  await page.route(/^https:\/\/([^/]+\.)?messes\.info\//, async (route) => {
    requetes.push(route.request().url());
    await route.fulfill({
      contentType: 'text/javascript',
      body: `document.querySelectorAll('[data-egliseinfo]').forEach((d) => {
        d.innerHTML = '<p>Faux widget : ' + d.getAttribute('data-egliseinfo') + ' ' + d.getAttribute('data-search') + '</p>';
      });`,
    });
  });
  return requetes;
}

for (const { nom, chemin, region } of [
  { nom: 'Accueil', chemin: '/', region: 'Horaires des messes' },
  { nom: 'Horaires des messes', chemin: '/horaires-des-messes', region: 'Horaires de la paroisse' },
]) {
  test.describe(`Widget messes.info (${nom})`, () => {
    test('aucune requête vers messes.info avant le clic, puis le widget se charge', async ({ page, context }) => {
      const requetes = await fauxMessesInfo(page);
      await page.goto(chemin, { waitUntil: 'networkidle' });
      const section = page.getByRole('region', { name: region });
      expect(requetes).toEqual([]);
      await expect(section.getByText(/cookies/)).toBeVisible();

      await section.getByRole('button', { name: 'Afficher les horaires' }).click();
      await expect(section.getByText('Faux widget : horaires community:ag/47/saint-geraud-des-vallees-en-fumelois')).toBeVisible();
      expect(requetes).toEqual(['https://messes.info/Widget/Widget.nocache.js']);
      await expect(section.getByRole('button', { name: 'Afficher les horaires' })).toHaveCount(0);
      expect(await context.cookies()).toEqual([]);
    });

    test('bouton « Voir plus de messes sur messes.info », même onglet', async ({ page }) => {
      await fauxMessesInfo(page);
      await page.goto(chemin);
      const section = page.getByRole('region', { name: region });
      const lien = section.getByRole('link', { name: 'Voir plus de messes sur messes.info (site messes.info)' });
      await expect(lien).toHaveAttribute('href', LIEN_PAROISSE);
      await expect(lien).not.toHaveAttribute('target', /.+/);
    });
  });
}

test.describe('Sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('le lien vers messes.info reste, le bouton inutilisable est caché', async ({ page }) => {
    await page.goto('/horaires-des-messes');
    const section = page.getByRole('region', { name: 'Horaires de la paroisse' });
    await expect(section.getByRole('link', { name: 'Voir plus de messes sur messes.info (site messes.info)' })).toBeVisible();
    await expect(section.getByRole('button', { name: 'Afficher les horaires' })).toBeHidden();
  });
});

test.describe('Page Horaires des messes', () => {
  test('liste les Églises avec leur lien messes.info', async ({ page }) => {
    await fauxMessesInfo(page);
    await page.goto('/horaires-des-messes');
    await expect(page.getByRole('heading', { level: 1, name: 'Horaires des messes' })).toBeVisible();
    const liste = page.getByRole('list', { name: 'Horaires par église' });
    await expect(liste.getByRole('heading', { level: 3 })).toHaveText([
      'Église Saint-Antoine',
      'Église Saint-Géraud',
      'Église Saint-Martin',
    ]);
    await expect(
      liste.getByRole('link', { name: /^Horaires des messes \(site messes\.info\)\s*, Église Saint-Antoine$/ }),
    ).toHaveAttribute('href', 'https://messes.info/lieu/47/fumel/eglise-saint-antoine');
    // Sans lien messes.info : renvoi vers la fiche de l'Église.
    await expect(
      liste.getByRole('link', { name: /^Voir l’église\s*, Église Saint-Géraud$/ }),
    ).toHaveAttribute('href', '/nos-eglises#eglise-recEgliseSaintGeraud');
  });

  test('l’en-tête mène à la page', async ({ page }) => {
    await fauxMessesInfo(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Horaires des messes' }).first().click();
    await expect(page).toHaveURL(/\/horaires-des-messes$/);
  });
});

import { expect, test, type Page } from './fixtures';

/**
 * Bannière cookies (ADR 0004) : le widget messes.info dépose des cookies de
 * mesure d'audience ; il se charge tout seul seulement après « Accepter ».
 * Le visiteur répond une fois ; le choix vaut pour tout le site.
 * Aucune requête ne part vers messes.info : son script est remplacé par un faux.
 */
test.use({ choixCookies: null });

const WIDGET_CHARGE = 'Faux widget : horaires community:ag/47/saint-geraud-des-vallees-en-fumelois';

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

const banniere = (page: Page) => page.getByRole('region', { name: 'Cookies de messes.info' });

test('première visite : la bannière s’affiche, rien ne part vers messes.info', async ({ page }) => {
  const requetes = await fauxMessesInfo(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(banniere(page)).toBeVisible();
  await expect(banniere(page).getByRole('link', { name: /confidentialité/i })).toHaveAttribute('href', '/confidentialite');
  expect(requetes).toEqual([]);
});

test('« Accepter » : le widget se charge sans clic, ici et sur les autres pages', async ({ page }) => {
  const requetes = await fauxMessesInfo(page);
  await page.goto('/horaires-des-messes');
  await banniere(page).getByRole('button', { name: 'Accepter' }).click();
  await expect(banniere(page)).toBeHidden();
  const section = page.getByRole('region', { name: 'Horaires de la paroisse' });
  await expect(section.getByText(WIDGET_CHARGE)).toBeVisible();
  await expect(section.getByRole('button', { name: 'Afficher les horaires' })).toHaveCount(0);

  await page.goto('/');
  await expect(banniere(page)).toBeHidden();
  await expect(page.getByRole('region', { name: 'Horaires des messes' }).getByText(WIDGET_CHARGE)).toBeVisible();
  expect(requetes.length).toBeGreaterThan(0);
});

test('« Refuser » : la question n’est plus posée, rien ne part, le bouton du widget reste', async ({ page }) => {
  const requetes = await fauxMessesInfo(page);
  await page.goto('/');
  await banniere(page).getByRole('button', { name: 'Refuser' }).click();
  await expect(banniere(page)).toBeHidden();

  await page.goto('/horaires-des-messes', { waitUntil: 'networkidle' });
  await expect(banniere(page)).toBeHidden();
  expect(requetes).toEqual([]);
  await expect(
    page.getByRole('region', { name: 'Horaires de la paroisse' }).getByRole('button', { name: 'Afficher les horaires' }),
  ).toBeVisible();
});

test('« Gérer les cookies » : le visiteur retire son accord, les cookies de messes.info sont effacés', async ({
  page,
  context,
  baseURL,
}) => {
  await fauxMessesInfo(page);
  await page.goto('/horaires-des-messes');
  await banniere(page).getByRole('button', { name: 'Accepter' }).click();
  await context.addCookies([{ name: '_ga', value: 'GA1.1.1', url: baseURL! }]);

  await page.getByRole('contentinfo').getByRole('button', { name: 'Gérer les cookies' }).click();
  await expect(banniere(page)).toBeVisible();
  await expect(banniere(page)).toBeFocused();
  await banniere(page).getByRole('button', { name: 'Refuser' }).click();
  await expect(banniere(page)).toBeHidden();
  expect((await context.cookies()).map((c) => c.name)).not.toContain('_ga');

  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Horaires de la paroisse' }).getByRole('button', { name: 'Afficher les horaires' }),
  ).toBeVisible();
});

test.describe('Sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('pas de bannière (rien ne peut se charger)', async ({ page }) => {
    await page.goto('/');
    await expect(banniere(page)).toBeHidden();
  });
});

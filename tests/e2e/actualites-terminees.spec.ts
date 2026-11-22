import { expect, test, type Page } from '@playwright/test';

/**
 * Actualités terminées et retirées, sur le site construit avec les données
 * d'exemple : `recExempleArchivee` est Archivée, `recExempleBrouillon` n'est
 * pas Validée.
 *
 * La redirection 302 est une route de `.vercel/output/config.json`, servie par
 * Vercel et non par un fichier de `dist/`. Le serveur de test
 * (serveur-statique.ts) applique les redirections de ce fichier : le test porte
 * donc sur la configuration réellement produite par le build.
 */

async function attendreBoutonsDeRetour(page: Page) {
  const contenu = page.locator('#contenu');
  await expect(contenu.getByRole('link', { name: 'Voir les actualités en cours' })).toHaveAttribute('href', '/actualites');
  await expect(contenu.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute('href', '/');
}

test.describe('Actualité Archivée', () => {
  test('son adresse redirige temporairement (302) vers /actualites/terminee', async ({ request }) => {
    const reponse = await request.get('/actualites/recExempleArchivee', { maxRedirects: 0 });
    expect(reponse.status()).toBe(302);
    expect(reponse.headers()['location']).toBe('/actualites/terminee');
  });

  test('son adresse avec une barre finale mène aussi à « Actualité terminée »', async ({ page, request }) => {
    // La barre finale est retirée (308) avant la redirection de l'Archivée.
    const reponse = await request.get('/actualites/recExempleArchivee/', { maxRedirects: 0 });
    expect(reponse.status()).toBe(308);
    expect(reponse.headers()['location']).toBe('/actualites/recExempleArchivee');

    await page.goto('/actualites/recExempleArchivee/');
    await expect(page).toHaveURL(/\/actualites\/terminee$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Actualité terminée');
  });

  test('le visiteur arrive sur « Actualité terminée », sans le titre de l’Actualité', async ({ page }) => {
    await page.goto('/actualites/recExempleArchivee');
    await expect(page).toHaveURL(/\/actualites\/terminee$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Actualité terminée');
    await expect(page.locator('#contenu')).toContainText('Cette actualité n’est plus affichée sur le site');
    await expect(page.getByText('Actualité archivée')).toHaveCount(0);
    await attendreBoutonsDeRetour(page);
  });

  test('« Voir les actualités en cours » mène à la liste des Actualités', async ({ page }) => {
    await page.goto('/actualites/terminee');
    await page.getByRole('link', { name: 'Voir les actualités en cours' }).click();
    await expect(page).toHaveURL(/\/actualites$/);
  });
});

test.describe('Page 404', () => {
  test('identifiant inconnu : 404 avec les deux boutons de retour', async ({ page }) => {
    const reponse = await page.goto('/actualites/recInconnu');
    expect(reponse?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable');
    await attendreBoutonsDeRetour(page);
  });

  test('Actualité non Validée : 404 qui ne mentionne pas son titre, sans redirection', async ({ page, request }) => {
    expect((await request.get('/actualites/recExempleBrouillon', { maxRedirects: 0 })).status()).toBe(404);
    await page.goto('/actualites/recExempleBrouillon');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable');
    await expect(page.getByText('Brouillon jamais affiché')).toHaveCount(0);
  });
});

test('plan du site : les seules Actualités En ligne avec leur lastmod, ni redirection ni 404', async ({ request }) => {
  const reponse = await request.get('/sitemap.xml');
  expect(reponse.status()).toBe(200);
  const xml = await reponse.text();
  const adresses = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(adresses.filter((a) => a.startsWith('/actualites/')).sort()).toEqual([
    '/actualites/recExempleCatechisme',
    '/actualites/recExempleConcert',
    '/actualites/recExempleKermesse',
    '/actualites/recExempleMesseDeNoel',
    '/actualites/recExemplePelerinage',
  ]);
  expect(adresses).toEqual(expect.arrayContaining(['/', '/actualites']));
  expect(xml).toMatch(/\/actualites\/recExempleKermesse<\/loc><lastmod>2026-01-01T08:00:00\.000Z<\/lastmod>/);
  for (const absente of ['terminee', '404', 'recExempleArchivee', 'recExempleBrouillon']) {
    expect(xml).not.toContain(absente);
  }
});

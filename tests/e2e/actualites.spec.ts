import { expect, test, type Locator } from '@playwright/test';

/**
 * Actualités du site construit avec les données d'exemple
 * (src/lib/contenu/donnees-exemple.ts) : trois En ligne, un Brouillon, une
 * Programmée et une Archivée.
 */
test.describe('Liste des Actualités', () => {
  test('affiche les Actualités En ligne dans l’ordre, avec Catégorie, date, titre et lieu', async ({ page }) => {
    await page.goto('/actualites');
    await expect(page.getByRole('heading', { level: 1, name: 'Actualités' })).toBeVisible();
    const cartes = page.locator('#contenu article');
    await expect(cartes.getByRole('heading', { level: 2 })).toHaveText([
      'Messe de la nuit de Noël',
      'Inscriptions au catéchisme',
      'Kermesse paroissiale',
    ]);
    const premiere = cartes.first();
    await expect(premiere).toContainText('Événement');
    await expect(premiere).toContainText('jeudi 24 décembre 2099, 23 h 30');
    await expect(premiere).toContainText('Église Saint-Antoine, Fumel');
    await expect(cartes.nth(1)).toContainText('Publiée le dimanche 4 janvier 2026');
  });

  test('n’affiche ni Brouillon, ni Actualité programmée, ni Actualité archivée', async ({ page }) => {
    await page.goto('/actualites');
    for (const titre of ['Brouillon jamais affiché', 'Actualité programmée', 'Actualité archivée']) {
      await expect(page.getByText(titre)).toHaveCount(0);
    }
  });

  test('chaque titre mène au détail de l’Actualité', async ({ page }) => {
    await page.goto('/actualites');
    await page.getByRole('link', { name: 'Kermesse paroissiale' }).click();
    await expect(page).toHaveURL(/\/actualites\/recExempleKermesse$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Kermesse paroissiale' })).toBeVisible();
  });
});

test.describe('Détail d’une Actualité', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/actualites/recExempleMesseDeNoel');
  });

  test('affiche Catégorie, titre, date, résumé et texte Markdown', async ({ page }) => {
    await expect(page).toHaveTitle(/^Messe de la nuit de Noël — /);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /messe de la nuit de Noël sera célébrée/);
    const article = page.locator('#contenu article');
    await expect(article).toContainText('Événement');
    await expect(article).toContainText('Publiée le lundi 5 janvier 2026');
    await expect(article).toContainText('jeudi 24 décembre 2099, 23 h 30');
    await expect(article.locator('strong', { hasText: 'messe de la nuit de Noël' })).toBeVisible();
    await expect(article.getByRole('listitem')).toHaveCount(2);
  });

  test('limite la largeur de lecture', async ({ page }) => {
    const largeur = await page.locator('#contenu article').evaluate((el) => el.getBoundingClientRect().width);
    const taille = await page.locator('#contenu article p').last().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    // 68 caractères ≈ 68 × 0,5 em au plus en Source Sans 3 : bien moins que 1 200 px.
    expect(largeur).toBeLessThanOrEqual(68 * taille);
  });

  test('ramène à la liste des Actualités', async ({ page }) => {
    await page.getByRole('link', { name: '← Toutes les actualités' }).click();
    await expect(page).toHaveURL(/\/actualites$/);
  });
});

test('aucune page pour une Actualité non En ligne', async ({ request }) => {
  for (const id of ['recExempleBrouillon', 'recExempleProgrammee', 'recExempleArchivee']) {
    expect((await request.get(`/actualites/${id}`)).status()).toBe(404);
  }
});

test.describe('Images des Actualités', () => {
  /** L'image est servie par le site (jamais par Airtable) et réellement chargée. */
  async function attendreImageServieParLeSite(image: Locator) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('src', /^\/_astro\/.+\.webp$/);
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => (img.complete ? img.naturalWidth : 0))).toBeGreaterThan(0);
  }

  test('carte : image avec son texte alternatif ; sans texte alternatif, carte sans image', async ({ page }) => {
    await page.goto('/actualites');
    const cartes = page.locator('#contenu article');
    await attendreImageServieParLeSite(cartes.nth(0).getByRole('img', { name: 'Trois cierges allumés dans la pénombre' }));
    await expect(cartes.nth(1)).toContainText('Inscriptions au catéchisme');
    await expect(cartes.nth(1).locator('img')).toHaveCount(0);
    await attendreImageServieParLeSite(
      cartes.nth(2).getByRole('img', { name: 'Guirlande de fanions au-dessus des stands de la kermesse' }),
    );
  });

  test('détail : image avec son texte alternatif', async ({ page }) => {
    await page.goto('/actualites/recExempleMesseDeNoel');
    await attendreImageServieParLeSite(
      page.locator('#contenu article').getByRole('img', { name: 'Trois cierges allumés dans la pénombre' }),
    );
  });

  test('détail d’une Actualité dont l’image n’a pas de texte alternatif : aucune image', async ({ page }) => {
    await page.goto('/actualites/recExempleCatechisme');
    await expect(page.getByRole('heading', { level: 1, name: 'Inscriptions au catéchisme' })).toBeVisible();
    await expect(page.locator('#contenu article img')).toHaveCount(0);
  });

  test('aucune URL Airtable dans les pages', async ({ request }) => {
    for (const adresse of ['/actualites', '/actualites/recExempleMesseDeNoel', '/actualites/recExempleKermesse']) {
      expect(await (await request.get(adresse)).text()).not.toMatch(/airtable/i);
    }
  });
});

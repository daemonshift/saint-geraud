import { expect, test } from '@playwright/test';

/**
 * Nos églises, construite avec les données d'exemple
 * (src/lib/contenu/donnees-exemple.ts) : trois Églises affichées, une
 * inactive et une sans coordonnées.
 */
test.describe('Nos églises', () => {
  test('liste texte des Églises affichées, dans l’ordre, à côté de la carte', async ({ page }) => {
    await page.goto('/nos-eglises');
    await expect(page.getByRole('heading', { level: 1, name: 'Nos églises' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Carte des églises' })).toBeVisible();
    const liste = page.getByRole('list', { name: 'Liste des églises' });
    await expect(liste.getByRole('heading', { level: 2 })).toHaveText([
      'Église Saint-Antoine',
      'Église Saint-Géraud',
      'Église Saint-Martin',
    ]);
    await expect(page.getByText('Église masquée')).toHaveCount(0);
    await expect(page.getByText('Église sans coordonnées')).toHaveCount(0);
  });

  test('chaque Église : commune, adresse, accès PMR, horaires et itinéraire', async ({ page }) => {
    await page.goto('/nos-eglises');
    const saintAntoine = page.locator('#eglise-recEgliseSaintAntoine');
    await expect(saintAntoine).toContainText('Fumel');
    await expect(saintAntoine).toContainText('Place de l’Église');
    await expect(saintAntoine).toContainText('Accès PMR');
    await expect(
      saintAntoine.getByRole('link', { name: /^Horaires des messes \(site messes\.info\)\s*, Église Saint-Antoine$/ }),
    ).toHaveAttribute('href', 'https://messes.info/lieu/47/fumel/eglise-saint-antoine');
    const itineraire = saintAntoine.getByRole('link', { name: /^Itinéraire \(Google Maps\)\s*, Église Saint-Antoine$/ });
    await expect(itineraire).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=44\.4986%2C0\.9653$/);
    await expect(itineraire).not.toHaveAttribute('target', /.+/);

    const saintGeraud = page.locator('#eglise-recEgliseSaintGeraud');
    await expect(saintGeraud).not.toContainText('Accès PMR');
    await expect(saintGeraud.getByRole('link', { name: /messes\.info/ })).toHaveCount(0);
  });

  test('photo de l’Église servie par le site, avec son texte alternatif ; sans photo, pas d’image', async ({ page }) => {
    await page.goto('/nos-eglises');
    const photo = page.locator('#eglise-recEgliseSaintAntoine').getByRole('img', { name: 'Façade de l’église Saint-Antoine et son clocher' });
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toHaveAttribute('src', /^\/images-du-site\/[\w-]+\.webp$/);
    await expect.poll(() => photo.evaluate((img: HTMLImageElement) => (img.complete ? img.naturalWidth : 0))).toBeGreaterThan(0);
    await expect(page.locator('#eglise-recEgliseSaintGeraud img')).toHaveCount(0);
  });

  test('l’ancre d’une Église mène à elle', async ({ page }) => {
    await page.goto('/nos-eglises#eglise-recEgliseSaintMartin');
    await expect(page.locator('#eglise-recEgliseSaintMartin')).toBeInViewport();
  });

  test('un marqueur vert profond par Église ; sa fenêtre donne nom, commune et lien horaires', async ({ page }) => {
    await page.goto('/nos-eglises');
    const carte = page.getByRole('region', { name: 'Carte des églises' });
    const marqueurs = carte.locator('.marqueur-eglise');
    await expect(marqueurs).toHaveCount(3);
    await marqueurs.first().click();
    const fenetre = carte.locator('.leaflet-popup');
    await expect(fenetre).toContainText('Église Saint-Antoine');
    await expect(fenetre).toContainText('Fumel');
    await expect(fenetre.getByRole('link', { name: /Horaires des messes/ })).toHaveAttribute(
      'href',
      'https://messes.info/lieu/47/fumel/eglise-saint-antoine',
    );
  });
});

test.describe('Section « Nos églises » de l’Accueil', () => {
  test('aperçu des Églises et lien « Voir les 3 églises »', async ({ page }) => {
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Nos églises' });
    const apercu = section.getByRole('list', { name: 'Aperçu des églises' });
    await expect(apercu.getByText('Église Saint-Antoine')).toBeVisible();
    await expect(apercu.getByText('Accès PMR')).toBeVisible();
    await expect(section.getByRole('region', { name: 'Carte des églises' })).toBeVisible();
    await section.getByRole('link', { name: 'Voir les 3 églises' }).click();
    await expect(page).toHaveURL(/\/nos-eglises$/);
  });
});

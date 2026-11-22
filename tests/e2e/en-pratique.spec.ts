import { expect, test } from './fixtures';

/**
 * Bloc « En pratique » du détail d'une Actualité, avec les données d'exemple :
 * - Messe de la nuit de Noël : événement le 24 décembre 2099 à 23 h 30 (Paris), Église Saint-Antoine (Accès PMR) ;
 * - Kermesse paroissiale : Église Saint-Géraud, sans date d'événement ;
 * - Inscriptions au catéchisme : ni date d'événement ni Église.
 */
const enPratique = (page: import('./fixtures').Page) => page.getByRole('complementary', { name: 'En pratique' });

test.describe('Actualité qui annonce un événement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/actualites/recExempleMesseDeNoel');
  });

  test('date et heure de Paris, Église, adresse et Accès PMR', async ({ page }) => {
    const bloc = enPratique(page);
    await expect(bloc.getByRole('heading', { level: 2, name: 'En pratique' })).toBeVisible();
    await expect(bloc).toContainText('jeudi 24 décembre 2099, 23 h 30');
    await expect(bloc).toContainText('Église Saint-Antoine');
    await expect(bloc).toContainText('Place de l’Église');
    await expect(bloc).toContainText('47500 Fumel');
    await expect(bloc.getByText('Accès PMR', { exact: true })).toBeVisible();
  });

  test('liens vers l’Église sur Nos églises et vers son itinéraire', async ({ page }) => {
    const bloc = enPratique(page);
    await expect(bloc.getByRole('link', { name: /^Voir sur la carte de nos églises/ })).toHaveAttribute(
      'href',
      '/nos-eglises#eglise-recEgliseSaintAntoine',
    );
    await expect(bloc.getByRole('link', { name: /^Itinéraire \(Google Maps\)/ })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&destination=44.4986%2C0.9653',
    );
    await bloc.getByRole('link', { name: /^Voir sur la carte de nos églises/ }).click();
    await expect(page).toHaveURL(/\/nos-eglises#eglise-recEgliseSaintAntoine$/);
    await expect(page.locator('#eglise-recEgliseSaintAntoine')).toBeVisible();
  });

  test('« Ajouter à mon agenda » télécharge un fichier .ics à l’heure exacte', async ({ page, request }) => {
    const bouton = enPratique(page).getByRole('link', { name: /^Ajouter à mon agenda/ });
    await expect(bouton).toHaveAttribute('href', '/actualites/recExempleMesseDeNoel.ics');
    const reponse = await request.get('/actualites/recExempleMesseDeNoel.ics');
    expect(reponse.status()).toBe(200);
    expect(reponse.headers()['content-type']).toMatch(/^text\/calendar/);
    const ics = await reponse.text();
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    // 23 h 30 à Paris en hiver = 22 h 30 UTC.
    expect(ics).toContain('\r\nDTSTART:20991224T223000Z\r\n');
    expect(ics).toContain('\r\nSUMMARY:Messe de la nuit de Noël\r\n');
  });

  test('pas de mini-carte', async ({ page }) => {
    await expect(page.locator('.leaflet-container')).toHaveCount(0);
  });
});

test('Actualité avec une Église mais sans date d’événement : bloc réduit au lieu, sans agenda', async ({ page, request }) => {
  await page.goto('/actualites/recExempleKermesse');
  const bloc = enPratique(page);
  await expect(bloc).toContainText('Église Saint-Géraud');
  await expect(bloc).not.toContainText('Date');
  await expect(bloc.getByRole('link', { name: /^Itinéraire \(Google Maps\)/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Ajouter à mon agenda/ })).toHaveCount(0);
  expect((await request.get('/actualites/recExempleKermesse.ics')).status()).toBe(404);
});

test('Actualité sans Église ni date d’événement : pas de bloc « En pratique »', async ({ page }) => {
  await page.goto('/actualites/recExempleCatechisme');
  await expect(page.getByRole('heading', { level: 1, name: 'Inscriptions au catéchisme' })).toBeVisible();
  await expect(enPratique(page)).toHaveCount(0);
});

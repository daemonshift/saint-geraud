import { expect, test } from './fixtures';

/**
 * Prier et célébrer, construite avec les textes de src/content/prier-et-celebrer/
 * et les Infos pratiques d'exemple (src/lib/contenu/donnees-exemple.ts).
 */
const CARTES = ['Messes', 'La confession', 'Adoration', 'Baptême', 'Mariage', 'Obsèques'];
const ANCRES = ['messes', 'confession', 'adoration', 'bapteme', 'mariage', 'obseques'];

test.describe('Prier et célébrer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prier-et-celebrer');
  });

  test('deux sections : la prière, puis les sacrements', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Prier et célébrer' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toContainText(['La prière', 'Les sacrements']);
    await expect(page.locator('#priere article h3')).toHaveText(CARTES.slice(0, 3));
    await expect(page.locator('#sacrements article h3')).toHaveText(CARTES.slice(3));
  });

  test('sommaire d’ancres vers chaque carte, dans l’ordre', async ({ page }) => {
    const liens = page.getByRole('navigation', { name: 'Aller à :' }).getByRole('link');
    await expect(liens).toHaveText(CARTES);
    for (const [i, id] of ANCRES.entries()) {
      await expect(liens.nth(i)).toHaveAttribute('href', `#${id}`);
      await expect(page.locator(`article#${id}`)).toHaveCount(1);
    }
  });

  test('chaque sacrement : le même contact que sur La paroisse, e-mail en mailto: et téléphone en tel:', async ({ page }) => {
    const obseques = page.locator('#obseques');
    await expect(obseques.locator('a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:obseques@example.org');
    await expect(obseques.locator('a[href^="tel:"]')).toHaveAttribute('href', 'tel:+33553000001');
    await expect(obseques).toContainText('Les familles peuvent appeler à toute heure.');
    await expect(page.locator('#bapteme a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:bapteme@example.org');
    await expect(page.locator('#mariage a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:mariage@example.org');
    for (const id of ['confession', 'bapteme', 'mariage', 'obseques']) {
      await expect(page.locator(`#${id} a[href^="mailto:"]`)).toHaveCount(1);
      await expect(page.locator(`#${id} a[href^="tel:+33"]`)).toHaveCount(1);
    }
  });

  test('sans contact propre dans les Infos pratiques, la confession renvoie au presbytère', async ({ page }) => {
    const confession = page.locator('#confession');
    await expect(confession.locator('a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:paroisse@example.org');
    await expect(confession.locator('a[href^="tel:"]')).toHaveAttribute('href', 'tel:+33553000000');
  });

  test('les messes renvoient aux horaires des messes', async ({ page }) => {
    await expect(page.locator('#messes').getByRole('link', { name: 'Voir les horaires' })).toHaveAttribute(
      'href',
      '/horaires-des-messes',
    );
  });

  test('médaillons en pictogrammes, aucune photo', async ({ page }) => {
    await expect(page.locator('main img')).toHaveCount(0);
    await expect(page.locator('main article svg')).toHaveCount(CARTES.length);
  });
});

test.describe('Prier et célébrer : « Haut de page »', () => {
  test('sur mobile, chaque carte propose de remonter en haut de page', async ({ page }, testInfo) => {
    await page.goto('/prier-et-celebrer');
    const liens = page.locator('main article').getByRole('link', { name: 'Haut de page' });
    if (testInfo.project.name === 'mobile') {
      await expect(liens).toHaveCount(CARTES.length);
      await page.locator('#obseques').scrollIntoViewIfNeeded();
      await liens.last().click();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    } else {
      await expect(liens.filter({ visible: true })).toHaveCount(0);
    }
  });
});

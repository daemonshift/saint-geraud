import { expect, test } from './fixtures';

test.describe('Pied de page « Nous contacter »', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('porte le titre « Nous contacter » et l’adresse du presbytère', async ({ page }) => {
    const pied = page.getByRole('contentinfo');
    await expect(pied.getByRole('heading', { name: 'Nous contacter' })).toBeVisible();
    await expect(pied.locator('address')).toContainText('Presbytère');
  });

  test('propose le téléphone en lien tel:', async ({ page }) => {
    const tel = page.getByRole('contentinfo').locator('a[href^="tel:"]');
    await expect(tel).toHaveCount(1);
    await expect(tel).toHaveAttribute('href', /^tel:\+33\d{9}$/);
  });

  test('propose l’e-mail en lien mailto:, adresse affichée en clair', async ({ page }) => {
    const mail = page.getByRole('contentinfo').locator('a[href^="mailto:"]');
    await expect(mail).toHaveCount(1);
    const adresse = (await mail.getAttribute('href'))!.replace('mailto:', '');
    await expect(mail).toContainText(adresse);
  });

  test('renvoie vers le Diocèse d’Agen et messes.info, en le disant', async ({ page }) => {
    const pied = page.getByRole('contentinfo');
    await expect(pied.getByRole('link', { name: /Diocèse d’Agen \(site du diocèse\)/ })).toHaveAttribute('href', /^https:\/\//);
    await expect(pied.getByRole('link', { name: /\(site messes\.info\)/ })).toHaveAttribute('href', /^https:\/\/(www\.)?messes\.info/);
  });
});

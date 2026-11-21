import { expect, test, type Page } from '@playwright/test';

// Encart « Recevoir la Lettre d'information » (ADR 0003 : aucune Inscription
// sur le site, on écrit à la paroisse ou on remet le formulaire papier).

const encart = (page: Page) => page.getByRole('region', { name: 'Recevoir la Lettre d’information' });

test.describe('Encart « Recevoir la Lettre d’information » de l’Accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('propose d’écrire à la paroisse, adresse affichée en clair', async ({ page }) => {
    const ecrire = encart(page).getByRole('link', { name: /Écrire à la paroisse/ });
    const href = (await ecrire.getAttribute('href'))!;
    expect(href).toMatch(/^mailto:[^?]+@[^?]+\?subject=/);
    const adresse = href.replace('mailto:', '').split('?')[0];
    await expect(encart(page)).toContainText(adresse);
  });

  test('propose le formulaire papier en PDF, avec son poids réel', async ({ page, request }) => {
    const lien = encart(page).getByRole('link', { name: /Télécharger le formulaire papier \(PDF, \d+ Ko\)/ });
    const reponse = await request.get((await lien.getAttribute('href'))!);
    expect(reponse.ok()).toBe(true);
    expect(reponse.headers()['content-type']).toContain('application/pdf');
    const ko = Math.ceil((await reponse.body()).length / 1024);
    await expect(lien).toHaveText(`Télécharger le formulaire papier (PDF, ${ko} Ko)`);
  });

  test('ne contient aucun formulaire ni champ de saisie', async ({ page }) => {
    await expect(page.locator('form, input, textarea, select')).toHaveCount(0);
  });
});

test.describe('Bandeau de l’en-tête', () => {
  async function lienDuBandeau(page: Page, nom: string) {
    const ordinateur = (page.viewportSize()?.width ?? 0) >= 1024;
    if (!ordinateur) await page.getByRole('button', { name: 'Menu' }).click();
    return page.getByRole('banner').getByRole('link', { name: nom, exact: true }).filter({ visible: true });
  }

  test('« Lettre d’information » mène à l’encart de l’Accueil depuis une autre page', async ({ page }) => {
    await page.goto('/mentions-legales');
    await (await lienDuBandeau(page, 'Lettre d’information')).click();
    await expect(page).toHaveURL(/\/#lettre-d-information$/);
    await expect(encart(page)).toBeInViewport();
  });

  test('« Nous contacter » mène au bloc Nous contacter', async ({ page }) => {
    await page.goto('/mentions-legales');
    await (await lienDuBandeau(page, 'Nous contacter')).click();
    await expect(page).toHaveURL(/#nous-contacter$/);
    await expect(page.locator('#nous-contacter')).toBeInViewport();
  });
});

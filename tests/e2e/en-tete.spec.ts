import { expect, test } from '@playwright/test';

const ENTREES_DU_MENU = ['Accueil', 'La paroisse', 'Prier et célébrer', 'Actualités', 'Nos églises', 'Horaires des messes'];

test.describe('Lien « Aller au contenu »', () => {
  test('est le premier élément focalisable et mène au contenu principal', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const lien = page.getByRole('link', { name: 'Aller au contenu' });
    await expect(lien).toBeFocused();
    await expect(lien).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#contenu$/);
    await expect(page.locator('main#contenu')).toHaveCount(1);
  });
});

test.describe('En-tête', () => {
  test('affiche le logotype, lien vers l’Accueil', async ({ page }) => {
    await page.goto('/');
    const logotype = page.getByRole('banner').getByRole('link', { name: /Paroisse Saint.Géraud/ });
    await expect(logotype).toBeVisible();
    await expect(logotype).toHaveAttribute('href', '/');
  });
});

test.describe('Navigation sur ordinateur', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, 'ordinateur seulement');

  test('affiche les six entrées du menu sans bouton Menu', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Menu principal' });
    for (const entree of ENTREES_DU_MENU) {
      await expect(nav.getByRole('link', { name: entree, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  });

  test('le bouton « Aa » reste sur la ligne du logotype', async ({ page }) => {
    await page.goto('/');
    const banniere = page.getByRole('banner');
    const logotype = await banniere.getByRole('link', { name: /Paroisse Saint.Géraud/ }).boundingBox();
    const aa = await banniere.getByRole('button', { name: 'Agrandir le texte' }).boundingBox();
    expect(logotype && aa).toBeTruthy();
    // Même ligne : le centre vertical du bouton tombe dans la hauteur du logotype.
    const centreAa = aa!.y + aa!.height / 2;
    expect(centreAa).toBeGreaterThan(logotype!.y);
    expect(centreAa).toBeLessThan(logotype!.y + logotype!.height);
  });
});

test.describe('Menu mobile', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, 'mobile seulement');

  test('« Horaires des messes » est visible sans ouvrir le menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Horaires des messes' }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('s’ouvre au clic et présente les entrées du menu', async ({ page }) => {
    await page.goto('/');
    const bouton = page.getByRole('button', { name: 'Menu' });
    await bouton.click();
    await expect(bouton).toHaveAttribute('aria-expanded', 'true');
    const nav = page.getByRole('navigation', { name: 'Menu principal' });
    for (const entree of ENTREES_DU_MENU) {
      await expect(nav.getByRole('link', { name: entree, exact: true })).toBeVisible();
    }
  });

  test('se ferme par ✕ et rend le focus au bouton Menu', async ({ page }) => {
    await page.goto('/');
    const bouton = page.getByRole('button', { name: 'Menu' });
    await bouton.click();
    await bouton.click();
    await expect(bouton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('navigation', { name: 'Menu principal' })).toBeHidden();
    await expect(bouton).toBeFocused();
  });

  test('s’ouvre au clavier, se ferme par Échap et rend le focus au bouton Menu', async ({ page }) => {
    await page.goto('/');
    const bouton = page.getByRole('button', { name: 'Menu' });
    await bouton.focus();
    await page.keyboard.press('Enter');
    await expect(bouton).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await expect(bouton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('navigation', { name: 'Menu principal' })).toBeHidden();
    await expect(bouton).toBeFocused();
  });

  test('se ferme au choix d’un lien', async ({ page }) => {
    await page.goto('/');
    const bouton = page.getByRole('button', { name: 'Menu' });
    await bouton.click();
    await page.getByRole('navigation', { name: 'Menu principal' }).getByRole('link', { name: 'Nous contacter' }).click();
    await expect(page).toHaveURL(/#nous-contacter$/);
    await expect(bouton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('navigation', { name: 'Menu principal' })).toBeHidden();
  });
});

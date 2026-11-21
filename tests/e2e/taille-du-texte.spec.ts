import { expect, test, type Page } from '@playwright/test';
import { PAGES } from './pages';

/** Taille calculée du texte courant (corps de page), en pixels. */
const tailleDuTexte = (page: Page) => page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));

const boutonAa = (page: Page) => page.getByRole('button', { name: 'Agrandir le texte' });

test.describe('Bouton « Aa »', () => {
  test('est présent dans l’en-tête, fait 48 px et n’est pas enfoncé au départ', async ({ page }) => {
    await page.goto('/');
    const bouton = page.getByRole('banner').getByRole('button', { name: 'Agrandir le texte' });
    await expect(bouton).toBeVisible();
    await expect(bouton).toHaveAttribute('aria-pressed', 'false');
    const boite = await bouton.boundingBox();
    expect(boite?.width).toBeGreaterThanOrEqual(48);
    expect(boite?.height).toBeGreaterThanOrEqual(48);
    expect(await tailleDuTexte(page)).toBe(18);
  });

  test('agrandit le texte à 22 px et les titres en proportion, puis revient à 18 px', async ({ page }) => {
    await page.goto('/');
    const titreAvant = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('h1, h2')!).fontSize));

    await boutonAa(page).click();
    await expect(boutonAa(page)).toHaveAttribute('aria-pressed', 'true');
    expect(await tailleDuTexte(page)).toBe(22);
    const titreApres = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('h1, h2')!).fontSize));
    expect(titreApres / titreAvant).toBeCloseTo(22 / 18, 2);

    await boutonAa(page).click();
    await expect(boutonAa(page)).toHaveAttribute('aria-pressed', 'false');
    expect(await tailleDuTexte(page)).toBe(18);
  });

  test('le choix est conservé après rechargement, dès le premier affichage', async ({ page }) => {
    await page.goto('/');
    await boutonAa(page).click();
    await page.reload();
    // Le réglage est posé par le script de l'en-tête, avant l'îlot du bouton.
    const tailleAuChargement = await page.evaluate(() => document.documentElement.dataset.taille);
    expect(tailleAuChargement).toBe('grand');
    expect(await tailleDuTexte(page)).toBe(22);
    await expect(boutonAa(page)).toHaveAttribute('aria-pressed', 'true');
  });

  test('fonctionne pour la page en cours quand le stockage est refusé', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('Stockage refusé', 'SecurityError');
        },
      });
    });
    const erreurs: string[] = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto('/');
    await boutonAa(page).click();
    await expect(boutonAa(page)).toHaveAttribute('aria-pressed', 'true');
    expect(await tailleDuTexte(page)).toBe(22);
    expect(erreurs).toEqual([]);
  });
});

test.describe('Mode grand : aucun débordement horizontal à 360 px', () => {
  for (const { nom, chemin } of PAGES) {
    test(nom, async ({ page }) => {
      await page.addInitScript(() => {
        try {
          localStorage.setItem('taille-du-texte', 'grand');
        } catch {
          // Sans stockage, le test échouera sur la taille attendue.
        }
      });
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(chemin);
      expect(await tailleDuTexte(page)).toBe(22);
      const largeurs = await page.evaluate(() => ({
        contenu: document.documentElement.scrollWidth,
        fenetre: document.documentElement.clientWidth,
      }));
      expect(largeurs.contenu).toBeLessThanOrEqual(largeurs.fenetre);
    });
  }
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

/**
 * Règles transverses vérifiées sur chaque page, en mobile et en ordinateur :
 * axe (WCAG 2.1 A et AA), puis ce qu'axe ne vérifie pas (charte v2).
 *
 * Exemptions, à marquer dans le HTML :
 * - `data-logotype` : le logotype peut descendre sous 18 px ;
 * - un lien placé dans une phrase (`<p>` qui contient d'autres mots) échappe
 *   à la règle des 48 px, comme le prévoit le critère WCAG 2.5.8.
 */
for (const { nom, chemin } of PAGES) {
  test.describe(nom, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(chemin);
    });

    test('aucune violation axe WCAG 2.1 A et AA', async ({ page }) => {
      const resultat = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(resultat.violations.map((v) => `${v.id} : ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
    });

    test('aucun texte calculé sous 18 px, hors logotype', async ({ page }) => {
      const tropPetits = await page.evaluate(() => {
        const fautes: string[] = [];
        const marcheur = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = marcheur.nextNode(); n; n = marcheur.nextNode()) {
          const texte = n.textContent?.trim();
          const parent = n.parentElement;
          if (!texte || !parent || parent.closest('[data-logotype], script, style, noscript')) continue;
          const style = getComputedStyle(parent);
          const rect = parent.getBoundingClientRect();
          const visible = style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 1 && rect.height > 1;
          if (visible && parseFloat(style.fontSize) < 18) fautes.push(`${style.fontSize} « ${texte.slice(0, 40)} »`);
        }
        return fautes;
      });
      expect(tropPetits).toEqual([]);
    });

    test('cibles cliquables d’au moins 48 × 48 px', async ({ page }) => {
      const tropPetites = await page.evaluate(() => {
        const fautes: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [role="button"], summary')) {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          if (style.visibility === 'hidden' || style.display === 'none' || rect.width === 0 || rect.height === 0) continue;
          // Lien d'évitement hors écran tant qu'il n'a pas le focus.
          if (rect.right <= 0 || rect.bottom <= 0) continue;
          const phrase = el.closest('p');
          if (el.tagName === 'A' && phrase && (phrase.textContent ?? '').trim() !== (el.textContent ?? '').trim()) continue;
          if (rect.width < 48 || rect.height < 48) {
            fautes.push(`${el.tagName.toLowerCase()} ${Math.round(rect.width)}×${Math.round(rect.height)} « ${(el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 40)} »`);
          }
        }
        return fautes;
      });
      expect(tropPetites).toEqual([]);
    });

    test('aucun débordement horizontal à 360 px', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      const largeurs = await page.evaluate(() => ({
        contenu: document.documentElement.scrollWidth,
        fenetre: document.documentElement.clientWidth,
      }));
      expect(largeurs.contenu).toBeLessThanOrEqual(largeurs.fenetre);
    });
  });
}

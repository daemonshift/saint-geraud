import { expect, test } from '@playwright/test';
import { PAGES_LEGALES } from '../../src/lib/navigation';

// Pages légales (spec #1, ADR 0003). Les tests transverses (axe, 18 px, 48 px,
// débordement, domaines) les couvrent via tests/e2e/pages.ts.

test('chaque page légale du pied de page s’ouvre sur son titre', async ({ page }) => {
  for (const { libelle, href } of PAGES_LEGALES) {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: libelle, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${href}/?$`));
    await expect(page.getByRole('heading', { level: 1 })).toContainText(libelle);
  }
});

test('Mentions légales : éditeur et directeur de publication en attente, hébergeur Vercel avec son adresse, réalisation bénévole', async ({ page }) => {
  await page.goto('/mentions-legales');
  const contenu = page.getByRole('main');
  await expect(contenu.getByRole('heading', { name: 'Éditeur' })).toBeVisible();
  await expect(contenu.getByRole('heading', { name: 'Directeur de publication' })).toBeVisible();
  await expect(contenu).toContainText(/en attente.*diocèse/i);
  await expect(contenu.getByRole('heading', { name: 'Hébergeur' })).toBeVisible();
  await expect(contenu).toContainText('Vercel Inc.');
  await expect(contenu).toContainText('440 N Barranca Avenue #4133');
  await expect(contenu).toContainText('Covina, CA 91723');
  await expect(contenu).toContainText(/bénévole/);
});

test('Confidentialité : rien n’est collecté, et chaque tiers est déclaré', async ({ page }) => {
  await page.goto('/confidentialite');
  const contenu = page.getByRole('main');
  await expect(contenu).toContainText(/ne collecte aucune donnée personnelle/);
  await expect(contenu).toContainText(/aucun formulaire/i);
  await expect(contenu.getByRole('heading', { name: /Mesure d’audience/ })).toBeVisible();
  await expect(contenu).toContainText('Vercel Web Analytics');
  await expect(contenu).toContainText(/sans cookie/);
  await expect(contenu.getByRole('heading', { name: /Journaux techniques/ })).toBeVisible();
  await expect(contenu).toContainText('Data Privacy Framework');
  await expect(contenu).toContainText('OpenStreetMap');
  await expect(contenu).toContainText('messes.info');
  await expect(contenu.getByRole('heading', { name: /Responsable de traitement/ })).toBeVisible();
  await expect(contenu).toContainText(/en attente.*diocèse/i);
});

test('Accessibilité : objectif WCAG 2.1 AA, partiellement conforme, non audité, avec un contact', async ({ page }) => {
  await page.goto('/accessibilite');
  const contenu = page.getByRole('main');
  await expect(contenu).toContainText('WCAG 2.1');
  await expect(contenu).toContainText('niveau AA');
  await expect(contenu).toContainText(/partiellement conforme/);
  await expect(contenu).toContainText(/n’a pas encore fait l’objet d’un audit/);
  await contenu.getByRole('link', { name: /Nous contacter/ }).click();
  await expect(page.locator('#nous-contacter')).toBeInViewport();
});

test('aucun cookie déposé et aucune bannière cookies', async ({ page, context }) => {
  for (const chemin of ['/', ...PAGES_LEGALES.map((p) => p.href)]) {
    await page.goto(chemin, { waitUntil: 'networkidle' });
    await expect(page.getByText(/cookies/i).and(page.getByRole('dialog'))).toHaveCount(0);
  }
  expect(await context.cookies()).toEqual([]);
});

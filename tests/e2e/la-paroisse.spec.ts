import { expect, test } from './fixtures';

/**
 * La paroisse, construite avec les Infos pratiques d'exemple
 * (src/lib/contenu/donnees-exemple.ts).
 */
test.describe('La paroisse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/la-paroisse');
  });

  test('sommaire d’ancres vers chaque section, dans l’ordre', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'La paroisse' })).toBeVisible();
    const sommaire = page.getByRole('navigation', { name: 'Aller à :' });
    const liens = sommaire.getByRole('link');
    await expect(liens).toHaveText([
      'Présentation',
      'Le Curé',
      'Le presbytère',
      'Contacts',
      'Associations et mouvements',
      'Le diocèse',
    ]);
    for (const id of ['presentation', 'cure', 'presbytere', 'contacts', 'associations', 'diocese']) {
      await expect(sommaire.locator(`a[href="#${id}"]`)).toHaveCount(1);
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test('le Curé : nom et fonctions, sans photo dans les données d’exemple', async ({ page }) => {
    const cure = page.locator('#cure');
    await expect(cure.getByRole('heading', { level: 3 })).toHaveText('Père [Nom du Curé]');
    await expect(cure).toContainText('Curé de la paroisse Saint-Géraud des Vallées en Fumélois');
    await expect(cure.locator('img')).toHaveCount(0);
  });

  test('le presbytère : permanences d’accueil regroupées sous « Accueil »', async ({ page }) => {
    const accueil = page.locator('#presbytere').getByRole('heading', { name: 'Accueil', exact: true }).locator('..');
    await expect(accueil.locator('dt')).toHaveText(['Lundi', 'Mercredi', 'Samedi']);
    await expect(accueil.locator('dd').first()).toHaveText('9 h 30 – 12 h');
  });

  test('chaque contact : un rôle, son e-mail en mailto: et son téléphone en tel:', async ({ page }) => {
    const cartes = page.locator('#contacts article');
    await expect(cartes.getByRole('heading', { level: 3 })).toHaveText(['Baptême', 'Mariage', 'Obsèques', 'Catéchisme']);
    for (const carte of await cartes.all()) {
      await expect(carte.locator('a[href^="mailto:"]')).toHaveCount(1);
      await expect(carte.locator('a[href^="tel:+33"]')).toHaveCount(1);
    }
    const obseques = page.locator('#contact-obseques');
    await expect(obseques.locator('a[href^="mailto:"]')).toHaveText('Écrire à obseques@example.org');
    await expect(obseques.locator('a[href^="tel:"]')).toHaveAttribute('href', 'tel:+33553000001');
    await expect(page.getByText('Contact masqué')).toHaveCount(0);
  });

  test('Groupes : cartes regroupées par Type, pictogramme, contact du groupe ou du presbytère', async ({ page }) => {
    const section = page.locator('#associations');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText('Associations et mouvements');
    await expect(section.getByRole('heading', { level: 3 })).toHaveText(['Associations', 'Mouvements', 'Équipes paroissiales']);
    await expect(section.getByRole('heading', { level: 4 })).toHaveText([
      'Chorale paroissiale',
      'Secours catholique',
      'Scouts et guides',
      'Équipe liturgique',
    ]);
    await expect(section.getByText('Groupe masqué')).toHaveCount(0);
    // La Chorale a une image servie par le site (stockage des images) ; les autres, un pictogramme.
    await expect(section.locator('img')).toHaveCount(1);
    await expect(section.locator('#groupe-recExempleChorale img')).toHaveAttribute('src', /^\/images-du-site\/attExempleChorale-[0-9a-f]+\.webp$/);
    await expect(section.locator('article svg')).toHaveCount(3);

    const chorale = page.locator('#groupe-recExempleChorale');
    await expect(chorale.locator('a[href^="mailto:"]')).toHaveText('Écrire à chorale@example.org');
    await expect(chorale.locator('a[href^="tel:"]')).toHaveCount(0);

    const secours = page.locator('#groupe-recExempleSecours');
    await expect(secours).toContainText('Contact : le presbytère');
    await expect(secours.locator('a[href^="mailto:"]')).toHaveText('Écrire à paroisse@example.org');
    await expect(secours.locator('a[href^="tel:+33"]')).toHaveCount(1);
    await expect(secours.getByRole('link', { name: 'Découvrir Secours catholique (site du groupe)' })).toHaveAttribute(
      'href',
      'https://secours.example.org/',
    );

    await expect(page.locator('#groupe-recExempleScouts').getByRole('link', { name: /site du groupe/ })).toHaveAttribute(
      'href',
      'https://scouts.example.org/',
    );
  });

  test('renvoie vers le site du diocèse d’Agen, en le disant', async ({ page }) => {
    await expect(page.locator('#diocese').getByRole('link', { name: 'Diocèse d’Agen (site du diocèse)' })).toHaveAttribute(
      'href',
      /^https:\/\//,
    );
  });
});

test('pied de page : permanences d’accueil du presbytère', async ({ page }) => {
  await page.goto('/');
  const pied = page.getByRole('contentinfo');
  await expect(pied.locator('dt')).toHaveText(['Lundi', 'Mercredi', 'Samedi']);
});

import { expect, test, type Page } from './fixtures';

/**
 * Carrousel des Actualités de l'Accueil, avec les données d'exemple
 * (src/lib/contenu/donnees-exemple.ts) : cinq Actualités En ligne, la Mise en
 * avant d'abord. Une carte visible en mobile, trois en ordinateur.
 */
const carrousel = (page: Page) => page.getByRole('region', { name: 'Actualités' });
const precedente = (page: Page) => carrousel(page).getByRole('button', { name: 'Actualité précédente' });
const suivante = (page: Page) => carrousel(page).getByRole('button', { name: 'Actualité suivante' });
const position = (page: Page) => carrousel(page).locator('[aria-live="polite"]:visible');

/**
 * Vrai si la carte de l'Actualité tient entièrement dans la largeur visible
 * de la piste. Mesure horizontale seulement : la hauteur visible dépend du
 * défilement vertical de la page (focus d'une flèche), qui varie avec le
 * rendu des polices d'un système à l'autre et n'est pas l'affaire du carrousel.
 */
const carteEntierementVisible = (page: Page, titre: string) =>
  expect.poll(() =>
    carrousel(page)
      .locator('[data-piste] > *')
      .filter({ has: page.getByRole('link', { name: titre }) })
      .evaluate((carte) => {
        const piste = carte.parentElement!.getBoundingClientRect();
        const boite = carte.getBoundingClientRect();
        return boite.left >= piste.left - 1 && boite.right <= piste.right + 1;
      }),
  );

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('présente les dernières Actualités, Mises en avant en premier', async ({ page }) => {
  await expect(carrousel(page).getByRole('heading', { level: 3 })).toHaveText([
    'Messe de la nuit de Noël',
    'Inscriptions au catéchisme',
    'Kermesse paroissiale',
    'Concert de la chorale',
    'Pèlerinage diocésain à Lourdes',
  ]);
});

test('mène à la liste par « Voir toutes les actualités »', async ({ page }) => {
  await carrousel(page).getByRole('link', { name: 'Voir toutes les actualités' }).click();
  await expect(page).toHaveURL(/\/actualites$/);
});

test('flèches d’au moins 48 px', async ({ page }) => {
  for (const fleche of [precedente(page), suivante(page)]) {
    const boite = await fleche.boundingBox();
    expect(boite?.width).toBeGreaterThanOrEqual(48);
    expect(boite?.height).toBeGreaterThanOrEqual(48);
  }
});

test('ne défile jamais tout seul', async ({ page }) => {
  await page.clock.install();
  await page.reload();
  const piste = carrousel(page).locator('[data-piste]');
  const avant = await position(page).textContent();
  await page.clock.runFor(60_000);
  await expect(position(page)).toHaveText(avant ?? '');
  expect(await piste.evaluate((el) => el.scrollLeft)).toBe(0);
});

test('animation supprimée si « réduire les animations »', async ({ page }) => {
  const piste = carrousel(page).locator('[data-piste]');
  expect(await piste.evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe('smooth');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await piste.evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe('auto');
});

test.describe('mobile : une carte à la fois', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, 'mobile uniquement');

  test('se pilote au clavier et annonce la position', async ({ page }) => {
    await expect(position(page)).toHaveText('1 sur 5');
    await expect(precedente(page)).toBeDisabled();

    await suivante(page).focus();
    await page.keyboard.press('Enter');
    await expect(position(page)).toHaveText('2 sur 5');
    await expect(precedente(page)).toBeEnabled();

    for (const attendue of ['3 sur 5', '4 sur 5', '5 sur 5']) {
      await page.keyboard.press('Enter');
      await expect(position(page)).toHaveText(attendue);
    }
    await expect(suivante(page)).toBeDisabled();
    // La flèche désactivée ne garde pas le focus : il passe à l'autre flèche.
    await expect(precedente(page)).toBeFocused();
    await carteEntierementVisible(page, 'Pèlerinage diocésain à Lourdes').toBe(true);

    await page.keyboard.press('Enter');
    await expect(position(page)).toHaveText('4 sur 5');
  });

  test('suit le défilement au doigt', async ({ page }) => {
    const piste = carrousel(page).locator('[data-piste]');
    await piste.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
    await expect(position(page)).toHaveText('5 sur 5');
    await expect(suivante(page)).toBeDisabled();
  });
});

test.describe('ordinateur : trois cartes', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, 'ordinateur uniquement');

  test('montre les trois premières cartes, la flèche précédente désactivée', async ({ page }) => {
    await carrousel(page).locator('[data-piste]').scrollIntoViewIfNeeded();
    for (const titre of ['Messe de la nuit de Noël', 'Inscriptions au catéchisme', 'Kermesse paroissiale']) {
      await carteEntierementVisible(page, titre).toBe(true);
    }
    await carteEntierementVisible(page, 'Concert de la chorale').toBe(false);
    await expect(position(page)).toHaveText('1 à 3 sur 5');
    await expect(precedente(page)).toBeDisabled();
    await expect(suivante(page)).toBeEnabled();
  });

  test('se pilote au clavier, une carte à la fois, et annonce la position', async ({ page }) => {
    await carrousel(page).locator('[data-piste]').scrollIntoViewIfNeeded();
    await suivante(page).focus();
    await page.keyboard.press('Enter');
    await expect(position(page)).toHaveText('2 à 4 sur 5');
    await expect(precedente(page)).toBeEnabled();

    await page.keyboard.press('Enter');
    await expect(position(page)).toHaveText('3 à 5 sur 5');
    await expect(suivante(page)).toBeDisabled();
    // La flèche désactivée ne garde pas le focus : il passe à l'autre flèche.
    await expect(precedente(page)).toBeFocused();
    for (const titre of ['Kermesse paroissiale', 'Concert de la chorale', 'Pèlerinage diocésain à Lourdes']) {
      await carteEntierementVisible(page, titre).toBe(true);
    }

    await page.keyboard.press('Enter');
    await expect(position(page)).toHaveText('2 à 4 sur 5');
    await page.keyboard.press('Enter');
    await expect(position(page)).toHaveText('1 à 3 sur 5');
    await expect(precedente(page)).toBeDisabled();
    await expect(suivante(page)).toBeFocused();
  });
});

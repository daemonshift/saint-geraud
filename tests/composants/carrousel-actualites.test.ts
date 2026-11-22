import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CarrouselActualites from '../../src/components/CarrouselActualites.astro';

/**
 * Accueil sans Actualité En ligne : cas impossible à construire avec les
 * données d'exemple, donc vérifié sur le rendu du composant seul.
 */
describe('Carrousel des Actualités sans Actualité', () => {
  const rendu = async () => {
    const conteneur = await AstroContainer.create();
    return conteneur.renderToString(CarrouselActualites, { props: { actualites: [] } });
  };

  it('garde son titre et annonce qu’il n’y a aucune actualité', async () => {
    const html = await rendu();
    expect(html).toMatch(/<h2 id="titre-carrousel-actualites"[^>]*>Actualités<\/h2>/);
    expect(html).toContain('Aucune actualité pour le moment. Revenez bientôt.');
  });

  it('n’affiche ni piste, ni flèches, ni position annoncée', async () => {
    const html = await rendu();
    expect(html).not.toContain('data-piste');
    expect(html).not.toContain('Actualité précédente');
    expect(html).not.toContain('Actualité suivante');
    expect(html).not.toContain('aria-live');
    expect(html).not.toContain('Voir toutes les actualités');
  });
});

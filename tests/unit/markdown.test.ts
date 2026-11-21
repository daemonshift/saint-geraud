import { describe, expect, it } from 'vitest';
import { markdownEnHtml } from '../../src/lib/markdown';

describe('Texte Markdown d’une Actualité', () => {
  it('rend paragraphes, gras, listes et liens', () => {
    expect(markdownEnHtml('Un **mot**.\n\n- un\n- deux\n\n[Diocèse](https://agen.catholique.fr/)')).toBe(
      '<p>Un <strong>mot</strong>.</p>\n<ul>\n<li>un</li>\n<li>deux</li>\n</ul>\n<p><a href="https://agen.catholique.fr/">Diocèse</a></p>',
    );
  });

  it('n’injecte jamais de HTML brut ni de lien javascript:', () => {
    const html = markdownEnHtml('<script>alert(1)</script>\n\n[x](javascript:alert(1))');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('javascript:');
  });
});

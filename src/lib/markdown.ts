/**
 * Markdown (texte enrichi d'Airtable) → HTML. Le HTML brut est échappé et les
 * liens dangereux (`javascript:`…) neutralisés : réglages par défaut de micromark.
 */
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

export function markdownEnHtml(markdown: string): string {
  return micromark(markdown, { extensions: [gfm()], htmlExtensions: [gfmHtml()] }).trim();
}

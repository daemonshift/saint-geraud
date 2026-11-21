/**
 * Liens de contact (ADR 0003 : pas de formulaire, des liens `tel:` et `mailto:`).
 */

/** Transforme un numéro affiché (« 05 53 71 00 00 ») en lien `tel:` international. */
export function lienTelephone(numero: string): string {
  const chiffres = numero.replace(/[\s.\- ()]/g, '');
  if (/^\+\d{6,15}$/.test(chiffres)) return `tel:${chiffres}`;
  if (/^0\d{9}$/.test(chiffres)) return `tel:+33${chiffres.slice(1)}`;
  throw new Error(`Le numéro de téléphone « ${numero} » n'est pas lisible.`);
}

/** Lien `mailto:` ; l'adresse est toujours affichée en clair à côté (ou dans) le lien. */
export function lienEmail(adresse: string): string {
  return `mailto:${adresse.trim()}`;
}

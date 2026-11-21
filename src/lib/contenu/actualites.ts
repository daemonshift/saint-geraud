/**
 * Actualités : règles de publication et passage d'un enregistrement Airtable
 * au modèle du site. `aujourdhui` est le jour calendaire à Paris (`AAAA-MM-JJ`).
 */
import type { EnregistrementAirtable } from '../airtable/client';
import { ACTUALITES, EGLISES } from '../airtable/schema';
import { dateEnLettres, dateHeureEnLettres } from './dates';
import type { Actualite, Categorie, EgliseLiee, ImageDuSite } from './modele';
import { booleen, liens, texte } from './valeurs';

const c = ACTUALITES.champs;

/**
 * En ligne : Validée ET Date de publication ≤ aujourd'hui ET (Fin d'affichage
 * vide OU ≥ aujourd'hui). Une Actualité sans titre est traitée comme un Brouillon.
 */
export function estEnLigne(e: EnregistrementAirtable, aujourdhui: string): boolean {
  const datePublication = texte(e, c.datePublication);
  const finAffichage = texte(e, c.finAffichage);
  return (
    booleen(e, c.valide) &&
    texte(e, c.titre) !== '' &&
    datePublication !== '' &&
    datePublication <= aujourdhui &&
    (finAffichage === '' || finAffichage >= aujourdhui)
  );
}

/** Mises en avant d'abord, puis Date de publication décroissante. */
export function trierActualites(actualites: Actualite[]): Actualite[] {
  return [...actualites].sort(
    (a, b) => Number(b.miseEnAvant) - Number(a.miseEnAvant) || b.datePublication.localeCompare(a.datePublication),
  );
}

/** Église telle qu'une Actualité la cite (lieu), qu'elle soit ou non affichée sur Nos églises. */
export function versEgliseLiee(e: EnregistrementAirtable): EgliseLiee {
  return { id: e.id, nom: texte(e, EGLISES.champs.nom), commune: texte(e, EGLISES.champs.commune) };
}

/** `image` : déjà retenue et téléchargée par `imageDe` (images.ts). */
export function versActualite(
  e: EnregistrementAirtable,
  eglisesParId: Map<string, EgliseLiee>,
  image: ImageDuSite | null = null,
): Actualite {
  const datePublication = texte(e, c.datePublication);
  const dateEvenement = texte(e, c.dateEvenement);
  const modifieLe = texte(e, c.modifieLe);
  const debut = dateEvenement ? new Date(dateEvenement) : null;
  const eglises = liens(e, c.eglises).flatMap((id) => eglisesParId.get(id) ?? []);
  return {
    id: e.id,
    titre: texte(e, c.titre),
    resume: texte(e, c.resume),
    texte: texte(e, c.texte),
    categorie: (texte(e, c.categorie) || null) as Categorie | null,
    datePublication,
    datePublicationEnLettres: dateEnLettres(datePublication),
    finAffichage: texte(e, c.finAffichage) || null,
    miseEnAvant: booleen(e, c.miseEnAvant),
    evenement: debut ? { debut, enLettres: dateHeureEnLettres(debut) } : null,
    modifieLe: modifieLe ? new Date(modifieLe) : null,
    eglises,
    lieu: eglises.length ? eglises.map((g) => [g.nom, g.commune].filter(Boolean).join(', ')).join(' · ') : null,
    image,
  };
}

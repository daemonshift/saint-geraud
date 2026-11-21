/**
 * Actualités : règles de publication et passage d'un enregistrement Airtable
 * au modèle du site. `aujourdhui` est le jour calendaire à Paris (`AAAA-MM-JJ`).
 */
import type { EnregistrementAirtable } from '../airtable/client';
import { ACTUALITES } from '../airtable/schema';
import { dateEnLettres, dateHeureEnLettres } from './dates';
import type { Actualite, Categorie } from './modele';
import { booleen, texte } from './valeurs';

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

export function versActualite(e: EnregistrementAirtable): Actualite {
  const datePublication = texte(e, c.datePublication);
  const dateEvenement = texte(e, c.dateEvenement);
  const modifieLe = texte(e, c.modifieLe);
  const debut = dateEvenement ? new Date(dateEvenement) : null;
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
    eglises: [],
    lieu: null,
  };
}

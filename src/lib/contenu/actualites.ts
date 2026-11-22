/**
 * Actualités : règles de publication et passage d'un enregistrement Airtable
 * au modèle du site. `aujourdhui` est le jour calendaire à Paris (`AAAA-MM-JJ`).
 */
import type { EnregistrementAirtable } from '../airtable/client';
import { ACTUALITES, EGLISES } from '../airtable/schema';
import { dateEnLettres, dateHeureEnLettres } from './dates';
import { lienAgenda } from '../navigation';
import { estAffichee } from './eglises';
import type { Actualite, Categorie, EgliseLiee, EvenementAgenda } from './modele';
import { booleen, liens, lignesAdresse, nombre, texte } from './valeurs';

const c = ACTUALITES.champs;

/** Validée, avec un titre et une Date de publication : sinon c'est un Brouillon, ignoré par le site. */
function estValidee(e: EnregistrementAirtable): boolean {
  return booleen(e, c.valide) && texte(e, c.titre) !== '' && texte(e, c.datePublication) !== '';
}

/**
 * En ligne : Validée ET Date de publication ≤ aujourd'hui ET (Fin d'affichage
 * vide OU ≥ aujourd'hui). Une Actualité sans titre est traitée comme un Brouillon.
 */
export function estEnLigne(e: EnregistrementAirtable, aujourdhui: string): boolean {
  const finAffichage = texte(e, c.finAffichage);
  return (
    estValidee(e) &&
    texte(e, c.datePublication) <= aujourdhui &&
    (finAffichage === '' || finAffichage >= aujourdhui)
  );
}

/**
 * Archivée : Validée ET Fin d'affichage < aujourd'hui. Seule une Archivée
 * produit une redirection ; toute autre Actualité absente du site mène à la 404.
 */
export function estArchivee(e: EnregistrementAirtable, aujourdhui: string): boolean {
  const finAffichage = texte(e, c.finAffichage);
  return estValidee(e) && finAffichage !== '' && finAffichage < aujourdhui;
}

/** Mises en avant d'abord, puis Date de publication décroissante. */
export function trierActualites(actualites: Actualite[]): Actualite[] {
  return [...actualites].sort(
    (a, b) => Number(b.miseEnAvant) - Number(a.miseEnAvant) || b.datePublication.localeCompare(a.datePublication),
  );
}

/** Église telle qu'une Actualité la cite (lieu), qu'elle soit ou non affichée sur Nos églises. */
export function versEgliseLiee(e: EnregistrementAirtable): EgliseLiee {
  const g = EGLISES.champs;
  const latitude = nombre(e, g.latitude);
  const longitude = nombre(e, g.longitude);
  return {
    id: e.id,
    nom: texte(e, g.nom),
    commune: texte(e, g.commune),
    adresse: lignesAdresse(texte(e, g.adresse)),
    accesPmr: booleen(e, g.accesPmr),
    position: latitude !== null && longitude !== null ? { latitude, longitude } : null,
    surNosEglises: estAffichee(e),
  };
}

/** Durée retenue pour un événement : Airtable n'a pas de champ de fin. */
const DUREE_EVENEMENT_MS = 60 * 60 * 1000;

function versAgenda(
  id: string,
  debut: Date,
  { titre, resume, eglises, horodatage }: { titre: string; resume: string; eglises: EgliseLiee[]; horodatage: Date },
): EvenementAgenda {
  const lieu = eglises.map((g) => [g.nom, ...(g.adresse.length ? g.adresse : [g.commune])].filter(Boolean).join(', ')).join(' ; ');
  return {
    uid: `actualite-${id}@paroisse-saint-geraud`,
    debut,
    fin: new Date(debut.getTime() + DUREE_EVENEMENT_MS),
    horodatage,
    titre,
    description: resume,
    lieu: lieu || null,
    fichier: lienAgenda(id),
  };
}

/** `maintenant` : instant du build, horodatage de l'agenda quand Modifie_le est vide. */
export function versActualite(e: EnregistrementAirtable, eglisesParId: Map<string, EgliseLiee>, maintenant: Date = new Date()): Actualite {
  const datePublication = texte(e, c.datePublication);
  const dateEvenement = texte(e, c.dateEvenement);
  const modifieLe = texte(e, c.modifieLe);
  const debut = dateEvenement ? new Date(dateEvenement) : null;
  const eglises = liens(e, c.eglises).flatMap((id) => eglisesParId.get(id) ?? []);
  const titre = texte(e, c.titre);
  const resume = texte(e, c.resume);
  return {
    id: e.id,
    titre,
    resume,
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
    agenda: debut
      ? versAgenda(e.id, debut, { titre, resume, eglises, horodatage: modifieLe ? new Date(modifieLe) : maintenant })
      : null,
  };
}

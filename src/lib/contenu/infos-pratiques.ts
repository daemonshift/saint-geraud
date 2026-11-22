/**
 * Infos pratiques : règles de publication (Active, tri par Ordre), regroupement
 * par Rubrique, et lecture des conventions de contenu de
 * docs/context/schema-airtable.md (Curé, Presbytère, Contacts).
 */
import type { EnregistrementAirtable } from '../airtable/client';
import { INFOS_PRATIQUES } from '../airtable/schema';
import type { StockageImages } from './charger';
import { imageRetenue } from './images';
import type {
  ContactDemarche,
  Cure,
  InfoPratique,
  InfosPratiques,
  Presbytere,
  RubriqueInfoPratique,
} from './modele';
import { booleen, nombre, texte } from './valeurs';

const c = INFOS_PRATIQUES.champs;
const RUBRIQUES: RubriqueInfoPratique[] = ['Curé', 'Presbytère', 'Contacts'];

/** Minuscules, sans accents ni apostrophe typographique, espaces réduits : pour reconnaître un libellé. */
export function normaliser(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Ancre stable tirée d'un libellé : « Préparation au baptême » → « preparation-au-bapteme ». */
export function cleDe(libelle: string): string {
  return normaliser(libelle)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function versInfosPratiques(
  enregistrements: EnregistrementAirtable[],
  images: StockageImages,
): Promise<InfosPratiques> {
  const actives = enregistrements
    .filter((e) => booleen(e, c.active) && texte(e, c.libelle) !== '')
    .sort((a, b) => (nombre(a, c.ordre) ?? Infinity) - (nombre(b, c.ordre) ?? Infinity));

  const parRubrique = Object.fromEntries(RUBRIQUES.map((r) => [r, [] as InfoPratique[]])) as InfosPratiques['parRubrique'];
  for (const e of actives) {
    const rubrique = texte(e, c.rubrique) as RubriqueInfoPratique;
    if (!RUBRIQUES.includes(rubrique)) continue;
    parRubrique[rubrique].push(await versInfoPratique(e, rubrique, images));
  }

  const presbytere = versPresbytere(parRubrique['Presbytère']);
  return {
    parRubrique,
    cure: versCure(parRubrique['Curé'][0]),
    presbytere,
    contacts: parRubrique.Contacts.map((info) => versContact(info, presbytere)),
  };
}

async function versInfoPratique(
  e: EnregistrementAirtable,
  rubrique: RubriqueInfoPratique,
  images: StockageImages,
): Promise<InfoPratique> {
  return {
    id: e.id,
    libelle: texte(e, c.libelle),
    valeur: texte(e, c.valeur),
    telephone: texte(e, c.telephone) || null,
    description: texte(e, c.description),
    // Aucune photo de personne sauf le Curé : toute autre image est ignorée.
    image: rubrique === 'Curé' ? await imageRetenue(e, { image: c.image, texteAlternatif: c.texteAlternatif }, images) : null,
  };
}

function versCure(info: InfoPratique | undefined): Cure | null {
  if (!info) return null;
  return {
    titre: info.libelle,
    nom: info.valeur,
    fonctions: info.description
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean),
    photo: info.image,
  };
}

const PERMANENCE_D_ACCUEIL = normaliser('Permanence d’accueil');

function versPresbytere(infos: InfoPratique[]): Presbytere {
  const presbytere: Presbytere = { adresse: null, telephone: null, email: null, accueil: [], autres: [] };
  for (const info of infos) {
    const libelle = normaliser(info.libelle);
    if (normaliser(info.description) === PERMANENCE_D_ACCUEIL) {
      presbytere.accueil.push({ jour: info.libelle, horaires: info.valeur });
    } else if (libelle === 'adresse' && !presbytere.adresse) {
      presbytere.adresse = info.valeur || null;
    } else if (libelle === 'telephone' && !presbytere.telephone) {
      presbytere.telephone = info.telephone ?? (info.valeur || null);
    } else if (['e-mail', 'email', 'courriel'].includes(libelle) && !presbytere.email) {
      presbytere.email = info.valeur || null;
    } else {
      presbytere.autres.push({ libelle: info.libelle, valeur: info.valeur });
    }
  }
  return presbytere;
}

function versContact(info: InfoPratique, presbytere: Presbytere): ContactDemarche {
  return {
    id: info.id,
    role: info.libelle,
    cle: cleDe(info.libelle),
    email: info.valeur || presbytere.email,
    telephone: info.telephone ?? presbytere.telephone,
    precision: info.description,
  };
}

/** Contact d'une démarche par son libellé (« Baptême »), sans tenir compte des accents ni de la casse. */
export function contactPour(contacts: ContactDemarche[], role: string): ContactDemarche | undefined {
  const cle = cleDe(role);
  return contacts.find((contact) => contact.cle === cle);
}

/**
 * Contact d'une démarche (« Confession ») ; à défaut d'Info pratique propre,
 * le presbytère, pour qu'une carte propose toujours e-mail et téléphone.
 */
export function contactOuPresbytere(infosPratiques: InfosPratiques, role: string): ContactDemarche {
  const { contacts, presbytere } = infosPratiques;
  return (
    contactPour(contacts, role) ?? {
      id: 'presbytere',
      role: 'Presbytère',
      cle: 'presbytere',
      email: presbytere.email,
      telephone: presbytere.telephone,
      precision: '',
    }
  );
}

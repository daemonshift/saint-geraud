/**
 * Groupes (associations, mouvements, équipes) : règles de publication
 * (Active, tri par Ordre), regroupement par Type, contact du groupe ou, à
 * défaut, celui du presbytère.
 */
import type { EnregistrementAirtable } from '../airtable/client';
import { GROUPES } from '../airtable/schema';
import type { StockageImages } from './charger';
import { imageRetenue } from './images';
import type { ContactGroupe, Groupe, Groupes, GroupesDUnType, Presbytere, TypeGroupe } from './modele';
import { booleen, nombre, texte } from './valeurs';

const c = GROUPES.champs;

/** Publié : Active et nommé. */
function estPublie(e: EnregistrementAirtable): boolean {
  return booleen(e, c.active) && texte(e, c.nom) !== '';
}

/** Par Ordre croissant (sans Ordre : à la fin), puis par nom. */
function trierGroupes(groupes: EnregistrementAirtable[]): EnregistrementAirtable[] {
  const ordre = (e: EnregistrementAirtable) => nombre(e, c.ordre) ?? Number.POSITIVE_INFINITY;
  return [...groupes].sort((a, b) => ordre(a) - ordre(b) || texte(a, c.nom).localeCompare(texte(b, c.nom), 'fr'));
}

async function versGroupe(e: EnregistrementAirtable, presbytere: Presbytere, images: StockageImages): Promise<Groupe> {
  return {
    id: e.id,
    nom: texte(e, c.nom),
    type: texte(e, c.type) || null,
    description: texte(e, c.description),
    contact: contactDuGroupe(texte(e, c.contact), presbytere),
    siteWeb: texte(e, c.siteWeb) || null,
    image: await imageRetenue(e, { image: c.image, texteAlternatif: c.texteAlternatif }, images),
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE = /^https?:\/\/\S+$/i;

/** Contact saisi (e-mail ou site du groupe) ; vide ou illisible : e-mail et téléphone du presbytère. */
function contactDuGroupe(saisi: string, presbytere: Presbytere): ContactGroupe {
  if (EMAIL.test(saisi)) return { email: saisi, site: null, telephone: null, duPresbytere: false };
  if (SITE.test(saisi)) return { email: null, site: saisi, telephone: null, duPresbytere: false };
  return { email: presbytere.email, site: null, telephone: presbytere.telephone, duPresbytere: true };
}

/** Groupes publiés, triés ; seules leurs images retenues sont téléchargées. */
export async function versGroupes(
  enregistrements: EnregistrementAirtable[],
  presbytere: Presbytere,
  images: StockageImages,
): Promise<Groupes> {
  const liste = await Promise.all(trierGroupes(enregistrements.filter(estPublie)).map((e) => versGroupe(e, presbytere, images)));
  return { liste, parType: regrouperParType(liste) };
}

/** Types connus (choix du champ `Type`, dans leur ordre) et titre de leur regroupement. */
const TITRES_DES_TYPES: Record<TypeGroupe, string> = {
  Association: 'Associations',
  Mouvement: 'Mouvements',
  'Équipe paroissiale': 'Équipes paroissiales',
};
const TYPES = Object.keys(TITRES_DES_TYPES) as TypeGroupe[];

function estTypeConnu(type: string | null): type is TypeGroupe {
  return TYPES.includes(type as TypeGroupe);
}

/** Un regroupement par Type connu, dans l'ordre des choix ; les Groupes sans Type (ou d'un Type inconnu) à la fin. Aucun regroupement vide. */
function regrouperParType(liste: Groupe[]): GroupesDUnType[] {
  const regroupements: GroupesDUnType[] = [
    ...TYPES.map((type) => ({ type, titre: TITRES_DES_TYPES[type], groupes: liste.filter((g) => g.type === type) })),
    { type: null, titre: 'Autres groupes', groupes: liste.filter((g) => !estTypeConnu(g.type)) },
  ];
  return regroupements.filter((r) => r.groupes.length > 0);
}

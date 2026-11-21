/**
 * Images issues d'Airtable (Actualités ; puis Églises #8, Curé #11, Groupes #12).
 *
 *   const image = await imageRetenue(enregistrement, { image: TABLE.champs.image, texteAlternatif: TABLE.champs.texteAlternatif }, images);
 *
 * Règles communes : seule la première pièce jointe compte ; une pièce jointe
 * qui n'est pas une image, ou une image sans texte alternatif, est ignorée
 * (sans casser le build) ; l'image retenue est confiée au stockage, qui la
 * télécharge au build et rend son chemin public (les URL Airtable expirent).
 */
import type { EnregistrementAirtable } from '../airtable/client';
import type { ChampAirtable } from '../airtable/schema';
import type { StockageImages } from './charger';
import type { ImageDuSite } from './modele';
import { texte } from './valeurs';

/** Préfixe des URL d'images d'exemple (données d'exemple) : `exemple:<fichier de src/assets/exemple/>`. */
export const PREFIXE_IMAGE_EXEMPLE = 'exemple:';

/** Pièce jointe telle que la rend l'API Airtable (champ `multipleAttachments`), réduite à ce que le site lit. */
interface PieceJointe {
  id: string;
  url: string;
  filename?: string;
  type?: string;
}

function premierePieceJointe(e: EnregistrementAirtable, champ: ChampAirtable): PieceJointe | null {
  const v = e.fields[champ.id];
  const premiere: unknown = Array.isArray(v) ? v[0] : undefined;
  if (typeof premiere !== 'object' || premiere === null) return null;
  const { id, url, filename, type } = premiere as Record<string, unknown>;
  if (typeof id !== 'string' || typeof url !== 'string' || url === '') return null;
  return {
    id,
    url,
    filename: typeof filename === 'string' ? filename : undefined,
    type: typeof type === 'string' ? type : undefined,
  };
}

/** Nom de fichier stable et sûr : identifiant de la pièce jointe et extension d'origine. */
function nomDeFichier(p: PieceJointe): string {
  const extension = /\.([a-z0-9]{1,5})$/i.exec(p.filename ?? '')?.[1]?.toLowerCase();
  return extension ? `${p.id}.${extension}` : p.id;
}

/** Image retenue d'un enregistrement, téléchargée ; null si absente, sans texte alternatif ou si ce n'est pas une image. */
export async function imageRetenue(
  e: EnregistrementAirtable,
  champs: { image: ChampAirtable; texteAlternatif: ChampAirtable },
  stockage: StockageImages,
): Promise<ImageDuSite | null> {
  const piece = premierePieceJointe(e, champs.image);
  const texteAlternatif = texte(e, champs.texteAlternatif);
  if (!piece || texteAlternatif === '') return null;
  if (piece.type !== undefined && !piece.type.startsWith('image/')) return null;
  return { chemin: await stockage.enregistrer({ url: piece.url, nom: nomDeFichier(piece) }), texteAlternatif };
}

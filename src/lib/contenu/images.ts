/**
 * Images Airtable (règle commune, spec #1) : seule la première pièce jointe
 * compte ; sans texte alternatif, l'image est ignorée. L'image retenue est
 * téléchargée au build par le stockage d'images et servie par le site.
 */
import type { EnregistrementAirtable } from '../airtable/client';
import type { ChampAirtable } from '../airtable/schema';
import type { StockageImages } from './charger';
import type { ImageDuSite } from './modele';
import { texte } from './valeurs';

interface PieceJointe {
  id: string;
  url: string;
  filename?: string;
}

function premierePieceJointe(e: EnregistrementAirtable, champ: ChampAirtable): PieceJointe | null {
  const v = e.fields[champ.id];
  const premiere: unknown = Array.isArray(v) ? v[0] : undefined;
  if (!premiere || typeof premiere !== 'object') return null;
  const { id, url, filename } = premiere as Record<string, unknown>;
  if (typeof id !== 'string' || typeof url !== 'string') return null;
  return { id, url, filename: typeof filename === 'string' ? filename : undefined };
}

/** Nom du fichier servi : l'ID de la pièce jointe (stable, sans caractère gênant) et son extension. */
function nomDuFichier(piece: PieceJointe): string {
  const extension = piece.filename?.match(/\.([a-z0-9]{1,5})$/i)?.[1]?.toLowerCase();
  return extension ? `${piece.id}.${extension}` : piece.id;
}

/** Image retenue d'un enregistrement, téléchargée ; null si absente ou sans texte alternatif. */
export async function imageRetenue(
  e: EnregistrementAirtable,
  champs: { image: ChampAirtable; texteAlternatif: ChampAirtable },
  images: StockageImages,
): Promise<ImageDuSite | null> {
  const texteAlternatif = texte(e, champs.texteAlternatif);
  const piece = premierePieceJointe(e, champs.image);
  if (!piece || !texteAlternatif) return null;
  const chemin = await images.enregistrer({ url: piece.url, nom: nomDuFichier(piece) });
  return { chemin, texteAlternatif };
}

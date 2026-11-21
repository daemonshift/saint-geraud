# Schéma Airtable — Site Paroisse Saint-Géraud des Vallées en Fumélois

Base : `Paroisse Saint-Géraud` — `appFZ9EorUC2DY3yh` (espace de travail dédié `wspG3x87J8N0H9vj7`)
**Schéma validé le 19/11/2026, complété le 21/11/2026 (`Infos_Pratiques`, `Groupes`).** Le code référence les champs par **ID** (`returnFieldsByFieldId`), mapping centralisé dans `src/lib/airtable/schema.ts`.

## Table `Actualités` — `tblEN5ytvb1DdYDYD`

| Champ | ID | Type | Rôle |
|---|---|---|---|
| Titre | fldvqk4kWeJQXRvwl | singleLineText (primaire) | Titre affiché |
| Resume | fldGSXGf4zCwPVEtH | multilineText | Aperçu accueil + meta description |
| Texte | fldZ7wo5J3vZwRyXI | richText | Corps (Markdown via API) |
| Image | fldbAGeQuvLqQAuSM | multipleAttachments | 1 image ; téléchargée au build (URLs Airtable expirent) |
| Texte_Alternatif_Image | fldhxbS2umR1mgdDO | singleLineText | Obligatoire si Image — sinon image ignorée au build |
| Categorie | fld3K6oFqrkLlcpck | singleSelect | Annonce · Événement · Sacrements · Vie paroissiale |
| Date_Evenement | fld3lRSC1ssBsCifr | dateTime (tz client) | API en UTC → converti en Europe/Paris au build |
| Date_Publication | fldrmVGO6C4alueOW | date | Début d'affichage |
| Fin_Affichage | fldVTPJQmkDF6fKiF | date | Fin d'affichage (vide = permanent) |
| Mise_En_Avant | fldPE7P6ewZ06PK3f | checkbox | Épingle en tête d'accueil |
| Valide | fldZoGBbYCxqO238c | checkbox | Garde-fou brouillon |
| Statut | fldE1llOR3bwWFtzu | formula | Badge Interface uniquement — filtrage réel au build en Europe/Paris |
| Cree_le | fldwhidUa41yvoH9W | createdTime | Suivi |
| Modifie_le | fldO5GntSmSW9CcUo | lastModifiedTime | Sitemap `lastmod` |
| Eglises | fldmyLr9uDXR9F9nG | multipleRecordLinks → Eglises | Lieu(x) de l'événement |

## Table `Eglises` — `tblD9OoLYwEzEHO92`

| Champ | ID | Type | Rôle |
|---|---|---|---|
| Nom | fld5eM5Y2RSHVn4Th | singleLineText (primaire) | Nom de l'église |
| Commune | fldTbs8TDrRXxWEa1 | singleLineText | Commune |
| Adresse | fldLmWuRCpiH9QCoe | multilineText | Adresse postale |
| Latitude | fld3pPzXELguWIYf5 | number (6 déc.) | Carte Leaflet |
| Longitude | fldhmiKcb8Bn52bCQ | number (6 déc.) | Carte Leaflet |
| Photo | fldIP3sUS0Mw3Ww68 | multipleAttachments | Optionnel, téléchargée au build |
| Texte_Alternatif | fldfvGnwKUWglTT1B | singleLineText | Alt de la photo (obligatoire si Photo) |
| Acces_Pmr | fldjQ9vGhr9HEdH3M | checkbox | Accessibilité PMR |
| Lien_Messes_info | flds5AZOuZU51KWda | url | Horaires de l'église sur messes.info |
| Ordre | fldDdlncJwT6jzxac | number (entier) | Ordre d'affichage (1 = en premier) |
| Active | fldmmMoiTcSHCdsij | checkbox | Masquer sans supprimer |
| Actualités | fldnPOPW7W4rXngnl | multipleRecordLinks (inverse) | Non exposé sur le site |

## Table `Infos_Pratiques` — `tbld8JSkv2UAndbqH` (créée le 21/11/2026)

| Champ | ID | Type | Rôle |
|---|---|---|---|
| Libellé | fldCJ5Q20STin8jKp | singleLineText (primaire) | Intitulé affiché (« Curé », « Téléphone »…) |
| Valeur | fldo52Uk8agy6YztC | singleLineText | Valeur affichée (nom, numéro, horaire) |
| Rubrique | fldja7cGKtIAnFSPZ | singleSelect | Curé (`selNAwocKnjTYwVv1`) · Presbytère (`selJt1lHdHIQIuUfc`) · Contacts (`selZ0lNLaFsL1hhW5`) |
| Description | fld4DdvFBwiMZN0Jd | multilineText | Facultatif ; fonctions du curé, une par ligne |
| Image | fld8v6Wg1j8jJaZMd | multipleAttachments | Retenue au build **uniquement** si Rubrique = Curé et Texte_Alternatif rempli |
| Texte_Alternatif | fldOnx28homFLY2FA | singleLineText | Obligatoire si Image |
| Ordre | flduYWouPgXtsNdTl | number (entier) | Ordre dans la rubrique |
| Active | fldKwxQN6RyJ4E1Qc | checkbox | Masquer sans supprimer |

## Table `Groupes` — `tbltTtMAX4ME7fcQ9` (créée le 21/11/2026)

| Champ | ID | Type | Rôle |
|---|---|---|---|
| Nom | fldjHG1O5MSOuHanj | singleLineText (primaire) | Nom du groupe |
| Type | fld7OYZwcDmH9ZgRh | singleSelect | Association (`selAIQxnU9dF04Gt5`) · Mouvement (`selrmPjnXxwKyGd5p`) · Équipe paroissiale (`selGmJ3oSyT3pfNe5`) |
| Description | fldgB5Rmic3ph8Dic | multilineText | 2 ou 3 lignes |
| Contact | fldUFwRd5ffHOLVwG | singleLineText | E-mail ou site du groupe, sinon le presbytère ; jamais un contact personnel |
| Site_Web | fldjBvI6jxQTMguWm | url | Facultatif |
| Ordre | flddC8HbMuZHGZWoC | number (entier) | Ordre d'affichage |
| Active | fldVfx3rILg4wd7Fl | checkbox | Masquer sans supprimer |

## Règles de publication (appliquées au build, fuseau Europe/Paris)

- Actualité publiée si : `Valide` = vrai ET `Date_Publication` ≤ aujourd'hui ET (`Fin_Affichage` vide OU `Fin_Affichage` ≥ aujourd'hui).
- Tri : `Mise_En_Avant` d'abord, puis `Date_Publication` décroissante.
- Église affichée si `Active` = vrai ET Latitude/Longitude renseignées ; tri par `Ordre`.

## Interface « Espace communication » — `pbdlfHeFBx10mbNOM` (publiée)

| Page | ID | Type | Contenu |
|---|---|---|---|
| Actualités | pag8HmzKcW1Av4P91 | grille | Onglets Brouillons / Programmées / En ligne / Archivées / **À supprimer** (Archivé et Fin_Affichage il y a plus de 365 jours) ; lien « ➕ Nouvelle actualité » dans la description |
| Calendrier des publications | pagCHmVfMhqZP6Otz | calendrier | `Date_Publication` → `Fin_Affichage`, couleur par `Categorie`, vue mois |
| Actualité Détail | pagbAVE98ZyETg4VA | fiche (plein écran, éditable) | Groupes Publication / Contenu / Image / Événement |
| Infos pratiques | pagPC3LOQ3IXO8Rml | grille groupée par Rubrique | Fiche `Info pratique Détail` (`paghz3Ea0dSfddPco`) |
| Groupes | pagEfFJEHn2bqFI2O | grille groupée par Type | Fiche `Groupe Détail` (`pagoDhyER0y97QV39`) |
| Nouvelle actualité | pagcvmsCapnZAIBYn | formulaire autonome **publié** | https://airtable.com/appFZ9EorUC2DY3yh/pagcvmsCapnZAIBYn/form — Titre, Catégorie, Résumé, Date de publication requis |

## Décisions

- Fuseau `Date_Evenement` laissé en local : la saisie doit se faire depuis un appareil à l'heure française.
- Champ `Lieu` (URL) supprimé : le lieu passe par le lien `Eglises`.
- Token API : lecture seule (`data.records:read`, `schema.bases:read`), limité à cette base, utilisé uniquement au build.

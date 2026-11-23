# Charte design — Site Paroisse Saint-Géraud (v2, 21/11/2026)

Maquettes : planches lisibles dans `docs/context/maquettes/planches/` (1440 = ordinateur, 390 = mobile), extraites de `maquettes-source.html` par `scripts/extraire-maquettes.py`. Le dépôt fait référence ; l'artifact https://claude.ai/artifact/93qsek2Kb9UVtk2K4P2VqY n'est qu'un aperçu.

**Mobile first** : la version mobile sert de base, l'ordinateur l'enrichit. La maquette mobile fait référence pour le mobile, la maquette ordinateur pour l'ordinateur.

## Couleurs principales (base : proposition de Sonia + 2 ajouts accessibilité)
| Token | Hex | Usage |
|---|---|---|
| vert-profond | #315B43 | Couleur principale, boutons, titres, cartes actus |
| vert-sauge | #A9BE9D | Fonds doux (placeholders, encarts) — texte en `encre` uniquement |
| ivoire | #F5F2E9 | Fond du site |
| or-doux | #C5A66A | Filets, bordures, décor — **jamais en texte sur clair** (2,08:1) |
| or-fonce (ajout) | #7A5F2A | Texte doré sur ivoire/blanc (5,36:1) |
| encre (ajout) | #1F2A24 | Texte courant, pied de page (13,26:1 sur ivoire) |

Contrastes mesurés (WCAG 2.x) : vert/ivoire 6,93 · encre/sauge 7,45 · or-doux/vert 3,34 (titres ≥ 24 px seulement) · vert/sauge 3,89 (interdit en texte courant).

## Couleurs secondaires (issues des maquettes, officialisées le 21/11/2026)
Chacune n'a que l'usage indiqué. Aucune autre valeur hexadécimale n'est autorisée dans le code : uniquement des tokens.

| Token | Hex | Usage autorisé | Contraste |
|---|---|---|---|
| gris-vert | #4A564F | Texte secondaire (commune, « Publié le ») sur ivoire ou blanc | 6,86 sur ivoire |
| or-pale | #E8D9B5 | Texte sur vert profond ou encre (dates des cartes, titres du pied de page) | 5,55 sur vert · 10,62 sur encre |
| vert-pale | #E8EDE4 | Texte sur vert profond (lieu des cartes) ; fond de badge avec texte `encre` | 6,52 sur vert · encre dessus 12,48 |
| gris-clair | #D9DED9 | Texte discret sur `encre` (pied de page) | 10,88 sur encre |
| beige-filet | #E4DCC8 | Bordures et filets sur fond clair — décor uniquement | — |
| vert-gris | #3A4A40 | Filets sur fond `encre` — décor uniquement (remplace aussi #33403A) | — |
| vert-survol | #244634 | État survol/actif des boutons `vert-profond` | ivoire dessus 9,38 |

## Typographie
- Titres : Cormorant Garamond 600 (ordinateur : H1 56, H2 40–44 capitales, H3 cartes 24 ; mobile : H1 ≈ 34–40, H2 ≈ 28–32, H3 22–24). Si les étiquettes paraissent trop présentes, on agrandit les titres plutôt que de réduire les étiquettes.
- Texte : Source Sans 3, interligne 1,6.
- **18 px minimum pour tout texte, sans exception, sauf le logotype** (« Vallées en Fumélois »). Cela vaut pour les badges, les dates, les lieux, « Accès PMR », les boutons et le pied de page. La hiérarchie passe par la police (serif/sans), la graisse, la couleur, les capitales et l'espacement, jamais par une taille plus petite. Badges en capitales : espacement des lettres ≈ 0,06 em. Règle vérifiée par un test automatique.
- Polices auto-hébergées (API Fonts d'Astro ou Fontsource) : aucun appel à Google côté visiteur. Les maquettes chargent Google Fonts, le site non.

## Interaction et accessibilité
- Zones tactiles ≥ 48 × 48 px partout (les 44 px des maquettes mobiles sont à corriger).
- Carrousel : flèches, sans défilement automatique, position annoncée (`aria-live`), respect de `prefers-reduced-motion`.
- Menu mobile : fermeture par ✕, Échap ou choix d'un lien ; le focus revient sur le bouton Menu.
- Carte : déplacement à deux doigts sur mobile, toujours accompagnée de la liste texte des églises.

## Patterns repris de saintetiennedumont.fr
- Carrousel actus accueil : cartes image + titre serif capitales, flèches, bouton « Voir toutes les actualités ». Différences : 3 visibles (1 sur mobile), pas d'autoplay (WCAG 2.2.2), badge catégorie, date/lieu issus d'Airtable.
- Sous-pages : bandeau titre, sections H2, grille 3 cartes (médaillon rond, H3 doré capitales, sous-titre, texte, bouton). Médaillon = illustration en couleur de la charte, `src/lib/pictogrammes.ts` (aucune photo de personnes, sauf le curé dans la section « Le curé »). Ajout : sommaire d'ancres `#confession` etc. « La paroisse » suit ce modèle ; les Groupes y sont des cartes avec un pictogramme par Type.

## Pages maquettées
Ordinateur : Accueil · Prier et célébrer · Détail d'une actualité · Charte.
Mobile : Accueil (menu, taille du texte, carrousel) · Menu ouvert · Prier et célébrer · Détail d'une actualité.
Les autres pages (Actualités, Horaires des messes, Nos églises, La paroisse, Actualité terminée, 404, pages légales) reprennent les sections de l'Accueil ou le modèle de sous-page.

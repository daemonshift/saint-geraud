# Le site ne collecte aucune donnée personnelle : pas de formulaire

Le site n'a ni formulaire de contact, ni Inscription en ligne à la Lettre d'information. Il reste dans son périmètre : un site statique, sans service payant, dont seules les Actualités et les données de référence sont mises à jour depuis Airtable. Pour contacter la paroisse, le visiteur utilise des liens `tel:` et `mailto:`, et l'adresse e-mail est aussi affichée en clair. Pour s'inscrire à la Lettre d'information, il écrit à la paroisse ou dépose au presbytère le formulaire papier, téléchargeable en PDF.

## Considered Options

- **Formulaire de contact transmis par e-mail** : écarté. Il demande un endpoint serveur, un service d'envoi d'e-mails avec un domaine vérifié, une protection anti-robots (Turnstile) et une limitation d'envois. C'est hors périmètre, et chaque pièce est à maintenir.
- **Inscription en ligne** (vers un outil d'envoi comme Brevo, vers Airtable, ou par e-mail à la Secrétaire avec double opt-in par jeton signé) : écartée. S'inscrire auprès d'une paroisse révèle une conviction religieuse, donnée sensible au sens de l'article 9 du RGPD. La traiter correctement (double opt-in, preuve et versions du consentement, désinscription) est disproportionné pour ce site, et aucun service payant n'est autorisé.

## Consequences

- Aucun endpoint de formulaire : la seule fonction serveur est la route du Vercel Cron qui déclenche le rebuild (ADR 0002). Le seul secret lu par le site est le token Airtable, au build.
- La politique de confidentialité se limite au fait que le site ne collecte rien, et aux éventuels traceurs tiers (widget messes.info, tuiles de carte).
- **Jamais de bannière cookies.** Aucun traceur tiers n'est chargé sans action explicite du visiteur.
- **Mesure d'audience** : Vercel Web Analytics uniquement (sans cookie, empreinte réinitialisée chaque jour), sans Speed Insights ni événements personnalisés. Elle est déclarée dans la page de confidentialité, avec le transfert vers Vercel Inc. (États-Unis, Data Privacy Framework).
- **Widget messes.info** : il est indispensable et il est conservé. S'il ne dépose aucun cookie de suivi, il est intégré directement. S'il en dépose, il est chargé au clic sur un bouton « Afficher les horaires », qui vaut consentement pour ce seul contenu. Le lien texte vers messes.info est toujours affiché. Son comportement réel est à vérifier à l'implémentation : sa documentation n'a pas pu être lue (404).
- **Tuiles OpenStreetMap** : afficher la carte transmet l'adresse IP du visiteur aux serveurs d'OpenStreetMap, sans cookie. C'est déclaré dans la page de confidentialité.
- Si la paroisse veut un jour une Inscription en ligne, c'est un nouveau projet, et cet ADR doit être revu.

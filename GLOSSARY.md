# Paroisse Saint-Géraud des Vallées en Fumélois

Site public de la paroisse (diocèse d'Agen) : il présente la paroisse, ses églises et ses actualités à un public souvent âgé. Les termes ci-dessous sont ceux d'Airtable et de l'équipe de communication ; le nom utilisé dans le code est indiqué pour chacun.

## Contenus

**Actualité** (code : `Actualite`) :
Une information datée publiée par la paroisse : annonce, événement, sacrement ou vie paroissiale.
_Avoid_ : article, news, post, billet

**Catégorie** (code : `categorie`) :
Le classement d'une Actualité parmi Annonce, Événement, Sacrements, Vie paroissiale.
_Avoid_ : type, rubrique, tag

**Église** (code : `Eglise`) :
Un lieu de culte de la paroisse, situé dans une commune et placé sur la carte.
_Avoid_ : lieu, clocher, relais

**Église active** (code : `active`) :
Une Église que le site affiche ; une Église inactive est masquée sans être supprimée.

**Groupe** (code : `Groupe`) :
Une association, un mouvement ou une équipe lié à la paroisse, auquel on peut participer ; son Type est Association, Mouvement ou Équipe paroissiale.
_Avoid_ : association (pour désigner l'ensemble), service, activité

**Info pratique** (code : `InfoPratique`) :
Une information factuelle qui vieillit (contact pour un sacrement, permanence du presbytère, nom du curé), tenue à jour par l'équipe de communication et reprise dans les pages fixes.
_Avoid_ : paramètre, réglage, donnée

**Page fixe** (code : `page`) :
Une page de fond qui change rarement (Prier et célébrer, La paroisse, mentions légales) et dont le texte est géré par le mainteneur du site.
_Avoid_ : page statique, page CMS

## Cycle de vie d'une Actualité

**Validée** (code : `valide`) :
Une Actualité dont l'équipe de communication a confirmé qu'elle est prête ; tant qu'elle ne l'est pas, c'est un Brouillon.
_Avoid_ : publiée, approuvée

**Date de publication** (code : `datePublication`) :
Le premier jour où une Actualité validée apparaît sur le site.
_Avoid_ : date de mise en ligne

**Fin d'affichage** (code : `finAffichage`) :
Le dernier jour où une Actualité apparaît sur le site ; vide, elle reste affichée sans limite.
_Avoid_ : date d'expiration, date de fin

**Mise en avant** (code : `miseEnAvant`) :
Une Actualité épinglée en tête de l'accueil, avant les autres.
_Avoid_ : à la une, épinglée, prioritaire

**Statut** (code : `statut`) :
L'état d'une Actualité vu par l'équipe de communication : Brouillon, Programmé, En ligne ou Archivé. Il n'est qu'indicatif ; c'est le site qui décide de ce qui est visible.

**Brouillon** : Actualité non validée, ou sans Date de publication.
**Programmé** : Actualité validée dont la Date de publication est future.
**En ligne** : Actualité validée, dans sa période d'affichage.
**Archivé** : Actualité validée dont la Fin d'affichage est passée.
_Avoid_ : Programmée, Archivée (Airtable affiche le masculin)

**Mise à jour du site** (code : `rebuild`) :
La reconstruction du site à partir d'Airtable : automatique chaque nuit, ou demandée par l'équipe de communication depuis l'Espace communication. C'est seulement à ce moment qu'une Actualité devient En ligne.
_Avoid_ : publier, synchroniser, rafraîchir

## Lettre d'information

**Lettre d'information** :
Le message périodique que la paroisse envoie par e-mail à ses inscrits.
_Avoid_ : newsletter, liste de diffusion, mailing

**Inscription** :
La demande d'une personne de recevoir la Lettre d'information, faite auprès de la paroisse (par e-mail ou sur le formulaire papier), jamais sur le site.
_Avoid_ : abonnement, souscription

## Personnes

**Curé** :
Le prêtre en charge de la paroisse ; c'est la seule personne dont la photo peut apparaître sur le site, avec son accord écrit.
_Avoid_ : prêtre, abbé (ce sont des titres, pas la fonction)

**Équipe de communication** :
Les personnes qui rédigent et valident les Actualités depuis l'Espace communication, sans toucher au code.
_Avoid_ : admin, éditeur, rédacteur

**Secrétaire** :
La personne qui envoie la Lettre d'information depuis l'outil d'envoi de la paroisse ; elle n'a accès ni au site, ni à l'Espace communication.
_Avoid_ : secrétariat, équipe de communication

**Espace communication** :
L'interface Airtable où l'équipe de communication gère les Actualités.
_Avoid_ : back-office, CMS, admin

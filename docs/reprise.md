# Reprise du site

Ce document s'adresse à la personne qui reprend le site de la paroisse Saint-Géraud des Vallées en Fumélois si le mainteneur actuel ne peut plus s'en occuper. Il dit qui possède quoi, où vivent les secrets, comment relancer et régénérer chaque pièce, et quelles tâches revenir faire chaque année.

Aucune valeur de secret ni aucune coordonnée personnelle n'est écrite ici : le dépôt est public. Les mentions **« à compléter »** sont à remplir par le mainteneur, avec des rôles ou des adresses génériques de la paroisse, jamais un mot de passe ni un token.

Pour comprendre le site avant d'y toucher : `CLAUDE.md`, `GLOSSARY.md`, les ADR de `docs/adr/` (0002 pour la Mise à jour du site, 0003 pour l'absence de toute donnée collectée) et `docs/context/schema-airtable.md`.

## En bref

- Le site est **statique** : toutes les pages sont construites à partir d'Airtable, puis servies par Vercel. Il n'a ni formulaire, ni compte, ni base de données (ADR 0003).
- Il se reconstruit **chaque nuit** (Vercel Cron, 23 h 15 UTC) et **à la demande** depuis le bouton « Mettre à jour le site maintenant » de l'Espace communication (ADR 0002). C'est la Mise à jour du site.
- Si Airtable ne répond pas, ou si un champ attendu a disparu ou changé de type, le build échoue et **Vercel laisse en ligne le site précédent**. Le site ne tombe pas ; il cesse seulement de se mettre à jour.
- Tous les coûts sont nuls : plans gratuits de GitHub, Vercel (Hobby) et Airtable. Aucun service payant n'est autorisé.

## Comptes et propriétaires

| Service | Ce qu'il porte | Propriétaire | Autres accès |
|---|---|---|---|
| GitHub | Dépôt public `daemonshift/saint-geraud` : code, textes des Pages fixes, issues, CI | Compte `daemonshift` (mainteneur) — **à compléter** : second administrateur | **À compléter** |
| Vercel (plan Hobby) | Projet relié au dépôt : builds, hébergement, Vercel Cron, Deploy Hook, variables d'environnement, Web Analytics | **À compléter** : compte Vercel qui possède le projet | **À compléter** |
| Airtable (plan gratuit) | Espace de travail `wspG3x87J8N0H9vj7`, base `Paroisse Saint-Géraud` (`appFZ9EorUC2DY3yh`), interface « Espace communication » | **À compléter** : propriétaire de l'espace de travail | Adresse e-mail de la paroisse : second propriétaire de l'espace de travail. Un membre de l'équipe de communication : Éditeur de la base (**à compléter** : rôle de la personne) |
| Domaine | Adresse publique du site | Aujourd'hui l'adresse `vercel.app` du projet (**à compléter**), gérée par Vercel | Sous-domaine du diocèse d'Agen visé : **en attente du diocèse** (registrar, DNS et propriétaire à compléter) |
| Outil d'envoi de la Lettre d'information | Envoi par la Secrétaire, hors du site | La paroisse (**à compléter** : outil ou messagerie utilisé) | La Secrétaire uniquement |

Règles à garder :

- **Toujours deux propriétaires** sur Airtable (déjà le cas avec l'adresse de la paroisse) ; viser la même chose sur GitHub et Vercel. Un compte personnel seul est un point de rupture.
- L'équipe de communication est **Éditeur** de la base, pas Créateur ni Propriétaire : elle modifie les enregistrements, pas la structure des tables (un champ supprimé ou changé de type fait échouer le build).
- La Secrétaire n'a accès ni au site, ni à l'Espace communication.

## Secrets

Tous les secrets vivent **uniquement dans Vercel** : Project Settings → Environment Variables, environnement **Production**. Aucun n'est dans le dépôt, aucun n'est dans GitHub (la CI construit le site avec les données d'exemple, sans token). Aucun ne porte le préfixe `PUBLIC_` : ils ne sont lus que côté serveur, au build ou à l'exécution de la route de mise à jour.

| Variable | Rôle | Lue par | Comment la produire |
|---|---|---|---|
| `AIRTABLE_TOKEN` | Lecture d'Airtable au build | `src/lib/contenu/site.ts` | Token personnel Airtable en lecture seule, voir « Régénérer le token Airtable » |
| `DEPLOY_HOOK_URL` | URL qui lance une reconstruction du site | `src/lib/mise-a-jour.ts` | Vercel → Project Settings → Git → Deploy Hooks, sur la branche `main` |
| `CRON_SECRET` | Authentifie le Vercel Cron (Vercel l'envoie dans `Authorization: Bearer …`) | `src/lib/mise-a-jour.ts` | Valeur aléatoire, par exemple `openssl rand -hex 32` |
| `CLE_MISE_A_JOUR` | Clé de l'URL du bouton de l'Espace communication | `src/lib/mise-a-jour.ts` | Valeur aléatoire, par exemple `openssl rand -hex 24` |

À savoir :

- **Sans `AIRTABLE_TOKEN`**, un build de production échoue volontairement (le site en ligne n'affiche jamais de données d'exemple). Les builds de prévisualisation, la CI et le poste local utilisent les données d'exemple de `src/lib/contenu/donnees-exemple.ts`.
- **Sans `CRON_SECRET`**, le Cron de la nuit est refusé ; **sans `CLE_MISE_A_JOUR`**, le bouton est refusé ; sans les deux, la route refuse tout. **Sans `DEPLOY_HOOK_URL`**, la route répond « Mise à jour impossible ».
- Une variable modifiée dans Vercel ne s'applique qu'au **déploiement suivant** : relancer un build après chaque changement.
- **Exception assumée** (ADR 0002) : la clé `CLE_MISE_A_JOUR` figure aussi dans la formule du champ Bouton d'Airtable, donc elle est visible par les collaborateurs de la base. Elle ne donne accès à aucune donnée et ne permet que de lancer une Mise à jour du site.
- En local, un token peut être placé dans un fichier `.env` (ignoré par git). Ne jamais le committer.

### Détection des fuites

- `.gitignore` exclut `.env` et `.env.*`.
- `.githooks/pre-commit` lance gitleaks sur les fichiers indexés. Il est activé par `npm install` (script `prepare`) ; sans gitleaks installé (`brew install gitleaks`), il prévient et laisse passer.
- La CI (`.github/workflows/ci.yml`, job « Secrets (gitleaks) ») analyse tout l'historique à chaque push et à chaque pull request.
- La push protection de GitHub (Settings → Code security) bloque les secrets reconnus au moment du push : vérifier qu'elle est activée.

Si un secret a fuité : le régénérer immédiatement (procédures ci-dessous), puis le considérer comme compromis même après suppression du commit, car l'historique d'un dépôt public a pu être copié.

## Procédures

### Relancer un build (Mise à jour du site)

Au choix, du plus simple au plus technique :

1. **Bouton de l'Espace communication** « Mettre à jour le site maintenant » : la page « La mise à jour est lancée, le site sera à jour dans quelques minutes. » s'affiche.
2. **Vercel** → Deployments → dernier déploiement de production → menu « … » → Redeploy.
3. **Pousser un commit sur `main`** : Vercel reconstruit la production.
4. **Appeler le Deploy Hook** depuis un terminal, en lisant l'URL dans Vercel sans la copier ailleurs : `curl -X POST "$DEPLOY_HOOK_URL"`.

Suivre le build dans Vercel → Deployments. Si le build échoue, lire les Build Logs :

- « le champ « X » (fld…) de la table « T » est absent » ou « est de type … au lieu de … » : quelqu'un a modifié la structure d'une table. Rétablir le champ dans Airtable, ou adapter le mapping `src/lib/airtable/schema.ts` et `docs/context/schema-airtable.md`.
- `AIRTABLE_TOKEN est absent` : la variable manque en Production.
- « Airtable a répondu 401 » ou « 403 » : token expiré ou révoqué, ou son propriétaire a perdu l'accès à la base. Le régénérer.

Réponses de la route `/api/mise-a-jour` (logs de la fonction dans Vercel → Logs) :

- 200 : Deploy Hook appelé une fois, page de confirmation ;
- 401 : clé ou `CRON_SECRET` invalide, rien n'est lancé ;
- 500 : `DEPLOY_HOOK_URL` absent ; 502 : le Deploy Hook a refusé ou est injoignable. Le site reste en ligne tel quel.

Le Vercel Cron est déclaré dans `vercel.json` (`15 23 * * *`, soit 00 h 15 à Paris en hiver et 01 h 15 en été). Sur le plan Hobby, Vercel peut le déclencher à n'importe quel moment de cette heure-là. Le Cron ne s'exécute que sur le déploiement de production ; il est visible dans Vercel → Project Settings → Cron Jobs.

### Mettre en service le bouton de l'Espace communication

À faire une fois, puis à chaque changement de clé ou de domaine.

1. Dans la table Actualités, créer un champ **Bouton** nommé « Mettre à jour le site maintenant », action **Ouvrir une URL**, formule : `"https://<domaine du site>/api/mise-a-jour?cle=<valeur de CLE_MISE_A_JOUR>"`.
2. L'ajouter à l'interface « Espace communication » (page Actualités, ou fiche Actualité Détail).
3. Cliquer une fois : la page de confirmation doit s'afficher et un déploiement apparaître dans Vercel.

### Régénérer la clé de mise à jour

1. Produire une nouvelle valeur (`openssl rand -hex 24`).
2. Vercel → Project Settings → Environment Variables → `CLE_MISE_A_JOUR` → remplacer la valeur (Production).
3. Relancer un build (Vercel → Redeploy) : la nouvelle clé n'est prise en compte qu'au déploiement suivant.
4. Dans Airtable, mettre à jour la formule du champ Bouton avec la nouvelle clé, puis cliquer une fois pour vérifier.

L'ancienne URL est refusée (401) dès que le nouveau déploiement est en ligne.

### Régénérer le Deploy Hook

1. Vercel → Project Settings → Git → Deploy Hooks : supprimer l'ancien hook (il cesse aussitôt de fonctionner), puis en créer un nouveau sur la branche `main`.
2. Remplacer la valeur de `DEPLOY_HOOK_URL` (Production).
3. Relancer un build depuis Vercel (Redeploy), puis tester le bouton de l'Espace communication.

### Régénérer `CRON_SECRET`

1. Nouvelle valeur (`openssl rand -hex 32`) dans `CRON_SECRET` (Production).
2. Relancer un build. Vercel envoie automatiquement la nouvelle valeur au Cron : rien d'autre à changer.

### Régénérer le token Airtable

Le token est **personnel** : il appartient au compte Airtable qui l'a créé et cesse de fonctionner si ce compte perd l'accès à la base. Un repreneur crée donc le sien.

1. Airtable → Builder Hub → Personal access tokens → Create token.
2. Nom : « Site paroisse – lecture au build ». Scopes : **`data.records:read`** et **`schema.bases:read`** uniquement. Accès : la seule base `Paroisse Saint-Géraud`.
3. Copier le token directement dans Vercel, variable `AIRTABLE_TOKEN` (Production). Ne le coller nulle part ailleurs.
4. Relancer un build et vérifier qu'il réussit.
5. Révoquer l'ancien token dans Airtable.

### Transférer le projet Vercel

1. Le nouveau propriétaire crée son compte Vercel (plan Hobby, gratuit) et installe l'application GitHub de Vercel avec accès au dépôt.
2. Vercel → Project Settings → General → Transfer Project, vers le compte ou l'équipe du repreneur.
3. Après le transfert, vérifier :
   - les quatre variables d'environnement en Production ;
   - Project Settings → Git : le dépôt relié et la branche de production `main` ;
   - Project Settings → Cron Jobs : le Cron de la Mise à jour du site ;
   - les domaines du projet ;
   - Web Analytics activé (pas Speed Insights).
4. Régénérer le Deploy Hook (procédure ci-dessus) : c'est le seul moyen de savoir quel hook est valide.
5. Relancer un build et tester le bouton de l'Espace communication.

Si l'adresse `vercel.app` change, mettre à jour la formule du champ Bouton.

### Transférer le dépôt GitHub

1. GitHub → Settings du dépôt → General → Danger Zone → Transfer ownership, vers le compte ou l'organisation du repreneur.
2. Vérifier que l'application GitHub de Vercel a accès au dépôt sous son nouveau propriétaire, sinon le relier de nouveau dans Vercel → Project Settings → Git.
3. Vérifier que la CI tourne (onglet Actions) et que la push protection est activée.
4. Mettre à jour le nom du dépôt dans `CLAUDE.md`, `docs/agents/issue-tracker.md` et ce document.

### Travailler sur le code

```sh
npm ci                  # installe et active le hook gitleaks
npm run dev             # serveur local, avec les données d'exemple sans token
npm run check           # types et couleurs hors tokens
npm test                # tests unitaires (Vitest)
npm run build           # site construit dans dist/client
npm run check:domaines  # domaines tiers autorisés
npm run test:e2e        # Playwright et axe sur le site construit
```

Node 22.18 ou plus récent est nécessaire (voir `package.json`). La CI rejoue ces contrôles à chaque push.

## Tâches périodiques

| Quand | Tâche | Qui |
|---|---|---|
| Chaque année (par exemple en janvier) | Purger les Actualités Archivées depuis plus de 12 mois | Équipe de communication ou mainteneur |
| Chaque année, avant l'échéance | Vérifier le renouvellement du domaine | Mainteneur |
| Chaque année | Vérifier les propriétaires des comptes et l'accès aux secrets (tableau ci-dessus) ; mettre ce document à jour | Mainteneur |
| À chaque nouveau Curé | Recueillir son accord écrit avant d'ajouter sa photo | Équipe de communication |

### Purge des Actualités Archivées

Le plan gratuit d'Airtable limite le nombre d'enregistrements et la taille des pièces jointes par base (limites à vérifier sur la page des tarifs d'Airtable, elles changent). La purge garde la base sous ces limites.

1. Espace communication → page Actualités → onglet **« À supprimer »** (Actualités Archivées dont la Fin d'affichage date de plus de 365 jours).
2. Relire la liste, sélectionner les enregistrements et les supprimer.

Effet sur le site, à la Mise à jour du site suivante : l'adresse d'une Actualité supprimée ne redirige plus vers `/actualites/terminee` et donne la page 404, qui ne nomme jamais l'Actualité. C'est le comportement prévu.

### Renouvellement du domaine

- Tant que le site est servi sur l'adresse `vercel.app`, il n'y a rien à renouveler.
- Avec le sous-domaine du diocèse (**en attente du diocèse**), le domaine parent est renouvelé par le diocèse : vérifier chaque année auprès de lui que le domaine et l'enregistrement DNS qui pointe vers Vercel sont toujours en place. Le certificat HTTPS est renouvelé automatiquement par Vercel.
- Si un domaine propre est un jour acheté : **à compléter** (registrar, compte, date d'échéance, renouvellement automatique activé ou non).

## Photo du Curé : accord écrit

Le Curé est la seule personne dont la photo peut apparaître sur le site (section `#cure` de La paroisse). Une photo de personne est une donnée personnelle : elle ne s'ajoute qu'avec son **accord écrit**, recueilli à chaque nouveau Curé, avant toute mise en ligne.

1. Faire signer au Curé un accord daté qui précise : la photo concernée, sa diffusion sur le site de la paroisse, et la possibilité de retirer son accord à tout moment en le demandant à la paroisse.
2. Conserver l'accord signé au presbytère (**à compléter** : lieu de classement), jamais dans Airtable ni dans le dépôt.
3. Seulement ensuite : dans l'Espace communication, page Infos pratiques, ajouter l'image sur l'Info pratique de Rubrique « Curé », avec son texte alternatif (sans texte alternatif, l'image est ignorée). Toute image placée sur une autre Rubrique est ignorée par le build.
4. Lancer une Mise à jour du site.

Quand un Curé quitte la paroisse ou retire son accord : supprimer l'image de l'Info pratique, mettre à jour son nom et ses fonctions, puis lancer une Mise à jour du site. Les anciens déploiements Vercel gardent leurs fichiers : en cas de retrait d'accord, supprimer aussi les déploiements antérieurs dans Vercel → Deployments.

## Lettre d'information : toujours en copie cachée (Cci)

La Secrétaire envoie la Lettre d'information depuis l'outil d'envoi de la paroisse. **Les adresses des inscrits sont toujours mises en copie cachée (Cci), jamais en « À » ni en « Cc ».** Être inscrit auprès d'une paroisse révèle une conviction religieuse, donnée sensible (article 9 du RGPD) : une adresse visible des autres destinataires est une fuite de données.

À transmettre à chaque nouvelle Secrétaire. Le site ne gère aucune Inscription (ADR 0003) : elles arrivent à la paroisse par e-mail ou sur le formulaire papier.

## Contacts au diocèse d'Agen

Écrire des fonctions et des adresses génériques, pas des coordonnées personnelles.

| Sujet | Contact |
|---|---|
| Éditeur et directeur de publication (mentions légales) | **À compléter** |
| Responsable de traitement (page Confidentialité) | **À compléter** |
| Sous-domaine du diocèse et DNS | **À compléter** |
| Horaires des messes sur messes.info | **À compléter** |
| Adresse du site du diocèse (`src/lib/contenu-provisoire.ts`, à confirmer) | **À compléter** |

## Points en attente

- Textes de Prier et célébrer (`src/content/prier-et-celebrer/*.md`, une carte par fichier) et verset de la page (`src/pages/prier-et-celebrer.astro`) : rédigés pour le lancement, à faire valider par la paroisse (délais, modalités de la confession). S'il n'y a pas de temps d'adoration, supprimer `adoration.md`. Pour donner un contact propre à la confession ou à l'adoration, créer l'Info pratique (Rubrique Contacts, Libellé « Confession » ou « Adoration ») ; sinon la carte renvoie au presbytère, parce que leur fichier déclare `contactParDefaut: presbytere`. Les autres cartes (Baptême, Mariage, Obsèques) n'ont pas de repli : si leur Info pratique est renommée, désactivée ou supprimée, la Mise à jour du site échoue avec un message qui nomme le Libellé attendu et les Libellés disponibles ; rétablir le Libellé dans l'Espace communication ou corriger le champ `contact:` du fichier (voir `docs/context/schema-airtable.md`, conventions de contenu).
- Éditeur, directeur de publication et responsable de traitement : à reporter dans `src/content/pages-legales/mentions-legales.md` et `confidentialite.md` dès la réponse du diocèse.
- Sous-domaine du diocèse : l'ajouter dans Vercel → Project Settings → Domains, faire créer l'enregistrement DNS indiqué par Vercel, puis mettre à jour la formule du champ Bouton.

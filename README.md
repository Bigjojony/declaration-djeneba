# Pour toi 🌻 — Déclaration + récolte des réponses

Site Astro déployé sur **Vercel**, avec une **fonction Node** qui enregistre la
réponse de Djéneba dans **Upstash Redis**. Les réponses se consultent sur une
**page secrète** (`/r/<clé>`) : une ligne par personne.

## Structure

```
ma déclaration/
├─ public/
│  ├─ fond.jpg            ← image de fond
│  ├─ musique.mp3         (optionnel)
│  └─ cupidon1/2/3.jpg    (optionnel)
├─ src/
│  ├─ lib/redis.ts              client Upstash partagé + ADMIN_KEY
│  └─ pages/
│     ├─ index.astro            la déclaration (envoie la réponse)
│     ├─ r/[key].astro          page secrète qui liste les réponses (SSR)
│     └─ api/reponse.ts         POST → enregistre une réponse
├─ astro.config.mjs
├─ package.json
└─ .env.example
```

## 1. En local

```bash
npm install
cp .env.example .env        # renseigne les valeurs (voir étapes 2 et 3)
npm run dev                 # http://localhost:4321
```

## 2. Base de données (Upstash Redis)

1. Va sur [Vercel Marketplace → Upstash for Redis](https://vercel.com/marketplace/upstash/upstash-kv)
   et connecte la base à ton projet Vercel. Les variables
   `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` sont injectées
   automatiquement.
2. Pour tester en local, copie ces deux valeurs dans ton fichier `.env`
   (ou lance `vercel env pull`).

## 3. Clé secrète de la page réponses

Génère une longue chaîne aléatoire :

```bash
openssl rand -hex 24
```

Mets-la dans la variable `ADMIN_KEY`. La page des réponses sera accessible à :

```
https://<ton-site>.vercel.app/r/<ADMIN_KEY>
```

> ⚠️ Garde cette clé secrète : quiconque a l'URL peut voir les réponses.
> Les identifiants Redis, eux, restent côté serveur (jamais exposés au navigateur).

## 4. Déploiement Vercel (drag & drop)

Un zip prêt à déposer est fourni : **`declaration-deploy.zip`** (sur le Bureau,
431 Ko — sans `node_modules`).

1. Va sur https://vercel.com/drop
2. Glisse **`declaration-deploy.zip`** (ou le dossier `ma déclaration`).
3. Choisis l'équipe et un nom de projet, puis **Deploy**.
4. Vercel détecte Astro, build et publie.

> Ne dépose PAS le dossier tel quel s'il contient `node_modules` (lourd) :
> utilise le `.zip` fourni, ou supprime `node_modules` avant.

Alternative CLI :

```bash
npm i -g vercel
vercel            # première fois : lie le projet
vercel --prod     # déploiement en production
```

Variables d'environnement à définir dans **Project → Settings → Environment
Variables** :

| Nom | Rôle |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | fournie par l'intégration Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | fournie par l'intégration Upstash |
| `ADMIN_KEY` | clé secrète pour `/r/<clé>` |

> **Ordre important avec le drag & drop** : le premier dépôt crée le projet
> sans variables. Ensuite seulement, connecte Upstash et ajoute `ADMIN_KEY`
> dans les réglages, puis **redéploie** (re-dépose le `.zip` **sur le projet**
> dans le dashboard → Deployments). Sans ça, `/r/<clé>` affiche une erreur.

## 5. Voir les réponses

- Ouvre `https://<ton-site>.vercel.app/r/<ADMIN_KEY>`
- Tu vois : réponse (Oui / Non / Peut-être), date, historique des clics,
  appareil et IP — **une ligne par personne** (par navigateur).
- Le bouton **Rafraîchir** recharge la liste.

## Notes

- Une personne = un `sessionId` stocké dans le navigateur de Djéneba
  (`localStorage`). Chaque clic met à jour sa ligne. Si elle vide son stockage
  ou change d'appareil, une nouvelle ligne apparaît.
- La réponse est aussi stockée localement dans son navigateur
  (`localStorage`, `window.resultat`, input caché) — utile pour du debug.
- Les images `cupidon*.jpg` et `musique.mp3` sont optionnelles : si absentes,
  la page affiche le nom du fichier manquant à la place de l'image.
- L'ancien fichier `declaration-2.html` reste dans le dossier comme version
  statique de secours ; la version active est `src/pages/index.astro`.

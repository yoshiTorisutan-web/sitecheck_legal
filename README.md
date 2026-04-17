# SiteCheck Legal

🔎 MVP local sans dependances pour auditer rapidement les signaux legaux visibles d'un site francais.

## ✨ Ce que contient le projet

- 🖥️ une landing page orientee produit
- ⚡ une API locale `POST /api/scan`
- 🧠 un moteur d'audit heuristique de premier niveau
- 📊 un rapport structure par categories
- 🧪 deux demos locales pour comparer un site faible et un site mieux cadre

## 🚀 Lancer le projet

```bash
npm start
```

Puis ouvrir :

```text
http://localhost:3000
```

## 🧭 Demos locales

- ❌ demo risquee : `http://localhost:3000/demo/non-conforme`
- ✅ demo mieux cadree : `http://localhost:3000/demo/mieux-cadre`

## 🛠️ Ce que regarde le scan

- 📄 mentions legales
- 🔐 confidentialite et signaux RGPD
- 🍪 cookies et traceurs visibles
- 🛒 CGV / CGU pour les parcours commerciaux
- 🔁 resiliation si logique d'abonnement
- ♿ accessibilite visible
- 🛡️ quelques signaux de securite technique

## 📁 Structure rapide

- `server.js` : serveur HTTP + logique de scan
- `public/index.html` : landing et structure du rapport
- `public/styles.css` : design et responsive
- `public/app.js` : interactions front et rendu du rapport
- `public/favicon.svg` : favicon du projet

## ⚠️ Limites du MVP

- 🧾 ce n'est pas un avis juridique
- 🌐 le moteur lit surtout les signaux publics d'une page et certains liens detectables
- 🧩 le champ reel d'obligations depend du type d'activite, des clients vises et de la taille de l'entreprise
- 🪪 un site peut paraitre propre visuellement et rester incomplet juridiquement

## 💡 Bon usage

Utilise ce MVP comme :

- un pre-audit avant livraison d'un site
- un aimant a leads pour agence ou freelance
- un point d'entree avant accompagnement juridique ou RGPD

## 📌 Suite logique

- 📄 export PDF du rapport
- 🕘 historique des scans
- 👤 comptes utilisateurs
- 💳 version SaaS avec paiement

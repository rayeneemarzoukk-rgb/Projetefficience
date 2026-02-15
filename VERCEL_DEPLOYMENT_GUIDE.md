# 🚀 Guide Déploiement Vercel - Efficience Analytics

**Date:** 15 Février 2026  
**Plateforme:** Vercel (Next.js Frontend)  
**Backend:** Flask reste en local (développement)

---

## 📋 Checklist Pré-déploiement

- [ ] Compte Vercel créé (https://vercel.com)
- [ ] GitHub connecté à Vercel
- [ ] Repository GitHub prêt (`rayeneemarzoukk-rgb/Projetefficience`)
- [ ] Fichier `vercel.json` créé ✅
- [ ] Variables d'environnement préparées

---

## 🔧 Étape 1: Préparer le Repository GitHub

### 1.1 Vérifier le `.gitignore`

Assurez-vous que `.gitignore` contient :

```
# Environment variables (JAMAIS committer)
.env
.env.local
.env.*.local

# Build output
.next/
dist/
build/

# Dependencies
node_modules/

# Logs
npm-debug.log
yarn-debug.log

# Flask
__pycache__/
*.pyc
venv/
```

### 1.2 Committer le `vercel.json`

```bash
git add vercel.json
git commit -m "feat: add vercel deployment configuration"
git push origin main
```

---

## ⚙️ Étape 2: Créer le Projet sur Vercel

### 2.1 Connecter votre GitHub

1. Allez sur https://vercel.com
2. Cliquez **"New Project"**
3. Sélectionnez **"Import Git Repository"**
4. Cherchez `rayeneemarzoukk-rgb/Projetefficience`
5. Cliquez **"Import"**

### 2.2 Configuration du Projet

**Settings → Build & Development Settings:**
- **Framework:** Next.js (détecté automatiquement)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅

---

## 🔐 Étape 3: Ajouter les Variables d'Environnement

### 3.1 Dashboard Vercel → Settings → Environment Variables

**Ajoutez chaque variable :**

```
MONGODB_URI = mongodb+srv://rayan_dev2:weshwesh123AA@efficienceprojet.s1rcmkw.mongodb.net/rayan_dev2?retryWrites=true&w=majority&appName=efficienceprojet

JWT_SECRET = efficience-jwt-secret-key-2026-production-secure-rayan-dev2

GEMINI_API_KEY = AIzaSyCIN0eILsWgKD2erct_jaAqE5YkdTPShT4

OPENAI_API_KEY = (laisser vide ou remplir si disponible)

EMAIL_HOST = smtp.gmail.com

EMAIL_PORT = 587

EMAIL_USER = maarzoukrayan3@gmail.com

EMAIL_PASS = mybs rcgn yxfd nszk

N8N_WEBHOOK_TOKEN = efficience-webhook-secure-token-2026

NODE_ENV = production
```

**Important:** Chaque variable doit être sur **PRODUCTION** → Scope

---

## 🚀 Étape 4: Déployer

### 4.1 Déclencher le déploiement

**2 options :**

**Option A: Automatique (recommandé)**
```bash
# Tout commit sur 'main' déclenche auto-déploiement
git push origin main
```

**Option B: Manuel (Vercel Dashboard)**
1. Allez dans votre projet Vercel
2. Cliquez **"Deployments"**
3. Cliquez **"Redeploy"** sur le dernier commit

### 4.2 Surveiller le build

```
✓ Analyzing source code
✓ Installing dependencies (npm install)
✓ Running build command (npm run build)
✓ Finalizing deployment
```

⏱️ **Durée estimée:** 3-5 minutes

---

## ✅ Étape 5: Vérifier le Déploiement

### 5.1 URL du site

Votre site est maintenant disponible sur :
```
https://votre-projet-efficience.vercel.app
```

### 5.2 Tests basiques

```bash
# Vérifier page d'accueil
curl https://votre-projet-efficience.vercel.app

# Tester API auth (devrait appeler MongoDB)
curl https://votre-projet-efficience.vercel.app/api/auth/check
```

---

## ⚠️ FAQs & Troubleshooting

### Q: MongoDB ne se connecte pas
**R:** Vérifier que l'IP Vercel est whitelistée dans MongoDB Atlas
1. MongoDB Atlas Dashboard
2. Network Access
3. Ajouter `0.0.0.0/0` (Vercel accède depuis anywhere) **OU** ajouter les IPs Vercel manuellement

### Q: Variables d'env non chargées
**R:** Vérifier que les variables sont en **Production** scope dans Vercel Settings

### Q: Build échoue
**R:** Vérifier logs dans `Deployments` → Click le build → "Build Logs"

### Q: Le site affiche une erreur 500
**R:** C'est normal au premier déploiement. Vérifier :
1. MongoDB est accessible
2. Toutes les variables d'env sont présentes
3. Pas d'erreur TypeScript

---

## 🔄 Workflow Continu

### Push local → Déploiement automatique

```bash
# 1. Faire des changements locaux
code app.tsx

# 2. Committer
git add .
git commit -m "feat: amélioration du dashboard"

# 3. Pousser
git push origin main

# 4. Vercel déploie automatiquement en 3-5 min ✅
# 5. Consulter https://votre-projet-efficience.vercel.app
```

---

## 📊 Environnement Vercel vs Local

| Élément | Local | Vercel |
|--------|-------|--------|
| Next.js | npm run dev (port 3000) | Vercel CDN |
| Flask | python app.py (port 5001) | ❌ Non supporté |
| MongoDB | Atlas (accessible) | Atlas (accessible) |
| Environment | .env.local | Vercel Settings |

**🔴 Important:** Flask ne fonctionne **PAS** sur Vercel. Pour le chatbot et PDF:
- Garder Flask en local pour **développement**
- En production, migrer Flask vers **Heroku** ou **Railway** si nécessaire

---

## 📞 Support Vercel

- Documentation: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Status: https://vercel.com/status

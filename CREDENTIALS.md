# 🔐 Efficience Analytics - Coordonnées des Comptes

Ce document contient les identifiants de connexion pour tous les comptes de la plateforme Efficience Analytics.

---

## 📌 Administrateurs

### 1. Rayan (Compte Principal)
- **Email:** `maarzoukrayan3@gmail.com`
- **Mot de passe:** `maarzoukrayan3@gmail`
- **Rôle:** Administrateur (Design personnalisé)
- **Code praticien:** ADMIN

### 2. Mr Robert
- **Email:** `mrrobert@efficience.fr`
- **Mot de passe:** `mrrobert.efficience`
- **Rôle:** Administrateur
- **Code praticien:** ADMIN

### 3. Younis
- **Email:** `younis@efficience.fr`
- **Mot de passe:** `younis@efficience`
- **Rôle:** Administrateur
- **Code praticien:** ADMIN
- **Remarque:** Compte créé via seedData.js

### 4. Admin Principal (Efficience Analytics)
- **Email:** `admin@efficience-analytics.fr`
- **Mot de passe:** `Admin2024!Efficience`
- **Rôle:** Administrateur
- **Code praticien:** ADMIN

---

## 👨‍⚕️ Praticiens

### 1. Dr. Eric Robert (ER)
- **Email:** `er@efficience.local`
- **Mot de passe:** `er@efficience`
- **Rôle:** Praticien
- **Code praticien:** ER
- **Cabinet:** Cabinet Dentaire

### 2. Dr. Jean-Claude (JC)
- **Email:** `jc@efficience.local`
- **Mot de passe:** `jc@efficience`
- **Rôle:** Praticien
- **Code praticien:** JC
- **Cabinet:** Cabinet JC

### 3. Dr. David Vernet (DV)
- **Email:** `dv@efficience.fr`
- **Mot de passe:** `dv@efficience`
- **Rôle:** Praticien
- **Code praticien:** DV
- **Cabinet:** Cabinet DV
- **Remarque:** Compte créé via seedData.js

---

## ⚙️ Code Mode Dynamique (IA)

Le code administrateur pour activer/désactiver le mode dynamique IA est stocké de manière sécurisée (hashé en bcrypt) dans `.env` sous `ADMIN_AI_CODE`.

**Valeur actuelle:** `262626`

Ce code permet d'activer ou désactiver les fonctionnalités IA et le mode dynamique depuis la page Réglages.

---

## 🔧 Variables d'environnement (Backend)

Fichier: `backend/.env`

| Clé | Description |
|-----|-------------|
| `MONGODB_URI` | Connexion MongoDB Atlas |
| `JWT_SECRET` | Clé secrète JWT |
| `EMAIL_USER` | `maarzoukrayan3@gmail.com` |
| `EMAIL_PASS` | Mot de passe d'application Gmail |
| `ADMIN_EMAIL` | `younis@efficience.fr` |
| `ADMIN_AI_CODE` | Code admin hashé bcrypt |

---

## 📧 Service Email

- **SMTP:** smtp.gmail.com:587
- **Compte:** maarzoukrayan3@gmail.com
- **App Password:** lbzc pxif xzry vuow

---

## 🌐 URLs de Production

- **Render:** https://efficience-analytics.onrender.com
- **Hostinger:** À configurer

---

*Document mis à jour le 20 janvier 2025*

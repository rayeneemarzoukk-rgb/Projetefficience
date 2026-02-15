# 📧 Configuration de l'envoi d'emails avec Gmail

## Étapes pour configurer Gmail SMTP

### 1. Activer l'authentification à deux facteurs (2FA)

1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Cliquez sur **Sécurité**
3. Activez **Validation en deux étapes**

### 2. Créer un mot de passe d'application

1. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sélectionnez **Application** : "Autre (nom personnalisé)"
3. Entrez : "Efficience Dentaire"
4. Cliquez sur **Générer**
5. **Copiez le mot de passe à 16 caractères**

### 3. Configurer le fichier `.env.local`

Modifiez votre fichier `.env.local` :

```env
EMAIL_USER=maarzoukrayan3@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx    # Collez le mot de passe d'application (16 caractères)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### 4. Redémarrer le serveur Next.js

```bash
npm run dev
```

## Test de l'envoi d'email

1. Allez sur `http://localhost:3000/register`
2. Remplissez le formulaire
3. Cliquez sur **Inscription**
4. Vous recevrez un email avec un code à 6 chiffres
5. Entrez le code sur la page de vérification

## Format de l'email envoyé

```
De: Efficience Dentaire <maarzoukrayan3@gmail.com>
À: email.du.destinataire@example.com
Sujet: 🔐 Code de vérification - Efficience Dentaire

Bonjour [Nom] 👋

Bienvenue sur Efficience Dentaire ! Pour finaliser votre inscription, 
veuillez utiliser le code de vérification ci-dessous :

┌─────────────────┐
│   123456        │  ← Code à 6 chiffres
└─────────────────┘

Ce code est valide pendant 15 minutes.

⚠️ Important : Si vous n'avez pas demandé cette inscription, 
ignorez cet email.
```

## Dépannage

### ❌ Erreur "Invalid login"
→ Vérifiez que vous avez bien utilisé un **mot de passe d'application**, pas votre mot de passe Gmail normal

### ❌ Erreur "Less secure app access"
→ Gmail n'utilise plus cette option. Utilisez obligatoirement les **mots de passe d'application**

### ❌ Email non reçu
→ Vérifiez vos **spams/courrier indésirable**
→ Vérifiez que `EMAIL_USER` et `EMAIL_PASSWORD` sont corrects dans `.env.local`

### ✅ Test rapide de la configuration email

Créez un fichier `test-email.js` :

```javascript
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // S'envoyer à soi-même
  subject: 'Test Email - Efficience Dentaire',
  text: 'Si vous recevez cet email, la configuration fonctionne ! ✅',
}, (error, info) => {
  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Email envoyé:', info.response);
  }
});
```

Exécutez : `node test-email.js`

## Alternatives à Gmail

Si vous préférez utiliser un autre service :

### **SendGrid** (Gratuit jusqu'à 100 emails/jour)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=votre_api_key_sendgrid
```

### **Brevo (ex-Sendinblue)** (Gratuit jusqu'à 300 emails/jour)
```env
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=votre_email_brevo
EMAIL_PASSWORD=votre_smtp_key_brevo
```

### **Mailtrap** (Pour les tests uniquement)
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=votre_username_mailtrap
EMAIL_PASSWORD=votre_password_mailtrap
```

---

**Configuration terminée !** 🎉

Maintenant, lorsque vous vous inscrivez, vous recevrez un code de vérification par email.

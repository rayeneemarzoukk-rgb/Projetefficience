# ⚡ QUICK START: 2 Minutes

## 🚀 Démarrer le système (Step by Step)

### Step 1️⃣: Lancer le serveur (30 secondes)
```bash
cd "c:\efficience-app-offic - Copie"
npm run dev

# Attendez: ✓ Ready in 2.5s
# Puis ouvrez http://localhost:3000
```

### Step 2️⃣: Aller à l'Admin Panel (30 secondes)
```
1. URL: http://localhost:3000/admin
2. Vous voyez 5 onglets
3. Cliquer le 3e: "Imports en Temps Réel" 👈
4. Voir: "Aucun import détecté" (c'est normal)
```

### Step 3️⃣: Déclencher un import test (30 secondes)
```powershell
# Terminal 2
cd "c:\efficience-app-offic - Copie"
.\test-recent-imports.ps1

# Attend ~ 5 secondes
# Puis vous verrez:
# ✅ TEST 1: API simple - OK
# ✅ TEST 2: API filtres - OK
# ✅ TEST 3: Import déclenché - OK
# ✅ TEST 4: Logs vérifiés - OK
```

### Step 4️⃣: Voir en temps réel (30 secondes)
```
Browser (refresh page si besoin):
  ✅ Stats cards se mettent à jour
  ✅ "5 imports" affiché
  ✅ "5 succès" affiché
  ✅ Historique affiche le nouvel import
  ✅ Auto-refresh toutes les 10 secondes
```

---

## 📱 CE QUE VOUS VERREZ

### Stats Cards
```
Total: 5 | ✅ Succès: 5 | ❌ Erreurs: 0 | 💾 Records: 42 | Last: 10:30
```

### Répartition
```
👥 Patients: 2 | 💰 Finances: 1 | ⚙️ Prod: 1 | 📅 RDV: 1
```

### Historique (exemple)
```
✅ 👥 Patients | Success | 5 records | 27/01 10:30:45
✅ 💰 Finances | Success | 3 records | 27/01 10:25:30
✅ ⚙️ Production | Success | 2 records | 27/01 10:20:15
✅ 📅 RDV | Success | 32 records | 27/01 10:15:00
```

---

## ✅ C'EST PRÊT!

**Vous avez maintenant:**
- ✅ API complète
- ✅ UI real-time
- ✅ Affichage admin panel
- ✅ Polling 10 secondes
- ✅ Test validé

---

## 🔗 PROCHAINES ÉTAPES

### 1️⃣ Lire les guides
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - 5 min
- [USER_GUIDE_RECENT_IMPORTS.md](USER_GUIDE_RECENT_IMPORTS.md) - 10 min

### 2️⃣ Tester complètement
- Voir [TEST_API_RECENT_IMPORTS.md](TEST_API_RECENT_IMPORTS.md)

### 3️⃣ Intégrer N8N + Hostinger
- Voir [N8N_SETUP_EFFICIENCE_COMPLETE.md](../N8N_SETUP_EFFICIENCE_COMPLETE.md)

---

## 🆘 Si ça ne marche pas

### "Aucun import détecté"
```powershell
# Déclencher import test manuellement
$url = "http://localhost:3000/api/admin/webhook-n8n"
$token = "MonSuperTokenSecret2026!"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    "type" = "patients"
    "cabinetId" = "cab_test"
    "data" = @(@{
        "nom" = "Test"
        "prenom" = "User"
        "email" = "test@test.com"
    })
} | ConvertTo-Json -Depth 10
Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $body
```

### "API Error"
```
1. Vérifier MongoDB en ligne
2. Vérifier MONGODB_URI dans .env.local
3. Vérifier les logs du serveur (Terminal 1)
```

### "Composant ne s'affiche pas"
```
1. Vérifier F12 console pour erreurs
2. Vérifier import dans /app/admin/page.tsx
3. Rafraîchir la page (F5)
```

---

## 📞 SUPPORT

| Problème | Solution |
|----------|----------|
| Aucun import | Lancer `test-recent-imports.ps1` |
| API Error 500 | Vérifier MongoDB Atlas + logs |
| Pas de UI | F12 console, vérifier imports |
| Pas de refresh | Attendre 10s ou cliquer refresh |

---

## 🎉 C'EST TOUT!

**Vous êtes opérationnel en 2 minutes.** 🚀

Pour plus de détails → [INDEX_RECENT_IMPORTS.md](INDEX_RECENT_IMPORTS.md)

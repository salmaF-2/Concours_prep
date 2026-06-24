<!-- QUICK START GUIDE -->

# 🚀 Quick Start Guide - ConcoursPrep 2.0

## ⚡ 5 Minutes pour Tester

### Prérequis
```
✅ Node.js 14+ installé
✅ MongoDB local ou Atlas connecté
✅ Git configuré
```

### 1️⃣ Backend (2 min)

```bash
# Terminal 1 : Backend
cd backend
npm install
npm start

# → Serveur lancé sur http://localhost:5000
```

### 2️⃣ Frontend (2 min)

```bash
# Terminal 2 : Frontend
cd frontend
npm install
npm start

# → App ouverte sur http://localhost:3000
```

### 3️⃣ Test Rapide (1 min)

#### 👨‍💼 En tant qu'Admin :
1. Login avec compte admin
2. Aller à `/admin-exams`
3. Cliquer **"Nouveau concours"**
4. Remplir :
   - Titre : "Test 2026"
   - Année : "2026"
   - Upload grille PDF
5. Cliquer **"Ajouter matière"** × 4
   - SVT, Physique, Chimie, Math
   - Upload 4 PDF

#### 👨‍🎓 En tant qu'Étudiant :
1. Login avec compte étudiant
2. Aller à `/exams`
3. Voir "Test 2026" groupé par année
4. Télécharger les 4 épreuves
5. Télécharger la grille
6. Cliquer **"Soumettre ma copie"**
7. Upload PDF et voir confirmation

✅ **C'est tout!**

---

## 🎯 Chemins Clés

| Rôle | URL | Action |
|------|-----|--------|
| **Admin** | `/admin-exams` | Gérer concours |
| **Étudiant** | `/exams` | Voir concours |
| **Étudiant** | `/submissions` | Mes soumissions |

---

## 🔍 Points de Contrôle

### Backend
```bash
# Test 1 : API répond
curl http://localhost:5000/api/concours

# Test 2 : Fichiers uploadés
ls backend/uploads/grids/
ls backend/uploads/exams/
```

### Frontend
```bash
# Test 3 : Console sans erreur
# F12 → Console → Pas d'erreurs

# Test 4 : Éléments chargés
# → Voir cartes concours
# → Voir icones matières
```

---

## 🐛 Problèmes Courants

| Problème | Solution |
|----------|----------|
| "Cannot find module" | `npm install` dans le dossier |
| MongoDB connexion échouée | Vérifier MONGODB_URI dans .env |
| 404 sur /api/concours | Backend pas lancé |
| Fichiers ne s'upload pas | Vérifier `/uploads/` permissions |
| Icones pas visibles | Vérifier react-icons installé |

---

## 📁 Structure Minimum pour Tester

```
backend/
├── .env (MONGODB_URI, PORT=5000)
├── server.js ✅ (route /api/concours ajoutée)
├── models/
│   ├── Concours.js ✨ NOUVEAU
│   ├── Epreuve.js ✨ NOUVEAU
│   └── Submission.js ✏️ MODIFIÉ
├── controllers/
│   ├── concoursController.js ✨ NOUVEAU
│   └── submissionController.js ✏️ MODIFIÉ
├── routes/
│   ├── concours.js ✨ NOUVEAU
│   └── ...
└── uploads/
    ├── grids/ ✨ NOUVEAU
    ├── exams/
    └── submissions/

frontend/
├── .env (REACT_APP_API_URL=http://localhost:5000)
├── src/
│   ├── pages/
│   │   ├── Exams.js ✏️ REFAIT
│   │   └── AdminExams.js ✏️ REFAIT
│   └── index.css ✏️ AUGMENTÉ
└── ...
```

---

## ✅ Checklist Rapide

- [ ] Backend lancé sans erreur
- [ ] Frontend lancé sans erreur
- [ ] Peux créer un concours
- [ ] Peux ajouter 4 matières
- [ ] Peux voir concours en tant qu'étudiant
- [ ] Peux uploader une copie
- [ ] Pas d'erreurs en console

---

## 📞 Besoin d'Aide?

### Vérifications
1. **Logs** : Regarder Terminal (Backend + Frontend)
2. **Network** : F12 → Network → Voir requêtes API
3. **Console** : F12 → Console → Voir erreurs JS
4. **Database** : MongoDB Compass → Voir collections

### Documentation
- 📖 `API_DOCUMENTATION.md` → Endpoints
- 📖 `REFONTE_MODIFICATIONS.md` → Architecture
- 📖 `CHECKLIST_INSTALLATION.md` → Troubleshooting

---

## 🎓 Prochaines Étapes

**Après validation rapide** :

1. Migrer données ancien système (optionnel)
2. Configurer N8N webhooks
3. Tester workflow correction
4. Déployer en production

---

## 📊 Résumé Fichiers Clés

| Fichier | Statut | Impact |
|---------|--------|--------|
| `backend/models/Concours.js` | ✨ NOUVEAU | Critique |
| `backend/models/Epreuve.js` | ✨ NOUVEAU | Critique |
| `backend/controllers/concoursController.js` | ✨ NOUVEAU | Critique |
| `frontend/src/pages/Exams.js` | ✏️ REFAIT | Majeur |
| `frontend/src/pages/AdminExams.js` | ✏️ REFAIT | Majeur |
| `backend/server.js` | ✏️ PETIT | Important |

---

**Durée Estimée** : 5 minutes  
**Difficulté** : Très facile ✅  
**Succès** : Quasi-garanti 🎯

---

*Créé le 3 Juin 2026*

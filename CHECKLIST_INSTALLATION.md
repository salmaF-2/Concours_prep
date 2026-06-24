<!-- CHECKLIST D'INSTALLATION - Refonte ConcoursPrep -->

# 📋 Checklist d'Installation - Refonte ConcoursPrep 2.0

## ✅ Backend - Modifications Complétées

- [x] Modèle `Concours.js` créé
- [x] Modèle `Epreuve.js` créé
- [x] Modèle `Submission.js` modifié (exam → concours)
- [x] Controller `concoursController.js` créé
- [x] Controller `submissionController.js` modifié
- [x] Routes `concours.js` créées
- [x] Routes `submissions.js` adaptées (déjà existaient)
- [x] Server.js mis à jour (route /api/concours ajoutée)
- [x] Répertoire `/uploads/grids/` créé

## ✅ Frontend - Modifications Complétées

- [x] Page `Exams.js` complètement refaite (Scribd style)
- [x] Page `AdminExams.js` complètement refaite (Gestion dossiers)
- [x] CSS `index.css` augmenté (styles Scribd + animations)
- [x] Icones react-icons utilisées correctement

---

## 🔧 À Faire AVANT de Déployer

### Backend
- [ ] Vérifier la connexion MongoDB
- [ ] Tester les endpoints avec Postman :
  - [ ] `POST /api/concours` (créer concours)
  - [ ] `POST /api/concours/epreuve` (ajouter matière)
  - [ ] `GET /api/concours` (lister tous)
  - [ ] `GET /api/concours/:id` (détail)
  - [ ] `DELETE /api/concours/:id` (supprimer)
  - [ ] `DELETE /api/concours/epreuve/:id` (supprimer matière)
  - [ ] `POST /api/submissions` (soumettre copie)
- [ ] Vérifier les uploads dans `/uploads/grids/` et `/uploads/exams/`

### Frontend
- [ ] Vérifier que axios utilise la bonne URL API
- [ ] Tester avec l'authentification (user logué)
- [ ] Tester le upload de fichiers
- [ ] Tester les modals (créer concours, ajouter matière)
- [ ] Vérifier le responsive (mobile, tablet, desktop)
- [ ] Vérifier les icones s'affichent bien

### N8N Integration
- [ ] Vérifier que le webhook n8n reçoit correctement :
  ```json
  {
    "submissionId": "...",
    "concoursId": "...",
    "concoursTitle": "...",
    "studentFileUrl": "...",
    "answerGridUrl": "..."
  }
  ```
- [ ] Tester la pipeline de correction

---

## 🚀 Étapes de Déploiement

### 1. Backend
```bash
cd backend
npm install  # Si nouvelles dépendances
npm start
```

### 2. Frontend
```bash
cd frontend
npm install  # Si nouvelles dépendances
npm start
```

### 3. Tests Manuels (en tant qu'Admin)
1. Aller à `/admin-exams`
2. Créer un concours "Test 2026" avec année "2026"
3. Upload une grille PDF de test
4. Ajouter 4 matières (SVT, Physique, Chimie, Math)
5. Upload 4 PDF de test

### 4. Tests Manuels (en tant qu'Étudiant)
1. Aller à `/exams`
2. Voir le concours "Test 2026" groupé par année
3. Télécharger les 4 PDF d'épreuves
4. Télécharger la grille
5. Soumettre un PDF de test
6. Vérifier le message de succès

---

## 📊 Structure de Réponse API

### GET /api/concours
```json
[
  {
    "_id": "...",
    "title": "Concours Médecine 2022-2023",
    "year": "2022-2023",
    "description": "...",
    "answerGridFile": {
      "filename": "...",
      "path": "uploads/grids/...",
      "originalName": "..."
    },
    "uploadedBy": "...",
    "createdAt": "...",
    "epreuves": [
      {
        "_id": "...",
        "concours": "...",
        "subject": "svt",
        "title": "Sciences de la Vie",
        "examFile": {
          "filename": "...",
          "path": "uploads/exams/...",
          "originalName": "..."
        },
        "order": 0
      },
      ...
    ]
  },
  ...
]
```

---

## 🐛 Troubleshooting

### Erreur : "Concours non trouvé"
- [ ] Vérifier que le concours existe dans MongoDB
- [ ] Vérifier que l'ID est correct

### Erreur : "Épreuve non trouvée"
- [ ] Vérifier que l'épreuve existe
- [ ] Vérifier l'ID du concours

### Fichiers ne se téléchargent pas
- [ ] Vérifier que `/uploads/` est bien servi statiquement
- [ ] Vérifier le chemin du fichier dans la DB

### N8N ne reçoit pas le webhook
- [ ] Vérifier `process.env.N8N_WEBHOOK_URL`
- [ ] Vérifier les logs du serveur backend
- [ ] Tester manuellement avec curl

---

## 📝 Notes Importantes

1. **Grille commune** : Chaque concours n'a qu'UNE grille pour les 4 matières
2. **Matières fixes** : SVT, Physique, Chimie, Mathématiques (enum)
3. **Upload unique** : L'étudiant n'upload qu'UN PDF (sa grille remplie)
4. **Ordre des matières** : Contrôlé par le champ `order` dans Epreuve
5. **Migration données** : Les anciens Exam ne seront pas migrés automatiquement

---

## 🎯 Validation Finale

Une fois tous les tests faits :
- [ ] Backend répond correctement
- [ ] Frontend affiche les concours
- [ ] Admin peut créer/modifier/supprimer
- [ ] Étudiant peut voir et soumettre
- [ ] N8N reçoit et traite correctement
- [ ] Fichiers sont bien uploadés

✅ **La refonte est prête pour la production!**

---

**Créé le** : 3 Juin 2026
**Version** : 2.0

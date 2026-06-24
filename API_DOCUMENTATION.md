# 📡 Documentation API - ConcoursPrep 2.0

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentification
Tous les endpoints (sauf `/auth/register` et `/auth/login`) requièrent :
```
Header: Authorization: Bearer <token>
```

---

## 📚 Endpoints Concours

### 1. Créer un nouveau concours
**POST** `/concours`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
title: "Concours Médecine 2022-2023"
year: "2022-2023"
description: "Concours d'entrée pour la faculté de médecine" (optionnel)
answerGridFile: <PDF file> (obligatoire - grille commune)
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Concours Médecine 2022-2023",
  "year": "2022-2023",
  "description": "Concours d'entrée pour la faculté de médecine",
  "answerGridFile": {
    "filename": "1717396800000-123456789.pdf",
    "path": "uploads/grids/1717396800000-123456789.pdf",
    "originalName": "grille_reponse.pdf"
  },
  "uploadedBy": "507f1f77bcf86cd799439012",
  "createdAt": "2026-06-03T10:00:00.000Z"
}
```

---

### 2. Ajouter une épreuve (matière) à un concours
**POST** `/concours/epreuve`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
concoursId: "507f1f77bcf86cd799439011" (ID du concours)
subject: "svt" (svt | physique | chimie | mathematiques)
title: "Sciences de la Vie" (optionnel)
order: 0 (ordre d'affichage: 0, 1, 2, 3)
examFile: <PDF file> (obligatoire - épreuve)
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "concours": "507f1f77bcf86cd799439011",
  "subject": "svt",
  "title": "Sciences de la Vie",
  "examFile": {
    "filename": "1717396900000-987654321.pdf",
    "path": "uploads/exams/1717396900000-987654321.pdf",
    "originalName": "epreuve_svt.pdf"
  },
  "order": 0,
  "createdAt": "2026-06-03T10:05:00.000Z"
}
```

---

### 3. Récupérer tous les concours
**GET** `/concours`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Concours Médecine 2022-2023",
    "year": "2022-2023",
    "description": "...",
    "answerGridFile": { ... },
    "uploadedBy": "507f1f77bcf86cd799439012",
    "createdAt": "2026-06-03T10:00:00.000Z",
    "epreuves": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "concours": "507f1f77bcf86cd799439011",
        "subject": "svt",
        "title": "Sciences de la Vie",
        "examFile": { ... },
        "order": 0
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "subject": "physique",
        "title": "Physique",
        "order": 1
      },
      {
        "_id": "507f1f77bcf86cd799439015",
        "subject": "chimie",
        "title": "Chimie",
        "order": 2
      },
      {
        "_id": "507f1f77bcf86cd799439016",
        "subject": "mathematiques",
        "title": "Mathématiques",
        "order": 3
      }
    ]
  }
]
```

---

### 4. Récupérer un concours par ID
**GET** `/concours/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Concours Médecine 2022-2023",
  "year": "2022-2023",
  "description": "...",
  "answerGridFile": { ... },
  "uploadedBy": "507f1f77bcf86cd799439012",
  "createdAt": "2026-06-03T10:00:00.000Z",
  "epreuves": [...]
}
```

---

### 5. Supprimer un concours
**DELETE** `/concours/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "Concours supprimé avec succès"
}
```

**Note:** Supprime aussi toutes les épreuves associées et les fichiers

---

### 6. Supprimer une épreuve
**DELETE** `/concours/epreuve/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "Épreuve supprimée avec succès"
}
```

---

## 📤 Endpoints Soumissions

### 1. Soumettre une copie
**POST** `/submissions`

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
concoursId: "507f1f77bcf86cd799439011" (ID du concours)
studentFile: <PDF file> (copie remplie par l'étudiant)
```

**Response (201):**
```json
{
  "submission": {
    "_id": "607f1f77bcf86cd799439017",
    "student": "507f1f77bcf86cd799439018",
    "concours": "507f1f77bcf86cd799439011",
    "studentFile": {
      "filename": "1717396950000-111111111.pdf",
      "path": "uploads/submissions/1717396950000-111111111.pdf",
      "originalName": "ma_copie.pdf"
    },
    "feedbackFile": null,
    "status": "processing",
    "submittedAt": "2026-06-03T10:10:00.000Z",
    "processedAt": null,
    "score": 0,
    "totalQuestions": 0,
    "percentage": 0,
    "gradingDetails": {}
  },
  "message": "Votre copie a été soumise avec succès. La correction sera disponible prochainement."
}
```

**Note:** Le statut passe à "processing" si n8n webhook fonctionne

---

### 2. Récupérer mes soumissions
**GET** `/submissions/my-submissions`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200):**
```json
[
  {
    "_id": "607f1f77bcf86cd799439017",
    "student": "507f1f77bcf86cd799439018",
    "concours": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Concours Médecine 2022-2023",
      "year": "2022-2023"
    },
    "studentFile": { ... },
    "feedbackFile": { ... } (si complété),
    "status": "completed",
    "submittedAt": "2026-06-03T10:10:00.000Z",
    "processedAt": "2026-06-03T10:30:00.000Z",
    "score": 65,
    "totalQuestions": 100,
    "percentage": 65,
    "gradingDetails": { ... }
  }
]
```

---

### 3. Récupérer une soumission par ID
**GET** `/submissions/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "607f1f77bcf86cd799439017",
  "student": {
    "_id": "507f1f77bcf86cd799439018",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "concours": { ... },
  "studentFile": { ... },
  "feedbackFile": { ... },
  "status": "completed",
  "submittedAt": "2026-06-03T10:10:00.000Z",
  "processedAt": "2026-06-03T10:30:00.000Z",
  "score": 65,
  "totalQuestions": 100,
  "percentage": 65,
  "gradingDetails": { ... }
}
```

**Note:** L'étudiant peut seulement voir ses propres soumissions

---

### 4. Webhook Callback (N8N)
**POST** `/submissions/webhook/n8n-callback`

**Body (from N8N):**
```json
{
  "submissionId": "607f1f77bcf86cd799439017",
  "status": "completed",
  "feedbackFileUrl": "http://localhost:5000/uploads/feedback/1717397000000-222222222.pdf",
  "score": 65,
  "totalQuestions": 100,
  "percentage": 65,
  "gradingDetails": { ... }
}
```

**Response (200):**
```json
{
  "message": "Callback traité avec succès"
}
```

---

## 📝 Statuts de Soumission

```
pending      → En attente de traitement
processing   → N8N traite actuellement
completed    → Correction terminée (feedback disponible)
failed       → Erreur lors du traitement
```

---

## 🎯 Valeurs d'Énumération

### Subjects (Matières)
```
"svt"
"physique"
"chimie"
"mathematiques"
```

### User Roles
```
"student"
"admin"
```

### Submission Status
```
"pending"
"processing"
"completed"
"failed"
```

---

## 🔄 Exemple de Workflow Complet

### Admin
```bash
# 1. Créer concours
POST /api/concours
↓
# 2. Ajouter SVT
POST /api/concours/epreuve (subject: "svt")
↓
# 3. Ajouter Physique
POST /api/concours/epreuve (subject: "physique")
↓
# 4. Ajouter Chimie
POST /api/concours/epreuve (subject: "chimie")
↓
# 5. Ajouter Mathématiques
POST /api/concours/epreuve (subject: "mathematiques")
```

### Étudiant
```bash
# 1. Récupérer concours
GET /api/concours
↓
# 2. Télécharger 4 PDF + grille
(manuel, en frontend)
↓
# 3. Remplir et soumettre
POST /api/submissions (concoursId: "...")
↓
# 4. Attendre correction (N8N)
GET /api/submissions/my-submissions
↓
# 5. Voir feedback (status: "completed")
GET /api/submissions/:id
```

---

## ⚠️ Codes d'Erreur

| Code | Message | Cause |
|------|---------|-------|
| 400 | Erreur validation | Données manquantes |
| 401 | Non authentifié | Token manquant |
| 403 | Non autorisé | Rôle insuffisant |
| 404 | Non trouvé | Ressource inexistante |
| 500 | Erreur serveur | Exception backend |

---

## 🔒 Permissions

| Action | Admin | Étudiant | Non-Auth |
|--------|-------|----------|----------|
| Créer concours | ✅ | ❌ | ❌ |
| Ajouter matière | ✅ | ❌ | ❌ |
| Supprimer concours | ✅ | ❌ | ❌ |
| Voir concours | ✅ | ✅ | ❌ |
| Soumettre copie | ❌ | ✅ | ❌ |
| Voir ses soumissions | ❌ | ✅ | ❌ |
| Voir autres soumissions | ✅ | ❌ | ❌ |

---

**Dernière mise à jour** : 3 Juin 2026
**Version API** : 2.0

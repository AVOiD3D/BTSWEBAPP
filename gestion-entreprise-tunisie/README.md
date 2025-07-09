# 🇹🇳 Gestion Entreprise Tunisie

Application de gestion d'entreprise tunisienne avec facturation alimentée par l'intelligence artificielle.

## ✨ Fonctionnalités Principales

### 🧠 Facturation IA
- **Génération intelligente** : L'IA analyse vos descriptions de services et génère automatiquement les lignes de facture
- **Calculs TVA tunisiens** : Conformité automatique avec la TVA à 19%
- **Numérotation légale** : Génération automatique des numéros de factures conformes
- **PDF personnalisés** : Logos d'entreprise et templates bilingues (FR/AR)

### 💰 Multi-devises
- Support TND (Dinar Tunisien), EUR (Euro), USD (Dollar US)
- Taux de change intégrés
- Conversion automatique
- Historique des transactions

### 👥 Gestion Clientèle
- Base de données clients complète
- Historique des factures par client
- Informations fiscales (numéros TVA)
- Recherche et filtrage avancés

### 📊 Tableau de Bord
- Métriques en temps réel
- Alertes pour paiements en retard
- Chiffre d'affaires et statistiques
- Vue d'ensemble financière

### 🛡️ Sécurité & Conformité
- Isolation des données par utilisateur
- Authentification sécurisée Supabase
- Conformité réglementations tunisiennes
- Audit logs des actions importantes

## 🚀 Technologies Utilisées

- **Frontend** : Next.js 14, React, TypeScript
- **UI/UX** : Tailwind CSS, Shadcn UI, Mode sombre
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **IA** : OpenRouter API (Claude, GPT)
- **PDF** : jsPDF, html2canvas
- **Styling** : Responsive design, accessibilité

## 📋 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Clé API OpenRouter

### 1. Cloner le projet
```bash
git clone [url-du-repo]
cd gestion-entreprise-tunisie
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement
Copiez `.env.local` et remplissez vos clés :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_supabase

# OpenRouter API pour l'IA
OPENROUTER_API_KEY=votre_clé_openrouter

# Clés de sécurité
NEXTAUTH_SECRET=votre_secret_random
NEXTAUTH_URL=http://localhost:3000
```

### 4. Configuration de la base de données
1. Créez un nouveau projet Supabase
2. Exécutez le script SQL : `supabase-schema.sql`
3. Configurez les RLS (Row Level Security)

### 5. Démarrer l'application
```bash
npm run dev
```

L'application sera accessible à `http://localhost:3000`

## 📊 Base de Données

### Tables Principales
- **users** : Profils utilisateurs et entreprises
- **clients** : Base de données clientèle
- **produits** : Catalogue produits et services
- **factures** : Factures avec calculs TVA
- **ligne_factures** : Détails des lignes de facture
- **paiements** : Suivi des paiements

### Sécurité
- RLS (Row Level Security) activé
- Isolation complète des données par utilisateur
- Audit logs automatiques
- Validation côté serveur

## 🤖 Intégration IA

### OpenRouter API
L'application utilise OpenRouter pour accéder à différents modèles d'IA :
- **Claude 3 Haiku** : Génération de suggestions de facture
- **Prompts optimisés** : Contexte tunisien et fiscal
- **Fallback intelligent** : Suggestions locales si API indisponible

### Fonctionnalités IA
- Analyse de descriptions de services
- Génération de lignes de facture détaillées
- Prix suggérés en TND
- Respect automatique TVA 19%
- Optimisation pour le marché tunisien

## 🇹🇳 Conformité Tunisienne

### Réglementations Respectées
- ✅ TVA standard 19%
- ✅ Numérotation factures légale (FAC-YYYY-XXXX)
- ✅ Mentions obligatoires
- ✅ Calculs fiscaux certifiés
- 🔄 QR codes fiscaux (à venir)

### Support Multi-langues
- Interface principale en français
- Templates factures bilingues (FR/AR)
- Dates et devises localisées
- Support RTL pour l'arabe

## 🎨 Interface Utilisateur

### Design System
- **Shadcn UI** : Composants modernes et accessibles
- **Tailwind CSS** : Styling utilitaire
- **Mode sombre** : Basculement automatique
- **Responsive** : Mobile-first design

### Navigation
- Sidebar intuitive avec icônes
- Breadcrumbs contextuels
- Actions rapides accessibles
- Raccourcis clavier

## 🔧 API Routes

### Endpoints Principaux
```
POST /api/ai/suggestions - Suggestions IA pour factures
GET  /api/clients        - Liste des clients
POST /api/factures       - Création de factures
GET  /api/reports        - Génération de rapports
```

### Authentification
Toutes les routes sont protégées par l'authentification Supabase avec vérification automatique des sessions.

## 📈 Performances

### Optimisations
- Lazy loading des composants
- Mise en cache des requêtes
- Images optimisées
- Bundle splitting automatique

### Monitoring
- Logs d'erreurs centralisés
- Métriques de performance
- Suivi des conversions
- Analytics utilisateurs

## 🛠️ Développement

### Structure du Projet
```
src/
├── app/                 # Pages Next.js 14 (App Router)
│   ├── dashboard/       # Interface principale
│   └── api/            # API routes
├── components/         # Composants réutilisables
│   ├── ui/            # Composants Shadcn UI
│   ├── auth/          # Authentification
│   └── dashboard/     # Composants métier
├── lib/               # Utilitaires
│   ├── supabase/      # Configuration DB
│   └── utils.ts       # Fonctions helpers
└── types/             # Types TypeScript
```

### Scripts Disponibles
```bash
npm run dev          # Mode développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Vérification code
npm run type-check   # Vérification TypeScript
```

## 🚢 Déploiement

### Plateformes Supportées
- **Vercel** (recommandé)
- **Netlify**
- **Railway**
- **Serveur VPS**

### Configuration Production
1. Build optimisé automatique
2. Variables d'environnement sécurisées
3. HTTPS forcé
4. CDN pour les assets

## 📞 Support

### Documentation
- [Guide utilisateur](./docs/user-guide.md)
- [API Reference](./docs/api.md)
- [Conformité tunisienne](./docs/compliance.md)

### Communauté
- 🐛 [Issues GitHub](./issues)
- 💬 [Discussions](./discussions)
- 📧 Support : contact@votre-domaine.tn

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

## 🎯 Roadmap

### Version 1.1
- [ ] QR codes fiscaux tunisiens
- [ ] Export comptable SAGE/Ciel
- [ ] API taux de change temps réel
- [ ] Templates factures personnalisables

### Version 1.2
- [ ] Module de stock avancé
- [ ] Rapports TVA automatiques
- [ ] Envoi automatique par email
- [ ] Application mobile

### Version 2.0
- [ ] Multi-entreprises
- [ ] Comptabilité complète
- [ ] Intégration bancaire
- [ ] IA prédictive avancée

---

**Développé avec ❤️ pour les entreprises tunisiennes**

🇹🇳 Conforme aux réglementations tunisiennes • 🤖 Alimenté par l'IA • 🔒 Sécurisé par design

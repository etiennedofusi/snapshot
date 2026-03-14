# PRD — SnapShop : Click & Collect SaaS pour commerces locaux

**Version** : 1.0  
**Date** : Mars 2026  
**Statut** : Draft

---

## 1. Vision Produit

SnapShop est un SaaS de click & collect ultra-simple destiné aux commerces locaux (boulangeries, fleuristes, épiceries, boutiques mode, traiteurs, etc.). Le commerçant n'a besoin d'aucune compétence technique. Le client commande depuis WhatsApp, Instagram ou un widget web. La boutique reçoit la commande sur un dashboard enfantin, prépare, imprime, valide.

**Mantra produit** : "En 3 clics, la commande est prête."

---

## 2. Problème

Les petits commerçants veulent proposer le click & collect mais :
- Les solutions existantes sont trop complexes (Shopify, WooCommerce)
- Leurs clients commandent déjà sur WhatsApp/Instagram de manière informelle et chaotique
- Ils n'ont pas de temps ni de budget pour une intégration lourde
- Le paiement en ligne reste une friction énorme à mettre en place

---

## 3. Solution

Une plateforme en 2 faces :

### Face Client
Le client commande en **langage naturel** via :
- **WhatsApp** : conversation IA qui prend la commande
- **Instagram DM** : idem via l'API Instagram
- **Widget Web** : bouton "Commander" sur le site de la boutique (style chat WhatsApp)

### Face Commerçant
Un dashboard **enfantin** :
- Commandes en attente affichées comme des cartes claires
- Bouton "Imprimer" → ticket thermique
- Bouton "Valide / Prêt" → notification au client
- KPIs simples : CA du jour, semaine, mois

---

## 4. Utilisateurs Cibles

### Commerçant (Admin)
- 35-60 ans, peu à l'aise avec le digital
- Utilise un smartphone ou tablette en caisse
- Veut quelque chose d'aussi simple qu'une caisse enregistreuse
- Persona type : Marie, boulangère à Lyon, 2 employés

### Client Final
- 18-55 ans, habitué de WhatsApp
- Ne veut pas télécharger une app
- Veut commander vite, passer récupérer
- Persona type : Lucas, 28 ans, commande son pain avant d'aller au bureau

---

## 5. Périmètre V1

### IN SCOPE
- Onboarding commerçant (inscription, création catalogue produits)
- Canal WhatsApp (Twilio / WhatsApp Business API)
- Canal Widget Web (iframe embeddable)
- Canal Instagram DM (Instagram Graph API)
- Dashboard commandes temps réel
- Impression ticket (format 80mm thermique)
- Notification client "Commande prête" (WhatsApp/SMS)
- Paiement en ligne Stripe (carte + Apple Pay + Google Pay)
- Dashboard KPIs basique
- Gestion catalogue produits (nom, prix, photo, dispo)
- Abonnement mensuel (Stripe Billing)

### OUT OF SCOPE V1
- App mobile native
- Livraison à domicile
- Gestion des stocks avancée
- Multi-boutiques
- Fidélité / points
- Marketplace

---

## 6. Modèle Économique

| Tier | Prix | Commission transactions |
|------|------|------------------------|
| Starter | 29€/mois | 1.5% par transaction |
| Pro | 59€/mois | 0.8% par transaction |
| Enterprise | Sur devis | 0.4% |

Stripe prend ~1.4% + 0.25€ par transaction (Europe). Notre marge nette sur la commission : ~0.5-1%.

Revenus additionnels : frais d'onboarding optionnels (setup premium 99€).

---

## 7. User Stories

### Commerçant

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| US-01 | Commerçant | Créer mon catalogue en 10 min | Démarrer rapidement |
| US-02 | Commerçant | Voir toutes mes commandes du jour en un coup d'œil | Organiser ma préparation |
| US-03 | Commerçant | Imprimer un ticket pour chaque commande | Préparer sans erreur |
| US-04 | Commerçant | Marquer une commande comme "prête" | Notifier le client automatiquement |
| US-05 | Commerçant | Voir mon CA du jour/semaine/mois | Suivre ma performance |
| US-06 | Commerçant | Désactiver un produit en rupture | Éviter les commandes impossibles |
| US-07 | Commerçant | Recevoir un son/vibration à chaque nouvelle commande | Ne pas rater une commande |

### Client

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| US-10 | Client | Commander en tapant naturellement sur WhatsApp | Commander sans effort |
| US-11 | Client | Recevoir un récapitulatif de ma commande | M'assurer que c'est bon |
| US-12 | Client | Payer en ligne directement dans la conversation | Ne pas faire la queue en caisse |
| US-13 | Client | Être notifié quand ma commande est prête | Venir au bon moment |
| US-14 | Client | Commander depuis le site web de ma boutique préférée | Sans changer d'habitudes |

---

## 8. Flows Principaux

### Flow Client WhatsApp
```
Client envoie "Bonjour" 
→ Bot répond avec menu de la boutique
→ Client dit "2 croissants et un pain au chocolat"
→ Bot confirme + propose paiement en ligne
→ Client paie (Stripe link) ou choisit payer en boutique
→ Bot confirme "Commande #42 reçue ! Prête dans 15 min"
→ Quand commerçant valide → "Votre commande est prête !"
```

### Flow Commerçant Dashboard
```
Nouvelle commande → Son + carte apparaît en haut
→ Commerçant lit la commande
→ Clique "Imprimer" → ticket thermique
→ Prépare la commande
→ Clique "Prête ✓"
→ Client notifié automatiquement
```

---

## 9. Exigences Non-Fonctionnelles

- **Disponibilité** : 99.9% uptime (SLA)
- **Latence bot** : < 2 secondes pour répondre
- **Sécurité** : PCI-DSS via Stripe (on ne touche pas aux données carte)
- **RGPD** : Données hébergées en Europe (AWS eu-west-3)
- **Mobile-first** : Dashboard optimisé tablette/smartphone
- **Offline partiel** : Cache local des commandes si perte réseau momentanée

---

## 10. Métriques de Succès

| Métrique | Objectif 6 mois |
|----------|----------------|
| Boutiques actives | 200 |
| Commandes/boutique/jour | 15+ |
| Taux conversion commande | > 70% |
| NPS commerçants | > 50 |
| Churn mensuel | < 5% |
| Temps onboarding | < 20 min |

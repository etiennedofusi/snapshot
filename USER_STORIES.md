# User Stories & Specs Fonctionnelles — SnapShop

---

## ÉPIC 1 : Onboarding Commerçant

### US-01 : Inscription
**En tant que** commerçant,  
**Je veux** créer mon compte en moins de 5 minutes,  
**Afin de** commencer à recevoir des commandes.

**Critères d'acceptance :**
- [ ] Formulaire : email → magic link (pas de mot de passe)
- [ ] Nom boutique, téléphone, adresse (optionnel)
- [ ] Upload logo (optionnel, Supabase Storage)
- [ ] Message de bienvenue personnalisable
- [ ] Plan choisi (starter par défaut, upgrade possible)
- [ ] Stripe : connexion compte bancaire (Stripe Connect onboarding)
- [ ] Temps max : 8 minutes

**Écrans :**
1. Email → "Vérifiez vos emails"
2. Magic link → Page onboarding (stepper 3 étapes)
3. Dashboard (première fois avec tutorial overlay)

---

### US-02 : Création Catalogue
**En tant que** commerçant,  
**Je veux** ajouter mes produits facilement,  
**Afin que** les clients puissent commander.

**Critères d'acceptance :**
- [ ] Ajout produit : nom (obligatoire), prix (obligatoire), photo (optionnel), description (optionnel), catégorie (optionnel)
- [ ] Toggle dispo/indispo en un tap
- [ ] Réordonner par drag & drop
- [ ] Import CSV possible (bonus)
- [ ] Maximum 200 produits en Starter, illimité en Pro
- [ ] Le bot IA voit les produits en temps réel

---

## ÉPIC 2 : Dashboard Commandes

### US-03 : Vue Commandes Temps Réel
**En tant que** commerçant,  
**Je veux** voir toutes mes commandes du jour instantanément,  
**Afin de** ne jamais en rater une.

**Critères d'acceptance :**
- [ ] Son + vibration à chaque nouvelle commande (activable/désactivable)
- [ ] Badge rouge avec compteur dans l'onglet navigateur
- [ ] Commandes triées par heure (plus récente en haut)
- [ ] Filtres : Toutes / En attente / En préparation / Prêtes
- [ ] Scroll infini (pas de pagination)
- [ ] Temps réel via Supabase Realtime (< 1 seconde de délai)

**États visuels :**
- 🔴 **Pending** : fond rouge/orange, "NOUVELLE"
- 🟡 **Preparing** : fond jaune, "EN PRÉPARATION"  
- 🟢 **Ready** : fond vert, "PRÊTE"
- ⚫ **Picked up** : fond gris, archivé

---

### US-04 : Carte Commande
**En tant que** commerçant,  
**Je veux** voir le détail d'une commande d'un coup d'œil,  
**Afin de** la préparer sans erreur.

**Critères d'acceptance :**
- [ ] Numéro de commande (#42 format court)
- [ ] Heure de passage de commande
- [ ] Prénom + initiale du nom du client
- [ ] Canal (WhatsApp 📱 / Instagram 📷 / Web 🌐)
- [ ] Liste des articles : quantité × nom — prix
- [ ] Total clair
- [ ] Statut paiement : "✅ Payé en ligne" ou "💵 Règlement en boutique"
- [ ] Bouton "Imprimer" (gros)
- [ ] Bouton "Prête ✓" (gros, vert)
- [ ] Note du client si présente

---

### US-05 : Impression Ticket
**En tant que** commerçant,  
**Je veux** imprimer un ticket pour chaque commande,  
**Afin de** l'agrafier sur le sac du client.

**Critères d'acceptance :**
- [ ] Format 80mm (standard thermique)
- [ ] Contenu : Logo/nom boutique, #commande, heure, items + qtés, total, "CLICK & COLLECT", QR code optionnel
- [ ] Compatible imprimante thermique USB/Bluetooth via Web Print API
- [ ] Fallback : impression PDF depuis le navigateur
- [ ] Un clic → impression sans dialog de confirmation si imprimante configurée

---

### US-06 : Notification Client "Prêt"
**En tant que** commerçant,  
**Quand je** marque une commande comme "prête",  
**Le client** doit être notifié automatiquement.

**Critères d'acceptance :**
- [ ] Si commande via WhatsApp → message WhatsApp automatique
- [ ] Si commande via Instagram → DM automatique
- [ ] Si commande via widget → SMS (Twilio) si numéro fourni
- [ ] Message : "✅ Bonjour [Prénom] ! Votre commande #42 chez [Boutique] est prête. À tout de suite !"
- [ ] Délai < 5 secondes après validation commerçant

---

## ÉPIC 3 : Commande Client

### US-10 : Bot WhatsApp
**En tant que** client,  
**Je veux** commander par WhatsApp en tapant naturellement,  
**Afin de** ne pas changer mes habitudes.

**Critères d'acceptance :**
- [ ] Numéro WhatsApp dédié par boutique (ou numéro partagé avec routing)
- [ ] Premier message → menu en français/anglais automatique
- [ ] Claude comprend les formulations naturelles ("je voudrais 2 croissants")
- [ ] Confirmation avant finalisation ("C'est bien ça : 2 croissants (2€) et 1 café (1.5€) = 3.5€ ?")
- [ ] Proposition paiement en ligne (lien Stripe) ou en boutique
- [ ] Confirmation finale avec numéro de commande
- [ ] Contexte conservé 24h (si client revient)

**Exemple de conversation :**
```
CLIENT : Bonjour
BOT : Bonjour ! 👋 Bienvenue chez Marie's Bakery.
      Que puis-je vous préparer aujourd'hui ?
      📋 Notre carte : croissant (1€), pain au choc (1.20€), baguette (1.10€)...

CLIENT : 2 croissants et un café s'il vous plaît
BOT : Parfait ! Je récapitule :
      • 2× Croissant — 2.00€
      • 1× Café — 1.50€
      TOTAL : 3.50€
      
      Souhaitez-vous payer en ligne ou en boutique ? 💳

CLIENT : En ligne
BOT : Voici votre lien de paiement sécurisé :
      👉 pay.stripe.com/xxxxx
      Commande #47 enregistrée. On vous prépare ça ! ⏱️
```

---

### US-11 : Widget Web
**En tant que** client,  
**Je veux** commander depuis le site de ma boutique favorite,  
**Afin de** ne pas avoir à appeler ou passer en boutique.

**Critères d'acceptance :**
- [ ] Bouton flottant "Commander" sur le site
- [ ] S'ouvre en overlay (pas de nouvelle page)
- [ ] Interface style chat (bulles, clavier)
- [ ] Même logique IA que WhatsApp
- [ ] Champ nom + téléphone avant de finaliser
- [ ] Intégration en 1 ligne de code : `<script src="..."></script>`

---

### US-12 : Paiement en Ligne
**En tant que** client,  
**Je veux** payer sécurisé directement,  
**Afin de** gagner du temps en boutique.

**Critères d'acceptance :**
- [ ] Stripe Payment Link (page hébergée par Stripe)
- [ ] Apple Pay et Google Pay disponibles
- [ ] Paiement par carte bancaire
- [ ] Confirmation email automatique (Stripe)
- [ ] Le dashboard commerçant se met à jour "✅ Payé" en temps réel

---

## ÉPIC 4 : KPIs & Analytics

### US-20 : Dashboard KPIs
**En tant que** commerçant,  
**Je veux** voir mes chiffres d'un coup d'œil,  
**Afin de** suivre mon activité.

**Critères d'acceptance :**
- [ ] CA du jour (€ + nb commandes)
- [ ] CA de la semaine vs semaine précédente (%)
- [ ] CA du mois
- [ ] Produit le plus vendu du jour
- [ ] Heure de pointe (graphique barres par heure)
- [ ] Taux de commandes payées en ligne vs en boutique
- [ ] Graphique CA des 30 derniers jours (courbe)

---

## Règles Métier Globales

### Statuts commande (machine d'état)
```
pending → preparing → ready → picked_up
   ↓           ↓         ↓
cancelled  cancelled  cancelled
```
- Seul le commerçant peut changer le statut
- `picked_up` est terminal (archivage automatique après 48h)
- `cancelled` déclenche remboursement automatique si payé en ligne

### Numérotation des commandes
- Séquentiel par boutique, remise à zéro chaque jour
- Format : #1, #2, ... #99, #100
- Affiché en gros dans l'interface

### Expiration des liens de paiement
- Stripe Payment Link expire 30 minutes après création
- Passé ce délai, la commande passe en "payer en boutique"

### Heures d'ouverture
- Le bot répond 24/7 mais précise les horaires de la boutique
- Commandes hors horaires mises en "pending" pour le lendemain

# ADR 0015: Interface Mobile-First PWA, Navigation Responsive & Tests Fonctionnels Dual-Viewport

## Statut
Accepté

## Contexte
IdleAGI (Project Singularity Loop) est distribué sous forme de Progressive Web App (PWA) conçue pour être installée et jouée aussi bien sur navigateur de bureau (desktop) que sur smartphone mobile en mode autonome (`display: standalone`).

L'interface initiale en grille 3 colonnes, bien qu'optimale pour un écran large, produisait un défilement vertical fastidieux sur écran mobile une fois l'ensemble des modules débloqués (Scribe, Tokenizer, Télémétrie de Poids, Tri-Allocation, Datacenter, Hardware, R&D Upgrades, Terminal STDOUT et Oscilloscope). De plus, il était impératif de garantir une ergonomie tactile native (cibles minimales 44-48px, suppression des délais de tap) et de valider la jouabilité complète via des tests fonctionnels automatisés dans les deux modes de viewport (Bureau 1280px et Mobile 390px).

## Décision

1. **Architecture Responsive Dual-Mode & Découpage des Composants** :
   - **Composant Dédié `MobileNavigation.vue` (`src/components/MobileNavigation.vue`)** :
     - Barre de navigation inférieure fixe sur smartphone (`lg:hidden`) proposant 4 onglets spécialisés :
       1. `ingestion` : Scribe humain, buffer de texte brut, pipeline de tokenisation BPE, télémétrie modèle et tri-allocation.
       2. `datacenter` : Télémétrie thermique et disjoncteur, cluster rack de serveurs et cartes GPU dédiées.
       3. `upgrades` : Compétences de lecture humaine, scripts Python et modules de R&D.
       4. `terminal` : Terminal cyber STDOUT live, filtre de logs et oscilloscope de flux.
     - Badges de notification dynamiques (nombre d'upgrades immédiatement abordables, point d'alerte thermique/électrique critique, erreurs terminal).
   - **Disposition Bureau Multi-Colonnes (`lg:grid-cols-12`)** :
     - Affichage panoramique simultané des 3 colonnes sur grand écran sans masquage ni pagination.
   - **Instance Unique de Composants** : Gestion de l'affichage via des classes responsives combinées afin de préserver l'état, les références Vue (`humanReaderRef`) et les écouteurs de raccourcis sans duplication de composants.

2. **Ergonomie Tactile & Meta Tags PWA** :
   - Ajout des balises viewport adaptées dans `index.html` (`viewport-fit=cover`, `apple-mobile-web-app-capable`, `theme-color: #07090E`, `format-detection: no`).
   - Configuration CSS dans `src/style.css` (`touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`, `active:scale-95`).
   - Cibles tactiles calibrées à une hauteur minimale de 44-48px pour faciliter l'usage au pouce.

3. **Suites de Tests Fonctionnels E2E Dual-Viewport (`vitest` + `@vue/test-utils`)** :
   - **FT Bureau (`src/__tests__/desktopGameplayFunctional.spec.ts`)** :
     - Initialisation du viewport à 1280x800.
     - Validation de la disposition en 3 colonnes, des raccourcis clavier (`Space`, `V`), des clics sur les boutons de scraping, de vente, d'upgrades, de matériel, de sélection de presets d'allocation, de soumission de commandes au terminal, de la sauvegarde et du dialogue de reset.
   - **FT Mobile (`src/__tests__/mobileGameplayFunctional.spec.ts`)** :
     - Initialisation du viewport smartphone standard (390x844).
     - Validation de la barre de navigation mobile inférieure, du basculement d'onglets, de l'accessibilité et de la réactivité des clics tactiles sur tous les panneaux et de la complétion du scénario de jeu sur mobile.

## Conséquences

- **Positives** :
  - Expérience utilisateur native et fluide sur smartphone en mode PWA.
  - Absence de défilement infini sur mobile grâce au découpage en 4 onglets focalisés.
  - Couverture de test complète et automatisée assurant la non-régression interactive en mode bureau et en mode mobile.

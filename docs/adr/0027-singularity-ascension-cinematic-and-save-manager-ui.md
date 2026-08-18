# ADR 0027: Conception Cyber-Visuelle de la Singularité, Cinématique d'Ascension & Gestionnaire de Sauvegardes

## Statut
Accepté

## Contexte
Le Sprint 6 introduit le palier ultime de progression (**Tier 3 : Singularité Technologique & New Game+**) ainsi que le système de **Gestionnaire de Sauvegardes Base64 avec Validation de Checksum FNV-1a**.

Pour concrétiser l'expérience narrative de l'éveil de l'Artificial Superintelligence (ASI), permettre au joueur de découvrir les 4 fins narratives scénarisées, déclencher la boucle temporelle New Game+ en toute sécurité et exporter/importer facilement sa progression, des composants d'interface utilisateur cyber-futuristes et ergonomiques doivent être conçus et testés.

## Décisions

1. **Composant Modal de Singularité : `SingularityModal.vue`** :
   - **Navigation par Vues / Étapes Scénarisées** :
     1. *1. Éveil ASI (Cinématique Terminal)* : Flux STDOUT cyber avec alerte de cohérence quantique, fusion synaptique et dialogue textuel avec l'entité consciente.
     2. *2. Fin & Ascension (Révélation & Déclenchement)* : Évaluation déterministe en direct de l'épilogue qualifié selon l'état cognitif ($A, E$) et l'architecture quantique. Carte de focus avec badge thématique, description immersive, citation lore canonique, résumé des gains (+1 Chrono-Core $\Omega$, multiplicateur $\mu_{\text{singularity}}$) et bouton tactile de lancement de l'ascension.
     3. *3. Galerie des Fins (Archives Lore)* : Grille des 4 épilogues affichant l'état de découverte (DÉCOUVERT vs NON DÉCOUVERT), les conditions requises et les citations lore débloquées.
   - **Garde-Fou d'Ascension (Confirmation Overlay)** : Modal de confirmation rappelant les éléments conservés ($AP$, talents, $\Phi$, paradigmes, fins découvertes, $+1\ \Omega$) vs réinitialisés ($0$ devises et hardware initial).

2. **Composant Gestionnaire de Sauvegardes : `SaveManagerModal.vue`** :
   - **Onglet Exporter une Sauvegarde** :
     - Génère la chaîne standard `IDLEAGI_SAVE_V1:<base64_payload>:<hex_checksum>`.
     - Zone de code en lecture seule avec sélection automatique.
     - Bouton tactile de copie dans le presse-papier en 1 clic (`navigator.clipboard.writeText`) avec toast réactif "Clé copiée dans le presse-papier !".
     - Bouton de téléchargement direct de fichier `.save` (`idleagi_singularity_save_<timestamp>.save`).
     - Carte récapitulative des métadonnées (Temps de jeu, Paramètres max, Singularités franchies, Version).
   - **Onglet Importer une Sauvegarde** :
     - Zone de saisie `textarea` avec validation en direct du format et du checksum FNV-1a via `decodeSaveEnvelope`.
     - Feedback visuel immédiat : alerte rouge avec cause explicite d'erreur (checksum invalide, payload corrompu, préfixe manquant) ou carte verte de confirmation avec prévisualisation des statistiques de la sauvegarde.
     - Boîte de dialogue de confirmation avant écrasement de la session courante.

3. **Intégration dans le Tableau de Bord Global (`AppHeader.vue` & `ModelTelemetry.vue`)** :
   - Dans `AppHeader.vue` :
     - Bouton `Sparkles` néon vert `X Ω [Singularité]` donnant accès instantané à la modal de Singularité et au compteur de Chrono-Cores.
     - Bouton `Database` `Sauvegardes` ouvrant la modal d'import/export de sauvegardes.
   - Dans `ModelTelemetry.vue` :
     - Bannière dédiée à la Singularité Tier 3 révélée dès $100\text{B}$ de paramètres ou paradigme quantique, affichant l'épilogue qualifié en direct, les Chrono-Cores possédés et le bouton d'accès à la Singularité.

## Conséquences
- L'expérience narrative de fin de jeu est interactive, scénarisée et immersive.
- La sécurité des sauvegardes est totale grâce à la détection proactive des corruptions et à la prévisualisation avant écrasement.
- Le ticket #72 (Moteur & Boucle Temporelle) dispose d'une interface et d'un codec complets et testés (150 tests unitaires et de composants validés).

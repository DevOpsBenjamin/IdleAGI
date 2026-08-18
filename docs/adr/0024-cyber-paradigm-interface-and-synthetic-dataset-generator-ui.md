# ADR 0024: Conception Cyber-Visuelle des Paradigmes IA & Panneau de Données Synthétiques

## Statut
Accepté

## Contexte
Le Sprint 5 introduit le second niveau de prestige (**Tier 2 : Changement de Paradigme**) et l'auto-génération de données par **Datasets Synthétiques**. 
Afin de garantir une ergonomie optimale sur desktop et mobile, une clarté totale sur les trade-offs architecturaux et une visibilité immédiate du risque de *Model Collapse*, une interface utilisateur cyber-terminale dédiée doit être conçue.

## Décisions

1. **Composant de Contrôle de Synthèse : `SyntheticDatasetControl.vue`** :
   - **Positionnement** : Intégré dans la colonne Ingestion / Pipeline sous le Tokenizer BPE (visible dès la Phase 3 / Tier 2).
   - **Télémétrie Live** :
     - Débit de génération synthétique en direct (ex: `+12.50 K chars/s`).
     - Jauge segmentée de ratio synthétique ($R_{\text{synth}}$) avec indicateur de seuil critique visuel (par défaut $70\%$).
   - **Statuts Visuels & Codes Couleurs** :
     - *Nominal* ($R_{\text{synth}} \le 70\%$) : Badge violet néon `#A855F7` "Génération Optimale".
     - *Zone Critique* ($70\% < R_{\text{synth}} < 85\%$) : Badge ambre `#FFB800`.
     - *Model Collapse* ($R_{\text{synth}} \ge 85\%$ ou actif) : Badge rouge carmin `#FF0055` clignotant "Model Collapse Détecté", jauge en dégradé d'alarme et bannière d'alerte contextuelle détaillée.
   - **Interactivité Ergonomique** : Bouton tactile Toggle ON/OFF ($\ge 36\text{px}$) permettant d'interrompre ou de reprendre l'auto-ingestion synthétique à tout moment.

2. **Modal des Paradigmes Architecturaux : `ParadigmModal.vue`** :
   - **HUD des Insights ($\Phi$)** :
     - Affiche les Insights disponibles, les Insights totaux découverts et le bonus passif universel ($+10\% \text{ TFLOPS}/\Phi$).
   - **Grille des 4 Architectures** :
     - Cartes modulaires pour `dense_transformer` ($0\ \Phi$), `mixture_of_experts` ($1\ \Phi$), `neuromorphic_spiking` ($5\ \Phi$) et `quantum_annealed` ($20\ \Phi$).
     - Matrice d'indicateurs de performance (Calcul brut $\times 2.5 \to \times 10$, Réduction Watts $-75\%$, Efficacité VRAM, Bonus de vitesse synthétique).
     - Statuts explicites des boutons : *Architecture Active* (Vert `#00FF66`), *Activer cette Architecture* (Bleu `#38BDF8`), *Débloquer pour X $\Phi$* (Or `#FFB800`), *Verrouillé* (Gris sombre).
   - **Section de Déclenchement du Hard Reset Tier 2** :
     - Calcul en direct des Insights potentiels ($+\text{pendingInsights} \ \Phi$).
     - Boîte de dialogue de confirmation modale avec résumé explicite des éléments conservés ($AP$, talents, $\Phi$, paradigmes) vs réinitialisés ($0$ devises et hardware).

3. **Intégration dans le Tableau de Bord Global (`AppHeader.vue` & `ModelTelemetry.vue`)** :
   - Dans `AppHeader.vue` : Badge tactile `✦ X Φ [Paradigmes]` cliquable pour ouvrir instantanément la vue modale des paradigmes.
   - Dans `ModelTelemetry.vue` : Bannière dédiée aux Paradigmes IA révélée progressivement dès $100\text{M}$ de paramètres, avec statut de l'architecture active, multiplicateur TFLOPS en direct et accès rapide aux paradigmes et au reset Tier 2.

## Conséquences
- L'expérience joueur intègre harmonieusement le palier Tier 2 avec des feedbacks visuels clairs et une sécurité tactile contre les resets involontaires.
- Le ticket #66 (Moteur & Intégration Tick) dispose d'une interface éprouvée et testée (105 tests unitaires et de rendu validés) prête à recevoir les calculs en temps réel du `SyntheticDataEngine` et du `ParadigmEngine`.

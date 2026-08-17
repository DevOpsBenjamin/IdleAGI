# ADR 0017: Mécanique de Prestige Tier 1 - Fine-Tuning, Checkpoints & Points d'Architecture

## Statut
Accepté

## Contexte
Après avoir franchi les phases de bootstrapping (Phase 0 : Scribe, Phase 1 : Station poubelle, Phase 2 : Station de travail & Tokenizer BPE, Phase 3 : Modèle de neurones & Entraînement), le joueur atteint un plateau de progression naturelle où le coût d'acquisition du matériel et l'accumulation de paramètres ralentissent.

Le Sprint 3 introduit la mécanique fondamentale de **Prestige Tier 1** (*Fine-Tuning / Checkpoint*), permettant de convertir les paramètres synaptiques entraînés en devises permanentes (**Points d'Architecture - $AP$**) et en multiplicateurs passifs universels.

## Décisions

1. **Seuil d'Activation & Condition de Déclenchement** :
   - Seuil minimal requis : **$1.00 \times 10^6$ Paramètres** ($1\text{M}$ paramètres, correspondant au modèle de base initialisé en Phase 3).
   - Le bouton d'action *Figer Checkpoint (Fine-Tuning)* devient actif dès que $\text{parameters} \ge 10^6$.

2. **Formule de Conversion des Paramètres en Points d'Architecture ($AP$)** :
   - La formule déterministe à racine carrée régit le gain d'AP :
     $$AP = \left\lfloor \left( \frac{\text{Parameters}}{10^6} \right)^{0.5} \right\rfloor$$
   - Exemples de progression :
     - $1\text{M}$ paramètres $\to 1\ AP$
     - $4\text{M}$ paramètres $\to 2\ AP$
     - $9\text{M}$ paramètres $\to 3\ AP$
     - $16\text{M}$ paramètres $\to 4\ AP$
     - $100\text{M}$ paramètres $\to 10\ AP$

3. **Bonus Passif Universel ($\mu_{\text{checkpoint}}$)** :
   - Chaque point d'Architecture ($AP$) total accumulé (dépensé ou en réserve) confère $+5\%$ de vitesse de calcul brute permanente :
     $$\mu_{\text{checkpoint}} = 1.0 + (\text{totalAP} \times 0.05)$$
     $$\text{EffectiveCompute} = \text{RawCompute} \times \mu_{\text{power}} \times \text{Efficiency} \times \mu_{\text{checkpoint}}$$

4. **Périmètre de Réinitialisation (Soft Reset Scope)** :
   - **Ressources réinitialisées à l'état initial** :
     - Buffer de caractères bruts (`rawText.current = 0`)
     - Buffer de tokens (`tokens.current = 0`)
     - Liquidités financières (`funds.current = 0`)
     - Paramètres courants du modèle (`parameters = 0`)
     - Inventaire matériel (retour à l'état initial sans station hôte ni GPU)
     - Upgrades logicielles actives (désactivées et remises à zéro)
     - Réseau électrique et refroidissement (remis aux capacités de base du Phase 0)
     - Phase active du jeu (réinitialisée en Phase 0)
   - **Éléments persistés et conservés** :
     - Points d'Architecture totaux et disponibles (`architecturePoints.current`, `architecturePoints.totalAccumulated`)
     - Nœuds débloqués de l'Arbre de Talents d'Architecture (Ticket #44)
     - Statistiques globales de vie (nombre de resets de fine-tuning, temps de jeu cumulé, record de paramètres)
     - Déblocage permanent de la visibilité des onglets et fonctionnalités de prestige

5. **Cycle de Relance & Rétention Joueur** :
   - Grâce aux multiplicateurs de l'Arbre de Talents et au bonus passif de $+5\%/\text{AP}$, le joueur refranchit les phases 0 et 1 en quelques secondes à peine lors des runs ultérieurs.

## Conséquences
- Le moteur de domaine `EconomyEngine` et les calculateurs de reset disposeront de fonctions pures et testées unitairement pour évaluer l'éligibilité, le gain prévisionnel de $AP$ et appliquer le reset d'état.
- L'interface utilisateur de l'Arbre de Talents (Ticket #44) et l'implémentation du moteur de Soft Reset (Ticket #45) disposent d'un contrat mathématique et de domaine précis et non ambigu.
- La compatibilité descendante du `GameState` sérialisé est maintenue avec des valeurs par défaut rétro-compatibles (`architecturePoints: { current: '0', totalAccumulated: '0' }`, `prestigeCount: 0`).
